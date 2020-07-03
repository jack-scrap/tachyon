attribute vec3 pos;

uniform mat4
	model,
	view,
	proj;

void main() {
  gl_Position = model * view * proj * vec4(pos, 1.0);
}
