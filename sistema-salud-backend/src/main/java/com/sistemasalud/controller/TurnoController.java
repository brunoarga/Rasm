package com.sistemasalud.controller;

import com.sistemasalud.dto.request.CrearTurnoRequestDTO;
import com.sistemasalud.dto.response.TurnoResponseDTO;
import com.sistemasalud.service.TurnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/turnos") @RequiredArgsConstructor
public class TurnoController {
    private final TurnoService turnoService;

    @PostMapping("/{id}/proximo-turno") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<TurnoResponseDTO> agendarProximoTurno(@PathVariable Long id, @Valid @RequestBody CrearTurnoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turnoService.agendarProximoTurno(id, dto));
    }
}
