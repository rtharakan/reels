import Foundation

/// API client for communicating with the Reels tRPC backend.
/// Handles request encoding in tRPC wire format and bearer token injection.
final class APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let baseURL: URL
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
        self.baseURL = URL(string: Configuration.apiBaseURL)!
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        self.encoder = JSONEncoder()
    }

    // MARK: - tRPC Query

    func query<T: Decodable>(_ procedure: String, input: Encodable? = nil) async throws -> T {
        var components = URLComponents(url: baseURL.appendingPathComponent("api/trpc/\(procedure)"), resolvingAgainstBaseURL: false)!

        if let input = input {
            let data = try encoder.encode(AnyEncodable(input))
            let json = String(data: data, encoding: .utf8) ?? "{}"
            components.queryItems = [URLQueryItem(name: "input", value: json)]
        }

        var request = URLRequest(url: components.url!)
        request.httpMethod = "GET"
        applyHeaders(&request)

        let (data, response) = try await session.data(for: request)
        try validateResponse(response)

        let envelope = try decoder.decode(TRPCResponse<T>.self, from: data)
        guard let result = envelope.result?.data else {
            throw APIError.emptyResponse
        }
        return result
    }

    // MARK: - tRPC Mutation

    func mutate<T: Decodable>(_ procedure: String, input: Encodable? = nil) async throws -> T {
        let url = baseURL.appendingPathComponent("api/trpc/\(procedure)")

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        applyHeaders(&request)

        if let input = input {
            request.httpBody = try encoder.encode(AnyEncodable(input))
        }

        let (data, response) = try await session.data(for: request)
        try validateResponse(response)

        let envelope = try decoder.decode(TRPCResponse<T>.self, from: data)
        guard let result = envelope.result?.data else {
            throw APIError.emptyResponse
        }
        return result
    }

    // MARK: - Helpers

    private func applyHeaders(_ request: inout URLRequest) {
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token = KeychainManager.shared.getBearerToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }

    private func validateResponse(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        switch http.statusCode {
        case 200...299:
            return
        case 401:
            throw APIError.unauthorized
        case 429:
            throw APIError.rateLimited
        default:
            throw APIError.serverError(statusCode: http.statusCode)
        }
    }
}

// MARK: - Supporting Types

struct TRPCResponse<T: Decodable>: Decodable {
    let result: TRPCResult<T>?

    struct TRPCResult<U: Decodable>: Decodable {
        let data: U?
    }
}

enum APIError: LocalizedError {
    case invalidResponse
    case emptyResponse
    case unauthorized
    case rateLimited
    case serverError(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Invalid server response."
        case .emptyResponse: return "Empty response from server."
        case .unauthorized: return "Session expired. Please sign in again."
        case .rateLimited: return "Too many requests. Please wait a moment."
        case .serverError(let code): return "Server error (\(code))."
        }
    }
}

/// Type-erased Encodable wrapper.
private struct AnyEncodable: Encodable {
    private let encode: (Encoder) throws -> Void

    init(_ wrapped: Encodable) {
        self.encode = wrapped.encode
    }

    func encode(to encoder: Encoder) throws {
        try encode(encoder)
    }
}
