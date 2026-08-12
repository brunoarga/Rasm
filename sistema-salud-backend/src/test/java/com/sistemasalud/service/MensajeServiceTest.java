package com.sistemasalud.service;

import com.sistemasalud.dto.response.ConversacionDetalleResponse;
import com.sistemasalud.dto.response.ConversacionResponse;
import com.sistemasalud.dto.response.MensajeResponse;
import com.sistemasalud.entity.*;
import com.sistemasalud.enums.EstadoSolicitud;
import com.sistemasalud.enums.Prioridad;
import com.sistemasalud.enums.TipoUsuario;
import com.sistemasalud.exception.AccesoDenegadoException;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.ConversacionRepository;
import com.sistemasalud.repository.MensajeRepository;
import com.sistemasalud.repository.SolicitudRepository;
import com.sistemasalud.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MensajeServiceTest {

    @Mock private ConversacionRepository conversacionRepository;
    @Mock private MensajeRepository mensajeRepository;
    @Mock private SolicitudRepository solicitudRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private NotificacionService notificacionService;

    private MensajeService service;
    private Usuario usuarioPaciente;
    private Usuario usuarioProfesional;
    private Paciente paciente;
    private Profesional profesional;
    private Solicitud solicitud;
    private Conversacion conversacion;

    @BeforeEach
    void setUp() {
        service = new MensajeService(conversacionRepository, mensajeRepository, solicitudRepository, usuarioRepository, notificacionService);

        usuarioPaciente = Usuario.builder().id(1L).nombreCompleto("Juan Perez").email("juan@test.com").tipoUsuario(TipoUsuario.PACIENTE).build();
        usuarioProfesional = Usuario.builder().id(2L).nombreCompleto("Dra. Garcia").email("garcia@test.com").tipoUsuario(TipoUsuario.PROFESIONAL).build();
        paciente = Paciente.builder().id(1L).usuario(usuarioPaciente).consentimientoOk(true).build();
        profesional = Profesional.builder().id(1L).usuario(usuarioProfesional).build();

        solicitud = Solicitud.builder()
                .id(1L).paciente(paciente).profesional(profesional)
                .titulo("Necesito ayuda").descripcion("Me siento mal")
                .estado(EstadoSolicitud.ASIGNADA).prioridad(Prioridad.MEDIA)
                .fechaCreacion(LocalDateTime.now()).fechaActualizacion(LocalDateTime.now())
                .activa(true).build();

        conversacion = Conversacion.builder()
                .id(10L).solicitud(solicitud)
                .fechaCreacion(LocalDateTime.now())
                .fechaUltimoMensaje(null)
                .estado("ABIERTA")
                .build();
    }

    @Test
    void abrirConversacion_cuandoNoExiste_deberiaCrearla() {
        when(conversacionRepository.findBySolicitudId(1L)).thenReturn(Optional.empty());
        when(conversacionRepository.save(any(Conversacion.class))).thenAnswer(inv -> inv.getArgument(0));

        Conversacion creada = service.abrirConversacion(solicitud);

        assertThat(creada).isNotNull();
        assertThat(creada.getSolicitud().getId()).isEqualTo(1L);
        verify(conversacionRepository).save(any(Conversacion.class));
    }

    @Test
    void abrirConversacion_cuandoYaExiste_deberiaReutilizarla() {
        when(conversacionRepository.findBySolicitudId(1L)).thenReturn(Optional.of(conversacion));

        Conversacion result = service.abrirConversacion(solicitud);

        assertThat(result.getId()).isEqualTo(10L);
        verify(conversacionRepository, never()).save(any(Conversacion.class));
    }

    @Test
    void abrirConversacion_sinProfesional_deberiaRetornarNull() {
        solicitud.setProfesional(null);

        Conversacion result = service.abrirConversacion(solicitud);

        assertThat(result).isNull();
        verifyNoInteractions(conversacionRepository);
    }

    @Test
    void enviarMensaje_comoPaciente_deberiaGuardarYNotificar() {
        when(conversacionRepository.findById(10L)).thenReturn(Optional.of(conversacion));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioPaciente));
        when(mensajeRepository.save(any(Mensaje.class))).thenAnswer(inv -> {
            Mensaje m = inv.getArgument(0);
            m.setId(100L);
            return m;
        });
        when(conversacionRepository.save(any(Conversacion.class))).thenReturn(conversacion);

        MensajeResponse response = service.enviarMensaje(10L, 1L, "Hola doctora");

        assertThat(response.getContenido()).isEqualTo("Hola doctora");
        assertThat(response.getPropio()).isTrue();
        verify(conversacionRepository).save(any(Conversacion.class));

        ArgumentCaptor<Usuario> destinoCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(notificacionService).notificarMensaje(destinoCaptor.capture(), eq("Nuevo mensaje"), anyString(), any(Solicitud.class));
        assertThat(destinoCaptor.getValue().getId()).isEqualTo(2L);
    }

    @Test
    void enviarMensaje_usuarioNoParticipante_deberiaLanzarAccesoDenegado() {
        when(conversacionRepository.findById(10L)).thenReturn(Optional.of(conversacion));

        assertThatThrownBy(() -> service.enviarMensaje(10L, 99L, "Hola"))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(mensajeRepository, never()).save(any(Mensaje.class));
    }

    @Test
    void enviarMensaje_conversacionNoExistente_deberiaLanzarExcepcion() {
        when(conversacionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.enviarMensaje(99L, 1L, "Hola"))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void obtenerConversacion_deberiaMarcarLeidaYRetornarMensajes() {
        when(conversacionRepository.findById(10L)).thenReturn(Optional.of(conversacion));

        Mensaje m1 = Mensaje.builder().id(1L).conversacion(conversacion).emisor(usuarioProfesional)
                .contenido("Buen día Juan").leido(false).fechaEnvio(LocalDateTime.now()).build();
        when(mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(10L)).thenReturn(List.of(m1));
        when(mensajeRepository.findTopByConversacionIdOrderByFechaEnvioDesc(10L)).thenReturn(Optional.of(m1));
        when(mensajeRepository.countByConversacionIdAndLeidoFalseAndEmisorIdNot(10L, 1L)).thenReturn(1L);

        ConversacionDetalleResponse detalle = service.obtenerConversacion(10L, 1L);

        assertThat(detalle.getMensajes()).hasSize(1);
        assertThat(detalle.getMensajes().get(0).getPropio()).isFalse();
        assertThat(detalle.getConversacion().getNoLeidos()).isEqualTo(1L);
        verify(mensajeRepository).marcarConversacionLeida(10L, 1L);
    }

    @Test
    void listarConversaciones_comoProfesional_deberiaUsarQueryDeProfesional() {
        when(conversacionRepository.findParaProfesional(2L)).thenReturn(List.of(conversacion));
        when(mensajeRepository.findTopByConversacionIdOrderByFechaEnvioDesc(10L)).thenReturn(Optional.empty());
        when(mensajeRepository.countByConversacionIdAndLeidoFalseAndEmisorIdNot(10L, 2L)).thenReturn(0L);

        List<ConversacionResponse> result = service.listarConversaciones(2L, "PROFESIONAL");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getInterlocutorNombre()).isEqualTo("Juan Perez");
        assertThat(result.get(0).getRolInterlocutor()).isEqualTo("PACIENTE");
        verify(conversacionRepository, never()).findParaPaciente(2L);
    }

    @Test
    void listarConversaciones_comoPaciente_deberiaUsarQueryDePaciente() {
        when(conversacionRepository.findParaPaciente(1L)).thenReturn(List.of(conversacion));
        when(mensajeRepository.findTopByConversacionIdOrderByFechaEnvioDesc(10L)).thenReturn(Optional.empty());
        when(mensajeRepository.countByConversacionIdAndLeidoFalseAndEmisorIdNot(10L, 1L)).thenReturn(0L);

        List<ConversacionResponse> result = service.listarConversaciones(1L, "PACIENTE");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getInterlocutorNombre()).isEqualTo("Dra. Garcia");
        assertThat(result.get(0).getRolInterlocutor()).isEqualTo("PROFESIONAL");
    }
}
