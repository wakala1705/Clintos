import FichaPaciente from '@/Components/FichaPaciente/FichaPaciente';

export default async function FichaPacientePage({ params }) {
  const { id } = await params;
  return <FichaPaciente id={id} />;
}
