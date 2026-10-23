
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("clear-demo").addEventListener("click", () => {
        if (!confirm("Reset StudentHub demo data stored in this browser?")) {
            return;
        }

        [
            "studenthub-assignments",
            "studenthub-tasks",
            "studenthub-materials",
            "studenthub-announcements-read",
            "studenthub-notifications-read",
            "studenthub-event-registrations",
            "studenthub-community-posts",
            "studenthub-profile"
        ].forEach(k => {
            localStorage.removeItem(k);
        });

        showToast("Demo data reset. Reload pages to see defaults.");
    });
});
