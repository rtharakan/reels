import SwiftUI

// MARK: - Reels Color Palette
// Warm neutral palette matching the web app redesign.
// Terracotta accent, sage secondary, stone-based neutrals.

enum ReelsColor {
    // Accent
    static let accent = Color(red: 0.831, green: 0.522, blue: 0.416)       // #D4856A
    static let accentRing = Color(red: 0.910, green: 0.573, blue: 0.486)   // #E8927C
    static let accentSoft = Color(red: 0.831, green: 0.522, blue: 0.416, opacity: 0.10)

    // Secondary (sage)
    static let sage = Color(red: 0.639, green: 0.694, blue: 0.541)        // #A3B18A
    static let sageSoft = Color(red: 0.639, green: 0.694, blue: 0.541, opacity: 0.15)

    // Adaptive colors for light/dark mode
    static let bgPrimary = Color("bgPrimary", bundle: nil)
    static let bgCard = Color("bgCard", bundle: nil)
    static let bgAccent = Color("bgAccent", bundle: nil)
    static let textPrimary = Color("textPrimary", bundle: nil)
    static let textSecondary = Color("textSecondary", bundle: nil)
    static let textMuted = Color("textMuted", bundle: nil)
    static let border = Color("borderDefault", bundle: nil)

    // Fallback adaptive colors (when asset catalog colors not available)
    static var bgPrimaryFallback: Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 0.110, green: 0.098, blue: 0.090, alpha: 1)  // #1C1917
                : UIColor(red: 0.980, green: 0.980, blue: 0.976, alpha: 1)  // #FAFAF9
        })
    }

    static var bgCardFallback: Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 0.161, green: 0.145, blue: 0.141, alpha: 1)  // #292524
                : UIColor(red: 1, green: 1, blue: 1, alpha: 1)              // #FFFFFF
        })
    }

    static var bgAccentFallback: Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 0.173, green: 0.161, blue: 0.153, alpha: 1)  // #2C2926
                : UIColor(red: 0.961, green: 0.957, blue: 0.953, alpha: 1)  // #F5F5F4
        })
    }

    static var textPrimaryFallback: Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 0.980, green: 0.980, blue: 0.976, alpha: 1)  // #FAFAF9
                : UIColor(red: 0.110, green: 0.098, blue: 0.090, alpha: 1)  // #1C1917
        })
    }

    static var textSecondaryFallback: Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 0.839, green: 0.827, blue: 0.820, alpha: 1)  // #D6D3D1
                : UIColor(red: 0.341, green: 0.325, blue: 0.306, alpha: 1)  // #57534E
        })
    }

    static var textMutedFallback: Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 0.471, green: 0.443, blue: 0.424, alpha: 1)  // #78716C
                : UIColor(red: 0.659, green: 0.635, blue: 0.624, alpha: 1)  // #A8A29E
        })
    }

    static var borderFallback: Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 0.267, green: 0.251, blue: 0.235, alpha: 1)  // #44403C
                : UIColor(red: 0.906, green: 0.898, blue: 0.894, alpha: 1)  // #E7E5E4
        })
    }
}

// MARK: - Convenience modifiers

extension View {
    func reelsCard() -> some View {
        self
            .padding(16)
            .background(ReelsColor.bgCardFallback)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(ReelsColor.borderFallback, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    func reelsTextField() -> some View {
        self
            .padding(12)
            .background(ReelsColor.bgCardFallback)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(ReelsColor.borderFallback, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    func reelsAccentButton() -> some View {
        self
            .fontWeight(.semibold)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(ReelsColor.accent)
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    func reelsOutlineButton() -> some View {
        self
            .foregroundStyle(ReelsColor.textSecondaryFallback)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(ReelsColor.borderFallback, lineWidth: 1)
            )
    }
}

// MARK: - Score labels (matching web)

struct ScoreLabel {
    let text: String
    let emoji: String

    static func from(score: Double) -> ScoreLabel {
        if score >= 0.5 { return ScoreLabel(text: "Soul Mates", emoji: "💕") }
        if score >= 0.3 { return ScoreLabel(text: "Great Match", emoji: "🎬") }
        if score >= 0.15 { return ScoreLabel(text: "Good Vibes", emoji: "✨") }
        if score >= 0.05 { return ScoreLabel(text: "Film Friends", emoji: "🎞️") }
        return ScoreLabel(text: "Opposites Attract?", emoji: "🌙")
    }
}
