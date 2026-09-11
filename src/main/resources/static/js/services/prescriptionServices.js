import { API_BASE_URL } from "../config/config.js";
const PRESCRIPTION_API = API_BASE_URL + "/prescription";

export async function savePrescription(prescription, token) {
    try {
        const response = await fetch(`${PRESCRIPTION_API}/${encodeURIComponent(token)}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prescription)
        });
        const data = await response.json().catch(() => ({}));
        return { success: response.ok, message: data.message || (response.ok ? "Prescription saved" : "Failed to save prescription.") };
    } catch (error) { console.error(error); return { success: false, message: "Unable to connect to the server." }; }
}

export async function getPrescription(appointmentId, token) {
    try {
        const response = await fetch(`${PRESCRIPTION_API}/${encodeURIComponent(appointmentId)}/${encodeURIComponent(token)}`);
        if (!response.ok) throw new Error(`Failed to get prescription: ${response.status}`);
        return await response.json();
    } catch (error) { console.error(error); return null; }
}
