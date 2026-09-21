import AtencionPaciente from '@/Components/HistoriaClinica/AtencionPaciente/AtencionPaciente';

export default async function AtencionHospitalizadoPage({ params }) {
  const { id } = await params;
  return <AtencionPaciente id={id} variante="hospitalizacion" />;
}
