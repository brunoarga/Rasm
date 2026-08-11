package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.HistoriaClinica;
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {
    List<HistoriaClinica> findByPacienteIdOrderByFechaCreacionDesc(Long pacienteId);
    List<HistoriaClinica> findBySolicitudIdOrderByFechaCreacionDesc(Long solicitudId);
}
