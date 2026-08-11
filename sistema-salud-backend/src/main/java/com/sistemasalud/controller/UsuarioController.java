package com.sistemasalud.controller;

import com.sistemasalud.entity.Usuario;
import com.sistemasalud.repository.UsuarioRepository;
import com.sistemasalud.security.UserPrincipal;
import com.sistemasalud.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController @RequestMapping("/usuarios") @RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final FileStorageService fileStorageService;

    @GetMapping("/perfil")
    public ResponseEntity<Usuario> obtenerPerfil(@AuthenticationPrincipal UserPrincipal u) {
        return usuarioRepository.findById(u.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/perfil")
    public ResponseEntity<Usuario> actualizarPerfil(@AuthenticationPrincipal UserPrincipal u,
                                                     @RequestBody Map<String, String> body) {
        return usuarioRepository.findById(u.getId()).map(usuario -> {
            if (body.containsKey("nombreCompleto")) usuario.setNombreCompleto(body.get("nombreCompleto"));
            if (body.containsKey("telefono")) usuario.setTelefono(body.get("telefono"));
            if (body.containsKey("direccion")) usuario.setDireccion(body.get("direccion"));
            return ResponseEntity.ok(usuarioRepository.save(usuario));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/perfil/foto")
    public ResponseEntity<Map<String, String>> subirFoto(@AuthenticationPrincipal UserPrincipal u,
                                                          @RequestParam("file") MultipartFile file) {
        return usuarioRepository.findById(u.getId()).map(usuario -> {
            String fileName = fileStorageService.guardarArchivo(file, "perfil");
            usuario.setFotoPerfil(fileName);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(Map.of("fotoPerfil", fileName,
                    "url", "/api/uploads/perfil/" + fileName));
        }).orElse(ResponseEntity.notFound().build());
    }
}
