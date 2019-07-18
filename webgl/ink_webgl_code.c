attribute vec2 positionFrom;
attribute vec2 positionTo;
attribute vec2 positionTimings;

attribute vec4 sourceColorFrom;
attribute vec4 sourceColorTo;
attribute vec2 sourceColorTimings;

varying vec4 destcolor;

uniform mat3 view;
uniform mat3 object;
uniform float time;

void main(void) {
  float colorLerpAmount =
      clamp((time - sourceColorTimings.x) /
                (sourceColorTimings.y - sourceColorTimings.x),
            0.0, 1.0);
  destcolor = mix(sourceColorFrom, sourceColorTo, colorLerpAmount);

  float positionLerpAmount = clamp(
      (time - positionTimings.x) / (positionTimings.y - positionTimings.x), 0.0,
      1.0);
  vec2 pos = mix(positionFrom, positionTo, positionLerpAmount);
  vec3 homogeneous = view * object * vec3(pos, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}



varying lowp vec4 destcolor;

void main(void)
{
    gl_FragColor = destcolor;
}



varying lowp vec4 destcolor;
varying lowp vec2 textureCoordsOut;

void main(void) {
  if (distance(textureCoordsOut, vec2(0.0, 0.0)) > 0.5 &&
      distance(textureCoordsOut, vec2(0.0, 1.0)) > 0.5 &&
      distance(textureCoordsOut, vec2(1.0, 1.0)) > 0.5 &&
      distance(textureCoordsOut, vec2(1.0, 0.0)) > 0.5) {
    gl_FragColor = destcolor;
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
attribute vec2 position;
attribute vec2 velocity;
attribute vec2 positionTimings;

attribute vec4 sourceColorFrom;
attribute vec4 sourceColorTo;
attribute vec2 sourceColorTimings;

attribute vec2 textureCoords;

varying vec4 destcolor;
varying vec2 textureCoordsOut;

uniform mat3 view;
uniform mat3 object;
uniform float time;

float make_cyclic(float value, float start, float period) {
  return mod(value - start, period);
}

void main(void) {
  // Components for \22gravity\22 and initial velocity. (world coords)
  float g = -450.0;  // Determined empirically.
  float vx = velocity.x;
  float vy = velocity.y;

  // Make the color time cyclic.
  float modTime = make_cyclic(time, sourceColorTimings.x,
                              sourceColorTimings.y - sourceColorTimings.x);
  float colorLerpAmount =
      clamp(modTime / (sourceColorTimings.y - sourceColorTimings.x), 0.0, 1.0);
  destcolor = mix(sourceColorFrom, sourceColorTo, colorLerpAmount);

  // Make the position time cyclic.
  float t = make_cyclic(time, positionTimings.x,
                        positionTimings.y - positionTimings.x);

  // Perform transforms in world coords.
  vec3 world_position = object * vec3(position.xy, 1);
  world_position.x = vx * t + world_position.x;
  world_position.y = g * t * t + vy * t + world_position.y;

  textureCoordsOut = textureCoords;
  vec3 homogeneous = view * world_position;
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}


varying lowp vec4 destcolor;

void main(void)
{
    gl_FragColor = destcolor;
}

varying mediump vec2 textureCoordOut;
uniform sampler2D sampler;

void main(void)
{
    gl_FragColor = texture2D(sampler, textureCoordOut);
}
varying INK_MAX_FRAGMENT_FLOAT_PRECISION vec2 textureCoordOut;
varying lowp vec4 destcolor;

uniform sampler2D sampler;

void main(void)
{
    gl_FragColor = destcolor * texture2D(sampler, textureCoordOut);
}


uniform sampler2D sampler;

varying highp vec2 textureCoordOut;
varying mediump vec4 destcolor; // non-premultiplied

void main()
{
  mediump float new_a = texture2D(sampler, textureCoordOut).a * destcolor.a;
  gl_FragColor = vec4(destcolor.xyz * new_a, new_a);
}


attribute vec2 position;
attribute vec4 sourcecolor;
varying vec4 destcolor;

uniform mat3 view;
uniform mat3 object;

void main(void) {
  destcolor = sourcecolor;
  vec3 homogeneous = view * object * vec3(position, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}
attribute vec2 position;

varying vec2 textureCoordOut;

uniform mat3 view;
uniform mat3 object;
uniform mat3 objToUV;

// convert position coords to tex coords based on objToUV
void main(void) {
  vec3 homogeneous = view * object * vec3(position, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);

  highp vec3 uvPos = objToUV * vec3(position, 1);
  textureCoordOut = uvPos.xy / uvPos.z;
}

attribute vec2 position;
attribute vec2 textureCoords;
attribute vec4 sourcecolor;

varying vec2 textureCoordOut;
varying vec4 destcolor;

uniform mat3 view;
uniform mat3 object;

void main(void) {
  vec3 homogeneous = view * object * vec3(position, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
  textureCoordOut = textureCoords;
  destcolor = sourcecolor;
}
uniform mat3 proj;

attribute vec2 position;
attribute vec2 textureCoords;
attribute vec4 sourcecolor;

varying vec2 textureCoordOut;
varying vec4 destcolor;

void main(void) {
  textureCoordOut = textureCoords;
  destcolor = sourcecolor;
  vec3 homogeneous = proj * vec3(position, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}
attribute float pkdata;  // Expected format is x12y12, packed into the mantissa.
                         // See util/funcs/float_pack.h.
varying vec4 destcolor;

uniform mat3 view;
uniform mat3 object;
uniform lowp vec4 sourcecolor;

// TODO(b/132970645): De-duplicate this
vec2 UnpackPosition(float pkd) {
  highp   pos;
  pos.x = floor(fract(pkd) * 4096.);
  pos.y = floor(fract(pkd * 4096.) * 4096.);
  return pos;
}

void main(void) {
  destcolor = sourcecolor;
  highp vec3 pos = vec3(UnpackPosition(pkdata), 1);
  vec3 homogeneous = view * object * pos;
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}

attribute float pkdata;  // Expected format is x12y12, packed into the mantissa.
                         // See util/funcs/float_pack.h.
varying vec2 textureCoordOut;

uniform mat3 view;
uniform mat3 object;

uniform mat3 objToUV;

// TODO(b/132970645): De-duplicate this
vec2 UnpackPosition(float pkd) {
  highp vec2 pos;
  pos.x = floor(fract(pkd) * 4096.);
  pos.y = floor(fract(pkd * 4096.) * 4096.);
  return pos;
}

void main(void) {
  highp vec3 pos = vec3(UnpackPosition(pkdata), 1);
  vec3 homogeneous = view * object * pos;
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);

  highp vec3 uvPos = objToUV * pos;
  textureCoordOut = uvPos.xy / uvPos.z;
}

attribute vec2 pkdata;  // Expected format is x12y12 and r6g6b6a6, packed into
                        // the mantissas of the x- and y-components.
                        // See util/funcs/float_pack.h.
varying vec4 destcolor;
uniform mat3 view;
uniform mat3 object;

// TODO(b/132970645): De-duplicate these
vec2 UnpackPosition(float pkd) {
  highp vec2 pos;
  pos.x = floor(fract(pkd) * 4096.);
  pos.y = floor(fract(pkd * 4096.) * 4096.);
  return pos;
}

vec4 UnpackColor(float pkd) {
  highp vec4 color;
  color.r = floor(fract(pkd) * 64.) / 63.;
  color.g = floor(fract(pkd * 64.) * 64.) / 63.;
  color.b = floor(fract(pkd * 4096.) * 64.) / 63.;
  color.a = floor(fract(pkd * 262144.) * 64.) / 63.;
  return color;
}

void main(void) {
  destcolor = UnpackColor(pkdata.y);
  highp vec3 pos = vec3(UnpackPosition(pkdata.x), 1);
  vec3 homogeneous = view * object * pos;
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}
attribute vec3 pkdata;  // Expected format is x12y12, r6g6b6a6, and u12v12,
                        // packed into the mantissas of the x-, y-, and
                        // z-components.
                        // See util/funcs/float_pack.h.
varying vec4 destcolor;
varying vec2 textureCoordOut;

uniform mat3 view;
uniform mat3 object;
uniform mat3 packed_uv_to_uv;

// TODO(b/132970645): De-duplicate these
vec2 UnpackPosition(float pkd) {
  highp vec2 pos;
  pos.x = floor(fract(pkd) * 4096.);
  pos.y = floor(fract(pkd * 4096.) * 4096.);
  return pos;
}

vec4 UnpackColor(float pkd) {
  highp vec4 color;
  color.r = floor(fract(pkd) * 64.) / 63.;
  color.g = floor(fract(pkd * 64.) * 64.) / 63.;
  color.b = floor(fract(pkd * 4096.) * 64.) / 63.;
  color.a = floor(fract(pkd * 262144.) * 64.) / 63.;
  return color;
}

void main(void) {
  highp vec3 pos = vec3(UnpackPosition(pkdata.x), 1);
  vec3 homogeneous = view * object * pos;
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);

  highp vec3 homogeneous_uv =
      packed_uv_to_uv * vec3(UnpackPosition(pkdata.z), 1);
  textureCoordOut = homogeneous_uv.xy / homogeneous_uv.z;

  destcolor = UnpackColor(pkdata.y);
}

attribute vec2 pkdata;  // Expected format is x32y32, using the values as-is.
varying vec4 destcolor;

uniform vec4 sourcecolor;
uniform mat3 view;
uniform mat3 object;

void main(void) {
  destcolor = sourcecolor;
  highp vec3 pos = vec3(pkdata, 1);
  vec3 homogeneous = view * object * pos;
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}

// test

varying mediump vec2 textureCoordOut;
uniform sampler2D sampler;

void main(void)
{
  gl_FragColor = texture2D(sampler, textureCoordOut);
}
attribute vec2 position;
attribute vec2 textureCoord;

varying vec2 textureCoordOut;
uniform mat3 view;

void main(void) {
  textureCoordOut = textureCoord;
  vec3 homogeneous = view * vec3(position, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}
varying mediump vec2 textureCoordOut;
uniform sampler2D sampler;

void main(void)
{
  lowp vec4 c = texture2D(sampler, textureCoordOut);
  lowp float l = smoothstep(0.0, 1.0, dot(c.rgb, vec3(0.3, 0.6, 0.1)));
  gl_FragColor = vec4(l, l, l, 1.0);
}

varying mediump vec2 texCoordFromOut;
varying mediump vec2 texCoordToOut;
uniform sampler2D sampler;

void main(void)
{
    lowp vec4 c1 = texture2D(sampler, mix(texCoordFromOut, texCoordToOut, 0.5)) * 0.05;
    lowp vec4 c2 = texture2D(sampler, mix(texCoordFromOut, texCoordToOut, 0.6)) * 0.1;
    lowp vec4 c3 = texture2D(sampler, mix(texCoordFromOut, texCoordToOut, 0.7)) * 0.15;
    lowp vec4 c4 = texture2D(sampler, mix(texCoordFromOut, texCoordToOut, 0.8)) * 0.15;
    lowp vec4 c5 = texture2D(sampler, mix(texCoordFromOut, texCoordToOut, 0.9)) * 0.2;
    lowp vec4 c6 = texture2D(sampler, texCoordToOut) * 0.35;

    gl_FragColor = (c1 + c2 + c3 + c4 + c5 + c6);
}



attribute vec2 position;
attribute vec2 texCoordFrom;
attribute vec2 texCoordTo;

varying vec2 texCoordFromOut;
varying vec2 texCoordToOut;

uniform mat3 view;

void main(void) {
  texCoordFromOut = texCoordFrom;
  texCoordToOut = texCoordTo;
  vec3 homogeneous = view * vec3(position, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}

varying mediump vec2 textureCoordOut;
uniform sampler2D sampler;
void main(void)
{
  mediump float d = max(distance(textureCoordOut.x, 0.5), distance(textureCoordOut.y, 0.5));
  mediump float vignette = smoothstep(0.7, 0.25, d);

  lowp vec4 c = texture2D(sampler, textureCoordOut) + vec4(0.2, 0.07, 0.02, 0.0);
  gl_FragColor = vec4(clamp(vignette * c.rgb, 0.0, 1.0), 1.0);
}


varying mediump vec2 textureCoordOut;
varying lowp vec4 colorFilterOut;
uniform sampler2D sampler;

void main(void)
{
    gl_FragColor = texture2D(sampler, textureCoordOut);
    gl_FragColor = gl_FragColor * colorFilterOut;
}



attribute vec2 position;
attribute vec2 textureCoord;
attribute vec4 colorFilter;

varying vec2 textureCoordOut;
varying vec4 colorFilterOut;
uniform mat3 view;

void main(void) {
  textureCoordOut = textureCoord;
  colorFilterOut = colorFilter;
  vec3 homogeneous = view * vec3(position, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}



varying mediump vec2 textureCoordOut;
varying lowp vec4 colorFilterOut;
uniform sampler2D sampler;

void main(void)
{
    gl_FragColor = texture2D(sampler, textureCoordOut);
    if (gl_FragColor.w > 0.0) {
        gl_FragColor = colorFilterOut;
    }
}


attribute vec2 position;
attribute vec2 textureCoord;
attribute vec4 colorFilter;

varying vec2 textureCoordOut;
varying vec4 colorFilterOut;
uniform mat3 view;

void main(void) {
  textureCoordOut = textureCoord;
  colorFilterOut = colorFilter;
  vec3 homogeneous = view * vec3(position, 1);
  gl_Position = vec4(homogeneous.xy / homogeneous.z, 0, 1);
}

varying mediump vec2 textureCoordOut;
uniform sampler2D sampler;
void main(void)
{
  lowp vec4 c = texture2D(sampler, textureCoordOut);
  lowp float r = -0.6*pow(c.r,3.0) + 0.565*pow(c.r,2.0) + 1.07*c.r - 0.054;
  lowp float g = -0.132*pow(c.g,3.0) - 0.325*pow(c.g,2.0) + 1.516*c.g - 0.071;
  lowp float b = 0.62*pow(c.b,3.0) - 1.257*pow(c.b,2.0) + 1.623*c.b + 0.015;
  gl_FragColor = vec4(r, g, b, 1.0);
}

varying mediump vec2 textureCoordOut;
uniform sampler2D sampler;
const mediump mat3 night_mat = mat3(.39,.77,.18, .35,.67,.17, .27,.53,.13);
void main(void)
{
  lowp vec3 c = night_mat * texture2D(sampler, textureCoordOut).rgb;
  mediump float d = length(textureCoordOut - vec2(0.5));
  mediump float vig = smoothstep(0.6, 0.4, d);
  gl_FragColor = vec4(vig * c, 1.0);
}

varying mediump vec2 textureCoordOut;
uniform sampler2D sampler;
void main(void)
{
  lowp vec4 c = texture2D(sampler, textureCoordOut);
  lowp vec4 reduc = clamp(vec4(0.25, 0.25, 0.25, 1.0) - c, 0.0, 1.0);
  gl_FragColor = smoothstep(-0.15, 1.05, c) - reduc;
}

varying mediump vec2 textureCoordOut;
uniform sampler2D sampler;
const mediump mat3 sepia_mat = mat3(.39,.35,.27, .77,.67,.53, .18,.17,.13);
void main(void)
{
  lowp vec3 c = sepia_mat * texture2D(sampler, textureCoordOut).rgb;
  mediump float d = length(textureCoordOut - vec2(0.5));
  mediump float vig = smoothstep(0.8, 0.2, d);
  gl_FragColor = vec4(vig * c, 1.0);
}
