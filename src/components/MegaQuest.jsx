import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import CapAvatar from "./CapAvatar";
import { ShipRoverModel, Portal, QUEST_CSS, SuckCutscene, LoadingScreen, Pad } from "./WormholeQuest";
import { MEGA_TEXT } from "../data/megaText";
import { pauseState } from "../utils/pause";
import { spaceAudio } from "../utils/sound";

// =====================================================================
// MEGA hidden quest (Moon only): boss fight against Gearlord Z.
// Rover: 100 HP, 5 ATK, can jump. Robot: 100 HP.
// The robot does 4 big telegraphed attacks (red = danger), then gets tired -> Rover can attack.
// =====================================================================

const ARENA_R = 10.5;
const ROBOT = { x: 0, z: -6.5, r: 2.4 };
const ROVER_SPAWN = { x: 0, z: 5.5 };
const ROVER_HP = 100;
const ROBOT_HP = 100;
const ROVER_ATK = 5;
const ATTACK_ORDER = ["slam", "laser", "shock", "meteor"];
const DAMAGE = { slam: 20, laser: 20, shock: 15, meteor: 12 };
const TIRED_SECS = 5; // max ~17 hits (85 dmg) per tired window, so it always takes at least 2 rounds
const GRAV = 24;
const JUMP_V = 8.5;

function randInArena(minFromRobot = 3.2) {
  for (let i = 0; i < 30; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * (ARENA_R - 1.5);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x - ROBOT.x, z - ROBOT.z) > minFromRobot) return { x, z };
  }
  return { x: 0, z: 3 };
}

function createFight() {
  return {
    rover: { pos: new THREE.Vector3(ROVER_SPAWN.x, 0, ROVER_SPAWN.z), rotY: Math.PI, vy: 0, airborne: false, jumpReq: false, attackReq: false, invuln: 0, cd: 0, scale: 1 },
    roverHp: ROVER_HP,
    robotHp: ROBOT_HP,
    mode: "idle", // idle | telegraph | strike | gap | tired | over
    cycle: 0,
    attack: 0, // 0..3
    timer: 0,
    teleDur: 1.7,
    discs: [], // { x, z, r }
    lanes: [], // { x, w }
    ringR: 0,
    hitThisAttack: false,
    beamT: 0,
    robotFlash: 0,
    shake: 0,
  };
}

// ---------------------------------------------------------------------
// 3D models
// ---------------------------------------------------------------------
function GearlordModel({ fightRef, stage }) {
  const group = useRef();
  const body = useRef();
  const eyes = useRef([]);
  const armL = useRef();
  const armR = useRef();
  const zzz = useRef();
  useFrame(({ clock }, raw) => {
    const f = fightRef.current;
    const t = clock.getElapsedTime();
    const dt = Math.min(raw, 0.05);
    if (!group.current) return;
    const tired = f.mode === "tired";
    const defeated = stage === "defeated" || stage === "trophy" || stage === "portalTalk" || stage === "portal" || stage === "flash";
    const charging = f.mode === "telegraph";
    // body pose
    const goalTilt = defeated ? 0.55 : tired ? 0.35 : charging ? -0.12 : 0;
    body.current.rotation.x = THREE.MathUtils.damp(body.current.rotation.x, goalTilt, 4, dt);
    const goalY = defeated ? -0.9 : tired ? -0.35 : 0;
    body.current.position.y = THREE.MathUtils.damp(body.current.position.y, goalY + (tired || defeated ? 0 : Math.sin(t * 2) * 0.08), 4, dt);
    // arms: raised while charging, slam down on strike
    const armGoal = f.mode === "strike" ? 0.4 : charging ? -2.4 : tired || defeated ? 0.5 : -0.2 + Math.sin(t * 1.5) * 0.1;
    if (armL.current) armL.current.rotation.x = THREE.MathUtils.damp(armL.current.rotation.x, armGoal, 6, dt);
    if (armR.current) armR.current.rotation.x = THREE.MathUtils.damp(armR.current.rotation.x, armGoal, 6, dt);
    // eyes
    const glow = defeated ? 0.15 : tired ? 0.4 + Math.sin(t * 6) * 0.2 : charging ? 3 + Math.sin(t * 20) * 1.5 : 2;
    eyes.current.forEach((m) => m && (m.emissiveIntensity = glow));
    // hit flash
    if (f.robotFlash > 0) {
      body.current.position.x = Math.sin(t * 60) * 0.12;
    } else body.current.position.x = 0;
    if (zzz.current) zzz.current.style.opacity = tired && stage === "fight" ? 1 : 0;
  });
  return (
    <group ref={group} position={[ROBOT.x, 0, ROBOT.z]}>
      {/* tank treads base */}
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, 0.45, 0]} castShadow>
          <boxGeometry args={[0.9, 0.9, 3.2]} />
          <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      <group ref={body}>
        <mesh position={[0, 2.3, 0]} castShadow>
          <boxGeometry args={[2.8, 2.6, 2.0]} />
          <meshStandardMaterial color="#374151" metalness={0.75} roughness={0.35} />
        </mesh>
        <mesh position={[0, 2.3, 1.01]}>
          <boxGeometry args={[1.6, 1.2, 0.05]} />
          <meshStandardMaterial color="#7f1d1d" emissive="#dc2626" emissiveIntensity={0.6} />
        </mesh>
        {/* head */}
        <mesh position={[0, 4.15, 0]} castShadow>
          <boxGeometry args={[1.9, 1.2, 1.6]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
        </mesh>
        {[-0.45, 0.45].map((x, i) => (
          <mesh key={x} position={[x, 4.2, 0.82]} rotation={[0, 0, x > 0 ? -0.35 : 0.35]}>
            <boxGeometry args={[0.6, 0.2, 0.05]} />
            <meshStandardMaterial ref={(el) => (eyes.current[i] = el)} color="#fca5a5" emissive="#ef4444" emissiveIntensity={2} />
          </mesh>
        ))}
        {/* horns + shoulder spikes */}
        {[-0.75, 0.75].map((x) => (
          <mesh key={x} position={[x, 5.05, 0]} rotation={[0, 0, x > 0 ? -0.4 : 0.4]}>
            <coneGeometry args={[0.18, 0.9, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.8} />
          </mesh>
        ))}
        {[-1.75, 1.75].map((x) => (
          <group key={x} position={[x, 3.3, 0]}>
            <mesh>
              <sphereGeometry args={[0.6, 14, 10]} />
              <meshStandardMaterial color="#4b5563" metalness={0.7} />
            </mesh>
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[x > 0 ? 0.3 : -0.3, 0.45, (k - 1) * 0.35]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]}>
                <coneGeometry args={[0.1, 0.5, 5]} />
                <meshStandardMaterial color="#ef4444" emissive="#991b1b" emissiveIntensity={0.8} />
              </mesh>
            ))}
          </group>
        ))}
        {/* arms */}
        <group ref={armL} position={[-1.9, 3.1, 0]}>
          <mesh position={[0, -1.1, 0]} castShadow>
            <boxGeometry args={[0.6, 2.2, 0.6]} />
            <meshStandardMaterial color="#4b5563" metalness={0.7} />
          </mesh>
          <mesh position={[0, -2.4, 0]}>
            <boxGeometry args={[0.95, 0.7, 0.95]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} />
          </mesh>
        </group>
        <group ref={armR} position={[1.9, 3.1, 0]}>
          <mesh position={[0, -1.1, 0]} castShadow>
            <boxGeometry args={[0.6, 2.2, 0.6]} />
            <meshStandardMaterial color="#4b5563" metalness={0.7} />
          </mesh>
          <mesh position={[0, -2.4, 0]}>
            <boxGeometry args={[0.95, 0.7, 0.95]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} />
          </mesh>
        </group>
        <Html position={[0, 5.9, 0]} center zIndexRange={[10, 0]}>
          <div ref={zzz} className="pointer-events-none text-3xl font-display font-bold text-amber-200 animate-bounce transition-opacity" style={{ opacity: 0 }}>
            😵💫
          </div>
        </Html>
      </group>
      <pointLight position={[0, 4, 2.5]} color="#ef4444" intensity={8} distance={10} />
    </group>
  );
}

