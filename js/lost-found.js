/* StudentHub — Campus Lost & Found
   Demo storage: localStorage in the current browser.
   Shared campus access requires a backend/database.
*/

(() => {
    "use strict";

    const STORAGE_KEY = "studenthub-campus-lost-found-v1";
    const OWNER_KEY = "studenthub-campus-lost-found-owner-v1";
    const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

    const $ = selector => document.querySelector(selector);

    let reports = [];
    let ownerId = "";
    let selectedImage = "";
    let toastTimer;
    let lastFocusedElement = null;

    const categoryIcons = {
        "Electronics": "▣",
        "Books & Notes": "▤",
        "ID & Cards": "▰",
        "Bags & Accessories": "▧",
        "Keys": "⚿",
        "Clothing": "◇",
        "Water Bottles": "♧",
        "Other": "◈"
    };

    const sampleReports = [
        {
            id: "sample-1",
            type: "lost",
            name: "Black wireless earbuds",
            category: "Electronics",
            location: "Central Library, second floor",
            date: "2026-10-27",
            description: "Small black earbuds in a charging case. May have been left near the study tables.",
            contactName: "Demo Student",
            contactMethod: "Demo listing — replace with a real report",
            image: "",
            status: "open",
            ownerId: "demo",
            createdAt: "2026-10-27T09:30:00.000Z",
            demo: true
        },
        {
            id: "sample-2",
            type: "found",
            name: "Blue water bottle",
            category: "Water Bottles",
            location: "Outside the cafeteria",
            date: "2026-10-28",
            description: "A blue reusable bottle was found on a bench outside the cafeteria.",
            contactName: "Demo Student",
            contactMethod: "Demo listing — replace with a real report",
            image: "",
            status: "open",
            ownerId: "demo",
            createdAt: "2026-10-28T08:00:00.000Z",
            demo: true
        },
        {
            id: "sample-3",
            type: "lost",
            name: "Engineering notebook",
            category: "Books & Notes",
            location: "Academic block, room corridor",
            date: "2026-10-25",
            description: "A notebook with handwritten engineering class notes. Please contact me if found.",
            contactName: "Demo Student",
            contactMethod: "Demo listing — replace with a real report",
            image: "",
            status: "open",
            ownerId: "demo",
            createdAt: "2026-10-25T11:00:00.000Z",
            demo: true
        }
    ];

    function createId() {
        return `lf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function formatDate(dateString) {
        if (!dateString) return "Date not provided";

        // Parse date-only values in local time to avoid timezone shifts.
        const parts = dateString.split("-").map(Number);
        const date = parts.length === 3
            ? new Date(parts[0], parts[1] - 1, parts[2])
            : new Date(dateString);

        if (Number.isNaN(date.getTime())) return "Date not provided";

        return date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function getStatusLabel(status) {
        return ({
            open: "Open",
            claimed: "Claimed",
            resolved: "Resolved"
        })[status] || "Open";
    }

    function validReport(report) {
        return report &&
            typeof report.id === "string" &&
            typeof report.name === "string" &&
            ["lost", "found"].includes(report.type) &&
            ["open", "claimed", "resolved"].includes(report.status);
    }

    function loadReports() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored !== null) {
                const parsed = JSON.parse(stored);
                reports = Array.isArray(parsed)
                    ? parsed.filter(validReport)
                    : [];
            } else {
                // These examples are local demo data, not real campus reports.
                reports = JSON.parse(JSON.stringify(sampleReports));
                saveReports();
            }
        } catch (error) {
            console.error("Could not load Lost & Found reports:", error);
            reports = [];
            showToast("Saved reports could not be loaded. Check browser storage.");
        }
    }

    function saveReports() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
            return true;
        } catch (error) {
            console.error("Could not save Lost & Found reports:", error);
            showToast("Could not save. Remove a photo or free browser storage and try again.");
            return false;
        }
    }

    function loadOwnerId() {
        try {
            ownerId = localStorage.getItem(OWNER_KEY) || "";

            if (!ownerId) {
                ownerId = createId();
                localStorage.setItem(OWNER_KEY, ownerId);
            }
        } catch (error) {
            console.error("Could not initialize report ownership:", error);
            ownerId = "temporary-" + createId();
        }
    }

    function isMine(report) {
        return report.ownerId === ownerId && !report.demo;
    }

    function showToast(message) {
        const toast = $("#lf-toast");
        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // Statistics

    function renderStats() {
        $("#stat-open").textContent =
            reports.filter(report => report.status === "open").length;

        $("#stat-found").textContent =
            reports.filter(report => report.type === "found" && report.status !== "resolved").length;

        $("#stat-resolved").textContent =
            reports.filter(report => report.status === "resolved").length;

        $("#stat-mine").textContent =
            reports.filter(isMine).length;
    }

    // Search and filters

    function getFilteredReports() {
        const query = $("#search-input").value.trim().toLowerCase();
        const type = $("#type-filter").value;
        const category = $("#category-filter").value;
        const status = $("#status-filter").value;
        const sort = $("#sort-filter").value;

        const result = reports.filter(report => {
            const searchable = [
                report.name,
                report.category,
                report.location,
                report.description,
                report.contactName
            ].join(" ").toLowerCase();

            return (!query || searchable.includes(query)) &&
                (type === "all" || report.type === type) &&
                (category === "all" || report.category === category) &&
                (status === "all" || report.status === status);
        });

        result.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date || 0).getTime() || 0;
            const dateB = new Date(b.createdAt || b.date || 0).getTime() || 0;
            return sort === "oldest" ? dateA - dateB : dateB - dateA;
        });

        return result;
    }

    function renderReports() {
        const filtered = getFilteredReports();
        const grid = $("#listing-grid");

        $("#results-count").textContent =
            `${filtered.length} ${filtered.length === 1 ? "report" : "reports"}`;

        $("#empty-state").hidden = filtered.length > 0;
        grid.hidden = filtered.length === 0;

        grid.innerHTML = filtered.map(report => {
            const image = report.image
                ? `<img src="${escapeHTML(report.image)}" alt="${escapeHTML(report.name)}" loading="lazy">`
                : `<span class="lf-placeholder-icon" aria-hidden="true">${categoryIcons[report.category] || "◈"}</span>`;

            const statusClass = ["open", "claimed", "resolved"].includes(report.status)
                ? report.status : "open";

            const mine = isMine(report);

            return `
                <article class="lf-item-card">
                    <div class="lf-item-image">
                        ${image}
                        <span class="lf-card-type ${report.type}">
                            ${report.type === "lost" ? "⌕ Lost item" : "✓ Found item"}
                        </span>
                        <span class="lf-card-status">
                            <span class="lf-status ${statusClass}">${getStatusLabel(statusClass)}</span>
                        </span>
                    </div>

                    <div class="lf-item-body">
                        <span class="lf-card-category">${escapeHTML(report.category || "Other")}</span>
                        <h3>${escapeHTML(report.name)}</h3>
                        <p class="lf-item-description">${escapeHTML(report.description)}</p>

                        <div class="lf-item-meta">
                            <div class="lf-meta-line">
                                <span aria-hidden="true">⌖</span>
                                <span>${escapeHTML(report.location)}</span>
                            </div>
                            <div class="lf-meta-line">
                                <span aria-hidden="true">◷</span>
                                <span>${report.type === "lost" ? "Lost" : "Found"} on ${formatDate(report.date)}</span>
                            </div>
                        </div>

                        <div class="lf-card-footer">
                            <span class="lf-poster">${mine ? "Your report" : `Posted by ${escapeHTML(report.contactName || "Campus member")}`}</span>
                            <div class="lf-card-actions">
                                <button class="lf-small-button primary" data-action="details"
                                        data-id="${escapeHTML(report.id)}">View details</button>
                                ${mine ? `
                                    <button class="lf-small-button" data-action="edit"
                                            data-id="${escapeHTML(report.id)}" aria-label="Edit report">Edit</button>
                                ` : ""}
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    function renderAll() {
        renderStats();
        renderReports();
    }

    function clearFilters() {
        $("#search-input").value = "";
        $("#type-filter").value = "all";
        $("#category-filter").value = "all";
        $("#status-filter").value = "all";
        $("#sort-filter").value = "newest";
        renderReports();
    }

    // Report modal

    function openModal(modal) {
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = "hidden";

        const focusTarget = modal.querySelector(
            "input:not([type=hidden]), button, select, textarea"
        );
        if (focusTarget) focusTarget.focus();
    }

    function closeModal(modal) {
        modal.hidden = true;

        const anotherOpen = [...document.querySelectorAll(".lf-modal-backdrop")]
            .some(element => !element.hidden);

        if (!anotherOpen) {
            document.body.style.overflow = "";
        }

        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    }

    function updateTypeFields(type) {
        const lost = type === "lost";

        $("#location-label").textContent = lost
            ? "Last seen location *"
            : "Found location *";

        $("#date-label").textContent = lost
            ? "Date lost *"
            : "Date found *";
    }

    function resetReportForm() {
        $("#report-form").reset();
        $("#edit-id").value = "";
        selectedImage = "";
        $("#image-preview").hidden = true;
        $("#preview-image").removeAttribute("src");
        $("#modal-title").textContent = "Create a report";
        $("#save-report-btn").textContent = "Publish report";
        $("#form-message").textContent = "";
        updateTypeFields("lost");
    }

    function openCreateReport(type = "lost") {
        resetReportForm();

        const radio = document.querySelector(
            `input[name="report-type"][value="${type}"]`
        );
        if (radio) radio.checked = true;

        updateTypeFields(type);

        // Prefill from an existing StudentHub profile/session when available.
        try {
            const users = JSON.parse(localStorage.getItem("studentHubUsers") || "[]");
            const session = JSON.parse(sessionStorage.getItem("studentHubSession") || "null");

            const currentUser = Array.isArray(users) && session
                ? users.find(user =>
                    user.email && session.email &&
                    user.email.toLowerCase() === session.email.toLowerCase()
                )
                : null;

            if (currentUser) {
                $("#contact-name").value = currentUser.name || "";
                $("#contact-method").value = currentUser.email || "";
            }
        } catch {
            // Profile data is optional; the student can fill in the fields manually.
        }

        $("#report-modal").querySelector(".lf-modal").scrollTop = 0;
        openModal($("#report-modal"));
    }

    function openEditReport(id) {
        const report = reports.find(item => item.id === id);

        if (!report || !isMine(report)) {
            showToast("You can only edit your own reports.");
            return;
        }

        resetReportForm();

        $("#edit-id").value = report.id;
        document.querySelector(`input[name="report-type"][value="${report.type}"]`).checked = true;
        $("#item-name").value = report.name;
        $("#item-category").value = report.category;
        $("#item-location").value = report.location;
        $("#item-date").value = report.date;
        $("#item-description").value = report.description;
        $("#contact-name").value = report.contactName;
        $("#contact-method").value = report.contactMethod;

        selectedImage = report.image || "";

        if (selectedImage) {
            $("#preview-image").src = selectedImage;
            $("#image-preview").hidden = false;
        }

        $("#modal-title").textContent = "Edit your report";
        $("#save-report-btn").textContent = "Save changes";
        updateTypeFields(report.type);

        openModal($("#report-modal"));
    }

    // Photo upload: resize before saving to reduce browser storage usage.

    function loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => reject(new Error("Could not read the selected image."));
            reader.onload = () => {
                const img = new Image();

                img.onerror = () => reject(new Error("That image could not be opened."));
                img.onload = () => {
                    const maxDimension = 1000;
                    const scale = Math.min(
                        1,
                        maxDimension / Math.max(img.width, img.height)
                    );

                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(img.width * scale));
                    canvas.height = Math.max(1, Math.round(img.height * scale));

                    const context = canvas.getContext("2d");

                    if (!context) {
                        reject(new Error("Image processing is unavailable."));
                        return;
                    }

                    context.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.78));
                };

                img.src = reader.result;
            };

            reader.readAsDataURL(file);
        });
    }

    async function handleImageSelection(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            showToast("Choose a JPG, PNG, or WebP image.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            showToast("Image must be 2 MB or smaller.");
            event.target.value = "";
            return;
        }

        try {
            selectedImage = await loadImageFromFile(file);
            $("#preview-image").src = selectedImage;
            $("#image-preview").hidden = false;
        } catch (error) {
            selectedImage = "";
            $("#image-preview").hidden = true;
            showToast(error.message || "Unable to process image.");
        }
    }

    function removeImage() {
        selectedImage = "";
        $("#item-image").value = "";
        $("#preview-image").removeAttribute("src");
        $("#image-preview").hidden = true;
    }

    // Create and update reports

    function handleReportSubmit(event) {
        event.preventDefault();

        const editId = $("#edit-id").value;
        const type = document.querySelector('input[name="report-type"]:checked').value;
        const name = $("#item-name").value.trim();
        const category = $("#item-category").value;
        const location = $("#item-location").value.trim();
        const date = $("#item-date").value;
        const description = $("#item-description").value.trim();
        const contactName = $("#contact-name").value.trim();
        const contactMethod = $("#contact-method").value.trim();

        if (!name || !category || !location || !date ||
            !description || !contactName || !contactMethod) {
            $("#form-message").textContent = "Please complete all required fields.";
            return;
        }

        if (date > new Date().toLocaleDateString("en-CA")) {
            $("#form-message").textContent = "The report date cannot be in the future.";
            return;
        }

        const existing = editId
            ? reports.find(report => report.id === editId)
            : null;

        if (editId && (!existing || !isMine(existing))) {
            $("#form-message").textContent = "You can only edit your own report.";
            return;
        }

        const updated = {
            id: existing ? existing.id : createId(),
            type,
            name,
            category,
            location,
            date,
            description,
            contactName,
            contactMethod,
            image: selectedImage,
            status: existing ? existing.status : "open",
            ownerId,
            createdAt: existing ? existing.createdAt : new Date().toISOString(),
            demo: false
        };

        const oldReports = reports.slice();

        if (existing) {
            reports = reports.map(report => report.id === editId ? updated : report);
        } else {
            reports.unshift(updated);
        }

        if (!saveReports()) {
            reports = oldReports;
            return;
        }

        closeModal($("#report-modal"));
        renderAll();
        showToast(existing ? "Report updated successfully." : "Your report has been published.");
    }

    // Detail view and status management

    function openDetails(id) {
        const report = reports.find(item => item.id === id);
        if (!report) return;

        const mine = isMine(report);
        const statusClass = ["open", "claimed", "resolved"].includes(report.status)
            ? report.status : "open";

        const image = report.image
            ? `<div class="lf-detail-image"><img src="${escapeHTML(report.image)}" alt="${escapeHTML(report.name)}"></div>`
            : `<div class="lf-detail-image" aria-hidden="true">${categoryIcons[report.category] || "◈"}</div>`;

        const statusOptions = ["open", "claimed", "resolved"].map(status =>
            `<option value="${status}" ${report.status === status ? "selected" : ""}>${getStatusLabel(status)}</option>`
        ).join("");

        $("#detail-title").textContent = report.name;

        $("#detail-content").innerHTML = `
            ${image}
            <div class="lf-detail-tags">
                <span class="lf-card-type ${report.type}">${report.type === "lost" ? "⌕ Lost item" : "✓ Found item"}</span>
                <span class="lf-status ${statusClass}">${getStatusLabel(statusClass)}</span>
                <span class="lf-tag tag">${escapeHTML(report.category || "Other")}</span>
            </div>
            <p class="lf-detail-description">${escapeHTML(report.description)}</p>

            <div class="lf-detail-info">
                <div><small>${report.type === "lost" ? "Last seen location" : "Found location"}</small><strong>${escapeHTML(report.location)}</strong></div>
                <div><small>${report.type === "lost" ? "Date lost" : "Date found"}</small><strong>${formatDate(report.date)}</strong></div>
                <div><small>Reported by</small><strong>${escapeHTML(report.contactName)}</strong></div>
                <div><small>Contact method</small><strong>${escapeHTML(report.contactMethod)}</strong></div>
            </div>

            ${report.demo ? `
                <p class="lf-form-warning">This is an example listing for demonstration only. It is not a real campus report.</p>
            ` : ""}

            <div class="lf-detail-actions">
                ${!mine && !report.demo ? `
                    <button class="lf-button lf-button-primary" data-detail-action="contact"
                            data-id="${escapeHTML(report.id)}">Contact poster</button>
                    ${report.status === "open" ? `
                        <button class="lf-button lf-button-secondary" data-detail-action="claim"
                                data-id="${escapeHTML(report.id)}">Mark as claimed</button>
                    ` : ""}
                ` : ""}

                ${mine ? `
                    <button class="lf-button lf-button-secondary" data-detail-action="edit"
                            data-id="${escapeHTML(report.id)}">Edit report</button>
                    <label class="lf-field">
                        <span>Update status</span>
                        <select id="detail-status-select" data-id="${escapeHTML(report.id)}">
                            ${statusOptions}
                        </select>
                    </label>
                    <button class="lf-button lf-button-secondary" data-detail-action="delete"
                            data-id="${escapeHTML(report.id)}">Delete report</button>
                ` : ""}
            </div>
        `;

        openModal($("#detail-modal"));
    }

    function updateStatus(id, status) {
        const report = reports.find(item => item.id === id);

        if (!report || !isMine(report)) {
            showToast("Only the person who posted this report can update its status.");
            return;
        }

        if (!["open", "claimed", "resolved"].includes(status)) return;

        const previousStatus = report.status;
        report.status = status;

        if (!saveReports()) {
            report.status = previousStatus;
            return;
        }

        renderAll();
        openDetails(id);
        showToast(`Status updated to ${getStatusLabel(status)}.`);
    }

    function claimReport(id) {
        const report = reports.find(item => item.id === id);

        if (!report || report.demo) {
            showToast("This is a demo report. No action was taken.");
            return;
        }

        // A claim is a status change, not proof of ownership or a transfer.
        const previousStatus = report.status;
        report.status = "claimed";

        if (!saveReports()) {
            report.status = previousStatus;
            return;
        }

        closeModal($("#detail-modal"));
        renderAll();
        showToast("Marked as claimed. Coordinate with the poster to verify the item.");
    }

    function deleteReport(id) {
        const report = reports.find(item => item.id === id);

        if (!report || !isMine(report)) {
            showToast("You can only delete your own reports.");
            return;
        }

        if (!confirm(`Delete the report "${report.name}"? This cannot be undone.`)) {
            return;
        }

        const previousReports = reports.slice();
        reports = reports.filter(item => item.id !== id);

        if (!saveReports()) {
            reports = previousReports;
            return;
        }

        closeModal($("#detail-modal"));
        renderAll();
        showToast("Report deleted.");
    }

    function handleListingAction(event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;

        if (action === "details") openDetails(id);
        if (action === "edit") openEditReport(id);
    }

    function handleDetailAction(event) {
        const button = event.target.closest("[data-detail-action]");
        if (!button) return;

        const { action, id } = button.dataset;
        const report = reports.find(item => item.id === id);

        if (!report) return;

        if (action === "edit") {
            if (!isMine(report)) {
                showToast("You can only edit your own reports.");
                return;
            }

            closeModal($("#detail-modal"));
            openEditReport(id);
        }

        if (action === "delete") deleteReport(id);

        if (action === "claim") claimReport(id);

        if (action === "contact") {
            if (report.demo) {
                showToast("This is an example listing, not a real contact.");
                return;
            }

            // The poster's chosen contact method is user-provided text.
            // Do not automatically open arbitrary URLs or protocols.
            const contact = report.contactMethod || "";
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

            if (isEmail) {
                const link = document.createElement("a");
                link.href = `mailto:${contact}`;
                link.rel = "noopener";
                link.click();
            } else {
                showToast(`Contact the poster using the details shown: ${contact}`);
            }
        }
    }

    function handleDetailStatusChange(event) {
        if (event.target.id !== "detail-status-select") return;
        updateStatus(event.target.dataset.id, event.target.value);
    }

    function bindEvents() {
        $("#report-lost-btn").addEventListener("click", () => openCreateReport("lost"));
        $("#report-found-btn").addEventListener("click", () => openCreateReport("found"));
        $("#toolbar-report-btn").addEventListener("click", () => openCreateReport("lost"));
        $("#empty-report-btn").addEventListener("click", () => openCreateReport("lost"));

        $("#search-input").addEventListener("input", renderReports);

        ["type-filter", "category-filter", "status-filter", "sort-filter"].forEach(id => {
            $(`#${id}`).addEventListener("change", renderReports);
        });

        $("#clear-filters").addEventListener("click", clearFilters);
        $("#listing-grid").addEventListener("click", handleListingAction);

        $("#report-form").addEventListener("submit", handleReportSubmit);
        $("#item-image").addEventListener("change", handleImageSelection);
        $("#remove-image").addEventListener("click", removeImage);

        document.querySelectorAll("[data-close-modal]").forEach(button => {
            button.addEventListener("click", () => {
                const modal = button.closest(".lf-modal-backdrop");
                if (modal) closeModal(modal);
            });
        });

        document.querySelectorAll(".lf-modal-backdrop").forEach(backdrop => {
            backdrop.addEventListener("click", event => {
                if (event.target === backdrop) closeModal(backdrop);
            });
        });

        document.querySelectorAll('input[name="report-type"]').forEach(radio => {
            radio.addEventListener("change", () => updateTypeFields(radio.value));
        });

        $("#detail-content").addEventListener("click", handleDetailAction);
        $("#detail-content").addEventListener("change", handleDetailStatusChange);

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                document.querySelectorAll(".lf-modal-backdrop").forEach(modal => {
                    if (!modal.hidden) closeModal(modal);
                });
            }

            // "/" focuses search unless the user is already typing.
            if (event.key === "/" &&
                !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) &&
                !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                $("#search-input").focus();
            }
        });

        // Close the detail modal before opening the edit modal.
        // The normal form handles the rest of the edit flow.
    }

    function init() {
        loadOwnerId();
        loadReports();
        bindEvents();
        renderAll();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();