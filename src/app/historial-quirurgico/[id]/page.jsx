import HistorialQuirurgico from '@/Components/HistorialQuirurgico/HistorialQuirurgico';

export default async function Page({ params }) {
  await params;
  return <HistorialQuirurgico />;
}
