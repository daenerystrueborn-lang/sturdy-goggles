package com.astralofthesun.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.astralofthesun.app.data.Astral
import com.astralofthesun.app.data.BattleOutcome
import com.astralofthesun.app.data.BattleSkill
import com.astralofthesun.app.data.Combatant
import com.astralofthesun.app.data.LogEntry
import com.astralofthesun.app.ui.components.EmptyNote
import com.astralofthesun.app.ui.components.cardModifier
import com.astralofthesun.app.ui.theme.CardBorder
import com.astralofthesun.app.ui.theme.Primary
import com.astralofthesun.app.ui.theme.TextDim
import com.astralofthesun.app.ui.theme.TextFaint

/* Dungeon Battle — the turn-based combat field, reached only from
   DungeonPrepScreen's Enter Dungeon button (not a bottom-nav tab).
   Every action goes through Astral.battle.act(), which mirrors the
   TopUp request pattern: no backend wired means it parks the action
   at AwaitingBackend and the UI shows that plainly, never a fake
   damage number. */
@Composable
fun DungeonBattleScreen(onExit: () -> Unit) {
    val player by Astral.battle.player
    val enemy by Astral.battle.enemy
    val skills = Astral.battle.skills
    val log = Astral.battle.log
    val outcome by Astral.battle.outcome
    val inFlight by Astral.battle.actionInFlight

    val inBattle = outcome == BattleOutcome.InProgress

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        // enemy
        CombatantCard(enemy, label = "Enemy", reverse = true)

        // battlefield divider
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF060606))
                .border(0.5.dp, CardBorder, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center,
        ) {
            when (outcome) {
                BattleOutcome.Victory -> Text("Victory", color = Color(0xFF6EE787), fontWeight = FontWeight.Bold, fontSize = 15.sp)
                BattleOutcome.Defeat -> Text("Defeated", color = Color(0xFFE76E6E), fontWeight = FontWeight.Bold, fontSize = 15.sp)
                BattleOutcome.Fled -> Text("You fled the battle", color = TextDim, fontSize = 13.sp)
                BattleOutcome.InProgress -> Text("Battle in progress", color = TextFaint, fontSize = 12.sp)
            }
        }

        // player
        CombatantCard(player, label = "You", reverse = false)

        // combat log
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text("Battle Log", color = TextDim, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            if (log.isEmpty()) {
                EmptyNote("No actions yet")
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF060606))
                        .border(0.5.dp, CardBorder, RoundedCornerShape(14.dp)),
                    contentPadding = PaddingValues(10.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    items(log) { LogLine(it) }
                }
            }
        }

        // skills row
        if (inBattle && skills.isNotEmpty()) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(skills) { skill ->
                    OutlinedButton(
                        onClick = { Astral.battle.act("skill", skillId = skill.id) },
                        enabled = !inFlight,
                    ) {
                        Text(skill.name.ifEmpty { "Skill" } + (skill.mpCost?.let { " ($it MP)" } ?: ""), fontSize = 12.sp)
                    }
                }
            }
        }

        // action bar
        if (inBattle) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = { Astral.battle.act("attack") },
                    enabled = !inFlight,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = Primary),
                ) {
                    if (inFlight) CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White, strokeWidth = 2.dp)
                    else Text("Attack", fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = { Astral.battle.act("item") },
                    enabled = !inFlight,
                    modifier = Modifier.weight(1f),
                ) { Text("Item") }
                OutlinedButton(
                    onClick = { Astral.battle.act("flee") },
                    enabled = !inFlight,
                    modifier = Modifier.weight(1f),
                ) { Text("Flee") }
            }
        } else {
            Button(
                onClick = onExit,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Primary),
            ) { Text("Continue", fontWeight = FontWeight.Bold) }
        }
    }
}

@Composable
private fun CombatantCard(c: Combatant, label: String, reverse: Boolean) {
    Row(
        modifier = cardModifier().padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        if (!reverse) Portrait()
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(c.name.ifEmpty { label }, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                if (c.level != null) Text("Lv. ${c.level}", color = TextDim, fontSize = 11.sp)
            }
            StatBar("HP", c.hp, c.maxHp, Color(0xFFE76E6E))
            if (c.maxMp != null) StatBar("MP", c.mp, c.maxMp, Color(0xFF6EA8E7))
        }
        if (reverse) Portrait()
    }
}

@Composable
private fun Portrait() {
    Box(
        modifier = Modifier
            .size(48.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF111111))
            .border(0.5.dp, CardBorder, RoundedCornerShape(12.dp)),
    )
}

@Composable
private fun StatBar(label: String, value: Int?, max: Int?, color: Color) {
    val fraction = if (value != null && max != null && max > 0) (value.toFloat() / max.toFloat()).coerceIn(0f, 1f) else 0f
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(label, color = TextDim, fontSize = 9.sp)
            Text(
                if (value != null && max != null) "$value / $max" else "—",
                color = TextFaint,
                fontSize = 9.sp,
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(999.dp))
                .background(Color(0xFF1A1A1A)),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction)
                    .height(6.dp)
                    .clip(RoundedCornerShape(999.dp))
                    .background(color),
            )
        }
    }
}

@Composable
private fun LogLine(entry: LogEntry) {
    Text(entry.text, color = TextDim, fontSize = 11.sp)
}
