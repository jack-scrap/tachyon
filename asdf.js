const axes = 3;

function calcNorm(vtc, i) {
	let
		startA = i * axes,
		startB = (i + 1) * axes,
		startC = (i + 2) * axes;

	let
		a = [
			vtc[startA],
			vtc[startA + 1],
			vtc[startA + 2]
		],
		b = [
			vtc[startB],
			vtc[startB + 1],
			vtc[startB + 2]
		],
		c = [
			vtc[startC],
			vtc[startC + 1],
			vtc[startC + 2]
		],

		v = [
			[
				b[0] - a[0],
				b[1] - a[1],
				b[2] - a[2]
			], [
				c[0] - a[0],
				c[1] - a[1],
				c[2] - a[2]
			],
		],

		vTmp = [
			vec3.fromValues(v[0][0], v[0][1], v[0][2]),
			vec3.fromValues(v[1][0], v[1][1], v[1][2])
		],

		prod = vec3.create();
	vec3.cross(prod, vtmp[0], vtmp[1]);

	vec3.normalize(prod, prod);


	// have traversed 9 numbers in total. Because it is multipled by 3 (the number of axis), though, the index passed in just needs to be upped by 3
}

const
	cnt = 7,
	triVtc = 3;
for (let t = 0; t < cnt * triVtc; t += triVtc) {
}
