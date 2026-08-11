package com.sistemasalud.service;

import com.sistemasalud.entity.CentroObraSocialPractica;
import com.sistemasalud.entity.CentroSalud;
import com.sistemasalud.enums.TipoPractica;
import com.sistemasalud.repository.CentroObraSocialPracticaRepository;
import com.sistemasalud.repository.CentroSaludRepository;
import com.sistemasalud.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;

@Service @RequiredArgsConstructor
public class CentroSaludService {
    private final CentroSaludRepository centroSaludRepository;
    private final CentroObraSocialPracticaRepository centroObraSocialPracticaRepository;

    public List<CentroSalud> listarCentros() { return centroSaludRepository.findByActivoTrue(); }

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
