package com.sistemasalud.service;

import com.sistemasalud.dto.response.UsuarioAdminResponse;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.Profesional;
import com.sistemasalud.entity.Secretario;
import com.sistemasalud.entity.Usuario;
import com.sistemasalud.enums.TipoProfesional;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.PacienteRepository;
import com.sistemasalud.repository.ProfesionalRepository;
import com.sistemasalud.repository.SecretarioRepository;
import com.sistemasalud.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUsuarioServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PacienteRepository pacienteRepository;
    @Mock private ProfesionalRepository profesionalRepository;
    @Mock private SecretarioRepository secretarioRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private NotificacionService notificacionService;

    private AdminUsuarioService service;

    private Usuario pacienteUsuario;

    @BeforeEach
    void setUp() {
        service = new AdminUsuarioService(usuarioRepository, pacienteRepository, profesionalRepository,
                secretarioRepository, passwordEncoder, notificacionService);
        pacienteUsuario = Usuario.builder()
                .id(1L).nombreCompleto("Ana Pérez").email("ana@salud.com")
                .password("hash").tipoUsuario(TipoUsuario.PACIENTE)
                .activo(true).fechaRegistro(LocalDateTime.now()).build();
    }

    @Test
    void listarUsuarios_mapaPacienteConDetalle() {
        Paciente paciente = Paciente.builder().id(10L).usuario(pacienteUsuario)
                .tipoDocumento("DNI").numDocumento("30111222")
                .consentimientoOk(true).build();

        when(pacienteRepository.findAllWithUsuario()).thenReturn(List.of(paciente));
        when(profesionalRepository.findAllWithUsuario()).thenReturn(List.of());
        when(secretarioRepository.findAll()).thenReturn(List.of());
        when(usuarioRepository.findAll()).thenReturn(List.of(pacienteUsuario));

        List<UsuarioAdminResponse> resultado = service.listarUsuarios();

        assertThat(resultado).hasSize(1);
        UsuarioAdminResponse r = resultado.get(0);
        assertThat(r.getId()).isEqualTo(1L);
        assertThat(r.getTipoUsuario()).isEqualTo("PACIENTE");
        assertThat(r.getIdPaciente()).isEqualTo(10L);
        assertThat(r.getNumDocumento()).isEqualTo("30111222");
        assertThat(r.getConsentimientoOk()).isTrue();
    }

    @Test
    void lista_mapaProfesionalYSecretario() {
        Usuario prof = Usuario.builder().id(2L).nombreCompleto("Lic. Mariano Martinez")
                .email("mariano@salud.com").password("hash")
                .tipoUsuario(TipoUsuario.PROFESIONAL).tipoProfesional(TipoProfesional.PSICOLOGO)
                .especialidad("Psicologia Clinica").activo(true).fechaRegistro(LocalDateTime.now()).build();
        Usuario sec = Usuario.builder().id(3L).nombreCompleto("Sofía López")
                .email("sofia@salud.com").password("hash")
                .tipoUsuario(TipoUsuario.SECRETARIO).activo(true).fechaRegistro(LocalDateTime.now()).build();

        when(pacienteRepository.findAllWithUsuario()).thenReturn(List.of());
        when(profesionalRepository.findAllWithUsuario()).thenReturn(List.of(Profesional.builder().id(20L).usuario(prof).build()));
        when(secretarioRepository.findAll()).thenReturn(List.of(Secretario.builder().id(30L).usuario(sec).build()));
        when(usuarioRepository.findAll()).thenReturn(List.of(prof, sec));

        List<UsuarioAdminResponse> resultado = service.listarUsuarios();

        assertThat(resultado).hasSize(2);
        assertThat(resultado).extracting(UsuarioAdminResponse::getTipoUsuario).containsExactly("PROFESIONAL", "SECRETARIO");
        assertThat(resultado.get(0).getIdProfesional()).isEqualTo(20L);
        assertThat(resultado.get(0).getEspecialidad()).isEqualTo("Psicologia Clinica");
        assertThat(resultado.get(1).getIdSecretario()).isEqualTo(30L);
    }

    @Test
    void restablecerPassword_codificaYNotifica() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(pacienteUsuario));
        when(passwordEncoder.encode("nuevaClaveSegura")).thenReturn("hashNuevo");

        service.restablecerPassword(1L, "nuevaClaveSegura");

        assertThat(pacienteUsuario.getPassword()).isEqualTo("hashNuevo");
        verify(usuarioRepository).save(pacienteUsuario);
        verify(notificacionService).crearNotificacion(eq(pacienteUsuario), anyString(), anyString(), isNull());
    }

    @Test
    void restablecerPassword_usuarioInexistente_lanzaException() {
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.restablecerPassword(999L, "nuevaClaveSegura"))
                .isInstanceOf(RecursoNoEncontradoException.class);
        verify(notificacionService, never()).crearNotificacion(any(), any(), any(), any());
    }

    @Test
    void cambiarEstado_actualizaActivo() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(pacienteUsuario));

        service.cambiarEstado(1L, false);

        assertThat(pacienteUsuario.getActivo()).isFalse();
        verify(usuarioRepository).save(pacienteUsuario);
    }
}