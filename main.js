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
	const canvas = document.getElementById('disp');
	var gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	// background
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);

	// shader
	const
		shadVtxTxt = rd("shad.vs"),
		shadFragTxt = rd("shad.fs");

	const shadVtx = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(shadVtx, shadVtxTxt);

	const shadFrag = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(shadFrag, shadFragTxt);

	gl.compileShader(shadVtx);
	if (!gl.getShaderParameter(shadVtx, gl.COMPILE_STATUS)
	) {
		console.error('Error compiling vertex shader', gl.getShaderInfoLog(shadVtx));
	}

	gl.compileShader(shadFrag);
	if (!gl.getShaderParameter(shadFrag, gl.COMPILE_STATUS)
	) {
		console.error('Error compiling fragment shader', gl.getShaderInfoLog(shadFrag));
	}

	// program
	const prog = gl.createProgram();

	// shader
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

	// VBO
	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	const vtc = [
		-1.0, 1.0, -1.0, 0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0, 0.5, 0.5, 0.5,
		1.0, 1.0, 1.0, 0.5, 0.5, 0.5,
		1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

		-1.0, 1.0, 1.0, 0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0, 0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0, 0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0, 0.75, 0.25, 0.5,

		1.0, 1.0, 1.0, 0.25, 0.25, 0.75,
		1.0, -1.0, 1.0, 0.25, 0.25, 0.75,
		1.0, -1.0, -1.0, 0.25, 0.25, 0.75,
		1.0, 1.0, -1.0, 0.25, 0.25, 0.75,

		1.0, 1.0, 1.0, 1.0, 0.0, 0.15,
		1.0, -1.0, 1.0, 1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0, 1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0, 1.0, 0.0, 0.15,

		1.0, 1.0, -1.0, 0.0, 1.0, 0.15,
		1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0, 0.0, 1.0, 0.15,

		-1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
		1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
		1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	// position
	const attrLoc = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(attrLoc, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrLoc);

	// color
	const attrCol = gl.getAttribLocation(prog, 'col');
	gl.vertexAttribPointer(attrCol, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
	gl.enableVertexAttribArray(attrCol);

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

	gl.useProgram(prog);

	// matrix
	const
		matrModel = new Float32Array(16),
		view = new Float32Array(16),
		proj = new Float32Array(16);

	mat4.identity(matrModel);
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
	mat4.perspective(proj, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	const rot = new Float32Array(16);

	const id = new Float32Array(16);
	mat4.identity(id);

	// uniform
	const
		uniModel = gl.getUniformLocation(prog, 'model'),
		uniView = gl.getUniformLocation(prog, 'view'),
		uniProj = gl.getUniformLocation(prog, 'proj');

	gl.uniformMatrix4fv(uniModel, gl.FALSE, matrModel);
	gl.uniformMatrix4fv(uniView, gl.FALSE, view);
	gl.uniformMatrix4fv(uniProj, gl.FALSE, proj);

	var i = 0;
	function loop() {
		mat4.rotate(rot, id, i, [0, 1, 0]);
		mat4.mul(matrModel, rot, id);
		gl.uniformMatrix4fv(uniModel, gl.FALSE, matrModel);

		gl.clearColor(0, 0, 0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.drawElements(gl.TRIANGLES, idc.length, gl.UNSIGNED_SHORT, 0);

		i += 0.01;

		requestAnimationFrame(loop);
	};

	requestAnimationFrame(loop);
});
