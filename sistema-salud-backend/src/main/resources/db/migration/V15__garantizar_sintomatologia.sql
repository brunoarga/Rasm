CREATE TABLE IF NOT EXISTS registro_sintomatologia (
    id_registro BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    fecha DATE NOT NULL,
    calidad_suenio INT NOT NULL,
    estres_ansiedad INT NOT NULL,
    adherencia INT NOT NULL,
    notas TEXT,
    CONSTRAINT fk_sintomatologia_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
