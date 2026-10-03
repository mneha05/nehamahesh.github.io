import SwiftUI

struct DashboardView: View {
    @Environment(DashboardViewModel.self) private var model
    @State private var receiptTarget: Transaction?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header
                if let summary = model.summary { BudgetCard(summary: summary) }
                Text("Recent activity").font(.headline)
                LazyVStack(spacing: 0) {
                    ForEach(model.transactions) { transaction in
                        Button { receiptTarget = transaction } label: { TransactionRow(transaction: transaction) }
                            .buttonStyle(.plain)
                        Divider()
                    }
                }
            }.padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("LedgerLens")
        .refreshable { await model.refresh() }
        .sheet(item: $receiptTarget) { tx in ReceiptCaptureView(transaction: tx) { model.attachReceipt(to: tx) } }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("OCTOBER SPEND").font(.caption2.bold()).foregroundStyle(.secondary)
            Text(model.summary?.monthSpend.formatted(.currency(code: "USD")) ?? "—")
                .font(.system(size: 38, weight: .bold, design: .rounded))
        }
    }
}

private struct BudgetCard: View {
    let summary: SpendSummary
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack { Text("Engineering budget"); Spacer(); Text(summary.budgetFraction, format: .percent.precision(.fractionLength(0))).bold() }
            ProgressView(value: summary.budgetFraction).tint(Color(red: 0.72, green: 0.9, blue: 0.25))
            HStack { Text((summary.budget - summary.monthSpend).formatted(.currency(code: "USD")) + " remaining"); Spacer(); Text(summary.budget.formatted(.currency(code: "USD"))) }
                .font(.caption).foregroundStyle(.secondary)
        }
        .padding().background(.black).foregroundStyle(.white).clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

private struct TransactionRow: View {
    let transaction: Transaction
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon).frame(width: 38, height: 38).background(.white).clipShape(RoundedRectangle(cornerRadius: 11)).shadow(color: .black.opacity(.05), radius: 5, y: 2)
            VStack(alignment: .leading, spacing: 3) { Text(transaction.merchant).font(.subheadline.bold()); Text(transaction.category.rawValue.capitalized).font(.caption).foregroundStyle(.secondary) }
            Spacer()
            VStack(alignment: .trailing, spacing: 3) { Text(transaction.formattedAmount).font(.subheadline.bold()); if transaction.receiptState == .required { Text("Needs receipt").font(.caption2).foregroundStyle(.orange) } }
        }.padding(.vertical, 10)
    }
    private var icon: String { switch transaction.category { case .software: "app.fill"; case .travel: "airplane"; case .cloud: "cloud.fill"; case .meals: "cup.and.saucer.fill" } }
}
