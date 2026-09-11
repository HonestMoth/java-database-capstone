package com.project.back_end.controllers;

import com.project.back_end.dto.Login;
import com.project.back_end.models.Patient;
import com.project.back_end.services.PatientService;
import com.project.back_end.services.Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.path}patient")
public class PatientController {
    private final PatientService patientService;
    private final Service service;
    public PatientController(PatientService patientService, Service service) { this.patientService = patientService; this.service = service; }

    @GetMapping("/{token}")
    public ResponseEntity<Map<String,Object>> getDetails(@PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "patient");
        if (!auth.getStatusCode().is2xxSuccessful()) return ResponseEntity.status(auth.getStatusCode()).body(Map.of("message", "Invalid or expired token"));
        return patientService.getPatientDetails(token);
    }

    @PostMapping
    public ResponseEntity<Map<String,String>> create(@RequestBody Patient patient) {
        Map<String,String> body = new HashMap<>();
        if (!service.validatePatient(patient)) { body.put("message", "Patient with email id or phone no already exist"); return ResponseEntity.status(HttpStatus.CONFLICT).body(body); }
        if (patientService.createPatient(patient) == 1) { body.put("message", "Signup successful"); return ResponseEntity.status(HttpStatus.CREATED).body(body); }
        body.put("message", "Internal server error"); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@RequestBody Login login) { return service.validatePatientLogin(login); }

    @GetMapping("/{id}/{token}")
    public ResponseEntity<Map<String,Object>> appointments(@PathVariable Long id, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "patient");
        if (!auth.getStatusCode().is2xxSuccessful()) return ResponseEntity.status(auth.getStatusCode()).body(Map.of("message", "Invalid or expired token"));
        return patientService.getPatientAppointment(id, token);
    }

    @GetMapping("/filter/{condition}/{name}/{token}")
    public ResponseEntity<Map<String,Object>> filter(@PathVariable String condition, @PathVariable String name, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "patient");
        if (!auth.getStatusCode().is2xxSuccessful()) return ResponseEntity.status(auth.getStatusCode()).body(Map.of("message", "Invalid or expired token"));
        return service.filterPatient(condition, name, token);
    }
}
