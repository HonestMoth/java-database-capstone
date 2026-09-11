import { createDoctorCard } from "./components/doctorCard.js";
import { openModal } from "./components/modals.js";
import {
    getDoctors,
    filterDoctors
} from "./services/doctorServices.js";


// =========================================
// State
// =========================================

let doctors = [];
let searchValue = "";
let selectedTime = "";
let selectedSpecialty = "";


// =========================================
// Render Doctors
// =========================================

function renderDoctors(doctorList) {
    const content = document.getElementById("content");

    if (!content) {
        console.error("Element #content not found.");
        return;
    }

    content.innerHTML = "";

    if (!Array.isArray(doctorList) || doctorList.length === 0) {
        content.innerHTML = `
            <p class="noDoctorRecord">
                No doctors found.
            </p>
        `;
        return;
    }

    doctorList.forEach((doctor) => {
        const card = createDoctorCard(doctor);

        if (card) {
            content.appendChild(card);
        }
    });
}


// =========================================
// Load Doctors
// =========================================

async function loadDoctors() {
    const content = document.getElementById("content");

    if (content) {
        content.innerHTML = `
            <p class="noDoctorRecord">
                Loading doctors...
            </p>
        `;
    }

    try {
        doctors = await getDoctors();

        renderDoctors(doctors);

    } catch (error) {
        console.error("Error loading doctors:", error);

        if (content) {
            content.innerHTML = `
                <p class="noDoctorRecord">
                    Unable to load doctors.
                </p>
            `;
        }
    }
}


// =========================================
// Filter Doctors
// =========================================

async function applyDoctorFilters() {
    try {
        const filteredDoctors = await filterDoctors(
            searchValue,
            selectedTime,
            selectedSpecialty
        );

        renderDoctors(filteredDoctors);

    } catch (error) {
        console.error(
            "Error filtering doctors:",
            error
        );

        renderDoctors([]);
    }
}


// =========================================
// Search
// =========================================

function handleSearch(event) {
    searchValue = event.target.value.trim();

    applyDoctorFilters();
}


// =========================================
// Time Filter
// =========================================

function handleTimeFilter(event) {
    selectedTime = event.target.value;

    applyDoctorFilters();
}


// =========================================
// Specialty Filter
// =========================================

function handleSpecialtyFilter(event) {
    selectedSpecialty = event.target.value;

    applyDoctorFilters();
}


// =========================================
// Patient Login
// =========================================

async function loginPatient() {
    openModal("login");
}


// =========================================
// Patient Signup
// =========================================

async function signupPatient() {
    openModal("signup");
}


// =========================================
// Render Content
// =========================================

async function renderContent() {
    await loadDoctors();
}


// =========================================
// Global Functions
// =========================================

window.renderContent = renderContent;
window.loginPatient = loginPatient;
window.signupPatient = signupPatient;


// =========================================
// Initialize
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchBar =
            document.getElementById("searchBar");

        const filterTime =
            document.getElementById("filterTime");

        const filterSpecialty =
            document.getElementById("filterSpecialty");

        const loginBtn =
            document.getElementById("loginBtn");

        const signupBtn =
            document.getElementById("signupBtn");


        if (searchBar) {
            searchBar.addEventListener(
                "input",
                handleSearch
            );
        }


        if (filterTime) {
            filterTime.addEventListener(
                "change",
                handleTimeFilter
            );
        }


        if (filterSpecialty) {
            filterSpecialty.addEventListener(
                "change",
                handleSpecialtyFilter
            );
        }


        if (loginBtn) {
            loginBtn.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    loginPatient();
                }
            );
        }


        if (signupBtn) {
            signupBtn.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    signupPatient();
                }
            );
        }


        /*
         * Only load automatically if the page
         * hasn't already called renderContent()
         * through body onload.
         */
        if (
            !document.body.hasAttribute("onload")
        ) {
            renderContent();
        }
    }
);