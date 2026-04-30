import React from 'react';

const StatusLine = ({ estadoActual, historial = [] }) => {
  const caminoBase = ['PENDIENTE', 'ASIGNADO', 'EN_PREPARACION', 'EN_TRANSITO'];

  const obtenerPasos = () => {
    if (estadoActual === 'CANCELADO') {
      const saltoDirecto = !historial.some(h => 
        h.tipo === 'CAMBIO_ESTADO' && 
        (h.detalle.includes('ASIGNADO') || h.detalle.includes('PREPARACION') || h.detalle.includes('TRANSITO'))
      );

      if (saltoDirecto) {
        return ['PENDIENTE', 'CANCELADO'];
      }
    }

    const registroIncidente = historial.find(h => 
      h.tipo === 'CAMBIO_ESTADO' && h.detalle.includes('INCIDENTE_REPORTADO')
    );

    if (registroIncidente || estadoActual === 'INCIDENTE_REPORTADO' || estadoActual === 'CANCELADO') {
      const detalle = registroIncidente?.detalle || "";
      const pasoPrevio = detalle.split(' → ')[0];
      
      if (pasoPrevio === 'EN_PUNTO_DE_ENTREGA') {
        return [...caminoBase, 'EN_PUNTO_DE_ENTREGA', 'INCIDENTE_REPORTADO', 'CANCELADO'];
      } else {
        return [...caminoBase, 'INCIDENTE_REPORTADO', 'CANCELADO'];
      }
    }

    return [...caminoBase, 'EN_PUNTO_DE_ENTREGA', 'ENTREGADO'];
  };

  const pasos = obtenerPasos();
  const indiceActual = pasos.indexOf(estadoActual);

  const getStepConfig = (step, index) => {
    const isPassed = index <= indiceActual && indiceActual !== -1;
    if (!isPassed) return { color: '#E5E7EB', icon: index + 1 };
    if (step === 'INCIDENTE_REPORTADO') return { color: '#F59E0B', icon: '!' };
    if (step === 'CANCELADO') return { color: '#EF4444', icon: '✕' };
    return { color: '#10B981', icon: '✓' };
  };

  const getLineColor = (index) => {
    if (indiceActual === -1 || index >= indiceActual) return '#E5E7EB';
    const nextStep = pasos[index + 1];
    if (nextStep === 'INCIDENTE_REPORTADO') return '#F59E0B';
    if (nextStep === 'CANCELADO') return '#EF4444';
    return '#10B981';
  };

  return (
    <div className="card" style={{ marginBottom: '20px', padding: '40px 0', overflowX: 'auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: pasos.length <= 2 ? 'center' : 'space-between', 
        position: 'relative', 
        alignItems: 'flex-start',
        minWidth: pasos.length <= 2 ? 'auto' : '1000px',
        gap: pasos.length <= 2 ? '150px' : '0',
        margin: '0 auto',
        padding: '0 60px'
      }}>
        {pasos.map((step, index) => {
          const config = getStepConfig(step, index);
          const isPassed = index <= indiceActual && indiceActual !== -1;
          
          return (
            <div key={`${step}-${index}`} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              zIndex: 3, 
              flex: pasos.length <= 2 ? 'none' : 1, 
              position: 'relative' 
            }}>
              {index < pasos.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '50%',
                  width: pasos.length <= 2 ? '188px' : '100%',
                  height: '3px',
                  backgroundColor: getLineColor(index),
                  zIndex: 1,
                  transition: 'background-color 0.3s'
                }} />
              )}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isPassed ? config.color : 'white',
                border: `2px solid ${isPassed ? config.color : '#D1D5DB'}`,
                color: isPassed ? 'white' : '#9CA3AF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                marginBottom: '12px',
                transition: 'all 0.3s',
                zIndex: 2, 
                position: 'relative'
              }}>
                {config.icon}
              </div>
              <span style={{ 
                fontSize: '10px', 
                textAlign: 'center',
                fontWeight: index === indiceActual ? '800' : '500',
                color: isPassed ? config.color : '#9CA3AF',
                textTransform: 'uppercase',
                maxWidth: '90px'
              }}>
                {step.replace(/_/g, ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusLine;