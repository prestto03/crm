// import { useState } from 'react';
// import Login from './components/Login';
import Calendario from './components/Calendario';
import "./index.css";

function App() {
  // const [user, setUser] = useState(null);

  // const handleLogin = (loggedInUser) => {
  //   setUser(loggedInUser);
  // };

  return (
    <div>
      <Calendario />
      {/* {user ? (
        <div>
          <h2>Bienvenido, {user.name}!</h2>
          <button onClick={() => setUser(null)}>Cerrar Sesión</button>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )} */}
    </div>
  );
}

export default App;
