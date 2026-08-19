package com.sistemasalud.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j @Component @RequiredArgsConstructor
public class AlertaDemoraJob {

    private final AlertaDemoraService alertaDemoraService;

    @Scheduled(cron = "0 */30 * * * *")
    public void procesarAlertas() {
        try {
            alertaDemoraService.generarAlertas();
        } catch (Exception e) {
            log.error("Error al generar alertas por demora", e);
        }
    }
}
