package com.sistemasalud.controller;

import com.sistemasalud.dto.request.EnviarMensajeRequest;
import com.sistemasalud.dto.response.ConversacionDetalleResponse;
import com.sistemasalud.dto.response.ConversacionResponse;
import com.sistemasalud.dto.response.MensajeResponse;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.MensajeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/mensajes") @RequiredArgsConstructor
public class MensajeController {

    private final MensajeService mensajeService;

    @GetMapping("/conversaciones") @PreAuthorize("hasAnyRole('PACIENTE','PROFESIONAL')")
    public ResponseEntity<List<ConversacionResponse>> conversaciones(@AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.ok(mensajeService.listarConversaciones(u.getId(), u.getTipoUsuario()));
    }

    @GetMapping("/conversaciones/{id}") @PreAuthorize("hasAnyRole('PACIENTE','PROFESIONAL')")
    public ResponseEntity<ConversacionDetalleResponse> detalle(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.ok(mensajeService.obtenerConversacion(id, u.getId()));
    }

    @PostMapping("/conversaciones/{id}/mensajes") @PreAuthorize("hasAnyRole('PACIENTE','PROFESIONAL')")
    public ResponseEntity<MensajeResponse> enviar(@PathVariable Long id,
            @Valid @RequestBody EnviarMensajeRequest dto, @AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mensajeService.enviarMensaje(id, u.getId(), dto.getContenido()));
    }

    @GetMapping("/no-leidos") @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> contarNoLeidos(@AuthenticationPrincipal UserPrincipal u) {
        return ResponseEntity.ok(Map.of("cantidad", mensajeService.contarNoLeidos(u.getId())));
    }
}
