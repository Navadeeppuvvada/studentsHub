
const loginForm = document.getElementById("login-form");
const messageBox = document.getElementById("auth-message");

loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    function showMessage(message, success = false) {
        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.style.color = success ? "#34D399" : "#F87171";
        messageBox.style.borderColor = success ? "#34D399" : "#F87171";
        messageBox.style.padding = "12px";
    }

    if (!email || !password) {
        showMessage("Enter your email and password.");
        return;
    }

    let users = [];

    try {
        users = JSON.parse(localStorage.getItem("studentHubUsers") || "[]");
        if (!Array.isArray(users)) users = [];
    } catch {
        users = [];
    }

    const user = users.find(account => account.email === email);

    if (!user || !user.password || user.password !== password) {
        showMessage("Incorrect email or password. Please check your details or create a new demo account.");
        return;
    }

    // Use the same key that profile.js reads.
    sessionStorage.setItem("studentHubSession", JSON.stringify({
        name: user.name,
        email: user.email
    }));

    showMessage(`Welcome back, ${user.name}! Redirecting...`, true);
    sessionStorage.setItem("studentHubShowWelcome", "true");

setTimeout(() => {
    window.location.href = "index.html";
}, 600);

    setTimeout(() => {
        window.location.href = "index.html";
    }, 600);
});
