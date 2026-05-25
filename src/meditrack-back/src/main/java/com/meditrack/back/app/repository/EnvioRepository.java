package com.meditrack.back.app.repository;

import com.meditrack.back.app.model.Envio;
import com.meditrack.back.app.model.EstadoEnvio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnvioRepository extends JpaRepository<Envio, String> {

    long countByEstado(EstadoEnvio estado);

    long countByEstadoAndFechaCreacion(EstadoEnvio estado, String fechaCreacion);

    List<Envio> findByFechaCreacion(String fechaCreacion);

    @Query(value = "SELECT CAST(fecha_creacion AS DATE) as fecha, " +
               "SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes, " +
               "SUM(CASE WHEN estado = 'EN_TRANSITO' THEN 1 ELSE 0 END) as enTransito, " +
               "SUM(CASE WHEN estado = 'ENTREGADO' THEN 1 ELSE 0 END) as entregados " +
               "FROM envios " +
               "GROUP BY CAST(fecha_creacion AS DATE) " +
               "ORDER BY fecha ASC LIMIT 7", nativeQuery = true)
    List<Object[]> obtenerVolumenEnviosPorEstadoSemanal();
}