package com.project.back_end.mvc;

import com.project.back_end.services.TokenService;
import org.springframework.stereotype.Service;

@Service
public class TokenValidationService {

    private final TokenService tokenService;

    public TokenValidationService(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    public boolean validateToken(String token, String role) {
        if (token == null || token.isBlank() || role == null || role.isBlank()) {
            return false;
        }

        try {
            return tokenService.validateToken(token, role);
        } catch (Exception e) {
            return false;
        }
    }
}
