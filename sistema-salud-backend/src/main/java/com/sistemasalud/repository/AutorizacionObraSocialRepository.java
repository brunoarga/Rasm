package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.AutorizacionObraSocial;
public interface AutorizacionObraSocialRepository extends JpaRepository<AutorizacionObraSocial, Long> {
    List<AutorizacionObraSocial> findByCitaId(Long citaId);
    List<AutorizacionObraSocial> findByEstado(String estado);
}
