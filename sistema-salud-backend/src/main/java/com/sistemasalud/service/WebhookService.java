package com.sistemasalud.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.entity.Cita;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.Solicitud;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j @Service
public class WebhookService {

    private final RestClient restClient;

    @Value("${webhook.enabled:false}") private boolean enabled;
    @Value("${webhook.timeout-ms:3000}") private long timeoutMs;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WebhookService() {
        this.restClient = RestClient.builder().build();
    }

    public void notificarTurno(Cita cita) {
        if (!enabled) {
            log.debug("Webhook inactivo; se omite notificación de turno");
            return;
        }
        if (cita == null) return;
        CentroSalud centro = cita.getCentroSalud() != null ? cita.getCentroSalud()
                : (cita.getSolicitud() != null ? cita.getSolicitud().getCentroSalud() : null);
        if (centro == null || centro.getWebhookUrl() == null || centro.getWebhookUrl().isBlank()) {
            log.debug("Centro sin webhook_url configurado; se omite");
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(construirPayload(cita, centro));
            restClient.post()
                    .uri(centro.getWebhookUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Webhook enviado a {} para el turno {}", centro.getWebhookUrl(), cita.getId());
        } catch (Exception e) {
            log.error("Error al enviar webhook a {}: {}", centro.getWebhookUrl(), e.getMessage());
        }
    }

    private Map<String, Object> construirPayload(Cita cita, CentroSalud centro) {
        Solicitud s = cita.getSolicitud();
        Paciente p = s != null ? s.getPaciente() : null;
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("evento", "turno_asignado");
        payload.put("codigoPase", cita.getCodigoPase());
        payload.put("fechaNotificacion", java.time.LocalDateTime.now().toString());
        payload.put("idSolicitud", s != null ? s.getId() : null);
        payload.put("folio", s != null ? s.getFolio() : null);
        payload.put("titulo", s != null ? s.getTitulo() : null);
        payload.put("descripcion", s != null ? s.getDescripcion() : null);
        payload.put("anamnesis", s != null ? s.getAnamnesis() : null);
        payload.put("prioridad", s != null && s.getPrioridad() != null ? s.getPrioridad().name() : null);
        payload.put("emergencia", s != null && Boolean.TRUE.equals(s.getEmergencia()));

        Map<String, Object> paciente = new LinkedHashMap<>();
        paciente.put("nombre", p != null && p.getUsuario() != null ? p.getUsuario().getNombreCompleto() : null);
        paciente.put("documento", p != null ? p.getNumDocumento() : null);
        paciente.put("telefono", p != null && p.getUsuario() != null ? p.getUsuario().getTelefono() : null);
        payload.put("paciente", paciente);

        Map<String, Object> turno = new LinkedHashMap<>();
        turno.put("fechaHora", cita.getFechaHora() != null ? cita.getFechaHora().toString() : null);
        turno.put("duracionMinutos", cita.getDuracion());
        turno.put("modalidad", cita.getModalidad() != null ? cita.getModalidad().name() : null);
        turno.put("profesional", cita.getProfesional() != null && cita.getProfesional().getUsuario() != null
                ? cita.getProfesional().getUsuario().getNombreCompleto() : null);
        payload.put("turno", turno);

        Map<String, Object> centroMap = new LinkedHashMap<>();
        centroMap.put("id", centro.getId());
        centroMap.put("nombre", centro.getNombre());
        payload.put("centro", centroMap);
        return payload;
    }
}