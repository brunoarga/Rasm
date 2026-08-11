package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.ObraSocial;
public interface ObraSocialRepository extends JpaRepository<ObraSocial, Long> {
    List<ObraSocial> findByActivaTrue();
}
