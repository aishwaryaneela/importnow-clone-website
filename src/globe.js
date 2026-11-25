import * as THREE from 'three';
import { flag } from './icons.js';

/** A locally textured Earth, projected city labels and animated trade routes. */
export function mountGlobe() {
  const host = document.querySelector('.globe-stage');
  const canvas = document.getElementById('globe');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { host.classList.add('fallback-only'); return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.z = 9;
  const position = new THREE.Group();
  const tilt = new THREE.Group();
  const earthGroup = new THREE.Group();
  position.add(tilt); tilt.add(earthGroup); scene.add(position);
  const radius = 2;
  const coordinate = (latitude, longitude, r = radius) => {
    const lat = THREE.MathUtils.degToRad(latitude), lon = THREE.MathUtils.degToRad(longitude);
    return new THREE.Vector3(r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), -r * Math.cos(lat) * Math.sin(lon));
  };
  const manager = new THREE.LoadingManager(() => { host.classList.add('loaded'); render(0); });
  const loader = new THREE.TextureLoader(manager);
  const texture = (file, color = false) => {
    const map = loader.load('/assets/'+file);
    if(color) map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    return map;
  };
  const sunDirection = new THREE.Vector3(-.65, .38, .72).normalize();
  const material = new THREE.MeshPhongMaterial({
    map: texture('earth_atmos_2048.jpg', true),
    normalMap: texture('earth_normal_2048.jpg'), normalScale: new THREE.Vector2(.6, -.6),
    specularMap: texture('earth_specular_2048.jpg'), specular: new THREE.Color('#577599'), shininess: 24,
    emissiveMap: texture('earth_lights_2048.png', true), emissive: new THREE.Color('#ffc587'), emissiveIntensity: 1.2,
  });
  // City lights only illuminate the night side; the day side remains photographic.
  material.onBeforeCompile = shader => {
    shader.uniforms.sunDirection = { value: sunDirection };
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 worldNormal;').replace('#include <begin_vertex>', '#include <begin_vertex>\nworldNormal = normalize(mat3(modelMatrix) * normal);');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 worldNormal; uniform vec3 sunDirection;').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= 1.0-smoothstep(-0.3,0.08,dot(normalize(worldNormal),sunDirection));');
  };
  earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), material));
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius*1.009, 64, 48), new THREE.MeshPhongMaterial({ map: texture('earth_clouds_1024.png', true), transparent: true, opacity: .65, depthWrite: false }));
  earthGroup.add(clouds);
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(radius*1.045,64,48),new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.BackSide,
    vertexShader:'varying vec3 n; void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec3 n; void main(){float rim=pow(1.0-abs(n.z),3.0);gl_FragColor=vec4(0.23,0.53,1.0,rim*0.75);}',
  }));
  position.add(atmosphere);
  // Soft atmospheric glow on a canvas sprite, avoiding a hard outline.
  const glowCanvas = document.createElement('canvas'); glowCanvas.width=glowCanvas.height=256;
  const ctx = glowCanvas.getContext('2d');
  const gradient=ctx.createRadialGradient(128,128,104,128,128,128);
  gradient.addColorStop(0,'rgba(78,151,255,.4)');gradient.addColorStop(.35,'rgba(88,156,255,.65)');gradient.addColorStop(1,'rgba(100,169,255,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,depthWrite:false}));
  halo.scale.setScalar(4.55);halo.position.z=-.1;position.add(halo);
  scene.add(new THREE.AmbientLight('#9fb4d8',.2));
  const light=new THREE.DirectionalLight('#ffffff',2.5);light.position.copy(sunDirection).multiplyScalar(20);scene.add(light);
  const focus = coordinate(22,96,1);
  const baseRotation = -Math.atan2(focus.x,focus.z);
  earthGroup.rotation.y=baseRotation;tilt.rotation.x=Math.asin(focus.y);

  const cities = [
    {name:'Shanghai',lat:31.23,lon:121.47,country:'cn',dx:12,dy:-19},
    {name:'Yiwu',lat:29.31,lon:120.08,country:'cn',dx:-66,dy:-16},
    {name:'Guangzhou',lat:23.13,lon:113.26,country:'cn',dx:13,dy:-6},
    {name:'Nhava Sheva',lat:18.95,lon:72.95,country:'in',dx:-103,dy:-10},
    {name:'Hyderabad',lat:17.39,lon:78.49,country:'in',dx:14,dy:1},
    {name:'Chennai',lat:13.08,lon:80.27,country:'in',dx:12,dy:21},
    {name:'Shenzhen',lat:22.54,lon:114.06,country:'cn',label:false},
    {name:'Vizag',lat:17.69,lon:83.22,country:'in',label:false},
  ];
  cities.forEach(city=>{
    city.position=coordinate(city.lat,city.lon,2.012);
    const color=city.country==='cn'?'#e3241b':'#ffffff';
    const marker=new THREE.Mesh(new THREE.SphereGeometry(.018,12,8),new THREE.MeshBasicMaterial({color}));
    marker.position.copy(city.position);earthGroup.add(marker);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.028,.036,32),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.7,depthWrite:false}));
    ring.position.copy(city.position);ring.lookAt(city.position.clone().multiplyScalar(2));earthGroup.add(ring);city.ring=ring;
    if(city.label!==false){
      const element=document.createElement('span');element.className='globe-label';element.innerHTML=flag(city.country)+city.name;
      document.getElementById('globe-labels').append(element);city.element=element;
    }
  });
  const routes=[];
  const sparkCanvas=document.createElement('canvas');sparkCanvas.width=sparkCanvas.height=96;
  const sparkContext=sparkCanvas.getContext('2d');
  const sparkGradient=sparkContext.createRadialGradient(48,48,0,48,48,48);
  sparkGradient.addColorStop(0,'#fff');sparkGradient.addColorStop(.15,'#ffe8ce');sparkGradient.addColorStop(.5,'rgba(255,160,80,.3)');sparkGradient.addColorStop(1,'rgba(255,120,50,0)');
  sparkContext.fillStyle=sparkGradient;sparkContext.fillRect(0,0,96,96);
  const sparkTexture=new THREE.CanvasTexture(sparkCanvas);
  [[0,5],[1,3],[2,7],[6,4],[0,4],[2,5]].forEach(([a,b],i)=>{
    const start=cities[a].position,end=cities[b].position;
    const control=start.clone().add(end).normalize().multiplyScalar(radius+start.distanceTo(end)*.45);
    const curve=new THREE.QuadraticBezierCurve3(start,control,end);
    const routeMaterial=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,
      uniforms:{head:{value:0},color:{value:new THREE.Color(i===2||i===3?'#ffffff':'#e3241b')}},
      vertexShader:'varying vec2 routeUv;void main(){routeUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float head;uniform vec3 color;varying vec2 routeUv;void main(){float behind=head-routeUv.x;float trail=behind>0.&&behind<.4?pow(1.-behind/.4,1.6):0.;float ends=smoothstep(0.,.03,routeUv.x)*(1.-smoothstep(.97,1.,routeUv.x));gl_FragColor=vec4(mix(color,vec3(1.,.95,.85),trail*trail*.6),(.35+trail*.65)*ends);}',
    });
    const line=new THREE.Mesh(new THREE.TubeGeometry(curve,96,.0065,8,false),routeMaterial);
    earthGroup.add(line);
    const dot=new THREE.Sprite(new THREE.SpriteMaterial({map:sparkTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));dot.scale.setScalar(.15);earthGroup.add(dot);
    routes.push({curve,dot,material:routeMaterial,offset:i*.19});
  });
  let width=0,height=0,visible=true,mouseX=0,mouseY=0,yawCorrection=0;
  function resize(){
    width=host.clientWidth;height=host.clientHeight;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    const halfHeight=camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const halfWidth=halfHeight*camera.aspect;
    if(width>820){
      // Size the globe against the actual right edge of the text. The reference
      // deliberately lets the large sphere bleed beyond the viewport.
      const textRight=Math.min(document.querySelector('.hero-copy').getBoundingClientRect().right-host.getBoundingClientRect().left,width*.62);
      const textWorld=(textRight/width-.5)*halfWidth*2;
      const worldRadius=Math.min(halfHeight*.8,Math.max((halfWidth-textWorld)*.78,halfHeight*.5));
      position.position.set(textWorld+.18+worldRadius*1.12,-.15,0);
      position.scale.setScalar(worldRadius/radius);
      const overflow=position.position.x+worldRadius-halfWidth;
      yawCorrection=overflow>0?-Math.asin(Math.min(1,overflow/worldRadius))*.75:0;
    }else{
      const visibleHeight=Math.min(innerHeight,height),unitsPerPixel=halfHeight*2/height;
      const pixelRadius=Math.min(visibleHeight*.2,width*.42);
      const centerY=Math.max(visibleHeight*.27,pixelRadius+84);
      position.position.set(0,halfHeight-centerY*unitsPerPixel,0);
      position.scale.setScalar(pixelRadius*unitsPerPixel/radius);
      yawCorrection=0;
    }
    render(0);
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([entry])=>visible=entry.isIntersecting).observe(host);
  if(!reduced)document.querySelector('.hero').addEventListener('pointermove',event=>{mouseX=(event.clientX/innerWidth-.5)*.3;mouseY=(event.clientY/innerHeight-.5)*.12;},{passive:true});
  function render(time){
    const t=time*.001;
    earthGroup.rotation.y=baseRotation+yawCorrection+(reduced?0:Math.sin(t*.22)*.16+mouseX);
    tilt.rotation.x=Math.asin(focus.y)+(reduced?0:mouseY);
    if(!reduced)clouds.rotation.y=t*.012;
    position.updateMatrixWorld(true);
    const occupied=[];
    // Keep city labels within the viewport and resolve collisions in a stable order.
    [4,0,2,3,5,1].forEach(i=>{
      const city=cities[i];
      city.ring.scale.setScalar(reduced?1:1+(Math.sin(t*2+i)+1)*.5);
      const world=earthGroup.localToWorld(city.position.clone());
      const surfaceNormal=world.clone().sub(position.position).normalize();
      const towardCamera=camera.position.clone().sub(world).normalize();
      const facingCamera=surfaceNormal.dot(towardCamera)>.15;
      const projected=world.project(camera);
      const labelWidth=city.element.offsetWidth,labelHeight=city.element.offsetHeight;
      const cityX=(projected.x*.5+.5)*width,cityY=(-projected.y*.5+.5)*height;
      const x=THREE.MathUtils.clamp(cityX+(city.name==='Yiwu'||city.name==='Nhava Sheva'?-10-labelWidth:10),6,width-labelWidth-6);
      let y=cityY-labelHeight/2,show=false;
      if(facingCamera)for(const offset of [0,-labelHeight-3,labelHeight+3,-2*(labelHeight+3)]){
        const rect={left:x-2,right:x+labelWidth+2,top:y+offset-2,bottom:y+offset+labelHeight+2};
        if(rect.top>4&&rect.bottom<height-4&&!occupied.some(other=>rect.left<other.right&&rect.right>other.left&&rect.top<other.bottom&&rect.bottom>other.top)){
          y+=offset;occupied.push(rect);show=true;break;
        }
      }
      city.element.style.transform=`translate(${x}px,${y}px)`;
      city.element.style.opacity=show?'1':'0';
    });
    routes.forEach(({curve,dot,material,offset})=>{const head=(reduced?.5:t*.15+offset)%1;dot.position.copy(curve.getPoint(head));dot.material.opacity=Math.sin(head*Math.PI);material.uniforms.head.value=head;});
    renderer.render(scene,camera);
  }
  resize();
  if(!reduced)renderer.setAnimationLoop(time=>{if(visible&&!document.hidden)render(time);});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();host.classList.remove('loaded');renderer.setAnimationLoop(null);});
}
