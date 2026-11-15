import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { TASKS, CHECKPOINT_RADIUS, HOME_POS, FLAG_POS, PAD_POS, WORLD, GRAVITY } from "../data/tasks";
import { drawJalurGemilang, JalurGemilang } from "./FlagPlant";
import { spaceAudio } from "../utils/sound";
import { GfxContext, DecoLight, canvasQuality } from "../utils/gfx";

// Ground height for the active world (Mars: Jezero Crater, Moon: Shackleton Crater)
export function getTerrainHeight(x, z) {
  return WORLD === "moon" ? moonHeight(x, z) : marsHeight(x, z);
}

// Moon: grey basin dotted with bowl-shaped craters, Shackleton's rim rising beyond the base
const MOON_CRATERS = [
  { x: -22, z: -2, r: 4.5, d: 1.3 },
  { x: 7, z: -20, r: 5, d: 1.4 },
  { x: 25, z: 2, r: 4, d: 1.1 },
  { x: -5, z: -26, r: 3.5, d: 1 },
  { x: 12, z: 8, r: 2.2, d: 0.6 },
  { x: -10, z: 4, r: 1.8, d: 0.5 },
];
function moonHeight(x, z) {
  const dist = Math.hypot(x, z);
  const rimFactor = Math.max(0, (dist - 20) / 26);
  let h = Math.pow(Math.min(rimFactor, 1.1), 1.6) * 4.5 + Math.sin(x * 0.15) * Math.cos(z * 0.13) * Math.min(rimFactor, 1) * 1.2;
  for (const c of MOON_CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z) / c.r;
    if (d < 1) h -= c.d * (1 - d * d); // bowl
    else if (d < 1.4) h += c.d * 0.35 * (1 - (d - 1) / 0.4); // raised rim
  }
  return h + Math.sin(x * 0.5) * Math.cos(z * 0.45) * 0.08;
}

// Mars: deterministic Jezero Crater heightmap, flat central outpost basin, crater rim ridges outside
function marsHeight(x, z) {
  const dist = Math.hypot(x, z);
  const rimFactor = Math.max(0, (dist - 15) / 28);
  const craterRim =
    // rim height is capped low enough that the Mars sky (sunsets, moons, Earth) stays visible
    Math.pow(Math.min(rimFactor, 1.15), 1.7) * 5.2 +
    Math.sin(x * 0.12) * Math.cos(z * 0.12) * Math.min(rimFactor, 1) * 1.8;
  const micro = Math.sin(x * 0.35 + 1.1) * Math.cos(z * 0.32) * 0.18 * Math.min(dist / 10, 1);
  return craterRim + micro;
}

// Hidden wormhole anomaly: far out near the crater rim, away from every task and the base
export const SECRET_POS = { x: -26, z: 7 };
// Moon only: 6 "pieces of space" scattered far from the tasks (no glow, no label, no map marker)
export const SPACE_PIECES = [
  { x: 24, z: -3 },
  { x: -25, z: 3 },
  { x: 9, z: -25 },
  { x: -20, z: -21 },
  { x: -22, z: 20 },
  { x: 21, z: 19 },
];

const MODULE_POSITIONS = {
  habitat: new THREE.Vector3(0, 1.2, 0),
  solar: new THREE.Vector3(7.5, 0.8, -3.5),
  moxie: new THREE.Vector3(-7.0, 0.9, -2.5),
  greenhouse: new THREE.Vector3(-5.2, 0.9, 6.2),
};

// Scattered boulders (deterministic so colliders match what you see), built per world
function buildRocks() {
  const items = [];
  let seed = WORLD === "moon" ? 707 : 101;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 65; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 12 + rand() * 38;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const clear = [...TASKS.map((t) => t.pos), HOME_POS, FLAG_POS, PAD_POS].filter(Boolean);
    if (clear.some((p) => Math.hypot(x - p.x, z - p.z) < 5)) continue;
    const y = getTerrainHeight(x, z);
    const scale = 0.35 + rand() * 1.15;
    items.push({
      pos: [x, y + scale * 0.28, z],
      scale: [scale, scale * (0.6 + rand() * 0.5), scale],
      rot: [rand() * 3, rand() * 3, 0],
    });
  }
  return items;
}

const TERRAIN_COLORS = {
  mars: ["#a84829", "#be5533", "#94371d", "#732613"],
  moon: ["#8e8e93", "#a1a1aa", "#71717a", "#52525b"],
};

