import { API_BASE_URL } from "../config/config.js";
const APPOINTMENT_API = API_BASE_URL + "/appointments";

export async function getAllAppointments(date, token, patientName = "") {
    const safeDate = date || new Date().toISOString().split("T")[0];
    const name = patientName || "null";
    const response = await fetch(`${APPOINTMENT_API}/${encodeURIComponent(safeDate)}/${encodeURIComponent(name)}/${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error(`Failed to fetch appointments: ${response.status}`);
    return await response.json();
}

export async function createAppointment(appointment, token) {
    try {
        const response = await fetch(`${APPOINTMENT_API}/${encodeURIComponent(token)}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(appointment)
        });
        const data = await response.json().catch(() => ({}));
        return { success: response.ok, message: data.message || (response.ok ? "Appointment booked successfully." : "Failed to book appointment."), data };
    } catch (error) {
        console.error(error); return { success: false, message: "Unable to connect to the server." };
    }
}

export async function updateAppointment(appointmentId, patientId, appointment, token) {
    try {
        const payload = { ...appointment, id: appointmentId, patient: appointment.patient || { id: patientId } };
        const response = await fetch(`${APPOINTMENT_API}/${encodeURIComponent(token)}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        return { success: response.ok, message: data.message || (response.ok ? "Appointment updated successfully." : "Failed to update appointment.") };
    } catch (error) {
        console.error(error); return { success: false, message: "Unable to connect to the server." };
    }
}

export async function cancelAppointment(appointmentId, patientId, token) {
    try {
        const response = await fetch(`${APPOINTMENT_API}/${encodeURIComponent(appointmentId)}/${encodeURIComponent(token)}`, { method: "DELETE" });
        const data = await response.json().catch(() => ({}));
        return { success: response.ok, message: data.message || (response.ok ? "Appointment cancelled." : "Failed to cancel appointment.") };
    } catch (error) {
        console.error(error); return { success: false, message: "Unable to connect to the server." };
    }
}
