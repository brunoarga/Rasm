package com.sistemasalud.repository;

import com.sistemasalud.entity.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByConversacionIdOrderByFechaEnvioAsc(Long conversacionId);

    Optional<Mensaje> findTopByConversacionIdOrderByFechaEnvioDesc(Long conversacionId);

    long countByConversacionIdAndLeidoFalseAndEmisorIdNot(Long conversacionId, Long emisorId);

    @Modifying
    @Query("update Mensaje m set m.leido = true where m.conversacion.id = :conversacionId and m.emisor.id <> :emisorId and m.leido = false")
    void marcarConversacionLeida(@Param("conversacionId") Long conversacionId, @Param("emisorId") Long emisorId);

    @Query("select count(m) from Mensaje m where m.leido = false and m.emisor.id <> :idUsuario and " +
            "(m.conversacion.solicitud.paciente.usuario.id = :idUsuario or m.conversacion.solicitud.profesional.usuario.id = :idUsuario)")
    long contarNoLeidos(@Param("idUsuario") Long idUsuario);
}
