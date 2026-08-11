package com.sistemasalud.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir.resolve("perfil"));
            Files.createDirectories(uploadDir.resolve("adjuntos"));
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear directorio de uploads", e);
        }
    }

    public String guardarArchivo(MultipartFile file, String subDir) {
        String extension = "";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        Path targetPath = uploadDir.resolve(subDir).resolve(fileName);
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar archivo", e);
        }
    }

    public Path obtenerRuta(String subDir, String fileName) {
        return uploadDir.resolve(subDir).resolve(fileName);
    }
}
