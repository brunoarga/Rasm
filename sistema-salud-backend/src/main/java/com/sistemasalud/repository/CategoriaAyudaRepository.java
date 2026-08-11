package com.sistemasalud.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistemasalud.entity.CategoriaAyuda;
public interface CategoriaAyudaRepository extends JpaRepository<CategoriaAyuda, Long> {
    List<CategoriaAyuda> findByActivaTrue();
}
