content.video.sky = (() => {
  const fragmentShader = `#version 300 es

precision highp float;

in vec4 colorA;
in vec4 colorB;
in vec4 colorC;
in vec2 resolution;
in float time;
out vec4 color;

${content.gl.sl.common()}

void main() {
  float gradient = gl_FragCoord.y / resolution.y;

  // Dithering
  gradient += (1.0 / 12.0) * (rand(vec2(gl_FragCoord.x + time, gl_FragCoord.y - time)) - 0.5);
  gradient = clamp(gradient, 0.0, 1.0);

  color = mix(colorB, colorC, gradient);
}
`

  const vertexShader = `#version 300 es

precision highp float;

in vec3 vertex;
out vec4 colorA;
out vec4 colorB;
out vec4 colorC;
out vec2 resolution;
out float time;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform vec2 u_resolution;
uniform float u_time;

void main(void) {
  gl_Position = vec4(vertex, 1.0);

  colorA = vec4(u_colorA.rgb, 1.0);
  colorB = vec4(u_colorB.rgb, 1.0);
  colorC = vec4(u_colorC.rgb, 1.0);

  resolution = u_resolution;
  time = u_time;
}
`

  let program

  function createProgram() {
    const gl = content.gl.context()

    program = content.gl.createProgram({
      attributes: [
        'vertex',
      ],
      shaders: [
        {
          source: fragmentShader,
          type: gl.FRAGMENT_SHADER,
        },
        {
          source: vertexShader,
          type: gl.VERTEX_SHADER,
        },
      ],
      uniforms: [
        'u_colorA',
        'u_colorB',
        'u_colorC',
        'u_resolution',
        'u_time',
      ],
    })
  }

  function draw() {
    const gl = content.gl.context()

    gl.useProgram(program.program)

    // Bind colors
    for (const [key, index] of [
      ['u_colorA', 0],
      ['u_colorB', 1],
      ['u_colorC', 2],
    ]) {
      gl.uniform3fv(program.uniforms[key], new Float32Array(
        content.video.color.get(index)
      ))
    }

    // Bind resolution
    gl.uniform2fv(program.uniforms.u_resolution, new Float32Array(
      content.gl.resolution()
    ))

    // Bind time
    gl.uniform1f(program.uniforms.u_time, content.time.value())

    // Bind vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      [-1, 3, 1], [-1, -1, 1], [3, -1, 1],
    ].flat()), gl.STATIC_DRAW)

    gl.enableVertexAttribArray(program.attributes.vertex)
    gl.vertexAttribPointer(program.attributes.vertex, 3, gl.FLOAT, false, 0, 0)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  return {
    draw: function () {
      draw()

      return this
    },
    load: function () {
      createProgram()

      return this
    },
    unload: function () {
      if (program) {
        program.destroy()
        program = undefined
      }

      return this
    },
  }
})()
