import SwiftUI

/// Mood Twins section — grid of users in the same mood.
struct MoodTwinsView: View {
    let twins: [MoodTwin]
    let onConnect: (String) -> Void

    @ObservedObject private var lang = LanguageManager.shared

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(lang.localizedString("mood.moodTwins"))
                .font(.headline)

            if twins.isEmpty {
                Text(lang.localizedString("mood.moodTwinsEmpty"))
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.vertical, 20)
                    .frame(maxWidth: .infinity)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(twins) { twin in
                            twinCard(twin)
                        }
                    }
                }
            }
        }
    }

    private func twinCard(_ twin: MoodTwin) -> some View {
        VStack(spacing: 8) {
            if let image = twin.image, let url = URL(string: image) {
                AsyncImage(url: url) { img in
                    img.resizable().scaledToFill()
                } placeholder: {
                    initialsCircle(twin.displayName)
                }
                .frame(width: 48, height: 48)
                .clipShape(Circle())
            } else {
                initialsCircle(twin.displayName)
            }

            Text(twin.displayName ?? "User")
                .font(.caption.weight(.medium))
                .lineLimit(1)

            if twin.sharedFilmCount > 0 {
                Text("\(twin.sharedFilmCount) \(lang.localizedString("mood.filmsInCommon"))")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Button(lang.localizedString("mood.connect")) {
                onConnect(twin.userId)
            }
            .font(.caption2.weight(.medium))
            .buttonStyle(.bordered)
            .controlSize(.mini)
        }
        .frame(width: 90)
        .padding(.vertical, 8)
    }

    private func initialsCircle(_ name: String?) -> some View {
        Circle()
            .fill(Color.accentColor)
            .frame(width: 48, height: 48)
            .overlay(
                Text(String((name ?? "?").prefix(1)).uppercased())
                    .font(.headline.weight(.bold))
                    .foregroundColor(.white)
            )
    }
}
