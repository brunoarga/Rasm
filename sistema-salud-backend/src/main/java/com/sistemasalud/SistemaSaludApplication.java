package com.sistemasalud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SistemaSaludApplication {
    public static void main(String[] args) {
        SpringApplication.run(SistemaSaludApplication.class, args);
    }
}
