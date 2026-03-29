import Foundation
import AuthenticationServices

@MainActor
final class SignInViewModel: ObservableObject {

    @Published var isAuthenticated = false
    @Published var showError = false
    @Published var errorMessage = ""

    func handleRequest(_ request: ASAuthorizationAppleIDRequest) {
        request.requestedScopes = [.fullName, .email]
    }

    func handleCompletion(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let auth):
            guard let credential = auth.credential as? ASAuthorizationAppleIDCredential else { return }
            signIn(with: credential)
        case .failure(let error):
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    // MARK: - Private

    private func signIn(with credential: ASAuthorizationAppleIDCredential) {
        // Exchange Apple credential for Firebase session.
        // Implementation requires FirebaseAuth SDK integration.
        isAuthenticated = true
    }
}
