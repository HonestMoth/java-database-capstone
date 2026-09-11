package com.project.back_end.services;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.project.back_end.repositories.AdminRepository;
import com.project.back_end.repositories.DoctorRepository;
import com.project.back_end.repositories.PatientRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class TokenService {

    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Value("${jwt.secret}")
    private String secret;

    public TokenService(AdminRepository adminRepository,
                        DoctorRepository doctorRepository,
                        PatientRepository patientRepository) {
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public String generateToken(String identifier) {
        return Jwts.builder()
                .subject(identifier)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000))
                .signWith(getSigningKey())
                .compact();
    }

    // Kept for compatibility with the existing frontend/backend while the lab uses the simpler method above.
    public String generateToken(Object id, String role, String identifier) {
        return Jwts.builder()
                .subject(identifier)
                .claim("id", id)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractIdentifier(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractEmail(String token) {
        return extractIdentifier(token);
    }

    public String extractEmailFromToken(String token) {
        return extractIdentifier(token);
    }

    public Long extractDoctorIdFromToken(String token) {
        Claims claims = extractClaims(token);
        Object id = claims.get("id");
        if (id instanceof Number number) return number.longValue();
        if (id instanceof String value) return Long.parseLong(value);
        String identifier = extractIdentifier(token);
        return doctorRepository.findByEmail(identifier).map(d -> d.getId()).orElse(null);
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token, String user) {
        try {
            Claims claims = extractClaims(token);
            String identifier = claims.getSubject();
            if (identifier == null || identifier.isBlank()) return false;

            if ("admin".equalsIgnoreCase(user)) {
                return adminRepository.findByUsername(identifier).isPresent();
            }
            if ("doctor".equalsIgnoreCase(user)) {
                return doctorRepository.findByEmail(identifier).isPresent();
            }
            if ("patient".equalsIgnoreCase(user) || "loggedPatient".equalsIgnoreCase(user)) {
                return patientRepository.findByEmail(identifier).isPresent();
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private Claims extractClaims(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token cannot be empty");
        }
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
