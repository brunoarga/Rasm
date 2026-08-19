package com.sistemasalud.service;

import com.sistemasalud.dto.request.AsignarTurnoRequest;
import com.sistemasalud.dto.request.DerivacionRequest;
import com.sistemasalud.dto.request.SolicitudPresencialRequest;
import com.sistemasalud.dto.request.SolicitudRequest;
import com.sistemasalud.dto.response.SolicitudResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.OrigenSolicitud;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.ConsentimientoRequeridoException;
import com.sistemasalud.exception.EstadoInvalidoException;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.exception.SolicitudInvalidaException;
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
    @Mock private SecretarioRepository secretarioRepository;
    @Mock private BitacoraSolicitudRepository bitacoraRepository;
    @Mock private EmailService emailService;
    @Mock private WhatsAppService whatsAppService;
    @Mock private UsuarioRepository usuarioRepository;

    private SolicitudService service;
    private Usuario usuarioPaciente;
    private Usuario usuarioProfesional;
    private Paciente paciente;
    private Profesional profesional;
    private CategoriaAyuda categoria;
    private Solicitud solicitud;

    @BeforeEach
    void setUp() {
        service = new SolicitudService(solicitudRepository, pacienteRepository, profesionalRepository, categoriaAyudaRepository, centroSaludRepository, centroObraSocialPracticaRepository, citaRepository, diarioSintomasRepository, registroSintomatologiaRepository, notificacionService, mensajeService, secretarioRepository, bitacoraRepository, emailService, whatsAppService, usuarioRepository);

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
    void crearSolicitudPresencial_deberiaCrearConOrigenPRESENCIAL() {
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(categoriaAyudaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(inv -> inv.getArgument(0));

        SolicitudPresencialRequest request = new SolicitudPresencialRequest();
        request.setIdPaciente(1L);
        request.setIdCategoria(1L);
        request.setTitulo("Consulta presencial");
        request.setDescripcion("Paciente espontáneo");
        request.setEsUrgente(false);

        SolicitudResponse response = service.crearSolicitudPresencial(request, "PROFESIONAL");

        assertThat(response.getOrigen()).isEqualTo("PRESENCIAL");
        ArgumentCaptor<Solicitud> captor = ArgumentCaptor.forClass(Solicitud.class);
        verify(solicitudRepository, atLeastOnce()).save(captor.capture());
        assertThat(captor.getAllValues())
                .anyMatch(s -> s.getOrigen() == OrigenSolicitud.PRESENCIAL);
        verify(notificacionService).crearNotificacion(any(Usuario.class), anyString(), anyString(), any(Solicitud.class));
        verify(mensajeService, never()).abrirConversacion(any(Solicitud.class));
    }

    @Test
    void crearSolicitudPresencial_conTurno_deberiaAsignarProfesionalCentroYTurno() {
        CentroSalud centro = CentroSalud.builder().id(5L).nombre("Hospital Público").build();
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(categoriaAyudaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(centroSaludRepository.findById(5L)).thenReturn(Optional.of(centro));
        when(profesionalRepository.findById(1L)).thenReturn(Optional.of(profesional));
        when(citaRepository.findByProfesionalIdAndFechaHoraBetween(any(), any(), any())).thenReturn(List.of());
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(inv -> inv.getArgument(0));

        SolicitudPresencialRequest request = new SolicitudPresencialRequest();
        request.setIdPaciente(1L);
        request.setIdCategoria(1L);
        request.setTitulo("Turno presencial");
        request.setDescripcion("Alta en el centro");
        request.setEsUrgente(false);
        request.setIdCentroSalud(5L);
        request.setIdProfesional(1L);
        request.setFechaHora("2026-08-20T10:00");
        request.setDuracion(30);
        request.setModalidad("PRESENCIAL");

        SolicitudResponse response = service.crearSolicitudPresencial(request, "PROFESIONAL");

        assertThat(response.getOrigen()).isEqualTo("PRESENCIAL");
        assertThat(response.getEstado()).isEqualTo("ASIGNADA");
        assertThat(response.getIdProfesional()).isEqualTo(1L);
        assertThat(response.getIdCentroSalud()).isEqualTo(5L);
        assertThat(response.getFechaTurno()).isEqualTo(LocalDateTime.of(2026, 8, 20, 10, 0));
        assertThat(response.getDuracionTurno()).isEqualTo(30);
        verify(citaRepository).save(any(Cita.class));
        verify(mensajeService).abrirConversacion(any(Solicitud.class));
        verify(notificacionService, times(2)).crearNotificacion(any(Usuario.class), anyString(), anyString(), any(Solicitud.class));
    }

    @Test
    void crearSolicitud_online_deberiaCrearConOrigenONLINE() {
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(paciente));
        when(categoriaAyudaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(solicitud);

        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(1L);
        request.setTitulo("Necesito ayuda");
        request.setDescripcion("Me siento mal");
        request.setEsUrgente(false);

        SolicitudResponse response = service.crearSolicitud(1L, request);

        assertThat(response.getOrigen()).isEqualTo("ONLINE");
    }

    @Test
    void crearSolicitudPresencial_noEncontrado_deberiaLanzarExcepcion() {
        when(pacienteRepository.findById(99L)).thenReturn(Optional.empty());

        SolicitudPresencialRequest request = new SolicitudPresencialRequest();
        request.setIdPaciente(99L);

        assertThatThrownBy(() -> service.crearSolicitudPresencial(request, "PROFESIONAL"))
                .isInstanceOf(RecursoNoEncontradoException.class);
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

    @Test
    void derivarACentro_deberiaDejarRecibidaConFolioYBitacora() {
        CentroSalud centro = CentroSalud.builder().id(5L).nombre("Hospital Publico")
                .emailInstitucional("recepcion@hosp.com").telefonoInstitucional("1155550001").build();
        Secretario referente = Secretario.builder().id(1L)
                .usuario(Usuario.builder().id(10L).nombreCompleto("Referente").email("ref@test.com").tipoUsuario(TipoUsuario.SECRETARIO).build())
                .centroSalud(centro).build();
        solicitud.setEstado(EstadoSolicitud.CREADA);
        solicitud.setFechaCreacion(LocalDateTime.now());
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(centroSaludRepository.findById(5L)).thenReturn(Optional.of(centro));
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(inv -> inv.getArgument(0));
        when(secretarioRepository.findByCentroSaludId(5L)).thenReturn(List.of(referente));
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(usuarioProfesional));
        when(bitacoraRepository.save(any(BitacoraSolicitud.class))).thenAnswer(inv -> inv.getArgument(0));

        SolicitudResponse response = service.derivarACentro(1L, 5L, 3L);

        assertThat(response.getEstado()).isEqualTo("RECIBIDA");
        assertThat(response.getFolio()).startsWith("NSL-");
        ArgumentCaptor<Solicitud> captor = ArgumentCaptor.forClass(Solicitud.class);
        verify(solicitudRepository, atLeastOnce()).save(captor.capture());
        assertThat(captor.getAllValues()).anyMatch(s -> s.getFolio() != null && s.getFolio().contains("NSL-"));
        verify(bitacoraRepository).save(any(BitacoraSolicitud.class));
        verify(notificacionService).notificarMensaje(eq(referente.getUsuario()), anyString(), anyString(), any(Solicitud.class));
        verify(emailService).enviarEmailNotificacion(eq("recepcion@hosp.com"), anyString(), anyString());
        verify(whatsAppService).enviarPlantilla(eq("1155550001"), eq("nueva_derivacion"), anyList());
    }

    @Test
    void derivarACentro_solicitudNoEncontrada_deberiaLanzarExcepcion() {
        when(solicitudRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.derivarACentro(99L, 5L, 3L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void asignarTurno_comoReferente_deberiaAsignarYNotificarCompleto() {
        usuarioPaciente.setTelefono("1155556666");
        CentroSalud centro = CentroSalud.builder().id(5L).nombre("Hospital Publico").direccion("Av. Siempre Viva 123").build();
        Secretario referente = Secretario.builder().id(1L).usuario(usuarioProfesional).centroSalud(centro).build();
        solicitud.setEstado(EstadoSolicitud.RECIBIDA);
        solicitud.setCentroSalud(centro);
        solicitud.setFolio("NSL-2026-1");
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(secretarioRepository.findByUsuarioId(2L)).thenReturn(Optional.of(referente));
        when(profesionalRepository.findById(1L)).thenReturn(Optional.of(profesional));
        when(citaRepository.findByProfesionalIdAndFechaHoraBetween(any(), any(), any())).thenReturn(List.of());
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(inv -> inv.getArgument(0));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioProfesional));
        when(bitacoraRepository.save(any(BitacoraSolicitud.class))).thenAnswer(inv -> inv.getArgument(0));

        AsignarTurnoRequest request = new AsignarTurnoRequest();
        request.setIdProfesional(1L);
        request.setFechaHora("2026-09-01T10:00");
        request.setDuracion(30);
        request.setModalidad("PRESENCIAL");

        SolicitudResponse response = service.asignarTurno(1L, request, 2L, "SECRETARIO");

        assertThat(response.getEstado()).isEqualTo("ASIGNADA");
        assertThat(response.getFolio()).isEqualTo("NSL-2026-1");
        verify(notificacionService).crearNotificacion(eq(usuarioPaciente), eq("Turno confirmado"),
                argThat(m -> m.contains("Hospital Publico") && m.contains("2026-09-01") && m.contains("10:00")), any(Solicitud.class));
        verify(whatsAppService).enviarPlantilla(eq("1155556666"), eq("turno_confirmado"), anyList());
        verify(bitacoraRepository).save(any(BitacoraSolicitud.class));
    }

    @Test
    void asignarTurno_referenteDeOtroCentro_deberiaDenegar() {
        CentroSalud centroA = CentroSalud.builder().id(5L).nombre("Hospital A").build();
        CentroSalud centroB = CentroSalud.builder().id(6L).nombre("Hospital B").build();
        Secretario referenteB = Secretario.builder().id(1L).usuario(usuarioProfesional).centroSalud(centroB).build();
        solicitud.setEstado(EstadoSolicitud.RECIBIDA);
        solicitud.setCentroSalud(centroA);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(secretarioRepository.findByUsuarioId(2L)).thenReturn(Optional.of(referenteB));

        AsignarTurnoRequest request = new AsignarTurnoRequest();
        request.setIdProfesional(1L);
        request.setFechaHora("2026-09-01T10:00");

        assertThatThrownBy(() -> service.asignarTurno(1L, request, 2L, "SECRETARIO"))
                .isInstanceOf(com.sistemasalud.exception.AccesoDenegadoException.class);
    }

    @Test
    void asignarTurno_centralSinCentro_deberiaDenegar() {
        CentroSalud centro = CentroSalud.builder().id(5L).nombre("Hospital Publico").build();
        Secretario central = Secretario.builder().id(1L).usuario(usuarioProfesional).centroSalud(null).build();
        solicitud.setEstado(EstadoSolicitud.RECIBIDA);
        solicitud.setCentroSalud(centro);
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(secretarioRepository.findByUsuarioId(2L)).thenReturn(Optional.of(central));

        AsignarTurnoRequest request = new AsignarTurnoRequest();
        request.setIdProfesional(1L);
        request.setFechaHora("2026-09-01T10:00");

        assertThatThrownBy(() -> service.asignarTurno(1L, request, 2L, "SECRETARIO"))
                .isInstanceOf(com.sistemasalud.exception.AccesoDenegadoException.class);
    }

    @Test
    void listarSolicitudes_referenteConCentro_deberiaFiltrarPorCentro() {
        Secretario referente = Secretario.builder().id(1L).usuario(usuarioProfesional)
                .centroSalud(CentroSalud.builder().id(5L).nombre("Hospital Publico").build()).build();
        when(secretarioRepository.findByUsuarioId(2L)).thenReturn(Optional.of(referente));
        solicitud.setEstado(EstadoSolicitud.RECIBIDA);
        solicitud.setCentroSalud(CentroSalud.builder().id(5L).nombre("Hospital Publico").build());
        when(solicitudRepository.findByCentroSaludIdAndEstadoInOrderByFechaCreacionDesc(eq(5L), any()))
                .thenReturn(List.of(solicitud));

        List<SolicitudResponse> result = service.listarSolicitudes(2L, "SECRETARIO", null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEstado()).isEqualTo("RECIBIDA");
    }

    @Test
    void perfilSecretario_referente_deberiaDevolverCentro() {
        Secretario referente = Secretario.builder().id(1L).usuario(usuarioProfesional)
                .centroSalud(CentroSalud.builder().id(5L).nombre("Hospital Publico").build()).build();
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioProfesional));
        when(secretarioRepository.findByUsuarioId(2L)).thenReturn(Optional.of(referente));

        com.sistemasalud.dto.response.PerfilSecretarioResponse perfil = service.perfilSecretario(2L);

        assertThat(perfil.isReferente()).isTrue();
        assertThat(perfil.getIdCentroSalud()).isEqualTo(5L);
        assertThat(perfil.getNombreCentroSalud()).isEqualTo("Hospital Publico");
    }

    @Test
    void perfilSecretario_central_deberiaDevolverSinCentro() {
        Secretario central = Secretario.builder().id(1L).usuario(usuarioProfesional).centroSalud(null).build();
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioProfesional));
        when(secretarioRepository.findByUsuarioId(2L)).thenReturn(Optional.of(central));

        com.sistemasalud.dto.response.PerfilSecretarioResponse perfil = service.perfilSecretario(2L);

        assertThat(perfil.isReferente()).isFalse();
        assertThat(perfil.getIdCentroSalud()).isNull();
    }

    @Test
    void crearSolicitudPresencial_comoSecretarioConTurno_deberiaLanzarExcepcion() {
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));

        SolicitudPresencialRequest request = new SolicitudPresencialRequest();
        request.setIdPaciente(1L);
        request.setIdCategoria(1L);
        request.setTitulo("Consulta");
        request.setDescripcion("Paciente");
        request.setIdProfesional(1L);
        request.setFechaHora("2026-09-01T10:00");

        assertThatThrownBy(() -> service.crearSolicitudPresencial(request, "SECRETARIO"))
                .isInstanceOf(SolicitudInvalidaException.class);
    }
}