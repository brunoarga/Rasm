package com.sistemasalud.service;

import com.sistemasalud.dto.request.CentroSaludRequest;
import com.sistemasalud.entity.CentroObraSocialPractica;
import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.enums.TipoPractica;
import com.sistemasalud.repository.CentroObraSocialPracticaRepository;
import com.sistemasalud.repository.CentroSaludRepository;
import com.sistemasalud.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;

@Service @RequiredArgsConstructor
public class CentroSaludService {
    private final CentroSaludRepository centroSaludRepository;
    private final CentroObraSocialPracticaRepository centroObraSocialPracticaRepository;

    public List<CentroSalud> listarCentros() { return centroSaludRepository.findByActivoTrue(); }

    @Transactional
    public CentroSalud crearCentro(CentroSaludRequest r) {
        if (centroSaludRepository.existsByNombre(r.getNombre().trim()))
            throw new com.sistemasalud.exception.SolicitudInvalidaException("Ya existe un centro con ese nombre");
        return centroSaludRepository.save(CentroSalud.builder()
                .nombre(r.getNombre().trim())
                .direccion(r.getDireccion())
                .latitud(r.getLatitud())
                .longitud(r.getLongitud())
                .telefono(r.getTelefono())
                .tipoCentro(r.getTipoCentro())
                .esPublico(r.getEsPublico() != null ? r.getEsPublico() : true)
                .tieneEmergencias(r.getTieneEmergencias() != null ? r.getTieneEmergencias() : false)
                .horarioAtencion(r.getHorarioAtencion())
                .activo(r.getActivo() != null ? r.getActivo() : true)
                .build());
    }

    public List<CentroSalud> buscarCercanos(Double lat, Double lon, Double radioKm, Long idObraSocial, String tipoPractica) {
        List<CentroSalud> centros;
        if (idObraSocial != null && tipoPractica != null) {
            centros = centroObraSocialPracticaRepository.findByObraSocialIdAndTipoPracticaAndActivoTrue(idObraSocial, TipoPractica.valueOf(tipoPractica)).stream().map(CentroObraSocialPractica::getCentro).filter(c -> c.getActivo()).distinct().toList();
        } else if (idObraSocial != null) {
            centros = centroObraSocialPracticaRepository.findByObraSocialIdAndTipoPracticaAndActivoTrue(idObraSocial, TipoPractica.CONSULTA_AMBULATORIA).stream().map(CentroObraSocialPractica::getCentro).filter(c -> c.getActivo()).distinct().toList();
        } else { centros = centroSaludRepository.findByActivoTrue(); }
        if (lat != null && lon != null) {
            double r = radioKm != null ? radioKm : 50.0;
            final double fr = r;
            centros = centros.stream().filter(c -> c.getLatitud() != null && c.getLongitud() != null).filter(c -> GeoUtils.calcularDistancia(lat, lon, c.getLatitud(), c.getLongitud()) <= fr).sorted(Comparator.comparingDouble(c -> GeoUtils.calcularDistancia(lat, lon, c.getLatitud(), c.getLongitud()))).toList();
        }
        return centros;
    }
}
