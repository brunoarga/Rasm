-- Migrar centros viejos (BsAs) a los reales de Jujuy
-- Mapping: ID 1→Pablo Soria, 2→Oscar Orías, 3→Secretaría Salud Mental, 4→Psi Mental Salud, 5→Clinica Los Lapachos, 6→Hospital Zabala

UPDATE centro_salud SET
  nombre='Hospital Pablo Soria',
  direccion='San Salvador de Jujuy',
  latitud=-24.1880, longitud=-65.2950,
  telefono=NULL,
  tipo_centro='HOSPITAL',
  es_publico=TRUE,
  tiene_emergencias=TRUE,
  horario_atencion='24hs',
  activo=TRUE
WHERE id_centro=1;

UPDATE centro_salud SET
  nombre='Hospital Oscar Orías',
  direccion='Libertador General San Martín',
  latitud=-24.6920, longitud=-64.7860,
  telefono=NULL,
  tipo_centro='HOSPITAL',
  es_publico=TRUE,
  tiene_emergencias=TRUE,
  horario_atencion='24hs',
  activo=TRUE
WHERE id_centro=2;

UPDATE centro_salud SET
  nombre='Secretaría de Salud Mental y Adicciones | Ministerio de Salud',
  direccion='Av. Italia esq. Independencia - San Salvador de Jujuy',
  latitud=-24.1858, longitud=-65.2995,
  telefono='0388-4245500',
  tipo_centro='CENTRO_ATENCION',
  es_publico=TRUE,
  tiene_emergencias=FALSE,
  horario_atencion='Lun-Vie 8:00-18:00',
  activo=TRUE
WHERE id_centro=3;

UPDATE centro_salud SET
  nombre='Psi Mental Salud',
  direccion='Av. Gobernador Jose Maria Fascio 778 - San Salvador de Jujuy',
  latitud=-24.1860, longitud=-65.3020,
  telefono=NULL,
  tipo_centro='CLINICA_PRIVADA',
  es_publico=FALSE,
  tiene_emergencias=FALSE,
  horario_atencion='Lun-Vie 9:00-20:00',
  activo=TRUE
WHERE id_centro=4;

UPDATE centro_salud SET
  nombre='Clinica Los Lapachos',
  direccion='San Salvador de Jujuy',
  latitud=-24.1890, longitud=-65.2960,
  telefono=NULL,
  tipo_centro='CLINICA_PRIVADA',
  es_publico=FALSE,
  tiene_emergencias=TRUE,
  horario_atencion='Lun-Vie 8:00-20:00',
  activo=TRUE
WHERE id_centro=5;

UPDATE centro_salud SET
  nombre='Hospital Zabala',
  direccion='Perico',
  latitud=-24.3780, longitud=-65.1180,
  telefono=NULL,
  tipo_centro='HOSPITAL',
  es_publico=TRUE,
  tiene_emergencias=TRUE,
  horario_atencion='24hs',
  activo=TRUE
WHERE id_centro=6;

