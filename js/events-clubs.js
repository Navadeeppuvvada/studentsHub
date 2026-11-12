
document.addEventListener("DOMContentLoaded", () => {
    const data = [
        [
            "Workshop",
            "Build with AI: Intro Workshop",
            "Explore practical AI tools with fellow students.",
            "Date to be announced",
            "✦"
        ],
        [
            "Club",
            "Developer Student Circle",
            "Meet peers, share projects and practice coding together.",
            "Every Friday",
            "⌘"
        ],
        [
            "Career",
            "Resume & Interview Lab",
            "Practice introductions and get feedback on your resume.",
            "Date to be announced",
            "↗"
        ],
        [
            "Workshop",
            "UI/UX Design Sprint",
            "Learn the basics of wireframes and user flows.",
            "Date to be announced",
            "◈"
        ]
    ];

    const grid = document.getElementById("event-grid");
    const search = document.getElementById("event-search");
    const filter = document.getElementById("event-filter");
    const key = "studenthub-event-registrations";

    let registered = [];
    try {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved)) registered = saved.filter(index =>
            Number.isInteger(index) && index >= 0 && index < data.length
        );
    } catch (error) {
        console.error("Could not load saved event interests.", error);
        showToast("Saved event interests could not be loaded.");
    }

    function render() {
        const q = search.value.toLowerCase();

        grid.innerHTML = data
            .map((x, i) => ({ ...x, i }))
            .filter(x =>
                (x[1] + " " + x[2]).toLowerCase().includes(q) &&
                (filter.value === "all" || x[0] === filter.value)
            )
            .map(x => `
                <article class="card hoverable">
                    <div class="card-header">
                        <span class="list-icon">${x[4]}</span>
                        <span class="pill">${x[0]}</span>
                    </div>

                    <h2>${x[1]}</h2>

                    <p style="color:var(--muted)">
                        ${x[2]}
                    </p>

                    <div class="card-header" style="margin:18px 0 0">
                        <small style="color:var(--dim)">
                            ◷ ${x[3]}
                        </small>

                        <button
                            class="btn ${
                                registered.includes(x.i)
                                    ? 'btn-secondary'
                                    : 'btn-primary'
                            }"
                            data-register="${x.i}"
                        >
                            ${
                                registered.includes(x.i)
                                    ? 'Interest saved · remove'
                                    : 'Save interest'
                            }
                        </button>
                    </div>
                </article>
            `)
            .join("") || '<div class="empty">No events match your search.</div>';

        grid.querySelectorAll("[data-register]").forEach(b => {
            b.addEventListener("click", () => {
                const index = +b.dataset.register;
                const hadInterest = registered.includes(index);
                registered = hadInterest
                    ? registered.filter(item => item !== index)
                    : [...registered, index];

                try {
                    localStorage.setItem(key, JSON.stringify(registered));
                } catch (error) {
                    registered = hadInterest
                        ? [...registered, index]
                        : registered.filter(item => item !== index);
                    console.error("Could not save event interest.", error);
                    showToast("Could not save your interest. Check browser storage.");
                    return;
                }

                render();

                showToast(hadInterest
                    ? "Saved interest removed"
                    : "Interest saved in this browser");
            });
        });
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);

    render();
});
