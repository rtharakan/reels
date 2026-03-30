import SwiftUI

struct DiscoverView: View {
    @State private var feed: DiscoverFeed?
    @State private var currentIndex = 0
    @State private var isLoading = true
    @State private var matchAlert: String?
    @State private var dragOffset: CGSize = .zero

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ObservedObject private var lang = LanguageManager.shared

    private let api = APIClient.shared

    var body: some View {
        NavigationStack {
            ZStack {
                if isLoading {
                    ProgressView()
                } else if let feed = feed, currentIndex < feed.cards.count, !feed.isAllCaughtUp {
                    cardView(for: feed.cards[currentIndex])
                } else {
                    allCaughtUpView
                }

                // Match alert overlay
                if let alert = matchAlert {
                    matchAlertBanner(alert)
                }
            }
            .navigationTitle(lang.localizedString("discover.title"))
            .navigationBarTitleDisplayMode(.large)
            .task { await loadFeed() }
        }
    }

    // MARK: - Card View

    @ViewBuilder
    private func cardView(for card: DiscoverCard) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                // Profile photo area
                ZStack(alignment: .bottomLeading) {
                    Rectangle()
                        .fill(Color(.systemGray5))
                        .aspectRatio(3/4, contentMode: .fit)
                        .overlay {
                            if let photo = card.profilePhotos.first, let url = URL(string: photo) {
                                AsyncImage(url: url) { image in
                                    image.resizable().scaledToFill()
                                } placeholder: {
                                    initialAvatar(card.name)
                                }
                            } else {
                                initialAvatar(card.name)
                            }
                        }
                        .clipped()
                        .cornerRadius(16)

                    // Name overlay
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(card.name), \(card.age)")
                            .font(.title2)
                            .fontWeight(.bold)

                        Text(card.location)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        LinearGradient(colors: [.clear, .black.opacity(0.6)], startPoint: .top, endPoint: .bottom)
                    )
                    .cornerRadius(16)
                }
                .offset(x: dragOffset.width)
                .rotationEffect(.degrees(Double(dragOffset.width / 20)))
                .gesture(swipeGesture)
                .animation(reduceMotion ? nil : .spring(), value: dragOffset)

                VStack(alignment: .leading, spacing: 16) {
                    // Intent + score
                    HStack {
                        Text(card.intent.displayName)
                            .font(.caption)
                            .fontWeight(.medium)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(ReelsColor.accentSoft)
                            .foregroundStyle(ReelsColor.accent)
                            .cornerRadius(12)

                        Spacer()

                        Text("\(Int(card.matchScore * 100))% match")
                            .font(.subheadline)
                            .fontWeight(.semibold)

                        Text("· \(card.sharedFilmCount) shared films")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    // Bio
                    if let bio = card.bio, !bio.isEmpty {
                        Text(bio)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }

                    // Prompts
                    ForEach(Array(card.prompts.prefix(2).enumerated()), id: \.offset) { _, prompt in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(prompt.question)
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                            Text(prompt.answer)
                                .font(.subheadline)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(ReelsColor.bgAccentFallback)
                        .cornerRadius(12)
                    }

                    // Shared films
                    if !card.sharedFilms.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Films you both love")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(card.sharedFilms) { film in
                                        posterThumbnail(film: film, width: 70)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(16)

                // Action buttons
                HStack(spacing: 24) {
                    Button {
                        Task { await handleSkip() }
                    } label: {
                        Label(lang.localizedString("discover.skip"), systemImage: "xmark")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.bordered)
                    .accessibilityLabel("Skip this person")

                    Button {
                        Task { await handleInterest() }
                    } label: {
                        Label(lang.localizedString("discover.interested"), systemImage: "heart.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(ReelsColor.accent)
                    .foregroundStyle(.white)
                    .accessibilityLabel("Express interest in this person")
                }
                .padding(16)
            }
        }
    }

    // MARK: - Subviews

    private var allCaughtUpView: some View {
        VStack(spacing: 12) {
            Image(systemName: "film")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text(lang.localizedString("discover.empty"))
                .font(.title3)
                .fontWeight(.bold)

            Text(lang.isDutch ? "Kom morgen terug voor meer matches." : "Check back tomorrow for more matches.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private func initialAvatar(_ name: String) -> some View {
        Text(String(name.prefix(1)))
            .font(.system(size: 64))
            .fontWeight(.bold)
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func matchAlertBanner(_ text: String) -> some View {
        Text(text)
            .font(.subheadline)
            .fontWeight(.semibold)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial)
            .cornerRadius(12)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .padding(.top, 8)
            .transition(.move(edge: .top))
    }

    private func posterThumbnail(film: FilmPreview, width: CGFloat) -> some View {
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
                            .multilineTextAlignment(.center)
                            .padding(4)
                    }
            }
        }
        .frame(width: width, height: width * 1.5)
        .cornerRadius(8)
        .accessibilityLabel("\(film.title) poster")
    }

    // MARK: - Gestures

    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 44)
            .onChanged { value in
                dragOffset = value.translation
            }
            .onEnded { value in
                let threshold: CGFloat = 100
                if value.translation.width > threshold {
                    // Swipe right → Skip
                    Task { await handleSkip() }
                } else if value.translation.width < -threshold {
                    // Swipe left → Interest
                    Task { await handleInterest() }
                }
                dragOffset = .zero
            }
    }

    // MARK: - Actions

    private func loadFeed() async {
        isLoading = true
        do {
            feed = try await api.query("discover.getFeed")
        } catch {
            // Handle error gracefully
        }
        isLoading = false
    }

    private func handleInterest() async {
        guard let card = feed?.cards[safe: currentIndex] else { return }

        struct Input: Codable { let targetUserId: String }
        do {
            let result: InterestResult = try await api.mutate(
                "discover.expressInterest",
                input: Input(targetUserId: card.userId)
            )
            if result.isMatch {
                matchAlert = "It's a match with \(card.name)! 🎬"
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    matchAlert = nil
                }
            }
        } catch {}

        currentIndex += 1
    }

    private func handleSkip() async {
        guard let card = feed?.cards[safe: currentIndex] else { return }

        struct Input: Codable { let targetUserId: String }
        do {
            struct EmptyResult: Codable {}
            let _: EmptyResult = try await api.mutate(
                "discover.skip",
                input: Input(targetUserId: card.userId)
            )
        } catch {}

        currentIndex += 1
    }
}

// MARK: - Safe Array Access

extension Collection {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
