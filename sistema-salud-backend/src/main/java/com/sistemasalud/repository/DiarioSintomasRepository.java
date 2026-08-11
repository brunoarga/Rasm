package com.sistemasalud.repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.DiarioSintomas;
public interface DiarioSintomasRepository extends JpaRepository<DiarioSintomas, Long> {
    List<DiarioSintomas> findByPacienteIdOrderByFechaDesc(Long pacienteId);
    Optional<DiarioSintomas> findByPacienteIdAndFecha(Long pacienteId, LocalDate fecha);
    Optional<DiarioSintomas> findByIdAndPacienteId(Long id, Long pacienteId);
}
