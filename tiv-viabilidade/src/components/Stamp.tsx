"use client";

export function Stamp({
  viavel,
  label,
}: {
  viavel: boolean;
  label: string;
}) {
  const color = viavel ? "var(--verde-obra-500)" : "var(--vermelho-alerta-500)";
  const id = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div
      key={label + viavel}
      className="stamp-enter relative mx-auto aspect-square w-full max-w-[168px] select-none"
      style={{ transform: "rotate(-9deg)" }}
      aria-label={`Selo: ${label}`}
      role="img"
    >
      <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
        <defs>
          <filter id={`rough-${id}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
          </filter>
        </defs>
        <g filter={`url(#rough-${id})`} stroke={color} fill="none">
          <circle cx="100" cy="100" r="92" strokeWidth="3.5" opacity="0.9" />
          <circle cx="100" cy="100" r="80" strokeWidth="1.5" opacity="0.7" />
          <path
            id={`arcTop-${id}`}
            d="M 34 100 A 66 66 0 0 1 166 100"
            fill="none"
          />
          <path
            id={`arcBottom-${id}`}
            d="M 46 100 A 54 54 0 0 0 154 100"
            fill="none"
          />
        </g>
        <text
          fill={color}
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          letterSpacing="3.5"
          fontWeight={600}
        >
          <textPath href={`#arcTop-${id}`} startOffset="50%" textAnchor="middle">
            ESTUDO DE VIABILIDADE
          </textPath>
        </text>
        <text
          fill={color}
          fontFamily="var(--font-mono)"
          fontSize="9"
          letterSpacing="3"
          fontWeight={600}
        >
          <textPath
            href={`#arcBottom-${id}`}
            startOffset="50%"
            textAnchor="middle"
            style={{ transform: "rotate(180deg)", transformOrigin: "100px 100px" }}
          >
            TÉCNICA INTELIGENTE ★
          </textPath>
        </text>
        <text
          x="100"
          y="107"
          textAnchor="middle"
          fill={color}
          fontFamily="var(--font-display)"
          fontStyle="italic"
          fontWeight={700}
          fontSize={label.length > 9 ? "26" : "32"}
          filter={`url(#rough-${id})`}
        >
          {label}
        </text>
      </svg>

      <style jsx>{`
        .stamp-enter {
          animation: stampDown 420ms cubic-bezier(0.2, 1.6, 0.4, 1) both;
        }
        @keyframes stampDown {
          0% {
            opacity: 0;
            transform: rotate(-9deg) scale(1.6);
            filter: blur(1px);
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 0.92;
            transform: rotate(-9deg) scale(1);
            filter: blur(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .stamp-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
