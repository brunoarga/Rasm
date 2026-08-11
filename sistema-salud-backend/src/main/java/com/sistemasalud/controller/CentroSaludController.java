package com.sistemasalud.controller;

import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.service.CentroSaludService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/centros") @RequiredArgsConstructor
public class CentroSaludController {
    private final CentroSaludService centroSaludService;
    @GetMapping public ResponseEntity<List<CentroSalud>> listar() { return ResponseEntity.ok(centroSaludService.listarCentros()); }
    @GetMapping("/cercanos")
    public ResponseEntity<List<CentroSalud>> cercanos(@RequestParam Double lat, @RequestParam Double lon, @RequestParam(defaultValue="50") Double radio, @RequestParam(required=false) Long idObraSocial, @RequestParam(required=false) String tipoPractica) { return ResponseEntity.ok(centroSaludService.buscarCercanos(lat, lon, radio, idObraSocial, tipoPractica)); }
}
