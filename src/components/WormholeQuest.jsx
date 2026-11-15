import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import CapAvatar from "./CapAvatar";
import PlayStage from "./PlayStage";
import { SECRET_TEXT, SECRET_QUIZ } from "../data/secretText";
import { pauseState } from "../utils/pause";
import { spaceAudio } from "../utils/sound";

// =====================================================================
// Hidden quest: the rover falls through a wormhole onto an alien ship.
// Centre Deck (collector desk) + Captain Room (jump obby) + Canteen (quiz) + Treasure Room (mini-game)
// =====================================================================

const ITEM_KEYS = ["captain", "canteen", "treasure"];
const ROVER_R = 0.7; // how close the rover's centre can get to a wall
const STEP = 0.35; // small ledges the rover can climb without jumping
const GRAV = 20;
const JUMP_V = 7.6;
const SPAWN = { x: 0, z: 4.5, rotY: Math.PI };
const CAPTAIN_START = { x: 0, z: -16, rotY: Math.PI };
const PORTAL_POS = { x: 0, z: 6.6 };

// Where the rover may drive (union of these shapes). Each shape is shrunk by ROVER_R, so the
// corridors reach 2 units into the rooms to make sure the shrunken shapes overlap at the doorways.
const ROOMS = [
  { id: "centre", circle: true, x: 0, z: 0, r: 8 },
  { id: "centre", x0: -1.6, x1: 1.6, z0: -16, z1: -6 },
  { id: "captain", x0: -7, x1: 7, z0: -42, z1: -14 },
  { id: "centre", x0: 6, x1: 16, z0: -1.6, z1: 1.6 },
  { id: "canteen", x0: 14, x1: 28, z0: -8, z1: 8 },
  { id: "centre", x0: -16, x1: -6, z0: -1.6, z1: 1.6 },
  { id: "treasure", x0: -28, x1: -14, z0: -8, z1: 8 },
];

// Things the rover can stand on: { x0, x1, z0, z1, top, thick }
const FLOORS = [
  { x0: -8.5, x1: 8.5, z0: -8.5, z1: 8.5, top: 0, thick: 0.3 }, // centre deck (clipped by the round wall)
  { x0: -1.6, x1: 1.6, z0: -18, z1: -6, top: 0, thick: 0.3 }, // north corridor + captain entrance
  { x0: -7, x1: 7, z0: -18, z1: -14, top: 0, thick: 0.3 }, // captain room entrance ledge
  { x0: 6, x1: 28, z0: -8, z1: 8, top: 0, thick: 0.3 }, // east corridor + canteen
  { x0: -28, x1: -6, z0: -8, z1: 8, top: 0, thick: 0.3 }, // west corridor + treasure room
];
// Captain Room obby: floating platforms over the void (big + close together, so it's fun not frustrating)
const PLATFORMS = [
  { x: -1.3, z: -20.3, w: 3.0, d: 2.6, top: 0.3 },
  { x: 1.3, z: -23.6, w: 3.0, d: 2.6, top: 0.7 },
  { x: -1.3, z: -26.9, w: 3.0, d: 2.6, top: 1.1 },
  { x: 1.4, z: -30.2, w: 3.0, d: 2.6, top: 1.5 },
  { x: 0, z: -33.4, w: 3.4, d: 2.6, top: 1.9 },
  { x: 0, z: -38.6, w: 6.4, d: 6.4, top: 2.3 },
];
const SURFACES = [
  ...FLOORS,
  ...PLATFORMS.map((p) => ({ x0: p.x - p.w / 2, x1: p.x + p.w / 2, z0: p.z - p.d / 2, z1: p.z + p.d / 2, top: p.top, thick: 0.5 })),
];
const CAPTAIN_ITEM = { x: 0, z: -39.2, y: 2.3 };

// Furniture the rover bumps into
const COLLIDERS = [
  { x: 0, z: 0, r: 1.35 }, // collector desk
  ...[45, 135, 225, 315].map((deg) => ({ x: Math.cos((deg * Math.PI) / 180) * 5.8, z: Math.sin((deg * Math.PI) / 180) * 5.8, r: 0.55 })),
  { x: 18.5, z: -4.5, r: 1.1 },
  { x: 18.5, z: 4.5, r: 1.1 },
  { x: 23, z: -4.5, r: 1.1 },
  { x: 23, z: 4.5, r: 1.1 },
  { x: 27, z: 0, r: 1.1 }, // food machine
  { x: -27, z: 0, r: 1.3 }, // vault
  { x: -20, z: -6, r: 0.9 },
  { x: -21, z: 6, r: 0.9 },
];

// "Press E" zones
const ZONES = [
  { id: "desk", x: 0, z: 0, r: 3.0 },
  { id: "machine", x: 25.3, z: 0, r: 2.1 },
  { id: "vault", x: -25.1, z: 0, r: 2.2 },
];

function insideRooms(x, z) {
  return ROOMS.some((rm) =>
    rm.circle ? Math.hypot(x - rm.x, z - rm.z) < rm.r - ROVER_R : x > rm.x0 + ROVER_R && x < rm.x1 - ROVER_R && z > rm.z0 + ROVER_R && z < rm.z1 - ROVER_R
  );
}
function roomAt(x, z) {
  for (const rm of ROOMS) {
    if (rm.circle ? Math.hypot(x - rm.x, z - rm.z) < rm.r : x > rm.x0 && x < rm.x1 && z > rm.z0 && z < rm.z1) {
      if (rm.id !== "centre") return rm.id;
    }
  }
  return "centre";
}
const GRACE = 0.3; // a little forgiveness at platform edges
function onSurface(s, x, z) {
  return x > s.x0 - GRACE && x < s.x1 + GRACE && z > s.z0 - GRACE && z < s.z1 + GRACE;
}
function groundAt(x, z, y) {
  let best = -Infinity;
  for (const s of SURFACES) if (onSurface(s, x, z) && s.top <= y + STEP && s.top > best) best = s.top;
  return best;
}
function blockedBySurface(x, z, y) {
  return SURFACES.some((s) => x > s.x0 && x < s.x1 && z > s.z0 && z < s.z1 && s.top > y + STEP && s.top - s.thick < y + 1.0);
}

function createSim() {
  return { pos: new THREE.Vector3(SPAWN.x, 9, SPAWN.z), rotY: SPAWN.rotY, speed: 0, turnRate: 0, vy: 0, airborne: true, jumpReq: false, scale: 1, landed: false };
}

