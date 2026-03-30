import SwiftUI

struct AppNavigation: View {
    @State private var selectedTab: Tab = .discover
    @ObservedObject private var lang = LanguageManager.shared

    enum Tab: String {
        case discover, buddy, matches, profile
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            DiscoverView()
                .tabItem {
                    Label(lang.localizedString("discover.title"), systemImage: "heart")
                }
                .tag(Tab.discover)

            BuddyView()
                .tabItem {
                    Label(lang.localizedString("buddy.title"), systemImage: "popcorn")
                }
                .tag(Tab.buddy)

            MatchesListView()
                .tabItem {
                    Label(lang.localizedString("matches.title"), systemImage: "person.2")
                }
                .tag(Tab.matches)

            ProfileView()
                .tabItem {
                    Label(lang.localizedString("profile.title"), systemImage: "person")
                }
                .tag(Tab.profile)
        }
        .tint(ReelsColor.accent)
    }
}
