import { API_BASE_URL } from "../config/config.js";
const DOCTOR_API = API_BASE_URL + "/doctor";

async function readResponse(response) {
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { message: text }; }
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
    return data;
}

export async function getDoctors() {
    const data = await readResponse(await fetch(DOCTOR_API, { headers: { Accept: "application/json" } }));
    return Array.isArray(data) ? data : (data.doctors || []);
}

export async function deleteDoctor(id, token) {
    try {
        const data = await readResponse(await fetch(`${DOCTOR_API}/${encodeURIComponent(id)}/${encodeURIComponent(token)}`, { method: "DELETE", headers: { Accept: "application/json" } }));
        return { success: true, message: data.message || "Doctor deleted successfully." };
    } catch (error) { return { success: false, message: error.message || "Unable to delete doctor." }; }
}

export async function saveDoctor(doctor, token) {
    try {
        const response = await fetch(`${DOCTOR_API}/${encodeURIComponent(token)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(doctor)
        });
        const data = await readResponse(response);
        return { success: true, message: data.message || "Doctor saved successfully.", data };
    } catch (error) { return { success: false, message: error.message || "Unable to save doctor." }; }
}

export async function filterDoctors(name = "", time = "", specialty = "") {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (time) params.set("time", time);
    if (specialty) params.set("specialty", specialty);
    const query = params.toString();
    const response = await fetch(`${DOCTOR_API}/filter${query ? `?${query}` : ""}`, { headers: { Accept: "application/json" } });
    const data = await readResponse(response);
    return Array.isArray(data) ? data : (data.doctors || []);
}

export async function getDoctorAvailability(user, doctorId, date, token) {
    const response = await fetch(`${DOCTOR_API}/availability/${encodeURIComponent(user)}/${encodeURIComponent(doctorId)}/${encodeURIComponent(date)}/${encodeURIComponent(token)}`);
    const data = await readResponse(response);
    return data.availability || [];
}
