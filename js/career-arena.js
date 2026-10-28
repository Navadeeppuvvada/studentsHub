/* Career & Coding Arena — StudentHub */

(() => {
    "use strict";

    const STORAGE_KEY = "studenthub-career-arena-v1";

    const defaultState = {
        dsa: [],
        challenges: [
            { id: "c1", text: "Solve 5 array problems", done: false },
            { id: "c2", text: "Practice binary search", done: false },
            { id: "c3", text: "Solve 2 linked list problems", done: false },
            { id: "c4", text: "Revise stack and queue", done: false },
            { id: "c5", text: "Practice one tree problem", done: false },
            { id: "c6", text: "Attempt a timed coding challenge", done: false }
        ],
        questions: [
            { id: "q1", category: "Java", text: "What is the difference between JDK, JRE, and JVM?", done: false },
            { id: "q2", category: "Java", text: "Explain the four pillars of object-oriented programming.", done: false },
            { id: "q3", category: "Java", text: "What is the difference between == and equals() in Java?", done: false },
            { id: "q4", category: "Java", text: "What is the difference between an interface and an abstract class?", done: false },
            { id: "q5", category: "DSA", text: "How does binary search work, and when can you use it?", done: false },
            { id: "q6", category: "DSA", text: "Explain the difference between a stack and a queue.", done: false },
            { id: "q7", category: "DSA", text: "What are the time complexities of common sorting algorithms?", done: false },
            { id: "q8", category: "DSA", text: "How would you detect a cycle in a linked list?", done: false },
            { id: "q9", category: "Web", text: "What is the difference between let, const, and var?", done: false },
            { id: "q10", category: "Web", text: "Explain the difference between React props and state.", done: false },
            { id: "q11", category: "Web", text: "What is the difference between synchronous and asynchronous JavaScript?", done: false },
            { id: "q12", category: "Web", text: "Explain how an HTTP request reaches a backend server.", done: false },
            { id: "q13", category: "HR", text: "Tell me about yourself.", done: false },
            { id: "q14", category: "HR", text: "Describe a technical challenge you solved.", done: false },
            { id: "q15", category: "HR", text: "Why should we hire you for this role?", done: false },
            { id: "q16", category: "HR", text: "What are your strengths and what are you improving?", done: false }
        ],
        skills: [
            { id: "s1", name: "Java", level: 2 },
            { id: "s2", name: "Data Structures & Algorithms", level: 2 },
            { id: "s3", name: "HTML & CSS", level: 3 },
            { id: "s4", name: "JavaScript", level: 2 },
            { id: "s5", name: "React", level: 1 },
            { id: "s6", name: "SQL / DBMS", level: 1 },
            { id: "s7", name: "Communication", level: 2 }
        ],
        resume: {
            items: [
                { id: "r1", text: "Contact information is up to date", done: false },
                { id: "r2", text: "Education and CGPA are included", done: false },
                { id: "r3", text: "Technical skills are listed", done: false },
                { id: "r4", text: "Projects include descriptions and links", done: false },
                { id: "r5", text: "GitHub and LinkedIn links are included", done: false },
                { id: "r6", text: "Resume spelling and formatting checked", done: false }
            ],
            url: ""
        },
        aptitude: {
            score: 0,
            answered: {}
        }
    };

    const aptitudeQuestions = [
        {
            category: "QUANTITATIVE APTITUDE",
            question: "A number increases from 80 to 100. What is the percentage increase?",
            options: ["20%", "25%", "30%", "15%"],
            answer: 1,
            explanation: "Increase = 100 − 80 = 20. Percentage increase = (20 / 80) × 100 = 25%."
        },
        {
            category: "QUANTITATIVE APTITUDE",
            question: "The average of 10, 20, and 30 is:",
            options: ["15", "25", "20", "30"],
            answer: 2,
            explanation: "Average = (10 + 20 + 30) / 3 = 20."
        },
        {
            category: "QUANTITATIVE APTITUDE",
            question: "A product costs ₹800 after a 20% discount. What was its original price?",
            options: ["₹960", "₹1,000", "₹1,020", "₹900"],
            answer: 1,
            explanation: "₹800 is 80% of the original price. Original price = 800 / 0.8 = ₹1,000."
        },
        {
            category: "LOGICAL REASONING",
            question: "Find the next number: 2, 6, 12, 20, 30, __",
            options: ["36", "40", "42", "44"],
            answer: 2,
            explanation: "The differences are 4, 6, 8, 10. The next difference is 12, so 30 + 12 = 42."
        },
        {
            category: "QUANTITATIVE APTITUDE",
            question: "A person travels 150 km in 3 hours. What is the average speed?",
            options: ["40 km/h", "45 km/h", "50 km/h", "60 km/h"],
            answer: 2,
            explanation: "Average speed = distance / time = 150 / 3 = 50 km/h."
        },
        {
            category: "LOGICAL REASONING",
            question: "If all roses are flowers and some flowers fade quickly, which statement must be true?",
            options: [
                "All flowers are roses",
                "All roses are flowers",
                "All roses fade quickly",
                "No roses fade quickly"
            ],
            answer: 1,
            explanation: "The first statement explicitly tells us that every rose belongs to the category of flowers. Nothing establishes how quickly roses fade."
        },
        {
            category: "QUANTITATIVE APTITUDE",
            question: "What is the simple interest on ₹2,000 at 5% per year for 2 years?",
            options: ["₹100", "₹150", "₹200", "₹250"],
            answer: 2,
            explanation: "Simple interest = (Principal × Rate × Time) / 100 = (2000 × 5 × 2) / 100 = ₹200."
        },
        {
            category: "LOGICAL REASONING",
            question: "If CAT is coded as DBU by shifting each letter forward by one, how is DOG coded?",
            options: ["EPH", "EOG", "DPH", "FPI"],
            answer: 0,
            explanation: "D becomes E, O becomes P, and G becomes H. Therefore DOG becomes EPH."
        }
    ];

    let state;
    let activeQuestionFilter = "All";
    let currentAptitudeIndex = 0;
    let selectedOption = null;
    let answerRevealed = false;

    const $ = (selector) => document.querySelector(selector);

    function cloneDefaultState() {
        return JSON.parse(JSON.stringify(defaultState));
    }

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return cloneDefaultState();

            const parsed = JSON.parse(saved);
            const defaults = cloneDefaultState();

            return {
                ...defaults,
                ...parsed,
                dsa: Array.isArray(parsed.dsa) ? parsed.dsa : defaults.dsa,
                challenges: Array.isArray(parsed.challenges) ? parsed.challenges : defaults.challenges,
                questions: Array.isArray(parsed.questions) ? parsed.questions : defaults.questions,
                skills: Array.isArray(parsed.skills) ? parsed.skills : defaults.skills,
                resume: {
                    ...defaults.resume,
                    ...(parsed.resume || {}),
                    items: Array.isArray(parsed.resume?.items)
                        ? parsed.resume.items
                        : defaults.resume.items
                },
                aptitude: {
                    ...defaults.aptitude,
                    ...(parsed.aptitude || {})
                }
            };
        } catch (error) {
            console.error("Unable to load Career Arena data:", error);
            return cloneDefaultState();
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("Unable to save Career Arena data:", error);
            alert("Your browser could not save the changes. Check your browser storage settings.");
        }
    }

    function makeId() {
        return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function percentage(done, total) {
        return total ? Math.round((done / total) * 100) : 0;
    }

    function renderStats() {
        const dsaDone = state.dsa.filter(item => item.done).length;
        const challengeDone = state.challenges.filter(item => item.done).length;
        const challengePercent = percentage(challengeDone, state.challenges.length);
        const practicedQuestions = state.questions.filter(item => item.done).length;

        const skillPercent = state.skills.length
            ? Math.round(
                state.skills.reduce((sum, skill) => sum + Number(skill.level || 0), 0) /
                (state.skills.length * 4) * 100
            )
            : 0;

        $("#stat-dsa").textContent = dsaDone;
        $("#stat-challenges").textContent = `${challengePercent}%`;
        $("#stat-questions").textContent = practicedQuestions;
        $("#stat-skills").textContent = `${skillPercent}%`;

        $("#dsa-count-label").textContent =
            `${dsaDone} of ${state.dsa.length} problems completed`;

        $("#dsa-progress").style.width =
            `${percentage(dsaDone, state.dsa.length)}%`;

        $("#challenge-counter").textContent =
            `${challengeDone} / ${state.challenges.length}`;

        $("#challenge-percent").textContent = `${challengePercent}%`;

        $("#challenge-ring").style.background =
            `conic-gradient(#8078f6 ${challengePercent * 3.6}deg, var(--border, #30354c) ${challengePercent * 3.6}deg)`;

        $("#question-counter").textContent =
            `${practicedQuestions} practiced`;
    }

    // DSA tracker

    function renderDSA() {
        const list = $("#dsa-list");
        const empty = $("#dsa-empty");

        list.innerHTML = state.dsa.map(item => {
            const difficultyClass = item.difficulty.toLowerCase();

            return `
                <tr>
                    <td><strong>${escapeHTML(item.name)}</strong></td>
                    <td>${escapeHTML(item.topic)}</td>
                    <td><span class="difficulty ${difficultyClass}">${escapeHTML(item.difficulty)}</span></td>
                    <td>
                        <button class="status-pill ${item.done ? "done" : ""}"
                                data-action="toggle-dsa" data-id="${escapeHTML(item.id)}">
                            ${item.done ? "✓ Completed" : "Mark complete"}
                        </button>
                    </td>
                    <td>
                        <button class="row-delete" title="Delete problem"
                                aria-label="Delete ${escapeHTML(item.name)}"
                                data-action="delete-dsa" data-id="${escapeHTML(item.id)}">×</button>
                    </td>
                </tr>
            `;
        }).join("");

        empty.hidden = state.dsa.length > 0;
    }

    function addDSA() {
        const nameInput = $("#dsa-name");
        const name = nameInput.value.trim();

        if (!name) {
            nameInput.focus();
            nameInput.setCustomValidity("Enter a problem name.");
            nameInput.reportValidity();
            return;
        }

        nameInput.setCustomValidity("");

        state.dsa.unshift({
            id: makeId(),
            name,
            topic: $("#dsa-topic").value,
            difficulty: $("#dsa-difficulty").value,
            done: false
        });

        nameInput.value = "";
        saveState();
        renderAll();
        nameInput.focus();
    }

    // Challenge checklist

    function renderChallenges() {
        $("#challenge-list").innerHTML = state.challenges.map(item => `
            <label class="challenge-item ${item.done ? "completed" : ""}">
                <input type="checkbox" data-action="toggle-challenge"
                       data-id="${escapeHTML(item.id)}" ${item.done ? "checked" : ""}>
                <span>${escapeHTML(item.text)}</span>
                <button type="button" class="challenge-delete"
                        data-action="delete-challenge" data-id="${escapeHTML(item.id)}"
                        aria-label="Delete challenge">×</button>
            </label>
        `).join("");
    }

    function addChallenge(event) {
        event.preventDefault();

        const input = $("#challenge-input");
        const text = input.value.trim();

        if (!text) return;

        state.challenges.push({
            id: makeId(),
            text,
            done: false
        });

        input.value = "";
        saveState();
        renderAll();
    }

    // Interview question bank

    function renderQuestions() {
        const questions = state.questions.filter(item =>
            activeQuestionFilter === "All" ||
            item.category === activeQuestionFilter
        );

        $("#question-list").innerHTML = questions.map((item, index) => `
            <article class="question-item">
                <div class="question-main">
                    <div class="question-number">${String(index + 1).padStart(2, "0")}</div>
                    <div class="question-content">
                        <h3>${escapeHTML(item.text)}</h3>
                        <div class="question-meta">
                            <span class="tag">${escapeHTML(item.category)}</span>
                            ${item.done ? '<span class="tag tag-cyan">Practiced ✓</span>' : ""}
                        </div>
                    </div>
                    <button class="question-practice ${item.done ? "done" : ""}"
                            data-action="toggle-question" data-id="${escapeHTML(item.id)}">
                        ${item.done ? "✓ Practiced" : "Mark practiced"}
                    </button>
                </div>
            </article>
        `).join("");

        if (!questions.length) {
            $("#question-list").innerHTML =
                '<p class="empty-state">No questions in this category yet.</p>';
        }

        document.querySelectorAll("[data-filter]").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === activeQuestionFilter
            );
        });
    }

    // Skills and resume

    function levelLabel(level) {
        return ({
            1: "Beginner",
            2: "Learning",
            3: "Proficient",
            4: "Confident"
        })[level] || "Beginner";
    }

    function renderSkills() {
        $("#skills-list").innerHTML = state.skills.map(skill => {
            const level = Math.min(4, Math.max(1, Number(skill.level) || 1));

            return `
                <div class="skill-row">
                    <div class="skill-name">
                        ${escapeHTML(skill.name)}
                        <span class="skill-level-label">${levelLabel(level)}</span>
                    </div>
                    <div class="skill-bar" aria-label="${level * 25}% proficiency">
                        <span style="width:${level * 25}%"></span>
                    </div>
                    <div class="skill-control">
                        <select data-action="change-skill" data-id="${escapeHTML(skill.id)}"
                                aria-label="Set proficiency for ${escapeHTML(skill.name)}">
                            <option value="1" ${level === 1 ? "selected" : ""}>Beginner</option>
                            <option value="2" ${level === 2 ? "selected" : ""}>Learning</option>
                            <option value="3" ${level === 3 ? "selected" : ""}>Proficient</option>
                            <option value="4" ${level === 4 ? "selected" : ""}>Confident</option>
                        </select>
                        <button type="button" class="skill-delete"
                                data-action="delete-skill" data-id="${escapeHTML(skill.id)}"
                                aria-label="Delete skill">×</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    function addSkill(event) {
        event.preventDefault();

        const input = $("#skill-input");
        const name = input.value.trim();

        if (!name) return;

        const duplicate = state.skills.some(
            skill => skill.name.toLowerCase() === name.toLowerCase()
        );

        if (duplicate) {
            alert("That skill is already in your list.");
            return;
        }

        state.skills.push({
            id: makeId(),
            name,
            level: 1
        });

        input.value = "";
        saveState();
        renderAll();
    }

    function renderResume() {
        $("#resume-list").innerHTML = state.resume.items.map(item => `
            <label class="resume-item ${item.done ? "completed" : ""}">
                <input type="checkbox" data-action="toggle-resume"
                       data-id="${escapeHTML(item.id)}" ${item.done ? "checked" : ""}>
                <span>${escapeHTML(item.text)}</span>
            </label>
        `).join("");

        $("#resume-url").value = state.resume.url || "";
    }

    function saveResume() {
        const input = $("#resume-url");
        const url = input.value.trim();
        const feedback = $("#resume-feedback");

        if (url) {
            try {
                const parsed = new URL(url);

                if (!["http:", "https:"].includes(parsed.protocol)) {
                    throw new Error("Invalid protocol");
                }
            } catch {
                feedback.textContent = "Enter a valid URL starting with https://";
                feedback.className = "form-feedback";
                return;
            }
        }

        state.resume.url = url;
        saveState();

        feedback.textContent = "Resume details saved successfully.";
        feedback.className = "form-feedback success";
    }

    // Aptitude practice

    function renderAptitude() {
        const item = aptitudeQuestions[currentAptitudeIndex];

        $("#aptitude-category").textContent = item.category;
        $("#aptitude-number").textContent =
            `QUESTION ${currentAptitudeIndex + 1} OF ${aptitudeQuestions.length}`;

        $("#aptitude-question").textContent = item.question;

        $("#aptitude-options").innerHTML = item.options.map((option, index) => {
            let classes = "aptitude-option";

            if (selectedOption === index) classes += " selected";

            if (answerRevealed && index === item.answer) {
                classes += " correct";
            } else if (answerRevealed && selectedOption === index) {
                classes += " wrong";
            }

            return `
                <button type="button" class="${classes}"
                        data-action="select-aptitude" data-index="${index}"
                        ${answerRevealed ? "disabled" : ""}>
                    <span>${String.fromCharCode(65 + index)}</span>
                    <span>${escapeHTML(option)}</span>
                </button>
            `;
        }).join("");

        const feedback = $("#aptitude-feedback");
        feedback.className = "aptitude-feedback";
        feedback.textContent = "";

        if (answerRevealed) {
            const isCorrect = selectedOption === item.answer;

            feedback.textContent =
                `${isCorrect ? "Correct! " : "Answer: "}${item.explanation}`;

            feedback.classList.add(isCorrect ? "correct" : "wrong");
        }

        $("#show-answer").disabled = answerRevealed;
        $("#next-question").textContent =
            currentAptitudeIndex === aptitudeQuestions.length - 1
                ? "Start again ↻"
                : "Next question →";

        $("#aptitude-score").textContent = state.aptitude.score;

        const answeredCount = Object.keys(state.aptitude.answered || {}).length;

        $("#aptitude-progress").style.width =
            `${percentage(answeredCount, aptitudeQuestions.length)}%`;
    }

    function selectAptitudeOption(index) {
        if (answerRevealed) return;

        selectedOption = index;
        renderAptitude();
    }

    function revealAptitudeAnswer() {
        if (answerRevealed) return;

        if (selectedOption === null) {
            $("#aptitude-feedback").textContent =
                "Choose an option first, or reveal the answer to learn.";
            $("#aptitude-feedback").className = "aptitude-feedback";
            return;
        }

        answerRevealed = true;

        const key = String(currentAptitudeIndex);

        if (!state.aptitude.answered[key]) {
            state.aptitude.answered[key] = true;

            if (selectedOption === aptitudeQuestions[currentAptitudeIndex].answer) {
                state.aptitude.score += 1;
            }
        }

        saveState();
        renderAptitude();
    }

    function nextAptitudeQuestion() {
        currentAptitudeIndex =
            (currentAptitudeIndex + 1) % aptitudeQuestions.length;

        selectedOption = null;
        answerRevealed = false;
        renderAptitude();
    }

    function resetAptitude() {
        if (!confirm("Reset your aptitude score and answered-question history?")) {
            return;
        }

        state.aptitude = {
            score: 0,
            answered: {}
        };

        currentAptitudeIndex = 0;
        selectedOption = null;
        answerRevealed = false;

        saveState();
        renderAptitude();
    }

    // Shared event delegation

    document.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const { action, id } = button.dataset;

        switch (action) {
            case "delete-dsa":
                state.dsa = state.dsa.filter(item => item.id !== id);
                break;

            case "toggle-dsa":
                state.dsa = state.dsa.map(item =>
                    item.id === id ? { ...item, done: !item.done } : item
                );
                break;

            case "delete-challenge":
                state.challenges = state.challenges.filter(item => item.id !== id);
                break;

            case "toggle-question":
                state.questions = state.questions.map(item =>
                    item.id === id ? { ...item, done: !item.done } : item
                );
                break;

            case "delete-skill":
                state.skills = state.skills.filter(item => item.id !== id);
                break;

            case "select-aptitude":
                selectAptitudeOption(Number(button.dataset.index));
                return;

            default:
                return;
        }

        saveState();
        renderAll();
    });

    document.addEventListener("change", event => {
        const control = event.target;
        const { action, id } = control.dataset;

        if (!action) return;

        switch (action) {
            case "toggle-challenge":
                state.challenges = state.challenges.map(item =>
                    item.id === id ? { ...item, done: control.checked } : item
                );
                break;

            case "toggle-resume":
                state.resume.items = state.resume.items.map(item =>
                    item.id === id ? { ...item, done: control.checked } : item
                );
                break;

            case "change-skill":
                state.skills = state.skills.map(item =>
                    item.id === id
                        ? { ...item, level: Number(control.value) }
                        : item
                );
                break;

            default:
                return;
        }

        saveState();
        renderAll();
    });

    function bindEvents() {
        $("#add-dsa").addEventListener("click", addDSA);

        $("#dsa-name").addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                addDSA();
            }
        });

        $("#dsa-name").addEventListener("input", event => {
            event.target.setCustomValidity("");
        });

        $("#challenge-form").addEventListener("submit", addChallenge);
        $("#skill-form").addEventListener("submit", addSkill);
        $("#save-resume").addEventListener("click", saveResume);

        $("#question-filters").addEventListener("click", event => {
            const button = event.target.closest("[data-filter]");
            if (!button) return;

            activeQuestionFilter = button.dataset.filter;
            renderQuestions();
        });

        $("#show-answer").addEventListener("click", revealAptitudeAnswer);
        $("#next-question").addEventListener("click", nextAptitudeQuestion);
        $("#reset-aptitude").addEventListener("click", resetAptitude);
    }

    function renderAll() {
        renderStats();
        renderDSA();
        renderChallenges();
        renderQuestions();
        renderSkills();
        renderResume();
        renderAptitude();
    }

    function init() {
        state = loadState();
        bindEvents();
        renderAll();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();