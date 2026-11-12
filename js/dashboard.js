
document.addEventListener("DOMContentLoaded", () => {
    const readArray = key => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn(`Could not read ${key} from browser storage.`, error);
            return [];
        }
    };

    const readObject = key => {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "null");
            return value && typeof value === "object" ? value : {};
        } catch (error) {
            console.warn(`Could not read ${key} from browser storage.`, error);
            return {};
        }
    };

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    const showEmpty = (container, text, href, label) => {
        const message = document.createElement("p");
        message.className = "empty";
        message.textContent = text;

        if (href && label) {
            const link = document.createElement("a");
            link.href = href;
            link.textContent = label;
            message.append(" ", link);
        }

        container.replaceChildren(message);
    };

    const assignments = readArray("studenthub-assignments");
    const subjects = readArray("studenthub-subjects");
    const attendance = readArray("studenthub-attendance");
    const timetable = readArray("studenthub-timetable");
    const hasSampleSubjects = subjects.some(item => item.sample === true);
    const hasSampleAttendance = attendance.some(item => item.sample === true);
    const focus = readObject("studenthub-focus-room-v1");
    const today = new Date();
    const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    let session = null;
    try {
        session = JSON.parse(sessionStorage.getItem("studentHubSession") || "null");
    } catch (error) {
        console.warn("Could not read the current StudentHub session.", error);
    }

    setText("welcome-name", session?.name || session?.displayName || "student");
    setText("dashboard-subject-count", subjects.length ? String(subjects.length) : "—");
    setText(
        "dashboard-subject-note",
        !subjects.length
            ? "Add your subjects to begin"
            : hasSampleSubjects
                ? "Includes starter examples · replace with your subjects"
                : `${subjects.length} saved subject${subjects.length === 1 ? "" : "s"}`
    );

    const pendingAssignments = assignments.filter(item => !item.done);
    setText("pending-total", assignments.length ? String(pendingAssignments.length).padStart(2, "0") : "—");

    const totalAttendance = attendance.reduce((sum, item) => {
        const total = Number(item.total);
        return sum + (Number.isFinite(total) && total > 0 ? total : 0);
    }, 0);
    const attended = attendance.reduce((sum, item) => {
        const count = Number(item.attended);
        return sum + (Number.isFinite(count) && count >= 0 ? count : 0);
    }, 0);
    const attendancePercent = totalAttendance
        ? Math.round((attended / totalAttendance) * 100)
        : null;
    setText("dashboard-attendance", attendancePercent === null ? "—" : `${attendancePercent}%`);
    setText(
        "dashboard-attendance-note",
        attendancePercent === null
            ? "Add attendance records to see your average"
            : hasSampleAttendance
                ? `${attended} of ${totalAttendance} sample classes · replace with your record`
                : `${attended} of ${totalAttendance} classes attended`
    );
    const attendanceProgress = document.getElementById("dashboard-attendance-progress");
    if (attendanceProgress) attendanceProgress.style.width = `${attendancePercent || 0}%`;

    const todayFocus = (Array.isArray(focus.sessions) ? focus.sessions : [])
        .filter(item => item.date === todayKey && item.mode === "focus")
        .reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
    setText("dashboard-focus-time", todayFocus ? `${todayFocus} min` : "0 min");

    const schedule = document.getElementById("upcoming-classes");
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const todayClasses = timetable
        .filter(item => item.day === dayName)
        .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));

    if (schedule) {
        if (!todayClasses.length) {
            showEmpty(schedule, "No classes added for today.", "timetable.html", "Add timetable entries");
        } else {
            const rows = todayClasses.map(item => {
                const row = document.createElement("div");
                row.className = "list-row";
                const icon = document.createElement("span");
                icon.className = "list-icon";
                icon.textContent = String(item.time || "—").slice(0, 5);
                const details = document.createElement("div");
                details.className = "list-main";
                const title = document.createElement("strong");
                title.textContent = item.subject || "Untitled class";
                const meta = document.createElement("small");
                meta.textContent = [item.time, item.location].filter(Boolean).join(" · ");
                details.append(title, meta);
                row.append(icon, details);
                if (item.sample) {
                    const sample = document.createElement("span");
                    sample.className = "pill warn";
                    sample.textContent = "Sample";
                    row.append(sample);
                }
                return row;
            });
            schedule.replaceChildren(...rows);
        }
    }

    const deadlineList = document.getElementById("upcoming-assignments");
    if (deadlineList) {
        const dueItems = pendingAssignments
            .filter(item => item.due)
            .sort((a, b) => String(a.due).localeCompare(String(b.due)))
            .slice(0, 3);

        if (!dueItems.length) {
            showEmpty(
                deadlineList,
                assignments.length ? "No pending deadlines." : "No assignments added yet.",
                "assignments.html",
                assignments.length ? "" : "Add an assignment"
            );
        } else {
            const rows = dueItems.map(item => {
                const row = document.createElement("div");
                row.className = "list-row";
                const icon = document.createElement("span");
                icon.className = "list-icon";
                icon.textContent = String(item.subject || "—").slice(0, 2).toUpperCase();
                const details = document.createElement("div");
                details.className = "list-main";
                const title = document.createElement("strong");
                title.textContent = item.title || "Untitled assignment";
                const meta = document.createElement("small");
                const dueDate = new Date(`${item.due}T00:00:00`);
                meta.textContent = Number.isNaN(dueDate.getTime())
                    ? `${item.subject || "General"} · ${item.due}`
                    : `${item.subject || "General"} · ${dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
                const status = document.createElement("span");
                status.className = "pill warn";
                status.textContent = item.due < todayKey ? "Overdue" : "Pending";
                details.append(title, meta);
                row.append(icon, details, status);
                return row;
            });
            deadlineList.replaceChildren(...rows);
        }
    }

    const progressList = document.getElementById("study-progress");
    if (progressList) {
        if (!subjects.length) {
            showEmpty(progressList, "Your subject progress will appear here.", "subjects.html", "Add a subject");
        } else {
            const rows = subjects.slice(0, 3).map(subject => {
                const row = document.createElement("div");
                row.className = "list-row";
                const details = document.createElement("div");
                details.className = "list-main";
                const title = document.createElement("strong");
                title.textContent = subject.name || "Untitled subject";
                const progressValue = Math.min(100, Math.max(0, Number(subject.progress) || 0));
                const meta = document.createElement("small");
                meta.textContent = subject.sample
                    ? `Sample progress · ${progressValue}%`
                    : `Course progress · ${progressValue}%`;
                const bar = document.createElement("div");
                bar.className = "progress";
                const fill = document.createElement("span");
                fill.style.width = `${progressValue}%`;
                bar.append(fill);
                details.append(title, meta, bar);
                row.append(details);
                return row;
            });
            progressList.replaceChildren(...rows);
        }
    }

    document.querySelectorAll("[data-progress]").forEach(el => {
        el.style.width = `${Math.min(100, Math.max(0, Number(el.dataset.progress) || 0))}%`;
    });
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