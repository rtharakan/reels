import SwiftUI

/// Plan detail: voting grid, guest join, confirmed summary.
struct PickerPlanView: View {
    let planId: String
    @ObservedObject private var lang = LanguageManager.shared
    @StateObject private var viewModel = PickerViewModel()
    @State private var guestName = ""
    @State private var votes: [String: String] = [:]

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.currentPlan == nil {
                ProgressView()
            } else if let plan = viewModel.currentPlan {
                planContent(plan)
            } else {
                VStack(spacing: 16) {
                    Text(lang.localizedString("picker.expired"))
                        .font(.headline)
                    Button(lang.localizedString("picker.createNewPlan")) { }
                        .buttonStyle(.borderedProminent)
                }
            }
        }
        .navigationTitle(viewModel.currentPlan?.filmTitle ?? lang.localizedString("picker.title"))
        .navigationBarTitleDisplayMode(.inline)
        .task { await viewModel.loadPlan(planId: planId) }
    }

    @ViewBuilder
    private func planContent(_ plan: PickerPlanDetail) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                // Film header
                filmHeader(plan)

                switch plan.status {
                case "EXPIRED", "ARCHIVED":
                    expiredCard

                case "CONFIRMED":
                    if let confirmed = plan.confirmedShowtime {
                        confirmedCard(plan: plan, showtime: confirmed)
                    }

                case "VOTING":
                    if plan.currentParticipantId == nil {
                        guestJoinForm
                    }
                    if plan.currentParticipantId != nil {
                        votingGrid(plan: plan)
                        if plan.participants.first(where: { $0.isOrganizer && $0.id == plan.currentParticipantId }) != nil {
                            organizerConfirmSection(plan: plan)
                        }
                    }

                default:
                    EmptyView()
                }
            }
            .padding()
        }
    }

    private func filmHeader(_ plan: PickerPlanDetail) -> some View {
        HStack(alignment: .top, spacing: 12) {
            if let posterPath = plan.filmPosterPath {
                AsyncImage(url: URL(string: "https://image.tmdb.org/t/p/w154\(posterPath)")) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Color.gray.opacity(0.3)
                }
                .frame(width: 80, height: 120)
                .cornerRadius(8)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(plan.filmTitle)
                    .font(.title3.weight(.bold))
                if let year = plan.filmYear {
                    Text(String(year))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Text("\(lang.localizedString("picker.organizedBy")) \(plan.organizer.name)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                HStack(spacing: 4) {
                    ForEach(plan.participants) { p in
                        Text(p.displayName)
                            .font(.caption2)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(.tertiarySystemBackground))
                            .cornerRadius(8)
                    }
                }
            }
        }
    }

    // MARK: - Expired

    private var expiredCard: some View {
        VStack(spacing: 12) {
            Text(lang.localizedString("picker.expired"))
                .font(.headline)
            Text(lang.localizedString("picker.expiredDesc"))
                .font(.caption)
                .foregroundColor(.secondary)
            Button(lang.localizedString("picker.createNewPlan")) { }
                .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }

    // MARK: - Confirmed

    private func confirmedCard(plan: PickerPlanDetail, showtime: PickerShowtime) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Label(lang.localizedString("picker.confirmed"), systemImage: "checkmark.circle.fill")
                .font(.headline)
                .foregroundColor(.green)

            VStack(alignment: .leading, spacing: 4) {
                Text("📍 \(showtime.cinemaName), \(showtime.cinemaCity)")
                Text("📅 \(showtime.date) · \(showtime.time)")
            }
            .font(.subheadline)

            if let url = showtime.ticketUrl, let ticketURL = URL(string: url) {
                Link(lang.localizedString("picker.buyTickets"), destination: ticketURL)
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.green.opacity(0.1))
        .cornerRadius(12)
    }

    // MARK: - Guest Join

    private var guestJoinForm: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(lang.localizedString("picker.joinPlan"))
                .font(.subheadline.weight(.medium))
            HStack {
                TextField(lang.localizedString("picker.displayName"), text: $guestName)
                    .textFieldStyle(.roundedBorder)
                Button(lang.localizedString("picker.join")) {
                    let token = UserDefaults.standard.string(forKey: "picker-guest-\(planId)")
                    Task {
                        _ = await viewModel.joinPlan(planId: planId, displayName: guestName, guestToken: token)
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(guestName.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }

    // MARK: - Voting Grid

    private func votingGrid(plan: PickerPlanDetail) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(lang.localizedString("picker.voteTally"))
                .font(.subheadline.weight(.medium))

            ForEach(plan.showtimes) { showtime in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(showtime.cinemaName)
                            .font(.subheadline.weight(.medium))
                        Text("\(showtime.date) · \(showtime.time)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    if let pid = plan.currentParticipantId {
                        voteToggle(participantId: pid, showtimeId: showtime.id)
                    }
                    if let vc = showtime.voteCount {
                        HStack(spacing: 6) {
                            Text("✓\(vc.available)").foregroundColor(.green).font(.caption2)
                            Text("✗\(vc.unavailable)").foregroundColor(.red).font(.caption2)
                            Text("?\(vc.maybe)").foregroundColor(.orange).font(.caption2)
                        }
                    }
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
            }
        }
    }

    private func voteToggle(participantId: String, showtimeId: String) -> some View {
        let current = votes[showtimeId]
        let states = ["AVAILABLE", "UNAVAILABLE", "MAYBE"]
        let icons = ["checkmark", "xmark", "questionmark"]
        let colors: [Color] = [.green, .red, .orange]
        let idx = current.flatMap { states.firstIndex(of: $0) }

        return Button {
            let nextIdx = ((idx ?? -1) + 1) % states.count
            let nextStatus = states[nextIdx]
            votes[showtimeId] = nextStatus
            Task {
                await viewModel.vote(participantId: participantId, showtimeId: showtimeId, status: nextStatus)
            }
        } label: {
            if let i = idx {
                Image(systemName: icons[i])
                    .font(.caption.weight(.bold))
                    .frame(width: 32, height: 32)
                    .background(colors[i].opacity(0.2))
                    .foregroundColor(colors[i])
                    .cornerRadius(8)
            } else {
                Image(systemName: "circle")
                    .font(.caption)
                    .frame(width: 32, height: 32)
                    .background(Color(.tertiarySystemBackground))
                    .cornerRadius(8)
            }
        }
    }

    // MARK: - Organizer Confirm

    private func organizerConfirmSection(plan: PickerPlanDetail) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(lang.localizedString("picker.confirmShowtime"))
                .font(.subheadline.weight(.medium))

            ForEach(plan.showtimes) { showtime in
                HStack {
                    Text("\(showtime.cinemaName) · \(showtime.date) · \(showtime.time)")
                        .font(.caption)
                    Spacer()
                    Button(lang.localizedString("picker.confirm")) {
                        Task {
                            await viewModel.confirmShowtime(planId: planId, showtimeId: showtime.id)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}
