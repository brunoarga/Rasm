SET @db = (SELECT DATABASE());

SET @exists_columna = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'paciente' AND COLUMN_NAME = 'id_profesional_registra');
SET @sql_columna = IF(@exists_columna = 0, 'ALTER TABLE paciente ADD COLUMN id_profesional_registra BIGINT NULL AFTER id_obra_social', 'SELECT 1');
PREPARE stmt FROM @sql_columna;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_fk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'paciente' AND CONSTRAINT_NAME = 'fk_paciente_profesional_registra');
SET @sql_fk = IF(@exists_fk = 0, 'ALTER TABLE paciente ADD CONSTRAINT fk_paciente_profesional_registra FOREIGN KEY (id_profesional_registra) REFERENCES profesional(id_profesional)', 'SELECT 1');
PREPARE stmt FROM @sql_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
