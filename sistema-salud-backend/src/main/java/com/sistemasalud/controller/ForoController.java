package com.sistemasalud.controller;

import com.sistemasalud.dto.request.CrearComentarioRequestDTO;
import com.sistemasalud.dto.request.CrearPostRequestDTO;
import com.sistemasalud.dto.response.ComentarioResponseDTO;
import com.sistemasalud.dto.response.PaginatedResponse;
import com.sistemasalud.dto.response.PostResponseDTO;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.ForoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/foro/posts") @RequiredArgsConstructor
public class ForoController {

    private final ForoService foroService;

    @GetMapping @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaginatedResponse<PostResponseDTO>> listar(
            @RequestParam(required = false) String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(foroService.listar(categoria, page, size));
    }

    @GetMapping("/{id}") @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostResponseDTO> detalle(@PathVariable Long id) {
        return ResponseEntity.ok(foroService.detalle(id));
    }

    @PostMapping @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<PostResponseDTO> crear(@Valid @RequestBody CrearPostRequestDTO dto,
            @AuthenticationPrincipal UserPrincipal usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foroService.crear(usuario.getId(), dto));
    }

    @PostMapping("/{id}/apoyo") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<PostResponseDTO> apoyar(@PathVariable Long id) {
        return ResponseEntity.ok(foroService.apoyar(id));
    }

    @PostMapping("/{id}/comentarios") @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<ComentarioResponseDTO> comentar(@PathVariable Long id,
            @Valid @RequestBody CrearComentarioRequestDTO dto, @AuthenticationPrincipal UserPrincipal usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foroService.comentar(id, usuario.getId(), dto));
    }
}