function MartianTerrain({ world }) {
  const geometry = useMemo(() => {
    const pal = TERRAIN_COLORS[world] || TERRAIN_COLORS.mars;
    const geo = new THREE.PlaneGeometry(130, 130, 96, 96);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z);
      pos.setY(i, y);

      if (y < (world === "moon" ? -0.3 : 0.4)) {
        c.set(world === "moon" ? pal[2] : pal[0]);
      } else if (y < 2.2) {
        c.set(world === "moon" ? pal[(Math.abs(Math.round(x * 3 + z * 7)) % 2) ? 0 : 1] : pal[1]);
      } else if (y < 5.0) {
        c.set(pal[2]);
      } else {
        c.set(pal[3]);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [world]);

  const rocks = worldData().rocks;

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.94} metalness={0.04} flatShading />
      </mesh>
      {rocks.map((r, idx) => (
        <mesh key={idx} position={r.pos} scale={r.scale} rotation={r.rot} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={world === "moon" ? "#6b6b70" : "#7d311a"} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function FloatingDustMotes({ isNight }) {
  const ref = useRef();
  const count = 240;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 48;
      arr[i * 3 + 1] = Math.random() * 12 + 0.3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 48;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let x = pos.getX(i) + delta * 0.55;
      let y = pos.getY(i) + Math.sin(i + x * 0.3) * delta * 0.15;
      if (x > 24) x = -24;
      if (y > 13) y = 0.5;
      pos.setXY(i, x, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={isNight ? "#94a3b8" : "#f5a07a"}
        size={0.14}
        transparent
        opacity={isNight ? 0.35 : 0.65}
        sizeAttenuation
      />
    </points>
  );
}

function DustDevil({ active, center = { x: 4, z: -2 } }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current || !active) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.x = Math.sin(t * 0.45) * 7 + center.x;
    groupRef.current.position.z = Math.cos(t * 0.35) * 4 + center.z;
    groupRef.current.rotation.y = t * 4.5;
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={[8, 0, -4]}>
      {[0, 1, 2, 3, 4].map((ring) => (
        <mesh key={ring} position={[0, 0.8 + ring * 1.1, 0]} rotation={[Math.PI / 2, 0, ring]}>
          <torusGeometry args={[0.7 + ring * 0.42, 0.22 + ring * 0.05, 8, 18]} />
          <meshStandardMaterial color="#d97757" transparent opacity={0.42 - ring * 0.05} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function HabitatAndShield({ shielding, isNight, solarStorm, onSelect, selected, label }) {
  const shieldRef = useRef();

  useFrame(({ clock }) => {
    if (!shieldRef.current) return;
    const t = clock.getElapsedTime();
    const isLow = shielding <= 25;
    let baseOpacity = 0.12 + (shielding / 100) * 0.22;

    if (solarStorm) {
      baseOpacity += Math.sin(t * 8) * 0.14;
    } else if (isLow) {
      baseOpacity = 0.08 + Math.abs(Math.sin(t * 10)) * 0.18;
    }
    shieldRef.current.material.opacity = THREE.MathUtils.clamp(baseOpacity, 0.06, 0.5);
  });

  const shieldColor =
    shielding <= 25 ? "#ef4444" : shielding <= 45 ? "#f59e0b" : solarStorm ? "#a855f7" : "#38bdf8";

  return (
    <group
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("habitat");
      }}
    >
      {/* Base Platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.6, 3.9, 0.3, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Pressurized White Habitat Dome */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[2.6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* Orange Airlock Tunnel */}
      <mesh position={[0, 0.75, 2.5]} castShadow>
        <boxGeometry args={[1.3, 1.2, 1.2]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
      </mesh>

      {/* Warm Glowing Windows (brighter at night) */}
      {[0.6, -0.6, 1.8, -1.8].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.sin(angle) * 2.52, 1.05, Math.cos(angle) * 2.52]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.55, 0.32, 0.1]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#facc15"
            emissiveIntensity={isNight ? 2.4 : 0.9}
          />
        </mesh>
      ))}

      {/* Glowing Energy Shield Bubble */}
      <mesh ref={shieldRef} position={[0, 0.2, 0]}>
        <sphereGeometry args={[4.3, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={shieldColor}
          emissive={shieldColor}
          emissiveIntensity={solarStorm ? 1.3 : 0.65}
          transparent
          opacity={0.25}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {selected && (
        <Html position={[0, 4.9, 0]} center distanceFactor={14}>
          <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-sky-400/60 text-xs font-bold text-sky-200 whitespace-nowrap shadow-lg">
            ❤️ {label} ({shielding}%)
          </div>
        </Html>
      )}
    </group>
  );
}

function SolarArrayField({ dusty, power, onSelect, selected, label }) {
  const panels = [
    [-1.6, 0],
    [0, 0],
    [1.6, 0],
  ];

  return (
    <group
      position={[7.5, getTerrainHeight(7.5, -3.5), -3.5]}
      rotation={[0, -0.45, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("solar");
      }}
    >
      {panels.map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          {/* Pole */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 1.0, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} />
          </mesh>
          {/* Tilted Solar Panel */}
          <mesh position={[0, 1.05, 0]} rotation={[0.45, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.08, 2.0]} />
            <meshStandardMaterial
              color={dusty ? "#b85535" : "#1d4ed8"}
              metalness={dusty ? 0.08 : 0.85}
              roughness={dusty ? 0.95 : 0.15}
              emissive={dusty ? "#000000" : "#0ea5e9"}
              emissiveIntensity={dusty ? 0 : 0.25}
            />
          </mesh>
        </group>
      ))}

      {selected && (
        <Html position={[0, 2.5, 0]} center distanceFactor={14}>
          <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-amber-400/60 text-xs font-bold text-amber-200 whitespace-nowrap shadow-lg">
            ⚡ {label} ({power}%)
          </div>
        </Html>
      )}
    </group>
  );
}

function MoxieUnit({ oxygen, onSelect, selected, label }) {
  const ventRef = useRef();

  useFrame(({ clock }) => {
    if (!ventRef.current) return;
    const speed = 2 + (oxygen / 100) * 6;
    const pulse = 0.6 + Math.sin(clock.getElapsedTime() * speed) * 0.4;
    ventRef.current.material.emissiveIntensity = 0.6 + pulse * 1.4;
  });

  return (
    <group
      position={[-7.0, getTerrainHeight(-7.0, -2.5), -2.5]}
      rotation={[0, 0.4, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("moxie");
      }}
    >
      {/* Reactor Box */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 1.5, 1.5]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Gold NASA Foil Accent */}
      <mesh position={[0, 0.75, 0.76]}>
        <boxGeometry args={[1.4, 0.9, 0.06]} />
        <meshStandardMaterial color="#eab308" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Glowing Oxygen Vent */}
      <mesh ref={ventRef} position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.35, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={1.4} />
      </mesh>

      {selected && (
        <Html position={[0, 2.7, 0]} center distanceFactor={14}>
          <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400/60 text-xs font-bold text-cyan-200 whitespace-nowrap shadow-lg">
            🫁 {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function GreenhousePod({ food, onSelect, selected, label }) {
  const growIntensity = 0.3 + (food / 100) * 1.6;

  return (
    <group
      position={[-5.2, getTerrainHeight(-5.2, 6.2), 6.2]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("greenhouse");
      }}
    >
      {/* Soil Planter Base */}
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.0, 2.2, 0.4, 18]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      {/* Green Space Potato Plants */}
      {[
        [-0.7, -0.4],
        [0.6, -0.5],
        [-0.2, 0.6],
        [0.7, 0.5],
        [0, 0],
      ].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 0.65, pz]} castShadow>
          <dodecahedronGeometry args={[0.34, 0]} />
          <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={growIntensity * 0.4} />
        </mesh>
      ))}
      {/* Grow Light Ring */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.06, 8, 20]} />
        <meshStandardMaterial color="#f0abfc" emissive="#d946ef" emissiveIntensity={growIntensity} />
      </mesh>
      {/* Transparent Glass Dome */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[1.95, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.28} roughness={0.1} depthWrite={false} />
      </mesh>

      {selected && (
        <Html position={[0, 2.8, 0]} center distanceFactor={14}>
          <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-400/60 text-xs font-bold text-emerald-200 whitespace-nowrap shadow-lg">
            🌱 {label} ({food}%)
          </div>
        </Html>
      )}
    </group>
  );
}

// ===== "Blast Off!" checkpoints =====
function DroneProp() {
  return (
    <group rotation={[0.35, 0.6, 0.25]} position={[0, 0.25, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.35, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, -0.25, 0]} rotation={[0, (i * Math.PI) / 2 + 0.4, 0.5]}>
          <boxGeometry args={[0.04, 0.5, 0.04]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* one long blade + one snapped blade */}
      <mesh position={[0, 0.45, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[1.4, 0.03, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.25, 0.5, 0]} rotation={[0, 1.6, 0]}>
        <boxGeometry args={[0.5, 0.03, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.9, -0.2, 0.4]} rotation={[0.2, 0.8, 0.1]}>
        <boxGeometry args={[0.55, 0.03, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function MeteoriteProp() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} scale={[2.4, 0.9, 2.4]} receiveShadow>
        <sphereGeometry args={[1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#9a3412" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[0.4, 0.7, 0.2]} castShadow>
        <dodecahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.15} emissive="#334155" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function DeltaRockProp() {
  const layers = ["#c2410c", "#fdba74", "#9a3412", "#fed7aa", "#b45309"];
  return (
    <group>
      {layers.map((c, i) => (
        <mesh key={i} position={[0, 0.18 + i * 0.26, 0]} rotation={[0, i * 0.15, 0]} castShadow>
          <boxGeometry args={[1.9 - i * 0.25, 0.26, 1.4 - i * 0.18]} />
          <meshStandardMaterial color={c} roughness={0.95} flatShading />
        </mesh>
      ))}
      {[-1.6, 1.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.3, i === 2 ? 1.6 : -0.8]} rotation={[0.3, i, 0.6]} castShadow>
          <tetrahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function IceProp() {
  return (
    <group>
      {[
        [0, 0.3, 0, 0.5],
        [0.6, 0.2, 0.3, 0.35],
        [-0.5, 0.18, -0.2, 0.3],
        [0.1, 0.15, -0.6, 0.28],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.3 * i, i, 0.2]}>
          <octahedronGeometry args={[s, 0]} />
          <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.6} transparent opacity={0.85} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 20]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function LaunchPadRocket({ ready }) {
  const glowRef = useRef();
  const { x, z } = PAD_POS;
  const y = getTerrainHeight(x, z);
  useFrame(({ clock }) => {
    if (glowRef.current) glowRef.current.intensity = ready ? 3 + Math.sin(clock.getElapsedTime() * 6) * 1.5 : 0.6;
  });
  return (
    <group position={[x + 3.2, y, z - 1.5]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.3, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.85, 3.4, 16]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[0.55, 1.2, 16]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin((i * Math.PI * 2) / 3) * 0.85, 0.85, Math.cos((i * Math.PI * 2) / 3) * 0.85]} rotation={[0, (i * Math.PI * 2) / 3, 0]} castShadow>
          <boxGeometry args={[0.08, 0.9, 0.6]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      ))}
      <pointLight ref={glowRef} position={[0, 0.6, 0]} color="#38bdf8" intensity={0.6} distance={10} />
    </group>
  );
}

function RecyclerProp() {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 1.8, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.3, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.9, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.9, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} />
      </mesh>
    </group>
  );
}

function DishProp() {
  return <SatelliteDish position={[0, 0, 0]} />;
}

function DustyPanelProp() {
  return (
    <group position={[0, 0.9, 0]} rotation={[0.5, 0.3, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2.2, 0.08, 1.4]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, 0.05, 0.1]}>
        <boxGeometry args={[1.6, 0.03, 1.1]} />
        <meshStandardMaterial color="#a8a29e" roughness={1} />
      </mesh>
    </group>
  );
}

const CHECKPOINT_PROPS = {
  recycler: RecyclerProp,
  dish: DishProp,
  panel: DustyPanelProp,
  drone: DroneProp,
  meteorite: MeteoriteProp,
  deltaRock: DeltaRockProp,
  ice: IceProp,
  rocket: null,
};