// ---------------------------------------------------------------------
// 3D bits
// ---------------------------------------------------------------------
function ShipRoverModel({ groupRef, wheelRefs, headRef }) {
  const wheels = [
    [-0.58, 0.2, 0.52],
    [0.58, 0.2, 0.52],
    [-0.58, 0.2, 0],
    [0.58, 0.2, 0],
    [-0.58, 0.2, -0.52],
    [0.58, 0.2, -0.52],
  ];
  return (
    <group ref={groupRef}>
      {wheels.map((w, i) => (
        <group key={i} position={w} ref={(el) => (wheelRefs.current[i] = el)}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.06, 0.2, 0.06]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.95, 0.34, 1.3]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.97, 0.08, 1.32]} />
        <meshStandardMaterial color="#f97316" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, -0.2]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[1.1, 0.05, 0.8]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.8} roughness={0.2} emissive="#0ea5e9" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.98, 0.38]}>
        <cylinderGeometry args={[0.05, 0.06, 0.55, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
      </mesh>
      <group ref={headRef} position={[0, 1.3, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.3, 0.32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.01, 0.17]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={1.8} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 0.8, 1.4]} color="#fef3c7" intensity={4} distance={6} />
    </group>
  );
}

// Item models (used on the obby, at the desk and in the ending)
function ItemMesh({ kind, scale = 1 }) {
  if (kind === "captain")
    return (
      <group scale={scale}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.07, 10, 28]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.25} emissive="#ca8a04" emissiveIntensity={0.8} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.05, 24]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.04]} rotation={[0, 0, 0.6]}>
          <coneGeometry args={[0.06, 0.4, 4]} />
          <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.8} />
        </mesh>
      </group>
    );
  if (kind === "canteen")
    return (
      <group scale={scale}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.1, 24]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} emissive="#78350f" emissiveIntensity={0.5} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.3) * 0.17, 0.06, Math.sin(i * 1.3) * 0.17]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial color={["#f472b6", "#38bdf8", "#a3e635"][i % 3]} emissive={["#db2777", "#0284c7", "#65a30d"][i % 3]} emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
    );
  return (
    <group scale={scale}>
      <mesh>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={1.6} metalness={0.3} roughness={0.1} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -0.38, 0]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color="#a5f3fc" emissive="#06b6d4" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function Spinner({ children, speed = 1.2, bob = 0.15, position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * speed;
    ref.current.position.y = position[1] + Math.sin(t * 2) * bob;
  });
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}

function Wall({ x1, z1, x2, z2, h = 1.8, color = "#475569" }) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(x2 - x1, z2 - z1);
  return (
    <group position={[(x1 + x2) / 2, 0, (z1 + z2) / 2]} rotation={[0, ang, 0]}>
      <mesh position={[0, h / 2, 0]} receiveShadow>
        <boxGeometry args={[0.3, h, len]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, h + 0.04, 0]}>
        <boxGeometry args={[0.34, 0.08, len]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

// Walls around a rectangle with an opening on one side
function RectWalls({ x0, x1, z0, z1, open, color }) {
  const segs = [];
  const side = (key, a, b) => {
    // a,b are endpoints along that side; split around the opening
    if (open && open.side === key) {
      const [p, q] = open.range;
      if (key === "n" || key === "s") {
        const z = key === "n" ? z0 : z1;
        segs.push([x0, z, p, z], [q, z, x1, z]);
      } else {
        const x = key === "w" ? x0 : x1;
        segs.push([x, z0, x, p], [x, q, x, z1]);
      }
    } else segs.push([...a, ...b]);
  };
  side("n", [x0, z0], [x1, z0]);
  side("s", [x0, z1], [x1, z1]);
  side("w", [x0, z0], [x0, z1]);
  side("e", [x1, z0], [x1, z1]);
  return (
    <>
      {segs.map((s, i) => (
        <Wall key={i} x1={s[0]} z1={s[1]} x2={s[2]} z2={s[3]} color={color} />
      ))}
    </>
  );
}

function RoundWall() {
  const n = 48;
  const r = 8;
  const segs = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const mid = (a0 + a1) / 2;
    const x = Math.cos(mid) * r;
    const z = Math.sin(mid) * r;
    // leave doorways to the north, east and west corridors
    if ((Math.abs(x) < 1.9 && z < 0) || (Math.abs(z) < 1.9 && Math.abs(x) > 5)) continue;
    segs.push([Math.cos(a0) * r, Math.sin(a0) * r, Math.cos(a1) * r, Math.sin(a1) * r]);
  }
  return (
    <>
      {segs.map((s, i) => (
        <Wall key={i} x1={s[0]} z1={s[1]} x2={s[2]} z2={s[3]} color="#3f4b63" />
      ))}
    </>
  );
}

function FloorPlate({ x0, x1, z0, z1, color = "#273449" }) {
  return (
    <mesh position={[(x0 + x1) / 2, -0.15, (z0 + z1) / 2]} receiveShadow>
      <boxGeometry args={[x1 - x0, 0.3, z1 - z0]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.45} />
    </mesh>
  );
}

function RoomSign({ position, text, color = "#67e8f9" }) {
  return (
    <Html position={position} center distanceFactor={12} zIndexRange={[10, 0]}>
      <div className="pointer-events-none whitespace-nowrap px-3 py-1 rounded-full bg-slate-950/80 border-2 font-display font-bold text-sm" style={{ borderColor: color, color }}>
        {text}
      </div>
    </Html>
  );
}

