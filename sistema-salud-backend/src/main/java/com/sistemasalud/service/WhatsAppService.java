package com.sistemasalud.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service @Slf4j
public class WhatsAppService {

    @Value("${whatsapp.enabled:false}") private boolean enabled;
    @Value("${whatsapp.token:}") private String token;
    @Value("${whatsapp.phone-number-id:}") private String phoneNumberId;
    @Value("${whatsapp.api-url:https://graph.facebook.com/v18.0}") private String apiUrl;
    @Value("${whatsapp.language:es_AR}") private String languageCode;

    private final RestClient restClient;

    public WhatsAppService() {
        this.restClient = RestClient.builder().build();
    }

    public void enviarPlantilla(String telefono, String templateName, List<String> cuerpoParams) {
        if (!enabled || token == null || token.isBlank() || phoneNumberId == null || phoneNumberId.isBlank()) {
            log.info("WhatsApp no configurado (enabled={}, token={}, phoneId={}); se omite plantilla {}",
                    enabled, token != null, phoneNumberId != null, templateName);
            return;
        }
        String e164 = normalizarE164(telefono);
        if (e164 == null) {
            log.info("Sin teléfono válido para WhatsApp: {}", telefono);
            return;
        }
        try {
            Map<String, Object> template = new HashMap<>();
            template.put("name", templateName);
            template.put("language", Map.of("code", languageCode));
            if (cuerpoParams != null && !cuerpoParams.isEmpty()) {
                List<Map<String, String>> params = cuerpoParams.stream()
                        .map(p -> Map.of("type", "text", "text", p == null ? "" : p))
                        .toList();
                template.put("components", List.of(Map.of("type", "body", "parameters", params)));
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", e164);
            payload.put("type", "template");
            payload.put("template", template);

            restClient.post()
                    .uri(apiUrl + "/{phoneNumberId}/messages", phoneNumberId)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            log.info("WhatsApp plantilla '{}' enviada a {}", templateName, e164);
        } catch (Exception e) {
            log.error("Error al enviar WhatsApp a {}: {}", telefono, e.getMessage());
        }
    }

    /** Normaliza un teléfono argentino al formato E.164 (+549...) para WhatsApp Cloud API. */
    public String normalizarE164(String telefono) {
        if (telefono == null || telefono.isBlank()) return null;
        String digits = telefono.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            // 11 55550000 -> 5491155550000
            digits = "54" + digits;
        } else if (digits.length() == 11 && digits.startsWith("9")) {
            digits = "54" + digits;
        } else if (digits.length() == 12 && digits.startsWith("54")) {
            // 541155550000 -> 5491155550000
            digits = digits.substring(0, 2) + "9" + digits.substring(2);
        }
        if (digits.length() != 13 || !digits.startsWith("549")) {
            log.warn("Número de teléfono no normalizable a E.164: {}", telefono);
            return null;
        }
        return "+" + digits;
    }
}