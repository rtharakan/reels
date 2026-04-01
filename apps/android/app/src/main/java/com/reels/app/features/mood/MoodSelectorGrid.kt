package com.reels.app.features.mood

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val moodColors = mapOf(
    MoodType.NOSTALGIC to Color(0xFFFFF3E0),
    MoodType.ADVENTUROUS to Color(0xFFE8F5E9),
    MoodType.HEARTBROKEN to Color(0xFFFCE4EC),
    MoodType.HYPE to Color(0xFFFFF8E1),
    MoodType.CHILL to Color(0xFFE0F7FA),
    MoodType.ROMANTIC to Color(0xFFF3E5F5),
    MoodType.MYSTERIOUS to Color(0xFFEDE7F6),
    MoodType.INSPIRED to Color(0xFFFFFDE7),
    MoodType.MELANCHOLIC to Color(0xFFECEFF1),
    MoodType.COZY to Color(0xFFEFEBE9),
)

@Composable
fun MoodSelectorGrid(
    selectedMood: MoodType?,
    onMoodSelected: (MoodType) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(5),
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(MoodType.entries.toList()) { mood ->
            val isSelected = mood == selectedMood
            MoodCell(
                mood = mood,
                isSelected = isSelected,
                onClick = { onMoodSelected(mood) },
            )
        }
    }
}

@Composable
private fun MoodCell(
    mood: MoodType,
    isSelected: Boolean,
    onClick: () -> Unit,
) {
    val bgColor = moodColors[mood] ?: MaterialTheme.colorScheme.surface

    Box(
        modifier = Modifier
            .size(64.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .then(
                if (isSelected) Modifier.border(
                    2.dp,
                    MaterialTheme.colorScheme.primary,
                    RoundedCornerShape(12.dp),
                ) else Modifier,
            )
            .clickable(onClick = onClick)
            .semantics {
                role = Role.RadioButton
                selected = isSelected
            }
            .padding(4.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(mood.emoji, fontSize = 24.sp)
            Text(
                mood.value.lowercase().replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.labelSmall,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                textAlign = TextAlign.Center,
                maxLines = 1,
            )
        }
    }
}
