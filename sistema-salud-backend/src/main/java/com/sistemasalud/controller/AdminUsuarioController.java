package com.sistemasalud.controller;

import com.sistemasalud.dto.request.AsignarCentroRequest;
import com.sistemasalud.dto.request.CambiarPasswordRequest;
import com.sistemasalud.dto.request.EstadoUsuarioRequest;
import com.sistemasalud.dto.response.UsuarioAdminResponse;
import com.sistemasalud.service.AdminUsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/admin/usuarios") @RequiredArgsConstructor
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    @GetMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioAdminResponse>> listarUsuarios() {
        return ResponseEntity.ok(adminUsuarioService.listarUsuarios());
    }

    @PutMapping("/{id}/password") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restablecerPassword(@PathVariable Long id,
                                                    @Valid @RequestBody CambiarPasswordRequest request) {
        adminUsuarioService.restablecerPassword(id, request.getNuevaPassword());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/estado") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cambiarEstado(@PathVariable Long id,
                                              @Valid @RequestBody EstadoUsuarioRequest request) {
        adminUsuarioService.cambiarEstado(id, Boolean.TRUE.equals(request.getActivo()));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/centro") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> asignarCentro(@PathVariable Long id,
                                              @Valid @RequestBody AsignarCentroRequest request) {
        adminUsuarioService.asignarCentroSecretario(id, request.getIdCentroSalud());
        return ResponseEntity.noContent().build();
    }
}