import SwiftUI

/// A pill-shaped label used for genres or film tags.
struct Tag: View {

    let text: String
    var color: Color = Color(.secondarySystemBackground)

    var body: some View {
        Text(text)
            .font(.caption.weight(.medium))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(color)
            .foregroundStyle(.primary)
            .clipShape(Capsule())
    }
}
