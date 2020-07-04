precision mediump float;

varying vec3 _col;

void main() {
	gl_FragColor = vec4(_col, 1.0);
}
