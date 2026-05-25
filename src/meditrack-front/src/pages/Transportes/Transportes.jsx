import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransportes, createTransporte, updateTransporte} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ESTADO_COLORS = {
    ACTIVO: '#10b981',
    INACTIVO: '#6b7280',
    MANTENIMIENTO: '#f59e0b',
};

const ESTADOS = ['ACTIVO', 'INACTIVO', 'MANTENIMIENTO'];

function Transportes() {
    const [transportes, setTransportes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errorModal, setErrorModal] = useState('');

    // modal alta/edición
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [form, setForm] = useState({
        patente: '',
        tipoVehiculo: '',
        capacidadKg: '',
        capacidadLitros: '',
        estadoOperativo: 'ACTIVO',
    });

    const navigate = useNavigate();
    const { user } = useAuth();

    const puedeEditar = user?.role === 'ADMINISTRADOR'; // HU: "Como administrador"

    const cargar = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getTransportes(busqueda, filtroEstado);
            setTransportes(data);
        } catch (e) {
            setError(e.message || 'Error al cargar transportes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const data = await getTransportes("", "");
                setTransportes(data);
            } catch (e) {
                setError(e.message || 'Error al cargar transportes');
            }
            finally {
                setLoading(false);
            }
        };
        fetchInitial();

    },[]);



    const transportesFiltrados = useMemo(() => {
        const term = busqueda.toLowerCase().trim();
        return transportes.filter((t) => {
            const cumpleTerm =
                !term ||
                (t.patente || '').toLowerCase().includes(term) ||
                (t.tipoVehiculo || '').toLowerCase().includes(term);

            const cumpleEstado = !filtroEstado || t.estadoOperativo === filtroEstado;
            return cumpleTerm && cumpleEstado;
        });
    }, [transportes, busqueda, filtroEstado]);

    const abrirNuevo = () => {
        setModoEdicion(false);
        setIdEditando(null);
        setForm({
            patente: '',
            tipoVehiculo: '',
            capacidadKg: '',
            capacidadLitros: '',
            estadoOperativo: 'ACTIVO',
        });
        setError('');
        setErrorModal('');
        setModalAbierto(true);
    };

    const abrirEditar = (t) => {
        setModoEdicion(true);
        setIdEditando(t.id);
        setForm({
            patente: t.patente || '',
            tipoVehiculo: t.tipoVehiculo || '',
            capacidadKg: String(t.capacidadKg ?? ''),
            capacidadLitros: String(t.capacidadLitros ?? ''),
            estadoOperativo: t.estadoOperativo || 'ACTIVO',
        });
        setError('');
        setErrorModal('');
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setModoEdicion(false);
        setIdEditando(null);
        setErrorModal('');
    };

    const validarForm = () => {
        if (!form.patente.trim()) return 'La patente es obligatoria';
        if (!form.tipoVehiculo.trim()) return 'El tipo de vehículo es obligatorio';
        const cap = Number(form.capacidadKg);
        if (!form.capacidadKg || Number.isNaN(cap) || cap <= 0) return 'La capacidad debe ser mayor a 0';
        const vol = Number(form.capacidadLitros);
        if (!form.capacidadLitros || Number.isNaN(vol) || vol <= 0) return 'La capacidad de volumen debe ser mayor a 0';
        if (!form.estadoOperativo) return 'El estado operativo es obligatorio';
        return '';
    };

    const guardar = async () => {
        const msg = validarForm();
        if (msg) {
            setErrorModal(msg);
            return;
        }

        const payload = {
            patente: form.patente.trim(),
            tipoVehiculo: form.tipoVehiculo.trim(),
            capacidadKg: Number(form.capacidadKg),
            capacidadLitros: Number(form.capacidadLitros),
            estadoOperativo: form.estadoOperativo,
        };

        try {
            setError('');
            if (modoEdicion && idEditando != null) {
                await updateTransporte(idEditando, payload);
            } else {
                await createTransporte(payload);
            }
            cerrarModal();
            await cargar();
        } catch (e) {
            setErrorModal(e.message || 'Error al guardar transporte');
        }
    };

    const toggleActivo = async (t) => {
        if (!puedeEditar) return;
        if (t.estadoOperativo === 'MANTENIMIENTO') return;

        const anterior = t.estadoOperativo;
        const nuevoEstado = anterior === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

        // ✅ 1) cambia UI al instante
        setTransportes(prev =>
            prev.map(x => (x.id === t.id ? { ...x, estadoOperativo: nuevoEstado } : x))
        );

        try {
            setError('');
            await updateTransporte(t.id, {
                patente: t.patente,
                tipoVehiculo: t.tipoVehiculo,
                capacidadKg: t.capacidadKg,
                capacidadLitros: t.capacidadLitros,
                estadoOperativo: nuevoEstado,
            });
        } catch (e) {

            setTransportes(prev =>
                prev.map(x => (x.id === t.id ? { ...x, estadoOperativo: anterior } : x))
            );
            setError(e.message || 'Error al actualizar estado');
        }
    };

    const getEstadoStyle = (estado) => {
        const color = ESTADO_COLORS[estado] || '#6b7280';
        return {
            backgroundColor: `${color} 20`,
            color,
        };
    };

    return (
        <div className="container">
            <div
                className="page-header-row"
                style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}
            >
                <button className="btn btn-secondary" onClick={() => navigate('/')}>VOLVER</button>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>Gestión de transportes</h1>
            </div>

            <div className="card">
                <div className="table-header-actions">
                    <input
                        className="search-input"
                        style={{ margin: 0, flexGrow: 1 }}
                        placeholder="Buscar por patente o tipo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />

                    <select
                        className="search-input"
                        style={{ margin: 0, maxWidth: '240px' }}
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        {ESTADOS.map((st) => (
                            <option key={st} value={st}>{st}</option>
                        ))}
                    </select>

                    <button className="btn btn-secondary" onClick={cargar}>BUSCAR</button>

                    {puedeEditar && (
                        <button className="btn-new-shipment" onClick={abrirNuevo}>
                            NUEVO TRANSPORTE
                        </button>
                    )}
                </div>

                {error && (
                    <p style={{ padding: '10px 20px', color: '#ef4444', fontWeight: '700' }}>
                        {error}
                    </p>
                )}

                {loading ? (
                    <p style={{ padding: '20px', color: '#6b7280' }}>Cargando transportes...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Patente</th>
                                <th>Tipo</th>
                                <th style={{ textAlign: 'center' }}>Capacidad (kg)</th>
                                <th style={{ textAlign: 'center' }}>Capacidad (litros)</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transportesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                        No hay transportes registrados
                                    </td>
                                </tr>
                            ) : (
                                transportesFiltrados.map((t) => (
                                    <tr key={t.id}>
                                        <td style={{ fontWeight: 'bold', color: '#2563EB' }}>{t.patente}</td>
                                        <td>{t.tipoVehiculo}</td>
                                        <td style={{ textAlign: 'center' }}>{t.capacidadKg}</td>
                                        <td style={{ textAlign: 'center' }}>{t.capacidadLitros}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                                className="mt-estado-cell"
                                            >
                                                <label className="mt-switch" title="Activo / Inactivo">
                                                    <input
                                                        type="checkbox"
                                                        checked={t.estadoOperativo === 'ACTIVO'}
                                                        disabled={!puedeEditar || t.estadoOperativo === 'MANTENIMIENTO'}
                                                        onChange={() => toggleActivo(t)}
                                                    />
                                                    <span className="mt-slider" />
                                                </label>
                                                <span className="status-tag" style={getEstadoStyle(t.estadoOperativo)}>
                                                    {t.estadoOperativo}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                {puedeEditar && (
                                                    <button
                                                        className="action-icon-btn"
                                                        title="Editar"
                                                        onClick={() => abrirEditar(t)}
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 20h9" />
                                                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                        </svg>
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '520px' }}>
                        <h2 style={{ marginBottom: '14px' }}>
                            {modoEdicion ? 'Editar transporte' : 'Nuevo transporte'}
                        </h2>

                        <div className="form-group">
                            <label>Patente *</label>
                            {errorModal && (
                                <p style={{ marginBottom: '12px', color: '#ef4444', fontWeight: '700' }}>
                                    {errorModal}
                                </p>
                            )}
                            <input
                                value={form.patente}
                                onChange={(e) => setForm({ ...form, patente: e.target.value })}
                                placeholder="AA123BB"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tipo de vehículo *</label>
                            <input
                                value={form.tipoVehiculo}
                                onChange={(e) => setForm({ ...form, tipoVehiculo: e.target.value })}
                                placeholder="Camión / Utilitario / Moto"
                            />
                        </div>

                        <div className="form-group">
                            <label>Capacidad (kg) *</label>
                            <input
                                type="number"
                                value={form.capacidadKg}
                                onChange={(e) => setForm({ ...form, capacidadKg: e.target.value })}
                                placeholder="1200"
                            />
                        </div>

                        <div className="form-group">
                            <label>Capacidad (L) *</label>
                            <input
                                type="number"
                                value={form.capacidadLitros}
                                onChange={(e) => setForm({ ...form, capacidadLitros: e.target.value })}
                                placeholder="1200"
                            />
                        </div>

                        <div className="form-group">
                            <label>Estado operativo *</label>
                            <select
                                value={form.estadoOperativo}
                                onChange={(e) => setForm({ ...form, estadoOperativo: e.target.value })}
                            >
                                {ESTADOS.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '18px' }}>
                            <button className="btn btn-primary" onClick={guardar}>
                                GUARDAR
                            </button>
                            <button className="btn btn-secondary" onClick={cerrarModal}>
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}

export default Transportes;