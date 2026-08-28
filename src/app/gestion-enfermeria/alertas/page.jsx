import AlertasEnfermeria from '@/Components/GestionEnfermeria/AlertasEnfermeria/AlertasEnfermeria';

// Server Component (Next 16: `searchParams` llega como Promise, ver
// node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
// "Rendering with search params") — lee `?tab=` una sola vez para sembrar la
// pestaña inicial del Centro de Alertas. Evita useSearchParams/Suspense: los
// 6 ítems del sidebar (GestionEnfermeriaSidebar.jsx) apuntan todos a esta
// misma ruta con un `?tab=` distinto en vez de 6 rutas separadas — una sola
// fuente de verdad (los tabs de AlertListPanel.jsx), sin redundancia entre
// navegación y estado de pestaña.
export default async function AlertasPage({ searchParams }) {
  const { tab } = await searchParams;
  return <AlertasEnfermeria initialTab={tab} />;
}
