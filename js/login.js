import { authenticateLocalAccount } from "./local-auth.js";

const loginForm = document.getElementById("login-form");
const messageBox = document.getElementById("auth-message");
const submitButton = loginForm?.querySelector('[type="submit"]');

function showMessage(message, success = false) {
    messageBox.textContent = message;
    messageBox.classList.toggle("success", success);
    messageBox.hidden = !message;
}

loginForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    if (!email || !password) {
        showMessage("Enter your email and password.");
        return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    showMessage("Signing in…");

    try {
        const account = await authenticateLocalAccount(email, password);
        if (!account) {
            showMessage("Incorrect email or password. Please check your details or create a demo account.");
            return;
        }

        try {
            sessionStorage.setItem("studentHubSession", JSON.stringify(account));
            sessionStorage.setItem("studentHubShowWelcome", "true");
        } catch (error) {
            console.error("Could not start the StudentHub session.", error);
            showMessage("Could not start your session. Check browser storage.");
            return;
        }

        showMessage(`Welcome back, ${account.name}! Redirecting…`, true);
        setTimeout(() => location.replace("index.html"), 600);
    } catch (error) {
        console.error("Local StudentHub sign-in failed.", error);
        showMessage(error.message || "Could not sign in. Check browser storage and try again.");
    } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
    }
});
