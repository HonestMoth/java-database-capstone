package com.project.back_end.controllers;

import com.project.back_end.models.Prescription;
import com.project.back_end.services.PrescriptionService;
import com.project.back_end.services.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("${api.path}prescription")
public class PrescriptionController {
    private final PrescriptionService prescriptionService;
    private final Service service;
    public PrescriptionController(PrescriptionService prescriptionService, Service service) { this.prescriptionService = prescriptionService; this.service = service; }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String,String>> save(@RequestBody Prescription prescription, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "doctor");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        return prescriptionService.savePrescription(prescription);
    }

    @GetMapping("/{appointmentId}/{token}")
    public ResponseEntity<Map<String,Object>> get(@PathVariable Long appointmentId, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "doctor");
        if (!auth.getStatusCode().is2xxSuccessful()) return ResponseEntity.status(auth.getStatusCode()).body(Map.of("message", "Invalid or expired token"));
        return prescriptionService.getPrescription(appointmentId);
    }
}
