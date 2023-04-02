content.gl.sl = {}

content.gl.sl.common = () => `
${content.gl.sl.definePi()}
${content.gl.sl.rand()}
${content.gl.sl.scale()}
`

content.gl.sl.definePi = () => `
#define PI 3.1415926535897932384626433832795
`

content.gl.sl.rand = (prefix = '') => `
float ${prefix}rand(vec2 co) {
  float a = 12.9898;
  float b = 78.233;
  float c = 43758.5453;
  float dt= dot(co.xy ,vec2(a,b));
  float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}
`

content.gl.sl.scale = (prefix = '') => `
float ${prefix}scale(float value, float min, float max, float a, float b) {
  return a + (((value - min) / (max - min)) * (b - a));
}
`
