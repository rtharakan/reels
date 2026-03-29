import SwiftUI

/// A circular user avatar loaded from a remote URL.
struct Avatar: View {

    let url: URL?
    let size: CGFloat

    var body: some View {
        AsyncImage(url: url) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fill)
        } placeholder: {
            Image(systemName: "person.fill")
                .foregroundStyle(.secondary)
                .font(.system(size: size * 0.45))
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(.systemGray5))
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }
}