function Trophy({ show, from, to }) {
  const ref = useRef();
  const start = useRef(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (!show) {
      ref.current.visible = false;
      start.current = null;
      return;
    }
    const t = clock.getElapsedTime();
    if (start.current == null) start.current = t;
    const k = Math.min(1, (t - start.current) / 2.2);
    const e = k * k * (3 - 2 * k);
    ref.current.visible = true;
    ref.current.position.set(THREE.MathUtils.lerp(from[0], to[0], e), THREE.MathUtils.lerp(from[1], to[1], e) + Math.sin(k * Math.PI) * 2, THREE.MathUtils.lerp(from[2], to[2], e));
    ref.current.rotation.y = t * 2;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.45, 0.2, 0.7, 20, 1, true]} />
        <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.15} emissive="#ca8a04" emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.18, 0.05, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 10]} />
        <meshStandardMaterial color="#facc15" metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.5]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <pointLight color="#fde047" intensity={6} distance={5} />
    </group>
  );
}

function ArenaWorld() {
  return (
    <>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[ARENA_R + 0.6, ARENA_R + 1.2, 0.4, 64]} />
        <meshStandardMaterial color="#1c1917" metalness={0.6} roughness={0.5} />
      </mesh>
      {[3, 6, 9].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[r - 0.04, r + 0.04, 64]} />
          <meshBasicMaterial color="#7f1d1d" />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 4.8, 0.012, Math.sin(a) * 4.8]} rotation={[-Math.PI / 2, 0, -a]}>
            <planeGeometry args={[9.6, 0.06]} />
            <meshBasicMaterial color="#7f1d1d" />
          </mesh>
        );
      })}
      {/* lava moat around the arena */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <ringGeometry args={[ARENA_R + 1.2, ARENA_R + 9, 64]} />
        <meshStandardMaterial color="#c2410c" emissive="#ea580c" emissiveIntensity={1.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[ARENA_R + 0.2, ARENA_R + 0.6, 64]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* spiky pillars with red lights */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        const x = Math.cos(a) * (ARENA_R + 4);
        const z = Math.sin(a) * (ARENA_R + 4);
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 3, 0]}>
              <cylinderGeometry args={[0.5, 0.9, 6, 6]} />
              <meshStandardMaterial color="#292524" metalness={0.6} />
            </mesh>
            <mesh position={[0, 6.6, 0]}>
              <coneGeometry args={[0.55, 1.4, 6]} />
              <meshStandardMaterial color="#44403c" metalness={0.7} />
            </mesh>
            <mesh position={[0, 5.4, 0]}>
              <sphereGeometry args={[0.25, 10, 8]} />
              <meshStandardMaterial color="#fca5a5" emissive="#ef4444" emissiveIntensity={3} />
            </mesh>
          </group>
        );
      })}
      {/* throne wall behind the robot */}
      <mesh position={[0, 4, -ARENA_R - 3]}>
        <boxGeometry args={[14, 8, 1]} />
        <meshStandardMaterial color="#1c1917" metalness={0.5} />
      </mesh>
      <mesh position={[0, 5, -ARENA_R - 2.45]}>
        <circleGeometry args={[2.2, 6]} />
        <meshStandardMaterial color="#7f1d1d" emissive="#dc2626" emissiveIntensity={1.2} />
      </mesh>
    </>
  );
}

