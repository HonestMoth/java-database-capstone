import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";

function renderDoctorCards(doctors) {
    const content = document.getElementById("content");
    const count = document.getElementById("doctorCount");
    if (!content) return;
    const list = Array.isArray(doctors) ? doctors : [];
    if (count) count.textContent = list.length;
    content.innerHTML = "";
    if (!list.length) {
        content.innerHTML = `<div class="empty-state"><strong>No doctors found</strong><span>Try a different name, specialty, or time filter.</span></div>`;
        return;
    }
    list.forEach(doctor => content.appendChild(createDoctorCard(doctor)));
}

async function loadDoctorCards() {
    const content = document.getElementById("content");
    if (content) content.innerHTML = `<div class="empty-state">Loading doctor directory…</div>`;
    try {
        renderDoctorCards(await getDoctors());
    } catch (error) {
        console.error("Doctor loading failed", error);
        if (content) content.innerHTML = `<div class="empty-state error"><strong>Unable to load doctors</strong><span>${escapeHtml(error.message || "Server error")}</span></div>`;
    }
}

let filterTimer;
async function filterDoctorsOnChange() {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(async () => {
        const name = document.getElementById("searchBar")?.value.trim() || "";
        const time = document.getElementById("filterTime")?.value || "";
        const specialty = document.getElementById("filterSpecialty")?.value || "";
        try {
            renderDoctorCards(await filterDoctors(name, time, specialty));
        } catch (error) {
            console.error("Doctor filter failed", error);
            const content = document.getElementById("content");
            if (content) content.innerHTML = `<div class="empty-state error"><strong>Filter failed</strong><span>${escapeHtml(error.message || "Server error")}</span></div>`;
        }
    }, 120);
}

window.adminAddDoctor = async function(event) {
    event?.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || localStorage.getItem("userRole") !== "admin") {
        alert("Your admin session has expired. Please log in again.");
        window.location.href = "/";
        return;
    }

    const name = document.getElementById("doctorName")?.value.trim() || "";
    const specialty = document.getElementById("doctorSpecialty")?.value.trim() || "";
    const email = document.getElementById("doctorEmail")?.value.trim() || "";
    const password = document.getElementById("doctorPassword")?.value || "";
    const phone = document.getElementById("doctorPhone")?.value.trim() || "";
    const availableTimes = [...document.querySelectorAll("#availability input[name='availability']:checked")].map(x => x.value);

    if (!name || !specialty || !email || !password || !phone) {
        alert("Please complete all doctor fields.");
        return;
    }
    if (!/^\d{10}$/.test(phone)) {
        alert("Phone number must contain exactly 10 digits.");
        return;
    }
    if (password.length < 6) {
        alert("Doctor password must contain at least 6 characters.");
        return;
    }
    if (!availableTimes.length) {
        alert("Select at least one appointment time slot.");
        return;
    }

    const button = document.querySelector("#addDoctorForm button[type='submit']");
    if (button) { button.disabled = true; button.textContent = "Adding…"; }
    try {
        const result = await saveDoctor({ name, specialty, email, password, phone, availableTimes }, token);
        if (!result.success) {
            alert(result.message || "Unable to add doctor.");
            return;
        }
        closeAddDoctorModal();
        await loadDoctorCards();
        alert("Doctor added successfully.");
    } catch (error) {
        console.error("Add doctor failed", error);
        alert(error.message || "Unable to add doctor.");
    } finally {
        if (button) { button.disabled = false; button.textContent = "Add Doctor"; }
    }
};

function closeAddDoctorModal() {
    const modal = document.getElementById("modal");
    if (typeof window.closeModal === "function") window.closeModal();
    else if (modal) { modal.classList.remove("active"); modal.style.display = "none"; }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addDocBtn")?.addEventListener("click", () => openModal("addDoctor"));
    document.getElementById("searchBar")?.addEventListener("input", filterDoctorsOnChange);
    document.getElementById("filterTime")?.addEventListener("change", filterDoctorsOnChange);
    document.getElementById("filterSpecialty")?.addEventListener("change", filterDoctorsOnChange);
    loadDoctorCards();
});
