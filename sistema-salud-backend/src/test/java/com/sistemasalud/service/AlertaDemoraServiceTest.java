package com.sistemasalud.service;

import com.sistemasalud.dto.response.AlertaDemoraResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.repository.AlertaDemoraRepository;
import com.sistemasalud.repository.SecretarioRepository;
import com.sistemasalud.repository.SolicitudRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertaDemoraServiceTest {

    @Mock private AlertaDemoraRepository alertaDemoraRepository;
    @Mock private SolicitudRepository solicitudRepository;
    @Mock private SecretarioRepository secretarioRepository;
    @Mock private NotificacionService notificacionService;

    private AlertaDemoraService service;
    private Solicitud solicitud;
    private Usuario pacienteUsuario;
    private Secretario central;

    @BeforeEach
    void setUp() {
        service = new AlertaDemoraService(alertaDemoraRepository, solicitudRepository, secretarioRepository, notificacionService);
        ReflectionTestUtils.setField(service, "horasAlerta", 24L);

        pacienteUsuario = Usuario.builder().id(1L).nombreCompleto("Juan Perez")
                .email("juan@test.com").telefono("1155554444").direccion("Av. Colon 123")
                .tipoUsuario(TipoUsuario.PACIENTE).build();
        Paciente paciente = Paciente.builder().id(1L).usuario(pacienteUsuario)
                .numDocumento("30111222").fechaNacimiento(LocalDate.of(1990, 5, 15))
                .consentimientoOk(true).build();
        CentroSalud centro = CentroSalud.builder().id(5L).nombre("Hospital Publico").build();
        CategoriaAyuda categoria = CategoriaAyuda.builder().id(1L).nombre("Ansiedad").prioridad(Prioridad.MEDIA).activa(true).build();
        solicitud = Solicitud.builder()
                .id(1L).paciente(paciente).categoria(categoria).centroSalud(centro)
                .titulo("Necesito ayuda").descripcion("Me siento mal").folio("NSL-2026-1")
                .estado(EstadoSolicitud.RECIBIDA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now().minusHours(30))
                .fechaActualizacion(LocalDateTime.now().minusHours(30))
                .activa(true).build();

        central = Secretario.builder().id(1L)
                .usuario(Usuario.builder().id(9L).nombreCompleto("Central").email("central@test.com").tipoUsuario(TipoUsuario.SECRETARIO).build())
                .centroSalud(null).build();
    }

    @Test
    void generarAlertas_deberiaCrearAlertasParaRecibidasVencidasYNotificarCentrales() {
        when(solicitudRepository.findByEstadoAndActivaTrueOrderByFechaCreacionDesc(EstadoSolicitud.RECIBIDA))
                .thenReturn(List.of(solicitud));
        when(alertaDemoraRepository.existsBySolicitudIdAndEstado(1L, "ABIERTA")).thenReturn(false);
        when(secretarioRepository.findAll()).thenReturn(List.of(central));
        when(alertaDemoraRepository.save(any(AlertaDemora.class))).thenAnswer(inv -> inv.getArgument(0));

        int creadas = service.generarAlertas();

        assertThat(creadas).isEqualTo(1);
        verify(alertaDemoraRepository).save(argThat(a -> a.getEstado().equals("ABIERTA")
                && a.getTipo().equals("DEMORA")
                && a.getCentroSalud().getId().equals(5L)));
        verify(notificacionService).notificarMensaje(eq(central.getUsuario()), eq("Alerta por demora: solicitud sin turno"),
                argThat(m -> m.contains("NSL-2026-1") && m.contains("Hospital Publico")), any(Solicitud.class));
    }

    @Test
    void generarAlertas_conAlertaAbiertaExistente_deberiaNoDuplicar() {
        when(solicitudRepository.findByEstadoAndActivaTrueOrderByFechaCreacionDesc(EstadoSolicitud.RECIBIDA))
                .thenReturn(List.of(solicitud));
        when(alertaDemoraRepository.existsBySolicitudIdAndEstado(1L, "ABIERTA")).thenReturn(true);

        int creadas = service.generarAlertas();

        assertThat(creadas).isZero();
        verify(alertaDemoraRepository, never()).save(any(AlertaDemora.class));
        verify(notificacionService, never()).notificarMensaje(any(Usuario.class), anyString(), anyString(), any(Solicitud.class));
    }

    @Test
    void generarAlertas_conTurnoAsignado_deberiaNoCrear() {
        solicitud.setFechaTurno(LocalDateTime.now().plusDays(1));
        when(solicitudRepository.findByEstadoAndActivaTrueOrderByFechaCreacionDesc(EstadoSolicitud.RECIBIDA))
                .thenReturn(List.of(solicitud));

        int creadas = service.generarAlertas();

        assertThat(creadas).isZero();
    }

    @Test
    void generarAlertas_recienRecibida_deberiaNoCrear() {
        solicitud.setFechaActualizacion(LocalDateTime.now().minusHours(2));
        when(solicitudRepository.findByEstadoAndActivaTrueOrderByFechaCreacionDesc(EstadoSolicitud.RECIBIDA))
                .thenReturn(List.of(solicitud));

        int creadas = service.generarAlertas();

        assertThat(creadas).isZero();
    }

    @Test
    void listarAbiertas_deberiaDevolverSoloAbiertasConDatosPaciente() {
        AlertaDemora alerta = AlertaDemora.builder().id(1L).solicitud(solicitud).centroSalud(solicitud.getCentroSalud())
                .estado("ABIERTA").tipo("DEMORA").detalle("Demora")
                .fechaGenerada(LocalDateTime.now().minusHours(6)).build();
        when(alertaDemoraRepository.findByEstado("ABIERTA")).thenReturn(List.of(alerta));

        List<AlertaDemoraResponse> result = service.listarAbiertas();

        assertThat(result).hasSize(1);
        AlertaDemoraResponse r = result.get(0);
        assertThat(r.getId()).isEqualTo(1L);
        assertThat(r.getSolicitudId()).isEqualTo(1L);
        assertThat(r.getFolio()).isEqualTo("NSL-2026-1");
        assertThat(r.getNombrePaciente()).isEqualTo("Juan Perez");
        assertThat(r.getEmailPaciente()).isEqualTo("juan@test.com");
        assertThat(r.getTelefonoPaciente()).isEqualTo("1155554444");
        assertThat(r.getDireccionPaciente()).isEqualTo("Av. Colon 123");
        assertThat(r.getEdadPaciente()).isNotNull();
        assertThat(r.getDocumentoPaciente()).contains("30111222");
        assertThat(r.getNombreCentroSalud()).isEqualTo("Hospital Publico");
        assertThat(r.getHorasDemora()).isGreaterThanOrEqualTo(24L);
    }

    @Test
    void resolver_deberiaMarcarResuelta() {
        AlertaDemora alerta = AlertaDemora.builder().id(1L).solicitud(solicitud)
                .estado("ABIERTA").tipo("DEMORA").fechaGenerada(LocalDateTime.now()).build();
        when(alertaDemoraRepository.findById(1L)).thenReturn(Optional.of(alerta));
        when(alertaDemoraRepository.save(any(AlertaDemora.class))).thenAnswer(inv -> inv.getArgument(0));

        service.resolver(1L);

        assertThat(alerta.getEstado()).isEqualTo("RESUELTA");
        assertThat(alerta.getFechaResuelta()).isNotNull();
    }

    @Test
    void marcarReasignada_deberiaMarcarResueltaYReasignada() {
        AlertaDemora alerta = AlertaDemora.builder().id(1L).solicitud(solicitud)
                .estado("ABIERTA").tipo("DEMORA").fechaGenerada(LocalDateTime.now()).build();
        when(alertaDemoraRepository.findById(1L)).thenReturn(Optional.of(alerta));
        when(alertaDemoraRepository.save(any(AlertaDemora.class))).thenAnswer(inv -> inv.getArgument(0));

        service.marcarReasignada(1L);

        assertThat(alerta.getEstado()).isEqualTo("RESUELTA");
        assertThat(alerta.getTipo()).isEqualTo("REASIGNADA");
        assertThat(alerta.getFechaResuelta()).isNotNull();
    }
}
