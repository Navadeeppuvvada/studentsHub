
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
                ["Study Materials", "study-materials.html", "▧"]
            ]
        },
        {
            section: "CAMPUS",
            items: [
                ["Announcements", "announcements.html", "◉"],
                ["Events & Clubs", "events-clubs.html", "✳"],
                ["Placement", "placement.html", "↗"],
                ["Community", "community.html", "◎"]
            ]
        },
        {
            section: "PERSONAL",
            items: [
                ["Notifications", "notifications.html", "♧"],
                ["My Profile", "profile.html", "◉"],
                ["Settings", "settings.html", "⚙"]
            ]
        }
    ];

    function init() {
        const sidebar = document.querySelector("[data-sidebar]");
        const current = location.pathname.split("/").pop() || "index.html";

        if (sidebar) {
            sidebar.innerHTML = `
                <a class="brand" href="index.html">
                    <span class="brand-mark">S</span>

                    <span>
                        <strong>StudentHub</strong>
                        <small>YOUR ACADEMIC SPACE</small>
                    </span>
                </a>

                <nav class="nav-group">
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

                                    ${current === href
                                        ? '<i class="nav-dot"></i>'
                                        : ""
                                    }
                                </a>
                            `).join("")}
                        </div>
                    `).join("")}
                </nav>

                <div class="sidebar-bottom">
                    <span class="user-avatar">N</span>

                    <span class="user-meta">
                        <strong>Navadeep</strong>
                        <small>B.Tech Student</small>
                    </span>

                    <a
                        class="icon-button"
                        href="settings.html"
                        aria-label="Settings"
                    >
                        ⚙
                    </a>
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

        if (menu && sidebar) {
            menu.addEventListener("click", () => {
                sidebar.classList.toggle("open");
            });
        }

        document.addEventListener("click", e => {
            if (
                sidebar &&
                sidebar.classList.contains("open") &&
                !sidebar.contains(e.target) &&
                !menu?.contains(e.target)
            ) {
                sidebar.classList.remove("open");
            }
        });

        const toast = document.createElement("div");

        toast.className = "toast";
        toast.setAttribute("role", "status");

        document.body.appendChild(toast);

        window.showToast = (message) => {
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
