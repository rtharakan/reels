// swift-tools-version: 5.10

import PackageDescription

let package = Package(
    name: "Reel",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "Reel", targets: ["Reel"])
    ],
    dependencies: [
        .package(
            url: "https://github.com/firebase/firebase-ios-sdk.git",
            from: "10.0.0"
        ),
        .package(
            url: "https://github.com/onevcat/Kingfisher.git",
            from: "7.0.0"
        )
    ],
    targets: [
        .target(
            name: "Reel",
            dependencies: [
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "Kingfisher", package: "Kingfisher")
            ],
            path: "Sources"
        ),
        .testTarget(
            name: "ReelTests",
            dependencies: ["Reel"],
            path: "Tests/Unit"
        ),
        .testTarget(
            name: "ReelUITests",
            dependencies: [],
            path: "Tests/UI"
        )
    ]
)
