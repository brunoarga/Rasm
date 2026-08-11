package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.sistemasalud.entity.CentroSalud;
public interface CentroSaludRepository extends JpaRepository<CentroSalud, Long> {
    List<CentroSalud> findByActivoTrue();
    List<CentroSalud> findByEsPublicoTrueAndActivoTrue();
    @Query(value = "SELECT c.*, (6371 * ACOS(COS(RADIANS(:lat)) * COS(RADIANS(c.latitud)) * COS(RADIANS(c.longitud) - RADIANS(:lon)) + SIN(RADIANS(:lat)) * SIN(RADIANS(c.latitud)))) AS distancia FROM centro_salud c WHERE c.activo = true HAVING distancia <= :radio ORDER BY distancia", nativeQuery = true)
    List<CentroSalud> findCentrosCercanos(@Param("lat") Double lat, @Param("lon") Double lon, @Param("radio") Double radio);
}
