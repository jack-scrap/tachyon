precision mediump float;

attribute vec3 pos;
attribute vec3 col;
varying vec3 _col;

uniform mat4
	mWorld,
	mView,
	mProj;

void main() {
	_col = col;

	gl_Position = mProj * mView * mWorld * vec4(pos, 1.0);
}
