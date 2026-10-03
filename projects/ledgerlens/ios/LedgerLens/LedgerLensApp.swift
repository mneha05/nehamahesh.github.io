import SwiftUI

@main
struct LedgerLensApp: App {
    @State private var dashboard = DashboardViewModel(service: DemoSpendService())
    @State private var approvals = ApprovalViewModel(service: DemoSpendService())

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(dashboard)
                .environment(approvals)
        }
    }
}
