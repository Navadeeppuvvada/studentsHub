
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-announcements-read";

    let read = JSON.parse(localStorage.getItem(key) || "[]");

    const data = [
        [
            "EXAM",
            "Mid-semester examination schedule",
            "Check the official ERP for the latest schedule and room details.",
            "Today"
        ],
        [
            "ACADEMIC",
            "Assignment submission reminder",
            "Review upcoming deadlines and submit work before the due date.",
            "Yesterday"
        ],
        [
            "CAMPUS",
            "AI & Future Technologies workshop",
            "Workshop registration details will be shared by the organizing team.",
            "This week"
        ],
        [
            "PLACEMENT",
            "Career preparation session",
            "Bring your updated resume and prepare a short introduction.",
            "This week"
        ]
    ];

    const grid = document.getElementById("announcement-grid");

    function render() {
        grid.innerHTML = data.map((x, i) => `
            <article class="card">
                <div class="card-header">
                    <span class="pill">${x[0]}</span>

                    <span class="pill ${read.includes(i) ? 'good' : 'warn'}">
                        ${read.includes(i) ? 'Read' : 'Unread'}
                    </span>
                </div>

                <h2>${x[1]}</h2>

                <p style="color:var(--muted)">
                    ${x[2]}
                </p>

                <div class="card-header" style="margin:20px 0 0">
                    <small style="color:var(--dim)">
                        ${x[3]}
                    </small>

                    <button class="btn btn-secondary" data-read="${i}">
                        ${read.includes(i) ? 'Read ✓' : 'Mark as read'}
                    </button>
                </div>
            </article>
        `).join("");

        grid.querySelectorAll("[data-read]").forEach(b => {
            b.addEventListener("click", () => {
                const i = +b.dataset.read;

                if (!read.includes(i)) {
                    read.push(i);
                }

                localStorage.setItem(key, JSON.stringify(read));

                render();
            });
        });
    }

    document.getElementById("read-all").addEventListener("click", () => {
        read = data.map((_, i) => i);

        localStorage.setItem(key, JSON.stringify(read));

        render();

        showToast("All announcements marked as read");
    });

    render();
});
