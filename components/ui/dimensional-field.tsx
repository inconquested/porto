"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* Fibonacci sphere — even point distribution, so the cloud never clumps. */
function fibonacciSphere(count: number, radius: number) {
  const pts = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = golden * i;
    pts[i * 3] = Math.cos(a) * r * radius;
    pts[i * 3 + 1] = y * radius;
    pts[i * 3 + 2] = Math.sin(a) * r * radius;
  }
  return pts;
}

const SHARD_COUNT = 14;

/**
 * DimensionalField — the immersive WebGL backdrop: a particle cloud inside a
 * wire cage, wireframe shards drifting around it, pointer parallax on top.
 * Reference: 21st.dev "@mengto/dimensional-field" (drifting geometry in a
 * noise field) and "@mengto/orbital-sphere-background" (violet particle sphere
 * with orbiting nodes).
 *
 * Mount it through DeferWebGL so mobile / save-data / low-end devices never pay
 * for it — they keep the CSS halo underneath. Colour follows --accent and is
 * re-read on theme switch.
 */
export default function DimensionalField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL — the CSS layer underneath carries the section on its own
    }
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    camera.position.set(0, 0.35, 6.4);

    const accent = new THREE.Color("#818cf8");
    const group = new THREE.Group();
    scene.add(group);

    const R = 2.15;
    const sphere = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(fibonacciSphere(1500, R), 3));
    const coreMat = new THREE.PointsMaterial({ color: accent, size: 0.028, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending });
    const haloMat = new THREE.PointsMaterial({ color: accent, size: 0.11, sizeAttenuation: true, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending });
    group.add(new THREE.Points(sphere, coreMat), new THREE.Points(sphere, haloMat));

    const cageSource = new THREE.IcosahedronGeometry(R, 2);
    const cageGeo = new THREE.WireframeGeometry(cageSource);
    cageSource.dispose();
    const cageMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending });
    group.add(new THREE.LineSegments(cageGeo, cageMat));

    const shardSource = new THREE.IcosahedronGeometry(0.17, 0);
    const shardGeo = new THREE.WireframeGeometry(shardSource);
    shardSource.dispose();
    const shardMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.34, depthWrite: false, blending: THREE.AdditiveBlending });
    const shards = Array.from({ length: SHARD_COUNT }, () => {
      const mesh = new THREE.LineSegments(shardGeo, shardMat);
      const base = new THREE.Vector3().randomDirection().multiplyScalar(R + 0.5 + Math.random() * 1.7);
      mesh.position.copy(base);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      group.add(mesh);
      return { mesh, base, seed: Math.random() * Math.PI * 2, spinX: (Math.random() - 0.5) * 0.3, spinY: (Math.random() - 0.5) * 0.3 };
    });

    /* Theme drives both colour and blending: additive glow reads on noir but
       vanishes on paper, where normal blending is what keeps the field visible. */
    const applyTheme = () => {
      const css = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (css) accent.set(css);
      const dark = document.documentElement.classList.contains("dark");
      const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      for (const m of [coreMat, haloMat, cageMat, shardMat]) {
        m.color.copy(accent);
        m.blending = blending;
        m.needsUpdate = true;
      }
      coreMat.opacity = dark ? 0.7 : 0.9;
      haloMat.opacity = dark ? 0.1 : 0.16;
      cageMat.opacity = dark ? 0.14 : 0.26;
      shardMat.opacity = dark ? 0.34 : 0.45;
    };
    applyTheme();

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const setSize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(host);

    /* Pause both when the section scrolls away and when the tab is hidden. */
    let onScreen = true;
    let onTab = !document.hidden;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    }, { rootMargin: "120px" });
    io.observe(host);
    const onVisibility = () => {
      onTab = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || !onTab) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const ease = Math.min(1, dt * 2.2);
      group.rotation.y += dt * 0.075;
      group.rotation.x += (pointer.y * 0.22 - group.rotation.x) * ease;
      group.rotation.z += (-pointer.x * 0.12 - group.rotation.z) * ease;
      for (const s of shards) {
        s.mesh.rotation.x += s.spinX * dt;
        s.mesh.rotation.y += s.spinY * dt;
        s.mesh.position.y = s.base.y + Math.sin(t * 0.5 + s.seed) * 0.22;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      sphere.dispose();
      coreMat.dispose();
      haloMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" />;
}
