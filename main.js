const
	axes = 3,
	triVtc = 3,

	type = {
		VTX: 0,
		TEX: 1,
		NORM: 2
	};

document.addEventListener('DOMContentLoaded', function() {
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
		shadVtxTxt = Util.rd('shad.vs'),
		shadFragTxt = Util.rd('shad.fs');

	// vertex
	var shadVtx = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(shadVtx, shadVtxTxt);

	gl.compileShader(shadVtx);
	if (!gl.getShaderParameter(shadVtx, gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader', gl.getShaderInfoLog(shadVtx));
	}

	// fragment
	var shadFrag = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(shadFrag, shadFragTxt);

	gl.compileShader(shadFrag);
	if (!gl.getShaderParameter(shadFrag, gl.COMPILE_STATUS)) {
		console.error('Error compiling fragment shader', gl.getShaderInfoLog(shadFrag));
	}

	// program
	var prog = gl.createProgram();

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

	// position
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	var vtc = Ld.vtc('tachyon');
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	// indices
	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	var idc = Ld.idc('tachyon', type.VTX);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), gl.STATIC_DRAW);

	// position
	var attrPos = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrPos);

	// normal
	var nbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nbo);

	var
		idcNorm = Ld.idc('tachyon', type.NORM),

		norm = Ld.norm('tachyon'),
		idxedNorm = [];
	for (let i = 0; i < idcNorm.length; i++) {
		let v = idcNorm[i] * 3;

		for (let i = 0; i < 3; i++) {
			idxedNorm.push(norm[v + i]);
		}
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(idxedNorm), gl.STATIC_DRAW);

	var attrNorm = gl.getAttribLocation(prog, 'norm');
	gl.vertexAttribPointer(attrNorm, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrNorm);

	// matrix
	var
		model = new Float32Array(16),
		view = new Float32Array(16),
		proj = new Float32Array(16);

	mat4.identity(model);
	mat4.lookAt(
		view,
		[
			0, 15 / 3, -40 / 3
		], [
			0, 0, 0
		], [
			0, 1, 0
		]
	);
	mat4.perspective(proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

	var
		id = new Float32Array(16),
		rot = new Float32Array(16);

	mat4.identity(id);

	// uniform
	var
		uniModel = gl.getUniformLocation(prog, 'model'),
		uniView = gl.getUniformLocation(prog, 'view'),
		uniProj = gl.getUniformLocation(prog, 'proj');

	gl.uniformMatrix4fv(uniModel, gl.FALSE, model);
	gl.uniformMatrix4fv(uniView, gl.FALSE, view);
	gl.uniformMatrix4fv(uniProj, gl.FALSE, proj);

	let
		i = 1,
		tmp = 0;
	function draw() {
		gl.clearColor(0, 0, 0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		mat4.rotate(rot, id, i + tmp, [0, 1, 0]);
		mat4.mul(model, rot, id);
		gl.uniformMatrix4fv(uniModel, gl.FALSE, model);

		gl.drawElements(gl.TRIANGLES, idc.length, gl.UNSIGNED_BYTE, 0);

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);

	// drag
	let
		down = false,
		start,
		curr,
		d;
	document.addEventListener('mousedown', (e) => {
		down = true;

		start = e.clientX;
	});
	document.addEventListener('mouseup', (e) => {
		down = false;

		i += tmp;
		tmp = 0;
	});

	document.addEventListener('mousemove', (e) => {
		if (down) {
			curr = e.clientX;
			d = curr - start;
			tmp = d / 100;
		}
	});
});
