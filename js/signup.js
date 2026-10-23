
const signupForm = document.getElementById("signup-form");
const messageBox = document.getElementById("auth-message");

signupForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm").value;
    const terms = document.getElementById("signup-terms").checked;

    function showMessage(message, success = false) {
        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.style.color = success ? "#34D399" : "#F87171";
        messageBox.style.borderColor = success ? "#34D399" : "#F87171";
        messageBox.style.padding = "12px";
    }

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
        showMessage("Please accept the demo account notice.");
        return;
    }

    let users = [];

    try {
        users = JSON.parse(localStorage.getItem("studentHubUsers") || "[]");
        if (!Array.isArray(users)) users = [];
    } catch {
        users = [];
    }

    if (users.some(user => user.email === email)) {
        showMessage("This email already has an account. Please sign in.");
        return;
    }

    // Demo only: storing a password in localStorage is not secure.
    users.push({ name, email, password });

    try {
        localStorage.setItem("studentHubUsers", JSON.stringify(users));
    } catch {
        showMessage("Could not save your account in this browser.");
        return;
    }

    showMessage("Account created! Redirecting to sign in...", true);
    signupForm.reset();

    setTimeout(() => {
        window.location.href = "login.html";
    }, 900);
});
