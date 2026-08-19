package com.sistemasalud.service;

import com.sistemasalud.dto.response.ConversacionDetalleResponse;
import com.sistemasalud.dto.response.ConversacionResponse;
import com.sistemasalud.dto.response.MensajeResponse;
import com.sistemasalud.entity.Conversacion;
import com.sistemasalud.entity.Mensaje;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.Profesional;
import com.sistemasalud.entity.Secretario;
import com.sistemasalud.entity.Solicitud;
import com.sistemasalud.entity.Usuario;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.AccesoDenegadoException;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.ConversacionRepository;
import com.sistemasalud.repository.MensajeRepository;
import com.sistemasalud.repository.SecretarioRepository;
import com.sistemasalud.repository.SolicitudRepository;
import com.sistemasalud.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service @RequiredArgsConstructor
public class MensajeService {

    private final ConversacionRepository conversacionRepository;
    private final MensajeRepository mensajeRepository;
    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final SecretarioRepository secretarioRepository;

    @Transactional
    public Conversacion abrirConversacion(Long idSolicitud) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));
        if (solicitud.getProfesional() == null) return null;
        return abrirConversacion(solicitud);
    }

    @Transactional
    public Conversacion abrirConversacion(Solicitud solicitud) {
        if (solicitud == null || solicitud.getProfesional() == null) return null;
        return conversacionRepository.findBySolicitudId(solicitud.getId()).orElseGet(() -> {
            Conversacion conversacion = Conversacion.builder()
                    .solicitud(solicitud)
                    .fechaCreacion(LocalDateTime.now())
                    .fechaUltimoMensaje(null)
                    .estado("ABIERTA")
                    .build();
            return conversacionRepository.save(conversacion);
        });
    }

    @Transactional(readOnly = true)
    public List<ConversacionResponse> listarConversaciones(Long idUsuario, String tipoUsuario) {
        List<Conversacion> conversaciones;
        if (TipoUsuario.PACIENTE.name().equals(tipoUsuario)) {
            conversaciones = conversacionRepository.findParaPaciente(idUsuario);
        } else if (TipoUsuario.PROFESIONAL.name().equals(tipoUsuario)) {
            conversaciones = conversacionRepository.findParaProfesional(idUsuario);
        } else {
            Secretario sec = secretarioRepository.findByUsuarioId(idUsuario).orElse(null);
            conversaciones = sec != null && sec.getCentroSalud() != null
                    ? conversacionRepository.findParaSecretarioCentro(sec.getCentroSalud().getId())
                    : conversacionRepository.findParaCentral();
        }
        return conversaciones.stream().map(c -> toConversacionResponse(c, idUsuario)).toList();
    }

    @Transactional
    public ConversacionDetalleResponse obtenerConversacion(Long idConversacion, Long idUsuario) {
        Conversacion conversacion = conversacionRepository.findById(idConversacion)
                .orElseThrow(() -> new RecursoNoEncontradoException("Conversación no encontrada"));
        verificarAcceso(conversacion, idUsuario);
        mensajeRepository.marcarConversacionLeida(conversacion.getId(), idUsuario);
        List<MensajeResponse> mensajes = mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacion.getId())
                .stream().map(m -> toMensajeResponse(m, idUsuario)).toList();
        return ConversacionDetalleResponse.builder()
                .conversacion(toConversacionResponse(conversacion, idUsuario))
                .mensajes(mensajes)
                .build();
    }

    @Transactional
    public MensajeResponse enviarMensaje(Long idConversacion, Long idUsuario, String contenido) {
        Conversacion conversacion = conversacionRepository.findById(idConversacion)
                .orElseThrow(() -> new RecursoNoEncontradoException("Conversación no encontrada"));
        verificarAcceso(conversacion, idUsuario);
        Usuario emisor = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Mensaje mensaje = Mensaje.builder()
                .conversacion(conversacion)
                .emisor(emisor)
                .contenido(contenido.trim())
                .leido(false)
                .fechaEnvio(LocalDateTime.now())
                .build();
        Mensaje guardado = mensajeRepository.save(mensaje);

        conversacion.setFechaUltimoMensaje(guardado.getFechaEnvio());
        conversacionRepository.save(conversacion);

        notificarDestinatario(conversacion, emisor, contenido.trim());
        return toMensajeResponse(guardado, idUsuario);
    }

    @Transactional(readOnly = true)
    public long contarNoLeidos(Long idUsuario) {
        return mensajeRepository.contarNoLeidos(idUsuario);
    }

    private void notificarDestinatario(Conversacion conversacion, Usuario emisor, String contenido) {
        Solicitud solicitud = conversacion.getSolicitud();
        Usuario paciente = solicitud.getPaciente().getUsuario();
        Profesional profesional = solicitud.getProfesional();
        Usuario destino = paciente.getId().equals(emisor.getId()) && profesional != null
                ? profesional.getUsuario() : paciente;
        if (destino == null || destino.getId().equals(emisor.getId())) return;

        String remitente = emisor.getNombreCompleto();
        String resumen = contenido.length() > 120 ? contenido.substring(0, 117).trim() + "…" : contenido;
        notificacionService.notificarMensaje(destino, "Nuevo mensaje",
                remitente + " te escribió: " + resumen, solicitud);
    }

    private void verificarAcceso(Conversacion conversacion, Long idUsuario) {
        Solicitud solicitud = conversacion.getSolicitud();
        boolean esPaciente = solicitud.getPaciente().getUsuario().getId().equals(idUsuario);
        boolean esProfesional = solicitud.getProfesional() != null
                && solicitud.getProfesional().getUsuario().getId().equals(idUsuario);
        if (esPaciente || esProfesional) return;
        Secretario sec = secretarioRepository.findByUsuarioId(idUsuario).orElse(null);
        if (sec == null) throw new AccesoDenegadoException("No tiene acceso a esta conversación");
        if (sec.getCentroSalud() != null) {
            boolean delCentro = solicitud.getCentroSalud() != null
                    && solicitud.getCentroSalud().getId().equals(sec.getCentroSalud().getId());
            if (!delCentro) throw new AccesoDenegadoException("No tiene acceso a esta conversación");
        }
    }

    private ConversacionResponse toConversacionResponse(Conversacion c, Long idUsuario) {
        Solicitud solicitud = c.getSolicitud();
        Paciente paciente = solicitud.getPaciente();
        Profesional profesional = solicitud.getProfesional();
        boolean soyPaciente = paciente.getUsuario().getId().equals(idUsuario);

        Usuario interlocutor = soyPaciente
                ? (profesional != null ? profesional.getUsuario() : null)
                : paciente.getUsuario();

        Optional<Mensaje> ultimo = mensajeRepository.findTopByConversacionIdOrderByFechaEnvioDesc(c.getId());
        long noLeidos = mensajeRepository.countByConversacionIdAndLeidoFalseAndEmisorIdNot(c.getId(), idUsuario);

        return ConversacionResponse.builder()
                .id(c.getId())
                .idSolicitud(solicitud.getId())
                .solicitudTitulo(solicitud.getTitulo())
                .idInterlocutor(interlocutor != null ? interlocutor.getId() : null)
                .interlocutorNombre(interlocutor != null ? interlocutor.getNombreCompleto() : null)
                .interlocutorAvatar(interlocutor != null ? interlocutor.getFotoPerfil() : null)
                .rolInterlocutor(soyPaciente ? "PROFESIONAL" : "PACIENTE")
                .ultimoMensaje(ultimo.map(Mensaje::getContenido).orElse(null))
                .fechaUltimoMensaje(ultimo.map(Mensaje::getFechaEnvio).orElse(null))
                .noLeidos(noLeidos)
                .build();
    }

    private MensajeResponse toMensajeResponse(Mensaje m, Long idUsuario) {
        boolean propio = m.getEmisor().getId().equals(idUsuario);
        return MensajeResponse.builder()
                .id(m.getId())
                .idConversacion(m.getConversacion().getId())
                .idEmisor(m.getEmisor().getId())
                .emisorNombre(m.getEmisor().getNombreCompleto())
                .contenido(m.getContenido())
                .leido(m.getLeido())
                .fechaEnvio(m.getFechaEnvio())
                .propio(propio)
                .build();
    }
}
