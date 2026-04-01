import SwiftUI

/// Picker landing page — two-pathway selection + My Plans list.
struct PickerView: View {
    @ObservedObject private var lang = LanguageManager.shared
    @StateObject private var viewModel = PickerViewModel()
    @State private var showPathwayA = false
    @State private var showPathwayB = false
    @State private var navigateToPlan: String?

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Two pathway cards
                    VStack(spacing: 12) {
                        pathwayCard(
                            title: lang.localizedString("picker.pathwayA"),
                            description: lang.localizedString("picker.subtitle"),
                            icon: "film",
                            action: { showPathwayA = true }
                        )
                        pathwayCard(
                            title: lang.localizedString("picker.pathwayB"),
                            description: lang.localizedString("picker.subtitle"),
                            icon: "ticket",
                            action: { showPathwayB = true }
                        )
                    }

                    // My Plans
                    if !viewModel.plans.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(lang.localizedString("picker.myPlans"))
                                .font(.headline)

                            ForEach(viewModel.plans) { plan in
                                NavigationLink(destination: PickerPlanView(planId: plan.id)) {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(plan.filmTitle)
                                                .font(.subheadline.weight(.medium))
                                                .foregroundColor(.primary)
                                            Text("\(plan.participantCount) \(lang.localizedString("picker.participants").lowercased())")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                        Spacer()
                                        statusBadge(plan.status)
                                    }
                                    .padding()
                                    .background(Color(.secondarySystemBackground))
                                    .cornerRadius(12)
                                }
                            }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle(lang.localizedString("picker.title"))
            .task { await viewModel.loadMyPlans() }
            .sheet(isPresented: $showPathwayA) {
                PickerCreateFlowView(pathway: .filmFirst, viewModel: viewModel)
            }
            .sheet(isPresented: $showPathwayB) {
                PickerCreateFlowView(pathway: .fullySpecified, viewModel: viewModel)
            }
        }
    }

    private func pathwayCard(title: String, description: String, icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.primary)
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(12)
        }
    }

    private func statusBadge(_ status: String) -> some View {
        let color: Color = {
            switch status {
            case "VOTING": return .blue
            case "CONFIRMED": return .green
            case "EXPIRED": return .gray
            default: return .gray
            }
        }()
        let label = lang.localizedString("picker.\(status.lowercased())")
        return Text(label)
            .font(.caption2.weight(.medium))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.15))
            .foregroundColor(color)
            .cornerRadius(8)
    }
}

// MARK: - Create Flow

enum PickerPathway {
    case filmFirst, fullySpecified
}

struct PickerCreateFlowView: View {
    let pathway: PickerPathway
    @ObservedObject var viewModel: PickerViewModel
    @ObservedObject private var lang = LanguageManager.shared
    @Environment(\.dismiss) private var dismiss
    @State private var searchQuery = ""
    @State private var selectedFilm: FilmSearchResult?

    var body: some View {
        NavigationView {
            VStack {
                if pathway == .filmFirst {
                    // Film search
                    TextField(lang.localizedString("picker.searchFilms"), text: $searchQuery)
                        .textFieldStyle(.roundedBorder)
                        .padding(.horizontal)
                        .onChange(of: searchQuery) { _, query in
                            viewModel.searchFilms(query: query)
                        }

                    List(viewModel.filmSearchResults) { film in
                        Button {
                            selectedFilm = film
                        } label: {
                            HStack(spacing: 12) {
                                if let posterPath = film.posterPath {
                                    AsyncImage(url: URL(string: "https://image.tmdb.org/t/p/w92\(posterPath)")) { image in
                                        image.resizable().scaledToFill()
                                    } placeholder: {
                                        Color.gray.opacity(0.3)
                                    }
                                    .frame(width: 44, height: 66)
                                    .cornerRadius(6)
                                }
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(film.title)
                                        .font(.subheadline.weight(.medium))
                                    if let year = film.year {
                                        Text(String(year))
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                        }
                        .listRowBackground(selectedFilm?.tmdbId == film.tmdbId ? Color.accentColor.opacity(0.1) : Color.clear)
                    }
                } else {
                    Text(lang.localizedString("picker.pathwayB"))
                        .font(.headline)
                        .padding()
                }
            }
            .navigationTitle(lang.localizedString("picker.createPlan"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(lang.localizedString("common.cancel")) { dismiss() }
                }
            }
        }
    }
}
