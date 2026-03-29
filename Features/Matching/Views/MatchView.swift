import SwiftUI

struct MatchView: View {

    let match: Match
    let currentUser: User
    let otherUser: User

    var body: some View {
        VStack(spacing: 24) {
            Text("It's a Match!")
                .font(.largeTitle.bold())

            HStack(spacing: 16) {
                Avatar(url: currentUser.photos.first, size: 80)
                Image(systemName: "heart.fill")
                    .foregroundStyle(.pink)
                Avatar(url: otherUser.photos.first, size: 80)
            }

            if !match.sharedFilms.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("You both love")
                        .font(.headline)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(match.sharedFilms) { film in
                                FilmPoster(film: film)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }

            Button("Send a Message") {}
                .buttonStyle(PrimaryButtonStyle())

            Button("Keep Swiping") {}
                .buttonStyle(.plain)
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}