function Checkpoint({ task, index, status, label, quizLabel }) {
  const ringRef = useRef();
  const beamRef = useRef();
  const { x, z } = task.pos;
  const y = getTerrainHeight(x, z);
  const Prop = CHECKPOINT_PROPS[task.prop];
  const active = status === "active";
  const quiz = status === "quiz";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 3) * 0.06;
      ringRef.current.scale.set(s, s, s);
    }
    if (beamRef.current) beamRef.current.material.opacity = 0.18 + Math.sin(t * 2.5) * 0.06;
  });

  return (
    <group position={[x, y, z]}>
      {Prop && (
        <group position={[0, 0, 0]}>
          <Prop />
        </group>
      )}

      {active && (
        <>
          <mesh ref={ringRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[CHECKPOINT_RADIUS - 0.3, CHECKPOINT_RADIUS, 48]} />
            <meshBasicMaterial color="#facc15" transparent opacity={0.85} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={beamRef} position={[0, 7, 0]}>
            <cylinderGeometry args={[0.5, 0.9, 14, 16, 1, true]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
          <Html position={[0, 4.2, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
            <div className="px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 text-sm font-extrabold whitespace-nowrap shadow-lg border-2 border-white/70 pointer-events-none">
              🏁 {index + 1}. {label}
            </div>
          </Html>
        </>
      )}

      {quiz && (
        <>
          <mesh ref={ringRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[CHECKPOINT_RADIUS - 0.3, CHECKPOINT_RADIUS, 48]} />
            <meshBasicMaterial color="#c084fc" transparent opacity={0.85} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, 3.4, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
            <div className="px-3 py-1.5 rounded-full bg-violet-500 text-white text-sm font-extrabold whitespace-nowrap shadow-lg border-2 border-white/70 pointer-events-none animate-pulse">
              🏅 {quizLabel} {task.badge}
            </div>
          </Html>
        </>
      )}

      {status === "done" && (
        <Html position={[0, 2.8, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
          <div className="w-10 h-10 rounded-full bg-amber-300 border-2 border-white flex items-center justify-center text-xl shadow-lg pointer-events-none">{task.badge}</div>
        </Html>
      )}

      {(status === "done" || quiz) && (
        <group position={[CHECKPOINT_RADIUS - 0.6, 0, 0]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2, 6]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0.35, 1.75, 0]}>
            <boxGeometry args={[0.7, 0.42, 0.03]} />
            <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function HomeCheckpoint({ label }) {
  const ringRef = useRef();
  const beamRef = useRef();
  const y = getTerrainHeight(HOME_POS.x, HOME_POS.z);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 3) * 0.06;
      ringRef.current.scale.set(s, s, s);
    }
    if (beamRef.current) beamRef.current.material.opacity = 0.2 + Math.sin(t * 2.5) * 0.07;
  });
  return (
    <group position={[HOME_POS.x, y, HOME_POS.z]}>
      <mesh ref={ringRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[CHECKPOINT_RADIUS - 0.3, CHECKPOINT_RADIUS, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={beamRef} position={[0, 7, 0]}>
        <cylinderGeometry args={[0.5, 0.9, 14, 16, 1, true]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <Html position={[0, 4.2, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
        <div className="px-3 py-1.5 rounded-full bg-sky-400 text-slate-950 text-sm font-extrabold whitespace-nowrap shadow-lg border-2 border-white/70 pointer-events-none animate-pulse">
          🚀 {label}
        </div>
      </Html>
    </group>
  );
}

// 🚩 Flagpole checkpoint (Moon, after the 5 tasks)
function FlagCheckpoint({ label }) {
  const ringRef = useRef();
  const beamRef = useRef();
  const y = getTerrainHeight(FLAG_POS.x, FLAG_POS.z);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 3) * 0.06;
      ringRef.current.scale.set(s, s, s);
    }
    if (beamRef.current) beamRef.current.material.opacity = 0.2 + Math.sin(t * 2.5) * 0.07;
  });
  return (
    <group position={[FLAG_POS.x, y, FLAG_POS.z]}>
      <mesh ref={ringRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[CHECKPOINT_RADIUS - 0.3, CHECKPOINT_RADIUS, 48]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.9} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={beamRef} position={[0, 7, 0]}>
        <cylinderGeometry args={[0.5, 0.9, 14, 16, 1, true]} />
        <meshBasicMaterial color="#fca5a5" transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* an empty pole waiting for the flag */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} />
      </mesh>
      <Html position={[0, 4.2, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
        <div className="px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-extrabold whitespace-nowrap shadow-lg border-2 border-white/80 pointer-events-none animate-pulse">
          <JalurGemilang width={22} className="inline-block align-middle rounded-sm" /> {label}
        </div>
      </Html>
    </group>
  );
}

// The Jalur Gemilang standing on the Moon after it's planted (no wind, so it's held open by a crossbar)
function PlantedFlag() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 560;
    c.height = 280;
    drawJalurGemilang(c.getContext("2d"), c.width, c.height);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  const y = getTerrainHeight(FLAG_POS.x, FLAG_POS.z);
  return (
    <group position={[FLAG_POS.x, y, FLAG_POS.z]} rotation={[0, -0.6, 0]}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 3.4, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.25, 3.32, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.5, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
      </mesh>
      <mesh position={[1.25, 2.68, 0]} castShadow>
        <planeGeometry args={[2.4, 1.2]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.45, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color="#facc15" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

function GuideArrow({ roverState, target, visible }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = roverState.current;
    if (!visible || !target) {
      ref.current.visible = false;
      return;
    }
    const dx = target.x - s.pos.x;
    const dz = target.z - s.pos.z;
    ref.current.visible = Math.hypot(dx, dz) > CHECKPOINT_RADIUS + 1.5;
    ref.current.position.set(s.pos.x, s.pos.y + 2.9 + Math.sin(clock.getElapsedTime() * 3) * 0.12, s.pos.z);
    ref.current.rotation.y = Math.atan2(dx, dz);
  });
  return (
    <group ref={ref} visible={false}>
      <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.38, 0.75, 16]} />
        <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.75, 10]} />
        <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

// ===== Base buildings: extra detail so the outpost feels like a real place =====
// A "piece of space": a small dark shard full of tiny stars, half buried. Deliberately NOT glowing.
function SpacePiece({ pos }) {
  const ref = useRef();
  const y = getTerrainHeight(pos.x, pos.z);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.3;
  });
  return (
    <group position={[pos.x, y + 0.18, pos.z]}>
      <group ref={ref} rotation={[0.5, 0, 0.3]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.3} metalness={0.4} />
        </mesh>
        {[
          [0.12, 0.1, 0.22],
          [-0.15, 0.05, 0.2],
          [0.05, -0.12, 0.25],
          [0.2, -0.05, -0.15],
        ].map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.025, 6, 4]} />
            <meshBasicMaterial color="#e0e7ff" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// A strange swirling rift with a purple light beam: no label on the map, just "???"
function SecretAnomaly({ pos = SECRET_POS, color = "#a855f7", glow = "#c084fc", beam = true }) {
  const ringRef = useRef();
  const ring2Ref = useRef();
  const coreRef = useRef();
  const rocksRef = useRef();
  const beamRef = useRef();
  const y = getTerrainHeight(pos.x, pos.z);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 1.6;
      ringRef.current.rotation.x = Math.sin(t * 0.7) * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 2.3;
      ring2Ref.current.rotation.y = Math.cos(t * 0.5) * 0.4;
    }
    if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.12);
    if (rocksRef.current) rocksRef.current.rotation.y = t * 0.7;
    if (beamRef.current) beamRef.current.material.opacity = 0.22 + Math.sin(t * 2.2) * 0.1;
  });
  return (
    <group position={[pos.x, y, pos.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[2.8, 40]} />
        <meshBasicMaterial color="#2e1065" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <ringGeometry args={[2.4, 2.6, 40]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <group position={[0, 2.3, 0]}>
        <mesh ref={ringRef}>
          <torusGeometry args={[1.35, 0.12, 12, 48]} />
          <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={2.5} />
        </mesh>
        <mesh ref={ring2Ref}>
          <torusGeometry args={[1.6, 0.05, 8, 48]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
        </mesh>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.85, 24, 16]} />
          <meshBasicMaterial color="#12051f" />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.08, 24, 16]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={beamRef} position={[0, 15, 0]} visible={beam}>
        <cylinderGeometry args={[0.35, 0.9, 30, 16, 1, true]} />
        <meshBasicMaterial color={glow} transparent opacity={0.28} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <group ref={rocksRef} position={[0, 2.3, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.05) * 2.2, Math.sin(i * 2.1) * 0.6, Math.sin(i * 1.05) * 2.2]} rotation={[i, i * 2, 0]}>
            <dodecahedronGeometry args={[0.16 + (i % 3) * 0.08, 0]} />
            <meshStandardMaterial color="#4b5563" emissive="#6d28d9" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
      <DecoLight position={[0, 2.3, 0]} color={color} intensity={10} distance={12} />
      <Html position={[0, 4.4, 0]} center distanceFactor={14} zIndexRange={[10, 0]}>
        <div className="pointer-events-none px-3 py-1 rounded-full bg-violet-950/85 border-2 border-violet-400 text-violet-200 font-display font-bold text-lg animate-pulse">???</div>
      </Html>
    </group>
  );
}

