import * as esbuild from 'esbuild';
import fs from 'fs';

async function build() {
  console.log('Building bundle...');
  
  try {
    // Bundle everything into a single file
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: 'dist/index.js',
      define: {
        'require.resolve': 'undefined',
      },
      banner: {
        js: `#!/usr/bin/env node
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
      },
      external: [],
      target: 'node20',
      minify: true,
    });

    // Set executable permissions
    fs.chmodSync('dist/index.js', '755');
    
    console.log('Build complete: dist/index.js');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build();
