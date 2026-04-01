package com.reels.app.features.mood

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Badge
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.reels.app.R

private val historyMoodColors = mapOf(
    "NOSTALGIC" to Color(0xFFFFA726),
    "ADVENTUROUS" to Color(0xFF66BB6A),
    "HEARTBROKEN" to Color(0xFFEF5350),
    "HYPE" to Color(0xFFFFCA28),
    "CHILL" to Color(0xFF26C6DA),
    "ROMANTIC" to Color(0xFFAB47BC),
    "MYSTERIOUS" to Color(0xFF7E57C2),
    "INSPIRED" to Color(0xFFFFF176),
    "MELANCHOLIC" to Color(0xFF78909C),
    "COZY" to Color(0xFF8D6E63),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MoodHistorySheet(
    state: MoodUiState,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                stringResource(R.string.mood_history),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(16.dp))

            if (state.isLoadingHistory) {
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (state.history.isEmpty()) {
                Text(
                    stringResource(R.string.mood_no_history),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.height(400.dp),
                ) {
                    items(state.history, key = { it.id }) { entry ->
                        HistoryItem(entry = entry)
                    }
                }
            }
        }
    }
}

@Composable
private fun HistoryItem(entry: MoodHistoryEntry) {
    val moodType = try {
        MoodType.fromValue(entry.mood)
    } catch (_: Exception) {
        null
    }
    val dotColor = historyMoodColors[entry.mood] ?: MaterialTheme.colorScheme.outline

    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .clip(CircleShape)
                .background(dotColor),
        )
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    moodType?.emoji ?: "",
                    style = MaterialTheme.typography.bodyLarge,
                )
                Spacer(Modifier.width(6.dp))
                Text(
                    entry.mood.lowercase().replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                )
                if (entry.isActive) {
                    Spacer(Modifier.width(8.dp))
                    Badge(containerColor = MaterialTheme.colorScheme.primary) {
                        Text("Active", modifier = Modifier.padding(horizontal = 4.dp))
                    }
                }
            }
            Text(
                entry.selectedAt,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