function Alien({ position, color, delay, show }) {
  const ref = useRef();
  const armRef = useRef();
  const start = useRef(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    if (!show) {
      ref.current.scale.setScalar(0.001);
      start.current = null;
      return;
    }
    if (start.current == null) start.current = t;
    const k = THREE.MathUtils.clamp((t - start.current - delay) / 0.6, 0, 1);
    const pop = k < 1 ? k * (1 + Math.sin(k * Math.PI) * 0.4) : 1;
    ref.current.scale.setScalar(Math.max(0.001, pop));
    ref.current.position.y = position[1] + Math.sin(t * 2.4 + delay * 5) * 0.08;
    if (armRef.current) armRef.current.rotation.z = -2.2 + Math.sin(t * 7 + delay * 3) * 0.45;
  });
  return (
    <group ref={ref} position={position} rotation={[0, 0, 0]} scale={0.001}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.5, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.48, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      {[-0.18, 0.18].map((x) => (
        <group key={x} position={[x, 1.52, 0.38]}>
          <mesh>
            <sphereGeometry args={[0.15, 14, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.11]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.25, 0.43]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.1, 0.025, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <group key={x} position={[x, 1.85, 0]} rotation={[0, 0, x * -1.4]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
      <group ref={armRef} position={[0.33, 0.85, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

function Portal({ position, rotation, show, color = "#a855f7" }) {
  const ref = useRef();
  const ringRef = useRef();
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const goal = show ? 1 : 0.001;
    const s = THREE.MathUtils.damp(ref.current.scale.x, goal, 4, dt);
    ref.current.scale.setScalar(s);
    ref.current.visible = s > 0.01;
    if (ringRef.current) ringRef.current.rotation.z = clock.getElapsedTime() * 2.5;
  });
  return (
    <group ref={ref} position={position} rotation={rotation} scale={0.001}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.14, 12, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
      </mesh>
      <mesh>
        <circleGeometry args={[1.45, 40]} />
        <meshBasicMaterial color="#1e0b3a" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[0.6, 1.3, 40]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight color={color} intensity={10} distance={9} />
    </group>
  );
}

function ShipWorld({ t, collected, placed, deskReady, ending }) {
  const machineRef = useRef();
  const vaultRef = useRef();
  const deskRef = useRef();
  useFrame(({ clock }) => {
    const k = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.6;
    if (machineRef.current) machineRef.current.emissiveIntensity = collected.canteen ? 0.4 : 1.4 * k;
    if (vaultRef.current) vaultRef.current.emissiveIntensity = collected.treasure ? 0.3 : 1.1 * k;
    if (deskRef.current) deskRef.current.emissiveIntensity = deskReady ? 1.6 * k : 0.6;
  });
  const showItems = ending ? ITEM_KEYS : ITEM_KEYS.filter((k) => placed[k]);
  return (
    <>
      {/* ===== Floors ===== */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[8.2, 8.2, 0.3, 48]} />
        <meshStandardMaterial color="#2b3a52" metalness={0.6} roughness={0.4} />
      </mesh>
      {[2.5, 4.5, 6.5].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[r - 0.05, r + 0.05, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} />
        </mesh>
      ))}
      <FloorPlate x0={-1.6} x1={1.6} z0={-14} z1={-7} />
      <FloorPlate x0={-7} x1={7} z0={-18} z1={-14} color="#3b2f55" />
      <FloorPlate x0={7} x1={14} z0={-1.6} z1={1.6} />
      <FloorPlate x0={14} x1={28} z0={-8} z1={8} color="#2f3f3a" />
      <FloorPlate x0={-14} x1={-7} z0={-1.6} z1={1.6} />
      <FloorPlate x0={-28} x1={-14} z0={-8} z1={8} color="#3d3424" />

      {/* ===== Walls ===== */}
      <RoundWall />
      <Wall x1={-1.6} z1={-14} x2={-1.6} z2={-7.85} />
      <Wall x1={1.6} z1={-14} x2={1.6} z2={-7.85} />
      <Wall x1={7.85} z1={-1.6} x2={14} z2={-1.6} />
      <Wall x1={7.85} z1={1.6} x2={14} z2={1.6} />
      <Wall x1={-14} z1={-1.6} x2={-7.85} z2={-1.6} />
      <Wall x1={-14} z1={1.6} x2={-7.85} z2={1.6} />
      <RectWalls x0={-7} x1={7} z0={-42} z1={-14} open={{ side: "s", range: [-1.6, 1.6] }} color="#4c3b6e" />
      <RectWalls x0={14} x1={28} z0={-8} z1={8} open={{ side: "w", range: [-1.6, 1.6] }} color="#3c5a50" />
      <RectWalls x0={-28} x1={-14} z0={-8} z1={8} open={{ side: "e", range: [-1.6, 1.6] }} color="#5b4a2c" />

      {/* ===== Centre deck: pillars + collector desk ===== */}
      {[45, 135, 225, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <group key={deg} position={[Math.cos(a) * 5.8, 0, Math.sin(a) * 5.8]}>
            <mesh position={[0, 1.6, 0]}>
              <cylinderGeometry args={[0.4, 0.5, 3.2, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
            </mesh>
            {[0.8, 1.8, 2.8].map((y) => (
              <mesh key={y} position={[0, y, 0]}>
                <torusGeometry args={[0.47, 0.04, 6, 20]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
              </mesh>
            ))}
          </group>
        );
      })}
      <group>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[1.1, 1.3, 1.0, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.03, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.06, 24]} />
          <meshStandardMaterial ref={deskRef} color="#0e7490" emissive="#22d3ee" emissiveIntensity={0.6} />
        </mesh>
        {/* three item slots */}
        {ITEM_KEYS.map((k, i) => (
          <mesh key={k} position={[(i - 1) * 0.6, 1.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.18, 0.24, 20]} />
            <meshBasicMaterial color={placed[k] ? "#4ade80" : "#94a3b8"} />
          </mesh>
        ))}
        {showItems.map((k) => {
          const i = ITEM_KEYS.indexOf(k);
          return (
            <Spinner key={k} position={[(i - 1) * 0.6, ending ? 1.9 : 1.45, 0]} bob={ending ? 0.25 : 0.08}>
              <ItemMesh kind={k} scale={ending ? 1.1 : 0.8} />
            </Spinner>
          );
        })}
        <pointLight position={[0, 2.2, 0]} color="#22d3ee" intensity={deskReady || ending ? 8 : 3} distance={8} />
      </group>
      {!ending && <RoomSign position={[0, 3.2, 0]} text={`🛸 ${t.desk}`} />}

      {/* ===== Captain Room: obby over the void ===== */}
      <mesh position={[0, -6, -29]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 24]} />
        <meshBasicMaterial color="#3b0764" />
      </mesh>
      {[-1, -2.5, -4].map((y, i) => (
        <mesh key={y} position={[0, y, -29]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13.6, 23.6, 12, 20]} />
          <meshBasicMaterial color={["#a855f7", "#7c3aed", "#6d28d9"][i]} wireframe transparent opacity={0.35 - i * 0.08} />
        </mesh>
      ))}
      {PLATFORMS.map((p, i) => (
        <group key={i} position={[p.x, p.top, p.z]}>
          <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[p.w, 0.5, p.d]} />
            <meshStandardMaterial color={i === PLATFORMS.length - 1 ? "#52467a" : "#475569"} metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.min(p.w, p.d) * 0.32, Math.min(p.w, p.d) * 0.38, 4, 1, Math.PI / 4]} />
            <meshBasicMaterial color="#facc15" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, -0.52, 0]}>
            <boxGeometry args={[p.w * 0.6, 0.06, p.d * 0.6]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
      {/* captain's chair + big viewscreen at the end */}
      <group position={[0, 2.3, -41]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.0, 0.9, 0.8]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.2, -0.35]}>
          <boxGeometry args={[1.0, 1.4, 0.2]} />
          <meshStandardMaterial color="#991b1b" roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[0, 4.6, -41.8]}>
        <planeGeometry args={[9, 3.6]} />
        <meshStandardMaterial color="#0c4a6e" emissive="#0369a1" emissiveIntensity={0.9} />
      </mesh>
      {!collected.captain && (
        <Spinner position={[CAPTAIN_ITEM.x, CAPTAIN_ITEM.y + 1.0, CAPTAIN_ITEM.z]} bob={0.18}>
          <ItemMesh kind="captain" scale={1.4} />
          <pointLight color="#facc15" intensity={6} distance={6} />
        </Spinner>
      )}
      <pointLight position={[0, 4, -28]} color="#a855f7" intensity={10} distance={22} />
      <RoomSign position={[0, 3.0, -14.5]} text={`🧑‍✈️ ${t.places.captain}`} color="#c4b5fd" />

      {/* ===== Canteen ===== */}
      {[
        [18.5, -4.5],
        [18.5, 4.5],
        [23, -4.5],
        [23, 4.5],
      ].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.95, 0.95, 0.08, 24]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.12, 0.2, 0.75, 10]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos(i * 2.1) * 1.35, 0.3, Math.sin(i * 2.1) * 1.35]}>
              <cylinderGeometry args={[0.25, 0.25, 0.6, 12]} />
              <meshStandardMaterial color="#14b8a6" />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[27, 0, 0]}>
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[1.2, 2.6, 2.0]} />
          <meshStandardMaterial color="#0f766e" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-0.61, 1.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.5, 1.0]} />
          <meshStandardMaterial ref={machineRef} color="#a7f3d0" emissive="#34d399" emissiveIntensity={1.4} />
        </mesh>
        <mesh position={[-0.61, 0.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.0, 0.4]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {!collected.canteen && <pointLight position={[-1.5, 1.6, 0]} color="#34d399" intensity={7} distance={6} />}
        {!collected.canteen && (
          <mesh position={[-1.7, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.5, 32]} />
            <meshBasicMaterial color="#34d399" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
      <pointLight position={[21, 4, 0]} color="#5eead4" intensity={6} distance={18} />
      <RoomSign position={[14.6, 3.0, 0]} text={`🍽️ ${t.places.canteen}`} color="#5eead4" />
      <RoomSign position={[27, 3.4, 0]} text={`🍪 ${t.machine}`} color="#6ee7b7" />

      {/* ===== Treasure Room ===== */}
      <group position={[-27, 0, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.8, 1.2, 2.2]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.35, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.1, 1.1, 1.8, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} />
        </mesh>
        <mesh position={[0.92, 0.9, 0]}>
          <boxGeometry args={[0.08, 0.5, 0.5]} />
          <meshStandardMaterial ref={vaultRef} color="#f0abfc" emissive="#d946ef" emissiveIntensity={1.1} />
        </mesh>
        {!collected.treasure && <pointLight position={[1.5, 1.6, 0]} color="#e879f9" intensity={7} distance={6} />}
        {!collected.treasure && (
          <mesh position={[1.9, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.5, 32]} />
            <meshBasicMaterial color="#e879f9" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
      {[
        [-20, -6],
        [-21, 6],
      ].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i} position={[Math.cos(i * 2.4) * (0.2 + (i % 4) * 0.18), 0.06 + Math.floor(i / 5) * 0.12, Math.sin(i * 2.4) * (0.2 + (i % 4) * 0.18)]}>
              <cylinderGeometry args={[0.16, 0.16, 0.08, 12]} />
              <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} emissive="#a16207" emissiveIntensity={0.4} />
            </mesh>
          ))}
          <mesh position={[0.3, 0.6, 0.2]} rotation={[0.3, 0.5, 0.2]}>
            <octahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}
      <pointLight position={[-21, 4, 0]} color="#fbbf24" intensity={6} distance={18} />
      <RoomSign position={[-14.6, 3.0, 0]} text={`💰 ${t.places.treasure}`} color="#fcd34d" />
      <RoomSign position={[-27, 3.2, 0]} text={`💎 ${t.vault}`} color="#f0abfc" />
    </>
  );
}

