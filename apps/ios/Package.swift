// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Reels",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "Reels", targets: ["Reels"]),
    ],
    targets: [
        .target(
            name: "Reels",
            path: "Reels",
            resources: [
                .process("Resources"),
            ]
        ),
    ]
)
