import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";
import { getDoctorAvailability } from "../services/doctorServices.js";


export function createDoctorCard(doctor) {

    if (!doctor) {
        return null;
    }

    const card = document.createElement("div");

    card.className = "doctor-card";

    const id =
        doctor.id ??
        doctor.doctorId ??
        doctor.doctor_id ??
        "";

    const name =
        doctor.name ??
        doctor.doctorName ??
        doctor.doctor_name ??
        "Doctor";

    const email =
        doctor.email ??
        "-";

    const phone =
        doctor.phone ??
        doctor.phoneNumber ??
        "-";

    const specialty =
        doctor.specialty ??
        doctor.specialisation ??
        doctor.specialization ??
        "-";

    const availability =
        doctor.availability ??
        doctor.availableTimes ??
        doctor.available_times ??
        "Availability not specified";


    card.innerHTML = `
        <div class="doctor-card-content">

            <h3>
                Dr. ${escapeHtml(name)}
            </h3>

            <p class="specialty">
                ${escapeHtml(specialty)}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHtml(email)}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHtml(phone)}
            </p>

            <p class="availability">
                <strong>Availability:</strong>
                ${escapeHtml(formatAvailability(availability))}
            </p>

        </div>

        <div class="card-actions"></div>
    `;


    const actions =
        card.querySelector(".card-actions");

    const role =
        localStorage.getItem("userRole");


    /*
     * ADMIN
     * -------------------------------------
     * Admin can delete doctors.
     */
    if (role === "admin") {

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "delete-doctor-btn";

        deleteButton.textContent =
            "Delete Doctor";

        deleteButton.addEventListener(
            "click",
            async () => {

                const confirmed =
                    confirm(
                        `Delete Dr. ${name}?`
                    );

                if (!confirmed) {
                    return;
                }

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    alert(
                        "Your session has expired."
                    );

                    window.location.href = "/";

                    return;
                }

                const result =
                    await deleteDoctor(
                        id,
                        token
                    );

                alert(result.message);

                if (result.success) {
                    card.remove();
                }
            }
        );

        actions.appendChild(deleteButton);

        return card;
    }


    /*
     * LOGGED-IN PATIENT
     * -------------------------------------
     * Patient can book an appointment.
     */
    if (role === "loggedPatient") {

        const bookButton =
            document.createElement("button");

        bookButton.type = "button";

        bookButton.className =
            "book-now-btn";

        bookButton.textContent =
            "Book Now";

        bookButton.addEventListener(
            "click",
            async (event) => {

                const token =
                    localStorage.getItem("token");

                if (!token) {

                    alert(
                        "Please log in to book an appointment."
                    );

                    localStorage.setItem(
                        "userRole",
                        "patient"
                    );

                    return;
                }


                try {

                    const patientData =
                        await getPatientData(token);

                    if (!patientData) {

                        alert(
                            "Unable to load your patient profile."
                        );

                        return;
                    }


                    if (
                        typeof window.showBookingOverlay ===
                        "function"
                    ) {

                        window.showBookingOverlay(
                            event,
                            doctor,
                            patientData
                        );

                    } else {

                        openBookingOverlay(
                            event,
                            doctor,
                            patientData
                        );
                    }

                } catch (error) {

                    console.error(
                        "Booking error:",
                        error
                    );

                    alert(
                        "Unable to start appointment booking."
                    );
                }
            }
        );

        actions.appendChild(bookButton);

        return card;
    }


    /*
     * NON-LOGGED-IN PATIENT
     * -------------------------------------
     */
    if (
        role === "patient" ||
        role === null ||
        role === ""
    ) {

        const bookButton =
            document.createElement("button");

        bookButton.type = "button";

        bookButton.className =
            "book-now-btn";

        bookButton.textContent =
            "Book Now";

        bookButton.addEventListener(
            "click",
            () => {

                alert(
                    "Please log in as a patient to book an appointment."
                );

                if (
                    typeof window.openModal ===
                    "function"
                ) {

                    window.openModal("login");
                }
            }
        );

        actions.appendChild(bookButton);

        return card;
    }


    return card;
}


/*
 * =========================================
 * Booking Overlay
 * =========================================
 */

