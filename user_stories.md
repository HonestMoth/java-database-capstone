# User Stories

## 1. Admin User Stories

### Admin 1 — Login

**Title:** Admin login

_As an admin, I want to log into the portal with my username and password, so that I can securely manage the platform._

**Acceptance Criteria:**

1. Admin can enter a valid username and password.
2. Valid credentials allow access to the admin dashboard.
3. Invalid credentials display an appropriate error message.

**Priority:** High  
**Story Points:** 3

**Notes:**

- Admin access should be restricted to authorized users.

---

### Admin 2 — Logout

**Title:** Admin logout

_As an admin, I want to log out of the portal, so that I can protect system access._

**Acceptance Criteria:**

1. Admin can select the logout option.
2. The current session is terminated.
3. After logout, protected admin pages cannot be accessed without logging in again.

**Priority:** High  
**Story Points:** 2

---

### Admin 3 — Add Doctor

**Title:** Add doctor

_As an admin, I want to add doctors to the portal, so that doctors can provide their services through the platform._

**Acceptance Criteria:**

1. Admin can enter the doctor's required information.
2. A valid doctor profile is saved successfully.
3. The newly added doctor appears in the doctor list.

**Priority:** High  
**Story Points:** 5

**Notes:**

- Required fields should be validated before saving.

---

### Admin 4 — Delete Doctor

**Title:** Delete doctor profile

_As an admin, I want to delete a doctor's profile, so that inactive doctors can be removed from the portal._

**Acceptance Criteria:**

1. Admin can select a doctor profile.
2. Admin can delete the selected profile.
3. The deleted doctor no longer appears as an available doctor.

**Priority:** High  
**Story Points:** 5

**Notes:**

- The system should prevent accidental deletion where appropriate.

---

### Admin 5 — Appointment Statistics

**Title:** View monthly appointment statistics

_As an admin, I want to run a MySQL stored procedure that returns the number of appointments per month, so that I can track platform usage statistics._

**Acceptance Criteria:**

1. A MySQL stored procedure calculates appointment counts by month.
2. The procedure can be executed from the MySQL CLI.
3. The result displays the appointment count for each month.

**Priority:** Medium  
**Story Points:** 5

**Notes:**

- The procedure should use appointment data stored in the database.

---

# 2. Patient User Stories

### Patient 1 — View Doctors

**Title:** View doctors without logging in

_As a patient, I want to view a list of doctors without logging in, so that I can explore my options before registering._

**Acceptance Criteria:**

1. The doctor list is accessible without authentication.
2. Available doctors are displayed.
3. Patients can view relevant doctor information.

**Priority:** High  
**Story Points:** 3

---

### Patient 2 — Sign Up

**Title:** Patient registration

_As a patient, I want to sign up using my email and password, so that I can book appointments._

**Acceptance Criteria:**

1. Patient can provide an email and password.
2. Valid registration creates a patient account.
3. Invalid or duplicate registration information is rejected appropriately.

**Priority:** High  
**Story Points:** 5

---

### Patient 3 — Login

**Title:** Patient login

_As a patient, I want to log into the portal, so that I can manage my bookings._

**Acceptance Criteria:**

1. Patient can enter their credentials.
2. Valid credentials provide access to the patient dashboard.
3. Invalid credentials display an error.

**Priority:** High  
**Story Points:** 3

---

### Patient 4 — Logout

**Title:** Patient logout

_As a patient, I want to log out of the portal, so that I can secure my account._

**Acceptance Criteria:**

1. Patient can select logout.
2. The patient session is terminated.
3. Protected patient pages require authentication after logout.

**Priority:** High  
**Story Points:** 2

---

### Patient 5 — Book Appointment

**Title:** Book an hour-long appointment

_As a patient, I want to log in and book an hour-long appointment with a doctor, so that I can consult with the doctor._

**Acceptance Criteria:**

1. Patient must be authenticated before booking.
2. Patient can select a doctor and available appointment slot.
3. The appointment duration is one hour.
4. A successful booking is saved and associated with the patient and doctor.

**Priority:** High  
**Story Points:** 8

**Notes:**

- Unavailable or already-booked slots must not be bookable.

---

### Patient 6 — View Upcoming Appointments

**Title:** View upcoming appointments

_As a patient, I want to view my upcoming appointments, so that I can prepare accordingly._

**Acceptance Criteria:**

1. Patient can access their upcoming appointments after logging in.
2. Appointment date, time, and doctor information are displayed.
3. Only appointments belonging to the logged-in patient are displayed.

**Priority:** High  
**Story Points:** 3

---

# 3. Doctor User Stories

### Doctor 1 — Login

**Title:** Doctor login

_As a doctor, I want to log into the portal, so that I can manage my appointments._

**Acceptance Criteria:**

1. Doctor can enter valid login credentials.
2. Valid credentials provide access to the doctor dashboard.
3. Invalid credentials display an error message.

**Priority:** High  
**Story Points:** 3

---

### Doctor 2 — Logout

**Title:** Doctor logout

_As a doctor, I want to log out of the portal, so that I can protect my data._

**Acceptance Criteria:**

1. Doctor can select logout.
2. The doctor session is terminated.
3. Protected doctor pages cannot be accessed after logout without authentication.

**Priority:** High  
**Story Points:** 2

---

### Doctor 3 — Appointment Calendar

**Title:** View appointment calendar

_As a doctor, I want to view my appointment calendar, so that I can stay organized._

**Acceptance Criteria:**

1. Doctor can view scheduled appointments.
2. Appointments display relevant date and time information.
3. Only appointments assigned to the logged-in doctor are displayed.

**Priority:** High  
**Story Points:** 5

---

### Doctor 4 — Mark Unavailability

**Title:** Mark doctor unavailability

_As a doctor, I want to mark myself as unavailable, so that patients only see available appointment slots._

**Acceptance Criteria:**

1. Doctor can mark specific dates or time periods as unavailable.
2. Unavailable slots cannot be booked by patients.
3. Available slots remain visible to patients.

**Priority:** High  
**Story Points:** 5

**Notes:**

- Existing appointments should not be silently removed when availability changes.

---

### Doctor 5 — Update Profile

**Title:** Update doctor profile

_As a doctor, I want to update my specialization and contact information, so that patients have up-to-date information._

**Acceptance Criteria:**

1. Doctor can update specialization.
2. Doctor can update contact information.
3. Updated information is saved successfully.
4. Patients can see the updated profile information.

**Priority:** Medium  
**Story Points:** 5

---

### Doctor 6 — View Patient Details

**Title:** View patient details

_As a doctor, I want to view patient details for upcoming appointments, so that I can be prepared._

**Acceptance Criteria:**

1. Doctor can select an upcoming appointment.
2. The relevant patient's permitted details are displayed.
3. Doctor cannot access unrelated patients' information.

**Priority:** High  
**Story Points:** 5

**Notes:**

- Patient information should only be accessible to authorized doctors.