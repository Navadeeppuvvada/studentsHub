
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("clear-demo").addEventListener("click", () => {
        if (!confirm("Reset StudentHub activity and restore starter examples? Your sign-in and theme preference will be kept.")) {
            return;
        }

        const keys = [
            "studenthub-assignments",
            "studenthub-subjects",
            "studenthub-subjects-starter-v1",
            "studenthub-attendance",
            "studenthub-attendance-starter-v1",
            "studenthub-timetable",
            "studenthub-timetable-starter-v1",
            "studenthub-tasks",
            "studenthub-materials",
            "studenthub-materials-starter-v1",
            "studenthub-focus-room-v1",
            "studenthub-announcements-read",
            "studenthub-notifications-read",
            "studenthub-notification-read-v1",
            "studenthub-event-registrations",
            "studenthub-community-posts",
            "studenthub-profile",
            "studenthub-placement-progress",
            "studenthub-career-arena-v1",
            "studenthub-peer-tutors",
            "studenthub-peer-doubts",
            "studenthub-peer-groups",
            "studenthub-peer-sessions",
            "studenthub-campus-lost-found-v1",
            "studenthub-campus-lost-found-owner-v1"
        ];
        const failed = [];

        keys.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Could not reset ${key}.`, error);
                failed.push(key);
            }
        });

        showToast(failed.length
            ? `Could not reset ${failed.length} item(s). Check browser storage.`
            : "Activity reset; starter examples return when modules reload.");
    });
});