function openBookingOverlay(
    event,
    doctor,
    patient
) {

    const existing =
        document.querySelector(
            ".modalApp"
        );

    if (existing) {
        existing.remove();
    }


    const doctorId =
        doctor.id ??
        doctor.doctorId ??
        doctor.doctor_id ??
        "";


    const patientId =
        patient.id ??
        patient.patientId ??
        patient.patient_id ??
        "";


    const doctorName =
        doctor.name ??
        doctor.doctorName ??
        "Doctor";


    const overlay =
        document.createElement("div");

    overlay.className =
        "modalApp";


    overlay.innerHTML = `
        <button
            type="button"
            class="close-booking"
            id="closeBooking"
        >
            &times;
        </button>

        <h2>
            Book Appointment
        </h2>

        <p style="text-align:center; margin-bottom:15px;">
            Dr. ${escapeHtml(doctorName)}
        </p>

        <input
            type="hidden"
            id="bookingDoctorId"
            value="${escapeHtml(doctorId)}"
        >

        <input
            type="hidden"
            id="bookingPatientId"
            value="${escapeHtml(patientId)}"
        >

        <input
            type="date"
            id="appointmentDate"
            required
        >

        <select
            id="appointmentTime"
            required
        >
            <option value="">Select an available time</option>
        </select>
        <p class="availability-hint" id="availabilityHint">Select a date to load available appointment times.</p>

        <textarea
            id="appointmentReason"
            rows="4"
            placeholder="Reason for appointment"
        ></textarea>

        <button
            type="button"
            class="booking-confirm-btn"
            id="confirmBooking"
        >
            Confirm Appointment
        </button>
    `;


    document.body.appendChild(overlay);


    /*
     * Minimum date = today.
     */
    const dateInput =
        overlay.querySelector(
            "#appointmentDate"
        );

    if (dateInput) {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        dateInput.min = today;
        dateInput.value = today;
    }

    const timeSelect = overlay.querySelector("#appointmentTime");
    const availabilityHint = overlay.querySelector("#availabilityHint");

    async function loadAvailableTimes() {
        if (!timeSelect || !dateInput || !dateInput.value) return;
        timeSelect.innerHTML = '<option value="">Loading available times...</option>';
        if (availabilityHint) availabilityHint.textContent = "Checking this doctor's schedule...";
        try {
            const token = localStorage.getItem("token");
            const slots = await getDoctorAvailability("patient", doctorId, dateInput.value, token);
            timeSelect.innerHTML = '<option value="">Select an available time</option>';
            if (!slots.length) {
                timeSelect.innerHTML = '<option value="">No available times</option>';
                if (availabilityHint) availabilityHint.textContent = "No appointment slots are available for this date.";
                return;
            }
            slots.forEach(slot => {
                const option = document.createElement("option");
                option.value = String(slot).split("-")[0];
                option.textContent = String(slot);
                timeSelect.appendChild(option);
            });
            if (availabilityHint) availabilityHint.textContent = "Only currently available schedule slots are shown.";
        } catch (error) {
            console.error("Unable to load doctor availability:", error);
            timeSelect.innerHTML = '<option value="">Unable to load availability</option>';
            if (availabilityHint) availabilityHint.textContent = "Could not load availability. Please try again.";
        }
    }

    dateInput?.addEventListener("change", loadAvailableTimes);
    loadAvailableTimes();


    /*
     * Close button.
     */
    overlay
        .querySelector("#closeBooking")
        ?.addEventListener(
            "click",
            () => {
                closeBookingOverlay(
                    overlay
                );
            }
        );


    /*
     * Click outside modal.
     */
    overlay.addEventListener(
        "click",
        (clickEvent) => {

            if (
                clickEvent.target ===
                overlay
            ) {

                closeBookingOverlay(
                    overlay
                );
            }
        }
    );


    /*
     * Confirm booking.
     */
    overlay
        .querySelector("#confirmBooking")
        ?.addEventListener(
            "click",
            async () => {

                await confirmBooking(
                    overlay,
                    doctor,
                    patient
                );
            }
        );


    /*
     * Animate modal.
     */
    requestAnimationFrame(
        () => {
            overlay.classList.add(
                "active"
            );
        }
    );
}


/*
 * =========================================
 * Confirm Booking
 * =========================================
 */

async function confirmBooking(
    overlay,
    doctor,
    patient
) {

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert(
            "Your session has expired. Please log in again."
        );

        window.location.href = "/";

        return;
    }


    const doctorId =
        doctor.id ??
        doctor.doctorId ??
        doctor.doctor_id;


    const patientId =
        patient.id ??
        patient.patientId ??
        patient.patient_id;


    const date =
        overlay
            .querySelector(
                "#appointmentDate"
            )
            ?.value;


    const time =
        overlay
            .querySelector(
                "#appointmentTime"
            )
            ?.value;


    const reason =
        overlay
            .querySelector(
                "#appointmentReason"
            )
            ?.value
            .trim();


    if (
        !doctorId ||
        !patientId ||
        !date ||
        !time
    ) {

        alert(
            "Please select an appointment date and time."
        );

        return;
    }


    /*
     * Load appointment service dynamically.
     */
    try {

        const {
            createAppointment
        } = await import(
            "../services/appointmentRecordService.js"
        );


        const appointment = {
            doctor: { id: Number(doctorId) },
            patient: { id: Number(patientId) },
            appointmentTime: `${date}T${time}:00`,
            status: 0
        };


        const result =
            await createAppointment(
                appointment,
                token
            );


        if (!result.success) {

            alert(
                result.message ||
                "Unable to book appointment."
            );

            return;
        }


        /*
         * Booking successful.
         */
        createBookingRipple();

        alert(
            "Appointment booked successfully!"
        );


        closeBookingOverlay(
            overlay
        );

    } catch (error) {

        console.error(
            "Appointment booking error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );
    }
}


/*
 * =========================================
 * Close Booking Overlay
 * =========================================
 */

function closeBookingOverlay(
    overlay
) {

    if (!overlay) {
        return;
    }

    overlay.classList.remove(
        "active"
    );

    setTimeout(
        () => {

            if (overlay.parentNode) {
                overlay.remove();
            }

        },
        350
    );
}


/*
 * =========================================
 * Ripple Effect
 * =========================================
 */

function createBookingRipple() {

    const ripple =
        document.createElement("div");

    ripple.className =
        "ripple-overlay";


    document.body.appendChild(
        ripple
    );


    requestAnimationFrame(
        () => {

            ripple.classList.add(
                "active"
            );
        }
    );


    setTimeout(
        () => {

            ripple.remove();

        },
        700
    );
}


/*
 * =========================================
 * Helpers
 * =========================================
 */

function formatAvailability(
    availability
) {

    if (Array.isArray(availability)) {

        return availability.join(", ");
    }

    if (
        typeof availability ===
        "object" &&
        availability !== null
    ) {

        return Object.entries(
            availability
        )
            .map(
                ([day, time]) =>
                    `${day}: ${time}`
            )
            .join(", ");
    }

    return String(
        availability
    );
}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


window.createDoctorCard =
    createDoctorCard;

window.showBookingOverlay =
    openBookingOverlay;