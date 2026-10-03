import Foundation
import Observation

@MainActor
@Observable
final class DashboardViewModel {
    enum State: Equatable { case idle, loading, loaded, failed(String) }

    private let service: any SpendService
    var state: State = .idle
    var transactions: [Transaction] = []
    var summary: SpendSummary?

    init(service: any SpendService) { self.service = service }

    func refresh() async {
        state = .loading
        do {
            async let transactions = service.transactions()
            async let summary = service.summary()
            self.transactions = try await transactions
            self.summary = try await summary
            state = .loaded
        } catch {
            state = .failed(error.localizedDescription)
        }
    }

    func attachReceipt(to transaction: Transaction) {
        guard let index = transactions.firstIndex(where: { $0.id == transaction.id }) else { return }
        transactions[index].receiptState = .attached
    }
}
