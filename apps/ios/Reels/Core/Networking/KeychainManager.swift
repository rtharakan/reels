import Foundation
import Security

/// Manages secure storage of authentication tokens in the iOS Keychain.
final class KeychainManager {
    static let shared = KeychainManager()
    private let service = "com.reels.app"

    private init() {}

    // MARK: - Bearer Token

    func saveBearerToken(_ token: String) {
        save(key: "bearer_token", value: token)
    }

    func getBearerToken() -> String? {
        load(key: "bearer_token")
    }

    func deleteBearerToken() {
        delete(key: "bearer_token")
    }

    // MARK: - Refresh Token

    func saveRefreshToken(_ token: String) {
        save(key: "refresh_token", value: token)
    }

    func getRefreshToken() -> String? {
        load(key: "refresh_token")
    }

    func deleteRefreshToken() {
        delete(key: "refresh_token")
    }

    // MARK: - Clear All

    func clearAll() {
        deleteBearerToken()
        deleteRefreshToken()
    }

    // MARK: - Private Helpers

    private func save(key: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]

        // Delete existing item first
        SecItemDelete(query as CFDictionary)

        var newItem = query
        newItem[kSecValueData as String] = data
        newItem[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly

        SecItemAdd(newItem as CFDictionary, nil)
    }

    private func load(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }

        return String(data: data, encoding: .utf8)
    }

    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]

        SecItemDelete(query as CFDictionary)
    }
}
