import Foundation

/// Generic HTTP client used by all API services.
actor NetworkClient {

    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func get<T: Decodable>(_ url: URL) async throws -> T {
        let (data, response) = try await session.data(from: url)
        try validate(response)
        return try JSONDecoder().decode(T.self, from: data)
    }

    // MARK: - Private

    private func validate(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            throw NetworkError.httpError(statusCode: http.statusCode)
        }
    }
}

// MARK: - Errors

enum NetworkError: Error, LocalizedError {
    case invalidResponse
    case httpError(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Received an invalid server response."
        case .httpError(let code):
            return "HTTP error: \(code)."
        }
    }
}
