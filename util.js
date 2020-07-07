class Util {
	static rd(name) {
		var req = new XMLHttpRequest();
		req.open('GET', name, false);
		req.send(null);

		if (req.status == 200) {
			return req.responseText;
		}
	}
};

class Calc {
	static norm(vtc, i) {
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
};

class Ld {
	static vtc(name) {
		let data = [];
		for (let l of Util.rd(name + '.obj').split('\n')) {
			let tok = [];
			for (let _ of l.split(' ')) {
				tok.push(_);
			}

			if (tok[0] == 'v') {
				let vtc = tok;
				vtc.shift();

				for (let i = 0; i < 3; i++) {
					data.push(vtc[i]);
				}
			}
		}

		return data;
	}

	static idc(name, type) {
		let data = [];
		for (let l of Util.rd(name + '.obj').split('\n')) {
			let tok = [];
			for (let _ of l.split(' ')) {
				tok.push(_);
			}

			if (tok[0] == 'f') {
				let idc = tok;
				idc.shift();

				for (let i = 0; i < 3; i++) {
					let idx = idc[i].split('/');

					data.push(idx[type] - 1);
				}
			}
		}

		return data;
	}

	static norm(name) {
		let data = [];
		for (let l of Util.rd(name + '.obj').split('\n')) {
			let tok = [];
			for (let _ of l.split(' ')) {
				tok.push(_);
			}

			if (tok[0] == 'vn') {
				let norm = tok;
				norm.shift();

				for (let i = 0; i < 3; i++) {
					data.push(norm[i] - 1);
				}
			}
		}

		return data;
	}
};
