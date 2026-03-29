import XCTest

final class SwipeFlowUITests: XCTestCase {

    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["--uitesting", "--authenticated"]
        app.launch()
    }

    func testDiscoveryTabIsVisible() {
        let tab = app.tabBars.buttons["Discover"]
        XCTAssertTrue(tab.waitForExistence(timeout: 5))
    }
}
