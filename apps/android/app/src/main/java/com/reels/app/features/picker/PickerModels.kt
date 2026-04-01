package com.reels.app.features.picker

import kotlinx.serialization.Serializable

@Serializable
data class PickerPlanSummary(
    val id: String,
    val filmTitle: String,
    val filmPosterPath: String? = null,
    val status: String,
    val participantCount: Int,
    val createdAt: String,
)

@Serializable
data class PickerPlanDetail(
    val id: String,
    val filmTitle: String,
    val filmTmdbId: Int? = null,
    val filmPosterPath: String? = null,
    val filmYear: Int? = null,
    val pathway: String,
    val status: String,
    val organizer: Organizer,
    val showtimes: List<PickerShowtime>,
    val participants: List<PickerParticipantInfo>,
    val confirmedShowtime: PickerShowtime? = null,
    val expiresAt: String,
    val createdAt: String,
    val currentParticipantId: String? = null,
) {
    @Serializable
    data class Organizer(val id: String, val name: String)
}

@Serializable
data class PickerShowtime(
    val id: String,
    val cinemaName: String,
    val cinemaCity: String,
    val date: String,
    val time: String,
    val ticketUrl: String? = null,
    val voteCount: VoteCount? = null,
) {
    @Serializable
    data class VoteCount(val available: Int, val unavailable: Int, val maybe: Int)
}

@Serializable
data class PickerParticipantInfo(
    val id: String,
    val displayName: String,
    val isOrganizer: Boolean,
)

@Serializable
data class FilmSearchResult(
    val tmdbId: Int,
    val title: String,
    val year: Int? = null,
    val posterPath: String? = null,
    val overview: String? = null,
)

@Serializable
data class CreatePlanRequest(
    val filmTitle: String,
    val filmTmdbId: Int? = null,
    val filmPosterPath: String? = null,
    val filmYear: Int? = null,
    val pathway: String,
    val city: String? = null,
    val cinema: String? = null,
    val targetDate: String? = null,
    val showtimes: List<ShowtimeInput>,
) {
    @Serializable
    data class ShowtimeInput(
        val cinemaName: String,
        val cinemaCity: String,
        val date: String,
        val time: String,
        val ticketUrl: String? = null,
        val isManualEntry: Boolean = false,
    )
}

@Serializable
data class CreatePlanResponse(val planId: String, val shareUrl: String, val expiresAt: String)

@Serializable
data class JoinPlanRequest(val planId: String, val displayName: String, val guestSessionToken: String? = null)

@Serializable
data class JoinPlanResponse(val participantId: String, val sessionToken: String? = null)

@Serializable
data class VoteRequest(val participantId: String, val votes: List<VoteEntry>) {
    @Serializable
    data class VoteEntry(val showtimeId: String, val status: String)
}

@Serializable
data class VoteResponse(val success: Boolean, val updatedCount: Int)

@Serializable
data class ConfirmRequest(val planId: String, val showtimeId: String)

@Serializable
data class ConfirmResponse(val success: Boolean, val confirmedShowtime: PickerShowtime)

@Serializable
data class MyPlansResponse(val plans: List<PickerPlanSummary>)

@Serializable
data class SearchFilmsResponse(val results: List<FilmSearchResult>)

@Serializable
data class ShowtimesResponse(val showtimes: List<PickerShowtime>, val source: String)
