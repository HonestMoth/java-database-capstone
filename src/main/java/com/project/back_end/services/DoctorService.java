package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.project.back_end.dto.Login;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.repositories.AppointmentRepository;
import com.project.back_end.repositories.DoctorRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    public DoctorService(
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            TokenService tokenService) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    public List<String> getDoctorAvailability(Long doctorId, LocalDate date) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(doctorId);
        if (optionalDoctor.isEmpty()) return List.of();

        Doctor doctor = optionalDoctor.get();
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetween(doctorId, startOfDay, endOfDay);

        return doctor.getAvailableTimes().stream()
                .filter(slot -> !isSlotBooked(slot, appointments))
                .collect(Collectors.toList());
    }

    private boolean isSlotBooked(String slot, List<Appointment> appointments) {
        try {
            String[] parts = slot.trim().split("-");
            if (parts.length != 2) return true;
            LocalDateTime slotStart = LocalDateTime.of(LocalDate.now(), java.time.LocalTime.parse(parts[0].trim()));
            LocalDateTime slotEnd = LocalDateTime.of(LocalDate.now(), java.time.LocalTime.parse(parts[1].trim()));
            return appointments.stream().anyMatch(a -> {
                if (a.getAppointmentTime() == null) return false;
                LocalDateTime bookedStart = a.getAppointmentTime();
                LocalDateTime bookedEnd = bookedStart.plusHours(1);
                // Compare time-of-day because all appointments here belong to the requested date.
                java.time.LocalTime bs = bookedStart.toLocalTime();
                java.time.LocalTime be = bookedEnd.toLocalTime();
                return bs.isBefore(slotEnd.toLocalTime()) && be.isAfter(slotStart.toLocalTime());
            });
        } catch (Exception e) {
            return true;
        }
    }

    public int saveDoctor(Doctor doctor) {

        try {
            if (doctorRepository.existsByEmail(doctor.getEmail())) {
                return -1;
            }

            doctorRepository.save(doctor);
            return 1;

        } catch (Exception e) {
            return 0;
        }
    }

    public int updateDoctor(Doctor doctor) {

        try {
            if (doctor.getId() == null ||
                    !doctorRepository.existsById(doctor.getId())) {
                return -1;
            }

            doctorRepository.save(doctor);
            return 1;

        } catch (Exception e) {
            return 0;
        }
    }

    public List<Doctor> getDoctors() {
        return doctorRepository.findAll();
    }

    public int deleteDoctor(long id) {

        try {
            if (!doctorRepository.existsById(id)) {
                return -1;
            }

            appointmentRepository.deleteAllByDoctorId(id);
            doctorRepository.deleteById(id);

            return 1;

        } catch (Exception e) {
            return 0;
        }
    }

    public ResponseEntity<Map<String, String>> validateDoctor(Login login) {

        Map<String, String> response = new HashMap<>();

        try {
            Optional<Doctor> optionalDoctor =
                    doctorRepository.findByEmail(login.getIdentifier());

            if (optionalDoctor.isEmpty()) {
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Doctor doctor = optionalDoctor.get();

            if (!doctor.getPassword().equals(login.getPassword())) {
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String token = tokenService.generateToken(
                    doctor.getId(),
                    "doctor",
                    doctor.getEmail());

            response.put("token", token);
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public Map<String, Object> findDoctorByName(String name) {

        Map<String, Object> response = new HashMap<>();

        List<Doctor> doctors =
                doctorRepository.findByNameLike(name == null ? "" : name);

        response.put("doctors", doctors);

        return response;
    }

    public Map<String, Object> filterDoctorsByNameSpecilityandTime(
            String name,
            String specialty,
            String amOrPm) {

        Map<String, Object> response = new HashMap<>();

        List<Doctor> doctors;

        if (specialty == null || specialty.equalsIgnoreCase("null") || specialty.isBlank()) {
            doctors = doctorRepository.findAll();
        } else if (name == null || name.equalsIgnoreCase("null") || name.isBlank()) {
            doctors = doctorRepository.findBySpecialtyIgnoreCase(normalizeSpecialty(specialty));
        } else {
            doctors =
                    doctorRepository
                            .findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(
                                    name, normalizeSpecialty(specialty));
        }

        doctors = filterDoctorByTime(doctors, amOrPm);

        response.put("doctors", doctors);

        return response;
    }

    public Map<String, Object> filterDoctorByNameAndTime(
            String name,
            String amOrPm) {

        Map<String, Object> response = new HashMap<>();

        List<Doctor> doctors =
                doctorRepository.findByNameLike(
                        name == null ? "" : name);

        doctors = filterDoctorByTime(doctors, amOrPm);

        response.put("doctors", doctors);

        return response;
    }

    public Map<String, Object> filterDoctorByNameAndSpecility(
            String name,
            String specilty) {

        Map<String, Object> response = new HashMap<>();

        List<Doctor> doctors =
                doctorRepository
                        .findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(
                                name, normalizeSpecialty(specilty));

        response.put("doctors", doctors);

        return response;
    }

    public Map<String, Object> filterDoctorByTimeAndSpecility(
            String specilty,
            String amOrPm) {

        Map<String, Object> response = new HashMap<>();

        List<Doctor> doctors =
                doctorRepository.findBySpecialtyIgnoreCase(normalizeSpecialty(specilty));

        doctors = filterDoctorByTime(doctors, amOrPm);

        response.put("doctors", doctors);

        return response;
    }

    public Map<String, Object> filterDoctorBySpecility(String specilty) {

        Map<String, Object> response = new HashMap<>();

        List<Doctor> doctors =
                doctorRepository.findBySpecialtyIgnoreCase(normalizeSpecialty(specilty));

        response.put("doctors", doctors);

        return response;
    }

    public Map<String, Object> filterDoctorsByTime(String amOrPm) {

        Map<String, Object> response = new HashMap<>();

        List<Doctor> doctors = doctorRepository.findAll();

        doctors = filterDoctorByTime(doctors, amOrPm);

        response.put("doctors", doctors);

        return response;
    }

    private List<Doctor> filterDoctorByTime(
            List<Doctor> doctors,
            String amOrPm) {

        if (amOrPm == null ||
                amOrPm.equalsIgnoreCase("null") ||
                amOrPm.isBlank()) {
            return doctors;
        }

        String requested = amOrPm.trim().toUpperCase();

        return doctors.stream()
                .filter(doctor ->
                        doctor.getAvailableTimes() != null &&
                        doctor.getAvailableTimes()
                                .stream()
                                .anyMatch(time ->
                                        isTimeInPeriod(time, requested)))
                .collect(Collectors.toList());
    }

    private boolean isTimeInPeriod(String time, String period) {
        try {
            String cleanTime = time.trim().toUpperCase();

            // Support the lab's exact slot example, e.g. 09:00-10:00.
            if (period.contains(":" ) || period.contains("-")) {
                return cleanTime.equalsIgnoreCase(period);
            }

            if (cleanTime.contains("AM")) return period.equals("AM");
            if (cleanTime.contains("PM")) return period.equals("PM");

            String start = cleanTime.contains("-") ? cleanTime.split("-")[0].trim() : cleanTime;
            int hour = Integer.parseInt(start.split(":")[0]);
            if (period.equals("AM")) return hour >= 0 && hour < 12;
            if (period.equals("PM")) return hour >= 12 && hour < 24;
        } catch (Exception ignored) { }
        return false;
    }
    private String normalizeSpecialty(String specialty) {
        if (specialty == null) return "";
        String value = specialty.trim();
        return switch (value.toLowerCase()) {
            case "cardiology", "cardiologist" -> "Cardiologist";
            case "dermatology", "dermatologist" -> "Dermatologist";
            case "neurology", "neurologist" -> "Neurologist";
            case "orthopedics", "orthopedic", "orthopedist" -> "Orthopedist";
            case "pediatrics", "pediatric", "pediatrician" -> "Pediatrician";
            default -> value;
        };
    }

}