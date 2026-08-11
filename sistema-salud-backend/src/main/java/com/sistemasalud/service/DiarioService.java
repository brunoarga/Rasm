package com.sistemasalud.service;

import com.sistemasalud.dto.request.DiarioRequest;
import com.sistemasalud.dto.response.DiarioResponse;
import com.sistemasalud.entity.DiarioSintomas;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.DiarioSintomasRepository;
import com.sistemasalud.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service @RequiredArgsConstructor
public class DiarioService {

    private final DiarioSintomasRepository diarioRepo;
    private final PacienteRepository pacienteRepo;

    private DiarioResponse toResponse(DiarioSintomas e) {
        return DiarioResponse.builder()
                .id(e.getId())
                .fecha(e.getFecha())
                .estadoAnimo(e.getEstadoAnimo())
                .sintomasTexto(e.getSintomasTexto())
                .intensidadDolor(e.getIntensidadDolor())
                .horasSuenio(e.getHorasSuenio())
                .medicacionTomada(e.getMedicacionTomada())
                .observaciones(e.getObservaciones())
                .build();
    }

    @Transactional
    public DiarioResponse crear(Long idUsuario, DiarioRequest r) {
        Paciente p = pacienteRepo.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        DiarioSintomas e = DiarioSintomas.builder()
                .paciente(p).fecha(LocalDate.now())
                .estadoAnimo(r.getEstadoAnimo())
                .sintomasTexto(r.getSintomasTexto())
                .intensidadDolor(r.getIntensidadDolor())
                .horasSuenio(r.getHorasSuenio())
                .medicacionTomada(r.getMedicacionTomada())
                .observaciones(r.getObservaciones())
                .build();
        return toResponse(diarioRepo.save(e));
    }

    @Transactional(readOnly = true)
    public List<DiarioResponse> obtener(Long idUsuario) {
        Paciente p = pacienteRepo.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        return diarioRepo.findByPacienteIdOrderByFechaDesc(p.getId()).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public void eliminar(Long idUsuario, Long id) {
        Paciente p = pacienteRepo.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        DiarioSintomas e = diarioRepo.findByIdAndPacienteId(id, p.getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Registro no encontrado"));
        diarioRepo.delete(e);
    }
}
