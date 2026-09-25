package com.astralofthesun.app

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.sp
import com.astralofthesun.app.ui.screens.HomeScreen
import com.astralofthesun.app.ui.screens.ProfileScreen
import com.astralofthesun.app.ui.screens.SeasonScreen
import com.astralofthesun.app.ui.screens.ShopScreen
import com.astralofthesun.app.ui.screens.TopUpScreen
import com.astralofthesun.app.ui.theme.Bg
import com.astralofthesun.app.ui.theme.Gold

enum class Screen(val label: String, val icon: ImageVector) {
    Home("Home", Icons.Filled.Home),
    Season("Season", Icons.Filled.Star),
    Shop("Shop", Icons.Filled.ShoppingBag),
    TopUp("Top-up", Icons.Filled.Wallet),
    Profile("Profile", Icons.Filled.Person),
}

/* Root scaffold. Navigation is a plain in-memory enum switch, so moving
   between screens is an instant recomposition — no reloads, no network. */
@Composable
fun App() {
    var current by remember { mutableStateOf(Screen.Home) }
    var topUpCurrency by rememberSaveable { mutableStateOf("solars") }

    Scaffold(
        containerColor = Bg,
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF050508)) {
                Screen.entries.forEach { screen ->
                    NavigationBarItem(
                        selected = current == screen,
                        onClick = { current = screen },
                        icon = { Icon(screen.icon, contentDescription = screen.label) },
                        label = { Text(screen.label, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color.Black,
                            selectedTextColor = Color.Black,
                            indicatorColor = Color.White,
                            unselectedIconColor = Gold,
                            unselectedTextColor = Color(0x99FFFFFF),
                        ),
                    )
                }
            }
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when (current) {
                Screen.Home -> HomeScreen(goTopUp = { cur -> topUpCurrency = cur; current = Screen.TopUp })
                Screen.Season -> SeasonScreen()
                Screen.Shop -> ShopScreen()
                Screen.TopUp -> TopUpScreen(initialCurrency = topUpCurrency)
                Screen.Profile -> ProfileScreen()
            }
        }
    }
}
