package com.sistemasalud.repository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.Cita;
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findBySolicitudIdOrderByFechaHoraDesc(Long solicitudId);
    List<Cita> findByProfesionalIdAndFechaHoraBetweenOrderByFechaHoraAsc(Long profesionalId, LocalDateTime inicio, LocalDateTime fin);
    List<Cita> findBySolicitudPacienteIdOrderByFechaHoraDesc(Long pacienteId);
    List<Cita> findByProfesionalIdAndFechaHoraBetween(Long profesionalId, LocalDateTime inicio, LocalDateTime fin);
    List<Cita> findByCentroSaludIdAndFechaHoraBetweenOrderByFechaHoraAsc(Long centroSaludId, LocalDateTime inicio, LocalDateTime fin);
    List<Cita> findByCentroSaludId(Long centroSaludId);
    List<Cita> findByProfesionalIdAndEstadoOrderByFechaHoraDesc(Long profesionalId, String estado);
    List<Cita> findByEstadoAndFechaHoraBetween(String estado, LocalDateTime inicio, LocalDateTime fin);
}
