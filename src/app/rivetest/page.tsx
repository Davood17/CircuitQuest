'use client';

import { useRive } from '@rive-app/react-canvas';

export default function RiveTestPage() {
  const { rive, RiveComponent } = useRive({
    src: '/rive/vehicles.riv',
    stateMachine: 'bumpy',
    autoplay: true,
    onLoad: () => console.log('RIVE_TEST_LOADED'),
  });

  return (
    <main
      dir="ltr"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: '#FDF8EF',
      }}
    >
      <h1 style={{ fontSize: 24 }}>Rive runtime integration test</h1>
      <div style={{ width: 480, height: 300 }}>
        <RiveComponent style={{ width: '100%', height: '100%' }} />
      </div>
      <p>{rive ? 'rive instance ready' : 'loading…'}</p>
    </main>
  );
}
