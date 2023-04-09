content.audio.minigame.reelingBonus = () => {
  const bus = content.audio.minigame.bus(),
    now = engine.time(),
    value = content.minigame.data().bonus || 0

  const detune = engine.fn.lerp(0, 600, value)

  const synth = engine.synth.simple({
    detune,
    gain: engine.fn.fromDb(-6),
    frequency: engine.fn.fromMidi(36),
  }).connect(bus)

  const duration = 0.25

  synth.param.detune.linearRampToValueAtTime(0, now + duration)
  synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

  synth.stop(now + duration)
}

content.minigame.on('reeling-bonus', () => content.audio.minigame.reelingBonus())
