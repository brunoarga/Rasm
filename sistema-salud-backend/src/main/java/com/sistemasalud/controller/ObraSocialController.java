package com.sistemasalud.controller;

import com.sistemasalud.entity.ObraSocial;
import com.sistemasalud.repository.ObraSocialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController @RequestMapping("/obras-sociales") @RequiredArgsConstructor
public class ObraSocialController {
    private final ObraSocialRepository repo;
    @GetMapping public ResponseEntity<List<ObraSocial>> listar() { return ResponseEntity.ok(repo.findByActivaTrue()); }
}
