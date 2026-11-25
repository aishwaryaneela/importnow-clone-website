import fs from 'node:fs/promises';
import vm from 'node:vm';

// Reference copy is inspection input only. Extract editorial content, never executable source.
const reference = { window: {} };
vm.runInNewContext(await fs.readFile('../.reference/posts.js', 'utf8'), reference, { timeout: 1000 });
await fs.writeFile('src/posts.json', JSON.stringify(reference.window.POSTS, null, 2) + '\n');

const base = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/';
await Promise.all(['planets/earth_atmos_2048.jpg', 'planets/earth_normal_2048.jpg', 'planets/earth_specular_2048.jpg', 'planets/earth_lights_2048.png', 'planets/earth_clouds_1024.png', 'waternormals.jpg'].map(async file => {
  const response = await fetch(base + file);
  if (!response.ok) throw new Error(`Asset ${file}: ${response.status}`);
  await fs.writeFile('public/assets/' + file.split('/').pop(), Buffer.from(await response.arrayBuffer()));
}));
for (const family of ['Inter', 'Sora']) {
  const response = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700;800&display=swap`, { headers: { 'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36' } });
  const css = await response.text();
  const latin = css.split('/* latin */').at(-1);
  const url = latin.match(/url\((.*?)\)/)?.[1];
  if (!url) throw new Error(`Font URL missing for ${family}`);
  const font = await fetch(url);
  await fs.writeFile(`public/assets/${family.toLowerCase()}-latin.woff2`, Buffer.from(await font.arrayBuffer()));
}
console.log('Editorial content, Earth/water textures, and fonts are ready.');
