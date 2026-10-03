import XCTest
@testable import LedgerLens

final class DashboardViewModelTests: XCTestCase {
    @MainActor
    func testRefreshLoadsTransactionsAndSummary() async {
        let sut = DashboardViewModel(service: DemoSpendService())
        await sut.refresh()
        XCTAssertEqual(sut.state, .loaded)
        XCTAssertEqual(sut.transactions.count, 5)
        XCTAssertEqual(sut.summary?.budget, 27000)
    }

    @MainActor
    func testAttachReceiptMutatesOnlySelectedTransaction() async {
        let sut = DashboardViewModel(service: DemoSpendService())
        await sut.refresh()
        let target = try! XCTUnwrap(sut.transactions.first(where: { $0.receiptState == .required }))
        sut.attachReceipt(to: target)
        XCTAssertEqual(
            sut.transactions.first(where: { $0.id == target.id })?.receiptState,
            .attached
        )
    }
}
