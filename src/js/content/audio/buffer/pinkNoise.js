content.audio.buffer.pinkNoise = content.audio.buffer.base.extend({
  buffers: [
    engine.buffer.pinkNoise({
      channels: 1,
      duration: 10,
    }),
  ],
})
