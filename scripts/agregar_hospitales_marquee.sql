-- ============================================================
-- ALINEAR CENTROS DE SALUD CON LA PÁGINA PRINCIPAL
-- Hace coincidir la vista de derivación de la secretaría
-- (centro_salud + centro_obra_social_practica) con la lista
-- de centros/clínicas que muestra el marquee del LandingPage.
-- ============================================================

START TRANSACTION;

-- ── 1) Consolidar duplicados existentes ─────────────────────
-- Oscar Orías: existía en id 2 y 11 -> mantener 2
UPDATE sistema_salud.profesional SET id_centro_salud = 2 WHERE id_centro_salud = 11;
UPDATE sistema_salud.disponibilidad_profesional SET id_centro_salud = 2 WHERE id_centro_salud = 11;
DELETE FROM sistema_salud.centro_obra_social_practica WHERE id_centro = 11;
DELETE FROM sistema_salud.centro_salud WHERE id_centro = 11;

-- Zabala: existía en id 6 y 16 -> mantener 6
UPDATE sistema_salud.profesional SET id_centro_salud = 6 WHERE id_centro_salud = 16;
UPDATE sistema_salud.disponibilidad_profesional SET id_centro_salud = 6 WHERE id_centro_salud = 16;
DELETE FROM sistema_salud.centro_obra_social_practica WHERE id_centro = 16;
DELETE FROM sistema_salud.centro_salud WHERE id_centro = 16;

-- Psi Mental: existía en id 4 y 17 -> mantener 17 (tiene profesionales)
UPDATE sistema_salud.profesional SET id_centro_salud = 17 WHERE id_centro_salud = 4;
UPDATE sistema_salud.disponibilidad_profesional SET id_centro_salud = 17 WHERE id_centro_salud = 4;
DELETE FROM sistema_salud.centro_obra_social_practica WHERE id_centro = 4;
DELETE FROM sistema_salud.centro_salud WHERE id_centro = 4;

-- Lapachos: existía en id 5 y 18 -> mantener 5 (tiene profesionales)
UPDATE sistema_salud.profesional SET id_centro_salud = 5 WHERE id_centro_salud = 18;
UPDATE sistema_salud.disponibilidad_profesional SET id_centro_salud = 5 WHERE id_centro_salud = 18;
DELETE FROM sistema_salud.centro_obra_social_practica WHERE id_centro = 18;
DELETE FROM sistema_salud.centro_salud WHERE id_centro = 18;

-- ── 2) Renombrar centros existentes para coincidir con la página ──
UPDATE sistema_salud.centro_salud
SET nombre = 'Hospital Arturo Zabala', direccion = 'Perico'
WHERE id_centro = 6;

UPDATE sistema_salud.centro_salud
SET nombre = 'Hospital Néstor Sequeiros',
    direccion = 'San Salvador de Jujuy (guardias psiquiatría y psicología)'
WHERE id_centro = 15;

UPDATE sistema_salud.centro_salud
SET nombre = 'Sanatorio Nuestra Señora del Rosario',
    direccion = 'General Belgrano 356, San Salvador de Jujuy',
    telefono = '0388 423-1086'
WHERE id_centro = 19;

UPDATE sistema_salud.centro_salud
SET nombre = 'Sanatorio Lavalle',
    direccion = 'Calle General Otero 337',
    telefono = '0388 423-1999'
WHERE id_centro = 20;

UPDATE sistema_salud.centro_salud SET direccion = 'San Pedro'
WHERE id_centro = 9 AND nombre = 'Hospital Paterson';

-- ── 3) Agregar hospitales y clínicas que faltan ─────────────
INSERT INTO sistema_salud.centro_salud (nombre, direccion, telefono, tipo_centro, es_publico, tiene_emergencias, horario_atencion, activo) VALUES
('Hospital Carlos Snopek', 'San Salvador de Jujuy', NULL, 'HOSPITAL', TRUE, TRUE, 'Lun-Vie 6:30-16hs', TRUE),
('Hospital Dr. Wenceslao Gallardo', 'Palpalá', NULL, 'HOSPITAL', TRUE, TRUE, 'Lun-Vie 6:30-16hs', TRUE),
('Hospital Ntra. Sra. del Carmen', 'El Carmen', NULL, 'HOSPITAL', TRUE, TRUE, 'Lun-Vie 6-13hs', TRUE),
('Hospital San Isidro Labrador', 'Monterrico', NULL, 'HOSPITAL', TRUE, TRUE, 'Lun-Vie 6:30-11:30hs', TRUE),
('Hospital Calilegua', 'Calilegua', NULL, 'HOSPITAL', TRUE, TRUE, 'Lun-Vie 6:30-14hs', TRUE),
('Hospital San Miguel', 'Yuto', NULL, 'HOSPITAL', TRUE, TRUE, 'Lun-Vie 7-11:30hs', TRUE),
('Hospital Zegada', 'Fraile Pintado', NULL, 'HOSPITAL', TRUE, TRUE, 'Lun-Vie 6:30-12hs', TRUE),
('Instituto de Psicopatología SRL', 'Calle General San Martín 141, San Salvador de Jujuy', '0388 423-1397', 'CLINICA_PRIVADA', FALSE, FALSE, 'Lun-Vie 9-20hs', TRUE),
('Clínica Mayo', 'Calle General Alvear 1299', '0388 483-3411', 'CLINICA_PRIVADA', FALSE, TRUE, 'Lun-Vie 8-20hs', TRUE);

