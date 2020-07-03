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
	var
	canvas = document.getElementById('disp');
	gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('Initialization error: WebGL not supported; falling back on experimental');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Initialization error: WebGL not supportd in browser');
	}

	// data
	var vtc = [
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0, 
		-1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,
		-1.0, -1.0, -1.0, 
		-1.0, 1.0, -1.0,

		1.0, -1.0, 1.0, 
		-1.0, -1.0, -1.0, 
		1.0, -1.0, -1.0, 
		1.0, 1.0, -1.0, 
		1.0, -1.0, -1.0, 
		-1.0, -1.0, -1.0, 

		-1.0, -1.0, -1.0, 
		-1.0, 1.0, 1.0, 
		-1.0, 1.0, -1.0, 
		1.0, -1.0, 1.0, 
		-1.0, -1.0, 1.0, 
		-1.0, -1.0, -1.0, 

		-1.0, 1.0, 1.0, 
		-1.0, -1.0, 1.0, 
		1.0, -1.0, 1.0, 
		1.0, 1.0, 1.0, 
		1.0, -1.0, -1.0, 
		1.0, 1.0, -1.0, 

		1.0, -1.0, -1.0, 
		1.0, 1.0, 1.0, 
		1.0, -1.0, 1.0, 
		1.0, 1.0, 1.0, 
		1.0, 1.0, -1.0, 
		-1.0, 1.0, -1.0, 

		1.0, 1.0, 1.0, 
		-1.0, 1.0, -1.0, 
		-1.0, 1.0, 1.0, 
		1.0, 1.0, 1.0, 
		-1.0, 1.0, 1.0, 
		1.0, -1.0, 1.0
	];

	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	// shader
	const
		shadVtxTxt = rd("shad.vs"),
		shadFragTxt = rd("shad.fs");

	var shadVtx = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(shadVtx, shadVtxTxt);

	var shadFrag = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(shadFrag, shadFragTxt);

	gl.compileShader(shadVtx);
	if (!gl.getShaderParameter(shadVtx, gl.COMPILE_STATUS)) {
		console.error('Vertex error: ', gl.getShaderInfoLog(shadVtx));
	}

	gl.compileShader(shadFrag);
	if (!gl.getShaderParameter(shadFrag, gl.COMPILE_STATUS)) {
		console.error('Fragment error: ', gl.getShaderInfoLog(shadFrag));
	}

	/// program
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

	// matrix
	var model = new Float32Array(16);
	mat4.identity(model);

	var matrRot = new Float32Array(16);
	mat4.identity(matrRot);

	var view = new Float32Array(16);
	mat4.identity(view);
	mat4.lookAt(
		view,
		[
			-2, 0, 0
		], [
			0, 0, 0
		], [
			0, 1, 0
		]
	);

	var proj = new Float32Array(16);
	mat4.identity(proj);
	mat4.perspective(proj, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	// attribute
	var attrPos = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrPos);

	// uniform
	var
		uniModel = gl.getUniformLocation(prog, 'model'),
		uniView = gl.getUniformLocation(prog, 'view'),
		uniProj = gl.getUniformLocation(prog, 'proj');

	// draw
	var i = 0;
	var loop = function() {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		mat4.rotate(model, matrRot, (i * Math.PI) / 100, [0, 1, 0]);

		gl.useProgram(prog);

		gl.uniformMatrix4fv(uniModel, gl.FALSE, model);
		gl.uniformMatrix4fv(uniView, gl.FALSE, view);
		gl.uniformMatrix4fv(uniProj, gl.FALSE, proj);
		gl.drawArrays(gl.TRIANGLES, 0, vtc.length / 3);

		requestAnimationFrame(loop);

		i++;
	};
	requestAnimationFrame(loop);
});
