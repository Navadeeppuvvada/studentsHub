
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-community-posts";

    let posts = JSON.parse(localStorage.getItem(key) || "null") || [
        {
            name: "A fellow student",
            title: "Any tips for understanding BST deletion?",
            body: "I understand leaf and one-child cases. How do you reason about deleting a node with two children?",
            time: "Today"
        },
        {
            name: "Study group",
            title: "Weekend DSA practice",
            body: "Planning to solve a few recursion and tree problems this weekend. Share your favourite practice problems!",
            time: "Yesterday"
        }
    ];

    const list = document.getElementById("post-list");

    function render() {
        list.innerHTML = posts
            .map(p => `
                <article class="card">
                    <div class="card-header">
                        <div style="display:flex;align-items:center;gap:10px">
                            <span class="user-avatar">
                                ${p.name[0]}
                            </span>

                            <div>
                                <strong>${p.name}</strong>

                                <small style="display:block;color:var(--dim)">
                                    ${p.time}
                                </small>
                            </div>
                        </div>

                        <span class="pill">Discussion</span>
                    </div>

                    <h2>${p.title}</h2>

                    <p style="color:var(--muted)">
                        ${p.body}
                    </p>

                    <button class="btn btn-secondary" data-reply>
                        Reply
                    </button>
                </article>
            `)
            .join("");

        list.querySelectorAll("[data-reply]").forEach(b => {
            b.addEventListener("click", () =>
                showToast(
                    "Replies are a demo feature; connect a backend to enable shared discussions."
                )
            );
        });
    }

    document.getElementById("publish-post").addEventListener("click", () => {
        const body = document.getElementById("post-text").value.trim();

        if (!body) {
            showToast("Write something first");
            return;
        }

        posts.unshift({
            name: "Navadeep",
            title: body.length > 65 ? body.slice(0, 65) + "…" : body,
            body,
            time: "Just now"
        });

        localStorage.setItem(key, JSON.stringify(posts));

        document.getElementById("post-text").value = "";

        render();

        showToast("Post saved in this browser");
    });

    render();
});
