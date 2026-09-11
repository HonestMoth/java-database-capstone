import {
    getPatientData,
    getPatientAppointments,
    filterAppointments
} from "./services/patientServices.js";


let token = localStorage.getItem("token");

let patient = null;

let appointments = [];

let searchValue = "";

let conditionValue = "";


const content =
    document.getElementById(
        "appointmentsContent"
    );

const searchBar =
    document.getElementById(
        "appointmentSearch"
    );

const conditionFilter =
    document.getElementById(
        "conditionFilter"
    );


function escapeHtml(value) {

    if (value === null ||
        value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getAppointmentDate(appointment) {

    return (
        appointment.date ??
        appointment.appointmentDate ??
        appointment.appointment_date ??
        "-"
    );
}


function getAppointmentTime(appointment) {

    return (
        appointment.time ??
        appointment.appointmentTime ??
        appointment.appointment_time ??
        "-"
    );
}


function getDoctorName(appointment) {

    return (
        appointment.doctorName ??
        appointment.doctor_name ??
        appointment.doctor?.name ??
        appointment.doctor?.fullName ??
        "-"
    );
}


function getReason(appointment) {

    return (
        appointment.reason ??
        appointment.condition ??
        appointment.description ??
        "-"
    );
}


function getStatus(appointment) {

    return (
        appointment.status ??
        appointment.condition ??
        "Scheduled"
    );
}


function renderAppointments(list) {

    if (!content) {
        return;
    }


    content.innerHTML = "";


    if (!Array.isArray(list) ||
        list.length === 0) {

        content.innerHTML = `
            <div class="no-appointments">
                <h3>No appointments found</h3>
                <p>
                    You currently have no appointments matching your search.
                </p>
            </div>
        `;

        return;
    }


    list.forEach(
        (appointment) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "appointment-card";


            const date =
                getAppointmentDate(
                    appointment
                );

            const time =
                getAppointmentTime(
                    appointment
                );

            const doctor =
                getDoctorName(
                    appointment
                );

            const reason =
                getReason(
                    appointment
                );

            const status =
                getStatus(
                    appointment
                );


            card.innerHTML = `

                <div class="appointment-card-header">

                    <h3>
                        Dr. ${escapeHtml(doctor)}
                    </h3>

                    <span class="appointment-status">
                        ${escapeHtml(status)}
                    </span>

                </div>


                <div class="appointment-details">

                    <div>
                        <strong>Date</strong>
                        <span>
                            ${escapeHtml(date)}
                        </span>
                    </div>


                    <div>
                        <strong>Time</strong>
                        <span>
                            ${escapeHtml(time)}
                        </span>
                    </div>


                    <div>
                        <strong>Reason</strong>
                        <span>
                            ${escapeHtml(reason)}
                        </span>
                    </div>

                </div>

            `;


            content.appendChild(
                card
            );

        }
    );
}


async function loadAppointments() {

    token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Please log in to view your appointments."
        );

        window.location.href =
            "/pages/patientDashboard.html";

        return;
    }


    if (content) {

        content.innerHTML = `
            <p class="loading-message">
                Loading appointments...
            </p>
        `;

    }


    try {

        patient =
            await getPatientData(
                token
            );


        if (!patient) {

            throw new Error(
                "Unable to retrieve patient information."
            );

        }


        const patientId =
            patient.id ??
            patient.patientId ??
            patient.patient_id;


        if (!patientId) {

            throw new Error(
                "Patient ID was not returned by the server."
            );

        }


        appointments =
            await getPatientAppointments(
                patientId,
                token,
                "patient"
            );


        if (!Array.isArray(appointments)) {

            appointments = [];

        }


        renderAppointments(
            appointments
        );

    } catch (error) {

        console.error(
            "Error loading appointments:",
            error
        );


        if (content) {

            content.innerHTML = `
                <div class="no-appointments">
                    <h3>
                        Unable to load appointments
                    </h3>

                    <p>
                        Please try again later.
                    </p>
                </div>
            `;

        }

    }

}


async function applyFilters() {

    if (!token) {
        return;
    }


    if (!conditionValue &&
        !searchValue) {

        renderAppointments(
            appointments
        );

        return;
    }


    try {

        const filtered =
            await filterAppointments(
                conditionValue,
                searchValue,
                token
            );


        renderAppointments(
            filtered
        );

    } catch (error) {

        console.error(
            "Appointment filter error:",
            error
        );

        renderAppointments([]);
    }

}


function handleSearch(event) {

    searchValue =
        event.target.value.trim();

    applyFilters();
}


function handleConditionFilter(event) {

    conditionValue =
        event.target.value;

    applyFilters();
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (searchBar) {

            searchBar.addEventListener(
                "input",
                handleSearch
            );

        }


        if (conditionFilter) {

            conditionFilter.addEventListener(
                "change",
                handleConditionFilter
            );

        }


        loadAppointments();

    }
);


window.loadPatientAppointments =
    loadAppointments;