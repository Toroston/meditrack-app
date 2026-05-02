import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicamentos, deleteMedicamento } from '../services/api';

function Medicamentos() {
    const [medicamentos, setMedicamentos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [confirmId, setConfirmId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getMedicamentos().then(setMedicamentos).catch(console.error);
    }, []);

    const handleEliminar = async (id) => {
        try {
            await deleteMedicamento(id);
            setMedicamentos(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error(error);
        } finally {
            setConfirmId(null);
        }
    };

    const filtrados = medicamentos.filter(m => {
        const term = busqueda.toLowerCase();
        return (
            m.nombre?.toLowerCase().includes(term) ||
            m.principioActivo?.toLowerCase().includes(term) ||
            m.laboratorio?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="container">
            <div className="page-header-row">
                <button className="btn btn-secondary" onClick={() => navigate('/')}>VOLVER</button>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>Gestión de medicamentos</h1>
            </div>

            <div className="card">
                <div className="table-header-actions">
                    <input
                        className="search-input-user"
                        placeholder="Buscar por nombre, principio activo o laboratorio..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Principio Activo</th>
                            <th>Laboratorio</th>
                            <th>Presentación</th>
                            <th>Stock</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.map(m => (
                            <tr key={m.id}>
                                <td style={{ fontWeight: 'bold' }}>{m.nombre}</td>
                                <td>{m.principioActivo}</td>
                                <td>{m.laboratorio}</td>
                                <td>{m.presentacion}</td>
                                <td>{m.stock} {m.unidad}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            className="action-icon-btn"
                                            title="Editar medicamento"
                                            onClick={() => navigate(`/medicamentos/editar/${m.id}`)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path>
                                            </svg>
                                        </button>
                                        <button
                                            className="action-icon-btn"
                                            title="Eliminar medicamento"
                                            onClick={() => setConfirmId(m.id)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                                <path d="M10 11v6"></path>
                                                <path d="M14 11v6"></path>
                                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtrados.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: '#6B7280', padding: '30px' }}>
                                    No se encontraron medicamentos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {confirmId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Eliminar medicamento</h2>
                        <p style={{ color: '#6B7280', fontSize: '14px' }}>
                            ¿Estás seguro de que querés eliminar este medicamento? Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>CANCELAR</button>
                            <button className="btn btn-danger" onClick={() => handleEliminar(confirmId)}>ELIMINAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Medicamentos;
