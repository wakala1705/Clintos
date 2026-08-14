import AtencionEnfermeria from '@/Components/GestionEnfermeria/AtencionEnfermeria/AtencionEnfermeria';

export default async function AtencionEnfermeriaPage({ params }) {
  const { id } = await params;
  return <AtencionEnfermeria id={id} />;
}
