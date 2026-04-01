import SwiftUI

struct AppNavigation: View {
    @State private var selectedTab: Tab = .discover
    @ObservedObject private var lang = LanguageManager.shared

    enum Tab: String {
        case discover, filmTwins, cinemaWeek, buddy, picker, mood, matches, profile
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            DiscoverView()
                .tabItem {
                    Label(lang.localizedString("nav.match"), systemImage: "heart.fill")
                }
                .tag(Tab.discover)

            // Film Twins placeholder — feature exists on web at /scan
            Text(lang.localizedString("nav.filmTwins"))
                .tabItem {
                    Label(lang.localizedString("nav.filmTwins"), systemImage: "dot.radiowaves.left.and.right")
                }
                .tag(Tab.filmTwins)

            // Cinema Week placeholder — feature exists on web at /plan
            Text(lang.localizedString("nav.cinemaWeek"))
                .tabItem {
                    Label(lang.localizedString("nav.cinemaWeek"), systemImage: "calendar")
                }
                .tag(Tab.cinemaWeek)

            BuddyView()
                .tabItem {
                    Label(lang.localizedString("nav.buddy"), systemImage: "popcorn.fill")
                }
                .tag(Tab.buddy)

            // Picker
            PickerView()
                .tabItem {
                    Label(lang.localizedString("nav.picker"), systemImage: "ticket.fill")
                }
                .tag(Tab.picker)

            // Mood Reels
            MoodReelsView()
                .tabItem {
                    Label(lang.localizedString("nav.moodReels"), systemImage: "sparkles")
                }
                .tag(Tab.mood)

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
