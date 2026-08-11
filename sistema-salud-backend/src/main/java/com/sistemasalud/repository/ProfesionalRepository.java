package com.sistemasalud.repository;
import java.util.List;
import java.util.Optional;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.sistemasalud.entity.Profesional;
public interface ProfesionalRepository extends JpaRepository<Profesional, Long> {
    @Query("SELECT p FROM Profesional p JOIN FETCH p.usuario LEFT JOIN FETCH p.centroSalud")
    List<Profesional> findAllWithUsuario();
    Optional<Profesional> findByUsuarioId(Long usuarioId);
    List<Profesional> findByUsuarioTipoProfesional(String tipoProfesional);
    @Query("SELECT p FROM Profesional p JOIN FETCH p.usuario LEFT JOIN FETCH p.centroSalud WHERE p.centroSalud.id = :idCentro")
    List<Profesional> findByCentroSaludId(@Param("idCentro") Long idCentro);
}
