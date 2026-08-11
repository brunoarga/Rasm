package com.sistemasalud.controller;

import com.sistemasalud.dto.request.DiarioRequest;
import com.sistemasalud.dto.response.DiarioResponse;
import com.sistemasalud.dto.response.PatronEmocionalResponse;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.DiarioService;
import com.sistemasalud.service.PatronEmocionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/diario") @RequiredArgsConstructor
public class DiarioController {

    private final DiarioService diarioService;
    private final PatronEmocionalService patronEmocionalService;

    @PostMapping @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<DiarioResponse> crear(@RequestBody DiarioRequest r, @AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.status(HttpStatus.CREATED).body(diarioService.crear(u.getId(), r));
    }

    @GetMapping @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<List<DiarioResponse>> obtener(@AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.ok(diarioService.obtener(u.getId()));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal u) {
        diarioService.eliminar(u.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patrones") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<PatronEmocionalResponse> patrones(@AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.ok(patronEmocionalService.analizar(u.getId()));
    }
}
