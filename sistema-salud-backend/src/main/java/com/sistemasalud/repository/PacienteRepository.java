package com.sistemasalud.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.sistemasalud.entity.Paciente;
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByUsuarioId(Long usuarioId);
    Optional<Paciente> findByNumDocumento(String numDocumento);
    boolean existsByNumDocumento(String numDocumento);
    @Query("SELECT p FROM Paciente p JOIN FETCH p.usuario LEFT JOIN FETCH p.obraSocial")
    List<Paciente> findAllWithUsuario();
    long countByObraSocialIsNull();
    long countByObraSocialNotNull();
    long countByUsuarioActivoTrue();
}
