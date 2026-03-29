import Foundation

/// A chat message between two matched users.
struct Message: Identifiable, Codable {
    let id: String
    let senderId: String
    let receiverId: String
    let content: String
    let timestamp: Date
}
