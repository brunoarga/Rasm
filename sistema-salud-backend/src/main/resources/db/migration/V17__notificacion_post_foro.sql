SET @db = (SELECT DATABASE());

SET @exists_col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'notificacion' AND COLUMN_NAME = 'id_post');
SET @sql_col = IF(@exists_col = 0, 'ALTER TABLE notificacion ADD COLUMN id_post BIGINT NULL AFTER id_solicitud', 'SELECT 1');
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_fk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'notificacion' AND CONSTRAINT_NAME = 'fk_notif_post');
SET @sql_fk = IF(@exists_fk = 0, 'ALTER TABLE notificacion ADD CONSTRAINT fk_notif_post FOREIGN KEY (id_post) REFERENCES post_foro(id_post)', 'SELECT 1');
PREPARE stmt FROM @sql_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;