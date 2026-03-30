import SwiftUI

/// Cinema Buddy – find someone to watch a film with.
struct BuddyView: View {
    @ObservedObject private var lang = LanguageManager.shared
    @State private var selectedTab: BuddyTab = .browse
    @State private var browseCity = "amsterdam"
    @State private var requests: [BuddyRequest] = []
    @State private var isLoading = true
    @State private var showChat = false
    @State private var chatRequestId: String?

    enum BuddyTab {
        case browse, create
    }

    private let cities = [
        ("amsterdam", "Amsterdam"), ("rotterdam", "Rotterdam"),
        ("den-haag", "Den Haag"), ("utrecht", "Utrecht"),
        ("eindhoven", "Eindhoven"), ("groningen", "Groningen"),
        ("haarlem", "Haarlem"), ("leiden", "Leiden"),
        ("nijmegen", "Nijmegen"), ("arnhem", "Arnhem"),
        ("maastricht", "Maastricht"), ("breda", "Breda"),
    ]

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab selector
                HStack(spacing: 8) {
                    tabButton(lang.localizedString("buddy.browse"), tab: .browse, icon: "person.2")
                    tabButton(lang.localizedString("buddy.create"), tab: .create, icon: "plus.circle")
                }
                .padding(.horizontal)
                .padding(.top, 8)

