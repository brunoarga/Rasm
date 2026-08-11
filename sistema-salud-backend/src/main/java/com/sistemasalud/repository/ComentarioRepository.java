package com.sistemasalud.repository;

import com.sistemasalud.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    long countByPostId(Long postId);
    List<Comentario> findByPostIdOrderByFechaCreacionAsc(Long postId);
}
