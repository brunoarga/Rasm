package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.sistemasalud.entity.CentroObraSocialPractica;
import com.sistemasalud.enums.TipoPractica;
public interface CentroObraSocialPracticaRepository extends JpaRepository<CentroObraSocialPractica, Long> {
    List<CentroObraSocialPractica> findByObraSocialIdAndTipoPracticaAndActivoTrue(Long obraSocialId, TipoPractica tipoPractica);
}
