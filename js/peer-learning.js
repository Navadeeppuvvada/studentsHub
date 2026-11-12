
/* =========================================
   STUDENTHUB - PEER LEARNING & TUTORING
   JavaScript Functionality
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // DOM ELEMENTS
    // =====================================

    const modalOverlay = document.getElementById("modalOverlay");
    const dynamicForm = document.getElementById("dynamicForm");
    const formFields = document.getElementById("formFields");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    let currentFormType = "";
    let toastTimer;

    // Change this to your logged-in user's name if available.
    let currentUser = null;
    try {
        currentUser = JSON.parse(
            sessionStorage.getItem("studentHubSession") || "null"
        );
    } catch (error) {
        console.warn("Could not read the current StudentHub session.", error);
    }

    const studentName =
        currentUser?.name || currentUser?.displayName || "Student";

    const studentInitial =
        studentName.charAt(0).toUpperCase();


    // =====================================
    // LOCAL STORAGE
    // =====================================

    const STORAGE_KEYS = {
        tutors: "studenthub-peer-tutors",
        doubts: "studenthub-peer-doubts",
        groups: "studenthub-peer-groups",
        sessions: "studenthub-peer-sessions"
    };

    function loadData(key, defaultValue) {
        try {
            const stored = localStorage.getItem(key);

            if (!stored) {
                return defaultValue;
            }

            const parsed = JSON.parse(stored);

            return Array.isArray(parsed) ? parsed : defaultValue;

        } catch (error) {
            console.error("Unable to load stored data:", error);
            return defaultValue;
        }
    }

    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error("Unable to save data:", error);
            showToast("Unable to save data. Check browser storage.");
        }
    }


    // =====================================
    // DEMO DATA
    // =====================================

    const demoTutors = [
        {
            id: 1,
            name: "Rahul Sharma",
            year: "3rd Year B.Tech",
            branch: "CSE",
            subjects: ["Java", "Data Structures"],
            rating: 4.9,
            availability: "Available",
            bio: "Passionate about Java programming and helping juniors understand DSA concepts.",
            sessions: 32
        },

        {
            id: 2,
            name: "Priya Reddy",
            year: "3rd Year B.Tech",
            branch: "CSE",
            subjects: ["Python", "AIML"],
            rating: 4.8,
            availability: "Available",
            bio: "I enjoy explaining machine learning concepts through practical examples.",
            sessions: 24
        },

        {
            id: 3,
            name: "Arjun Kumar",
            year: "4th Year B.Tech",
            branch: "CSE",
            subjects: ["Web Development", "Java"],
            rating: 4.7,
            availability: "Busy",
            bio: "Frontend developer interested in React, JavaScript and building real projects.",
            sessions: 41
        },

        {
            id: 4,
            name: "Sneha Patel",
            year: "2nd Year B.Tech",
            branch: "ECE",
            subjects: ["Mathematics", "Python"],
            rating: 4.9,
            availability: "Available",
            bio: "I help students understand mathematical concepts with easy explanations.",
            sessions: 18
        },

        {
            id: 5,
            name: "Karthik Varma",
            year: "3rd Year B.Tech",
            branch: "CSE",
            subjects: ["DBMS", "Data Structures"],
            rating: 4.6,
            availability: "Available",
            bio: "Interested in databases, SQL queries and problem-solving techniques.",
            sessions: 21
        },

        {
            id: 6,
            name: "Ananya Rao",
            year: "4th Year B.Tech",
            branch: "IT",
            subjects: ["AIML", "Python"],
            rating: 4.8,
            availability: "Available",
            bio: "Can help with Python programming, AI fundamentals and ML algorithms.",
            sessions: 35
        }
    ];


    const demoDoubts = [
        {
            id: 101,
            title: "Understanding Binary Search Trees",
            description: "Can someone explain BST deletion with all three cases using a simple example?",
            subject: "Data Structures",
            author: "Vamsi",
            date: "Today",
            responses: 3,
            status: "Open"
        },

        {
            id: 102,
            title: "Java Inheritance and Polymorphism",
            description: "I am confused about method overriding and dynamic method dispatch. Need some examples.",
            subject: "Java",
            author: "Sanjana",
            date: "Today",
            responses: 2,
            status: "Open"
        },

        {
            id: 103,
            title: "PCA in Machine Learning",
            description: "Looking for someone who can explain the mathematical steps involved in PCA.",
            subject: "AIML",
            author: "Rohit",
            date: "Yesterday",
            responses: 1,
            status: "Open"
        }
    ];


    const demoGroups = [
        {
            id: 201,
            name: "Java Programming Club",
            subject: "Java",
            description: "Learn Java fundamentals, OOP concepts and advanced programming together.",
            members: 28,
            icon: "fa-code",
            joined: false
        },

        {
            id: 202,
            name: "DSA Problem Solvers",
            subject: "Data Structures",
            description: "Practice coding problems, discuss algorithms and improve problem-solving.",
            members: 42,
            icon: "fa-brain",
            joined: false
        },

        {
            id: 203,
            name: "AI & ML Explorers",
            subject: "AIML",
            description: "Explore artificial intelligence, machine learning and real-world projects.",
            members: 31,
            icon: "fa-robot",
            joined: false
        },

        {
            id: 204,
            name: "Web Development Hub",
            subject: "Web Development",
            description: "Build websites, share frontend knowledge and collaborate on projects.",
            members: 36,
            icon: "fa-globe",
            joined: false
        }
    ];


    // Initialize data only on the first visit.
    function initializeData() {

        if (!localStorage.getItem(STORAGE_KEYS.tutors)) {
            saveData(STORAGE_KEYS.tutors, demoTutors);
        }

        if (!localStorage.getItem(STORAGE_KEYS.doubts)) {
            saveData(STORAGE_KEYS.doubts, demoDoubts);
        }

        if (!localStorage.getItem(STORAGE_KEYS.groups)) {
            saveData(STORAGE_KEYS.groups, demoGroups);
        }

        if (!localStorage.getItem(STORAGE_KEYS.sessions)) {
            saveData(STORAGE_KEYS.sessions, []);
        }
    }


    // =====================================
    // GET DATA
    // =====================================

    function getTutors() {
        return loadData(STORAGE_KEYS.tutors, []);
    }

    function getDoubts() {
        return loadData(STORAGE_KEYS.doubts, []);
    }

    function getGroups() {
        return loadData(STORAGE_KEYS.groups, []);
    }

    function getSessions() {
        return loadData(STORAGE_KEYS.sessions, []);
    }


    // =====================================
    // SECURITY / HTML ESCAPING
    // =====================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }


    // =====================================
    // TOAST NOTIFICATIONS
    // =====================================

    function showToast(message) {

        toastMessage.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }


    // =====================================
    // DASHBOARD STATISTICS
    // =====================================

    function updateStatistics() {

        const tutors = getTutors();
        const doubts = getDoubts();
        const groups = getGroups();
        const sessions = getSessions();

        document.getElementById("tutorCount").textContent =
            tutors.length;

        document.getElementById("groupCount").textContent =
            groups.length;

        document.getElementById("doubtCount").textContent =
            doubts.filter(d => d.status === "Open").length;

        document.getElementById("sessionCount").textContent =
            sessions.filter(s => s.status === "Upcoming").length;
    }


    // =====================================
    // TAB NAVIGATION
    // =====================================

    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach(button => {

        button.addEventListener("click", () => {

            const selectedTab = button.dataset.tab;

            tabButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            tabPanels.forEach(panel =>
                panel.classList.remove("active")
            );

            button.classList.add("active");

            document.getElementById(selectedTab)
                .classList.add("active");

        });

    });


    function switchTab(tabName) {

        const button = document.querySelector(
            `.tab-btn[data-tab="${tabName}"]`
        );

        if (button) {
            button.click();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // =====================================
    // RENDER TUTORS
    // =====================================

    function renderTutors() {

        const tutorGrid = document.getElementById("tutorGrid");
        const search = document.getElementById("tutorSearch")
            .value.toLowerCase().trim();

        const subject = document.getElementById("subjectFilter").value;

        const availability =
            document.getElementById("availabilityFilter").value;

        const filteredTutors = getTutors().filter(tutor => {

            const matchesSearch =
                tutor.name.toLowerCase().includes(search) ||
                tutor.subjects.some(s =>
                    s.toLowerCase().includes(search)
                ) ||
                tutor.bio.toLowerCase().includes(search);

            const matchesSubject =
                subject === "all" || tutor.subjects.includes(subject);

            const matchesAvailability =
                availability === "all" ||
                tutor.availability === availability;

            return matchesSearch &&
                matchesSubject &&
                matchesAvailability;
        });


        tutorGrid.innerHTML = filteredTutors.map(tutor => {

            const initials = tutor.name
                .split(" ")
                .map(word => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

            return `
                <article class="tutor-card">

                    <div class="tutor-top">

                        <div class="tutor-avatar">
                            ${escapeHTML(initials)}
                        </div>

                        <div class="tutor-info">
                            <h3>${escapeHTML(tutor.name)}</h3>
                            <p>
                                ${escapeHTML(tutor.year)} ·
                                ${escapeHTML(tutor.branch)}
                            </p>
                        </div>

                        <span class="availability
                            ${tutor.availability === "Busy" ? "busy" : ""}">
                            ${escapeHTML(tutor.availability)}
                        </span>

                    </div>

                    <p class="tutor-bio">
                        ${escapeHTML(tutor.bio)}
                    </p>

                    <div class="tag-list">
                        ${tutor.subjects.map(subject => `
                            <span class="tag">
                                ${escapeHTML(subject)}
                            </span>
                        `).join("")}
                    </div>

                    <div class="tutor-meta">
                        <span>
                            <i class="fa-solid fa-star"></i>
                            ${Number(tutor.rating).toFixed(1)} Rating
                        </span>

                        <span>
                            <i class="fa-solid fa-book-open"></i>
                            ${Number(tutor.sessions) || 0} Sessions
                        </span>
                    </div>

                    <button class="card-action"
                        data-action="book"
                        data-id="${Number(tutor.id)}"
                        ${tutor.availability === "Busy" ? "disabled" : ""}>
                        <i class="fa-solid fa-calendar-plus"></i>
                        ${tutor.availability === "Busy" ?
                            "Currently Busy" : "Book a Session"}
                    </button>

                </article>
            `;

        }).join("");

        document.getElementById("tutorEmpty")
            .classList.toggle("hidden", filteredTutors.length > 0);

        tutorGrid.classList.toggle("hidden", filteredTutors.length === 0);

    }


    document.getElementById("tutorSearch")
        .addEventListener("input", renderTutors);

    document.getElementById("subjectFilter")
        .addEventListener("change", renderTutors);

    document.getElementById("availabilityFilter")
        .addEventListener("change", renderTutors);


    // =====================================
    // RENDER DOUBTS
    // =====================================

    function renderDoubts() {

        const doubts = getDoubts();
        const grid = document.getElementById("doubtGrid");

        grid.innerHTML = doubts.map(doubt => `

            <article class="doubt-card">

                <span class="doubt-category">
                    ${escapeHTML(doubt.subject)}
                </span>

                <h3>${escapeHTML(doubt.title)}</h3>

                <p>${escapeHTML(doubt.description)}</p>

                <div class="doubt-footer">

                    <span>
                        <i class="fa-solid fa-user"></i>
                        ${escapeHTML(doubt.author)}
                        · ${escapeHTML(doubt.date)}
                    </span>

                    <span class="doubt-status">
                        ${escapeHTML(doubt.status)}
                    </span>

                </div>

                <div class="doubt-footer">

                    <span>
                        <i class="fa-solid fa-comments"></i>
                        ${Number(doubt.responses) || 0} responses
                    </span>

                    <button data-action="help"
                        data-id="${Number(doubt.id)}">
                        I can help →
                    </button>

                </div>

            </article>

        `).join("");

        document.getElementById("doubtEmpty")
            .classList.toggle("hidden", doubts.length > 0);

        grid.classList.toggle("hidden", doubts.length === 0);
    }


    // =====================================
    // RENDER STUDY GROUPS
    // =====================================

    function renderGroups() {

        const groups = getGroups();
        const grid = document.getElementById("groupGrid");

        grid.innerHTML = groups.map(group => `

            <article class="group-card">

                <div class="group-icon">
                    <i class="fa-solid ${escapeHTML(group.icon)}"></i>
                </div>

                <span class="doubt-category">
                    ${escapeHTML(group.subject)}
                </span>

                <h3>${escapeHTML(group.name)}</h3>

                <p>${escapeHTML(group.description)}</p>

                <div class="group-members">
                    <i class="fa-solid fa-users"></i>
                    ${Number(group.members) || 0} Members
                </div>

                <div class="group-footer">

                    <span>
                        Student Learning Group
                    </span>

                    <button
                        data-action="join"
                        data-id="${Number(group.id)}"
                        class="${group.joined ? "joined" : ""}">

                        ${group.joined ? "Joined ✓" : "Join Group →"}

                    </button>

                </div>

            </article>

        `).join("");

        document.getElementById("groupEmpty")
            .classList.toggle("hidden", groups.length > 0);

        grid.classList.toggle("hidden", groups.length === 0);
    }


    // =====================================
    // RENDER SESSIONS
    // =====================================

    function renderSessions() {

        const sessions = getSessions();
        const list = document.getElementById("sessionList");

        list.innerHTML = sessions.map(session => `

            <article class="session-card">

                <div class="session-info">

                    <h3>${escapeHTML(session.subject)} Session</h3>

                    <p>
                        <i class="fa-solid fa-user"></i>
                        Tutor: ${escapeHTML(session.tutor)}
                    </p>

                    <p>
                        <i class="fa-solid fa-clock"></i>
                        ${escapeHTML(session.time)}
                    </p>

                    <p class="session-date">
                        <i class="fa-solid fa-calendar"></i>
                        ${escapeHTML(session.date)}
                    </p>

                </div>

                <button class="cancel-session"
                    data-action="cancel"
                    data-id="${Number(session.id)}">

                    Cancel Session

                </button>

            </article>

        `).join("");

        document.getElementById("sessionEmpty")
            .classList.toggle("hidden", sessions.length > 0);

        list.classList.toggle("hidden", sessions.length === 0);
    }


    // =====================================
    // MODAL SYSTEM
    // =====================================

    function openModal(title, subtitle, type, fields) {

        currentFormType = type;

        modalTitle.textContent = title;
        modalSubtitle.textContent = subtitle;

        formFields.innerHTML = fields.map(field => {

            const required = field.required !== false;

            if (field.type === "select") {

                return `
                    <div class="form-field">

                        <label for="${field.name}">
                            ${escapeHTML(field.label)}
                        </label>

                        <select id="${field.name}"
                            name="${field.name}"
                            ${required ? "required" : ""}>

                            <option value="">Select ${escapeHTML(field.label)}</option>

                            ${field.options.map(option => `
                                <option value="${escapeHTML(option)}">
                                    ${escapeHTML(option)}
                                </option>
                            `).join("")}

                        </select>

                    </div>
                `;
            }

            if (field.type === "textarea") {

                return `
                    <div class="form-field">

                        <label for="${field.name}">
                            ${escapeHTML(field.label)}
                        </label>

                        <textarea
                            id="${field.name}"
                            name="${field.name}"
                            placeholder="${escapeHTML(field.placeholder || "")}"
                            ${required ? "required" : ""}
                            maxlength="500"></textarea>

                    </div>
                `;
            }

            return `
                <div class="form-field">

                    <label for="${field.name}">
                        ${escapeHTML(field.label)}
                    </label>

                    <input
                        type="${field.type}"
                        id="${field.name}"
                        name="${field.name}"
                        placeholder="${escapeHTML(field.placeholder || "")}"
                        ${field.min ? `min="${escapeHTML(field.min)}"` : ""}
                        ${required ? "required" : ""}>

                </div>
            `;

        }).join("");

        modalOverlay.classList.add("show");
        document.body.style.overflow = "hidden";
    }


    function closeModal() {

        modalOverlay.classList.remove("show");
        document.body.style.overflow = "";

        dynamicForm.reset();
        currentFormType = "";
    }


    document.getElementById("closeModal")
        .addEventListener("click", closeModal);

    modalOverlay.addEventListener("click", event => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" &&
            modalOverlay.classList.contains("show")) {
            closeModal();
        }
    });


    // =====================================
    // BECOME A TUTOR
    // =====================================

    function showTutorForm() {

        openModal(
            "Become a Peer Tutor",
            "Share your knowledge and help other students.",
            "tutor",
            [
                {
                    name: "name",
                    label: "Full Name",
                    type: "text",
                    placeholder: "Enter your name"
                },
                {
                    name: "year",
                    label: "Academic Year",
                    type: "select",
                    options: [
                        "1st Year B.Tech",
                        "2nd Year B.Tech",
                        "3rd Year B.Tech",
                        "4th Year B.Tech"
                    ]
                },
                {
                    name: "branch",
                    label: "Department",
                    type: "select",
                    options: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "Other"]
                },
                {
                    name: "subjects",
                    label: "Subjects You Can Teach",
                    type: "text",
                    placeholder: "Java, Python, Mathematics..."
                },
                {
                    name: "bio",
                    label: "About Yourself",
                    type: "textarea",
                    placeholder: "Describe your knowledge and teaching experience..."
                },
                {
                    name: "availability",
                    label: "Availability",
                    type: "select",
                    options: ["Available", "Busy"]
                }
            ]
        );
    }


    // =====================================
    // POST A DOUBT
    // =====================================

    function showDoubtForm() {

        openModal(
            "Post an Academic Doubt",
            "Explain your question so other students can help.",
            "doubt",
            [
                {
                    name: "title",
                    label: "Question Title",
                    type: "text",
                    placeholder: "What do you need help with?"
                },
                {
                    name: "subject",
                    label: "Subject",
                    type: "select",
                    options: [
                        "Java",
                        "Python",
                        "Mathematics",
                        "DBMS",
                        "Web Development",
                        "Data Structures",
                        "AIML",
                        "Other"
                    ]
                },
                {
                    name: "description",
                    label: "Describe Your Doubt",
                    type: "textarea",
                    placeholder: "Explain your question in detail..."
                }
            ]
        );
    }


    // =====================================
    // CREATE STUDY GROUP
    // =====================================

    function showGroupForm() {

        openModal(
            "Create a Study Group",
            "Bring students together around a common subject.",
            "group",
            [
                {
                    name: "name",
                    label: "Group Name",
                    type: "text",
                    placeholder: "Enter group name"
                },
                {
                    name: "subject",
                    label: "Subject",
                    type: "select",
                    options: [
                        "Java",
                        "Python",
                        "Mathematics",
                        "DBMS",
                        "Web Development",
                        "Data Structures",
                        "AIML",
                        "Other"
                    ]
                },
                {
                    name: "description",
                    label: "Group Description",
                    type: "textarea",
                    placeholder: "What will students learn in this group?"
                }
            ]
        );
    }


    // =====================================
    // BOOK A TUTORING SESSION
    // =====================================

    function showBookingForm(tutor) {

        openModal(
            "Book a Learning Session",
            `Schedule a session with ${tutor.name}.`,
            "booking",
            [
                {
                    name: "subject",
                    label: "Learning Subject",
                    type: "select",
                    options: tutor.subjects
                },
                {
                    name: "date",
                    label: "Session Date",
                    type: "date",
                    min: new Date().toISOString().split("T")[0]
                },
                {
                    name: "time",
                    label: "Preferred Time",
                    type: "time"
                }
            ]
        );

        // Store the tutor's ID for form submission.
        dynamicForm.dataset.tutorId = tutor.id;
    }


    // =====================================
    // FORM SUBMISSION
    // =====================================

    dynamicForm.addEventListener("submit", event => {

        event.preventDefault();

        const formData = new FormData(dynamicForm);

        const data = Object.fromEntries(formData.entries());

        switch (currentFormType) {

            // REGISTER TUTOR
            case "tutor": {

                const tutors = getTutors();

                const newTutor = {
                    id: Date.now(),
                    name: data.name.trim(),
                    year: data.year,
                    branch: data.branch,
                    subjects: data.subjects.split(",")
                        .map(s => s.trim())
                        .filter(Boolean)
                        .slice(0, 10),
                    rating: 5.0,
                    availability: data.availability,
                    bio: data.bio.trim(),
                    sessions: 0
                };

                if (!newTutor.subjects.length) {
                    showToast("Enter at least one subject.");
                    return;
                }

                tutors.unshift(newTutor);

                saveData(STORAGE_KEYS.tutors, tutors);

                closeModal();
                renderTutors();
                updateStatistics();

                showToast("You are now registered as a tutor!");
                switchTab("tutors");

                break;
            }


            // POST DOUBT
            case "doubt": {

                const doubts = getDoubts();

                doubts.unshift({
                    id: Date.now(),
                    title: data.title.trim(),
                    description: data.description.trim(),
                    subject: data.subject,
                    author: studentName,
                    date: new Date().toLocaleDateString("en-IN"),
                    responses: 0,
                    status: "Open"
                });

                saveData(STORAGE_KEYS.doubts, doubts);

                closeModal();
                renderDoubts();
                updateStatistics();

                showToast("Your doubt has been posted!");

                switchTab("doubts");

                break;
            }


            // CREATE GROUP
            case "group": {

                const groups = getGroups();

                groups.unshift({
                    id: Date.now(),
                    name: data.name.trim(),
                    subject: data.subject,
                    description: data.description.trim(),
                    members: 1,
                    icon: "fa-users",
                    joined: true
                });

                saveData(STORAGE_KEYS.groups, groups);

                closeModal();
                renderGroups();
                updateStatistics();

                showToast("Your study group has been created!");

                switchTab("groups");

                break;
            }


            // BOOK SESSION
            case "booking": {

                const tutorId = Number(dynamicForm.dataset.tutorId);

                const tutor = getTutors().find(
                    t => t.id === tutorId
                );

                if (!tutor) {
                    showToast("Tutor not found.");
                    return;
                }

                if (tutor.availability !== "Available") {
                    showToast("This tutor is currently busy.");
                    return;
                }

                const sessions = getSessions();

                sessions.unshift({
                    id: Date.now(),
                    tutor: tutor.name,
                    tutorId: tutor.id,
                    subject: data.subject,
                    date: data.date,
                    time: data.time,
                    status: "Upcoming"
                });

                saveData(STORAGE_KEYS.sessions, sessions);

                closeModal();
                renderSessions();
                updateStatistics();

                showToast("Your tutoring session has been scheduled!");

                switchTab("sessions");

                break;
            }

        }

    });


    // =====================================
    // CARD ACTIONS
    // Event delegation
    // =====================================

    document.addEventListener("click", event => {

        const button = event.target.closest("[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const id = Number(button.dataset.id);


        // BOOK SESSION
        if (action === "book") {

            const tutor = getTutors().find(t => t.id === id);

            if (tutor) {
                showBookingForm(tutor);
            }

        }


        // JOIN / LEAVE GROUP
        if (action === "join") {

            const groups = getGroups();

            const group = groups.find(g => g.id === id);

            if (!group) return;

            group.joined = !group.joined;

            group.members = Math.max(
                0,
                (Number(group.members) || 0) + (group.joined ? 1 : -1)
            );

            saveData(STORAGE_KEYS.groups, groups);

            renderGroups();
            updateStatistics();

            showToast(
                group.joined
                    ? "You joined the study group!"
                    : "You left the study group."
            );

        }


        // HELP WITH DOUBT
        if (action === "help") {

            const doubts = getDoubts();

            const doubt = doubts.find(d => d.id === id);

            if (!doubt) return;

            if (doubt.author === studentName) {
                showToast("You cannot respond to your own doubt.");
                return;
            }

            doubt.responses = (Number(doubt.responses) || 0) + 1;

            saveData(STORAGE_KEYS.doubts, doubts);

            renderDoubts();

            showToast(
                "Interest recorded! Contact the student through your community."
            );

        }


        // CANCEL SESSION
        if (action === "cancel") {

            if (!confirm("Are you sure you want to cancel this session?")) {
                return;
            }

            const sessions = getSessions().filter(
                session => session.id !== id
            );

            saveData(STORAGE_KEYS.sessions, sessions);

            renderSessions();
            updateStatistics();

            showToast("Session cancelled successfully.");

        }

    });


    // =====================================
    // BUTTON EVENTS
    // =====================================

    document.getElementById("becomeTutorBtn")
        .addEventListener("click", showTutorForm);

    document.getElementById("openTutorForm")
        .addEventListener("click", showTutorForm);

    document.getElementById("bottomTutorBtn")
        .addEventListener("click", showTutorForm);

    document.getElementById("addDoubtBtn")
        .addEventListener("click", showDoubtForm);

    document.getElementById("createGroupBtn")
        .addEventListener("click", showGroupForm);

    document.getElementById("exploreBtn")
        .addEventListener("click", () => {

            switchTab("tutors");

            document.getElementById("tutorGrid")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        });


    // =====================================
    // USER PROFILE AVATAR
    // =====================================

    document.getElementById("userAvatar").textContent =
        studentInitial;


    // =====================================
    // INITIALIZATION
    // =====================================

    function initializeModule() {

        initializeData();

        renderTutors();
        renderDoubts();
        renderGroups();
        renderSessions();

        updateStatistics();

    }

    initializeModule();

});
