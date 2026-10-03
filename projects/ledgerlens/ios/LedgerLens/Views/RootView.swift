import SwiftUI

struct RootView: View {
    @Environment(DashboardViewModel.self) private var dashboard
    @Environment(ApprovalViewModel.self) private var approvals

    var body: some View {
        TabView {
            NavigationStack { DashboardView() }
                .tabItem { Label("Home", systemImage: "house.fill") }
            NavigationStack { ApprovalQueueView() }
                .tabItem { Label("Approvals", systemImage: "checkmark.circle") }
                .badge(approvals.requests.count)
            NavigationStack { InsightsView() }
                .tabItem { Label("Insights", systemImage: "chart.bar.xaxis") }
        }
        .tint(.black)
        .task {
            async let d: Void = dashboard.refresh()
            async let a: Void = approvals.refresh()
            _ = await (d, a)
        }
    }
}
