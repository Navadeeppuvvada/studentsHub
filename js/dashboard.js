
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-progress]").forEach(el =>
        requestAnimationFrame(() => {
            el.style.width = el.dataset.progress + "%";
        })
    );

    const tasks = JSON.parse(
        localStorage.getItem("studenthub-assignments") || "[]"
    );

    const pending = tasks.filter(t => !t.done).length;

    if (tasks.length) {
        const el = document.getElementById("pending-total");

        if (el) {
            el.textContent = String(pending).padStart(2, "0");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const session = sessionStorage.getItem("studentHubSession");

    if (!session) return;

    // Show the welcome popup only once after login.
    const shouldWelcome = sessionStorage.getItem("studentHubShowWelcome");

    if (shouldWelcome !== "true") return;

    sessionStorage.removeItem("studentHubShowWelcome");

    let user;

    try {
        user = JSON.parse(session);
    } catch {
        return;
    }

    const name = user?.name || "Student";

    const popup = document.createElement("div");
    popup.className = "welcome-popup";
    popup.setAttribute("role", "status");
    popup.innerHTML = `
        <div class="welcome-popup-icon">✓</div>
        <div>
            <h2>Welcome, ${escapeHtml(name)}! 👋</h2>
            <p>Login successful. Glad to have you back!</p>
        </div>
        <button class="welcome-popup-close" aria-label="Close welcome message">&times;</button>
    `;

    document.body.appendChild(popup);

    const closePopup = () => {
        popup.classList.add("welcome-popup-hide");
        setTimeout(() => popup.remove(), 300);
    };

    popup.querySelector(".welcome-popup-close")
        .addEventListener("click", closePopup);

    setTimeout(closePopup, 4000);
});

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}
// StudentHub footer newsletter form
document.addEventListener("DOMContentLoaded", () => {
    const footerForm = document.getElementById("footerSubscribe");

    if (!footerForm) return;

    footerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("footerEmail");
        const message = document.getElementById("footerMessage");

        if (!emailInput || !message) return;

        if (!emailInput.checkValidity()) {
            emailInput.reportValidity();
            return;
        }

        message.textContent =
            "Thanks for your interest! Newsletter subscriptions aren't connected yet.";

        emailInput.value = "";
    });
});