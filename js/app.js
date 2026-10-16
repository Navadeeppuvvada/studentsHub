
document.addEventListener("DOMContentLoaded", () => {
  // Highlight the current page in the navigation.
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("href");

    if (target === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  // Display the current date in elements using this attribute.
  document.querySelectorAll("[data-current-date]").forEach((element) => {
    element.textContent = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  });

  // Provide a consistent confirmation for demo actions.
  document.querySelectorAll("[data-confirm]").forEach((button) => {
    button.addEventListener("click", () => {
      const message = button.dataset.confirm;

      if (message) {
        window.alert(message);
      }
    });
  });
});
