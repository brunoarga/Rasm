package com.sistemasalud.controller;

import com.sistemasalud.entity.Seguimiento;
import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.SeguimientoRepository;
import com.sistemasalud.repository.SolicitudRepository;
import com.sistemasalud.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController @RequestMapping("/seguimientos") @RequiredArgsConstructor
public class SeguimientoController {
    private final SeguimientoRepository repo;
    private final SolicitudRepository solicitudRepo;
    @GetMapping("/solicitud/{id}") public ResponseEntity<List<Seguimiento>> obtener(@PathVariable Long id) { return ResponseEntity.ok(repo.findBySolicitudIdOrderByFechaCreacionDesc(id)); }
    @PostMapping @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')") public ResponseEntity<Seguimiento> crear(@RequestBody Seguimiento seg, @AuthenticationPrincipal UserPrincipal u) {
        Solicitud sol = solicitudRepo.findById(seg.getSolicitud().getId()).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        seg.setSolicitud(sol); seg.setFechaCreacion(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(seg));
    }
}
