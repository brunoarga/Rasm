package com.sistemasalud.controller;

import com.sistemasalud.dto.request.LoginRequest;
import com.sistemasalud.dto.request.RegistroRequest;
import com.sistemasalud.dto.response.AuthResponse;
import com.sistemasalud.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/login") public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest r) { return ResponseEntity.ok(authService.login(r)); }
    @PostMapping("/registro") public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegistroRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(r)); }
}
