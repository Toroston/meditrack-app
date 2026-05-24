package com.meditrack.back.app.controller;

import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meditrack.back.app.model.EstadoOperativo;
import com.meditrack.back.app.model.Role;
import com.meditrack.back.app.model.Sesion;
import com.meditrack.back.app.model.Transporte;
import com.meditrack.back.app.service.AuthService;
import com.meditrack.back.app.service.TransporteService;

@RestController
@RequestMapping("/api/transportes")
@CrossOrigin(origins = "*")
public class TransporteController {

    private final TransporteService transporteService;
    private final AuthService authService;

    public TransporteController(TransporteService transporteService, AuthService authService) {
        this.transporteService = transporteService;
        this.authService = authService;
    }

    private Sesion autenticar(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token requerido");
        }
        return authService.validar(authHeader.substring(7));
    }

    private void soloAdmin(Sesion s) {
        if (s.getRole() != Role.ADMINISTRADOR) {
            throw new RuntimeException("Sin permisos para esta acción");
        }
    }

    @GetMapping
    public ResponseEntity<?> listar(
        @RequestParam(value = "q", required = false) String q,
        @RequestParam(value = "estado", required = false) String estado,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            autenticar(authHeader);
            EstadoOperativo est = (estado != null && !estado.isBlank())
                ? EstadoOperativo.valueOf(estado)
                : null;

            return ResponseEntity.ok(transporteService.listar(q, est));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Estado inválido"));
        } catch (RuntimeException e) {
            // Token requerido / inválido
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(
        @Valid @RequestBody Transporte body,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            Sesion s = autenticar(authHeader);
            soloAdmin(s);

            return ResponseEntity.status(HttpStatus.CREATED).body(transporteService.crear(body));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("permisos")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
        @PathVariable Long id,
        @RequestBody Transporte body,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            Sesion s = autenticar(authHeader);
            soloAdmin(s);

            return ResponseEntity.ok(transporteService.actualizar(id, body));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            if (e.getMessage().contains("permisos")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivar(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            Sesion s = autenticar(authHeader);
            soloAdmin(s);

            return ResponseEntity.ok(transporteService.desactivar(id));

        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            if (e.getMessage().contains("permisos")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    // ⚠️ DELETE físico: opcional. Si querés, dejalo; si no, lo sacamos.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarFisico(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            Sesion s = autenticar(authHeader);
            soloAdmin(s);

            transporteService.eliminarFisico(id);
            return ResponseEntity.ok(Map.of("message", "Transporte eliminado"));

        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            if (e.getMessage().contains("permisos")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }
}