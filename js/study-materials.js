document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-materials";
    const grid = document.getElementById("materials-grid");
    const search = document.getElementById("material-search");
    const filter = document.getElementById("material-type");
    const form = document.getElementById("material-form");
    const editor = document.getElementById("material-editor");
    const addButton = document.getElementById("add-material");
    const starterKey = "studenthub-materials-starter-v1";
    const starterResources = [
        {
            title: "HTML Documentation — MDN",
            subject: "Web Development",
            type: "Documentation",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
            sample: true
        },
        {
            title: "JavaScript Guide — MDN",
            subject: "Programming",
            type: "Documentation",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            sample: true
        },
        {
            title: "Java SE 21 API Documentation — Oracle",
            subject: "Java",
            type: "Documentation",
            url: "https://docs.oracle.com/en/java/javase/21/docs/api/index.html",
            sample: true
        },
        {
            title: "Linear Algebra — MIT OpenCourseWare",
            subject: "Mathematics",
            type: "Video",
            url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
            sample: true
        }
    ];
    let items = [];

    try {
        const stored = localStorage.getItem(key);
        const saved = stored === null ? [] : JSON.parse(stored);
        if (!Array.isArray(saved)) throw new TypeError("Saved study materials must be a list.");
        if (Array.isArray(saved)) {
            items = saved.filter(item =>
                item && typeof item.title === "string" &&
                typeof item.subject === "string" &&
                typeof item.url === "string"
            ).map(item => ({
                title: item.title,
                subject: item.subject,
                type: typeof item.type === "string" ? item.type : "Notes",
                url: item.url,
                sample: item.sample === true
            }));
        }
        if (saved.length) {
            localStorage.setItem(starterKey, "true");
        } else if (localStorage.getItem(starterKey) !== "true") {
            items = starterResources.map(item => ({ ...item }));
            localStorage.setItem(key, JSON.stringify(items));
            localStorage.setItem(starterKey, "true");
        }
    } catch (error) {
        console.error("Could not load study resources.", error);
        showToast("Study materials could not be loaded or starter resources could not be saved.");
    }

    function safeUrl(value) {
        try {
            const parsed = new URL(value);
            return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
        } catch {
            return null;
        }
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error("Could not save study resources.", error);
            showToast("Could not save resources. Check browser storage.");
            return false;
        }
    }

    function render() {
        document.getElementById("materials-sample-note").hidden =
            !items.some(item => item.sample);
        const query = search.value.trim().toLowerCase();
        const filtered = items.map((item, index) => ({ item, index })).filter(({ item }) =>
            `${item.title} ${item.subject}`.toLowerCase().includes(query) &&
            (filter.value === "all" || item.type === filter.value)
        );
        grid.replaceChildren();
        if (!filtered.length) {
            const empty = document.createElement("div");
            empty.className = "empty";
            empty.textContent = items.length
                ? "No resources match your search."
                : "No study materials added yet. Save a trusted resource to keep it handy.";
            grid.append(empty);
            return;
        }

        filtered.forEach(({ item, index }) => {
            const card = document.createElement("article");
            card.className = "card hoverable";
            const header = document.createElement("div");
            header.className = "card-header";
            const icon = document.createElement("span");
            icon.className = "list-icon";
            icon.textContent = "▧";
            icon.setAttribute("aria-hidden", "true");
            const type = document.createElement("span");
            type.className = "pill";
            type.textContent = item.type;
            header.append(icon, type);
            if (item.sample) {
                const sample = document.createElement("span");
                sample.className = "pill warn";
                sample.textContent = "Starter";
                header.append(sample);
            }

            const title = document.createElement("h2");
            title.textContent = item.title;
            const subject = document.createElement("p");
            subject.style.color = "var(--muted)";
            subject.textContent = item.subject;
            const open = document.createElement("a");
            const url = safeUrl(item.url);
            if (url) {
                open.className = "btn btn-secondary";
                open.href = url;
                open.target = "_blank";
                open.rel = "noopener noreferrer";
                open.textContent = "Open resource ↗";
            } else {
                open.className = "btn btn-secondary";
                open.textContent = "Invalid saved URL";
                open.setAttribute("aria-disabled", "true");
            }
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "btn btn-quiet";
            remove.dataset.remove = String(index);
            remove.textContent = "Remove resource";
            card.append(header, title, subject, open, remove);
            grid.append(card);
        });
    }

    addButton.addEventListener("click", () => {
        editor.hidden = !editor.hidden;
        addButton.setAttribute("aria-expanded", String(!editor.hidden));
        if (!editor.hidden) document.getElementById("material-title").focus();
    });

    document.getElementById("cancel-material").addEventListener("click", () => {
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(form);
        const url = safeUrl(String(data.get("url") || "").trim());
        const title = String(data.get("title") || "").trim();
        const subject = String(data.get("subject") || "").trim();
        if (!url) {
            const input = document.getElementById("material-url");
            input.setCustomValidity("Enter a valid http or https URL.");
            input.reportValidity();
            return;
        }
        document.getElementById("material-url").setCustomValidity("");
        if (!title || !subject) return;

        items.unshift({ title, subject, type: String(data.get("type") || "Notes"), url });
        if (!save()) {
            items.shift();
            return;
        }
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
        render();
        showToast("Resource added");
    });

    grid.addEventListener("click", event => {
        const button = event.target.closest("[data-remove]");
        if (!button) return;
        const index = Number(button.dataset.remove);
        const [removed] = items.splice(index, 1);
        if (!removed) return;
        if (!save()) {
            items.splice(index, 0, removed);
            return;
        }
        render();
        showToast("Resource removed");
    });

    document.getElementById("material-url").addEventListener("input", event => {
        event.target.setCustomValidity("");
    });
    search.addEventListener("input", render);
    filter.addEventListener("change", render);
    render();
});
