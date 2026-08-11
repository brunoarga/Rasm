package com.sistemasalud.controller;

import com.sistemasalud.dto.request.RegistroSintomatologiaRequest;
import com.sistemasalud.dto.response.SintomatologiaResponse;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.SintomatologiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/sintomatologia") @RequiredArgsConstructor
public class SintomatologiaController {
    private final SintomatologiaService service;

    @PostMapping @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<SintomatologiaResponse> guardar(@Valid @RequestBody RegistroSintomatologiaRequest r, @AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(u.getId(), r));
    }

    @GetMapping("/historial") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<List<SintomatologiaResponse>> historial(@AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.ok(service.historial(u.getId()));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal u) {
        service.eliminar(id, u.getId());
        return ResponseEntity.noContent().build();
    }
}
