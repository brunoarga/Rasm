CREATE TABLE disponibilidad_profesional (
    id_disponibilidad BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_profesional BIGINT NOT NULL,
    id_centro_salud BIGINT NOT NULL,
    dia_semana VARCHAR(10) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_turno_minutos INT DEFAULT 15,
    modalidad_permitida VARCHAR(20) DEFAULT 'PRESENCIAL',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_disp_profesional FOREIGN KEY (id_profesional) REFERENCES profesional(id_profesional),
    CONSTRAINT fk_disp_centro FOREIGN KEY (id_centro_salud) REFERENCES centro_salud(id_centro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO disponibilidad_profesional (id_profesional, id_centro_salud, dia_semana, hora_inicio, hora_fin, duracion_turno_minutos, modalidad_permitida, activa)
SELECT p.id_profesional, p.id_centro_salud, 'LUNES', '08:00', '17:00', 15, 'PRESENCIAL', TRUE
FROM profesional p WHERE p.id_centro_salud IS NOT NULL;

INSERT INTO disponibilidad_profesional (id_profesional, id_centro_salud, dia_semana, hora_inicio, hora_fin, duracion_turno_minutos, modalidad_permitida, activa)
SELECT p.id_profesional, p.id_centro_salud, 'MIERCOLES', '08:00', '17:00', 15, 'PRESENCIAL', TRUE
FROM profesional p WHERE p.id_centro_salud IS NOT NULL;

INSERT INTO disponibilidad_profesional (id_profesional, id_centro_salud, dia_semana, hora_inicio, hora_fin, duracion_turno_minutos, modalidad_permitida, activa)
SELECT p.id_profesional, p.id_centro_salud, 'VIERNES', '08:00', '17:00', 15, 'PRESENCIAL', TRUE
FROM profesional p WHERE p.id_centro_salud IS NOT NULL;
