ALTER TABLE solicitud ADD COLUMN anamnesis TEXT AFTER resumen_breve;

-- Nuevas categorías clínicas para triaje
INSERT INTO categoria_ayuda (nombre, descripcion, prioridad, icono, activa) VALUES
('Depresión', 'Trastorno del ánimo - episodio depresivo mayor o distimia', 'MEDIA', 'depression', TRUE),
('Pánico', 'Crisis de pánico recurrente o trastorno de pánico', 'ALTA', 'panic', TRUE),
('Fobias', 'Trastorno de ansiedad fóbica específica o social', 'BAJA', 'fobia', TRUE),
('Conflictos familiares', 'Problemáticas vinculares, comunicación, parentalidad', 'BAJA', 'familia', TRUE),
('Violencia de género / intrafamiliar', 'Situaciones de violencia por razones de género o violencia doméstica', 'URGENTE', 'violencia', TRUE),
('Consumo Problemático y Adicciones', 'Consumo problemático de sustancias o adicciones comportamentales', 'ALTA', 'adiccion', TRUE),
('Crisis Vitales, Duelo y Pérdidas', 'Procesos de duelo, crisis vitales, pérdidas significativas', 'MEDIA', 'duelo', TRUE),
('Salud Sexual, Reproductiva y IVE/ILE', 'Asesoramiento y acompañamiento en salud sexual, IVE/ILE', 'ALTA', 'sexual', TRUE),
('Trastornos de la Conducta Alimentaria', 'TCA: anorexia, bulimia, trastorno por atracón', 'ALTA', 'tca', TRUE),
('Burnout y Estrés Ocupacional Severo', 'Síndrome de desgaste profesional, estrés laboral crónico', 'BAJA', 'burnout', TRUE),
('Otro motivo clínico especificado', 'Otra consulta de salud mental no contemplada en las categorías anteriores', 'BAJA', 'otro', TRUE);
