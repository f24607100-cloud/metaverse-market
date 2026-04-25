import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="currentColor">
        <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z" />
        <path d="m188.45 80.22-48.42 64.55a20 20 0 0 1-32.06 0L59.55 80.22a12 12 0 1 1 19-14.28l48.43 64.55a4 4 0 0 0 6.41 0l48.43-64.55a12 12 0 1 1 19 14.28Z" />
      </g>
    </svg>
  );
}