-- Insertar los centros restantes (IDs 7-20)
INSERT IGNORE INTO centro_salud (id_centro, nombre, direccion, latitud, longitud, telefono, tipo_centro, es_publico, tiene_emergencias, horario_atencion, activo) VALUES
(7, 'USMA | Alto Comedero', 'Alto Comedero - San Salvador de Jujuy', -24.2150, -65.2720, '388 5839451', 'CENTRO_ATENCION', TRUE, FALSE, 'Lun-Vie 8:00-17:00', TRUE),
(8, 'USMA | Palpalá', 'Yerba Buena s/n - B° Centro Forestal - Palpalá', -24.2550, -65.2110, '388 5983232', 'CENTRO_ATENCION', TRUE, FALSE, 'Lun-Vie 8:00-17:00', TRUE),
(9, 'USMA | Perico', 'Calle 25 de Mayo esq. Alberto Castillo - Perico', -24.3810, -65.1150, NULL, 'CENTRO_ATENCION', TRUE, FALSE, 'Lun-Vie 8:00-17:00', TRUE),
(10, 'Hospital Wenceslao Gallardo', 'Palpalá', -24.2570, -65.2090, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(11, 'Hospital Materno Infantil', 'San Salvador de Jujuy', -24.1900, -65.2980, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(12, 'Hospital San Roque', 'San Salvador de Jujuy', -24.1920, -65.3010, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(13, 'Hospital Paterson', 'San Salvador de Jujuy', -24.1950, -65.2930, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(14, 'Hospital La Mendieta', 'San Salvador de Jujuy', -24.1980, -65.3050, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(15, 'Hospital Uro', 'La Quiaca', -22.1030, -65.5960, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(16, 'Hospital Salvador Mazza', 'Tilcara', -23.5770, -65.3940, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(17, 'Hospital Arroyabe', 'San Salvador de Jujuy (guardias psiquiatría y psicología)', -24.1930, -65.2970, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(18, 'Hospital Sequeiros', 'San Salvador de Jujuy (guardias psiquiatría y psicología)', -24.1960, -65.3000, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
(19, 'Clinica Nuestra Sra del Rosario', 'San Salvador de Jujuy', -24.1870, -65.2910, NULL, 'CLINICA_PRIVADA', FALSE, TRUE, 'Lun-Vie 8:00-20:00', TRUE),
(20, 'Clinica Lavalle', 'San Salvador de Jujuy', -24.1910, -65.2940, NULL, 'CLINICA_PRIVADA', FALSE, TRUE, 'Lun-Vie 8:00-20:00', TRUE);

-- Limpiar y repoblar centro_obra_social_practica
DELETE FROM centro_obra_social_practica;

-- Centros de salud mental públicos con PAMI (2)
INSERT INTO centro_obra_social_practica (id_centro, id_obra_social, tipo_practica, requiere_autorizacion, dias_estimado_respuesta, activo) VALUES
(3, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (3, 2, 'SALUD_MENTAL', FALSE, 0, TRUE),
(7, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (7, 2, 'SALUD_MENTAL', FALSE, 0, TRUE),
(8, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (8, 2, 'SALUD_MENTAL', FALSE, 0, TRUE),
(9, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (9, 2, 'SALUD_MENTAL', FALSE, 0, TRUE),
-- Hospitales públicos con PAMI (2)
(1, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (1, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (1, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(2, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (2, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (2, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(6, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (6, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (6, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(10, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (10, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (10, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(11, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (11, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (11, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(12, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (12, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (12, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(13, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (13, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (13, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(14, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (14, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (14, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(15, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (15, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (15, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(16, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (16, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (16, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(17, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (17, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (17, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(18, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (18, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (18, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
-- Clínicas privadas con OSDE (3), Swiss Medical (4), Medicus (6), Galeno (7)
(4, 3, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (4, 3, 'SALUD_MENTAL', FALSE, 0, TRUE),
(4, 4, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (4, 4, 'SALUD_MENTAL', FALSE, 0, TRUE),
(4, 6, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (4, 6, 'SALUD_MENTAL', FALSE, 0, TRUE),
(4, 7, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (4, 7, 'SALUD_MENTAL', FALSE, 0, TRUE),
(5, 3, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (5, 3, 'SALUD_MENTAL', FALSE, 0, TRUE), (5, 3, 'GUARDIA_EMERGENCIA', TRUE, 48, TRUE),
(5, 4, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (5, 4, 'SALUD_MENTAL', TRUE, 24, TRUE),
(19, 3, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (19, 3, 'INTERNACION', TRUE, 72, TRUE), (19, 3, 'SALUD_MENTAL', TRUE, 48, TRUE),
(19, 4, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (19, 4, 'SALUD_MENTAL', TRUE, 48, TRUE),
(20, 3, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (20, 3, 'SALUD_MENTAL', FALSE, 0, TRUE),
(20, 4, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (20, 4, 'SALUD_MENTAL', FALSE, 0, TRUE),
-- Sin Cobertura (1) en centros públicos
(1, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (1, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (1, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(2, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (2, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (2, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(3, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (3, 1, 'SALUD_MENTAL', FALSE, 0, TRUE),
(6, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (6, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (6, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(7, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (7, 1, 'SALUD_MENTAL', FALSE, 0, TRUE),
(8, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (8, 1, 'SALUD_MENTAL', FALSE, 0, TRUE),
(9, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (9, 1, 'SALUD_MENTAL', FALSE, 0, TRUE),
(10, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (10, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (10, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(11, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (11, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (11, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(12, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (12, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (12, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(13, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (13, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (13, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(14, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (14, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (14, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(15, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (15, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (15, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(16, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (16, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (16, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(17, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (17, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (17, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(18, 1, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (18, 1, 'SALUD_MENTAL', FALSE, 0, TRUE), (18, 1, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE);
