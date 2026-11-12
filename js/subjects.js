document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-subjects";
    const grid = document.getElementById("subject-grid");
    const search = document.getElementById("subject-search");
    const filter = document.getElementById("subject-filter");
    const form = document.getElementById("subject-form");
    const editor = document.getElementById("subject-editor");
    const addButton = document.getElementById("add-subject");
    const starterKey = "studenthub-subjects-starter-v1";
    const starterSubjects = [
        { name: "Programming Fundamentals", type: "core" },
        { name: "Data Structures & Algorithms", type: "core" },
        { name: "Database Management Systems", type: "core" },
        { name: "Discrete Mathematics", type: "core" }
    ];
    let subjects = [];

    try {
        const stored = localStorage.getItem(key);
        const saved = stored === null ? [] : JSON.parse(stored);
        if (!Array.isArray(saved)) throw new TypeError("Saved subjects must be a list.");
        if (Array.isArray(saved)) {
            subjects = saved.filter(item => item && typeof item.name === "string")
                .map(item => ({
                    name: item.name,
                    instructor: typeof item.instructor === "string" ? item.instructor : "",
                    credits: Number(item.credits) || 0,
                    progress: Math.min(100, Math.max(0, Number(item.progress) || 0)),
                    type: item.type === "elective" ? "elective" : "core",
                    sample: item.sample === true
                }));
        }
        if (saved.length) {
            localStorage.setItem(starterKey, "true");
        } else if (localStorage.getItem(starterKey) !== "true") {
            subjects = starterSubjects.map(item => ({
                ...item,
                instructor: "",
                credits: 0,
                progress: 0,
                sample: true
            }));
            localStorage.setItem(key, JSON.stringify(subjects));
            localStorage.setItem(starterKey, "true");
        }
    } catch (error) {
        console.error("Could not load subjects from browser storage.", error);
        showToast("Subjects could not be loaded or starter examples could not be saved.");
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify(subjects));
            return true;
        } catch (error) {
            console.error("Could not save subjects.", error);
            showToast("Could not save subjects. Check browser storage.");
            return false;
        }
    }

    function render() {
        document.getElementById("subjects-sample-note").hidden =
            !subjects.some(subject => subject.sample);
        const query = search.value.trim().toLowerCase();
        const filtered = subjects.filter(subject =>
            `${subject.name} ${subject.instructor}`.toLowerCase().includes(query) &&
            (filter.value === "all" || subject.type === filter.value)
        );
        grid.replaceChildren();

        if (!filtered.length) {
            const empty = document.createElement("div");
            empty.className = "empty";
            empty.textContent = subjects.length
                ? "No subjects match your search."
                : "No subjects yet. Add a subject to start tracking your semester.";
            grid.append(empty);
            return;
        }

        filtered.forEach(subject => {
            const card = document.createElement("article");
            card.className = "card hoverable";

            const header = document.createElement("div");
            header.className = "card-header";
            const icon = document.createElement("span");
            icon.className = "list-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "▦";
            const badge = document.createElement("span");
            badge.className = "pill";
            badge.textContent = subject.type === "core" ? "Core" : "Elective";
            header.append(icon, badge);
            if (subject.sample) {
                const sampleBadge = document.createElement("span");
                sampleBadge.className = "pill warn";
                sampleBadge.textContent = "Sample";
                header.append(sampleBadge);
            }

            const title = document.createElement("h2");
            title.textContent = subject.name;
            const instructor = document.createElement("p");
            instructor.style.color = "var(--muted)";
            instructor.textContent = [
                subject.instructor,
                subject.credits ? `${subject.credits} credits` : ""
            ].filter(Boolean).join(" · ") || "Instructor and credits not set";

            const progressLine = document.createElement("div");
            progressLine.className = "subject-progress-label";
            const progressText = document.createElement("span");
            progressText.textContent = "Course progress";
            const progressValue = document.createElement("strong");
            progressValue.textContent = `${subject.progress}%`;
            progressLine.append(progressText, progressValue);

            const progress = document.createElement("div");
            progress.className = "progress";
            const fill = document.createElement("span");
            fill.style.width = `${subject.progress}%`;
            progress.append(fill);

            const resources = document.createElement("a");
            resources.className = "btn btn-secondary";
            resources.style.marginTop = "18px";
            resources.href = "study-materials.html";
            resources.textContent = "View resources →";

            const remove = document.createElement("button");
            remove.className = "btn btn-quiet";
            remove.type = "button";
            remove.dataset.removeSubject = subject.name;
            remove.textContent = "Remove subject";

            card.append(header, title, instructor, progressLine, progress, resources, remove);
            grid.append(card);
        });
    }

    addButton.addEventListener("click", () => {
        editor.hidden = !editor.hidden;
        addButton.setAttribute("aria-expanded", String(!editor.hidden));
        if (!editor.hidden) document.getElementById("subject-name").focus();
    });

    document.getElementById("cancel-subject").addEventListener("click", () => {
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        if (!name) return;
        if (subjects.some(subject => subject.name.toLowerCase() === name.toLowerCase())) {
            showToast("That subject is already on your list.");
            return;
        }

        subjects.push({
            name,
            instructor: String(data.get("instructor") || "").trim(),
            credits: Number(data.get("credits")) || 0,
            progress: Math.min(100, Math.max(0, Number(data.get("progress")) || 0)),
            type: data.get("type") === "elective" ? "elective" : "core"
        });
        if (!save()) {
            subjects.pop();
            return;
        }
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
        render();
        showToast("Subject added");
    });

    grid.addEventListener("click", event => {
        const button = event.target.closest("[data-remove-subject]");
        if (!button) return;
        const index = subjects.findIndex(subject => subject.name === button.dataset.removeSubject);
        if (index < 0) return;
        const [removed] = subjects.splice(index, 1);
        if (!save()) {
            subjects.splice(index, 0, removed);
            return;
        }
        render();
        showToast("Subject removed");
    });

    search.addEventListener("input", render);
    filter.addEventListener("change", render);
    render();
});
