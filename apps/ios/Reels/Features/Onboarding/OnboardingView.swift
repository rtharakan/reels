import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var auth: AuthManager
    @State private var step: OnboardingStep = .privacy

    enum OnboardingStep {
        case privacy, profile, watchlist, topFilms
    }

    // Profile fields
    @State private var name = ""
    @State private var age = ""
    @State private var location = ""
    @State private var bio = ""
    @State private var intent: Intent = .both
    @State private var prompts: [Prompt] = []
    @State private var letterboxdUsername = ""
    @State private var hasConsented = false

    // State
    @State private var isImporting = false
    @State private var importResult: ImportResult?
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                progressBar
                    .padding(.horizontal)
                    .padding(.top, 8)

                ScrollView {
                    VStack(spacing: 24) {
                        switch step {
                        case .privacy:
                            privacyStep
                        case .profile:
                            profileStep
                        case .watchlist:
                            watchlistStep
                        case .topFilms:
                            topFilmsStep
                        }
                    }
                    .padding(24)
                }
            }
            .navigationTitle("Reels")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Progress Bar

    private var progressBar: some View {
        HStack(spacing: 4) {
            ForEach(0..<4) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(index <= stepIndex ? ReelsColor.accent : Color(.systemGray5))
                    .frame(height: 3)
            }
        }
    }

    private var stepIndex: Int {
        switch step {
        case .privacy: return 0
        case .profile: return 1
        case .watchlist: return 2
        case .topFilms: return 3
        }
    }

    // MARK: - Privacy Step

    private var privacyStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Privacy Policy")
                .font(.title2)
                .fontWeight(.bold)

            Text("Before we get started, please review and accept our privacy policy. We take your data seriously — we only collect what's needed to match you with other film lovers.")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Toggle("I accept the privacy policy", isOn: $hasConsented)
                .tint(ReelsColor.accent)

            Button {
                step = .profile
            } label: {
                Text("Continue")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(ReelsColor.accent)
            .foregroundStyle(.white)
            .disabled(!hasConsented)
        }
    }

    // MARK: - Profile Step

    private var profileStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Create your profile")
                .font(.title2)
                .fontWeight(.bold)

            Group {
                fieldRow("Display name", text: $name)
                fieldRow("Age", text: $age, keyboardType: .numberPad)
                fieldRow("Location", text: $location, placeholder: "City, Country")

                VStack(alignment: .leading, spacing: 6) {
                    Text("Bio")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    TextEditor(text: $bio)
                        .frame(minHeight: 80)
                        .padding(8)
                        .background(ReelsColor.bgAccentFallback)
                        .cornerRadius(12)
                    Text("\(bio.count)/500")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }

            // Intent
            VStack(alignment: .leading, spacing: 8) {
                Text("What are you looking for?")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                HStack(spacing: 8) {
                    ForEach(Intent.allCases, id: \.self) { option in
                        Button(option.displayName) {
                            intent = option
                        }
                        .buttonStyle(.bordered)
                        .tint(intent == option ? ReelsColor.accent : Color(.systemGray3))
                    }
                }
            }

            Button {
                step = .watchlist
            } label: {
                Text("Continue")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(ReelsColor.accent)
            .foregroundStyle(.white)
            .disabled(name.isEmpty || age.isEmpty || location.isEmpty)
        }
    }

    // MARK: - Watchlist Step

    private var watchlistStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Import your watchlist")
                .font(.title2)
                .fontWeight(.bold)

            Text("Connect your Letterboxd profile so we can find your film matches.")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            fieldRow("Letterboxd username", text: $letterboxdUsername, placeholder: "your-username")

            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            if isImporting {
                HStack(spacing: 8) {
                    ProgressView()
                    Text("Importing your watchlist...")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            if let result = importResult {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Imported \(result.imported) films")
                        .fontWeight(.medium)
                    Text("\(result.resolved) resolved, \(result.failed) not found")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(ReelsColor.bgAccentFallback)
                .cornerRadius(12)
            }

            VStack(spacing: 12) {
                Button {
                    Task { await importWatchlist() }
                } label: {
                    Text("Import watchlist")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(ReelsColor.accent)
                .foregroundStyle(.white)
                .disabled(letterboxdUsername.isEmpty || isImporting)

                Button {
                    step = .topFilms
                } label: {
                    Text("Skip for now")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.bordered)
            }

            Text("We only access your public watchlist.")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
    }

    // MARK: - Top Films Step

    private var topFilmsStep: some View {
        VStack(spacing: 20) {
            Text("Almost done!")
                .font(.title2)
                .fontWeight(.bold)

            Text("Your profile is ready. You can select your top films later from your profile page.")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                Image(systemName: "film")
                    .font(.system(size: 36))
                    .foregroundStyle(.secondary)

                Text("Welcome to Reels!")
                    .font(.headline)

                Text("Start discovering people who share your film taste.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(24)
            .frame(maxWidth: .infinity)
            .background(ReelsColor.bgAccentFallback)
            .cornerRadius(16)

            Button {
                Task { await completeOnboarding() }
            } label: {
                Text("Start discovering")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(ReelsColor.accent)
            .foregroundStyle(.white)
        }
    }

    // MARK: - Helpers

    private func fieldRow(_ label: String, text: Binding<String>, placeholder: String? = nil, keyboardType: UIKeyboardType = .default) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            TextField(placeholder ?? label, text: text)
                .textFieldStyle(.plain)
                .keyboardType(keyboardType)
                .padding(12)
                .background(ReelsColor.bgAccentFallback)
                .cornerRadius(12)
        }
    }

    private func importWatchlist() async {
        isImporting = true
        errorMessage = nil

        do {
            struct WatchlistInput: Codable { let letterboxdUsername: String }
            let result: ImportResult = try await APIClient.shared.mutate(
                "watchlist.import",
                input: WatchlistInput(letterboxdUsername: letterboxdUsername)
            )
            importResult = result
            step = .topFilms
        } catch {
            errorMessage = "Failed to import watchlist. Check your username and try again."
        }

        isImporting = false
    }

    private func completeOnboarding() async {
        let input = OnboardingInput(
            name: name,
            age: Int(age) ?? 0,
            location: location,
            bio: bio,
            intent: intent.rawValue,
            prompts: prompts,
            letterboxdUsername: letterboxdUsername.isEmpty ? nil : letterboxdUsername,
            topFilmIds: [],
            privacyPolicyConsented: hasConsented
        )

        do {
            struct EmptyResult: Codable {}
            let _: EmptyResult = try await APIClient.shared.mutate(
                "user.completeOnboarding",
                input: input
            )
            auth.completeOnboarding()
        } catch {
            errorMessage = "Failed to complete setup. Please try again."
        }
    }
}
