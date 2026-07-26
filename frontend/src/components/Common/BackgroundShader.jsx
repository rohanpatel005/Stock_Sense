import React, { useEffect, useRef } from 'react';

const BackgroundShader = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId;

    const syncSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    window.addEventListener('resize', syncSize);
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      vec3 hash3(vec2 p) {
          vec3 q = vec3(dot(p, vec2(127.1, 311.7)), 
                        dot(p, vec2(269.5, 183.3)), 
                        dot(p, vec2(419.2, 371.9)));
          return fract(sin(q) * 43758.5453);
      }

      void main() {
          vec2 uv = v_texCoord;
          vec2 mouse = u_mouse / u_resolution;
          
          vec3 baseColor = vec3(0.01, 0.02, 0.03); // Near black
          
          float t = u_time * 0.2;
          
          // Blob 1: Teal
          vec2 pos1 = vec2(0.5 + 0.3 * sin(t), 0.5 + 0.2 * cos(t * 0.7));
          float dist1 = length(uv - pos1);
          float glow1 = smoothstep(0.6, 0.0, dist1) * 0.4;
          baseColor += vec3(0.05, 0.58, 0.53) * glow1;
          
          // Blob 2: Indigo
          vec2 pos2 = vec2(0.5 + 0.4 * cos(t * 1.1), 0.5 + 0.3 * sin(t * 0.8));
          float dist2 = length(uv - pos2);
          float glow2 = smoothstep(0.7, 0.0, dist2) * 0.3;
          baseColor += vec3(0.39, 0.40, 0.95) * glow2;
          
          // Animated Grid lines
          vec2 gridUv = fract(uv * 30.0 + vec2(u_time * 0.05, 0.0));
          float grid = smoothstep(0.02, 0.0, gridUv.x) + smoothstep(0.02, 0.0, gridUv.y);
          baseColor += vec3(0.1, 0.2, 0.3) * grid * 0.1;
          
          // Mouse Glow
          float mDist = length(uv - mouse);
          float mGlow = smoothstep(0.3, 0.0, mDist) * 0.2;
          baseColor += vec3(0.05, 0.58, 0.53) * mGlow;
          
          // Subtle Noise
          float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
          baseColor += noise * 0.02;
          
          gl_FragColor = vec4(baseColor, 1.0);
      }
    `;

    const cs = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.removeEventListener('resize', syncSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-40"
      style={{ display: 'block' }}
    />
  );
};

export default BackgroundShader;
