package com.sistemasalud.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedDeque;

@Slf4j
@RestController
@RequestMapping("/mock/hospital/webhook")
public class MockHospitalWebhookController {

    private static final int MAX_BUFFER = 50;

    @Value("${webhook.mock.enabled:false}")
    private boolean enabled;

    private final Deque<Map<String, Object>> recientes = new ConcurrentLinkedDeque<>();

    @PostMapping
    public ResponseEntity<?> recibir(@RequestBody(required = false) Map<String, Object> payload,
                                     @RequestParam(required = false) String simular) {
        if (!enabled) return ResponseEntity.notFound().build();

        Map<String, Object> registro = new LinkedHashMap<>();
        registro.put("recibidoEn", LocalDateTime.now().toString());
        registro.put("origen", "webhook-service");
        registro.put("payload", payload != null ? payload : Map.of());
        recientes.addFirst(registro);
        while (recientes.size() > MAX_BUFFER) recientes.removeLast();

        log.info("=== MOCK HOSPITAL: webhook recibido evento={} idSolicitud={} codigoPase={}",
                payload != null ? payload.get("evento") : null,
                payload != null ? payload.get("idSolicitud") : null,
                payload != null ? payload.get("codigoPase") : null);

        if ("error".equalsIgnoreCase(simular)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "simulacion de fallo interno del hospital"));
        }
        if ("timeout".equalsIgnoreCase(simular)) {
            try {
                Thread.sleep(2500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("ok", true);
        resp.put("recepcion", "aceptada");
        resp.put("evento", payload != null ? payload.get("evento") : null);
        resp.put("idSolicitud", payload != null ? payload.get("idSolicitud") : null);
        resp.put("registradoEn", LocalDateTime.now().toString());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/recientes")
    public ResponseEntity<?> recientes() {
        if (!enabled) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(List.copyOf(recientes));
    }

    @DeleteMapping("/recientes")
    public ResponseEntity<?> limpiar() {
        if (!enabled) return ResponseEntity.notFound().build();
        recientes.clear();
        return ResponseEntity.ok(Map.of("ok", true, "limpiados", true));
    }
}