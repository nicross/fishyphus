content.audio.minigame.reelingBonus = () => {
  const bus = content.audio.minigame.bus()

  // TODO: synth reel
}

content.minigame.on('reeling-bonus', () => content.audio.minigame.reelingBonus())
