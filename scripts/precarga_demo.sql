-- ============================================================
-- PRECARGA DEMO - 1 ejemplo completo
-- Caso: Juan Perez (OSDE) -> Solicitud "Depresión" ASIGNADA
--       con turno asignado a Lic. Mariano Martinez
--       (Hospital Pablo Soria, id_centro 1)
-- Fecha del turno: mañana 10:00 hs (futura, para que se vea
-- en "Próxima Consulta" y en la agenda del profesional).
-- ============================================================

START TRANSACTION;

-- 1) Solicitud
INSERT INTO solicitud
  (id_paciente, id_profesional, id_categoria, id_centro_salud, fecha_turno,
   duracion_turno, modalidad, titulo, descripcion, resumen_breve, anamnesis,
   estado, prioridad, fecha_creacion, fecha_actualizacion, activa)
VALUES
  (1, 1, 6, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'),
   30, 'PRESENCIAL',
   'Evaluación inicial por síntomas depresivos',
   'El paciente refiere tristeza persistente, dificultad para conciliar el sueño y pérdida de motivación. Sin ideación suicida. Primera consulta con salud mental.',
   'Primera consulta por síntomas depresivos.',
   'Tratamiento previo: ninguno. Antecedentes familiares de depresión. Consumo de alcohol ocasional. Red de apoyo presente.',
   'ASIGNADA', 'ALTA', NOW(), NOW(), TRUE);

SET @solicitud_id = LAST_INSERT_ID();

-- 2) Cita (turno programado)
INSERT INTO cita
  (id_solicitud, id_profesional, id_centro_salud, fecha_hora, duracion,
   modalidad, estado, notas, tipo_practica, requiere_autorizacion, estado_autorizacion)
VALUES
  (@solicitud_id, 1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'),
   30, 'PRESENCIAL', 'PROGRAMADA',
   'Primera consulta - evaluación inicial',
   'CONSULTA_AMBULATORIA', FALSE, 'NO_REQUERIDA');

-- 3) Notificación (una sola: "Turno asignado" para el paciente)
INSERT INTO notificacion (id_usuario, id_solicitud, titulo, mensaje, leida, fecha_envio) VALUES
  (7, @solicitud_id, 'Turno asignado', 'Se asignó tu turno con Lic. Mariano Martinez para mañana a las 10:00 hs.', FALSE, NOW());

COMMIT;

SELECT id_solicitud, estado, prioridad, fecha_turno, modalidad
FROM solicitud WHERE id_solicitud = @solicitud_id;
