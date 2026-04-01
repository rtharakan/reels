import SwiftUI

/// Visual grid of 10 mood options with colour backgrounds and emojis.
struct MoodSelectorView: View {
    let selectedMood: MoodType?
    let isLoading: Bool
    let onSelect: (MoodType) -> Void

    @ObservedObject private var lang = LanguageManager.shared

    private let columns = [
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(lang.localizedString("mood.selectMood"))
                .font(.subheadline.weight(.medium))

            LazyVGrid(columns: columns, spacing: 8) {
                ForEach(MoodType.allCases, id: \.self) { mood in
                    moodCell(mood)
                }
            }
        }
    }

    private func moodCell(_ mood: MoodType) -> some View {
        let isSelected = selectedMood == mood

        return Button {
            if !isLoading { onSelect(mood) }
        } label: {
            VStack(spacing: 4) {
                Text(mood.emoji)
                    .font(.title2)
                Text(lang.localizedString(mood.localizedKey))
                    .font(.system(size: 9, weight: .semibold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 72)
            .background(moodColor(mood).opacity(isSelected ? 0.3 : 0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
            )
            .scaleEffect(isSelected ? 1.05 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: isSelected)
        }
        .disabled(isLoading)
        .opacity(isLoading ? 0.6 : 1.0)
        .accessibilityLabel(lang.localizedString(mood.localizedKey))
    }

    private func moodColor(_ mood: MoodType) -> Color {
        switch mood {
        case .nostalgic: return .orange
        case .adventurous: return .green
        case .heartbroken: return .pink
        case .hype: return .orange
        case .chill: return .blue
        case .romantic: return .pink
        case .mysterious: return .purple
        case .inspired: return .yellow
        case .melancholic: return .gray
        case .cozy: return .brown
        }
    }
}
