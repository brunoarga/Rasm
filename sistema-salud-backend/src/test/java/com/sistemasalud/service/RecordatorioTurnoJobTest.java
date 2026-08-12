package com.sistemasalud.service;

import com.sistemasalud.entity.*;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.repository.CitaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecordatorioTurnoJobTest {

    @Mock private CitaRepository citaRepository;
    @Mock private NotificacionService notificacionService;

    private RecordatorioTurnoJob job;
    private Cita cita;

    @BeforeEach
    void setUp() {
        job = new RecordatorioTurnoJob(citaRepository, notificacionService);

        Usuario usuarioPaciente = Usuario.builder().id(1L).nombreCompleto("Juan Perez").email("juan@test.com").tipoUsuario(TipoUsuario.PACIENTE).build();
        Usuario usuarioProfesional = Usuario.builder().id(2L).nombreCompleto("Dra. Garcia").email("garcia@test.com").tipoUsuario(TipoUsuario.PROFESIONAL).build();
        Paciente paciente = Paciente.builder().id(1L).usuario(usuarioPaciente).consentimientoOk(true).build();
        Profesional profesional = Profesional.builder().id(1L).usuario(usuarioProfesional).build();
        Solicitud solicitud = Solicitud.builder()
                .id(1L).paciente(paciente).profesional(profesional)
                .titulo("Necesito ayuda").descripcion("Me siento mal")
                .estado(EstadoSolicitud.ASIGNADA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now())
                .activa(true).build();

        cita = Cita.builder()
                .id(1L).solicitud(solicitud).profesional(profesional)
                .fechaHora(LocalDateTime.now().plusHours(12))
                .duracion(30).estado("PROGRAMADA")
                .recordatorio24hEnviado(false)
                .recordatorio2hEnviado(false)
                .build();
    }

    @Test
    void enviarRecordatorios_deberiaNotificarYMarcarFlags() {
        when(citaRepository.findByEstadoAndFechaHoraBetween(eq("PROGRAMADA"), any(), any()))
                .thenReturn(List.of(cita))
                .thenReturn(List.of());

        job.enviarRecordatorios();

        verify(notificacionService, times(2)).crearNotificacion(any(Usuario.class),
                eq("Recordatorio de turno"), anyString(), any(Solicitud.class));
        assertThat(cita.getRecordatorio24hEnviado()).isTrue();
        assertThat(cita.getRecordatorio2hEnviado()).isFalse();
        verify(citaRepository, times(1)).save(cita);
    }

    @Test
    void enviarRecordatorios_conFlagYaEnviado_deberiaSaltarse() {
        cita.setRecordatorio24hEnviado(true);
        cita.setRecordatorio2hEnviado(true);
        when(citaRepository.findByEstadoAndFechaHoraBetween(eq("PROGRAMADA"), any(), any()))
                .thenReturn(List.of(cita));

        job.enviarRecordatorios();

        verify(notificacionService, never()).crearNotificacion(any(Usuario.class), anyString(), anyString(), any(Solicitud.class));
        verify(citaRepository, never()).save(any(Cita.class));
    }
}
