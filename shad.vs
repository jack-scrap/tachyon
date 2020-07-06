precision mediump float;

attribute vec3
	pos,
	norm;

uniform mat4
	model,
	view,
	proj;

varying vec3
	_posFrag,
	_norm;

void main() {
	gl_Position = proj * view * model * vec4(pos, 1.0);

	_posFrag = gl_Position.xyz;
	_norm = normalize(norm);
}
