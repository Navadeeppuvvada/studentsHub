
document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "studenthub-notification-read-v1";

  const notifications = [
    {
      id: "n1",
      title: "Assignment deadline approaching",
      message: "Your Binary Search Tree exercises are due on 20 October.",
      category: "Assignments",
      date: "2026-10-16",
    },
    {
      id: "n2",
      title: "Attendance reminder",
      message: "Review your subject-wise attendance and check for any classes that need attention.",
      category: "Academic",
      date: "2026-10-16",
    },
    {
      id: "n3",
      title: "Study materials available",
      message: "Review the latest resources added to your study materials section.",
      category: "General",
      date: "2026-10-15",
    },
    {
      id: "n4",
      title: "Mathematics worksheet",
      message: "Your probability worksheet deadline is 22 October.",
      category: "Assignments",
      date: "2026-10-15",
    },
  ];

  let readIds = [];

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(saved)) {
      readIds = saved.filter(id =>
        typeof id === "string" &&
        notifications.some(item => item.id === id)
      );
    }
  } catch {
    readIds = [];
  }

  const list = document.getElementById("notification-list");
  const readFilter = document.getElementById("read-filter");
  const categoryFilter = document.getElementById("category-filter");
  const empty = document.getElementById("notifications-empty");

  function saveReadState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(readIds));
    } catch {
      // The page remains usable if browser storage is unavailable.
    }
  }

  function render() {
    const unread = notifications.filter(item => !readIds.includes(item.id));

    document.getElementById("total-notifications").textContent =
      notifications.length;

    document.getElementById("unread-notifications").textContent =
      unread.length;

    document.getElementById("academic-notifications").textContent =
      notifications.filter(item =>
        item.category === "Academic" || item.category === "Assignments"
      ).length;

    document.getElementById("general-notifications").textContent =
      notifications.filter(item => item.category === "General").length;

    const visible = notifications.filter(item => {
      const isRead = readIds.includes(item.id);

      const statusMatches =
        readFilter.value === "all" ||
        (readFilter.value === "read" && isRead) ||
        (readFilter.value === "unread" && !isRead);

      const categoryMatches =
        categoryFilter.value === "all" ||
        categoryFilter.value === item.category;

      return statusMatches && categoryMatches;
    });

    list.replaceChildren();

    visible.forEach(item => {
      const isRead = readIds.includes(item.id);

      const row = document.createElement("article");
      row.className = "list-item" + (isRead ? "" : " notice-unread");

      const tile = document.createElement("div");
      tile.className = "icon-tile";
      tile.textContent = item.category === "Assignments" ? "!" :
        item.category === "Academic" ? "A" : "i";

      const main = document.createElement("div");
      main.className = "item-main";

      const title = document.createElement("strong");
      title.textContent = item.title;

      const message = document.createElement("p");
      message.textContent = item.message;

      const metadata = document.createElement("p");
      metadata.style.marginTop = "8px";
      metadata.textContent =
        `${item.category} · ${new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(`${item.date}T00:00:00`))}`;

      main.append(title, message, metadata);

      const action = document.createElement("button");
      action.className = "btn btn-secondary";
      action.textContent = isRead ? "Read" : "Mark as read";
      action.disabled = isRead;
      action.setAttribute(
        "aria-label",
        `${isRead ? "Already read" : "Mark as read"}: ${item.title}`
      );

      action.addEventListener("click", () => {
        if (!readIds.includes(item.id)) {
          readIds.push(item.id);
          saveReadState();
          render();
        }
      });

      row.append(tile, main, action);
      list.append(row);
    });

    empty.hidden = visible.length !== 0;
  }

  readFilter.addEventListener("change", render);
  categoryFilter.addEventListener("change", render);

  document.getElementById("mark-all-read").addEventListener("click", () => {
    readIds = notifications.map(item => item.id);
    saveReadState();
    render();
  });

  render();
});
