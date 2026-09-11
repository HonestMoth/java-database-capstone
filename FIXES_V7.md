# Smart Clinic Management System v7

Booking fixes:
- Frontend now sends the Appointment entity shape expected by Spring (`doctor.id`, `patient.id`, `appointmentTime`, `status`).
- Booking modal loads the selected doctor’s actual available slots for the selected date.
- Backend rejects bookings outside a configured doctor slot.
- Backend rejects overlapping appointments for the same doctor/date.
- Availability endpoint removes already-booked slots correctly.
