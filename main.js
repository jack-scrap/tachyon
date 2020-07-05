function rd(name) {
	var req = new XMLHttpRequest();
	req.open('GET', name, false);
	req.send(null);

	if (req.status == 200) {
		return req.responseText;
	}
}

function calcNorm(vtc) {
	for (let i = 0; i < 3; i += 3) {
		const stride = 3;

		let
			idxA = i * stride,
			idxB = (i + 1) * stride,
			idxC = (i + 2) * stride,

			a = [
				vtc[idxA],
				vtc[idxA + 1],
				vtc[idxA + 2],
			],
				b = [
				vtc[idxB],
				vtc[idxB + 1],
				vtc[idxB + 2],
			],
				c = [
				vtc[idxC],
				vtc[idxC + 1],
				vtc[idxC + 2],
			],

			v0 = [
				b[0] - a[0],
				b[1] - a[1],
				b[2] - a[2]
			],
			v1 = [
				c[0] - a[0],
				c[1] - a[1],
				c[2] - a[2]
			],

			v0tmp = vec3.fromValues(v0[0], v0[1], v0[2]),
			v1tmp = vec3.fromValues(v1[0], v1[1], v1[2]);

		prod = vec3.create();

		vec3.cross(prod, v0tmp, v1tmp);

		vec3.normalize(prod, prod);

		return prod;
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
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		-1.0, 1.0, -1.0,
		-1.0, -1.0, -1.0,

		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0,

		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,

		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,

		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,
		-1.0, -1.0, -1.0,

		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	// position
	const attrLoc = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(attrLoc, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrLoc);

	// normal
	const nbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nbo);

	var norm = [
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,

		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,

		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,

		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,

		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,

		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);

	calcNorm(vtc);

	// normal
	const attrNorm = gl.getAttribLocation(prog, 'norm');
	gl.vertexAttribPointer(attrNorm, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrNorm);

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

		gl.drawArrays(gl.TRIANGLES, 0, vtc.length / 3);

		i += 0.01;

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
