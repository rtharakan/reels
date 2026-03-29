import Foundation

/// A film from a user's Letterboxd watchlist.
struct Film: Identifiable, Codable, Hashable {
    let id: String
    let title: String
    let year: Int
    let posterURL: URL?
    let genres: [String]

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: Film, rhs: Film) -> Bool {
        lhs.id == rhs.id
    }
}
