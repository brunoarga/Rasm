package com.sistemasalud.service;

import com.sistemasalud.dto.request.SolicitudRequest;
import com.sistemasalud.dto.response.SolicitudResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.*;
import com.sistemasalud.exception.ConsentimientoRequeridoException;
import com.sistemasalud.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;

@Tag("integration")
@Testcontainers
@SpringBootTest
class SolicitudServiceIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.flyway.enabled", () -> "false");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired private SolicitudService solicitudService;
    @Autowired private PacienteRepository pacienteRepository;
    @Autowired private ProfesionalRepository profesionalRepository;
    @Autowired private CategoriaAyudaRepository categoriaAyudaRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SecretarioRepository secretarioRepository;
    @Autowired private SolicitudRepository solicitudRepository;

    @MockBean private NotificacionService notificacionService;
    @MockBean private EmailService emailService;

    private Paciente paciente;
    private CategoriaAyuda categoria;
    private Profesional profesional;

    @BeforeEach
    void setUp() {
        doNothing().when(notificacionService).crearNotificacionParaProfesionales(anyString(), anyString(), any());
        doNothing().when(emailService).enviarEmailNotificacion(anyString(), anyString(), anyString());

        Usuario uPaciente = Usuario.builder().nombreCompleto("Paciente Test").email("pac@test.com")
                .password("encoded").tipoUsuario(TipoUsuario.PACIENTE)
                .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
        usuarioRepository.save(uPaciente);

        paciente = Paciente.builder().usuario(uPaciente).consentimientoOk(true).build();
        pacienteRepository.save(paciente);

        Usuario uProf = Usuario.builder().nombreCompleto("Prof Test").email("prof@test.com")
                .password("encoded").tipoUsuario(TipoUsuario.PROFESIONAL).tipoProfesional(TipoProfesional.PSICOLOGO)
                .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
        usuarioRepository.save(uProf);

        profesional = Profesional.builder().usuario(uProf).build();
        profesionalRepository.save(profesional);

        categoria = CategoriaAyuda.builder().nombre("Ansiedad Test").prioridad(Prioridad.MEDIA).activa(true).build();
        categoriaAyudaRepository.save(categoria);
    }

    @Test
    void crearYListarSolicitud_deberiaFuncionar() {
        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(categoria.getId());
        request.setTitulo("Necesito ayuda urgente");
        request.setDescripcion("Estoy pasando por un mal momento");
        request.setEsUrgente(true);

        SolicitudResponse creada = solicitudService.crearSolicitud(paciente.getUsuario().getId(), request);

        assertThat(creada.getId()).isNotNull();
        assertThat(creada.getTitulo()).isEqualTo("Necesito ayuda urgente");
        assertThat(creada.getEstado()).isEqualTo("REVISADA");
        assertThat(creada.getPrioridad()).isEqualTo("URGENTE");

        List<SolicitudResponse> listado = solicitudService.listarSolicitudes(paciente.getUsuario().getId(), "PACIENTE", null, null);
        assertThat(listado).hasSize(1);
    }

    @Test
    void cambiarEstadoSolicitud_deberiaActualizarEstado() {
        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(categoria.getId());
        request.setTitulo("Test cambio estado");
        request.setDescripcion("Test");

        SolicitudResponse creada = solicitudService.crearSolicitud(paciente.getUsuario().getId(), request);

        SolicitudResponse revisada = solicitudService.cambiarEstado(creada.getId(), "REVISADA", paciente.getUsuario().getId());
        assertThat(revisada.getEstado()).isEqualTo("REVISADA");

        SolicitudResponse asignada = solicitudService.cambiarEstado(revisada.getId(), "ASIGNADA", paciente.getUsuario().getId());
        assertThat(asignada.getEstado()).isEqualTo("ASIGNADA");
    }

    @Test
    void asignarProfesional_deberiaAsignarCorrectamente() {
        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(categoria.getId());
        request.setTitulo("Asignar test");
        request.setDescripcion("Test asignacion");

        SolicitudResponse creada = solicitudService.crearSolicitud(paciente.getUsuario().getId(), request);

        SolicitudResponse asignada = solicitudService.asignarProfesional(creada.getId(), profesional.getId());

        assertThat(asignada.getEstado()).isEqualTo("ASIGNADA");
        assertThat(asignada.getIdProfesional()).isEqualTo(profesional.getId());
        assertThat(asignada.getNombreProfesional()).isEqualTo("Prof Test");
    }

    @Test
    void solicitudSinConsentimiento_deberiaLanzarExcepcion() {
        paciente.setConsentimientoOk(false);
        pacienteRepository.save(paciente);

        SolicitudRequest request = new SolicitudRequest();
        request.setIdCategoria(categoria.getId());
        request.setTitulo("Sin consentimiento");
        request.setDescripcion("Test");

        org.junit.jupiter.api.Assertions.assertThrows(
                ConsentimientoRequeridoException.class,
                () -> solicitudService.crearSolicitud(paciente.getUsuario().getId(), request)
        );
    }

    @Test
    void listarSolicitudesPendientes_deberiaOrdenarUrgentesPrimero() {
        SolicitudRequest r1 = new SolicitudRequest();
        r1.setIdCategoria(categoria.getId());
        r1.setTitulo("Normal");
        r1.setDescripcion("Test normal");
        r1.setEsUrgente(false);
        solicitudService.crearSolicitud(paciente.getUsuario().getId(), r1);

        SolicitudRequest r2 = new SolicitudRequest();
        r2.setIdCategoria(categoria.getId());
        r2.setTitulo("Urgente");
        r2.setDescripcion("Test urgente");
        r2.setEsUrgente(true);
        solicitudService.crearSolicitud(paciente.getUsuario().getId(), r2);

        List<SolicitudResponse> pendientes = solicitudService.listarSolicitudesPendientes();

        assertThat(pendientes).hasSize(2);
        assertThat(pendientes.get(0).getPrioridad()).isEqualTo("URGENTE");
        assertThat(pendientes.get(1).getPrioridad()).isEqualTo("MEDIA");
    }
}