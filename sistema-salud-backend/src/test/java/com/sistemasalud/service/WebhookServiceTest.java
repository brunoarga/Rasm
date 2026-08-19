package com.sistemasalud.service;

import com.sistemasalud.entity.*;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.ModalidadCita;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.enums.TipoUsuario;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

class WebhookServiceTest {

    private WebhookService service;
    private Cita cita;
    private CentroSalud centro;
    private ServerSocket server;

    @BeforeEach
    void setUp() {
        service = new WebhookService();
        ReflectionTestUtils.setField(service, "enabled", false);

        Usuario usuario = Usuario.builder().id(1L).nombreCompleto("Maria Lopez")
                .email("maria@test.com").telefono("1155550000").tipoUsuario(TipoUsuario.PACIENTE).build();
        Paciente paciente = Paciente.builder().id(1L).usuario(usuario).numDocumento("30111222").build();
        Solicitud solicitud = Solicitud.builder()
                .id(7L).paciente(paciente).titulo("Crisis de ansiedad").descripcion("Episodio severo")
                .folio("NSL-2026-7").estado(EstadoSolicitud.ASIGNADA)
                .prioridad(Prioridad.ALTA).emergencia(true)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true)
                .build();
        centro = CentroSalud.builder().id(5L).nombre("Hospital Gallardo")
                .webhookUrl("http://127.0.0.1:1/webhook").build();
        cita = Cita.builder()
                .id(1L).solicitud(solicitud).centroSalud(centro)
                .fechaHora(LocalDateTime.of(2026, 9, 1, 10, 0)).duracion(30)
                .modalidad(ModalidadCita.PRESENCIAL).estado("PROGRAMADA")
                .codigoPase("PG7K2QX5A1").build();
    }

    @AfterEach
    void tearDown() throws Exception {
        if (server != null && !server.isClosed()) server.close();
    }

    @Test
    void notificarTurno_desactivado_noDeberiaLanzar() {
        service.notificarTurno(cita);
    }

    @Test
    void notificarTurno_sinWebhookUrl_deberiaNoEnviar() {
        ReflectionTestUtils.setField(service, "enabled", true);
        centro.setWebhookUrl(null);
        service.notificarTurno(cita);
    }

    @Test
    void notificarTurno_conWebhookUrl_deberiaEnviarPayload() throws Exception {
        server = new ServerSocket(0, 1, java.net.InetAddress.getByName("127.0.0.1"));
        int port = server.getLocalPort();
        centro.setWebhookUrl("http://127.0.0.1:" + port + "/webhook");
        ReflectionTestUtils.setField(service, "enabled", true);

        new Thread(() -> service.notificarTurno(cita)).start();

        try (Socket socket = server.accept()) {
            socket.setSoTimeout(3000);
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            String line;
            int contentLength = 0;
            while ((line = reader.readLine()) != null) {
                if (line.isEmpty()) break;
                if (line.toLowerCase().startsWith("content-length:")) {
                    contentLength = Integer.parseInt(line.substring("content-length:".length()).trim());
                }
            }
            char[] cuerpo = new char[contentLength];
            int leidos = 0;
            while (leidos < contentLength) {
                int n = reader.read(cuerpo, leidos, contentLength - leidos);
                if (n < 0) break;
                leidos += n;
            }
            String payload = new String(cuerpo, 0, leidos);
            assertThat(payload).contains("turno_asignado")
                    .contains("NSL-2026-7")
                    .contains("PG7K2QX5A1")
                    .contains("Hospital Gallardo");
            socket.getOutputStream().write("HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nOK".getBytes(StandardCharsets.UTF_8));
            socket.getOutputStream().flush();
        }
    }

    @Test
    void notificarTurno_errorDeRed_noDeberiaLanzar() {
        ReflectionTestUtils.setField(service, "enabled", true);
        centro.setWebhookUrl("http://127.0.0.1:1/webhook");
        service.notificarTurno(cita);
    }
}