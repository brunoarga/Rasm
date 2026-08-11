package com.sistemasalud.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.Usuario;
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Boolean existsByEmail(String email);
}
