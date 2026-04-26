import React from 'react';

const ESTADOS_BASE = [
  'PENDIENTE',
  'ASIGNADO',
  'EN_PREPARACION',
  'EN_TRANSITO',
  'EN_PUNTO_DE_ENTREGA',
  'INCIDENTE_REPORTADO'
];

const StatusLine = ({ estadoActual }) => {
  const ultimoEstado = estadoActual === 'CANCELADO' ? 'CANCELADO' : 'ENTREGADO';
  const pasos = [...ESTADOS_BASE, ultimoEstado];
  const indiceActual = pasos.indexOf(estadoActual);

  const getStepConfig = (step, index) => {
    if (index > indiceActual) return { color: '#E5E7EB', icon: index + 1 };
    
    if (step === 'INCIDENTE_REPORTADO') {
      if (estadoActual === 'ENTREGADO') {
        return { color: '#2563EB', icon: '✓' };
      }
      if (estadoActual === 'INCIDENTE_REPORTADO' || (indiceActual > pasos.indexOf('INCIDENTE_REPORTADO') && estadoActual === 'CANCELADO')) {
        return { color: '#F59E0B', icon: '!' };
      }
      return { color: '#2563EB', icon: index + 1 };
    }

    if (step === 'CANCELADO') return { color: '#EF4444', icon: '✕' };
    return { color: '#10B981', icon: '✓' };
  };

  const getLineColor = (index) => {
    if (index >= indiceActual) return '#E5E7EB';
    
    const currentStep = pasos[index];
    const nextStep = pasos[index + 1];

    if (nextStep === 'INCIDENTE_REPORTADO') {
      return estadoActual === 'ENTREGADO' ? '#2563EB' : '#F59E0B';
    }

    if (currentStep === 'INCIDENTE_REPORTADO' && estadoActual === 'ENTREGADO') {
      return '#2563EB';
    }

    if (nextStep === 'CANCELADO') return '#EF4444';
    
    return '#10B981';
  };

  return (
    <div className="card" style={{ marginBottom: '20px', padding: '40px 0', overflowX: 'auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        position: 'relative', 
        alignItems: 'flex-start',
        minWidth: '1000px',
        margin: '0 auto',
        padding: '0 60px'
      }}>
        {pasos.map((step, index) => {
          const config = getStepConfig(step, index);
          const isPassed = index <= indiceActual;
          
          return (
            <div key={step} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              zIndex: 3, 
              flex: 1, 
              position: 'relative' 
            }}>
              
              {index < pasos.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '50%',
                  width: '100%',
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
                maxWidth: '90px',
                position: 'relative',
                zIndex: 2
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