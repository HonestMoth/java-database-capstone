package com.project.back_end.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.back_end.models.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByEmailOrPhone(String email, String phone);

    boolean existsByEmail(String email);
}