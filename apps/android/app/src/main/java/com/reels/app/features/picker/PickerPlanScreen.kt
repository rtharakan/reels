package com.reels.app.features.picker

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.reels.app.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PickerPlanScreen(
    planId: String,
    viewModel: PickerViewModel,
    onBack: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(planId) { viewModel.loadPlan(planId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.currentPlan?.filmTitle ?: stringResource(R.string.picker_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { /* share intent */ }) {
                        Icon(Icons.Default.Share, contentDescription = "Share")
                    }
                },
            )
        },
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when {
                state.isLoading && state.currentPlan == null ->
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))

                state.currentPlan == null ->
                    Text(
                        stringResource(R.string.picker_plan_not_found),
                        modifier = Modifier.align(Alignment.Center),
                        style = MaterialTheme.typography.bodyLarge,
                    )

                else -> {
                    val plan = state.currentPlan!!
                    when (plan.status) {
                        "EXPIRED" -> ExpiredPlanContent(plan = plan)
                        "CONFIRMED" -> ConfirmedPlanContent(plan = plan)
                        else -> VotingPlanContent(
                            plan = plan,
                            viewModel = viewModel,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ExpiredPlanContent(plan: PickerPlanDetail) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("⏰", style = MaterialTheme.typography.displayLarge)
        Spacer(Modifier.height(16.dp))
        Text(
            stringResource(R.string.picker_expired),
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            stringResource(R.string.picker_expired_desc),
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ConfirmedPlanContent(plan: PickerPlanDetail) {
    val showtime = plan.confirmedShowtime ?: return

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                ),
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("🎬", style = MaterialTheme.typography.displaySmall)
                    Spacer(Modifier.height(8.dp))
                    Text(
                        plan.filmTitle,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    plan.filmYear?.let {
                        Text("($it)", style = MaterialTheme.typography.titleMedium)
                    }
                    Spacer(Modifier.height(16.dp))
                    Text(
                        "${showtime.cinemaName} — ${showtime.cinemaCity}",
                        style = MaterialTheme.typography.titleMedium,
                    )
                    Text(
                        "${showtime.date} at ${showtime.time}",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "${plan.participants.size} going",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    showtime.ticketUrl?.let {
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = { /* open URL */ }, modifier = Modifier.fillMaxWidth()) {
                            Text(stringResource(R.string.picker_buy_tickets))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun VotingPlanContent(
    plan: PickerPlanDetail,
    viewModel: PickerViewModel,
) {
    var guestName by remember { mutableStateOf("") }
    val isParticipant = plan.currentParticipantId != null
    val votes = remember { mutableStateMapOf<String, String>() }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Film header
        item {
            Column {
                Text(
                    plan.filmTitle,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
                plan.filmYear?.let {
                    Text("($it)", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    "${stringResource(R.string.picker_organized_by)} ${plan.organizer.name}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Text(
                    "${stringResource(R.string.picker_expires_on)} ${plan.expiresAt}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        // Guest join section
        if (!isParticipant) {
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            stringResource(R.string.picker_join),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                        )
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = guestName,
                            onValueChange = { guestName = it.take(50) },
                            label = { Text(stringResource(R.string.picker_display_name)) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                        )
                        Spacer(Modifier.height(8.dp))
                        Button(
                            onClick = {
                                viewModel.joinPlan(plan.id, guestName.trim(), null)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = guestName.trim().length >= 2,
                        ) {
                            Text(stringResource(R.string.picker_join))
                        }
                    }
                }
            }
        }

        // Voting grid
        if (isParticipant) {
            items(plan.showtimes, key = { it.id }) { showtime ->
                ShowtimeVoteCard(
                    showtime = showtime,
                    currentVote = votes[showtime.id],
                    onVote = { status ->
                        votes[showtime.id] = status
                        viewModel.vote(
                            participantId = plan.currentParticipantId!!,
                            votes = listOf(VoteRequest.VoteEntry(showtime.id, status)),
                        )
                    },
                )
            }
        }

        // Participants list
        item {
            Text(
                "${plan.participants.size} participants",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
        }
        items(plan.participants, key = { it.id }) { participant ->
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(participant.displayName, style = MaterialTheme.typography.bodyLarge)
                if (participant.isOrganizer) {
                    Spacer(Modifier.width(8.dp))
                    Text(
                        "Organizer",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
            }
        }
    }
}

@Composable
private fun ShowtimeVoteCard(
    showtime: PickerShowtime,
    currentVote: String?,
    onVote: (String) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                showtime.cinemaName,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                "${showtime.date} at ${showtime.time}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                showtime.cinemaCity,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(12.dp))

            // Vote tallies
            showtime.voteCount?.let { vc ->
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val total = (vc.available + vc.unavailable + vc.maybe).coerceAtLeast(1)
                    Column(modifier = Modifier.weight(1f)) {
                        Text("✅ ${vc.available}", style = MaterialTheme.typography.labelMedium)
                        LinearProgressIndicator(
                            progress = { vc.available.toFloat() / total },
                            modifier = Modifier.fillMaxWidth().height(4.dp),
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("❌ ${vc.unavailable}", style = MaterialTheme.typography.labelMedium)
                        LinearProgressIndicator(
                            progress = { vc.unavailable.toFloat() / total },
                            modifier = Modifier.fillMaxWidth().height(4.dp),
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("❓ ${vc.maybe}", style = MaterialTheme.typography.labelMedium)
                        LinearProgressIndicator(
                            progress = { vc.maybe.toFloat() / total },
                            modifier = Modifier.fillMaxWidth().height(4.dp),
                            color = MaterialTheme.colorScheme.tertiary,
                        )
                    }
                }
                Spacer(Modifier.height(12.dp))
            }

            // Vote buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                VoteButton(
                    icon = Icons.Default.Check,
                    label = "Available",
                    isSelected = currentVote == "AVAILABLE",
                    onClick = { onVote("AVAILABLE") },
                    modifier = Modifier.weight(1f),
                )
                VoteButton(
                    icon = Icons.Default.Close,
                    label = "Unavailable",
                    isSelected = currentVote == "UNAVAILABLE",
                    onClick = { onVote("UNAVAILABLE") },
                    modifier = Modifier.weight(1f),
                )
                VoteButton(
                    icon = Icons.Default.HelpOutline,
                    label = "Maybe",
                    isSelected = currentVote == "MAYBE",
                    onClick = { onVote("MAYBE") },
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

@Composable
private fun VoteButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (isSelected) {
        FilledTonalButton(onClick = onClick, modifier = modifier, shape = RoundedCornerShape(8.dp)) {
            Icon(icon, contentDescription = label, modifier = Modifier.size(18.dp))
        }
    } else {
        OutlinedButton(onClick = onClick, modifier = modifier, shape = RoundedCornerShape(8.dp)) {
            Icon(icon, contentDescription = label, modifier = Modifier.size(18.dp))
        }
    }
}
