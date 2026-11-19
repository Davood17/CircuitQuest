'use client';

/**
 * Robot3DScene — interactive 3D "X-Ray discovery" of the lesson robot.
 * v2 (realistic edition): the chest is a real cavity with a hinged hatch,
 * and the internals are believable electronics, not cartoon shapes:
 *
 *   ربات ۱ — closed robot (cute shell, camera far)
 *   ربات ۲ — chest hatch swings open → real PCB, battery, motor visible inside
 *   ربات ۳ — full exploded stack (hatch + back cover + head + arms separate)
 *   ربات ۴ — tap a part → glides to camera, warm glow, kid card in footer
 *   ربات ۵ — exploded callouts: dashed leader lines + RTL labels
 *
 * Render quality: offline procedural environment map (Lightformers, no HDR
 * fetch), ACES tone mapping, PBR metals, procedural PCB canvas texture.
 * Zoom-driven reveal is latched (one-way, like a real discovery).
 */

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  Line,
  OrbitControls,
  RoundedBox,
} from '@react-three/drei';
import { useI18n } from '@/lib/i18n';
import { ROBOT_PARTS, type RobotPartDef, type V3 } from './parts-data';

interface ShellDef { id: string; closed: V3; open: V3; }

const SHELLS: ShellDef[] = [
  { id: 'head', closed: [0, 1.06, 0], open: [0, 1.62, 0.15] },
  { id: 'torso', closed: [0, -0.15, 0], open: [0, -0.15, -0.35] },
  { id: 'front', closed: [0, -0.15, 0.5], open: [0, -0.75, 1.5] },
  { id: 'back', closed: [0, -0.15, -0.56], open: [0, -0.12, -1.35] },
  { id: 'armL', closed: [-0.95, -0.35, 0], open: [-1.38, -0.15, 0.22] },
  { id: 'armR', closed: [0.95, -0.35, 0], open: [1.38, -0.15, 0.22] },
  { id: 'legL', closed: [-0.34, -1.02, 0], open: [-0.44, -1.45, 0.08] },
  { id: 'legR', closed: [0.34, -1.02, 0], open: [0.44, -1.45, 0.08] },
];

// callout label column heights (world space) — image stage «ربات ۵»

interface ControlLike { getDistance(): number; target: THREE.Vector3; }

export interface Robot3DSceneProps {
  motion: boolean;
  /** stage>=3 reported by the wrapper → show callout labels */
  exploded: boolean;
  discovered: Record<string, boolean>;
  /** controlled selection — the wrapper owns it (footer card + discovery tracking) */
  selected: string | null;
  onSelect: (id: string | null) => void;
  onStageChange: (stage: number) => void;
}

// ------------------------------------------------------------- procedural art

