package com.project.back_end.services;

import com.project.back_end.dto.Login;
import com.project.back_end.models.Admin;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repositories.AdminRepository;
import com.project.back_end.repositories.AppointmentRepository;
import com.project.back_end.repositories.DoctorRepository;
import com.project.back_end.repositories.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@org.springframework.stereotype.Service
public class Service {
    private final TokenService tokenService;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;

    public Service(TokenService tokenService, AdminRepository adminRepository,
                   DoctorRepository doctorRepository, PatientRepository patientRepository,
                   AppointmentRepository appointmentRepository,
                   DoctorService doctorService, PatientService patientService) {
        this.tokenService = tokenService;
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    public ResponseEntity<Map<String, String>> validateToken(String token, String user) {
        Map<String, String> response = new HashMap<>();
        if (!tokenService.validateToken(token, user)) {
            response.put("message", "Invalid or expired token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        response.put("message", "Token valid");
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, String>> validateAdmin(Admin receivedAdmin) {
        Map<String, String> response = new HashMap<>();
        try {
            Optional<Admin> admin = adminRepository.findByUsername(receivedAdmin.getUsername());
            if (admin.isEmpty() || !admin.get().getPassword().equals(receivedAdmin.getPassword())) {
                response.put("message", "Invalid username or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            response.put("token", tokenService.generateToken(admin.get().getUsername()));
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Database unavailable or server configuration error. Check MySQL is running and spring.datasource.password is configured.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public Map<String, Object> filterDoctor(String name, String specialty, String time) {
        boolean n = has(name), s = has(specialty), t = has(time);
        if (!n && !s && !t) return Map.of("doctors", doctorService.getDoctors());
        if (n && s && t) return doctorService.filterDoctorsByNameSpecilityandTime(name, specialty, time);
        if (n && t) return doctorService.filterDoctorByNameAndTime(name, time);
        if (n && s) return doctorService.filterDoctorByNameAndSpecility(name, specialty);
        if (s && t) return doctorService.filterDoctorByTimeAndSpecility(specialty, time);
        if (n) return doctorService.findDoctorByName(name);
        if (s) return doctorService.filterDoctorBySpecility(specialty);
        return doctorService.filterDoctorsByTime(time);
    }

    public int validateAppointment(Appointment appointment) {
        try {
            if (appointment == null || appointment.getDoctor() == null || appointment.getAppointmentTime() == null) {
                return 0;
            }

            Long doctorId = appointment.getDoctor().getId();
            if (doctorId == null) return 0;

            Optional<Doctor> doctorOptional = doctorRepository.findById(doctorId);
            if (doctorOptional.isEmpty()) return -1;

            Doctor doctor = doctorOptional.get();
            LocalDateTime requestedStart = appointment.getAppointmentTime().withSecond(0).withNano(0);
            LocalDateTime requestedEnd = requestedStart.plusHours(1);

            // A booking is valid only when its start time is an actual doctor schedule slot.
            boolean scheduledSlot = doctor.getAvailableTimes() != null && doctor.getAvailableTimes().stream()
                    .anyMatch(slot -> slotStartsAt(slot, requestedStart.toLocalTime()));
            if (!scheduledSlot) return 0;

            // Reject any existing appointment that overlaps the requested one.
            LocalDateTime dayStart = requestedStart.toLocalDate().atStartOfDay();
            LocalDateTime dayEnd = requestedStart.toLocalDate().plusDays(1).atStartOfDay().minusNanos(1);
            List<Appointment> existing = appointmentRepository
                    .findByDoctorIdAndAppointmentTimeBetween(doctorId, dayStart, dayEnd);

            boolean overlaps = existing.stream().anyMatch(existingAppointment -> {
                LocalDateTime existingStart = existingAppointment.getAppointmentTime();
                if (existingStart == null) return false;
                LocalDateTime existingEnd = existingStart.plusHours(1);
                return existingStart.isBefore(requestedEnd) && existingEnd.isAfter(requestedStart);
            });

            return overlaps ? 0 : 1;
        } catch (Exception e) {
            return 0;
        }
    }

    private boolean slotStartsAt(String slot, java.time.LocalTime requested) {
        try {
            if (slot == null || slot.isBlank()) return false;
            String[] parts = slot.trim().split("-");
            if (parts.length != 2) return false;
            java.time.LocalTime start = java.time.LocalTime.parse(parts[0].trim());
            return start.equals(requested);
        } catch (Exception ignored) {
            return false;
        }
    }

    public boolean validatePatient(Patient patient) {
        try {
            return patientRepository.findByEmailOrPhone(patient.getEmail(), patient.getPhone()).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    public ResponseEntity<Map<String, String>> validatePatientLogin(Login login) {
        Map<String, String> response = new HashMap<>();
        try {
            Optional<Patient> patient = patientRepository.findByEmail(login.getIdentifier());
            if (patient.isEmpty() || !patient.get().getPassword().equals(login.getPassword())) {
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            response.put("token", tokenService.generateToken(patient.get().getEmail()));
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<Map<String, Object>> filterPatient(String condition, String name, String token) {
        try {
            Optional<Patient> patient = patientRepository.findByEmail(tokenService.extractIdentifier(token));
            if (patient.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Patient not found"));
            Long id = patient.get().getId();
            if (has(condition) && has(name)) return patientService.filterByDoctorAndCondition(condition, name, id);
            if (has(condition)) return patientService.filterByCondition(condition, id);
            if (has(name)) return patientService.filterByDoctor(name, id);
            return patientService.getPatientAppointment(id, token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unable to filter patient appointments"));
        }
    }

    public String extractPatientEmail(String token) { return tokenService.extractIdentifier(token); }
    public Long extractDoctorId(String token) { return tokenService.extractDoctorIdFromToken(token); }

    private boolean has(String value) { return value != null && !value.equalsIgnoreCase("null") && !value.isBlank(); }
}
