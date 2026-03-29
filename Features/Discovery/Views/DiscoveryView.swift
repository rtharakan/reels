import SwiftUI

struct DiscoveryView: View {

    @StateObject private var viewModel = DiscoveryViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                if viewModel.profiles.isEmpty {
                    ContentUnavailableView(
                        "No more profiles",
                        systemImage: "film.stack",
                        description: Text("Check back soon for new matches.")
                    )
                } else {
                    CardStackView(profiles: viewModel.profiles) { profile, direction in
                        viewModel.handleSwipe(profile: profile, direction: direction)
                    }
                }
            }
            .navigationTitle("Discover")
            .task {
                await viewModel.loadProfiles()
            }
        }
    }
}

// MARK: - Card Stack

private struct CardStackView: View {

    let profiles: [User]
    let onSwipe: (User, SwipeDirection) -> Void

    var body: some View {
        ZStack {
            ForEach(profiles.reversed()) { profile in
                ProfileCardView(user: profile)
                    .zIndex(profiles.firstIndex(where: { $0.id == profile.id }).map(Double.init) ?? 0)
            }
        }
        .padding()
    }
}

// MARK: - Supporting Types

enum SwipeDirection {
    case left, right
}
