import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function SolicitarAyuda() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [paso, setPaso] = useState(1);
  const [f, setF] = useState({ idCategoria: params.get('categoria') || '', titulo: '', descripcion: '', resumenBreve: '', esUrgente: false });
  const [adjuntoFile, setAdjuntoFile] = useState(null);
  const [adjuntoPreview, setAdjuntoPreview] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/categorias')
      .then(r => setCats(r.data || []))
      .catch(() => setCats([]));
  }, []);

  const hs = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/solicitudes', { ...f, idCategoria: parseInt(f.idCategoria) });
      if (adjuntoFile) {
        const fd = new FormData();
        fd.append('file', adjuntoFile);
        await api.post(`/solicitudes/${r.data.id}/adjunto`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success('Solicitud creada. Un profesional se contactara pronto.');
      navigate('/mis-solicitudes');
    } catch (err) {
      console.error('Error al crear solicitud:', err.response?.status, err.response?.data || err.message);
      toast.error(err.response?.data?.mensaje || `Error (${err.response?.status || 'red'})`);
    }
  };

  const handleAdjuntoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdjuntoFile(file);
      if (file.type.startsWith('image/')) {
        setAdjuntoPreview(URL.createObjectURL(file));
      } else {
        setAdjuntoPreview(null);
      }
    }
  };

  return (
    <div className="page-container page-container--narrow">
      <div style={{ paddingTop: '1rem' }}>
        <div className="card-salud">
          <div className="card-salud__header">
            <h2 className="card-salud__header-title">Pedir Ayuda</h2>
          </div>
          <div className="card-salud__body">
            <form onSubmit={hs}>
              {paso === 1 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1.25rem' }}>Como te sentis?</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {cats.map(c => (
                      <div
                        key={c.id}
                        className={`cat-card ${parseInt(f.idCategoria) === c.id ? 'card-salud--selected' : ''}`}
                        onClick={() => setF({ ...f, idCategoria: c.id })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setF({ ...f, idCategoria: c.id }); }}
                      >
                        <span className="cat-card__icon">{c.icono || '🩺'}</span>
                        <span className="cat-card__name">{c.nombre}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-salud btn-salud--primary mt-md" disabled={!f.idCategoria} onClick={() => setPaso(2)}>Siguiente</button>
                </div>
              )}
              {paso === 2 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1.25rem' }}>Contanos mas</h3>
                  <div className="form-salud__group">
                    <label className="form-salud__label">Titulo</label>
                    <input className="form-salud__input" required value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} placeholder="Ej: Necesito ayuda" />
                  </div>
                  <div className="form-salud__group">
                    <label className="form-salud__label">Descripcion</label>
                    <textarea className="form-salud__input form-salud__textarea" rows="4" required value={f.descripcion} onChange={e => setF({ ...f, descripcion: e.target.value })} placeholder="Contanos que te pasa..."></textarea>
                  </div>
                  <div className="form-salud__group">
                    <label className="form-salud__label">Resumen breve (opcional)</label>
                    <textarea className="form-salud__input form-salud__textarea" rows="2" value={f.resumenBreve} onChange={e => setF({ ...f, resumenBreve: e.target.value })} placeholder="Un resumen corto para el profesional..."></textarea>
                  </div>
                  <div className="form-salud__group">
                    <label className="form-salud__label">Adjuntar archivo (opcional)</label>
                    <input type="file" ref={fileRef} accept="image/*,.pdf" onChange={handleAdjuntoSelect} className="form-salud__input" />
                    {adjuntoPreview && <img src={adjuntoPreview} alt="preview" style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '0.5rem', borderRadius: '8px' }} />}
                    {adjuntoFile && !adjuntoPreview && <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{adjuntoFile.name}</p>}
                  </div>
                  <div className="form-salud__checkbox mb-md">
                    <input type="checkbox" className="form-salud__checkbox-input" id="urg" checked={f.esUrgente} onChange={e => setF({ ...f, esUrgente: e.target.checked })} />
                    <label className="form-salud__checkbox-label" htmlFor="urg">Es urgente — necesito ayuda ahora</label>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn-salud btn-salud--ghost-ink" onClick={() => setPaso(1)}>Atras</button>
                    <button type="button" className="btn-salud btn-salud--primary" onClick={() => setPaso(3)}>Siguiente</button>
                  </div>
                </div>
              )}
              {paso === 3 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1.25rem' }}>Confirmar</h3>
                  <div className="confirm-box mb-md">
                    <div className="confirm-box__row">
                      <span className="confirm-box__label">Categoria:</span>
                      <span className="confirm-box__value">{cats.find(c => c.id === parseInt(f.idCategoria))?.nombre}</span>
                    </div>
                    <div className="confirm-box__row">
                      <span className="confirm-box__label">Titulo:</span>
                      <span className="confirm-box__value">{f.titulo}</span>
                    </div>
                    <div className="confirm-box__row">
                      <span className="confirm-box__label">Descripcion:</span>
                      <span className="confirm-box__value">{f.descripcion}</span>
                    </div>
                    {f.resumenBreve && (
                      <div className="confirm-box__row">
                        <span className="confirm-box__label">Resumen:</span>
                        <span className="confirm-box__value">{f.resumenBreve}</span>
                      </div>
                    )}
                    {adjuntoFile && (
                      <div className="confirm-box__row">
                        <span className="confirm-box__label">Archivo:</span>
                        <span className="confirm-box__value">{adjuntoFile.name}</span>
                      </div>
                    )}
                    <div className="confirm-box__row">
                      <span className="confirm-box__label">Urgente:</span>
                      <span className="confirm-box__value">{f.esUrgente ? 'Si' : 'No'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn-salud btn-salud--ghost-ink" onClick={() => setPaso(2)}>Atras</button>
                    <button type="submit" className="btn-salud btn-salud--success">Enviar solicitud</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
