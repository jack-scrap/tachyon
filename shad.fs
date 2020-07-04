precision mediump float;

varying vec3
	_pos,
	_norm;

void main() {
	gl_FragColor = vec4(_norm, 1.0);
}
