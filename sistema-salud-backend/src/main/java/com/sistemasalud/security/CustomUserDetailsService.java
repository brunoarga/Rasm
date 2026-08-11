package com.sistemasalud.security;

import com.sistemasalud.entity.Usuario;
import com.sistemasalud.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        return UserPrincipal.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .password(usuario.getPassword())
                .tipoUsuario(usuario.getTipoUsuario().name())
                .tipoProfesional(usuario.getTipoProfesional() != null ? usuario.getTipoProfesional().name() : null)
                .build();
    }
}
