const fs = require('fs');
fs.writeFileSync('tsconfig.json', JSON.stringify({
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
}, null, 2));
fs.writeFileSync('tailwind.config.ts', import type { Config } from 'tailwindcss';

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
);
fs.writeFileSync('postcss.config.mjs', export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
);
fs.writeFileSync('next.config.mjs', /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};
export default nextConfig;
);
fs.writeFileSync('.env.example', NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
);
fs.writeFileSync('.gitignore', 
ode_modules
.next
build
out
.env
.env.local
!.env.example
coverage
);
console.log('Configs created');
