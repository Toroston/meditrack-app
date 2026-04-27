import React from 'react';

const ModalHistorial = ({ historial, alCerrar }) => {
  const getBadgeColor = (tipo) => {
    switch (tipo) {
      case 'CREACION':
        return { bg: '#F3E8FF', text: '#6B21A8' }; 
      case 'EDICION':
        return { bg: '#DBEAFE', text: '#1E40AF' }; 
      case 'CAMBIO_ESTADO':
        return { bg: '#D1FAE5', text: '#065F46' }; 
      case 'CANCELACION':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '850px', width: '95%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Historial de Operaciones</h2>
          <button onClick={alCerrar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>

        <div style={{ maxHeight: '450px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#10B981', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '12px', fontSize: '12px', color: '#ffffff', textTransform: 'uppercase' }}>Evento</th>
                <th style={{ padding: '12px', fontSize: '12px', color: '#ffffff', textTransform: 'uppercase' }}>Detalle del Cambio</th>
                <th style={{ padding: '12px', fontSize: '12px', color: '#ffffff', textTransform: 'uppercase' }}>Fecha / Hora</th>
                <th style={{ padding: '12px', fontSize: '12px', color: '#ffffff', textTransform: 'uppercase' }}>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {historial && historial.length > 0 ? (
                historial.slice().reverse().map((item, index) => {
                  const colors = getBadgeColor(item.tipo);
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: '700',
                          backgroundColor: colors.bg,
                          color: colors.text,
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.tipo?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>
                        {item.detalle}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>
                        {item.fecha} <span style={{ color: '#9CA3AF', marginLeft: '5px' }}>{item.hora}</span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                        {item.usuario || 'Sistema'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>No hay registros en el historial</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={alCerrar}>Cerrar historial</button>
        </div>
      </div>
    </div>
  );
};

export default ModalHistorial;