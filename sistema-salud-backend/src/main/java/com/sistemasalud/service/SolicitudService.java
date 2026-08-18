package com.sistemasalud.service;

import com.sistemasalud.dto.request.AsignarTurnoRequest;
import com.sistemasalud.dto.request.DerivacionRequest;
import com.sistemasalud.dto.request.SolicitudPresencialRequest;
import com.sistemasalud.dto.request.SolicitudRequest;
import com.sistemasalud.dto.response.PerfilPacienteSolicitudResponse;
import com.sistemasalud.dto.response.PerfilPacienteSolicitudResponse.ContactoEmergencia;
import com.sistemasalud.dto.response.PerfilPacienteSolicitudResponse.DatosPaciente;
import com.sistemasalud.dto.response.PerfilPacienteSolicitudResponse.DatosSolicitud;
import com.sistemasalud.dto.response.PerfilPacienteSolicitudResponse.EntradaDiario;
import com.sistemasalud.dto.response.SolicitudResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.*;
import com.sistemasalud.exception.*;
import com.sistemasalud.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service @RequiredArgsConstructor
public class SolicitudService {
    private final SolicitudRepository solicitudRepository;
    private final PacienteRepository pacienteRepository;
    private final ProfesionalRepository profesionalRepository;
    private final CategoriaAyudaRepository categoriaAyudaRepository;
    private final CentroSaludRepository centroSaludRepository;
    private final CentroObraSocialPracticaRepository centroObraSocialPracticaRepository;
    private final CitaRepository citaRepository;
    private final DiarioSintomasRepository diarioSintomasRepository;
    private final RegistroSintomatologiaRepository registroSintomatologiaRepository;
    private final NotificacionService notificacionService;
    private final MensajeService mensajeService;

    @Transactional
    public SolicitudResponse crearSolicitud(Long idUsuario, SolicitudRequest request) {
        Paciente paciente = pacienteRepository.findByUsuarioId(idUsuario).orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        if (!Boolean.TRUE.equals(paciente.getConsentimientoOk())) throw new ConsentimientoRequeridoException("Debe aceptar el consentimiento informado");
        Solicitud solicitud = crearSolicitudEntity(paciente, request.getIdCategoria(), request.getTitulo(), request.getDescripcion(),
                request.getResumenBreve(), request.getEsUrgente(), request.getNivelRiesgo(), request.getAnamnesis(), OrigenSolicitud.ONLINE);
        return mapToResponse(solicitud);
    }

