import XCTest
@testable import Reel

final class MatchingEngineTests: XCTestCase {

    private let sut = MatchingEngine()

    // MARK: - sharedFilms

    func testSharedFilms_returnsCommonFilms() {
        let film1 = Film(id: "1", title: "Mulholland Drive", year: 2001, posterURL: nil, genres: ["Mystery", "Drama"])
        let film2 = Film(id: "2", title: "Certified Copy", year: 2010, posterURL: nil, genres: ["Drama", "Romance"])
        let film3 = Film(id: "3", title: "Portrait of a Lady on Fire", year: 2019, posterURL: nil, genres: ["Drama", "Romance"])

        let watchlistA = [film1, film2]
        let watchlistB = [film2, film3]

        let shared = sut.sharedFilms(watchlistA, watchlistB)
        XCTAssertEqual(shared, [film2])
    }

    func testSharedFilms_returnsEmptyWhenNoOverlap() {
        let film1 = Film(id: "1", title: "Film A", year: 2000, posterURL: nil, genres: [])
        let film2 = Film(id: "2", title: "Film B", year: 2001, posterURL: nil, genres: [])

        XCTAssertTrue(sut.sharedFilms([film1], [film2]).isEmpty)
    }

    // MARK: - score

    func testScore_isZeroForEmptyWatchlists() {
        let user = makeUser(watchlist: [])
        XCTAssertEqual(sut.score(userA: user, userB: user), 0)
    }

    func testScore_isOneForIdenticalWatchlistsAndGenres() {
        let film = Film(id: "1", title: "Jeanne Dielman", year: 1975, posterURL: nil, genres: ["Drama"])
        let user = makeUser(watchlist: [film])
        let result = sut.score(userA: user, userB: user)
        XCTAssertEqual(result, 1.0, accuracy: 0.001)
    }

    func testScore_isBetweenZeroAndOneForPartialOverlap() {
        let shared = Film(id: "1", title: "Shared", year: 2000, posterURL: nil, genres: ["Drama"])
        let exclusive = Film(id: "2", title: "Exclusive", year: 2001, posterURL: nil, genres: ["Comedy"])

        let userA = makeUser(watchlist: [shared, exclusive])
        let userB = makeUser(watchlist: [shared])

        let result = sut.score(userA: userA, userB: userB)
        XCTAssertGreaterThan(result, 0)
        XCTAssertLessThanOrEqual(result, 1)
    }

    func testScore_higherForMoreGenreOverlap() {
        let filmAB = Film(id: "1", title: "Drama Film", year: 2000, posterURL: nil, genres: ["Drama"])
        let filmAOnly = Film(id: "2", title: "Comedy Film", year: 2001, posterURL: nil, genres: ["Comedy"])

        let genreMatchUser = makeUser(watchlist: [filmAB, filmAOnly])
        let genreMismatchUser = makeUser(watchlist: [
            Film(id: "3", title: "Sci-Fi Film", year: 2002, posterURL: nil, genres: ["Sci-Fi"])
        ])
        let sharedUser = makeUser(watchlist: [filmAB])

        let scoreWithMatch = sut.score(userA: genreMatchUser, userB: sharedUser)
        let scoreWithMismatch = sut.score(userA: genreMismatchUser, userB: sharedUser)

        XCTAssertGreaterThan(scoreWithMatch, scoreWithMismatch)
    }

    // MARK: - Helpers

    private func makeUser(watchlist: [Film]) -> User {
        User(
            id: UUID().uuidString,
            name: "Test",
            age: 25,
            photos: [],
            prompts: [],
            letterboxdUsername: "testuser",
            watchlist: watchlist
        )
    }
}
