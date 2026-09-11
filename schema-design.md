# Smart Clinic Management System — Schema Design

## MySQL Database Design

MySQL will store the clinic's structured operational data, including patients, doctors, administrators, appointments, availability, prescriptions, and payments. These entities have clear relationships and require validation and referential integrity.

### Table: patients

- `id`: INT, Primary Key, Auto Increment
- `first_name`: VARCHAR(100), Not Null
- `last_name`: VARCHAR(100), Not Null
- `email`: VARCHAR(255), Not Null, Unique
- `password_hash`: VARCHAR(255), Not Null
- `phone`: VARCHAR(20)
- `date_of_birth`: DATE
- `address`: VARCHAR(255)
- `created_at`: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP

**Notes:**
- Email must be unique so that one account cannot be registered multiple times.
- Passwords should be stored as secure hashes rather than plain text.
- Patient records should normally be retained even after they stop using the system so that medical and appointment history is not lost.

---

### Table: doctors

- `id`: INT, Primary Key, Auto Increment
- `first_name`: VARCHAR(100), Not Null
- `last_name`: VARCHAR(100), Not Null
- `email`: VARCHAR(255), Not Null, Unique
- `password_hash`: VARCHAR(255), Not Null
- `phone`: VARCHAR(20)
- `specialization`: VARCHAR(150), Not Null
- `license_number`: VARCHAR(100), Not Null, Unique
- `years_of_experience`: INT
- `bio`: TEXT
- `created_at`: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP

**Notes:**
- Each doctor has a unique email and medical license number.
- Doctor profiles should remain available for historical appointment records even if the doctor becomes inactive.

---

### Table: admin

- `id`: INT, Primary Key, Auto Increment
- `username`: VARCHAR(100), Not Null, Unique
- `email`: VARCHAR(255), Not Null, Unique
- `password_hash`: VARCHAR(255), Not Null
- `full_name`: VARCHAR(200), Not Null
- `created_at`: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP
- `is_active`: BOOLEAN, Not Null, Default TRUE

**Notes:**
- Admin accounts require unique usernames and email addresses.
- Only active administrators should be allowed to access administrative functions.

---

### Table: appointments

- `id`: INT, Primary Key, Auto Increment
- `doctor_id`: INT, Foreign Key → doctors(id), Not Null
- `patient_id`: INT, Foreign Key → patients(id), Not Null
- `appointment_time`: DATETIME, Not Null
- `duration_minutes`: INT, Not Null, Default 60
- `status`: VARCHAR(20), Not Null, Default 'Scheduled'
- `reason`: VARCHAR(500)
- `notes`: TEXT
- `created_at`: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP

**Notes:**
- An appointment connects one patient with one doctor.
- The default appointment duration is 60 minutes.
- Valid statuses can include `Scheduled`, `Completed`, `Cancelled`, and `No-Show`.
- A doctor should not have overlapping appointments.
- A patient's appointment history should be retained rather than automatically deleted.

**Delete behavior:**
- Patient and doctor records should not be physically deleted if they have historical appointments.
- Instead, accounts can be marked inactive.
- Foreign-key relationships should therefore use restrictive deletion behavior where appropriate.

---

### Table: doctor_availability

- `id`: INT, Primary Key, Auto Increment
- `doctor_id`: INT, Foreign Key → doctors(id), Not Null
- `day_of_week`: TINYINT, Not Null
- `start_time`: TIME, Not Null
- `end_time`: TIME, Not Null
- `is_available`: BOOLEAN, Not Null, Default TRUE

**Notes:**
- This table represents a doctor's normal working hours and availability.
- `day_of_week` can represent Monday through Sunday.
- `end_time` must be later than `start_time`.
- The application should prevent overlapping availability periods.

---

### Table: prescriptions

- `id`: INT, Primary Key, Auto Increment
- `appointment_id`: INT, Foreign Key → appointments(id), Not Null
- `doctor_id`: INT, Foreign Key → doctors(id), Not Null
- `patient_id`: INT, Foreign Key → patients(id), Not Null
- `medication`: VARCHAR(255), Not Null
- `dosage`: VARCHAR(100), Not Null
- `frequency`: VARCHAR(100)
- `duration`: VARCHAR(100)
- `instructions`: TEXT
- `created_at`: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP

**Notes:**
- A prescription is associated with the appointment during which it was created.
- Patient and doctor IDs are stored to make authorization and reporting easier.
- Prescription history should be retained for future reference.

---

### Table: clinic_locations

- `id`: INT, Primary Key, Auto Increment
- `name`: VARCHAR(150), Not Null
- `address`: VARCHAR(255), Not Null
- `city`: VARCHAR(100), Not Null
- `state`: VARCHAR(100)
- `postal_code`: VARCHAR(20)
- `phone`: VARCHAR(20)
- `is_active`: BOOLEAN, Not Null, Default TRUE

