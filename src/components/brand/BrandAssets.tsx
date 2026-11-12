import React from 'react';
import { ProductVisualType, ServiceCategory } from '../../types/salon';

export const IPrettyMonogram: React.FC<{ size?: number; dark?: boolean }> = ({
  size = 36,
  dark = true,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Monograma iPretty"
  >
    <rect width="64" height="64" rx="16" fill={dark ? '#1F1815' : '#FAF7F2'} />
    <path
      d="M22 24C22 20.6863 24.6863 18 28 18H36C39.3137 18 42 20.6863 42 24V27C42 28.6569 40.6569 30 39 30H25C23.3431 30 22 28.6569 22 27V24Z"
      fill="#B85D43"
    />
    <circle cx="22" cy="18" r="3.5" fill={dark ? '#F7F3EE' : '#1F1815'} />
    <path
      d="M22 33V45C22 46.1046 22.8954 47 24 47H25.5C26.6046 47 27.5 46.1046 27.5 45V33H22Z"
      fill={dark ? '#F7F3EE' : '#1F1815'}
    />
    <path
      d="M31 33H38C41.866 33 45 36.134 45 40C45 43.866 41.866 47 38 47H34.5V41.5H38C38.8284 41.5 39.5 40.8284 39.5 40C39.5 39.1716 38.8284 38.5 38 38.5H31V33Z"
      fill={dark ? '#F7F3EE' : '#1F1815'}
    />
  </svg>
);

export const IPrettyWordmark: React.FC<{ dark?: boolean; compact?: boolean }> = ({
  dark = false,
  compact = false,
}) => (
  <div className="inline-flex items-center gap-2.5 select-none">
    <IPrettyMonogram size={compact ? 30 : 36} dark={!dark} />
    <div className="leading-none">
      <div
        className={`font-display font-semibold tracking-tight ${
          compact ? 'text-lg' : 'text-[22px]'
        } ${dark ? 'text-[#FAF7F2]' : 'text-[#1F1815]'}`}
      >
        iPretty
      </div>
      {!compact && (
        <div
          className={`text-[10px] uppercase tracking-[0.18em] font-medium mt-0.5 ${
            dark ? 'text-[#C8BCB3]' : 'text-[#7D7068]'
          }`}
        >
          Salão & Gestão
        </div>
      )}
    </div>
  </div>
);

export const ServiceEditorialArt: React.FC<{
  category: ServiceCategory;
  className?: string;
}> = ({ category, className = 'w-14 h-14' }) => {
  if (category === 'cabelo') {
    return (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <rect width="80" height="80" rx="16" fill="#F6E6E0" />
        <path
          d="M24 54C24 40 31 24 42 22C50 20.5 56 27 56 36C56 46 47 54 37 56"
          stroke="#B85D43"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M32 58C36 46 42 36 52 33"
          stroke="#1F1815"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="28" cy="28" r="4" fill="#B85D43" fillOpacity="0.35" />
      </svg>
    );
  }
  if (category === 'unhas') {
    return (
      <svg viewBox="0 0 80 80" fill="none" className={className}>
        <rect width="80" height="80" rx="16" fill="#E3EFE8" />
        <rect
          x="29"
          y="33"
          width="22"
          height="26"
          rx="6"
          fill="#FFFFFF"
          stroke="#38664E"
          strokeWidth="2.2"
        />
        <rect x="34" y="19" width="12" height="14" rx="2.5" fill="#1F1815" />
        <rect x="34" y="40" width="12" height="11" rx="3" fill="#B85D43" fillOpacity="0.85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className}>
      <rect width="80" height="80" rx="16" fill="#EFE9E1" />
      <path
        d="M20 44C26 33 36 30 46 33C52 35 56 39 60 44"
        stroke="#1F1815"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 48C32 45 48 45 56 48"
        stroke="#B85D43"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 4"
      />
      <circle cx="40" cy="52" r="2.5" fill="#B85D43" />
    </svg>
  );
};

export const ProductEditorialArt: React.FC<{
  type: ProductVisualType;
  accent?: string;
  className?: string;
}> = ({ type, accent = '#B85D43', className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 200 130" fill="none" className={className}>
      <rect width="200" height="130" rx="14" fill="#F2ECE4" />
      <circle cx="152" cy="34" r="26" fill={accent} fillOpacity="0.11" />
      <circle cx="44" cy="98" r="18" fill="#1F1815" fillOpacity="0.05" />

      {type === 'serum' && (
        <g>
          <rect x="82" y="42" width="36" height="58" rx="10" fill="#FFFFFF" stroke="#1F1815" strokeWidth="2" />
          <rect x="92" y="25" width="16" height="17" rx="3" fill="#1F1815" />
          <path d="M97 19H103V25H97V19Z" fill={accent} />
          <rect x="88" y="56" width="24" height="26" rx="4" fill={accent} fillOpacity="0.18" />
          <line x1="92" y1="65" x2="108" y2="65" stroke="#1F1815" strokeWidth="2" strokeLinecap="round" />
          <line x1="94" y1="72" x2="106" y2="72" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {type === 'shampoo' && (
        <g>
          <rect x="78" y="34" width="44" height="68" rx="12" fill="#FFFFFF" stroke="#1F1815" strokeWidth="2" />
          <rect x="91" y="21" width="18" height="13" rx="3" fill={accent} />
          <rect x="85" y="49" width="30" height="36" rx="4" fill="#EFE9E1" />
          <circle cx="100" cy="64" r="7" fill={accent} fillOpacity="0.85" />
          <line x1="91" y1="77" x2="109" y2="77" stroke="#1F1815" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {type === 'cream' && (
        <g>
          <rect x="66" y="48" width="68" height="48" rx="12" fill="#FFFFFF" stroke="#1F1815" strokeWidth="2" />
          <rect x="70" y="36" width="60" height="13" rx="5" fill="#1F1815" />
          <rect x="76" y="60" width="48" height="22" rx="4" fill={accent} fillOpacity="0.2" />
          <line x1="84" y1="71" x2="116" y2="71" stroke="#1F1815" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {type === 'nail' && (
        <g>
          <rect x="80" y="50" width="40" height="48" rx="9" fill="#FFFFFF" stroke="#1F1815" strokeWidth="2" />
          <rect x="92" y="24" width="16" height="26" rx="4" fill="#1F1815" />
          <rect x="87" y="62" width="26" height="22" rx="4" fill={accent} fillOpacity="0.85" />
        </g>
      )}

      {type === 'kit' && (
        <g>
          <rect x="66" y="40" width="32" height="58" rx="8" fill="#FFFFFF" stroke="#1F1815" strokeWidth="2" />
          <rect x="76" y="26" width="12" height="14" rx="2" fill={accent} />
          <rect x="104" y="54" width="34" height="44" rx="8" fill="#FAF7F2" stroke="#1F1815" strokeWidth="2" />
          <rect x="110" y="66" width="22" height="18" rx="3" fill={accent} fillOpacity="0.25" />
        </g>
      )}

      {type === 'sample' && (
        <g>
          <rect x="88" y="38" width="24" height="56" rx="12" fill="#FFFFFF" stroke="#1F1815" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="100" cy="64" r="6" fill="#38664E" fillOpacity="0.25" />
          <path d="M97 64L99.5 66.5L104 61.5" stroke="#38664E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
};
