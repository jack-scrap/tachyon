const
	axes = 3,
	triVtc = 3;

function rd(name) {
	var req = new XMLHttpRequest();
	req.open('GET', name, false);
	req.send(null);

	if (req.status == 200) {
		return req.responseText;
	}
}

function calcNorm(vtc, i) {
	let
		startA = i * axes,
		startB = (i + 1) * axes,
		startC = (i + 2) * axes;

	let
		a = vec3.fromValues(vtc[startA], vtc[startA + 1], vtc[startA + 2]),
		b = vec3.fromValues(vtc[startB], vtc[startB + 1], vtc[startB + 2]),
		c = vec3.fromValues(vtc[startC], vtc[startC + 1], vtc[startC + 2]);

	let v = [
		vec3.create(),
		vec3.create()
	];
	vec3.sub(v[0], b, a);
	vec3.sub(v[1], c, a);

	let prod = vec3.create();
	vec3.cross(prod, v[0], v[1]);

	vec3.normalize(prod, prod);

	return prod;
}

function rdVtc(name) {
	let data = [];

	for (let l of rd(name + ".obj").split("\n")) {
		let tok = [];
		for (let _ of l.split(" ")) {
			tok.push(_);
		}

		if (tok[0] == "v") {
			let vtc = tok;
			vtc.shift();

			for (let i = 0; i < 3; i++) {
				data.push(vtc[i]);
			}
		}
	}

	return data;
}

function rdIdc(name) {
	let data = [];

	for (let l of rd(name + ".obj").split("\n")) {
		let tok = [];
		for (let _ of l.split(" ")) {
			tok.push(_);
		}

		if (tok[0] == "f") {
			let idc = tok;
			idc.shift();

			for (let i = 0; i < 3; i++) {
				data.push(idc[i] - 1);
			}
		}
	}

	return data;
}

document.addEventListener("DOMContentLoaded", function() {
	// alert(rdIdc("asdf"));

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

	const vtc = rdVtc("asdf");
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	// indices
	const ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	const idc = rdIdc("asdf");
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), gl.STATIC_DRAW);

	// position
	const attrLoc = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(attrLoc, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrLoc);

	// normal
	const nbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nbo);

	let
		cnt = vtc.length / (3 * 3),
		norm = [];
	for (let t = 0; t < cnt * triVtc; t += triVtc) {
		let tmp = calcNorm(vtc, t);

		for (let _ = 0; _ < 3; _++) {
			norm.push(tmp[0]);
			norm.push(tmp[1]);
			norm.push(tmp[2]);
		}
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);

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

		gl.drawElements(gl.TRIANGLES, idc.length, gl.UNSIGNED_BYTE, 0);

		i += 0.01;

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
});
