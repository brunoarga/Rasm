package com.sistemasalud.service;

import com.sistemasalud.dto.response.HistoriaClinicaResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistoriaClinicaServiceTest {

    @Mock private HistoriaClinicaRepository historiaClinicaRepository;
    @Mock private PacienteRepository pacienteRepository;
    @Mock private ProfesionalRepository profesionalRepository;
    @Mock private SolicitudRepository solicitudRepository;

    private HistoriaClinicaService service;
    private Paciente paciente;
    private Profesional profesional;
    private Solicitud solicitud;

    @BeforeEach
    void setUp() {
        service = new HistoriaClinicaService(historiaClinicaRepository, pacienteRepository, profesionalRepository, solicitudRepository);

        Usuario usuarioPaciente = Usuario.builder().id(1L).nombreCompleto("Juan Perez").email("juan@test.com").tipoUsuario(TipoUsuario.PACIENTE).build();
        Usuario usuarioProfesional = Usuario.builder().id(2L).nombreCompleto("Dra. Garcia").email("garcia@test.com").tipoUsuario(TipoUsuario.PROFESIONAL).build();
        paciente = Paciente.builder().id(7L).usuario(usuarioPaciente).build();
        profesional = Profesional.builder().id(3L).usuario(usuarioProfesional).build();
        solicitud = Solicitud.builder().id(9L).titulo("Acompañamiento por ansiedad").build();
    }

    @Test
    void obtenerHistorialPropio_deberiaResolverPacientePorUsuarioYDevolverHistoria() {
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));
        HistoriaClinica hc = HistoriaClinica.builder()
                .id(5L).paciente(paciente).profesional(profesional).solicitud(solicitud)
                .diagnostico("Trastorno de ansiedad generalizada")
                .tratamiento("Terapia cognitivo conductual")
                .observaciones("Evolución favorable")
                .tipoPlantilla("PSICOLOGIA")
                .fechaCreacion(LocalDateTime.of(2026, 8, 10, 10, 0))
                .build();
        when(historiaClinicaRepository.findByPacienteIdConRelaciones(7L)).thenReturn(List.of(hc));

        List<HistoriaClinicaResponse> historial = service.obtenerHistorialPropio(1L);

        assertThat(historial).hasSize(1);
        HistoriaClinicaResponse r = historial.get(0);
        assertThat(r.getId()).isEqualTo(5L);
        assertThat(r.getIdPaciente()).isEqualTo(7L);
        assertThat(r.getNombrePaciente()).isEqualTo("Juan Perez");
        assertThat(r.getIdSolicitud()).isEqualTo(9L);
        assertThat(r.getTituloSolicitud()).isEqualTo("Acompañamiento por ansiedad");
        assertThat(r.getNombreProfesional()).isEqualTo("Dra. Garcia");
        assertThat(r.getDiagnostico()).isEqualTo("Trastorno de ansiedad generalizada");
        assertThat(r.getTratamiento()).isEqualTo("Terapia cognitivo conductual");
        assertThat(r.getObservaciones()).isEqualTo("Evolución favorable");
        assertThat(r.getTipoPlantilla()).isEqualTo("PSICOLOGIA");
        verify(pacienteRepository).findByUsuarioId(1L);
        verify(historiaClinicaRepository).findByPacienteIdConRelaciones(7L);
    }

    @Test
    void obtenerHistorialPropio_sinPaciente_deberiaLanzarRecursoNoEncontrado() {
        when(pacienteRepository.findByUsuarioId(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtenerHistorialPropio(99L))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessageContaining("Paciente no encontrado");
        verify(historiaClinicaRepository, never()).findByPacienteIdConRelaciones(any());
    }

    @Test
    void crearRegistro_deberiaPersistirHistoriaClinica() {
        when(pacienteRepository.findById(7L)).thenReturn(Optional.of(paciente));
        when(profesionalRepository.findByUsuarioId(2L)).thenReturn(Optional.of(profesional));
        when(solicitudRepository.findById(9L)).thenReturn(Optional.of(solicitud));
        HistoriaClinica saved = HistoriaClinica.builder()
                .id(5L).paciente(paciente).profesional(profesional).solicitud(solicitud)
                .diagnostico("Diagnóstico").tratamiento("Tratamiento").observaciones("Obs")
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now())
                .build();
        when(historiaClinicaRepository.save(any(HistoriaClinica.class))).thenReturn(saved);

        com.sistemasalud.dto.request.HistoriaClinicaRequest req = new com.sistemasalud.dto.request.HistoriaClinicaRequest();
        req.setIdPaciente(7L);
        req.setIdSolicitud(9L);
        req.setDiagnostico("Diagnóstico");
        req.setTratamiento("Tratamiento");
        req.setObservaciones("Obs");

        HistoriaClinica result = service.crearRegistro(req, 2L);

        assertThat(result.getId()).isEqualTo(5L);
        verify(historiaClinicaRepository).save(any(HistoriaClinica.class));
    }
}
