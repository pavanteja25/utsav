/** @type {import('next').NextConfig} */
export default function config(phase) {
  return {
    output: 'export',
    distDir: phase === 'phase-development-server' ? '.next-dev' : '.next',
    trailingSlash: true,
    images: { unoptimized: true },
  };
}
