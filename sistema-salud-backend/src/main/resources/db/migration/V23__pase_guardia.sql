SET @db = (SELECT DATABASE());

-- Código de pase único por turno (ficha de admisión / QR)
SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cita' AND COLUMN_NAME = 'codigo_pase');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE cita ADD COLUMN codigo_pase VARCHAR(16) NULL AFTER recordatorio_2h_enviado', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_idx = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cita' AND INDEX_NAME = 'uk_cita_codigo_pase');
SET @sql_idx = IF(@exists_idx = 0, 'ALTER TABLE cita ADD UNIQUE INDEX uk_cita_codigo_pase (codigo_pase)', 'SELECT 1');
PREPARE stmt FROM @sql_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Fecha de presentación del paciente en la recepción del centro
SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cita' AND COLUMN_NAME = 'fecha_presentacion');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE cita ADD COLUMN fecha_presentacion TIMESTAMP NULL AFTER codigo_pase', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- URL de webhook opcional por centro (integración con sistemas de admisión propios)
SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'centro_salud' AND COLUMN_NAME = 'webhook_url');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE centro_salud ADD COLUMN webhook_url VARCHAR(255) NULL AFTER telefono_institucional', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;