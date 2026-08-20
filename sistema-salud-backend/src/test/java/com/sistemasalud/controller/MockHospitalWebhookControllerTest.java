package com.sistemasalud.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class MockHospitalWebhookControllerTest {

    private Map<String, Object> payload() {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("evento", "turno_asignado");
        cuerpo.put("codigoPase", "PG7K2QX5A1");
        cuerpo.put("idSolicitud", 7L);
        cuerpo.put("folio", "NSL-2026-7");
        return cuerpo;
    }

    @Test
    void recibir_desactivado_deberiaResponder404() {
        MockHospitalWebhookController controller = new MockHospitalWebhookController();
        ReflectionTestUtils.setField(controller, "enabled", false);
        assertThat(controller.recibir(payload(), null).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void recibir_activado_deberiaResponderAceptado() {
        MockHospitalWebhookController controller = new MockHospitalWebhookController();
        ReflectionTestUtils.setField(controller, "enabled", true);
        var resp = controller.recibir(payload(), null);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) resp.getBody();
        assertThat(body.get("ok")).isEqualTo(true);
        assertThat(body.get("evento")).isEqualTo("turno_asignado");
    }

    @Test
    void recibir_conSimularError_deberiaResponder500() {
        MockHospitalWebhookController controller = new MockHospitalWebhookController();
        ReflectionTestUtils.setField(controller, "enabled", true);
        assertThat(controller.recibir(payload(), "error").getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void recientes_deberiaDevolverPayloadRegistrado() {
        MockHospitalWebhookController controller = new MockHospitalWebhookController();
        ReflectionTestUtils.setField(controller, "enabled", true);
        controller.recibir(payload(), null);
        var resp = controller.recientes();
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isInstanceOf(java.util.List.class);
        java.util.List<?> lista = (java.util.List<?>) resp.getBody();
        assertThat(lista).hasSize(1);
    }

    @Test
    void limpiar_deberiaVaciarBuffer() {
        MockHospitalWebhookController controller = new MockHospitalWebhookController();
        ReflectionTestUtils.setField(controller, "enabled", true);
        controller.recibir(payload(), null);
        controller.limpiar();
        assertThat(((java.util.List<?>) controller.recientes().getBody())).isEmpty();
    }
}