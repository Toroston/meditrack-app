package com.meditrack.back.app.controller;

import com.meditrack.back.app.model.DashboardKpiDTO;
import com.meditrack.back.app.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kpis")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardKpiDTO> getKpisDashboard(@RequestParam(defaultValue = "false") boolean historico) {
        return ResponseEntity.ok(dashboardService.obtenerMetricasDashboard(historico));
    }
}