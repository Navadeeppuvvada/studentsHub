
document.addEventListener("DOMContentLoaded", () => {
    const data = [
        ["Java Programming", "Prof. Rao", 4, 78, 88, "core", "☕"],
        ["Data Structures", "Dr. Kumar", 4, 65, 84, "core", "⌘"],
        ["Web Development", "Prof. Sharma", 3, 82, 82, "core", "⌘"],
        ["Database Systems", "Dr. Priya", 4, 72, 76, "core", "▤"],
        ["Computer Networks", "Prof. Ramesh", 3, 60, 80, "core", "◎"],
        ["UI/UX Design", "Prof. Anjali", 2, 90, 92, "elective", "✦"]
    ];

    const grid = document.getElementById("subject-grid");
    const search = document.getElementById("subject-search");
    const filter = document.getElementById("subject-filter");

    function render() {
        const q = search.value.toLowerCase();

        const list = data.filter(x =>
            (x[0] + " " + x[1]).toLowerCase().includes(q) &&
            (filter.value === "all" || x[5] === filter.value)
        );

        grid.innerHTML = list.map(x => `
            <article class="card hoverable">

                <div class="card-header">
                    <span class="list-icon">${x[6]}</span>
                    <span class="pill">${x[5]}</span>
                </div>

                <h2>${x[0]}</h2>

                <p style="color:var(--muted)">
                    ${x[1]} · ${x[2]} credits
                </p>

                <div style="display:flex;justify-content:space-between;margin:18px 0 8px;font-size:12px">
                    <span>Course progress</span>
                    <strong>${x[3]}%</strong>
                </div>

                <div class="progress">
                    <span style="width:${x[3]}%"></span>
                </div>

                <div style="display:flex;justify-content:space-between;margin-top:17px;font-size:12px">
                    <span style="color:var(--muted)">Attendance</span>
                    <strong>${x[4]}%</strong>
                </div>

                <div class="progress" style="margin-top:8px">
                    <span style="width:${x[4]}%;background:${
                        x[4] < 75
                            ? 'var(--bad)'
                            : 'linear-gradient(90deg,var(--primary),var(--primary2))'
                    }"></span>
                </div>

                <a
                    class="btn btn-secondary"
                    style="margin-top:18px"
                    href="study-materials.html"
                >
                    View resources →
                </a>

            </article>
        `).join("") || '<div class="empty">No subjects match your search.</div>';
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);

    render();
});
