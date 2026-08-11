package com.sistemasalud.repository;

import com.sistemasalud.entity.RegistroSintomatologia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RegistroSintomatologiaRepository extends JpaRepository<RegistroSintomatologia, Long> {
    List<RegistroSintomatologia> findByPacienteIdOrderByFechaDesc(Long pacienteId);
    Optional<RegistroSintomatologia> findByPacienteIdAndFecha(Long pacienteId, LocalDate fecha);
    @Modifying @Query("DELETE FROM RegistroSintomatologia r WHERE r.id = :id AND r.paciente.id = :pacienteId")
    int eliminarPorIdYPaciente(@Param("id") Long id, @Param("pacienteId") Long pacienteId);
}
