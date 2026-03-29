import Foundation

/// A mutual match between two users.
struct Match: Identifiable, Codable {
    let id: String
    let userA: String
    let userB: String
    let compatibilityScore: Double
    let timestamp: Date
    let sharedFilms: [Film]
}
