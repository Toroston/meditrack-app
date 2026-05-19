package com.meditrack.back.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meditrack.back.app.model.Ruta;

public interface RutaRepository extends JpaRepository<Ruta, String> {
}
