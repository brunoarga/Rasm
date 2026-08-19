package com.sistemasalud.repository;

import com.sistemasalud.entity.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversacionRepository extends JpaRepository<Conversacion, Long> {
    Optional<Conversacion> findBySolicitudId(Long solicitudId);

    @Query("select c from Conversacion c join c.solicitud s join s.paciente p join p.usuario u " +
            "where u.id = :idUsuario order by coalesce(c.fechaUltimoMensaje, c.fechaCreacion) desc")
    List<Conversacion> findParaPaciente(@Param("idUsuario") Long idUsuario);

    @Query("select c from Conversacion c join c.solicitud s join s.profesional p join p.usuario u " +
            "where u.id = :idUsuario order by coalesce(c.fechaUltimoMensaje, c.fechaCreacion) desc")
    List<Conversacion> findParaProfesional(@Param("idUsuario") Long idUsuario);

    @Query("select c from Conversacion c join c.solicitud s join s.centroSalud cs " +
            "where cs.id = :idCentro order by coalesce(c.fechaUltimoMensaje, c.fechaCreacion) desc")
    List<Conversacion> findParaSecretarioCentro(@Param("idCentro") Long idCentro);

    @Query("select c from Conversacion c order by coalesce(c.fechaUltimoMensaje, c.fechaCreacion) desc")
    List<Conversacion> findParaCentral();
}
