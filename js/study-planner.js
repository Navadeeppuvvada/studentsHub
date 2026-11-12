document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-tasks";
    const list = document.getElementById("task-list");
    const progress = document.getElementById("task-progress");
    const weekGrid = document.getElementById("week-grid");
    const form = document.getElementById("task-form");
    const editor = document.getElementById("task-editor");
    const addButton = document.getElementById("add-task");
    let tasks = [];

    try {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved)) {
            tasks = saved.filter(item => item && typeof item.title === "string")
                .map(item => ({
                    id: typeof item.id === "string" ? item.id : `${Date.now()}-${Math.random()}`,
                    title: item.title,
                    subject: typeof item.subject === "string" ? item.subject : "",
                    due: typeof item.due === "string" ? item.due : "",
                    done: Boolean(item.done)
                }));
        }
    } catch (error) {
        console.error("Could not load study tasks from browser storage.", error);
        showToast("Saved study tasks could not be loaded.");
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error("Could not save study tasks.", error);
            showToast("Could not save study tasks. Check browser storage.");
            return false;
        }
    }

    function renderTasks() {
        list.replaceChildren();
        if (!tasks.length) {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "No study tasks yet. Add one small goal to get started.";
            list.append(empty);
        } else {
            tasks.forEach(task => {
                const row = document.createElement("div");
                row.className = "list-row";
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = task.done;
                checkbox.dataset.taskId = task.id;
                checkbox.setAttribute("aria-label", `Mark ${task.title} complete`);
                const details = document.createElement("div");
                details.className = "list-main";
                const title = document.createElement("strong");
                title.textContent = task.title;
                const meta = document.createElement("small");
                meta.textContent = [task.subject, task.due].filter(Boolean).join(" · ") || "No date or subject set";
                details.append(title, meta);
                const status = document.createElement("span");
                status.className = `pill ${task.done ? "good" : ""}`;
                status.textContent = task.done ? "Done" : "To do";
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "btn btn-quiet";
                remove.dataset.removeTask = task.id;
                remove.setAttribute("aria-label", `Remove ${task.title}`);
                remove.textContent = "Remove";
                row.append(checkbox, details, status, remove);
                list.append(row);
            });
        }
        progress.textContent = `${tasks.filter(task => task.done).length} of ${tasks.length} completed`;
        renderWeek();
    }

    function dateKey(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function renderWeek() {
        weekGrid.replaceChildren();
        const today = new Date();
        const monday = new Date(today);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
        const formatDay = new Intl.DateTimeFormat("en-US", { weekday: "short" });

        for (let offset = 0; offset < 7; offset++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + offset);
            const count = tasks.filter(task => task.due === dateKey(date)).length;
            const cell = document.createElement("div");
            cell.className = "day-cell";
            const day = document.createElement("small");
            day.textContent = formatDay.format(date);
            const dayNumber = document.createElement("strong");
            dayNumber.textContent = String(date.getDate());
            const summary = document.createElement("small");
            summary.textContent = `${count} ${count === 1 ? "task" : "tasks"}`;
            cell.append(day, dayNumber, summary);
            weekGrid.append(cell);
        }
    }

    addButton.addEventListener("click", () => {
        editor.hidden = !editor.hidden;
        addButton.setAttribute("aria-expanded", String(!editor.hidden));
        if (!editor.hidden) document.getElementById("task-title").focus();
    });

    document.getElementById("cancel-task").addEventListener("click", () => {
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(form);
        const title = String(data.get("title") || "").trim();
        if (!title) return;
        tasks.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title,
            subject: String(data.get("subject") || "").trim(),
            due: String(data.get("due") || ""),
            done: false
        });
        if (!save()) {
            tasks.pop();
            return;
        }
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
        renderTasks();
        showToast("Study task added");
    });

    list.addEventListener("change", event => {
        const checkbox = event.target.closest("[data-task-id]");
        if (!checkbox) return;
        const task = tasks.find(item => item.id === checkbox.dataset.taskId);
        if (!task) return;
        const previous = task.done;
        task.done = checkbox.checked;
        if (!save()) task.done = previous;
        renderTasks();
    });

    list.addEventListener("click", event => {
        const button = event.target.closest("[data-remove-task]");
        if (!button) return;
        const index = tasks.findIndex(item => item.id === button.dataset.removeTask);
        if (index < 0) return;
        const [removed] = tasks.splice(index, 1);
        if (!save()) {
            tasks.splice(index, 0, removed);
            return;
        }
        renderTasks();
        showToast("Study task removed");
    });

    renderTasks();
});
