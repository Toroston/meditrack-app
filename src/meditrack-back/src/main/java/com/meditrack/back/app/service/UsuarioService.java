package com.meditrack.back.app.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.meditrack.back.app.model.Role;
import com.meditrack.back.app.model.Usuario;

@Service
public class UsuarioService {

    private List<Usuario> usuarios = new ArrayList<>();

    public UsuarioService() {
        usuarios.add(new Usuario("admin@meditrack.com", "Admin Principal", "admin123", Role.ADMINISTRADOR));
        usuarios.add(new Usuario("supervisor@meditrack.com", "Admin MediTrack", "1234", Role.SUPERVISOR));
        usuarios.add(new Usuario("operador@meditrack.com", "Carlos Ruiz", "1234", Role.OPERADOR));
        usuarios.add(new Usuario("repartidor@meditrack.com", "Diego Torres", "1234", Role.REPARTIDOR));
    }

    public List<Usuario> listarTodos() {
        return usuarios;
    }

    public boolean tienePermisoSobreRol(Role rolUsuarioLogueado, Role rolObjetivo) {
        if (rolUsuarioLogueado == Role.ADMINISTRADOR) {
            return rolObjetivo == Role.SUPERVISOR || rolObjetivo == Role.OPERADOR || rolObjetivo == Role.REPARTIDOR;
        }
        if (rolUsuarioLogueado == Role.SUPERVISOR) {
            return rolObjetivo == Role.OPERADOR || rolObjetivo == Role.REPARTIDOR;
        }
        if (rolUsuarioLogueado == Role.OPERADOR) {
            return rolObjetivo == Role.REPARTIDOR;
        }
        return false;
    }

    public Usuario crear(Map<String, String> datos, Role rolCreador) {
        Role rolNuevoUsuario = Role.valueOf(datos.get("role"));

        if (!tienePermisoSobreRol(rolCreador, rolNuevoUsuario)) {
            throw new RuntimeException("Tu rol no tiene permisos para crear un " + rolNuevoUsuario);
        }

        if (usuarios.stream().anyMatch(u -> u.getEmail().equals(datos.get("email")))) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario nuevo = new Usuario(
            datos.get("email"),
            datos.get("nombre"),
            datos.get("password"),
            rolNuevoUsuario
        );
        
        usuarios.add(nuevo);
        return nuevo;
    }

    public Usuario actualizar(String id, Map<String, String> datos, Role rolEditor) {
        Usuario usuario = usuarios.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Role rolObjetivo = datos.containsKey("role") ? Role.valueOf(datos.get("role")) : usuario.getRole();

        if (!tienePermisoSobreRol(rolEditor, rolObjetivo)) {
            throw new RuntimeException("No tienes jerarquía suficiente para modificar o asignar este rol.");
        }

        if (datos.containsKey("nombre")) usuario.setNombre(datos.get("nombre"));
        if (datos.containsKey("email")) usuario.setEmail(datos.get("email"));
        if (datos.containsKey("role")) usuario.setRole(rolObjetivo);
        if (datos.containsKey("password") && !datos.get("password").trim().isEmpty()) {
            usuario.setPassword(datos.get("password")); 
        }

        return usuario;
    }

    public Usuario toggleEstado(String id, Role rolEditor) {
        Usuario usuario = usuarios.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!tienePermisoSobreRol(rolEditor, usuario.getRole())) {
            throw new RuntimeException("No tienes permiso para desactivar a este usuario.");
        }

        usuario.setEstadoActivo(!usuario.isEstadoActivo());
        return usuario;
    }
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarios.stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst();
    }
}