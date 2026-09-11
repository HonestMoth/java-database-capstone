import {
    savePrescription
} from "./services/prescriptionServices.js";


const prescriptionForm =
    document.getElementById(
        "prescriptionForm"
    );

const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );

const patientIdInput =
    document.getElementById(
        "patientId"
    );

const appointmentIdInput =
    document.getElementById(
        "appointmentId"
    );


function getUrlParameters() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return {
        patientId:
            params.get("patientId"),

        appointmentId:
            params.get("appointmentId")
    };
}


function loadPrescriptionContext() {

    const {
        patientId,
        appointmentId
    } = getUrlParameters();


    if (patientId) {
        patientIdInput.value =
            patientId;
    }


    if (appointmentId) {
        appointmentIdInput.value =
            appointmentId;
    }
}


async function handleSubmit(event) {

    event.preventDefault();


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Your session has expired. Please log in again."
        );

        window.location.href = "/";

        return;
    }


    const patientId =
        patientIdInput.value;

    const appointmentId =
        appointmentIdInput.value;


    const medicine =
        document
            .getElementById("medicine")
            .value
            .trim();

    const dosage =
        document
            .getElementById("dosage")
            .value
            .trim();

    const frequency =
        document
            .getElementById("frequency")
            .value
            .trim();

    const duration =
        document
            .getElementById("duration")
            .value
            .trim();

    const instructions =
        document
            .getElementById("instructions")
            .value
            .trim();


    if (!patientId) {

        alert(
            "Patient information is missing."
        );

        return;
    }


    if (!medicine || !dosage ||
        !frequency || !duration) {

        alert(
            "Please complete all required fields."
        );

        return;
    }


    const prescription = {

        patientId: Number(
            patientId
        ),

        appointmentId:
            appointmentId
                ? Number(appointmentId)
                : null,

        medicine,

        dosage,

        frequency,

        duration,

        instructions
    };


    try {

        const result =
            await savePrescription(
                prescription,
                token
            );


        if (!result.success) {

            alert(
                result.message ||
                "Failed to save prescription."
            );

            return;
        }


        alert(
            "Prescription saved successfully."
        );


        window.location.href =
            "/templates/doctor/doctorDashboard";

    } catch (error) {

        console.error(
            "Prescription error:",
            error
        );

        alert(
            "Unable to save prescription."
        );
    }
}


if (prescriptionForm) {

    prescriptionForm.addEventListener(
        "submit",
        handleSubmit
    );
}


if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "/templates/doctor/doctorDashboard";

        }
    );
}


document.addEventListener(
    "DOMContentLoaded",
    loadPrescriptionContext
);