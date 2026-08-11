package com.sistemasalud.controller;

import com.sistemasalud.dto.response.NotificacionResponse;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/notificaciones") @RequiredArgsConstructor
public class NotificacionController {
    private final NotificacionService service;
    @GetMapping public ResponseEntity<List<NotificacionResponse>> obtener(@AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(service.obtenerNotificaciones(u.getId())); }
    @GetMapping("/no-leidas") public ResponseEntity<List<NotificacionResponse>> noLeidas(@AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(service.obtenerNoLeidas(u.getId())); }
    @GetMapping("/contar-no-leidas") public ResponseEntity<Map<String, Long>> contar(@AuthenticationPrincipal UserPrincipal u) { return ResponseEntity.ok(Map.of("cantidad", service.contarNoLeidas(u.getId()))); }
    @PutMapping("/{id}/leer") public ResponseEntity<Void> leer(@PathVariable Long id) { service.marcarComoLeida(id); return ResponseEntity.noContent().build(); }
}
