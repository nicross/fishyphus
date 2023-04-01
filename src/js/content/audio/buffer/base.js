content.audio.buffer.base = {
  all: function () {
    return [...this.buffers]
  },
  buffers: [],
  choose: function (value = Math.random()) {
    return engine.fn.choose(this.buffers, value)
  },
  count: function () {
    return this.buffers.length
  },
  get: function (index) {
    return this.buffers[index]
  },
  extend: function (definition = {}, prototype = this) {
    return engine.fn.extend(prototype, definition)
  },
}
