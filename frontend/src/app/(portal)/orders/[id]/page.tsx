export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <div>Order {params.id}</div>;
}