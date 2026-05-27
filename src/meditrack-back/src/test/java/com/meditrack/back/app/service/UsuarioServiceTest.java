package com.meditrack.back.app.service;

import com.meditrack.back.app.model.Role;
import com.meditrack.back.app.model.Usuario;
import com.meditrack.back.app.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsuarioService - Tests Unitarios")
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario admin;
    private Usuario supervisor;
    private Usuario operador;
    private Usuario repartidor;

    @BeforeEach
    void setUp() {
        admin      = new Usuario("admin@meditrack.com",      "Admin",      "11111111", "pass", Role.ADMINISTRADOR);
        supervisor = new Usuario("supervisor@meditrack.com", "Supervisor", "22222222", "pass", Role.SUPERVISOR);
        operador   = new Usuario("operador@meditrack.com",   "Operador",   "33333333", "pass", Role.OPERADOR);
        repartidor = new Usuario("rep@meditrack.com",        "Repartidor", "44444444", "pass", Role.REPARTIDOR);
    }

    @Nested
    @DisplayName("tienePermisoSobreRol()")
    class TienePermisoSobreRolTest {

        @Test
        @DisplayName("ADMINISTRADOR puede gestionar SUPERVISOR, OPERADOR y REPARTIDOR")
        void adminPuedeGestionarTodosLosRolesInferiores() {
            assertThat(usuarioService.tienePermisoSobreRol(Role.ADMINISTRADOR, Role.SUPERVISOR)).isTrue();
            assertThat(usuarioService.tienePermisoSobreRol(Role.ADMINISTRADOR, Role.OPERADOR)).isTrue();
            assertThat(usuarioService.tienePermisoSobreRol(Role.ADMINISTRADOR, Role.REPARTIDOR)).isTrue();
        }

        @Test
        @DisplayName("ADMINISTRADOR NO puede gestionarse a sí mismo")
        void adminNoPuedeGestionarOtroAdmin() {
            assertThat(usuarioService.tienePermisoSobreRol(Role.ADMINISTRADOR, Role.ADMINISTRADOR)).isFalse();
        }

        @Test
        @DisplayName("SUPERVISOR puede gestionar OPERADOR y REPARTIDOR")
        void supervisorPuedeGestionarOperadorYRepartidor() {
            assertThat(usuarioService.tienePermisoSobreRol(Role.SUPERVISOR, Role.OPERADOR)).isTrue();
            assertThat(usuarioService.tienePermisoSobreRol(Role.SUPERVISOR, Role.REPARTIDOR)).isTrue();
        }

        @Test
        @DisplayName("SUPERVISOR NO puede gestionar ADMINISTRADOR ni otro SUPERVISOR")
        void supervisorNoPuedeGestionarRolesSuperioresOIguales() {
            assertThat(usuarioService.tienePermisoSobreRol(Role.SUPERVISOR, Role.ADMINISTRADOR)).isFalse();
            assertThat(usuarioService.tienePermisoSobreRol(Role.SUPERVISOR, Role.SUPERVISOR)).isFalse();
        }

        @Test
        @DisplayName("OPERADOR solo puede gestionar REPARTIDOR")
        void operadorSoloPuedeGestionarRepartidor() {
            assertThat(usuarioService.tienePermisoSobreRol(Role.OPERADOR, Role.REPARTIDOR)).isTrue();
            assertThat(usuarioService.tienePermisoSobreRol(Role.OPERADOR, Role.OPERADOR)).isFalse();
            assertThat(usuarioService.tienePermisoSobreRol(Role.OPERADOR, Role.SUPERVISOR)).isFalse();
            assertThat(usuarioService.tienePermisoSobreRol(Role.OPERADOR, Role.ADMINISTRADOR)).isFalse();
        }

        @Test
        @DisplayName("REPARTIDOR no puede gestionar ningún rol")
        void repartidorNoPuedeGestionarNinguno() {
            assertThat(usuarioService.tienePermisoSobreRol(Role.REPARTIDOR, Role.REPARTIDOR)).isFalse();
            assertThat(usuarioService.tienePermisoSobreRol(Role.REPARTIDOR, Role.OPERADOR)).isFalse();
            assertThat(usuarioService.tienePermisoSobreRol(Role.REPARTIDOR, Role.SUPERVISOR)).isFalse();
            assertThat(usuarioService.tienePermisoSobreRol(Role.REPARTIDOR, Role.ADMINISTRADOR)).isFalse();
        }
    }

    @Nested
    @DisplayName("crear()")
    class CrearTest {

        private Map<String, String> datosValidos() {
            return Map.of(
                "email",    "nuevo@meditrack.com",
                "nombre",   "Nuevo Usuario",
                "dni",      "55555555",
                "password", "password123",
                "role",     "REPARTIDOR"
            );
        }

        @Test
        @DisplayName("Crea el usuario correctamente cuando el autor tiene permisos y los datos son únicos")
        void creaUsuarioConExito() {
            Map<String, String> datos = datosValidos();

            when(usuarioRepository.existsByEmail(datos.get("email"))).thenReturn(false);
            when(usuarioRepository.existsByDni(datos.get("dni"))).thenReturn(false);

            when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

            Usuario resultado = usuarioService.crear(datos, admin);

            assertThat(resultado.getEmail()).isEqualTo("nuevo@meditrack.com");
            assertThat(resultado.getRole()).isEqualTo(Role.REPARTIDOR);
            // Verificamos que se guardó exactamente una vez
            verify(usuarioRepository, times(1)).save(any(Usuario.class));
        }

        @Test
        @DisplayName("Lanza excepción si el autor no tiene jerarquía sobre el rol a crear")
        void lanzaExcepcionSinPermisos() {
            // Un REPARTIDOR intenta crear un OPERADOR → no tiene permiso
            Map<String, String> datos = Map.of(
                "email", "otro@meditrack.com", "nombre", "Otro", "dni", "66666666",
                "password", "pass", "role", "OPERADOR"
            );

            assertThatThrownBy(() -> usuarioService.crear(datos, repartidor))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("no tiene permisos para crear");

            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("Lanza excepción si el email ya está registrado")
        void lanzaExcepcionEmailDuplicado() {
            Map<String, String> datos = datosValidos();
            when(usuarioRepository.existsByEmail(datos.get("email"))).thenReturn(true);

            assertThatThrownBy(() -> usuarioService.crear(datos, admin))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("email ya está registrado");

            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("Lanza excepción si el DNI ya está registrado")
        void lanzaExcepcionDniDuplicado() {
            Map<String, String> datos = datosValidos();
            when(usuarioRepository.existsByEmail(datos.get("email"))).thenReturn(false);
            when(usuarioRepository.existsByDni(datos.get("dni"))).thenReturn(true);

            assertThatThrownBy(() -> usuarioService.crear(datos, admin))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("DNI ya está registrado");

            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("El historial del nuevo usuario contiene la entrada de Creación")
        void nuevoUsuarioTieneHistorialDeCreacion() {
            Map<String, String> datos = datosValidos();
            when(usuarioRepository.existsByEmail(any())).thenReturn(false);
            when(usuarioRepository.existsByDni(any())).thenReturn(false);
            when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

            Usuario resultado = usuarioService.crear(datos, admin);

            assertThat(resultado.getHistorial()).hasSize(1);
            assertThat(resultado.getHistorial().get(0).getCampoModificado()).isEqualTo("Creación");
        }
    }

    @Nested
    @DisplayName("actualizar()")
    class ActualizarTest {

        private Usuario usuarioExistente;

        @BeforeEach
        void setUp() {
            usuarioExistente = new Usuario("viejo@meditrack.com", "Nombre Viejo", "77777777", "passViejo", Role.REPARTIDOR);
        }

        @Test
        @DisplayName("Lanza excepción si el usuario objetivo no existe")
        void lanzaExcepcionUsuarioNoEncontrado() {
            when(usuarioRepository.findById("id-inexistente")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usuarioService.actualizar("id-inexistente", Map.of(), admin))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
        }

        @Test
        @DisplayName("Lanza excepción si el autor no tiene jerarquía para modificar el rol destino")
        void lanzaExcepcionSinJerarquiaParaElRolDestino() {
            when(usuarioRepository.findById("id-1")).thenReturn(Optional.of(usuarioExistente));

            // Un OPERADOR intenta cambiar a alguien a SUPERVISOR → no tiene permiso
            Map<String, String> datos = Map.of("role", "SUPERVISOR");

            assertThatThrownBy(() -> usuarioService.actualizar("id-1", datos, operador))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("jerarquía suficiente");
        }

        @Test
        @DisplayName("Actualiza el nombre y registra en el historial")
        void actualizaNombreYRegistraHistorial() {
            when(usuarioRepository.findById("id-1")).thenReturn(Optional.of(usuarioExistente));
            when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

            Map<String, String> datos = Map.of("nombre", "Nombre Nuevo");
            Usuario resultado = usuarioService.actualizar("id-1", datos, admin);

            assertThat(resultado.getNombre()).isEqualTo("Nombre Nuevo");
            assertThat(resultado.getHistorial())
                .anyMatch(h -> h.getCampoModificado().equals("Nombre")
                        && h.getValorAnterior().equals("Nombre Viejo")
                        && h.getValorActual().equals("Nombre Nuevo"));
        }

        @Test
        @DisplayName("Lanza excepción al cambiar email a uno ya registrado en otra cuenta")
        void lanzaExcepcionEmailDuplicadoEnActualizacion() {
            when(usuarioRepository.findById("id-1")).thenReturn(Optional.of(usuarioExistente));
            when(usuarioRepository.existsByEmail("repetido@meditrack.com")).thenReturn(true);

            Map<String, String> datos = Map.of("email", "repetido@meditrack.com");

            assertThatThrownBy(() -> usuarioService.actualizar("id-1", datos, admin))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("email ya está registrado en otra cuenta");
        }

        @Test
        @DisplayName("No registra historial si el valor nuevo es igual al anterior")
        void noRegistraHistorialSiValorNoCambio() {
            when(usuarioRepository.findById("id-1")).thenReturn(Optional.of(usuarioExistente));
            when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

            // Mandamos el mismo nombre que ya tiene
            Map<String, String> datos = Map.of("nombre", "Nombre Viejo");
            Usuario resultado = usuarioService.actualizar("id-1", datos, admin);

            assertThat(resultado.getHistorial()).isEmpty();
        }
    }

    @Nested
    @DisplayName("toggleEstado()")
    class ToggleEstadoTest {

        @Test
        @DisplayName("Desactiva un usuario activo y registra el cambio en el historial")
        void desactivaUsuarioActivo() {
            Usuario usuarioActivo = new Usuario("activo@meditrack.com", "Activo", "88888888", "pass", Role.REPARTIDOR);
            usuarioActivo.setEstadoActivo(true);

            when(usuarioRepository.findById("id-activo")).thenReturn(Optional.of(usuarioActivo));
            when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

            Usuario resultado = usuarioService.toggleEstado("id-activo", admin);

            assertThat(resultado.isEstadoActivo()).isFalse();
            assertThat(resultado.getHistorial())
                .anyMatch(h -> h.getCampoModificado().equals("Estado")
                        && h.getValorAnterior().equals("Activo")
                        && h.getValorActual().equals("Inactivo"));
        }

        @Test
        @DisplayName("Reactiva un usuario inactivo")
        void reactivaUsuarioInactivo() {
            Usuario usuarioInactivo = new Usuario("inactivo@meditrack.com", "Inactivo", "99999999", "pass", Role.REPARTIDOR);
            usuarioInactivo.setEstadoActivo(false);

            when(usuarioRepository.findById("id-inactivo")).thenReturn(Optional.of(usuarioInactivo));
            when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

            Usuario resultado = usuarioService.toggleEstado("id-inactivo", admin);

            assertThat(resultado.isEstadoActivo()).isTrue();
        }

        @Test
        @DisplayName("Lanza excepción si el autor no tiene permisos sobre el rol del usuario objetivo")
        void lanzaExcepcionSinPermisoParaToggle() {
            Usuario otroOperador = new Usuario("op2@meditrack.com", "Operador2", "10101010", "pass", Role.OPERADOR);

            when(usuarioRepository.findById("id-op2")).thenReturn(Optional.of(otroOperador));

            // Un OPERADOR intenta desactivar a otro OPERADOR → no tiene permiso
            assertThatThrownBy(() -> usuarioService.toggleEstado("id-op2", operador))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("No tienes permiso para desactivar");
        }

        @Test
        @DisplayName("Lanza excepción si el usuario a togglear no existe")
        void lanzaExcepcionUsuarioNoEncontrado() {
            when(usuarioRepository.findById("id-ghost")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usuarioService.toggleEstado("id-ghost", admin))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
        }
    }
    
}
