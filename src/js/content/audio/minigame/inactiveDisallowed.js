content.audio.minigame.inactiveDisallowd = () => {
  const bus = content.audio.minigame.bus()

  // TODO: synth bad
}

content.minigame.on('inactive-disallowed', () => content.audio.minigame.inactiveDisallowd())