// Drives the rover (player input, or the cutscene script)
function ShipSim({ simRef, stage, inputRef, locked, collectedRef, onNear, onFall, onPickup, onLanded, onPortalIn, soundOn }) {
  const groupRef = useRef();
  const wheelRefs = useRef([]);
  const headRef = useRef();
  const keys = useRef({});
  const nearRef = useRef(null);
  const landedFired = useRef(false);
  const portalFired = useRef(false);

  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === "Space") {
        e.preventDefault();
        simRef.current.jumpReq = true;
      }
    };
    const up = (e) => {
      keys.current[e.code] = false;
    };
    const blur = () => (keys.current = {});
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [simRef]);

  useFrame(({ clock }, raw) => {
    const s = simRef.current;
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    const dt = pauseState.paused ? 0 : Math.min(raw, 0.05);

    if (stage === "drop" || stage === "loading") {
      // fall out of the portal, spinning, then bounce on the deck
      if (stage === "drop" && !s.landed) {
        s.vy -= GRAV * 0.55 * dt;
        s.pos.y += s.vy * dt;
        s.rotY += dt * 5;
        if (s.pos.y <= 0) {
          s.pos.y = 0;
          if (s.vy < -3) {
            s.vy = -s.vy * 0.35;
            if (soundOn) spaceAudio.playThud?.(4);
          } else {
            s.vy = 0;
            s.landed = true;
            s.airborne = false;
          }
        }
      }
      if (s.landed) s.rotY = THREE.MathUtils.damp(s.rotY, Math.round(s.rotY / (Math.PI * 2)) * Math.PI * 2 + Math.PI, 3, dt);
      if (s.landed && !landedFired.current) {
        landedFired.current = true;
        onLanded?.();
      }
    } else if (stage === "endItems" || stage === "endAliens") {
      s.pos.x = THREE.MathUtils.damp(s.pos.x, 0, 3, dt);
      s.pos.z = THREE.MathUtils.damp(s.pos.z, 2.7, 3, dt);
      s.pos.y = 0;
      s.rotY = THREE.MathUtils.damp(s.rotY, Math.PI, 3, dt);
      s.speed = 0;
      if (headRef.current) {
        headRef.current.rotation.x = stage === "endItems" ? -0.25 + Math.sin(t * 1.5) * 0.08 : -0.45;
        headRef.current.rotation.y = stage === "endItems" ? Math.sin(t * 1.1) * 0.35 : 0;
      }
    } else if (stage === "endPortal") {
      // turn round and roll into the portal home
      s.rotY = THREE.MathUtils.damp(s.rotY, Math.PI * 2, 3, dt);
      const facing = Math.abs(s.rotY - Math.PI * 2) < 0.4;
      s.speed = THREE.MathUtils.damp(s.speed, facing ? 3 : 0, 3, dt);
      s.pos.x += Math.sin(s.rotY) * s.speed * dt;
      s.pos.z += Math.cos(s.rotY) * s.speed * dt;
      if (s.pos.z > PORTAL_POS.z - 1.2) s.scale = THREE.MathUtils.damp(s.scale, 0, 4, dt);
      if (s.scale < 0.08 && !portalFired.current) {
        portalFired.current = true;
        onPortalIn?.();
      }
    } else {
      // ===== Player driving =====
      let forward = 0;
      let turn = 0;
      if (!locked) {
        const k = keys.current;
        const d = inputRef.current;
        forward = (k.KeyW || k.ArrowUp || d.up ? 1 : 0) - (k.KeyS || k.ArrowDown || d.down ? 1 : 0);
        turn = (k.KeyA || k.ArrowLeft || d.left ? 1 : 0) - (k.KeyD || k.ArrowRight || d.right ? 1 : 0);
      }
      if (locked) s.jumpReq = false;
      s.speed = THREE.MathUtils.damp(s.speed, forward > 0 ? 6 : forward < 0 ? -3.5 : 0, locked ? 8 : forward ? 2.6 : 4, dt);
      s.turnRate = THREE.MathUtils.damp(s.turnRate, turn * 2.3, 8, dt);
      s.rotY += s.turnRate * dt;

      let nx = s.pos.x + Math.sin(s.rotY) * s.speed * dt;
      let nz = s.pos.z + Math.cos(s.rotY) * s.speed * dt;
      for (const c of COLLIDERS) {
        const dx = nx - c.x;
        const dz = nz - c.z;
        const dd = Math.hypot(dx, dz);
        const minD = c.r + 0.7;
        if (dd < minD && dd > 1e-4 && s.pos.y < 1.2) {
          nx = c.x + (dx / dd) * minD;
          nz = c.z + (dz / dd) * minD;
        }
      }
      const ok = (x, z) => insideRooms(x, z) && !blockedBySurface(x, z, s.pos.y);
      if (ok(nx, nz)) {
        s.pos.x = nx;
        s.pos.z = nz;
      } else if (ok(nx, s.pos.z)) {
        s.pos.x = nx;
        s.speed *= 0.9;
      } else if (ok(s.pos.x, nz)) {
        s.pos.z = nz;
        s.speed *= 0.9;
      } else {
        s.speed *= 0.5;
      }

      // jumping + gravity
      const ground = groundAt(s.pos.x, s.pos.z, s.pos.y);
      if (s.jumpReq && !s.airborne) {
        s.vy = JUMP_V;
        s.airborne = true;
        if (soundOn) spaceAudio.playWhoosh?.();
      }
      s.jumpReq = false;
      if (!s.airborne && ground < s.pos.y - 0.05) {
        s.airborne = true;
        s.vy = 0;
      }
      if (s.airborne) {
        s.vy -= GRAV * dt;
        s.pos.y += s.vy * dt;
        const g2 = groundAt(s.pos.x, s.pos.z, s.pos.y - s.vy * dt);
        if (s.vy <= 0 && s.pos.y <= g2) {
          s.pos.y = g2;
          s.vy = 0;
          s.airborne = false;
        }
      } else if (ground > s.pos.y) {
        s.pos.y = THREE.MathUtils.damp(s.pos.y, ground, 18, dt);
      }

      // fell into the void: back to the start of the Captain Room (items stay collected)
      if (s.pos.y < -5) {
        s.pos.set(CAPTAIN_START.x, 0, CAPTAIN_START.z);
        s.rotY = CAPTAIN_START.rotY;
        s.speed = 0;
        s.vy = 0;
        s.airborne = false;
        onFall?.();
      }

      // grab the Captain's item by touching it
      if (!collectedRef.current.captain && Math.hypot(s.pos.x - CAPTAIN_ITEM.x, s.pos.z - CAPTAIN_ITEM.z) < 2.0 && s.pos.y > 1.8) {
        onPickup?.("captain");
      }

      // which "Press E" zone are we in?
      let near = null;
      if (s.pos.y < 0.5) for (const z of ZONES) if (Math.hypot(s.pos.x - z.x, s.pos.z - z.z) < z.r) near = z.id;
      if (near !== nearRef.current) {
        nearRef.current = near;
        onNear?.(near);
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0;
        headRef.current.rotation.y = s.turnRate * -0.12;
      }
    }

    g.position.copy(s.pos);
    const tilt = s.airborne ? THREE.MathUtils.clamp(-s.vy * 0.04, -0.25, 0.25) : 0;
    g.rotation.set(tilt, s.rotY, 0, "YXZ");
    g.scale.setScalar(Math.max(0.001, s.scale));
    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x += (s.speed * dt) / 0.22;
    });
  });

  return <ShipRoverModel groupRef={groupRef} wheelRefs={wheelRefs} headRef={headRef} />;
}

