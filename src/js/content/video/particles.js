content.video.particles = (() => {
  const maxParticles = 7500

  const fragmentShader = `#version 300 es

precision highp float;

in vec4 colorA;
in vec4 colorB;
in vec4 colorC;
out vec4 color;

${content.gl.sl.common()}

void main() {
  color = colorA;
}
`

  const vertexShader = `#version 300 es

precision highp float;

${content.gl.sl.common()}

in float life;
in vec3 offset;
in vec3 vertex;
out vec4 colorA;
out vec4 colorB;
out vec4 colorC;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform mat4 u_projection;

void main(void) {
  gl_Position = u_projection * vec4(vertex + offset, 1.0);

  float alpha = sin(PI * life);

  colorA = vec4(u_colorA.rgb, alpha);
  colorB = vec4(u_colorB.rgb, alpha);
  colorC = vec4(u_colorC.rgb, alpha);
}
`

  let particles = [],
    program

  function createProgram() {
    const gl = content.gl.context()

    program = content.gl.createProgram({
      attributes: [
        'life',
        'offset',
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
        'u_projection',
      ],
    })
  }

  function draw() {
    const camera = content.camera.computedVector(),
      gl = content.gl.context()

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

    // Bind projection
    gl.uniformMatrix4fv(program.uniforms.u_projection, false, content.camera.projectionMatrix().elements)

    // Update and analyze particles
    const {
      lifes,
      offsets,
    } = updateParticles()

    // Bind life
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lifes), gl.STATIC_DRAW)

    gl.enableVertexAttribArray(program.attributes.life)
    gl.vertexAttribPointer(program.attributes.life, 1, gl.FLOAT, false, 0, 0)
    gl.vertexAttribDivisor(program.attributes.life, 1)

    // Bind offset
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(offsets), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(program.attributes.offset)
    gl.vertexAttribPointer(program.attributes.offset, 3, gl.FLOAT, false, 0, 0)
    gl.vertexAttribDivisor(program.attributes.offset, 1)

    // Bind mesh
    const mesh = content.gl.createQuad({
      height: 1/10,
      width: 1/10,
    })

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(program.attributes.vertex)
    gl.vertexAttribPointer(program.attributes.vertex, 3, gl.FLOAT, false, 0, 0)

    // Draw instances
    gl.drawArraysInstanced(gl.TRIANGLES, 0, mesh.length / 3, particles.length)

    // XXX: Reset divisors - OpenGL is a state machine
    gl.vertexAttribDivisor(program.attributes.life, 0)
    gl.vertexAttribDivisor(program.attributes.offset, 0)
  }

  function spawnParticles() {
    const camera = content.camera.computedVector(),
      drawDistance = content.gl.drawDistance()

    // Surface
    while (particles.length < maxParticles && Math.random() < 0.95) {
      particles.push({
        rate: 1 / engine.fn.randomFloat(4, 6),
        life: 1,
        x: camera.x + ((Math.random() > 0.5 ? 1 : -1) * (Math.random() ** 1.5) * drawDistance),
        y: camera.y + ((Math.random() > 0.5 ? 1 : -1) * (Math.random() ** 1.5) * drawDistance),
      })
    }

    // Fish
    for (const sound of content.audio.fish.sounds()) {
      if (content.minigame.isFish(sound.fish.id)) {
        continue
      }

      if (Math.random() > 0.5) {
        continue
      }

      particles.push({
        rate: 0.5,
        life: 1,
        x: sound.vector.x + engine.fn.randomFloat(-1, 1),
        y: sound.vector.y + engine.fn.randomFloat(-1, 1),
      })
    }
  }

  function updateParticles() {
    spawnParticles()

    const camera = content.camera.computedVector(),
      delta = engine.loop.delta() / 2,
      drawDistance = content.gl.drawDistance(),
      lifes = [],
      offsets = []

    particles = particles.reduce((particles, particle) => {
      particle.life -= delta * particle.rate

      if (particle.life < 0) {
        return particles
      }

      particle.x = engine.fn.wrap(particle.x, camera.x - drawDistance, camera.x + drawDistance)
      particle.y = engine.fn.wrap(particle.y, camera.y - drawDistance, camera.y + drawDistance)
      particle.z = content.surface.value(particle)

      lifes.push(particle.life)

      offsets.push(
        particle.x - camera.x,
        particle.y - camera.y,
        particle.z - camera.z,
      )

      particles.push(particle)

      return particles
    }, [])

    return {
      lifes,
      offsets,
    }
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
      particles.length = 0

      if (program) {
        program.destroy()
        program = undefined
      }

      return this
    },
  }
})()
