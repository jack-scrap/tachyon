precision mediump float;

attribute vec3
	pos,
	col;

uniform mat4
	model,
	view,
	proj;

varying vec3 _col;

void main() {
	gl_Position = proj * view * model * vec4(pos, 1.0);

	_col = col;
}
