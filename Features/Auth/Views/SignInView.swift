import SwiftUI
import AuthenticationServices

struct SignInView: View {

    @StateObject private var viewModel = SignInViewModel()

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 8) {
                Text("Reel")
                    .font(.largeTitle.bold())
                Text("Connect through film.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            SignInWithAppleButton(.signIn) { request in
                viewModel.handleRequest(request)
            } onCompletion: { result in
                viewModel.handleCompletion(result)
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 50)
            .padding(.horizontal, 32)
        }
        .padding(.bottom, 48)
        .alert("Sign In Failed", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}
