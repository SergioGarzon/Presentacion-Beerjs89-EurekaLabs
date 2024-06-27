import { Client } from "@heroiclabs/nakama-js";
import React, { useState, useEffect } from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

const useSSL = false;
const defaultKey = "defaultkey";
const serverAddress = "127.0.0.1"; 
const port = "7350"; 
const client = new Client(defaultKey, serverAddress, port, useSSL);

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [session, setSession] = useState(null); 
  const [savedData, setSavedData] = useState(null); 
  const [loadingData, setLoadingData] = useState(true); 

  const authenticateWithEmail = async (email, password) => {
    try {
      const session = await client.authenticateEmail(email, password);
      setSession(session); 
      alert("Autenticación exitosa: " + JSON.stringify(session));
      await leerInformacionPersona(session); 
    } catch (error) {
      alert("Error en la autenticación: " + error);
    }
  }

  const almacenarInformacionPersona = async () => {
    try {
      if (!session) {
        alert("Debe iniciar sesión primero.");
        return;
      }

      const object_ids = await client.writeStorageObjects(session, [
        {
          collection: "personas", 
          key: `${session.user_id}`, 
          value: { nombre, apellido } 
        }
      ]);

      console.log("Información almacenada en Nakama:", object_ids);
      alert("Información de persona almacenada correctamente en Nakama.");

      setSavedData({ nombre, apellido });
    } catch (error) {
      alert("Error al almacenar la información en Nakama: " + error);
    }
  }

  const leerInformacionPersona = async (session) => {
    try {
      const objects = await client.readStorageObjects(session, {
        "object_ids": [{
          "collection": "personas", 
          "key": `${session.user_id}`, 
          "user_id": session.user_id
        }]
      });

      console.log("Datos leídos desde Nakama:", objects);
      if (objects && objects.objects.length > 0) {
        const data = objects.objects[0].value;
        setSavedData(data);
      }
      setLoadingData(false); 
    } catch (error) {
      alert("Error al leer la información desde Nakama: " + error);
      setLoadingData(false); 
    }
  }

  useEffect(() => {
    const checkPersonaData = async () => {
      if (session) {
        await leerInformacionPersona(session);
      }
    }
    checkPersonaData();
  }, [session]); 

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    await authenticateWithEmail(email, password);

    setEmail("");
    setPassword("");
  }

  const handleSubmitInfoPersona = (e) => {
    e.preventDefault();
    almacenarInformacionPersona();
  }

  const handleLogout = () => {
    setSession(null); 
    setSavedData(null); 
    setLoadingData(true); 
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <header className="App-header">
            {session && (
              <div className="card mb-4">
                <div className="card-body">
                  <h2 className="card-title">Datos de Sesión</h2>
                  <p><strong>Token:</strong> {session.token}</p>
                  <p><strong>User ID:</strong> {session.user_id}</p>
                  <p><strong>Username:</strong> {session.username}</p>
                  <button onClick={handleLogout} className="btn btn-danger">Cerrar Sesión</button>
                </div>
              </div>
            )}

            {!savedData && !loadingData && (
              <div className="card mb-4">
                <div className="card-body">
                  <form onSubmit={handleSubmitInfoPersona}>
                    <h2 className="card-title">Almacenar Información de Persona en Nakama</h2>
                    <div className="mb-3">
                      <label className="form-label">Nombre:</label>
                      <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Apellido:</label>
                      <input type="text" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Guardar Información de Persona</button>
                  </form>
                </div>
              </div>
            )}

            {savedData && (
              <div className="card mb-4">
                <div className="card-body">
                  <h2 className="card-title">Datos Almacenados en Nakama</h2>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>Nombre</th>
                        <td>{savedData.nombre}</td>
                      </tr>
                      <tr>
                        <th>Apellido</th>
                        <td>{savedData.apellido}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!session && (
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmitLogin}>
                    <div className="mb-3">
                      <label className="form-label">Email:</label>
                      <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Contraseña:</label>
                      <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Iniciar sesión</button>
                  </form>
                </div>
              </div>
            )}
          </header>
        </div>
      </div>
    </div>
  );
}

export default App;
