
document.addEventListener("DOMContentLoaded", () => {
    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const data = {
        "Monday": [
            ["09:00 AM", "Data Structures", "Dr. Kumar · Room 204"],
            ["11:00 AM", "Engineering Mathematics", "Room 205"],
            ["02:00 PM", "AI/ML Laboratory", "Computer lab"]
        ],

        "Tuesday": [
            ["10:00 AM", "Java Programming", "Prof. Rao · Room 205"],
            ["12:00 PM", "Database Systems", "Room 105"],
            ["03:00 PM", "Self-study block", "Library"]
        ],

        "Wednesday": [
            ["09:00 AM", "Web Development", "Prof. Sharma · Room 301"],
            ["11:00 AM", "Computer Networks", "Room 210"],
            ["02:00 PM", "Engineering Mathematics", "Room 204"]
        ],

        "Thursday": [
            ["10:00 AM", "Data Structures", "Room 204"],
            ["01:00 PM", "AI/ML Laboratory", "Computer lab"]
        ],

        "Friday": [
            ["09:00 AM", "Java Programming", "Room 205"],
            ["11:00 AM", "Database Systems", "Room 105"],
            ["02:00 PM", "Project work", "Innovation lab"]
        ],

        "Saturday": [
            ["10:00 AM", "Weekly revision", "Library"],
            ["12:00 PM", "DSA practice", "Study room"]
        ]
    };

    const tabs = document.getElementById("day-tabs");
    const list = document.getElementById("class-list");
    const title = document.getElementById("day-title");

    function show(day) {
        title.textContent = day + " schedule";

        list.innerHTML = (data[day] || [])
            .map((x, i) => `
                <div class="list-row">
                    <span class="list-icon">
                        ${x[0].split(" ")[0]}
                    </span>

                    <div class="list-main">
                        <strong>${x[1]}</strong>
                        <small>${x[0]} · ${x[2]}</small>
                    </div>

                    <span class="pill">
                        ${i === 0 ? "First session" : "Scheduled"}
                    </span>
                </div>
            `)
            .join("");

        tabs.querySelectorAll("button").forEach(b => {
            b.className = b.dataset.day === day
                ? "btn btn-primary"
                : "btn btn-secondary";
        });
    }

    tabs.innerHTML = days
        .map(d => `
            <button class="btn btn-secondary" data-day="${d}">
                ${d.slice(0, 3)}
            </button>
        `)
        .join("");

    tabs.querySelectorAll("button").forEach(b => {
        b.addEventListener("click", () => show(b.dataset.day));
    });

    document.getElementById("today-btn").addEventListener("click", () => {
        show(days[(new Date().getDay() + 6) % 7] || "Monday");
    });

    show("Monday");
});
