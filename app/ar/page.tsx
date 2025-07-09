import RemoteModelViewer from '../../components/RemoteModelViewer';

export const metadata = { title: 'AR Demo' };

export default function ARDemoPage() {
  const modelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
  const iosUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz';
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">AR Model Demo</h1>
      <RemoteModelViewer src={modelUrl} iosSrc={iosUrl} className="w-full h-80 rounded-lg" />
      <p className="text-sm text-gray-500">This demo loads a remote 3D model only.</p>
    </div>
  );
}
