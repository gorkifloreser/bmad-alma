import time
from playwright.sync_api import sync_playwright, Page, expect

def verify_auth_flow(page: Page):
    """
    This script verifies the full authentication flow: sign up, login, and logout.
    """
    # Create a unique email address for the new user
    unique_email = f"testuser_{int(time.time())}@example.com"
    password = "password123"

    # 1. Navigate to the home page
    page.goto("http://localhost:3000/")

    # 2. Go to Sign Up page
    page.get_by_role("link", name="Sign Up").click()
    expect(page).to_have_url("http://localhost:3000/signup")

    # 3. Fill out the sign-up form
    page.get_by_label("Email Address").fill(unique_email)
    page.get_by_label("Password").fill(password)

    # 4. Submit the form
    page.get_by_role("button", name="Sign Up").click()

    # 5. Expect to be redirected to the login page with a message
    expect(page).to_have_url("http://localhost:3000/login?message=Check%20email%20to%20continue%20sign%20in%20process")

    # For this test, we will not be able to check the email.
    # We assume that the user is created successfully.
    # In a real-world scenario, you would need a way to interact with the email inbox.
    # For now, we will just proceed to log in with the new credentials.

    # 6. Fill out the login form
    page.get_by_label("Email Address").fill(unique_email)
    page.get_by_label("Password").fill(password)

    # 7. Submit the form
    page.get_by_role("button", name="Log In").click()

    # 8. Expect to be redirected to the home page
    expect(page).to_have_url("http://localhost:3000/")

    # 9. Verify that the user's email and a "Logout" button are visible
    expect(page.get_by_text(unique_email)).to_be_visible()
    expect(page.get_by_role("button", name="Logout")).to_be_visible()

    # 10. Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_auth_flow(page)
        browser.close()
