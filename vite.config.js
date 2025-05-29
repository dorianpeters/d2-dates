export default {
  base: '/ca-court-deadlines/',
  minify: true,
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].min.js',
      },
    },
  }
}