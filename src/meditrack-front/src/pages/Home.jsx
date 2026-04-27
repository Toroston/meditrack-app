import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnvios } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Home() {
  const [envios, setEnvios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaCreacion', direction: 'desc' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getEnvios().then(setEnvios).catch(console.error);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    return [...data].sort((a, b) => {
      const valA = a[sortConfig.key] || '';
      const valB = b[sortConfig.key] || '';
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filtradosYOrdenados = getSortedData(
    envios.filter(e => {
      const term = busqueda.toLowerCase();
      const matchBusqueda = e.id.toLowerCase().includes(term) || 
                            e.destinatario?.toLowerCase().includes(term);
      const matchEstado = filtroEstado ? e.estado === filtroEstado : true;
      return matchBusqueda && matchEstado;
    })
  );

  const contar = (estado) => envios.filter(e => e.estado === estado).length;

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span style={{ color: '#ccc', marginLeft: '5px' }}>↕</span>;
    return sortConfig.direction === 'asc' ? 
      <span style={{ marginLeft: '5px' }}>▲</span> : 
      <span style={{ marginLeft: '5px' }}>▼</span>;
  };

  const getMetricStyle = (estado, color, isActive) => {
    const lightColor = color === 'var(--text-gray)' ? '#f3f4f6' : `${color}15`;
    const isTotal = estado === null;

    return {
      '--hover-border': color,
      border: isActive ? `2px solid ${color}` : '2px solid transparent',
      backgroundColor: isActive && !isTotal ? lightColor : 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <div className="container">
      <style>
        {`
          .metric-card-dynamic:hover {
            border-color: var(--hover-border) !important;
          }
        `}
      </style>
      
      <div className="header-with-action">
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Gestión de Envíos</h1>
        {(user?.role === 'SUPERVISOR' || user?.role === 'ADMINISTRADOR') && (
          <button className="btn btn-primary" onClick={() => navigate('envios/nuevo')}>
            + NUEVO ENVÍO
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        <div 
          className="metric-card metric-card-dynamic" 
          style={getMetricStyle(null, '#10b981', !filtroEstado)}
          onClick={() => setFiltroEstado(null)}
        >
          <h3>Total</h3>
          <div className="value">{envios.length}</div>
        </div>

        <div 
          className="metric-card metric-card-dynamic" 
          style={getMetricStyle('PENDIENTE', '#6b7280', filtroEstado === 'PENDIENTE')}
          onClick={() => setFiltroEstado('PENDIENTE')}
        >
          <h3>Pendientes</h3>
          <div className="value" style={{color: '#6b7280'}}>{contar('PENDIENTE')}</div>
        </div>

        <div 
          className="metric-card metric-card-dynamic" 
          style={getMetricStyle('ASIGNADO', '#4338CA', filtroEstado === 'ASIGNADO')}
          onClick={() => setFiltroEstado('ASIGNADO')}
        >
          <h3>Asignados</h3>
          <div className="value" style={{color: '#4338CA'}}>{contar('ASIGNADO')}</div>
        </div>

        <div 
          className="metric-card metric-card-dynamic" 
          style={getMetricStyle('EN_PREPARACION', '#f59e0b', filtroEstado === 'EN_PREPARACION')}
          onClick={() => setFiltroEstado('EN_PREPARACION')}
        >
          <h3>En Preparación</h3>
          <div className="value" style={{color: '#f59e0b'}}>{contar('EN_PREPARACION')}</div>
        </div>

        <div 
          className="metric-card metric-card-dynamic" 
          style={getMetricStyle('EN_TRANSITO', '#3b82f6', filtroEstado === 'EN_TRANSITO')}
          onClick={() => setFiltroEstado('EN_TRANSITO')}
        >
          <h3>En Tránsito</h3>
          <div className="value" style={{color: '#3b82f6'}}>{contar('EN_TRANSITO')}</div>
        </div>

        <div 
          className="metric-card metric-card-dynamic" 
          style={getMetricStyle('EN_PUNTO_DE_ENTREGA', '#06b6d4', filtroEstado === 'EN_PUNTO_DE_ENTREGA')}
          onClick={() => setFiltroEstado('EN_PUNTO_DE_ENTREGA')}
        >
          <h3>En Destino</h3>
          <div className="value" style={{color: '#06b6d4'}}>{contar('EN_PUNTO_DE_ENTREGA')}</div>
        </div>

        <div 
          className="metric-card metric-card-dynamic" 
          style={getMetricStyle('INCIDENTE_REPORTADO', '#ef4444', filtroEstado === 'INCIDENTE_REPORTADO')}
          onClick={() => setFiltroEstado('INCIDENTE_REPORTADO')}
        >
          <h3>Incidentes</h3>
          <div className="value" style={{color: '#ef4444'}}>{contar('INCIDENTE_REPORTADO')}</div>
        </div>

        <div 
          className="metric-card metric-card-dynamic" 
          style={getMetricStyle('ENTREGADO', '#10b981', filtroEstado === 'ENTREGADO')}
          onClick={() => setFiltroEstado('ENTREGADO')}
        >
          <h3>Entregados</h3>
          <div className="value" style={{color: '#10b981'}}>{contar('ENTREGADO')}</div>
        </div>
      </div>

      <div className="card">
        <input 
          style={{ marginBottom: '20px', width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
          placeholder="🔍 Buscar por Tracking ID o Destinatario..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)} 
        />
        
        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Destinatario</th>
              <th>Estado</th>
              <th onClick={() => handleSort('fechaCreacion')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                F. Creación {renderSortIcon('fechaCreacion')}
              </th>
              <th onClick={() => handleSort('fechaEstimada')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                F. Envío {renderSortIcon('fechaEstimada')}
              </th>
              <th>Responsable</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradosYOrdenados.map(e => (
              <tr key={e.id}>
                <td style={{fontWeight: 'bold', color: 'var(--secondary-blue)'}}>{e.id}</td>
                <td>{e.destinatario}</td>
                <td><span className={`badge badge-${e.estado}`}>{e.estado?.replace(/_/g, ' ')}</span></td>
                <td style={{ fontSize: '13px' }}>{e.fechaCreacion || '-'}</td>
                <td style={{ fontSize: '13px' }}>{e.fechaEstimada || '-'}</td>
                <td>{e.usuarioResponsable}</td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => navigate(`/detalle/${e.id}`)}>
                    VER DETALLE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;