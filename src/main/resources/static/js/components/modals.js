import { patientLogin, patientSignup } from "../services/patientServices.js";

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModalButton = document.getElementById("closeModal");

export function openModal(type, data = null) {
    if (!modal || !modalBody) {
        console.error("Modal elements not found.");
        return;
    }

    modalBody.innerHTML = "";

    switch (type) {
        case "adminLogin":
            renderAdminLogin();
            break;

        case "doctorLogin":
            renderDoctorLogin();
            break;

        case "login":
            renderPatientLogin();
            break;

        case "signup":
            renderPatientSignup();
            break;

        case "addDoctor":
            renderAddDoctor();
            break;

        default:
            console.error(`Unknown modal type: ${type}`);
            return;
    }

    modal.style.display = "flex";
    modal.classList.add("active");
}

export function closeModal() {
    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";

    if (modalBody) {
        modalBody.innerHTML = "";
    }
}

if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal);
}

if (modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

function renderAdminLogin() {
    modalBody.innerHTML = `
        <div class="modal-content-inner">
            <h2>Admin Login</h2>

            <form onsubmit="event.preventDefault(); adminLoginHandler();">
                <input
                    type="text"
                    id="adminUsername"
                    placeholder="Username"
                    required
                />

                <input
                    type="password"
                    id="adminPassword"
                    placeholder="Password"
                    required
                />

                <button type="submit" class="button">
                    Login
                </button>
            </form>
        </div>
    `;
}

function renderDoctorLogin() {
    modalBody.innerHTML = `
        <div class="modal-content-inner">
            <h2>Doctor Login</h2>

            <form onsubmit="event.preventDefault(); doctorLoginHandler();">
                <input
                    type="email"
                    id="doctorEmail"
                    placeholder="Email"
                    required
                />

                <input
                    type="password"
                    id="doctorPassword"
                    placeholder="Password"
                    required
                />

                <button type="submit" class="button">
                    Login
                </button>
            </form>
        </div>
    `;
}

function renderPatientLogin() {
    modalBody.innerHTML = `
        <div class="modal-content-inner">
            <h2>Patient Login</h2>

            <form id="patientLoginForm">
                <input
                    type="email"
                    id="patientEmail"
                    placeholder="Email"
                    required
                />

                <input
                    type="password"
                    id="patientPassword"
                    placeholder="Password"
                    required
                />

                <button type="submit" class="button">
                    Login
                </button>
            </form>

            <p>
                Don't have an account?
                <a href="#" id="switchToSignup">Sign Up</a>
            </p>
        </div>
    `;

    document
        .getElementById("patientLoginForm")
        ?.addEventListener("submit", loginPatient);

    document
        .getElementById("switchToSignup")
        ?.addEventListener("click", (event) => {
            event.preventDefault();
            openModal("signup");
        });
}

function renderPatientSignup() {
    modalBody.innerHTML = `
        <div class="modal-content-inner">
            <h2>Patient Sign Up</h2>

            <form id="patientSignupForm">

                <input
                    type="text"
                    id="signupName"
                    placeholder="Full Name"
                    required
                />

                <input
                    type="email"
                    id="signupEmail"
                    placeholder="Email"
                    required
                />

                <input
                    type="tel"
                    id="signupPhone"
                    placeholder="Phone"
                    required
                />

                <input
                    type="password"
                    id="signupPassword"
                    placeholder="Password"
                    required
                />

                <button type="submit" class="button">
                    Create Account
                </button>
            </form>

            <p>
                Already have an account?
                <a href="#" id="switchToLogin">Login</a>
            </p>
        </div>
    `;

    document
        .getElementById("patientSignupForm")
        ?.addEventListener("submit", signupPatient);

    document
        .getElementById("switchToLogin")
        ?.addEventListener("click", (event) => {
            event.preventDefault();
            openModal("login");
        });
}

function renderAddDoctor() {
    modalBody.innerHTML = `
        <div class="modal-content-inner">
            <h2>Add Doctor</h2>
            <form id="addDoctorForm">
                <input type="text" id="doctorName" placeholder="Doctor name" required />
                <select id="doctorSpecialty" required>
                    <option value="">Select specialty</option>
                    <option>Cardiologist</option>
                    <option>Neurologist</option>
                    <option>Orthopedist</option>
                    <option>Pediatrician</option>
                    <option>Dermatologist</option>
                </select>
                <input type="email" id="doctorEmail" placeholder="Professional email" required />
                <input type="tel" id="doctorPhone" placeholder="10-digit phone number" inputmode="numeric" maxlength="10" required />
                <input type="password" id="doctorPassword" placeholder="Temporary password (6+ characters)" minlength="6" required />
                <div class="availability-section" id="availability">
                    <h3>Appointment availability</h3>
                    <div class="slot-grid">
                        ${["09:00-10:00","10:00-11:00","11:00-12:00","12:00-13:00","13:00-14:00","14:00-15:00","15:00-16:00","16:00-17:00"].map(slot => `
                            <label><input type="checkbox" name="availability" value="${slot}"><span>${slot}</span></label>
                        `).join("")}
                    </div>
                </div>
                <button type="submit" class="button">Add Doctor</button>
            </form>
        </div>
    `;
    document.getElementById("addDoctorForm")?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (typeof window.adminAddDoctor === "function") window.adminAddDoctor(event);
        else alert("Admin doctor service is still loading. Please try again.");
    });
}

async function loginPatient(event) {
    event.preventDefault();

    const email = document
        .getElementById("patientEmail")
        ?.value.trim();

    const password = document
        .getElementById("patientPassword")
        ?.value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const response = await patientLogin({
            email,
            password
        });

        if (!response.ok) {
            alert("Invalid credentials!");
            return;
        }

        const data = await response.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "loggedPatient");

        closeModal();

        window.location.href = "/pages/patientDashboard.html";

    } catch (error) {
        console.error("Patient login error:", error);
        alert("Unable to connect to the server.");
    }
}

async function signupPatient(event) {
    event.preventDefault();

    const name = document
        .getElementById("signupName")
        ?.value.trim();

    const email = document
        .getElementById("signupEmail")
        ?.value.trim();

    const phone = document
        .getElementById("signupPhone")
        ?.value.trim();

    const password = document
        .getElementById("signupPassword")
        ?.value;

    if (!name || !email || !phone || !password) {
        alert("Please complete all fields.");
        return;
    }

    const result = await patientSignup({
        name,
        email,
        phone,
        password
    });

    if (!result.success) {
        alert(result.message);
        return;
    }

    alert("Patient registered successfully.");

    openModal("login");

    const patientEmail = document.getElementById("patientEmail");

    if (patientEmail) {
        patientEmail.value = email;
    }
}

window.openModal = openModal;
window.closeModal = closeModal;
window.signupPatient = signupPatient;
window.loginPatient = loginPatient;
// Bridge ES-module functions to the existing classic-script UI components.
window.openModal = openModal;
window.closeModal = closeModal;
