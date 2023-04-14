content.gl = (() => {
  let aspect,
    canvas,
    defaultDrawDistance = 500,
    drawDistance = 500,
    gl,
    height,
    hfov = Math.PI / 2,
    isActive,
    maxDrawDistance = 500,
    vfov,
    width

  function clear() {
    if (!gl) {
      return
    }

    gl.clearColor(0, 0, 0, 1)
    gl.clearDepth(1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  function recalculate() {
    if (!gl) {
      return
    }

    height = canvas.height
    width = canvas.width
    gl.viewport(0, 0, width, height)

    aspect = width / height
    vfov = hfov / aspect
  }

  return {
    aspect: () => aspect,
    clear,
    context: () => gl,
    defaultDrawDistance: () => defaultDrawDistance,
    drawDistance: () => drawDistance,
    height: () => height,
    hfov: () => hfov,
    isActive: () => Boolean(gl && isActive),
    maxDrawDistance: () => maxDrawDistance,
    recalculate,
    resolution: () => [
      width,
      height,
    ],
    setActive: function (value) {
      isActive = Boolean(value)

      return this
    },
    setCanvas: function (element) {
      canvas = element
      gl = canvas.getContext('webgl2')

      if (!gl) {
        return this
      }

      recalculate()

      gl.depthFunc(gl.LEQUAL)
      gl.enable(gl.DEPTH_TEST)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      return this
    },
    setDefaultDrawDistance: function (value) {
      defaultDrawDistance = value

      return this
    },
    setMaxDrawDistance: function (value) {
      maxDrawDistance = value

      return this
    },
    setDrawDistance: function (value) {
      drawDistance = value

      return this
    },
    setHfov: function (value) {
      hfov = value
      vfov = hfov / aspect

      return this
    },
    vfov: () => vfov,
    width: () => width,
  }
})()

content.gl.createProgram = function ({
  attributes = [],
  shaders = [],
  uniforms = [],
} = {}) {
  const gl = this.context()

  const program = gl.createProgram()

  for (const {source, type} of shaders) {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error((type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" + gl.getShaderInfoLog(shader))
    }
  }

  gl.linkProgram(program)

  return {
    attributes: attributes.reduce((hash, name) => {
      hash[name] = gl.getAttribLocation(program, name)
      return hash
    }, {}),
    destroy: function () {
      gl.deleteProgram(program)
      return this
    },
    program,
    uniforms: uniforms.reduce((hash, name) => {
      hash[name] = gl.getUniformLocation(program, name)
      return hash
    }, {}),
  }
}

content.gl.createQuad = ({
  height = 1,
  origin = engine.tool.vector3d.create(), // center of the quad
  rotate = engine.tool.quaternion.identity(),
  translate = engine.tool.vector3d.create(),
  width = 1,
} = {}) => {
  const quaternion = content.camera.computedQuaternion()

  const corners = [
    engine.tool.vector3d.create({y: -width, z: -height}) // right bottom
      .add(origin)
      .rotateQuaternion(rotate)
      .rotateQuaternion(quaternion).add(translate),
    engine.tool.vector3d.create({y: -width, z: height}) // right top
      .add(origin)
      .rotateQuaternion(rotate)
      .rotateQuaternion(quaternion).add(translate),
    engine.tool.vector3d.create({y: width, z: -height}) // left bottom
      .add(origin)
      .rotateQuaternion(rotate)
      .rotateQuaternion(quaternion).add(translate),
    engine.tool.vector3d.create({y: width, z: height}) // left top
      .add(origin)
      .rotateQuaternion(rotate)
      .rotateQuaternion(quaternion).add(translate),
  ]

  return [
    corners[0].x, corners[0].y, corners[0].z, // right bottom
    corners[1].x, corners[1].y, corners[1].z, // right top
    corners[2].x, corners[2].y, corners[2].z, // left bottom
    corners[1].x, corners[1].y, corners[1].z, // right top
    corners[2].x, corners[2].y, corners[2].z, // left bottom
    corners[3].x, corners[3].y, corners[3].z, // left top
  ]
}

content.gl.quadTextureCoordinates = () => [
  1, 1,
  1, 0,
  0, 1,
  1, 0,
  0, 1,
  0, 0,
]
