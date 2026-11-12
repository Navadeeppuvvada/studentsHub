
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-placement-progress";
    let started = [];
    try {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved)) started = saved.filter(index =>
            Number.isInteger(index) && index >= 0 && index < 4
        );
    } catch (error) {
        console.error("Could not load placement progress.", error);
        showToast("Saved career progress could not be loaded.");
    }

    const data = [
        [
            "Resume checklist",
            "Add your latest projects, skills and contact details.",
            "Preparation"
        ],
        [
            "DSA interview practice",
            "Practice arrays, recursion, trees and hash maps regularly.",
            "Technical"
        ],
        [
            "Communication practice",
            "Prepare a short introduction and explain one project clearly.",
            "Communication"
        ],
        [
            "Opportunity tracker",
            "Record role, deadline, application status and follow-up.",
            "Planning"
        ]
    ];

    const grid = document.getElementById("placement-grid");

    function render() {
        grid.innerHTML = data.map((x, i) => `
            <article class="card">
                <div class="card-header">
                    <span class="list-icon">${["▤", "⌘", "◉", "↗"][i]}</span>
                    <span class="pill">${x[2]}</span>
                </div>
                <h2>${x[0]}</h2>
                <p style="color:var(--muted)">${x[1]}</p>
                <button class="btn ${started.includes(i) ? 'btn-primary' : 'btn-secondary'}"
                        data-done="${i}" aria-pressed="${started.includes(i)}">
                    ${started.includes(i) ? "In progress ✓" : "Mark as started"}
                </button>
            </article>
        `).join("");
        grid.querySelectorAll("[data-done]").forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.done);
                const previous = started.slice();
                started = started.includes(index)
                    ? started.filter(item => item !== index)
                    : [...started, index];
                try {
                    localStorage.setItem(key, JSON.stringify(started));
                } catch (error) {
                    started = previous;
                    console.error("Could not save placement progress.", error);
                    showToast("Could not save career progress. Check browser storage.");
                    return;
                }
                showToast(started.includes(index) ? "Preparation step started" : "Preparation step cleared");
                render();
            });
        });
    }

    render();
});
