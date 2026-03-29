import XCTest

final class OnboardingUITests: XCTestCase {

    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
    }

    func testSignInButtonIsVisible() {
        let signInButton = app.buttons["Sign in with Apple"]
        XCTAssertTrue(signInButton.waitForExistence(timeout: 5))
    }

    func testAppTitleIsVisible() {
        XCTAssertTrue(app.staticTexts["Reel"].waitForExistence(timeout: 5))
    }
}
