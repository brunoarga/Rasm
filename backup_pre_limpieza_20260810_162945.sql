-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_salud
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `autorizacion_obra_social`
--

DROP TABLE IF EXISTS `autorizacion_obra_social`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autorizacion_obra_social` (
  `id_autorizacion` bigint NOT NULL AUTO_INCREMENT,
  `id_cita` bigint NOT NULL,
  `id_obra_social` bigint NOT NULL,
  `numero_solicitud` varchar(50) DEFAULT NULL,
  `numero_autorizacion` varchar(50) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `diagnostico_autorizacion` text,
  `codigo_practica` varchar(20) DEFAULT NULL,
  `monto_autorizado` decimal(10,2) DEFAULT NULL,
  `observaciones_autorizacion` text,
  `fecha_solicitud` timestamp NULL DEFAULT NULL,
  `fecha_respuesta` timestamp NULL DEFAULT NULL,
  `archivo_autorizacion` varchar(255) DEFAULT NULL,
  `creado_por` bigint DEFAULT NULL,
  PRIMARY KEY (`id_autorizacion`),
  KEY `fk_aut_cita` (`id_cita`),
  KEY `fk_aut_obra_social` (`id_obra_social`),
  KEY `fk_aut_usuario` (`creado_por`),
  CONSTRAINT `fk_aut_cita` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id_cita`),
  CONSTRAINT `fk_aut_obra_social` FOREIGN KEY (`id_obra_social`) REFERENCES `obra_social` (`id_obra_social`),
  CONSTRAINT `fk_aut_usuario` FOREIGN KEY (`creado_por`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autorizacion_obra_social`
--

LOCK TABLES `autorizacion_obra_social` WRITE;
/*!40000 ALTER TABLE `autorizacion_obra_social` DISABLE KEYS */;
/*!40000 ALTER TABLE `autorizacion_obra_social` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria_ayuda`
--

DROP TABLE IF EXISTS `categoria_ayuda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_ayuda` (
  `id_categoria` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `prioridad` varchar(10) NOT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_ayuda`
--

LOCK TABLES `categoria_ayuda` WRITE;
/*!40000 ALTER TABLE `categoria_ayuda` DISABLE KEYS */;
INSERT INTO `categoria_ayuda` VALUES (1,'Consumo de Sustancias / Adicciones','Atencion para personas con consumo problematico de sustancias','ALTA','warning',1),(2,'Violencia o Abuso','Situaciones de violencia familiar, de genero o abuso','URGENTE','danger',1),(3,'IVE / ILE','Acompanamiento en la Interrupcion del Embarazo','ALTA','heart',1),(4,'Ansiedad, Panico o Tristeza Profunda','Ataques de panico, ansiedad generalizada o depresion','MEDIA','moon',1),(5,'Problemas Familiares o de Pareja','Conflictos familiares, separacion, duelo','MEDIA','users',1),(6,'Depresión','Trastorno del ánimo - episodio depresivo mayor o distimia','MEDIA','depression',1),(7,'Pánico','Crisis de pánico recurrente o trastorno de pánico','ALTA','panic',1),(8,'Fobias','Trastorno de ansiedad fóbica específica o social','BAJA','fobia',1),(9,'Conflictos familiares','Problemáticas vinculares, comunicación, parentalidad','BAJA','familia',1),(10,'Violencia de género / intrafamiliar','Situaciones de violencia por razones de género o violencia doméstica','URGENTE','violencia',1),(11,'Consumo Problemático y Adicciones','Consumo problemático de sustancias o adicciones comportamentales','ALTA','adiccion',1),(12,'Crisis Vitales, Duelo y Pérdidas','Procesos de duelo, crisis vitales, pérdidas significativas','MEDIA','duelo',1),(13,'Salud Sexual, Reproductiva y IVE/ILE','Asesoramiento y acompañamiento en salud sexual, IVE/ILE','ALTA','sexual',1),(14,'Trastornos de la Conducta Alimentaria','TCA: anorexia, bulimia, trastorno por atracón','ALTA','tca',1),(15,'Burnout y Estrés Ocupacional Severo','Síndrome de desgaste profesional, estrés laboral crónico','BAJA','burnout',1),(16,'Otro motivo clínico especificado','Otra consulta de salud mental no contemplada en las categorías anteriores','BAJA','otro',1);
/*!40000 ALTER TABLE `categoria_ayuda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centro_obra_social_practica`
--

DROP TABLE IF EXISTS `centro_obra_social_practica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centro_obra_social_practica` (
  `id_centro_obra_practica` bigint NOT NULL AUTO_INCREMENT,
  `id_centro` bigint NOT NULL,
  `id_obra_social` bigint NOT NULL,
  `tipo_practica` varchar(30) NOT NULL,
  `requiere_autorizacion` tinyint(1) DEFAULT '1',
  `telefono_autorizacion` varchar(20) DEFAULT NULL,
  `dias_estimado_respuesta` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_centro_obra_practica`),
  KEY `fk_cosp_centro` (`id_centro`),
  KEY `fk_cosp_obra_social` (`id_obra_social`),
  CONSTRAINT `fk_cosp_centro` FOREIGN KEY (`id_centro`) REFERENCES `centro_salud` (`id_centro`),
  CONSTRAINT `fk_cosp_obra_social` FOREIGN KEY (`id_obra_social`) REFERENCES `obra_social` (`id_obra_social`)
) ENGINE=InnoDB AUTO_INCREMENT=221 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_obra_social_practica`
--

LOCK TABLES `centro_obra_social_practica` WRITE;
/*!40000 ALTER TABLE `centro_obra_social_practica` DISABLE KEYS */;
INSERT INTO `centro_obra_social_practica` VALUES (111,3,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(112,3,2,'SALUD_MENTAL',0,NULL,0,1),(113,7,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(114,7,2,'SALUD_MENTAL',0,NULL,0,1),(115,8,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(116,8,2,'SALUD_MENTAL',0,NULL,0,1),(117,9,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(118,9,2,'SALUD_MENTAL',0,NULL,0,1),(119,1,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(120,1,2,'SALUD_MENTAL',0,NULL,0,1),(121,1,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(122,2,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(123,2,2,'SALUD_MENTAL',0,NULL,0,1),(124,2,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(125,6,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(126,6,2,'SALUD_MENTAL',0,NULL,0,1),(127,6,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(128,10,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(129,10,2,'SALUD_MENTAL',0,NULL,0,1),(130,10,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(131,11,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(132,11,2,'SALUD_MENTAL',0,NULL,0,1),(133,11,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(134,12,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(135,12,2,'SALUD_MENTAL',0,NULL,0,1),(136,12,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(137,13,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(138,13,2,'SALUD_MENTAL',0,NULL,0,1),(139,13,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(140,14,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(141,14,2,'SALUD_MENTAL',0,NULL,0,1),(142,14,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(143,15,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(144,15,2,'SALUD_MENTAL',0,NULL,0,1),(145,15,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(146,16,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(147,16,2,'SALUD_MENTAL',0,NULL,0,1),(148,16,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(149,17,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(150,17,2,'SALUD_MENTAL',0,NULL,0,1),(151,17,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(152,18,2,'CONSULTA_AMBULATORIA',0,NULL,0,1),(153,18,2,'SALUD_MENTAL',0,NULL,0,1),(154,18,2,'GUARDIA_EMERGENCIA',0,NULL,0,1),(155,4,3,'CONSULTA_AMBULATORIA',0,NULL,0,1),(156,4,3,'SALUD_MENTAL',0,NULL,0,1),(157,4,4,'CONSULTA_AMBULATORIA',0,NULL,0,1),(158,4,4,'SALUD_MENTAL',0,NULL,0,1),(159,4,6,'CONSULTA_AMBULATORIA',0,NULL,0,1),(160,4,6,'SALUD_MENTAL',0,NULL,0,1),(161,4,7,'CONSULTA_AMBULATORIA',0,NULL,0,1),(162,4,7,'SALUD_MENTAL',0,NULL,0,1),(163,5,3,'CONSULTA_AMBULATORIA',0,NULL,0,1),(164,5,3,'SALUD_MENTAL',0,NULL,0,1),(165,5,3,'GUARDIA_EMERGENCIA',1,NULL,48,1),(166,5,4,'CONSULTA_AMBULATORIA',0,NULL,0,1),(167,5,4,'SALUD_MENTAL',1,NULL,24,1),(168,19,3,'CONSULTA_AMBULATORIA',0,NULL,0,1),(169,19,3,'INTERNACION',1,NULL,72,1),(170,19,3,'SALUD_MENTAL',1,NULL,48,1),(171,19,4,'CONSULTA_AMBULATORIA',0,NULL,0,1),(172,19,4,'SALUD_MENTAL',1,NULL,48,1),(173,20,3,'CONSULTA_AMBULATORIA',0,NULL,0,1),(174,20,3,'SALUD_MENTAL',0,NULL,0,1),(175,20,4,'CONSULTA_AMBULATORIA',0,NULL,0,1),(176,20,4,'SALUD_MENTAL',0,NULL,0,1),(177,1,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(178,1,1,'SALUD_MENTAL',0,NULL,0,1),(179,1,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(180,2,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(181,2,1,'SALUD_MENTAL',0,NULL,0,1),(182,2,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(183,3,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(184,3,1,'SALUD_MENTAL',0,NULL,0,1),(185,6,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(186,6,1,'SALUD_MENTAL',0,NULL,0,1),(187,6,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(188,7,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(189,7,1,'SALUD_MENTAL',0,NULL,0,1),(190,8,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(191,8,1,'SALUD_MENTAL',0,NULL,0,1),(192,9,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(193,9,1,'SALUD_MENTAL',0,NULL,0,1),(194,10,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(195,10,1,'SALUD_MENTAL',0,NULL,0,1),(196,10,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(197,11,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(198,11,1,'SALUD_MENTAL',0,NULL,0,1),(199,11,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(200,12,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(201,12,1,'SALUD_MENTAL',0,NULL,0,1),(202,12,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(203,13,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(204,13,1,'SALUD_MENTAL',0,NULL,0,1),(205,13,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(206,14,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(207,14,1,'SALUD_MENTAL',0,NULL,0,1),(208,14,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(209,15,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(210,15,1,'SALUD_MENTAL',0,NULL,0,1),(211,15,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(212,16,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(213,16,1,'SALUD_MENTAL',0,NULL,0,1),(214,16,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(215,17,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(216,17,1,'SALUD_MENTAL',0,NULL,0,1),(217,17,1,'GUARDIA_EMERGENCIA',0,NULL,0,1),(218,18,1,'CONSULTA_AMBULATORIA',0,NULL,0,1),(219,18,1,'SALUD_MENTAL',0,NULL,0,1),(220,18,1,'GUARDIA_EMERGENCIA',0,NULL,0,1);
/*!40000 ALTER TABLE `centro_obra_social_practica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centro_salud`
--

DROP TABLE IF EXISTS `centro_salud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centro_salud` (
  `id_centro` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `tipo_centro` varchar(20) DEFAULT NULL,
  `es_publico` tinyint(1) DEFAULT '1',
  `tiene_emergencias` tinyint(1) DEFAULT '0',
  `horario_atencion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_centro`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_salud`
--

