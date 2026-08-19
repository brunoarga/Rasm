package com.sistemasalud.controller;

import com.sistemasalud.dto.request.AsignarTurnoRequest;
import com.sistemasalud.dto.request.DerivacionRequest;
import com.sistemasalud.dto.request.SolicitudPresencialRequest;
import com.sistemasalud.dto.request.SolicitudRequest;
import com.sistemasalud.dto.response.PerfilPacienteSolicitudResponse;
import com.sistemasalud.dto.response.PerfilSecretarioResponse;
import com.sistemasalud.dto.response.SolicitudResponse;
import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.FileStorageService;
import com.sistemasalud.service.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/solicitudes") @RequiredArgsConstructor
public class SolicitudController {
    private final SolicitudService solicitudService;
    private final FileStorageService fileStorageService;

    @PostMapping @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<SolicitudResponse> crear(@Valid @RequestBody SolicitudRequest r, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.status(HttpStatus.CREATED).body(solicitudService.crearSolicitud(u.getId(), r)); }

    @PostMapping("/presencial") @PreAuthorize("hasAnyRole('PROFESIONAL','SECRETARIO','ADMIN')")
    public ResponseEntity<SolicitudResponse> crearPresencial(@Valid @RequestBody SolicitudPresencialRequest r, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.status(HttpStatus.CREATED).body(solicitudService.crearSolicitudPresencial(r, u.getTipoUsuario())); }

    @GetMapping("/perfil-secretario") @PreAuthorize("hasRole('SECRETARIO')")
    public ResponseEntity<PerfilSecretarioResponse> perfilSecretario(@AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.perfilSecretario(u.getId())); }

    @GetMapping
    public ResponseEntity<List<SolicitudResponse>> listar(@AuthenticationPrincipal UserPrincipal u, @RequestParam(required=false) String estado, @RequestParam(required=false) String prioridad) { return ResponseEntity.ok(solicitudService.listarSolicitudes(u.getId(), u.getTipoUsuario(), estado, prioridad)); }

    @GetMapping("/{id}") public ResponseEntity<SolicitudResponse> obtener(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.obtenerSolicitud(id, u.getId(), u.getTipoUsuario())); }

    @PutMapping("/{id}/estado") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN','SECRETARIO')")
    public ResponseEntity<SolicitudResponse> cambiarEstado(@PathVariable Long id, @RequestParam String estado, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.cambiarEstado(id, estado, u.getId())); }

    @PutMapping("/{id}/cancelar") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<SolicitudResponse> cancelar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.cancelarSolicitud(id, u.getId())); }

    @PutMapping("/{id}") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<SolicitudResponse> actualizar(@PathVariable Long id, @Valid @RequestBody SolicitudRequest r, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.actualizarSolicitud(id, u.getId(), r)); }

    @PutMapping("/{id}/asignar/{idProfesional}") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN','SECRETARIO')")
    public ResponseEntity<SolicitudResponse> asignar(@PathVariable Long id, @PathVariable Long idProfesional) { return ResponseEntity.ok(solicitudService.asignarProfesional(id, idProfesional)); }

    @PutMapping("/{id}/derivar") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN','SECRETARIO')")
    public ResponseEntity<SolicitudResponse> derivar(@PathVariable Long id, @Valid @RequestBody DerivacionRequest r) { return ResponseEntity.ok(solicitudService.derivarSolicitud(id, r)); }

    @PutMapping("/{id}/derivar-centro/{idCentro}") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<SolicitudResponse> derivarCentro(@PathVariable Long id, @PathVariable Long idCentro, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.derivarACentro(id, idCentro, u.getId())); }

    @PutMapping("/{id}/centro") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<SolicitudResponse> cambiarCentro(@PathVariable Long id, @RequestBody java.util.Map<String, Long> body) { return ResponseEntity.ok(solicitudService.cambiarCentro(id, body.get("idCentroSalud"))); }

    @GetMapping("/{id}/centros-disponibles") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<List<CentroSalud>> centrosDisponibles(@PathVariable Long id) { return ResponseEntity.ok(solicitudService.centrosDisponibles(id)); }

    @PostMapping("/{id}/emergencia") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<SolicitudResponse> marcarEmergencia(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.marcarEmergencia(id, u.getId())); }

    @PostMapping("/{id}/asignar-turno") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<SolicitudResponse> asignarTurno(@PathVariable Long id, @Valid @RequestBody AsignarTurnoRequest r, @AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.asignarTurno(id, r, u.getId(), u.getTipoUsuario())); }

    @GetMapping("/pendientes") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN','SECRETARIO')")
    public ResponseEntity<List<SolicitudResponse>> pendientes() { return ResponseEntity.ok(solicitudService.listarSolicitudesPendientes()); }

    @GetMapping("/profesional/todas") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<List<SolicitudResponse>> todasParaProfesional(@AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(solicitudService.listarTodasParaProfesional(u.getId())); }

    @GetMapping("/page") @PreAuthorize("hasAnyRole('PACIENTE','PROFESIONAL','ADMIN','SECRETARIO')")
    public ResponseEntity<Page<SolicitudResponse>> listarPaginadas(@AuthenticationPrincipal UserPrincipal u, @RequestParam(required=false) String estado, @RequestParam(required=false) String prioridad, @PageableDefault(size=10) Pageable pageable) { return ResponseEntity.ok(solicitudService.listarSolicitudesPaginadas(u.getId(), u.getTipoUsuario(), estado, prioridad, pageable)); }

    @GetMapping("/{id}/detalle-completo") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN','SECRETARIO')")
    public ResponseEntity<PerfilPacienteSolicitudResponse> detalleCompleto(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.ok(solicitudService.obtenerDetalleCompleto(id, u.getId(), u.getTipoUsuario()));
    }

    @PostMapping("/{id}/adjunto") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<Map<String, String>> subirAdjunto(@PathVariable Long id,
                                                             @RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.guardarArchivo(file, "adjuntos");
        solicitudService.guardarAdjunto(id, fileName);
        return ResponseEntity.ok(Map.of("archivoAdjunto", fileName,
                "url", "/api/uploads/adjuntos/" + fileName));
    }
}
