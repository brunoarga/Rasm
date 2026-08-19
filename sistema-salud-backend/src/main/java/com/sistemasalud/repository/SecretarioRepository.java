package com.sistemasalud.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.Secretario;
public interface SecretarioRepository extends JpaRepository<Secretario, Long> {
    Optional<Secretario> findByUsuarioId(Long usuarioId);
    List<Secretario> findByCentroSaludId(Long centroSaludId);
}