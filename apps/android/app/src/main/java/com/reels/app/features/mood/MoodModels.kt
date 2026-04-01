package com.reels.app.features.mood

import kotlinx.serialization.Serializable

enum class MoodType(val value: String, val emoji: String) {
    NOSTALGIC("NOSTALGIC", "📼"),
    ADVENTUROUS("ADVENTUROUS", "🏔️"),
    HEARTBROKEN("HEARTBROKEN", "💔"),
    HYPE("HYPE", "🔥"),
    CHILL("CHILL", "🌊"),
    ROMANTIC("ROMANTIC", "💕"),
    MYSTERIOUS("MYSTERIOUS", "🔮"),
    INSPIRED("INSPIRED", "✨"),
    MELANCHOLIC("MELANCHOLIC", "🌧️"),
    COZY("COZY", "☕");

    companion object {
        fun fromValue(value: String) = entries.first { it.value == value }
    }
}

@Serializable
data class MoodSuggestion(
    val id: String,
    val filmId: String,
    val filmTitle: String,
    val filmYear: Int? = null,
    val filmPosterPath: String? = null,
    val mood: String,
    val matchExplanation: String,
    val matchStrength: Double,
    val source: String,
)

@Serializable
data class MoodTwin(
    val userId: String,
    val displayName: String? = null,
    val image: String? = null,
    val sharedFilmCount: Int,
    val mood: String,
)

@Serializable
data class SetMoodRequest(val mood: String)

@Serializable
data class SetMoodResponse(
    val moodId: String,
    val suggestions: List<MoodSuggestion>,
    val moodTwins: List<MoodTwin>,
)

@Serializable
data class GetSuggestionsResponse(
    val suggestions: List<MoodSuggestion>,
    val moodTwins: List<MoodTwin>,
)

@Serializable
data class MoodHistoryEntry(
    val id: String,
    val mood: String,
    val isActive: Boolean,
    val selectedAt: String,
)

@Serializable
data class MoodHistoryResponse(
    val history: List<MoodHistoryEntry>,
    val currentMood: String? = null,
)

@Serializable
data class TagFilmRequest(val filmId: String, val mood: String)

@Serializable
data class ExpressInterestRequest(val targetUserId: String)

@Serializable
data class ExpressInterestResponse(val success: Boolean, val isMatch: Boolean)
