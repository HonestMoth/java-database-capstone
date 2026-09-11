import { API_BASE_URL } from "../config/config.js";
const PATIENT_API = API_BASE_URL + "/patient";

export async function patientSignup(data) {
    try {
        const response = await fetch(PATIENT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const result = await response.json().catch(() => ({}));
        return { success: response.ok, message: result.message || (response.ok ? "Signup successful" : "Patient registration failed."), data: result };
    } catch (error) { console.error(error); return { success: false, message: "Unable to connect to the server." }; }
}

export async function patientLogin(data) {
    const payload = { identifier: data.identifier || data.email, password: data.password };
    return fetch(`${PATIENT_API}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

export async function getPatientData(token) {
    try {
        const response = await fetch(`${PATIENT_API}/${encodeURIComponent(token)}`);
        if (!response.ok) throw new Error(`Failed to get patient data: ${response.status}`);
        const data = await response.json(); return data.patient || data;
    } catch (error) { console.error(error); return null; }
}

export async function getPatientAppointments(id, token, user = "patient") {
    try {
        const response = await fetch(`${PATIENT_API}/${encodeURIComponent(id)}/${encodeURIComponent(token)}`);
        if (!response.ok) throw new Error(`Failed to get appointments: ${response.status}`);
        const data = await response.json(); return data.appointments || data;
    } catch (error) { console.error(error); return []; }
}

export async function filterAppointments(condition = "", name = "", token) {
    try {
        const c = condition || "null"; const n = name || "null";
        const response = await fetch(`${PATIENT_API}/filter/${encodeURIComponent(c)}/${encodeURIComponent(n)}/${encodeURIComponent(token)}`);
        if (!response.ok) throw new Error(`Failed to filter appointments: ${response.status}`);
        const data = await response.json(); return data.appointments || data;
    } catch (error) { console.error(error); return []; }
}
