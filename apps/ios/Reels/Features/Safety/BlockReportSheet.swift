import SwiftUI

struct BlockReportSheet: View {
    let userId: String
    let userName: String
    let onDismiss: () -> Void

    @State private var showReportForm = false
    @State private var reportReason: ReportReason = .spam
    @State private var reportDescription = ""
    @State private var isSubmitting = false

    private let api = APIClient.shared

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button {
                        Task { await blockUser() }
                    } label: {
                        Label("Block \(userName)", systemImage: "slash.circle")
                            .foregroundStyle(.primary)
                    }

                    Button {
                        showReportForm = true
                    } label: {
                        Label("Report \(userName)", systemImage: "exclamationmark.triangle")
                            .foregroundStyle(.primary)
                    }
                } footer: {
                    Text("Blocking removes this person from your feed and matches. They won't be notified.")
                }
            }
            .navigationTitle("Options")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { onDismiss() }
                }
            }
            .sheet(isPresented: $showReportForm) {
                reportFormView
            }
        }
    }

    private var reportFormView: some View {
        NavigationStack {
            Form {
                Section("Reason") {
                    Picker("Reason", selection: $reportReason) {
                        ForEach(ReportReason.allCases, id: \.self) { reason in
                            Text(reason.displayName).tag(reason)
                        }
                    }
                    .pickerStyle(.inline)
                    .labelsHidden()
                }

                Section("Details (optional)") {
                    TextEditor(text: $reportDescription)
                        .frame(minHeight: 80)
                }

                Section {
                    Button {
                        Task { await submitReport() }
                    } label: {
                        HStack {
                            if isSubmitting { ProgressView() }
                            Text("Submit Report")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .disabled(isSubmitting)
                }
            }
            .navigationTitle("Report")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { showReportForm = false }
                }
            }
        }
    }

    // MARK: - Actions

    private func blockUser() async {
        struct Input: Codable { let userId: String }
        do {
            struct EmptyResult: Codable {}
            let _: EmptyResult = try await api.mutate("safety.block", input: Input(userId: userId))
            onDismiss()
        } catch {}
    }

    private func submitReport() async {
        isSubmitting = true
        struct Input: Codable {
            let userId: String
            let reason: String
            let description: String?
        }
        do {
            struct ReportResult: Codable { let reportId: String }
            let _: ReportResult = try await api.mutate(
                "safety.report",
                input: Input(
                    userId: userId,
                    reason: reportReason.rawValue,
                    description: reportDescription.isEmpty ? nil : reportDescription
                )
            )
            showReportForm = false
            onDismiss()
        } catch {}
        isSubmitting = false
    }
}
