ALTER TABLE profesional ADD COLUMN id_centro_salud BIGINT AFTER horario_atencion;
ALTER TABLE profesional ADD CONSTRAINT fk_profesional_centro FOREIGN KEY (id_centro_salud) REFERENCES centro_salud(id_centro);
