document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-attendance";
    const grid = document.getElementById("attendance-grid");
    const form = document.getElementById("attendance-form");
    const editor = document.getElementById("attendance-editor");
    const addButton = document.getElementById("add-attendance");
    const starterKey = "studenthub-attendance-starter-v1";
    const starterRecords = [
        { subject: "Programming Fundamentals", attended: 17, total: 20, sample: true },
        { subject: "Data Structures & Algorithms", attended: 18, total: 20, sample: true },
        { subject: "Database Management Systems", attended: 15, total: 20, sample: true }
    ];
    let records = [];

    try {
        const stored = localStorage.getItem(key);
        const saved = stored === null ? [] : JSON.parse(stored);
        if (!Array.isArray(saved)) throw new TypeError("Saved attendance must be a list.");
        if (Array.isArray(saved)) {
            records = saved.filter(item =>
                item && typeof item.subject === "string" &&
                Number.isFinite(Number(item.attended)) &&
                Number.isFinite(Number(item.total)) &&
                Number(item.total) > 0 &&
                Number(item.attended) >= 0 &&
                Number(item.attended) <= Number(item.total)
            ).map(item => ({
                subject: item.subject,
                attended: Number(item.attended),
                total: Number(item.total),
                sample: item.sample === true
            }));
        }
        if (saved.length) {
            localStorage.setItem(starterKey, "true");
        } else if (localStorage.getItem(starterKey) !== "true") {
            records = starterRecords.map(item => ({ ...item }));
            localStorage.setItem(key, JSON.stringify(records));
            localStorage.setItem(starterKey, "true");
        }
    } catch (error) {
        console.error("Could not load attendance from browser storage.", error);
        showToast("Attendance could not be loaded or starter examples could not be saved.");
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify(records));
            return true;
        } catch (error) {
            console.error("Could not save attendance.", error);
            showToast("Could not save attendance. Check browser storage.");
            return false;
        }
    }

    function render() {
        document.getElementById("attendance-sample-note").hidden =
            !records.some(record => record.sample);
        const total = records.reduce((sum, item) => sum + item.total, 0);
        const attended = records.reduce((sum, item) => sum + item.attended, 0);
        document.getElementById("attendance-average").textContent =
            total ? `${Math.round(attended / total * 100)}%` : "—";
        document.getElementById("attendance-subject-count").textContent = records.length;
        const summaryNote = document.getElementById("attendance-summary-note");
        summaryNote.textContent = records.some(record => record.sample)
            ? "Example values · replace with your actual attendance"
            : "Weighted across your recorded classes";

        const options = document.getElementById("attendance-subject-options");
        options.replaceChildren();
        try {
            const subjects = JSON.parse(localStorage.getItem("studenthub-subjects") || "[]");
            if (Array.isArray(subjects)) {
                subjects.forEach(subject => {
                    if (typeof subject.name !== "string") return;
                    const option = document.createElement("option");
                    option.value = subject.name;
                    options.append(option);
                });
            }
        } catch (error) {
            console.warn("Could not load subject suggestions.", error);
        }

        grid.replaceChildren();
        if (!records.length) {
            const empty = document.createElement("div");
            empty.className = "card empty";
            empty.textContent = "No attendance records yet. Add your first subject and the classes attended/held.";
            grid.append(empty);
            return;
        }

        records.forEach((record, index) => {
            const percent = Math.round(record.attended / record.total * 100);
            const needed = Math.max(0, Math.ceil(3 * record.total - 4 * record.attended));
            const card = document.createElement("article");
            card.className = "card";
            const header = document.createElement("div");
            header.className = "card-header";
            const title = document.createElement("h2");
            title.textContent = record.subject;
            const badge = document.createElement("span");
            badge.className = `pill ${percent >= 75 ? "good" : "warn"}`;
            badge.textContent = `${percent}%`;
            header.append(title, badge);
            if (record.sample) {
                const sampleBadge = document.createElement("span");
                sampleBadge.className = "pill warn";
                sampleBadge.textContent = "Sample";
                header.append(sampleBadge);
            }
            const summary = document.createElement("p");
            summary.textContent = `${record.attended} of ${record.total} classes attended`;
            const bar = document.createElement("div");
            bar.className = "progress";
            const fill = document.createElement("span");
            fill.style.width = `${percent}%`;
            bar.append(fill);
            const note = document.createElement("p");
            note.className = "stat-note";
            note.textContent = needed
                ? `Attend the next ${needed} classes to reach the 75% target.`
                : "At or above the 75% target.";
            const remove = document.createElement("button");
            remove.className = "btn btn-quiet";
            remove.type = "button";
            remove.dataset.remove = String(index);
            remove.textContent = "Remove record";
            card.append(header, summary, bar, note, remove);
            grid.append(card);
        });
    }

    addButton.addEventListener("click", () => {
        editor.hidden = !editor.hidden;
        addButton.setAttribute("aria-expanded", String(!editor.hidden));
        if (!editor.hidden) document.getElementById("attendance-subject").focus();
    });

    document.getElementById("cancel-attendance").addEventListener("click", () => {
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(form);
        const subject = String(data.get("subject") || "").trim();
        const attended = Number(data.get("attended"));
        const total = Number(data.get("total"));
        if (!subject || !Number.isInteger(attended) || !Number.isInteger(total) ||
            total < 1 || attended < 0 || attended > total) {
            showToast("Enter a subject and valid class counts; attended cannot exceed held.");
            return;
        }

        const index = records.findIndex(item =>
            item.subject.toLowerCase() === subject.toLowerCase()
        );
        const previous = index >= 0 ? records[index] : null;
        const record = { subject, attended, total };
        if (index >= 0) records[index] = record;
        else records.push(record);
        if (!save()) {
            if (index >= 0) records[index] = previous;
            else records.pop();
            return;
        }

        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
        render();
        showToast(index >= 0 ? "Attendance record updated" : "Attendance record added");
    });

    grid.addEventListener("click", event => {
        const button = event.target.closest("[data-remove]");
        if (!button) return;
        const index = Number(button.dataset.remove);
        const [removed] = records.splice(index, 1);
        if (!removed) return;
        if (!save()) {
            records.splice(index, 0, removed);
            return;
        }
        render();
        showToast("Attendance record removed");
    });

    render();
});
