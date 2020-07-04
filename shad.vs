precision mediump float;

attribute vec3 pos;
attribute vec3 col;

varying vec3 _col;

uniform mat4
	model,
	view,
	proj;

void main() {
	gl_Position = proj * view * model * vec4(pos, 1.0);

	_col = col;
}
