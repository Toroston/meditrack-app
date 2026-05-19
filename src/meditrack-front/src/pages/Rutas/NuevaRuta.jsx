import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnvios, getRutas, getUsuarios, createRuta } from '../../services/api';

const ESTADO_COLORS = {
  PENDIENTE: '#6b7280',
  ASIGNADO: '#4338CA',
  EN_PREPARACION: '#f59e0b',
  EN_TRANSITO: '#3b82f6',
  EN_PUNTO_DE_ENTREGA: '#06b6d4',
  INCIDENTE_REPORTADO: '#ef4444',
  ENTREGADO: '#10b981',
  CANCELADO: '#000000',
};

function NuevaRuta() {
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [repartidorId, setRepartidorId] = useState('');
  const [repartidores, setRepartidores] = useState([]);

  const [enviosDisponibles, setEnviosDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [busquedaEnvio, setBusquedaEnvio] = useState('');
  const [loadingEnvios, setLoadingEnvios] = useState(false);

  const [ordenados, setOrdenados] = useState([]);

  useEffect(() => {
    getUsuarios()
      .then(data => {
        setRepartidores(data.filter(u => u.role === 'REPARTIDOR' && u.estadoActivo && !u.haciendoEntrega));
      })
      .catch(console.error);
  }, []);

  const cargarEnviosDisponibles = async () => {
    setLoadingEnvios(true);
    try {
      const [todosEnvios, todasRutas] = await Promise.all([getEnvios(), getRutas()]);
      const enviosEnRuta = new Set(
        todasRutas.flatMap(r => r.envios?.map(re => re.envio?.id).filter(Boolean) ?? [])
      );
      setEnviosDisponibles(
        todosEnvios.filter(e => e.estado === 'PENDIENTE' && !enviosEnRuta.has(e.id))
      );
    } catch {
      setError('Error al cargar envíos disponibles');
    } finally {
      setLoadingEnvios(false);
    }
  };

  const avanzarPaso1 = () => {
    if (!fecha) { setError('Seleccioná una fecha'); return; }
    if (!repartidorId) { setError('Seleccioná un repartidor'); return; }
    setError('');
    cargarEnviosDisponibles();
    setPaso(2);
  };

  const toggleSeleccion = (envio) => {
    setSeleccionados(prev =>
      prev.some(e => e.id === envio.id)
        ? prev.filter(e => e.id !== envio.id)
        : [...prev, envio]
    );
  };

  const avanzarPaso2 = () => {
    if (seleccionados.length === 0) { setError('Seleccioná al menos un envío'); return; }
    setError('');
    const sugeridos = [...seleccionados].sort((a, b) =>
      (a.direccionEntrega ?? '').localeCompare(b.direccionEntrega ?? '')
    );
    setOrdenados(sugeridos);
    setPaso(3);
  };

  const moverArriba = (idx) => {
    if (idx === 0) return;
    const nuevo = [...ordenados];
    [nuevo[idx - 1], nuevo[idx]] = [nuevo[idx], nuevo[idx - 1]];
    setOrdenados(nuevo);
  };

  const moverAbajo = (idx) => {
    if (idx === ordenados.length - 1) return;
    const nuevo = [...ordenados];
    [nuevo[idx], nuevo[idx + 1]] = [nuevo[idx + 1], nuevo[idx]];
    setOrdenados(nuevo);
  };

  const confirmarCreacion = async () => {
    setGuardando(true);
    setError('');
    try {
      await createRuta({
        fecha,
        repartidorId,
        envios: ordenados.map((e, idx) => ({ envioId: e.id, orden: idx + 1 })),
      });
      navigate('/rutas', { state: { success: true } });
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const enviosFiltrados = enviosDisponibles.filter(e => {
    const term = busquedaEnvio.toLowerCase();
    return (
      e.id.toLowerCase().includes(term) ||
      e.destinatario?.toLowerCase().includes(term) ||
      e.direccionEntrega?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container">
      <div className="page-header-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/rutas')}>VOLVER</button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>Nueva ruta</h1>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '32px 60px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          alignItems: 'flex-start',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {[
            { n: 1, label: 'Fecha y repartidor' },
            { n: 2, label: 'Seleccionar envíos' },
            { n: 3, label: 'Confirmar orden' },
          ].map(({ n, label }) => {
            const completado = paso > n;
            const actual = paso === n;
            const circuloColor = completado ? '#10B981' : actual ? '#2563EB' : 'white';
            const bordColor = completado ? '#10B981' : actual ? '#2563EB' : '#D1D5DB';
            const textoColor = completado ? '#10B981' : actual ? '#2563EB' : '#9CA3AF';
            const lineaColor = completado ? '#10B981' : '#E5E7EB';

            return (
              <div key={n} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 3,
              }}>
                {n < 3 && (
                  <div style={{
                    position: 'absolute',
                    top: '17px',
                    left: '50%',
                    width: '100%',
                    height: '3px',
                    backgroundColor: lineaColor,
                    zIndex: 1,
                    transition: 'background-color 0.3s',
                  }} />
                )}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: circuloColor,
                  border: `2px solid ${bordColor}`,
                  color: completado || actual ? 'white' : '#9CA3AF',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  marginBottom: '12px',
                  transition: 'all 0.3s',
                  zIndex: 2,
                  position: 'relative',
                }}>
                  {completado ? '✓' : n}
                </div>
                <span style={{
                  fontSize: '10px',
                  textAlign: 'center',
                  fontWeight: actual ? '800' : '500',
                  color: textoColor,
                  textTransform: 'uppercase',
                  maxWidth: '90px',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {paso === 1 && (
        <div className="card" style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
            Definir fecha y repartidor
          </h2>

          <div className="form-group">
            <label>Fecha de la ruta *</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Repartidor *</label>
            <select
              value={repartidorId}
              onChange={e => setRepartidorId(e.target.value)}
            >
              <option value="">Seleccionar repartidor...</option>
              {repartidores.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            {repartidores.length === 0 && (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                No hay repartidores disponibles en este momento
              </p>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-new-shipment" onClick={avanzarPaso1}>
              SIGUIENTE
            </button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
              Seleccionar envíos ({seleccionados.length} seleccionados)
            </h2>
            <input
              className="search-input"
              style={{ margin: 0, width: '280px' }}
              placeholder="Buscar por ID, destinatario, dirección..."
              value={busquedaEnvio}
              onChange={e => setBusquedaEnvio(e.target.value)}
            />
          </div>

          {loadingEnvios ? (
            <p style={{ padding: '20px', color: '#6b7280' }}>Cargando envíos disponibles...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Tracking ID</th>
                  <th>Destinatario</th>
                  <th>Dirección entrega</th>
                  <th>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {enviosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      No hay envíos disponibles para enrutar
                    </td>
                  </tr>
                ) : (
                  enviosFiltrados.map(e => {
                    const marcado = seleccionados.some(s => s.id === e.id);
                    return (
                      <tr
                        key={e.id}
                        onClick={() => toggleSeleccion(e)}
                        style={{ cursor: 'pointer', backgroundColor: marcado ? '#EFF6FF' : 'transparent' }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={marcado} onChange={() => toggleSeleccion(e)} onClick={ev => ev.stopPropagation()} />
                        </td>
                        <td style={{ fontWeight: 'bold', color: '#2563EB' }}>{e.id}</td>
                        <td>{e.destinatario}</td>
                        <td style={{ fontSize: '13px', color: '#6b7280' }}>{e.direccionEntrega}</td>
                        <td>
                          {e.prioridad && (
                            <span className="status-tag" style={{ backgroundColor: '#FEF3C720', color: '#D97706' }}>
                              {e.prioridad}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setPaso(1)}>ANTERIOR</button>
            <button className="btn-new-shipment" onClick={avanzarPaso2}>
              SUGERIR ORDEN Y CONTINUAR
            </button>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
              Confirmar orden de entrega
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              Orden sugerido por dirección. Usá las flechas para ajustarlo.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Orden</th>
                <th>Tracking ID</th>
                <th>Destinatario</th>
                <th>Dirección entrega</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Mover</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.map((e, idx) => (
                <tr key={e.id}>
                  <td style={{ textAlign: 'center', fontWeight: '900', fontSize: '18px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
                    {idx + 1}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#2563EB' }}>{e.id}</td>
                  <td>{e.destinatario}</td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>{e.direccionEntrega}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={() => moverArriba(idx)}
                        disabled={idx === 0}
                        style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, fontSize: '16px' }}
                        title="Subir"
                      >↑</button>
                      <button
                        onClick={() => moverAbajo(idx)}
                        disabled={idx === ordenados.length - 1}
                        style={{ border: 'none', background: 'none', cursor: idx === ordenados.length - 1 ? 'default' : 'pointer', opacity: idx === ordenados.length - 1 ? 0.3 : 1, fontSize: '16px' }}
                        title="Bajar"
                      >↓</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
            <strong style={{ color: '#374151' }}>Resumen:</strong> Ruta para el <strong style={{ color: '#111827' }}>{fecha}</strong> | Repartidor: <strong style={{ color: '#111827' }}>{repartidores.find(r => r.id === repartidorId)?.nombre}</strong> | {ordenados.length} envíos
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setPaso(2)}>ANTERIOR</button>
            <button className="btn-new-shipment" onClick={confirmarCreacion} disabled={guardando}>
              {guardando ? 'CREANDO...' : 'CREAR RUTA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NuevaRuta;
