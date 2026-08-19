package com.sistemasalud.controller;

import com.sistemasalud.dto.response.AlertaDemoraResponse;
import com.sistemasalud.dto.response.CentroAuditoriaResponse;
import com.sistemasalud.dto.response.SolicitudResponse;
import com.sistemasalud.entity.AlertaDemora;
import com.sistemasalud.service.AlertaDemoraService;
import com.sistemasalud.service.AuditoriaRedService;
import com.sistemasalud.service.SolicitudService;
import com.sistemasalud.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/central") @RequiredArgsConstructor
public class CentralController {

    private final AlertaDemoraService alertaDemoraService;
    private final SolicitudService solicitudService;
    private final AuditoriaRedService auditoriaRedService;

    @GetMapping("/alertas") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<List<AlertaDemoraResponse>> alertas() {
        return ResponseEntity.ok(alertaDemoraService.listarAbiertas());
    }

    @GetMapping("/triaje") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<List<SolicitudResponse>> triaje() {
        return ResponseEntity.ok(solicitudService.listarTriaje());
    }

    @GetMapping("/auditoria") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<List<CentroAuditoriaResponse>> auditoria() {
        return ResponseEntity.ok(auditoriaRedService.auditarRed());
    }

    @PostMapping("/alertas/{id}/resolver") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<Void> resolver(@PathVariable Long id) {
        alertaDemoraService.resolver(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/alertas/{id}/reasignar") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<SolicitudResponse> reasignar(@PathVariable Long id, @RequestBody Map<String, Long> body, @AuthenticationPrincipal UserPrincipal u) {
        AlertaDemora alerta = alertaDemoraService.obtener(id);
        SolicitudResponse response = solicitudService.cambiarCentro(alerta.getSolicitud().getId(), body.get("idCentroSalud"), u.getId());
        alertaDemoraService.marcarReasignada(id);
        return ResponseEntity.ok(response);
    }
}
