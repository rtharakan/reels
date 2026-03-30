import SwiftUI

struct EditProfileView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var age = ""
    @State private var location = ""
    @State private var bio = ""
    @State private var intent: Intent = .both
    @State private var isSaving = false

    private let api = APIClient.shared

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                fieldRow("Name", text: $name)
                fieldRow("Age", text: $age, keyboardType: .numberPad)
                fieldRow("Location", text: $location)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Bio")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    TextEditor(text: $bio)
                        .frame(minHeight: 80)
                        .padding(8)
                        .background(ReelsColor.bgAccentFallback)
                        .cornerRadius(12)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Looking for")
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

                HStack(spacing: 12) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)

                    Button {
                        Task { await save() }
                    } label: {
                        HStack {
                            if isSaving { ProgressView() }
                            Text(isSaving ? "Saving..." : "Save")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(ReelsColor.accent)
                    .foregroundStyle(.white)
                    .disabled(isSaving)
                }
            }
            .padding(16)
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadProfile() }
    }

    private func fieldRow(_ label: String, text: Binding<String>, keyboardType: UIKeyboardType = .default) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            TextField(label, text: text)
                .textFieldStyle(.plain)
                .keyboardType(keyboardType)
                .padding(12)
                .background(ReelsColor.bgAccentFallback)
                .cornerRadius(12)
        }
    }

    private func loadProfile() async {
        do {
            let user: UserProfile = try await api.query("user.me")
            name = user.name
            age = "\(user.age)"
            location = user.location
            bio = user.bio ?? ""
            intent = user.intent
        } catch {}
    }

    private func save() async {
        isSaving = true
        struct Input: Codable {
            let name: String
            let age: Int
            let location: String
            let bio: String
            let intent: String
        }
        do {
            struct EmptyResult: Codable {}
            let _: EmptyResult = try await api.mutate(
                "user.updateProfile",
                input: Input(
                    name: name,
                    age: Int(age) ?? 0,
                    location: location,
                    bio: bio,
                    intent: intent.rawValue
                )
            )
            dismiss()
        } catch {}
        isSaving = false
    }
}
