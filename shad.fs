precision mediump float;

varying vec3 _pos;
varying vec3 _norm;

void main() {
	gl_FragColor = vec4(_pos, 1.0);
}
