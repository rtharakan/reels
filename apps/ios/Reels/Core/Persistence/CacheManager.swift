import Foundation

actor CacheManager {
    static let shared = CacheManager()
    private let cacheDirectory: URL

    private init() {
        let paths = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)
        cacheDirectory = paths[0].appendingPathComponent("ReelsCache", isDirectory: true)
        try? FileManager.default.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }

    func store<T: Encodable>(_ value: T, forKey key: String) throws {
        let url = cacheDirectory.appendingPathComponent(key.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? key)
        let data = try JSONEncoder().encode(value)
        try data.write(to: url)
    }

    func load<T: Decodable>(_ type: T.Type, forKey key: String) throws -> T {
        let url = cacheDirectory.appendingPathComponent(key.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? key)
        let data = try Data(contentsOf: url)
        return try JSONDecoder().decode(type, from: data)
    }

    func remove(forKey key: String) {
        let url = cacheDirectory.appendingPathComponent(key.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? key)
        try? FileManager.default.removeItem(at: url)
    }

    func clearAll() {
        try? FileManager.default.removeItem(at: cacheDirectory)
        try? FileManager.default.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }
}
