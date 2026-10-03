import SwiftUI
import Charts

struct InsightsView: View {
    @Environment(DashboardViewModel.self) private var model
    private let trend = [11.2, 12.1, 10.9, 14.4, 13.1, 15.8, 14.2, 17.0, 15.7, 18.4, 16.2, 18.42]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("THIS MONTH").font(.caption2.bold()).foregroundStyle(.secondary)
                    Text(changeText)
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundStyle(.green)
                    Text("vs. September").foregroundStyle(.secondary)
                }
                Chart(Array(trend.enumerated()), id: \.offset) { index, value in
                    BarMark(x: .value("Week", index), y: .value("Spend", value))
                        .cornerRadius(4)
                }
                .frame(height: 220)

                if let totals = model.summary?.categoryTotals {
                    ForEach(Transaction.Category.allCases, id: \.self) { category in
                        HStack {
                            Text(category.rawValue.capitalized)
                            Spacer()
                            Text((totals[category] ?? 0).formatted(.currency(code: "USD"))).bold()
                        }
                        Divider()
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Insights")
    }

    private var changeText: String {
        guard let s = model.summary else { return "—" }
        let current = NSDecimalNumber(decimal: s.monthSpend).doubleValue
        let previous = NSDecimalNumber(decimal: s.previousMonthSpend).doubleValue
        return ((current - previous) / previous).formatted(.percent.precision(.fractionLength(1)))
    }
}
