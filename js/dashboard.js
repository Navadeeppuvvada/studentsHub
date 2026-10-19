
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-progress]").forEach(el =>
        requestAnimationFrame(() => {
            el.style.width = el.dataset.progress + "%";
        })
    );

    const tasks = JSON.parse(
        localStorage.getItem("studenthub-assignments") || "[]"
    );

    const pending = tasks.filter(t => !t.done).length;

    if (tasks.length) {
        const el = document.getElementById("pending-total");

        if (el) {
            el.textContent = String(pending).padStart(2, "0");
        }
    }
});
