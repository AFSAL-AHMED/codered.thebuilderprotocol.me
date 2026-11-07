import React from 'react';

export default function Banner() {
  return (
    <div className="w-full bg-cr-slate text-white font-mono font-bold py-3 px-6 flex items-center gap-2 select-none"
         style={{ borderBottom: '3px solid #FF5722' }}>
      <span className="inline-block animate-pulse-emoji text-xl" aria-hidden="true">🚨</span>
      <span className="text-sm md:text-base leading-tight tracking-wide">
        System down? Learn the distributed architecture principles required to survive the crash.{' '}
        Access the DevOps &amp; Scale Track at{' '}
        <a
          href="https://learn.thebuilderprotocol.me"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cr-orange uppercase font-extrabold hover:underline"
        >
          LEARN.THEBUILDERPROTOCOL.ME
        </a>
      </span>
    </div>
  );
}
