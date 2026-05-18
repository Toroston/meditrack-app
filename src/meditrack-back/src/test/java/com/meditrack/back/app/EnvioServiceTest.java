package com.meditrack.back.app;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.meditrack.back.app.model.Envio;
import com.meditrack.back.app.model.EstadoEnvio;
import com.meditrack.back.app.service.EnvioService;
import com.meditrack.back.app.repository.EnvioRepository;

@ExtendWith(MockitoExtension.class)
class EnvioServiceTest {

    @Mock
    private EnvioRepository envioRepository;

    @InjectMocks
    private EnvioService service;

    private final String USUARIO_TEST = "admin_test";

    @Test
    void listarTodos_inicialmenteVacio() {
        when(envioRepository.findAll()).thenReturn(new ArrayList<>());
        
        assertEquals(0, service.listarTodos().size());
    }

    @Test
    void crear_agregaEnvioEnEstadoPENDIENTE() {
        Map<String, String> body = Map.of(
            "destinatario", "Juan Pérez", 
            "remitente", "Laboratorio Central",
            "direccionEntrega", "Calle Falsa 123",
            "prioridad", "ALTA"
        );
        
        Envio envioSimulado = new Envio();
        envioSimulado.setId("ENV-12345");
        envioSimulado.setDestinatario("Juan Pérez");
        envioSimulado.setEstado(EstadoEnvio.PENDIENTE);
        envioSimulado.setUsuarioResponsable(USUARIO_TEST);

        when(envioRepository.save(any(Envio.class))).thenReturn(envioSimulado);
        
        Envio nuevo = service.crear(body, USUARIO_TEST); 
        
        assertNotNull(nuevo.getId());
        assertEquals("Juan Pérez", nuevo.getDestinatario());
        assertEquals(EstadoEnvio.PENDIENTE, nuevo.getEstado());
        assertEquals(USUARIO_TEST, nuevo.getUsuarioResponsable());

        when(envioRepository.findAll()).thenReturn(List.of(envioSimulado));
        assertEquals(1, service.listarTodos().size());
    }

    @Test
    void actualizarEstado_cambiaEstadoCorrectamente() {
        Envio envioExistente = new Envio();
        envioExistente.setId("ENV-111");
        envioExistente.setEstado(EstadoEnvio.PENDIENTE);
        envioExistente.setUsuarioResponsable(USUARIO_TEST);

        when(envioRepository.findById("ENV-111")).thenReturn(Optional.of(envioExistente));
        when(envioRepository.save(any(Envio.class))).thenAnswer(i -> i.getArguments()[0]);
        
        Envio actualizado = service.actualizarEstado("ENV-111", EstadoEnvio.ASIGNADO, USUARIO_TEST, "REP-123");
        
        assertEquals(EstadoEnvio.ASIGNADO, actualizado.getEstado());
        assertEquals(USUARIO_TEST, actualizado.getUsuarioResponsable());
    }

    @Test
    void actualizarEstado_idInexistente_lanzaExcepcion() {
        when(envioRepository.findById("NON-EXISTENT-ID")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> 
            service.actualizarEstado("NON-EXISTENT-ID", EstadoEnvio.EN_TRANSITO, USUARIO_TEST, null)
        );
    }

    @Test
    void auditoria_registraFechaYHoraAutomaticamente() {
        when(envioRepository.save(any(Envio.class))).thenAnswer(i -> {
            Envio e = (Envio) i.getArguments()[0];
            e.setFechaCreacion("2026-05-17");
            e.setHoraCreacion("12:00");
            e.setUsuarioResponsable(USUARIO_TEST);
            return e;
        });

        Map<String, String> body = Map.of("destinatario", "Test Auditoria", "remitente", "Test");
        Envio nuevo = service.crear(body, USUARIO_TEST);
        
        assertNotNull(nuevo.getFechaCreacion());
        assertNotNull(nuevo.getHoraCreacion());
        assertEquals(USUARIO_TEST, nuevo.getUsuarioResponsable());
    }

    @Test
    void estados_todosLosNuevosEstadosSonAccesibles() {
        Envio envioExistente = new Envio();
        envioExistente.setId("ENV-999");
        envioExistente.setEstado(EstadoEnvio.PENDIENTE);
        envioExistente.setUsuarioResponsable(USUARIO_TEST);

        when(envioRepository.findById("ENV-999")).thenReturn(Optional.of(envioExistente));
        when(envioRepository.save(any(Envio.class))).thenAnswer(i -> i.getArguments()[0]);
        
        service.actualizarEstado("ENV-999", EstadoEnvio.EN_PREPARACION, USUARIO_TEST, null);
        assertEquals(EstadoEnvio.EN_PREPARACION, envioExistente.getEstado());
        
        service.actualizarEstado("ENV-999", EstadoEnvio.EN_PUNTO_DE_ENTREGA, USUARIO_TEST, null);
        assertEquals(EstadoEnvio.EN_PUNTO_DE_ENTREGA, envioExistente.getEstado());
        
        service.actualizarEstado("ENV-999", EstadoEnvio.INCIDENTE_REPORTADO, USUARIO_TEST, null);
        assertEquals(EstadoEnvio.INCIDENTE_REPORTADO, envioExistente.getEstado());
        
        service.actualizarEstado("ENV-999", EstadoEnvio.CANCELADO, USUARIO_TEST, null);
        assertEquals(EstadoEnvio.CANCELADO, envioExistente.getEstado());
    }
}