-- ── 4) Habilitar los nuevos centros en la derivación ────────
-- Hospitales públicos: cobertura Sin Cobertura (1) y PAMI (2)
SET @c_snopek  = (SELECT id_centro FROM sistema_salud.centro_salud WHERE nombre = 'Hospital Carlos Snopek');
SET @c_gallardo = (SELECT id_centro FROM sistema_salud.centro_salud WHERE nombre = 'Hospital Dr. Wenceslao Gallardo');
SET @c_carmen  = (SELECT id_centro FROM sistema_salud.centro_salud WHERE nombre = 'Hospital Ntra. Sra. del Carmen');
SET @c_labrador = (SELECT id_centro FROM sistema_salud.centro_salud WHERE nombre = 'Hospital San Isidro Labrador');
SET @c_calilegua = (SELECT id_centro FROM sistema_salud.centro_salud WHERE nombre = 'Hospital Calilegua');
SET @c_smiguel = (SELECT id_centro FROM sistema_salud.centro_salud WHERE nombre = 'Hospital San Miguel');
SET @c_zegada  = (SELECT id_centro FROM sistema_salud.centro_salud WHERE nombre = 'Hospital Zegada');

INSERT INTO sistema_salud.centro_obra_social_practica (id_centro, id_obra_social, tipo_practica, requiere_autorizacion, dias_estimado_respuesta, activo) VALUES
(@c_snopek, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_snopek, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_snopek, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_snopek, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_snopek, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_snopek, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_gallardo, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_gallardo, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_gallardo, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_gallardo, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_gallardo, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_gallardo, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_carmen, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_carmen, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_carmen, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_carmen, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_carmen, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_carmen, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_labrador, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_labrador, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_labrador, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_labrador, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_labrador, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_labrador, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_calilegua, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_calilegua, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_calilegua, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_calilegua, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_calilegua, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_calilegua, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_smiguel, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_smiguel, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_smiguel, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_smiguel, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_smiguel, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_smiguel, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_zegada, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_zegada, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_zegada, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(@c_zegada, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (@c_zegada, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (@c_zegada, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE);

-- ── 5) Quitar de la derivación los centros que NO están en la página principal ──
-- Secretaría de Salud Mental (3), Los Lapachos (5), Materno Infantil (7),
-- La Mendieta (10), Uro (12), Salvador Mazza (13), Arroyabe (14), Psi Mental (17).
-- Se desactivan SOLO las relaciones de derivación (los centros y sus profesionales quedan).
UPDATE sistema_salud.centro_obra_social_practica
SET activo = FALSE
WHERE id_centro IN (3, 5, 7, 10, 12, 13, 14, 17);

-- ── 6) Mapear todas las obras sociales a los 17 centros del marquee ──
-- Para que la lista de derivación coincida con la página principal sin
-- importar la obra social del paciente.
INSERT IGNORE INTO sistema_salud.centro_obra_social_practica
  (id_centro, id_obra_social, tipo_practica, requiere_autorizacion, dias_estimado_respuesta, activo)
SELECT c.id_centro, os.id_obra_social, tp.tipo_practica, FALSE, 0, TRUE
FROM (
  SELECT id_centro FROM sistema_salud.centro_salud
  WHERE id_centro IN (1, 2, 6, 8, 9, 15, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29)
) c
CROSS JOIN sistema_salud.obra_social os
CROSS JOIN (
  SELECT 'CONSULTA_AMBULATORIA' AS tipo_practica
  UNION SELECT 'SALUD_MENTAL'
  UNION SELECT 'GUARDIA_EMERGENCIA'
) tp
WHERE NOT EXISTS (
  SELECT 1 FROM sistema_salud.centro_obra_social_practica x
  WHERE x.id_centro = c.id_centro AND x.id_obra_social = os.id_obra_social
    AND x.tipo_practica = tp.tipo_practica AND x.activo = TRUE
);

COMMIT;
