package com.sistemasalud.controller;

import com.sistemasalud.dto.request.HistoriaClinicaRequest;
import com.sistemasalud.entity.HistoriaClinica;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.HistoriaClinicaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/historia-clinica") @RequiredArgsConstructor
public class HistoriaClinicaController {
    private final HistoriaClinicaService service;

    @PostMapping @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<?> crear(@Valid @RequestBody HistoriaClinicaRequest r, @AuthenticationPrincipal UserPrincipal u) {
        try {
            HistoriaClinica saved = service.crearRegistro(r, u.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            Map<String, String> body = new LinkedHashMap<>();
            body.put("mensaje", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        } catch (Exception e) {
            Map<String, String> body = new LinkedHashMap<>();
            body.put("mensaje", "Error al guardar el registro: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    @GetMapping("/paciente/{id}") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<List<HistoriaClinica>> historialPaciente(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerHistorialPaciente(id));
    }

    @GetMapping("/solicitud/{id}") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<List<HistoriaClinica>> historialSolicitud(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerHistorialSolicitud(id));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('PROFESIONAL','ADMIN')")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable Long id) {
        try {
            service.eliminarRegistro(id);
            Map<String, String> body = new LinkedHashMap<>();
            body.put("mensaje", "Registro eliminado correctamente");
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            Map<String, String> body = new LinkedHashMap<>();
            body.put("mensaje", "Error al eliminar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        errors.put("mensaje", "Error de validación");
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.put(fe.getField(), fe.getDefaultMessage());
        }
        return errors;
    }
}
