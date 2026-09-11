package com.project.back_end.services;

import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repositories.AppointmentRepository;
import com.project.back_end.repositories.DoctorRepository;
import com.project.back_end.repositories.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TokenService tokenService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            TokenService tokenService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.tokenService = tokenService;
    }

    public int bookAppointment(Appointment appointment) {
        try {
            appointmentRepository.save(appointment);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    public ResponseEntity<Map<String, String>> updateAppointment(Appointment appointment) {
        Map<String, String> response = new HashMap<>();

        try {
            Optional<Appointment> existing = appointmentRepository.findById(appointment.getId());

            if (existing.isEmpty()) {
                response.put("message", "Appointment not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Appointment current = existing.get();

            if (appointment.getDoctor() != null) {
                Optional<Doctor> doctor =
                        doctorRepository.findById(appointment.getDoctor().getId());

                if (doctor.isEmpty()) {
                    response.put("message", "Doctor not found");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }

                current.setDoctor(doctor.get());
            }

            if (appointment.getPatient() != null) {
                Optional<Patient> patient =
                        patientRepository.findById(appointment.getPatient().getId());

                if (patient.isEmpty()) {
                    response.put("message", "Patient not found");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }

                current.setPatient(patient.get());
            }

            if (appointment.getAppointmentTime() != null) {
                current.setAppointmentTime(appointment.getAppointmentTime());
            }

            current.setStatus(appointment.getStatus());

            appointmentRepository.save(current);

            response.put("message", "Appointment updated");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Some internal error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<Map<String, String>> cancelAppointment(long id, String token) {
        Map<String, String> response = new HashMap<>();

        try {
            String email = tokenService.extractIdentifier(token);

            Optional<Appointment> optionalAppointment =
                    appointmentRepository.findById(id);

            if (optionalAppointment.isEmpty()) {
                response.put("message", "Appointment not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Appointment appointment = optionalAppointment.get();

            if (appointment.getPatient() == null ||
                    !appointment.getPatient().getEmail().equalsIgnoreCase(email)) {

                response.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            appointmentRepository.delete(appointment);

            response.put("message", "Appointment cancelled");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Some internal error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public Map<String, Object> getAppointment(
            String pname,
            LocalDate date,
            String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            Long doctorId = tokenService.extractDoctorIdFromToken(token);

            if (doctorId == null) {
                String email = tokenService.extractIdentifier(token);

                Optional<Doctor> doctor =
                        doctorRepository.findByEmail(email);

                if (doctor.isEmpty()) {
                    response.put("appointments", List.of());
                    return response;
                }

                doctorId = doctor.get().getId();
            }

            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay().minusNanos(1);

            List<Appointment> appointments;

            if (pname == null ||
                    pname.equalsIgnoreCase("null") ||
                    pname.trim().isEmpty()) {

                appointments =
                        appointmentRepository
                                .findByDoctorIdAndAppointmentTimeBetween(
                                        doctorId, start, end);
            } else {

                appointments =
                        appointmentRepository
                                .findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(
                                        doctorId, pname, start, end);
            }

            response.put("appointments", appointments);
            return response;

        } catch (Exception e) {
            response.put("appointments", List.of());
            response.put("message", "Unable to retrieve appointments");
            return response;
        }
    }
}