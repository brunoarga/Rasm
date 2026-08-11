package com.sistemasalud.service;

import com.sistemasalud.dto.request.LoginRequest;
import com.sistemasalud.dto.request.RegistroRequest;
import com.sistemasalud.dto.response.AuthResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.exception.SolicitudInvalidaException;
import com.sistemasalud.repository.*;
import com.sistemasalud.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PacienteRepository pacienteRepository;
    @Mock private ProfesionalRepository profesionalRepository;
    @Mock private SecretarioRepository secretarioRepository;
    @Mock private ObraSocialRepository obraSocialRepository;
    @Mock private ConsentimientoRepository consentimientoRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;

    private AuthService service;
    private Usuario usuarioActivo;
    private Usuario usuarioInactivo;

    @BeforeEach
    void setUp() {
        service = new AuthService(usuarioRepository, pacienteRepository, profesionalRepository, secretarioRepository, obraSocialRepository, consentimientoRepository, passwordEncoder, authenticationManager, jwtTokenProvider);

        usuarioActivo = Usuario.builder()
                .id(1L).nombreCompleto("Juan Perez").email("juan@test.com")
                .password("encoded-pass").tipoUsuario(TipoUsuario.PACIENTE)
                .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();

        usuarioInactivo = Usuario.builder()
                .id(2L).nombreCompleto("Inactivo").email("inactivo@test.com")
                .password("encoded-pass").tipoUsuario(TipoUsuario.PACIENTE)
                .activo(false).fechaRegistro(LocalDateTime.now()).build();
    }

    @Test
    void login_conCredencialesValidas_deberiaRetornarToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("juan@test.com");
        request.setPassword("password123");

        when(usuarioRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(usuarioActivo));
        when(jwtTokenProvider.generarToken(1L, "juan@test.com", "PACIENTE", null)).thenReturn("mock-token");

        AuthResponse response = service.login(request);

        assertThat(response.getToken()).isEqualTo("mock-token");
        assertThat(response.getEmail()).isEqualTo("juan@test.com");
        assertThat(response.getTipoUsuario()).isEqualTo("PACIENTE");
        assertThat(response.getNombreCompleto()).isEqualTo("Juan Perez");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_conEmailIncorrecto_deberiaLanzarExcepcion() {
        LoginRequest request = new LoginRequest();
        request.setEmail("noexiste@test.com");
        request.setPassword("pass");

        when(usuarioRepository.findByEmail("noexiste@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void login_conUsuarioInactivo_deberiaLanzarExcepcion() {
        LoginRequest request = new LoginRequest();
        request.setEmail("inactivo@test.com");
        request.setPassword("pass");

        when(usuarioRepository.findByEmail("inactivo@test.com")).thenReturn(Optional.of(usuarioInactivo));

        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(SolicitudInvalidaException.class)
                .hasMessageContaining("desactivado");
    }

    @Test
    void login_conCredencialesInvalidas_deberiaLanzarExcepcion() {
        LoginRequest request = new LoginRequest();
        request.setEmail("juan@test.com");
        request.setPassword("wrong-pass");

        doThrow(BadCredentialsException.class).when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void register_pacienteConConsentimiento_deberiaCrearUsuarioYPaciente() {
        RegistroRequest request = new RegistroRequest();
        request.setNombreCompleto("Nuevo Paciente");
        request.setEmail("nuevo@test.com");
        request.setPassword("password123");
        request.setTipoUsuario("PACIENTE");
        request.setConsentimientoAceptado(true);
        request.setNumDocumento("12345678");

        when(usuarioRepository.existsByEmail("nuevo@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-pass");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(
                Usuario.builder().id(3L).nombreCompleto("Nuevo Paciente").email("nuevo@test.com")
                        .password("encoded-pass").tipoUsuario(TipoUsuario.PACIENTE)
                        .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build()
        );
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(
                Paciente.builder().id(1L).consentimientoOk(true).build()
        );
        when(jwtTokenProvider.generarToken(anyLong(), anyString(), anyString(), any())).thenReturn("mock-token");

        AuthResponse response = service.register(request);

        assertThat(response.getToken()).isEqualTo("mock-token");
        verify(pacienteRepository).save(any(Paciente.class));
        verify(consentimientoRepository).save(any(Consentimiento.class));
    }

    @Test
    void register_pacienteSinConsentimiento_deberiaCrearSinConsentimiento() {
        RegistroRequest request = new RegistroRequest();
        request.setNombreCompleto("Paciente");
        request.setEmail("paciente@test.com");
        request.setPassword("pass");
        request.setTipoUsuario("PACIENTE");
        request.setConsentimientoAceptado(false);

        when(usuarioRepository.existsByEmail("paciente@test.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(
                Usuario.builder().id(4L).nombreCompleto("Paciente").email("paciente@test.com")
                        .password("encoded").tipoUsuario(TipoUsuario.PACIENTE)
                        .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build()
        );
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(Paciente.builder().id(2L).consentimientoOk(false).build());
        when(jwtTokenProvider.generarToken(anyLong(), anyString(), anyString(), any())).thenReturn("mock-token");

        AuthResponse response = service.register(request);

        assertThat(response.getToken()).isEqualTo("mock-token");
        verify(consentimientoRepository, never()).save(any(Consentimiento.class));
    }

    @Test
    void register_profesional_deberiaCrearUsuarioYProfesional() {
        RegistroRequest request = new RegistroRequest();
        request.setNombreCompleto("Dra. Lopez");
        request.setEmail("lopez@test.com");
        request.setPassword("pass");
        request.setTipoUsuario("PROFESIONAL");
        request.setTipoProfesional("PSICOLOGO");
        request.setEspecialidad("Psicologia Clinica");
        request.setNumeroLicencia("LIC-12345");

        when(usuarioRepository.existsByEmail("lopez@test.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(
                Usuario.builder().id(5L).nombreCompleto("Dra. Lopez").email("lopez@test.com")
                        .password("encoded").tipoUsuario(TipoUsuario.PROFESIONAL)
                        .tipoProfesional(com.sistemasalud.enums.TipoProfesional.PSICOLOGO)
                        .especialidad("Psicologia Clinica").numeroLicencia("LIC-12345")
                        .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build()
        );
        when(profesionalRepository.save(any(Profesional.class))).thenReturn(Profesional.builder().id(1L).build());
        when(jwtTokenProvider.generarToken(anyLong(), anyString(), anyString(), any())).thenReturn("mock-token");

        AuthResponse response = service.register(request);

        assertThat(response.getToken()).isEqualTo("mock-token");
        verify(profesionalRepository).save(any(Profesional.class));
        verify(pacienteRepository, never()).save(any());
    }

    @Test
    void register_secretario_deberiaCrearUsuarioYSecretario() {
        RegistroRequest request = new RegistroRequest();
        request.setNombreCompleto("Sec. Gomez");
        request.setEmail("gomez@test.com");
        request.setPassword("pass");
        request.setTipoUsuario("SECRETARIO");

        when(usuarioRepository.existsByEmail("gomez@test.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(
                Usuario.builder().id(6L).nombreCompleto("Sec. Gomez").email("gomez@test.com")
                        .password("encoded").tipoUsuario(TipoUsuario.SECRETARIO)
                        .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build()
        );
        when(secretarioRepository.save(any(Secretario.class))).thenReturn(Secretario.builder().id(1L).build());
        when(jwtTokenProvider.generarToken(anyLong(), anyString(), anyString(), any())).thenReturn("mock-token");

        AuthResponse response = service.register(request);

        assertThat(response.getToken()).isEqualTo("mock-token");
        verify(secretarioRepository).save(any(Secretario.class));
    }

    @Test
    void register_emailDuplicado_deberiaLanzarExcepcion() {
        RegistroRequest request = new RegistroRequest();
        request.setEmail("existente@test.com");
        request.setTipoUsuario("PACIENTE");

        when(usuarioRepository.existsByEmail("existente@test.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(SolicitudInvalidaException.class)
                .hasMessageContaining("email ya esta registrado");
    }

    @Test
    void login_conPaciente_deberiaIncluirDatosPaciente() {
        LoginRequest request = new LoginRequest();
        request.setEmail("juan@test.com");
        request.setPassword("password123");

        when(usuarioRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(usuarioActivo));
        when(jwtTokenProvider.generarToken(1L, "juan@test.com", "PACIENTE", null)).thenReturn("mock-token");
        when(pacienteRepository.findByUsuarioId(1L)).thenReturn(Optional.of(
                Paciente.builder().id(1L).consentimientoOk(true).build()
        ));

        AuthResponse response = service.login(request);

        assertThat(response.getIdPaciente()).isEqualTo(1L);
        assertThat(response.isConsentimientoOk()).isTrue();
    }
}