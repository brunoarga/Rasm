-- Asignar profesionales registrados por la UI al centro correspondiente
-- Hospital Pablo Soria → ID 1
UPDATE profesional p
JOIN usuario u ON u.id_usuario = p.id_usuario
SET p.id_centro_salud = 1,
    p.horario_atencion = 'Lun-Vie 8-20hs'
WHERE u.nombre_completo LIKE '%Alejandro%Moitiño%'
   OR u.email = 'alejandro.moitino@sistemasalud.com';

-- Si algún profesional de la seed no tiene centro (por cambios de ID post-V7),
-- re-asignar los que estén en null al centro por defecto
UPDATE profesional p
JOIN usuario u ON u.id_usuario = p.id_usuario
SET p.id_centro_salud = 1
WHERE p.id_centro_salud IS NULL
  AND u.tipo_usuario = 'PROFESIONAL';
