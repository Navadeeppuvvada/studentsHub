
document.addEventListener("DOMContentLoaded", () => {
    // Use the same storage key as login.js
    let currentUser = null;

    try {
        currentUser = JSON.parse(
            sessionStorage.getItem("studentHubSession") || "null"
        );
    } catch (error) {
        console.error("Could not read the current session.", error);
    }

    // Redirect only if no valid session exists
    if (!currentUser || !currentUser.email) {
        window.location.replace("login.html");
        return;
    }

    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const courseInput = document.getElementById("profile-course");
    const universityInput = document.getElementById("profile-university");
    const goalInput = document.getElementById("profile-goal");
    const profileForm = document.getElementById("profile-form");

    const getName = user => user.name || user.fullName || "Student";

    // Load the current user's details
    if (nameInput) nameInput.value = getName(currentUser);
    if (emailInput) emailInput.value = currentUser.email;

    // Keep the existing profile defaults
    if (courseInput) courseInput.value = currentUser.course || "B.Tech";
    if (universityInput) {
        universityInput.value = currentUser.university || "KL University";
    }
    if (goalInput) goalInput.value = currentUser.goal || "";

    // Update avatars and sidebar name wherever they exist
    function updateUserDisplay(name) {
        const initial = name.trim().charAt(0).toUpperCase() || "S";

        document.querySelectorAll(".avatar, .sidebar-avatar").forEach(element => {
            element.textContent = initial;
        });

        document.querySelectorAll(".sidebar-user strong").forEach(element => {
            element.textContent = name;
        });
    }

    updateUserDisplay(getName(currentUser));

    // Save editable profile details for this session
    profileForm?.addEventListener("submit", event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !email) {
            alert("Please enter your name and email.");
            return;
        }

        currentUser.name = name;
        currentUser.email = email;
        currentUser.course = courseInput?.value.trim() || "B.Tech";
        currentUser.university =
            universityInput?.value.trim() || "KL University";
        currentUser.goal = goalInput?.value.trim() || "";

        sessionStorage.setItem(
            "studentHubSession",
            JSON.stringify(currentUser)
        );

        updateUserDisplay(name);
        alert("Profile updated successfully!");
    });

    // Logout
    document.getElementById("logout-button")?.addEventListener("click", () => {
        sessionStorage.removeItem("studentHubSession");
        window.location.replace("login.html");
    });
});
