CREATE TABLE IF NOT EXISTS alerta_demora (
    id_alerta BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    id_centro_salud BIGINT,
    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    tipo VARCHAR(20) NOT NULL DEFAULT 'DEMORA',
    detalle VARCHAR(500),
    fecha_generada DATETIME NOT NULL,
    fecha_resuelta DATETIME,
    CONSTRAINT fk_alerta_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud),
    CONSTRAINT fk_alerta_centro FOREIGN KEY (id_centro_salud) REFERENCES centro_salud(id_centro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_alerta_estado_fecha ON alerta_demora (estado, fecha_generada);
