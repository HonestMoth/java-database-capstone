package com.project.back_end.services;

import com.project.back_end.dto.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repositories.AppointmentRepository;
import com.project.back_end.repositories.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    public PatientService(PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          TokenService tokenService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    public int createPatient(Patient patient) {
        try {
            patientRepository.save(patient);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long id, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = tokenService.extractIdentifier(token);
            Optional<Patient> patient = patientRepository.findByEmail(email);
            if (patient.isEmpty() || !patient.get().getId().equals(id)) {
                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            List<AppointmentDTO> appointments = appointmentRepository.findByPatientId(id)
                    .stream().map(AppointmentDTO::new).collect(Collectors.toList());
            response.put("appointments", appointments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Unable to retrieve appointments");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<Map<String, Object>> filterByCondition(String condition, Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            int status = isPast(condition) ? 1 : 0;
            List<AppointmentDTO> appointments = appointmentRepository
                    .findByPatient_IdAndStatusOrderByAppointmentTimeAsc(id, status)
                    .stream().map(AppointmentDTO::new).collect(Collectors.toList());
            response.put("appointments", appointments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Unable to filter appointments");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<Map<String, Object>> filterByDoctor(String name, Long patientId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<AppointmentDTO> appointments = appointmentRepository
                    .filterByDoctorNameAndPatientId(name, patientId)
                    .stream().map(AppointmentDTO::new).collect(Collectors.toList());
            response.put("appointments", appointments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Unable to filter appointments");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<Map<String, Object>> filterByDoctorAndCondition(
            String condition, String name, long patientId) {
        Map<String, Object> response = new HashMap<>();
        try {
            int status = isPast(condition) ? 1 : 0;
            List<AppointmentDTO> appointments = appointmentRepository
                    .filterByDoctorNameAndPatientIdAndStatus(name, patientId, status)
                    .stream().map(AppointmentDTO::new).collect(Collectors.toList());
            response.put("appointments", appointments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Unable to filter appointments");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<Map<String, Object>> getPatientDetails(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = tokenService.extractIdentifier(token);
            Optional<Patient> patient = patientRepository.findByEmail(email);
            if (patient.isEmpty()) {
                response.put("message", "Patient not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.put("patient", patient.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Unable to retrieve patient details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Existing method names retained so older frontend/backend code remains source-compatible.
    public Patient registerPatient(Patient patient) { return patientRepository.save(patient); }
    public Patient getPatientById(Long id) { return patientRepository.findById(id).orElseThrow(); }
    public Patient getPatientByEmail(String email) { return patientRepository.findByEmail(email).orElseThrow(); }
    public boolean validateCredentials(String email, String password) {
        return patientRepository.findByEmail(email).map(p -> p.getPassword().equals(password)).orElse(false);
    }

    private boolean isPast(String condition) {
        return condition != null && (condition.equalsIgnoreCase("past") ||
                condition.equalsIgnoreCase("completed") || condition.equalsIgnoreCase("1"));
    }
}
