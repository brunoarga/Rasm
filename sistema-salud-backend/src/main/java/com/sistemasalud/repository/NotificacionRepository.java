package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.Notificacion;
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioIdOrderByFechaEnvioDesc(Long usuarioId);
    List<Notificacion> findByUsuarioIdAndLeidaFalseOrderByFechaEnvioDesc(Long usuarioId);
    long countByUsuarioIdAndLeidaFalse(Long usuarioId);
}
