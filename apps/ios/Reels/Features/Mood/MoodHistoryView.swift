import SwiftUI

/// Mood history timeline view.
struct MoodHistoryView: View {
    @ObservedObject var viewModel: MoodViewModel
    @ObservedObject private var lang = LanguageManager.shared
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List {
                if viewModel.history.isEmpty {
                    Text(lang.localizedString("mood.noActiveMood"))
                        .foregroundColor(.secondary)
                } else {
                    ForEach(viewModel.history) { entry in
                        HStack(spacing: 12) {
                            Circle()
                                .fill(moodColor(entry.mood))
                                .frame(width: 10, height: 10)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(lang.localizedString("mood.\(entry.mood.lowercased())"))
                                    .font(.subheadline.weight(.medium))
                                Text(entry.selectedAt)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            Spacer()

                            if entry.isActive {
                                Text(lang.localizedString("mood.currentlyActive"))
                                    .font(.caption2.weight(.medium))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.green.opacity(0.15))
                                    .foregroundColor(.green)
                                    .cornerRadius(6)
                            }
                        }
                    }
                }
            }
            .navigationTitle(lang.localizedString("mood.viewHistory"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(lang.localizedString("common.close")) { dismiss() }
                }
            }
            .task { await viewModel.loadHistory() }
        }
    }

    private func moodColor(_ mood: String) -> Color {
        switch mood {
        case "NOSTALGIC": return .orange
        case "ADVENTUROUS": return .green
        case "HEARTBROKEN": return .pink
        case "HYPE": return .orange
        case "CHILL": return .blue
        case "ROMANTIC": return .pink
        case "MYSTERIOUS": return .purple
        case "INSPIRED": return .yellow
        case "MELANCHOLIC": return .gray
        case "COZY": return .brown
        default: return .gray
        }
    }
}
