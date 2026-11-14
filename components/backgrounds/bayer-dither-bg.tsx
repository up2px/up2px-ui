"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { readCanvasPalette } from "./theme-colors";

const VERTEX_SRC = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_mouseActive;
uniform vec3 u_bg;
uniform vec3 u_fg;
uniform vec3 u_accent;
uniform float u_isDark;
uniform vec2 u_dir1;
uniform vec2 u_dir2;
uniform vec2 u_dir3;
uniform vec3 u_phases;

out vec4 outColor;

// 2D Simplex-like gradient noise
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  ) * 0.5 + 0.5;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

float bayer4(vec2 coord) {
  int x = int(mod(coord.x, 4.0));
  int y = int(mod(coord.y, 4.0));
  int idx = y * 4 + x;
  if (idx == 0) return 0.0 / 16.0;
  if (idx == 1) return 8.0 / 16.0;
  if (idx == 2) return 2.0 / 16.0;
  if (idx == 3) return 10.0 / 16.0;
  if (idx == 4) return 12.0 / 16.0;
  if (idx == 5) return 4.0 / 16.0;
  if (idx == 6) return 14.0 / 16.0;
  if (idx == 7) return 6.0 / 16.0;
  if (idx == 8) return 3.0 / 16.0;
  if (idx == 9) return 11.0 / 16.0;
  if (idx == 10) return 1.0 / 16.0;
  if (idx == 11) return 9.0 / 16.0;
  if (idx == 12) return 15.0 / 16.0;
  if (idx == 13) return 7.0 / 16.0;
  if (idx == 14) return 13.0 / 16.0;
  return 5.0 / 16.0;
}

