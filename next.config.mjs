/** @type {import('next').NextConfig} */
export default function config() {
  return {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
  };
}
