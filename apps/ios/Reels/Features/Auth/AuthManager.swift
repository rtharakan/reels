import Foundation
import Combine

/// Manages authentication state across the app.
@MainActor
final class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var hasCompletedOnboarding = false
    @Published var currentUser: UserProfile?
    @Published var isLoading = true

    private let api = APIClient.shared
    private let keychain = KeychainManager.shared

    init() {
        Task { await checkSession() }
    }

    func checkSession() async {
        defer { isLoading = false }

        guard keychain.getBearerToken() != nil else {
            isAuthenticated = false
            return
        }

        do {
            let user: UserProfile = try await api.query("user.me")
            currentUser = user
            isAuthenticated = true
            hasCompletedOnboarding = true
        } catch {
            isAuthenticated = false
            hasCompletedOnboarding = false
        }
    }

    func signIn(token: String, refreshToken: String?) {
        keychain.saveBearerToken(token)
        if let refreshToken = refreshToken {
            keychain.saveRefreshToken(refreshToken)
        }
        isAuthenticated = true

        Task { await checkSession() }
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
        Task { await checkSession() }
    }

    func signOut() {
        keychain.clearAll()
        currentUser = nil
        isAuthenticated = false
        hasCompletedOnboarding = false
    }
}