    private Solicitud crearSolicitudEntity(Paciente paciente, Long idCategoria, String titulo, String descripcion,
                                                  String resumenBreve, Boolean esUrgente, String nivelRiesgo, String anamnesis,
                                                  OrigenSolicitud origen) {
        CategoriaAyuda categoria = categoriaAyudaRepository.findById(idCategoria).orElseThrow(() -> new RecursoNoEncontradoException("Categoria no encontrada"));

        Prioridad prioridad;
        if (nivelRiesgo != null) {
            prioridad = Prioridad.valueOf(nivelRiesgo);
        } else if (Boolean.TRUE.equals(esUrgente)) {
            prioridad = Prioridad.URGENTE;
        } else {
            prioridad = categoria.getPrioridad();
        }

        EstadoSolicitud estadoInicial = (prioridad == Prioridad.URGENTE) ? EstadoSolicitud.REVISADA : EstadoSolicitud.CREADA;
        Solicitud solicitud = solicitudRepository.save(Solicitud.builder()
                .paciente(paciente).categoria(categoria)
                .titulo(titulo).descripcion(descripcion)
                .resumenBreve(resumenBreve).anamnesis(anamnesis)
                .estado(estadoInicial).prioridad(prioridad).origen(origen)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now())
                .activa(true).build());
        notificacionService.crearNotificacionParaProfesionales("Nueva solicitud" + (prioridad == Prioridad.URGENTE ? " URGENTE" : ""), paciente.getUsuario().getNombreCompleto() + " ha creado: " + solicitud.getTitulo(), solicitud);
        return solicitud;
    }

    @Transactional
    public SolicitudResponse crearSolicitudPresencial(SolicitudPresencialRequest request) {
        Paciente paciente = pacienteRepository.findById(request.getIdPaciente())
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        Solicitud s = crearSolicitudEntity(paciente, request.getIdCategoria(), request.getTitulo(), request.getDescripcion(),
                request.getResumenBreve(), request.getEsUrgente(), request.getNivelRiesgo(), request.getAnamnesis(), OrigenSolicitud.PRESENCIAL);

        if (request.getIdCentroSalud() != null) {
            CentroSalud centro = centroSaludRepository.findById(request.getIdCentroSalud())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Centro no encontrado"));
            s.setCentroSalud(centro);
        }
        if (request.getIdProfesional() != null) {
            Profesional prof = profesionalRepository.findById(request.getIdProfesional())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
            s.setProfesional(prof);
        }

        if (request.getFechaHora() != null && s.getProfesional() != null) {
            LocalDateTime fechaHora = LocalDateTime.parse(request.getFechaHora());
            int duracion = request.getDuracion() != null ? request.getDuracion() : 30;
            List<Cita> solapadas = citaRepository.findByProfesionalIdAndFechaHoraBetween(
                    s.getProfesional().getId(), fechaHora, fechaHora.plusMinutes(duracion));
            if (!solapadas.isEmpty()) throw new SolicitudInvalidaException("El profesional ya tiene un turno en ese horario");

            ModalidadCita modalidad = request.getModalidad() != null ? ModalidadCita.valueOf(request.getModalidad()) : ModalidadCita.PRESENCIAL;
            Cita cita = Cita.builder()
                    .solicitud(s).profesional(s.getProfesional()).centroSalud(s.getCentroSalud())
                    .fechaHora(fechaHora).duracion(duracion).modalidad(modalidad)
                    .estado("PROGRAMADA").build();
            citaRepository.save(cita);

            s.setEstado(EstadoSolicitud.ASIGNADA);
            s.setFechaTurno(fechaHora); s.setDuracionTurno(duracion);
            s.setModalidad(modalidad.name());
        } else if (s.getProfesional() != null) {
            s.setEstado(EstadoSolicitud.ASIGNADA);
        }

        s.setFechaActualizacion(LocalDateTime.now());
        s = solicitudRepository.save(s);

        if (s.getProfesional() != null) {
            mensajeService.abrirConversacion(s);
            notificacionService.crearNotificacion(s.getProfesional().getUsuario(), "Paciente presencial asignado",
                    "Se te ha asignado la solicitud presencial '" + s.getTitulo() + "' de " + paciente.getUsuario().getNombreCompleto() + ".", s);
        }

        String turnoTexto = s.getFechaTurno() != null
                ? String.format(" con turno para el %s a las %s", s.getFechaTurno().toLocalDate(), s.getFechaTurno().toLocalTime())
                : "";
        notificacionService.crearNotificacion(s.getPaciente().getUsuario(), "Solicitud presencial registrada",
                "Tu solicitud '" + s.getTitulo() + "' fue registrada por el centro de salud" + turnoTexto + ".", s);
        return mapToResponse(s);
    }

    @Transactional
    public SolicitudResponse actualizarSolicitud(Long idSolicitud, Long idUsuario, SolicitudRequest request) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada con ID: " + idSolicitud));
        Paciente p = pacienteRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new AccesoDenegadoException("No tiene acceso a esta solicitud"));
        if (!solicitud.getPaciente().getId().equals(p.getId()))
            throw new AccesoDenegadoException("No tiene acceso a esta solicitud");
        if (solicitud.getEstado() != EstadoSolicitud.CREADA)
            throw new EstadoInvalidoException("Solo se pueden editar solicitudes en estado CREADA");
        CategoriaAyuda categoria = categoriaAyudaRepository.findById(request.getIdCategoria())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoria no encontrada"));
        solicitud.setCategoria(categoria);
        solicitud.setTitulo(request.getTitulo());
        solicitud.setDescripcion(request.getDescripcion());
        if (request.getResumenBreve() != null) solicitud.setResumenBreve(request.getResumenBreve());
        solicitud.setFechaActualizacion(LocalDateTime.now());
        solicitud = solicitudRepository.save(solicitud);
        notificacionService.crearNotificacion(solicitud.getPaciente().getUsuario(), "Solicitud actualizada", "Tu solicitud '" + solicitud.getTitulo() + "' fue editada", solicitud);
        return mapToResponse(solicitud);
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarSolicitudes(Long idUsuario, String tipoUsuario, String estado, String prioridad) {
        List<Solicitud> solicitudes;
        if ("PACIENTE".equals(tipoUsuario)) {
            Paciente p = pacienteRepository.findByUsuarioId(idUsuario).orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
            solicitudes = solicitudRepository.findByPacienteIdOrderByFechaCreacionDesc(p.getId());
        } else if ("PROFESIONAL".equals(tipoUsuario)) {
            Profesional p = profesionalRepository.findByUsuarioId(idUsuario).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
            solicitudes = solicitudRepository.findByProfesionalIdOrderByFechaCreacionDesc(p.getId());
        } else if ("SECRETARIO".equals(tipoUsuario)) {
            solicitudes = solicitudRepository.findAll();
        } else { solicitudes = solicitudRepository.findAll(); }
        return solicitudes.stream().filter(s -> estado == null || s.getEstado().name().equals(estado)).filter(s -> prioridad == null || s.getPrioridad().name().equals(prioridad)).map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<SolicitudResponse> listarSolicitudesPaginadas(Long idUsuario, String tipoUsuario, String estado, String prioridad, Pageable pageable) {
        List<Solicitud> todas = new ArrayList<>();
        long total;
        if ("PACIENTE".equals(tipoUsuario)) {
            Paciente p = pacienteRepository.findByUsuarioId(idUsuario).orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
            todas = solicitudRepository.findByPacienteIdOrderByFechaCreacionDesc(p.getId(), pageable).getContent();
            total = solicitudRepository.findByPacienteIdOrderByFechaCreacionDesc(p.getId()).size();
        } else if ("PROFESIONAL".equals(tipoUsuario)) {
            Profesional p = profesionalRepository.findByUsuarioId(idUsuario).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
            todas = solicitudRepository.findByProfesionalIdOrderByFechaCreacionDesc(p.getId(), pageable).getContent();
            total = solicitudRepository.findByProfesionalIdOrderByFechaCreacionDesc(p.getId()).size();
        } else if ("SECRETARIO".equals(tipoUsuario)) {
            Page<Solicitud> page = solicitudRepository.findAll(pageable);
            todas = page.getContent();
            total = page.getTotalElements();
        } else {
            Page<Solicitud> page = solicitudRepository.findAll(pageable);
            todas = page.getContent();
            total = page.getTotalElements();
        }
        List<SolicitudResponse> filtradas = todas.stream()
                .filter(s -> estado == null || s.getEstado().name().equals(estado))
                .filter(s -> prioridad == null || s.getPrioridad().name().equals(prioridad))
                .map(this::mapToResponse).toList();
        return new PageImpl<>(filtradas, pageable, total);
    }

    @Transactional(readOnly = true)
    public SolicitudResponse obtenerSolicitud(Long id, Long idUsuario, String tipoUsuario) {
        Solicitud s = solicitudRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada con ID: " + id));
        verificarAcceso(s, idUsuario, tipoUsuario);
        return mapToResponse(s);
    }

    @Transactional
    public SolicitudResponse cambiarEstado(Long idSolicitud, String nuevoEstado, Long idUsuario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        EstadoSolicitud actual = solicitud.getEstado();
        EstadoSolicitud destino = EstadoSolicitud.valueOf(nuevoEstado);
        boolean valida = switch (actual) { case CREADA -> destino == EstadoSolicitud.REVISADA || destino == EstadoSolicitud.ASIGNADA; case REVISADA -> destino == EstadoSolicitud.ASIGNADA; case ASIGNADA -> destino == EstadoSolicitud.EN_PROCESO || destino == EstadoSolicitud.DERIVADA; case EN_PROCESO -> destino == EstadoSolicitud.DERIVADA || destino == EstadoSolicitud.COMPLETADA; case DERIVADA -> destino == EstadoSolicitud.ASIGNADA || destino == EstadoSolicitud.COMPLETADA; case COMPLETADA, CANCELADA -> false; };
        if (!valida) throw new EstadoInvalidoException("No se puede cambiar de " + actual + " a " + destino);
        if (destino == EstadoSolicitud.ASIGNADA && solicitud.getProfesional() == null)
            profesionalRepository.findByUsuarioId(idUsuario).ifPresent(solicitud::setProfesional);
        solicitud.setEstado(destino); solicitud.setFechaActualizacion(LocalDateTime.now());
        solicitud = solicitudRepository.save(solicitud);
        notificacionService.crearNotificacion(solicitud.getPaciente().getUsuario(), "Estado actualizado", "Tu solicitud '" + solicitud.getTitulo() + "' cambio a: " + destino.name(), solicitud);
        return mapToResponse(solicitud);
    }

    @Transactional
    public SolicitudResponse cancelarSolicitud(Long idSolicitud, Long idUsuario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada con ID: " + idSolicitud));
        Paciente p = pacienteRepository.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new AccesoDenegadoException("No tiene acceso a esta solicitud"));
        if (!solicitud.getPaciente().getId().equals(p.getId()))
            throw new AccesoDenegadoException("No tiene acceso a esta solicitud");
        if (solicitud.getEstado() != EstadoSolicitud.CREADA)
            throw new EstadoInvalidoException("Solo se pueden cancelar solicitudes en estado CREADA");
        solicitud.setEstado(EstadoSolicitud.CANCELADA);
        solicitud.setActiva(false);
        solicitud.setFechaActualizacion(LocalDateTime.now());
        solicitud = solicitudRepository.save(solicitud);
        notificacionService.crearNotificacion(solicitud.getPaciente().getUsuario(), "Solicitud cancelada", "Tu solicitud '" + solicitud.getTitulo() + "' fue cancelada", solicitud);
        return mapToResponse(solicitud);
    }

    @Transactional
    public SolicitudResponse asignarProfesional(Long idSolicitud, Long idProfesional) {
        Solicitud s = solicitudRepository.findById(idSolicitud).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        Profesional p = profesionalRepository.findById(idProfesional).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
        s.setProfesional(p); s.setEstado(EstadoSolicitud.ASIGNADA); s.setFechaActualizacion(LocalDateTime.now());
        s = solicitudRepository.save(s);
        mensajeService.abrirConversacion(s);
        notificacionService.crearNotificacion(s.getPaciente().getUsuario(), "Profesional asignado", p.getUsuario().getNombreCompleto() + " fue asignado a tu solicitud", s);
        return mapToResponse(s);
    }

    @Transactional
    public SolicitudResponse derivarSolicitud(Long idSolicitud, DerivacionRequest request) {
        Solicitud s = solicitudRepository.findById(idSolicitud).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        Profesional nuevoProf = null;
        String nombreDestino = null;
        if (request.getIdProfesional() != null) {
            nuevoProf = profesionalRepository.findById(request.getIdProfesional()).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
            s.setProfesional(nuevoProf);
            if (request.getIdCentroSalud() == null && nuevoProf.getCentroSalud() != null) {
                s.setCentroSalud(nuevoProf.getCentroSalud());
            }
            nombreDestino = nuevoProf.getUsuario().getNombreCompleto();
        }
        if (request.getIdCentroSalud() != null) {
            CentroSalud nuevoCentro = centroSaludRepository.findById(request.getIdCentroSalud()).orElseThrow(() -> new RecursoNoEncontradoException("Centro no encontrado"));
            s.setCentroSalud(nuevoCentro);
            nombreDestino = nuevoCentro.getNombre();
        }
        s.setEstado(EstadoSolicitud.DERIVADA); s.setFechaActualizacion(LocalDateTime.now());

        String turnoTexto = "";
        if (request.getFechaHora() != null) {
            Profesional profTurno = nuevoProf != null ? nuevoProf : s.getProfesional();
            if (profTurno == null)
                throw new EstadoInvalidoException("No se puede asignar turno: la derivación no tiene profesional asignado");
            LocalDateTime fechaHora = request.getFechaHora();
            int duracion = request.getDuracion() != null ? request.getDuracion() : 30;
            List<Cita> solapadas = citaRepository.findByProfesionalIdAndFechaHoraBetween(
                    profTurno.getId(), fechaHora, fechaHora.plusMinutes(duracion));
            if (!solapadas.isEmpty()) throw new SolicitudInvalidaException("El profesional ya tiene un turno en ese horario");

            ModalidadCita modalidad = request.getModalidad() != null ? ModalidadCita.valueOf(request.getModalidad()) : ModalidadCita.PRESENCIAL;
            Cita citaNueva = Cita.builder()
                    .solicitud(s).profesional(profTurno).centroSalud(s.getCentroSalud())
                    .fechaHora(fechaHora).duracion(duracion).modalidad(modalidad)
                    .estado("PROGRAMADA").notas(request.getNotas())
                    .build();
            if (request.getTipoPractica() != null) citaNueva.setTipoPractica(TipoPractica.valueOf(request.getTipoPractica()));
            citaRepository.save(citaNueva);

            s.setFechaTurno(fechaHora);
            s.setDuracionTurno(duracion);
            s.setModalidad(modalidad.name());
            turnoTexto = String.format(" con turno para el %s a las %s", fechaHora.toLocalDate(), fechaHora.toLocalTime());
        }

        s = solicitudRepository.save(s);

        if (nuevoProf != null) {
            mensajeService.abrirConversacion(s);
            notificacionService.crearNotificacion(s.getPaciente().getUsuario(), "Derivación a profesional",
                    "Tu solicitud '" + s.getTitulo() + "' fue derivada al profesional: " + nombreDestino + turnoTexto + ".", s);
            notificacionService.crearNotificacion(nuevoProf.getUsuario(), "Nueva derivación",
                    "Se te ha derivado la solicitud '" + s.getTitulo() + "' del paciente " + s.getPaciente().getUsuario().getNombreCompleto() + turnoTexto + ".", s);
        } else if (request.getIdCentroSalud() != null) {
            notificacionService.crearNotificacion(s.getPaciente().getUsuario(), "Derivación a centro",
                    "Tu solicitud '" + s.getTitulo() + "' fue derivada al centro: " + nombreDestino + turnoTexto + ".", s);
        }
        return mapToResponse(s);
    }

    @Transactional
    public SolicitudResponse derivarACentro(Long idSolicitud, Long idCentroSalud) {
        Solicitud s = solicitudRepository.findById(idSolicitud).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        CentroSalud c = centroSaludRepository.findById(idCentroSalud).orElseThrow(() -> new RecursoNoEncontradoException("Centro no encontrado"));
        s.setCentroSalud(c); s.setEstado(EstadoSolicitud.DERIVADA); s.setFechaActualizacion(LocalDateTime.now());
        s = solicitudRepository.save(s);
        notificacionService.crearNotificacion(s.getPaciente().getUsuario(), "Derivacion a centro", "Tu solicitud fue derivada a: " + c.getNombre(), s);
        return mapToResponse(s);
    }

    @Transactional
    public SolicitudResponse cambiarCentro(Long idSolicitud, Long idCentroSalud) {
        Solicitud s = solicitudRepository.findById(idSolicitud).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        CentroSalud c = centroSaludRepository.findById(idCentroSalud).orElseThrow(() -> new RecursoNoEncontradoException("Centro no encontrado"));
        s.setCentroSalud(c); s.setFechaActualizacion(LocalDateTime.now());
        return mapToResponse(solicitudRepository.save(s));
    }

    @Transactional(readOnly = true)
    public List<CentroSalud> centrosDisponibles(Long idSolicitud) {
        Solicitud s = solicitudRepository.findById(idSolicitud).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        Paciente p = s.getPaciente();
        Long idObraSocial = p.getObraSocial() != null ? p.getObraSocial().getId() : 1L;
        String tipoPractica = mapearCategoriaATipoPractica(s.getCategoria().getNombre());
        List<CentroObraSocialPractica> relaciones = centroObraSocialPracticaRepository
                .findByObraSocialIdAndTipoPracticaAndActivoTrue(idObraSocial, TipoPractica.valueOf(tipoPractica));
       List<CentroSalud> centros = relaciones.stream().map(CentroObraSocialPractica::getCentro).distinct().toList();
centros.forEach(c -> { c.getNombre(); c.getDireccion(); });
return centros;
    }

    @Transactional
    public SolicitudResponse asignarTurno(Long idSolicitud, AsignarTurnoRequest r) {
        Solicitud s = solicitudRepository.findById(idSolicitud).orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        Profesional prof = profesionalRepository.findById(r.getIdProfesional()).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
        CentroSalud centro = r.getIdCentroSalud() != null ? centroSaludRepository.findById(r.getIdCentroSalud()).orElseThrow(() -> new RecursoNoEncontradoException("Centro no encontrado")) : null;
        LocalDateTime fechaHora = LocalDateTime.parse(r.getFechaHora());
        int duracion = r.getDuracion() != null ? r.getDuracion() : 15;

        List<Cita> solapadas = citaRepository.findByProfesionalIdAndFechaHoraBetween(
                r.getIdProfesional(), fechaHora, fechaHora.plusMinutes(duracion));
        if (!solapadas.isEmpty()) throw new SolicitudInvalidaException("El profesional ya tiene un turno en ese horario");

        ModalidadCita modalidad = r.getModalidad() != null ? ModalidadCita.valueOf(r.getModalidad()) : ModalidadCita.PRESENCIAL;

        Cita cita = Cita.builder()
                .solicitud(s).profesional(prof).centroSalud(centro)
                .fechaHora(fechaHora).duracion(duracion).modalidad(modalidad)
                .estado("PROGRAMADA").build();
        citaRepository.save(cita);

        s.setProfesional(prof); s.setCentroSalud(centro);
        s.setEstado(EstadoSolicitud.ASIGNADA);
        s.setFechaTurno(fechaHora); s.setDuracionTurno(duracion);
        s.setModalidad(modalidad.name());
        s.setFechaActualizacion(LocalDateTime.now());
        s = solicitudRepository.save(s);

        String msgPaciente = String.format("Turno asignado: %s, %s, %s, %s",
                prof.getUsuario().getNombreCompleto(),
                fechaHora.toLocalDate().toString(),
                fechaHora.toLocalTime().toString(),
                centro != null ? centro.getNombre() : "Sin centro");
        notificacionService.crearNotificacion(s.getPaciente().getUsuario(), "Turno asignado", msgPaciente, s);
        mensajeService.abrirConversacion(s);

        return mapToResponse(s);
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarSolicitudesPendientes() {
        List<EstadoSolicitud> pendientes = List.of(EstadoSolicitud.CREADA, EstadoSolicitud.REVISADA);
        List<Solicitud> urgentes = solicitudRepository.findByEstadoInAndActivaTrueOrderByFechaCreacionDesc(pendientes)
                .stream().filter(s -> s.getPrioridad() == Prioridad.URGENTE).toList();
        List<Solicitud> normales = solicitudRepository.findByEstadoInAndActivaTrueOrderByFechaCreacionDesc(pendientes)
                .stream().filter(s -> s.getPrioridad() != Prioridad.URGENTE).toList();
        List<Solicitud> resultado = new java.util.ArrayList<>(urgentes);
        resultado.addAll(normales);
        return resultado.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void guardarAdjunto(Long idSolicitud, String fileName) {
        solicitudRepository.findById(idSolicitud).ifPresent(s -> {
            s.setArchivoAdjunto(fileName);
            solicitudRepository.save(s);
        });
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarTodasParaProfesional(Long idUsuario) {
        Profesional p = profesionalRepository.findByUsuarioId(idUsuario).orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado"));
        List<Solicitud> asignadas = solicitudRepository.findByProfesionalIdOrderByFechaCreacionDesc(p.getId());
        List<EstadoSolicitud> pendientes = List.of(EstadoSolicitud.CREADA, EstadoSolicitud.REVISADA);
        List<Solicitud> delSistema = solicitudRepository.findByEstadoInAndActivaTrueOrderByFechaCreacionDesc(pendientes)
                .stream().filter(s -> s.getProfesional() == null || !s.getProfesional().getId().equals(p.getId())).toList();
        List<Solicitud> combinadas = new ArrayList<>(asignadas);
        combinadas.addAll(delSistema.stream().filter(s -> asignadas.stream().noneMatch(a -> a.getId().equals(s.getId()))).toList());
        List<Cita> citasAtendidas = citaRepository.findByProfesionalIdAndEstadoOrderByFechaHoraDesc(p.getId(), "ATENDIDA");
        for (Cita c : citasAtendidas) {
            Solicitud s = c.getSolicitud();
            if (s != null && combinadas.stream().noneMatch(x -> x.getId().equals(s.getId()))) {
                combinadas.add(s);
            }
        }
        return combinadas.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PerfilPacienteSolicitudResponse obtenerDetalleCompleto(Long idSolicitud, Long idUsuario, String tipoUsuario) {
        Solicitud s = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada con ID: " + idSolicitud));
        verificarAcceso(s, idUsuario, tipoUsuario);
        Paciente p = s.getPaciente();
        Usuario u = p.getUsuario();

        Integer edad = p.getFechaNacimiento() != null
                ? LocalDate.now().getYear() - p.getFechaNacimiento().getYear()
                : null;

        DatosPaciente datosPaciente = DatosPaciente.builder()
                .id(p.getId()).nombreCompleto(u.getNombreCompleto()).email(u.getEmail())
                .telefono(u.getTelefono()).tipoDocumento(p.getTipoDocumento())
                .numDocumento(p.getNumDocumento()).edad(edad)
                .nombreObraSocial(p.getObraSocial() != null ? p.getObraSocial().getNombre() : "Sin cobertura")
                .numeroAfiliado(p.getNumeroAfiliado()).planCobertura(p.getPlanCobertura())
                .consentimientoOk(p.getConsentimientoOk()).fotoPerfil(u.getFotoPerfil())
                .build();

        DatosSolicitud datosSolicitud = DatosSolicitud.builder()
                .id(s.getId()).titulo(s.getTitulo()).descripcion(s.getDescripcion())
                .anamnesis(s.getAnamnesis()).resumenBreve(s.getResumenBreve())
                .estado(s.getEstado().name()).prioridad(s.getPrioridad().name())
                .nombreCategoria(s.getCategoria().getNombre()).fechaCreacion(s.getFechaCreacion())
                .archivoAdjunto(s.getArchivoAdjunto())
                .nombreCentroSalud(s.getCentroSalud() != null ? s.getCentroSalud().getNombre() : null)
                .nombreProfesional(s.getProfesional() != null ? s.getProfesional().getUsuario().getNombreCompleto() : null)
                .build();

        List<DiarioSintomas> diarios = diarioSintomasRepository.findByPacienteIdOrderByFechaDesc(p.getId());
        List<RegistroSintomatologia> registros = registroSintomatologiaRepository.findByPacienteIdOrderByFechaDesc(p.getId());

        java.util.Map<LocalDate, RegistroSintomatologia> sintoMap = new java.util.HashMap<>();
        for (RegistroSintomatologia r : registros) sintoMap.put(r.getFecha(), r);

        List<EntradaDiario> entradas = new ArrayList<>();
        for (DiarioSintomas d : diarios) {
            RegistroSintomatologia rs = sintoMap.get(d.getFecha());
            entradas.add(EntradaDiario.builder()
                    .fecha(d.getFecha()).estadoAnimo(d.getEstadoAnimo())
                    .intensidadDolor(d.getIntensidadDolor()).horasSuenio(d.getHorasSuenio())
                    .medicacionTomada(d.getMedicacionTomada())
                    .sintomasTexto(d.getSintomasTexto()).observaciones(d.getObservaciones())
                    .calidadSuenio(rs != null ? rs.getCalidadSuenio() : null)
                    .estresAnsiedad(rs != null ? rs.getEstresAnsiedad() : null)
                    .adherencia(rs != null ? rs.getAdherencia() : null)
                    .build());
        }
        entradas.sort(Comparator.comparing(EntradaDiario::getFecha).reversed());

        ContactoEmergencia emergencia = ContactoEmergencia.builder()
                .nombre(u.getNombreCompleto()).telefono(u.getTelefono()).parentesco("Titular")
                .build();

        return PerfilPacienteSolicitudResponse.builder()
                .paciente(datosPaciente).solicitud(datosSolicitud)
                .diario(entradas).contactoEmergencia(emergencia)
                .build();
    }

    private void verificarAcceso(Solicitud s, Long idUsuario, String tipoUsuario) {
        if ("PACIENTE".equals(tipoUsuario)) {
            Paciente p = pacienteRepository.findByUsuarioId(idUsuario)
                    .orElseThrow(() -> new AccesoDenegadoException("No tiene acceso a esta solicitud"));
            if (!s.getPaciente().getId().equals(p.getId()))
                throw new AccesoDenegadoException("No tiene acceso a esta solicitud");
        } else if ("PROFESIONAL".equals(tipoUsuario)) {
            Profesional p = profesionalRepository.findByUsuarioId(idUsuario)
                    .orElseThrow(() -> new AccesoDenegadoException("No tiene acceso a esta solicitud"));
            boolean asignada = s.getProfesional() != null && s.getProfesional().getId().equals(p.getId());
            boolean sinAsignar = s.getProfesional() == null;
            if (!asignada && !sinAsignar)
                throw new AccesoDenegadoException("Solo el profesional asignado puede ver esta solicitud");
        }
    }

    private String mapearCategoriaATipoPractica(String nombreCategoria) {
        if (nombreCategoria == null) return "CONSULTA_AMBULATORIA";
        String n = nombreCategoria.toUpperCase();
        if (n.contains("SALUD MENTAL") || n.contains("ANSIEDAD") || n.contains("PANICO") || n.contains("TRISTEZA")) return "SALUD_MENTAL";
        if (n.contains("INTERNACION")) return "INTERNACION";
        if (n.contains("URGENCIA") || n.contains("GUARDIA")) return "GUARDIA_EMERGENCIA";
        if (n.contains("CONSUMO") || n.contains("ADICCION")) return "SALUD_MENTAL";
        if (n.contains("VIOLENCIA") || n.contains("ABUSO")) return "GUARDIA_EMERGENCIA";
        return "CONSULTA_AMBULATORIA";
    }

    private SolicitudResponse mapToResponse(Solicitud s) {
        s.getPaciente().getUsuario().getNombreCompleto();
        if (s.getPaciente().getObraSocial() != null) s.getPaciente().getObraSocial().getNombre();
        if (s.getProfesional() != null) s.getProfesional().getUsuario().getNombreCompleto();
        if (s.getCentroSalud() != null) s.getCentroSalud().getNombre();
        return SolicitudResponse.builder()
                .id(s.getId()).idPaciente(s.getPaciente().getId())
                .nombrePaciente(s.getPaciente().getUsuario().getNombreCompleto())
                .idProfesional(s.getProfesional() != null ? s.getProfesional().getId() : null)
                .nombreProfesional(s.getProfesional() != null ? s.getProfesional().getUsuario().getNombreCompleto() : null)
                .idCategoria(s.getCategoria().getId()).nombreCategoria(s.getCategoria().getNombre())
                .idObraSocial(s.getPaciente().getObraSocial() != null ? s.getPaciente().getObraSocial().getId() : null)
                .nombreObraSocial(s.getPaciente().getObraSocial() != null ? s.getPaciente().getObraSocial().getNombre() : "Sin cobertura")
                .titulo(s.getTitulo()).descripcion(s.getDescripcion())
                .resumenBreve(s.getResumenBreve()).archivoAdjunto(s.getArchivoAdjunto()).anamnesis(s.getAnamnesis())
                .direccionPaciente(s.getPaciente().getUsuario().getDireccion())
                .tipoDocumento(s.getPaciente().getTipoDocumento()).numDocumento(s.getPaciente().getNumDocumento())
                .estado(s.getEstado().name()).origen(s.getOrigen() != null ? s.getOrigen().name() : "ONLINE").prioridad(s.getPrioridad().name())
                .fechaCreacion(s.getFechaCreacion()).fechaActualizacion(s.getFechaActualizacion())
                .idCentroSalud(s.getCentroSalud() != null ? s.getCentroSalud().getId() : null)
                .nombreCentroSalud(s.getCentroSalud() != null ? s.getCentroSalud().getNombre() : null)
                .direccionCentroSalud(s.getCentroSalud() != null ? s.getCentroSalud().getDireccion() : null)
                .fechaTurno(s.getFechaTurno()).duracionTurno(s.getDuracionTurno()).modalidad(s.getModalidad())
                .activa(s.getActiva()).build();
    }
}
