import SwiftUI

struct ProfileCreationView: View {

    @StateObject private var viewModel = ProfileCreationViewModel()

    var body: some View {
        NavigationStack {
            Form {
                Section("About You") {
                    TextField("Name", text: $viewModel.name)
                    Stepper("Age: \(viewModel.age)", value: $viewModel.age, in: 18...99)
                }

                Section("Letterboxd") {
                    TextField("Username", text: $viewModel.letterboxdUsername)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                }

                Section("Prompts") {
                    ForEach($viewModel.prompts, id: \.question) { $prompt in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(prompt.question)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            TextField("Your answer", text: $prompt.answer, axis: .vertical)
                                .lineLimit(3...5)
                        }
                    }
                }
            }
            .navigationTitle("Create Profile")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Next") {
                        viewModel.submit()
                    }
                    .disabled(!viewModel.isValid)
                }
            }
        }
    }
}
