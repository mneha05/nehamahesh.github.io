import Foundation

protocol SpendService: Sendable {
    func transactions() async throws -> [Transaction]
    func approvals() async throws -> [ApprovalRequest]
    func summary() async throws -> SpendSummary
    func decide(_ request: ApprovalRequest, approved: Bool) async throws
}

enum SpendServiceError: LocalizedError {
    case invalidResponse
    var errorDescription: String? { "The spend service returned an invalid response." }
}

struct NetworkSpendService: SpendService {
    let baseURL: URL
    let session: URLSession

    init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    func transactions() async throws -> [Transaction] { try await get("transactions") }
    func approvals() async throws -> [ApprovalRequest] { try await get("approvals") }
    func summary() async throws -> SpendSummary { try await get("summary") }

    func decide(_ request: ApprovalRequest, approved: Bool) async throws {
        var urlRequest = URLRequest(url: baseURL.appending(path: "approvals/\(request.id.uuidString)"))
        urlRequest.httpMethod = "PATCH"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(["status": approved ? "approved" : "denied"])
        let (_, response) = try await session.data(for: urlRequest)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else { throw SpendServiceError.invalidResponse }
    }

    private func get<T: Decodable>(_ path: String) async throws -> T {
        let (data, response) = try await session.data(from: baseURL.appending(path: path))
        guard (response as? HTTPURLResponse)?.statusCode == 200 else { throw SpendServiceError.invalidResponse }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(T.self, from: data)
    }
}
