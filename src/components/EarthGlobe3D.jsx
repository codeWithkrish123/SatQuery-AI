import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function EarthGlobe3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);

    // Position camera close to curved horizon looking across Earth at night
    camera.position.set(0, 3.8, 7.2);
    camera.lookAt(0, 0.6, 0);

    // Renderer setup with deep dark tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Deep Dark Space Lighting
    const ambientLight = new THREE.AmbientLight(0x050c18, 1.1);
    scene.add(ambientLight);

    // Sun Directional Light for top horizon edge rim
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(-10, 8, 6);
    scene.add(sunLight);

    // Subtle Teal rim light
    const tealRimLight = new THREE.DirectionalLight(0x00A3A6, 2.2);
    tealRimLight.position.set(8, -2, -5);
    scene.add(tealRimLight);

    // ==========================================
    // PROCEDURAL NASA NIGHT EARTH TEXTURE
    // ==========================================
    const createNightEarthCanvas = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Ultra-deep dark night ocean base
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      oceanGrad.addColorStop(0, '#02050b');
      oceanGrad.addColorStop(0.5, '#030812');
      oceanGrad.addColorStop(1, '#010307');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Continent landmass shapes (dark pitch slate land)
      const drawContinent = (points, color = '#08121d') => {
        ctx.fillStyle = color;
        ctx.beginPath();
        points.forEach(([x, y], idx) => {
          const px = (x / 360) * canvas.width;
          const py = ((90 - y) / 180) * canvas.height;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
      };

      // Main landmass outlines
      drawContinent([[170, 70], [210, 65], [260, 55], [285, 25], [270, 15], [240, 15], [210, 50], [180, 55]], '#07111b'); // NA
      drawContinent([[275, 10], [315, -5], [325, -20], [300, -50], [290, -45], [280, -10]], '#050e18'); // SA
      drawContinent([[0, 60], [40, 70], [100, 75], [140, 60], [140, 35], [100, 25], [70, 30], [50, 40], [10, 45]], '#081422'); // Eurasia
      drawContinent([[350, 35], [40, 30], [50, 10], [40, -35], [20, -35], [350, 0]], '#07121e'); // Africa
      drawContinent([[110, -12], [150, -12], [150, -38], [115, -35]], '#060f1a'); // Australia

      // Glowing golden/amber city lights clusters
      const drawCityCluster = (cx, cy, count, radius, color) => {
        const px = (cx / 360) * canvas.width;
        const py = ((90 - cy) / 180) * canvas.height;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.pow(Math.random(), 1.5) * radius;
          const x = px + Math.cos(angle) * dist;
          const y = py + Math.sin(angle) * dist;
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      };

      // Major city clusters
      const cityCenters = [
        [77, 28, 700, 45, 'rgba(255, 195, 80, 0.95)'],  // India / Delhi / Mumbai
        [78, 13, 400, 35, 'rgba(255, 205, 100, 0.9)'],  // South India / Chennai
        [88, 22, 450, 40, 'rgba(255, 190, 70, 0.9)'],   // Kolkata
        [10, 51, 900, 55, 'rgba(255, 210, 110, 0.95)'], // Western Europe / London / Paris
        [37, 55, 550, 50, 'rgba(255, 185, 75, 0.85)'],  // Moscow
        [45, 25, 700, 40, 'rgba(255, 220, 120, 0.95)'], // Middle East / Dubai
        [116, 39, 950, 60, 'rgba(255, 200, 90, 0.95)'], // East China
        [139, 35, 650, 35, 'rgba(255, 215, 110, 0.95)'],// Japan / Tokyo
        [286, 40, 950, 65, 'rgba(255, 210, 100, 0.95)'],// US East Coast
        [242, 34, 550, 45, 'rgba(255, 190, 80, 0.9)'],  // US West Coast
        [312, -23, 450, 40, 'rgba(255, 180, 70, 0.85)'],// Brazil
        [30, -30, 350, 35, 'rgba(255, 185, 75, 0.85)'], // South Africa
      ];

      cityCenters.forEach(([cx, cy, count, radius, color]) => {
        drawCityCluster(cx, cy, count, radius, color);
      });

      // Scatter subtle background ambient night light specks over land
      for (let i = 0; i < 3000; i++) {
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        ctx.fillStyle = Math.random() > 0.35 ? 'rgba(255, 190, 85, 0.7)' : 'rgba(0, 163, 166, 0.65)';
        ctx.fillRect(rx, ry, 1, 1);
      }

      return new THREE.CanvasTexture(canvas);
    };

    // ==========================================
    // EARTH SPHERE MESH
    // ==========================================
    const earthRadius = 4.6;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

    const fallbackTexture = createNightEarthCanvas();
    fallbackTexture.wrapS = THREE.RepeatWrapping;
    fallbackTexture.wrapT = THREE.ClampToEdgeWrapping;

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: fallbackTexture,
      roughness: 0.6,
      metalness: 0.1,
      emissive: new THREE.Color(0x020710),
      emissiveIntensity: 0.9,
    });

    // High-res texture loader fallback
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-night.jpg',
      (loadedTex) => {
        loadedTex.wrapS = THREE.RepeatWrapping;
        loadedTex.wrapT = THREE.ClampToEdgeWrapping;
        earthMaterial.map = loadedTex;
        earthMaterial.needsUpdate = true;
      },
      undefined,
      () => { }
    );

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.position.set(0, -earthRadius + 1.2, 0);
    scene.add(earthMesh);

    // ==========================================
    // ATMOSPHERE CYAN HALO SHADER
    // ==========================================
    const atmosphereVertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const atmosphereFragmentShader = `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.63 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
        gl_FragColor = vec4(0.0, 0.64, 0.65, 1.0) * intensity * 1.9;
      }
    `;

    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius + 0.16, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthMesh.add(atmosphereMesh);

    // ==========================================
    // DYNAMIC ANIMATED NEUTRON STARS PARTICLE SYSTEM
    // ==========================================
    const neutronCount = 950;
    const neutronGeo = new THREE.BufferGeometry();
    const neutronPositions = new Float32Array(neutronCount * 3);
    const neutronVelocities = new Float32Array(neutronCount * 3);
    const neutronColors = new Float32Array(neutronCount * 3);

    const colorCyan = new THREE.Color(0x00A3A6);
    const colorTeal = new THREE.Color(0x5EE5E6);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < neutronCount; i++) {
      const i3 = i * 3;
      neutronPositions[i3] = (Math.random() - 0.5) * 40;
      neutronPositions[i3 + 1] = (Math.random() - 0.5) * 40;
      neutronPositions[i3 + 2] = (Math.random() - 0.5) * 40;

      // Smooth float velocities
      neutronVelocities[i3] = (Math.random() - 0.5) * 0.005;
      neutronVelocities[i3 + 1] = (Math.random() - 0.5) * 0.006 + 0.002; // Upward drift
      neutronVelocities[i3 + 2] = (Math.random() - 0.5) * 0.005;

      // Color mix: cyan/teal glowing particles + crisp white stars
      const mixColor = Math.random() > 0.35 ? (Math.random() > 0.5 ? colorCyan : colorTeal) : colorWhite;
      neutronColors[i3] = mixColor.r;
      neutronColors[i3 + 1] = mixColor.g;
      neutronColors[i3 + 2] = mixColor.b;
    }

    neutronGeo.setAttribute('position', new THREE.BufferAttribute(neutronPositions, 3));
    neutronGeo.setAttribute('color', new THREE.BufferAttribute(neutronColors, 3));

    // Soft glowing particle dot texture
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const pCtx = pCanvas.getContext('2d');
      const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      pGrad.addColorStop(0.35, 'rgba(0, 163, 166, 0.85)');
      pGrad.addColorStop(0.7, 'rgba(0, 163, 166, 0.25)');
      pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = pGrad;
      pCtx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(pCanvas);
    };

    const neutronMat = new THREE.PointsMaterial({
      size: 0.14,
      map: createParticleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const neutronParticles = new THREE.Points(neutronGeo, neutronMat);
    scene.add(neutronParticles);

    // ==========================================
    // ORBITAL ORBIT LINE & SATELLITE BEACON
    // ==========================================
    const orbitRadius = earthRadius + 0.55;
    const orbitCurve = new THREE.EllipseCurve(
      0, 0,
      orbitRadius, orbitRadius * 0.92,
      0, 2 * Math.PI,
      false,
      0
    );
    const points = orbitCurve.getPoints(100);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, p.y * 0.25, p.y * 0.95))
    );
    const orbitMaterial = new THREE.LineDashedMaterial({
      color: 0x00A3A6,
      dashSize: 0.15,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.55,
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitLine.computeLineDistances();
    earthMesh.add(orbitLine);

    // Glowing satellite beacon dot
    const beaconGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00A3A6 });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(orbitRadius * 0.7, 0.2, orbitRadius * 0.6);
    earthMesh.add(beaconMesh);

    // ==========================================
    // ANIMATION LOOP (Smooth 60FPS)
    // ==========================================
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Slow rotation of Earth globe
      earthMesh.rotation.y = elapsedTime * 0.035;
      orbitLine.rotation.y = elapsedTime * 0.02;

      // Animate floating neutron particles smoothly
      const posArr = neutronGeo.attributes.position.array;
      for (let i = 0; i < neutronCount; i++) {
        const i3 = i * 3;
        posArr[i3] += neutronVelocities[i3];
        posArr[i3 + 1] += neutronVelocities[i3 + 1];
        posArr[i3 + 2] += neutronVelocities[i3 + 2];

        // Smooth wrap-around bounds
        if (posArr[i3 + 1] > 20) posArr[i3 + 1] = -20;
        if (posArr[i3] > 20) posArr[i3] = -20;
        if (posArr[i3] < -20) posArr[i3] = 20;
        if (posArr[i3 + 2] > 20) posArr[i3 + 2] = -20;
      }
      neutronGeo.attributes.position.needsUpdate = true;

      // Gentle pulse on neutron particle material opacity
      neutronMat.opacity = 0.75 + Math.sin(elapsedTime * 1.5) * 0.12;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      earthGeometry.dispose();
      earthMaterial.dispose();
      neutronGeo.dispose();
      neutronMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ minHeight: '600px' }}
    />
  );
}
