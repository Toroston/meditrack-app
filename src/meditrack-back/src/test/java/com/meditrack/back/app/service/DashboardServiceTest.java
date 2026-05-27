package com.meditrack.back.app.service;

import com.meditrack.back.app.model.*;
import com.meditrack.back.app.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService")
class DashboardServiceTest {

    @Mock
    EnvioRepository envioRepository;
    @Mock
    ClienteRepository clienteRepository;

    @InjectMocks
    DashboardService dashboardService;

    // ─── Builders / helpers ─────────────────────────────────────────────────────

    /** Envío mínimo con estado y remitente/destinatario. */
    private Envio envio(EstadoEnvio estado, String remitente, String destinatario) {
        Envio e = new Envio();
        e.setEstado(estado);
        e.setRemitente(remitente);
        e.setDestinatario(destinatario);
        e.setDetalles(Collections.emptyList());
        return e;
    }

    /** Envío con una lista de detalles de medicamento. */
    private Envio envioConDetalles(EstadoEnvio estado, String remitente, String destinatario,
            List<DetalleEnvio> detalles) {
        Envio e = envio(estado, remitente, destinatario);
        e.setDetalles(detalles);
        return e;
    }

    private DetalleEnvio detalle(String nombreMedicamento, long cantidad) {
        Medicamento med = new Medicamento();
        med.setNombre(nombreMedicamento);

        DetalleEnvio d = new DetalleEnvio();
        d.setMedicamento(med);
//        d.setCantidad(cantidad);
        return d;
    }

    private Cliente cliente(String nombre, TipoEstablecimiento tipo) {
        Cliente c = new Cliente();
        c.setNombre(nombre);
        c.setTipoEstablecimiento(tipo);
        return c;
    }

    @BeforeEach
    void defaultStubs() {
        lenient().when(clienteRepository.findAll()).thenReturn(Collections.emptyList());
    }

    // ─── Modo histórico vs. hoy ──────────────────────────────────────────────────

    @Nested
    @DisplayName("Selección de fuente de datos")
    class FuenteDatos {

        @Test
        @DisplayName("historico=true consulta findAll()")
        void historicoUsaFindAll() {
            when(envioRepository.findAll()).thenReturn(Collections.emptyList());

            dashboardService.obtenerMetricasDashboard(true);

            verify(envioRepository).findAll();
            verify(envioRepository, never()).findByFechaCreacion(any());
        }

        @Test
        @DisplayName("historico=false consulta findByFechaCreacion con la fecha de hoy")
        void noHistoricoUsaFechaHoy() {
            String hoy = java.time.LocalDate.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            when(envioRepository.findByFechaCreacion(hoy)).thenReturn(Collections.emptyList());

            dashboardService.obtenerMetricasDashboard(false);

            verify(envioRepository).findByFechaCreacion(hoy);
            verify(envioRepository, never()).findAll();
        }
    }

    // ─── Tasa de incidencias ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("Tasa de incidencias")
    class TasaIncidencias {