LOCK TABLES `centro_salud` WRITE;
/*!40000 ALTER TABLE `centro_salud` DISABLE KEYS */;
INSERT INTO `centro_salud` VALUES (1,'Hospital Pablo Soria','San Salvador de Jujuy',-24.188,-65.295,NULL,'HOSPITAL',1,1,'24hs',1),(2,'Hospital Oscar Orías','Libertador General San Martín',-24.692,-64.786,NULL,'HOSPITAL',1,1,'24hs',1),(3,'Secretaría de Salud Mental y Adicciones | Ministerio de Salud','Av. Italia esq. Independencia - San Salvador de Jujuy',-24.1858,-65.2995,'0388-4245500','CENTRO_ATENCION',1,0,'Lun-Vie 8:00-18:00',1),(4,'Psi Mental Salud','Av. Gobernador Jose Maria Fascio 778 - San Salvador de Jujuy',-24.186,-65.302,NULL,'CLINICA_PRIVADA',0,0,'Lun-Vie 9:00-20:00',1),(5,'Clinica Los Lapachos','San Salvador de Jujuy',-24.189,-65.296,NULL,'CLINICA_PRIVADA',0,1,'Lun-Vie 8:00-20:00',1),(6,'Hospital Zabala','Perico',-24.378,-65.118,NULL,'HOSPITAL',1,1,'24hs',1),(7,'Hospital Materno Infantil','San Salvador de Jujuy',-24.19,-65.298,NULL,'HOSPITAL',1,1,'24hs',1),(8,'Hospital San Roque','San Salvador de Jujuy',-24.192,-65.301,NULL,'HOSPITAL',1,1,'24hs',1),(9,'Hospital Paterson','San Salvador de Jujuy',-24.195,-65.293,NULL,'HOSPITAL',1,1,'24hs',1),(10,'Hospital La Mendieta','San Salvador de Jujuy',-24.198,-65.305,NULL,'HOSPITAL',1,1,'24hs',1),(11,'Hospital Oscar Orías','Libertador General San Martín',-24.692,-64.786,NULL,'HOSPITAL',1,1,'24hs',1),(12,'Hospital Uro','La Quiaca',-22.103,-65.596,NULL,'HOSPITAL',1,1,'24hs',1),(13,'Hospital Salvador Mazza','Tilcara',-23.577,-65.394,NULL,'HOSPITAL',1,1,'24hs',1),(14,'Hospital Arroyabe','San Salvador de Jujuy (guardias psiquiatría y psicología)',-24.193,-65.297,NULL,'HOSPITAL',1,1,'24hs',1),(15,'Hospital Sequeiros','San Salvador de Jujuy (guardias psiquiatría y psicología)',-24.196,-65.3,NULL,'HOSPITAL',1,1,'24hs',1),(16,'Hospital Zabala','Perico',-24.378,-65.118,NULL,'HOSPITAL',1,1,'24hs',1),(17,'Psi Mental Salud','Av. Gobernador Jose Maria Fascio 778 - San Salvador de Jujuy',-24.186,-65.302,NULL,'CLINICA_PRIVADA',0,0,'Lun-Vie 9:00-20:00',1),(18,'Clinica Los Lapachos','San Salvador de Jujuy',-24.189,-65.296,NULL,'CLINICA_PRIVADA',0,1,'Lun-Vie 8:00-20:00',1),(19,'Clinica Nuestra Sra del Rosario','San Salvador de Jujuy',-24.187,-65.291,NULL,'CLINICA_PRIVADA',0,1,'Lun-Vie 8:00-20:00',1),(20,'Clinica Lavalle','San Salvador de Jujuy',-24.191,-65.294,NULL,'CLINICA_PRIVADA',0,1,'Lun-Vie 8:00-20:00',1);
/*!40000 ALTER TABLE `centro_salud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cita`
--

DROP TABLE IF EXISTS `cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cita` (
  `id_cita` bigint NOT NULL AUTO_INCREMENT,
  `id_solicitud` bigint NOT NULL,
  `id_profesional` bigint NOT NULL,
  `id_centro_salud` bigint DEFAULT NULL,
  `fecha_hora` timestamp NOT NULL,
  `duracion` int NOT NULL,
  `modalidad` varchar(20) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `notas` text,
  `tipo_practica` varchar(30) DEFAULT NULL,
  `requiere_autorizacion` tinyint(1) DEFAULT '0',
  `estado_autorizacion` varchar(20) DEFAULT 'NO_REQUERIDA',
  `numero_autorizacion` varchar(50) DEFAULT NULL,
  `fecha_solicitud_autorizacion` timestamp NULL DEFAULT NULL,
  `fecha_respuesta_autorizacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cita`),
  KEY `fk_cita_solicitud` (`id_solicitud`),
  KEY `fk_cita_profesional` (`id_profesional`),
  KEY `fk_cita_centro` (`id_centro_salud`),
  CONSTRAINT `fk_cita_centro` FOREIGN KEY (`id_centro_salud`) REFERENCES `centro_salud` (`id_centro`),
  CONSTRAINT `fk_cita_profesional` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`),
  CONSTRAINT `fk_cita_solicitud` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cita`
--

LOCK TABLES `cita` WRITE;
/*!40000 ALTER TABLE `cita` DISABLE KEYS */;
INSERT INTO `cita` VALUES (1,11,1,1,'2026-07-23 14:00:00',15,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,13,1,1,'2026-07-24 21:15:00',15,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,14,1,1,'2026-07-25 14:00:00',15,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,18,1,1,'2026-07-30 16:00:00',15,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,1,4,1,'2026-07-31 16:30:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,1,1,1,'2026-07-31 22:00:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,3,2,1,'2026-07-30 14:30:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,5,4,1,'2026-07-29 15:00:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,6,17,2,'2026-07-31 15:30:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,16,16,2,'2026-07-30 15:00:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,4,25,1,'2026-07-31 22:00:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,16,16,NULL,'2026-08-07 21:20:00',30,'PRESENCIAL','PROGRAMADA','Toma las pastillas a horario.',NULL,NULL,NULL,NULL,NULL,NULL),(13,18,1,NULL,'2026-08-05 22:00:00',20,'PRESENCIAL','PROGRAMADA','2da cita',NULL,NULL,NULL,NULL,NULL,NULL),(14,19,4,1,'2026-08-14 21:30:00',30,'PRESENCIAL','ATENDIDA','=== Motivo y Examen Mental ===\nj\n\n=== Diagnóstico Presuntivo ===\nmj\n\n=== Indicaciones / Plan Terapéutico ===\njj',NULL,NULL,NULL,NULL,NULL,NULL),(15,20,23,17,'2026-08-21 15:00:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,23,1,1,'2026-08-10 22:00:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,21,25,NULL,'2026-08-14 22:00:00',15,'PRESENCIAL','PROGRAMADA','Traer marcadores de colores.',NULL,NULL,NULL,NULL,NULL,NULL),(18,24,25,1,'2026-08-10 14:00:00',30,'PRESENCIAL','PROGRAMADA',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `cita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentario_foro`
--

DROP TABLE IF EXISTS `comentario_foro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentario_foro` (
  `id_comentario` bigint NOT NULL AUTO_INCREMENT,
  `contenido` text NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `es_anonimo` tinyint(1) NOT NULL DEFAULT '0',
  `id_post` bigint NOT NULL,
  `id_paciente` bigint NOT NULL,
  `id_comentario_padre` bigint DEFAULT NULL,
  PRIMARY KEY (`id_comentario`),
  KEY `fk_comentario_post` (`id_post`),
  KEY `fk_comentario_paciente` (`id_paciente`),
  KEY `fk_comentario_padre` (`id_comentario_padre`),
  CONSTRAINT `fk_comentario_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `fk_comentario_padre` FOREIGN KEY (`id_comentario_padre`) REFERENCES `comentario_foro` (`id_comentario`),
  CONSTRAINT `fk_comentario_post` FOREIGN KEY (`id_post`) REFERENCES `post_foro` (`id_post`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentario_foro`
--

LOCK TABLES `comentario_foro` WRITE;
/*!40000 ALTER TABLE `comentario_foro` DISABLE KEYS */;
INSERT INTO `comentario_foro` VALUES (1,'Para mi creo que tenes que comerte un chocolate jajajajaj','2026-08-04 01:29:42',0,1,8,NULL),(2,'jajajajaj es buena te  recomiendo el dubai','2026-08-04 01:34:53',0,1,14,NULL),(3,'si tiene razon ajjaja','2026-08-07 15:31:58',0,1,13,NULL);
/*!40000 ALTER TABLE `comentario_foro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consentimiento`
--

DROP TABLE IF EXISTS `consentimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consentimiento` (
  `id_consentimiento` bigint NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint NOT NULL,
  `version` varchar(20) NOT NULL,
  `aceptado` tinyint(1) NOT NULL,
  `fecha_aceptacion` timestamp NOT NULL,
  `ip_origen` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_consentimiento`),
  KEY `fk_consentimiento_paciente` (`id_paciente`),
  CONSTRAINT `fk_consentimiento_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consentimiento`
--

LOCK TABLES `consentimiento` WRITE;
/*!40000 ALTER TABLE `consentimiento` DISABLE KEYS */;
INSERT INTO `consentimiento` VALUES (1,3,'1.0',1,'2026-07-17 02:30:56',NULL),(2,5,'1.0',1,'2026-07-17 07:00:26',NULL),(3,6,'1.0',1,'2026-07-19 07:41:44',NULL),(4,7,'1.0',1,'2026-07-19 17:29:43',NULL),(5,8,'1.0',1,'2026-07-21 22:53:45',NULL),(6,9,'1.0',1,'2026-07-21 23:15:29',NULL),(7,10,'1.0',1,'2026-07-24 03:23:29',NULL),(8,11,'1.0',1,'2026-07-24 07:48:02',NULL),(9,14,'1.0',1,'2026-08-04 03:08:19',NULL);
/*!40000 ALTER TABLE `consentimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diario_sintomas`
--

DROP TABLE IF EXISTS `diario_sintomas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diario_sintomas` (
  `id_diario` bigint NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint NOT NULL,
  `fecha` date NOT NULL,
  `estado_animo` varchar(50) DEFAULT NULL,
  `sintomas_texto` text,
  `intensidad_dolor` int DEFAULT NULL,
  `horas_suenio` double DEFAULT NULL,
  `medicacion_tomada` tinyint(1) DEFAULT NULL,
  `observaciones` text,
  PRIMARY KEY (`id_diario`),
  KEY `fk_diario_paciente` (`id_paciente`),
  CONSTRAINT `fk_diario_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diario_sintomas`
--

LOCK TABLES `diario_sintomas` WRITE;
/*!40000 ALTER TABLE `diario_sintomas` DISABLE KEYS */;
INSERT INTO `diario_sintomas` VALUES (1,3,'2026-07-16','ANSIEDAD','Se me mojan las manos',0,0,0,''),(2,2,'2026-07-17','MAL','Hoy jueves me senti muy mal.\nme dolia la espalda',7,1,0,''),(3,5,'2026-07-17','BIEN','Me siento mejor hoy',2,7.5,1,'Rutina normal'),(4,5,'2026-07-17','BIEN','Me siento mejor hoy',2,7.5,1,'Rutina'),(5,6,'2026-07-19','ANSIOSO','pienso en que tengo que mejorar mi sueño pero no puedo dormir, sera que tengo que tomar medicamcion?',0,0.5,0,'{\"disparadores\":[\"TRABAJO\"]}'),(6,8,'2026-07-21','ANSIOSO','Estoy fumando marihuana para calmar mis acciones.',0,3,0,'{\"disparadores\":[\"SUENIO\"]}'),(7,10,'2026-07-23','ANSIOSO','No estoy durmiendo por las noches.',0,5,0,'{\"disparadores\":[\"TRABAJO\",\"SUENIO\"]}'),(8,9,'2026-07-24','TRISTE','No me gusta mi cuerpo',0,11,0,'{\"disparadores\":[\"SALUD\"]}'),(9,12,'2026-07-27','ANSIOSO','Por ahora estoy bien',7,8,1,'{\"calidadSuenio\":8,\"nivelEstres\":7,\"adherencia\":5,\"tipo\":\"mapeo_sintomas\",\"fecha\":\"2026-07-27T19:30:01.664Z\"}'),(10,12,'2026-07-27','EXCELENTE','No pude dormir mucho.',0,3,0,'{\"disparadores\":[\"SUENIO\"]}'),(11,12,'2026-07-27','EXCELENTE','No pude dormir porque estuve estudiando.',0,3,0,'{\"disparadores\":[\"TRABAJO\"]}'),(12,12,'2026-07-27','ESTABLE','No pude dormir.',0,2,0,'{\"disparadores\":[\"SUENIO\",\"TRABAJO\"]}'),(13,8,'2026-08-03','ESTABLE','Hoy me siento realmente feliz.',0,6,0,'{\"disparadores\":[\"FAMILIA\",\"RELACIONES\"]}'),(14,14,'2026-08-03','EXCELENTE','Hoy es mi primer dia que uso esta plataforma, y verdaderamente me gusta.',0,0,0,'{\"disparadores\":[\"SUENIO\"]}'),(15,14,'2026-08-03','EXCELENTE','Hoy me siento miuy bien ',0,0,0,'{\"disparadores\":[\"TRABAJO\"]}'),(16,10,'2026-08-05','TRISTE','Quiero empezar alguna actividad fisica.\n',0,0,0,'{\"disparadores\":[\"SALUD\"]}'),(17,12,'2026-08-05','EXCELENTE','Me siento contento',0,7,0,'{\"disparadores\":[\"FAMILIA\"]}'),(18,13,'2026-08-07','TRISTE','No me siento muy muy bien digamos.',0,10,0,'{\"disparadores\":[\"SALUD\"]}'),(19,8,'2026-08-07','TRISTE','pienso en que voy hacer mañana.',0,5,0,'{\"disparadores\":[\"TRABAJO\"]}'),(20,8,'2026-08-10','TRISTE','mjuy bien',0,5,0,'{\"disparadores\":[\"SALUD\"]}');
/*!40000 ALTER TABLE `diario_sintomas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidad_profesional`
--

DROP TABLE IF EXISTS `disponibilidad_profesional`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidad_profesional` (
  `id_disponibilidad` bigint NOT NULL AUTO_INCREMENT,
  `id_profesional` bigint NOT NULL,
  `id_centro_salud` bigint NOT NULL,
  `dia_semana` varchar(10) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `duracion_turno_minutos` int DEFAULT '15',
  `modalidad_permitida` varchar(20) DEFAULT 'PRESENCIAL',
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_disponibilidad`),
  KEY `fk_disp_profesional` (`id_profesional`),
  KEY `fk_disp_centro` (`id_centro_salud`),
  CONSTRAINT `fk_disp_centro` FOREIGN KEY (`id_centro_salud`) REFERENCES `centro_salud` (`id_centro`),
  CONSTRAINT `fk_disp_profesional` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`)
) ENGINE=InnoDB AUTO_INCREMENT=176 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_profesional`
--

LOCK TABLES `disponibilidad_profesional` WRITE;
/*!40000 ALTER TABLE `disponibilidad_profesional` DISABLE KEYS */;
INSERT INTO `disponibilidad_profesional` VALUES (1,1,1,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(2,1,1,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(3,1,1,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(4,1,1,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(5,1,1,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(6,1,1,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(7,1,1,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(8,2,1,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(9,2,1,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(10,2,1,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(11,2,1,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(12,2,1,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(13,2,1,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(14,2,1,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(15,3,6,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(16,3,6,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(17,3,6,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(18,3,6,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(19,3,6,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(20,3,6,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(21,3,6,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(22,4,1,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(23,4,1,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(24,4,1,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(25,4,1,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(26,4,1,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(27,4,1,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(28,4,1,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(29,5,1,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(30,5,1,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(31,5,1,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(32,5,1,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(33,5,1,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(34,5,1,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(35,5,1,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(36,6,6,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(37,6,6,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(38,6,6,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(39,6,6,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(40,6,6,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(41,6,6,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(42,6,6,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(43,7,6,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(44,7,6,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(45,7,6,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(46,7,6,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(47,7,6,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(48,7,6,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(49,7,6,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(50,8,6,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(51,8,6,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(52,8,6,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(53,8,6,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(54,8,6,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(55,8,6,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(56,8,6,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(57,9,11,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(58,9,11,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(59,9,11,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(60,9,11,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(61,9,11,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(62,9,11,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(63,9,11,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(64,10,11,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(65,10,11,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(66,10,11,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(67,10,11,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(68,10,11,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(69,10,11,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(70,10,11,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(71,11,11,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(72,11,11,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(73,11,11,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(74,11,11,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(75,11,11,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(76,11,11,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(77,11,11,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(78,12,11,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(79,12,11,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(80,12,11,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(81,12,11,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(82,12,11,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(83,12,11,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(84,12,11,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(85,13,5,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(86,13,5,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(87,13,5,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(88,13,5,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(89,13,5,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(90,13,5,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(91,13,5,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(92,14,5,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(93,14,5,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(94,14,5,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(95,14,5,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(96,14,5,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(97,14,5,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(98,14,5,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(99,15,5,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(100,15,5,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(101,15,5,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(102,15,5,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(103,15,5,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(104,15,5,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(105,15,5,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(106,16,2,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(107,16,2,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(108,16,2,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(109,16,2,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(110,16,2,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(111,16,2,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(112,16,2,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(113,17,2,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(114,17,2,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(115,17,2,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(116,17,2,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(117,17,2,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(118,17,2,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(119,17,2,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(120,18,2,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(121,18,2,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(122,18,2,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(123,18,2,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(124,18,2,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(125,18,2,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(126,18,2,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(127,19,7,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(128,19,7,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(129,19,7,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(130,19,7,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(131,19,7,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(132,19,7,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(133,19,7,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(134,20,7,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(135,20,7,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(136,20,7,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(137,20,7,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(138,20,7,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(139,20,7,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(140,20,7,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(141,21,7,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(142,21,7,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(143,21,7,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(144,21,7,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(145,21,7,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(146,21,7,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(147,21,7,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(148,22,17,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(149,22,17,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(150,22,17,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(151,22,17,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(152,22,17,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(153,22,17,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(154,22,17,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(155,23,17,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(156,23,17,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(157,23,17,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(158,23,17,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(159,23,17,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(160,23,17,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(161,23,17,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(162,24,17,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(163,24,17,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(164,24,17,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(165,24,17,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(166,24,17,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(167,24,17,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(168,24,17,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1),(169,25,1,'LUNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(170,25,1,'MARTES','08:00:00','17:00:00',15,'PRESENCIAL',1),(171,25,1,'MIERCOLES','08:00:00','17:00:00',15,'PRESENCIAL',1),(172,25,1,'JUEVES','08:00:00','17:00:00',15,'PRESENCIAL',1),(173,25,1,'VIERNES','08:00:00','17:00:00',15,'PRESENCIAL',1),(174,25,1,'SABADO','08:00:00','17:00:00',15,'PRESENCIAL',1),(175,25,1,'DOMINGO','08:00:00','17:00:00',15,'PRESENCIAL',1);
/*!40000 ALTER TABLE `disponibilidad_profesional` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init schema','SQL','V1__init_schema.sql',-1601802385,'root','2026-07-16 19:02:52',639,1),(2,'2','seed data','SQL','V2__seed_data.sql',-326158100,'root','2026-07-16 19:02:52',31,1),(3,'3','profesional centro','SQL','V3__profesional_centro.sql',-571615139,'root','2026-07-16 19:02:52',158,1),(4,'4','disponibilidad','SQL','V4__disponibilidad.sql',906182558,'root','2026-07-16 19:02:52',58,1),(5,'5','clean disponibilidad','SQL','V5__solicitud_centro.sql',1037928493,'root','2026-07-16 19:02:53',225,1),(6,'6','sin cobertura centros','SQL','V6__sin_cobertura_centros.sql',668789638,'root','2026-07-16 19:02:53',8,1),(7,'7','jujuy centros','SQL','V7__jujuy_centros.sql',-807195072,'root','2026-07-16 19:02:53',66,1),(8,'8','perfil adjuntos','SQL','V8__perfil_adjuntos.sql',-1341002402,'root','2026-07-17 00:01:43',395,1),(9,'9','solicitud centro','SQL','V9__solicitud_centro.sql',208671498,'root','2026-07-22 23:32:18',288,1),(10,'10','profesional registra','SQL','V10__profesional_registra.sql',-1590010627,'root','2026-07-27 19:06:31',317,1),(11,'11','sintomatologia','SQL','V11__sintomatologia.sql',720185808,'root','2026-07-27 19:36:07',168,1),(12,'12','admision triaje','SQL','V12__admision_triaje.sql',505975566,'root','2026-07-27 21:49:56',236,1),(13,'13','asignar centros profesionales','SQL','V13__asignar_centros_profesionales.sql',-1570866435,'root','2026-07-29 00:18:16',49,1),(14,'14','foro pacientes','SQL','V14__foro_pacientes.sql',657790607,'root','2026-08-03 14:48:23',306,1),(15,'15','foro reacciones comentarios','SQL','V15__foro_reacciones_comentarios.sql',-99471144,'root','2026-08-06 18:13:37',290,1),(16,'16','consentimiento retroactivo','SQL','V16__consentimiento_retroactivo.sql',-999557038,'root','2026-08-07 15:17:03',57,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historia_clinica`
--

DROP TABLE IF EXISTS `historia_clinica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historia_clinica` (
  `id_historia` bigint NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint NOT NULL,
  `id_profesional` bigint NOT NULL,
  `id_solicitud` bigint NOT NULL,
  `diagnostico` text,
  `tratamiento` text,
  `observaciones` text,
  `tipo_plantilla` varchar(50) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_historia`),
  KEY `fk_hc_paciente` (`id_paciente`),
  KEY `fk_hc_profesional` (`id_profesional`),
  KEY `fk_hc_solicitud` (`id_solicitud`),
  CONSTRAINT `fk_hc_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `fk_hc_profesional` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`),
  CONSTRAINT `fk_hc_solicitud` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historia_clinica`
--

LOCK TABLES `historia_clinica` WRITE;
/*!40000 ALTER TABLE `historia_clinica` DISABLE KEYS */;
INSERT INTO `historia_clinica` VALUES (1,3,25,2,'Violencia de Genero ','Escuchar y consentir al usuario','Debemos llevar una comunicacion que le sea facil de comprender la situaicon para que no se agrave.','','2026-07-24 07:34:11','2026-07-24 07:34:11'),(6,12,25,18,'Ansiedad generativa','cognitiva','Va a tomar amplaz','','2026-07-31 00:38:55','2026-07-31 00:38:55'),(7,8,25,17,'ansiedad aguda','terapia normal 1 vez por semana','Va a empezar con clonaxepam por las noches 1mg','','2026-07-31 00:55:14','2026-07-31 00:55:14'),(8,11,25,16,'Traumatismo de niñez','Terapia congnitiva con acompañamiento psicologico','Por ahora esta en observacion hasta la nueva sesion.','','2026-08-01 01:16:41','2026-08-01 01:16:41'),(9,10,25,21,'Juego','aun no','Registro de obsecion al juego','','2026-08-08 03:08:14','2026-08-08 03:08:14'),(10,2,2,3,'Panico fuerte','Terapia cognitiva por un mes','Vamos a ver que pasa hasta la otra sesion','','2026-08-10 22:03:30','2026-08-10 22:03:30');
/*!40000 ALTER TABLE `historia_clinica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `id_notificacion` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  `id_solicitud` bigint DEFAULT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_envio` timestamp NOT NULL,
  PRIMARY KEY (`id_notificacion`),
  KEY `fk_notif_usuario` (`id_usuario`),
  KEY `fk_notif_solicitud` (`id_solicitud`),
  CONSTRAINT `fk_notif_solicitud` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`),
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=542 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
INSERT INTO `notificacion` VALUES (1,3,1,'Nueva solicitud URGENTE','Maria Lopez ha creado: Necesito ayuda',0,'2026-07-16 22:09:15'),(2,4,1,'Nueva solicitud URGENTE','Maria Lopez ha creado: Necesito ayuda',0,'2026-07-16 22:09:15'),(3,5,1,'Nueva solicitud URGENTE','Maria Lopez ha creado: Necesito ayuda',0,'2026-07-16 22:09:15'),(4,6,1,'Nueva solicitud URGENTE','Maria Lopez ha creado: Necesito ayuda',0,'2026-07-16 22:09:15'),(5,8,1,'Derivacion a centro','Tu solicitud fue derivada a: Secretaría de Salud Mental y Adicciones | Ministerio de Salud',0,'2026-07-17 02:22:48'),(6,8,1,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Zabala',0,'2026-07-17 02:23:22'),(7,3,2,'Nueva solicitud URGENTE','pablo perez ha creado: Violencia',0,'2026-07-17 02:37:28'),(8,4,2,'Nueva solicitud URGENTE','pablo perez ha creado: Violencia',0,'2026-07-17 02:37:28'),(9,5,2,'Nueva solicitud URGENTE','pablo perez ha creado: Violencia',0,'2026-07-17 02:37:28'),(10,6,2,'Nueva solicitud URGENTE','pablo perez ha creado: Violencia',0,'2026-07-17 02:37:28'),(11,3,3,'Nueva solicitud URGENTE','Maria Lopez ha creado: Cocaina',0,'2026-07-17 02:38:53'),(12,4,3,'Nueva solicitud URGENTE','Maria Lopez ha creado: Cocaina',0,'2026-07-17 02:38:53'),(13,5,3,'Nueva solicitud URGENTE','Maria Lopez ha creado: Cocaina',0,'2026-07-17 02:38:53'),(14,6,3,'Nueva solicitud URGENTE','Maria Lopez ha creado: Cocaina',0,'2026-07-17 02:38:53'),(15,8,3,'Derivacion a centro','Tu solicitud fue derivada a: Hospital San Roque',0,'2026-07-17 02:41:00'),(16,3,4,'Nueva solicitud','Test Paciente 2 ha creado: Necesito ayuda con ansiedad',0,'2026-07-17 07:00:26'),(17,4,4,'Nueva solicitud','Test Paciente 2 ha creado: Necesito ayuda con ansiedad',0,'2026-07-17 07:00:26'),(18,5,4,'Nueva solicitud','Test Paciente 2 ha creado: Necesito ayuda con ansiedad',0,'2026-07-17 07:00:26'),(19,6,4,'Nueva solicitud','Test Paciente 2 ha creado: Necesito ayuda con ansiedad',0,'2026-07-17 07:00:26'),(20,3,5,'Nueva solicitud URGENTE','alvaro santiago  ha creado: Problemas Familiares',0,'2026-07-19 08:10:07'),(21,4,5,'Nueva solicitud URGENTE','alvaro santiago  ha creado: Problemas Familiares',0,'2026-07-19 08:10:07'),(22,5,5,'Nueva solicitud URGENTE','alvaro santiago  ha creado: Problemas Familiares',0,'2026-07-19 08:10:07'),(23,6,5,'Nueva solicitud URGENTE','alvaro santiago  ha creado: Problemas Familiares',0,'2026-07-19 08:10:07'),(24,12,5,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Oscar Orías',0,'2026-07-21 22:25:53'),(25,11,4,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',0,'2026-07-21 22:49:34'),(26,11,4,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Oscar Orías',0,'2026-07-21 22:49:46'),(27,3,6,'Nueva solicitud','nicolas argento ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 22:54:35'),(28,4,6,'Nueva solicitud','nicolas argento ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 22:54:35'),(29,5,6,'Nueva solicitud','nicolas argento ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 22:54:35'),(30,6,6,'Nueva solicitud','nicolas argento ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 22:54:35'),(31,14,6,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Oscar Orías',1,'2026-07-21 22:55:00'),(32,3,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(33,4,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(34,5,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(35,6,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(36,15,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(37,16,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(38,17,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(39,18,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(40,19,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(41,20,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(42,21,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(43,22,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(44,23,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(45,24,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(46,25,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(47,26,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(48,27,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(49,28,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(50,29,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(51,30,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(52,31,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(53,32,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(54,33,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(55,34,7,'Nueva solicitud','nicolas argento ha creado: Problemas Familiares y Violencia ',0,'2026-07-21 23:08:57'),(56,14,7,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Oscar Orías',1,'2026-07-21 23:10:18'),(57,14,7,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',1,'2026-07-21 23:10:27'),(58,3,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(59,4,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(60,5,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(61,6,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(62,15,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(63,16,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(64,17,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(65,18,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(66,19,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(67,20,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(68,21,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(69,22,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(70,23,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(71,24,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(72,25,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(73,26,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(74,27,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(75,28,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(76,29,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(77,30,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(78,31,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(79,32,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(80,33,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(81,34,8,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Depresión y Estado de Ánimo',0,'2026-07-21 23:16:43'),(82,35,8,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Oscar Orías',1,'2026-07-21 23:17:24'),(83,3,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(84,4,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(85,5,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(86,6,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(87,15,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(88,16,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(89,17,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(90,18,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(91,19,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(92,20,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(93,21,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(94,22,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(95,23,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(96,24,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(97,25,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(98,26,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(99,27,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(100,28,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(101,29,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(102,30,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(103,31,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(104,32,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(105,33,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(106,34,9,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Violencia o Abuso',0,'2026-07-21 23:21:42'),(107,35,9,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Oscar Orías',1,'2026-07-21 23:22:12'),(108,3,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(109,4,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(110,5,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(111,6,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(112,15,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(113,16,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(114,17,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(115,18,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(116,19,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(117,20,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(118,21,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(119,22,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(120,23,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(121,24,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(122,25,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(123,26,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(124,27,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(125,28,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(126,29,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(127,30,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(128,31,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(129,32,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(130,33,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(131,34,10,'Nueva solicitud','alfredo lunad  ha creado: Consumo de Sustancias / Adicciones',0,'2026-07-21 23:51:21'),(132,35,10,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Oscar Orías',1,'2026-07-21 23:55:24'),(133,3,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(134,4,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(135,5,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(136,6,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(137,15,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(138,16,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(139,17,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(140,18,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(141,19,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(142,20,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(143,21,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(144,22,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(145,23,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(146,24,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(147,25,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(148,26,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(149,27,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(150,28,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(151,29,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(152,30,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(153,31,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(154,32,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(155,33,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(156,34,11,'Nueva solicitud URGENTE','alfredo lunad  ha creado: Necesito ayuda de inmediato',0,'2026-07-23 04:05:06'),(157,35,11,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',1,'2026-07-23 04:05:46'),(158,35,11,'Turno asignado','Turno asignado: Lic. Mariano Martinez, 2026-07-23, 08:00, Hospital Pablo Soria',1,'2026-07-23 04:06:56'),(159,3,11,'Nueva cita asignada','Nueva cita asignada: alfredo lunad , 2026-07-23, 08:00',0,'2026-07-23 04:06:56'),(160,3,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(161,4,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(162,5,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(163,6,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(164,15,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(165,16,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(166,17,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(167,18,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(168,19,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(169,20,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(170,21,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(171,22,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(172,23,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(173,24,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(174,25,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(175,26,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(176,27,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(177,28,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(178,29,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(179,30,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(180,31,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(181,32,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(182,33,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(183,34,12,'Nueva solicitud','alfredo lunad  ha creado: Quiero tomar pastillas para esta locura.',0,'2026-07-23 04:30:36'),(184,35,12,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Zabala',1,'2026-07-23 04:31:13'),(185,3,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(186,4,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(187,5,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(188,6,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(189,15,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(190,16,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(191,17,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(192,18,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(193,19,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(194,20,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(195,21,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(196,22,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(197,23,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(198,24,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(199,25,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(200,26,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(201,27,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(202,28,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(203,29,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(204,30,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(205,31,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(206,32,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(207,33,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(208,34,13,'Nueva solicitud URGENTE','alfredo lunad  ha creado: quiero dejar de tomar cocaina',0,'2026-07-23 05:30:23'),(209,35,13,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',1,'2026-07-23 05:30:50'),(210,35,13,'Turno asignado','Turno asignado: Lic. Mariano Martinez, 2026-07-24, 15:15, Hospital Pablo Soria',1,'2026-07-23 05:31:52'),(211,3,13,'Nueva cita asignada','Nueva cita asignada: alfredo lunad , 2026-07-24, 15:15',0,'2026-07-23 05:31:52'),(212,3,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(213,4,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(214,5,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(215,6,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(216,15,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(217,16,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(218,17,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(219,18,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(220,19,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(221,20,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(222,21,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(223,22,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(224,23,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(225,24,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(226,25,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(227,26,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(228,27,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(229,28,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(230,29,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(231,30,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(232,31,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(233,32,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(234,33,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(235,34,14,'Nueva solicitud URGENTE','nicolas argento ha creado: Necsisto dejar de consumir',0,'2026-07-23 21:09:01'),(236,14,14,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',1,'2026-07-23 21:09:53'),(237,14,14,'Turno asignado','Turno asignado: Lic. Mariano Martinez, 2026-07-25, 08:00, Hospital Pablo Soria',1,'2026-07-23 21:11:05'),(238,3,14,'Nueva cita asignada','Nueva cita asignada: nicolas argento, 2026-07-25, 08:00',0,'2026-07-23 21:11:05'),(239,3,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(240,4,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(241,5,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(242,6,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(243,15,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(244,16,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(245,17,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(246,18,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(247,19,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(248,20,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(249,21,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(250,22,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(251,23,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(252,24,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(253,25,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(254,26,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(255,27,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(256,28,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(257,29,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(258,30,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(259,31,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(260,32,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(261,33,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(262,34,15,'Nueva solicitud URGENTE','Celeste Montiel  ha creado: Neceisto ayuda profesional para manter mi ansiedad',0,'2026-07-24 03:25:06'),(263,36,15,'Derivacion a centro','Tu solicitud fue derivada a: Secretaría de Salud Mental y Adicciones | Ministerio de Salud',1,'2026-07-24 03:26:59'),(264,9,2,'Estado actualizado','Tu solicitud \'Violencia\' cambio a: ASIGNADA',0,'2026-07-24 07:35:44'),(265,9,2,'Estado actualizado','Tu solicitud \'Violencia\' cambio a: EN_PROCESO',0,'2026-07-24 07:35:49'),(266,9,2,'Estado actualizado','Tu solicitud \'Violencia\' cambio a: COMPLETADA',0,'2026-07-24 07:36:52'),(267,3,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(268,4,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(269,5,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(270,6,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(271,15,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(272,16,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(273,17,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(274,18,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(275,19,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(276,20,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(277,21,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(278,22,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(279,23,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(280,24,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(281,25,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(282,26,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(283,27,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(284,28,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(285,29,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(286,30,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(287,31,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(288,32,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(289,33,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(290,34,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',0,'2026-07-24 07:49:57'),(291,37,16,'Nueva solicitud URGENTE','Nicolas Velazquez ha creado: Neceisto ayuda, estoy sufriendo al ver a mis padres pelear',1,'2026-07-24 07:49:57'),(292,38,16,'Estado actualizado','Tu solicitud \'Neceisto ayuda, estoy sufriendo al ver a mis padres pelear\' cambio a: ASIGNADA',0,'2026-07-24 07:52:47'),(293,38,16,'Estado actualizado','Tu solicitud \'Neceisto ayuda, estoy sufriendo al ver a mis padres pelear\' cambio a: EN_PROCESO',0,'2026-07-24 07:52:53'),(294,3,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(295,4,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(296,5,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(297,6,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(298,15,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(299,16,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(300,17,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(301,18,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(302,19,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(303,20,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(304,21,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(305,22,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(306,23,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(307,24,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(308,25,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(309,26,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(310,27,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(311,28,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(312,29,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(313,30,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(314,31,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(315,32,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(316,33,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(317,34,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',0,'2026-07-24 08:03:01'),(318,37,17,'Nueva solicitud','nicolas argento ha creado: Tengo mucha ansiedad',1,'2026-07-24 08:03:01'),(319,14,17,'Estado actualizado','Tu solicitud \'Tengo mucha ansiedad\' cambio a: ASIGNADA',1,'2026-07-24 08:03:38'),(320,14,17,'Estado actualizado','Tu solicitud \'Tengo mucha ansiedad\' cambio a: EN_PROCESO',1,'2026-07-24 08:04:03'),(321,3,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(322,4,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(323,5,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(324,6,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(325,15,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(326,16,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(327,17,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(328,18,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(329,19,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(330,20,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(331,21,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(332,22,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(333,23,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(334,24,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(335,25,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(336,26,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(337,27,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(338,28,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(339,29,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(340,30,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(341,31,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(342,32,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(343,33,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(344,34,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',0,'2026-07-28 00:53:15'),(345,37,18,'Nueva solicitud','santiago nasisi ha creado: Necesito ayuda.',1,'2026-07-28 00:53:15'),(346,39,18,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',1,'2026-07-28 01:15:40'),(347,39,18,'Turno asignado','Turno asignado: Lic. Mariano Martinez, 2026-07-30, 10:00, Hospital Pablo Soria',1,'2026-07-28 01:17:02'),(348,3,18,'Nueva cita asignada','Nueva cita asignada: santiago nasisi, 2026-07-30, 10:00',0,'2026-07-28 01:17:02'),(349,8,1,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',0,'2026-07-28 02:57:53'),(350,8,1,'Turno asignado','Turno asignado: Lic. Ana Perez, 2026-07-31, 10:30, Hospital Pablo Soria',0,'2026-07-28 03:00:09'),(351,6,1,'Nueva cita asignada','Nueva cita asignada: Maria Lopez, 2026-07-31, 10:30',0,'2026-07-28 03:00:09'),(352,8,1,'Turno asignado','Turno asignado: Lic. Mariano Martinez, 2026-07-31, 16:00, Hospital Pablo Soria',0,'2026-07-28 03:24:21'),(353,3,1,'Nueva cita asignada','Nueva cita asignada: Maria Lopez, 2026-07-31, 16:00',0,'2026-07-28 03:24:21'),(354,8,3,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',0,'2026-07-28 03:25:26'),(355,8,3,'Turno asignado','Turno asignado: Lic. Laura Gonzalez, 2026-07-30, 08:30, Hospital Pablo Soria',0,'2026-07-28 03:25:37'),(356,4,3,'Nueva cita asignada','Nueva cita asignada: Maria Lopez, 2026-07-30, 08:30',0,'2026-07-28 03:25:37'),(357,12,5,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',0,'2026-07-28 03:26:53'),(358,12,5,'Turno asignado','Turno asignado: Lic. Ana Perez, 2026-07-29, 09:00, Hospital Pablo Soria',0,'2026-07-28 03:27:02'),(359,6,5,'Nueva cita asignada','Nueva cita asignada: alvaro santiago , 2026-07-29, 09:00',0,'2026-07-28 03:27:02'),(360,14,6,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Oscar Orías',1,'2026-07-28 03:29:13'),(361,14,6,'Turno asignado','Turno asignado: Dr. Hernan Paz, 2026-07-31, 09:30, Hospital Oscar Orías',1,'2026-07-28 03:29:20'),(362,27,6,'Nueva cita asignada','Nueva cita asignada: nicolas argento, 2026-07-31, 09:30',0,'2026-07-28 03:29:20'),(363,38,16,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',0,'2026-07-28 03:34:58'),(364,38,16,'Turno asignado','Turno asignado: Lic. Cecilia Vargas, 2026-07-30, 09:00, Hospital Oscar Orías',0,'2026-07-28 03:35:18'),(365,26,16,'Nueva cita asignada','Nueva cita asignada: Nicolas Velazquez, 2026-07-30, 09:00',0,'2026-07-28 03:35:18'),(366,11,4,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',0,'2026-07-30 21:17:43'),(367,11,4,'Turno asignado','Turno asignado: Alejandro Moitiño, 2026-07-31, 16:00, Hospital Pablo Soria',0,'2026-07-30 21:18:08'),(368,37,4,'Nueva cita asignada','Nueva cita asignada: Test Paciente 2, 2026-07-31, 16:00',1,'2026-07-30 21:18:08'),(369,39,18,'Estado actualizado','Tu solicitud \'Necesito ayuda.\' cambio a: EN_PROCESO',1,'2026-07-30 23:00:41'),(370,14,17,'Estado actualizado','Tu solicitud \'Tengo mucha ansiedad\' cambio a: COMPLETADA',1,'2026-07-31 00:55:41'),(371,38,16,'Estado actualizado','Tu solicitud \'Neceisto ayuda, estoy sufriendo al ver a mis padres pelear\' cambio a: EN_PROCESO',0,'2026-08-01 01:15:51'),(372,38,16,'Turno agendado','Su profesional Lic. Cecilia Vargas ha agendado un turno para el 2026-08-07 a las 15:20.',0,'2026-08-01 03:12:57'),(373,39,18,'Turno agendado','Su profesional Lic. Mariano Martinez ha agendado un turno para el 2026-08-05 a las 16:00.',1,'2026-08-01 03:15:05'),(374,3,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(375,4,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(376,5,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(377,6,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(378,15,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(379,16,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(380,17,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(381,18,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(382,19,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(383,20,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(384,21,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(385,22,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(386,23,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(387,24,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(388,25,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(389,26,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(390,27,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(391,28,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(392,29,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(393,30,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(394,31,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(395,32,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(396,33,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(397,34,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',0,'2026-08-04 05:55:15'),(398,37,19,'Nueva solicitud','Juan Ignacio Soraire ha creado: Evaluacion de panico ',1,'2026-08-04 05:55:15'),(399,41,19,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',0,'2026-08-04 05:57:24'),(400,41,19,'Turno asignado','Turno asignado: Lic. Ana Perez, 2026-08-14, 15:30, Hospital Pablo Soria',0,'2026-08-04 05:58:16'),(401,6,19,'Nueva cita asignada','Nueva cita asignada: Juan Ignacio Soraire, 2026-08-14, 15:30',0,'2026-08-04 05:58:16'),(402,3,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(403,4,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(404,5,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(405,6,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(406,15,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(407,16,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(408,17,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(409,18,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(410,19,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(411,20,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(412,21,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(413,22,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(414,23,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(415,24,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(416,25,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(417,26,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(418,27,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(419,28,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(420,29,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(421,30,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(422,31,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(423,32,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(424,33,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(425,34,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',0,'2026-08-05 19:47:09'),(426,37,20,'Nueva solicitud','Celeste Montiel  ha creado: Quiero ayuda',1,'2026-08-05 19:47:09'),(427,3,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(428,4,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(429,5,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(430,6,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(431,15,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(432,16,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(433,17,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(434,18,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(435,19,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(436,20,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(437,21,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(438,22,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(439,23,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(440,24,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(441,25,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(442,26,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(443,27,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(444,28,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(445,29,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(446,30,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(447,31,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(448,32,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(449,33,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(450,34,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',0,'2026-08-05 20:41:31'),(451,37,21,'Nueva solicitud','Celeste Montiel  ha creado: Busco ayuda ',1,'2026-08-05 20:41:31'),(452,36,20,'Derivacion a centro','Tu solicitud fue derivada a: Hospital San Roque',1,'2026-08-05 21:14:16'),(453,36,20,'Turno asignado','Turno asignado: Lic. Pablo Quiroga, 2026-08-21, 09:00, Psi Mental Salud',1,'2026-08-05 21:15:27'),(454,33,20,'Nueva cita asignada','Nueva cita asignada: Celeste Montiel , 2026-08-21, 09:00',0,'2026-08-05 21:15:27'),(455,3,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(456,4,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(457,5,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(458,6,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(459,15,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(460,16,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(461,17,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(462,18,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(463,19,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(464,20,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(465,21,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(466,22,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(467,23,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(468,24,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(469,25,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(470,26,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(471,27,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(472,28,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(473,29,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(474,30,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(475,31,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(476,32,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(477,33,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(478,34,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',0,'2026-08-05 22:49:34'),(479,37,22,'Nueva solicitud','santiago nasisi ha creado: Solicitud de orientación sobre Conflictos familiares',1,'2026-08-05 22:49:34'),(480,3,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(481,4,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',1,'2026-08-07 18:30:35'),(482,5,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(483,6,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(484,15,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(485,16,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(486,17,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(487,18,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(488,19,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(489,20,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(490,21,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(491,22,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(492,23,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(493,24,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(494,25,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(495,26,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(496,27,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(497,28,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(498,29,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(499,30,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(500,31,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(501,32,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(502,33,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(503,34,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',0,'2026-08-07 18:30:35'),(504,37,23,'Nueva solicitud','Facundo Andres Nasisi ha creado: Solicitud de orientación sobre Depresión',1,'2026-08-07 18:30:35'),(505,40,23,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Sequeiros',1,'2026-08-07 18:32:40'),(506,40,23,'Turno asignado','Turno asignado: Lic. Mariano Martinez, 2026-08-10, 16:00, Hospital Pablo Soria',1,'2026-08-07 18:33:23'),(507,3,23,'Nueva cita asignada','Nueva cita asignada: Facundo Andres Nasisi, 2026-08-10, 16:00',0,'2026-08-07 18:33:23'),(508,36,21,'Estado actualizado','Tu solicitud \'Busco ayuda \' cambio a: ASIGNADA',0,'2026-08-08 03:07:06'),(509,36,21,'Estado actualizado','Tu solicitud \'Busco ayuda \' cambio a: EN_PROCESO',0,'2026-08-08 03:07:08'),(510,36,21,'Turno agendado','Su profesional Alejandro Moitiño ha agendado un turno para el 2026-08-14 a las 16:00.',0,'2026-08-08 03:07:45'),(511,3,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(512,4,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',1,'2026-08-08 04:30:34'),(513,5,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(514,6,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(515,15,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(516,16,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(517,17,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(518,18,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(519,19,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(520,20,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(521,21,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(522,22,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(523,23,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(524,24,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(525,25,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(526,26,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(527,27,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(528,28,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(529,29,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(530,30,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(531,31,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(532,32,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(533,33,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(534,34,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',0,'2026-08-08 04:30:34'),(535,37,24,'Nueva solicitud','nicolas argento ha creado: Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas',1,'2026-08-08 04:30:34'),(536,14,24,'Derivacion a centro','Tu solicitud fue derivada a: Hospital Pablo Soria',1,'2026-08-08 04:31:02'),(537,14,24,'Turno asignado','Turno asignado: Alejandro Moitiño, 2026-08-10, 08:00, Hospital Pablo Soria',1,'2026-08-08 04:31:26'),(538,37,24,'Nueva cita asignada','Nueva cita asignada: nicolas argento, 2026-08-10, 08:00',1,'2026-08-08 04:31:26'),(539,39,22,'Estado actualizado','Tu solicitud \'Solicitud de orientación sobre Conflictos familiares\' cambio a: REVISADA',0,'2026-08-08 04:35:28'),(540,8,3,'Estado actualizado','Tu solicitud \'Cocaina\' cambio a: EN_PROCESO',0,'2026-08-10 22:03:38'),(541,8,3,'Estado actualizado','Tu solicitud \'Cocaina\' cambio a: COMPLETADA',0,'2026-08-10 22:03:55');
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `obra_social`
--

DROP TABLE IF EXISTS `obra_social`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `obra_social` (
  `id_obra_social` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(20) DEFAULT NULL,
  `telefono_autorizaciones` varchar(20) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_obra_social`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `obra_social`
--

LOCK TABLES `obra_social` WRITE;
/*!40000 ALTER TABLE `obra_social` DISABLE KEYS */;
INSERT INTO `obra_social` VALUES (1,'Sin Cobertura','PUBLICA',NULL,1),(2,'PAMI','PUBLICA','0800-222-7264',1),(3,'OSDE','PRIVADA','0800-888-6733',1),(4,'Swiss Medical','PREPAGA','0800-555-5050',1),(5,'IOMA','PUBLICA','0800-666-4662',1),(6,'Medicus','PREPAGA','0800-888-3000',1),(7,'Galeno','PREPAGA','0800-777-7777',1);
/*!40000 ALTER TABLE `obra_social` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `id_paciente` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `tipo_documento` varchar(20) DEFAULT NULL,
  `num_documento` varchar(20) DEFAULT NULL,
  `consentimiento_ok` tinyint(1) DEFAULT '0',
  `fecha_consentimiento` date DEFAULT NULL,
  `id_obra_social` bigint DEFAULT NULL,
  `id_profesional_registra` bigint DEFAULT NULL,
  `numero_afiliado` varchar(50) DEFAULT NULL,
  `plan_cobertura` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  UNIQUE KEY `num_documento` (`num_documento`),
  KEY `fk_paciente_obra_social` (`id_obra_social`),
  KEY `fk_paciente_profesional_registra` (`id_profesional_registra`),
  CONSTRAINT `fk_paciente_obra_social` FOREIGN KEY (`id_obra_social`) REFERENCES `obra_social` (`id_obra_social`),
  CONSTRAINT `fk_paciente_profesional_registra` FOREIGN KEY (`id_profesional_registra`) REFERENCES `profesional` (`id_profesional`),
  CONSTRAINT `fk_paciente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
INSERT INTO `paciente` VALUES (1,7,'1990-05-15','DNI','30123456',1,'2026-07-16',3,NULL,'OSDE-123456','Plan 210'),(2,8,'1985-03-20','DNI','27123456',1,'2026-07-16',1,NULL,NULL,NULL),(3,9,'1998-03-22','DNI','4444334',1,'2026-07-16',4,NULL,'4444444445','Basico-Familiar'),(4,10,NULL,'DNI','40123456',0,NULL,NULL,NULL,NULL,NULL),(5,11,NULL,'DNI','40987654',1,'2026-07-17',NULL,NULL,NULL,NULL),(6,12,'2002-03-22','DNI','42453888',1,'2026-07-19',NULL,NULL,'',''),(7,13,'1998-02-18','DNI','42453098',1,'2026-07-19',NULL,NULL,'',''),(8,14,'1997-03-22','DNI','44342342',1,'2026-07-21',NULL,NULL,'',''),(9,35,'1998-02-23','DNI','42424242',1,'2026-07-21',NULL,NULL,'',''),(10,36,'1997-04-22','DNI','39888645',1,'2026-07-23',NULL,NULL,'',''),(11,38,'2003-07-19','DNI','42444334',1,'2026-07-24',NULL,NULL,'',''),(12,39,'2002-03-29','DNI','44477489',1,'2026-07-27',NULL,25,'-','-'),(13,40,'1999-03-25','DNI','39775642',1,'2026-07-27',1,25,'-','-'),(14,41,'1997-03-14','DNI','42424244',1,'2026-08-03',NULL,NULL,'','');
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_foro`
--

DROP TABLE IF EXISTS `post_foro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_foro` (
  `id_post` bigint NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `es_anonimo` tinyint(1) NOT NULL DEFAULT '0',
  `categoria` varchar(50) NOT NULL,
  `cantidad_apoyos` int NOT NULL DEFAULT '0',
  `id_paciente` bigint NOT NULL,
  `cantidad_informacion` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_post`),
  KEY `fk_post_paciente` (`id_paciente`),
  CONSTRAINT `fk_post_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_foro`
--

LOCK TABLES `post_foro` WRITE;
/*!40000 ALTER TABLE `post_foro` DISABLE KEYS */;
INSERT INTO `post_foro` VALUES (1,'Panico','Que hacer si mi cuerpo se siente muy caliente y me falta el aire un poco, recomienden algunos tips por favor.','2026-08-04 00:05:30',0,'Consejos',2,8,0),(2,'Quiero saber si alguno le pasa esto:- me pasa que se me cierra la garganta y me falta el aire en un ataque de panico.','Que deberia hacer?','2026-08-08 00:04:17',0,'Consejos',0,13,0);
/*!40000 ALTER TABLE `post_foro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profesional`
--

DROP TABLE IF EXISTS `profesional`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesional` (
  `id_profesional` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  `horario_atencion` varchar(255) DEFAULT NULL,
  `id_centro_salud` bigint DEFAULT NULL,
  PRIMARY KEY (`id_profesional`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  KEY `fk_profesional_centro` (`id_centro_salud`),
  CONSTRAINT `fk_profesional_centro` FOREIGN KEY (`id_centro_salud`) REFERENCES `centro_salud` (`id_centro`),
  CONSTRAINT `fk_profesional_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesional`
--

LOCK TABLES `profesional` WRITE;
/*!40000 ALTER TABLE `profesional` DISABLE KEYS */;
INSERT INTO `profesional` VALUES (1,3,'Lun-Mie-Vie 8-17hs',1),(2,4,'Lun-Mie-Vie 8-17hs',1),(3,5,'Lun-Vie 8-20hs',6),(4,6,'Mar-Jue 8-17hs, Vie 8-13hs',1),(5,15,'Lun-Mie-Vie 9-16hs',1),(6,16,'Lun-Vie 8-20hs',6),(7,17,'Lun-Vie 8-20hs',6),(8,18,'Lun-Vie 8-20hs',6),(9,19,'Lun-Vie 8-17hs',11),(10,20,'Lun-Vie 8-17hs',11),(11,21,'Lun-Vie 8-17hs',11),(12,22,'Lun-Vie 8-17hs',11),(13,23,'Lun-Dom guardia 24hs',5),(14,24,'Lun-Dom guardia 24hs',5),(15,25,'Lun-Dom guardia 24hs',5),(16,26,'Lun-Vie 8-17hs',2),(17,27,'Lun-Vie 8-17hs',2),(18,28,'Lun-Vie 8-17hs',2),(19,29,'Lun-Dom guardia 24hs',7),(20,30,'Lun-Dom guardia 24hs',7),(21,31,'Lun-Dom guardia 24hs',7),(22,32,'Lun-Vie 9-20hs',17),(23,33,'Lun-Vie 9-20hs, Sab 9-13hs',17),(24,34,'Mar-Vie 10-19hs',17),(25,37,'Lun-Vie 8-20hs',1);
/*!40000 ALTER TABLE `profesional` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_sintomatologia`
--

DROP TABLE IF EXISTS `registro_sintomatologia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_sintomatologia` (
  `id_registro` bigint NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint NOT NULL,
  `fecha` date NOT NULL,
  `calidad_suenio` int NOT NULL,
  `estres_ansiedad` int NOT NULL,
  `adherencia` int NOT NULL,
  `notas` text,
  PRIMARY KEY (`id_registro`),
  KEY `fk_sintomatologia_paciente` (`id_paciente`),
  CONSTRAINT `fk_sintomatologia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_sintomatologia`
--

LOCK TABLES `registro_sintomatologia` WRITE;
/*!40000 ALTER TABLE `registro_sintomatologia` DISABLE KEYS */;
INSERT INTO `registro_sintomatologia` VALUES (9,12,'2026-07-27',3,8,5,'No pude dormir porque estuve estudiando.'),(10,12,'2026-07-27',2,10,5,'No pude dormir.'),(11,8,'2026-08-03',6,2,5,'Hoy me siento realmente feliz.'),(12,14,'2026-08-03',6,10,1,'Hoy es mi primer dia que uso esta plataforma, y verdaderamente me gusta.'),(13,14,'2026-08-03',7,7,7,'Hoy me siento miuy bien '),(14,10,'2026-08-05',7,7,1,'Quiero empezar alguna actividad fisica.\n'),(15,12,'2026-08-05',7,8,1,'Me siento contento'),(16,13,'2026-08-07',10,10,1,'No me siento muy muy bien digamos.'),(17,8,'2026-08-07',5,9,2,'pienso en que voy hacer mañana.'),(18,8,'2026-08-10',5,10,1,'mjuy bien');
/*!40000 ALTER TABLE `registro_sintomatologia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secretario`
--

DROP TABLE IF EXISTS `secretario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `secretario` (
  `id_secretario` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  PRIMARY KEY (`id_secretario`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `fk_secretario_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secretario`
--

LOCK TABLES `secretario` WRITE;
/*!40000 ALTER TABLE `secretario` DISABLE KEYS */;
INSERT INTO `secretario` VALUES (1,2);
/*!40000 ALTER TABLE `secretario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimiento`
--

DROP TABLE IF EXISTS `seguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguimiento` (
  `id_seguimiento` bigint NOT NULL AUTO_INCREMENT,
  `id_solicitud` bigint NOT NULL,
  `id_profesional` bigint NOT NULL,
  `descripcion` text NOT NULL,
  `archivo_adjunto` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL,
  PRIMARY KEY (`id_seguimiento`),
  KEY `fk_seguimiento_solicitud` (`id_solicitud`),
  KEY `fk_seguimiento_profesional` (`id_profesional`),
  CONSTRAINT `fk_seguimiento_profesional` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`),
  CONSTRAINT `fk_seguimiento_solicitud` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimiento`
--

LOCK TABLES `seguimiento` WRITE;
/*!40000 ALTER TABLE `seguimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitud`
--

DROP TABLE IF EXISTS `solicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud` (
  `id_solicitud` bigint NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint NOT NULL,
  `id_profesional` bigint DEFAULT NULL,
  `id_categoria` bigint NOT NULL,
  `id_centro_salud` bigint DEFAULT NULL,
  `fecha_turno` timestamp NULL DEFAULT NULL,
  `duracion_turno` int DEFAULT NULL,
  `modalidad` varchar(20) DEFAULT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `estado` varchar(20) NOT NULL,
  `prioridad` varchar(10) NOT NULL,
  `fecha_creacion` timestamp NOT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `resumen_breve` text,
  `anamnesis` text,
  `archivo_adjunto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_solicitud`),
  KEY `fk_solicitud_paciente` (`id_paciente`),
  KEY `fk_solicitud_profesional` (`id_profesional`),
  KEY `fk_solicitud_categoria` (`id_categoria`),
  KEY `fk_solicitud_centro` (`id_centro_salud`),
  CONSTRAINT `fk_solicitud_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_ayuda` (`id_categoria`),
  CONSTRAINT `fk_solicitud_centro` FOREIGN KEY (`id_centro_salud`) REFERENCES `centro_salud` (`id_centro`),
  CONSTRAINT `fk_solicitud_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `fk_solicitud_profesional` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitud`
--

LOCK TABLES `solicitud` WRITE;
/*!40000 ALTER TABLE `solicitud` DISABLE KEYS */;
INSERT INTO `solicitud` VALUES (1,2,1,5,1,'2026-07-31 22:00:00',30,'PRESENCIAL','Necesito ayuda','Mis papas no me dan de comer.','ASIGNADA','URGENTE','2026-07-16 22:09:15','2026-07-28 03:24:21',1,NULL,NULL,NULL),(2,3,NULL,2,NULL,NULL,NULL,NULL,'Violencia','mi pareja mi esta golpeando hace varios dias, quiero dejar en claro esto.','COMPLETADA','URGENTE','2026-07-17 02:37:28','2026-07-24 07:36:52',1,NULL,NULL,NULL),(3,2,2,1,1,'2026-07-30 14:30:00',30,'PRESENCIAL','Cocaina','Quiero dejar esta mierda, ayudenme. Vengo consumiendo hace 2 años.','COMPLETADA','URGENTE','2026-07-17 02:38:53','2026-08-10 22:03:55',1,NULL,NULL,NULL),(4,5,25,4,1,'2026-07-31 22:00:00',30,'PRESENCIAL','Necesito ayuda con ansiedad','Ultimamente me siento muy ansioso','ASIGNADA','MEDIA','2026-07-17 07:00:26','2026-07-30 21:18:08',1,'Ataques de panico frecuentes',NULL,'d0b9d616-6345-4510-922d-07a542b6f46a.jpg'),(5,6,4,5,1,'2026-07-29 15:00:00',30,'PRESENCIAL','Problemas Familiares','mi padrastro me esta golpeando','ASIGNADA','URGENTE','2026-07-19 08:10:07','2026-07-28 03:27:02',1,'siento que estoy cambiando mi manera de pensar por ver cosas que no tengo que ver a mi edad. Tengo 15 años',NULL,NULL),(6,8,17,1,2,'2026-07-31 15:30:00',30,'PRESENCIAL','Consumo de Sustancias / Adicciones','Estoy siendo adicto.','ASIGNADA','ALTA','2026-07-21 22:54:35','2026-07-28 03:29:20',1,'Quiero recibir ayuda inmediatamente. Tengo 26 años ',NULL,NULL),(7,8,NULL,5,NULL,NULL,NULL,NULL,'Problemas Familiares y Violencia ','Mi padrastro me esta golpeando cuando toma alochol.','DERIVADA','MEDIA','2026-07-21 23:08:57','2026-07-21 23:10:27',1,'Quiero contar esto que estoy viendo y yo mejorar porque lloro cuando la veo a mi mama.',NULL,NULL),(8,9,NULL,2,NULL,NULL,NULL,NULL,'Depresión y Estado de Ánimo','Mi padrastro quiso tocarme.','DERIVADA','URGENTE','2026-07-21 23:16:43','2026-07-21 23:17:24',1,'quiero matar a mi padrastro',NULL,NULL),(9,9,NULL,2,NULL,NULL,NULL,NULL,'Violencia o Abuso','M estan pegando','DERIVADA','URGENTE','2026-07-21 23:21:42','2026-07-21 23:22:12',1,'Mi padrastro es un hdp quisiera hablar con algun profesional que me quiera escuchar.',NULL,NULL),(10,9,NULL,1,NULL,NULL,NULL,NULL,'Consumo de Sustancias / Adicciones','dadsadsadas','DERIVADA','ALTA','2026-07-21 23:51:21','2026-07-21 23:55:24',1,'asdsadsa',NULL,NULL),(11,9,1,2,1,'2026-07-23 14:00:00',15,'PRESENCIAL','Necesito ayuda de inmediato','Mi padrastro me esta pegando','ASIGNADA','URGENTE','2026-07-23 04:05:05','2026-07-23 04:06:56',1,'Cada vez que toma alcohol le pega a mi mama y a mi hermanito. yo tengo 16 años y el 13 años. \nTengo fotos mira ',NULL,'fb0ad98a-98ab-4645-ba96-3add9d2e00d8.png'),(12,9,NULL,4,16,NULL,NULL,NULL,'Quiero tomar pastillas para esta locura.','Ayudneme a conseguir un turno ','DERIVADA','MEDIA','2026-07-23 04:30:36','2026-07-23 04:31:13',1,'Me agarro un ataque y me desnude por completo, sentia miedo. Y veia una realidad totalmente diferente.',NULL,NULL),(13,9,1,1,1,'2026-07-24 21:15:00',15,'PRESENCIAL','quiero dejar de tomar cocaina','Adiccion a la cocaina','ASIGNADA','URGENTE','2026-07-23 05:30:23','2026-07-23 05:31:52',1,'Hace 5 años que consumo 3 veces por semana. Porque me gasto mucha plata , es que quiero dejarla.',NULL,NULL),(14,8,1,1,1,'2026-07-25 14:00:00',15,'PRESENCIAL','Necsisto dejar de consumir','Por favor quiero conectarme con un psicologo urgente.','ASIGNADA','URGENTE','2026-07-23 21:09:01','2026-07-23 21:11:05',1,'Estoy consumiendo hace 2 años',NULL,NULL),(15,10,NULL,4,3,NULL,NULL,NULL,'Neceisto ayuda profesional para manter mi ansiedad','Soy muy ansioso','DERIVADA','URGENTE','2026-07-24 03:25:06','2026-07-24 03:26:59',1,'Quiero dejar de serlo por favor comuniquenme con un profesional urgente.',NULL,NULL),(16,11,16,5,2,'2026-07-30 15:00:00',30,'PRESENCIAL','Neceisto ayuda, estoy sufriendo al ver a mis padres pelear','Mis padres pelean todo el tiempo.','EN_PROCESO','URGENTE','2026-07-24 07:49:57','2026-08-01 01:15:51',1,'Pasa esto: mis padres peleantodo el tiempoy mi hermanita menor no para de llorar, entonces queresmo acudir algun psicologo que nos ayudea las 2.',NULL,NULL),(17,8,NULL,4,NULL,NULL,NULL,NULL,'Tengo mucha ansiedad','Pido ayuda de inmediato','COMPLETADA','MEDIA','2026-07-24 08:03:01','2026-07-31 00:55:41',1,'Quiero ver un psiquiatra para que me de pastillas.',NULL,NULL),(18,12,1,11,1,'2026-07-30 16:00:00',15,'PRESENCIAL','Necesito ayuda.','Estoy viendo que esta empeorando mi cuerpo a causa de estas adicciones constantes.','EN_PROCESO','MEDIA','2026-07-28 00:53:15','2026-07-30 23:00:41',1,'Estoy consumiendo hace mas de 6 años.','Tengo sintomas de abstinencia.',NULL),(19,14,4,10,1,'2026-08-14 21:30:00',30,'PRESENCIAL','Evaluacion de panico ','Ayudeneme','COMPLETADA','MEDIA','2026-08-04 05:55:15','2026-08-08 04:11:31',1,'Quiero tomar unas pastillas que regulen digamos los ataques ','Me estas dando miedo porque cuando veo que se pelean en casa , me agarra ataques de panico. me pongo helado ',NULL),(20,10,23,15,17,'2026-08-21 15:00:00',30,'PRESENCIAL','Quiero ayuda','No me gusta mi cuerpo','ASIGNADA','BAJA','2026-08-05 19:47:09','2026-08-05 21:15:27',1,'ayuda','-',NULL),(21,10,25,16,NULL,'2026-08-14 22:00:00',15,'PRESENCIAL','Busco ayuda ','Afecta mi descanso.\n Me siento abrumado/a.\n Tengo dificultad para concentrarme','ASIGNADA','MEDIA','2026-08-05 20:41:31','2026-08-08 03:07:08',1,'creo qeu tengo ludopatia','-',NULL),(22,12,NULL,11,NULL,NULL,NULL,NULL,'Solicitud de orientación sobre Conflictos familiares','Hace mas de 3 años consumo. Me esta afectando ya en la casa se dieron cuenta.\nMi objetivo es salir de esta. Me siento abrumado/a','REVISADA','MEDIA','2026-08-05 22:49:33','2026-08-08 04:35:28',1,'Consumo todos los dias. 1gr ','-',NULL),(23,13,1,6,1,'2026-08-10 22:00:00',30,'PRESENCIAL','Solicitud de orientación sobre Depresión','No me siento bien, quiero hablar con alguien. Siento ansiedad diaria','ASIGNADA','MEDIA','2026-08-07 18:30:35','2026-08-07 18:33:23',1,'Ayudenme por favor a volver a brillar','-',NULL),(24,8,25,11,1,'2026-08-10 14:00:00',30,'PRESENCIAL','Solicitud de orientación sobre Crisis Vitales, Duelo y Pérdidas','Tengo dificultad para concentrarme','ASIGNADA','MEDIA','2026-08-08 04:30:34','2026-08-08 04:31:26',1,'Estoy tomando mucho',NULL,NULL);
/*!40000 ALTER TABLE `solicitud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` bigint NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  `tipo_usuario` varchar(20) NOT NULL,
  `tipo_profesional` varchar(20) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `numero_licencia` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_registro` timestamp NOT NULL,
  `email_confirmado` tinyint(1) DEFAULT '0',
  `foto_perfil` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Administrador Sistema','admin@sistemasalud.com','$2a$10$N73zLpujRg8kux3Gapbqa.6gL/CWJJkYhjqNWlMD63bFPEkpriUsS','1155550000',NULL,NULL,NULL,'ADMIN',NULL,NULL,NULL,1,'2026-07-16 22:03:04',1,NULL),(2,'Maria Secretaria','secretaria@sistemasalud.com','$2a$10$mF6mq9JMg8lkwNi4Jrr7B.3vIlx5uXu7una5lOD/JYtkJZrtw283G','1155551111',NULL,NULL,NULL,'SECRETARIO',NULL,NULL,NULL,1,'2026-07-16 22:03:04',1,NULL),(3,'Lic. Mariano Martinez','mariano.martinez@salud.com','$2a$10$oK3kxIl8FDYWTi.7IWwSq.hvy0ULY5HtQuXqI2rFj2Rwju9ln8Sa.','1155552222',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia Clinica','LP-12345',1,'2026-07-16 22:03:04',1,NULL),(4,'Lic. Laura Gonzalez','laura.gonzalez@salud.com','$2a$10$HphsCvaSU4r0pdCiaPJMFuKm48Zx3MW8/BVHU/F6LF4rvp6ewbSMO','1155553333',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia Infantil','LP-12346',1,'2026-07-16 22:03:04',1,NULL),(5,'Dr. Carlos Rodriguez','carlos.rodriguez@salud.com','$2a$10$miSDzRwq0VQ7y1A76HYnC.EmuWRMNMn6GkHp2nP7n8mBwnygBB/ba','1155554444',NULL,NULL,NULL,'PROFESIONAL','MEDICO','Clinica General','MN-54321',1,'2026-07-16 22:03:04',1,NULL),(6,'Lic. Ana Perez','ana.perez@salud.com','$2a$10$YTS3sG/9z.JIXLKp5GmdW.XUNzPxGQVlLL6LP7MHFUKQpfiXwIIQq','1155555555',NULL,NULL,NULL,'PROFESIONAL','TRABAJADOR_SOCIAL','Trabajo Social','TS-67890',1,'2026-07-16 22:03:04',1,NULL),(7,'Juan Perez','juan.perez@email.com','$2a$10$0KYl5DLuW065e2xup90z4u7Wkbafjq9rsrhhtstWwdQT/..yCRKlm','1155556666',NULL,NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-16 22:03:04',1,NULL),(8,'Maria Lopez','maria.lopez@email.com','$2a$10$qaOQ.w4W0ukM3c45KBhpcuYMMpfjLV4.SngCdaAJ6BzTPx2ncVU36','1155557777','ayacuil 1233',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-16 22:03:04',1,'520ef8b5-1716-46e5-8880-cfcb695ab656.png'),(9,'pablo perez','pablo.perez@email.com','$2a$10$bdsqOh3GN9Cw/GV1k9dG4uPFbwzDJ1ylIPj3jIwbQFOrSrXCPV2u2','31321333','otero 444',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-17 02:30:56',1,NULL),(10,'Test Paciente','test@test.com','$2a$10$kSpt.I712iA5GPy1TJP4IOygcLThvQrf5ApNpRSTvLJebuHSkBuXq','1112345678','Av. Siempre Viva 742',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-17 05:37:18',1,'7c9bd382-5f3e-479b-ad87-0005f3291b7b.jpg'),(11,'Test Paciente 2','test2@test.com','$2a$10$8pZFFk1m4e.WG80mlN3xQu9kJ5CrgcU6KcfM/Q5EPS/4TOG0EqVD2','1155550000','Av. Test 123',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-17 07:00:26',1,NULL),(12,'alvaro santiago ','alvarosantiago@gmail.com','$2a$10$o8mjvB80uGHf/Mk56jqOvOBphvs7TTxBByEXIwkJ02zM2qcxLAONa','3123121233','eva peron 971',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-19 07:41:44',1,NULL),(13,'Facundo Andres Nasisi','facuna@gmial.com','$2a$10$pnCT8SksRmTsvW5zEltKC.srki0tGpFiEVA3BZzR8sx8SZSWEslUK','3884775588','teniente castagnari 473',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-19 17:29:43',1,NULL),(14,'nicolas argento','nicoargento@sistemasalud.com','$2a$10$zocb6wqxMGvXPCL5mR8QzufzaSXThstiw6QsBOLIERJc7LfhVpeVC','31123213','elsaperrez 999',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-21 22:53:45',1,'d8e114be-13c6-4fdf-80dd-8402180ee9ea.png'),(15,'Dra. Sofia Mendoza','sofia.mendoza@salud.com','$2a$10$qvrTE8ACTTsSZacNOo1B8eIIM9djZFAtQFHfhqr7VMuOj2pNqxYQ6','1155558888',NULL,NULL,NULL,'PROFESIONAL','PSIQUIATRA','Psiquiatria General','MN-98765',1,'2026-07-21 23:06:41',1,NULL),(16,'Lic. Fernando Castro','fernando.castro@salud.com','$2a$10$9NaAcLaUTkut1ZhBnOUtK.5WNZl/.LymF/s/i.f8aShFjnnNbITb.','1155559999',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Terapia Cognitivo Conductual','LP-24680',1,'2026-07-21 23:06:42',1,NULL),(17,'Dra. Romina Vega','romina.vega@salud.com','$2a$10$LgFFrq7Vii3Tn1QEbEUKCO1H1.pAmzpWk.ODkW1oOxKZST4o7ui2a','1155552220',NULL,NULL,NULL,'PROFESIONAL','MEDICO','Medicina Familiar','MN-97531',1,'2026-07-21 23:06:42',1,NULL),(18,'Dr. Juan Aguero','juan.aguero@salud.com','$2a$10$nzq/xvk39PRmEMev5gWW7.XXn2ompWH0LZR0AJ0OVVuZbi7Iifrx.','1155551110',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia de Emergencias','LP-13579',1,'2026-07-21 23:06:42',1,NULL),(19,'Dra. Patricia Morales','patricia.morales@salud.com','$2a$10$iIwBTBGTrDR54pBG6GMD4eyh/czJYOgQlz81E7It2TaGBzHo8V6KC','1155553330',NULL,NULL,NULL,'PROFESIONAL','PSIQUIATRA','Psiquiatria Adultos','MN-11111',1,'2026-07-21 23:06:42',1,NULL),(20,'Lic. Gabriela Sosa','gabriela.sosa@salud.com','$2a$10$Olm6zTNZqaNMV658ZpJh6O4zG5UlYa55x/6PB/mr4tpXSrstUKjDW','1155553331',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia Clinica','LP-22222',1,'2026-07-21 23:06:42',1,NULL),(21,'Dr. Martin Chavez','martin.chavez@salud.com','$2a$10$fMjOaBUshgS5/nPHlXnRy.dq5yTfhXxu1dhnLMXkCeX28SQ9s3i1y','1155553332',NULL,NULL,NULL,'PROFESIONAL','MEDICO','Clinica General','MN-33333',1,'2026-07-21 23:06:42',1,NULL),(22,'Lic. Elena Ruiz','elena.ruiz@salud.com','$2a$10$f/P27Iaz9UEUBsa0iqQlz.XUM6Gb5ixigc3CFmQLQCap3KvCWDyha','1155553333',NULL,NULL,NULL,'PROFESIONAL','TRABAJADOR_SOCIAL','Trabajo Social Sanitario','TS-44444',1,'2026-07-21 23:06:42',1,NULL),(23,'Dr. Ricardo Ledesma','ricardo.ledesma@salud.com','$2a$10$gVSdmHelzY/9/wm3tzVdxumAewQhcQUcboZcvpxpkO/k8dJcgp2x6','1155554440',NULL,NULL,NULL,'PROFESIONAL','PSIQUIATRA','Psiquiatria General','MN-55555',1,'2026-07-21 23:06:42',1,NULL),(24,'Lic. Silvia Acosta','silvia.acosta@salud.com','$2a$10$rbct3Zc0GM8KEJJoStm2gOB4Tf3xybLgEh0mxs7rkid3r6F3hFKga','1155554441',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Terapia Familiar','LP-66666',1,'2026-07-21 23:06:42',1,NULL),(25,'Lic. Daniel Ramos','daniel.ramos@salud.com','$2a$10$GzoojN/Kz4q/bovomzD.ZeJic.u5CMpP1gFEW.bLz//TuwNjJj2aC','1155554442',NULL,NULL,NULL,'PROFESIONAL','TRABAJADOR_SOCIAL','Trabajo Social Comunitario','TS-77777',1,'2026-07-21 23:06:42',1,NULL),(26,'Lic. Cecilia Vargas','cecilia.vargas@salud.com','$2a$10$48JWAOag98NbnC.yDdAS0OTop0vFI9jjQVhY8medA0zPbr9XCywC.','1155555550',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia General','LP-88888',1,'2026-07-21 23:06:42',1,NULL),(27,'Dr. Hernan Paz','hernan.paz@salud.com','$2a$10$hY2Cl2oCzJ6HK/39s4Ud7.S2hP3w0ZTCOpEML06uMxr.xFqFezBV2','1155555551',NULL,NULL,NULL,'PROFESIONAL','MEDICO','Medicina General','MN-99999',1,'2026-07-21 23:06:42',1,NULL),(28,'Lic. Marta Juarez','marta.juarez@salud.com','$2a$10$2fWUpldG8tf5tBlcy8qdNOrjyHV/P7TRgB1VhflQJx3dTeSGLDWlq','1155555552',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia Infantil','LP-00000',1,'2026-07-21 23:06:43',1,NULL),(29,'Dra. Beatriz Toledo','beatriz.toledo@salud.com','$2a$10$7AEwoVKwpiIrpgJ7t8tj3OYUhg0oluNul9MCKXWTY2H70VXbNnVsG','1155556660',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia Perinatal','LP-10101',1,'2026-07-21 23:06:43',1,NULL),(30,'Lic. Jorge Medina','jorge.medina@salud.com','$2a$10$YPyPr08CB/IkPhib2a.U3eB9ysL0C7mKKXh3ol7R5NqzSo5hgGej2','1155556661',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia Infantil','LP-20202',1,'2026-07-21 23:06:43',1,NULL),(31,'Dra. Lucia Ferreyra','lucia.ferreyra@salud.com','$2a$10$/d9cIg46y1N/JKw0vEdCaOmrGgcbpis6tYccjkcIgcL4OnWaseqTS','1155556662',NULL,NULL,NULL,'PROFESIONAL','TRABAJADOR_SOCIAL','Trabajo Social Infantil','TS-30303',1,'2026-07-21 23:06:43',1,NULL),(32,'Dra. Valeria Gutierrez','valeria.gutierrez@salud.com','$2a$10$4N8lcJldg.Ds78Rsy6KTJORtJJxI6JG7Rv7ZhL5cj6Kx52JV4/1OS','1155557770',NULL,NULL,NULL,'PROFESIONAL','PSIQUIATRA','Psiquiatria Adultos','MN-40404',1,'2026-07-21 23:06:43',1,NULL),(33,'Lic. Pablo Quiroga','pablo.quiroga@salud.com','$2a$10$gpqInggXprrmDPl5FkelTOfK/NczyVHfr4W/4LqvTO/oJ/9vNn8TC','1155557771',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Terapia Cognitivo Conductual','LP-50505',1,'2026-07-21 23:06:43',1,NULL),(34,'Lic. Andrea Campos','andrea.campos@salud.com','$2a$10$YLss5hLxcmS./wWiRuWUg.bVJdWicgsHoD9atGf8705Bql7fUdxpW','1155557772',NULL,NULL,NULL,'PROFESIONAL','PSICOLOGO','Psicologia de Adultos','LP-60606',1,'2026-07-21 23:06:43',1,NULL),(35,'alfredo lunad ','alfredolunad@sistemasalud.com','$2a$10$vUh4bFA79iVPIfBQT8eNB.NDJVF.7FqPMUsh2AyuNsk9nx8ufnkQS','123737888','tte castagmanari 444',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-21 23:15:29',1,NULL),(36,'Celeste Montiel ','celestemontiel@sistemasalud.com','$2a$10$yubJC8wx2OTOdEJnqt2MWeqbfmw3i/xbsIXvIWDiNYYlVSd8fqDji','3884884473','Chañi 1322',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-24 03:23:29',1,'759d88a9-d202-445a-bcfb-4873fc13b78d.png'),(37,'Alejandro Moitiño','alemoi@sistemasalud.com','$2a$10$DsEfLtuhmjG/23lvmbcfhecLIetINDf37sg4GXi/F50XOCZjTEEtO','3884771148','Castagnari 361',NULL,NULL,'PROFESIONAL','MEDICO','Especialista en Salud Mental','00003655123454',1,'2026-07-24 07:29:40',1,'da32ccf4-4cde-47a7-8df4-a6424597a00a.png'),(38,'Nicolas Velazquez','nicovela@sistemasalud.com','$2a$10$AK2wqq5Whju1ACEra9OqoO2WipWlg3WswrrhTEOpWShn.lsyzOZSG','388456987','Sumaipacha 887',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-24 07:48:02',1,NULL),(39,'santiago nasisi','santinasisi@sistemasalud.com','$2a$10$gPf2x7yj8vI5KCWs2yO8eeHkWYh5JMFD2g4DWVF0uG9SD7Ihg/sb.','38847739833','Tte Bustos 333',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-27 22:06:51',1,NULL),(40,'Facundo Andres Nasisi','facuna@sistemasalud.com','$2a$10$eyOJTcmnMIsvQGRQM5yPiul1ZPe00mH0Fz8PU9a/hgScmmBl..aOy','3885876345','Farias 997',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-07-28 05:02:16',1,NULL),(41,'Juan Ignacio Soraire','nachosoraire@sistemasalud.com','$2a$10$T0/zuB1ij1yyfF.EvojX5uGZzEx4Qsr8to/6EqgqKZao59D8eOK1m','3889949494','Alvear 1999',NULL,NULL,'PACIENTE',NULL,NULL,NULL,1,'2026-08-04 03:08:19',1,'81435a99-c7c3-476e-8c53-7653fa2f892b.png');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-10 16:29:46