const SHOTS = {
  drop: { pos: [6.5, 4.8, 11.5], look: [0, 1.2, 4.5], k: 3 },
  items: { pos: [2.4, 2.4, 4.8], look: [0, 1.5, 0], k: 1.6 },
  aliens: { pos: [0.7, 3.6, 5.8], look: [0, 1.2, -4.6], k: 1.3 },
  portal: { pos: [6.5, 3.2, 3.2], look: [0, 1.0, 5.6], k: 1.6 },
};

function CameraDirector({ simRef, shot }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1, 0));
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3() }), []);
  const first = useRef(true);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const s = simRef.current;
    let k = 3.2;
    if (shot === "follow") {
      tmp.p.set(s.pos.x - Math.sin(s.rotY) * 6.4, s.pos.y + 4.3, s.pos.z - Math.cos(s.rotY) * 6.4);
      tmp.l.set(s.pos.x + Math.sin(s.rotY) * 2.2, s.pos.y + 0.8, s.pos.z + Math.cos(s.rotY) * 2.2);
    } else {
      const sh = SHOTS[shot] || SHOTS.drop;
      tmp.p.set(...sh.pos);
      tmp.l.set(...sh.look);
      k = sh.k;
    }
    if (first.current) {
      first.current = false;
      camera.position.copy(tmp.p);
      look.current.copy(tmp.l);
    }
    camera.position.lerp(tmp.p, 1 - Math.exp(-k * dt));
    look.current.lerp(tmp.l, 1 - Math.exp(-k * 1.6 * dt));
    camera.lookAt(look.current);
  });
  return null;
}

// ---------------------------------------------------------------------
// 2D overlays
// ---------------------------------------------------------------------
const QUEST_CSS = `
@keyframes wq-spin { to { transform: rotate(360deg); } }
@keyframes wq-grow { from { transform: scale(.05); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes wq-suck { 0% { transform: translate(-50%,-50%) translate(-34vw, 26vh) rotate(0deg) scale(1.1); }
  35% { transform: translate(-50%,-50%) translate(-18vw, 16vh) rotate(160deg) scale(.9); }
  100% { transform: translate(-50%,-50%) translate(0,0) rotate(1080deg) scale(0); } }
@keyframes wq-flash { 0%, 78% { opacity: 0; } 100% { opacity: 1; } }
@keyframes wq-tunnel { from { transform: translate(-50%,-50%) scale(.05); opacity: 0; } 30% { opacity: 1; } to { transform: translate(-50%,-50%) scale(2.6); opacity: 0; } }
@keyframes wq-bar { from { width: 0%; } to { width: 100%; } }
@keyframes wq-shake { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-4px,3px); } 50% { transform: translate(4px,-3px); } 75% { transform: translate(-3px,-2px); } }
@keyframes wq-fadeout { from { opacity: 1; } to { opacity: 0; } }
`;

function RoverIcon({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 120 96" aria-hidden="true">
      <rect x="22" y="38" width="76" height="26" rx="6" fill="#f8fafc" />
      <rect x="22" y="47" width="76" height="6" fill="#f97316" />
      <rect x="16" y="32" width="88" height="6" rx="3" fill="#1d4ed8" />
      <rect x="56" y="12" width="5" height="22" fill="#cbd5e1" />
      <rect x="42" y="4" width="34" height="16" rx="4" fill="#1e293b" />
      <circle cx="52" cy="12" r="4" fill="#67e8f9" />
      <circle cx="66" cy="12" r="4" fill="#67e8f9" />
      {[30, 60, 90].map((x) => (
        <circle key={x} cx={x} cy="74" r="12" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
      ))}
    </svg>
  );
}

