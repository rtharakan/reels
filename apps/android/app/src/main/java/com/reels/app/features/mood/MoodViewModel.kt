package com.reels.app.features.mood

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout

data class MoodUiState(
    val selectedMood: MoodType? = null,
    val suggestions: List<MoodSuggestion> = emptyList(),
    val moodTwins: List<MoodTwin> = emptyList(),
    val history: List<MoodHistoryEntry> = emptyList(),
    val currentMood: String? = null,
    val isLoading: Boolean = false,
    val isLoadingHistory: Boolean = false,
    val error: String? = null,
    val connectResult: ExpressInterestResponse? = null,
)

class MoodViewModel(private val repository: MoodRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(MoodUiState())
    val uiState: StateFlow<MoodUiState> = _uiState.asStateFlow()

    companion object {
        private const val TIMEOUT_MS = 3_000L
    }

    fun setMood(mood: MoodType) {
        _uiState.value = _uiState.value.copy(
            selectedMood = mood,
            isLoading = true,
            error = null,
            suggestions = emptyList(),
            moodTwins = emptyList(),
        )
        viewModelScope.launch {
            try {
                val response = withTimeout(TIMEOUT_MS) {
                    repository.setMood(SetMoodRequest(mood = mood.value))
                }
                _uiState.value = _uiState.value.copy(
                    suggestions = response.suggestions,
                    moodTwins = response.moodTwins,
                    isLoading = false,
                )
            } catch (e: TimeoutCancellationException) {
                // Timeout — try fetching existing suggestions as fallback
                try {
                    val fallback = repository.getSuggestions(mood.value)
                    _uiState.value = _uiState.value.copy(
                        suggestions = fallback.suggestions,
                        moodTwins = fallback.moodTwins,
                        isLoading = false,
                    )
                } catch (fallbackError: Exception) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Suggestions took too long. Try again.",
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to set mood",
                )
            }
        }
    }

    fun loadHistory() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingHistory = true)
            try {
                val response = repository.getHistory()
                _uiState.value = _uiState.value.copy(
                    history = response.history,
                    currentMood = response.currentMood,
                    isLoadingHistory = false,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoadingHistory = false,
                    error = e.message,
                )
            }
        }
    }

    fun tagFilm(filmId: String, mood: String) {
        viewModelScope.launch {
            try {
                repository.tagFilm(TagFilmRequest(filmId = filmId, mood = mood))
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(error = e.message)
            }
        }
    }

    fun expressInterest(targetUserId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(error = null, connectResult = null)
            try {
                val result = repository.expressInterest(ExpressInterestRequest(targetUserId))
                _uiState.value = _uiState.value.copy(connectResult = result)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(error = e.message)
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun clearConnectResult() {
        _uiState.value = _uiState.value.copy(connectResult = null)
    }
}
