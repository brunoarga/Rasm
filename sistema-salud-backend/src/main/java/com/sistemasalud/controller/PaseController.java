package com.sistemasalud.controller;

import com.sistemasalud.dto.response.PaseGuardiaResponse;
import com.sistemasalud.service.PaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/turnos/pase") @RequiredArgsConstructor
public class PaseController {

    private final PaseService paseService;

    @GetMapping("/{codigo}")
    public ResponseEntity<PaseGuardiaResponse> obtenerPase(@PathVariable String codigo) {
        return ResponseEntity.ok(paseService.obtenerPase(codigo));
    }

    @PostMapping("/{codigo}/presentado")
    @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<PaseGuardiaResponse> marcarPresentado(@PathVariable String codigo) {
        return ResponseEntity.ok(paseService.marcarPresentado(codigo));
    }
}