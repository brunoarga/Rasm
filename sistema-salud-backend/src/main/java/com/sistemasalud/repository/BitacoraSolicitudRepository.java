package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.BitacoraSolicitud;
public interface BitacoraSolicitudRepository extends JpaRepository<BitacoraSolicitud, Long> {
    List<BitacoraSolicitud> findBySolicitudIdOrderByFechaCreacionDesc(Long solicitudId);
}