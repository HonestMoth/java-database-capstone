export function createPatientRow(appointment) {
    if (!appointment) {
        return null;
    }

    const row = document.createElement("tr");

    const patientId =
        appointment.patientId ??
        appointment.patient_id ??
        appointment.patient?.id ??
        "-";

    const name =
        appointment.patientName ??
        appointment.patient_name ??
        appointment.patient?.name ??
        "-";

    const phone =
        appointment.patientPhone ??
        appointment.patient_phone ??
        appointment.patient?.phone ??
        "-";

    const email =
        appointment.patientEmail ??
        appointment.patient_email ??
        appointment.patient?.email ??
        "-";

    const appointmentId =
        appointment.id ??
        appointment.appointmentId ??
        appointment.appointment_id ??
        "";

    row.innerHTML = `
        <td>${escapeHtml(patientId)}</td>
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(phone)}</td>
        <td>${escapeHtml(email)}</td>
        <td>
            <button
                type="button"
                class="prescription-btn"
                data-patient-id="${escapeHtml(patientId)}"
                data-appointment-id="${escapeHtml(appointmentId)}"
            >
                Add Prescription
            </button>
        </td>
    `;

    const prescriptionButton =
        row.querySelector(".prescription-btn");

    if (prescriptionButton) {
        prescriptionButton.addEventListener(
            "click",
            () => {
                openPrescriptionPage(
                    patientId,
                    appointmentId
                );
            }
        );
    }

    return row;
}


function openPrescriptionPage(
    patientId,
    appointmentId
) {
    const params = new URLSearchParams();

    if (patientId) {
        params.set("patientId", patientId);
    }

    if (appointmentId) {
        params.set("appointmentId", appointmentId);
    }

    window.location.href =
        `/pages/addPrescription.html?${params.toString()}`;
}


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}