import SwiftUI

/// Mood Reels page — mood selector, film suggestions, Mood Twins.
struct MoodReelsView: View {
    @ObservedObject private var lang = LanguageManager.shared
    @StateObject private var viewModel = MoodViewModel()
    @State private var showHistory = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Beta badge
                    Text(lang.localizedString("mood.betaBadge"))
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 5)
                        .background(Color.orange.opacity(0.15))
                        .foregroundColor(.orange)
                        .cornerRadius(12)

                    // Mood selector grid
                    MoodSelectorView(
                        selectedMood: viewModel.selectedMood,
                        isLoading: viewModel.isLoading
                    ) { mood in
                        Task { await viewModel.setMood(mood) }
                    }

                    // Loading
                    if viewModel.isLoading {
                        VStack(spacing: 8) {
                            ProgressView()
                            Text(lang.localizedString("mood.loadingSuggestions"))
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                    }

                    // Suggestions
                    if !viewModel.isLoading && !viewModel.suggestions.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(lang.localizedString("mood.suggestions"))
                                .font(.headline)

                            ForEach(viewModel.suggestions) { suggestion in
                                MoodSuggestionRow(suggestion: suggestion)
                            }
                        }
                    }

                    // Empty state
                    if !viewModel.isLoading && viewModel.suggestions.isEmpty && viewModel.selectedMood == nil {
                        Text(lang.localizedString("mood.noSuggestions"))
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .padding(.vertical, 32)
                    }

                    // Mood Twins
                    if !viewModel.isLoading && (viewModel.selectedMood != nil || !viewModel.moodTwins.isEmpty) {
                        MoodTwinsView(twins: viewModel.moodTwins) { userId in
                            Task { _ = await viewModel.connect(userId: userId) }
                        }
                    }

                    // History link
                    Button {
                        showHistory = true
                    } label: {
                        Text(lang.localizedString("mood.viewHistory"))
                            .font(.subheadline)
                    }
                }
                .padding()
            }
            .navigationTitle(lang.localizedString("mood.title"))
            .task { await viewModel.loadSuggestions() }
            .sheet(isPresented: $showHistory) {
                MoodHistoryView(viewModel: viewModel)
            }
        }
    }
}

// MARK: - Suggestion Row

struct MoodSuggestionRow: View {
    let suggestion: MoodSuggestion

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            if let posterPath = suggestion.filmPosterPath {
                AsyncImage(url: URL(string: "https://image.tmdb.org/t/p/w92\(posterPath)")) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Color.gray.opacity(0.3)
                }
                .frame(width: 48, height: 72)
                .cornerRadius(6)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(suggestion.filmTitle)
                        .font(.subheadline.weight(.medium))
                    if let year = suggestion.filmYear {
                        Text("(\(year))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                Text(suggestion.source == "ai" ? "AI Beta" : "Community")
                    .font(.caption2.weight(.medium))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(suggestion.source == "ai" ? Color.purple.opacity(0.15) : Color.blue.opacity(0.15))
                    .foregroundColor(suggestion.source == "ai" ? .purple : .blue)
                    .cornerRadius(6)

                Text(suggestion.matchExplanation)
                    .font(.caption)
                    .foregroundColor(.secondary)

                ProgressView(value: suggestion.matchStrength)
                    .tint(.accentColor)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}
