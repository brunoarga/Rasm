package com.sistemasalud.security;

import com.sistemasalud.entity.Usuario;
import com.sistemasalud.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UsuarioRepository usuarioRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = getTokenFromRequest(request);
        if (StringUtils.hasText(token) && jwtTokenProvider.validarToken(token)) {
            Long idUsuario = jwtTokenProvider.getIdUsuarioFromToken(token);
            Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
            if (usuario != null && Boolean.TRUE.equals(usuario.getActivo())) {
                UserPrincipal userPrincipal = UserPrincipal.builder()
                        .id(idUsuario)
                        .email(jwtTokenProvider.getEmailFromToken(token))
                        .tipoUsuario(jwtTokenProvider.getTipoUsuarioFromToken(token))
                        .tipoProfesional(jwtTokenProvider.getTipoProfesionalFromToken(token))
                        .build();
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) return bearerToken.substring(7);
        return null;
    }
}
