import React from 'react';

const ModalHistorialUsuario = ({ usuario, alCerrar }) => {
    const historial = usuario.historial;
    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>Historial de Operaciones</h2>

                    <button
                        style={closeButtonStyle}
                        onClick={alCerrar}
                    >
                        ×
                    </button>
                </div>

                <div style={tableWrapper}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Campo Modificado</th>
                                <th style={thStyle}>Valor Anterior</th>
                                <th style={thStyle}>Valor Actual</th>
                                <th style={thStyle}>Fecha / Hora</th>
                                <th style={thStyle}>Autor</th>
                            </tr>
                        </thead>

                        <tbody>
                            {historial && historial.length > 0 ? (
                                [...historial]
                                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // más reciente primero
                                    .map((item, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{item.campoModificado}</td>
                                            <td style={tdStyle}>{item.valorAnterior}</td>
                                            <td style={tdStyle}>{item.valorActual}</td>
                                            <td style={tdStyle}>
                                                {new Date(item.fecha).toLocaleString([], {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td style={tdStyle}>{item.autor}</td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        style={{
                                            padding: '20px',
                                            textAlign: 'center',
                                            color: '#9CA3AF',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        No hay registros en el historial
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={footerStyle}>
                    <button
                        style={buttonStyle}
                        onClick={alCerrar}
                    >
                        Cerrar historial
                    </button>
                </div>
            </div>
        </div>
    )
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
};

const modalStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    width: '900px',
    maxWidth: '95%',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    animation: 'fadeIn 0.2s ease'
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
};

const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827'
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6B7280'
};

const tableWrapper = {
    border: '1px solid #E5E7EB',
    borderRadius: '14px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    maxHeight: '600px',
    overflowY: 'auto'
};

const thStyle = {
    backgroundColor: '#059669',
    color: '#fff',
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    position: 'sticky',
    top: 0,
    zIndex: 2
};

const tdStyle = {
    padding: '18px 16px',
    borderBottom: '1px solid #F3F4F6',
    fontSize: '15px',
    color: '#374151'
};

const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '24px'
};

const buttonStyle = {
    backgroundColor: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s'
};

export default ModalHistorialUsuario;