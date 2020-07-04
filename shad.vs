precision mediump float;

attribute vec3 pos;

uniform mat4
	model,
	view,
	proj;

varying vec3 _pos;

void main() {
	gl_Position = proj * view * model * vec4(pos, 1.0);

	_pos = pos;
}
