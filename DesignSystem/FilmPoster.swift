import SwiftUI

/// A film poster thumbnail with title and year label.
struct FilmPoster: View {

    let film: Film
    var width: CGFloat = 90
    var height: CGFloat = 135

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            AsyncImage(url: film.posterURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .foregroundStyle(Color(.systemGray4))
                    .overlay {
                        Image(systemName: "film")
                            .foregroundStyle(.secondary)
                    }
            }
            .frame(width: width, height: height)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            Text(film.title)
                .font(.caption.weight(.medium))
                .lineLimit(1)
                .frame(width: width, alignment: .leading)

            Text(String(film.year))
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }
}
