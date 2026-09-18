interface SealProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function Seal({ size = 56, className = "", glow = false }: SealProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="醉乡堂印章"
      className={`inline-block select-none ${glow ? "seal-glow rounded-[18%]" : ""} ${className}`}
    >
      <rect
        x="7"
        y="7"
        width="86"
        height="86"
        rx="10"
        fill="#a03b2d"
      />
      <rect
        x="13"
        y="13"
        width="74"
        height="74"
        rx="7"
        fill="none"
        stroke="#e8d9b8"
        strokeWidth="2.5"
        opacity="0.85"
      />
      <g
        fill="#f5f0e6"
        fontFamily="'Songti SC','STSong','SimSun',serif"
        textAnchor="middle"
      >
        <text x="50" y="42" fontSize="25">
          醉
        </text>
        <text x="50" y="68" fontSize="25">
          乡
        </text>
        <text x="50" y="94" fontSize="25">
          堂
        </text>
      </g>
    </svg>
  );
}
