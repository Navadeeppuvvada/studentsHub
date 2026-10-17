
document.addEventListener("DOMContentLoaded", () => {
  const assignments = [
    {
      id: 1,
      title: "Binary Search Tree Exercises",
      subject: "Data Structures",
      dueDate: "2026-10-20",
      completed: false,
    },
    {
      id: 2,
      title: "Probability Worksheet",
      subject: "Engineering Mathematics",
      dueDate: "2026-10-22",
      completed: false,
    },
    {
      id: 3,
      title: "Classification Lab Report",
      subject: "Artificial Intelligence",
      dueDate: "2026-10-15",
      completed: true,
    },
  ];

  const list = document.getElementById("assignment-list");
  const filter = document.getElementById("status-filter");
  const emptyState = document.getElementById("empty-state");

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));

  function render() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visible = assignments.filter((item) => {
      if (filter.value === "pending") return !item.completed;
      if (filter.value === "completed") return item.completed;
      return true;
    });

    document.getElementById("total-count").textContent =
      assignments.length;

    document.getElementById("pending-count").textContent =
      assignments.filter((item) => !item.completed).length;

    document.getElementById("completed-count").textContent =
      assignments.filter((item) => item.completed).length;

    document.getElementById("overdue-count").textContent =
      assignments.filter((item) =>
        !item.completed &&
        new Date(`${item.dueDate}T00:00:00`) < today
      ).length;

    list.innerHTML = "";

    visible.forEach((item) => {
      const overdue =
        !item.completed &&
        new Date(`${item.dueDate}T00:00:00`) < today;

      const row = document.createElement("tr");

      const titleCell = document.createElement("td");
      const title = document.createElement("strong");
      title.textContent = item.title;
      titleCell.append(title);

      const subjectCell = document.createElement("td");
      subjectCell.textContent = item.subject;

      const dueCell = document.createElement("td");
      dueCell.textContent = formatDate(item.dueDate);

      const statusCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "badge " +
        (item.completed
          ? "badge-success"
          : overdue
            ? "badge-danger"
            : "badge-warning");
      badge.textContent = item.completed
        ? "Completed"
        : overdue
          ? "Overdue"
          : "Pending";
      statusCell.append(badge);

      const actionCell = document.createElement("td");

      if (!item.completed) {
        const button = document.createElement("button");
        button.className = "btn btn-secondary";
        button.textContent = "Mark complete";
        button.addEventListener("click", () => {
          item.completed = true;
          render();
        });
        actionCell.append(button);
      } else {
        actionCell.textContent = "Submitted";
      }

      row.append(
        titleCell,
        subjectCell,
        dueCell,
        statusCell,
        actionCell
      );

      list.append(row);
    });

    emptyState.hidden = visible.length !== 0;
  }

  filter.addEventListener("change", render);

  document.getElementById("add-assignment").addEventListener("click", () => {
    const title = window.prompt("Enter the assignment title:");
    if (!title || !title.trim()) return;

    const subject = window.prompt("Enter the subject:");
    if (!subject || !subject.trim()) return;

    const dueDate = window.prompt("Enter the due date (YYYY-MM-DD):");

    if (
      !dueDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
      Number.isNaN(new Date(`${dueDate}T00:00:00`).getTime()) ||
      new Date(`${dueDate}T00:00:00`).toISOString().slice(0, 10) !== dueDate
    ) {
      window.alert("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    assignments.push({
      id: Date.now(),
      title: title.trim(),
      subject: subject.trim(),
      dueDate,
      completed: false,
    });

    filter.value = "all";
    render();
  });

  render();
});
