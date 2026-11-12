document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-timetable";
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const tabs = document.getElementById("day-tabs");
    const list = document.getElementById("class-list");
    const title = document.getElementById("day-title");
    const form = document.getElementById("class-form");
    const editor = document.getElementById("class-editor");
    const addButton = document.getElementById("add-class");
    const starterKey = "studenthub-timetable-starter-v1";
    let entries = [];
    let selectedDay = days[(new Date().getDay() + 6) % 7];
    const starterEntries = [
        ["Monday", "09:00", "Programming Fundamentals", "Room 201"],
        ["Monday", "11:00", "Discrete Mathematics", "Room 204"],
        ["Monday", "14:00", "Data Structures & Algorithms", "Lab 1"],
        ["Tuesday", "09:00", "Database Management Systems", "Room 203"],
        ["Tuesday", "11:00", "Programming Fundamentals", "Lab 2"],
        ["Tuesday", "14:00", "Discrete Mathematics", "Room 204"],
        ["Wednesday", "09:00", "Data Structures & Algorithms", "Room 201"],
        ["Wednesday", "11:00", "Database Management Systems", "Room 203"],
        ["Wednesday", "14:00", "Programming Fundamentals", "Lab 1"],
        ["Thursday", "09:00", "Discrete Mathematics", "Room 204"],
        ["Thursday", "11:00", "Data Structures & Algorithms", "Lab 2"],
        ["Thursday", "14:00", "Database Management Systems", "Room 203"],
        ["Friday", "09:00", "Programming Fundamentals", "Room 201"],
        ["Friday", "11:00", "Discrete Mathematics", "Room 204"],
        ["Friday", "14:00", "Data Structures & Algorithms", "Lab 1"]
    ].map(([day, time, subject, location]) => ({
        day, time, subject, location, sample: true
    }));

    try {
        const stored = localStorage.getItem(key);
        const saved = stored === null ? [] : JSON.parse(stored);
        if (!Array.isArray(saved)) throw new TypeError("Saved timetable must be a list.");
        if (Array.isArray(saved)) {
            entries = saved.filter(item =>
                item && days.includes(item.day) &&
                typeof item.time === "string" &&
                typeof item.subject === "string"
            ).map(item => ({
                day: item.day,
                time: item.time,
                subject: item.subject,
                location: typeof item.location === "string" ? item.location : "",
                sample: item.sample === true
            }));
        }
        if (saved.length) {
            localStorage.setItem(starterKey, "true");
        } else if (localStorage.getItem(starterKey) !== "true") {
            entries = starterEntries.map(item => ({ ...item }));
            localStorage.setItem(key, JSON.stringify(entries));
            localStorage.setItem(starterKey, "true");
        }
    } catch (error) {
        console.error("Could not load timetable entries.", error);
        showToast("Timetable could not be loaded or starter examples could not be saved.");
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify(entries));
            return true;
        } catch (error) {
            console.error("Could not save timetable entries.", error);
            showToast("Could not save timetable changes. Check browser storage.");
            return false;
        }
    }

    function renderTabs() {
        tabs.replaceChildren();
        days.forEach(day => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = day === selectedDay ? "btn btn-primary" : "btn btn-secondary";
            button.dataset.day = day;
            button.setAttribute("aria-pressed", String(day === selectedDay));
            button.textContent = day.slice(0, 3);
            tabs.append(button);
        });
    }

    function renderSchedule() {
        document.getElementById("timetable-sample-note").hidden =
            !entries.some(entry => entry.sample);
        title.textContent = `${selectedDay} schedule`;
        list.replaceChildren();
        const dayEntries = entries
            .map((entry, index) => ({ entry, index }))
            .filter(({ entry }) => entry.day === selectedDay)
            .sort((a, b) => a.entry.time.localeCompare(b.entry.time));

        if (!dayEntries.length) {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = `No classes added for ${selectedDay}.`;
            list.append(empty);
            return;
        }

        dayEntries.forEach(({ entry, index }) => {
            const row = document.createElement("div");
            row.className = "list-row";
            const time = document.createElement("span");
            time.className = "list-icon";
            time.textContent = entry.time;
            const details = document.createElement("div");
            details.className = "list-main";
            const subject = document.createElement("strong");
            subject.textContent = entry.subject;
            const location = document.createElement("small");
            location.textContent = entry.location || "Location not set";
            details.append(subject, location);
            if (entry.sample) {
                const sample = document.createElement("span");
                sample.className = "pill warn";
                sample.textContent = "Sample";
                details.append(sample);
            }
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "btn btn-quiet";
            remove.dataset.remove = String(index);
            remove.setAttribute("aria-label", `Remove ${entry.subject}`);
            remove.textContent = "Remove";
            row.append(time, details, remove);
            list.append(row);
        });
    }

    function render() {
        renderTabs();
        renderSchedule();
    }

    tabs.addEventListener("click", event => {
        const button = event.target.closest("[data-day]");
        if (!button) return;
        selectedDay = button.dataset.day;
        render();
    });

    document.getElementById("today-btn").addEventListener("click", () => {
        selectedDay = days[(new Date().getDay() + 6) % 7];
        render();
    });

    addButton.addEventListener("click", () => {
        editor.hidden = !editor.hidden;
        addButton.setAttribute("aria-expanded", String(!editor.hidden));
        if (!editor.hidden) {
            document.getElementById("class-day").value = selectedDay;
            document.getElementById("class-subject").focus();
        }
    });

    document.getElementById("cancel-class").addEventListener("click", () => {
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(form);
        const entry = {
            day: String(data.get("day") || ""),
            time: String(data.get("time") || ""),
            subject: String(data.get("subject") || "").trim(),
            location: String(data.get("location") || "").trim()
        };
        if (!days.includes(entry.day) || !entry.time || !entry.subject) return;

        entries.push(entry);
        if (!save()) {
            entries.pop();
            return;
        }
        selectedDay = entry.day;
        form.reset();
        editor.hidden = true;
        addButton.setAttribute("aria-expanded", "false");
        render();
        showToast("Timetable entry added");
    });

    list.addEventListener("click", event => {
        const button = event.target.closest("[data-remove]");
        if (!button) return;
        const index = Number(button.dataset.remove);
        const [removed] = entries.splice(index, 1);
        if (!removed) return;
        if (!save()) {
            entries.splice(index, 0, removed);
            return;
        }
        renderSchedule();
        showToast("Timetable entry removed");
    });

    render();
});
