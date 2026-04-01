package com.reels.app.features.mood

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.Badge
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.reels.app.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MoodReelsScreen(viewModel: MoodViewModel) {
    val state by viewModel.uiState.collectAsState()
    var showHistory by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(stringResource(R.string.mood_title))
                        Badge(containerColor = MaterialTheme.colorScheme.tertiary) {
                            Text("BETA", modifier = Modifier.padding(horizontal = 4.dp))
                        }
                    }
                },
                actions = {
                    IconButton(onClick = {
                        viewModel.loadHistory()
                        showHistory = true
                    }) {
                        Icon(Icons.Default.History, contentDescription = stringResource(R.string.mood_history))
                    }
                },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            // Mood selector
            item {
                Column {
                    Text(
                        stringResource(R.string.mood_whats_your_vibe),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                    )
                    Spacer(Modifier.height(12.dp))
                    MoodSelectorGrid(
                        selectedMood = state.selectedMood,
                        onMoodSelected = { viewModel.setMood(it) },
                    )
                }
            }

            // Loading state
            if (state.isLoading) {
                item {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
            }

            // Suggestions
            if (state.suggestions.isNotEmpty()) {
                item {
                    Text(
                        stringResource(R.string.mood_suggestions_title),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
                items(state.suggestions, key = { it.id }) { suggestion ->
                    MoodSuggestionCard(suggestion = suggestion)
                }
            }

            // Mood twins
            if (state.moodTwins.isNotEmpty()) {
                item {
                    MoodTwinsRow(
                        twins = state.moodTwins,
                        onConnect = { viewModel.expressInterest(it.userId) },
                    )
                }
            }

            // Error
            state.error?.let { error ->
                item {
                    Text(
                        text = error,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
    }

    if (showHistory) {
        MoodHistorySheet(
            state = state,
            onDismiss = { showHistory = false },
        )
    }
}
