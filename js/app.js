
    (() => {
    const nav = [
        {
            section: "OVERVIEW",
            items: [
                ["Dashboard", "index.html", "⌂"]
            ]
        },
        {
            section: "ACADEMIC",
            items: [
                ["Subjects", "subjects.html", "▦"],
                ["Assignments", "assignments.html", "▤"],
                ["Attendance", "attendance.html", "✓"],
                ["Timetable", "timetable.html", "▦"],
                ["Study Planner", "study-planner.html", "◷"],
                ["Study Materials", "study-materials.html", "▧"],
                ["Focus Room", "focus-room.html", "◉"],
                ["Coding Arena", "career-arena.html", "⌘"],
                ["Peer Connect", "peer-learning.html", "⌘"]

            ]
        },
        {
            section: "CAMPUS",
            items: [
                ["Announcements", "announcements.html", "◉"],
                ["Events & Clubs", "events-clubs.html", "✳"],
                ["Lost & Found", "lost-found.html", "⌕"],
                ["Placement", "placement.html", "↗"],
                ["Community", "community.html", "◎"]
            ]
        },
        {
            section: "PERSONAL",
            items: [
                ["Notifications", "notifications.html", "♧"],
                ["My Profile", "profile.html", "◉"],
                ["Settings", "settings.html", "⚙"],
                ["About StudentHub", "about.html", "ⓘ"]
            ]
        }
    ];

    function init() {
        const sidebar = document.querySelector("[data-sidebar]");
        const mobileSidebar = sidebar ||
            document.querySelector("[data-mobile-sidebar]");
        const current = location.pathname.split("/").pop() || "index.html";

        if (sidebar) {
            sidebar.innerHTML = `
                <div class="sidebar-brand">
                    <div class="brand-mark">S</div>
                    <div class="sidebar-brand-text">
                        <h2 class="brand-name">StudentHub</h2>
                        <p class="brand-tagline">YOUR ACADEMIC SPACE</p>
                    </div>
                </div>

                <nav>
                    ${nav.map(group => `
                        <div class="nav-group">
                            <p class="nav-label">${group.section}</p>
                            ${group.items.map(([label, href, icon]) => `
                                <a
                                    class="nav-link ${current === href ? "active" : ""}"
                                    href="${href}"
                                    ${current === href ? 'aria-current="page"' : ""}
                                >
                                    <span class="nav-ico">${icon}</span>
                                    <span>${label}</span>
                                    ${current === href ? '<i class="nav-dot"></i>' : ""}
                                </a>
                            `).join("")}
                        </div>
                    `).join("")}
                </nav>

                <div class="sidebar-bottom">
                    <span class="user-avatar">N</span>
                    <span class="user-meta">
                        <strong data-user-name>Student account</strong>
                        <small data-user-email>Sign in to sync your account</small>
                    </span>
                    <a class="icon-button"
                       href="settings.html"
                       aria-label="Settings">⚙</a>
                </div>
            `;
        }

        document.querySelectorAll("[data-year]").forEach(el => {
            el.textContent = new Date().getFullYear();
        });

        document.querySelectorAll("[data-current-date]").forEach(el => {
            el.textContent = new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        });

        const menu = document.querySelector("[data-mobile-menu]");

        if (menu && mobileSidebar) {
            menu.addEventListener("click", () => {
                const isOpen = mobileSidebar.classList.toggle("open");
                menu.setAttribute("aria-expanded", String(isOpen));
            });
        }

        document.addEventListener("click", e => {
            if (
                mobileSidebar &&
                mobileSidebar.classList.contains("open") &&
                !mobileSidebar.contains(e.target) &&
                !menu?.contains(e.target)
            ) {
                mobileSidebar.classList.remove("open");
                menu?.setAttribute("aria-expanded", "false");
            }
        });

        function updateAccountUI(user = readSession()) {
            const name = user?.name || user?.displayName || "";
            const email = user?.email || "";
            const initial = (name || email || "S").trim().charAt(0).toUpperCase();

            document.querySelectorAll("[data-user-name]").forEach(el => {
                el.textContent = name || "Student account";
            });
            document.querySelectorAll("[data-user-email]").forEach(el => {
                el.textContent = email || (name ? "Student account" : "Sign in to sync your account");
            });
            document.querySelectorAll(".avatar, .user-avatar").forEach(el => {
                el.textContent = initial;
            });

            let authButton = document.querySelector("#auth-button, [data-auth-button]");
            if (!authButton) {
                const actions = document.querySelector(".topbar-actions");
                if (actions) {
                    authButton = document.createElement("button");
                    authButton.className = "btn btn-quiet auth-action";
                    authButton.type = "button";
                    authButton.dataset.authButton = "";
                    actions.prepend(authButton);
                }
            }

            if (authButton) {
                authButton.textContent = user ? "Sign out" : "Sign in";
                authButton.setAttribute("aria-label", user ? "Sign out" : "Sign in");
                if (!authButton.dataset.bound) {
                    authButton.dataset.bound = "true";
                    authButton.addEventListener("click", () => {
                        if (typeof window.studentHubSignOut === "function") {
                            window.studentHubSignOut();
                        } else {
                            sessionStorage.removeItem("studentHubSession");
                            sessionStorage.removeItem("studentHubShowWelcome");
                            window.location.href = "login.html";
                        }
                    });
                }
            }
        }

        function readSession() {
            try {
                return JSON.parse(sessionStorage.getItem("studentHubSession") || "null");
            } catch (error) {
                console.warn("Could not read the current StudentHub session.", error);
                return null;
            }
        }

        updateAccountUI();
        window.addEventListener("studenthub:auth-change", event => {
            updateAccountUI(event.detail?.user || null);
        });

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);

        window.showToast = message => {
            toast.textContent = message;
            toast.classList.add("show");

            clearTimeout(window.__toastTimer);

            window.__toastTimer = setTimeout(() => {
                toast.classList.remove("show");
            }, 2300);
        };

    }

    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", init)
        : init();
})();