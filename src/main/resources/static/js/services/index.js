import { API_BASE_URL } from "../config/config.js";
import { openModal } from "../components/modals.js";

window.selectRole = function (role) {
    if (role === "admin") {
        const token = localStorage.getItem("token");
        if (token && localStorage.getItem("userRole") === "admin") {
            window.location.href = `/adminDashboard/${encodeURIComponent(token)}`;
            return;
        }
        openModal("adminLogin");
        return;
    }

    if (role === "doctor") {
        const token = localStorage.getItem("token");
        if (token && localStorage.getItem("userRole") === "doctor") {
            window.location.href = `/doctorDashboard/${encodeURIComponent(token)}`;
            return;
        }
        openModal("doctorLogin");
        return;
    }

    if (role === "patient") {
        const token = localStorage.getItem("token");
        if (token && localStorage.getItem("userRole") === "loggedPatient") {
            window.location.href = "/pages/patientDashboard.html";
            return;
        }
        localStorage.setItem("userRole", "patient");
        openModal("login");
    }
};

const ADMIN_API = API_BASE_URL + "/admin";
const DOCTOR_API = API_BASE_URL + "/doctor/login";

window.adminLoginHandler = async function () {
    const username = document.getElementById("adminUsername")?.value.trim();
    const password = document.getElementById("adminPassword")?.value;
    if (!username || !password) return alert("Please enter username and password.");
    try {
        const response = await fetch(ADMIN_API, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (_) {}
        if (!response.ok) return alert(data.message || `Login failed (${response.status})`);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "admin");
        window.location.href = `/adminDashboard/${encodeURIComponent(data.token)}`;
    } catch (error) {
        console.error("Admin login error:", error); alert("Unable to connect to the server.");
    }
};

window.doctorLoginHandler = async function () {
    const email = document.getElementById("doctorEmail")?.value.trim();
    const password = document.getElementById("doctorPassword")?.value;
    if (!email || !password) return alert("Please enter email and password.");
    try {
        const response = await fetch(DOCTOR_API, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: email, password })
        });
        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (_) {}
        if (!response.ok) return alert(data.message || `Login failed (${response.status})`);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "doctor");
        window.location.href = `/doctorDashboard/${encodeURIComponent(data.token)}`;
    } catch (error) {
        console.error("Doctor login error:", error); alert("Unable to connect to the server.");
    }
};