                if selectedTab == .browse {
                    browseView
                } else {
                    BuddyCreateView(cities: cities, onCreated: {
                        selectedTab = .browse
                        loadRequests()
                    })
                }
            }
            .navigationTitle(lang.localizedString("buddy.title"))
            .onAppear { loadRequests() }
            .sheet(isPresented: $showChat) {
                if let reqId = chatRequestId {
                    BuddyChatView(requestId: reqId, filmTitle: requests.first(where: { $0.id == reqId })?.filmTitle ?? "Chat")
                }
            }
        }
    }

    // MARK: - Browse

    private var browseView: some View {
        VStack(spacing: 0) {
            // City filter
            HStack {
                Image(systemName: "mappin")
                    .foregroundColor(ReelsColor.textMuted)
                    .font(.caption)
                Picker("City", selection: $browseCity) {
                    Text("All cities").tag("")
                    ForEach(cities, id: \.0) { slug, name in
                        Text(name).tag(slug)
                    }
                }
                .pickerStyle(.menu)
                .tint(ReelsColor.textSecondaryFallback)
                .onChange(of: browseCity) { _ in loadRequests() }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)

            if isLoading {
                Spacer()
                ProgressView()
                    .tint(ReelsColor.accent)
                Spacer()
            } else if requests.isEmpty {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "film")
                        .font(.largeTitle)
                        .foregroundColor(ReelsColor.textMuted)
                    Text(lang.localizedString("buddy.empty"))
                        .font(.subheadline)
                        .foregroundColor(ReelsColor.textMuted)
                }
                Spacer()
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(requests) { req in
                            buddyCard(req)
                        }
                    }
                    .padding()
                }
            }
        }
    }

    // MARK: - Card

    private func buddyCard(_ req: BuddyRequest) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 10) {
                // Poster
                if let url = req.posterUrl, let imgURL = URL(string: url) {
                    AsyncImage(url: imgURL) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(ReelsColor.bgAccentFallback)
                    }
                    .frame(width: 50, height: 75)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                } else {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(ReelsColor.bgAccentFallback)
                        .frame(width: 50, height: 75)
                        .overlay(
                            Image(systemName: "film")
                                .foregroundColor(ReelsColor.textMuted)
                        )
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(req.filmTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(ReelsColor.textPrimaryFallback)
                        .lineLimit(1)

                    HStack(spacing: 8) {
                        Label(formatDate(req.date), systemImage: "calendar")
                        Label(req.time, systemImage: "clock")
                    }
                    .font(.caption)
                    .foregroundColor(ReelsColor.textMuted)

                    Label(req.cinemaName, systemImage: "mappin")
                        .font(.caption)
                        .foregroundColor(ReelsColor.textMuted)

                    HStack(spacing: 4) {
                        Text(req.creator.name)
                            .font(.caption)
                            .foregroundColor(ReelsColor.textMuted)
                        Text("·")
                            .foregroundColor(ReelsColor.textMuted)
                        Text("\(req.interests.count)/\(req.maxBuddies) spots")
                            .font(.caption.weight(.medium))
                            .foregroundColor(req.isFull ? ReelsColor.accent : ReelsColor.textSecondaryFallback)
                    }
                }

                Spacer()
            }

            // Action buttons
            HStack(spacing: 8) {
                if let ticketUrl = req.ticketUrl, let url = URL(string: ticketUrl) {
                    Link(destination: url) {
                        Label("Tickets", systemImage: "ticket")
                            .font(.caption.weight(.medium))
                            .foregroundColor(ReelsColor.accent)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(ReelsColor.accentSoft)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }

                Spacer()

                if !req.isFull {
                    Button {
                        joinRequest(req.id)
                    } label: {
                        Text(lang.localizedString("buddy.join"))
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 6)
                            .background(ReelsColor.accent)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                } else {
                    Text(lang.localizedString("buddy.full"))
                        .font(.caption.weight(.medium))
                        .foregroundColor(ReelsColor.textMuted)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(ReelsColor.bgAccentFallback)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                if req.interests.count > 0 {
                    Button {
                        chatRequestId = req.id
                        showChat = true
                    } label: {
                        Image(systemName: "message")
                            .font(.caption)
                            .foregroundColor(ReelsColor.textSecondaryFallback)
                            .padding(6)
                            .background(ReelsColor.bgAccentFallback)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }
        }
        .padding(12)
        .background(ReelsColor.bgCardFallback)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(ReelsColor.borderFallback, lineWidth: 0.5)
        )
    }

    // MARK: - Helpers

    private func tabButton(_ title: String, tab: BuddyTab, icon: String) -> some View {
        Button {
            selectedTab = tab
        } label: {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.caption)
                Text(title)
                    .font(.subheadline.weight(.semibold))
            }
            .foregroundColor(selectedTab == tab ? .white : ReelsColor.textSecondaryFallback)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(selectedTab == tab ? ReelsColor.accent : ReelsColor.bgCardFallback)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                selectedTab == tab ? nil :
                RoundedRectangle(cornerRadius: 12)
                    .stroke(ReelsColor.borderFallback, lineWidth: 0.5)
            )
        }
    }

    private func formatDate(_ dateStr: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: dateStr) else { return dateStr }
        let display = DateFormatter()
        display.dateFormat = "EEE d MMM"
        return display.string(from: date)
    }

    // MARK: - API

    private func loadRequests() {
        isLoading = true
        let cityParam = browseCity.isEmpty ? "" : "&city=\(browseCity)"
        guard let url = URL(string: "\(Configuration.apiBaseURL)/api/buddy?\(cityParam)") else { return }

        URLSession.shared.dataTask(with: url) { data, _, _ in
            DispatchQueue.main.async {
                if let data = data,
                   let response = try? JSONDecoder().decode(BuddyRequestsResponse.self, from: data) {
                    self.requests = response.requests
                }
                self.isLoading = false
            }
        }.resume()
    }

    private func joinRequest(_ id: String) {
        guard let url = URL(string: "\(Configuration.apiBaseURL)/api/buddy/\(id)/interest") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = KeychainManager.shared.getBearerToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async { loadRequests() }
        }.resume()
    }
}

// MARK: - Create View

struct BuddyCreateView: View {
    let cities: [(String, String)]
    let onCreated: () -> Void

    @ObservedObject private var lang = LanguageManager.shared
    @State private var city = "amsterdam"
    @State private var date = ""
    @State private var films: [BuddyFilmOption] = []
    @State private var selectedFilm: BuddyFilmOption?
    @State private var selectedShow: BuddyShowOption?
    @State private var maxBuddies = 1
    @State private var isLoading = false
    @State private var isPosting = false
    @State private var availableDates: [String] = []

