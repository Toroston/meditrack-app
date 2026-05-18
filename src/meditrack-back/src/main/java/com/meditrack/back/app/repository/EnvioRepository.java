package com.meditrack.back.app.repository;

import com.meditrack.back.app.model.Envio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvioRepository extends JpaRepository<Envio, String> {
}