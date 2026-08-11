-- Categorias de ayuda
INSERT INTO categoria_ayuda (nombre, descripcion, prioridad, icono, activa) VALUES
('Consumo de Sustancias / Adicciones', 'Atencion para personas con consumo problematico de sustancias', 'ALTA', 'warning', TRUE),
('Violencia o Abuso', 'Situaciones de violencia familiar, de genero o abuso', 'URGENTE', 'danger', TRUE),
('IVE / ILE', 'Acompanamiento en la Interrupcion del Embarazo', 'ALTA', 'heart', TRUE),
('Ansiedad, Panico o Tristeza Profunda', 'Ataques de panico, ansiedad generalizada o depresion', 'MEDIA', 'moon', TRUE),
('Problemas Familiares o de Pareja', 'Conflictos familiares, separacion, duelo', 'MEDIA', 'users', TRUE);

-- Obras sociales
INSERT INTO obra_social (nombre, tipo, telefono_autorizaciones, activa) VALUES
('Sin Cobertura', 'PUBLICA', NULL, TRUE),
('PAMI', 'PUBLICA', '0800-222-7264', TRUE),
('OSDE', 'PRIVADA', '0800-888-6733', TRUE),
('Swiss Medical', 'PREPAGA', '0800-555-5050', TRUE),
('IOMA', 'PUBLICA', '0800-666-4662', TRUE),
('Medicus', 'PREPAGA', '0800-888-3000', TRUE),
('Galeno', 'PREPAGA', '0800-777-7777', TRUE);

-- Centros de salud (Jujuy)
INSERT INTO centro_salud (nombre, direccion, latitud, longitud, telefono, tipo_centro, es_publico, tiene_emergencias, horario_atencion, activo) VALUES
('Secretaría de Salud Mental y Adicciones | Ministerio de Salud', 'Av. Italia esq. Independencia - San Salvador de Jujuy', -24.1858, -65.2995, '0388-4245500 ', 'CENTRO_ATENCION', TRUE, FALSE, 'Lun-Vie 8:00-18:00', TRUE),
('USMA | Alto Comedero', 'Alto Comedero - San Salvador de Jujuy', -24.2150, -65.2720, '388 5839451', 'CENTRO_ATENCION', TRUE, FALSE, 'Lun-Vie 8:00-17:00', TRUE),
('USMA | Palpalá', 'Yerba Buena s/n - B° Centro Forestal - Palpalá', -24.2550, -65.2110, '388 5983232', 'CENTRO_ATENCION', TRUE, FALSE, 'Lun-Vie 8:00-17:00', TRUE),
('USMA | Perico', 'Calle 25 de Mayo esq. Alberto Castillo - Perico', -24.3810, -65.1150, NULL, 'CENTRO_ATENCION', TRUE, FALSE, 'Lun-Vie 8:00-17:00', TRUE),
('Hospital Wenceslao Gallardo', 'Palpalá', -24.2570, -65.2090, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Pablo Soria', 'San Salvador de Jujuy', -24.1880, -65.2950, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Materno Infantil', 'San Salvador de Jujuy', -24.1900, -65.2980, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital San Roque', 'San Salvador de Jujuy', -24.1920, -65.3010, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Paterson', 'San Salvador de Jujuy', -24.1950, -65.2930, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital La Mendieta', 'San Salvador de Jujuy', -24.1980, -65.3050, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Oscar Orías', 'Libertador General San Martín', -24.6920, -64.7860, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Uro', 'La Quiaca', -22.1030, -65.5960, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Salvador Mazza', 'Tilcara', -23.5770, -65.3940, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Arroyabe', 'San Salvador de Jujuy (guardias psiquiatría y psicología)', -24.1930, -65.2970, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Sequeiros', 'San Salvador de Jujuy (guardias psiquiatría y psicología)', -24.1960, -65.3000, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Hospital Zabala', 'Perico', -24.3780, -65.1180, NULL, 'HOSPITAL', TRUE, TRUE, '24hs', TRUE),
('Psi Mental Salud', 'Av. Gobernador Jose Maria Fascio 778 - San Salvador de Jujuy', -24.1860, -65.3020, NULL, 'CLINICA_PRIVADA', FALSE, FALSE, 'Lun-Vie 9:00-20:00', TRUE),
('Clinica Los Lapachos', 'San Salvador de Jujuy', -24.1890, -65.2960, NULL, 'CLINICA_PRIVADA', FALSE, TRUE, 'Lun-Vie 8:00-20:00', TRUE),
('Clinica Nuestra Sra del Rosario', 'San Salvador de Jujuy', -24.1870, -65.2910, NULL, 'CLINICA_PRIVADA', FALSE, TRUE, 'Lun-Vie 8:00-20:00', TRUE),
('Clinica Lavalle', 'San Salvador de Jujuy', -24.1910, -65.2940, NULL, 'CLINICA_PRIVADA', FALSE, TRUE, 'Lun-Vie 8:00-20:00', TRUE);

-- Centro-ObraSocial-Practica (centros públicos para PAMI, OSDE, Swiss Medical, IOMA, Medicus, Galeno)
INSERT INTO centro_obra_social_practica (id_centro, id_obra_social, tipo_practica, requiere_autorizacion, dias_estimado_respuesta, activo) VALUES
-- Centros de salud mental públicos con PAMI (2)
(1, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (1, 2, 'SALUD_MENTAL', FALSE, 0, TRUE),
(2, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (2, 2, 'SALUD_MENTAL', FALSE, 0, TRUE),
(3, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (3, 2, 'SALUD_MENTAL', FALSE, 0, TRUE),
(4, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (4, 2, 'SALUD_MENTAL', FALSE, 0, TRUE),
-- Hospitales públicos con PAMI (2)
(5, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (5, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (5, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(6, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (6, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (6, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(7, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (7, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (7, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(8, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (8, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (8, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(9, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (9, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (9, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(10, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (10, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (10, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(11, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (11, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (11, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(12, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (12, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (12, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(13, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (13, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (13, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(14, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (14, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (14, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(15, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (15, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (15, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
(16, 2, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (16, 2, 'SALUD_MENTAL', FALSE, 0, TRUE), (16, 2, 'GUARDIA_EMERGENCIA', FALSE, 0, TRUE),
-- Clínicas privadas con OSDE (3), Swiss Medical (4), IOMA (5), Medicus (6), Galeno (7)
(17, 3, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (17, 3, 'SALUD_MENTAL', FALSE, 0, TRUE),
(17, 4, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (17, 4, 'SALUD_MENTAL', FALSE, 0, TRUE),
(17, 6, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (17, 6, 'SALUD_MENTAL', FALSE, 0, TRUE),
(17, 7, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (17, 7, 'SALUD_MENTAL', FALSE, 0, TRUE),
(18, 3, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (18, 3, 'SALUD_MENTAL', FALSE, 0, TRUE), (18, 3, 'GUARDIA_EMERGENCIA', TRUE, 48, TRUE),
(18, 4, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (18, 4, 'SALUD_MENTAL', TRUE, 24, TRUE),
(19, 3, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (19, 3, 'INTERNACION', TRUE, 72, TRUE), (19, 3, 'SALUD_MENTAL', TRUE, 48, TRUE),
(19, 4, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (19, 4, 'SALUD_MENTAL', TRUE, 48, TRUE),
(20, 3, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (20, 3, 'SALUD_MENTAL', FALSE, 0, TRUE),
(20, 4, 'CONSULTA_AMBULATORIA', FALSE, 0, TRUE), (20, 4, 'SALUD_MENTAL', FALSE, 0, TRUE);
