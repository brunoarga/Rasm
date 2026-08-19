package com.sistemasalud.service;

import com.sistemasalud.dto.response.CentroAuditoriaResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.repository.AlertaDemoraRepository;
import com.sistemasalud.repository.CentroSaludRepository;
import com.sistemasalud.repository.SolicitudRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditoriaRedServiceTest {

    @Mock private CentroSaludRepository centroSaludRepository;
    @Mock private SolicitudRepository solicitudRepository;
    @Mock private AlertaDemoraRepository alertaDemoraRepository;

    private AuditoriaRedService service;
    private CentroSalud centro;
    private Solicitud confirmada;
    private Solicitud sinRespuesta;

    @BeforeEach
    void setUp() {
        service = new AuditoriaRedService(centroSaludRepository, solicitudRepository, alertaDemoraRepository);

        centro = CentroSalud.builder().id(5L).nombre("Hospital Publico")
                .direccion("Av. Siempre Viva 123").telefono("1155550001")
                .tieneEmergencias(true).activo(true).build();
        Usuario u = Usuario.builder().id(1L).nombreCompleto("Juan Perez").tipoUsuario(TipoUsuario.PACIENTE).build();
        Paciente p = Paciente.builder().id(1L).usuario(u).consentimientoOk(true).build();
        CategoriaAyuda cat = CategoriaAyuda.builder().id(1L).nombre("Ansiedad").prioridad(Prioridad.MEDIA).activa(true).build();

        confirmada = Solicitud.builder().id(1L).paciente(p).categoria(cat).centroSalud(centro)
                .titulo("Turno").descripcion("Desc").estado(EstadoSolicitud.ASIGNADA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now().minusDays(2)).fechaActualizacion(LocalDateTime.now().minusDays(2))
                .fechaTurno(LocalDateTime.now().minusDays(1)).activa(true).build();
        sinRespuesta = Solicitud.builder().id(2L).paciente(p).categoria(cat).centroSalud(centro)
                .titulo("Sin turno").descripcion("Desc2").estado(EstadoSolicitud.RECIBIDA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now().minusDays(3)).fechaActualizacion(LocalDateTime.now().minusDays(3))
                .activa(true).build();
    }

    @Test
    void auditarRed_deberiaCalcularMetricasPorCentro() {
        when(centroSaludRepository.findByActivoTrue()).thenReturn(List.of(centro));
        when(solicitudRepository.findByCentroSaludIdOrderByFechaCreacionDesc(5L)).thenReturn(List.of(confirmada, sinRespuesta));
        when(alertaDemoraRepository.findByEstado("ABIERTA")).thenReturn(List.of());

        List<CentroAuditoriaResponse> result = service.auditarRed();

        assertThat(result).hasSize(1);
        CentroAuditoriaResponse r = result.get(0);
        assertThat(r.getNombreCentroSalud()).isEqualTo("Hospital Publico");
        assertThat(r.getTotalDerivadas()).isEqualTo(2L);
        assertThat(r.getConfirmadas()).isEqualTo(1L);
        assertThat(r.getPctConfirmados()).isEqualTo(50);
        assertThat(r.getNoRespuesta()).isEqualTo(1L);
        assertThat(r.getAlertasAbiertas()).isZero();
        assertThat(r.getPromedioHorasTurno()).isEqualTo(24.0);
        assertThat(r.getTieneEmergencias()).isTrue();
    }

    @Test
    void auditarRed_conAlertasAbiertas_deberiaContarlas() {
        AlertaDemora alerta = AlertaDemora.builder().id(1L)
                .centroSalud(CentroSalud.builder().id(5L).build())
                .solicitud(sinRespuesta)
                .estado("ABIERTA").tipo("DEMORA").fechaGenerada(LocalDateTime.now()).build();
        when(centroSaludRepository.findByActivoTrue()).thenReturn(List.of(centro));
        when(solicitudRepository.findByCentroSaludIdOrderByFechaCreacionDesc(5L)).thenReturn(List.of(sinRespuesta));
        when(alertaDemoraRepository.findByEstado("ABIERTA")).thenReturn(List.of(alerta));

        List<CentroAuditoriaResponse> result = service.auditarRed();

        assertThat(result.get(0).getAlertasAbiertas()).isEqualTo(1L);
        assertThat(result.get(0).getDiasSinActividad()).isNotNull();
    }

    @Test
    void auditarRed_sinSolicitudes_deberiaDevolverCero() {
        when(centroSaludRepository.findByActivoTrue()).thenReturn(List.of(centro));
        when(solicitudRepository.findByCentroSaludIdOrderByFechaCreacionDesc(5L)).thenReturn(List.of());
        when(alertaDemoraRepository.findByEstado("ABIERTA")).thenReturn(List.of());

        CentroAuditoriaResponse r = service.auditarRed().get(0);

        assertThat(r.getTotalDerivadas()).isZero();
        assertThat(r.getPctConfirmados()).isZero();
        assertThat(r.getNoRespuesta()).isZero();
        assertThat(r.getPromedioHorasTurno()).isNull();
        assertThat(r.getDiasSinActividad()).isNull();
    }
}