const COMMS_TOWER = { x: 3.5, z: -6.5 };

// A short paved strip that follows the ground, with a row of "chase" lights on each side
function LitPath({ from, to, width = 1.1, lightsEvery = 1.1, phase = 0 }) {
  const lightsRef = useRef([]);
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const yaw = Math.atan2(dx, dz);
  const steps = Math.max(1, Math.round(len / 0.9));
  const nx = Math.cos(yaw);
  const nz = -Math.sin(yaw);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2.5 + phase;
    lightsRef.current.forEach((m, i) => {
      if (m) m.material.emissiveIntensity = (Math.sin(t - i * 0.9) + 1) * 1.4 + 0.2;
    });
  });

  const lights = [];
  const count = Math.max(1, Math.floor(len / lightsEvery));
  for (let i = 0; i <= count; i++) {
    const u = i / count;
    const cx = from[0] + dx * u;
    const cz = from[1] + dz * u;
    for (const side of [-1, 1]) {
      const lx = cx + nx * side * (width / 2 + 0.15);
      const lz = cz + nz * side * (width / 2 + 0.15);
      lights.push([lx, getTerrainHeight(lx, lz) + 0.12, lz]);
    }
  }

  return (
    <group>
      {Array.from({ length: steps }, (_, i) => {
        const u = (i + 0.5) / steps;
        const x = from[0] + dx * u;
        const z = from[1] + dz * u;
        return (
          <mesh key={i} position={[x, getTerrainHeight(x, z) + 0.04, z]} rotation={[0, yaw, 0]} receiveShadow>
            <boxGeometry args={[width, 0.06, len / steps + 0.02]} />
            <meshStandardMaterial color="#6b7280" roughness={0.9} />
          </mesh>
        );
      })}
      {lights.map((p, i) => (
        <mesh key={`l${i}`} ref={(el) => (lightsRef.current[i] = el)} position={p}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  );
}

function SatelliteDish({ position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 1.2;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.7, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} />
      </mesh>
      <group ref={ref} position={[0, 0.75, 0]}>
        <mesh rotation={[-0.9, 0, 0]}>
          <sphereGeometry args={[0.55, 20, 10, 0, Math.PI * 2, 0, Math.PI / 3.2]} />
          <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.25, 0.3]} rotation={[-0.9, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>
    </group>
  );
}

function BaseFlag({ position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 2.2) * 0.25;
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} />
      </mesh>
      <group ref={ref} position={[0, 2.5, 0]}>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1, 0.6, 0.03]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        <mesh position={[0.5, 0, 0.02]}>
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function LandingLights({ radius = 3.75, count = 14 }) {
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((m, i) => {
      if (m) m.material.emissiveIntensity = Math.sin(t * 3 - (i / count) * Math.PI * 2) > 0.6 ? 3 : 0.4;
    });
  });
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[Math.cos(a) * radius, 0.34, Math.sin(a) * radius]}>
            <sphereGeometry args={[0.09, 8, 6]} />
            <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={1} />
          </mesh>
        );
      })}
    </group>
  );
}

