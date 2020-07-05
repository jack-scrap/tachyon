precision mediump float;

varying vec3
	_pos,
	_posFrag,
	_norm;

vec3
	lightPos = vec3(3.0, 3.0, 3.0),
	lightColor = vec3(1.0),
	objectColor = vec3(1.0);

void main() {
	vec3 lightDir = normalize(lightPos - _posFrag);

	float diff = max(dot(_norm, lightDir), 0.1);

	vec3 result = (diff * lightColor) * objectColor;

	gl_FragColor = vec4(result, 1.0);
}
