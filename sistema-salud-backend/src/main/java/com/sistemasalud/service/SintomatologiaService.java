package com.sistemasalud.service;

import com.sistemasalud.dto.request.RegistroSintomatologiaRequest;
import com.sistemasalud.dto.response.SintomatologiaResponse;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.RegistroSintomatologia;
import com.sistemasalud.exception.AccesoDenegadoException;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.PacienteRepository;
import com.sistemasalud.repository.RegistroSintomatologiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service @RequiredArgsConstructor
public class SintomatologiaService {
    private final RegistroSintomatologiaRepository repo;
    private final PacienteRepository pacienteRepo;

    private SintomatologiaResponse toResponse(RegistroSintomatologia e) {
        return SintomatologiaResponse.builder()
                .id(e.getId())
                .idPaciente(e.getPaciente().getId())
                .fecha(e.getFecha())
                .calidadSuenio(e.getCalidadSuenio())
                .estresAnsiedad(e.getEstresAnsiedad())
                .adherencia(e.getAdherencia())
                .notas(e.getNotas())
                .build();
    }

    @Transactional
    public SintomatologiaResponse guardar(Long idUsuario, RegistroSintomatologiaRequest r) {
        Paciente p = pacienteRepo.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        RegistroSintomatologia e = RegistroSintomatologia.builder()
                .paciente(p).fecha(LocalDate.now())
                .calidadSuenio(r.getCalidadSuenio())
                .estresAnsiedad(r.getEstresAnsiedad())
                .adherencia(r.getAdherencia())
                .notas(r.getNotas())
                .build();
        return toResponse(repo.save(e));
    }

    @Transactional
    public void eliminar(Long id, Long idUsuario) {
        Paciente p = pacienteRepo.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        int afectados = repo.eliminarPorIdYPaciente(id, p.getId());
        if (afectados == 0) {
            boolean existe = repo.existsById(id);
            if (!existe)
                throw new RecursoNoEncontradoException("Registro no encontrado");
            throw new AccesoDenegadoException("No puedes eliminar un registro que no te pertenece");
        }
    }

    @Transactional(readOnly = true)
    public List<SintomatologiaResponse> historial(Long idUsuario) {
        Paciente p = pacienteRepo.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        return repo.findByPacienteIdOrderByFechaDesc(p.getId()).stream()
                .map(this::toResponse).toList();
    }
}
