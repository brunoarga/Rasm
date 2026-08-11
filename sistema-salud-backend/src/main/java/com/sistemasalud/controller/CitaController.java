package com.sistemasalud.controller;

import com.sistemasalud.dto.request.AtenderCitaRequest;
import com.sistemasalud.dto.request.CitaRequest;
import com.sistemasalud.dto.response.CitaResponse;
import com.sistemasalud.entity.Profesional;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.ProfesionalRepository;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.CitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/citas") @RequiredArgsConstructor
public class CitaController {
    private final CitaService citaService;
    private final ProfesionalRepository profesionalRepository;

    @PostMapping @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<CitaResponse> agendar(@Valid @RequestBody CitaRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(citaService.agendarCita(r)); }

    @GetMapping("/profesional") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<List<CitaResponse>> citasProf(@AuthenticationPrincipal UserPrincipal u, @RequestParam(required=false) String desde, @RequestParam(required=false) String hasta) {
        Profesional p = profesionalRepository.findByUsuarioId(u.getId()).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
        LocalDateTime ini = desde != null ? LocalDateTime.parse(desde) : LocalDateTime.now().withDayOfMonth(1);
        LocalDateTime fin = hasta != null ? LocalDateTime.parse(hasta) : ini.plusMonths(1);
        return ResponseEntity.ok(citaService.obtenerCitasPorProfesionalDto(p.getId(), ini, fin));
    }

    @GetMapping("/centro") @PreAuthorize("hasRole('PROFESIONAL')")
    public ResponseEntity<List<CitaResponse>> citasPorCentro(@AuthenticationPrincipal UserPrincipal u, @RequestParam(required=false) String desde, @RequestParam(required=false) String hasta) {
        Profesional p = profesionalRepository.findByUsuarioId(u.getId()).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
        if (p.getCentroSalud() == null) return ResponseEntity.ok(List.of());
        LocalDateTime ini = desde != null ? LocalDateTime.parse(desde) : LocalDateTime.now().withDayOfMonth(1);
        LocalDateTime fin = hasta != null ? LocalDateTime.parse(hasta) : ini.plusMonths(1);
        return ResponseEntity.ok(citaService.obtenerCitasPorCentro(p.getCentroSalud().getId(), ini, fin));
    }

    @GetMapping("/centro/mias") @PreAuthorize("hasRole('PROFESIONAL')")
    public ResponseEntity<List<CitaResponse>> citasPorCentroMias(@AuthenticationPrincipal UserPrincipal u, @RequestParam(required=false) String desde, @RequestParam(required=false) String hasta) {
        Profesional p = profesionalRepository.findByUsuarioId(u.getId()).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
        if (p.getCentroSalud() == null) return ResponseEntity.ok(List.of());
        LocalDateTime ini = desde != null ? LocalDateTime.parse(desde) : LocalDateTime.now().withDayOfMonth(1);
        LocalDateTime fin = hasta != null ? LocalDateTime.parse(hasta) : ini.plusMonths(1);
        return ResponseEntity.ok(citaService.obtenerCitasPorCentroYProfesional(p.getCentroSalud().getId(), p.getId(), ini, fin));
    }

    @GetMapping("/paciente") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<List<CitaResponse>> misCitas(@AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(citaService.obtenerCitasPorPaciente(u.getId())); }

    @PutMapping("/{id}/cancelar") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN','PACIENTE')")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) { citaService.cancelarCita(id); return ResponseEntity.noContent().build(); }

    @PutMapping("/{id}/notas") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<CitaResponse> guardarNotas(@PathVariable Long id, @RequestBody Map<String, String> body) { return ResponseEntity.ok(citaService.guardarNotasCita(id, body.getOrDefault("notas", ""))); }

    @PutMapping("/{id}/atender") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<CitaResponse> atender(@PathVariable Long id, @Valid @RequestBody AtenderCitaRequest r) { return ResponseEntity.ok(citaService.atenderCita(id, r)); }
}
