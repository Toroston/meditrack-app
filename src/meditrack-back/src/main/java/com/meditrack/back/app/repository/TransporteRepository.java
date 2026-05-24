package com.meditrack.back.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meditrack.back.app.model.EstadoOperativo;
import com.meditrack.back.app.model.Transporte;

public interface TransporteRepository extends JpaRepository<Transporte, Long> {
    boolean existsByPatenteIgnoreCase(String patente);
    Optional<Transporte> findByPatenteIgnoreCase(String patente);

    List<Transporte> findByEstadoOperativo(EstadoOperativo estadoOperativo);

    List<Transporte> findByPatenteContainingIgnoreCaseOrTipoVehiculoContainingIgnoreCase(String patente,
        String tipoVehiculo);

}
