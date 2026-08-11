package com.sistemasalud.controller;

import com.sistemasalud.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController @RequestMapping("/uploads") @RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/perfil/{fileName}")
    public ResponseEntity<Resource> obtenerFotoPerfil(@PathVariable String fileName) {
        return servirArchivo("perfil", fileName);
    }

    @GetMapping("/adjuntos/{fileName}")
    public ResponseEntity<Resource> obtenerAdjunto(@PathVariable String fileName) {
        return servirArchivo("adjuntos", fileName);
    }

    private ResponseEntity<Resource> servirArchivo(String subDir, String fileName) {
        try {
            Path ruta = fileStorageService.obtenerRuta(subDir, fileName);
            Resource resource = new UrlResource(ruta.toUri());
            if (!resource.exists()) return ResponseEntity.notFound().build();
            String contentType = determinarContentType(fileName);
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String determinarContentType(String fileName) {
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
        if (fileName.endsWith(".png")) return "image/png";
        if (fileName.endsWith(".gif")) return "image/gif";
        if (fileName.endsWith(".webp")) return "image/webp";
        if (fileName.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }
}
