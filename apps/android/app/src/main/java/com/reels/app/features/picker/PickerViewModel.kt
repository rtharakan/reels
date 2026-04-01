package com.reels.app.features.picker

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.launch

data class PickerUiState(
    val myPlans: List<PickerPlanSummary> = emptyList(),
    val searchResults: List<FilmSearchResult> = emptyList(),
    val showtimes: List<PickerShowtime> = emptyList(),
    val currentPlan: PickerPlanDetail? = null,
    val isLoading: Boolean = false,
    val isSearching: Boolean = false,
    val error: String? = null,
    val shareUrl: String? = null,
    val justCreatedPlanId: String? = null,
)

@OptIn(FlowPreview::class)
class PickerViewModel(private val repository: PickerRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(PickerUiState())
    val uiState: StateFlow<PickerUiState> = _uiState.asStateFlow()

    private val _searchQuery = MutableStateFlow("")

    init {
        viewModelScope.launch {
            _searchQuery
                .debounce(300)
                .distinctUntilChanged()
                .filter { it.length >= 2 }
                .collect { query -> performSearch(query) }
        }
    }

    fun loadMyPlans() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = repository.myPlans()
                _uiState.value = _uiState.value.copy(
                    myPlans = response.plans,
                    isLoading = false,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load plans",
                )
            }
        }
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
        if (query.length < 2) {
            _uiState.value = _uiState.value.copy(searchResults = emptyList())
        }
    }

    private suspend fun performSearch(query: String) {
        _uiState.value = _uiState.value.copy(isSearching = true)
        try {
            val response = repository.searchFilms(query)
            _uiState.value = _uiState.value.copy(
                searchResults = response.results,
                isSearching = false,
            )
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(
                isSearching = false,
                error = e.message,
            )
        }
    }

    fun loadShowtimes(filmTitle: String, city: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val response = repository.getShowtimes(filmTitle, city)
                _uiState.value = _uiState.value.copy(
                    showtimes = response.showtimes,
                    isLoading = false,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message,
                )
            }
        }
    }

    fun createPlan(request: CreatePlanRequest) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = repository.createPlan(request)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    shareUrl = response.shareUrl,
                    justCreatedPlanId = response.planId,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message,
                )
            }
        }
    }

    fun loadPlan(planId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val plan = repository.getPlan(planId)
                _uiState.value = _uiState.value.copy(
                    currentPlan = plan,
                    isLoading = false,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message,
                )
            }
        }
    }

    fun joinPlan(planId: String, displayName: String, guestToken: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                repository.joinPlan(
                    JoinPlanRequest(
                        planId = planId,
                        displayName = displayName,
                        guestSessionToken = guestToken,
                    ),
                )
                loadPlan(planId)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message,
                )
            }
        }
    }

    fun vote(participantId: String, votes: List<VoteRequest.VoteEntry>) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(error = null)
            try {
                repository.vote(VoteRequest(participantId = participantId, votes = votes))
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(error = e.message)
            }
        }
    }

    fun confirmPlan(planId: String, showtimeId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                repository.confirmPlan(ConfirmRequest(planId = planId, showtimeId = showtimeId))
                loadPlan(planId)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message,
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun clearCreatedPlan() {
        _uiState.value = _uiState.value.copy(justCreatedPlanId = null, shareUrl = null)
    }
}
