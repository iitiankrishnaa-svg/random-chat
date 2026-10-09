const fs = require('fs');
const path = require('path');

// 1. tsconfig.json
const tsconfig = {
  compilerOptions: {
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [{ name: 'next' }],
    paths: { '@/*': ['./*'] }
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules']
};
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

// 2. tailwind.config.ts
const tailwind = import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#111827',
        surfaceHover: '#1F2937',
        border: '#374151',
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8'
        },
        cyanAccent: '#06B6D4',
        danger: '#EF4444'
      }
    },
  },
  plugins: [],
};
export default config;
;
fs.writeFileSync('tailwind.config.ts', tailwind);

// 3. postcss.config.mjs
const postcss = const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
;
fs.writeFileSync('postcss.config.mjs', postcss);

// 4. next.config.mjs
const nextConfig = /** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
};
export default config;
;
fs.writeFileSync('next.config.mjs', nextConfig);

// 5. .env.example
fs.writeFileSync('.env.example', 'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n');

// 6. .gitignore
fs.writeFileSync('.gitignore', 'node_modules\n.next\nbuild\nout\n.env\n.env.local\n!.env.example\ncoverage\n');

console.log('Project core configs generated.');
