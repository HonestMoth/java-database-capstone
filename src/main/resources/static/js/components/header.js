function renderHeader() {
    const headerDiv = document.getElementById("header");
    if (!headerDiv) return;
    const path = window.location.pathname;
    if (path === "/" || path === "") { headerDiv.innerHTML = ""; return; }
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");
    if ((role === "admin" || role === "doctor" || role === "loggedPatient") && !token) {
        localStorage.removeItem("userRole"); window.location.href = "/"; return;
    }
    let portal = role === "admin" ? "Admin Console" : role === "doctor" ? "Clinical Desk" : role === "loggedPatient" ? "Patient Portal" : "Smart Clinic";
    let actions = "";
    if (role === "admin") actions = '<button id="addDocBtn" class="adminBtn">+ Add Doctor</button><a href="#" id="logoutBtn">Sign out</a>';
    else if (role === "doctor") actions = '<a href="/doctorDashboard/'+encodeURIComponent(token)+'">Dashboard</a><a href="#" id="logoutBtn">Sign out</a>';
    else if (role === "loggedPatient") actions = '<a href="/pages/patientDashboard.html">Find a doctor</a><a href="/pages/patientAppointments.html">Appointments</a><a href="#" id="logoutBtn">Sign out</a>';
    else actions = '<a href="#" id="loginBtn">Login</a><a href="#" id="signupBtn">Create account</a>';
    headerDiv.innerHTML = `<div class="brand"><span class="brand-mark">+</span><span><b>Smart Clinic</b><small>${portal}</small></span></div><nav class="top-nav">${actions}</nav>`;
    attachHeaderButtonListeners();
}

function attachHeaderButtonListeners() {

    const addDocBtn = document.getElementById("addDocBtn");

    if (addDocBtn) {
        addDocBtn.addEventListener("click", () => {
            if (typeof window.openModal === "function") {
                window.openModal("addDoctor");
            }
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();
            logout();
        });
    }

    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", (event) => {
            event.preventDefault();

            if (typeof window.openModal === "function") {
                window.openModal("login");
            }
        });
    }

    const signupBtn = document.getElementById("signupBtn");

    if (signupBtn) {
        signupBtn.addEventListener("click", (event) => {
            event.preventDefault();

            if (typeof window.openModal === "function") {
                window.openModal("signup");
            }
        });
    }
}


function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");

    window.location.href = "/";
}


function logoutPatient() {
    localStorage.removeItem("token");
    localStorage.setItem("userRole", "patient");

    window.location.href = "/pages/patientDashboard.html";
}


renderHeader();