package com.sistemasalud.repository;
import com.sistemasalud.entity.DisponibilidadProfesional;
import com.sistemasalud.enums.DiaSemana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface DisponibilidadProfesionalRepository extends JpaRepository<DisponibilidadProfesional, Long> {
    List<DisponibilidadProfesional> findByProfesionalIdAndActivaTrue(Long profesionalId);
    @Query("SELECT d FROM DisponibilidadProfesional d WHERE d.centroSalud.id = :idCentro AND d.diaSemana = :dia AND d.activa = true ORDER BY d.horaInicio")
    List<DisponibilidadProfesional> findDisponiblesPorCentroYDia(@Param("idCentro") Long idCentro, @Param("dia") DiaSemana dia);
    List<DisponibilidadProfesional> findByCentroSaludIdAndActivaTrue(Long centroSaludId);
}
