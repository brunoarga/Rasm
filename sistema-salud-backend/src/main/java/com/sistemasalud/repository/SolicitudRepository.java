package com.sistemasalud.repository;
import java.util.List;
import java.util.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.Prioridad;
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    List<Solicitud> findByPacienteIdOrderByFechaCreacionDesc(Long pacienteId);
    Page<Solicitud> findByPacienteIdOrderByFechaCreacionDesc(Long pacienteId, Pageable pageable);
    List<Solicitud> findByProfesionalIdOrderByFechaCreacionDesc(Long profesionalId);
    Page<Solicitud> findByProfesionalIdOrderByFechaCreacionDesc(Long profesionalId, Pageable pageable);
    List<Solicitud> findByEstadoAndActivaTrueOrderByFechaCreacionDesc(EstadoSolicitud estado);
    List<Solicitud> findByEstadoInAndActivaTrueOrderByFechaCreacionDesc(Collection<EstadoSolicitud> estados);
    Page<Solicitud> findByEstadoInAndActivaTrueOrderByFechaCreacionDesc(Collection<EstadoSolicitud> estados, Pageable pageable);
    List<Solicitud> findByEstadoAndPrioridadAndActivaTrueOrderByFechaCreacionDesc(EstadoSolicitud estado, Prioridad prioridad);
    long countByEstado(EstadoSolicitud estado);
    long countByPrioridad(Prioridad prioridad);
    List<Solicitud> findByCentroSaludIdOrderByFechaCreacionDesc(Long centroSaludId);
    List<Solicitud> findByCentroSaludIdAndEstadoInOrderByFechaCreacionDesc(Long centroSaludId, Collection<EstadoSolicitud> estados);
}
