package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.sistemasalud.entity.HistoriaClinica;
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {
    List<HistoriaClinica> findByPacienteIdOrderByFechaCreacionDesc(Long pacienteId);
    List<HistoriaClinica> findBySolicitudIdOrderByFechaCreacionDesc(Long solicitudId);

    @Query("SELECT hc FROM HistoriaClinica hc " +
           "JOIN FETCH hc.paciente p JOIN FETCH p.usuario " +
           "JOIN FETCH hc.profesional pr JOIN FETCH pr.usuario " +
           "JOIN FETCH hc.solicitud s " +
           "WHERE p.id = :pacienteId ORDER BY hc.fechaCreacion DESC")
    List<HistoriaClinica> findByPacienteIdConRelaciones(@Param("pacienteId") Long pacienteId);
}
