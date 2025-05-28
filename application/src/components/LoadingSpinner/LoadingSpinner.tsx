'use client';
import { Box, CircularProgress, Fade } from '@mui/material';
import { useNavigating } from 'hooks/navigation';

/**
 * Spinner de carga a pantalla completa.
 * Usado como overlay con fondo semitransparente.
 */
const LoadingSpinner = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
    }}
  >
    <CircularProgress color="primary" size={48} />
  </Box>
);

/**
 * Wrapper que muestra un spinner mientras hay navegación activa.
 * Usa Fade para aplicar animación suave durante la carga.
 *
 * @param children - Contenido de la aplicación que se renderiza mientras no hay carga.
 */
const WithLoadingSpinner = ({ children }: { children: React.ReactNode }) => {
  const { navigating } = useNavigating();

  const loading = navigating;

  return (
    <>
      <Fade in={loading} unmountOnExit timeout={250}>
        <div>
          <LoadingSpinner />
        </div>
      </Fade>
      {children}
    </>
  );
};

export default WithLoadingSpinner;
