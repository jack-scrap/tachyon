document.addEventListener("DOMContentLoaded", function() {
	const shadVtxText = [
		"precision mediump float;",
		"",
		"attribute vec3 vertPosition;",
		"attribute vec3 vertColor;",
		"varying vec3 fragColor;",
		"",
		"uniform mat4 mWorld;",
		"uniform mat4 mView;",
		"uniform mat4 mProj;",
		"",
		"void main() {",
		"  fragColor = vertColor;",
		"  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
		"}"
	].join("\n");

			shadFragTxt = [
		"precision mediump float;",
		"",
		"varying vec3 fragColor;",
		"void main() {",
		"  gl_FragColor = vec4(fragColor, 1.0);",
		"}"
	].join("\n");

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
	gl.enable(gl.CULL_FACE);

	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// shader
	const shadVtx = gl.createShader(gl.VERTEX_SHADER),
				shadFrag = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(shadVtx, shadVtxText);
	gl.shaderSource(shadFrag, shadFragTxt);

	gl.compileShader(shadVtx);
	if (!gl.getShaderParameter(
		shadVtx,
		gl.COMPILE_STATUS)
	) {
		console.error('Error compiling vertex shader', gl.getShaderInfoLog(shadVtx));
	}

	gl.compileShader(shadFrag);
	if (!gl.getShaderParameter(
		shadFrag,
		gl.COMPILE_STATUS)
	) {
		console.error('Error compiling fragment shader', gl.getShaderInfoLog(shadFrag));
	}

	// program
	const prog = gl.createProgram();

	gl.attachShader(
		prog,
		shadVtx
	);
	gl.attachShader(
		prog,
		shadFrag
	);

	gl.linkProgram(prog);
	if (!gl.getProgramParameter(
		prog,
		gl.LINK_STATUS
	)) {
		console.error('Error linking program', gl.getProgramInfoLog(prog));
	}

	gl.validateProgram(prog);
	if (!gl.getProgramParameter(
		prog,
		gl.VALIDATE_STATUS
	)) {
		console.error('Error validating program', gl.getProgramInfoLog(prog));
	}

	// vertex
	const boxVtx = [
		// X, Y, Z         R, G, B
		// top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];

	const boxIdc = [
		// top
		0, 1, 2,
		0, 2, 3,

		// left
		5, 4, 6,
		6, 4, 7,

		// right
		8, 9, 10,
		8, 10, 11,

		// front
		13, 12, 14,
		15, 14, 12,

		// back
		16, 17, 18,
		16, 18, 19,

		// bottom
		21, 20, 22,
		22, 20, 23
	];

	// buffer
	// vertex
	const vtxBuff = gl.createBuffer();
	gl.bindBuffer(
		gl.ARRAY_BUFFER,
		vtxBuff
	);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(boxVtx),
		gl.STATIC_DRAW
	);

	// indices
	const idcBuff = gl.createBuffer();
	gl.bindBuffer(
		gl.ELEMENT_ARRAY_BUFFER,
		idcBuff
	);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(boxIdc),
		gl.STATIC_DRAW
	);

	const posAttrLoc = gl.getAttribLocation(prog, 'vertPosition'),
				colAttrLoc = gl.getAttribLocation(prog, 'vertColor');
	gl.vertexAttribPointer(
		posAttrLoc, // attribute location
		3, // number of elements per attribute
		gl.FLOAT, // type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
		0 // offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colAttrLoc, // attribute location
		3, // number of elements per attribute
		gl.FLOAT, // type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(posAttrLoc);
	gl.enableVertexAttribArray(colAttrLoc);

	gl.useProgram(prog);

	const matWorldUniLoc = gl.getUniformLocation(prog, 'mWorld'),
				matViewUniLoc = gl.getUniformLocation(prog, 'mView'),
				matProjUniLoc = gl.getUniformLocation(prog, 'mProj'),

				worldMatrix = new Float32Array(16),
				viewMatrix = new Float32Array(16),
				projMatrix = new Float32Array(16);

	mat4.identity(worldMatrix);
	mat4.lookAt(
		viewMatrix,
		[
			0, 0, -8
		],
		[
			0, 0, 0
		],
		[
			0, 1, 0
		]
	);
	mat4.perspective(
		projMatrix,
		glMatrix.toRadian(45),
		canvas.clientWidth / canvas.clientHeight,
		0.1,
		1000.0
	);

	gl.uniformMatrix4fv(
		matWorldUniLoc,
		gl.FALSE,
		worldMatrix
	);
	gl.uniformMatrix4fv(
		matViewUniLoc,
		gl.FALSE,
		viewMatrix
	);
	gl.uniformMatrix4fv(
		matProjUniLoc,
		gl.FALSE,
		projMatrix
	);

	const xRotMatrix = new Float32Array(16),
				yRotMatrix = new Float32Array(16);

	const idMatrix = new Float32Array(16);
	mat4.identity(idMatrix);

	var angle = 0;
	function loop() {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(
			yRotMatrix,
			idMatrix,
			angle,
			[0, 1, 0]
		);
		mat4.rotate(
			xRotMatrix,
			idMatrix,
			angle / 4,
			[1, 0, 0]
		);
		mat4.mul(
			worldMatrix,
			yRotMatrix,
			xRotMatrix
		);
		gl.uniformMatrix4fv(
			matWorldUniLoc,
			gl.FALSE,
			worldMatrix
		);

		gl.clearColor(
			0,
			0,
			0,
			1.0
		);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(
			gl.TRIANGLES,
			boxIdc.length,
			gl.UNSIGNED_SHORT,
			0
		);

		requestAnimationFrame(loop);
	};

	requestAnimationFrame(loop);
});
