
document.addEventListener("DOMContentLoaded", () => {
    const data = [
        [
            "Workshop",
            "Build with AI: Intro Workshop",
            "Explore practical AI tools with fellow students.",
            "24 Oct",
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
            "28 Oct",
            "↗"
        ],
        [
            "Workshop",
            "UI/UX Design Sprint",
            "Learn the basics of wireframes and user flows.",
            "30 Oct",
            "◈"
        ]
    ];

    const grid = document.getElementById("event-grid");
    const search = document.getElementById("event-search");
    const filter = document.getElementById("event-filter");
    const key = "studenthub-event-registrations";

    let registered = JSON.parse(localStorage.getItem(key) || "[]");

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
                            ${registered.includes(x.i) ? 'disabled' : ''}
                        >
                            ${
                                registered.includes(x.i)
                                    ? 'Registered ✓'
                                    : 'Register'
                            }
                        </button>
                    </div>
                </article>
            `)
            .join("") || '<div class="empty">No events match your search.</div>';

        grid.querySelectorAll("[data-register]").forEach(b => {
            b.addEventListener("click", () => {
                registered.push(+b.dataset.register);

                localStorage.setItem(key, JSON.stringify(registered));

                render();

                showToast("Registration saved in this browser");
            });
        });
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);

    render();
});
