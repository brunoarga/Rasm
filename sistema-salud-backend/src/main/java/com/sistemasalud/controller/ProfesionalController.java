package com.sistemasalud.controller;

import com.sistemasalud.dto.response.PerfilProfesionalResponse;
import com.sistemasalud.entity.Profesional;
import com.sistemasalud.repository.ProfesionalRepository;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.FileStorageService;
import com.sistemasalud.service.ProfesionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/profesionales") @RequiredArgsConstructor
public class ProfesionalController {
    private final ProfesionalRepository repo;
    private final ProfesionalService profesionalService;
    private final FileStorageService fileStorageService;

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','PROFESIONAL','SECRETARIO')")
    public ResponseEntity<List<Profesional>> listar() { return ResponseEntity.ok(repo.findAllWithUsuario()); }

    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','PROFESIONAL','SECRETARIO')")
    public ResponseEntity<Profesional> obtener(@PathVariable Long id) { return ResponseEntity.ok(repo.findById(id).orElseThrow()); }

    @GetMapping("/centro/{idCentro}") @PreAuthorize("hasAnyRole('ADMIN','SECRETARIO')")
    public ResponseEntity<List<Profesional>> porCentro(@PathVariable Long idCentro) { return ResponseEntity.ok(profesionalService.listarPorCentro(idCentro)); }

    @GetMapping("/{id}/disponibilidad") @PreAuthorize("hasAnyRole('ADMIN','SECRETARIO','PROFESIONAL')")
    public ResponseEntity<List<Map<String, Object>>> disponibilidad(@PathVariable Long id, @RequestParam Long idCentro, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(profesionalService.obtenerDisponibilidad(id, idCentro, fecha));
    }

    @GetMapping("/perfil") @PreAuthorize("hasRole('PROFESIONAL')")
    public ResponseEntity<PerfilProfesionalResponse> perfil(@AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.ok(profesionalService.obtenerPerfil(u.getId()));
    }

    @PutMapping("/centro") @PreAuthorize("hasRole('PROFESIONAL')")
    public ResponseEntity<Map<String, String>> asignarCentro(@AuthenticationPrincipal UserPrincipal u, @RequestBody Map<String, Long> body) {
        profesionalService.asignarCentro(u.getId(), body.get("idCentro"));
        return ResponseEntity.ok(Map.of("mensaje", "Centro asignado correctamente"));
    }

    @PutMapping("/perfil/foto") @PreAuthorize("hasRole('PROFESIONAL')")
    public ResponseEntity<Map<String, String>> subirFoto(@AuthenticationPrincipal UserPrincipal u, @RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.guardarArchivo(file, "perfil");
        profesionalService.actualizarFoto(u.getId(), fileName);
        return ResponseEntity.ok(Map.of("fotoPerfil", fileName, "url", "/api/uploads/perfil/" + fileName));
    }
}
