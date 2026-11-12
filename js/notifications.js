document.addEventListener("DOMContentLoaded", () => {
    const storageKey = "studenthub-notification-read-v1";
    const list = document.getElementById("notification-list");
    const empty = document.getElementById("notifications-empty");
    const readFilter = document.getElementById("read-filter");
    const categoryFilter = document.getElementById("category-filter");
    let readIds = [];

    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (Array.isArray(saved)) readIds = saved.filter(id => typeof id === "string");
    } catch (error) {
        console.error("Could not load notification read state.", error);
        showToast("Notification read states could not be loaded.");
    }

    function loadArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn(`Could not read ${key} for reminders.`, error);
            return [];
        }
    }

    function getNotifications() {
        const assignments = loadArray("studenthub-assignments")
            .map((item, index) => {
                if (!item || item.done || typeof item.due !== "string" || !item.due) return null;
                return {
                    id: `assignment-${index}-${item.due}`,
                    title: item.title || "Assignment deadline",
                    message: `Due ${formatDate(item.due)}${item.subject ? ` · ${item.subject}` : ""}`,
                    category: "Assignments",
                    date: item.due
                };
            }).filter(Boolean);

        const tasks = loadArray("studenthub-tasks")
            .map((item, index) => {
                if (!item || item.done || typeof item.due !== "string" || !item.due) return null;
                return {
                    id: `study-${index}-${item.due}`,
                    title: item.title || "Study plan task",
                    message: `Planned for ${formatDate(item.due)}${item.subject ? ` · ${item.subject}` : ""}`,
                    category: "Study planner",
                    date: item.due
                };
            }).filter(Boolean);

        return [...assignments, ...tasks].sort((a, b) => a.date.localeCompare(b.date));
    }

    function formatDate(value) {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }

    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(readIds));
            return true;
        } catch (error) {
            console.error("Could not save notification read state.", error);
            showToast("Could not save notification changes.");
            return false;
        }
    }

    function render() {
        const notifications = getNotifications();
        const unreadCount = notifications.filter(item => !readIds.includes(item.id)).length;
        document.getElementById("total-notifications").textContent = notifications.length;
        document.getElementById("unread-notifications").textContent = unreadCount;

        const visible = notifications.filter(item => {
            const isRead = readIds.includes(item.id);
            return (readFilter.value === "all" ||
                (readFilter.value === "read" && isRead) ||
                (readFilter.value === "unread" && !isRead)) &&
                (categoryFilter.value === "all" || categoryFilter.value === item.category);
        });

        list.replaceChildren();
        visible.forEach(item => {
            const row = document.createElement("article");
            row.className = `list-item${readIds.includes(item.id) ? "" : " notice-unread"}`;
            const icon = document.createElement("div");
            icon.className = "icon-tile";
            icon.textContent = item.category === "Assignments" ? "A" : "S";
            const main = document.createElement("div");
            main.className = "item-main";
            const heading = document.createElement("strong");
            heading.textContent = item.title;
            const message = document.createElement("p");
            message.textContent = item.message;
            const meta = document.createElement("p");
            meta.style.marginTop = "8px";
            meta.textContent = item.category;
            main.append(heading, message, meta);

            const action = document.createElement("button");
            action.type = "button";
            action.className = "btn btn-secondary";
            action.textContent = readIds.includes(item.id) ? "Read" : "Mark as read";
            action.disabled = readIds.includes(item.id);
            action.dataset.readId = item.id;
            row.append(icon, main, action);
            list.append(row);
        });
        empty.hidden = notifications.length > 0;
        if (notifications.length > 0 && !visible.length) {
            empty.hidden = false;
            empty.textContent = "No notifications match these filters.";
        } else {
            empty.textContent = "No upcoming reminders yet. Add due dates to your assignments or study plan.";
        }
    }

    list.addEventListener("click", event => {
        const button = event.target.closest("[data-read-id]");
        if (!button) return;
        const id = button.dataset.readId;
        if (readIds.includes(id)) return;
        readIds.push(id);
        if (!save()) {
            readIds.pop();
            return;
        }
        render();
    });

    readFilter.addEventListener("change", render);
    categoryFilter.addEventListener("change", render);
    document.getElementById("mark-all-read").addEventListener("click", () => {
        const previous = readIds;
        readIds = [...new Set([...readIds, ...getNotifications().map(item => item.id)])];
        if (!save()) {
            readIds = previous;
            return;
        }
        render();
        showToast("All reminders marked as read");
    });

    render();
});
