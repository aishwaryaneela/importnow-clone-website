import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: { home: resolve('index.html'), blog: resolve('blog.html'), post: resolve('post.html') },
      output: { manualChunks: { three: ['three'] } },
    },
  },
});
