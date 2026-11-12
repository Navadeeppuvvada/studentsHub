import { createLocalAccount } from "./local-auth.js";

const signupForm = document.getElementById("signup-form");
const messageBox = document.getElementById("auth-message");
const submitButton = signupForm?.querySelector('[type="submit"]');

function showMessage(message, success = false) {
    messageBox.textContent = message;
    messageBox.classList.toggle("success", success);
    messageBox.hidden = !message;
}

signupForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm").value;
    const terms = document.getElementById("signup-terms").checked;

    if (name.length < 2) {
        showMessage("Please enter your full name.");
        return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email address.");
        return;
    }
    if (password.length < 8) {
        showMessage("Your password must contain at least 8 characters.");
        return;
    }
    if (password !== confirmPassword) {
        showMessage("The passwords do not match.");
        return;
    }
    if (!terms) {
        showMessage("Please accept the local demo account notice.");
        return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    showMessage("Creating your local account…");

    try {
        await createLocalAccount(name, email, password);
        showMessage("Demo account created. Redirecting to sign in…", true);
        signupForm.reset();
        setTimeout(() => location.replace("login.html"), 700);
    } catch (error) {
        console.error("Could not create a local StudentHub account.", error);
        showMessage(error.message || "Could not save your account. Check browser storage and try again.");
    } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
    }
});
