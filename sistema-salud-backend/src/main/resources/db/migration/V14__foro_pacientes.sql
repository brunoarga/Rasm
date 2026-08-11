SET @db = (SELECT DATABASE());

SET @exists_post = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'post_foro');
SET @sql_post = IF(@exists_post = 0, 'CREATE TABLE post_foro (id_post BIGINT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(200) NOT NULL, contenido TEXT NOT NULL, fecha_creacion DATETIME NOT NULL, es_anonimo TINYINT(1) NOT NULL DEFAULT 0, categoria VARCHAR(50) NOT NULL, cantidad_apoyos INT NOT NULL DEFAULT 0, id_paciente BIGINT NOT NULL, CONSTRAINT fk_post_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'SELECT 1');
PREPARE stmt FROM @sql_post;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_com = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'comentario_foro');
SET @sql_com = IF(@exists_com = 0, 'CREATE TABLE comentario_foro (id_comentario BIGINT AUTO_INCREMENT PRIMARY KEY, contenido TEXT NOT NULL, fecha_creacion DATETIME NOT NULL, es_anonimo TINYINT(1) NOT NULL DEFAULT 0, id_post BIGINT NOT NULL, id_paciente BIGINT NOT NULL, CONSTRAINT fk_comentario_post FOREIGN KEY (id_post) REFERENCES post_foro(id_post), CONSTRAINT fk_comentario_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', 'SELECT 1');
PREPARE stmt FROM @sql_com;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
