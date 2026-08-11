package com.sistemasalud.repository;

import com.sistemasalud.entity.*;
import com.sistemasalud.enums.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("integration")
@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SolicitudRepositoryIntegrationTest {

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
    }

    @Autowired private SolicitudRepository solicitudRepository;
    @Autowired private TestEntityManager em;

    private Paciente paciente;
    private CategoriaAyuda categoria;
    private Profesional profesional;

    @BeforeEach
    void setUp() {
        Usuario usuarioPaciente = Usuario.builder()
                .nombreCompleto("Juan Test").email("juan@test.com")
                .password("encoded").tipoUsuario(TipoUsuario.PACIENTE)
                .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
        em.persist(usuarioPaciente);

        Usuario usuarioProfesional = Usuario.builder()
                .nombreCompleto("Dra. Test").email("dra@test.com")
                .password("encoded").tipoUsuario(TipoUsuario.PROFESIONAL)
                .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
        em.persist(usuarioProfesional);

        paciente = Paciente.builder().usuario(usuarioPaciente).consentimientoOk(true).build();
        em.persist(paciente);

        profesional = Profesional.builder().usuario(usuarioProfesional).build();
        em.persist(profesional);

        categoria = CategoriaAyuda.builder()
                .nombre("Test").prioridad(Prioridad.MEDIA).activa(true).build();
        em.persist(categoria);
    }

    @Test
    void findByPacienteIdOrderByFechaCreacionDesc_deberiaRetornarSolicitudes() {
        Solicitud s1 = Solicitud.builder().paciente(paciente).categoria(categoria)
                .titulo("Ayuda").descripcion("Necesito ayuda")
                .estado(EstadoSolicitud.CREADA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();
        em.persist(s1);

        List<Solicitud> result = solicitudRepository.findByPacienteIdOrderByFechaCreacionDesc(paciente.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitulo()).isEqualTo("Ayuda");
    }

    @Test
    void findByEstadoInAndActivaTrueOrderByFechaCreacionDesc_deberiaRetornarPendientes() {
        Solicitud s1 = Solicitud.builder().paciente(paciente).categoria(categoria)
                .titulo("Pendiente").descripcion("Test pendiente")
                .estado(EstadoSolicitud.CREADA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();
        em.persist(s1);

        List<EstadoSolicitud> pendientes = List.of(EstadoSolicitud.CREADA, EstadoSolicitud.REVISADA);
        List<Solicitud> result = solicitudRepository.findByEstadoInAndActivaTrueOrderByFechaCreacionDesc(pendientes);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEstado()).isEqualTo(EstadoSolicitud.CREADA);
    }

    @Test
    void countByEstado_deberiaRetornarCantidadCorrecta() {
        Solicitud s1 = Solicitud.builder().paciente(paciente).categoria(categoria)
                .titulo("Test").descripcion("Test")
                .estado(EstadoSolicitud.CREADA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();
        em.persist(s1);

        long count = solicitudRepository.countByEstado(EstadoSolicitud.CREADA);

        assertThat(count).isEqualTo(1);
    }

    @Test
    void save_deberiaPersistirSolicitud() {
        Solicitud s = Solicitud.builder().paciente(paciente).categoria(categoria)
                .titulo("Nueva solicitud").descripcion("Descripcion")
                .estado(EstadoSolicitud.CREADA).prioridad(Prioridad.ALTA)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true).build();

        Solicitud saved = solicitudRepository.save(s);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitulo()).isEqualTo("Nueva solicitud");
        assertThat(saved.getEstado()).isEqualTo(EstadoSolicitud.CREADA);
    }
}