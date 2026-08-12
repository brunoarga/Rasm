package com.sistemasalud.controller;

import com.sistemasalud.dto.request.CrearPacienteRequest;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.repository.PacienteRepository;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/pacientes") @RequiredArgsConstructor
public class PacienteController {
    private final PacienteRepository repo;
    private final PacienteService pacienteService;

    @GetMapping @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')") public ResponseEntity<List<Paciente>> listar() { return ResponseEntity.ok(repo.findAllWithUsuario()); }
    @GetMapping("/buscar") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN','SECRETARIO')") public ResponseEntity<List<java.util.Map<String, Object>>> buscar(@RequestParam String q) { return ResponseEntity.ok(pacienteService.buscarPacientes(q)); }
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')") public ResponseEntity<Paciente> obtener(@PathVariable Long id) { return ResponseEntity.ok(repo.findById(id).orElseThrow()); }
    @PostMapping @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')") public ResponseEntity<Paciente> crear(@Valid @RequestBody CrearPacienteRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(pacienteService.crearPaciente(r)); }
    @PostMapping("/registro-profesional") @PreAuthorize("hasRole('PROFESIONAL')") public ResponseEntity<Paciente> crearPorProfesional(@Valid @RequestBody CrearPacienteRequest r, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.status(HttpStatus.CREATED).body(pacienteService.crearPacientePorProfesional(r, u.getId())); }
    @PutMapping("/consentimiento") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<Map<String, Object>> aceptarConsentimiento(@AuthenticationPrincipal UserPrincipal u) {
        pacienteService.aceptarConsentimiento(u.getId());
        Map<String, Object> body = new HashMap<>();
        body.put("consentimientoOk", true);
        return ResponseEntity.ok(body);
    }
}