function OxygenTanks({ position }) {
  const puffs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    puffs.current.forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.6 + i / 3) % 1;
      m.position.y = 2.1 + k * 1.6;
      m.scale.setScalar(0.15 + k * 0.35);
      m.material.opacity = 0.55 * (1 - k);
    });
  });
  return (
    <group position={position}>
      {[-0.55, 0.55].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, 1.6, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.39, 0.39, 0.2, 16]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 1.65, 0]}>
            <sphereGeometry args={[0.38, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (puffs.current[i] = el)} position={[0, 2.1, 0]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function BatteryBank({ position, power }) {
  const refs = useRef([]);
  const lit = Math.max(1, Math.round((power / 100) * 5));
  useFrame(({ clock }) => {
    const blink = Math.sin(clock.getElapsedTime() * 4) > 0;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const on = i < lit - 1 || (i === lit - 1 && blink);
      m.material.emissiveIntensity = on ? 2 : 0.05;
    });
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.4, 1, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[-0.48 + i * 0.24, 0.55, 0.41]}>
          <boxGeometry args={[0.16, 0.3, 0.02]} />
          <meshStandardMaterial color="#86efac" emissive="#22c55e" emissiveIntensity={1} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

function GreenhouseRibs({ position }) {
  return (
    <group position={position}>
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((r) => (
        <mesh key={r} position={[0, 0.3, 0]} rotation={[0, r, 0]}>
          <torusGeometry args={[1.97, 0.05, 6, 32, Math.PI]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.97, 0.06, 6, 40]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function CommsTower() {
  const beacon = useRef();
  const y = getTerrainHeight(COMMS_TOWER.x, COMMS_TOWER.z);
  useFrame(({ clock }) => {
    if (beacon.current) beacon.current.material.emissiveIntensity = Math.sin(clock.getElapsedTime() * 3) > 0 ? 3 : 0.3;
  });
  return (
    <group position={[COMMS_TOWER.x, y, COMMS_TOWER.z]}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.35, 2.5, Math.sin(a) * 0.35]} rotation={[Math.sin(a) * 0.07, 0, -Math.cos(a) * 0.07]}>
            <cylinderGeometry args={[0.04, 0.05, 5, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
          </mesh>
        );
      })}
      {[1, 2, 3, 4].map((h) => (
        <mesh key={h} position={[0, h * 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34 - h * 0.03, 0.025, 4, 12]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}
      <mesh ref={beacon} position={[0, 5.1, 0]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>
      <SatelliteDish position={[0, 3.2, 0.25]} />
    </group>
  );
}

function BaseDetails({ power }) {
  const edge = (to, r) => {
    const d = Math.hypot(to[0], to[1]);
    return [
      [(to[0] / d) * 4.6, (to[1] / d) * 4.6],
      [to[0] - (to[0] / d) * (r + 0.2), to[1] - (to[1] / d) * (r + 0.2)],
    ];
  };
  const toSolar = edge([7.5, -3.5], 3.0);
  const toMoxie = edge([-7.0, -2.5], 1.9);
  const toGreen = edge([-5.2, 6.2], 2.4);
  return (
    <group>
      <LitPath from={toSolar[0]} to={toSolar[1]} phase={0} />
      <LitPath from={toMoxie[0]} to={toMoxie[1]} phase={1} />
      <LitPath from={toGreen[0]} to={toGreen[1]} phase={2} />
      {/* Main road out of the airlock towards the crater */}
      <LitPath from={[0, 4.6]} to={[0, 12]} width={1.6} lightsEvery={1.4} phase={3} />

      <LandingLights />
      <SatelliteDish position={[-1.4, 2.25, -1.2]} />
      <BaseFlag position={[1.9, 0.3, 3.5]} />
      <OxygenTanks position={[-7.0 - 1.6, getTerrainHeight(-8.6, -3.6), -3.6]} />
      <BatteryBank position={[7.5 + 0.4, getTerrainHeight(7.9, -0.8), -0.8]} power={power} />
      <GreenhouseRibs position={[-5.2, getTerrainHeight(-5.2, 6.2), 6.2]} />
      <CommsTower />
    </group>
  );
}

// Simple circular colliders so the rover bumps around base modules instead of driving through them
export const MODULE_COLLIDERS = [
  { id: "habitat", x: 0, z: 0, r: 4.5 },
  { id: "solar", x: 7.5, z: -3.5, r: 3.0 },
  { id: "moxie", x: -7.0, z: -2.5, r: 1.9 },
  { id: "greenhouse", x: -5.2, z: 6.2, r: 2.4 },
];

// Rocks + colliders for the active world (cached so they're built once per world)
const WORLD_CACHE = {};
function worldData() {
  if (!WORLD_CACHE[WORLD]) {
    // keep the ground around the wormhole anomaly clear so the rover can reach it
    const keepClear = WORLD === "moon" ? SPACE_PIECES : [SECRET_POS];
    const rocks = buildRocks().filter((r) => keepClear.every((p) => Math.hypot(r.pos[0] - p.x, r.pos[2] - p.z) > 4.5));
    const pad = PAD_POS;
    const rockColliders = rocks.filter((r) => r.scale[0] > 0.6).map((r) => ({ x: r.pos[0], z: r.pos[2], r: r.scale[0] * 0.85 }));
    WORLD_CACHE[WORLD] = {
      rocks,
      colliders: [...MODULE_COLLIDERS, ...rockColliders, { id: "tower", x: COMMS_TOWER.x, z: COMMS_TOWER.z, r: 0.6 }, { id: "pad", x: pad.x + 3.2, z: pad.z - 1.5, r: 2.3 }],
    };
  }
  return WORLD_CACHE[WORLD];
}

const ROVER_START = { x: 6.5, z: 7.5, rotY: -0.7 };
export const ROVER_BOUNDARY = 30;

export function createRoverState() {
  return {
    pos: new THREE.Vector3(ROVER_START.x, getTerrainHeight(ROVER_START.x, ROVER_START.z), ROVER_START.z),
    rotY: ROVER_START.rotY,
    speed: 0,
    turnRate: 0,
    pitch: 0,
    roll: 0,
    vy: 0, // vertical speed (low-gravity hops)
    airborne: false,
    hopTimer: 2,
  };
}

const damp = THREE.MathUtils.damp;
// Gravity comes from the active mission: Mars 3.71 m/s² (38% of Earth), Moon 1.62 m/s² (about 1/6)
const DUST_COUNT = 26;

function MiniRover({
  roverMode,
  dpadInput,
  roverState,
  onNearby,
  isNight,
  speedMult = 1,
  sizeMult = 1,
  damaged = false,
  inputLocked = false,
  targets = [],
  onReachCheckpoint,
  onFirstHop,
}) {
  const roverRef = useRef();
  const bodyRef = useRef();
  const wheelRefs = useRef([]);
  const ringRef = useRef();
  const beaconRef = useRef();
  const dustRefs = useRef([]);
  const keysRef = useRef({});
  const nearbyRef = useRef(null);
  const spawnAcc = useRef(0);
  const nearRef = useRef(null);
  const hoppedRef = useRef(false);
  const dust = useMemo(
    () => Array.from({ length: DUST_COUNT }, () => ({ life: 0, pos: new THREE.Vector3(), vel: new THREE.Vector3() })),
    []
  );

  useEffect(() => () => spaceAudio.stopMotor(), []);

  useEffect(() => {
    const onDown = (e) => {
      keysRef.current[e.code] = true;
    };
    const onUp = (e) => {
      keysRef.current[e.code] = false;
    };
    const onBlur = () => {
      keysRef.current = {};
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useFrame((state, rawDelta) => {
    if (!roverRef.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const s = roverState.current;
    const t = state.clock.getElapsedTime();

    let forward = 0;
    let turn = 0;
    if (roverMode && !inputLocked) {
      const k = keysRef.current;
      forward =
        (k["KeyW"] || k["ArrowUp"] || dpadInput.up ? 1 : 0) -
        (k["KeyS"] || k["ArrowDown"] || dpadInput.down ? 1 : 0);
      turn =
        (k["KeyA"] || k["ArrowLeft"] || dpadInput.left ? 1 : 0) -
        (k["KeyD"] || k["ArrowRight"] || dpadInput.right ? 1 : 0);
    }

    // Smooth acceleration / braking (reverse is a bit slower)
    const targetSpeed = (forward > 0 ? 6 : forward < 0 ? -3.5 : 0) * speedMult;
    s.speed = damp(s.speed, targetSpeed, inputLocked ? 8 : forward !== 0 ? 2.2 : 3.5, delta);
    if (Math.abs(s.speed) < 0.01) s.speed = 0;

    // Smooth steering
    s.turnRate = damp(s.turnRate, turn * 2.1, 7, delta);
    s.rotY += s.turnRate * delta;

    let px = s.pos.x + Math.sin(s.rotY) * s.speed * delta;
    let pz = s.pos.z + Math.cos(s.rotY) * s.speed * delta;

    // Gentle bump-off from base modules and big boulders
    for (const c of worldData().colliders) {
      const dx = px - c.x;
      const dz = pz - c.z;
      const d = Math.hypot(dx, dz);
      const minD = c.r + 0.75 * sizeMult;
      if (d < minD && d > 0.0001) {
        px = c.x + (dx / d) * minD;
        pz = c.z + (dz / d) * minD;
        s.speed *= 0.85;
      }
    }
    // Round exploration boundary
    const dr = Math.hypot(px, pz);
    if (dr > ROVER_BOUNDARY) {
      px *= ROVER_BOUNDARY / dr;
      pz *= ROVER_BOUNDARY / dr;
      s.speed *= 0.6;
    }
    s.pos.x = px;
    s.pos.z = pz;
    // ---- Low gravity: hop over rocks when driving fast, float, then land softly ----
    const groundY = getTerrainHeight(px, pz);
    if (s.airborne) {
      s.vy -= GRAVITY * delta;
      s.pos.y += s.vy * delta;
      if (s.pos.y <= groundY) {
        const impact = -s.vy;
        s.pos.y = groundY;
        s.vy = 0;
        s.airborne = false;
        if (impact > 0.5) {
          // landing puff + soft thud
          for (let i = 0; i < 8; i++) {
            const p = dust.find((d) => d.life <= 0);
            if (!p) break;
            const a = (i / 8) * Math.PI * 2;
            p.pos.set(px + Math.cos(a) * 0.6, groundY + 0.15, pz + Math.sin(a) * 0.6);
            p.vel.set(Math.cos(a) * 1.4, 0.35 + Math.random() * 0.3, Math.sin(a) * 1.4);
            p.life = 1;
          }
          spaceAudio.playThud(impact);
        }
      }
    } else {
      s.pos.y = damp(s.pos.y, groundY, 14, delta);
      const fast = roverMode && !inputLocked && Math.abs(s.speed) > 3;
      if (fast) s.hopTimer -= delta;
      if (fast && s.hopTimer <= 0) {
        s.vy = (0.9 + Math.random() * 0.9) * Math.min(1, Math.abs(s.speed) / 5);
        s.airborne = true;
        s.hopTimer = 1.2 + Math.random() * 2.2;
        if (!hoppedRef.current) {
          hoppedRef.current = true;
          onFirstHop?.();
        }
      }
    }

    // Tilt with the terrain slope
    const sd = 0.7;
    const fx = Math.sin(s.rotY);
    const fz = Math.cos(s.rotY);
    const rx = Math.cos(s.rotY);
    const rz = -Math.sin(s.rotY);
    const hF = getTerrainHeight(px + fx * sd, pz + fz * sd);
    const hB = getTerrainHeight(px - fx * sd, pz - fz * sd);
    const hR = getTerrainHeight(px + rx * sd, pz + rz * sd);
    const hL = getTerrainHeight(px - rx * sd, pz - rz * sd);
    const airTilt = s.airborne ? THREE.MathUtils.clamp(-s.vy * 0.12, -0.18, 0.18) : 0;
    s.pitch = damp(s.pitch, -Math.atan2(hF - hB, 2 * sd) + airTilt, s.airborne ? 4 : 8, delta);
    s.roll = damp(s.roll, Math.atan2(hR - hL, 2 * sd), 8, delta);

    roverRef.current.position.copy(s.pos);
    // A damaged rover wobbles while it drives
    const wobble = damaged ? Math.sin(t * 9) * 0.05 * Math.min(1, Math.abs(s.speed) / 2) : 0;
    roverRef.current.rotation.set(s.pitch, s.rotY, s.roll + wobble, "YXZ");
    const sc = damp(roverRef.current.scale.x, sizeMult, 3, delta);
    roverRef.current.scale.set(sc, sc, sc);

    // Little suspension bounce while driving
    if (bodyRef.current) {
      const moving = Math.abs(s.speed) > 0.2;
      bodyRef.current.position.y = moving ? Math.sin(t * 22) * 0.025 * Math.min(1, Math.abs(s.speed) / 4) : 0;
    }

    // Spin wheels (turning adds a little differential spin)
    wheelRefs.current.forEach((w, i) => {
      if (!w) return;
      const side = i % 2 === 0 ? -1 : 1;
      w.rotation.x += ((s.speed + side * s.turnRate * 0.5) * delta) / 0.22;
    });

    // "This is you!" ring + blinking beacon
    if (ringRef.current) {
      const goal = roverMode ? 1 + Math.sin(t * 4) * 0.08 : 0.001;
      const sc = damp(ringRef.current.scale.x, goal, 6, delta);
      ringRef.current.scale.set(sc, sc, sc);
      ringRef.current.visible = sc > 0.02;
    }
    if (beaconRef.current) {
      beaconRef.current.material.emissiveIntensity = Math.sin(t * 6) > 0 ? 2.5 : 0.3;
    }

    // Dust trail from the rear wheels (not while floating in the air)
    if (Math.abs(s.speed) > 1.2 && !s.airborne) {
      spawnAcc.current += delta * Math.abs(s.speed) * 2.2;
      while (spawnAcc.current > 1) {
        spawnAcc.current -= 1;
        const p = dust.find((d) => d.life <= 0);
        if (!p) break;
        const back = s.speed > 0 ? -1 : 1;
        const side = Math.random() > 0.5 ? 0.55 : -0.55;
        p.pos.set(px + fx * 0.75 * back + rx * side, s.pos.y + 0.18, pz + fz * 0.75 * back + rz * side);
        p.vel.set((Math.random() - 0.5) * 0.8, 0.5 + Math.random() * 0.5, (Math.random() - 0.5) * 0.8);
        p.life = 1;
      }
    }
    dust.forEach((p, i) => {
      const m = dustRefs.current[i];
      if (!m) return;
      if (p.life > 0) {
        p.life -= delta * 1.1;
        p.pos.addScaledVector(p.vel, delta);
        p.vel.multiplyScalar(0.96);
        m.visible = true;
        m.position.copy(p.pos);
        const sc = 0.12 + (1 - p.life) * 0.45;
        m.scale.set(sc, sc, sc);
        m.material.opacity = Math.max(0, p.life) * 0.45;
      } else {
        m.visible = false;
      }
    });

    // Report which base module the rover is close to
    let near = null;
    if (roverMode) {
      let best = Infinity;
      for (const c of MODULE_COLLIDERS) {
        const d = Math.hypot(px - c.x, pz - c.z) - c.r;
        if (d < 2.6 && d < best) {
          best = d;
          near = c.id;
        }
      }
    }
    if (near !== nearbyRef.current) {
      nearbyRef.current = near;
      onNearby?.(near);
    }

    // Engine hum: idles while in rover mode, revs up with speed
    if (roverMode || spaceAudio.motorOsc) {
      spaceAudio.setMotor(roverMode ? 0.12 + 0.88 * Math.min(1, Math.abs(s.speed) / 6) : 0);
    }

    // Which checkpoint ring (task / badge quiz / home) the rover is parked in.
    // The kid then presses E (or taps the button) to go in, nothing opens by itself.
    let inside = null;
    if (roverMode) {
      for (const tg of targets) {
        if (Math.hypot(px - tg.x, pz - tg.z) < CHECKPOINT_RADIUS) {
          inside = tg;
          break;
        }
      }
    }
    const insideKey = inside ? inside.key : null;
    if (insideKey !== nearRef.current) {
      nearRef.current = insideKey;
      onReachCheckpoint?.(inside);
    }
  });

  const wheelPositions = [
    [-0.58, 0.2, 0.52],
    [0.58, 0.2, 0.52],
    [-0.58, 0.2, 0],
    [0.58, 0.2, 0],
    [-0.58, 0.2, -0.52],
    [0.58, 0.2, -0.52],
  ];

  return (
    <>
      <group ref={roverRef}>
        {/* Glowing "you are here" ring */}
        <mesh ref={ringRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.001}>
          <ringGeometry args={[1.15, 1.35, 40]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.75} depthWrite={false} />
        </mesh>

        {/* Wheels */}
        {wheelPositions.map((w, idx) => (
          <group key={idx} position={w} ref={(el) => (wheelRefs.current[idx] = el)}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.18, 14]} />
              <meshStandardMaterial
                color={damaged && idx === 0 ? "#b91c1c" : "#1e293b"}
                emissive={damaged && idx === 0 ? "#7f1d1d" : "#000000"}
                roughness={0.85}
              />
            </mesh>
            {/* off-center hub so you can see the wheel turning */}
            <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.06, 0.2, 0.06]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {/* Rocker arms */}
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.36, 0]}>
            <boxGeometry args={[0.07, 0.07, 1.15]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}

        <group ref={bodyRef}>
          {/* Chassis */}
          <mesh position={[0, 0.52, 0]} castShadow>
            <boxGeometry args={[0.95, 0.34, 1.3]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.35} />
          </mesh>
          {/* Orange stripe */}
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[0.97, 0.08, 1.32]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} />
          </mesh>
          {/* Solar deck */}
          <mesh position={[0, 0.72, -0.2]} rotation={[-0.08, 0, 0]} castShadow>
            <boxGeometry args={[1.1, 0.05, 0.8]} />
            <meshStandardMaterial color="#1d4ed8" metalness={0.8} roughness={0.2} emissive="#0ea5e9" emissiveIntensity={0.25} />
          </mesh>
          {/* Headlights */}
          {[-0.3, 0.3].map((x) => (
            <mesh key={x} position={[x, 0.55, 0.66]}>
              <boxGeometry args={[0.16, 0.1, 0.04]} />
              <meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={isNight ? 3 : 1} />
            </mesh>
          ))}
          {isNight && <pointLight position={[0, 0.7, 1.6]} color="#fef3c7" intensity={6} distance={7} />}
          {/* Camera mast + cute face */}
          <mesh position={[0, 0.98, 0.38]}>
            <cylinderGeometry args={[0.05, 0.06, 0.55, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.3, 0.4]} castShadow>
            <boxGeometry args={[0.6, 0.3, 0.32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} />
          </mesh>
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, 1.31, 0.57]}>
              <sphereGeometry args={[0.07, 12, 10]} />
              <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={1.8} />
            </mesh>
          ))}
          {/* Antenna + blinking beacon */}
          <mesh position={[0.35, 1.05, -0.45]}>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          <mesh ref={beaconRef} position={[0.35, 1.43, -0.45]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={2} />
          </mesh>
        </group>
      </group>

      {/* Dust trail particles (world space) */}
      {dust.map((_, i) => (
        <mesh key={i} ref={(el) => (dustRefs.current[i] = el)} visible={false}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={WORLD === "moon" ? "#b8b8be" : "#d6a184"} transparent opacity={0} depthWrite={false} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

const OVERVIEW_OFFSET = new THREE.Vector3(11, 5.4, 12.5);

// ===== Mars sky: butterscotch days, BLUE sunsets, Phobos & Deimos, and Earth as an evening star =====
const SKY_PRESETS = {
  day: { zenith: "#b9653d", horizon: "#dfae85", ground: "#8a4a2c", halo: "#fff3dc", haloK: 0.55, sun: [0.35, 0.8, 0.45], sunColor: "#fffaf0", fog: "#d49c75", fogD: 0.014 },
  dustDevil: { zenith: "#c0703f", horizon: "#ecc29a", ground: "#8a4a2c", halo: "#fff3dc", haloK: 0.55, sun: [0.4, 0.75, 0.4], sunColor: "#fffaf0", fog: "#dca880", fogD: 0.016 },
  storm: { zenith: "#4a2414", horizon: "#8a4a2c", ground: "#4a2414", halo: "#c08050", haloK: 0.15, sun: [0.3, 0.7, 0.5], sunColor: "#9a5a38", fog: "#7c3f24", fogD: 0.03 },
  // Real Mars sunsets glow blue around the Sun: fine dust scatters blue light forward
  night: { zenith: "#120f2e", horizon: "#6e4250", ground: "#24161e", halo: "#6fb6ff", haloK: 1.7, sun: [-0.78, 0.07, -0.62], sunColor: "#dbeeff", fog: "#3a2a3e", fogD: 0.017 },
  // Moon: no air, so the sky is black even in daytime; at the south pole the Sun always hangs low
  moonDay: { zenith: "#000000", horizon: "#05060a", ground: "#141418", halo: "#ffffff", haloK: 0.25, sun: [0.55, 0.12, -0.6], sunColor: "#ffffff", fog: "#0b0b10", fogD: 0.008 },
  moonDark: { zenith: "#000000", horizon: "#030305", ground: "#0a0a0c", halo: "#ffffff", haloK: 0.12, sun: [0.7, 0.03, 0.7], sunColor: "#e5e7eb", fog: "#050507", fogD: 0.012 },
  moonStorm: { zenith: "#120303", horizon: "#3a1208", ground: "#1a0805", halo: "#ffb347", haloK: 1.1, sun: [-0.45, 0.25, -0.75], sunColor: "#fff7ed", fog: "#1c0905", fogD: 0.01 },
  moonNight: { zenith: "#000000", horizon: "#060912", ground: "#05070d", halo: "#93c5fd", haloK: 0.0, sun: [0.3, -0.4, 0.9], sunColor: "#000000", fog: "#04060c", fogD: 0.01 },
};

const SKY_VERT = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const SKY_FRAG = `
uniform vec3 zenith;
uniform vec3 horizon;
uniform vec3 ground;
uniform vec3 halo;
uniform vec3 sunColor;
uniform vec3 sunDir;
uniform float haloK;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.65, h));
  col = mix(col, ground, smoothstep(0.0, -0.25, h));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  col += halo * pow(s, 6.0) * 0.35 * haloK;
  col += halo * pow(s, 40.0) * 0.8 * haloK;
  col += sunColor * smoothstep(0.9975, 0.999, s);
  gl_FragColor = vec4(col, 1.0);
}
`;

const SkyLabel = React.forwardRef(function SkyLabel({ children }, ref) {
  return (
    <div ref={ref} className="px-2 py-0.5 rounded-full bg-slate-900/70 border border-white/20 text-[11px] font-bold text-white whitespace-nowrap pointer-events-none select-none">
      {children}
    </div>
  );
});

function MarsSky({ env, labels }) {
  const { scene, camera } = useThree();
  const skyRef = useRef();
  const phobosRef = useRef();
  const deimosRef = useRef();
  const earthRef = useRef();
  // HTML labels don't follow 3D visibility, so hide them by hand
  const labelRefs = useRef({});
  const showLabel = (key, on) => {
    const el = labelRefs.current[key];
    if (el) el.style.display = on ? "" : "none";
  };
  const preset = SKY_PRESETS[env] || SKY_PRESETS.day;
  const uniforms = useMemo(
    () => ({
      zenith: { value: new THREE.Color(SKY_PRESETS.day.zenith) },
      horizon: { value: new THREE.Color(SKY_PRESETS.day.horizon) },
      ground: { value: new THREE.Color(SKY_PRESETS.day.ground) },
      halo: { value: new THREE.Color(SKY_PRESETS.day.halo) },
      sunColor: { value: new THREE.Color(SKY_PRESETS.day.sunColor) },
      sunDir: { value: new THREE.Vector3(...SKY_PRESETS.day.sun).normalize() },
      haloK: { value: SKY_PRESETS.day.haloK },
    }),
    []
  );
  const tmp = useMemo(() => ({ c: new THREE.Color(), v: new THREE.Vector3(), dir: new THREE.Vector3() }), []);

  useFrame(({ clock }, rawDelta) => {
    const k = 1 - Math.exp(-Math.min(rawDelta, 0.05) * 1.5); // smooth sky transitions
    const u = uniforms;
    for (const key of ["zenith", "horizon", "ground", "halo", "sunColor"]) u[key].value.lerp(tmp.c.set(preset[key]), k);
    u.haloK.value += (preset.haloK - u.haloK.value) * k;
    u.sunDir.value.lerp(tmp.v.set(...preset.sun).normalize(), k).normalize();
    if (scene.fog) {
      scene.fog.color.lerp(tmp.c.set(preset.fog), k);
      scene.fog.density += (preset.fogD - scene.fog.density) * k;
    }
    if (scene.background instanceof THREE.Color) scene.background.lerp(tmp.c.set(preset.fog), k);
    if (skyRef.current) skyRef.current.position.copy(camera.position);

    const t = clock.getElapsedTime();
    const place = (ref, a, peak, start, dist) => {
      if (!ref.current) return;
      // Sweep around the sky low over the horizon (where kids will see it); below the horizon half the loop
      const az = a + start;
      const el = Math.sin(a) * peak;
      tmp.dir.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
      ref.current.position.copy(camera.position).addScaledVector(tmp.dir, dist);
      // Phobos & Deimos are Mars's moons, so they only show on Mars
      ref.current.visible = tmp.dir.y > 0.02 && env !== "storm" && WORLD !== "moon";
      showLabel(ref === phobosRef ? "phobos" : "deimos", ref.current.visible);
    };
    // Phobos zips across (it really rises in the west and sets in the east!), Deimos drifts slowly
    place(phobosRef, ((t / 45) % 1) * Math.PI * 2, 0.32, Math.PI, 90);
    place(deimosRef, ((t / 110 + 0.3) % 1) * Math.PI * 2, 0.26, 0.6, 95);
    if (phobosRef.current) phobosRef.current.rotation.y = t * 0.2;
    if (earthRef.current) {
      const moon = WORLD === "moon";
      // Mars: a twinkling evening star by the sunset. Moon: a big blue Earth hanging low over the south pole
      if (moon) tmp.dir.set(0.3, 0.16, 0.95).normalize();
      else tmp.dir.set(-0.62, 0.17, -0.77).normalize();
      earthRef.current.position.copy(camera.position).addScaledVector(tmp.dir, 92);
      const show = moon || env === "night";
      earthRef.current.visible = show;
      showLabel("earth", show);
      const tw = moon ? 4.2 : 1 + Math.sin(t * 3.1) * 0.12 + Math.sin(t * 7.3) * 0.06;
      earthRef.current.scale.setScalar(tw);
    }
  });

  const dim = env === "night" ? 1 : 0.6; // moons are faint in the bright day sky
  return (
    <>
      <mesh ref={skyRef} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[110, 32, 16]} />
        <shaderMaterial vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>

      <group ref={phobosRef}>
        <mesh scale={[2.2, 1.6, 1.8]}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#9a8f88" fog={false} transparent opacity={dim} />
        </mesh>
        <mesh position={[0.6, 0.5, 1.2]} scale={0.45}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#6f6660" fog={false} transparent opacity={dim} />
        </mesh>
        <Html position={[0, -3.4, 0]} center zIndexRange={[5, 0]}>
          <SkyLabel ref={(el) => (labelRefs.current.phobos = el)}>🌑 {labels.phobos}</SkyLabel>
        </Html>
      </group>

      <group ref={deimosRef}>
        <mesh scale={[1.1, 0.9, 1]}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#b3aaa3" fog={false} transparent opacity={dim} />
        </mesh>
        <Html position={[0, -2.4, 0]} center zIndexRange={[5, 0]}>
          <SkyLabel ref={(el) => (labelRefs.current.deimos = el)}>🌑 {labels.deimos}</SkyLabel>
        </Html>
      </group>

      <group ref={earthRef} visible={false}>
        <mesh>
          <sphereGeometry args={[0.55, 16, 12]} />
          <meshBasicMaterial color="#cfe9ff" fog={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.6, 16, 12]} />
          <meshBasicMaterial color="#5aa9ff" fog={false} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <Html position={[0, -3, 0]} center zIndexRange={[5, 0]}>
          <SkyLabel ref={(el) => (labelRefs.current.earth = el)}>🌍 {labels.earth}</SkyLabel>
        </Html>
      </group>
    </>
  );
}

function SceneRig({
  phase,
  focusModule,
  camResetTick,
  env,
  roverMode,
  roverState,
}) {
  const controlsRef = useRef();
  const { scene, camera } = useThree();
  const targetVec = useMemo(() => new THREE.Vector3(0, 1.0, 0), []);
  const tmp = useMemo(
    () => ({
      before: new THREE.Vector3(),
      delta: new THREE.Vector3(),
      cam: new THREE.Vector3(),
      target: new THREE.Vector3(),
      sky: new THREE.Color(),
    }),
    []
  );
  const draggingRef = useRef(false);
  const lastDragRef = useRef(-10);
  const modeRef = useRef({ wasRover: false, enterT: 0, flyBack: false, flyT: 0 });

  useEffect(() => {
    const target = MODULE_POSITIONS[focusModule] || MODULE_POSITIONS.habitat;
    targetVec.copy(target);
  }, [focusModule, camResetTick, targetVec]);

  // Reset View button: glide back to the overview angle
  useEffect(() => {
    if (camResetTick > 0) {
      modeRef.current.flyBack = true;
      modeRef.current.flyT = 0;
    }
  }, [camResetTick]);

  // Track when the player drags to look around, so the chase-cam doesn't fight them
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    const onStart = () => {
      draggingRef.current = true;
    };
    const onEnd = () => {
      draggingRef.current = false;
      lastDragRef.current = performance.now() / 1000;
    };
    c.addEventListener("start", onStart);
    c.addEventListener("end", onEnd);
    return () => {
      c.removeEventListener("start", onStart);
      c.removeEventListener("end", onEnd);
    };
  }, []);

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const c = controlsRef.current;
    const m = modeRef.current;

    if (c) {
      if (roverMode) {
        if (!m.wasRover) {
          m.wasRover = true;
          m.enterT = 0;
          m.flyBack = false;
          c.minDistance = 2.5;
        }
        m.enterT += dt;
        const s = roverState.current;
        const entering = m.enterT < 1.8;

        // Orbit target follows the rover; once settled, carry the camera along with it
        tmp.before.copy(c.target);
        tmp.target.set(s.pos.x, s.pos.y + 1.9, s.pos.z);
        c.target.lerp(tmp.target, 1 - Math.exp(-(entering ? 3 : 10) * dt));
        if (!entering) camera.position.add(tmp.delta.subVectors(c.target, tmp.before));

        // Chase-cam: swing in behind the rover while driving (pauses while the kid drags to look)
        const lookingAround = draggingRef.current || performance.now() / 1000 - lastDragRef.current < 1.5;
        if (!lookingAround && (entering || Math.abs(s.speed) > 0.3)) {
          // Low chase-cam so the Mars sky (sunsets, moons, Earth) is always in view
          const dist = 6.6;
          tmp.cam.set(s.pos.x - Math.sin(s.rotY) * dist, s.pos.y + 2.6, s.pos.z - Math.cos(s.rotY) * dist);
          const minY = getTerrainHeight(tmp.cam.x, tmp.cam.z) + 1.2;
          if (tmp.cam.y < minY) tmp.cam.y = minY;
          camera.position.lerp(tmp.cam, 1 - Math.exp(-(entering ? 2.2 : 2.8) * dt));
        }
      } else {
        if (m.wasRover) {
          m.wasRover = false;
          m.flyBack = true;
          m.flyT = 0;
        }
        c.target.lerp(targetVec, 1 - Math.exp(-3.5 * dt));
        if (m.flyBack && phase !== "start" && phase !== "launch") {
          m.flyT += dt;
          tmp.cam.copy(targetVec).add(OVERVIEW_OFFSET);
          camera.position.lerp(tmp.cam, 1 - Math.exp(-2.2 * dt));
          if (camera.position.distanceTo(tmp.cam) < 0.5 || m.flyT > 4 || draggingRef.current) {
            m.flyBack = false;
          }
        }
        // Restore the normal zoom limit gradually so the camera never snaps
        const dist = camera.position.distanceTo(c.target);
        c.minDistance = Math.min(6.5, Math.max(c.minDistance, dist));
      }
      c.update();
    }

    // (sky + fog colours are handled by <MarsSky>)
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      autoRotate={phase === "start" || phase === "launch"}
      autoRotateSpeed={0.65}
      minDistance={6.5}
      maxDistance={32}
      maxPolarAngle={Math.PI / 2 - 0.09}
      minPolarAngle={0.22}
    />
  );
}

export default function MarsScene({
  phase,
  stats,
  env = "day",
  focusModule,
  selectedModule,
  onSelectModule,
  camResetTick,
  roverMode,
  dpadInput,
  moduleLabels,
  roverState,
  onRoverNearby,
  taskIndex = 0,
  taskLabels = [],
  roverSpeed = 1,
  roverSize = 1,
  roverDamaged = false,
  inputLocked = false,
  onReachCheckpoint,
  targets = [],
  guideTarget = null,
  badges = [],
  quizLabel = "",
  homeLabel = "",
  flagActive = false,
  flagPlanted = false,
  flagLabel = "",
  skyLabels = { phobos: "Phobos", deimos: "Deimos", earth: "Earth" },
  onFirstHop,
  secretActive = false,
  spacePieces = [],
  megaPortal = null,
  lowGfx = false,
}) {
  const moon = WORLD === "moon";
  const isNight = env === "night" || env === "moonNight" || env === "moonDark";
  const playing = phase === "playing";
  const allDone = taskIndex >= TASKS.length;
  const devilCenter = PAD_POS;

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        key={lowGfx ? "low" : "high"}
        {...canvasQuality(lowGfx)}
        camera={{ position: [11, 6.4, 12.5], fov: 55 }}
        onPointerMissed={() => onSelectModule(null)}
      >
        <GfxContext.Provider value={lowGfx}>
        <color attach="background" args={["#c86d51"]} />
        <fogExp2 attach="fog" args={["#c86d51", 0.014]} />

        <MarsSky env={env} labels={skyLabels} />
        <ambientLight
          intensity={moon ? (env === "moonNight" ? 0.2 : env === "moonDark" ? 0.16 : 0.3) : isNight ? 0.42 : env === "storm" ? 0.5 : 0.65}
          color={moon ? (env === "moonStorm" ? "#fed7aa" : isNight ? "#93c5fd" : "#e5e7eb") : isNight ? "#a5b4fc" : "#ffedd5"}
        />
        {/* At sunset the Sun sits low in the west: long shadows, cool bluish light */}
        <directionalLight
          position={moon ? (env === "moonNight" ? [10, 20, 30] : env === "moonStorm" ? [-15, 10, -20] : [20, 7, -14]) : isNight ? [-26, 5, -20] : [18, 22, 12]}
          intensity={moon ? (env === "moonNight" ? 0.35 : env === "moonDark" ? 0.55 : env === "moonStorm" ? 1.6 : 2.3) : isNight ? 0.75 : env === "storm" ? 1.1 : 1.75}
          color={moon ? (env === "moonNight" ? "#bfdbfe" : "#ffffff") : isNight ? "#cfe3ff" : "#fff7ed"}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />

        {(isNight || moon) && <Stars radius={70} depth={30} count={(moon ? 1600 : 900) / (lowGfx ? 3 : 1)} factor={moon ? 3 : 2.6} fade />}

        <MartianTerrain world={WORLD} />
        {!moon && <FloatingDustMotes isNight={isNight} />}
        <DustDevil active={env === "dustDevil"} center={{ x: devilCenter.x, z: devilCenter.z + 6 }} />

        <BaseDetails power={stats.power} />
        <HabitatAndShield
          shielding={stats.health}
          isNight={isNight}
          solarStorm={false}
          onSelect={onSelectModule}
          selected={selectedModule === "habitat"}
          label={moduleLabels.habitat}
        />
        <SolarArrayField
          dusty={env === "storm"}
          power={stats.power}
          onSelect={onSelectModule}
          selected={selectedModule === "solar"}
          label={moduleLabels.solar}
        />
        <MoxieUnit
          oxygen={stats.supplies}
          onSelect={onSelectModule}
          selected={selectedModule === "moxie"}
          label={moduleLabels.moxie}
        />
        <GreenhousePod
          food={stats.supplies}
          onSelect={onSelectModule}
          selected={selectedModule === "greenhouse"}
          label={moduleLabels.greenhouse}
        />

        {TASKS.map((task, i) => (
          <Checkpoint
            key={task.id}
            task={task}
            index={i}
            label={taskLabels[i] || ""}
            quizLabel={quizLabel}
            status={i < taskIndex ? (badges.includes(i) ? "done" : "quiz") : i === taskIndex && playing ? "active" : "locked"}
          />
        ))}
        <LaunchPadRocket ready={allDone} />
        {allDone && playing && !flagActive && <HomeCheckpoint label={homeLabel} />}
        {FLAG_POS && flagActive && playing && <FlagCheckpoint label={flagLabel} />}
        {FLAG_POS && flagPlanted && <PlantedFlag />}
        {secretActive && <SecretAnomaly />}
        {spacePieces.map((i) => (
          <SpacePiece key={i} pos={SPACE_PIECES[i]} />
        ))}
        {megaPortal && <SecretAnomaly pos={megaPortal} color="#ef4444" glow="#f87171" />}

        <MiniRover
          roverMode={roverMode}
          dpadInput={dpadInput}
          roverState={roverState}
          onNearby={onRoverNearby}
          isNight={isNight}
          speedMult={roverSpeed}
          sizeMult={roverSize}
          damaged={roverDamaged}
          inputLocked={inputLocked}
          targets={playing ? targets : []}
          onReachCheckpoint={onReachCheckpoint}
          onFirstHop={onFirstHop}
        />
        <GuideArrow roverState={roverState} target={playing ? guideTarget : null} visible={roverMode && !inputLocked} />

        <SceneRig
          phase={phase}
          focusModule={focusModule}
          camResetTick={camResetTick}
          env={env}
          roverMode={roverMode}
          roverState={roverState}
        />
        </GfxContext.Provider>
      </Canvas>
    </div>
  );
}
