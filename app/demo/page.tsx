import React from 'react';
import dynamic from 'next/dynamic';

const CharacterDemo = dynamic(() => import('../../game/demo/CharacterDemo'), { ssr: false });

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Lil Artie — Asset Demo</h1>
      <CharacterDemo />
    </main>
  );
}
