import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CameraMode, TimeOfDay, Landmark } from '../types/kaaba';
import { LANDMARKS } from '../data/landmarks';
import {
  createKiswahTexture,
  createBabKaabaTexture,
  createMatafMarbleTexture,
  createColonnadeTexture,
  createClockFaceTexture
} from '../utils/textures';

interface KaabaSceneProps {
  cameraMode: CameraMode;
  timeOfDay: TimeOfDay;
  crowdDensity: number;
  crowdSpeed: number;
  showLandmarkPins: boolean;
  selectedLandmark: Landmark | null;
  onSelectLandmark: (landmark: Landmark | null) => void;
  onTawafLapCompleted: (lapNumber: number) => void;
  walkSpeed: number;
  virtualJoystick: { x: number; y: number } | null;
}

export const KaabaScene: React.FC<KaabaSceneProps> = ({
  cameraMode,
  timeOfDay,
  crowdDensity,
  crowdSpeed,
  showLandmarkPins,
  selectedLandmark,
  onSelectLandmark,
  onTawafLapCompleted,
  walkSpeed,
  virtualJoystick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to keep animation loop & controls state
  const stateRef = useRef({
    cameraMode,
    timeOfDay,
    crowdDensity,
    crowdSpeed,
    walkSpeed,
    showLandmarkPins,
    selectedLandmark,
    virtualJoystick,
    // Walk controls
    keys: { forward: false, backward: false, left: false, right: false, sprint: false },
    walkPos: new THREE.Vector3(16, 1.7, 12),
    walkYaw: -Math.PI / 4,
    walkPitch: 0,
    isPointerDown: false,
    prevPointerX: 0,
    prevPointerY: 0,
    // Orbit camera parameters
    orbitTheta: Math.PI / 4,
    orbitPhi: Math.PI / 3,
    orbitRadius: 28,
    orbitTarget: new THREE.Vector3(0, 4.5, 0),
    // Tawaf follower state
    tawafAngle: 0.1, // starting near Hajar al-Aswad line
    tawafRadius: 18.0,
    tawafLap: 1,
    hasPassedGreenLine: false,
  });

  // Sync props to stateRef for RAF loop without recreating everything
  useEffect(() => {
    stateRef.current.cameraMode = cameraMode;
    stateRef.current.timeOfDay = timeOfDay;
    stateRef.current.crowdDensity = crowdDensity;
    stateRef.current.crowdSpeed = crowdSpeed;
    stateRef.current.walkSpeed = walkSpeed;
    stateRef.current.showLandmarkPins = showLandmarkPins;
    stateRef.current.selectedLandmark = selectedLandmark;
    stateRef.current.virtualJoystick = virtualJoystick;
  }, [cameraMode, timeOfDay, crowdDensity, crowdSpeed, walkSpeed, showLandmarkPins, selectedLandmark, virtualJoystick]);

  // Handle Landmark Selection Transition
  useEffect(() => {
    if (selectedLandmark) {
      const [tx, ty, tz] = selectedLandmark.targetLookAt;
      const dist = selectedLandmark.cameraDistance;
      const h = selectedLandmark.cameraHeight;

      // Smoothly update orbit target and radius
      stateRef.current.orbitTarget.set(tx, ty, tz);
      stateRef.current.orbitRadius = dist;
      stateRef.current.orbitPhi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, Math.asin(h / dist) || 0.6));
    }
  }, [selectedLandmark]);

  // Main 3D Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.0055);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.2,
      1200
    );
    camera.position.set(22, 12, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e0, 1.8);
    sunLight.position.set(45, 65, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 180;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Warm Kaaba Spotlights for night illumination
    const kaabaSpot1 = new THREE.SpotLight(0xffe6a3, 2.5, 60, Math.PI / 4, 0.5);
    kaabaSpot1.position.set(25, 18, 25);
    kaabaSpot1.target.position.set(0, 6, 0);
    scene.add(kaabaSpot1);
    scene.add(kaabaSpot1.target);

    const kaabaSpot2 = new THREE.SpotLight(0xffe6a3, 2.5, 60, Math.PI / 4, 0.5);
    kaabaSpot2.position.set(-25, 18, -25);
    kaabaSpot2.target.position.set(0, 6, 0);
    scene.add(kaabaSpot2);
    scene.add(kaabaSpot2.target);

    // 3. Sky Dome
    const skyGeo = new THREE.SphereGeometry(600, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x070b14,
      side: THREE.BackSide,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // Procedural Stars for Night/Tahajjud
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 580;
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = Math.abs(r * Math.cos(phi)) + 15; // Above horizon
      starPositions[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0.9,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 4. Mataf Floor (White Thassos Marble Plaza)
    const matafGeo = new THREE.CircleGeometry(65, 64);
    const matafTex = createMatafMarbleTexture();
    const matafMat = new THREE.MeshStandardMaterial({
      map: matafTex,
      roughness: 0.18,
      metalness: 0.05,
    });
    const matafFloor = new THREE.Mesh(matafGeo, matafMat);
    matafFloor.rotation.x = -Math.PI / 2;
    matafFloor.receiveShadow = true;
    scene.add(matafFloor);

    // Outer Plaza Floor
    const outerFloorGeo = new THREE.RingGeometry(65, 140, 64);
    const outerFloorMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecef,
      roughness: 0.35,
      metalness: 0.02,
    });
    const outerFloor = new THREE.Mesh(outerFloorGeo, outerFloorMat);
    outerFloor.rotation.x = -Math.PI / 2;
    outerFloor.position.y = -0.02;
    outerFloor.receiveShadow = true;
    scene.add(outerFloor);

    // 5. The Holy Kaaba (পবিত্র কাবা শরীফ)
    const kaabaGroup = new THREE.Group();
    scene.add(kaabaGroup);

    // Kaaba proportions: width (X) = 11.2m, height (Y) = 13.1m, depth (Z) = 12.0m
    const kw = 11.2;
    const kh = 13.1;
    const kd = 12.0;

    // Kiswah Texture & Materials
    const kiswahTex = createKiswahTexture();
    const kiswahMat = new THREE.MeshStandardMaterial({
      map: kiswahTex,
      color: 0x111111,
      roughness: 0.85,
      metalness: 0.15,
    });

    const kaabaGeo = new THREE.BoxGeometry(kw, kh, kd);
    const kaabaMesh = new THREE.Mesh(kaabaGeo, kiswahMat);
    kaabaMesh.position.y = kh / 2 + 0.35; // Sitting above marble Shadharwan
    kaabaMesh.castShadow = true;
    kaabaMesh.receiveShadow = true;
    kaabaGroup.add(kaabaMesh);

    // Shadharwan (The lower marble base skirting with brass rings)
    const shadharwanGeo = new THREE.BoxGeometry(kw + 0.8, 0.45, kd + 0.8);
    const shadharwanMat = new THREE.MeshStandardMaterial({
      color: 0xf5f6f8,
      roughness: 0.2,
      metalness: 0.1,
    });
    const shadharwan = new THREE.Mesh(shadharwanGeo, shadharwanMat);
    shadharwan.position.y = 0.225;
    shadharwan.receiveShadow = true;
    kaabaGroup.add(shadharwan);

    // Bab al-Kaaba (The Golden Door) on North-East Wall (+X side)
    const doorTex = createBabKaabaTexture();
    const doorGeo = new THREE.PlaneGeometry(2.3, 3.4);
    const doorMat = new THREE.MeshStandardMaterial({
      map: doorTex,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x3d2800,
      emissiveIntensity: 0.2,
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(kw / 2 + 0.05, 4.2, 1.8);
    doorMesh.rotation.y = Math.PI / 2;
    kaabaGroup.add(doorMesh);

    // Door Frame / Threshold (Elevated Marble & Gold Platform)
    const doorFrameGeo = new THREE.BoxGeometry(0.3, 3.8, 2.7);
    const doorFrameMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.3,
    });
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
    doorFrame.position.set(kw / 2 + 0.08, 4.2, 1.8);
    kaabaGroup.add(doorFrame);

    // Mizab al-Rahmah (The Golden Rain Spout on Roof above Hateem: -Z side)
    const spoutGroup = new THREE.Group();
    const spoutGeo = new THREE.BoxGeometry(0.5, 0.35, 1.8);
    const spoutMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
    });
    const spout = new THREE.Mesh(spoutGeo, spoutMat);
    spout.position.set(0, kh + 0.3, -kd / 2 - 0.7);
    spout.castShadow = true;
    spoutGroup.add(spout);
    kaabaGroup.add(spoutGroup);

    // Hajar al-Aswad (The Black Stone in Silver Casing) at East Corner (+X, +Z)
    const hajarGroup = new THREE.Group();
    // Silver oval bezel
    const silverCasingGeo = new THREE.TorusGeometry(0.42, 0.16, 16, 32);
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.95,
      roughness: 0.15,
    });
    const silverCasing = new THREE.Mesh(silverCasingGeo, silverMat);
    silverCasing.rotation.y = Math.PI / 4;
    silverCasing.position.set(kw / 2 + 0.15, 1.6, kd / 2 + 0.15);
    hajarGroup.add(silverCasing);

    // Black Stone Core
    const blackStoneGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const blackStoneMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.4,
      metalness: 0.2,
    });
    const blackStone = new THREE.Mesh(blackStoneGeo, blackStoneMat);
    blackStone.position.set(kw / 2 + 0.15, 1.6, kd / 2 + 0.15);
    hajarGroup.add(blackStone);

    // Subtle spiritual glow light at Hajar al-Aswad
    const hajarLight = new THREE.PointLight(0x7df9ff, 0.8, 4);
    hajarLight.position.set(kw / 2 + 0.4, 1.6, kd / 2 + 0.4);
    hajarGroup.add(hajarLight);
    kaabaGroup.add(hajarGroup);

    // Rukn Yamani (Yemeni Corner at -X, +Z) with distinct stones
    const yamaniGeo = new THREE.BoxGeometry(0.35, 1.4, 0.35);
    const yamaniMat = new THREE.MeshStandardMaterial({
      color: 0xb59972,
      roughness: 0.9,
    });
    const yamani = new THREE.Mesh(yamaniGeo, yamaniMat);
    yamani.position.set(-kw / 2 - 0.05, 1.1, kd / 2 + 0.05);
    kaabaGroup.add(yamani);

    // 6. Hijr Ismail / Hateem (হাতিমে কাবা - Semi-circular Arc on -Z side)
    const hateemGroup = new THREE.Group();
    const hateemRadius = 7.5;
    const hateemWallShape = new THREE.Shape();
    // Arc wall geometry
    const hateemSegments = 40;
    const hateemPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= hateemSegments; i++) {
      const angle = Math.PI + (i / hateemSegments) * Math.PI;
      const x = Math.cos(angle) * hateemRadius;
      const z = Math.sin(angle) * (hateemRadius * 0.72) - kd / 2 - 0.5;
      hateemPoints.push(new THREE.Vector3(x, 0, z));
    }
    const hateemCurve = new THREE.CatmullRomCurve3(hateemPoints);
    const hateemWallGeo = new THREE.TubeGeometry(hateemCurve, 40, 0.35, 8, false);
    const hateemWallMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.2,
      metalness: 0.05,
    });
    const hateemWall = new THREE.Mesh(hateemWallGeo, hateemWallMat);
    hateemWall.position.y = 0.7;
    hateemWall.castShadow = true;
    hateemWall.receiveShadow = true;
    hateemGroup.add(hateemWall);

    // Hateem Inner Paved Floor
    const hateemFloorGeo = new THREE.CircleGeometry(hateemRadius * 0.9, 32, 0, Math.PI);
    const hateemFloorMat = new THREE.MeshStandardMaterial({
      color: 0xf0f3f5,
      roughness: 0.25,
    });
    const hateemFloor = new THREE.Mesh(hateemFloorGeo, hateemFloorMat);
    hateemFloor.rotation.x = -Math.PI / 2;
    hateemFloor.rotation.z = Math.PI;
    hateemFloor.position.set(0, 0.02, -kd / 2 - 0.5);
    hateemGroup.add(hateemFloor);
    scene.add(hateemGroup);

    // 7. Maqam Ibrahim (মাকামে ইব্রাহিম - Hexagonal Golden Kiosk at +X side)
    const maqamGroup = new THREE.Group();
    maqamGroup.position.set(13.5, 0, 0);

    // Octagonal / Hexagonal Marble Pedestal
    const maqamBaseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.7, 8);
    const maqamBaseMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });
    const maqamBase = new THREE.Mesh(maqamBaseGeo, maqamBaseMat);
    maqamBase.position.y = 0.35;
    maqamGroup.add(maqamBase);

    // Golden Brass Hexagonal Kiosk Cage
    const maqamKioskGeo = new THREE.CylinderGeometry(1.0, 1.1, 1.9, 8);
    const maqamKioskMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
    });
    const maqamKiosk = new THREE.Mesh(maqamKioskGeo, maqamKioskMat);
    maqamKiosk.position.y = 1.65;
    maqamGroup.add(maqamKiosk);

    // Crystal Glass enclosure
    const maqamGlassGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 16);
    const maqamGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
    });
    const maqamGlass = new THREE.Mesh(maqamGlassGeo, maqamGlassMat);
    maqamGlass.position.y = 1.65;
    maqamGroup.add(maqamGlass);

    // Golden Dome Roof
    const maqamDomeGeo = new THREE.SphereGeometry(1.05, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const maqamDomeMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
    });
    const maqamDome = new THREE.Mesh(maqamDomeGeo, maqamDomeMat);
    maqamDome.position.y = 2.6;
    maqamGroup.add(maqamDome);
    scene.add(maqamGroup);

    // 8. Tawaf Green Start Line (Radial LED Green Line from Hajar al-Aswad)
    const greenLineGeo = new THREE.PlaneGeometry(52, 0.45);
    const greenLineMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const greenLine = new THREE.Mesh(greenLineGeo, greenLineMat);
    greenLine.rotation.x = -Math.PI / 2;
    // Align with Hajar al-Aswad angle (approx 35 degrees)
    const hajarAngle = Math.atan2(kd / 2 + 0.15, kw / 2 + 0.15);
    greenLine.rotation.z = -hajarAngle;
    greenLine.position.set(28 * Math.cos(hajarAngle), 0.03, 28 * Math.sin(hajarAngle));
    scene.add(greenLine);

    // Green beacon pillar at the edge of the courtyard
    const beaconGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(52 * Math.cos(hajarAngle), 2.0, 52 * Math.sin(hajarAngle));
    scene.add(beacon);

    // 9. Masjid al-Haram Colonnades & Arches (মসজিদুল হারামের খিলান ও বারান্দা)
    const colonnadeGroup = new THREE.Group();
    const colonnadeRadius = 66;
    const archCount = 36;
    const colonnadeTex = createColonnadeTexture();

    const columnGeo = new THREE.CylinderGeometry(0.65, 0.75, 10, 12);
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0ea,
      roughness: 0.3,
    });

    const roofGeo = new THREE.BoxGeometry(11, 2.2, 14);
    const roofMat = new THREE.MeshStandardMaterial({
      map: colonnadeTex,
      roughness: 0.4,
    });

    const smallDomeGeo = new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const smallDomeMat = new THREE.MeshStandardMaterial({
      color: 0xf0e6d2,
      roughness: 0.35,
    });

    for (let i = 0; i < archCount; i++) {
      const angle = (i / archCount) * Math.PI * 2;
      const x = Math.cos(angle) * colonnadeRadius;
      const z = Math.sin(angle) * colonnadeRadius;

      // Inner column
      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(x, 5, z);
      col.castShadow = true;
      colonnadeGroup.add(col);

      // Arch roof segment
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(x * 1.08, 11, z * 1.08);
      roof.rotation.y = -angle;
      colonnadeGroup.add(roof);

      // Decorative golden dome over every 2nd arch
      if (i % 2 === 0) {
        const dome = new THREE.Mesh(smallDomeGeo, smallDomeMat);
        dome.position.set(x * 1.08, 12.1, z * 1.08);
        colonnadeGroup.add(dome);
      }
    }
    scene.add(colonnadeGroup);

    // 10. Grand Minarets of Masjid al-Haram (সুউচ্চ ৪টি শ্বেত মিনার)
    const minaretAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    minaretAngles.forEach((angle) => {
      const minRadius = 88;
      const mx = Math.cos(angle) * minRadius;
      const mz = Math.sin(angle) * minRadius;

      const minGroup = new THREE.Group();
      minGroup.position.set(mx, 0, mz);

      // Octagonal base
      const baseM = new THREE.Mesh(
        new THREE.CylinderGeometry(3.5, 4.2, 16, 8),
        new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.3 })
      );
      baseM.position.y = 8;
      minGroup.add(baseM);

      // Tower shaft
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 3.2, 38, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
      );
      shaft.position.y = 35;
      minGroup.add(shaft);

      // Balcony
      const balcony = new THREE.Mesh(
        new THREE.CylinderGeometry(3.8, 3.4, 2.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 })
      );
      balcony.position.y = 55;
      minGroup.add(balcony);

      // Spire & Golden Crescent
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(1.8, 14, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 })
      );
      spire.position.y = 63;
      minGroup.add(spire);

      // Glowing night light on minarets
      const minLight = new THREE.PointLight(0x6ee7b7, 1.2, 30);
      minLight.position.set(0, 56, 0);
      minGroup.add(minLight);

      scene.add(minGroup);
    });

    // 11. Makkah Royal Clock Tower (আবরাজ আল-বাইত ক্লক টাওয়ার) in background
    const clockGroup = new THREE.Group();
    clockGroup.position.set(0, 0, 165);

    // Main tower body
    const towerGeo = new THREE.BoxGeometry(42, 130, 36);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x27303f,
      roughness: 0.5,
    });
    const towerMesh = new THREE.Mesh(towerGeo, towerMat);
    towerMesh.position.y = 65;
    clockGroup.add(towerMesh);

    // Clock Face Section
    const clockFaceTex = createClockFaceTexture();
    const clockFaceGeo = new THREE.PlaneGeometry(28, 28);
    const clockFaceMat = new THREE.MeshStandardMaterial({
      map: clockFaceTex,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
    });
    const clockFace = new THREE.Mesh(clockFaceGeo, clockFaceMat);
    clockFace.position.set(0, 105, -18.2);
    clockFace.rotation.y = Math.PI;
    clockGroup.add(clockFace);

    // Clock Spire with Green Crescent
    const spireGeo = new THREE.ConeGeometry(6, 45, 8);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x10b981,
      emissiveIntensity: 0.3,
    });
    const spireM = new THREE.Mesh(spireGeo, spireMat);
    spireM.position.y = 150;
    clockGroup.add(spireM);
    scene.add(clockGroup);

    // 12. Pilgrims Simulation (মানুষের জীবন্ত তাওয়াফ - InstancedMesh)
    // Pilgrim Model: Upper body (white Ihram cloth), lower body, head
    const maxPilgrims = 2200;
    const pilgrimGeo = new THREE.CylinderGeometry(0.24, 0.3, 1.65, 7);
    const headGeo = new THREE.SphereGeometry(0.18, 7, 7);
    headGeo.translate(0, 0.95, 0);

    // Combine into single geometry for InstancedMesh
    // We can use a composite geometry
    const mergedPilgrimGeo = new THREE.BufferGeometry();
    const pilgrimMat = new THREE.MeshStandardMaterial({
      color: 0xf5f7fb,
      roughness: 0.7,
      metalness: 0.05,
    });

    const pilgrimMesh = new THREE.InstancedMesh(pilgrimGeo, pilgrimMat, maxPilgrims);
    pilgrimMesh.castShadow = true;
    pilgrimMesh.receiveShadow = true;
    scene.add(pilgrimMesh);

    // Data structure for each pilgrim's orbit dynamics
    interface PilgrimData {
      radius: number;
      angle: number;
      speed: number;
      bobFreq: number;
      bobPhase: number;
      radialWobble: number;
      isFemaleOrGuard: boolean;
      color: THREE.Color;
    }

    const pilgrimsData: PilgrimData[] = [];
    const dummy = new THREE.Object3D();
    const whiteColor = new THREE.Color(0xfcfdfd);
    const offWhiteColor = new THREE.Color(0xedf2f7);
    const darkAbayaColor = new THREE.Color(0x1a1a1e);

    for (let i = 0; i < maxPilgrims; i++) {
      // Concentric orbits from radius 9.5m up to 55m
      // Denser distribution closer to the Kaaba
      const rRatio = Math.pow(Math.random(), 0.75);
      const radius = 9.5 + rRatio * 44;
      const angle = Math.random() * Math.PI * 2;
      // Closer rings move slightly faster in angular velocity
      const baseAngularSpeed = (0.28 / Math.pow(radius, 0.65)) * (0.85 + Math.random() * 0.3);
      const isFemale = Math.random() < 0.22;
      const color = isFemale ? (Math.random() < 0.6 ? darkAbayaColor : offWhiteColor) : whiteColor;

      pilgrimsData.push({
        radius,
        angle,
        speed: baseAngularSpeed,
        bobFreq: 4.5 + Math.random() * 1.5,
        bobPhase: Math.random() * Math.PI * 2,
        radialWobble: (Math.random() - 0.5) * 0.4,
        isFemaleOrGuard: isFemale,
        color,
      });

      pilgrimMesh.setColorAt(i, color);
    }
    pilgrimMesh.instanceColor!.needsUpdate = true;

    // 13. Interactive 3D Landmark Pins
    const pinGroup = new THREE.Group();
    scene.add(pinGroup);

    interface LandmarkPin {
      id: string;
      landmark: Landmark;
      mesh: THREE.Mesh;
      light: THREE.PointLight;
    }

    const landmarkPins: LandmarkPin[] = [];
    const pinGeo = new THREE.OctahedronGeometry(0.45, 0);

    LANDMARKS.forEach((lm) => {
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0x10b981,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.9,
      });
      const pMesh = new THREE.Mesh(pinGeo, pinMat);
      pMesh.position.set(lm.position[0], lm.position[1] + 1.2, lm.position[2]);

      const pLight = new THREE.PointLight(0x34d399, 0.6, 6);
      pLight.position.copy(pMesh.position);

      pinGroup.add(pMesh);
      pinGroup.add(pLight);

      landmarkPins.push({
        id: lm.id,
        landmark: lm,
        mesh: pMesh,
        light: pLight,
      });
    });

    // 14. Input & Interaction Listeners
    // Raycasting for clicking landmark pins in 3D
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      stateRef.current.isPointerDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      stateRef.current.prevPointerX = clientX;
      stateRef.current.prevPointerY = clientY;
    };

    const handlePointerUp = () => {
      stateRef.current.isPointerDown = false;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (stateRef.current.isPointerDown) {
        const dx = clientX - stateRef.current.prevPointerX;
        const dy = clientY - stateRef.current.prevPointerY;

        if (stateRef.current.cameraMode === 'walk') {
          // First person look around
          stateRef.current.walkYaw -= dx * 0.004;
          stateRef.current.walkPitch = Math.max(
            -Math.PI / 3,
            Math.min(Math.PI / 3, stateRef.current.walkPitch - dy * 0.004)
          );
        } else if (stateRef.current.cameraMode === 'orbit' || stateRef.current.cameraMode === 'drone') {
          // Orbit rotation
          stateRef.current.orbitTheta -= dx * 0.006;
          stateRef.current.orbitPhi = Math.max(
            0.15,
            Math.min(Math.PI / 2 - 0.05, stateRef.current.orbitPhi - dy * 0.005)
          );
        }

        stateRef.current.prevPointerX = clientX;
        stateRef.current.prevPointerY = clientY;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (stateRef.current.cameraMode === 'orbit' || stateRef.current.cameraMode === 'drone') {
        stateRef.current.orbitRadius = Math.max(
          8,
          Math.min(110, stateRef.current.orbitRadius + e.deltaY * 0.035)
        );
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const pinMeshes = landmarkPins.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(pinMeshes);

      if (intersects.length > 0) {
        const hit = landmarkPins.find((p) => p.mesh === intersects[0].object);
        if (hit) {
          onSelectLandmark(hit.landmark);
        }
      }
    };

    // Keyboard handlers for walk mode
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          stateRef.current.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          stateRef.current.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          stateRef.current.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          stateRef.current.keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          stateRef.current.keys.sprint = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          stateRef.current.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          stateRef.current.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          stateRef.current.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          stateRef.current.keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          stateRef.current.keys.sprint = false;
          break;
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handlePointerDown);
    domElement.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    domElement.addEventListener('wheel', handleWheel, { passive: true });
    domElement.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 15. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 16. Animation Loop (RAF)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      const {
        cameraMode,
        timeOfDay,
        crowdDensity,
        crowdSpeed,
        walkSpeed,
        showLandmarkPins,
        virtualJoystick,
      } = stateRef.current;

      // Toggle Landmark Pins Visibility & Hover Bob
      pinGroup.visible = showLandmarkPins;
      if (showLandmarkPins) {
        landmarkPins.forEach((p, idx) => {
          p.mesh.rotation.y += 0.02;
          p.mesh.position.y = p.landmark.position[1] + 1.2 + Math.sin(elapsedTime * 2 + idx) * 0.15;
          p.light.position.y = p.mesh.position.y;
        });
      }

      // Time of Day Lighting Transitions
      let targetSkyColor = 0x0a0c10;
      let targetSunIntensity = 1.8;
      let targetAmbientIntensity = 0.6;
      let targetSunColor = 0xfff6e0;
      let targetFogDensity = 0.0055;
      let nightLightIntensity = 2.5;

      if (timeOfDay === 'tahajjud') {
        // Serene starry night
        targetSkyColor = 0x04060b;
        targetSunIntensity = 0.08;
        targetAmbientIntensity = 0.35;
        targetSunColor = 0x6b8afd;
        targetFogDensity = 0.004;
        nightLightIntensity = 3.2;
        starMat.opacity = 0.95;
      } else if (timeOfDay === 'fajr') {
        // Soft purple and golden dawn
        targetSkyColor = 0x1f1a30;
        targetSunIntensity = 0.9;
        targetAmbientIntensity = 0.55;
        targetSunColor = 0xffc48c;
        targetFogDensity = 0.005;
        nightLightIntensity = 1.5;
        starMat.opacity = 0.25;
      } else if (timeOfDay === 'dhuhr') {
        // Radiant noon
        targetSkyColor = 0x4aa3df;
        targetSunIntensity = 2.2;
        targetAmbientIntensity = 0.85;
        targetSunColor = 0xffffff;
        targetFogDensity = 0.003;
        nightLightIntensity = 0.1;
        starMat.opacity = 0.0;
      } else if (timeOfDay === 'maghrib') {
        // Amber sunset
        targetSkyColor = 0x421b1b;
        targetSunIntensity = 1.1;
        targetAmbientIntensity = 0.5;
        targetSunColor = 0xff8c42;
        targetFogDensity = 0.005;
        nightLightIntensity = 2.2;
        starMat.opacity = 0.4;
      }

      scene.background = new THREE.Color(targetSkyColor);
      skyMat.color.setHex(targetSkyColor);
      (scene.fog as THREE.FogExp2).color.setHex(targetSkyColor);
      (scene.fog as THREE.FogExp2).density = targetFogDensity;
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.05);
      sunLight.color.setHex(targetSunColor);
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmbientIntensity, 0.05);
      kaabaSpot1.intensity = THREE.MathUtils.lerp(kaabaSpot1.intensity, nightLightIntensity, 0.05);
      kaabaSpot2.intensity = THREE.MathUtils.lerp(kaabaSpot2.intensity, nightLightIntensity, 0.05);

      // Pilgrim Crowd Simulation Update (Anti-clockwise Tawaf motion)
      const activePilgrimCount = Math.min(crowdDensity, maxPilgrims);
      pilgrimMesh.count = activePilgrimCount;

      for (let i = 0; i < activePilgrimCount; i++) {
        const p = pilgrimsData[i];
        // Move counter-clockwise around Kaaba (angle increases)
        p.angle += p.speed * crowdSpeed * delta;
        if (p.angle > Math.PI * 2) p.angle -= Math.PI * 2;

        const effectiveR = p.radius + p.radialWobble;
        const px = Math.cos(p.angle) * effectiveR;
        const pz = Math.sin(p.angle) * effectiveR;

        // Human walking gait oscillation (bobbing up and down)
        const bob = Math.sin(elapsedTime * p.bobFreq + p.bobPhase) * 0.035;
        const py = 0.825 + Math.abs(bob);

        dummy.position.set(px, py, pz);
        // Tangential forward orientation (looking in direction of circumambulation)
        dummy.rotation.y = -p.angle + Math.PI / 2;

        // Slight lateral tilt during walking
        dummy.rotation.z = Math.sin(elapsedTime * p.bobFreq + p.bobPhase) * 0.02;

        dummy.updateMatrix();
        pilgrimMesh.setMatrixAt(i, dummy.matrix);
      }
      pilgrimMesh.instanceMatrix.needsUpdate = true;

      // Camera Choreography per Mode
      if (cameraMode === 'walk') {
        // First Person Walk Mode
        // Compute movement direction from keys and joystick
        let moveX = 0;
        let moveZ = 0;

        if (stateRef.current.keys.forward) moveZ -= 1;
        if (stateRef.current.keys.backward) moveZ += 1;
        if (stateRef.current.keys.left) moveX -= 1;
        if (stateRef.current.keys.right) moveX += 1;

        // Virtual joystick input
        if (virtualJoystick) {
          moveX += virtualJoystick.x;
          moveZ -= virtualJoystick.y;
        }

        const moveLen = Math.hypot(moveX, moveZ);
        if (moveLen > 0.05) {
          const normX = moveX / moveLen;
          const normZ = moveZ / moveLen;

          const speedMultiplier = stateRef.current.keys.sprint ? 1.8 : 1.0;
          const currentSpeed = walkSpeed * speedMultiplier * delta;

          // Forward and Right vectors relative to walkYaw
          const forward = new THREE.Vector3(-Math.sin(stateRef.current.walkYaw), 0, -Math.cos(stateRef.current.walkYaw));
          const right = new THREE.Vector3(Math.cos(stateRef.current.walkYaw), 0, -Math.sin(stateRef.current.walkYaw));

          const newPos = stateRef.current.walkPos.clone();
          newPos.addScaledVector(forward, -normZ * currentSpeed);
          newPos.addScaledVector(right, normX * currentSpeed);

          // Boundary & Collision Detection:
          // 1. Cannot walk inside Kaaba walls: Kaaba is 11.2m x 12.0m, buffer to 6.2m and 6.6m
          const distKaabaX = Math.abs(newPos.x);
          const distKaabaZ = Math.abs(newPos.z);
          const insideKaaba = distKaabaX < 6.2 && distKaabaZ < 6.6;

          // 2. Mataf outer perimeter limit (radius 62m)
          const distFromCenter = Math.hypot(newPos.x, newPos.z);
          const withinMataf = distFromCenter < 62;

          if (!insideKaaba && withinMataf) {
            stateRef.current.walkPos.copy(newPos);
          }
        }

        // Camera position at pilgrim eye-height (~1.72m)
        camera.position.copy(stateRef.current.walkPos);
        camera.position.y = 1.72;

        // Camera look target based on yaw and pitch
        const lookDir = new THREE.Vector3(
          -Math.sin(stateRef.current.walkYaw) * Math.cos(stateRef.current.walkPitch),
          Math.sin(stateRef.current.walkPitch),
          -Math.cos(stateRef.current.walkYaw) * Math.cos(stateRef.current.walkPitch)
        );
        camera.lookAt(camera.position.clone().add(lookDir));

      } else if (cameraMode === 'tawaf') {
        // Join Tawaf Follower Mode: smoothly circumambulate with pilgrims
        stateRef.current.tawafAngle += (0.18 / Math.pow(stateRef.current.tawafRadius, 0.65)) * crowdSpeed * delta;
        if (stateRef.current.tawafAngle > Math.PI * 2) {
          stateRef.current.tawafAngle -= Math.PI * 2;
        }

        // Detect crossing the Green Line of Hajar al-Aswad to complete a circuit!
        const greenLineCrossAngle = hajarAngle;
        const angleDiff = Math.abs(stateRef.current.tawafAngle - greenLineCrossAngle);
        if (angleDiff < 0.08 && !stateRef.current.hasPassedGreenLine) {
          stateRef.current.hasPassedGreenLine = true;
          stateRef.current.tawafLap = (stateRef.current.tawafLap % 7) + 1;
          onTawafLapCompleted(stateRef.current.tawafLap);
        } else if (angleDiff > 0.4) {
          stateRef.current.hasPassedGreenLine = false;
        }

        const r = stateRef.current.tawafRadius;
        const curAngle = stateRef.current.tawafAngle;
        const camX = Math.cos(curAngle) * r;
        const camZ = Math.sin(curAngle) * r;

        // Place camera smoothly at eye level, looking forward along the curve and slightly toward Kaaba
        camera.position.set(camX, 2.2, camZ);
        const lookAheadAngle = curAngle + 0.35;
        const targetX = Math.cos(lookAheadAngle) * (r * 0.82);
        const targetZ = Math.sin(lookAheadAngle) * (r * 0.82);
        camera.lookAt(targetX, 4.0, targetZ);

      } else if (cameraMode === 'drone') {
        // Bird's eye aerial view over the sacred sanctuary
        const targetRadius = 60;
        const targetY = 55;
        camera.position.set(
          Math.sin(elapsedTime * 0.05) * targetRadius,
          targetY,
          Math.cos(elapsedTime * 0.05) * targetRadius
        );
        camera.lookAt(0, 3, 0);

      } else {
        // Orbit Mode
        const { orbitTheta, orbitPhi, orbitRadius, orbitTarget } = stateRef.current;
        const camX = orbitTarget.x + orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
        const camY = orbitTarget.y + orbitRadius * Math.cos(orbitPhi);
        const camZ = orbitTarget.z + orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta);

        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        camera.lookAt(orbitTarget);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 17. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', handlePointerDown);
      domElement.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      tabIndex={0}
      aria-label="3D Kaaba Viewport"
    />
  );
};
