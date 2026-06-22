export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  return <div>Vehicle {params.id}</div>;
}