
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-assignments";

    let rows = JSON.parse(localStorage.getItem(key) || "null") || [
        {
            title: "BST practice set",
            subject: "Data Structures",
            due: "2026-10-20",
            done: false
        },
        {
            title: "Probability worksheet",
            subject: "Engineering Mathematics",
            due: "2026-10-22",
            done: false
        },
        {
            title: "Classification report",
            subject: "AI/ML",
            due: "2026-10-15",
            done: true
        },
        {
            title: "Database normalization",
            subject: "Database Systems",
            due: "2026-10-24",
            done: false
        }
    ];

    const body = document.getElementById("assignment-rows");
    const search = document.getElementById("assignment-search");
    const filter = document.getElementById("assignment-filter");

    function save() {
        localStorage.setItem(key, JSON.stringify(rows));
    }

    function render() {
        const q = search.value.toLowerCase();
        const f = filter.value;

        const list = rows.filter(x =>
            (x.title + " " + x.subject).toLowerCase().includes(q) &&
            (
                f === "all" ||
                (f === "done" ? x.done : !x.done)
            )
        );

        body.innerHTML = list.map((x, i) => `
            <tr>
                <td>
                    <strong>${x.title}</strong>
                </td>

                <td>${x.subject}</td>

                <td>${x.due}</td>

                <td>
                    <span class="pill ${x.done ? 'good' : 'warn'}">
                        ${x.done ? 'Completed' : 'Pending'}
                    </span>
                </td>

                <td>
                    <button
                        class="btn btn-secondary"
                        data-toggle="${rows.indexOf(x)}"
                    >
                        ${x.done ? 'Reopen' : 'Complete'}
                    </button>
                </td>
            </tr>
        `).join("") || `
            <tr>
                <td colspan="5" class="empty">
                    No assignments found.
                </td>
            </tr>
        `;

        document.getElementById("total-count").textContent =
            rows.length;

        document.getElementById("pending-count").textContent =
            rows.filter(x => !x.done).length;

        document.getElementById("completed-count").textContent =
            rows.filter(x => x.done).length;

        body.querySelectorAll("[data-toggle]").forEach(b => {
            b.addEventListener("click", () => {
                rows[+b.dataset.toggle].done =
                    !rows[+b.dataset.toggle].done;

                save();
                render();

                showToast("Assignment updated");
            });
        });
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);

    document.getElementById("add-assignment").addEventListener("click", () => {
        const title = prompt("Assignment title:");

        if (!title?.trim()) return;

        const subject = prompt("Subject:", "Data Structures") || "General";

        const due = prompt(
            "Due date (YYYY-MM-DD):",
            "2026-10-25"
        ) || "2026-10-25";

        rows.push({
            title: title.trim(),
            subject,
            due,
            done: false
        });

        save();
        render();

        showToast("Assignment added");
    });

    render();
});
