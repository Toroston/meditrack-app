import React from 'react';

const ModalHistorial = ({ historial, alCerrar }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Operaciones</h2>
          <button onClick={alCerrar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#F9FAFB', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '12px', fontSize: '12px', color: '#ffffff', textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB' }}>Evento</th>
                <th style={{ padding: '12px', fontSize: '12px', color: '#ffffff', textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB' }}>Detalle</th>
                <th style={{ padding: '12px', fontSize: '12px', color: '#ffffff', textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB' }}>Fecha / Hora</th>
                <th style={{ padding: '12px', fontSize: '12px', color: '#ffffff', textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB' }}>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {historial.length > 0 ? (
                historial.slice().reverse().map((item, index) => {
                  const esEdicion = item.tipo === 'EDICION' || !item.estado;
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: '700',
                          backgroundColor: esEdicion ? '#DBEAFE' : '#D1FAE5',
                          color: esEdicion ? '#1E40AF' : '#065F46'
                        }}>
                          {esEdicion ? 'EDICIÓN' : 'ESTADO'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>
                        {esEdicion ? (
                          <span style={{ fontStyle: 'italic', color: '#6B7280' }}>Campos del envío modificados</span>
                        ) : (
                          <strong>{item.estado.replace(/_/g, ' ')}</strong>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>
                        {item.fecha} <span style={{ color: '#9CA3AF', marginLeft: '5px' }}>{item.hora}</span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
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