/** PCB top face: FR4 solder mask + copper traces + gold pads + silkscreen. */
function makeBoardTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 400;
  const g = c.getContext('2d')!;

  g.fillStyle = '#0a4f26';
  g.fillRect(0, 0, 512, 400);

  // faint mottling so the mask doesn't look flat
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.02})`;
    g.beginPath();
    g.arc(Math.random() * 512, Math.random() * 400, 6 + Math.random() * 26, 0, Math.PI * 2);
    g.fill();
  }

  // copper traces under the mask
  g.strokeStyle = '#17843f';
  g.lineWidth = 7;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const traces: number[][][] = [
    [[40, 70], [150, 70], [190, 110], [300, 110]],
    [[40, 150], [120, 150], [160, 190], [160, 260], [230, 300]],
    [[470, 90], [400, 90], [360, 130], [360, 200], [300, 240]],
    [[470, 300], [380, 300], [340, 260], [250, 260]],
    [[200, 50], [200, 100], [240, 140]],
    [[90, 330], [90, 290], [130, 250]],
    [[420, 350], [420, 310], [370, 270], [300, 270]],
    [[256, 330], [256, 290], [220, 250]],
  ];
  for (const pts of traces) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
  }

  // vias — small gold dots
  g.fillStyle = '#d9a441';
  for (const [x, y] of [
    [150, 70], [190, 110], [300, 110], [120, 150], [160, 260], [230, 300],
    [360, 200], [300, 240], [340, 260], [250, 260], [240, 140], [130, 250],
    [370, 270], [300, 270], [90, 330], [420, 350], [220, 250], [256, 290],
  ]) {
    g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill();
  }

  // SMD parts printed on the mask
  g.fillStyle = '#141a24';
  g.fillRect(96, 60, 44, 26);
  g.fillRect(392, 150, 40, 22);
  g.fillStyle = '#b9c2cf';
  g.fillRect(90, 64, 8, 18); g.fillRect(138, 64, 8, 18);
  g.fillRect(386, 153, 8, 16); g.fillRect(430, 153, 8, 16);
  g.fillStyle = '#c8a165';
  g.fillRect(300, 330, 26, 12); g.fillRect(332, 330, 26, 12);

  // silkscreen
  g.strokeStyle = 'rgba(238,242,255,0.8)';
  g.lineWidth = 3;
  g.strokeRect(14, 14, 484, 372);
  g.strokeRect(196, 128, 124, 124);
  g.strokeRect(58, 198, 74, 48);
  g.font = 'bold 22px sans-serif';
  g.fillStyle = 'rgba(238,242,255,0.9)';
  g.fillText('CQ-R1 v2', 196, 374);
  g.font = 'bold 15px sans-serif';
  g.fillText('MCU', 232, 122);
  g.fillText('C3', 70, 192);

  // corner mounting holes
  for (const [x, y] of [[34, 34], [478, 34], [34, 366], [478, 366]]) {
    g.beginPath(); g.arc(x, y, 13, 0, Math.PI * 2); g.fillStyle = '#d9a441'; g.fill();
    g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fillStyle = '#06210f'; g.fill();
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Soft radial halo used behind the focused part (additive sprite). */
function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.35, 'rgba(251,191,36,0.45)');
  grad.addColorStop(1, 'rgba(251,191,36,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------ scene

export default function Robot3DScene({ motion, exploded, discovered, selected, onSelect, onStageChange }: Robot3DSceneProps) {
  const downPos = useRef<{ x: number; y: number } | null>(null);

  // tap-vs-drag guard: record pointer down globally, compare on click
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dn = (e: PointerEvent) => { downPos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('pointerdown', dn, { passive: true });
    return () => window.removeEventListener('pointerdown', dn);
  }, []);

  const tap = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    const ev = e.nativeEvent;
    const d = downPos.current ? Math.hypot(ev.clientX - downPos.current.x, ev.clientY - downPos.current.y) : 0;
    if (d > 8) return; // it was a drag/rotate, not a tap
    e.stopPropagation();
    onSelect(id);
  };

  // shells swallow clicks so hidden parts can't be selected through the body
  const shellTap = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); };

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0.9, 1.75, 7.4], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelect(null)}
      style={{ touchAction: 'none' }}
    >
      <hemisphereLight args={['#e0f2fe', '#ccfbf1', 0.5]} />
      <directionalLight position={[4, 7, 5]} intensity={1.2} />
      <directionalLight position={[-5, 3, -4]} intensity={0.35} color="#99f6e4" />
      <directionalLight position={[0, 4, -6]} intensity={0.5} color="#bae6fd" />

      {/* offline studio reflections for the metal parts (no HDR fetch) */}
      <Environment resolution={256} frames={1} background={false}>
        <Lightformer intensity={1.6} position={[0, 4, 3]} scale={[7, 3, 1]} color="#ffffff" />
        <Lightformer intensity={0.8} position={[-4, 2, -2]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} color="#ccfbf1" />
        <Lightformer intensity={0.8} position={[4, 1, -3]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} color="#bae6fd" />
        <Lightformer intensity={0.45} position={[0, -3, 2]} rotation-x={Math.PI / 2} scale={[6, 2, 1]} color="#f0fdfa" />
      </Environment>

      <RobotRig
        motion={motion}
        exploded={exploded}
        discovered={discovered}
        selected={selected}
        tap={tap}
        shellTap={shellTap}
        onStageChange={onStageChange}
      />
      <ContactShadows position={[0, -1.32, 0]} opacity={0.3} scale={9} blur={2.4} far={3.2} resolution={256} color="#0f766e" />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.09}
        rotateSpeed={0.85}
        zoomSpeed={0.9}
        minDistance={2.3}
        maxDistance={8.5}
        minPolarAngle={0.55}
        maxPolarAngle={2.15}
        target={[0, 0.35, 0]}
      />
    </Canvas>
  );
}

// ------------------------------------------------------------- robot rig

interface RigProps {
  motion: boolean;
  exploded: boolean;
  discovered: Record<string, boolean>;
  selected: string | null;
  tap: (id: string) => (e: ThreeEvent<MouseEvent>) => void;
  shellTap: (e: ThreeEvent<MouseEvent>) => void;
  onStageChange: (stage: number) => void;
}

function RobotRig({ motion, exploded, discovered, selected, tap, shellTap, onStageChange }: RigProps) {
  const reveal = useRef(0); // 0 closed … 1 chest fully open
  const explode = useRef(0); // 0 assembled … 1 exploded
  const stageRef = useRef(0);
  const dollyFired = useRef(false);
  const dollyBack = useRef(true);
  const selRef = useRef(selected);
  const stageCb = useRef(onStageChange);
  useEffect(() => {
    selRef.current = selected;
  }, [selected]);
  useEffect(() => {
    stageCb.current = onStageChange;
  }, [onStageChange]);

  const shellRefs = useRef<Record<string, THREE.Group | null>>({});
  const hingeRef = useRef<THREE.Group | null>(null);
  const partRefs = useRef<Record<string, THREE.Group | null>>({});
  const glowRefs = useRef<Record<string, THREE.MeshStandardMaterial | null>>({});
  const haloRefs = useRef<Record<string, THREE.Sprite | null>>({});

  const boardTex = useMemo(() => makeBoardTexture(), []);
  const glowTex = useMemo(() => makeGlowTexture(), []);

  const wires = useMemo(() => {
    const mk = (dy: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.3, -0.08 + dy, 0.02),
          new THREE.Vector3(-0.12, 0.06 + dy, 0.1),
          new THREE.Vector3(0.05, 0.1 + dy, 0.12),
          new THREE.Vector3(0.2, -0.02 + dy, 0.1),
          new THREE.Vector3(0.3, -0.1 + dy, 0.02),
        ]),
        40, 0.024, 8, false,
      );
    return { red: mk(0), black: mk(-0.07) };
  }, []);

  const tmp = useMemo(() => ({
    v: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    focus: new THREE.Vector3(),
  }), []);

  const compact = useThree((s) => s.size.width) < 500;

  useFrame((state, dtRaw) => {
    const controls = state.controls as unknown as ControlLike | null;
    if (!controls) return;
    const dt = Math.min(dtRaw, 0.05);
    const cam = state.camera;
    const d = controls.getDistance();
    const lam = motion ? 6 : 999;

    // progressive reveal from zoom (latched — a discovery stays discovered)
    const tReveal = 1 - THREE.MathUtils.smoothstep(d, 3.2, 5.6);
    const tExplode = 1 - THREE.MathUtils.smoothstep(d, 2.55, 3.6);
    reveal.current = Math.max(reveal.current, THREE.MathUtils.damp(reveal.current, tReveal, lam, dt));
    explode.current = Math.max(explode.current, THREE.MathUtils.damp(explode.current, tExplode, lam, dt));
    const ex = 1 - Math.pow(1 - explode.current, 3); // easeOutCubic

    // stage reporting (only on change)
    const stage = explode.current > 0.55 ? 3 : reveal.current > 0.45 ? 2 : d < 6.1 ? 1 : 0;
    if (stage !== stageRef.current) {
      stageRef.current = stage;
      stageCb.current(stage);
    }
    // one-time cinematic pull-back when the robot fully opens
    if (!dollyFired.current && explode.current > 0.6) dollyFired.current = true;
    if (dollyFired.current && dollyBack.current) {
      tmp.v.copy(cam.position).sub(controls.target).normalize();
      const nd = THREE.MathUtils.damp(d, 6.5, 3.0, dt);
      cam.position.copy(controls.target).addScaledVector(tmp.v, nd);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, 0.45, 3.0, dt);
      if (Math.abs(nd - 6.5) < 0.35) dollyBack.current = false;
    }

    // solid shells: explode spread only (no ghosting — the chest is a real cavity)
    for (const s of SHELLS) {
      const g = shellRefs.current[s.id];
      if (!g) continue;
      tmp.v.set(
        THREE.MathUtils.lerp(s.closed[0], s.open[0], ex),
        THREE.MathUtils.lerp(s.closed[1], s.open[1], ex),
        THREE.MathUtils.lerp(s.closed[2], s.open[2], ex),
      );
      g.position.lerp(tmp.v, motion ? 1 - Math.exp(-7 * dt) : 1);
    }

    // chest hatch: drawbridge swing down/out, then fades away (stage 2)
    const hinge = hingeRef.current;
    if (hinge) {
      const target = 1.5 * reveal.current + 0.3 * ex;
      hinge.rotation.x = motion ? THREE.MathUtils.damp(hinge.rotation.x, target, 7, dt) : target;
    }
    const hatchOp = 1 - THREE.MathUtils.smoothstep(reveal.current, 0.55, 0.95);
    const fg = shellRefs.current.front;
    if (fg) {
      fg.traverse((o) => {
        if (o.userData?.hitProxy) return;
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && 'opacity' in m) {
          m.transparent = true;
          m.opacity = hatchOp;
          m.depthWrite = hatchOp > 0.5;
        }
      });
    }

    // parts: explode spread / focus-on-selection / dim others / glow + halo
    cam.getWorldDirection(tmp.dir);
    for (const p of ROBOT_PARTS) {
      const g = partRefs.current[p.id];
      if (!g) continue;
      const isSel = selRef.current === p.id;
      const isDim = selRef.current !== null && !isSel;
      if (isSel) {
        const fd = THREE.MathUtils.clamp(d * 0.5, 1.15, 1.9);
        tmp.focus.copy(cam.position).addScaledVector(tmp.dir, fd);
        g.position.lerp(tmp.focus, motion ? 1 - Math.exp(-5 * dt) : 1);
      } else {
        tmp.v.set(
          THREE.MathUtils.lerp(p.base[0], p.open[0], ex),
          THREE.MathUtils.lerp(p.base[1], p.open[1], ex),
          THREE.MathUtils.lerp(p.base[2], p.open[2], ex),
        );
        g.position.lerp(tmp.v, motion ? 1 - Math.exp(-5.5 * dt) : 1);
      }
      const ts = isSel ? 1.28 : 1;
      const cs = motion ? 1 - Math.exp(-6 * dt) : 1;
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, ts, cs));

      const op = isDim ? 0.25 : 1;
      g.traverse((o) => {
        if (o.userData?.hitProxy) return;
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && 'opacity' in m) {
          m.transparent = m.transparent || isDim;
          m.opacity = op;
          m.depthWrite = op > 0.5;
        }
      });
      const gm = glowRefs.current[p.id];
      if (gm) gm.emissiveIntensity = isSel ? 0.5 + 0.22 * Math.sin(state.clock.elapsedTime * 4) : 0;
      const hm = haloRefs.current[p.id];
      if (hm) {
        const targetOp = isSel ? 0.5 + 0.15 * Math.sin(state.clock.elapsedTime * 4) : 0;
        hm.material.opacity = isSel ? targetOp : Math.max(0, hm.material.opacity - dt * 3);
      }
    }
  });

  const shellSet = (id: string) => (g: THREE.Group | null) => { shellRefs.current[id] = g; };
  const partSet = (id: string) => (g: THREE.Group | null) => { partRefs.current[id] = g; };
  const noRay = () => null;
  const haloSet = (id: string) => (s: THREE.Sprite | null) => { haloRefs.current[id] = s; };

  return (
    <group>
      {/* ═══════════════ HEAD (solid, lifts off at explode) ═══════════════ */}
      <group ref={shellSet('head')} position={SHELLS[0].closed} onClick={shellTap}>
        <RoundedBox args={[1.16, 0.88, 0.98]} radius={0.26} smoothness={6}>
          <meshStandardMaterial color="#14b8a6" roughness={0.38} metalness={0.05} />
        </RoundedBox>
        <RoundedBox args={[0.98, 0.6, 0.1]} radius={0.12} smoothness={6} position={[0, -0.02, 0.46]}>
          <meshStandardMaterial color="#ecfeff" roughness={0.15} metalness={0.1} />
        </RoundedBox>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[0.23 * s, 0.08, 0.5]}>
              <sphereGeometry args={[0.135, 24, 24]} />
              <meshStandardMaterial color="#ffffff" roughness={0.18} />
            </mesh>
            <mesh position={[0.23 * s, 0.08, 0.61]}>
              <sphereGeometry args={[0.06, 18, 18]} />
              <meshStandardMaterial color="#0f172a" roughness={0.15} />
            </mesh>
            <mesh position={[0.23 * s + 0.035 * s, 0.12, 0.65]}>
              <sphereGeometry args={[0.022, 10, 10]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} emissive="#ffffff" emissiveIntensity={0.4} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.17, 0.5]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.12, 0.026, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.3, 12]} />
          <meshStandardMaterial color="#0d9488" roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <sphereGeometry args={[0.095, 20, 20]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.4} roughness={0.25} metalness={0.2} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.62 * s, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.09, 20]} />
            <meshStandardMaterial color="#0d9488" roughness={0.35} metalness={0.15} />
          </mesh>
        ))}
      </group>

      {/* ═══════════ TORSO — real open-front cavity (5 panels + lining) ═══════════ */}
      <group ref={shellSet('torso')} position={SHELLS[1].closed} onClick={shellTap}>
        <RoundedBox args={[1.45, 1.32, 0.14]} radius={0.06} smoothness={5} position={[0, 0, -0.43]}>
          <meshStandardMaterial color="#14b8a6" roughness={0.38} metalness={0.05} />
        </RoundedBox>
        {[-1, 1].map((s) => (
          <RoundedBox key={s} args={[0.14, 1.32, 0.92]} radius={0.05} smoothness={5} position={[0.655 * s, 0, 0]}>
            <meshStandardMaterial color="#14b8a6" roughness={0.38} metalness={0.05} />
          </RoundedBox>
        ))}
        <RoundedBox args={[1.45, 0.14, 0.92]} radius={0.05} smoothness={5} position={[0, 0.59, 0]}>
          <meshStandardMaterial color="#0d9488" roughness={0.4} metalness={0.05} />
        </RoundedBox>
        <RoundedBox args={[1.45, 0.14, 0.92]} radius={0.05} smoothness={5} position={[0, -0.59, 0]}>
          <meshStandardMaterial color="#0d9488" roughness={0.4} metalness={0.05} />
        </RoundedBox>
        {/* dark hollow interior */}
        <mesh>
          <boxGeometry args={[1.14, 1.02, 0.6]} />
          <meshStandardMaterial side={THREE.BackSide} color="#1e293b" roughness={0.95} />
        </mesh>
        {/* neck post under the head */}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 0.3, 18]} />
          <meshStandardMaterial color="#0d9488" roughness={0.4} metalness={0.15} />
        </mesh>
      </group>

      {/* ═══════════ FRONT HATCH — hinged at the bottom, swings open ═══════════ */}
      <group ref={shellSet('front')} position={SHELLS[2].closed} onClick={shellTap}>
        <group ref={hingeRef} position={[0, -0.62, 0]}>
          <RoundedBox args={[1.16, 1.24, 0.12]} radius={0.1} smoothness={6} position={[0, 0.62, 0]}>
            <meshStandardMaterial color="#2dd4bf" roughness={0.35} metalness={0.05} />
          </RoundedBox>
          {[0, 1, 2].map((i) => (
            <RoundedBox key={i} args={[0.4, 0.05, 0.02]} radius={0.02} smoothness={3} position={[0, 0.02 - i * 0.13, 0.06]}>
              <meshStandardMaterial color="#0d9488" roughness={0.45} />
            </RoundedBox>
          ))}
          {[[-0.48, 1.1], [0.48, 1.1], [-0.48, 0.16], [0.48, 0.16]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.065]}>
              <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ═══════════ BACK COVER plate ═══════════ */}
      <group ref={shellSet('back')} position={SHELLS[3].closed} onClick={shellTap}>
        <RoundedBox args={[1.18, 1.04, 0.1]} radius={0.05} smoothness={5}>
          <meshStandardMaterial color="#0d9488" roughness={0.4} metalness={0.05} />
        </RoundedBox>
      </group>

      {/* ═══════════════ ARMS ═══════════════ */}
      {(['L', 'R'] as const).map((side) => {
        const s = side === 'L' ? -1 : 1;
        return (
          <group key={side} ref={shellSet(side === 'L' ? 'armL' : 'armR')} position={side === 'L' ? SHELLS[4].closed : SHELLS[5].closed} onClick={shellTap}>
            <mesh position={[0.13 * s, 0.23, 0]}>
              <sphereGeometry args={[0.17, 22, 22]} />
              <meshStandardMaterial color="#0d9488" roughness={0.35} metalness={0.15} />
            </mesh>
            <mesh position={[0.03 * s, -0.07, 0]} rotation={[0, 0, 0.32 * s]}>
              <capsuleGeometry args={[0.115, 0.42, 8, 20]} />
              <meshStandardMaterial color="#14b8a6" roughness={0.38} metalness={0.05} />
            </mesh>
            <mesh position={[0.11 * s, -0.4, 0]}>
              <sphereGeometry args={[0.155, 22, 22]} />
              <meshStandardMaterial color="#0f766e" roughness={0.35} metalness={0.1} />
            </mesh>
          </group>
        );
      })}

      {/* ═══════════════ LEGS ═══════════════ */}
      {(['L', 'R'] as const).map((side) => {
        const s = side === 'L' ? -1 : 1;
        return (
          <group key={side} ref={shellSet(side === 'L' ? 'legL' : 'legR')} position={side === 'L' ? SHELLS[6].closed : SHELLS[7].closed} onClick={shellTap}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.3, 20]} />
              <meshStandardMaterial color="#0d9488" roughness={0.35} metalness={0.15} />
            </mesh>
            <RoundedBox args={[0.42, 0.22, 0.62]} radius={0.1} smoothness={6} position={[0, -0.04, 0.06]}>
              <meshStandardMaterial color="#0f766e" roughness={0.35} metalness={0.1} />
            </RoundedBox>
          </group>
        );
      })}

      {/* ═══════════ INTERNAL PARTS — realistic electronics (the discovery!) ═══════════ */}
      {ROBOT_PARTS.map((p) => (
        <group key={p.id} ref={partSet(p.id)} position={p.base}>
          <PartArt id={p.id} wires={wires} boardTex={boardTex} glowRef={(m) => { glowRefs.current[p.id] = m; }} onTap={tap(p.id)} />

          {/* warm halo when focused */}
          <sprite ref={haloSet(p.id)} scale={[1.5, 1.5, 1]} raycast={noRay} userData={{ hitProxy: true }}>
            <spriteMaterial map={glowTex} color="#fbbf24" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>

          {/* callout: dashed leader line + RTL label (image stage «ربات ۵») */}
          {exploded && selected === null && (
            <Callout part={p} discovered={discovered[p.id]} compact={compact} />
          )}
        </group>
      ))}
    </group>
  );
}

// --------------------------------------------------------------- callout

function Callout({ part, discovered, compact }: { part: RobotPartDef; discovered: boolean; compact: boolean }) {
  const { tx } = useI18n();
  // two absolute label columns (world space) — stays on-frame at pull-back distance
  const left = part.id === 'battery' || part.id === 'wires';
  const ROW: Record<string, number> = { sensor: 1.5, led: 0.95, board: 0.45, motor: -0.15, battery: 0.12, wires: -0.75 };
  const colX = (left ? -1 : 1) * (compact ? 0.95 : 1.32);
  const wy = ROW[part.id] ?? 0;
  const wz = 1.45;
  const ax = colX - part.open[0];
  const ay = wy - part.open[1];
  const az = wz - part.open[2];
  return (
    <group>
      <Line
        points={[[0.15, 0.08, 0.05], [ax, ay, az]]}
        color={discovered ? '#10b981' : '#0d9488'}
        lineWidth={1.5}
        dashed
        dashSize={0.05}
        gapSize={0.04}
        transparent
        opacity={0.9}
      />
      <Html center position={[ax, ay, az]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div
          dir="rtl"
          className="flex items-center gap-1 whitespace-nowrap rounded-full border bg-white/95 px-2 py-0.5 text-[10px] font-black text-slate-700 shadow-md sm:text-[11px]"
          style={{ borderColor: discovered ? '#10b981' : '#5eead4' }}
        >
          <span aria-hidden="true">{part.emoji}</span>
          <span>{tx(part.name)}</span>
          {discovered && <span className="text-emerald-600">✓</span>}
        </div>
      </Html>
    </group>
  );
}

// ------------------------------------------------------------ part meshes

/** Shared PBR material kit — fewer programs, consistent metal feel. */
function useMats() {
  return useMemo(
    () => ({
      gold: new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.85, roughness: 0.3 }),
      steel: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.92, roughness: 0.18 }),
      alu: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.28 }),
    }),
    [],
  );
}

function PartArt({
  id,
  wires,
  boardTex,
  glowRef,
  onTap,
}: {
  id: string;
  wires: { red: THREE.TubeGeometry; black: THREE.TubeGeometry };
  boardTex: THREE.Texture;
  glowRef: (m: THREE.MeshStandardMaterial | null) => void;
  onTap: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const m = useMats();
  const hit = (r: number) => (
    <mesh onClick={onTap} userData={{ hitProxy: true }}>
      <sphereGeometry args={[r, 10, 10]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  );
  const noRay = () => null;

  switch (id) {
    /* ── Control board: FR4 PCB + QFP MCU + caps + crystal + header ── */
    case 'board':
      return (
        <group>
          <RoundedBox args={[0.8, 0.62, 0.06]} radius={0.02} smoothness={4} onClick={onTap}>
            <meshStandardMaterial color="#0e5a2c" roughness={0.45} />
          </RoundedBox>
          {/* solder-mask artwork on the top face */}
          <mesh position={[0, 0, 0.033]} raycast={noRay}>
            <planeGeometry args={[0.78, 0.6]} />
            <meshStandardMaterial map={boardTex} roughness={0.4} metalness={0.05} />
          </mesh>
          {/* MCU (QFP) — glows when the board is focused */}
          <group position={[0, 0.08, 0.03]}>
            <mesh position={[0, 0, 0.022]}>
              <boxGeometry args={[0.26, 0.26, 0.035]} />
              <meshStandardMaterial ref={glowRef} color="#0b1220" roughness={0.35} metalness={0.2} emissive="#fbbf24" emissiveIntensity={0} />
            </mesh>
            {[-0.105, -0.063, -0.021, 0.021, 0.063, 0.105].map((o) => (
              <group key={o}>
                {([0, 1] as const).map((sn) => (
                  <mesh key={sn} position={[o, (sn ? 1 : -1) * 0.146, 0.022]} material={m.gold}>
                    <boxGeometry args={[0.016, 0.028, 0.012]} />
                  </mesh>
                ))}
                {([0, 1] as const).map((sn) => (
                  <mesh key={`s${sn}`} position={[(sn ? 1 : -1) * 0.146, o, 0.022]} material={m.gold}>
                    <boxGeometry args={[0.028, 0.016, 0.012]} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
          {/* electrolytic capacitors */}
          {[-0.14, 0.08].map((y, i) => (
            <group key={i} position={[-0.27, y, 0.03]}>
              <mesh position={[0, 0, 0.055]}>
                <cylinderGeometry args={[0.052, 0.052, 0.11, 20]} />
                <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0, 0.115]} material={m.steel}>
                <cylinderGeometry args={[0.05, 0.05, 0.014, 20]} />
              </mesh>
            </group>
          ))}
          {/* quartz crystal */}
          <mesh position={[0.27, -0.16, 0.062]} rotation={[0, 0, Math.PI / 2]} material={m.steel}>
            <cylinderGeometry args={[0.024, 0.024, 0.09, 14]} />
          </mesh>
          {/* pin header */}
          <group position={[0.24, 0.24, 0.03]}>
            <mesh position={[0, 0, 0.025]}>
              <boxGeometry args={[0.05, 0.2, 0.05]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            {[-0.075, -0.025, 0.025, 0.075].map((y) => (
              <mesh key={y} position={[0, y, 0.07]} material={m.gold}>
                <cylinderGeometry args={[0.009, 0.009, 0.05, 8]} />
              </mesh>
            ))}
          </group>
          {/* resistors */}
          {[-0.06, 0.01, 0.08].map((x, i) => (
            <mesh key={i} position={[x, -0.23, 0.038]}>
              <boxGeometry args={[0.05, 0.02, 0.016]} />
              <meshStandardMaterial color="#c8a165" roughness={0.5} />
            </mesh>
          ))}
          {/* corner screws */}
          {[[-0.35, -0.26], [0.35, -0.26], [-0.35, 0.26], [0.35, 0.26]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.04]} material={m.alu}>
              <cylinderGeometry args={[0.02, 0.02, 0.028, 12]} />
            </mesh>
          ))}
          {hit(0.42)}
        </group>
      );

    /* ── Li-ion 18650 cell: blue wrap, yellow band, steel caps, holder brackets ── */
    case 'battery':
      return (
        <group>
          <mesh rotation={[0, 0, Math.PI / 2]} onClick={onTap}>
            <cylinderGeometry args={[0.155, 0.155, 0.44, 26]} />
            <meshStandardMaterial ref={glowRef} color="#1d4ed8" roughness={0.3} metalness={0.1} emissive="#f59e0b" emissiveIntensity={0} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.06, 0, 0]}>
            <cylinderGeometry args={[0.157, 0.157, 0.1, 26]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.32} metalness={0.05} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.225, 0, 0]} material={m.steel}>
            <cylinderGeometry args={[0.156, 0.156, 0.02, 26]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.255, 0, 0]} material={m.steel}>
            <cylinderGeometry args={[0.05, 0.05, 0.035, 16]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.225, 0, 0]} material={m.alu}>
            <cylinderGeometry args={[0.156, 0.156, 0.02, 26]} />
          </mesh>
          {/* holder brackets */}
          {[-0.245, 0.245].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]}>
              <boxGeometry args={[0.05, 0.13, 0.26]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
          ))}
          {hit(0.3)}
        </group>
      );

    /* ── DC gear motor: steel can + rear bell + gearbox + shaft ── */
    case 'motor':
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]} onClick={onTap}>
            <cylinderGeometry args={[0.148, 0.148, 0.32, 26]} />
            <meshStandardMaterial ref={glowRef} color="#b6c2cd" roughness={0.3} metalness={0.6} emissive="#f59e0b" emissiveIntensity={0} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.185]}>
            <cylinderGeometry args={[0.15, 0.15, 0.07, 26]} />
            <meshStandardMaterial color="#74859a" roughness={0.34} metalness={0.55} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.225]}>
            <cylinderGeometry args={[0.1, 0.1, 0.016, 20]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* gearbox housing + bolts */}
          <mesh position={[0, 0, 0.22]}>
            <boxGeometry args={[0.3, 0.3, 0.14]} />
            <meshStandardMaterial color="#93a5b8" roughness={0.36} metalness={0.45} />
          </mesh>
          {[[-0.11, -0.11], [0.11, -0.11], [-0.11, 0.11], [0.11, 0.11]].map(([x, y], i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[x, y, 0.295]} material={m.steel}>
              <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
            </mesh>
          ))}
          {/* output shaft */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.36]} material={m.steel}>
            <cylinderGeometry args={[0.028, 0.028, 0.16, 14]} />
          </mesh>
          {hit(0.3)}
        </group>
      );

    /* ── 5 mm LED: translucent red dome over an inner post, two legs ── */
    case 'led':
      return (
        <group>
          <mesh position={[-0.028, -0.1, 0]} material={m.steel}>
            <boxGeometry args={[0.014, 0.14, 0.014]} />
          </mesh>
          <mesh position={[0.028, -0.08, 0]} material={m.steel}>
            <boxGeometry args={[0.014, 0.1, 0.014]} />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.105, 0.095, 0.014, 18]} />
            <meshStandardMaterial color="#f87171" roughness={0.3} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.08, 18]} />
            <meshStandardMaterial color="#f87171" roughness={0.12} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.05, 0]} onClick={onTap}>
            <sphereGeometry args={[0.088, 20, 20]} />
            <meshStandardMaterial ref={glowRef} color="#f87171" roughness={0.1} transparent opacity={0.85} emissive="#ef4444" emissiveIntensity={0} />
          </mesh>
          {/* inner anode post, visible through the dome */}
          <mesh position={[0, 0.03, 0]} raycast={noRay}>
            <boxGeometry args={[0.024, 0.09, 0.024]} />
            <meshStandardMaterial color="#fecaca" roughness={0.3} />
          </mesh>
          {hit(0.26)}
        </group>
      );

    /* ── Ultrasonic distance sensor (HC-SR04 style): blue PCB + two cans ── */
    case 'sensor':
      return (
        <group>
          <mesh onClick={onTap}>
            <boxGeometry args={[0.38, 0.22, 0.03]} />
            <meshStandardMaterial ref={glowRef} color="#1e40af" roughness={0.42} emissive="#f59e0b" emissiveIntensity={0} />
          </mesh>
          {[-0.095, 0.095].map((x, i) => (
            <group key={i} position={[x, 0.01, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.035]} material={m.alu}>
                <cylinderGeometry args={[0.058, 0.058, 0.055, 22]} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.063]}>
                <cylinderGeometry args={[0.045, 0.045, 0.008, 22]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.55} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, -0.05, 0.03]} rotation={[0, 0, Math.PI / 2]} material={m.steel}>
            <cylinderGeometry args={[0.02, 0.02, 0.07, 12]} />
          </mesh>
          <mesh position={[0, -0.095, -0.025]}>
            <boxGeometry args={[0.12, 0.045, 0.03]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          {[[-0.17, -0.09], [0.17, -0.09]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.018]} material={m.gold}>
              <cylinderGeometry args={[0.012, 0.012, 0.024, 10]} />
            </mesh>
          ))}
          {hit(0.26)}
        </group>
      );

    /* ── Wires: red/black insulation + dupont connector housings ── */
    case 'wires':
      return (
        <group>
          <mesh geometry={wires.red} onClick={onTap}>
            <meshStandardMaterial ref={glowRef} color="#ef4444" roughness={0.42} emissive="#f59e0b" emissiveIntensity={0} />
          </mesh>
          <mesh geometry={wires.black} onClick={onTap}>
            <meshStandardMaterial color="#1e293b" roughness={0.42} />
          </mesh>
          {([[-0.3, -0.08, 0.02], [0.3, -0.1, 0.02], [-0.3, -0.15, 0.02]] as const).map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[0.055, 0.05, 0.04]} />
              <meshStandardMaterial color="#0f172a" roughness={0.55} />
            </mesh>
          ))}
          {hit(0.3)}
        </group>
      );

    default:
      return null;
  }
}

