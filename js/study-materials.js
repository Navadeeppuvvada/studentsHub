
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-materials";

    let items = JSON.parse(localStorage.getItem(key) || "null") || [
        {
            title: "Java Collections — revision notes",
            subject: "Java Programming",
            type: "Notes",
            url: "[https://docs.oracle.com/en/java/](https://docs.oracle.com/en/java/)"
        },
        {
            title: "Binary tree traversal practice",
            subject: "Data Structures",
            type: "Practice",
            url: "[https://leetcode.com/](https://leetcode.com/)"
        },
        {
            title: "Probability distributions overview",
            subject: "Engineering Mathematics",
            type: "Video",
            url: "[https://www.khanacademy.org/math/statistics-probability](https://www.khanacademy.org/math/statistics-probability)"
        },
        {
            title: "HTML, CSS and JavaScript reference",
            subject: "Web Development",
            type: "Documentation",
            url: "[https://developer.mozilla.org/](https://developer.mozilla.org/)"
        }
    ];

    const grid = document.getElementById("materials-grid");
    const search = document.getElementById("material-search");
    const filter = document.getElementById("material-type");

    function render() {
        const q = search.value.toLowerCase();

        const list = items.filter(x =>
            (x.title + " " + x.subject).toLowerCase().includes(q) &&
            (filter.value === "all" || x.type === filter.value)
        );

        grid.innerHTML = list.map((x, i) => `
            <article class="card hoverable">
                <div class="card-header">
                    <span class="list-icon">▧</span>
                    <span class="pill">${x.type}</span>
                </div>

                <h2>${x.title}</h2>

                <p style="color:var(--muted)">
                    ${x.subject}
                </p>

                <a
                    class="btn btn-secondary"
                    href="${x.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open resource ↗
                </a>
            </article>
        `).join("") || '<div class="empty">No resources match your search.</div>';
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);

    document.getElementById("add-material").addEventListener("click", () => {
        const title = prompt("Resource title:");

        if (!title?.trim()) return;

        const subject = prompt("Subject:", "General") || "General";

        const url = prompt(
            "Resource URL (https://...):",
            "https://"
        ) || "";

        if (!/^https?:\/\/ /i.test(url)) {
            showToast("Please enter a valid http(s) URL");
            return;
        }

        items.unshift({
            title: title.trim(),
            subject,
            type: "Notes",
            url
        });

        localStorage.setItem(key, JSON.stringify(items));

        render();

        showToast("Resource added");
    });

    render();
});
