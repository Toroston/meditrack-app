import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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

const ORDEN_METRICAS = [
  'TOTAL', 'ENTREGADO', 'CANCELADO',
  'PENDIENTE', 'ASIGNADO', 'EN_PREPARACION',
  'EN_TRANSITO', 'EN_PUNTO_DE_ENTREGA', 'INCIDENTE_REPORTADO'
];

function Home() {
  const [envios, setEnvios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtrosEstados, setFiltrosEstados] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaCreacion', direction: 'asc' });
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

useEffect(() => {

    getEnvios().then(setEnvios).catch(console.error);

    if (location.state?.success) {
      const timer = setTimeout(() => {
        setShowSnackbar(true);
        window.history.replaceState({}, document.title);
      }, 0);
      const hideTimer = setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [location.state]);

  const contar = (estado) => envios.filter(e => e.estado === estado).length;

  const toggleFiltro = (estado) => {
    setFiltrosEstados(prev => 
      prev.includes(estado) 
        ? prev.filter(s => s !== estado) 
        : [...prev, estado]
    );
  };

  const getPercent = (count) => {
    const raw = envios.length > 0 ? (count / envios.length) * 100 : 0;
    return Number.isInteger(raw) ? raw : Math.round(raw);
  };

  const getChartData = (key, color) => {
    if (envios.length === 0) return [{ value: 1, fill: '#E5E7EB' }];
    if (key === 'TOTAL') {
      return Object.entries(ESTADO_COLORS).map(([est, col]) => ({
        name: est,
        value: contar(est),
        fill: col
      })).filter(d => d.value > 0);
    } else {
      const cantidad = contar(key);
      return [
        { value: cantidad, fill: color },
        { value: envios.length - cantidad, fill: '#F3F4F6' }
      ];
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filtradosYOrdenados = [...envios]
    .filter(e => {
      const term = busqueda.toLowerCase();
      const cumpleBusqueda = (e.id.toLowerCase().includes(term) ||
                             e.remitente?.toLowerCase().includes(term) ||
                             e.destinatario?.toLowerCase().includes(term));
      const cumpleEstado = filtrosEstados.length === 0 || filtrosEstados.includes(e.estado);
      return cumpleBusqueda && cumpleEstado;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="container">
      <style>
        {`
          *:focus { outline: none !important; }
          .recharts-wrapper, .recharts-surface { outline: none !important; border: none !important; }
          
          .summary-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            border: 2px solid #E5E7EB;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            min-height: 220px;
          }

          .summary-chart-container {
            width: 180px;
            height: 180px;
            margin-right: 40px;
            position: relative;
            cursor: pointer;
            flex-shrink: 0;
          }
          
          .summary-details {
            flex-grow: 1;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }

          .detail-item {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 12px 18px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            border: 2px solid #F3F4F6;
            background: #fff;
            height: 75px;
          }
          .detail-item:hover { background: #F9FAFB; transform: translateY(-1px); }
          .detail-item.active { border-color: currentColor; background: #f3f4f6; }
          
          .detail-info-block { display: flex; flex-direction: column; text-align: left; justify-content: center; }

          .mini-chart-wrapper { width: 58px; height: 58px; position: relative; pointer-events: none; flex-shrink: 0; }
          .mini-percent { position: absolute; font-size: 16px; font-weight: 900; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #111827; }
          .mini-percent-symbol { font-size: 10px; margin-left: 1px; }
          .detail-label { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; line-height: 1; max-width: 90px; }
          .detail-count { font-size: 20px; font-weight: 900; color: #111827; line-height: 1; }
          
          .chart-center-label { position: absolute; font-size: 11px; font-weight: 800; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
          .status-tag { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; }
          .snackbar-msg { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #00A86B; color: white; padding: 12px 30px; border-radius: 8px; z-index: 1000; }
          
          .clear-filters-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 0 15px;
            height: 38px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: 700;
            font-size: 11px;
            gap: 6px;
            white-space: nowrap;
          }

          .table-header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
            margin-bottom: 20px;
          }

          .btn-new-shipment {
            background: #10B981;
            color: white;
            border: none;
            padding: 0 20px;
            height: 38px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 12px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
          }
          .btn-new-shipment:hover { background: #059669; transform: translateY(-1px); }
        `}
      </style>

      {showSnackbar && <div className="snackbar-msg">¡Envío creado correctamente!</div>}

      <div className="header-simple" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Gestión de Envíos</h1>
      </div>

      <div className="summary-card">
        <div className="summary-chart-container" onClick={() => setFiltrosEstados([])}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getChartData('TOTAL')}
                innerRadius={60}
                outerRadius={85}
                stroke="none"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                onMouseEnter={(data, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(data, index, e) => {
                  e.stopPropagation();
                  toggleFiltro(data.name);
                }}
              >
                {getChartData('TOTAL').map((entry, index) => {
                  const isActive = filtrosEstados.includes(entry.name);
                  const isHovered = activeIndex === index;
                  const targetOuterRadius = isActive || isHovered ? 92 : 85;
                  const targetFilter = filtrosEstados.length > 0 && !isActive ? 'opacity(0.3)' : 'none';

                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill} 
                      style={{ transition: 'all 0.3s ease', filter: targetFilter }}
                      outerRadius={targetOuterRadius}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-center-label" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>TOTAL</div>
            <div style={{ fontSize: '28px', color: '#111827', fontWeight: '900' }}>{envios.length}</div>
          </div>
        </div>
        
        <div className="summary-details">
          {ORDEN_METRICAS.filter(k => k !== 'TOTAL').map(key => {
            const count = contar(key);
            const color = ESTADO_COLORS[key];
            const percent = getPercent(count);
            const active = filtrosEstados.includes(key);
            return (
              <div 
                key={key} 
                className={`detail-item ${active ? 'active' : ''}`}
                style={{ color: color }}
                onClick={(e) => { e.stopPropagation(); toggleFiltro(key); }}
              >
                <div className="detail-info-block">
                  <span className="detail-label" style={{ color: color }}>{key.replace(/_/g, ' ')}</span>
                  <span className="detail-count">{count}</span>
                </div>
                <div className="mini-chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData(key, color)}
                        innerRadius={22}
                        outerRadius={28}
                        stroke="none"
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        isAnimationActive={false}
                      >
                        {getChartData(key, color).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="mini-percent">
                    {percent}<span className="mini-percent-symbol">%</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="table-header-actions">
          <input
            className="search-input"
            style={{ margin: 0, flexGrow: 1 }}
            placeholder="Buscar por Tracking ID, Remitente o Destinatario..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          
          {filtrosEstados.length > 0 && (
            <button className="clear-filters-btn" onClick={() => setFiltrosEstados([])}>
              ✕ BORRAR FILTROS
            </button>
          )}

          {(user?.role === 'SUPERVISOR' || user?.role === 'ADMINISTRADOR') && (
            <button className="btn-new-shipment" onClick={() => navigate('/envios/nuevo')}>
              + NUEVO ENVÍO
            </button>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Destinatario</th>
              <th>Estado</th>
              <th onClick={() => handleSort('fechaCreacion')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                F. Creación {sortConfig.key === 'fechaCreacion' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('fechaEstimada')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                F. Envío {sortConfig.key === 'fechaEstimada' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th>Responsable</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradosYOrdenados.map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight: 'bold', color: '#2563EB' }}>{e.id}</td>
                <td>{e.destinatario}</td>
                <td>
                  <span className="status-tag" style={{ backgroundColor: `${ESTADO_COLORS[e.estado]}15`, color: ESTADO_COLORS[e.estado] }}>
                    {e.estado?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ fontSize: '13px' }}>{e.fechaCreacion}</td>
                <td style={{ fontSize: '13px' }}>{e.fechaEstimada || '-'}</td>
                <td>{e.usuarioResponsable}</td>
                <td>
                  <button className="btn-sm" onClick={() => navigate(`/detalle/${e.id}`)}>VER DETALLE</button>
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