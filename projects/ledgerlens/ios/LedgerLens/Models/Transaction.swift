import Foundation

struct Transaction: Identifiable, Codable, Hashable {
    enum Category: String, Codable, CaseIterable { case software, travel, cloud, meals }
    enum ReceiptState: String, Codable { case attached, required, notRequired }

    let id: UUID
    let merchant: String
    let amount: Decimal
    let date: Date
    let category: Category
    var receiptState: ReceiptState
    let cardholder: String
    let policyNote: String?

    var formattedAmount: String { amount.formatted(.currency(code: "USD")) }
}

struct ApprovalRequest: Identifiable, Codable, Hashable {
    enum Risk: String, Codable { case normal, elevated }
    let id: UUID
    let merchant: String
    let purpose: String
    let requester: String
    let team: String
    let amount: Decimal
    let policyMessage: String
    let risk: Risk
}

struct SpendSummary: Codable, Hashable {
    let monthSpend: Decimal
    let budget: Decimal
    let previousMonthSpend: Decimal
    let categoryTotals: [Transaction.Category: Decimal]

    var budgetFraction: Double {
        let spend = NSDecimalNumber(decimal: monthSpend).doubleValue
        let total = NSDecimalNumber(decimal: budget).doubleValue
        return total == 0 ? 0 : min(spend / total, 1)
    }
}
