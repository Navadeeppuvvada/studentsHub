document.addEventListener("DOMContentLoaded", () => {
    // Small entrance reveal for About page sections; content remains visible if motion is reduced.
    const sections = document.querySelectorAll(".about-story, .about-feature-card, .about-vision, .about-creator, .about-cta");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sections.forEach((section, index) => {
        section.style.animationDelay = `${Math.min(index * 45, 240)}ms`;
        section.classList.add("about-reveal");
    });
});
