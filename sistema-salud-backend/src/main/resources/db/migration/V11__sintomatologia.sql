SET @db = (SELECT DATABASE());

SET @exists_tabla = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'registro_sintomatologia');
SET @sql_tabla = IF(@exists_tabla = 0, 'CREATE TABLE registro_sintomatologia (id_registro BIGINT AUTO_INCREMENT PRIMARY KEY, id_paciente BIGINT NOT NULL, fecha DATE NOT NULL, calidad_suenio INT NOT NULL, estres_ansiedad INT NOT NULL, adherencia INT NOT NULL, notas TEXT, CONSTRAINT fk_sintomatologia_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'SELECT 1');
PREPARE stmt FROM @sql_tabla;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
