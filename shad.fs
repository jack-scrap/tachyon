precision mediump float;

varying vec3
	_pos,
	_posFrag,
	_norm;

vec3 lightPos = vec3(3, 3, 3);

void main() {
	vec3 norm = normalize(_norm);
	vec3 lightDir = normalize(lightPos - _posFrag);

	vec3
		lightColor = vec3(1.0),
		objectColor = vec3(1.0, 0.0, 0.0);
	float diff = max(dot(norm, lightDir), 0.0);
	vec3 diffuse = diff * lightColor;

	vec3 result = diffuse * objectColor;

	gl_FragColor = vec4(result, 1.0);
}