        @Test
        @DisplayName("es 0.0 cuando no hay envíos")
        void sinEnvios() {
            when(envioRepository.findAll()).thenReturn(Collections.emptyList());

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTasaIncidencias()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("es 0.0 cuando ningún envío tiene incidente")
        void sinIncidencias() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.PENDIENTE, "A", "B"),
                    envio(EstadoEnvio.ENTREGADO, "A", "C")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTasaIncidencias()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("calcula correctamente con 1 incidente de 4 envíos → 25.0 %")
        void unIncidenteDeCuatro() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.PENDIENTE, "A", "B"),
                    envio(EstadoEnvio.ENTREGADO, "A", "C"),
                    envio(EstadoEnvio.EN_TRANSITO, "A", "D"),
                    envio(EstadoEnvio.INCIDENTE_REPORTADO, "A", "E")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTasaIncidencias()).isEqualTo(25.0);
        }

        @Test
        @DisplayName("calcula correctamente con todos los envíos como incidente → 100.0 %")
        void todosIncidentes() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.INCIDENTE_REPORTADO, "A", "B"),
                    envio(EstadoEnvio.INCIDENTE_REPORTADO, "A", "C")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTasaIncidencias()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("redondea a 1 decimal (1 de 3 → 33.3 %)")
        void redondeoAUnDecimal() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.INCIDENTE_REPORTADO, "A", "B"),
                    envio(EstadoEnvio.ENTREGADO, "A", "C"),
                    envio(EstadoEnvio.ENTREGADO, "A", "D")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTasaIncidencias()).isEqualTo(33.3);
        }
    }

    // ─── Entregados ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Conteo de entregados")
    class Entregados {

        @Test
        @DisplayName("es 0 cuando no hay envíos entregados")
        void sinEntregados() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.PENDIENTE, "A", "B")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getEntregasDia()).isEqualTo(0L);
        }

        @Test
        @DisplayName("cuenta solo los envíos en estado ENTREGADO")
        void cuentaSoloEntregados() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.ENTREGADO, "A", "B"),
                    envio(EstadoEnvio.ENTREGADO, "A", "C"),
                    envio(EstadoEnvio.PENDIENTE, "A", "D")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getEntregasDia()).isEqualTo(2L);
        }
    }

    // ─── Volumen por estado ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("Volumen de envíos por estado")
    class VolumenPorEstado {

        @Test
        @DisplayName("incluye una entrada por cada valor del enum EstadoEnvio")
        void incluyeTodosLosEstados() {
            when(envioRepository.findAll()).thenReturn(Collections.emptyList());

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            // Debe haber tantas entradas como valores tiene el enum
            assertThat(dto.getVolumenEnvios()).hasSize(EstadoEnvio.values().length);
        }

        @Test
        @DisplayName("cuenta correctamente los envíos por estado")
        void cuentaPorEstado() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.PENDIENTE, "A", "B"),
                    envio(EstadoEnvio.PENDIENTE, "A", "C"),
                    envio(EstadoEnvio.ENTREGADO, "A", "D")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            Map<String, Object> pendiente = dto.getVolumenEnvios().stream()
                    .filter(m -> "PENDIENTE".equals(m.get("estado")))
                    .findFirst().orElseThrow();
            Map<String, Object> entregado = dto.getVolumenEnvios().stream()
                    .filter(m -> "ENTREGADO".equals(m.get("estado")))
                    .findFirst().orElseThrow();

            assertThat(pendiente.get("cantidad")).isEqualTo(2L);
            assertThat(entregado.get("cantidad")).isEqualTo(1L);
        }

        @Test
        @DisplayName("los estados en el volumen usan espacios (no guiones bajos)")
        void estadosSinGuionesBajos() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.INCIDENTE_REPORTADO, "A", "B")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            List<String> nombres = dto.getVolumenEnvios().stream()
                    .map(m -> (String) m.get("estado"))
                    .toList();
            assertThat(nombres).noneMatch(n -> n.contains("_"));
        }
    }

    // ─── Top 5 medicamentos ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("Top 5 medicamentos")
    class Top5Medicamentos {

        @Test
        @DisplayName("devuelve lista vacía cuando no hay detalles de envío")
        void sinDetalles() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.ENTREGADO, "A", "B")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTopMedicamentos()).isEmpty();
        }

        @Test
        @DisplayName("ignora detalles con medicamento null o cantidad null")
        void ignoraNulos() {
            DetalleEnvio sinMed = new DetalleEnvio();
            sinMed.setMedicamento(null);
//            sinMed.setCantidad(5L);

            DetalleEnvio sinCantidad = new DetalleEnvio();
            Medicamento med = new Medicamento();
            med.setNombre("Algo");
            sinCantidad.setMedicamento(med);
            sinCantidad.setCantidad(null);

            Envio e = envioConDetalles(EstadoEnvio.ENTREGADO, "A", "B",
                    List.of(sinMed, sinCantidad));
            when(envioRepository.findAll()).thenReturn(List.of(e));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTopMedicamentos()).isEmpty();
        }
    }

    // ─── Top 3 clientes ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Top 3 clientes")
    class Top3Clientes {

        @Test
        @DisplayName("devuelve lista vacía cuando no hay envíos con destinatario")
        void sinDestinatarios() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.PENDIENTE, null, null)));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTopClientes()).isEmpty();
        }

        @Test
        @DisplayName("limita a 3 clientes aunque haya más")
        void limitaATres() {
            List<Envio> envios = List.of(
                    envio(EstadoEnvio.ENTREGADO, "X", "Cliente1"),
                    envio(EstadoEnvio.ENTREGADO, "X", "Cliente2"),
                    envio(EstadoEnvio.ENTREGADO, "X", "Cliente3"),
                    envio(EstadoEnvio.ENTREGADO, "X", "Cliente4"));
            when(envioRepository.findAll()).thenReturn(envios);

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTopClientes()).hasSize(3);
        }

        @Test
        @DisplayName("ordena por cantidad de pedidos descendente")
        void ordenaPorPedidos() {
            List<Envio> envios = List.of(
                    envio(EstadoEnvio.ENTREGADO, "X", "ClienteA"),
                    envio(EstadoEnvio.ENTREGADO, "X", "ClienteB"),
                    envio(EstadoEnvio.ENTREGADO, "X", "ClienteB"),
                    envio(EstadoEnvio.ENTREGADO, "X", "ClienteB"),
                    envio(EstadoEnvio.ENTREGADO, "X", "ClienteA"));
            when(envioRepository.findAll()).thenReturn(envios);

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTopClientes().get(0).get("nombre")).isEqualTo("ClienteB");
            assertThat(dto.getTopClientes().get(0).get("pedidos")).isEqualTo(3);
            assertThat(dto.getTopClientes().get(1).get("nombre")).isEqualTo("ClienteA");
        }

        @Test
        @DisplayName("medicamentoTop es 'Ninguno' cuando el cliente no tiene detalles de medicamento")
        void medicamentoTopNinguno() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.ENTREGADO, "X", "ClienteSinMeds")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTopClientes().get(0).get("medicamentoTop")).isEqualTo("Ninguno");
        }
    }

    // ─── Tipo dominante (retira / recibe) ────────────────────────────────────────

    @Nested
    @DisplayName("Tipo de establecimiento dominante")
    class TipoDominante {

        @Test
        @DisplayName("tipoMasRetira es 'Ninguno' cuando no hay clientes con tipo registrado")
        void sinClientesConTipo() {
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.ENTREGADO, "ClienteDesconocido", "Otro")));
            // clienteRepository ya devuelve lista vacía por el @BeforeEach

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTipoClienteMasRetira()).isEqualTo("Ninguno");
            assertThat(dto.getTipoClienteMasRecibe()).isEqualTo("Ninguno");
        }

        @Test
        @DisplayName("calcula correctamente el tipo dominante entre remitentes")
        void tipoMasRetiraCorrectamente() {
            when(clienteRepository.findAll()).thenReturn(List.of(
                    cliente("Farmacia Sol", TipoEstablecimiento.FARMACIA),
                    cliente("Lab Central", TipoEstablecimiento.LABORATORIO),
                    cliente("Farmacia Luna", TipoEstablecimiento.FARMACIA)));
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.ENTREGADO, "Farmacia Sol", "X"),
                    envio(EstadoEnvio.ENTREGADO, "Farmacia Luna", "X"),
                    envio(EstadoEnvio.ENTREGADO, "Lab Central", "X")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTipoClienteMasRetira()).isEqualTo("FARMACIA");
        }

        @Test
        @DisplayName("calcula correctamente el tipo dominante entre destinatarios")
        void tipoMasRecibeCorrectamente() {
            when(clienteRepository.findAll()).thenReturn(List.of(
                    cliente("Hospital Central", TipoEstablecimiento.HOSPITAL),
                    cliente("Farmacia Sol", TipoEstablecimiento.FARMACIA)));
            when(envioRepository.findAll()).thenReturn(List.of(
                    envio(EstadoEnvio.ENTREGADO, "X", "Hospital Central"),
                    envio(EstadoEnvio.ENTREGADO, "X", "Hospital Central"),
                    envio(EstadoEnvio.ENTREGADO, "X", "Farmacia Sol")));

            DashboardKpiDTO dto = dashboardService.obtenerMetricasDashboard(true);

            assertThat(dto.getTipoClienteMasRecibe()).isEqualTo("HOSPITAL");
        }
    }

}