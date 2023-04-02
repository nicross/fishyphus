content.camera = (() => {
  let computedQuaternion = engine.tool.quaternion.identity(),
    computedQuaternionConjugate = engine.tool.quaternion.identity(),
    computedNormal = engine.tool.vector3d.create(),
    computedVector = engine.tool.vector3d.create(),
    computedVectorInverse = engine.tool.vector3d.create(),
    projectionMatrix = engine.tool.matrix4d.identity(),
    quaternion = engine.tool.quaternion.identity(),
    vector = engine.tool.vector3d.create()

  function createPerspective() {
    // Calculate perspective
    const aspect = content.gl.aspect(),
      fov = content.gl.vfov()

    const far = content.gl.drawDistance(),
      near = 0.1

    const top = near * Math.tan(fov / 2)
    const bottom = -top
    const right = top * aspect
    const left = -right

    // Calculate frustum from perspective
    const sx = 2 * near / (right - left),
      sy = 2 * near / (top - bottom)

    var c2 = -(far + near) / (far - near),
      c1 = 2 * near * far / (near - far)

    const tx = -near * (left + right) / (right - left),
      ty = -near * (bottom + top) / (top - bottom)

    const projection = engine.tool.matrix4d.create([
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, c2, -1,
      tx, ty, c1, 0,
    ])

    // Swapper (rotate from Z-up to Y-up)
    const swapper = engine.tool.matrix4d.create([
      0, 0, -1, 0,
      -1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 0, 1,
    ])

    // Camera rotation
    const rotation = engine.tool.matrix4d.fromQuaternion(
      computedQuaternionConjugate
    ).transpose()

    // Putting it all together
    return projection
      .multiply(swapper)
      .multiply(rotation)
  }

  function calculateHeight() {
    return 4
  }

  return {
    computedQuaternion: () => computedQuaternion.clone(),
    computedQuaternionConjugate: () => computedQuaternionConjugate.clone(),
    computedNormal: () => computedNormal.clone(),
    computedVector: () => computedVector.clone(),
    computedVectorInverse: () => computedVectorInverse.clone(),
    getQuaternion: () => quaternion.clone(),
    getVector: () => vector.clone(),
    height: () => calculateHeight(),
    projectionMatrix: () => projectionMatrix,
    reset: function () {
      computedNormal = engine.tool.vector3d.unitX()
      computedQuaternion = engine.tool.quaternion.identity()
      computedQuaternionConjugate = engine.tool.quaternion.identity()
      computedVector = engine.tool.vector3d.create()
      computedVectorInverse = engine.tool.vector3d.create()
      projectionMatrix = engine.tool.matrix4d.identity()
      quaternion = engine.tool.quaternion.identity()
      vector = engine.tool.vector3d.create()

      return this
    },
    setQuaternion: function (value) {
      quaternion = engine.tool.quaternion.create(value)
      return this
    },
    setVector: function (value) {
      vector = engine.tool.vector3d.create(value)
      return this
    },
    toRelative: (vector) => {
      return computedVectorInverse.add(vector)
        .rotateQuaternion(computedQuaternionConjugate)
    },
    update: function () {
      const height = calculateHeight()

      computedQuaternion = engine.position.getQuaternion().multiply(quaternion).normalize()
      computedQuaternionConjugate = computedQuaternion.conjugate()

      computedNormal = computedQuaternion.forward()

      computedVector = engine.position.getVector().add(vector).add({z: height})
      computedVectorInverse = computedVector.inverse()

      projectionMatrix = createPerspective()

      return this
    },
  }
})()

engine.loop.on('frame', () => content.camera.update())
engine.state.on('import', () => content.camera.update())
engine.state.on('reset', () => content.camera.reset())
