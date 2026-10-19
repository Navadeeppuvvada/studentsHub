
(() => {
    const key = "studenthub-theme";
    const root = document.documentElement;

    const sun = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="4"></circle>' +
        '<path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path>' +
        '</svg>';

    const moon = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"></path>' +
        '</svg>';

    function read() {
        try {
            return localStorage.getItem(key) === "light"
                ? "light"
                : "dark";
        } catch {
            return "dark";
        }
    }

    function apply(theme) {
        root.dataset.theme = theme;

        try {
            localStorage.setItem(key, theme);
        } catch {}

        document.querySelectorAll("[data-theme-toggle]").forEach(b => {
            b.innerHTML = theme === "dark" ? sun : moon;

            b.title = `Switch to ${
                theme === "dark" ? "light" : "dark"
            } mode`;

            b.setAttribute("aria-label", b.title);
        });
    }

    function init() {
        apply(read());

        document.querySelectorAll("[data-theme-toggle]").forEach(b => {
            b.addEventListener("click", () => {
                apply(
                    root.dataset.theme === "dark"
                        ? "light"
                        : "dark"
                );
            });
        });

        const settings = document.querySelector("[data-theme-select]");

        if (settings) {
            settings.value = root.dataset.theme;

            settings.addEventListener("change", () => {
                apply(settings.value);
                showToast?.("Theme updated");
            });
        }
    }

    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", init)
        : init();
})();
