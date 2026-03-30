import SwiftUI

struct ContentView: View {
    @EnvironmentObject var auth: AuthManager

    var body: some View {
        Group {
            if !auth.isAuthenticated {
                SignInView()
            } else if !auth.hasCompletedOnboarding {
                OnboardingView()
            } else {
                AppNavigation()
            }
        }
        .animation(.default, value: auth.isAuthenticated)
        .animation(.default, value: auth.hasCompletedOnboarding)
    }
}
