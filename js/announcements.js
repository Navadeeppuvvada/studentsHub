
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-announcements-read";

    let read = [];
    try {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved)) read = saved.filter(Number.isInteger);
    } catch (error) {
        console.error("Could not load announcement read state.", error);
        showToast("Announcement read states could not be loaded.");
    }

    const data = [
        [
            "EXAM",
            "Mid-semester examination schedule",
            "Check the official ERP for the latest schedule and room details.",
            "Example notice"
        ],
        [
            "ACADEMIC",
            "Assignment submission reminder",
            "Review upcoming deadlines and submit work before the due date.",
            "Example notice"
        ],
        [
            "CAMPUS",
            "AI & Future Technologies workshop",
            "Workshop registration details will be shared by the organizing team.",
            "Example notice"
        ],
        [
            "PLACEMENT",
            "Career preparation session",
            "Bring your updated resume and prepare a short introduction.",
            "Example notice"
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

                    <button class="btn btn-secondary" data-read="${i}" aria-pressed="${read.includes(i)}">
                        ${read.includes(i) ? 'Mark as unread' : 'Mark as read'}
                    </button>
                </div>
            </article>
        `).join("");

        grid.querySelectorAll("[data-read]").forEach(b => {
            b.addEventListener("click", () => {
                const i = +b.dataset.read;
                const previous = read.slice();
                read = read.includes(i)
                    ? read.filter(item => item !== i)
                    : [...read, i];
                try {
                    localStorage.setItem(key, JSON.stringify(read));
                } catch (error) {
                    read = previous;
                    console.error("Could not save announcement read state.", error);
                    showToast("Could not save this read state. Check browser storage.");
                    return;
                }
                render();
            });
        });
    }

    document.getElementById("read-all").addEventListener("click", () => {
        const previous = read.slice();
        read = data.map((_, i) => i);

        try {
            localStorage.setItem(key, JSON.stringify(read));
        } catch (error) {
            read = previous;
            console.error("Could not save announcement read state.", error);
            showToast("Could not save read states. Check browser storage.");
            return;
        }

        render();

        showToast("All announcements marked as read");
    });

    render();
});
