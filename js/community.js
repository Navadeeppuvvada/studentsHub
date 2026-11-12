document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-community-posts";
    const list = document.getElementById("post-list");
    const postForm = document.getElementById("community-post-form");
    const postText = document.getElementById("post-text");
    let posts = [];
    let author = "Student";

    try {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(saved)) {
            posts = saved.filter(item =>
                item && typeof (item.body || item.content || item.title) === "string"
            ).map((item, index) => ({
                id: typeof item.id === "string"
                    ? item.id
                    : `legacy-${index}-${Date.now()}`,
                body: item.body || item.content || item.title,
                author: typeof (item.author || item.name) === "string"
                    ? item.author || item.name : "Student",
                createdAt: String(item.createdAt || item.time || item.timestamp || ""),
                replies: Array.isArray(item.replies) ? item.replies
                    .filter(reply => reply && typeof (reply.body || reply.text || reply.message) === "string")
                    .map(reply => ({
                        author: typeof (reply.author || reply.name) === "string"
                            ? reply.author || reply.name : "Student",
                        body: reply.body || reply.text || reply.message,
                        createdAt: String(reply.createdAt || reply.time || "")
                    })) : []
            }));
        }
        const session = JSON.parse(sessionStorage.getItem("studentHubSession") || "null");
        author = session?.name || session?.displayName || author;
    } catch (error) {
        console.error("Could not load Community data.", error);
        showToast("Saved community posts could not be loaded.");
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify(posts));
            return true;
        } catch (error) {
            console.error("Could not save Community data.", error);
            showToast("Could not save your post. Check browser storage.");
            return false;
        }
    }

    function timeLabel(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? "Date unavailable"
            : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    }

    function render() {
        list.replaceChildren();
        if (!posts.length) {
            const empty = document.createElement("article");
            empty.className = "card empty";
            empty.textContent = "No posts yet. Start a discussion with your classmates.";
            list.append(empty);
            return;
        }

        posts.forEach(post => {
            const card = document.createElement("article");
            card.className = "card";
            const header = document.createElement("div");
            header.className = "card-header";
            const identity = document.createElement("div");
            identity.style.display = "flex";
            identity.style.alignItems = "center";
            identity.style.gap = "10px";
            const avatar = document.createElement("span");
            avatar.className = "user-avatar";
            avatar.textContent = (post.author || "S").trim().charAt(0).toUpperCase() || "S";
            const authorInfo = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = post.author || "Student";
            const time = document.createElement("small");
            time.style.display = "block";
            time.style.color = "var(--dim)";
            time.textContent = timeLabel(post.createdAt);
            authorInfo.append(name, time);
            identity.append(avatar, authorInfo);
            const tag = document.createElement("span");
            tag.className = "pill";
            tag.textContent = "Discussion";
            header.append(identity, tag);

            const title = document.createElement("h2");
            title.textContent = post.body.trim().split(/\s+/).slice(0, 10).join(" ");
            const body = document.createElement("p");
            body.style.color = "var(--muted)";
            body.style.whiteSpace = "pre-wrap";
            body.textContent = post.body;

            const replies = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = `Replies (${post.replies.length})`;
            replies.append(summary);
            post.replies.forEach(reply => {
                const replyRow = document.createElement("p");
                replyRow.className = "list-row";
                replyRow.textContent = `${reply.author || "Student"}: ${reply.body}`;
                replies.append(replyRow);
            });

            const replyForm = document.createElement("form");
            replyForm.className = "form-field";
            replyForm.dataset.replyForm = post.id;
            const replyInput = document.createElement("input");
            replyInput.className = "field";
            replyInput.name = "reply";
            replyInput.maxLength = 500;
            replyInput.required = true;
            replyInput.placeholder = "Write a helpful reply";
            replyInput.setAttribute("aria-label", `Reply to ${post.author}'s post`);
            const replyButton = document.createElement("button");
            replyButton.className = "btn btn-secondary";
            replyButton.type = "submit";
            replyButton.textContent = "Reply";
            replyForm.append(replyInput, replyButton);
            card.append(header, title, body, replies, replyForm);
            list.append(card);
        });
    }

    postForm.addEventListener("submit", event => {
        event.preventDefault();
        const body = postText.value.trim();
        if (!body) return;
        const post = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            body,
            author,
            createdAt: new Date().toISOString(),
            replies: []
        };
        posts.unshift(post);
        if (!save()) {
            posts.shift();
            return;
        }
        postForm.reset();
        render();
        showToast("Post saved in this browser");
    });

    list.addEventListener("submit", event => {
        const form = event.target.closest("[data-reply-form]");
        if (!form) return;
        event.preventDefault();
        const input = form.elements.namedItem("reply");
        const body = input.value.trim();
        const post = posts.find(item => item.id === form.dataset.replyForm);
        if (!post || !body) return;
        post.replies.push({ author, body, createdAt: new Date().toISOString() });
        if (!save()) {
            post.replies.pop();
            return;
        }
        render();
        showToast("Reply saved in this browser");
    });

    render();
});
