package com.project.back_end.mvc;

import com.project.back_end.services.TokenService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class DashboardController {
    private final TokenService tokenService;

    public DashboardController(TokenService tokenService) { this.tokenService = tokenService; }

    @GetMapping("/adminDashboard/{token}")
    public ModelAndView adminDashboard(@PathVariable String token) {
        return tokenService.validateToken(token, "admin")
                ? new ModelAndView("admin/adminDashboard")
                : new ModelAndView("redirect:/");
    }

    @GetMapping("/doctorDashboard/{token}")
    public ModelAndView doctorDashboard(@PathVariable String token) {
        return tokenService.validateToken(token, "doctor")
                ? new ModelAndView("doctor/doctorDashboard")
                : new ModelAndView("redirect:/");
    }
}
