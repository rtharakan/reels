import SwiftUI

struct MessagingView: View {

    let match: Match
    @StateObject private var viewModel: MessagingViewModel

    init(match: Match) {
        self.match = match
        _viewModel = StateObject(wrappedValue: MessagingViewModel(matchId: match.id))
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.messages) { message in
                            MessageBubble(message: message, isCurrentUser: viewModel.isCurrentUser(message))
                                .id(message.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: viewModel.messages.count) { _, _ in
                    if let last = viewModel.messages.last {
                        proxy.scrollTo(last.id, anchor: .bottom)
                    }
                }
            }

            Divider()

            HStack(spacing: 12) {
                TextField("Message...", text: $viewModel.draft, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...4)

                Button {
                    viewModel.send()
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                }
                .disabled(viewModel.draft.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding()
        }
        .navigationTitle("Chat")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.startListening()
        }
    }
}

// MARK: - Message Bubble

private struct MessageBubble: View {

    let message: Message
    let isCurrentUser: Bool

    var body: some View {
        HStack {
            if isCurrentUser { Spacer() }
            Text(message.content)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(isCurrentUser ? Color.accentColor : Color(.secondarySystemBackground))
                .foregroundStyle(isCurrentUser ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 18))
            if !isCurrentUser { Spacer() }
        }
    }
}
