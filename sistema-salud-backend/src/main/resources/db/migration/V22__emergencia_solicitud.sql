SET @db = (SELECT DATABASE());

SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'solicitud' AND COLUMN_NAME = 'emergencia');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE solicitud ADD COLUMN emergencia TINYINT(1) NOT NULL DEFAULT 0 AFTER activa', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;