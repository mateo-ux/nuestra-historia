export default function Corazon({
  className,
  relleno = "currentColor",
  trazo,
}: {
  className?: string;
  relleno?: string;
  trazo?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.6-10-9.3C.4 8.5 2.3 4.5 6 4.1c2.1-.2 3.7.9 4.6 2.3.3.5 1 .5 1.3 0 .9-1.4 2.5-2.5 4.6-2.3 3.7.4 5.6 4.4 4 7.6C19.5 16.4 12 21 12 21z"
        fill={relleno}
        stroke={trazo}
        strokeWidth={trazo ? 1.3 : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}
