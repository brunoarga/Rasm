package com.sistemasalud.config;

import com.sistemasalud.entity.*;
import com.sistemasalud.enums.*;
import com.sistemasalud.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Component @RequiredArgsConstructor @Slf4j
public class DataSeeder implements CommandLineRunner {
    private final UsuarioRepository usuarioRepository;
    private final SecretarioRepository secretarioRepository;
    private final ProfesionalRepository profesionalRepository;
    private final PacienteRepository pacienteRepository;
    private final ObraSocialRepository obraSocialRepository;
    private final CentroSaludRepository centroSaludRepository;
    private final DisponibilidadProfesionalRepository disponibilidadRepository;
    private final PasswordEncoder passwordEncoder;

    @Override @Transactional
    public void run(String... args) {
        if (!usuarioRepository.existsByEmail("admin@sistemasalud.com")) {
            Usuario admin = Usuario.builder().nombreCompleto("Administrador Sistema").email("admin@sistemasalud.com")
                    .password(passwordEncoder.encode("password")).telefono("1155550000")
                    .tipoUsuario(TipoUsuario.ADMIN).activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
            usuarioRepository.save(admin);
            log.info("Admin creado: admin@sistemasalud.com / password");
        }
        if (!usuarioRepository.existsByEmail("secretaria@sistemasalud.com")) {
            Usuario sec = Usuario.builder().nombreCompleto("Maria Secretaria").email("secretaria@sistemasalud.com")
                    .password(passwordEncoder.encode("password")).telefono("1155551111")
                    .tipoUsuario(TipoUsuario.SECRETARIO).activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
            usuarioRepository.save(sec);
            secretarioRepository.save(Secretario.builder().usuario(sec).build());
            log.info("Secretaria creada: secretaria@sistemasalud.com / password");
        }

        // ── Centros de referencia ──
        seedProfesionales();
        seedDisponibilidad();

        if (!usuarioRepository.existsByEmail("juan.perez@email.com")) {
            ObraSocial osde = obraSocialRepository.findById(3L).orElse(null);
            Usuario pac1 = Usuario.builder().nombreCompleto("Juan Perez").email("juan.perez@email.com")
                    .password(passwordEncoder.encode("password")).telefono("1155556666")
                    .tipoUsuario(TipoUsuario.PACIENTE).activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
            usuarioRepository.save(pac1);
            Paciente paciente = Paciente.builder().usuario(pac1).fechaNacimiento(LocalDate.of(1990, 5, 15))
                    .tipoDocumento("DNI").numDocumento("30123456")
                    .consentimientoOk(true).fechaConsentimiento(LocalDate.now())
                    .obraSocial(osde).numeroAfiliado("OSDE-123456").planCobertura("Plan 210").build();
            pacienteRepository.save(paciente);
            log.info("Paciente creado: juan.perez@email.com / password (OSDE)");

            Usuario pac2 = Usuario.builder().nombreCompleto("Maria Lopez").email("maria.lopez@email.com")
                    .password(passwordEncoder.encode("password")).telefono("1155557777")
                    .tipoUsuario(TipoUsuario.PACIENTE).activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true).build();
            usuarioRepository.save(pac2);
            Paciente paciente2 = Paciente.builder().usuario(pac2).fechaNacimiento(LocalDate.of(1985, 3, 20))
                    .tipoDocumento("DNI").numDocumento("27123456")
                    .consentimientoOk(true).fechaConsentimiento(LocalDate.now())
                    .obraSocial(obraSocialRepository.findById(1L).orElse(null)).build();
            pacienteRepository.save(paciente2);
            log.info("Paciente creado: maria.lopez@email.com / password (Sin Cobertura)");
        }
    }

    /* ─── Idempotent professional seeder ─── */
    private void seedProfesionales() {
        CentroSalud secSaludMental = centroSaludRepository.findById(1L).orElse(null);
        CentroSalud usmaAltoComedero = centroSaludRepository.findById(2L).orElse(null);
        CentroSalud hospitalGallardo = centroSaludRepository.findById(5L).orElse(null);
        CentroSalud hospitalPabloSoria = centroSaludRepository.findById(6L).orElse(null);
        CentroSalud hospitalMaternoInfantil = centroSaludRepository.findById(7L).orElse(null);
        CentroSalud hospitalOscarOrías = centroSaludRepository.findById(11L).orElse(null);
        CentroSalud psiMentalSalud = centroSaludRepository.findById(17L).orElse(null);

        // ── Secretaría de Salud Mental (ID 1): 4 profesionales ──
        Usuario p1 = saveIfNotExists("mariano.martinez@salud.com", "Lic. Mariano Martinez",
                TipoProfesional.PSICOLOGO, "Psicologia Clinica", "LP-12345", "1155552222");
        Usuario p2 = saveIfNotExists("laura.gonzalez@salud.com", "Lic. Laura Gonzalez",
                TipoProfesional.PSICOLOGO, "Psicologia Infantil", "LP-12346", "1155553333");
        Usuario p3 = saveIfNotExists("sofia.mendoza@salud.com", "Dra. Sofia Mendoza",
                TipoProfesional.PSIQUIATRA, "Psiquiatria General", "MN-98765", "1155558888");
        Usuario p4 = saveIfNotExists("ana.perez@salud.com", "Lic. Ana Perez",
                TipoProfesional.TRABAJADOR_SOCIAL, "Trabajo Social", "TS-67890", "1155555555");

        // ── Hospital Pablo Soria (ID 6): 4 profesionales ──
        Usuario p5 = saveIfNotExists("carlos.rodriguez@salud.com", "Dr. Carlos Rodriguez",
                TipoProfesional.MEDICO, "Clinica General", "MN-54321", "1155554444");
        Usuario p6 = saveIfNotExists("fernando.castro@salud.com", "Lic. Fernando Castro",
                TipoProfesional.PSICOLOGO, "Terapia Cognitivo Conductual", "LP-24680", "1155559999");
        Usuario p7 = saveIfNotExists("romina.vega@salud.com", "Dra. Romina Vega",
                TipoProfesional.MEDICO, "Medicina Familiar", "MN-97531", "1155552220");
        Usuario p8 = saveIfNotExists("juan.aguero@salud.com", "Dr. Juan Aguero",
                TipoProfesional.PSICOLOGO, "Psicologia de Emergencias", "LP-13579", "1155551110");

        // ── Hospital Oscar Orías (ID 11): 4 profesionales ──
        Usuario p9  = saveIfNotExists("patricia.morales@salud.com", "Dra. Patricia Morales",
                TipoProfesional.PSIQUIATRA, "Psiquiatria Adultos", "MN-11111", "1155553330");
        Usuario p10 = saveIfNotExists("gabriela.sosa@salud.com", "Lic. Gabriela Sosa",
                TipoProfesional.PSICOLOGO, "Psicologia Clinica", "LP-22222", "1155553331");
        Usuario p11 = saveIfNotExists("martin.chavez@salud.com", "Dr. Martin Chavez",
                TipoProfesional.MEDICO, "Clinica General", "MN-33333", "1155553332");
        Usuario p12 = saveIfNotExists("elena.ruiz@salud.com", "Lic. Elena Ruiz",
                TipoProfesional.TRABAJADOR_SOCIAL, "Trabajo Social Sanitario", "TS-44444", "1155553333");

        // ── Hospital W. Gallardo (ID 5): 3 profesionales ──
        Usuario p13 = saveIfNotExists("ricardo.ledesma@salud.com", "Dr. Ricardo Ledesma",
                TipoProfesional.PSIQUIATRA, "Psiquiatria General", "MN-55555", "1155554440");
        Usuario p14 = saveIfNotExists("silvia.acosta@salud.com", "Lic. Silvia Acosta",
                TipoProfesional.PSICOLOGO, "Terapia Familiar", "LP-66666", "1155554441");
        Usuario p15 = saveIfNotExists("daniel.ramos@salud.com", "Lic. Daniel Ramos",
                TipoProfesional.TRABAJADOR_SOCIAL, "Trabajo Social Comunitario", "TS-77777", "1155554442");

        // ── USMA Alto Comedero (ID 2): 3 profesionales ──
        Usuario p16 = saveIfNotExists("cecilia.vargas@salud.com", "Lic. Cecilia Vargas",
                TipoProfesional.PSICOLOGO, "Psicologia General", "LP-88888", "1155555550");
        Usuario p17 = saveIfNotExists("hernan.paz@salud.com", "Dr. Hernan Paz",
                TipoProfesional.MEDICO, "Medicina General", "MN-99999", "1155555551");
        Usuario p18 = saveIfNotExists("marta.juarez@salud.com", "Lic. Marta Juarez",
                TipoProfesional.PSICOLOGO, "Psicologia Infantil", "LP-00000", "1155555552");

        // ── Hospital Materno Infantil (ID 7): 3 profesionales ──
        Usuario p19 = saveIfNotExists("beatriz.toledo@salud.com", "Dra. Beatriz Toledo",
                TipoProfesional.PSICOLOGO, "Psicologia Perinatal", "LP-10101", "1155556660");
        Usuario p20 = saveIfNotExists("jorge.medina@salud.com", "Lic. Jorge Medina",
                TipoProfesional.PSICOLOGO, "Psicologia Infantil", "LP-20202", "1155556661");
        Usuario p21 = saveIfNotExists("lucia.ferreyra@salud.com", "Dra. Lucia Ferreyra",
                TipoProfesional.TRABAJADOR_SOCIAL, "Trabajo Social Infantil", "TS-30303", "1155556662");

        // ── Psi Mental Salud (ID 17): 3 profesionales ──
        Usuario p22 = saveIfNotExists("valeria.gutierrez@salud.com", "Dra. Valeria Gutierrez",
                TipoProfesional.PSIQUIATRA, "Psiquiatria Adultos", "MN-40404", "1155557770");
        Usuario p23 = saveIfNotExists("pablo.quiroga@salud.com", "Lic. Pablo Quiroga",
                TipoProfesional.PSICOLOGO, "Terapia Cognitivo Conductual", "LP-50505", "1155557771");
        Usuario p24 = saveIfNotExists("andrea.campos@salud.com", "Lic. Andrea Campos",
                TipoProfesional.PSICOLOGO, "Psicologia de Adultos", "LP-60606", "1155557772");

        // ── Asignar/actualizar relaciones Profesional → Centro ──
        if (secSaludMental != null) {
            assignCentro(p1, secSaludMental, "Lun-Mie-Vie 8-17hs");
            assignCentro(p2, secSaludMental, "Lun-Mie-Vie 8-17hs");
            assignCentro(p3, secSaludMental, "Lun-Mie-Vie 9-16hs");
            assignCentro(p4, secSaludMental, "Mar-Jue 8-17hs, Vie 8-13hs");
        }
        if (hospitalPabloSoria != null) {
            assignCentro(p5, hospitalPabloSoria, "Lun-Vie 8-20hs");
            assignCentro(p6, hospitalPabloSoria, "Lun-Vie 8-20hs");
            assignCentro(p7, hospitalPabloSoria, "Lun-Vie 8-20hs");
            assignCentro(p8, hospitalPabloSoria, "Lun-Vie 8-20hs");
        }
        if (hospitalOscarOrías != null) {
            assignCentro(p9,  hospitalOscarOrías, "Lun-Vie 8-17hs");
            assignCentro(p10, hospitalOscarOrías, "Lun-Vie 8-17hs");
            assignCentro(p11, hospitalOscarOrías, "Lun-Vie 8-17hs");
            assignCentro(p12, hospitalOscarOrías, "Lun-Vie 8-17hs");
        }
        if (hospitalGallardo != null) {
            assignCentro(p13, hospitalGallardo, "Lun-Dom guardia 24hs");
            assignCentro(p14, hospitalGallardo, "Lun-Dom guardia 24hs");
            assignCentro(p15, hospitalGallardo, "Lun-Dom guardia 24hs");
        }
        if (usmaAltoComedero != null) {
            assignCentro(p16, usmaAltoComedero, "Lun-Vie 8-17hs");
            assignCentro(p17, usmaAltoComedero, "Lun-Vie 8-17hs");
            assignCentro(p18, usmaAltoComedero, "Lun-Vie 8-17hs");
        }
        if (hospitalMaternoInfantil != null) {
            assignCentro(p19, hospitalMaternoInfantil, "Lun-Dom guardia 24hs");
            assignCentro(p20, hospitalMaternoInfantil, "Lun-Dom guardia 24hs");
            assignCentro(p21, hospitalMaternoInfantil, "Lun-Dom guardia 24hs");
        }
        if (psiMentalSalud != null) {
            assignCentro(p22, psiMentalSalud, "Lun-Vie 9-20hs");
            assignCentro(p23, psiMentalSalud, "Lun-Vie 9-20hs, Sab 9-13hs");
            assignCentro(p24, psiMentalSalud, "Mar-Vie 10-19hs");
        }

        log.info("Seed de profesionales completado (24 usuarios en 7 centros)");
    }

    /* ─── Idempotent disponibilidad seeder ─── */
    private void seedDisponibilidad() {
        List<Profesional> todos = profesionalRepository.findAllWithUsuario();
        log.info("Sembrando disponibilidad para {} profesionales", todos.size());
        for (Profesional p : todos) {
            if (p.getCentroSalud() == null) continue;
            for (DiaSemana dia : DiaSemana.values()) {
                boolean exists = disponibilidadRepository
                        .findByProfesionalIdAndActivaTrue(p.getId())
                        .stream().anyMatch(d -> d.getDiaSemana() == dia);
                if (exists) continue;
                disponibilidadRepository.save(DisponibilidadProfesional.builder()
                        .profesional(p)
                        .centroSalud(p.getCentroSalud())
                        .diaSemana(dia)
                        .horaInicio(LocalTime.of(8, 0))
                        .horaFin(LocalTime.of(17, 0))
                        .duracionTurnoMinutos(15)
                        .modalidadPermitida("PRESENCIAL")
                        .activa(true)
                        .build());
            }
        }
        log.info("Seed de disponibilidad completado");
    }

    /* ─── Crear usuario solo si no existe ─── */
    private Usuario saveIfNotExists(String email, String nombreCompleto, TipoProfesional tipoProf,
                                     String especialidad, String licencia, String telefono) {
        return usuarioRepository.findByEmail(email).orElseGet(() ->
            usuarioRepository.save(Usuario.builder()
                .nombreCompleto(nombreCompleto).email(email)
                .password(passwordEncoder.encode("password")).telefono(telefono)
                .tipoUsuario(TipoUsuario.PROFESIONAL).tipoProfesional(tipoProf)
                .especialidad(especialidad).numeroLicencia(licencia)
                .activo(true).fechaRegistro(LocalDateTime.now()).emailConfirmado(true)
                .build())
        );
    }

    /* ─── Crear o actualizar relación Profesional → Centro ─── */
    private void assignCentro(Usuario user, CentroSalud centro, String horario) {
        Optional<Profesional> existing = profesionalRepository.findByUsuarioId(user.getId());
        if (existing.isPresent()) {
            Profesional p = existing.get();
            boolean changed = false;
            if (p.getCentroSalud() == null || !p.getCentroSalud().getId().equals(centro.getId())) {
                p.setCentroSalud(centro);
                changed = true;
            }
            if (!horario.equals(p.getHorarioAtencion())) {
                p.setHorarioAtencion(horario);
                changed = true;
            }
            if (changed) profesionalRepository.save(p);
        } else {
            profesionalRepository.save(Profesional.builder()
                .usuario(user).horarioAtencion(horario).centroSalud(centro).build());
        }
    }
}
