import SwiftUI

@main
struct ReelsApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var notificationManager = NotificationManager()
    @ObservedObject private var languageManager = LanguageManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(notificationManager)
                .environmentObject(languageManager)
                .onAppear {
                    notificationManager.requestPermission()
                }
        }
    }
}
