const API_URL = "https://clothing-store-g5qx.onrender.com";  

async function signup() {
    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const role = document.getElementById("signupRole").value;

    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
    });

    if (response.ok) {
        alert("User registered successfully! Now log in.");
        window.location.href = "login.html";
    } else {
        alert("Error signing up!");
    }
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            alert("Logged in successfully!");
            window.location.href = "index.html";
        } else {
            alert(`Login failed: ${data.error}`);
        }
    } catch (error) {
        console.error("Login request failed:", error);
        alert("An error occurred while logging in.");
    }
}

async function loadProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Unauthorized! Please log in.");
        window.location.href = "login.html";
        return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to load profile");
        }

        const user = await response.json();
        console.log("👤 Данные пользователя:", user); 

        const usernameElem = document.getElementById("profileUsername");
        const emailElem = document.getElementById("profileEmail");
        const roleElem = document.getElementById("profileRole");
        const avatarElem = document.getElementById("avatar");

        if (!usernameElem || !emailElem || !roleElem || !avatarElem) {
            console.error("⚠️ Не найдены элементы профиля в HTML!");
            return;
        }

        usernameElem.innerText = user.username || "Unknown User";
        emailElem.innerText = user.email || "No Email";
        roleElem.innerText = user.role || "No Role";
        avatarElem.src = user.avatar ? user.avatar : "img/default-avatar.png"; 

    } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
        alert("Error loading profile!");
        window.location.href = "login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            login();
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();
            signup();
        });
    }
});

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("Logged out!");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("profile.html")) {
        loadProfile();
    }
});