// Danger markers (pooled meshes, updated every frame)
const MAX_DISCS = 9;
function DangerZones({ fightRef }) {
  const discs = useRef([]);
  const fills = useRef([]);
  const lanes = useRef([]);
  const beams = useRef([]);
  const ring = useRef();
  const ringHint = useRef();
  const rocks = useRef([]);
  useFrame(({ clock }) => {
    const f = fightRef.current;
    const t = clock.getElapsedTime();
    const name = ATTACK_ORDER[f.attack];
    const tele = f.mode === "telegraph";
    const strike = f.mode === "strike";
    const progress = tele ? 1 - f.timer / f.teleDur : 1;
    // circles (slam / meteor)
    for (let i = 0; i < MAX_DISCS; i++) {
      const g = discs.current[i];
      if (!g) continue;
      const d = f.discs[i];
      const on = d && (tele || strike) && (name === "slam" || name === "meteor");
      g.visible = !!on;
      if (!on) continue;
      g.position.set(d.x, 0.04, d.z);
      g.scale.setScalar(d.r);
      g.children[0].material.opacity = strike ? 0.75 : 0.28 + Math.sin(t * 12) * 0.12;
      g.children[0].material.color.set(strike ? "#fef3c7" : "#ef4444");
      const fill = fills.current[i];
      if (fill) fill.scale.setScalar(Math.max(0.01, progress));
    }
    // falling meteors
    for (let i = 0; i < MAX_DISCS; i++) {
      const m = rocks.current[i];
      if (!m) continue;
      const d = f.discs[i];
      const falling = d && name === "meteor" && tele && f.timer < 0.7;
      m.visible = !!falling;
      if (falling) m.position.set(d.x, 0.4 + (f.timer / 0.7) * 14, d.z);
    }
    // laser lanes
    for (let i = 0; i < 2; i++) {
      const l = lanes.current[i];
      const b = beams.current[i];
      const lane = f.lanes[i];
      const on = lane && name === "laser" && (tele || strike);
      if (l) {
        l.visible = !!on;
        if (on) {
          l.position.set(lane.x, 0.04, (ROBOT.z + ARENA_R) / 2);
          l.children[0].material.opacity = strike ? 0.1 : 0.25 + Math.sin(t * 12) * 0.12;
          l.children[1].scale.x = Math.max(0.01, progress);
        }
      }
      if (b) {
        b.visible = !!(on && strike);
        if (on) b.position.set(lane.x, 0.7, (ROBOT.z + ARENA_R) / 2);
      }
    }
    // shockwave
    if (ring.current) {
      const on = name === "shock" && strike;
      ring.current.visible = on;
      if (on) ring.current.scale.setScalar(Math.max(0.01, f.ringR));
    }
    if (ringHint.current) {
      const on = name === "shock" && tele;
      ringHint.current.visible = on;
      if (on) ringHint.current.scale.setScalar(2.6 + Math.sin(t * 10) * 0.25);
    }
  });
  const laneLen = ARENA_R - ROBOT.z;
  return (
    <>
      {Array.from({ length: MAX_DISCS }, (_, i) => (
        <group key={i} ref={(el) => (discs.current[i] = el)} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <circleGeometry args={[1, 36]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.3} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[0.92, 1, 36]} />
            <meshBasicMaterial color="#fecaca" />
          </mesh>
          {/* inner disc grows until impact: when it fills the circle, it hits */}
          <mesh ref={(el) => (fills.current[i] = el)} position={[0, 0, 0.005]}>
            <circleGeometry args={[1, 36]} />
            <meshBasicMaterial color="#dc2626" transparent opacity={0.45} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: MAX_DISCS }, (_, i) => (
        <mesh key={i} ref={(el) => (rocks.current[i] = el)} visible={false}>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#78350f" emissive="#f97316" emissiveIntensity={1.4} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <group key={i} ref={(el) => (lanes.current[i] = el)} visible={false}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, laneLen]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.3} depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[2.4, laneLen]} />
            <meshBasicMaterial color="#dc2626" transparent opacity={0.35} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {[0, 1].map((i) => (
        <mesh key={i} ref={(el) => (beams.current[i] = el)} visible={false}>
          <boxGeometry args={[1.6, 1.0, laneLen]} />
          <meshBasicMaterial color="#fecaca" transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[ROBOT.x, 0.08, ROBOT.z]} visible={false}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial color="#fde047" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringHint} rotation={[-Math.PI / 2, 0, 0]} position={[ROBOT.x, 0.06, ROBOT.z]} visible={false}>
        <ringGeometry args={[0.92, 1, 64]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------------
// Fight simulation (rover movement + boss AI + damage)
// ---------------------------------------------------------------------
function FightSim({ fightRef, stage, inputRef, locked, onHud, onRoverDown, onRobotDown, onPortalIn, onLanded, sfx }) {
  const roverGroup = useRef();
  const wheelRefs = useRef([]);
  const headRef = useRef();
  const beamRef = useRef();
  const keys = useRef({});
  const hudRef = useRef("");
  const fired = useRef({ landed: false, portal: false });

  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      const f = fightRef.current;
      if (e.code === "Space") {
        e.preventDefault();
        f.rover.jumpReq = true;
      }
      if (e.code === "KeyF" || e.code === "KeyJ" || e.code === "Enter") f.rover.attackReq = true;
    };
    const up = (e) => (keys.current[e.code] = false);
    const blur = () => (keys.current = {});
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [fightRef]);

  const startAttack = (f) => {
    const name = ATTACK_ORDER[f.attack];
    const rv = f.rover.pos;
    f.discs = [];
    f.lanes = [];
    f.hitThisAttack = false;
    f.teleDur = Math.max(1.15, 1.7 - f.cycle * 0.2);
    if (name === "slam") {
      f.discs = [{ x: rv.x, z: rv.z, r: 2.6 }, { ...randInArena(), r: 2.6 }, { ...randInArena(), r: 2.6 }];
    } else if (name === "laser") {
      const x1 = THREE.MathUtils.clamp(rv.x, -ARENA_R + 2, ARENA_R - 2);
      let x2 = (Math.random() * 2 - 1) * (ARENA_R - 3);
      if (Math.abs(x2 - x1) < 3.5) x2 = x1 > 0 ? x1 - 5 : x1 + 5;
      f.lanes = [{ x: x1 }, { x: x2 }];
    } else if (name === "shock") {
      f.ringR = 0;
      f.teleDur += 0.3;
    } else if (name === "meteor") {
      f.discs = [{ x: rv.x, z: rv.z, r: 1.7 }, ...Array.from({ length: 7 }, () => ({ ...randInArena(2.8), r: 1.7 }))];
    }
    f.mode = "telegraph";
    f.timer = f.teleDur;
    sfx("alert");
  };

  const hurt = (f, amount) => {
    if (f.rover.invuln > 0 || f.hitThisAttack) return;
    f.hitThisAttack = true;
    f.roverHp = Math.max(0, f.roverHp - amount);
    f.rover.invuln = 1.0;
    f.shake = 0.4;
    sfx("wrong");
  };

  useFrame(({ clock, camera }, raw) => {
    const f = fightRef.current;
    const r = f.rover;
    const g = roverGroup.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    const dt = pauseState.paused ? 0 : Math.min(raw, 0.05);

    if (stage === "drop" || stage === "loading") {
      if (stage === "drop" && !fired.current.landed) {
        r.vy -= GRAV * 0.5 * dt;
        r.pos.y += r.vy * dt;
        r.rotY += dt * 6;
        if (r.pos.y <= 0) {
          r.pos.y = 0;
          if (r.vy < -3) {
            r.vy = -r.vy * 0.35;
            spaceAudio.playThud?.(4);
          } else {
            r.vy = 0;
            r.rotY = Math.PI;
            fired.current.landed = true;
            onLanded?.();
          }
        }
      }
    } else if (stage === "fight") {
      // ----- Rover movement (screen-relative: up = towards the robot) -----
      let mx = 0;
      let mz = 0;
      if (!locked) {
        const k = keys.current;
        const d = inputRef.current;
        mx = (k.KeyD || k.ArrowRight || d.right ? 1 : 0) - (k.KeyA || k.ArrowLeft || d.left ? 1 : 0);
        mz = (k.KeyS || k.ArrowDown || d.down ? 1 : 0) - (k.KeyW || k.ArrowUp || d.up ? 1 : 0);
      }
      const len = Math.hypot(mx, mz);
      if (len > 0) {
        mx /= len;
        mz /= len;
        const goal = Math.atan2(mx, mz);
        let diff = goal - r.rotY;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        r.rotY += diff * Math.min(1, dt * 12);
        let nx = r.pos.x + mx * 6.8 * dt;
        let nz = r.pos.z + mz * 6.8 * dt;
        const dr = Math.hypot(nx, nz);
        if (dr > ARENA_R - 0.8) {
          nx *= (ARENA_R - 0.8) / dr;
          nz *= (ARENA_R - 0.8) / dr;
        }
        const dRob = Math.hypot(nx - ROBOT.x, nz - ROBOT.z);
        if (dRob < ROBOT.r + 0.8) {
          nx = ROBOT.x + ((nx - ROBOT.x) / dRob) * (ROBOT.r + 0.8);
          nz = ROBOT.z + ((nz - ROBOT.z) / dRob) * (ROBOT.r + 0.8);
        }
        r.pos.x = nx;
        r.pos.z = nz;
        wheelRefs.current.forEach((w) => w && (w.rotation.x += (6.8 * dt) / 0.22));
      }
      if (r.jumpReq && !r.airborne && !locked) {
        r.vy = JUMP_V;
        r.airborne = true;
        sfx("whoosh");
      }
      r.jumpReq = false;
      if (r.airborne) {
        r.vy -= GRAV * dt;
        r.pos.y += r.vy * dt;
        if (r.pos.y <= 0) {
          r.pos.y = 0;
          r.vy = 0;
          r.airborne = false;
        }
      }
      r.invuln = Math.max(0, r.invuln - dt);
      r.cd = Math.max(0, r.cd - dt);
      f.robotFlash = Math.max(0, f.robotFlash - dt);
      f.beamT = Math.max(0, f.beamT - dt);
      f.shake = Math.max(0, f.shake - dt);

      // ----- Rover attack (only while the robot is tired) -----
      if (r.attackReq && !locked) {
        if (f.mode === "tired" && r.cd <= 0) {
          f.robotHp = Math.max(0, f.robotHp - ROVER_ATK);
          r.cd = 0.28;
          f.beamT = 0.15;
          f.robotFlash = 0.15;
          sfx("pop");
          if (f.robotHp <= 0) {
            f.mode = "over";
            onRobotDown?.();
          }
        }
      }
      r.attackReq = false;

      // ----- Boss AI -----
      if (!locked && f.mode !== "over") {
        f.timer -= dt;
        const name = ATTACK_ORDER[f.attack];
        if (f.mode === "idle") {
          if (f.timer <= 0) startAttack(f);
        } else if (f.mode === "telegraph") {
          if (f.timer <= 0) {
            f.mode = "strike";
            f.timer = name === "shock" ? 1.5 : 0.45;
            f.shake = 0.35;
            sfx(name === "laser" ? "zap" : "thud");
            // instant hits on impact
            if (name === "slam" || name === "meteor") {
              if (f.discs.some((d) => Math.hypot(r.pos.x - d.x, r.pos.z - d.z) < d.r)) hurt(f, DAMAGE[name]);
            }
          }
        } else if (f.mode === "strike") {
          if (name === "laser" && f.lanes.some((l) => Math.abs(r.pos.x - l.x) < 1.2 + 0.45) && r.pos.z > ROBOT.z) hurt(f, DAMAGE.laser);
          if (name === "shock") {
            f.ringR = 2.4 + (1 - f.timer / 1.5) * (ARENA_R + 2);
            const d = Math.hypot(r.pos.x - ROBOT.x, r.pos.z - ROBOT.z);
            if (Math.abs(d - f.ringR) < 0.55 && r.pos.y < 0.45) hurt(f, DAMAGE.shock);
          }
          if (f.timer <= 0) {
            f.mode = "gap";
            f.timer = 0.9;
          }
        } else if (f.mode === "gap") {
          if (f.timer <= 0) {
            if (f.attack >= ATTACK_ORDER.length - 1) {
              f.mode = "tired";
              f.timer = TIRED_SECS;
              sfx("ding");
            } else {
              f.attack += 1;
              startAttack(f);
            }
          }
        } else if (f.mode === "tired") {
          if (f.timer <= 0) {
            f.cycle += 1;
            f.attack = 0;
            f.mode = "idle";
            f.timer = 0.8;
          }
        }
        if (f.roverHp <= 0 && f.mode !== "over") {
          f.mode = "over";
          onRoverDown?.();
        }
      }
    } else if (stage === "portal") {
      // roll into the portal behind the rover
      const goal = 0;
      let diff = goal - r.rotY;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      r.rotY += diff * Math.min(1, dt * 4);
      if (Math.abs(diff) < 0.3) r.pos.z += 3 * dt;
      if (r.pos.z > 8.3) r.scale = THREE.MathUtils.damp(r.scale, 0, 5, dt);
      if (r.scale < 0.08 && !fired.current.portal) {
        fired.current.portal = true;
        onPortalIn?.();
      }
    } else if (stage === "defeated" || stage === "trophy" || stage === "portalTalk") {
      // rover faces the robot
      let diff = Math.PI - r.rotY;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      r.rotY += diff * Math.min(1, dt * 4);
    }

    // draw rover (blinks while invulnerable after a hit)
    g.position.copy(r.pos);
    g.rotation.set(r.airborne ? -r.vy * 0.03 : 0, r.rotY, 0, "YXZ");
    g.scale.setScalar(Math.max(0.001, r.scale));
    g.visible = r.invuln <= 0 || Math.sin(t * 40) > 0;
    if (headRef.current) headRef.current.rotation.x = stage === "fight" && f.mode === "tired" ? -0.2 : 0;

    // attack laser from rover to robot
    if (beamRef.current) {
      beamRef.current.visible = f.beamT > 0;
      if (f.beamT > 0) {
        const from = new THREE.Vector3(r.pos.x, r.pos.y + 1.3, r.pos.z);
        const to = new THREE.Vector3(ROBOT.x, 2.6, ROBOT.z);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        beamRef.current.position.copy(mid);
        beamRef.current.scale.set(1, from.distanceTo(to), 1);
        beamRef.current.lookAt(to);
        beamRef.current.rotateX(Math.PI / 2);
      }
    }

    // camera shake on impacts
    if (f.shake > 0) {
      camera.position.x += (Math.random() - 0.5) * f.shake * 0.8;
      camera.position.y += (Math.random() - 0.5) * f.shake * 0.8;
    }

    // tell React about HP / attack changes (only when something changed)
    const hud = `${f.roverHp}|${f.robotHp}|${f.mode}|${f.attack}|${f.cycle}`;
    if (hud !== hudRef.current) {
      hudRef.current = hud;
      onHud?.({ roverHp: f.roverHp, robotHp: f.robotHp, mode: f.mode, attack: f.attack, cycle: f.cycle });
    }
  });

  return (
    <>
      <ShipRoverModel groupRef={roverGroup} wheelRefs={wheelRefs} headRef={headRef} />
      <mesh ref={beamRef} visible={false}>
        <cylinderGeometry args={[0.09, 0.09, 1, 8]} />
        <meshBasicMaterial color="#67e8f9" />
      </mesh>
    </>
  );
}

const SHOTS = {
  drop: { pos: [6, 4.5, 13], look: [0, 1, 5] },
  talk: { pos: [2.5, 3.6, 3], look: [0, 3.4, -6.5] },
  fight: { pos: [0, 15, 15.5], look: [0, 0, 0.5] },
  defeated: { pos: [3.5, 3.2, 1.5], look: [0, 2, -6] },
  trophy: { pos: [5.5, 4.2, 12], look: [0, 1.6, 3.5] },
  portal: { pos: [7, 3.5, 6], look: [0, 1.2, 7] },
};
function CameraRig({ shot }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1, 0));
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3() }), []);
  const first = useRef(true);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const s = SHOTS[shot] || SHOTS.fight;
    tmp.p.set(...s.pos);
    tmp.l.set(...s.look);
    if (first.current) {
      first.current = false;
      camera.position.copy(tmp.p);
      look.current.copy(tmp.l);
    }
    camera.position.lerp(tmp.p, 1 - Math.exp(-2.4 * dt));
    look.current.lerp(tmp.l, 1 - Math.exp(-3 * dt));
    camera.lookAt(look.current);
  });
  return null;
}

