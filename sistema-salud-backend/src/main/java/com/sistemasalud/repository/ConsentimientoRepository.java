package com.sistemasalud.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.Consentimiento;
public interface ConsentimientoRepository extends JpaRepository<Consentimiento, Long> {
    Optional<Consentimiento> findTopByPacienteIdOrderByFechaAceptacionDesc(Long pacienteId);
}
