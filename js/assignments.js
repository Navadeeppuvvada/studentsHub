
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-assignments";
    let rows = [];
    const body = document.getElementById("assignment-rows");
    const search = document.getElementById("assignment-search");
    const filter = document.getElementById("assignment-filter");
    const form = document.getElementById("assignment-form");
    const editor = document.getElementById("assignment-editor");
    const addButton = document.getElementById("add-assignment");

    try {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved)) {
            rows = saved.filter(item =>
                item && typeof item.title === "string" &&
                typeof item.subject === "string" &&
                typeof item.due === "string"
            ).map(item => ({ ...item, done: Boolean(item.done) }));
        }
    } catch (error) {
        console.error("Could not load assignments from browser storage.", error);
        showToast("Saved assignments could not be loaded.");
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify(rows));
            return true;
        } catch (error) {
            console.error("Could not save assignments.", error);
            showToast("Could not save changes. Check browser storage.");
            return false;
        }
    }

    function formatDate(value) {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }

    function render() {
        const q = search.value.trim().toLowerCase();
        const f = filter.value;

        const list = rows.map((item, index) => ({ item, index })).filter(({ item }) =>
            (item.title + " " + item.subject).toLowerCase().includes(q) &&
            (f === "all" || (f === "done" ? item.done : !item.done))
        );

        body.replaceChildren();
        if (!list.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 5;
            cell.className = "empty";
            cell.textContent = rows.length ? "No assignments match these filters." : "No assignments yet. Add one to track a deadline.";
            row.append(cell);
            body.append(row);
        } else {
            list.forEach(({ item, index }) => {
                const row = document.createElement("tr");
                const title = document.createElement("td");
                const titleText = document.createElement("strong");
                titleText.textContent = item.title;
                title.append(titleText);

                const subject = document.createElement("td");
                subject.textContent = item.subject;
                const due = document.createElement("td");
                due.textContent = formatDate(item.due);
                const status = document.createElement("td");
                const badge = document.createElement("span");
                badge.className = `pill ${item.done ? "good" : "warn"}`;
                badge.textContent = item.done ? "Completed" : "Pending";
                status.append(badge);

                const actions = document.createElement("td");
                const toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "btn btn-secondary";
                toggle.dataset.toggle = String(index);
                toggle.textContent = item.done ? "Reopen" : "Complete";
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "btn btn-quiet";
                remove.dataset.delete = String(index);
                remove.textContent = "Delete";
                actions.append(toggle, remove);
                row.append(title, subject, due, status, actions);
                body.append(row);
            });
        }

        const pending = rows.filter(item => !item.done);
        document.getElementById("total-count").textContent = rows.length;
        document.getElementById("pending-count").textContent = pending.length;
        document.getElementById("completed-count").textContent =
            rows.filter(item => item.done).length;

        const next = pending.filter(item => item.due).sort((a, b) => a.due.localeCompare(b.due))[0];
        document.getElementById("next-deadline").textContent = next ? formatDate(next.due) : "—";
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);

    addButton.addEventListener("click", () => {
        editor.hidden = !editor.hidden;
        addButton.setAttribute("aria-expanded", String(!editor.hidden));
        if (!editor.hidden) document.getElementById("assignment-title").focus();
    });

    document.getElementById("cancel-assignment").addEventListener("click", () => {
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(form);
        const title = String(data.get("title") || "").trim();
        const subject = String(data.get("subject") || "").trim();
        const due = String(data.get("due") || "");
        if (!title || !subject || !due) return;

        rows.push({ title, subject, due, done: false });
        if (!save()) {
            rows.pop();
            return;
        }
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
        render();
        showToast("Assignment added");
    });

    body.addEventListener("click", event => {
        const button = event.target.closest("button[data-toggle], button[data-delete]");
        if (!button) return;
        const index = Number(button.dataset.toggle ?? button.dataset.delete);
        if (!Number.isInteger(index) || !rows[index]) return;

        const previous = rows[index];
        if (button.hasAttribute("data-toggle")) {
            rows[index] = { ...previous, done: !previous.done };
        } else {
            rows.splice(index, 1);
        }
        if (!save()) {
            if (button.hasAttribute("data-toggle")) rows[index] = previous;
            else rows.splice(index, 0, previous);
            return;
        }
        render();
        showToast(button.hasAttribute("data-toggle") ? "Assignment updated" : "Assignment removed");
    });

    render();
});