function Bar({ label, value, max, color, align = "left" }) {
  return (
    <div className={`flex-1 max-w-[280px] ${align === "right" ? "text-right" : ""}`}>
      <div className={`flex items-center gap-2 text-xs sm:text-sm font-extrabold text-white mb-1 ${align === "right" ? "justify-end" : ""}`}>
        <span>{label}</span>
        <span className="tabular-nums text-slate-300">
          {value}/{max}
        </span>
      </div>
      <div className="h-4 rounded-full bg-slate-900/90 border-2 border-white/30 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color} ${align === "right" ? "ml-auto" : ""}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function RobotBubble({ name, text }) {
  return (
    <div className="rover-pop-in max-w-xl flex items-start gap-3 bg-red-950/90 border-2 border-red-400/70 rounded-3xl px-5 py-4 shadow-2xl">
      <span className="text-4xl">🤖</span>
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-red-300">{name}</div>
        <p className="font-display text-base sm:text-xl font-bold text-red-50 leading-snug">{text}</p>
      </div>
    </div>
  );
}

// Cutscene: the 6 pieces of space fly together, glue into one, flash, and open a wormhole
export function MegaAssemble({ lang, onDone }) {
  const t = MEGA_TEXT[lang] || MEGA_TEXT.en;
  useEffect(() => {
    const id = setTimeout(onDone, 4600);
    return () => clearTimeout(id);
  }, [onDone]);
  const css = `
  @keyframes ma-in { 0% { transform: translate(var(--fx), var(--fy)) rotate(var(--fr)) scale(1.4); opacity:0; } 15% { opacity:1; }
    60% { transform: translate(var(--gx), var(--gy)) rotate(0deg) scale(1); } 100% { transform: translate(var(--gx), var(--gy)) rotate(0deg) scale(1); } }
  @keyframes ma-glow { 0%,55% { opacity:0; transform: scale(.4); } 70% { opacity:1; transform: scale(1); } 100% { opacity:1; transform: scale(1.15); } }
  @keyframes ma-flash { 0%,72% { opacity:0; } 80% { opacity:1; } 100% { opacity:0; } }
  @keyframes ma-hole { 0%,78% { opacity:0; transform: scale(.1) rotate(0deg); } 100% { opacity:1; transform: scale(1) rotate(540deg); } }
  `;
  const pieces = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return { fx: `${Math.cos(a) * 60}vmin`, fy: `${Math.sin(a) * 60}vmin`, fr: `${i * 70}deg`, gx: `${Math.cos(a) * 5}vmin`, gy: `${Math.sin(a) * 5}vmin`, rot: (a * 180) / Math.PI };
  });
  return (
    <div className="fixed inset-0 z-[45] bg-slate-950/85 flex items-center justify-center overflow-hidden">
      <style>{css}</style>
      <div className="absolute top-[14%] inset-x-0 text-center font-display text-2xl sm:text-4xl font-bold text-white px-4">{t.assembling}</div>
      <div className="absolute rounded-full" style={{ width: "34vmin", height: "34vmin", background: "radial-gradient(circle, rgba(255,255,255,.95), rgba(168,85,247,.6) 40%, transparent 70%)", animation: "ma-glow 4.6s ease-out forwards" }} />
      {pieces.map((p, i) => (
        <div key={i} className="absolute" style={{ "--fx": p.fx, "--fy": p.fy, "--fr": p.fr, "--gx": p.gx, "--gy": p.gy, animation: `ma-in 4.6s cubic-bezier(.3,.8,.4,1) ${i * 0.08}s both` }}>
          <svg width="11vmin" height="11vmin" viewBox="0 0 60 60" style={{ transform: `rotate(${p.rot}deg)` }}>
            <path d="M30 2 L56 22 L44 58 L12 52 L4 18 Z" fill="#1e1b4b" stroke="#a5b4fc" strokeWidth="2" />
            {[[20, 20], [36, 30], [26, 42], [44, 18], [14, 36]].map(([x, y], k) => (
              <circle key={k} cx={x} cy={y} r={k % 2 ? 1.6 : 2.4} fill="#fff" />
            ))}
          </svg>
        </div>
      ))}
      <div
        className="absolute rounded-full"
        style={{
          width: "52vmin",
          height: "52vmin",
          background: "radial-gradient(circle, #000 0 22%, transparent 23%), repeating-conic-gradient(from 0deg, rgba(239,68,68,.9) 0 15deg, rgba(76,5,25,.85) 15deg 30deg)",
          animation: "ma-hole 4.6s ease-out forwards",
        }}
      />
      <div className="absolute inset-0 bg-white pointer-events-none" style={{ animation: "ma-flash 4.6s ease-in-out forwards" }} />
    </div>
  );
}

