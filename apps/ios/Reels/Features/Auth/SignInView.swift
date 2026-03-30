import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @EnvironmentObject var auth: AuthManager
    @ObservedObject private var lang = LanguageManager.shared
    @State private var email = ""
    @State private var isLoading = false
    @State private var showMagicLinkSent = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 32) {
            HStack {
                Spacer()
                LanguageToggleButton()
                    .padding(.trailing, 8)
            }

            Spacer()

            // Logo
            VStack(spacing: 8) {
                Image(systemName: "heart.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(ReelsColor.accent)

                Text(lang.localizedString("auth.signIn.title"))
                    .font(.largeTitle)
                    .fontWeight(.semibold)

                Text(lang.localizedString("auth.signIn.subtitle"))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if showMagicLinkSent {
                magicLinkSentView
            } else {
                signInForm
            }

            Spacer()
        }
        .padding(.horizontal, 24)
    }

    // MARK: - Sign In Form

    private var signInForm: some View {
        VStack(spacing: 16) {
            // Email field
            VStack(alignment: .leading, spacing: 6) {
                Text(lang.localizedString("auth.signIn.email.placeholder"))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                TextField("you@example.com", text: $email)
                    .textFieldStyle(.plain)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
                    .reelsTextField()
            }

            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            // Magic link button
            Button {
                Task { await sendMagicLink() }
            } label: {
                HStack {
                    if isLoading {
                        ProgressView()
                            .tint(.primary)
                    }
                    Text(lang.localizedString("auth.signIn.email.button"))
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(ReelsColor.accent)
            .foregroundStyle(.white)
            .disabled(email.isEmpty || isLoading)

            divider

            // Apple Sign In
            SignInWithAppleButton(.signIn) { request in
                request.requestedScopes = [.email, .fullName]
            } onCompletion: { result in
                handleAppleSignIn(result)
            }
            .signInWithAppleButtonStyle(.white)
            .frame(height: 50)
            .cornerRadius(12)
        }
    }

    // MARK: - Magic Link Sent

    private var magicLinkSentView: some View {
        VStack(spacing: 16) {
            Image(systemName: "envelope")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text(lang.localizedString("auth.signIn.email.sent"))
                .font(.title2)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)

            Text("We sent a sign-in link to **\(email)**")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Text("The link expires in 10 minutes.")
                .font(.caption)
                .foregroundStyle(.tertiary)

            Button("Use a different email") {
                showMagicLinkSent = false
            }
            .font(.subheadline)
        }
    }

    private var divider: some View {
        HStack {
            Rectangle().fill(Color(.separator)).frame(height: 1)
            Text("or")
                .font(.caption)
                .foregroundStyle(.tertiary)
            Rectangle().fill(Color(.separator)).frame(height: 1)
        }
    }

    // MARK: - Actions

    private func sendMagicLink() async {
        isLoading = true
        errorMessage = nil

        // In production, this would call the BetterAuth magic link endpoint
        // For now, simulate the request
        do {
            struct MagicLinkInput: Codable { let email: String }
            let _: EmptyResponse = try await APIClient.shared.mutate(
                "auth.signIn.magicLink",
                input: MagicLinkInput(email: email)
            )
            showMagicLinkSent = true
        } catch {
            errorMessage = "Failed to send magic link. Please try again."
        }

        isLoading = false
    }

    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let auth):
            guard let credential = auth.credential as? ASAuthorizationAppleIDCredential,
                  let tokenData = credential.identityToken,
                  let idToken = String(data: tokenData, encoding: .utf8)
            else { return }

            Task {
                do {
                    struct AppleSignInInput: Codable {
                        let idToken: String
                        let callbackURL: String
                    }
                    struct SignInResponse: Codable {
                        let token: String?
                        let refreshToken: String?
                    }
                    let response: SignInResponse = try await APIClient.shared.mutate(
                        "auth.signIn.social",
                        input: AppleSignInInput(idToken: idToken, callbackURL: "/discover")
                    )
                    if let token = response.token {
                        self.auth.signIn(token: token, refreshToken: response.refreshToken)
                    }
                } catch {
                    errorMessage = "Apple sign-in failed. Please try again."
                }
            }

        case .failure:
            errorMessage = "Apple sign-in was cancelled."
        }
    }
}

private struct EmptyResponse: Codable {}
