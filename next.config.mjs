/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Cirugía pasó a ser su propio módulo (/cirugia/...): las URLs anteriores
  // (marcadores, enlaces guardados) siguen funcionando.
  async redirects() {
    return [
      { source: '/programacion-sala-cirugias', destination: '/cirugia/programacion', permanent: false },
      { source: '/programacion-sala-cirugias/revision', destination: '/cirugia/programacion/revision', permanent: false },
      // El tablero pasó a ser un modal del Panel general.
      { source: '/programacion-sala-cirugias/tablero', destination: '/cirugia', permanent: false },
      { source: '/cirugia/tablero', destination: '/cirugia', permanent: false },
      { source: '/programacion-sala-cirugias/canastas/:path*', destination: '/cirugia/canastas/:path*', permanent: false },
      { source: '/historial-quirurgico/:id', destination: '/cirugia/historial-quirurgico/:id', permanent: false },
    ];
  },
};

export default nextConfig;
