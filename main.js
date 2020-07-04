function rd(name) {
	var req = new XMLHttpRequest();
	req.open('GET', name, false);
	req.send(null);

	if (req.status == 200) {
		return req.responseText;
	}
}

document.addEventListener("DOMContentLoaded", function() {
	// initialize
	const canv = document.getElementById('disp');
	var gl = canv.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canv.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.enable(gl.DEPTH_TEST);

	// shader
	const
		shadVtxTxt = rd("shad.vs"),
		shadFragTxt = rd("shad.fs");

	// vertex
	const shadVtx = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(shadVtx, shadVtxTxt);

	gl.compileShader(shadVtx);
	if (!gl.getShaderParameter(shadVtx, gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader', gl.getShaderInfoLog(shadVtx));
	}

	// fragment
	const shadFrag = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(shadFrag, shadFragTxt);

	gl.compileShader(shadFrag);
	if (!gl.getShaderParameter(shadFrag, gl.COMPILE_STATUS)) {
		console.error('Error compiling fragment shader', gl.getShaderInfoLog(shadFrag));
	}

	// program
	const prog = gl.createProgram();

	gl.attachShader(prog, shadVtx);
	gl.attachShader(prog, shadFrag);

	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		console.error('Error linking program', gl.getProgramInfoLog(prog));
	}

	gl.validateProgram(prog);
	if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
		console.error('Error validating program', gl.getProgramInfoLog(prog));
	}

	gl.useProgram(prog);

	// VBO
	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	const vtc = [
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		-1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0,
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,

		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,

		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,

		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,

		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, -1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	// position
	const attrLoc = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(attrLoc, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrLoc);

	// indices
	const ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	const idc = [
		0, 1, 2,
		0, 2, 3,

		5, 4, 6,
		6, 4, 7,

		8, 9, 10,
		8, 10, 11,

		13, 12, 14,
		15, 14, 12,

		16, 17, 18,
		16, 18, 19,

		21, 20, 22,
		22, 20, 23
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idc), gl.STATIC_DRAW);

	// normal
	const nbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nbo);

	var norm = [];
	for (let i = 0; i < 3; i += 3) {
		let start = idc[i];

		// get indices of points
		let
			idxA = start * 3,
			idxB = (start + 1) * 3,
			idxC = (start + 2) * 3;

		// get points
		let
			a = [
				vtc[idxA],
				vtc[idxA + 1],
				vtc[idxA + 2]
			],
			b = [
				vtc[idxB],
				vtc[idxB + 1],
				vtc[idxB + 2]
			],
			c = [
				vtc[idxC],
				vtc[idxC + 1],
				vtc[idxC + 2]
			];

		// calculate
		let edge0 = vec3.create();
		vec3.sub(edge0, b, c);

		let edge1 = vec3.create();
		vec3.sub(edge1, b, a);

		let prod = vec3.create();
		vec3.cross(prod, edge0, edge1);

		norm.push(prod[0]);
		norm.push(prod[1]);
		norm.push(prod[2]);
	}
	gl.enableVertexAttribArray(nbo);

	// matrix
	const
		model = new Float32Array(16),
		view = new Float32Array(16),
		proj = new Float32Array(16);

	mat4.identity(model);
	mat4.lookAt(
		view,
		[
			0, 5, -5
		], [
			0, 0, 0
		], [
			0, 1, 0
		]
	);
	mat4.perspective(proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

	const
		id = new Float32Array(16),
		rot = new Float32Array(16);

	mat4.identity(id);

	// uniform
	const
		uniModel = gl.getUniformLocation(prog, 'model'),
		uniView = gl.getUniformLocation(prog, 'view'),
		uniProj = gl.getUniformLocation(prog, 'proj');

	gl.uniformMatrix4fv(uniModel, gl.FALSE, model);
	gl.uniformMatrix4fv(uniView, gl.FALSE, view);
	gl.uniformMatrix4fv(uniProj, gl.FALSE, proj);

	var i = 0;
	function draw() {
		gl.clearColor(0, 0, 0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		mat4.rotate(rot, id, i, [0, 1, 0]);
		mat4.mul(model, rot, id);
		gl.uniformMatrix4fv(uniModel, gl.FALSE, model);

		gl.drawElements(gl.TRIANGLES, idc.length, gl.UNSIGNED_SHORT, 0);

		i += 0.01;

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
