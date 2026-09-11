package com.project.back_end.controllers;

import com.project.back_end.dto.Login;
import com.project.back_end.models.Doctor;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.path}doctor")
public class DoctorController {
    private final DoctorService doctorService;
    private final Service service;
    public DoctorController(DoctorService doctorService, Service service) { this.doctorService = doctorService; this.service = service; }

    @GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<?> availability(@PathVariable String user, @PathVariable Long doctorId,
                                          @PathVariable LocalDate date, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, user);
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        return ResponseEntity.ok(Map.of("availability", doctorService.getDoctorAvailability(doctorId, date)));
    }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getDoctors() {
        return ResponseEntity.ok(Map.of("doctors", doctorService.getDoctors()));
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String,String>> addDoctor(@RequestBody Doctor doctor, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "admin");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        int result = doctorService.saveDoctor(doctor);
        Map<String,String> body = new HashMap<>();
        if (result == 1) { body.put("message", "Doctor added to db"); return ResponseEntity.status(HttpStatus.CREATED).body(body); }
        if (result == -1) { body.put("message", "Doctor already exists"); return ResponseEntity.status(HttpStatus.CONFLICT).body(body); }
        body.put("message", "Some internal error occurred"); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@RequestBody Login login) { return doctorService.validateDoctor(login); }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String,String>> update(@RequestBody Doctor doctor, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "admin");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        int result = doctorService.updateDoctor(doctor);
        Map<String,String> body = new HashMap<>();
        if (result == 1) { body.put("message", "Doctor updated"); return ResponseEntity.ok(body); }
        if (result == -1) { body.put("message", "Doctor not found"); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body); }
        body.put("message", "Some internal error occurred"); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String,String>> delete(@PathVariable long id, @PathVariable String token) {
        ResponseEntity<Map<String,String>> auth = service.validateToken(token, "admin");
        if (!auth.getStatusCode().is2xxSuccessful()) return auth;
        int result = doctorService.deleteDoctor(id);
        Map<String,String> body = new HashMap<>();
        if (result == 1) { body.put("message", "Doctor deleted successfully"); return ResponseEntity.ok(body); }
        if (result == -1) { body.put("message", "Doctor not found with id"); return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body); }
        body.put("message", "Some internal error occurred"); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @GetMapping("/filter")
    public ResponseEntity<Map<String,Object>> filterByQuery(
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "") String time,
            @RequestParam(defaultValue = "") String specialty) {
        return ResponseEntity.ok(service.filterDoctor(name, specialty, time));
    }

    @GetMapping("/filter/{name}/{time}/{speciality}")
    public ResponseEntity<Map<String,Object>> filter(@PathVariable String name, @PathVariable String time, @PathVariable String speciality) {
        return ResponseEntity.ok(service.filterDoctor(name, speciality, time));
    }
}
