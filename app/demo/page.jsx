import React from 'react';
import dynamic from 'next/dynamic';

const CharacterDemo = dynamic(() => import('../../game/demo/CharacterDemo'), { ssr: false });

export default function Page() {
  return (
    React.createElement('main', { style: { padding: 24 } },
      React.createElement('h1', null, 'Lil Artie — Asset Demo'),
      React.createElement(CharacterDemo, null)
    )
  );
}
