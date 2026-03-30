import SwiftUI

final class LanguageManager: ObservableObject {
    static let shared = LanguageManager()

    @AppStorage("reels-locale") var locale: String = "en" {
        didSet { objectWillChange.send() }
    }

    var isEnglish: Bool { locale == "en" }
    var isDutch: Bool { locale == "nl" }

    func toggle() {
        locale = isEnglish ? "nl" : "en"
    }

    func localizedString(_ key: String) -> String {
        guard let bundlePath = Bundle.main.path(forResource: locale, ofType: "lproj"),
              let bundle = Bundle(path: bundlePath) else {
            return NSLocalizedString(key, comment: "")
        }
        return bundle.localizedString(forKey: key, value: nil, table: nil)
    }
}

// SwiftUI view modifier for language toggle
struct LanguageToggleButton: View {
    @ObservedObject var lang = LanguageManager.shared

    var body: some View {
        Button {
            lang.toggle()
        } label: {
            HStack(spacing: 4) {
                Image(systemName: "globe")
                Text(lang.isEnglish ? "EN" : "NL")
                    .font(.caption)
                    .fontWeight(.semibold)
            }
            .foregroundStyle(.secondary)
        }
    }
}
