CREATE TABLE IF NOT EXISTS conversacion (
    id_conversacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud BIGINT NOT NULL UNIQUE,
    fecha_creacion DATETIME NOT NULL,
    fecha_ultimo_mensaje DATETIME,
    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    CONSTRAINT fk_conv_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mensaje (
    id_mensaje BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_conversacion BIGINT NOT NULL,
    id_emisor BIGINT NOT NULL,
    contenido TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_envio DATETIME NOT NULL,
    CONSTRAINT fk_msg_conversacion FOREIGN KEY (id_conversacion) REFERENCES conversacion(id_conversacion),
    CONSTRAINT fk_msg_emisor FOREIGN KEY (id_emisor) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_msg_conversacion_fecha ON mensaje (id_conversacion, fecha_envio);

SET @db = (SELECT DATABASE());

SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cita' AND COLUMN_NAME = 'recordatorio_24h_enviado');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE cita ADD COLUMN recordatorio_24h_enviado BOOLEAN NOT NULL DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cita' AND COLUMN_NAME = 'recordatorio_2h_enviado');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE cita ADD COLUMN recordatorio_2h_enviado BOOLEAN NOT NULL DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
