package com.sistemasalud.repository;

import com.sistemasalud.entity.AlertaDemora;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertaDemoraRepository extends JpaRepository<AlertaDemora, Long> {
    List<AlertaDemora> findByEstado(String estado);
    List<AlertaDemora> findBySolicitudIdAndEstado(Long solicitudId, String estado);
    boolean existsBySolicitudIdAndEstado(Long solicitudId, String estado);
}
