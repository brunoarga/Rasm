package com.sistemasalud.service;

import com.sistemasalud.dto.request.DerivacionRequest;
import com.sistemasalud.dto.request.SolicitudRequest;
import com.sistemasalud.dto.response.SolicitudResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.ConsentimientoRequeridoException;
import com.sistemasalud.exception.EstadoInvalidoException;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitudServiceTest {

    @Mock private SolicitudRepository solicitudRepository;
    @Mock private PacienteRepository pacienteRepository;
    @Mock private ProfesionalRepository profesionalRepository;
    @Mock private CategoriaAyudaRepository categoriaAyudaRepository;
    @Mock private CentroSaludRepository centroSaludRepository;
    @Mock private CentroObraSocialPracticaRepository centroObraSocialPracticaRepository;
    @Mock private CitaRepository citaRepository;
    @Mock private DiarioSintomasRepository diarioSintomasRepository;
    @Mock private RegistroSintomatologiaRepository registroSintomatologiaRepository;
    @Mock private NotificacionService notificacionService;
    @Mock private MensajeService mensajeService;

    private SolicitudService service;
    private Usuario usuarioPaciente;
    private Usuario usuarioProfesional;
    private Paciente paciente;
    private Profesional profesional;
    private CategoriaAyuda categoria;
    private Solicitud solicitud;

    @BeforeEach
    void setUp() {
        service = new SolicitudService(solicitudRepository, pacienteRepository, profesionalRepository, categoriaAyudaRepository, centroSaludRepository, centroObraSocialPracticaRepository, citaRepository, diarioSintomasRepository, registroSintomatologiaRepository, notificacionService, mensajeService);

        usuarioPaciente = Usuario.builder().id(1L).nombreCompleto("Juan Perez").email("juan@test.com").tipoUsuario(TipoUsuario.PACIENTE).build();
        usuarioProfesional = Usuario.builder().id(2L).nombreCompleto("Dra. Garcia").email("garcia@test.com").tipoUsuario(TipoUsuario.PROFESIONAL).build();

        paciente = Paciente.builder().id(1L).usuario(usuarioPaciente).consentimientoOk(true).build();
        profesional = Profesional.builder().id(1L).usuario(usuarioProfesional).build();

        categoria = CategoriaAyuda.builder().id(1L).nombre("Ansiedad").prioridad(Prioridad.MEDIA).activa(true).build();

        solicitud = Solicitud.builder()
                .id(1L).paciente(paciente).categoria(categoria)
                .titulo("Necesito ayuda").descripcion("Me siento mal")
                .estado(EstadoSolicitud.CREADA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now())
                .activa(true).build();
    }

    @Test
    void crearSolicitud_deberiaCrearSolicitudConEstadoCREADA() {
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));
        when(categoriaAyudaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(solicitud);

        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(1L);
        request.setTitulo("Necesito ayuda");
        request.setDescripcion("Me siento mal");
        request.setEsUrgente(false);

        SolicitudResponse response = service.crearSolicitud(1L, request);

        assertThat(response.getTitulo()).isEqualTo("Necesito ayuda");
        assertThat(response.getEstado()).isEqualTo("CREADA");
        assertThat(response.getPrioridad()).isEqualTo("MEDIA");
        verify(solicitudRepository).save(any(Solicitud.class));
        verify(notificacionService).crearNotificacionParaProfesionales(anyString(), anyString(), any(Solicitud.class));
    }

    @Test
    void crearSolicitud_urgente_deberiaCrearConEstadoREVISADA() {
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));
        when(categoriaAyudaRepository.findById(1L)).thenReturn(Optional.of(categoria));

        Solicitud solicitudUrgente = Solicitud.builder()
                .id(1L).paciente(paciente).categoria(categoria)
                .titulo("Urgente").descripcion("Auxilio")
                .estado(EstadoSolicitud.REVISADA).prioridad(Prioridad.URGENTE)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now())
                .activa(true).build();

        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(solicitudUrgente);

        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(1L);
        request.setTitulo("Urgente");
        request.setDescripcion("Auxilio");
        request.setEsUrgente(true);

        SolicitudResponse response = service.crearSolicitud(1L, request);

        assertThat(response.getEstado()).isEqualTo("REVISADA");
        assertThat(response.getPrioridad()).isEqualTo("URGENTE");
    }

    @Test
    void crearSolicitud_sinConsentimiento_deberiaLanzarExcepcion() {
        paciente.setConsentimientoOk(false);
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));

        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(1L);
        request.setTitulo("Test");
        request.setDescripcion("Test");

        assertThatThrownBy(() -> service.crearSolicitud(1L, request))
                .isInstanceOf(ConsentimientoRequeridoException.class)
                .hasMessageContaining("consentimiento");
    }

    @Test
    void crearSolicitud_pacienteNoEncontrado_deberiaLanzarExcepcion() {
        when(pacienteRepository.findByUsuarioId(99L)).thenReturn(Optional.empty());

        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(1L);

        assertThatThrownBy(() -> service.crearSolicitud(99L, request))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void listarSolicitudes_comoPaciente_deberiaRetornarSolicitudes() {
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));
        when(solicitudRepository.findByPacienteIdOrderByFechaCreacionDesc(1L)).thenReturn(List.of(solicitud));

        List<SolicitudResponse> result = service.listarSolicitudes(1L, "PACIENTE", null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitulo()).isEqualTo("Necesito ayuda");
    }

    @Test
    void listarSolicitudes_comoProfesional_deberiaRetornarSolicitudes() {
        when(profesionalRepository.findByUsuarioId(2L)).thenReturn(Optional.of(profesional));
        when(solicitudRepository.findByProfesionalIdOrderByFechaCreacionDesc(1L)).thenReturn(List.of(solicitud));

        List<SolicitudResponse> result = service.listarSolicitudes(2L, "PROFESIONAL", null, null);

        assertThat(result).hasSize(1);
    }

    @Test
    void listarSolicitudes_comoSecretario_deberiaRetornarTodas() {
        when(solicitudRepository.findAll()).thenReturn(List.of(solicitud));

        List<SolicitudResponse> result = service.listarSolicitudes(3L, "SECRETARIO", null, null);

        assertThat(result).hasSize(1);
    }

    @Test
    void listarSolicitudes_comoAdmin_deberiaRetornarTodas() {
        when(solicitudRepository.findAll()).thenReturn(List.of(solicitud));

        List<SolicitudResponse> result = service.listarSolicitudes(4L, "ADMIN", null, null);

        assertThat(result).hasSize(1);
    }

    @Test
    void listarSolicitudes_filtrandoPorEstado_deberiaFiltrar() {
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));
        when(solicitudRepository.findByPacienteIdOrderByFechaCreacionDesc(1L)).thenReturn(List.of(solicitud));

        List<SolicitudResponse> result = service.listarSolicitudes(1L, "PACIENTE", "CREADA", null);

        assertThat(result).hasSize(1);
    }

    @Test
    void listarSolicitudes_filtrandoPorEstadoSinMatch_deberiaRetornarVacio() {
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));
        when(solicitudRepository.findByPacienteIdOrderByFechaCreacionDesc(1L)).thenReturn(List.of(solicitud));

        List<SolicitudResponse> result = service.listarSolicitudes(1L, "PACIENTE", "COMPLETADA", null);

        assertThat(result).isEmpty();
    }

    @Test
    void obtenerSolicitud_existente_deberiaRetornarSolicitud() {
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));

        SolicitudResponse response = service.obtenerSolicitud(1L, 1L, "PACIENTE");

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getNombrePaciente()).isEqualTo("Juan Perez");
    }

    @Test
    void obtenerSolicitud_noExistente_deberiaLanzarExcepcion() {
        when(solicitudRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtenerSolicitud(99L, 1L, "PACIENTE"))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void cambiarEstado_transicionValida_deberiaActualizarEstado() {
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        Solicitud updated = Solicitud.builder().id(1L).paciente(paciente).categoria(categoria).titulo("Test").descripcion("Test").estado(EstadoSolicitud.REVISADA).prioridad(Prioridad.MEDIA).fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(updated);

        SolicitudResponse response = service.cambiarEstado(1L, "REVISADA", 1L);

        assertThat(response.getEstado()).isEqualTo("REVISADA");
    }

    @Test
    void cambiarEstado_transicionInvalida_deberiaLanzarExcepcion() {
        solicitud.setEstado(EstadoSolicitud.COMPLETADA);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));

        assertThatThrownBy(() -> service.cambiarEstado(1L, "CREADA", 1L))
                .isInstanceOf(EstadoInvalidoException.class);
    }

    @Test
    void cambiarEstado_creadaDirectoAEnProceso_deberiaFallar() {
        solicitud.setEstado(EstadoSolicitud.CREADA);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));

        assertThatThrownBy(() -> service.cambiarEstado(1L, "EN_PROCESO", 1L))
                .isInstanceOf(EstadoInvalidoException.class);
    }

    @Test
    void cambiarEstado_completadaNoPermiteMasCambios_deberiaFallar() {
        solicitud.setEstado(EstadoSolicitud.COMPLETADA);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));

        assertThatThrownBy(() -> service.cambiarEstado(1L, "DERIVADA", 1L))
                .isInstanceOf(EstadoInvalidoException.class);
    }

    @Test
    void cambiarEstado_asignadaADerivada_deberiaFuncionar() {
        solicitud.setEstado(EstadoSolicitud.ASIGNADA);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        Solicitud derivada = Solicitud.builder().id(1L).paciente(paciente).categoria(categoria).titulo("Test").descripcion("Test").estado(EstadoSolicitud.DERIVADA).prioridad(Prioridad.MEDIA).fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(derivada);

        SolicitudResponse response = service.cambiarEstado(1L, "DERIVADA", 1L);

        assertThat(response.getEstado()).isEqualTo("DERIVADA");
    }

    @Test
    void asignarProfesional_deberiaAsignarYActualizarEstado() {
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(profesionalRepository.findById(1L)).thenReturn(Optional.of(profesional));

        Solicitud asignada = Solicitud.builder().id(1L).paciente(paciente).profesional(profesional).categoria(categoria).titulo("Test").descripcion("Test").estado(EstadoSolicitud.ASIGNADA).prioridad(Prioridad.MEDIA).fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(asignada);

        SolicitudResponse response = service.asignarProfesional(1L, 1L);

        assertThat(response.getEstado()).isEqualTo("ASIGNADA");
        assertThat(response.getIdProfesional()).isEqualTo(1L);
        assertThat(response.getNombreProfesional()).isEqualTo("Dra. Garcia");
        verify(notificacionService).crearNotificacion(any(Usuario.class), anyString(), anyString(), any(Solicitud.class));
    }

    @Test
    void asignarProfesional_solicitudNoEncontrada_deberiaLanzarExcepcion() {
        when(solicitudRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.asignarProfesional(99L, 1L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void derivarSolicitud_deberiaDerivarYActualizarEstado() {
        solicitud.setProfesional(profesional);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(profesionalRepository.findById(2L)).thenReturn(Optional.of(Profesional.builder().id(2L).usuario(Usuario.builder().id(3L).nombreCompleto("Dr. Otro").email("otro@test.com").tipoUsuario(TipoUsuario.PROFESIONAL).build()).build()));

        Solicitud derivada = Solicitud.builder().id(1L).paciente(paciente).profesional(profesional).categoria(categoria).titulo("Test").descripcion("Test").estado(EstadoSolicitud.DERIVADA).prioridad(Prioridad.MEDIA).fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(derivada);

        DerivacionRequest request = new DerivacionRequest();
        request.setIdProfesional(2L);

        SolicitudResponse response = service.derivarSolicitud(1L, request);

        assertThat(response.getEstado()).isEqualTo("DERIVADA");

        ArgumentCaptor<String> tituloCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> msgCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(notificacionService, times(2)).crearNotificacion(usuarioCaptor.capture(), tituloCaptor.capture(), msgCaptor.capture(), any(Solicitud.class));
        assertThat(tituloCaptor.getAllValues()).contains("Derivación a profesional", "Nueva derivación");
        assertThat(msgCaptor.getAllValues()).anyMatch(m -> m.contains("Dr. Otro"));
        assertThat(msgCaptor.getAllValues()).anyMatch(m -> m.contains("Juan Perez"));
        assertThat(usuarioCaptor.getAllValues()).contains(usuarioPaciente);
    }

    @Test
    void derivarSolicitud_aProfesionalDeOtroCentro_deberiaReasignarCentro() {
        solicitud.setProfesional(profesional);
        CentroSalud centroNuevo = CentroSalud.builder().id(99L).nombre("Hospital de Perico").build();
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(profesionalRepository.findById(2L)).thenReturn(Optional.of(Profesional.builder().id(2L).usuario(Usuario.builder().id(3L).nombreCompleto("Dr. Otro").email("otro@test.com").tipoUsuario(TipoUsuario.PROFESIONAL).build()).centroSalud(centroNuevo).build()));
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(inv -> inv.getArgument(0));

        DerivacionRequest request = new DerivacionRequest();
        request.setIdProfesional(2L);

        service.derivarSolicitud(1L, request);

        ArgumentCaptor<Solicitud> captor = ArgumentCaptor.forClass(Solicitud.class);
        verify(solicitudRepository, atLeastOnce()).save(captor.capture());
        assertThat(captor.getAllValues())
                .anyMatch(s -> s.getCentroSalud() != null && s.getCentroSalud().getId().equals(99L));
    }

    @Test
    void derivarSolicitud_conTurno_deberiaCrearCitaYAgendarSolicitud() {
        solicitud.setProfesional(profesional);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(profesionalRepository.findById(2L)).thenReturn(Optional.of(Profesional.builder().id(2L).usuario(Usuario.builder().id(3L).nombreCompleto("Dr. Otro").email("otro@test.com").tipoUsuario(TipoUsuario.PROFESIONAL).build()).build()));
        when(citaRepository.findByProfesionalIdAndFechaHoraBetween(any(), any(), any())).thenReturn(List.of());
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDateTime fechaHora = LocalDateTime.of(2026, 8, 14, 10, 0);
        Solicitud derivada = Solicitud.builder().id(1L).paciente(paciente).profesional(profesional).categoria(categoria).titulo("Test").descripcion("Test").estado(EstadoSolicitud.DERIVADA).prioridad(Prioridad.MEDIA).fechaTurno(fechaHora).duracionTurno(45).modalidad("PRESENCIAL").fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(derivada);

        DerivacionRequest request = new DerivacionRequest();
        request.setIdProfesional(2L);
        request.setFechaHora(fechaHora);
        request.setDuracion(45);
        request.setModalidad("PRESENCIAL");

        SolicitudResponse response = service.derivarSolicitud(1L, request);

        assertThat(response.getEstado()).isEqualTo("DERIVADA");
        assertThat(response.getFechaTurno()).isEqualTo(fechaHora);
        assertThat(response.getDuracionTurno()).isEqualTo(45);
        assertThat(response.getModalidad()).isEqualTo("PRESENCIAL");
        verify(citaRepository).save(any(Cita.class));
        verify(notificacionService, times(2)).crearNotificacion(any(Usuario.class), anyString(),
                argThat(m -> m.contains("con turno para el 2026-08-14")), any(Solicitud.class));
    }

    @Test
    void listarTodasParaProfesional_deberiaIncluirSolicitudesAtendidasLuegoDeDerivar() {
        when(profesionalRepository.findByUsuarioId(2L)).thenReturn(Optional.of(profesional));
        when(solicitudRepository.findByProfesionalIdOrderByFechaCreacionDesc(1L)).thenReturn(List.of());
        when(solicitudRepository.findByEstadoInAndActivaTrueOrderByFechaCreacionDesc(any())).thenReturn(List.of());

        Cita atendida = Cita.builder()
                .id(10L).solicitud(solicitud).profesional(profesional)
                .fechaHora(LocalDateTime.of(2026, 8, 10, 9, 0))
                .duracion(30).estado("ATENDIDA").build();
        when(citaRepository.findByProfesionalIdAndEstadoOrderByFechaHoraDesc(1L, "ATENDIDA")).thenReturn(List.of(atendida));

        List<SolicitudResponse> result = service.listarTodasParaProfesional(2L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getTitulo()).isEqualTo("Necesito ayuda");
    }

    @Test
    void listarSolicitudesPendientes_deberiaOrdenarUrgentesPrimero() {
        Solicitud urgente = Solicitud.builder().id(2L).paciente(paciente).categoria(categoria).titulo("Urgente").descripcion("Auxilio").estado(EstadoSolicitud.CREADA).prioridad(Prioridad.URGENTE).fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();

        when(solicitudRepository.findByEstadoInAndActivaTrueOrderByFechaCreacionDesc(any())).thenReturn(List.of(solicitud, urgente));

        List<SolicitudResponse> result = service.listarSolicitudesPendientes();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPrioridad()).isEqualTo("URGENTE");
        assertThat(result.get(1).getPrioridad()).isEqualTo("MEDIA");
    }
}