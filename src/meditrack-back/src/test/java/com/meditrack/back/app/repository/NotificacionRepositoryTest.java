package com.meditrack.back.app.repository;

import com.meditrack.back.app.model.Notificacion;
import com.meditrack.back.app.model.Role;
import com.meditrack.back.app.model.Usuario;
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
class NotificacionRepositoryTest {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario usuarioA;
    private Usuario usuarioB;

    private Usuario crearUsuario(String id, String email) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setEmail(email);
        usuario.setNombre("Usuario " + id);
        usuario.setDni("DNI-" + id);
        usuario.setPassword("password123");
        usuario.setRole(Role.OPERADOR); // o el rol que prefieras
        return usuarioRepository.save(usuario);
    }

    private Notificacion crearNotificacion(String id, Usuario destino, boolean leido, String fechaCreacion) {
        Notificacion notificacion = new Notificacion();
        notificacion.setId(id);
        notificacion.setUsuarioDestino(destino);
        notificacion.setTitulo("Título " + id);
        notificacion.setMensaje("Mensaje de prueba para " + id);
        notificacion.setLeido(leido);
        notificacion.setFechaCreacion(fechaCreacion);
        return notificacionRepository.save(notificacion);
    }

    @BeforeEach
    void setup() {
        notificacionRepository.deleteAll();
        usuarioRepository.deleteAll();

        usuarioA = crearUsuario("USR-001", "usuarioA@meditrack.com");
        usuarioB = crearUsuario("USR-002", "usuarioB@meditrack.com");
    }

    @Test
    @DisplayName("findByUsuarioDestino: retorna lista vacía si el usuario no tiene notificaciones")
    void findByUsuarioDestino_sinNotificaciones_retornaListaVacia() {
        List<Notificacion> resultado =
                notificacionRepository.findByUsuarioDestinoOrderByFechaCreacionDesc(usuarioA);

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("findByUsuarioDestino: retorna solo las notificaciones del usuario indicado")
    void findByUsuarioDestino_conNotificaciones_retornaSoloLasDelUsuario() {
        crearNotificacion("NTF-001", usuarioA, false, "2025-05-01");
        crearNotificacion("NTF-002", usuarioA, true,  "2025-05-02");
        crearNotificacion("NTF-003", usuarioB, false, "2025-05-01");

        List<Notificacion> resultado =
                notificacionRepository.findByUsuarioDestinoOrderByFechaCreacionDesc(usuarioA);

        assertThat(resultado).hasSize(2);
        assertThat(resultado)
                .extracting(Notificacion::getId)
                .containsExactlyInAnyOrder("NTF-001", "NTF-002");
    }

    @Test
    @DisplayName("findByUsuarioDestino: retorna notificaciones ordenadas por fechaCreacion descendente")
    void findByUsuarioDestino_ordenDescendente_correcto() {
        crearNotificacion("NTF-010", usuarioA, false, "2025-05-01");
        crearNotificacion("NTF-011", usuarioA, false, "2025-05-03");
        crearNotificacion("NTF-012", usuarioA, false, "2025-05-02");

        List<Notificacion> resultado =
                notificacionRepository.findByUsuarioDestinoOrderByFechaCreacionDesc(usuarioA);

        assertThat(resultado)
                .extracting(Notificacion::getId)
                .containsExactly("NTF-011", "NTF-012", "NTF-010");
    }

    @Test
    @DisplayName("countByUsuarioDestinoAndLeidoFalse: retorna 0 si no hay notificaciones no leídas")
    void countNoLeidas_sinNotificaciones_retornaCero() {
        long resultado = notificacionRepository.countByUsuarioDestinoAndLeidoFalse(usuarioA);

        assertThat(resultado).isZero();
    }

    @Test
    @DisplayName("countByUsuarioDestinoAndLeidoFalse: cuenta solo las no leídas del usuario")
    void countNoLeidas_mezclaLeidasYNoLeidas_cuentaSoloNoLeidas() {
        crearNotificacion("NTF-020", usuarioA, false, "2025-05-01");
        crearNotificacion("NTF-021", usuarioA, false, "2025-05-01");
        crearNotificacion("NTF-022", usuarioA, true,  "2025-05-01");
        crearNotificacion("NTF-023", usuarioB, false, "2025-05-01");

        long resultado = notificacionRepository.countByUsuarioDestinoAndLeidoFalse(usuarioA);

        assertThat(resultado).isEqualTo(2);
    }

    @Test
    @DisplayName("countByUsuarioDestinoAndLeidoFalse: retorna 0 si todas las notificaciones están leídas")
    void countNoLeidas_todasLeidas_retornaCero() {
        crearNotificacion("NTF-030", usuarioA, true, "2025-05-01");
        crearNotificacion("NTF-031", usuarioA, true, "2025-05-02");

        long resultado = notificacionRepository.countByUsuarioDestinoAndLeidoFalse(usuarioA);

        assertThat(resultado).isZero();
    }

    @Test
    @DisplayName("countByUsuarioDestinoAndLeidoFalse: no mezcla conteos entre usuarios distintos")
    void countNoLeidas_noMezlaUsuarios() {
        crearNotificacion("NTF-040", usuarioA, false, "2025-05-01");
        crearNotificacion("NTF-041", usuarioB, false, "2025-05-01");
        crearNotificacion("NTF-042", usuarioB, false, "2025-05-01");

        assertThat(notificacionRepository.countByUsuarioDestinoAndLeidoFalse(usuarioA)).isEqualTo(1);
        assertThat(notificacionRepository.countByUsuarioDestinoAndLeidoFalse(usuarioB)).isEqualTo(2);
    }
    
}