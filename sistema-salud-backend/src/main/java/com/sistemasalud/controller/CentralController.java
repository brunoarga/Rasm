package com.sistemasalud.controller;

import com.sistemasalud.dto.response.AlertaDemoraResponse;
import com.sistemasalud.dto.response.SolicitudResponse;
import com.sistemasalud.entity.AlertaDemora;
import com.sistemasalud.service.AlertaDemoraService;
import com.sistemasalud.service.SolicitudService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/central") @RequiredArgsConstructor
public class CentralController {

    private final AlertaDemoraService alertaDemoraService;
    private final SolicitudService solicitudService;

    @GetMapping("/alertas") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<List<AlertaDemoraResponse>> alertas() {
        return ResponseEntity.ok(alertaDemoraService.listarAbiertas());
    }

    @GetMapping("/triaje") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<List<SolicitudResponse>> triaje() {
        return ResponseEntity.ok(solicitudService.listarTriaje());
    }

    @PostMapping("/alertas/{id}/resolver") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<Void> resolver(@PathVariable Long id) {
        alertaDemoraService.resolver(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/alertas/{id}/reasignar") @PreAuthorize("hasAnyRole('SECRETARIO','ADMIN')")
    public ResponseEntity<SolicitudResponse> reasignar(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        AlertaDemora alerta = alertaDemoraService.obtener(id);
        SolicitudResponse response = solicitudService.cambiarCentro(alerta.getSolicitud().getId(), body.get("idCentroSalud"));
        alertaDemoraService.marcarReasignada(id);
        return ResponseEntity.ok(response);
    }
}
