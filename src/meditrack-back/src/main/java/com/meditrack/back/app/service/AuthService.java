package com.meditrack.back.app.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.meditrack.back.app.config.JwtUtil;
import com.meditrack.back.app.model.Role;
import com.meditrack.back.app.model.Sesion;
import com.meditrack.back.app.model.Usuario;

@Service
public class AuthService {

    private final JwtUtil jwtUtil;

    private final List<Usuario> usuarios = new ArrayList<>(List.of(
        new Usuario("supervisor@meditrack.com", "Admin MediTrack", "1234", Role.SUPERVISOR),
        new Usuario("operador@meditrack.com",   "Carlos Ruiz",     "1234", Role.OPERADOR),
        new Usuario("repartidor@meditrack.com", "Diego Torres",    "1234", Role.REPARTIDOR)
    ));

    // email -> { code, expiresAt }
    private final Map<String, Map<String, Object>> resetCodes = new HashMap<>();

    public AuthService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public Map<String, String> login(String email, String password) {
        Usuario usuario = usuarios.stream()
            .filter(u -> u.getEmail().equals(email) && u.getPassword().equals(password))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        String token = jwtUtil.generarToken(usuario.getEmail(), usuario.getNombre(), usuario.getRole());

        return Map.of(
            "token",  token,
            "email",  usuario.getEmail(),
            "nombre", usuario.getNombre(),
            "role",   usuario.getRole().name()
        );
    }

    public Sesion validar(String token) {
        return jwtUtil.validar(token);
    }

// -- Olvido la contra --

    public Map<String, String> solicitarReset(String email) {
        boolean existe = usuarios.stream().anyMatch(u -> u.getEmail().equals(email));
        if (!existe) {
            throw new RuntimeException("El correo no se encuentra registrado en la base de datos");
        }

        String codigo = String.format("%06d", new Random().nextInt(999999));
        long expira = System.currentTimeMillis() + 30 * 60 * 1000; // 30 minutos

        resetCodes.put(email, Map.of("code", codigo, "expiresAt", expira));

        // Mock: en vez de mandar email, devolvemos el código directamente
        System.out.println("[MOCK EMAIL] Codigo para " + email + ": " + codigo);
        return Map.of(
            "mensaje", "Codigo enviado (mock)",
            "codigo", codigo  // Sacar esto cuando implementen email real
        );
    }

    public void verificarCodigo(String email, String codigo) {
        Map<String, Object> datos = resetCodes.get(email);

        if (datos == null) {
            throw new RuntimeException("No hay una solicitud de reset para este correo");
        }

        long expira = (long) datos.get("expiresAt");
        if (System.currentTimeMillis() > expira) {
            resetCodes.remove(email);
            throw new RuntimeException("El codigo ha expirado");
        }

        if (!datos.get("code").equals(codigo)) {
            throw new RuntimeException("Codigo incorrecto");
        }
    }

    public void resetearPassword(String email, String codigo, String nuevaPassword) {
        verificarCodigo(email, codigo); // revalida por si acaso

        Usuario usuario = usuarios.stream()
            .filter(u -> u.getEmail().equals(email))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setPassword(nuevaPassword);
        resetCodes.remove(email); // invalida el código usado
        System.out.println("[TRAZABILIDAD] Contrasena reseteada para: " + email);
    }
}