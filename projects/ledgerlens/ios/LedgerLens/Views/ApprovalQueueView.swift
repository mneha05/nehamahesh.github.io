import SwiftUI

struct ApprovalQueueView: View {
    @Environment(ApprovalViewModel.self) private var model

    var body: some View {
        List {
            ForEach(model.requests) { request in
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(request.merchant).font(.headline)
                            Text(request.purpose).font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(request.amount.formatted(.currency(code: "USD"))).bold()
                    }
                    Text("Requested by \(request.requester) · \(request.team)")
                        .font(.caption).foregroundStyle(.secondary)
                    Label(request.policyMessage,
                          systemImage: request.risk == .normal ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                        .font(.caption.bold())
                        .foregroundStyle(request.risk == .normal ? .green : .orange)
                    HStack {
                        Button("Deny", role: .destructive) {
                            Task { await model.decide(request, approved: false) }
                        }
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)

                        Button("Approve") {
                            Task { await model.decide(request, approved: true) }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.black)
                        .frame(maxWidth: .infinity)
                    }
                    .disabled(model.workingIDs.contains(request.id))
                }
                .padding(.vertical, 8)
            }
        }
        .overlay {
            if model.requests.isEmpty {
                ContentUnavailableView(
                    "All caught up",
                    systemImage: "checkmark.seal",
                    description: Text("There are no spend requests waiting for review.")
                )
            }
        }
        .navigationTitle("Approvals")
    }
}
