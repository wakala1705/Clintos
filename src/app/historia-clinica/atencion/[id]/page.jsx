import AtencionPaciente from '@/Components/HistoriaClinica/AtencionPaciente/AtencionPaciente';

export default async function AtencionPacientePage({ params }) {
  const { id } = await params;
  return <AtencionPaciente id={id} />;
}
