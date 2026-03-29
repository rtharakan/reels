import SwiftUI

/// Root view: routes between authentication and the main tab interface.
struct RootView: View {

    @State private var isAuthenticated = false

    var body: some View {
        if isAuthenticated {
            MainTabView()
        } else {
            SignInView()
        }
    }
}

/// Primary tab bar shown after sign-in.
struct MainTabView: View {
    var body: some View {
        TabView {
            DiscoveryView()
                .tabItem {
                    Label("Discover", systemImage: "film.stack")
                }
        }
    }
}
