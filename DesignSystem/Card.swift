import SwiftUI

/// A card container with a soft shadow used throughout the app.
struct Card<Content: View>: View {

    let content: () -> Content

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        content()
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .shadow(color: .black.opacity(0.08), radius: 12, x: 0, y: 4)
    }
}

/// A swipeable profile card shown in the discovery feed.
struct ProfileCardView: View {

    let user: User

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 0) {
                if let photoURL = user.photos.first {
                    AsyncImage(url: photoURL) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .foregroundStyle(Color(.systemGray5))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 420)
                    .clipped()
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("\(user.name), \(user.age)")
                        .font(.title2.bold())

                    if let prompt = user.prompts.first {
                        Text(prompt.answer)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }
                }
                .padding(16)
            }
        }
    }
}
