package com.sistemasalud.controller;

import com.sistemasalud.service.EstadisticaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController @RequestMapping("/estadisticas") @RequiredArgsConstructor
public class EstadisticaController {
    private final EstadisticaService service;
    @GetMapping("/generales") @PreAuthorize("hasAnyRole('ADMIN','PROFESIONAL')")
    public ResponseEntity<Map<String, Object>> generales() { return ResponseEntity.ok(service.obtenerEstadisticasGenerales()); }
}