function SuckCutscene({ t }) {
  return (
    <div className="fixed inset-0 z-[36] overflow-hidden" style={{ animation: "wq-shake .25s linear infinite" }}>
      <div className="absolute inset-0 bg-slate-950/40" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: "160vmax", height: "160vmax" }}>
        <div
          className="w-full h-full rounded-full"
          style={{
            animation: "wq-grow 1.4s ease-out forwards, wq-spin 1.2s linear infinite",
            background:
              "radial-gradient(circle, #000 0%, #000 6%, transparent 7%), repeating-conic-gradient(from 0deg, rgba(168,85,247,.85) 0deg 14deg, rgba(30,10,60,.7) 14deg 30deg)",
            maskImage: "radial-gradient(circle, #000 30%, transparent 62%)",
            WebkitMaskImage: "radial-gradient(circle, #000 30%, transparent 62%)",
          }}
        />
      </div>
      <div className="absolute left-1/2 top-1/2" style={{ animation: "wq-suck 2.8s cubic-bezier(.6,0,.9,.6) forwards" }}>
        <RoverIcon />
      </div>
      <div className="absolute inset-x-0 top-[12%] text-center font-display text-2xl sm:text-4xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,.9)]">{t.sucked}</div>
      <div className="absolute inset-0 bg-white" style={{ animation: "wq-flash 3.2s ease-in forwards" }} />
    </div>
  );
}

function LoadingScreen({ t }) {
  const [tip, setTip] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTip((n) => (n + 1) % t.loadingTips.length), 900);
    return () => clearInterval(id);
  }, [t]);
  return (
    <div className="fixed inset-0 z-[37] overflow-hidden bg-[#07021a] flex flex-col items-center justify-center">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full border-4"
          style={{ width: "60vmin", height: "60vmin", borderColor: ["#a855f7", "#22d3ee", "#e879f9"][i % 3], animation: `wq-tunnel 2.4s linear ${i * 0.4}s infinite both` }}
        />
      ))}
      <div className="relative z-10 w-full max-w-sm px-6 text-center">
        <div className="mx-auto mb-4" style={{ animation: "wq-spin 3s linear infinite", width: 90 }}>
          <RoverIcon size={90} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">{t.loadingTitle}</h2>
        <p className="text-sm font-bold text-violet-200 h-5 mb-4">{t.loadingTips[tip]}</p>
        <div className="h-3 rounded-full bg-slate-800 border border-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-300" style={{ animation: "wq-bar 3.4s ease-in-out forwards" }} />
        </div>
      </div>
    </div>
  );
}

function Pad({ label, children, onDown, onUp, className = "" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture?.(e.pointerId);
        } catch {
          /* ignore */
        }
        onDown();
      }}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onLostPointerCapture={onUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: "none" }}
      className={`rounded-2xl bg-slate-900/85 active:bg-cyan-400 active:text-slate-950 text-white border-2 border-white/20 flex items-center justify-center shadow-lg ${className}`}
    >
      {children}
    </button>
  );
}

