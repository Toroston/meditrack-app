import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEnvioById, updateEnvio } from '../services/api';

function EditarEnvio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEnvioById(id).then(setForm).catch(() => setError('Error al cargar datos.'));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = async () => {
    try {
      await updateEnvio(id, form);
      navigate(`/envio/${id}`);
    } catch (err) {
      setError(err.message || 'Error al actualizar envío.');
    }
  };

  if (!form) return <div className="container">Cargando...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Editar envío</h1>
      </div>
      <div className="card">
        {error && (
          <div style={{ 
            color: '#dc3545', 
            backgroundColor: '#f8d7da', 
            border: '1px solid #f5c6cb', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            fontWeight: 'bold' 
          }}>
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group form-full">
            <label>Tracking Id</label>
            <input value={form.id} disabled className="input-locked" />
          </div>
          <div className="form-group">
            <label>Remitente *</label>
            <input name="remitente" value={form.remitente || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Destinatario *</label>
            <input name="destinatario" value={form.destinatario || ''} onChange={handleChange} />
          </div>
          <div className="form-group form-full">
            <label>Descripción de la carga</label>
            <input name="descripcionCarga" value={form.descripcionCarga || ''} onChange={handleChange} />
          </div>
          <div className="form-group form-full">
            <label>Dirección de entrega</label>
            <input name="direccionEntrega" value={form.direccionEntrega || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Origen</label>
            <input name="origen" value={form.origen || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Destino</label>
            <input name="destino" value={form.destino || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Fecha estimada de entrega</label>
            <input type="date" name="fechaEstimada" value={form.fechaEstimada || ''} onChange={handleChange} />
          </div>
          <div className="form-group form-full">
            <label>Observaciones</label>
            <textarea name="observaciones" value={form.observaciones || ''} onChange={handleChange} rows="3" />
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px', 
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/envio/${id}`)}>CANCELAR</button>
          <button className="btn btn-primary" onClick={handleGuardar} style={{ backgroundColor: '#10B981', border: 'none' }}>GUARDAR</button>
        </div>
      </div>
    </div>
  );
}

export default EditarEnvio;