package com.meditrack.back.app.repository;

import com.meditrack.back.app.model.Envio;
import com.meditrack.back.app.model.EstadoEnvio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class EnvioRepositoryTest {

    @Autowired
    private EnvioRepository envioRepository;

    private Envio crearEnvio(String trackingId, EstadoEnvio estado, String fechaCreacion) {
        Envio envio = new Envio();
        envio.setId(trackingId);
        envio.setRemitente("Farmacia Central");
        envio.setDestinatario("Cliente Test");
        envio.setOrigen("Av. Siempre Viva 123");
        envio.setDestino("Calle Falsa 456");
        envio.setEstado(estado);
        envio.setFechaCreacion(fechaCreacion);
        return envioRepository.save(envio);
    }

    @BeforeEach
    void limpiarDB() {
        envioRepository.deleteAll();
    }

    @Test
    @DisplayName("countByEstado: retorna 0 cuando no hay envíos con ese estado")
    void countByEstado_sinEnvios_retornaCero() {
        long resultado = envioRepository.countByEstado(EstadoEnvio.PENDIENTE);

        assertThat(resultado).isZero();
    }

    @Test
    @DisplayName("countByEstado: cuenta correctamente envíos en estado PENDIENTE")
    void countByEstado_conEnviosPendientes_retornaCantidadCorrecta() {
        crearEnvio("TRK-001", EstadoEnvio.PENDIENTE, "2025-05-01");
        crearEnvio("TRK-002", EstadoEnvio.PENDIENTE, "2025-05-01");
        crearEnvio("TRK-003", EstadoEnvio.EN_TRANSITO, "2025-05-01");

        long resultado = envioRepository.countByEstado(EstadoEnvio.PENDIENTE);

        assertThat(resultado).isEqualTo(2);
    }

    @Test
    @DisplayName("countByEstado: no cuenta envíos de otros estados")
    void countByEstado_ignoraOtrosEstados() {
        crearEnvio("TRK-010", EstadoEnvio.ENTREGADO, "2025-05-01");
        crearEnvio("TRK-011", EstadoEnvio.CANCELADO, "2025-05-01");

        long resultado = envioRepository.countByEstado(EstadoEnvio.PENDIENTE);

        assertThat(resultado).isZero();
    }

    @Test
    @DisplayName("countByEstadoAndFechaCreacion: cuenta solo los que coinciden en estado Y fecha")
    void countByEstadoAndFechaCreacion_filtroEstadoYFecha_correcto() {
        crearEnvio("TRK-020", EstadoEnvio.PENDIENTE, "2025-05-01");
        crearEnvio("TRK-021", EstadoEnvio.PENDIENTE, "2025-05-01");
        crearEnvio("TRK-022", EstadoEnvio.PENDIENTE, "2025-05-02");
        crearEnvio("TRK-023", EstadoEnvio.EN_TRANSITO, "2025-05-01");

        long resultado = envioRepository.countByEstadoAndFechaCreacion(
                EstadoEnvio.PENDIENTE, "2025-05-01");

        assertThat(resultado).isEqualTo(2);
    }

    @Test
    @DisplayName("countByEstadoAndFechaCreacion: retorna 0 si no hay coincidencias exactas")
    void countByEstadoAndFechaCreacion_sinCoincidencias_retornaCero() {
        crearEnvio("TRK-030", EstadoEnvio.ENTREGADO, "2025-05-01");

        long resultado = envioRepository.countByEstadoAndFechaCreacion(
                EstadoEnvio.PENDIENTE, "2025-05-01");

        assertThat(resultado).isZero();
    }

    @Test
    @DisplayName("findByFechaCreacion: retorna lista vacía si no hay envíos en esa fecha")
    void findByFechaCreacion_sinEnvios_retornaListaVacia() {
        List<Envio> resultado = envioRepository.findByFechaCreacion("2025-05-01");

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("findByFechaCreacion: retorna todos los envíos de la fecha indicada")
    void findByFechaCreacion_conEnvios_retornaListaCorrecta() {
        crearEnvio("TRK-040", EstadoEnvio.PENDIENTE, "2025-05-01");
        crearEnvio("TRK-041", EstadoEnvio.EN_TRANSITO, "2025-05-01");
        crearEnvio("TRK-042", EstadoEnvio.ENTREGADO, "2025-05-02");

        List<Envio> resultado = envioRepository.findByFechaCreacion("2025-05-01");

        assertThat(resultado).hasSize(2);
        assertThat(resultado)
                .extracting(Envio::getId)
                .containsExactlyInAnyOrder("TRK-040", "TRK-041");
    }

    @Test
    @DisplayName("findByFechaCreacion: no mezcla envíos de fechas distintas")
    void findByFechaCreacion_noMezclaDiferentesFechas() {
        crearEnvio("TRK-050", EstadoEnvio.PENDIENTE, "2025-05-03");
        crearEnvio("TRK-051", EstadoEnvio.PENDIENTE, "2025-05-04");

        List<Envio> resultado = envioRepository.findByFechaCreacion("2025-05-03");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getId()).isEqualTo("TRK-050");
    }

    @Test
    @DisplayName("obtenerVolumenEnviosPorEstadoSemanal: retorna lista vacía si no hay envíos")
    void obtenerVolumenSemanal_sinEnvios_retornaListaVacia() {
        List<Object[]> resultado = envioRepository.obtenerVolumenEnviosPorEstadoSemanal();

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("obtenerVolumenEnviosPorEstadoSemanal: agrupa por fecha y cuenta por estado")
    void obtenerVolumenSemanal_conEnviosMixtos_agrupaPorFechaYEstado() {
        crearEnvio("TRK-060", EstadoEnvio.PENDIENTE, "2025-05-01");
        crearEnvio("TRK-061", EstadoEnvio.PENDIENTE, "2025-05-01");
        crearEnvio("TRK-062", EstadoEnvio.EN_TRANSITO, "2025-05-01");
        crearEnvio("TRK-063", EstadoEnvio.ENTREGADO, "2025-05-02");

        List<Object[]> resultado = envioRepository.obtenerVolumenEnviosPorEstadoSemanal();

        assertThat(resultado).hasSize(2);

        Object[] fila1 = resultado.get(0);
        long pendientesDia1 = toLong(fila1[1]);
        long enTransitoDia1 = toLong(fila1[2]);
        long entregadosDia1 = toLong(fila1[3]);

        assertThat(pendientesDia1).isEqualTo(2);
        assertThat(enTransitoDia1).isEqualTo(1);
        assertThat(entregadosDia1).isZero();

        Object[] fila2 = resultado.get(1);
        assertThat(toLong(fila2[1])).isZero();
        assertThat(toLong(fila2[2])).isZero();
        assertThat(toLong(fila2[3])).isEqualTo(1);
    }

    @Test
    @DisplayName("obtenerVolumenEnviosPorEstadoSemanal: respeta el límite de 7 filas")
    void obtenerVolumenSemanal_masDeUnaSemana_retornaMaxSieteFechas() {
        for (int i = 1; i <= 8; i++) {
            String fecha = String.format("2025-05-%02d", i);
            crearEnvio("TRK-07" + i, EstadoEnvio.PENDIENTE, fecha);
        }

        List<Object[]> resultado = envioRepository.obtenerVolumenEnviosPorEstadoSemanal();

        assertThat(resultado).hasSizeLessThanOrEqualTo(7);
    }

    private long toLong(Object valor) {
        if (valor instanceof Number) {
            return ((Number) valor).longValue();
        }
        return Long.parseLong(valor.toString());
    }
    
}