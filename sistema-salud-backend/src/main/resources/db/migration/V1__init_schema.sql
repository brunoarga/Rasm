CREATE TABLE usuario (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    latitud DOUBLE,
    longitud DOUBLE,
    tipo_usuario VARCHAR(20) NOT NULL,
    tipo_profesional VARCHAR(20),
    especialidad VARCHAR(100),
    numero_licencia VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL,
    email_confirmado BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE obra_social (
    id_obra_social BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20),
    telefono_autorizaciones VARCHAR(20),
    activa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categoria_ayuda (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    prioridad VARCHAR(10) NOT NULL,
    icono VARCHAR(50),
    activa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE centro_salud (
    id_centro BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion VARCHAR(255),
    latitud DOUBLE,
    longitud DOUBLE,
    telefono VARCHAR(20),
    tipo_centro VARCHAR(20),
    es_publico BOOLEAN DEFAULT TRUE,
    tiene_emergencias BOOLEAN DEFAULT FALSE,
    horario_atencion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE paciente (
    id_paciente BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    tipo_documento VARCHAR(20),
    num_documento VARCHAR(20) UNIQUE,
    consentimiento_ok BOOLEAN DEFAULT FALSE,
    fecha_consentimiento DATE,
    id_obra_social BIGINT,
    numero_afiliado VARCHAR(50),
    plan_cobertura VARCHAR(100),
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_paciente_obra_social FOREIGN KEY (id_obra_social) REFERENCES obra_social(id_obra_social)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE profesional (
    id_profesional BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL UNIQUE,
    horario_atencion VARCHAR(255),
    CONSTRAINT fk_profesional_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE secretario (
    id_secretario BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_secretario_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE solicitud (
    id_solicitud BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    id_profesional BIGINT,
    id_categoria BIGINT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL,
    prioridad VARCHAR(10) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_solicitud_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente),
    CONSTRAINT fk_solicitud_profesional FOREIGN KEY (id_profesional) REFERENCES profesional(id_profesional),
    CONSTRAINT fk_solicitud_categoria FOREIGN KEY (id_categoria) REFERENCES categoria_ayuda(id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE seguimiento (
    id_seguimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    id_profesional BIGINT NOT NULL,
    descripcion TEXT NOT NULL,
    archivo_adjunto VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_seguimiento_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud),
    CONSTRAINT fk_seguimiento_profesional FOREIGN KEY (id_profesional) REFERENCES profesional(id_profesional)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE centro_obra_social_practica (
    id_centro_obra_practica BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_centro BIGINT NOT NULL,
    id_obra_social BIGINT NOT NULL,
    tipo_practica VARCHAR(30) NOT NULL,
    requiere_autorizacion BOOLEAN DEFAULT TRUE,
    telefono_autorizacion VARCHAR(20),
    dias_estimado_respuesta INT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_cosp_centro FOREIGN KEY (id_centro) REFERENCES centro_salud(id_centro),
    CONSTRAINT fk_cosp_obra_social FOREIGN KEY (id_obra_social) REFERENCES obra_social(id_obra_social)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cita (
    id_cita BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    id_profesional BIGINT NOT NULL,
    id_centro_salud BIGINT,
    fecha_hora TIMESTAMP NOT NULL,
    duracion INT NOT NULL,
    modalidad VARCHAR(20),
    estado VARCHAR(20),
    notas TEXT,
    tipo_practica VARCHAR(30),
    requiere_autorizacion BOOLEAN DEFAULT FALSE,
    estado_autorizacion VARCHAR(20) DEFAULT 'NO_REQUERIDA',
    numero_autorizacion VARCHAR(50),
    fecha_solicitud_autorizacion TIMESTAMP,
    fecha_respuesta_autorizacion TIMESTAMP,
    CONSTRAINT fk_cita_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud),
    CONSTRAINT fk_cita_profesional FOREIGN KEY (id_profesional) REFERENCES profesional(id_profesional),
    CONSTRAINT fk_cita_centro FOREIGN KEY (id_centro_salud) REFERENCES centro_salud(id_centro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE historia_clinica (
    id_historia BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    id_profesional BIGINT NOT NULL,
    id_solicitud BIGINT NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,
    observaciones TEXT,
    tipo_plantilla VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP,
    CONSTRAINT fk_hc_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente),
    CONSTRAINT fk_hc_profesional FOREIGN KEY (id_profesional) REFERENCES profesional(id_profesional),
    CONSTRAINT fk_hc_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE diario_sintomas (
    id_diario BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    fecha DATE NOT NULL,
    estado_animo VARCHAR(50),
    sintomas_texto TEXT,
    intensidad_dolor INT,
    horas_suenio DOUBLE,
    medicacion_tomada BOOLEAN,
    observaciones TEXT,
    CONSTRAINT fk_diario_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notificacion (
    id_notificacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_solicitud BIGINT,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_envio TIMESTAMP NOT NULL,
    CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_notif_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE consentimiento (
    id_consentimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    version VARCHAR(20) NOT NULL,
    aceptado BOOLEAN NOT NULL,
    fecha_aceptacion TIMESTAMP NOT NULL,
    ip_origen VARCHAR(45),
    CONSTRAINT fk_consentimiento_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE autorizacion_obra_social (
    id_autorizacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cita BIGINT NOT NULL,
    id_obra_social BIGINT NOT NULL,
    numero_solicitud VARCHAR(50),
    numero_autorizacion VARCHAR(50),
    estado VARCHAR(20),
    diagnostico_autorizacion TEXT,
    codigo_practica VARCHAR(20),
    monto_autorizado DECIMAL(10,2),
    observaciones_autorizacion TEXT,
    fecha_solicitud TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    archivo_autorizacion VARCHAR(255),
    creado_por BIGINT,
    CONSTRAINT fk_aut_cita FOREIGN KEY (id_cita) REFERENCES cita(id_cita),
    CONSTRAINT fk_aut_obra_social FOREIGN KEY (id_obra_social) REFERENCES obra_social(id_obra_social),
    CONSTRAINT fk_aut_usuario FOREIGN KEY (creado_por) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;