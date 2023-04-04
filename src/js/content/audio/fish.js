content.audio.fish = (() => {
  const bus = content.audio.createBus(),
    fishDepth = -1,
    soundLimit = 3

  const sounds = new Map()

  function createSound(fish) {
    return content.audio.fish.sound.instantiate({
      destination: bus,
      fish,
      x: fish.vector.x,
      y: fish.vector.y,
      z: fishDepth,
    })
  }

  function getClosest() {
    const distances = new Map(),
      position = engine.position.getVector()

    return content.fish.all().reduce((fishes, fish) => {
      // Cache distance
      const distance = position.distance(fish.spot)
      distances.set(fish, distance)

      // Push and sort
      fishes.push(fish)
      fishes.sort((a, b) => distances.get(a) - distances.get(b))

      // Slice to limit
      return fishes.slice(0, soundLimit)
    }, [])
  }

  return {
    reset: function () {
      for (const sound of sounds.values()) {
        sound.destroy()
      }

      sounds.clear()

      return this
    },
    update: function () {
      const next = new Set(getClosest())

      // Remove current sounds
      for (const [fish, sound] of sounds.entries()) {
        if (!next.has(fish)) {
          sounds.delete(fish)
          sound.destroy()
        }
      }

      // Add next sounds
      for (const fish of next) {
        if (!sounds.has(fish)) {
          sounds.set(fish, createSound(fish))
        }
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.fish.update()
})

engine.state.on('reset', () => content.audio.fish.reset())
