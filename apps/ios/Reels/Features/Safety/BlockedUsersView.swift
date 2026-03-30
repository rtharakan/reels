import SwiftUI

struct BlockedUsersView: View {
    @State private var blockedUsers: [BlockedUser] = []
    @State private var isLoading = true

    private let api = APIClient.shared

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else if blockedUsers.isEmpty {
                ContentUnavailableView(
                    "No Blocked Users",
                    systemImage: "person.slash",
                    description: Text("People you block will appear here.")
                )
            } else {
                List {
                    ForEach(blockedUsers, id: \.userId) { user in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(user.name)
                                    .font(.body)
                                Text("Blocked \(user.blockedAt, style: .date)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }

                            Spacer()

                            Button("Unblock") {
                                Task { await unblock(userId: user.userId) }
                            }
                            .buttonStyle(.bordered)
                            .tint(ReelsColor.accent)
                        }
                    }
                }
            }
        }
        .navigationTitle("Blocked Users")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadBlockedUsers() }
    }

    private func loadBlockedUsers() async {
        do {
            struct Response: Codable { let users: [BlockedUser] }
            let result: Response = try await api.query("safety.blockedUsers")
            blockedUsers = result.users
        } catch {}
        isLoading = false
    }

    private func unblock(userId: String) async {
        struct Input: Codable { let userId: String }
        do {
            struct EmptyResult: Codable {}
            let _: EmptyResult = try await api.mutate("safety.unblock", input: Input(userId: userId))
            blockedUsers.removeAll { $0.userId == userId }
        } catch {}
    }
}
