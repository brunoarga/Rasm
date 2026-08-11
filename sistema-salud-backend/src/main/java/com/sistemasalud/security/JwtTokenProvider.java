package com.sistemasalud.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-milliseconds}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generarToken(Long idUsuario, String email, String tipoUsuario, String tipoProfesional) {
        Date ahora = new Date();
        return Jwts.builder().subject(email)
                .claim("idUsuario", idUsuario).claim("tipoUsuario", tipoUsuario)
                .claim("tipoProfesional", tipoProfesional)
                .issuedAt(ahora).expiration(new Date(ahora.getTime() + expirationMs))
                .signWith(key).compact();
    }

    public String getEmailFromToken(String token) { return getClaims(token).getSubject(); }
    public Long getIdUsuarioFromToken(String token) { return getClaims(token).get("idUsuario", Long.class); }
    public String getTipoUsuarioFromToken(String token) { return getClaims(token).get("tipoUsuario", String.class); }
    public String getTipoProfesionalFromToken(String token) { return getClaims(token).get("tipoProfesional", String.class); }
    public boolean validarToken(String token) { try { getClaims(token); return true; } catch (Exception e) { return false; } }
    private Claims getClaims(String token) { return Jwts.parser().verifyWith(key).build().parseClaimsJws(token).getBody(); }
}
