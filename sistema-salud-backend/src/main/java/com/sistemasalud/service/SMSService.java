package com.sistemasalud.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j @Service
public class SMSService {

    @Value("${sms.enabled:false}") private boolean enabled;
    @Value("${sms.provider:}") private String provider;

    public void enviarSms(String telefono, String mensaje) {
        if (telefono == null || telefono.isBlank()) {
            log.info("SMS omitido: sin teléfono válido");
            return;
        }
        if (!enabled) {
            log.info("SMS no configurado (enabled={}, provider={}); se omite envío a {}",
                    enabled, provider.isBlank() ? "-" : provider, telefono);
            return;
        }
        log.info("SMS enviado a {} (provider={}): {}", telefono, provider, mensaje);
    }
}