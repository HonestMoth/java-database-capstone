import { getAllAppointments } from "./services/appointmentRecordService.js";
import { createPatientRow } from "./components/patientRows.js";

let selectedDate = new Date().toISOString().split("T")[0];
let token = localStorage.getItem("token");
let patientName = "";

const tableBody = document.getElementById("patientTableBody");
const searchBar = document.getElementById("searchBar");
const datePicker = document.getElementById("datePicker");
const todayBtn = document.getElementById("todayBtn");


/**
 * Load appointments for the selected date.
 */
async function loadAppointments(
    date = selectedDate,
    search = patientName
) {
    if (!tableBody) {
        console.error("Element #patientTableBody was not found.");
        return;
    }

    token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in again.");
        window.location.href = "/";
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="noPatientRecord">
                Loading patient records...
            </td>
        </tr>
    `;

    try {
        const appointments = await getAllAppointments(
            date,
            token,
            search
        );

        tableBody.innerHTML = "";

        if (
            !Array.isArray(appointments) ||
            appointments.length === 0
        ) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="noPatientRecord">
                        No patient records found.
                    </td>
                </tr>
            `;

            return;
        }

        appointments.forEach((appointment) => {
            const row = createPatientRow(appointment);

            if (row) {
                tableBody.appendChild(row);
            }
        });

        if (!tableBody.children.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="noPatientRecord">
                        No patient records found.
                    </td>
                </tr>
            `;
        }

    } catch (error) {
        console.error(
            "Error loading doctor appointments:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="noPatientRecord">
                    Unable to load patient records.
                </td>
            </tr>
        `;
    }
}


/**
 * Load today's appointments.
 */
function loadTodayAppointments() {
    selectedDate = new Date()
        .toISOString()
        .split("T")[0];

    patientName = "";

    if (datePicker) {
        datePicker.value = selectedDate;
    }

    if (searchBar) {
        searchBar.value = "";
    }

    loadAppointments(
        selectedDate,
        ""
    );
}


/**
 * Handle date selection.
 */
function handleDateChange(event) {
    const selectedValue = event.target.value;

    if (!selectedValue) {
        return;
    }

    selectedDate = selectedValue;

    loadAppointments(
        selectedDate,
        patientName
    );
}


/**
 * Handle patient-name search.
 */
function handleSearch(event) {
    patientName = event.target.value.trim();

    loadAppointments(
        selectedDate,
        patientName
    );
}


/**
 * Expose functions globally when needed
 * by HTML buttons or other components.
 */
window.loadAppointments = loadAppointments;
window.loadTodayAppointments = loadTodayAppointments;


/**
 * Initialize dashboard.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        token = localStorage.getItem("token");

        /*
         * Doctor dashboard requires authentication.
         */
        if (!token) {
            alert("Please log in again.");
            window.location.href = "/";
            return;
        }

        /*
         * Set date picker to today.
         */
        if (datePicker) {
            datePicker.value = selectedDate;

            datePicker.addEventListener(
                "change",
                handleDateChange
            );
        }

        /*
         * Today's appointments button.
         */
        if (todayBtn) {
            todayBtn.addEventListener(
                "click",
                loadTodayAppointments
            );
        }

        /*
         * Patient search.
         */
        if (searchBar) {
            searchBar.addEventListener(
                "input",
                handleSearch
            );
        }

        /*
         * Initial load.
         */
        loadAppointments(
            selectedDate,
            ""
        );
    }
);