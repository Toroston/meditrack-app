import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsuarios, toggleEstadoUsuario } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ModalHistorialUsuario from '../components/ModalHistorialUsuario';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [historialAbierto, setHistorialAbierto] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        getUsuarios().then(setUsuarios).catch(console.error);        
    }, []);

    const handleToggleEstado = async (id) => {
        try {
            await toggleEstadoUsuario(id);
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const term = busqueda.toLowerCase();
        return u.nombre?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
    });

    return (
        <div className="container">
            <div className="header-with-action">
                <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Gestión de Personal</h1>
                {user?.role !== 'REPARTIDOR' && (
                    <button className="btn btn-primary" onClick={() => navigate('/usuarios/nuevo')}>
                        + NUEVO USUARIO
                    </button>
                )}
            </div>

            <div className="card">
                <input
                    style={{ marginBottom: '20px', width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                    placeholder="🔍 Buscar por Nombre o Email..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                />

                <table>
                    <thead>
                        <tr>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                            <th>Historial de Cambios</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map(u => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: 'bold' }}>{u.nombre}</td>
                                <td>{u.email}</td>
                                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                                <td>
                                    <span style={{ color: u.estadoActivo ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                        {u.estadoActivo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/usuarios/editar/${u.id}`)}>
                                            EDITAR
                                        </button>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            style={{ backgroundColor: u.estadoActivo ? '#fee2e2' : '#d1fae5', color: u.estadoActivo ? '#ef4444' : '#10b981', border: 'none' }}
                                            onClick={() => handleToggleEstado(u.id)}
                                        >
                                            {u.estadoActivo ? 'DESACTIVAR' : 'ACTIVAR'}
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                            onClick={() => {
                                            setUsuarioSeleccionado(u);
                                            setHistorialAbierto(true);
                                        }}
                                    >VER HISTORIAL</button>
                                </td>
                            </tr>
                        ))}

                        {historialAbierto && usuarioSeleccionado && (
                            <ModalHistorialUsuario
                                usuario={usuarioSeleccionado}
                                alCerrar={() => {
                                    setHistorialAbierto(false);
                                    setUsuarioSeleccionado(null);
                                }}
                            />
                        )}
                        {usuariosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                    No se encontraron usuarios.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Usuarios;