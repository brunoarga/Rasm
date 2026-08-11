package com.sistemasalud.service;

import com.sistemasalud.dto.request.LoginRequest;
import com.sistemasalud.dto.request.RegistroRequest;
import com.sistemasalud.dto.response.AuthResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.TipoProfesional;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.ConsentimientoRequeridoException;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.exception.SolicitudInvalidaException;
import com.sistemasalud.repository.*;
import com.sistemasalud.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfesionalRepository profesionalRepository;
    private final SecretarioRepository secretarioRepository;
    private final ObraSocialRepository obraSocialRepository;
    private final ConsentimientoRepository consentimientoRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        if (!usuario.getActivo()) throw new SolicitudInvalidaException("Usuario desactivado");
        String token = jwtTokenProvider.generarToken(usuario.getId(), usuario.getEmail(), usuario.getTipoUsuario().name(), usuario.getTipoProfesional() != null ? usuario.getTipoProfesional().name() : null);
        return buildAuthResponse(usuario, token);
    }

    @Transactional
    public AuthResponse register(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) throw new SolicitudInvalidaException("El email ya esta registrado");
        Usuario usuario = Usuario.builder().nombreCompleto(request.getNombreCompleto()).email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())).telefono(request.getTelefono())
                .direccion(request.getDireccion()).latitud(request.getLatitud()).longitud(request.getLongitud())
                .tipoUsuario(TipoUsuario.valueOf(request.getTipoUsuario())).activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
        if ("PROFESIONAL".equals(request.getTipoUsuario())) {
            usuario.setTipoProfesional(TipoProfesional.valueOf(request.getTipoProfesional()));
            usuario.setEspecialidad(request.getEspecialidad());
            usuario.setNumeroLicencia(request.getNumeroLicencia());
        }
        usuario = usuarioRepository.save(usuario);
        if ("PACIENTE".equals(request.getTipoUsuario())) {
            ObraSocial os = request.getIdObraSocial() != null ? obraSocialRepository.findById(request.getIdObraSocial()).orElse(null) : null;
            Paciente paciente = Paciente.builder().usuario(usuario)
                    .fechaNacimiento(request.getFechaNacimiento() != null ? LocalDate.parse(request.getFechaNacimiento()) : null)
                    .tipoDocumento(request.getTipoDocumento()).numDocumento(request.getNumDocumento())
                    .obraSocial(os).numeroAfiliado(request.getNumeroAfiliado()).planCobertura(request.getPlanCobertura())
                    .consentimientoOk(Boolean.TRUE.equals(request.getConsentimientoAceptado()))
                    .fechaConsentimiento(Boolean.TRUE.equals(request.getConsentimientoAceptado()) ? LocalDate.now() : null).build();
            pacienteRepository.save(paciente);
            if (Boolean.TRUE.equals(request.getConsentimientoAceptado()))
                consentimientoRepository.save(Consentimiento.builder().paciente(paciente).version("1.0").aceptado(true).fechaAceptacion(LocalDateTime.now()).build());
        }
        if ("PROFESIONAL".equals(request.getTipoUsuario())) profesionalRepository.save(Profesional.builder().usuario(usuario).build());
        if ("SECRETARIO".equals(request.getTipoUsuario())) secretarioRepository.save(Secretario.builder().usuario(usuario).build());
        String token = jwtTokenProvider.generarToken(usuario.getId(), usuario.getEmail(), usuario.getTipoUsuario().name(), usuario.getTipoProfesional() != null ? usuario.getTipoProfesional().name() : null);
        return buildAuthResponse(usuario, token);
    }

    private AuthResponse buildAuthResponse(Usuario usuario, String token) {
        AuthResponse r = AuthResponse.builder().token(token).idUsuario(usuario.getId()).nombreCompleto(usuario.getNombreCompleto()).email(usuario.getEmail()).tipoUsuario(usuario.getTipoUsuario().name()).tipoProfesional(usuario.getTipoProfesional() != null ? usuario.getTipoProfesional().name() : null).build();
        if (usuario.getTipoUsuario() == TipoUsuario.PACIENTE) pacienteRepository.findByUsuarioId(usuario.getId()).ifPresent(p -> { r.setIdPaciente(p.getId()); r.setConsentimientoOk(Boolean.TRUE.equals(p.getConsentimientoOk())); });
        else if (usuario.getTipoUsuario() == TipoUsuario.PROFESIONAL) profesionalRepository.findByUsuarioId(usuario.getId()).ifPresent(p -> r.setIdProfesional(p.getId()));
        else if (usuario.getTipoUsuario() == TipoUsuario.SECRETARIO) secretarioRepository.findByUsuarioId(usuario.getId()).ifPresent(s -> r.setIdSecretario(s.getId()));
        return r;
    }
}
