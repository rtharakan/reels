import Foundation

/// Fetches and normalises a user's public Letterboxd watchlist.
///
/// Letterboxd does not provide an official public API. This service uses the
/// publicly accessible RSS feeds that Letterboxd exposes for every user's
/// watchlist, and parses them into native `Film` values.
actor LetterboxdService {

    private let baseURL: URL
    private let client: NetworkClient

    init(baseURL: URL = URL(string: "https://letterboxd.com")!, client: NetworkClient = NetworkClient()) {
        self.baseURL = baseURL
        self.client = client
    }

    /// Fetches the watchlist RSS feed for the given username and returns parsed films.
    func fetchWatchlist(username: String) async throws -> [Film] {
        let feedURL = baseURL.appendingPathComponent("\(username)/watchlist/rss/")
        let feed: LetterboxdFeed = try await client.get(feedURL)
        return feed.items.map(\.film)
    }
}

// MARK: - Feed DTOs

private struct LetterboxdFeed: Decodable {
    let items: [FeedItem]
}

private struct FeedItem: Decodable {
    let id: String
    let title: String
    let year: Int
    let posterURL: URL?
    let genres: [String]

    var film: Film {
        Film(id: id, title: title, year: year, posterURL: posterURL, genres: genres)
    }
}
