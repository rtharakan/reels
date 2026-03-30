import Foundation
import UserNotifications

@MainActor
final class NotificationManager: ObservableObject {
    @Published var isAuthorized = false

    static let shared = NotificationManager()
    private init() {}

    func requestPermission() async {
        let center = UNUserNotificationCenter.current()
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .badge, .sound])
            isAuthorized = granted
        } catch {
            isAuthorized = false
        }
    }

    func checkStatus() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        isAuthorized = settings.authorizationStatus == .authorized
    }

    func scheduleMatchNotification(matchName: String, sharedFilms: Int) {
        let content = UNMutableNotificationContent()
        content.title = "New Match"
        content.body = "You matched with \(matchName) — \(sharedFilms) films in common."
        content.sound = .default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )
        UNUserNotificationCenter.current().add(request)
    }
}
