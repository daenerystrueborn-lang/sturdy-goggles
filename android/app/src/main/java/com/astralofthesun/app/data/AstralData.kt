package com.astralofthesun.app.data

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf

/* ============================================================
   Astral of the Sun — shared data layer (native port)
   Ships EMPTY on purpose, exactly like the web app: no fake
   names, numbers or images. Wire `Astral.loadData` to your
   backend and every screen hydrates from these states.
   ============================================================ */

data class Player(val name: String = "", val sub: String = "", val avatar: String = "")

data class Stats(val level: Int? = null, val solars: Long? = null, val gems: Long? = null)

data class Wallet(val solars: Long? = null, val gems: Long? = null)

data class ShopItem(
    val name: String = "",
    val desc: String = "",
    val price: Long? = null,
    val image: String = "",
    val category: String = "items",
    val currency: String = "solars", // "solars" | "gems"
)

data class SeasonTier(
    val side: String = "free", // "free" | "premium"
    val tier: Int? = null,
    val title: String = "",
    val image: String = "",
)

data class SeasonReward(val tier: Int? = null, val title: String = "", val image: String = "")

data class SeasonCharacter(
    val name: String = "",
    val meta: String = "",
    val cp: String = "",
    val image: String = "",
)

data class Season(
    val banner: String = "",
    val title: String = "",
    val duration: String = "",
    val tierIndex: Int = 0,
    val tierCount: Int = 0,
    val xpCurrent: Long = 0,
    val xpNeeded: Long = 0,
    val rewards: List<SeasonReward> = emptyList(),
    val characters: List<SeasonCharacter> = emptyList(),
    val tiers: List<SeasonTier> = emptyList(),
)

data class InvItem(val id: String, val name: String = "", val image: String = "")

data class Notification(val title: String = "", val sub: String = "")

data class TopUpPackage(
    val id: String = "",
    val title: String = "",
    val amount: Long? = null,
    val price: Long? = null,
    val currency: String = "solars",
    val desc: String = "",
)

data class ServerOffer(
    val id: String = "",
    val title: String = "",
    val desc: String = "",
    val image: String = "",
)

/* ── Dungeon prep + battle ── */

data class DungeonInfo(
    val id: String = "",
    val name: String = "",
    val floor: Int? = null,
    val difficulty: String = "", // e.g. "E-Rank", "S-Rank"
    val recommendedLevel: Int? = null,
    val rewardsPreview: String = "", // short label, e.g. "250 Solars · Astral Dust"
    val image: String = "",
)

data class PartyMember(
    val id: String = "",
    val name: String = "",
    val avatar: String = "",
    val level: Int? = null,
    val ready: Boolean = false,
)

data class LoadoutState(
    val weapon: InvItem? = null,
    val armor: InvItem? = null,
    val relic: InvItem? = null,
    val consumable: InvItem? = null,
)

object Astral {
    val player = mutableStateOf(Player())
    val banner = mutableStateOf("")
    val stats = mutableStateOf(Stats())
    val wallet = mutableStateOf(Wallet())

    val notifications = mutableStateListOf<Notification>()
    val shop = mutableStateListOf<ShopItem>()
    val roster = mutableStateListOf<SeasonCharacter>()
    val dungeons = mutableStateListOf<DungeonInfo>()
    val friends = mutableStateListOf<Player>()

    val season = mutableStateOf(Season())

    val inventory = mutableStateListOf<InvItem>()
    val vault = mutableStateListOf<InvItem>()

    // dungeon prep screen state — empty by design, hydrate from backend
    val selectedDungeon = mutableStateOf<DungeonInfo?>(null)
    val loadout = mutableStateOf(LoadoutState())
    val party = mutableStateListOf<PartyMember>()

    val battle = Battle()
    val pvp = mutableStateListOf<InvItem>()

    val topUp = TopUp()

    /** Replace with your backend fetch; resolves to nothing (keeps UI empty). */
    var loadData: (suspend () -> Unit)? = null
}
