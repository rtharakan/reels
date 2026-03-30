import SwiftUI

struct MatchDetailView: View {
    let matchId: String

    @State private var match: MatchDetail?
    @State private var isLoading = true

    private let api = APIClient.shared

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let match = match {
                matchContent(match)
            } else {
                Text("Match not found")
                    .foregroundStyle(.secondary)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadMatch() }
    }

    @ViewBuilder
    private func matchContent(_ match: MatchDetail) -> some View {
        ScrollView {
            VStack(spacing: 24) {
                // Profile header
                VStack(spacing: 8) {
                    Circle()
                        .fill(ReelsColor.accentSoft)
                        .frame(width: 80, height: 80)
                        .overlay {
                            Text(String(match.otherUser.name.prefix(1)))
                                .font(.largeTitle)
                                .fontWeight(.bold)
                                .foregroundStyle(ReelsColor.accent)
                        }

                    Text("\(match.otherUser.name), \(match.otherUser.age)")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text(match.otherUser.location)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    Text("\(Int(match.score * 100))% match")
                        .font(.headline)
                        .foregroundStyle(ReelsColor.accent)
                }

                // Why you matched
                VStack(alignment: .leading, spacing: 12) {
                    Text("Why you matched")
                        .font(.headline)

                    Text("You share **\(match.sharedFilms.count) films** in your watchlists.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    // Genre overlap
                    if !match.genreOverlap.isEmpty {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Top shared genres")
                                .font(.caption)
                                .foregroundStyle(.tertiary)

                            FlowLayout(spacing: 6) {
                                ForEach(match.genreOverlap.prefix(5), id: \.genreName) { genre in
                                    Text("\(genre.genreName) (\(genre.count))")
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 4)
                                        .background(ReelsColor.accentSoft)
                                        .foregroundStyle(ReelsColor.accent)
                                        .cornerRadius(12)
                                }
                            }
                        }
                    }

                    // Shared films grid
                    if !match.sharedFilms.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Films you both love")
                                .font(.caption)
                                .foregroundStyle(.tertiary)

                            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                                ForEach(match.sharedFilms.prefix(8)) { film in
                                    posterCard(film)
                                }
                            }
                        }
                    }
                }
                .padding(16)
                .background(ReelsColor.bgAccentFallback)
                .cornerRadius(16)

                // Bio
                if let bio = match.otherUser.bio, !bio.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("About")
                            .font(.headline)
                        Text(bio)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(ReelsColor.bgAccentFallback)
                    .cornerRadius(16)
                }

                // Prompts
                ForEach(Array(match.otherUser.prompts.enumerated()), id: \.offset) { _, prompt in
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
            }
            .padding(16)
        }
    }

    private func posterCard(_ film: FilmPreview) -> some View {
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
                            .padding(2)
                    }
            }
        }
        .aspectRatio(2/3, contentMode: .fit)
        .cornerRadius(6)
        .accessibilityLabel("\(film.title) poster")
    }

    private func loadMatch() async {
        isLoading = true
        struct Input: Codable { let matchId: String }
        do {
            match = try await api.query("match.getById", input: Input(matchId: matchId))
        } catch {}
        isLoading = false
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var totalHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)

            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }

            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            totalHeight = y + rowHeight
        }

        return (CGSize(width: maxWidth, height: totalHeight), positions)
    }
}
