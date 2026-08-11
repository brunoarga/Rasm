package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.Seguimiento;
public interface SeguimientoRepository extends JpaRepository<Seguimiento, Long> {
    List<Seguimiento> findBySolicitudIdOrderByFechaCreacionDesc(Long solicitudId);
}