    private var nextDates: [String] {
        (0..<14).compactMap { i in
            let d = Calendar.current.date(byAdding: .day, value: i, to: Date())!
            let fmt = DateFormatter()
            fmt.dateFormat = "yyyy-MM-dd"
            return fmt.string(from: d)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Date
                VStack(alignment: .leading, spacing: 6) {
                    Label(lang.localizedString("buddy.selectDate"), systemImage: "calendar")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(ReelsColor.textPrimaryFallback)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 6) {
                            ForEach(availableDates.isEmpty ? nextDates : availableDates, id: \.self) { d in
                                Button {
                                    date = d
                                    selectedFilm = nil
                                    selectedShow = nil
                                    loadScreenings()
                                } label: {
                                    Text(formatDate(d))
                                        .font(.caption.weight(.medium))
                                        .foregroundColor(date == d ? .white : ReelsColor.textSecondaryFallback)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 8)
                                        .background(date == d ? ReelsColor.accent : ReelsColor.bgCardFallback)
                                        .clipShape(RoundedRectangle(cornerRadius: 10))
                                        .overlay(
                                            date == d ? nil :
                                            RoundedRectangle(cornerRadius: 10)
                                                .stroke(ReelsColor.borderFallback, lineWidth: 0.5)
                                        )
                                }
                            }
                        }
                    }
                }

                // City
                VStack(alignment: .leading, spacing: 6) {
                    Label(lang.localizedString("buddy.selectCity"), systemImage: "mappin")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(ReelsColor.textPrimaryFallback)

                    Picker("City", selection: $city) {
                        ForEach(cities, id: \.0) { slug, name in
                            Text(name).tag(slug)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(ReelsColor.accent)
                    .onChange(of: city) { _ in
                        selectedFilm = nil
                        selectedShow = nil
                        if !date.isEmpty { loadScreenings() }
                    }
                }

                // Films
                if isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                            .tint(ReelsColor.accent)
                        Spacer()
                    }
                    .padding(.vertical, 30)
                } else if !date.isEmpty && films.isEmpty {
                    Text(lang.localizedString("buddy.noScreenings"))
                        .font(.subheadline)
                        .foregroundColor(ReelsColor.textMuted)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 30)
                } else if !date.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        Label(lang.localizedString("buddy.selectFilm"), systemImage: "film")
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(ReelsColor.textPrimaryFallback)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(films, id: \.title) { film in
                                    Button {
                                        selectedFilm = film
                                        selectedShow = nil
                                    } label: {
                                        VStack(spacing: 4) {
                                            if let url = film.posterUrl, let imgURL = URL(string: url) {
                                                AsyncImage(url: imgURL) { image in
                                                    image.resizable().aspectRatio(contentMode: .fill)
                                                } placeholder: {
                                                    RoundedRectangle(cornerRadius: 8)
                                                        .fill(ReelsColor.bgAccentFallback)
                                                }
                                                .frame(width: 80, height: 120)
                                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                            } else {
                                                RoundedRectangle(cornerRadius: 8)
                                                    .fill(ReelsColor.bgAccentFallback)
                                                    .frame(width: 80, height: 120)
                                                    .overlay(
                                                        Text(film.title)
                                                            .font(.system(size: 8))
                                                            .foregroundColor(ReelsColor.textMuted)
                                                            .multilineTextAlignment(.center)
                                                            .padding(2)
                                                    )
                                            }
                                            Text(film.title)
                                                .font(.system(size: 9))
                                                .foregroundColor(ReelsColor.textSecondaryFallback)
                                                .lineLimit(1)
                                                .frame(width: 80)
                                        }
                                        .overlay(
                                            selectedFilm?.title == film.title ?
                                            RoundedRectangle(cornerRadius: 8)
                                                .stroke(ReelsColor.accent, lineWidth: 2)
                                                .frame(width: 80, height: 120)
                                                .offset(y: -2) : nil
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Showtimes
                    if let film = selectedFilm {
                        VStack(alignment: .leading, spacing: 6) {
                            Label(lang.localizedString("buddy.selectShow"), systemImage: "clock")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(ReelsColor.textPrimaryFallback)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 6) {
                                    ForEach(film.shows.sorted(by: { $0.time < $1.time }), id: \.time) { show in
                                        Button {
                                            selectedShow = show
                                        } label: {
                                            VStack(spacing: 2) {
                                                Text(show.time)
                                                    .font(.caption.weight(.semibold))
                                                Text(show.cinema)
                                                    .font(.system(size: 9))
                                                    .lineLimit(1)
                                            }
                                            .foregroundColor(selectedShow?.time == show.time && selectedShow?.cinema == show.cinema ? .white : ReelsColor.textSecondaryFallback)
                                            .padding(.horizontal, 10)
                                            .padding(.vertical, 8)
                                            .background(selectedShow?.time == show.time && selectedShow?.cinema == show.cinema ? ReelsColor.accent : ReelsColor.bgCardFallback)
                                            .clipShape(RoundedRectangle(cornerRadius: 10))
                                            .overlay(
                                                !(selectedShow?.time == show.time && selectedShow?.cinema == show.cinema) ?
                                                RoundedRectangle(cornerRadius: 10)
                                                    .stroke(ReelsColor.borderFallback, lineWidth: 0.5) : nil
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Max buddies
                    if selectedShow != nil {
                        VStack(alignment: .leading, spacing: 6) {
                            Label(lang.localizedString("buddy.maxBuddies"), systemImage: "person.2")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(ReelsColor.textPrimaryFallback)

                            HStack(spacing: 6) {
                                ForEach(1...5, id: \.self) { n in
                                    Button {
                                        maxBuddies = n
                                    } label: {
                                        Text("\(n)")
                                            .font(.subheadline.weight(.semibold))
                                            .foregroundColor(maxBuddies == n ? .white : ReelsColor.textSecondaryFallback)
                                            .frame(width: 38, height: 38)
                                            .background(maxBuddies == n ? ReelsColor.accent : ReelsColor.bgCardFallback)
                                            .clipShape(RoundedRectangle(cornerRadius: 10))
                                    }
                                }
                            }
                        }

                        // Submit
                        Button {
                            postRequest()
                        } label: {
                            HStack {
                                if isPosting {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Image(systemName: "ticket")
                                    Text(lang.localizedString("buddy.post"))
                                }
                            }
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(ReelsColor.accent)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        }
                        .disabled(isPosting)
                        .padding(.top, 4)
                    }
                }
            }
            .padding()
        }
        .onAppear {
            if date.isEmpty { date = nextDates.first ?? "" }
            loadScreenings()
        }
    }

    private func formatDate(_ dateStr: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let d = formatter.date(from: dateStr) else { return dateStr }
        let display = DateFormatter()
        display.dateFormat = "EEE d MMM"
        return display.string(from: d)
    }

    private func loadScreenings() {
        guard !date.isEmpty else { return }
        isLoading = true
        guard let url = URL(string: "\(Configuration.apiBaseURL)/api/buddy/screenings?city=\(city)&date=\(date)") else { return }

        URLSession.shared.dataTask(with: url) { data, _, _ in
            DispatchQueue.main.async {
                if let data = data,
                   let response = try? JSONDecoder().decode(BuddyScreeningsResponse.self, from: data) {
                    self.films = response.films
                    if !response.availableDates.isEmpty {
                        self.availableDates = response.availableDates
                    }
                }
                self.isLoading = false
            }
        }.resume()
    }

    private func postRequest() {
        guard let film = selectedFilm, let show = selectedShow else { return }
        isPosting = true

        guard let url = URL(string: "\(Configuration.apiBaseURL)/api/buddy") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = KeychainManager.shared.getBearerToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let body: [String: Any] = [
            "filmTitle": film.title,
            "filmYear": film.year as Any,
            "posterUrl": film.posterUrl as Any,
            "cinemaName": show.cinema,
            "city": city,
            "date": date,
            "time": show.time,
            "ticketUrl": show.ticketUrl as Any,
            "maxBuddies": maxBuddies,
        ]

        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                isPosting = false
                onCreated()
            }
        }.resume()
    }
}

// MARK: - Chat View

struct BuddyChatView: View {
    let requestId: String
    let filmTitle: String

    @State private var messages: [BuddyMessage] = []
    @State private var inputText = ""
    @State private var isLoading = true
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if isLoading {
                    Spacer()
                    ProgressView().tint(ReelsColor.accent)
                    Spacer()
                } else if messages.isEmpty {
                    Spacer()
                    VStack(spacing: 8) {
                        Image(systemName: "message")
                            .font(.largeTitle)
                            .foregroundColor(ReelsColor.textMuted)
                        Text("Start the conversation")
                            .font(.subheadline)
                            .foregroundColor(ReelsColor.textMuted)
                    }
                    Spacer()
                } else {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 8) {
                                ForEach(messages) { msg in
                                    chatBubble(msg)
                                        .id(msg.id)
                                }
                            }
                            .padding()
                        }
                        .onChange(of: messages.count) { _ in
                            if let last = messages.last {
                                proxy.scrollTo(last.id, anchor: .bottom)
                            }
                        }
                    }
                }

                // Input bar
                HStack(spacing: 8) {
                    TextField("Message…", text: $inputText)
                        .textFieldStyle(.plain)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(ReelsColor.bgAccentFallback)
                        .clipShape(RoundedRectangle(cornerRadius: 20))

                    Button { sendMessage() } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundColor(inputText.trimmingCharacters(in: .whitespaces).isEmpty ? ReelsColor.textMuted : ReelsColor.accent)
                    }
                    .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding()
                .background(ReelsColor.bgCardFallback)
            }
            .navigationTitle(filmTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(ReelsColor.accent)
                }
            }
            .onAppear { loadMessages() }
        }
    }

    private func chatBubble(_ msg: BuddyMessage) -> some View {
        let isOwn = msg.sender.id == (KeychainManager.shared.getUserId() ?? "")
        return HStack {
            if isOwn { Spacer() }
            VStack(alignment: isOwn ? .trailing : .leading, spacing: 2) {
                if !isOwn {
                    Text(msg.sender.name)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(ReelsColor.textMuted)
                }
                Text(msg.content)
                    .font(.subheadline)
                    .foregroundColor(isOwn ? .white : ReelsColor.textPrimaryFallback)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(isOwn ? ReelsColor.accent : ReelsColor.bgAccentFallback)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }
            if !isOwn { Spacer() }
        }
    }

    private func loadMessages() {
        guard let url = URL(string: "\(Configuration.apiBaseURL)/api/buddy/\(requestId)/chat") else { return }
        var request = URLRequest(url: url)
        if let token = KeychainManager.shared.getBearerToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        URLSession.shared.dataTask(with: request) { data, _, _ in
            DispatchQueue.main.async {
                if let data = data,
                   let response = try? JSONDecoder().decode(BuddyMessagesResponse.self, from: data) {
                    self.messages = response.messages
                }
                self.isLoading = false
            }
        }.resume()
    }

    private func sendMessage() {
        let content = inputText.trimmingCharacters(in: .whitespaces)
        guard !content.isEmpty else { return }
        inputText = ""

        guard let url = URL(string: "\(Configuration.apiBaseURL)/api/buddy/\(requestId)/chat") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = KeychainManager.shared.getBearerToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        let body = ["content": content]
        request.httpBody = try? JSONEncoder().encode(body)

        URLSession.shared.dataTask(with: request) { data, _, _ in
            DispatchQueue.main.async {
                if let data = data {
                    struct MessageResponse: Codable { let message: BuddyMessage }
                    if let response = try? JSONDecoder().decode(MessageResponse.self, from: data) {
                        messages.append(response.message)
                    }
                }
            }
        }.resume()
    }
}
