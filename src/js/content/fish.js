content.fish = (() => {
  const distanceMax = 50,
    distanceMin = 5,
    fishAcceleration = 1 / (distanceMax / 8),
    fishes = new Map()

  let closest

  function updateOne(fish) {
    const delta = engine.loop.delta(),
      position = engine.position.getVector()

    const targetValue = engine.fn.clamp(
      engine.fn.scale(
        position.distance(fish.spot),
        distanceMin, distanceMax,
        1, 0
      )
    )

    fish.value = engine.fn.accelerateValue(fish.value, targetValue, fishAcceleration)
    fish.distance = engine.fn.lerp(distanceMax, distanceMin, fish.value)

    fish.angle += delta * engine.const.tau / fish.distance * fish.spot.sign
    fish.angle %= engine.const.tau

    fish.vector = engine.tool.vector2d.unitX()
      .scale(fish.distance)
      .rotate(fish.angle)
      .add(fish.spot)
  }

  return {
    all: () => [...fishes.values()],
    closest: () => closest,
    despawn: function (id) {
      if (closest && closest.id == id) {
        closest = undefined
      }

      fishes.delete(id)

      return this
    },
    reset: function () {
      closest = undefined
      fishes.clear()

      return this
    },
    spawnNearSpot: function (spot) {
      const angle = engine.const.tau * Math.random()

      const fish = {
        angle,
        distance: distanceMax,
        id: spot.id,
        spot,
        vector: engine.tool.vector2d.unitX().scale(distanceMax).rotate(angle).add(spot),
        value: 0,
      }

      fishes.set(fish.id, fish)

      return this
    },
    update: function () {
      closest = undefined

      for (const fish of fishes.values()) {
        updateOne(fish)

        if (fish.value && (!closest || fish.value > closest.value)) {
          closest = fish
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

  content.fish.update()
})

engine.ready(() => {
  content.spawner.on('spawn', (spot) => {
    content.fish.spawnNearSpot(spot)
  })

  content.spawner.on('despawn', ({id}) => {
    content.fish.despawn(id)
  })

  content.minigame.on('finish', ({fish}) => {
    content.fish.despawn(fish.id)
  })
})

engine.state.on('reset', () => content.fish.reset())
