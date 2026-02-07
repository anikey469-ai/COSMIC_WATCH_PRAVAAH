
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NearEarthObject } from '../types';

interface OrbitViewProps {
  neos: NearEarthObject[];
}

const OrbitView: React.FC<OrbitViewProps> = ({ neos }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Load researcher overrides to get verified scores for color mapping
  const overrides = useMemo(() => {
    const saved = localStorage.getItem('cosmic_researcher_overrides');
    return saved ? JSON.parse(saved) : {};
  }, []);

  // Filter and prioritize high risk asteroids so they are always visible
  const prioritizedNeos = useMemo(() => {
    return [...neos].sort((a, b) => {
      const scoreA = overrides[a.id]?.score ?? a.risk_score ?? 0;
      const scoreB = overrides[b.id]?.score ?? b.risk_score ?? 0;
      return scoreB - scoreA; // High score first
    }).slice(0, 50); // Show top 50 prioritized by risk
  }, [neos, overrides]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.0006);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    camera.position.set(200, 150, 250);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 80;
    controls.maxDistance = 1500;

    // --- EARTH ---
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = 0.409; // Axial tilt
    
    const earthRadius = 25;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 128, 128); // Increased resolution
    
    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthNormal = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const earthSpecular = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    
    // PBR Material for Earth
    const earthMaterial = new THREE.MeshStandardMaterial({ 
      map: earthTexture,
      normalMap: earthNormal,
      roughness: 0.6,
      metalness: 0.1,
      emissive: new THREE.Color(0x051020),
      emissiveIntensity: 0.15
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // PBR Clouds
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.015, 64, 64);
    const cloudTex = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.4,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // Enhanced Atmosphere Glow (Inverted shell)
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.15, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphere);
    scene.add(earthGroup);

    // --- ENHANCED LIGHTING RIG ---
    // 1. Solar Light (Primary Directional)
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    sunLight.position.set(400, 200, 400);
    scene.add(sunLight);

    // 2. Ambient Fill (Cool Deep Space Tint)
    const ambientLight = new THREE.AmbientLight(0x101a30, 0.6);
    scene.add(ambientLight);

    // 3. Rim Light (Back Light to catch edges)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-400, -100, -400);
    scene.add(rimLight);

    // 4. Fill Point Light (Subtle warmth from below)
    const fillLight = new THREE.PointLight(0x2a1a4a, 1.5, 1000);
    fillLight.position.set(0, -300, 0);
    scene.add(fillLight);

    // Stars (High Density Parallax)
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 20000; i++) {
      const x = (Math.random() - 0.5) * 8000;
      const y = (Math.random() - 0.5) * 8000;
      const z = (Math.random() - 0.5) * 8000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(starGeometry, starMaterial));

    // --- ASTEROIDS ---
    const asteroidData: { 
      mesh: THREE.Group, 
      orbit: THREE.Line, 
      angle: number, 
      speed: number, 
      dist: number,
      score: number
    }[] = [];

    // Helper: Create Glowing Sprite
    const createGlowSprite = (colorStr: string, size: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, colorStr);
      gradient.addColorStop(0.3, colorStr);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(size, size, 1);
      return sprite;
    };

    // Helper: Create Label
    const createNameLabel = (text: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      const shortName = text.replace(/[()]/g, '').trim();
      ctx.font = 'bold 90px "Exo 2"';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 15;
      ctx.fillText(shortName, 256, 64);
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(18, 4.5, 1);
      sprite.position.y = 12;
      return sprite;
    };

    const COLOR_RED = 0xef4444;    // Critical > 70
    const COLOR_YELLOW = 0xeab308; // Elevated 40-70
    const COLOR_BLUE = 0x0ea5e9;   // Stable < 40
    
    prioritizedNeos.forEach((neo) => {
      const score = overrides[neo.id]?.score ?? neo.risk_score ?? 0;
      
      let hexColor = COLOR_BLUE;
      let glowColor = 'rgba(14, 165, 233, 0.4)';
      
      if (score >= 70) {
        hexColor = COLOR_RED;
        glowColor = 'rgba(239, 68, 68, 0.8)';
      } else if (score >= 40) {
        hexColor = COLOR_YELLOW;
        glowColor = 'rgba(234, 179, 8, 0.6)';
      }

      const missKm = parseFloat(neo.close_approach_data[0].miss_distance.kilometers);
      const dist = Math.max(70, (missKm / 1000000) * 20 + 80);
      
      const asteroidGroup = new THREE.Group();
      
      const bodyScale = (score >= 70) ? 2.5 : (score >= 40) ? 1.8 : 1.2;
      const radius = (neo.estimated_diameter.meters.estimated_diameter_max / 250) * bodyScale + 1.8;
      const astGeo = new THREE.IcosahedronGeometry(radius, 2);
      const astMat = new THREE.MeshStandardMaterial({ 
        color: hexColor,
        roughness: 0.9,
        metalness: 0.3,
        emissive: hexColor,
        emissiveIntensity: score >= 70 ? 0.7 : 0.2,
      });
      const asteroid = new THREE.Mesh(astGeo, astMat);
      asteroidGroup.add(asteroid);

      const glowSprite = createGlowSprite(glowColor, radius * 14);
      asteroidGroup.add(glowSprite);

      if (score >= 70) {
        const nameLabel = createNameLabel(neo.name, '#ffffff'); 
        asteroidGroup.add(nameLabel);
      }

      scene.add(asteroidGroup);

      const curve = new THREE.EllipseCurve(0, 0, dist, dist * (0.95 + Math.random() * 0.1), 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(128);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const orbitMat = new THREE.LineBasicMaterial({ 
        color: hexColor, 
        transparent: true, 
        opacity: score >= 70 ? 0.4 : score >= 40 ? 0.15 : 0.05 
      });
      const orbit = new THREE.Line(orbitGeo, orbitMat);
      
      orbit.rotation.x = Math.random() * Math.PI;
      orbit.rotation.z = (Math.random() - 0.5) * Math.PI * 0.3;
      scene.add(orbit);

      asteroidData.push({
        mesh: asteroidGroup,
        orbit: orbit,
        angle: Math.random() * Math.PI * 2,
        speed: (0.0006 + Math.random() * 0.0015) * (1 + (score / 120)),
        dist: dist,
        score
      });
    });

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      earth.rotation.y += 0.0007;
      clouds.rotation.y += 0.0011;
      
      asteroidData.forEach((data) => {
        data.angle += data.speed;
        
        const x = Math.cos(data.angle) * data.dist;
        const z = Math.sin(data.angle) * (data.dist * 0.95);
        
        const pos = new THREE.Vector3(x, 0, z);
        pos.applyEuler(data.orbit.rotation);
        
        data.mesh.position.copy(pos);

        if (data.score >= 40) {
          const pulseScale = 1 + Math.sin(time * (data.score >= 70 ? 5 : 2)) * 0.15;
          data.mesh.scale.set(pulseScale, pulseScale, pulseScale);
          
          if (data.score >= 70) {
            const sprite = data.mesh.children[1] as THREE.Sprite;
            sprite.material.opacity = 0.5 + Math.sin(time * 10) * 0.3;
          }
        }
        
        data.mesh.children[0].rotation.y += 0.008;
        data.mesh.children[0].rotation.x += 0.004;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [prioritizedNeos, overrides]);

  const redCount = prioritizedNeos.filter(n => {
    const score = overrides[n.id]?.score ?? n.risk_score ?? 0;
    return score >= 70;
  }).length;
  
  const yellowCount = prioritizedNeos.filter(n => {
    const score = overrides[n.id]?.score ?? n.risk_score ?? 0;
    return score >= 40 && score < 70;
  }).length;

  return (
    <div className="relative w-full h-full glass rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Tactical Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none space-y-4">
        <div className="bg-slate-950/95 backdrop-blur-3xl border border-slate-800 p-4 rounded-[1.5rem] shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/5 max-w-[200px]">
           <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <h3 className="text-sm font-space font-bold text-white tracking-[0.2em] uppercase">Tactical Feed</h3>
           </div>
           
           <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 bg-red-500/10 p-2 rounded-xl border border-red-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <span className="text-[9px] text-white font-black uppercase tracking-widest">CRITICAL</span>
                </div>
                <div className="text-sm font-black text-red-500 font-mono">{redCount}</div>
              </div>

              <div className="flex items-center justify-between gap-4 bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-[9px] text-white font-black uppercase tracking-widest">ELEVATED</span>
                </div>
                <div className="text-sm font-black text-yellow-500 font-mono">{yellowCount}</div>
              </div>

              <div className="flex items-center gap-4 bg-sky-500/5 p-2 rounded-xl border border-sky-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">STABLE</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-950/80 backdrop-blur-2xl px-6 py-2 rounded-full border border-slate-800 shadow-2xl">
         <div className="flex items-center gap-3">
           <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">PBR Rendering Enabled // Sector A-9</span>
         </div>
      </div>
    </div>
  );
};

export default OrbitView;
