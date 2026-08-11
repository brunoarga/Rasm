package com.sistemasalud.service;

import com.sistemasalud.dto.response.PatronEmocionalResponse;
import com.sistemasalud.dto.response.PatronEmocionalResponse.DiaSemanaResumen;
import com.sistemasalud.entity.DiarioSintomas;
import com.sistemasalud.entity.Paciente;
import com.sistemasalud.entity.RegistroSintomatologia;
import com.sistemasalud.exception.RecursoNoEncontradoException;
import com.sistemasalud.repository.DiarioSintomasRepository;
import com.sistemasalud.repository.PacienteRepository;
import com.sistemasalud.repository.RegistroSintomatologiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatronEmocionalService {

    private final DiarioSintomasRepository diarioRepo;
    private final RegistroSintomatologiaRepository sintoRepo;
    private final PacienteRepository pacienteRepo;

    private static final Map<String, Double> ANIMO_SCORE = Map.of(
            "EXCELENTE", 5.0, "ESTABLE", 4.0,
            "ANSIOSO", 2.5, "TRISTE", 1.5, "IRRITABLE", 2.0
    );

    @Transactional(readOnly = true)
    public PatronEmocionalResponse analizar(Long idUsuario) {
        Paciente p = pacienteRepo.findByUsuarioId(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));

        List<DiarioSintomas> diarios = diarioRepo.findByPacienteIdOrderByFechaDesc(p.getId());
        List<RegistroSintomatologia> sinto = sintoRepo.findByPacienteIdOrderByFechaDesc(p.getId());

        Map<LocalDate, DiarioSintomas> diarioPorFecha = diarios.stream()
                .collect(Collectors.toMap(DiarioSintomas::getFecha, d -> d, (a, b) -> a));
        Map<LocalDate, RegistroSintomatologia> sintoPorFecha = sinto.stream()
                .collect(Collectors.toMap(RegistroSintomatologia::getFecha, s -> s, (a, b) -> a));

        Set<LocalDate> todasFechas = new HashSet<>(diarioPorFecha.keySet());
        todasFechas.addAll(sintoPorFecha.keySet());
        List<LocalDate> fechasOrdenadas = todasFechas.stream().sorted().toList();

        Map<DayOfWeek, List<Double>> animoPorDia = new HashMap<>();
        Map<DayOfWeek, List<Double>> estresPorDia = new HashMap<>();
        Map<DayOfWeek, List<Double>> suenioPorDia = new HashMap<>();
        Map<DayOfWeek, List<String>> animoTextoPorDia = new HashMap<>();

        List<Double> animosEnOrden = new ArrayList<>();
        List<Double> sueniosEnOrden = new ArrayList<>();
        List<Double> estresEnOrden = new ArrayList<>();

        for (LocalDate fecha : fechasOrdenadas) {
            DayOfWeek dia = fecha.getDayOfWeek();

            DiarioSintomas d = diarioPorFecha.get(fecha);
            RegistroSintomatologia s = sintoPorFecha.get(fecha);

            if (d != null && d.getEstadoAnimo() != null) {
                Double score = ANIMO_SCORE.get(d.getEstadoAnimo());
                if (score != null) {
                    animoPorDia.computeIfAbsent(dia, k -> new ArrayList<>()).add(score);
                    animoTextoPorDia.computeIfAbsent(dia, k -> new ArrayList<>()).add(d.getEstadoAnimo());
                    animosEnOrden.add(score);
                }
                if (d.getHorasSuenio() != null) {
                    suenioPorDia.computeIfAbsent(dia, k -> new ArrayList<>()).add(d.getHorasSuenio());
                    sueniosEnOrden.add(d.getHorasSuenio());
                }
            }

            if (s != null) {
                double estresVal = s.getEstresAnsiedad() != null ? s.getEstresAnsiedad() : 5;
                estresPorDia.computeIfAbsent(dia, k -> new ArrayList<>()).add(estresVal);
                estresEnOrden.add(estresVal);
            }
        }

        List<DiaSemanaResumen> porDiaSemana = new ArrayList<>();
        String mejorDia = null;
        String peorDia = null;
        double mejorPromedio = -1;
        double peorPromedio = 999;

        for (DayOfWeek dow : DayOfWeek.values()) {
            List<Double> scores = animoPorDia.get(dow);
            List<Double> estresList = estresPorDia.get(dow);
            List<Double> suenioList = suenioPorDia.get(dow);
            List<String> textos = animoTextoPorDia.get(dow);

            if (scores == null || scores.isEmpty()) continue;

            double animoAvg = scores.stream().mapToDouble(v -> v).average().orElse(0);
            double estresAvg = estresList != null ? estresList.stream().mapToDouble(v -> v).average().orElse(0) : 0;
            double suenioAvg = suenioList != null ? suenioList.stream().mapToDouble(v -> v).average().orElse(0) : 0;

            String animoPred = textos != null ? textos.stream()
                    .collect(Collectors.groupingBy(t -> t, Collectors.counting()))
                    .entrySet().stream().max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey).orElse("ESTABLE") : "ESTABLE";

            String nombreDia = dow.getDisplayName(TextStyle.FULL, new Locale("es", "AR"));
            nombreDia = nombreDia.substring(0, 1).toUpperCase() + nombreDia.substring(1);

            porDiaSemana.add(DiaSemanaResumen.builder()
                    .dia(nombreDia).animoPredominante(animoPred)
                    .animoPromedio(Math.round(animoAvg * 10) / 10.0)
                    .estresPromedio(Math.round(estresAvg * 10) / 10.0)
                    .suenioPromedio(Math.round(suenioAvg * 10) / 10.0)
                    .cantidadRegistros(scores.size()).build());

            if (animoAvg > mejorPromedio) {
                mejorPromedio = animoAvg;
                mejorDia = nombreDia;
            }
            if (animoAvg < peorPromedio) {
                peorPromedio = animoAvg;
                peorDia = nombreDia;
            }
        }

        String tendencia = calcularTendencia(animosEnOrden);
        String correlacionSuenio = calcularCorrelacionSuenio(sueniosEnOrden, animosEnOrden);
        String patronEstres = calcularPatronEstres(estresEnOrden, animosEnOrden);

        int racha = calcularRacha(diarioPorFecha);

        return PatronEmocionalResponse.builder()
                .porDiaSemana(porDiaSemana)
                .tendenciaGeneral(tendencia)
                .correlacionSuenioAnimo(correlacionSuenio)
                .patronEstresSuenio(patronEstres)
                .mejorDiaSemana(mejorDia)
                .peorDiaSemana(peorDia)
                .diasRegistrados(diarios.size())
                .rachaActual(racha)
                .build();
    }

    private String calcularTendencia(List<Double> animos) {
        if (animos.size() < 4) return "Registrá al menos 4 días para ver tu tendencia";
        int mitad = animos.size() / 2;
        double primeraMitad = animos.subList(0, mitad).stream().mapToDouble(v -> v).average().orElse(0);
        double segundaMitad = animos.subList(mitad, animos.size()).stream().mapToDouble(v -> v).average().orElse(0);

        if (segundaMitad - primeraMitad > 0.5) return "Mejorando";
        if (primeraMitad - segundaMitad > 0.5) return "Requiere atención";
        return "Estable";
    }

    private String calcularCorrelacionSuenio(List<Double> suenios, List<Double> animos) {
        if (suenios.size() < 4 || animos.size() < 4) return null;
        int min = Math.min(suenios.size(), animos.size());
        double suenioProm = suenios.subList(0, min).stream().mapToDouble(v -> v).average().orElse(0);
        double animoProm = animos.subList(0, min).stream().mapToDouble(v -> v).average().orElse(0);

        if (suenioProm < 5) return "Tu estado de ánimo podría mejorar con más horas de sueño";
        if (suenioProm >= 7 && animoProm >= 4) return "Dormir bien está ayudando a tu estado de ánimo";
        return null;
    }

    private String calcularPatronEstres(List<Double> estreses, List<Double> animos) {
        if (estreses.size() < 4 || animos.size() < 4) return null;
        double estresProm = estreses.stream().mapToDouble(v -> v).average().orElse(0);
        double animoProm = animos.stream().mapToDouble(v -> v).average().orElse(0);

        if (estresProm >= 7 && animoProm <= 2.5) return "El nivel de estrés elevado podría estar afectando tu bienestar";
        if (estresProm <= 4 && animoProm >= 4) return "Mantener el estrés bajo se refleja en tu estado de ánimo";
        return null;
    }

    private int calcularRacha(Map<LocalDate, DiarioSintomas> diarioPorFecha) {
        List<LocalDate> fechas = diarioPorFecha.keySet().stream().sorted(Comparator.reverseOrder()).toList();
        if (fechas.isEmpty()) return 0;
        int racha = 1;
        LocalDate esperada = fechas.get(0).minusDays(1);
        for (int i = 1; i < fechas.size(); i++) {
            if (fechas.get(i).equals(esperada)) {
                racha++;
                esperada = esperada.minusDays(1);
            } else {
                break;
            }
        }
        return racha;
    }
}
