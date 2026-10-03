import Foundation

struct DemoSpendService: SpendService {
    func transactions() async throws -> [Transaction] {
        try await Task.sleep(for: .milliseconds(220))
        return [
            .init(id: UUID(), merchant: "AWS", amount: 1284.20, date: .now, category: .cloud, receiptState: .attached, cardholder: "Neha Mahesh", policyNote: nil),
            .init(id: UUID(), merchant: "Figma", amount: 180, date: .now.addingTimeInterval(-86400), category: .software, receiptState: .notRequired, cardholder: "Maya Chen", policyNote: nil),
            .init(id: UUID(), merchant: "United", amount: 612.44, date: .now.addingTimeInterval(-172800), category: .travel, receiptState: .required, cardholder: "Alex Kim", policyNote: "Receipt required above $500"),
            .init(id: UUID(), merchant: "GitHub", amount: 96, date: .now.addingTimeInterval(-259200), category: .software, receiptState: .notRequired, cardholder: "Neha Mahesh", policyNote: nil),
            .init(id: UUID(), merchant: "Blue Bottle", amount: 18.72, date: .now.addingTimeInterval(-259200), category: .meals, receiptState: .required, cardholder: "Neha Mahesh", policyNote: nil)
        ]
    }

    func approvals() async throws -> [ApprovalRequest] {
        try await Task.sleep(for: .milliseconds(180))
        return [
            .init(id: UUID(), merchant: "Figma", purpose: "Team plan upgrade", requester: "Maya Chen", team: "Design", amount: 420, policyMessage: "Within software policy", risk: .normal),
            .init(id: UUID(), merchant: "United", purpose: "Customer onsite · NYC", requester: "Alex Kim", team: "Sales", amount: 812, policyMessage: "Fare is 18% over route median", risk: .elevated)
        ]
    }

    func summary() async throws -> SpendSummary {
        .init(monthSpend: 18420.62, budget: 27000, previousMonthSpend: 20885.10,
              categoryTotals: [.software: 7800, .travel: 4300, .cloud: 3900, .meals: 2420.62])
    }

    func decide(_ request: ApprovalRequest, approved: Bool) async throws {
        try await Task.sleep(for: .milliseconds(140))
    }
}
