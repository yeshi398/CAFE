/** CST Café mark: a steaming cup inside a ring, in café colours. */
export default function Logo({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={className}
    >
      <circle cx="24" cy="24" r="23" fill="#4a2c1d" />
      <circle cx="24" cy="24" r="19.5" fill="none" stroke="#e9a43c" strokeWidth="1.5" strokeDasharray="3 2.5" />
      <path d="M14 21h17v6a8.5 8.5 0 0 1-17 0z" fill="#fffaf3" />
      <path d="M31 22.5h2.2a3.3 3.3 0 0 1 0 6.6H30.4" fill="none" stroke="#fffaf3" strokeWidth="2.2" />
      <path d="M12.5 36h21" stroke="#e9a43c" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M19 17c-1.5-1.6 1.5-2.7 0-4.4M23.5 17c-1.5-1.6 1.5-2.7 0-4.4M28 17c-1.5-1.6 1.5-2.7 0-4.4"
        fill="none"
        stroke="#c9a682"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
