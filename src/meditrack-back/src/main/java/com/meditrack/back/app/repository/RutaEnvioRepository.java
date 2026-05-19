package com.meditrack.back.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meditrack.back.app.model.RutaEnvio;

public interface RutaEnvioRepository extends JpaRepository<RutaEnvio, Long> {

    boolean existsByEnvio_Id(String envioId);

}
