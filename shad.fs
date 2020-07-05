precision mediump float;

varying vec3
	_pos,
	_posFrag,
	_norm;

vec3
	lightPos = vec3(3, 3, 3),
	lightColor = vec3(1.0),
	objectColor = vec3(1.0);

void main() {
	vec3 lightDir = normalize(lightPos - _posFrag);

	float diff = max(dot(_norm, lightDir), 0.0);
	vec3 diffuse = diff * lightColor;

	vec3 result = diffuse * objectColor;

	gl_FragColor = vec4(result, 1.0);
}
