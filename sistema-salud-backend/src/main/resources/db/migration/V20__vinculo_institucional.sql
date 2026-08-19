SET @db = (SELECT DATABASE());

SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'secretario' AND COLUMN_NAME = 'id_centro_salud');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE secretario ADD COLUMN id_centro_salud BIGINT NULL AFTER id_usuario', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_fk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'secretario' AND CONSTRAINT_NAME = 'fk_secretario_centro');
SET @sql_fk = IF(@exists_fk = 0, 'ALTER TABLE secretario ADD CONSTRAINT fk_secretario_centro FOREIGN KEY (id_centro_salud) REFERENCES centro_salud(id_centro)', 'SELECT 1');
PREPARE stmt FROM @sql_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'solicitud' AND COLUMN_NAME = 'folio');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE solicitud ADD COLUMN folio VARCHAR(30) NULL AFTER id_solicitud', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_idx = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'solicitud' AND INDEX_NAME = 'idx_solicitud_folio');
SET @sql_idx = IF(@exists_idx = 0, 'CREATE INDEX idx_solicitud_folio ON solicitud (folio)', 'SELECT 1');
PREPARE stmt FROM @sql_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'centro_salud' AND COLUMN_NAME = 'email_institucional');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE centro_salud ADD COLUMN email_institucional VARCHAR(150) NULL AFTER telefono', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'centro_salud' AND COLUMN_NAME = 'telefono_institucional');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE centro_salud ADD COLUMN telefono_institucional VARCHAR(20) NULL AFTER email_institucional', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS bitacora_solicitud (
    id_bitacora BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    id_usuario BIGINT,
    estado_desde VARCHAR(20),
    estado_hasta VARCHAR(20),
    detalle TEXT NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    CONSTRAINT fk_bitacora_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud),
    CONSTRAINT fk_bitacora_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_bitacora_solicitud_fecha ON bitacora_solicitud (id_solicitud, fecha_creacion);
