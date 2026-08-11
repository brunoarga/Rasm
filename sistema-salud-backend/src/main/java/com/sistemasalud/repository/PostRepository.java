package com.sistemasalud.repository;

import com.sistemasalud.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCategoriaIgnoreCase(String categoria, Pageable pageable);
}
