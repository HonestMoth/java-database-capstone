package com.project.back_end.controllers;

import com.project.back_end.models.Appointment;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.path}appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;
    private final Service service;
    public AppointmentController(AppointmentService appointmentService, Service service) { this.appointmentService = appointmentService; this.service = service; }

    @GetMapping("/{token}/{date}")
    public ResponseEntity<?> getAppointments(@PathVariable String token, @PathVariable LocalDate date,
                                             @RequestParam(required=false) String patientName) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "doctor");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        return ResponseEntity.ok(appointmentService.getAppointment(patientName, date, token).get("appointments"));
    }

    // Lab-style route alias: /appointments/{date}/{patientName}/{token}
    @GetMapping("/{date}/{patientName}/{token}")
    public ResponseEntity<?> getAppointmentsLab(@PathVariable LocalDate date, @PathVariable String patientName, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "doctor");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        return ResponseEntity.ok(appointmentService.getAppointment(patientName, date, token).get("appointments"));
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String,String>> book(@RequestBody Appointment appointment, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "patient");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        int valid = service.validateAppointment(appointment);
        Map<String,String> body = new HashMap<>();
        if (valid == -1) { body.put("message", "Doctor not found"); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body); }
        if (valid == 0) { body.put("message", "Appointment time unavailable"); return ResponseEntity.status(HttpStatus.CONFLICT).body(body); }
        if (appointmentService.bookAppointment(appointment) == 1) { body.put("message", "Appointment booked successfully"); return ResponseEntity.status(HttpStatus.CREATED).body(body); }
        body.put("message", "Unable to book appointment"); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String,String>> update(@RequestBody Appointment appointment, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "patient");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        return appointmentService.updateAppointment(appointment);
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String,String>> cancel(@PathVariable long id, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "patient");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        return appointmentService.cancelAppointment(id, token);
    }
}
