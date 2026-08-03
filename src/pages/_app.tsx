import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0a0a0f; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: #111118; }
      ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
      input[type=range] { height: 4px; border-radius: 2px; cursor: pointer; }
      select { cursor: pointer; outline: none; }
      textarea { outline: none; }
      input { outline: none; }
      button { font-family: inherit; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return <Component {...pageProps} />;
}
