package com.sistemasalud.service;

import com.sistemasalud.dto.response.PaseGuardiaResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.ModalidadCita;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.CitaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaseServiceTest {

    @Mock private CitaRepository citaRepository;

    private PaseService service;
    private Cita cita;

    @BeforeEach
    void setUp() {
        service = new PaseService(citaRepository);
        ReflectionTestUtils.setField(service, "baseUrl", "http://localhost:3000");

        Usuario usuario = Usuario.builder().id(1L).nombreCompleto("Maria Lopez")
                .email("maria@test.com").telefono("1155550000").tipoUsuario(TipoUsuario.PACIENTE).build();
        Paciente paciente = Paciente.builder().id(1L).usuario(usuario)
                .numDocumento("30111222").tipoDocumento("DNI")
                .fechaNacimiento(LocalDate.of(1992, 8, 20)).build();
        CategoriaAyuda categoria = CategoriaAyuda.builder().id(1L).nombre("Salud Mental").prioridad(Prioridad.ALTA).build();
        CentroSalud centro = CentroSalud.builder().id(5L).nombre("Hospital Gallardo")
                .direccion("Av. San Martin 1").telefono("3884000000").emailInstitucional("admin@hosp.com").build();
        Profesional profesional = Profesional.builder().id(1L)
                .usuario(Usuario.builder().id(2L).nombreCompleto("Dr. Roman").tipoUsuario(TipoUsuario.PROFESIONAL).build())
                .build();
        Solicitud solicitud = Solicitud.builder()
                .id(7L).paciente(paciente).categoria(categoria).centroSalud(centro)
                .titulo("Crisis de ansiedad").descripcion("Episodio de ansiedad severo")
                .anamnesis("Paciente refiere palpitaciones")
                .folio("NSL-2026-7").estado(EstadoSolicitud.ASIGNADA)
                .prioridad(Prioridad.ALTA).emergencia(true)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now()).activa(true)
                .build();
        cita = Cita.builder()
                .id(1L).solicitud(solicitud).profesional(profesional).centroSalud(centro)
                .fechaHora(LocalDateTime.of(2026, 9, 1, 10, 0)).duracion(30)
                .modalidad(ModalidadCita.PRESENCIAL).estado("PROGRAMADA")
                .codigoPase("PG7K2QX5A1").build();
    }

    @Test
    void generarCodigoPase_deberiaGenerarCodigoUnicoDe10Caracteres() {
        when(citaRepository.findByCodigoPase(anyString())).thenReturn(Optional.empty());

        String a = service.generarCodigoPase();
        String b = service.generarCodigoPase();

        assertThat(a).hasSize(10);
        assertThat(b).hasSize(10);
        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void linkPase_deberiaConstruirUrlPublica() {
        when(citaRepository.findByCodigoPase(anyString())).thenReturn(Optional.empty());
        String codigo = service.generarCodigoPase();

        String link = service.linkPase(codigo);

        assertThat(link).isEqualTo("http://localhost:3000/pase/" + codigo);
    }

    @Test
    void linkPase_codigoVacio_deberiaDevolverNull() {
        assertThat(service.linkPase("")).isNull();
        assertThat(service.linkPase(null)).isNull();
    }

    @Test
    void obtenerPase_deberiaDevolverFichaConMotivoYTriaje() {
        when(citaRepository.findByCodigoPase("PG7K2QX5A1")).thenReturn(Optional.of(cita));

        PaseGuardiaResponse r = service.obtenerPase("PG7K2QX5A1");

        assertThat(r.getCodigoPase()).isEqualTo("PG7K2QX5A1");
        assertThat(r.getLinkPase()).isEqualTo("http://localhost:3000/pase/PG7K2QX5A1");
        assertThat(r.getFolio()).isEqualTo("NSL-2026-7");
        assertThat(r.getTitulo()).isEqualTo("Crisis de ansiedad");
        assertThat(r.getDescripcion()).isEqualTo("Episodio de ansiedad severo");
        assertThat(r.getAnamnesis()).isEqualTo("Paciente refiere palpitaciones");
        assertThat(r.getPrioridad()).isEqualTo("ALTA");
        assertThat(r.isEmergencia()).isTrue();
        assertThat(r.getNombrePaciente()).isEqualTo("Maria Lopez");
        assertThat(r.getNumDocumento()).isEqualTo("30111222");
        assertThat(r.getEdadPaciente()).isNotNull();
        assertThat(r.getNombreCentro()).isEqualTo("Hospital Gallardo");
        assertThat(r.getDireccionCentro()).isEqualTo("Av. San Martin 1");
        assertThat(r.getTelefonoCentro()).isEqualTo("3884000000");
        assertThat(r.getNombreProfesional()).isEqualTo("Dr. Roman");
        assertThat(r.getEstadoCita()).isEqualTo("PROGRAMADA");
        assertThat(r.getIndicaciones()).contains("Hospital Gallardo");
    }

    @Test
    void obtenerPase_codigoInexistente_deberiaLanzarExcepcion() {
        when(citaRepository.findByCodigoPase("XXXX")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtenerPase("XXXX"))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void marcarPresentado_deberiaMarcarFechaYEstadoPresente() {
        when(citaRepository.findByCodigoPase("PG7K2QX5A1")).thenReturn(Optional.of(cita));
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));

        PaseGuardiaResponse r = service.marcarPresentado("pg7k2qx5a1");

        assertThat(r.getFechaPresentacion()).isNotNull();
        assertThat(r.getEstadoCita()).isEqualTo("PRESENTE");
        verify(citaRepository).save(cita);
    }

    @Test
    void marcarPresentado_yaPresentado_deberiaNoReescribir() {
        cita.setFechaPresentacion(LocalDateTime.now());
        when(citaRepository.findByCodigoPase("PG7K2QX5A1")).thenReturn(Optional.of(cita));

        service.marcarPresentado("PG7K2QX5A1");

        verify(citaRepository, never()).save(any(Cita.class));
    }
}