function QuizModal({ t, lang, onWin, onClose, onSfx }) {
  const pool = SECRET_QUIZ[lang] || SECRET_QUIZ.en;
  const [qi, setQi] = useState(() => Math.floor(Math.random() * pool.length));
  const [picked, setPicked] = useState(null);
  const q = pool[qi];
  const right = picked != null && picked === q.c;
  return (
    <div className="fixed inset-0 z-[38] flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-md bg-slate-900 border-2 border-emerald-400/70 rounded-3xl p-5 shadow-2xl">
        <div className="text-center text-5xl mb-1">🍪</div>
        <h2 className="font-display text-2xl font-bold text-emerald-300 text-center">{t.quiz.title}</h2>
        <p className="text-sm font-bold text-slate-300 text-center mb-3">{t.quiz.intro}</p>
        <p className="font-display text-lg font-bold text-white mb-3">{q.q}</p>
        <div className="grid gap-2">
          {q.a.map((a, i) => {
            const state = picked == null ? "idle" : i === q.c ? "right" : i === picked ? "wrong" : "dim";
            return (
              <button
                key={i}
                type="button"
                disabled={picked != null}
                onClick={() => {
                  setPicked(i);
                  onSfx(i === q.c ? "success" : "wrong");
                }}
                className={`py-3 px-4 rounded-2xl text-left font-bold border-2 transition ${
                  state === "right"
                    ? "bg-emerald-400 text-slate-950 border-emerald-200"
                    : state === "wrong"
                    ? "bg-rose-500/80 text-white border-rose-300"
                    : state === "dim"
                    ? "bg-slate-800 text-slate-500 border-white/5"
                    : "bg-slate-800 hover:bg-slate-700 text-white border-white/15"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
        {picked != null && <p className={`mt-3 text-center font-bold ${right ? "text-emerald-300" : "text-amber-300"}`}>{right ? t.quiz.right : t.quiz.wrong}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="py-3 rounded-2xl bg-slate-800 border border-white/15 text-slate-200 font-bold">
            {t.quiz.close}
          </button>
          {picked != null &&
            (right ? (
              <button type="button" onClick={onWin} className="py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-display font-bold">
                🍪 {t.quiz.take}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setQi((n) => (n + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length);
                  setPicked(null);
                  onSfx("click");
                }}
                className="py-3 rounded-2xl bg-amber-400 text-slate-950 font-display font-bold"
              >
                🔄 {t.quiz.tryAgain}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function VaultModal({ t, play, soundOn, onWin, onClose }) {
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null); // null | "win" | "lose"
  return (
    <div className="fixed inset-0 z-[38] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-3xl max-h-[96vh] overflow-y-auto bg-slate-900 border-2 border-fuchsia-400/70 rounded-3xl p-3 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-fuchsia-300">💎 {t.vaultTitle}</h2>
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/15 text-slate-200 text-sm font-bold">
            {t.leave}
          </button>
        </div>
        {result == null ? (
          <PlayStage key={round} preset="vaultLock" goal={t.vaultGoal} p={play} soundOn={soundOn} onDone={(stars) => setResult(stars >= 2 ? "win" : "lose")} />
        ) : (
          <div className="py-8 text-center">
            <div className="text-6xl mb-2">{result === "win" ? "💎" : "🔒"}</div>
            <p className="font-display text-xl font-bold text-white mb-4 max-w-md mx-auto">{result === "win" ? t.vaultWin : t.vaultLose}</p>
            {result === "win" ? (
              <button type="button" onClick={onWin} className="px-8 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-slate-950 font-display font-bold text-lg">
                💎 {t.take}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setRound((n) => n + 1);
                }}
                className="px-8 py-3 rounded-2xl bg-amber-400 text-slate-950 font-display font-bold text-lg"
              >
                🔄 {t.retry}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// The quest
// ---------------------------------------------------------------------
export default function WormholeQuest({ lang, play, soundOn, locked: externalLock, onSfx, onStageChange, onComplete, onPause }) {
  const t = SECRET_TEXT[lang] || SECRET_TEXT.en;
  // suck | loading | drop | intro | explore | endItems | endAliens | endPortal | flash
  const [stage, setStage] = useState("suck");
  const [introLine, setIntroLine] = useState(0);
  const [collected, setCollected] = useState({ captain: false, canteen: false, treasure: false });
  const [placed, setPlaced] = useState({ captain: false, canteen: false, treasure: false });
  const [near, setNear] = useState(null);
  const [modal, setModal] = useState(null); // quiz | vault
  const [toast, setToast] = useState(null);
  const [room, setRoom] = useState("centre");
  const simRef = useRef(null);
  if (!simRef.current) simRef.current = createSim();
  const inputRef = useRef({ up: false, down: false, left: false, right: false });
  const collectedRef = useRef(collected);
  collectedRef.current = collected;

  useEffect(() => onStageChange?.(stage), [stage, onStageChange]);

  const say = useCallback((text) => setToast({ text, key: Date.now() + Math.random() }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  // Cutscene timeline: wormhole -> loading -> drop onto the ship
  useEffect(() => {
    if (stage === "suck") {
      onSfx("whoosh");
      const id = setTimeout(() => setStage("loading"), 3200);
      return () => clearTimeout(id);
    }
    if (stage === "loading") {
      const id = setTimeout(() => {
        setStage("drop");
        onSfx("whoosh");
      }, 3600);
      return () => clearTimeout(id);
    }
    if (stage === "endItems") {
      const id = setTimeout(() => {
        setStage("endAliens");
        onSfx("badge");
      }, 4000);
      return () => clearTimeout(id);
    }
    if (stage === "flash") {
      const id = setTimeout(() => onComplete?.(), 900);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Show which part of the ship the rover is in
  useEffect(() => {
    if (stage !== "explore") return undefined;
    const id = setInterval(() => setRoom(roomAt(simRef.current.pos.x, simRef.current.pos.z)), 300);
    return () => clearInterval(id);
  }, [stage]);
  useEffect(() => {
    if (stage === "explore" && room === "captain" && !collected.captain) say(t.obbyHint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const locked = stage !== "explore" || !!modal || externalLock;

  const collect = useCallback(
    (k) => {
      setCollected((c) => (c[k] ? c : { ...c, [k]: true }));
      onSfx("badge");
      say(`${t.items[k].icon} ${t.gotItem.replace("{item}", t.items[k].name)}`);
      if (k === "captain") setTimeout(() => say(t.captainDone), 3300);
    },
    [onSfx, say, t]
  );

  const interact = useCallback(() => {
    if (locked || !near) return;
    if (near === "desk") {
      const next = { ...placed };
      let moved = 0;
      ITEM_KEYS.forEach((k) => {
        if (collected[k] && !next[k]) {
          next[k] = true;
          moved += 1;
        }
      });
      const total = ITEM_KEYS.filter((k) => next[k]).length;
      if (moved) {
        setPlaced(next);
        onSfx("success");
      }
      if (total >= 3) {
        setNear(null);
        setTimeout(() => setStage("endItems"), moved ? 600 : 0);
      } else {
        say(moved ? `${t.deskPlaced} ${t.deskNeed.replace("{n}", 3 - total)}` : t.deskNeed.replace("{n}", 3 - total));
        if (!moved) onSfx("click");
      }
    } else if (near === "machine") {
      if (collected.canteen) say(t.alreadyHave);
      else {
        onSfx("click");
        setModal("quiz");
      }
    } else if (near === "vault") {
      if (collected.treasure) say(t.alreadyHave);
      else {
        onSfx("click");
        setModal("vault");
      }
    }
  }, [locked, near, placed, collected, onSfx, say, t]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "KeyE") interact();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interact]);

  const dpad = (dir) => ({
    onDown: () => (inputRef.current = { ...inputRef.current, [dir]: true }),
    onUp: () => (inputRef.current = { ...inputRef.current, [dir]: false }),
  });

  const shot = stage === "drop" || stage === "intro" || stage === "loading" ? "drop" : stage === "endItems" ? "items" : stage === "endAliens" ? "aliens" : stage === "endPortal" || stage === "flash" ? "portal" : "follow";
  const ending = stage.startsWith("end") || stage === "flash";
  const allFound = ITEM_KEYS.every((k) => collected[k]);
  const zoneLabel = near === "desk" ? t.desk : near === "machine" ? t.machine : near === "vault" ? t.vault : null;

  return (
    <div className="fixed inset-0 z-[35] select-none">
      <style>{QUEST_CSS}</style>

      {/* 3D ship (built during the loading screen so it's ready) */}
      {stage !== "suck" && (
        <div className="absolute inset-0 bg-[#050816]">
          <Canvas shadows camera={{ position: [6.5, 4.8, 11.5], fov: 55 }}>
            <color attach="background" args={["#050816"]} />
            <fog attach="fog" args={["#050816", 30, 70]} />
            <ambientLight intensity={0.55} color="#c7d2fe" />
            <hemisphereLight args={["#a5b4fc", "#1e1b4b", 0.5]} />
            <directionalLight position={[10, 20, 8]} intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} />
            <Stars radius={80} depth={40} count={2200} factor={3} fade />
            <ShipWorld t={t} collected={collected} placed={placed} deskReady={ITEM_KEYS.some((k) => collected[k] && !placed[k])} ending={ending} />
            <Portal position={[0, 8.5, SPAWN.z]} rotation={[-Math.PI / 2, 0, 0]} show={stage === "drop" || stage === "loading"} />
            <Portal position={[PORTAL_POS.x, 1.6, PORTAL_POS.z]} rotation={[0, Math.PI, 0]} show={stage === "endPortal" || stage === "flash" || stage === "endAliens"} color="#22d3ee" />
            {[
              [-1.8, -4.4, "#84cc16", 0],
              [0, -5.0, "#2dd4bf", 0.25],
              [1.8, -4.4, "#a78bfa", 0.5],
            ].map(([x, z, c, d]) => (
              <Alien key={c} position={[x, 0, z]} color={c} delay={d} show={stage === "endAliens" || stage === "endPortal" || stage === "flash"} />
            ))}
            <ShipSim
              simRef={simRef}
              stage={stage}
              inputRef={inputRef}
              locked={locked}
              collectedRef={collectedRef}
              soundOn={soundOn}
              onNear={setNear}
              onFall={() => {
                onSfx("alert");
                say(t.fell);
              }}
              onPickup={collect}
              onLanded={() => setTimeout(() => setStage("intro"), 900)}
              onPortalIn={() => {
                onSfx("victory");
                setStage("flash");
              }}
            />
            <CameraDirector simRef={simRef} shot={shot} />
          </Canvas>
        </div>
      )}

      {stage === "suck" && <SuckCutscene t={t} />}
      {stage === "loading" && <LoadingScreen t={t} />}
      {stage === "drop" && <div className="fixed inset-0 bg-white pointer-events-none" style={{ animation: "wq-fadeout .8s ease-out forwards" }} />}

      {/* Dr Farah checks on the rover */}
      {stage === "intro" && (
        <div className="fixed inset-x-0 bottom-0 z-[37] p-3 sm:p-6 flex flex-col items-center gap-3 bg-gradient-to-t from-slate-950/90 to-transparent">
          <CapAvatar mood={introLine === 0 ? "worried" : "happy"} message={t.intro[introLine]} />
          <button
            type="button"
            onClick={() => {
              onSfx("click");
              if (introLine < t.intro.length - 1) setIntroLine((n) => n + 1);
              else setStage("explore");
            }}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-display font-bold text-lg shadow-lg"
          >
            {introLine < t.intro.length - 1 ? `${t.next} →` : `🚙 ${t.letsGo}`}
          </button>
        </div>
      )}

      {/* Exploring HUD */}
      {stage === "explore" && (
        <>
          <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[36] max-w-[280px] px-3.5 py-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 border-violet-400/60 shadow-xl">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-violet-300">🛸 {t.places[room]}</div>
            <div className="text-sm font-bold text-white leading-snug mt-0.5">{allFound ? t.objectiveDone : t.objective}</div>
            <div className="flex gap-1.5 mt-2">
              {ITEM_KEYS.map((k) => (
                <div
                  key={k}
                  title={t.items[k].name}
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-2xl border-2 ${collected[k] ? "bg-violet-500/30 border-violet-300" : "bg-slate-800 border-white/10 grayscale opacity-40"}`}
                >
                  {t.items[k].icon}
                  {placed[k] && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-extrabold flex items-center justify-center">✓</span>}
                </div>
              ))}
            </div>
            <div className="hidden md:block text-[10px] font-semibold text-slate-400 mt-2">{t.controls}</div>
          </div>
          <button
            type="button"
            onClick={onPause}
            className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[36] w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/15 shadow-lg text-lg flex items-center justify-center"
          >
            ⏸️
          </button>

          {zoneLabel && !modal && (
            <div className="fixed inset-x-0 bottom-28 sm:bottom-32 z-[36] flex justify-center px-4 pointer-events-none">
              <button
                type="button"
                onClick={interact}
                className="rover-pop-in pointer-events-auto flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-display font-bold shadow-xl border-2 border-white/80 animate-pulse"
              >
                <kbd className="w-10 h-10 rounded-xl bg-slate-950/85 text-white text-xl flex items-center justify-center border-b-4 border-slate-600">E</kbd>
                <span className="text-left leading-tight">
                  <span className="block text-[11px] uppercase tracking-wider opacity-80">{t.pressE}</span>
                  <span className="block text-base sm:text-lg">{zoneLabel}</span>
                </span>
              </button>
            </div>
          )}

          {/* Touch controls */}
          {!modal && (
            <>
              <div className="fixed right-3 sm:right-5 bottom-4 sm:bottom-6 z-[36] flex flex-col items-center gap-1.5">
                <Pad label="up" {...dpad("up")} className="w-14 h-14">
                  <ArrowUp className="w-7 h-7" />
                </Pad>
                <div className="flex gap-1.5">
                  <Pad label="left" {...dpad("left")} className="w-14 h-14">
                    <ArrowLeft className="w-7 h-7" />
                  </Pad>
                  <Pad label="down" {...dpad("down")} className="w-14 h-14">
                    <ArrowDown className="w-7 h-7" />
                  </Pad>
                  <Pad label="right" {...dpad("right")} className="w-14 h-14">
                    <ArrowRight className="w-7 h-7" />
                  </Pad>
                </div>
              </div>
              <div className="fixed left-3 sm:left-5 bottom-4 sm:bottom-6 z-[36] flex gap-2">
                <Pad label={t.jump} onDown={() => (simRef.current.jumpReq = true)} onUp={() => {}} className="w-16 h-16 font-display font-bold text-sm flex-col">
                  <span className="text-xl">⤴️</span>
                  {t.jump}
                </Pad>
              </div>
            </>
          )}
        </>
      )}

      {toast && (
        <div className="fixed top-28 inset-x-0 z-[37] flex justify-center px-4 pointer-events-none">
          <div key={toast.key} className="rover-pop-in max-w-md px-5 py-3 rounded-2xl bg-violet-400 text-slate-950 font-bold shadow-xl text-sm sm:text-base text-center">
            {toast.text}
          </div>
        </div>
      )}

      {/* Ending */}
      {stage === "endItems" && (
        <div className="fixed inset-x-0 bottom-10 z-[37] flex justify-center px-4 pointer-events-none">
          <div className="rover-pop-in px-6 py-3 rounded-2xl bg-slate-950/80 border border-white/15 font-display text-lg sm:text-2xl font-bold text-white text-center">{t.endingLook}</div>
        </div>
      )}
      {stage === "endAliens" && (
        <div className="fixed inset-x-0 bottom-0 z-[37] p-3 sm:p-6 flex flex-col items-center gap-3 bg-gradient-to-t from-slate-950/90 to-transparent">
          <div className="rover-pop-in max-w-xl flex items-start gap-3 bg-lime-950/90 border-2 border-lime-300/70 rounded-3xl px-5 py-4 shadow-2xl">
            <span className="text-4xl">👽</span>
            <p className="font-display text-base sm:text-xl font-bold text-lime-100 leading-snug">{t.alienLine}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSfx("click");
              setStage("endPortal");
            }}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-400 text-slate-950 font-display font-bold text-lg shadow-lg"
          >
            🌀 {t.goHome}
          </button>
        </div>
      )}
      {stage === "flash" && <div className="fixed inset-0 z-[39] bg-white" style={{ animation: "wq-grow .6s ease-out forwards" }} />}

      {modal === "quiz" && (
        <QuizModal
          t={t}
          lang={lang}
          onSfx={onSfx}
          onClose={() => {
            onSfx("click");
            setModal(null);
          }}
          onWin={() => {
            setModal(null);
            collect("canteen");
          }}
        />
      )}
      {modal === "vault" && (
        <VaultModal
          t={t}
          play={play}
          soundOn={soundOn}
          onClose={() => {
            onSfx("click");
            setModal(null);
          }}
          onWin={() => {
            setModal(null);
            collect("treasure");
          }}
        />
      )}
    </div>
  );
}

// Secret badge award shown back on Mars
export function SecretBadgeModal({ lang, onClose }) {
  const t = SECRET_TEXT[lang] || SECRET_TEXT.en;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-sm bg-slate-900 border-2 border-violet-400/80 rounded-3xl p-6 shadow-[0_0_60px_rgba(168,85,247,.45)] text-center">
        <div className="text-xs font-extrabold uppercase tracking-widest text-violet-300 mb-2">{t.badgeTitle}</div>
        <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-1 shadow-xl mb-3">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-display text-6xl font-bold text-white">{t.badgeName}</div>
        </div>
        <p className="text-sm font-bold text-slate-300 mb-5">{t.badgeText}</p>
        <button type="button" onClick={onClose} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-400 to-cyan-300 text-slate-950 font-display font-bold text-lg">
          🚙 {t.badgeBtn}
        </button>
      </div>
    </div>
  );
}
