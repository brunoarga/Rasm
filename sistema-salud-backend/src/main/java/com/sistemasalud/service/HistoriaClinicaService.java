package com.sistemasalud.service;

import com.sistemasalud.dto.request.HistoriaClinicaRequest;
import com.sistemasalud.entity.*;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class HistoriaClinicaService {
    private final HistoriaClinicaRepository historiaClinicaRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfesionalRepository profesionalRepository;
    private final SolicitudRepository solicitudRepository;

    @Transactional
    public HistoriaClinica crearRegistro(HistoriaClinicaRequest req, Long idUserProf) {
        if (req.getIdPaciente() == null) {
            throw new IllegalArgumentException("El campo 'idPaciente' es obligatorio");
        }
        if (req.getIdSolicitud() == null) {
            throw new IllegalArgumentException("El campo 'idSolicitud' es obligatorio");
        }
        if (req.getDiagnostico() == null && req.getTratamiento() == null && req.getObservaciones() == null) {
            throw new IllegalArgumentException("Debe enviar al menos un campo: diagnostico, tratamiento u observaciones");
        }

        Paciente p = pacienteRepository.findById(req.getIdPaciente())
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con ID: " + req.getIdPaciente()));
        Profesional prof = profesionalRepository.findByUsuarioId(idUserProf)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado para el usuario: " + idUserProf));
        Solicitud sol = solicitudRepository.findById(req.getIdSolicitud())
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada con ID: " + req.getIdSolicitud()));

        LocalDateTime ahora = LocalDateTime.now();
        HistoriaClinica hc = HistoriaClinica.builder()
                .paciente(p).profesional(prof).solicitud(sol)
                .diagnostico(req.getDiagnostico())
                .tratamiento(req.getTratamiento())
                .observaciones(req.getObservaciones())
                .tipoPlantilla(req.getTipoPlantilla())
                .fechaCreacion(ahora)
                .fechaActualizacion(ahora)
                .build();

        return historiaClinicaRepository.save(hc);
    }

    public List<HistoriaClinica> obtenerHistorialPaciente(Long id) {
        if (id == null) throw new IllegalArgumentException("El id del paciente es obligatorio");
        return historiaClinicaRepository.findByPacienteIdOrderByFechaCreacionDesc(id);
    }

    public List<HistoriaClinica> obtenerHistorialSolicitud(Long id) {
        if (id == null) throw new IllegalArgumentException("El id de la solicitud es obligatorio");
        return historiaClinicaRepository.findBySolicitudIdOrderByFechaCreacionDesc(id);
    }

    @Transactional
    public void eliminarRegistro(Long id) {
        HistoriaClinica hc = historiaClinicaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Registro de historia clínica no encontrado con ID: " + id));
        historiaClinicaRepository.delete(hc);
    }
}
