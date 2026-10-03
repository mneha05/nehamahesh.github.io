import Foundation
import Observation

@MainActor
@Observable
final class ApprovalViewModel {
    private let service: any SpendService
    var requests: [ApprovalRequest] = []
    var workingIDs: Set<UUID> = []
    var errorMessage: String?

    init(service: any SpendService) { self.service = service }

    func refresh() async {
        do { requests = try await service.approvals() }
        catch { errorMessage = error.localizedDescription }
    }

    func decide(_ request: ApprovalRequest, approved: Bool) async {
        workingIDs.insert(request.id)
        defer { workingIDs.remove(request.id) }
        do {
            try await service.decide(request, approved: approved)
            requests.removeAll { $0.id == request.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
