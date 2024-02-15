import { useState } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { SnackbarProvider, useSnackbar } from 'notistack';
import users from '../fake_db/index';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
      // Aquí iría tu lógica de autenticación
      enqueueSnackbar('Inicio de sesión exitoso', { variant: 'success' });
    } else {
      enqueueSnackbar('Nombre de usuario o contraseña incorrectos', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop:'80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', alignContent: 'center' }}>
        <Typography component="h1" variant="h5">
          Iniciar Sesión
        </Typography>
        <form onSubmit={handleLogin} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nombre de usuario"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Iniciar Sesión
          </Button>
        </form>
      </Box>
    </Container>
  );
}

function LoginWithSnackbar() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Login />
    </SnackbarProvider>
  );
}

export default LoginWithSnackbar;