void main() {
  float pixelSize = 5.0;
  vec2 cell = floor(gl_FragCoord.xy / pixelSize);
  vec2 cellCenter = (cell + 0.5) * pixelSize;
  vec2 uv = cellCenter / u_res;
  float aspect = u_res.x / max(u_res.y, 1.0);

  vec2 p = vec2(uv.x * aspect, uv.y) * 2.2;
  float t = u_time * 0.12;
  float warp = fbm(p * 0.85 + vec2(t * 0.45, -t * 0.35));
  float baseNoise = mix(fbm(p + vec2(t, -t * 0.6)), warp, 0.45);

  // Three domain-warped waves flowing in randomized directions
  float wave1 = pow(
    0.5 + 0.5 * sin(dot(p, u_dir1) * 2.8 - u_time * 0.62 + warp * 3.6 + u_phases.x),
    2.8
  );
  float wave2 = pow(
    0.5 + 0.5 * sin(dot(p, u_dir2) * 2.4 - u_time * 0.52 + warp * 4.0 + u_phases.y),
    2.8
  );
  float wave3 = pow(
    0.5 + 0.5 * sin(dot(p, u_dir3) * 3.1 - u_time * 0.70 + warp * 3.4 + u_phases.z),
    2.8
  );

  float waveEnergy = max(max(wave1, wave2), wave3);
  float field = clamp(baseNoise * 0.36 + waveEnergy * 0.56, 0.0, 1.0);

  // Wide quiet zone in center so headline and CTA stay primary focus
  vec2 centered = (uv - 0.5) * vec2(1.05, 1.25);
  float centerDist = length(centered);
  float centerQuiet = smoothstep(0.18, 0.78, centerDist);
  field *= mix(0.16, 0.78, centerQuiet);

  // Interactive cursor energy
  vec2 mouseDelta = (cellCenter - u_mouse) / min(u_res.x, u_res.y);
  float mDist = length(mouseDelta);
  float hoverBoost = u_mouseActive * exp(-mDist * 6.5) * 0.42;
  field = clamp(field + hoverBoost, 0.0, 1.0);

  float threshold = bayer4(cell);
  float lit = step(threshold, field * 0.66);

  // Subtle colorful wave crests quantized through ordered Bayer dither
  vec3 c1 = u_accent;
  vec3 c2 = u_isDark > 0.5 ? vec3(0.42, 0.48, 1.0) : vec3(0.32, 0.36, 0.92);
  vec3 c3 = u_isDark > 0.5 ? vec3(0.10, 0.82, 0.90) : vec3(0.05, 0.65, 0.78);
  vec3 waveColor = (c1 * wave1 + c2 * wave2 + c3 * wave3) / max(wave1 + wave2 + wave3, 0.001);

  float colorDensity = smoothstep(
    0.38,
    0.92,
    waveEnergy * mix(0.10, 0.78, centerQuiet) + hoverBoost * 0.65
  );
  float colorMask = step(threshold, colorDensity * 0.56);

  vec3 basePixel = mix(u_bg, u_fg, u_isDark > 0.5 ? 0.09 : 0.08);
  vec3 color = mix(u_bg, basePixel, lit);
  color = mix(color, waveColor, colorMask * (u_isDark > 0.5 ? 0.34 : 0.28));

  // Crisp micro gap inside each 5px cell to give dot-pixel feel
  vec2 local = fract(gl_FragCoord.xy / pixelSize) - 0.5;
  float dotMask = step(max(abs(local.x), abs(local.y)), 0.38);
  color = mix(u_bg, color, dotMask);

  outColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function BayerDitherBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const posLoc = gl.getAttribLocation(program, "a_pos");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uMouseActive = gl.getUniformLocation(program, "u_mouseActive");
    const uBg = gl.getUniformLocation(program, "u_bg");
    const uFg = gl.getUniformLocation(program, "u_fg");
    const uAccent = gl.getUniformLocation(program, "u_accent");
    const uIsDark = gl.getUniformLocation(program, "u_isDark");
    const uDir1 = gl.getUniformLocation(program, "u_dir1");
    const uDir2 = gl.getUniformLocation(program, "u_dir2");
    const uDir3 = gl.getUniformLocation(program, "u_dir3");
    const uPhases = gl.getUniformLocation(program, "u_phases");

    const baseAngle = Math.random() * Math.PI * 2;
    const waveDirs = [0, 1, 2].map((i) => {
      const angle =
        baseAngle + i * ((Math.PI * 2) / 3) + (Math.random() - 0.5) * 0.9;
      return [Math.cos(angle), Math.sin(angle)] as const;
    });
    const wavePhases = [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    ] as const;

    gl.useProgram(program);
    gl.uniform2f(uDir1, waveDirs[0][0], waveDirs[0][1]);
    gl.uniform2f(uDir2, waveDirs[1][0], waveDirs[1][1]);
    gl.uniform2f(uDir3, waveDirs[2][0], waveDirs[2][1]);
    gl.uniform3f(uPhases, wavePhases[0], wavePhases[1], wavePhases[2]);

    let palette = readCanvasPalette();
    let width = 1;
    let height = 1;
    let mouseX = 0;
    let mouseY = 0;
    let mouseTarget = 0;
    let mouseActive = 0;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = 1; // Pixelated shader stays sharp at 1x CSS pixels
      width = Math.max(1, Math.floor(rect.width * dpr));
      height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const mo = new MutationObserver(() => {
      palette = readCanvasPalette();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouseX = x;
        mouseY = rect.height - y;
        mouseTarget = 1;
      } else {
        mouseTarget = 0;
      }
    };
    const onPointerLeave = () => {
      mouseTarget = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    parent.addEventListener("pointerleave", onPointerLeave);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    let rafId = 0;

    const render = (now: number) => {
      mouseActive += (mouseTarget - mouseActive) * 0.08;
      gl.useProgram(program);
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uMouseActive, mouseActive);
      gl.uniform3f(
        uBg,
        palette.surface[0] / 255,
        palette.surface[1] / 255,
        palette.surface[2] / 255,
      );
      gl.uniform3f(
        uFg,
        palette.foreground[0] / 255,
        palette.foreground[1] / 255,
        palette.foreground[2] / 255,
      );
      gl.uniform3f(
        uAccent,
        palette.accent[0] / 255,
        palette.accent[1] / 255,
        palette.accent[2] / 255,
      );
      gl.uniform1f(uIsDark, palette.isDark ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("pointerleave", onPointerLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
