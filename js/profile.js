
document.addEventListener("DOMContentLoaded", () => {
    const key = "studenthub-profile";

    const saved = JSON.parse(localStorage.getItem(key) || "{}");

    for (const [k, v] of Object.entries(saved)) {
        const el = document.getElementById(k);

        if (el) {
            el.value = v;
        }
    }

    document.getElementById("profile-form").addEventListener("submit", e => {
        e.preventDefault();

        const data = {};

        [
            "profile-name",
            "profile-course",
            "profile-university",
            "profile-email",
            "profile-goal"
        ].forEach(id => {
            data[id] = document.getElementById(id).value.trim();
        });

        localStorage.setItem(key, JSON.stringify(data));

        showToast("Profile saved in this browser");
    });
});
