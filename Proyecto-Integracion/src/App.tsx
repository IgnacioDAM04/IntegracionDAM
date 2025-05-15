import React, { useState, useEffect } from 'react';
import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonContent,
  IonPage,
} from '@ionic/react';
import './App.css';

const App: React.FC = () => {
  // Estados para login y registro
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [usuarioLogueado, setUsuarioLogueado] = useState<string | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  // Estados para publicaciones
  const [mostrarFormularioPublicacion, setMostrarFormularioPublicacion] = useState(false);
  const [empleo, setEmpleo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idEmpresa, setIdEmpresa] = useState<number | null>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [publicando, setPublicando] = useState(false);

  // Estados para inscripciones
  const [mostrarInscripciones, setMostrarInscripciones] = useState(false);
  const [inscripciones, setInscripciones] = useState<any[]>([]);

  // Estados para publicaciones de empresa
  const [mostrarPublicacionesEmpresa, setMostrarPublicacionesEmpresa] = useState(false);
  const [publicacionesEmpresa, setPublicacionesEmpresa] = useState<any[]>([]);

  // Estados para mensajes y conversaciones
  const [mostrarMensajes, setMostrarMensajes] = useState(false);
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [idConversacionActual, setIdConversacionActual] = useState<number | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mostrarFormularioMensaje, setMostrarFormularioMensaje] = useState(false);
  const [empresaDestino, setEmpresaDestino] = useState<{ id: number; nombre: string } | null>(null);
  const [mensajeParaEmpresa, setMensajeParaEmpresa] = useState('');


  // Carga publicaciones e inscripciones al iniciar
  useEffect(() => {
    cargarPublicaciones();
    cargarInscripciones();
  }, []);

  // Carga inscripciones si cambia el ID de usuario
  useEffect(() => {
    if (idUsuario && tipoUsuario === 'usuario') {
      cargarInscripciones();
    }
  }, [idUsuario]);

  // Carga inscripciones si cambia el ID de usuario
  useEffect(() => {
    if (mostrarPublicacionesEmpresa && idEmpresa) {
      cargarPublicacionesEmpresa();
    }
  }, [mostrarPublicacionesEmpresa, idEmpresa]);

  // Inicia sesión del usuario
  const manejarLogin = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario: nombre, contrasenia_usuario: contrasenia }),
      });

      const data = await response.json();
      if (data.success) {
        const id = data.id_usuario;

        setUsuarioLogueado(data.nombre_usuario);
        setTipoUsuario(data.tipo_usuario);
        setIdUsuario(id);
        setIdEmpresa(id);
        setMostrarLogin(false);
        setNombre('');
        setContrasenia('');
        setModoRegistro(false);

        // Esperamos a que idUsuario se actualice y luego cargamos
        if (data.tipo_usuario === 'usuario') {
          cargarInscripciones(id);
        } else {
          setInscripciones([]);
        }
      } else {
        alert('Credenciales incorrectas');
      }
    } catch (error) {
      alert('Error en el servidor');
      console.error(error);
    }
  };


  // Registra un nuevo usuario
  const manejarRegistro = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario: nombre, contrasenia_usuario: contrasenia, tipo_usuario: tipoUsuario }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Registro exitoso, ya puedes iniciar sesión');
        setModoRegistro(false);
      } else {
        alert(data.message || 'Error al registrarse');
      }
    } catch (error) {
      alert('Error en el servidor');
      console.error(error);
    }
  };

  // Cierra sesión del usuario
  const manejarLogout = () => {
    setUsuarioLogueado(null);
    setTipoUsuario(null);
    setIdUsuario(null);
    setNombre('');
    setContrasenia('');
    setMostrarLogin(false);
    setModoRegistro(false);
    setInscripciones([]);
  };

  // Publica una nueva oferta de empleo
  const manejarPublicacion = async () => {
    if (publicando) return;
    setPublicando(true);
    try {
      const response = await fetch('http://localhost:3002/api/publicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_empresa: idEmpresa, empleo, descripcion }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Publicación añadida correctamente');
        setMostrarFormularioPublicacion(false);
        setEmpleo('');
        setDescripcion('');
        cargarPublicaciones();
      } else {
        alert('Error al publicar');
      }
    } catch (error) {
      alert('Error en el servidor');
      console.error(error);
    } finally {
      setPublicando(false);
    }
  };

  // Carga todas las publicaciones disponibles
  const cargarPublicaciones = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/publicaciones');
      const data = await response.json();

      if (data.success) {
        setPublicaciones(data.publicaciones);
      } else {
        alert('Error al cargar publicaciones');
      }
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    }
  };

  // Inscribe al usuario en una publicación
  const manejarInscripcion = async (idPublicacion: number) => {
    if (!idUsuario) {
      alert('Debes iniciar sesión como usuario');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/inscribirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: idUsuario, id_publicacion: idPublicacion }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Inscripción realizada con éxito');
        cargarInscripciones(); // <-- Esto actualiza la lista y refresca los botones
      } else {
        alert(data.message || 'Error al inscribirse');
      }
    } catch (error) {
      console.error('Error al inscribirse:', error);
      alert('Error al inscribirse');
    }
  };

  // Carga inscripciones del usuario
  const cargarInscripciones = async (userId?: number) => {
    const finalId = userId || idUsuario;
    if (!finalId) return;

    try {
      const response = await fetch(`http://localhost:3002/api/inscripciones/${finalId}`);
      const data = await response.json();

      if (data.success) {
        setInscripciones(data.inscripciones);
      } else {
        alert('Error al cargar inscripciones');
      }
    } catch (error) {
      console.error('Error al cargar inscripciones:', error);
    }
  };

  // Elimina una inscripción del usuario
  const manejarDesinscripcion = async (idPublicacion: number) => {
    if (!idUsuario) return;

    try {
      const response = await fetch('http://localhost:3002/api/inscripciones', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: idUsuario, id_publicacion: idPublicacion }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Te has desinscrito correctamente');
        cargarInscripciones();
      } else {
        alert(data.message || 'Error al desinscribirse');
      }
    } catch (error) {
      console.error('Error al desinscribirse:', error);
      alert('Error al desinscribirse');
    }
  };

  // Verifica si el usuario ya está inscrito en una publicación
  const estaInscrito = (idPublicacion: number) => {
    return inscripciones.some((inscripcion) => inscripcion.id_publicacion === idPublicacion);
  };

  // Carga publicaciones hechas por la empresa
  const cargarPublicacionesEmpresa = async () => {
    if (!idEmpresa) return;

    try {
      const response = await fetch(`http://localhost:3002/api/publicaciones/empresa/${idEmpresa}`);
      const data = await response.json();

      if (data.success) {
        setPublicacionesEmpresa(data.publicaciones);
      } else {
        alert('Error al cargar tus publicaciones');
      }
    } catch (error) {
      console.error('Error al cargar publicaciones de empresa:', error);
    }
  };

  // Elimina una publicación de la empresa
  const manejarEliminacionPublicacion = async (idPublicacion: number) => {
    try {
      const response = await fetch('http://localhost:3002/api/publicaciones', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_publicacion: idPublicacion }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Publicación e inscripciones eliminadas correctamente');
        cargarPublicaciones(); // o actualizar el estado local
      } else {
        alert(data.message || 'Error al eliminar publicación');
      }
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      alert('Error al eliminar publicación');
    }
  };

  // Carga las conversaciones del usuario o empresa
  const cargarConversaciones = async () => {
    if (!idUsuario && !idEmpresa) return;

    const id = tipoUsuario === 'usuario' ? idUsuario : idEmpresa;
    try {
      const response = await fetch(`http://localhost:3002/api/mensajes/conversaciones?tipo_usuario=${tipoUsuario}&id_usuario=${id}`);
      const data = await response.json();

      setConversaciones(data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    }
  };

  // Carga mensajes de una conversación específica
  const cargarMensajes = async (idConversacion: number) => {
    if (!idConversacion) {
      console.error('ID de conversación no válido:', idConversacion);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3002/api/mensajes/${idConversacion}`);
      const data = await response.json();
      setMensajes(data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  // Envía un mensaje en una conversación
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !idConversacionActual || !usuarioLogueado) return;

    const idRemitente = tipoUsuario === 'usuario' ? idUsuario : idEmpresa;

    try {
      const response = await fetch('http://localhost:3002/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_conversacion: idConversacionActual,
          id_remitente: idRemitente,
          contenido: nuevoMensaje,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNuevoMensaje('');
        cargarMensajes(idConversacionActual);
      } else {
        alert('Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };


  return (
    <IonApp>
      <IonPage>
        {/* Cabecera principal con logo, login y navegación */}
        <IonHeader collapse="condense" className="custom-header" mode="md">
          <IonToolbar className="custom-toolbar">
            <div className="toolbar-content">
              <span className="logo">Linkedos</span>
              <span className="login">
                {/* Mostrar estado de login o botón de iniciar sesión */}
                {usuarioLogueado ? (
                  <>
                    <span className="logout-text" onClick={manejarLogout}>Cerrar Sesión</span>
                    &nbsp;|&nbsp;
                    <span style={{ fontWeight: 'bold' }}>{usuarioLogueado}</span>
                  </>
                ) : (
                  <span onClick={() => setMostrarLogin(!mostrarLogin)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>Iniciar Sesión</span>
                )}

                {/* Botón y ventana emergente para ver inscripciones del usuario */}
                {tipoUsuario === 'usuario' && usuarioLogueado && (
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span
                      className="view-inscriptions"
                      style={{ marginLeft: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => setMostrarInscripciones(!mostrarInscripciones)}
                    >
                      Ver inscripciones
                    </span>
                    {mostrarInscripciones && usuarioLogueado && (
                      <div className="inscripciones-popup">
                        {inscripciones.length === 0 ? (
                          <p>No estás inscrito en ninguna publicación.</p>
                        ) : (
                          <ul>
                            {inscripciones.map((ins) => (
                              <li key={ins.id_publicacion}>
                                <strong>{ins.empleo}</strong><br />
                                {ins.descripcion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </span>
                )}

                {/* Ventana emergente para ver publicaciones de la empresa */}
                {mostrarPublicacionesEmpresa && (
                  <div className="inscripciones-popup">
                    {publicacionesEmpresa.length === 0 ? (
                      <p>No has publicado nada aún.</p>
                    ) : (
                      <ul>
                        {publicacionesEmpresa.map((publi) => (
                          <li key={publi.id_publicacion} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd' }}>
                            <strong>{publi.empleo}</strong><br />
                            <p>{publi.descripcion}</p>
                            <button className='boton-eliminar' onClick={() => manejarEliminacionPublicacion(publi.id_publicacion)}>
                              Eliminar publicación
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Botón para empresas que permite ver sus publicaciones */}
                {tipoUsuario === 'empresa' && usuarioLogueado && (
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span
                      className="view-inscriptions"
                      style={{ marginLeft: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => setMostrarPublicacionesEmpresa(!mostrarPublicacionesEmpresa)}
                    >
                      Ver publicaciones
                    </span>
                  </span>
                )}

                {/* Botón para acceder al sistema de mensajería */}
                {(tipoUsuario === 'usuario' || tipoUsuario === 'empresa') && usuarioLogueado && (
                  <span
                    className="mensajes-link"
                    style={{ marginLeft: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => {
                      setMostrarMensajes(!mostrarMensajes);
                      if (!mostrarMensajes) cargarConversaciones();
                    }}
                  >
                    Mensajes
                  </span>
                )}

                {/* Ventana emergente con lista de conversaciones y mensajes */}
                {mostrarMensajes && (
                  <div className="mensajes-popup">
                    <h3>Conversaciones</h3>
                    <ul>
                      {conversaciones.map((conv) => (
                        <li
                          key={conv.id_conversacion}
                          onClick={() => {
                            setIdConversacionActual(conv.id_conversacion);
                            cargarMensajes(conv.id_conversacion);
                          }}
                        >
                          {conv.nombre_usuario}
                        </li>
                      ))}
                    </ul>

                    {/* Mostrar mensajes si hay conversación seleccionada */}
                    {idConversacionActual && (
                      <div>
                        <div className="mensajes-lista">
                          {mensajes.map((msg) => (
                            <p
                              key={msg.id_mensaje}
                              style={{
                                textAlign: msg.id_remitente === (tipoUsuario === 'usuario' ? idUsuario : idEmpresa) ? 'right' : 'left',
                              }}
                            >
                              <strong>{msg.nombre_remitente}</strong>: {msg.contenido}
                            </p>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Escribe un mensaje..."
                          value={nuevoMensaje}
                          onChange={(e) => setNuevoMensaje(e.target.value)}
                        />
                        <button onClick={enviarMensaje}>Enviar</button>
                      </div>
                    )}
                  </div>
                )}
              </span>
            </div>
          </IonToolbar>
        </IonHeader>

        {/* Otra visualización de los mensajes (probablemente se puede unificar con la anterior) */}
        {mostrarMensajes && (
          <div className="mensajes-popup">
            <h3>Conversaciones</h3>
            <ul>
              {conversaciones.map((conv) => (
                <li
                  key={conv.id_conversacion}
                  onClick={() => {
                    setIdConversacionActual(conv.id_conversacion);
                    cargarMensajes(conv.id_conversacion);
                  }}
                  style={{ cursor: 'pointer', marginBottom: '5px', fontWeight: conv.id_conversacion === idConversacionActual ? 'bold' : 'normal' }}
                >
                  {conv.nombre_otro_usuario}
                </li>
              ))}
            </ul>

            {/* Mostrar mensajes y entrada de texto */}
            {idConversacionActual && (
              <div>
                <div className="mensajes-lista" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                  {mensajes.map((msg) => (
                    <p
                      key={msg.id_mensaje}
                      style={{ textAlign: msg.id_remitente === (tipoUsuario === 'usuario' ? idUsuario : idEmpresa) ? 'right' : 'left' }}
                    >
                      <strong>{msg.nombre_remitente}</strong>: {msg.contenido}
                    </p>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    style={{ flex: 1, padding: '8px' }}
                  />
                  <button onClick={enviarMensaje} style={{ padding: '8px 12px' }}>Enviar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ventana de login y registro */}
        {mostrarLogin && !usuarioLogueado && (
          <div className="login-popup">
            <input type="text" placeholder="Usuario" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input type="password" placeholder="Contraseña" value={contrasenia} onChange={(e) => setContrasenia(e.target.value)} />
            {modoRegistro && (
              <select value={tipoUsuario || ''} onChange={(e) => setTipoUsuario(e.target.value)}>
                <option value="">Selecciona tipo de usuario</option>
                <option value="usuario">Usuario</option>
                <option value="empresa">Empresa</option>
              </select>
            )}
            <button onClick={modoRegistro ? manejarRegistro : manejarLogin}>
              {modoRegistro ? 'Registrarse' : 'Entrar'}
            </button>
            <p onClick={() => setModoRegistro(!modoRegistro)} className="toggle-auth">
              {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </p>
          </div>
        )}

        {/* Contenido principal de publicaciones */}
        <IonContent className="main-content">
          <div className="publications-container">
            {/* Botón para que la empresa cree una publicación */}
            {tipoUsuario === 'empresa' && usuarioLogueado && (
              <p className="add-post" onClick={() => setMostrarFormularioPublicacion(!mostrarFormularioPublicacion)}>+ Añadir publicación</p>
            )}

            {/* Formulario para publicar nueva oferta */}
            {mostrarFormularioPublicacion && (
              <div className="publicacion-popup">
                <input type="text" placeholder="Nombre del empleo" value={empleo} onChange={(e) => setEmpleo(e.target.value)} />
                <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                <button onClick={manejarPublicacion} disabled={publicando}>
                  {publicando ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            )}

            {/* Listado de publicaciones con botones para inscribirse o enviar mensaje */}
            {publicaciones.map((publi) => (
              <div key={publi.id_publicacion} className="post-card">
                <div className="post-content">
                  <div>
                    <h3>{publi.empleo}</h3>
                    <p>{publi.descripcion}</p>
                  </div>
                  {tipoUsuario === 'usuario' && usuarioLogueado && (
                    <div className="button-group">
                      {estaInscrito(publi.id_publicacion) ? (
                        <button className="apply-button" onClick={() => manejarDesinscripcion(publi.id_publicacion)}>
                          Cancelar inscripción
                        </button>
                      ) : (
                        <button className="apply-button" onClick={() => manejarInscripcion(publi.id_publicacion)}>
                          Inscribirse
                        </button>
                      )}
                      <button
                        className="message-button"
                        onClick={() => {
                          setEmpresaDestino({ id: publi.id_empresa, nombre: publi.nombre_empresa });
                          setMostrarFormularioMensaje(true);
                        }}
                      >
                        Mensaje
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Formulario para enviar mensaje a empresa desde publicación */}
            {mostrarFormularioMensaje && empresaDestino && (
              <div className="formulario-popup">
                <h4>Enviar mensaje a {empresaDestino.nombre}</h4>
                <textarea
                  placeholder="Escribe tu mensaje..."
                  value={mensajeParaEmpresa}
                  onChange={(e) => setMensajeParaEmpresa(e.target.value)}
                  style={{ width: '100%', height: '80px' }}
                />
                <br />
                <button onClick={async () => {
                  const res = await fetch('http://localhost:3002/api/mensajes/enviar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id_usuario: idUsuario,
                      id_empresa: empresaDestino.id,
                      contenido: mensajeParaEmpresa,
                      emisor: 'usuario'
                    })
                  });
                  const data = await res.json();
                  if (data.mensaje) {
                    alert('Mensaje enviado');
                    setMostrarFormularioMensaje(false);
                    setMensajeParaEmpresa('');
                  } else {
                    alert('Error al enviar mensaje');
                  }
                }}>
                  Enviar
                </button>
                <button onClick={() => setMostrarFormularioMensaje(false)} style={{ marginLeft: '10px' }}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default App;
