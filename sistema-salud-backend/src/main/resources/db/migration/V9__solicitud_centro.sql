SET @db = (SELECT DATABASE());

SET @exists_centro = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'solicitud' AND COLUMN_NAME = 'id_centro_salud');
SET @sql_centro = IF(@exists_centro = 0, 'ALTER TABLE solicitud ADD COLUMN id_centro_salud BIGINT AFTER id_categoria', 'SELECT 1');
PREPARE stmt FROM @sql_centro;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_fecha = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'solicitud' AND COLUMN_NAME = 'fecha_turno');
SET @sql_fecha = IF(@exists_fecha = 0, 'ALTER TABLE solicitud ADD COLUMN fecha_turno TIMESTAMP NULL AFTER id_centro_salud', 'SELECT 1');
PREPARE stmt FROM @sql_fecha;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_duracion = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'solicitud' AND COLUMN_NAME = 'duracion_turno');
SET @sql_duracion = IF(@exists_duracion = 0, 'ALTER TABLE solicitud ADD COLUMN duracion_turno INT NULL AFTER fecha_turno', 'SELECT 1');
PREPARE stmt FROM @sql_duracion;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_modalidad = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'solicitud' AND COLUMN_NAME = 'modalidad');
SET @sql_modalidad = IF(@exists_modalidad = 0, 'ALTER TABLE solicitud ADD COLUMN modalidad VARCHAR(20) NULL AFTER duracion_turno', 'SELECT 1');
PREPARE stmt FROM @sql_modalidad;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_fk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'solicitud' AND CONSTRAINT_NAME = 'fk_solicitud_centro');
SET @sql_fk = IF(@exists_fk = 0, 'ALTER TABLE solicitud ADD CONSTRAINT fk_solicitud_centro FOREIGN KEY (id_centro_salud) REFERENCES centro_salud(id_centro)', 'SELECT 1');
PREPARE stmt FROM @sql_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;