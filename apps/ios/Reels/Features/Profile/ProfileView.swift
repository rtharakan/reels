import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var auth: AuthManager
    @ObservedObject private var lang = LanguageManager.shared
    @State private var user: UserProfile?
    @State private var isLoading = true
    @State private var showDeleteConfirm = false
    @State private var isReimporting = false

    private let api = APIClient.shared

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let user = user {
                    profileContent(user)
                }
            }
            .navigationTitle(lang.localizedString("profile.title"))
            .navigationBarTitleDisplayMode(.large)
            .task { await loadProfile() }
        }
    }

    @ViewBuilder
    private func profileContent(_ user: UserProfile) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                HStack(spacing: 16) {
                    Circle()
                        .fill(ReelsColor.accentSoft)
                        .frame(width: 64, height: 64)
                        .overlay {
                            Text(String(user.name.prefix(1)))
                                .font(.title)
                                .fontWeight(.semibold)
                                .foregroundStyle(ReelsColor.accent)
                        }

                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(user.name), \(user.age)")
                            .font(.title3)
                            .fontWeight(.bold)

                        Text(user.location)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)

                        Text("\(user.watchlistCount) films imported")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }

                    Spacer()
                }
                .padding(16)
                .background(ReelsColor.bgAccentFallback)
                .cornerRadius(16)

                // Bio
                if let bio = user.bio, !bio.isEmpty {
                    Text(bio)
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .background(ReelsColor.bgAccentFallback)
                        .cornerRadius(16)
                }

                // Prompts
                ForEach(Array(user.prompts.enumerated()), id: \.offset) { _, prompt in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(prompt.question)
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                        Text(prompt.answer)
                            .font(.body)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(ReelsColor.bgAccentFallback)
                    .cornerRadius(16)
                }

                // Top films
                if !user.topFilms.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Top Films")
                            .font(.headline)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(user.topFilms) { film in
                                    posterView(film: film, width: 60)
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(ReelsColor.bgAccentFallback)
                    .cornerRadius(16)
                }

                // Actions
                VStack(spacing: 12) {
                    NavigationLink(destination: EditProfileView()) {
                        Text(lang.localizedString("profile.edit"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.bordered)

                    if user.letterboxdUsername != nil {
                        Button {
                            Task { await reimportWatchlist() }
                        } label: {
                            HStack {
                                if isReimporting { ProgressView() }
                                Text(isReimporting ? (lang.isDutch ? "Opnieuw importeren..." : "Re-importing...") : lang.localizedString("profile.reimport"))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                        }
                        .buttonStyle(.bordered)
                        .disabled(isReimporting)
                    }

                    NavigationLink(destination: BlockedUsersView()) {
                        Text(lang.localizedString("profile.blockedUsers"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.bordered)

                    Button(role: .destructive) {
                        showDeleteConfirm = true
                    } label: {
                        Text(lang.localizedString("profile.deleteAccount"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.bordered)
                    .tint(.red)
                }

                // Attribution
                Text("Film data powered by TMDB")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                    .padding(.top, 8)

                // Sign out
                Button {
                    auth.signOut()
                } label: {
                    Text(lang.localizedString("profile.signOut"))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 4)
            }
            .padding(16)
        }
        .alert("Delete your account?", isPresented: $showDeleteConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                Task { await deleteAccount() }
            }
        } message: {
            Text("This will permanently delete your profile, watchlist, matches, and all associated data. This action cannot be undone.")
        }
    }

    private func posterView(film: FilmPreview, width: CGFloat) -> some View {
        Group {
            if let urlStr = film.posterUrl, let url = URL(string: urlStr) {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Rectangle().fill(Color(.systemGray5))
                }
            } else {
                Rectangle().fill(Color(.systemGray5))
                    .overlay {
                        Text(film.title)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .padding(2)
                    }
            }
        }
        .frame(width: width, height: width * 1.5)
        .cornerRadius(8)
    }

    // MARK: - Actions

    private func loadProfile() async {
        isLoading = true
        do {
            user = try await api.query("user.me")
        } catch {}
        isLoading = false
    }

    private func reimportWatchlist() async {
        guard let username = user?.letterboxdUsername else { return }
        isReimporting = true
        struct Input: Codable { let letterboxdUsername: String }
        do {
            struct Result: Codable {}
            let _: Result = try await api.mutate("watchlist.import", input: Input(letterboxdUsername: username))
            await loadProfile()
        } catch {}
        isReimporting = false
    }

    private func deleteAccount() async {
        do {
            struct EmptyResult: Codable {}
            let _: EmptyResult = try await api.mutate("user.deleteAccount")
            auth.signOut()
        } catch {}
    }
}
