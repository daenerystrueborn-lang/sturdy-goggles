package com.astralofthesun.app.data

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/* ============================================================
   Dungeon battle — turn-based combat state and action process.
   Mirrors TopUp's request pattern: every action (attack, skill,
   item, flee) is handed to `onAction`; with no backend wired it
   parks at AwaitingBackend so the UI never fakes a result.
   Ships empty by design — no made-up enemy, no fake damage.
   ============================================================ */

enum class ActionStatus { Idle, Resolving, AwaitingBackend, Resolved, Failed }

data class Combatant(
    val id: String = "",
    val name: String = "",
    val image: String = "",
    val level: Int? = null,
    val hp: Int? = null,
    val maxHp: Int? = null,
    val mp: Int? = null,
    val maxMp: Int? = null,
)

data class BattleSkill(
    val id: String,
    val name: String = "",
    val mpCost: Int? = null,
)

data class LogEntry(
    val id: String,
    val text: String,
)

enum class BattleOutcome { InProgress, Victory, Defeat, Fled }

data class BattleAction(
    val id: String,
    val kind: String,            // "attack" | "skill" | "item" | "flee"
    val skillId: String? = null,
    val itemId: String? = null,
    var status: ActionStatus = ActionStatus.Idle,
)

class Battle {
    val player = mutableStateOf(Combatant())
    val enemy = mutableStateOf(Combatant())
    val skills = mutableStateListOf<BattleSkill>()
    val log = mutableStateListOf<LogEntry>()
    val outcome = mutableStateOf(BattleOutcome.InProgress)
    val actionInFlight = mutableStateOf(false)

    /** Backend hook: resolve one action, mutate player/enemy/log/outcome, return true on success. */
    var onAction: (suspend (BattleAction) -> Boolean)? = null

    private var seq = 0
    private val scope = CoroutineScope(Dispatchers.Default)

    fun reset() {
        player.value = Combatant()
        enemy.value = Combatant()
        skills.clear()
        log.clear()
        outcome.value = BattleOutcome.InProgress
        actionInFlight.value = false
    }

    fun act(kind: String, skillId: String? = null, itemId: String? = null): BattleAction {
        seq += 1
        val action = BattleAction(
            id = "act-$seq-" + System.currentTimeMillis().toString(36),
            kind = kind,
            skillId = skillId,
            itemId = itemId,
        )

        val hook = onAction
        if (hook == null) {
            action.status = ActionStatus.AwaitingBackend
            appendLog("Waiting for battle server…")
            return action
        }

        actionInFlight.value = true
        action.status = ActionStatus.Resolving
        scope.launch {
            val ok = runCatching { hook(action) }.getOrDefault(false)
            action.status = if (ok) ActionStatus.Resolved else ActionStatus.Failed
            if (!ok) appendLog("Action failed — try again.")
            actionInFlight.value = false
        }
        return action
    }

    private fun appendLog(text: String) {
        seq += 1
        log.add(0, LogEntry(id = "log-$seq", text = text))
    }
}
