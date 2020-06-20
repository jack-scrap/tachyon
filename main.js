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
	const vtc = [
		0.0, 0.5,
		-0.5, -0.5,
		0.5, -0.5
	];

	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	// index
	const idc = [
		0, 1, 2
	];

	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), gl.STATIC_DRAW);

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

	// attribute
	var attrPos = gl.getAttribLocation(prog, 'pos');
	gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrPos);

	// draw
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(prog);
	gl.drawElements(gl.TRIANGLES, idc.length, gl.UNSIGNED_BYTE, 0);
});