export function MegaBadgeModal({ lang, onClose }) {
  const t = MEGA_TEXT[lang] || MEGA_TEXT.en;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="rover-pop-in w-full max-w-sm bg-slate-900 border-2 border-amber-300/80 rounded-3xl p-6 shadow-[0_0_70px_rgba(251,191,36,.5)] text-center">
        <div className="text-xs font-extrabold uppercase tracking-widest text-amber-300 mb-2">{t.badgeTitle}</div>
        <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-amber-300 via-red-500 to-fuchsia-600 p-1.5 shadow-xl mb-3">
          <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
            <span className="text-4xl">🏆</span>
            <span className="font-display text-2xl font-bold text-amber-200">{t.badgeName}</span>
          </div>
        </div>
        <p className="text-sm font-bold text-slate-300 mb-5">{t.badgeText}</p>
        <button type="button" onClick={onClose} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 font-display font-bold text-lg">
          🚙 {t.badgeBtn}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// The quest
// ---------------------------------------------------------------------
export default function MegaQuest({ lang, soundOn, locked: externalLock, onSfx, onStageChange, onComplete, onPause }) {
  const t = MEGA_TEXT[lang] || MEGA_TEXT.en;
  // suck | loading | drop | talk | fight | lost | defeated | trophy | portalTalk | portal | flash
  const [stage, setStage] = useState("suck");
  const [line, setLine] = useState(0);
  const [hud, setHud] = useState({ roverHp: ROVER_HP, robotHp: ROBOT_HP, mode: "idle", attack: 0, cycle: 0 });
  const [round, setRound] = useState(0);
  const fightRef = useRef(null);
  if (!fightRef.current) {
    fightRef.current = createFight();
    fightRef.current.rover.pos.y = 10;
  }
  const inputRef = useRef({ up: false, down: false, left: false, right: false });

  useEffect(() => onStageChange?.(stage), [stage, onStageChange]);

  const sfx = useCallback(
    (name) => {
      if (!soundOn) return;
      if (name === "zap") spaceAudio.playZap?.();
      else if (name === "thud") spaceAudio.playThud?.(5);
      else onSfx(name);
    },
    [soundOn, onSfx]
  );

  useEffect(() => {
    if (stage === "suck") {
      onSfx("whoosh");
      const id = setTimeout(() => setStage("loading"), 3200);
      return () => clearTimeout(id);
    }
    if (stage === "loading") {
      const id = setTimeout(() => setStage("drop"), 3600);
      return () => clearTimeout(id);
    }
    if (stage === "trophy") {
      onSfx("victory");
      const id = setTimeout(() => setStage("portalTalk"), 3200);
      return () => clearTimeout(id);
    }
    if (stage === "flash") {
      const id = setTimeout(() => onComplete?.(), 900);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const startFight = () => {
    const f = fightRef.current;
    const fresh = createFight();
    fresh.rover.pos.set(ROVER_SPAWN.x, 0, ROVER_SPAWN.z);
    fresh.timer = 1.6;
    Object.assign(f, fresh);
    setHud({ roverHp: ROVER_HP, robotHp: ROBOT_HP, mode: "idle", attack: 0, cycle: 0 });
    setRound((n) => n + 1);
    setStage("fight");
  };

  const locked = stage !== "fight" || externalLock;
  const shot = stage === "drop" || stage === "loading" ? "drop" : stage === "talk" ? "talk" : stage === "defeated" ? "defeated" : stage === "trophy" || stage === "portalTalk" ? "trophy" : stage === "portal" || stage === "flash" ? "portal" : "fight";
  const attackName = ATTACK_ORDER[hud.attack];
  const tired = hud.mode === "tired";
  const talkLine = stage === "talk" ? t.talk[line] : stage === "defeated" ? t.defeat[line] : null;
  const dpad = (dir) => ({
    onDown: () => (inputRef.current = { ...inputRef.current, [dir]: true }),
    onUp: () => (inputRef.current = { ...inputRef.current, [dir]: false }),
  });

  return (
    <div className="fixed inset-0 z-[35] select-none">
      <style>{QUEST_CSS}</style>
      {stage !== "suck" && (
        <div className="absolute inset-0 bg-[#12040a]">
          <Canvas shadows camera={{ position: [6, 4.5, 13], fov: 52 }}>
            <color attach="background" args={["#12040a"]} />
            <fog attach="fog" args={["#2a0610", 22, 60]} />
            <ambientLight intensity={0.45} color="#fecaca" />
            <hemisphereLight args={["#f87171", "#1c1917", 0.45]} />
            <directionalLight position={[8, 18, 10]} intensity={1.0} color="#fff1f2" castShadow shadow-mapSize={[1024, 1024]} />
            <Stars radius={80} depth={40} count={1500} factor={3} fade />
            <ArenaWorld />
            <GearlordModel fightRef={fightRef} stage={stage} />
            <DangerZones fightRef={fightRef} />
            <Trophy show={stage === "trophy" || stage === "portalTalk"} from={[ROBOT.x, 3, ROBOT.z + 1.5]} to={[ROVER_SPAWN.x, 2.4, ROVER_SPAWN.z - 0.2]} />
            <Portal position={[0, 9, ROVER_SPAWN.z]} rotation={[-Math.PI / 2, 0, 0]} show={stage === "drop" || stage === "loading"} color="#ef4444" />
            <Portal position={[0, 1.6, 9]} rotation={[0, Math.PI, 0]} show={stage === "portalTalk" || stage === "portal" || stage === "flash"} color="#22d3ee" />
            <FightSim
              key={round}
              fightRef={fightRef}
              stage={stage}
              inputRef={inputRef}
              locked={locked}
              sfx={sfx}
              onHud={setHud}
              onLanded={() => setTimeout(() => setStage("talk"), 900)}
              onRoverDown={() => setTimeout(() => setStage("lost"), 600)}
              onRobotDown={() => {
                onSfx("victory");
                setLine(0);
                setTimeout(() => setStage("defeated"), 900);
              }}
              onPortalIn={() => {
                onSfx("victory");
                setStage("flash");
              }}
            />
            <CameraRig shot={shot} />
          </Canvas>
        </div>
      )}

      {stage === "suck" && (
        <div style={{ filter: "hue-rotate(-75deg) saturate(1.3)" }}>
          <SuckCutscene t={t} />
        </div>
      )}
      {stage === "loading" && (
        <div style={{ filter: "hue-rotate(-75deg) saturate(1.3)" }}>
          <LoadingScreen t={t} />
        </div>
      )}
      {stage === "drop" && <div className="fixed inset-0 bg-white pointer-events-none" style={{ animation: "wq-fadeout .8s ease-out forwards" }} />}

      {/* Dialogue before the fight / after the robot gives up */}
      {talkLine && (
        <div className="fixed inset-x-0 bottom-0 z-[37] p-3 sm:p-6 flex flex-col items-center gap-3 bg-gradient-to-t from-slate-950/90 to-transparent">
          {talkLine.who === "farah" ? <CapAvatar mood="worried" message={talkLine.text} /> : <RobotBubble name={t.robotName} text={talkLine.text} />}
          <button
            type="button"
            onClick={() => {
              onSfx("click");
              const lines = stage === "talk" ? t.talk : t.defeat;
              if (line < lines.length - 1) setLine((n) => n + 1);
              else if (stage === "talk") {
                startFight();
                onSfx("alert");
              } else setStage("trophy");
            }}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-orange-400 text-white font-display font-bold text-lg shadow-lg"
          >
            {stage === "talk" && line === t.talk.length - 1 ? `⚔️ ${t.fight}` : `${t.next} →`}
          </button>
        </div>
      )}

      {/* Fight HUD */}
      {stage === "fight" && (
        <>
          <div className="fixed top-3 inset-x-3 sm:top-4 sm:inset-x-6 z-[36] flex items-start justify-between gap-4">
            <Bar label={`🚙 ${t.roverName}`} value={hud.roverHp} max={ROVER_HP} color="bg-gradient-to-r from-cyan-400 to-emerald-400" />
            <button type="button" onClick={onPause} className="shrink-0 w-11 h-11 rounded-2xl bg-slate-900/80 border border-white/15 text-lg flex items-center justify-center">
              ⏸️
            </button>
            <Bar label={`🤖 ${t.robotName}`} value={hud.robotHp} max={ROBOT_HP} color="bg-gradient-to-r from-orange-500 to-red-600" align="right" />
          </div>
          <div className="fixed top-20 inset-x-0 z-[36] flex justify-center px-4 pointer-events-none">
            {tired ? (
              <div className="rover-pop-in px-5 py-2 rounded-2xl bg-emerald-400 text-slate-950 font-display font-bold text-lg sm:text-2xl shadow-[0_0_30px_rgba(52,211,153,.7)] animate-pulse">
                😵 {t.tired}
              </div>
            ) : hud.mode === "telegraph" || hud.mode === "strike" ? (
              <div key={`${hud.cycle}-${hud.attack}`} className="rover-pop-in text-center px-5 py-2 rounded-2xl bg-red-600/90 border-2 border-red-200 text-white shadow-xl">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-red-100">{t.attackCount.replace("{n}", hud.attack + 1)}</div>
                <div className="font-display font-bold text-lg sm:text-2xl">
                  {t.attacks[attackName].icon} {t.attacks[attackName].name}
                </div>
                <div className="text-sm font-bold text-amber-200">{t.attacks[attackName].hint}</div>
              </div>
            ) : null}
          </div>
          <div className="hidden md:block fixed bottom-3 inset-x-0 z-[36] text-center text-[11px] font-bold text-slate-300 pointer-events-none">{t.controls}</div>

          {/* touch controls */}
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
          <div className="fixed left-3 sm:left-5 bottom-4 sm:bottom-6 z-[36] flex items-end gap-2">
            <Pad label={t.jump} onDown={() => (fightRef.current.rover.jumpReq = true)} onUp={() => {}} className="w-16 h-16 font-display font-bold text-sm flex-col">
              <span className="text-xl">⤴️</span>
              {t.jump}
            </Pad>
            <Pad
              label={t.attackBtn}
              onDown={() => (fightRef.current.rover.attackReq = true)}
              onUp={() => {}}
              className={`w-20 h-20 font-display font-bold text-sm flex-col ${tired ? "!bg-emerald-400 !text-slate-950 !border-white animate-pulse shadow-[0_0_24px_rgba(52,211,153,.9)]" : "opacity-50"}`}
            >
              <span className="text-2xl">{tired ? "⚡" : "🔒"}</span>
              {tired ? `${t.attackBtn} (F)` : t.attackLocked}
            </Pad>
          </div>
        </>
      )}

      {stage === "lost" && (
        <div className="fixed inset-0 z-[38] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="rover-pop-in w-full max-w-sm bg-slate-900 border-2 border-cyan-400/70 rounded-3xl p-6 text-center shadow-2xl">
            <div className="text-6xl mb-2">🔋</div>
            <h2 className="font-display text-2xl font-bold text-cyan-200">{t.lostTitle}</h2>
            <p className="text-sm font-bold text-slate-300 mt-1 mb-4">{t.lostText}</p>
            <button
              type="button"
              onClick={() => {
                onSfx("click");
                startFight();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-display font-bold text-lg"
            >
              🔄 {t.retry}
            </button>
          </div>
        </div>
      )}

      {stage === "trophy" && (
        <div className="fixed inset-x-0 bottom-12 z-[37] flex justify-center px-4 pointer-events-none">
          <div className="rover-pop-in px-6 py-3 rounded-2xl bg-amber-300 text-slate-950 font-display text-xl sm:text-3xl font-bold shadow-[0_0_40px_rgba(251,191,36,.7)]">{t.trophyGot}</div>
        </div>
      )}
      {stage === "portalTalk" && (
        <div className="fixed inset-x-0 bottom-0 z-[37] p-3 sm:p-6 flex flex-col items-center gap-3 bg-gradient-to-t from-slate-950/90 to-transparent">
          <RobotBubble name={t.robotName} text={t.portalLine} />
          <button
            type="button"
            onClick={() => {
              onSfx("click");
              setStage("portal");
            }}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-400 text-slate-950 font-display font-bold text-lg shadow-lg"
          >
            🌀 {t.goHome}
          </button>
        </div>
      )}
      {stage === "flash" && <div className="fixed inset-0 z-[39] bg-white" style={{ animation: "wq-grow .6s ease-out forwards" }} />}
    </div>
  );
}
