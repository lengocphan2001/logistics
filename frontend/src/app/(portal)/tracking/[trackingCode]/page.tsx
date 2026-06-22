export default function TrackingPage({ params }: { params: { trackingCode: string } }) {
  return <div>Tracking: {params.trackingCode}</div>;
}