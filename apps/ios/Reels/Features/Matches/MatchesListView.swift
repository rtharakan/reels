import SwiftUI

struct MatchesListView: View {
    @State private var matches: [MatchListItem] = []
    @State private var isLoading = true
    @ObservedObject private var lang = LanguageManager.shared

    private let api = APIClient.shared

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if matches.isEmpty {
                    emptyState
                } else {
                    matchesList
                }
            }
            .navigationTitle(lang.localizedString("matches.title"))
            .navigationBarTitleDisplayMode(.large)
            .task { await loadMatches() }
        }
    }

    private var matchesList: some View {
        List(matches) { match in
            NavigationLink(destination: MatchDetailView(matchId: match.matchId)) {
                HStack(spacing: 12) {
                    // Avatar
                    Circle()
                        .fill(ReelsColor.accentSoft)
                        .frame(width: 48, height: 48)
                        .overlay {
                            Text(String(match.otherUser.name.prefix(1)))
                                .font(.headline)
                                .foregroundStyle(ReelsColor.accent)
                        }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(match.otherUser.name)
                            .font(.headline)

                        Text("\(match.sharedFilmCount) shared films · \(Int(match.score * 100))% match")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Text(formatDate(match.createdAt))
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding(.vertical, 4)
            }
        }
        .listStyle(.plain)
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "film")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text(lang.localizedString("matches.empty"))
                .font(.title3)
                .fontWeight(.bold)

            Text(lang.isDutch ? "Blijf ontdekken om je filmmatches te vinden!" : "Keep discovering to find your film matches!")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private func loadMatches() async {
        isLoading = true
        do {
            matches = try await api.query("match.list")
        } catch {}
        isLoading = false
    }

    private func formatDate(_ dateStr: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateStr) else { return dateStr }
        let display = DateFormatter()
        display.dateStyle = .short
        return display.string(from: date)
    }
}