**Notes:**
- Multiple clinic locations can be supported.
- Locations should not be deleted if they are referenced by historical records; they can instead be marked inactive.

---

### Table: payments

- `id`: INT, Primary Key, Auto Increment
- `appointment_id`: INT, Foreign Key → appointments(id), Not Null
- `patient_id`: INT, Foreign Key → patients(id), Not Null
- `amount`: DECIMAL(10,2), Not Null
- `payment_method`: VARCHAR(50), Not Null
- `payment_status`: VARCHAR(30), Not Null, Default 'Pending'
- `transaction_reference`: VARCHAR(150), Unique
- `paid_at`: TIMESTAMP
- `created_at`: TIMESTAMP, Not Null, Default CURRENT_TIMESTAMP

**Notes:**
- Payment amounts should use `DECIMAL` rather than floating-point types.
- Payment history should be retained for accounting and auditing purposes.
- A payment can be associated with an appointment.

---

## Relationships and Design Decisions

The main relationships in the MySQL database are:

- One **patient** can have many **appointments**.
- One **doctor** can have many **appointments**.
- One **doctor** can have multiple availability records.
- One **appointment** can have one or more prescription records if the clinic permits multiple prescriptions.
- One **appointment** can have payment records.
- A **clinic location** can support multiple doctors and appointments if location relationships are added to those tables.

### Data Integrity

The design uses:

- Primary keys to uniquely identify records.
- Foreign keys to maintain relationships between entities.
- `NOT NULL` constraints for required information.
- `UNIQUE` constraints for emails, usernames, and license numbers.
- `AUTO_INCREMENT` for generated numeric IDs.
- `DECIMAL(10,2)` for financial amounts.
- Application-level validation for email and phone formats.
- Application/database validation to prevent overlapping doctor appointments.

### Deletion Strategy

Medical and appointment history should not disappear simply because a patient or doctor leaves the clinic.

For this reason:

- Patient accounts should preferably be deactivated instead of deleted.
- Doctor accounts should preferably be deactivated instead of deleted.
- Historical appointments and prescriptions should be retained.
- Foreign keys should prevent accidental deletion of records that are still referenced.

---

# MongoDB Collection Design

MongoDB will be used for flexible data that may change over time or contain nested and free-form information.

### Collection: feedback

Patient feedback is a good candidate for MongoDB because feedback can contain optional fields, ratings, tags, comments, and metadata that may evolve without requiring frequent relational schema changes.

```json
{
  "_id": "ObjectId('64abc123456')",
  "patientId": 101,
  "doctorId": 25,
  "appointmentId": 501,
  "rating": 5,
  "comment": "The doctor was professional and explained everything clearly.",
  "tags": [
    "professional",
    "friendly",
    "clear-explanation"
  ],
  "categories": {
    "communication": 5,
    "waitTime": 4,
    "overallExperience": 5
  },
  "metadata": {
    "submittedFrom": "web",
    "language": "en",
    "anonymous": false
  },
  "createdAt": "2026-09-11T10:30:00Z"
}
```

### MongoDB Design Decisions

- The document stores `patientId`, `doctorId`, and `appointmentId` instead of embedding complete patient or doctor objects.
- IDs avoid duplicating structured patient and doctor information already stored in MySQL.
- `tags` provide flexible categorization of feedback.
- `categories` can contain different rating categories as the application evolves.
- `metadata` allows additional information to be added without changing a relational table.
- The `anonymous` field allows the clinic to support anonymous feedback if required.

### Why MongoDB?

MongoDB is appropriate for feedback because:

1. Feedback can have different optional fields.
2. New metadata can be added without altering a fixed table schema.
3. Arrays such as tags are naturally represented.
4. Nested objects such as category ratings are easy to store.
5. The MySQL database remains the source of truth for structured patient, doctor, and appointment relationships.

### Future Extensions

The MongoDB design can later support additional collections such as:

- `messages` — doctor-patient chat records.
- `activity_logs` — patient check-ins, login events, and system activity.
- `documents` — metadata for uploaded medical documents.
- `prescription_metadata` — flexible prescription-related information.

For example, a future chat message could contain:

```json
{
  "_id": "ObjectId('64abc789012')",
  "appointmentId": 501,
  "senderId": 101,
  "senderRole": "patient",
  "receiverId": 25,
  "message": "Can I arrive 10 minutes early?",
  "attachments": [],
  "metadata": {
    "platform": "web",
    "read": true
  },
  "createdAt": "2026-09-11T10:45:00Z"
}
```

This hybrid design allows MySQL to handle structured transactional clinic data while MongoDB handles flexible, evolving data such as feedback, messages, logs, and document metadata.