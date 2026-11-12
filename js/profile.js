document.addEventListener("DOMContentLoaded", () => {
    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem("studentHubSession") || "null");
    } catch (error) {
        console.error("Could not read the current session.", error);
    }

    if (!currentUser || !currentUser.email) {
        location.replace("login.html");
        return;
    }

    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const courseInput = document.getElementById("profile-course");
    const universityInput = document.getElementById("profile-university");
    const goalInput = document.getElementById("profile-goal");
    const profileForm = document.getElementById("profile-form");
    const messageBox = document.getElementById("profile-message");
    const saveButton = profileForm.querySelector('[type="submit"]');

    nameInput.value = currentUser.name || "";
    emailInput.value = currentUser.email;
    courseInput.value = currentUser.course || "";
    universityInput.value = currentUser.university || "";
    goalInput.value = currentUser.goal || "";

    function showMessage(message, success = false) {
        messageBox.textContent = message;
        messageBox.classList.toggle("success", success);
        messageBox.hidden = !message;
    }

    function updateUserDisplay(name) {
        const initial = name.trim().charAt(0).toUpperCase() || "S";
        document.querySelectorAll(".avatar, .sidebar-avatar, .user-avatar").forEach(element => {
            element.textContent = initial;
        });
        document.querySelectorAll("[data-user-name], .sidebar-user strong").forEach(element => {
            element.textContent = name;
        });
    }

    updateUserDisplay(currentUser.name || "Student");

    profileForm.addEventListener("submit", event => {
        event.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage("Enter your name and a valid email address.");
            return;
        }

        const updatedUser = {
            ...currentUser,
            name,
            email,
            course: courseInput.value.trim(),
            university: universityInput.value.trim(),
            goal: goalInput.value.trim()
        };
        saveButton.disabled = true;
        try {
            sessionStorage.setItem("studentHubSession", JSON.stringify(updatedUser));
            currentUser = updatedUser;
            updateUserDisplay(name);
            window.dispatchEvent(new CustomEvent("studenthub:auth-change", {
                detail: { user: updatedUser }
            }));
            showMessage("Profile saved for this browser session.", true);
        } catch (error) {
            console.error("Could not save the profile for this session.", error);
            showMessage("Could not save your profile. Check browser storage.");
        } finally {
            saveButton.disabled = false;
        }
    });
});
