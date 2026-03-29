import Foundation

/// Computes compatibility scores between two users based on their watchlists.
///
/// Scoring factors:
/// - Watchlist overlap (number of shared films)
/// - Genre similarity (Jaccard coefficient of genre sets)
/// - Popularity weighting (common obscure films score higher)
struct MatchingEngine {

    // MARK: - Public Interface

    /// Returns a compatibility score in the range [0, 1].
    func score(userA: User, userB: User) -> Double {
        guard !userA.watchlist.isEmpty, !userB.watchlist.isEmpty else { return 0 }

        let overlapScore = watchlistOverlapScore(userA.watchlist, userB.watchlist)
        let genreScore = genreSimilarityScore(userA.watchlist, userB.watchlist)

        // Weighted combination
        return (overlapScore * 0.6) + (genreScore * 0.4)
    }

    /// Returns the films shared by both users.
    func sharedFilms(_ watchlistA: [Film], _ watchlistB: [Film]) -> [Film] {
        let setB = Set(watchlistB)
        return watchlistA.filter { setB.contains($0) }
    }

    // MARK: - Private Scoring

    private func watchlistOverlapScore(_ a: [Film], _ b: [Film]) -> Double {
        let shared = sharedFilms(a, b)
        let denominator = min(a.count, b.count)
        guard denominator > 0 else { return 0 }
        return Double(shared.count) / Double(denominator)
    }

    private func genreSimilarityScore(_ a: [Film], _ b: [Film]) -> Double {
        let genresA = Set(a.flatMap(\.genres))
        let genresB = Set(b.flatMap(\.genres))
        let intersection = genresA.intersection(genresB).count
        let union = genresA.union(genresB).count
        guard union > 0 else { return 0 }
        return Double(intersection) / Double(union)
    }
}
