import Foundation

/// App configuration constants.
enum Configuration {
    /// Base URL for the Reels API.
    ///
    /// - DEBUG: points to your local Next.js dev server (http://localhost:3000)
    /// - RELEASE: points to your Vercel deployment.
    ///   ⚠️  Replace "YOUR-APP.vercel.app" with your actual Vercel deployment URL
    ///       (or custom domain) before shipping to TestFlight / App Store.
    static let apiBaseURL: String = {
        #if DEBUG
        return "http://localhost:3000"
        #else
        return "https://YOUR-APP.vercel.app"
        #endif
    }()

    /// TMDB image base URL for poster display.
    static let tmdbImageBase = "https://image.tmdb.org/t/p/"

    /// Poster sizes used throughout the app.
    enum PosterSize: String {
        case small = "w185"
        case medium = "w342"
        case large = "w500"
    }

    /// Returns a full TMDB poster URL for a given path.
    static func posterURL(path: String?, size: PosterSize = .medium) -> URL? {
        guard let path = path else { return nil }
        return URL(string: "\(tmdbImageBase)\(size.rawValue)\(path)")
    }
}
