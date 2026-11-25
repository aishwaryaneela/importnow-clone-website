import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { voyageAt, PORT_DISTANCE, DEPARTURE, ARRIVAL } from './voyage-timeline.js';

/** Procedural geometry: no downloaded ship model or reference implementation. */
export function createVoyage(section, reduced) {
  const canvas=section.querySelector('canvas');
  const host=canvas.parentElement;
  let renderer;
  try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});}catch{return null;}
  const mobile=matchMedia('(max-width:820px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.5;
  renderer.shadowMap.enabled=!mobile;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.fog=new THREE.Fog('#c9d6df',160,800);
  const camera=new THREE.PerspectiveCamera(42,1,.5,5000);
  const sun=new THREE.Vector3().setFromSphericalCoords(1,THREE.MathUtils.degToRad(77),THREE.MathUtils.degToRad(122));
  const sky=new Sky();sky.scale.setScalar(2000);
  Object.assign(sky.material.uniforms.turbidity,{value:5});
  sky.material.uniforms.rayleigh.value=1.4;
  sky.material.uniforms.mieCoefficient.value=.004;
  sky.material.uniforms.sunPosition.value.copy(sun);
  scene.add(sky);
  const environment=new THREE.PMREMGenerator(renderer);
  scene.environment=environment.fromScene(sky,.05).texture;
  environment.dispose();
  const normalMap=new THREE.TextureLoader().load('/assets/waternormals.jpg');
  normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;
  const water=new Water(new THREE.PlaneGeometry(10000,10000),{textureWidth:mobile?256:512,textureHeight:mobile?256:512,waterNormals:normalMap,sunDirection:sun,sunColor:0xfff4e0,waterColor:0x0b3a55,distortionScale:2.4,fog:true});
  water.rotation.x=-Math.PI/2;water.material.uniforms.size.value=3;scene.add(water);
  scene.add(new THREE.HemisphereLight('#dde8ff','#50606c',.35));
  const sunlight=new THREE.DirectionalLight('#fff0dd',2.8);sunlight.position.set(-60,100,60);sunlight.castShadow=!mobile;
  Object.assign(sunlight.shadow.camera,{left:-100,right:100,top:100,bottom:-100,near:1,far:500});sunlight.shadow.mapSize.set(1024,1024);sunlight.shadow.normalBias=.04;scene.add(sunlight);scene.add(sunlight.target);
  const materials={
    hull:new THREE.MeshStandardMaterial({color:'#14191d',roughness:.64,metalness:.25}),
    red:new THREE.MeshStandardMaterial({color:'#762a22',roughness:.8}),
    deck:new THREE.MeshStandardMaterial({color:'#454a49',roughness:.8}),
    white:new THREE.MeshStandardMaterial({color:'#dce1e3',roughness:.7}),
    window:new THREE.MeshStandardMaterial({color:'#213548',roughness:.25,metalness:.4}),
    rail:new THREE.MeshStandardMaterial({color:'#c2c9ca',metalness:.5,roughness:.4}),
    crane:new THREE.MeshStandardMaterial({color:'#9d2e27',roughness:.65,metalness:.25}),
    concrete:new THREE.MeshStandardMaterial({color:'#a4aaab',roughness:1}),
    yellow:new THREE.MeshStandardMaterial({color:'#c7a64e',roughness:.7}),
    rubber:new THREE.MeshStandardMaterial({color:'#181e20',roughness:1}),
  };
  const box=(parent,size,position,material)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...position);mesh.castShadow=!mobile;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  };
  const beam=(parent,a,b,width,material)=>{
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),diff=to.clone().sub(from);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(width,width,diff.length(),6),material);
    mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());parent.add(mesh);return mesh;
  };
  const createTexture=(paint,w=512,h=256)=>{
    const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
  };
  const containerColors=['#8f342d','#2c6174','#c19242','#315a46','#8b969b','#30363d'];
  const containerMaterials=containerColors.map((color,index)=>new THREE.MeshStandardMaterial({
    map:createTexture((ctx,w,h)=>{
      ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
      for(let x=8;x<w;x+=15){ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(x,0,3,h);ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(x+3,0,2,h);}
      ctx.strokeStyle='rgba(20,20,20,.35)';ctx.lineWidth=6;ctx.strokeRect(3,3,w-6,h-6);
      if(index===5||index===1){ctx.fillStyle='#ebeded';ctx.font='bold 40px Arial';ctx.textAlign='center';ctx.fillText('IMPORTNOW',w/2,h/2+14);}
      ctx.fillStyle='#e2e2d8';ctx.fillRect(w-36,h-38,16,20);
    }),roughness:.7,metalness:.25,
  }));
  const vessel=new THREE.Group();scene.add(vessel);
  // Cross sections form a tapered bow, flat stern and red underwater hull.
  const rings=[];
  for(let i=0;i<=40;i++){
    const t=i/40,bow=Math.max(0,(t-.8)/.2);
    const x=-23+t*46+Math.max(0,(t-.9)/.1)*3;
    const width=t<.12?3.8*(.93+.07*t/.12):t>.7?3.8*(1-((t-.7)/.3)**2.6):3.8;
    rings.push({x,w:Math.max(.015,width),sheer:bow*bow*1.2});
  }
  const hullBand=(bottomY,topY,bottomScale,topScale,material)=>{
    const points=[],indices=[];
    rings.forEach(({x,w,sheer})=>points.push(x,bottomY,-w*bottomScale,x,bottomY,w*bottomScale,x,topY+(topY>1?sheer:0),-w*topScale,x,topY+(topY>1?sheer:0),w*topScale));
    for(let i=0;i<rings.length-1;i++){const a=i*4,b=a+4;indices.push(a,b,a+2,b,b+2,a+2,a+1,a+3,b+1,b+1,a+3,b+3,a+2,b+2,a+3,b+2,b+3,a+3);}
    indices.push(0,2,1,1,2,3);
    // Outward-facing winding keeps the hull visible from the camera and reflections.
    for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=!mobile;mesh.receiveShadow=true;vessel.add(mesh);
  };
  hullBand(-2,.15,.62,.93,materials.red);hullBand(.15,2.6,.93,1,materials.hull);
  const deckVertices=[],deckIndices=[];
  rings.forEach(({x,w,sheer},i)=>{deckVertices.push(x,2.61+sheer,-w,x,2.61+sheer,w);if(i<rings.length-1){const n=i*2;deckIndices.push(n,n+1,n+2,n+1,n+3,n+2);}});
  const deckGeometry=new THREE.BufferGeometry();deckGeometry.setAttribute('position',new THREE.Float32BufferAttribute(deckVertices,3));deckGeometry.setIndex(deckIndices);deckGeometry.computeVertexNormals();
  const deck=new THREE.Mesh(deckGeometry,materials.deck);deck.receiveShadow=true;vessel.add(deck);
  const animatedCargo=[];
  // Stacked corrugated cargo boxes, with a predictable arrangement for screenshots.
  for(let col=0;col<9;col++)for(let row=0;row<4;row++)for(let level=0;level<(col>=1&&col<=6?4:3);level++){
    const position=[-12.4+col*3.18,3.63+level*1.33,-2.4+row*1.6];
    const cargo=box(vessel,[3.05,1.3,1.52],position,containerMaterials[(col*5+row*7+level*3)%containerMaterials.length]);
    if(level===3)animatedCargo.push({mesh:cargo,slot:position,index:(col<=3?col-1:col-4)*4+row,crane:col<=3?0:1});
  }
  // Accommodation tower and wheelhouse with real window geometry.
  for(let floor=0;floor<5;floor++){
    const y=3.225+floor*1.25,length=5.4-floor*.12;
    box(vessel,[length,1.25,6.7],[-17.6,y,0],materials.white);
    box(vessel,[length+.05,.07,6.75],[-17.6,y-.6,0],materials.rail);
    for(let x=0;x<9;x++)for(const side of [-1,1])box(vessel,[.34,.43,.03],[-17.6-length*.43+x*length*.107,y,side*3.36],materials.window);
    for(let z=0;z<9;z++)for(const side of [-1,1])box(vessel,[.03,.43,.4],[-17.6+side*(length/2+.01),y,-2.9+z*.73],materials.window);
  }
  box(vessel,[4.6,1.4,10.2],[-17.3,9.55,0],materials.white);
  for(let x=0;x<7;x++)for(const side of [-1,1])box(vessel,[.46,.61,.04],[-19.3+x*.65,9.55,side*5.12],materials.window);
  for(let z=0;z<14;z++)for(const side of [-1,1])box(vessel,[.04,.61,.55],[-17.3+side*2.32,9.55,-4.6+z*.71],materials.window);
  box(vessel,[4.9,.16,10.5],[-17.3,10.33,0],materials.white);
  const funnel=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.2,4.6,20),materials.hull);funnel.scale.z=.72;funnel.position.set(-21.4,9.2,0);vessel.add(funnel);
  const funnelBand=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.12,.9,20),materials.crane);funnelBand.scale.z=.72;funnelBand.position.set(-21.4,10,0);vessel.add(funnelBand);
  beam(vessel,[-18.2,10.4,0],[-18.2,13.5,0],.07,materials.rail);beam(vessel,[-18.2,12.75,-1.1],[-18.2,12.75,1.1],.06,materials.rail);
  const radar=box(vessel,[1.8,.1,.28],[-17,11.65,0],materials.hull);
  for(const side of [-1,1]){
    const lifeboat=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.9,6,14),new THREE.MeshStandardMaterial({color:'#ff6a1a',roughness:.45}));lifeboat.rotation.z=Math.PI/2;lifeboat.position.set(-17.4,5.3,side*4.15);vessel.add(lifeboat);
    for(let x=-21.5;x<16;x+=1.2)beam(vessel,[x,2.65,side*3.72],[x,3.35,side*3.72],.025,materials.rail);
    beam(vessel,[-21.5,3.35,side*3.72],[15,3.35,side*3.72],.025,materials.rail);
    const nameMap=createTexture((ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle='#d5dcde';ctx.font='bold 64px Arial';ctx.textAlign='center';ctx.fillText('IMPORTNOW',w/2,85);},512,128);
    const nameplate=new THREE.Mesh(new THREE.PlaneGeometry(15,1.9),new THREE.MeshBasicMaterial({map:nameMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
    nameplate.position.set(-2,1.45,side*3.83);if(side<0)nameplate.rotation.y=Math.PI;vessel.add(nameplate);
  }
  box(vessel,[.22,4.2,.22],[18.4,5.9,0],materials.rail);
  box(vessel,[1,.6,1.2],[20.2,4.1,1.2],materials.deck);
  box(vessel,[1,.6,1.2],[20.2,4.1,-1.2],materials.deck);
  // Independent, fixed terminals. Shanghai never doubles as the destination.
  function makePort(name,worldX,china){
    const terminal=new THREE.Group();terminal.name=name;terminal.position.x=worldX;scene.add(terminal);
    const steel=new THREE.MeshStandardMaterial({color:china?'#c8372d':'#2b2b2e',roughness:.65,metalness:.25});
    const roofMaterial=new THREE.MeshStandardMaterial({color:china?'#b5463a':'#2b2b2e',roughness:.6,metalness:.3});
    box(terminal,[300,4,53],[0,.5,-33.5],materials.concrete);
    box(terminal,[300,4,260],[0,.45,-190],materials.concrete);
    box(terminal,[300,.3,.7],[0,2.65,-7.35],materials.yellow);
    for(let x=-140;x<=140;x+=9)box(terminal,[1.1,2.6,1.1],[x,1.1,-6.8],materials.rubber);
    for(const z of [-9.5,-24])box(terminal,[300,.12,.35],[0,2.56,z],materials.rail);
    // Instanced cargo keeps the dense yard inexpensive to render on mobile.
    const yard=[];
    for(let lane=0;lane<4;lane++)for(let col=0;col<48;col++){
      if(col%11===10)continue;
      const count=1+(col*7+lane*3+(china?0:2))%4;
      for(let level=0;level<count;level++)yard.push({x:-95+col*4.2,y:3.6+level*2.23,z:-32-lane*5.2,color:(col+lane+level)%6});
    }
    const yardMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(3.8,2.2,2.5),new THREE.MeshStandardMaterial({roughness:.75,metalness:.15}),yard.length);
    const dummy=new THREE.Object3D();
    yard.forEach((cargo,i)=>{dummy.position.set(cargo.x,cargo.y,cargo.z);dummy.updateMatrix();yardMesh.setMatrixAt(i,dummy.matrix);yardMesh.setColorAt(i,new THREE.Color(containerColors[cargo.color]));});
    yardMesh.castShadow=!mobile;yardMesh.receiveShadow=true;terminal.add(yardMesh);
    const cranes=[];
    for(const x of [-6,4]){
      const crane=new THREE.Group();crane.position.x=x;terminal.add(crane);
      for(const dx of [-3.6,3.6])for(const z of [-25,-10]){
        box(crane,[.95,31,.95],[dx,18,z],steel);
        box(crane,[3,1.3,2],[dx,3.2,z],materials.hull);
        beam(crane,[dx,5,z],[-dx,19,z],.22,steel);
      }
      for(const z of [-25,-10])box(crane,[8.1,.9,.9],[0,33,z],steel);
      for(const dx of [-2.2,2.2]){
        box(crane,[.8,1.6,58],[dx,34,-11],steel);
        beam(crane,[dx,34,-25],[dx*.55,47,-17],.32,steel);
        beam(crane,[dx,34,-10],[dx*.55,47,-17],.32,steel);
        beam(crane,[dx*.55,47,-17],[dx,34.7,17],.08,materials.hull);
        beam(crane,[dx*.55,47,-17],[dx,34.7,-39],.08,materials.hull);
      }
      for(let z=-38;z<=16;z+=5)box(crane,[5.2,.25,.25],[0,33.45,z],steel);
      box(crane,[6.6,3.8,8.5],[0,36.7,-33],materials.white);
      const trolley=box(crane,[4.6,1,3.2],[0,32.8,4],materials.white);
      const spreader=box(crane,[5.2,.42,2.4],[0,18,4],materials.yellow);
      const cables=[[-2.2,-.8],[2.2,-.8],[-2.2,.8],[2.2,.8]].map(([x,z])=>({mesh:box(crane,[.045,1,.045],[x,25,4+z],materials.rubber),x,z}));
      cranes.push({group:crane,trolley,spreader,cables});
    }
    for(const [x,width] of [[-70,44],[-12,36],[46,50]]){
      box(terminal,[width,11,26],[x,8,-74],materials.white);
      const roof=new THREE.Mesh(new THREE.CylinderGeometry(13.6,13.6,width+.4,24,1,false,0,Math.PI),roofMaterial);
      roof.rotation.z=Math.PI/2;roof.scale.set(1,1,.32);roof.position.set(x,13.5,-74);terminal.add(roof);
    }
    box(terminal,[14,16,12],[104,10.5,-40],materials.window);
    for(const x of [-100,-50,0,50,100]){beam(terminal,[x,3,-28],[x,26,-28],.2,materials.rail);box(terminal,[2.4,.8,1],[x,26,-28],materials.white);}
    const flagTexture=createTexture((ctx,w,h)=>{
      if(china){ctx.fillStyle='#de2910';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ffde00';ctx.font='100px Arial';ctx.fillText('★',20,110);ctx.font='32px Arial';for(const [x,y] of [[130,35],[160,65],[160,110],[130,145]])ctx.fillText('★',x,y);}
      else{ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ff9933';ctx.fillRect(0,0,w,h/3);ctx.fillStyle='#138808';ctx.fillRect(0,2*h/3,w,h/3);ctx.strokeStyle='#000080';ctx.lineWidth=4;ctx.beginPath();ctx.arc(w/2,h/2,h*.12,0,Math.PI*2);ctx.stroke();for(let i=0;i<24;i++){const a=i*Math.PI/12;ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(w/2+Math.cos(a)*h*.12,h/2+Math.sin(a)*h*.12);ctx.stroke();}}
    },384,256);
    beam(terminal,[-40,2.5,-9],[-40,19,-9],.11,materials.rail);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(5.6,3.7,14,4),new THREE.MeshStandardMaterial({map:flagTexture,side:THREE.DoubleSide,roughness:.8}));flag.position.set(-37.2,16.6,-9);terminal.add(flag);
    const skyline=new THREE.Group();terminal.add(skyline);
    const skylineMaterial=new THREE.MeshStandardMaterial({color:china?'#8c9aab':'#9aa3ad',roughness:.45,metalness:.3});
    for(let i=0;i<36;i++){const height=18+(i*23%73);box(skyline,[10+i%12,height,14],[-340+i*20,height/2,-690-(i%4)*25],skylineMaterial);}
    return {group:terminal,cranes,flag,skyline,worldX};
  }
  const shanghai=makePort('Shanghai',0,true);
  const chennai=makePort('Chennai',PORT_DISTANCE,false);
  function moveCrane(crane,x,y,z){
    crane.group.position.x=x;crane.trolley.position.z=z;crane.spreader.position.set(0,y,z);
    const top=32.2;
    for(const cable of crane.cables){cable.mesh.position.set(cable.x,(top+y+.2)/2,z+cable.z);cable.mesh.scale.y=Math.max(.01,top-y-.2);}
  }
  // A modest wake avoids additional texture requests.
  const wakeMap=createTexture((ctx,w,h)=>{const gradient=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gradient.addColorStop(0,'rgba(232,244,247,.32)');gradient.addColorStop(1,'rgba(232,244,247,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);},128,128);
  const wake=new THREE.Mesh(new THREE.PlaneGeometry(35,12),new THREE.MeshBasicMaterial({map:wakeMap,transparent:true,depthWrite:false}));wake.rotation.x=-Math.PI/2;wake.position.set(-34,.07,0);vessel.add(wake);
  const cameraPoses=[
    [0,[58,34,74],[-2,10,-8]],[.13,[24,42,84],[0,10,-10]],
    [.27,[-52,30,64],[0,8,-6]],[.4,[-74,16,42],[6,5,0]],
    [.52,[-50,10,40],[8,4,0]],[.64,[38,9,56],[0,4,0]],
    [.76,[66,16,46],[-4,4,0]],[.84,[44,32,76],[0,9,-8]],
    [.92,[-22,42,88],[0,10,-10]],[1,[-50,54,104],[4,7,-14]],
  ];
  let progress=0,visible=false,previousTime=0;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&reduced)render(0);});observer.observe(section);
  const ease=t=>t*t*(3-2*t);
  function resize(){
    const width=host.clientWidth,height=host.clientHeight;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=width<820?58:42;
    if(width>820)camera.setViewOffset(width,height,-width*.17,0,width,height);else camera.clearViewOffset();
    camera.updateProjectionMatrix();render(0);
  }
  function cargoPath(t,from,to){
    if(t<.28)return [from[0],THREE.MathUtils.lerp(from[1],23,ease(t/.28)),from[2]];
    if(t<.62){const k=ease((t-.28)/.34);return [THREE.MathUtils.lerp(from[0],to[0],k),23,THREE.MathUtils.lerp(from[2],to[2],k)];}
    return [to[0],THREE.MathUtils.lerp(23,to[1],ease((t-.62)/.38)),to[2]];
  }
  function render(time){
    const seconds=time*.001;
    const state=voyageAt(progress),shipX=state.shipX;
    const rocking=.1+.9*Math.sin(Math.PI*state.distance);
    vessel.position.set(shipX,reduced?0:Math.sin(seconds*.8)*.14*rocking-.04,0);
    vessel.rotation.x=reduced?0:Math.sin(seconds*.6)*.014*rocking;
    vessel.rotation.z=reduced?0:Math.sin(seconds*.45+1)*.007*rocking;
    let poseIndex=0;while(poseIndex<cameraPoses.length-2&&progress>cameraPoses[poseIndex+1][0])poseIndex++;
    const a=cameraPoses[poseIndex],b=cameraPoses[poseIndex+1];
    const mix=ease(THREE.MathUtils.clamp((progress-a[0])/(b[0]-a[0]),0,1));
    const cameraDistance=host.clientWidth<820?1.3:1.15;
    const eye=a[1].map((value,i)=>THREE.MathUtils.lerp(value,b[1][i],mix)*cameraDistance);
    const target=a[2].map((value,i)=>THREE.MathUtils.lerp(value,b[2][i],mix));
    camera.position.set(shipX+eye[0],eye[1],eye[2]);camera.lookAt(shipX+target[0],target[1],target[2]);
    if(!reduced){const delta=Math.min(.05,Math.max(0,(time-previousTime)/1000));water.material.uniforms.time.value+=delta*.6;previousTime=time;}
    for(const cargo of animatedCargo){
      const {slot,index,mesh}=cargo;
      let point=slot;
      if(progress<DEPARTURE){
        const t=THREE.MathUtils.clamp((progress-(.03+index*(.33/12)))/(.33/12*.92),0,1);
        point=cargoPath(t,[slot[0],3.6,-13-(index%3)*2.5],slot);
        if(t>0&&t<1)moveCrane(shanghai.cranes[cargo.crane],point[0],point[1]+.86,point[2]);
      }else if(progress>ARRIVAL){
        const t=THREE.MathUtils.clamp((progress-(.86+(11-index)*(.125/12)))/(.125/12*.92),0,1);
        point=cargoPath(t,slot,[slot[0],3.6,-13-(index%3)*2.5]);
        if(t>0&&t<1)moveCrane(chennai.cranes[cargo.crane],point[0],point[1]+.86,point[2]);
      }
      mesh.position.set(...point);
    }
    shanghai.skyline.visible=shipX<120;chennai.skyline.visible=shipX>PORT_DISTANCE-120;
    radar.rotation.y=reduced?0:seconds*1.6;
    for(const terminal of [shanghai,chennai]){
      const vertices=terminal.flag.geometry.attributes.position;
      for(let i=0;i<vertices.count;i++){const x=vertices.getX(i);vertices.setZ(i,reduced?0:Math.sin(x*1.3-seconds*5)*.28*(x+2.8)/5.6);}vertices.needsUpdate=true;
    }
    sunlight.target.position.set(shipX,0,-8);sunlight.position.copy(sunlight.target.position).addScaledVector(sun,220);
    renderer.render(scene,camera);
  }
  new ResizeObserver(resize).observe(host);resize();
  if(!reduced)renderer.setAnimationLoop(time=>{if(visible&&!document.hidden)render(time);});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.style.display='none';renderer.setAnimationLoop(null);});
  return {setProgress(value){progress=value;if(reduced)render(0);}};
}
