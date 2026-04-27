import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getEnvios } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ESTADO_COLORS = {
  PENDIENTE: '#6b7280',
  ASIGNADO: '#4338CA',
  EN_PREPARACION: '#f59e0b',
  EN_TRANSITO: '#3b82f6',
  EN_PUNTO_DE_ENTREGA: '#06b6d4',
  INCIDENTE_REPORTADO: '#ef4444',
  ENTREGADO: '#10b981',
  CANCELADO: '#000000'
};

function Home() {
  const [envios, setEnvios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaCreacion', direction: 'desc' });
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

useEffect(() => {
  getEnvios().then(setEnvios).catch(console.error);

  if (location.state?.success) {
    const showTimer = setTimeout(() => {
      setShowSnackbar(true);
    }, 100);

    window.history.replaceState({}, document.title);

    const hideTimer = setTimeout(() => {
      setShowSnackbar(false);
    }, 3100);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }
}, [location.state]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    return [...data].sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';

      if (sortConfig.key === 'fechaCreacion') {
        const timeA = new Date(valA.replace(/-/g, '/')).getTime() || 0;
        const timeB = new Date(valB.replace(/-/g, '/')).getTime() || 0;
        return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
      }

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
    const lightColor = `${color}15`;
    const isTotal = estado === null;
    return {
      '--hover-border': color,
      border: isActive ? `2px solid ${color}` : '2px solid transparent',
      backgroundColor: isActive && !isTotal ? lightColor : 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  const getBadgeStyle = (estado) => {
    const color = ESTADO_COLORS[estado] || '#6b7280';
    return {
      backgroundColor: `${color}15`,
      color: color,
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      border: `1px solid ${color}30`,
      textTransform: 'uppercase',
      display: 'inline-block'
    };
  };

  return (
    <div className="container">
      <style>
        {`
          .metric-card-dynamic:hover {
            border-color: var(--hover-border) !important;
          }
          .snackbar {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #00A86B;
            color: white;
            padding: 12px 32px;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: fadeInDown 0.4s ease-out;
            white-space: nowrap;
          }
          @keyframes fadeInDown {
            from { top: -50px; opacity: 0; transform: translateX(-50%); }
            to { top: 20px; opacity: 1; transform: translateX(-50%); }
          }
        `}
      </style>

      {showSnackbar && (
        <div className="snackbar">
          ¡Envío creado correctamente!
        </div>
      )}
      
      <div className="header-with-action">
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Gestión de Envíos</h1>
        {(user?.role === 'SUPERVISOR' || user?.role === 'ADMINISTRADOR') && (
          <button className="btn btn-primary" onClick={() => navigate('/nuevo')}>
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

        {Object.entries(ESTADO_COLORS).filter(([k]) => k !== 'CANCELADO').map(([key, color]) => (
          <div 
            key={key}
            className="metric-card metric-card-dynamic" 
            style={getMetricStyle(key, color, filtroEstado === key)}
            onClick={() => setFiltroEstado(key)}
          >
            <h3>{key.replace(/_/g, ' ')}</h3>
            <div className="value" style={{color: color}}>{contar(key)}</div>
          </div>
        ))}
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
                <td><span style={getBadgeStyle(e.estado)}>{e.estado?.replace(/_/g, ' ')}</span></td>
                <td style={{ fontSize: '13px' }}>{e.fechaCreacion ? e.fechaCreacion.split(' ')[0] : '-'}</td>
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
