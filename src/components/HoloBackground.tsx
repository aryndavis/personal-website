import { useEffect, useRef } from 'react'

const vertex = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

// Domain-warped noise shaded like liquid chrome with a thin-film rainbow sheen.
const fragment = `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main() {
  float s = min(u_res.x, u_res.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / s;
  vec2 m = (u_mouse - 0.5) * u_res / s;
  float t = u_time * 0.035;

  vec2 p = uv * 0.85 + vec2(0.3, 0.1);
  vec2 d = m - uv;
  p += 0.18 * d * exp(-3.0 * length(d));

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + 1.3 * t), fbm(p + 2.6 * q + vec2(8.3, 2.8) - 1.1 * t));
  float f = fbm(p + 2.6 * r);

  // Treat f as a height field: slopes get a thin-film rainbow, flat crests read as white chrome.
  float k = u_res.y * 1.1;
  vec3 n = normalize(vec3(-dFdx(f) * k, -dFdy(f) * k, 1.0));
  float slope = 1.0 - n.z;
  float body = smoothstep(0.4, 0.48, f);

  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (slope * 2.5 + f * 3.0 + vec3(0.0, 0.33, 0.67) - u_time * 0.03));
  irid = mix(irid, irid * irid, 0.3) * 1.3;
  float spec = pow(max(dot(reflect(vec3(0.0, 0.0, -1.0), n), normalize(vec3(-0.4, 0.5, 0.75))), 0.0), 12.0);
  float plateau = smoothstep(0.5, 0.6, f) * smoothstep(0.3, 0.06, slope);

  vec3 col = irid * smoothstep(0.02, 0.16, slope) * body;
  col = mix(col, vec3(0.88, 0.88, 0.94), plateau * 0.85);
  col += spec * 0.8 * body;
  col += vec3(0.02, 0.02, 0.08) * body;

  float vig = smoothstep(1.3, 0.2, length(uv * vec2(0.8, 1.0)));
  col *= mix(0.2, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

export default function HoloBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    // Derivatives give the liquid its surface normals; nearly every WebGL device has them.
    const derivatives = gl?.getExtension('OES_standard_derivatives')
    const vs = gl && derivatives && compile(gl, gl.VERTEX_SHADER, vertex)
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, fragment)
    const program = gl?.createProgram()
    if (!canvas || !gl || !vs || !fs || !program) {
      document.documentElement.classList.add('no-webgl')
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      document.documentElement.classList.add('no-webgl')
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'u_res')
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mouse = { x: 0.6, y: 0.55, tx: 0.6, ty: 0.55 }
    let frame = 0
    const start = performance.now() - 40_000

    const resize = () => {
      // Render at reduced resolution; the blur of upscaling suits the liquid look.
      const scale = Math.min(0.75, 1100 / Math.max(window.innerWidth, 1))
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale))
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      if (reduceMotion.matches) draw(40_000)
    }

    const draw = (time: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      gl.uniform1f(uTime, time / 1000)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = (now: number) => {
      draw(now - start)
      frame = requestAnimationFrame(loop)
    }

    const play = () => {
      cancelAnimationFrame(frame)
      if (reduceMotion.matches || document.hidden) {
        draw(40_000)
        return
      }
      frame = requestAnimationFrame(loop)
    }

    const onPointer = (event: PointerEvent) => {
      mouse.tx = event.clientX / window.innerWidth
      mouse.ty = 1 - event.clientY / window.innerHeight
    }

    resize()
    play()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', play)
    reduceMotion.addEventListener('change', play)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', play)
      reduceMotion.removeEventListener('change', play)
    }
  }, [])

  return (
    <div className="backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="holo" />
      <div className="grid-overlay" />
      <span className="sparkle s1" />
      <span className="sparkle s2" />
      <span className="sparkle s3" />
      <span className="sparkle s4" />
      <span className="sparkle s5" />
    </div>
  )
}
