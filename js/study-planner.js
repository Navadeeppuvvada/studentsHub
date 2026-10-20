
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-tasks";

    let tasks = JSON.parse(localStorage.getItem(key) || "null") || [
        {
            title: "Revise BST deletion cases",
            subject: "Data Structures",
            done: false
        },
        {
            title: "Solve 3 recursion problems",
            subject: "DSA practice",
            done: false
        },
        {
            title: "Review probability formulas",
            subject: "Mathematics",
            done: true
        },
        {
            title: "Build a React mini component",
            subject: "Web Development",
            done: false
        }
    ];

    const list = document.getElementById("task-list");
    const progress = document.getElementById("task-progress");

    function save() {
        localStorage.setItem(key, JSON.stringify(tasks));
    }

    function render() {
        list.innerHTML = tasks.map((t, i) => `
            <label class="check-row ${t.done ? 'done' : ''}">
                <input
                    type="checkbox"
                    data-task="${i}"
                    ${t.done ? 'checked' : ''}
                >

                <span class="check-title" style="flex:1">
                    ${t.title}

                    <small style="display:block;color:var(--dim);text-decoration:none">
                        ${t.subject}
                    </small>
                </span>

                <span class="pill">
                    ${t.done ? 'Done' : 'To do'}
                </span>
            </label>
        `).join("") || '<p class="empty">No tasks yet. Add your first task.</p>';

        progress.textContent = `${
            tasks.filter(t => t.done).length
        } of ${tasks.length} completed`;

        list.querySelectorAll("[data-task]").forEach(c => {
            c.addEventListener("change", () => {
                tasks[+c.dataset.task].done = c.checked;

                save();
                render();
            });
        });
    }

    document.getElementById("add-task").addEventListener("click", () => {
        const title = prompt("What do you want to study?");

        if (!title?.trim()) return;

        tasks.push({
            title: title.trim(),
            subject: prompt("Subject or category:", "Study") || "Study",
            done: false
        });

        save();
        render();

        showToast("Study task added");
    });

    document.getElementById("week-grid").innerHTML = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ].map((d, i) => `
        <div class="day-cell">
            <small>${d}</small>
            <strong>${13 + i}</strong>

            ${
                i < 5
                    ? '<span class="day-dot"></span><span class="day-dot"></span>'
                    : '<small>Rest / review</small>'
            }
        </div>
    `).join("");

    render();
});
