package com.meditrack.back.app.service;

import com.meditrack.back.app.model.*;
import com.meditrack.back.app.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final EnvioRepository envioRepository;
    private final ClienteRepository clienteRepository;

    public DashboardService(EnvioRepository envioRepository, ClienteRepository clienteRepository) {
        this.envioRepository = envioRepository;
        this.clienteRepository = clienteRepository;
    }

    public DashboardKpiDTO obtenerMetricasDashboard(boolean historico) {
        String hoyStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        List<Envio> envios = historico ? envioRepository.findAll() : envioRepository.findByFechaCreacion(hoyStr);
        
        long totalEnvios = envios.size();
        long incidenciasCount = envios.stream().filter(e -> e.getEstado() == EstadoEnvio.INCIDENTE_REPORTADO).count();
        double tasaIncidencias = totalEnvios > 0 ? Math.round(((double) incidenciasCount / totalEnvios) * 100.0 * 10.0) / 10.0 : 0.0;

        List<Map<String, Object>> volumenEnvios = new ArrayList<>();
        Arrays.stream(EstadoEnvio.values()).forEach(estado -> {
            long cant = envios.stream().filter(e -> e.getEstado() == estado).count();
            volumenEnvios.add(crearItemVolumen(estado.name().replace("_", " "), cant));
        });

        Map<String, String> mapaClientesTipos = clienteRepository.findAll().stream()
                .filter(c -> c.getTipoEstablecimiento() != null)
                .collect(Collectors.toMap(Cliente::getNombre, c -> c.getTipoEstablecimiento().name(), (e, r) -> e));

        String tipoMasRetira = obtenerTipoDominante(envios, Envio::getRemitente, mapaClientesTipos);
        String tipoMasRecibe = obtenerTipoDominante(envios, Envio::getDestinatario, mapaClientesTipos);

        List<Map<String, Object>> top5Medicamentos = envios.stream()
                .flatMap(e -> e.getDetalles().stream())
                .filter(d -> d.getMedicamento() != null && d.getCantidad() != null)
                .collect(Collectors.groupingBy(d -> d.getMedicamento().getNombre(), Collectors.summingLong(d -> d.getCantidad())))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("nombre", e.getKey()); m.put("cantidad", e.getValue()); return m; })
                .collect(Collectors.toList());

        Map<String, List<Envio>> enviosPorCliente = envios.stream().filter(e -> e.getDestinatario() != null).collect(Collectors.groupingBy(Envio::getDestinatario));
        long totalClientesUnicos = enviosPorCliente.size();
        List<Map<String, Object>> top3Clientes = enviosPorCliente.entrySet().stream()
                .sorted((e1, e2) -> Integer.compare(e2.getValue().size(), e1.getValue().size()))
                .limit(3)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("nombre", e.getKey());
                    m.put("pedidos", e.getValue().size());
                    m.put("porcentaje", totalClientesUnicos > 0 ? Math.round((1.0 / totalClientesUnicos) * 100.0 * 10.0) / 10.0 : 0.0);
                    m.put("medicamentoTop", e.getValue().stream().flatMap(env -> env.getDetalles().stream()).filter(d -> d.getMedicamento() != null).collect(Collectors.groupingBy(d -> d.getMedicamento().getNombre(), Collectors.summingLong(d -> d.getCantidad()))).entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("Ninguno"));
                    return m;
                }).collect(Collectors.toList());

        return new DashboardKpiDTO(volumenEnvios, envios.stream().filter(e -> e.getEstado() == EstadoEnvio.ENTREGADO).count(), tasaIncidencias, tipoMasRetira, tipoMasRecibe, top5Medicamentos, top3Clientes);
    }

    private Map<String, Object> crearItemVolumen(String estado, long cantidad) {
        Map<String, Object> m = new HashMap<>(); m.put("estado", estado); m.put("cantidad", cantidad); return m;
    }

    private String obtenerTipoDominante(List<Envio> envios, java.util.function.Function<Envio, String> mapper, Map<String, String> mapaTipos) {
        return envios.stream().map(mapper).map(n -> mapaTipos.getOrDefault(n, "DESCONOCIDO")).filter(t -> !t.equals("DESCONOCIDO")).collect(Collectors.groupingBy(t -> t, Collectors.counting())).entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("Ninguno");
    }
}