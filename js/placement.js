
document.addEventListener("DOMContentLoaded", () => {
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

    grid.innerHTML = data.map((x, i) => `
        <article class="card">
            <div class="card-header">
                <span class="list-icon">
                    ${["▤", "⌘", "◉", "↗"][i]}
                </span>

                <span class="pill">${x[2]}</span>
            </div>

            <h2>${x[0]}</h2>

            <p style="color:var(--muted)">
                ${x[1]}
            </p>

            <button class="btn btn-secondary" data-done="${i}">
                Mark as started
            </button>
        </article>
    `).join("");

    grid.querySelectorAll("[data-done]").forEach(b => {
        b.addEventListener("click", () => {
            b.textContent = "In progress ✓";
            b.className = "btn btn-primary";
            b.disabled = true;

            showToast("Career preparation progress updated");
        });
    });

    document.getElementById("resume-btn").addEventListener("click", () => {
        showToast(
            "Add your resume to your preferred secure storage; this demo does not upload files."
        );
    });
});
