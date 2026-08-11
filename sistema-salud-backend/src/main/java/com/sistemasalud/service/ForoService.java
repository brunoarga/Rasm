package com.sistemasalud.service;

import com.sistemasalud.dto.request.CrearComentarioRequestDTO;
import com.sistemasalud.dto.request.CrearPostRequestDTO;
import com.sistemasalud.dto.response.ComentarioResponseDTO;
import com.sistemasalud.dto.response.PaginatedResponse;
import com.sistemasalud.dto.response.PostResponseDTO;
import com.sistemasalud.entity.Comentario;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.Post;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.ComentarioRepository;
import com.sistemasalud.repository.PacienteRepository;
import com.sistemasalud.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class ForoService {

    private final PostRepository postRepository;
    private final ComentarioRepository comentarioRepository;
    private final PacienteRepository pacienteRepository;

    @Transactional(readOnly = true)
    public PaginatedResponse<PostResponseDTO> listar(String categoria, int page, int size) {
        int pageReal = Math.max(page, 0);
        int sizeReal = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(pageReal, sizeReal, Sort.by(Sort.Direction.DESC, "fechaCreacion"));
        Page<Post> resultado = (categoria != null && !categoria.isBlank())
                ? postRepository.findByCategoriaIgnoreCase(categoria.trim(), pageable)
                : postRepository.findAll(pageable);

        List<PostResponseDTO> items = resultado.getContent().stream().map(this::toPostResponse).toList();
        return PaginatedResponse.<PostResponseDTO>builder()
                .content(items)
                .page(resultado.getNumber())
                .size(resultado.getSize())
                .totalElements(resultado.getTotalElements())
                .totalPages(resultado.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public PostResponseDTO detalle(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Publicación no encontrada con ID: " + id));
        PostResponseDTO dto = toPostResponse(post);
        dto.setComentarios(comentarioRepository.findByPostIdOrderByFechaCreacionAsc(id).stream()
                .map(this::toComentarioResponse).toList());
        return dto;
    }

    @Transactional
    public PostResponseDTO crear(Long idUsuario, CrearPostRequestDTO dto) {
        Paciente paciente = pacienteRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        Post post = Post.builder()
                .titulo(dto.getTitulo().trim())
                .contenido(dto.getContenido().trim())
                .categoria(dto.getCategoria().trim())
                .esAnonimo(Boolean.TRUE.equals(dto.getEsAnonimo()))
                .fechaCreacion(LocalDateTime.now())
                .usuario(paciente)
                .cantidadApoyos(0)
                .build();
        return toPostResponse(postRepository.save(post));
    }

    @Transactional
    public PostResponseDTO apoyar(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Publicación no encontrada con ID: " + id));
        int actuales = post.getCantidadApoyos() != null ? post.getCantidadApoyos() : 0;
        post.setCantidadApoyos(actuales + 1);
        return toPostResponse(postRepository.save(post));
    }

    @Transactional
    public ComentarioResponseDTO comentar(Long postId, Long idUsuario, CrearComentarioRequestDTO dto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Publicación no encontrada con ID: " + postId));
        Paciente paciente = pacienteRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        Comentario comentario = Comentario.builder()
                .contenido(dto.getContenido().trim())
                .fechaCreacion(LocalDateTime.now())
                .esAnonimo(Boolean.TRUE.equals(dto.getEsAnonimo()))
                .post(post)
                .usuario(paciente)
                .build();
        return toComentarioResponse(comentarioRepository.save(comentario));
    }

    private PostResponseDTO toPostResponse(Post post) {
        boolean anonimo = Boolean.TRUE.equals(post.getEsAnonimo());
        return PostResponseDTO.builder()
                .id(post.getId())
                .titulo(post.getTitulo())
                .contenido(post.getContenido())
                .fechaCreacion(post.getFechaCreacion())
                .autorNombre(nombreAutor(post.getUsuario(), anonimo))
                .autorAvatar(fotoPerfil(post.getUsuario(), anonimo))
                .categoria(post.getCategoria())
                .cantidadComentarios(comentarioRepository.countByPostId(post.getId()))
                .cantidadApoyos(post.getCantidadApoyos() != null ? post.getCantidadApoyos() : 0)
                .build();
    }

    private ComentarioResponseDTO toComentarioResponse(Comentario comentario) {
        boolean anonimo = Boolean.TRUE.equals(comentario.getEsAnonimo());
        return ComentarioResponseDTO.builder()
                .id(comentario.getId())
                .contenido(comentario.getContenido())
                .fechaCreacion(comentario.getFechaCreacion())
                .autorNombre(nombreAutor(comentario.getUsuario(), anonimo))
                .autorAvatar(fotoPerfil(comentario.getUsuario(), anonimo))
                .build();
    }

    private String fotoPerfil(Paciente paciente, boolean esAnonimo) {
        if (esAnonimo || paciente == null || paciente.getUsuario() == null
                || paciente.getUsuario().getFotoPerfil() == null) {
            return null;
        }
        String foto = paciente.getUsuario().getFotoPerfil().trim();
        return foto.isEmpty() ? null : foto;
    }

    private String nombreAutor(Paciente paciente, boolean esAnonimo) {
        if (esAnonimo || paciente == null || paciente.getUsuario() == null
                || paciente.getUsuario().getNombreCompleto() == null) {
            return "Anónimo";
        }
        String nombreCompleto = paciente.getUsuario().getNombreCompleto().trim();
        if (nombreCompleto.isEmpty()) return "Anónimo";
        String[] partes = nombreCompleto.split("\\s+");
        if (partes.length == 1) return partes[0];
        String apellidoInicial = partes[partes.length - 1].substring(0, 1).toUpperCase() + ".";
        return partes[0] + " " + apellidoInicial;
    }
}
