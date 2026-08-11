package com.sistemasalud.controller;

import com.sistemasalud.entity.CategoriaAyuda;
import com.sistemasalud.repository.CategoriaAyudaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController @RequestMapping("/categorias") @RequiredArgsConstructor
public class CategoriaAyudaController {
    private final CategoriaAyudaRepository repo;
    @GetMapping public ResponseEntity<List<CategoriaAyuda>> listar() { return ResponseEntity.ok(repo.findByActivaTrue()); }
}
