import SwiftUI

struct ReceiptCaptureView: View {
    let transaction: Transaction
    let onAttach: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var scanning = true

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color(.secondarySystemBackground))
                    .frame(height: 330)
                    .overlay {
                        VStack(spacing: 12) {
                            Image(systemName: scanning ? "viewfinder" : "checkmark.seal.fill")
                                .font(.system(size: 56))
                                .foregroundStyle(scanning ? .primary : .green)
                            Text(scanning ? "Scanning receipt…" : "Receipt matched")
                                .font(.title3.bold())
                            Text(transaction.merchant + " · " + transaction.formattedAmount)
                                .foregroundStyle(.secondary)
                        }
                    }
                if !scanning {
                    Text("Merchant, amount, and purchase date matched with high confidence.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                Spacer()
                Button("Attach receipt") {
                    onAttach()
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(.black)
                .controlSize(.large)
                .disabled(scanning)
            }
            .padding()
            .navigationTitle("Receipt")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                try? await Task.sleep(for: .milliseconds(900))
                withAnimation { scanning = false }
            }
        }
    }
}
