# v6 fixes

- Admin Add Doctor now submits actual appointment time slots (`09:00-10:00` through `16:00-17:00`) instead of weekday strings.
- The add-doctor modal now has the required `#availability` container, validates phone/password/availability, disables the submit button while saving, and reports the actual server error.
- Admin and patient specialty filters now use the database's seeded names: `Cardiologist`, `Neurologist`, `Orthopedist`, `Pediatrician`, `Dermatologist`.
- Added `/api/doctor/filter?name=&time=&specialty=` while retaining the lab path endpoint.
- Time filtering supports AM/PM and exact slots such as `09:00-10:00`.
- The lab's test data explicitly uses `Cardiologist` and the `09:00-10:00` style slots.
