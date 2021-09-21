// Written by a generator written by enki, modified by Hamish Todd

class ComplexVector extends Float32Array {
	constructor(n) {
		if(n === undefined)
			console.error("need to know how many there are!")
		if(typeof n === 'number')
			super(n*2)
		else {
			//it's an array
			super(n.length)
			this.fromArray(n)
		}
	}

	fromArray(arr) {
		for(let i = 0; i < this.length; ++i) {
			this[i] = arr[i]
		}
	}

	re(index) {
		return this[index * 2 + 0]
	}

	im(index) {
		return this[index * 2 + 1]
	}

	setRe(index,val) {
		this[index * 2 + 0] = val
	}
	setIm(index,val) {
		this[index * 2 + 1] = val
	}

	multiplyOneEntry(input, ourIndex, inputIndex, target, targetIndex) {
		let a = this.re(ourIndex)
		let b = this.im(ourIndex)

		let c = input.re(inputIndex)
		let d = input.im(inputIndex)

		target.setRe(targetIndex,(a*c - b*d))
		target.setIm(targetIndex,(c*b + a*d))
	}

	log(msg) {
		let str = ""
		for (let i = 0; i < this.length / 2; ++i) {

			let rePart = this.re(i)
			let imPart = this.im(i)
			if (rePart !== 0. || imPart !== 0.) {
				if (str !== "")
					str += " + \n"

				str += "(" + rePart.toFixed(1) + "+i" + imPart.toFixed(1) + ") " + "|" + toBinary(i) + ">"
			}
		}

		if (msg !== undefined)
			str = msg + ": " + str

		console.log(str)
	}

	tensorProduct(b) {
		let a = this
		let ret = new ComplexVector(a.length * b.length / 4)
		for (let i = 0, il = a.length / 2; i < il; ++i) {
			for (let j = 0, jl = b.length / 2; j < jl; ++j) {
				a.multiplyOneEntry(b, i, j, ret, i * jl + j)
			}
		}

		return ret
	}
}

function toBinary(x) {
	let log2x = Math.log2(x)
	let str = ""
	for (let i = 0; i < log2x; ++i) {
		str = (x & i)?"1":"0" + str
	}

	return str
}

function initAlgebra() {

	let a = new ComplexVector([1,0,0,0])
	let b = new ComplexVector([1,0,0,0])
	a.tensorProduct(b).log()

	//errrr obv you want to count up in binary, but does that correspond... we'll find out

	let basisNames = ["", "0", "1", "2", "3", "01", "02", "03", "12", "31", "23", "021", "013", "032", "123", "0123"]
	let onesWithMinus = ["31", "021", "032"] //yes you could reverse the orders in the string but it's established

	let effectiveOrigin = new THREE.Vector3(0.,0.,0.)//(0 - .1, 1.6 - .1, -0.5)
	//could have scale too

	class Mv extends Float32Array {
		constructor() {
			super(16)
		}

		copy(a) {
			for (let i = 0; i < 16; ++i)
				this[i] = a[i]

			return this
		}

		clone() {
			let cl = new Mv()
			cl.copy(this)

			return cl
		}

		log(msg) {
			let str = ""
			for (let i = 0; i < basisNames.length; ++i) {
				if (this[i] !== 0.) {
					if (str !== "")
						str += " + "

					let sign = 1.
					if (onesWithMinus.indexOf(basisNames[i]) !== -1)
						sign = -1.

					str += (sign * this[i]).toFixed(1) + (i!==0?"e":"") + basisNames[i]
				}
			}

			if (msg !== undefined)
				str = msg + ": " + str

			log(str)
		}

		reverse(target) {
			if (target === undefined)
				target = new Mv()

			target[0] = this[0];
			target[1] = this[1];
			target[2] = this[2];
			target[3] = this[3];
			target[4] = this[4];
			target[5] = -this[5];
			target[6] = -this[6];
			target[7] = -this[7];
			target[8] = -this[8];
			target[9] = -this[9];
			target[10] = -this[10];
			target[11] = -this[11];
			target[12] = -this[12];
			target[13] = -this[13];
			target[14] = -this[14];
			target[15] = this[15];
			return target;
		}

		multiplyScalar(a) {
			this[ 0] = this[ 0] * a
			this[ 1] = this[ 1] * a
			this[ 2] = this[ 2] * a
			this[ 3] = this[ 3] * a
			this[ 4] = this[ 4] * a
			this[ 5] = this[ 5] * a
			this[ 6] = this[ 6] * a
			this[ 7] = this[ 7] * a
			this[ 8] = this[ 8] * a
			this[ 9] = this[ 9] * a
			this[10] = this[10] * a
			this[11] = this[11] * a
			this[12] = this[12] * a
			this[13] = this[13] * a
			this[14] = this[14] * a
			this[15] = this[15] * a
			return this
		}

		conjugate(target) {
			if (target === undefined)
				target = new Mv()

			target[0] = this[0];
			target[1] = -this[1];
			target[2] = -this[2];
			target[3] = -this[3];
			target[4] = -this[4];
			target[5] = -this[5];
			target[6] = -this[6];
			target[7] = -this[7];
			target[8] = -this[8];
			target[9] = -this[9];
			target[10] = -this[10];
			target[11] = this[11];
			target[12] = this[12];
			target[13] = this[13];
			target[14] = this[14];
			target[15] = this[15];
			return target;
		}

		dual(target) {
			if (target === undefined)
				target = new Mv()

			target[0] = this[15];
			target[1] = this[14];
			target[2] = -this[13];
			target[3] = this[12];
			target[4] = -this[11];
			target[5] = -this[10];
			target[6] = this[9];
			target[7] = -this[8];
			target[8] = -this[7];
			target[9] = this[6];
			target[10] = -this[5];
			target[11] = -this[4];
			target[12] = this[3];
			target[13] = -this[2];
			target[14] = this[1];
			target[15] = this[0];
			return target;
		}

		dualSelf() {
			this.dual(localMv0)
			this.copy(localMv0)

			return this
		}

		fromVector(v) {
			this.copy(zeroMv)
			this.point(
				v.x - effectiveOrigin.x,
				v.y - effectiveOrigin.y,
				v.z - effectiveOrigin.z)

			return this
		}

		point(x, y, z) {
			this.copy(zeroMv)
			this[13] = x
			this[12] = y
			this[11] = z

			this[14] = 1.

			return this
		}

		x() {
			return this[13]
		}
		y() {
			return this[12]
		}
		z() {
			return this[11]
		}

		direction(x,y,z) {
			this.copy(zeroMv)
			this[13] = x
			this[12] = y
			this[11] = z

			this[14] = 0.

			return this
		}

		toVector(target) {
			if(target === undefined)
				target = new THREE.Vector3()

			if(this[14] > 0) {
				target.x = this[13] / this[14]
				target.y = this[12] / this[14]
				target.z = this[11] / this[14]
			}
			else if(this[14] === 0.) {
				//better to put it at the skybox really.
				target.x = this[13]
				target.y = this[12]
				target.z = this[11]
			}
			else {
				target.x = this[13] / this[14]
				target.y = this[12] / this[14]
				target.z = this[11] / this[14]
				//or this?
				// target.x = 0.
				// target.y = 0.
				// target.z = 0.
			}

			target.add(effectiveOrigin)

			return target
		}

		// fromQuaternion(q) {

		// }

		toQuaternion(target) {
			if(target === undefined)
				target = new THREE.Quaternion()

			target.set(this[10], this[9], this[8], this[0])
			target.normalize()
			return target
		}

		//threejs has the same setup of quaternions
		// {
		// 	// let epgaDir = new Mv().direction(1., 0., 0.)
        //     // let epgaRotor = new Mv()
        //     // add(e31, oneMv, epgaRotor).normalize()
        //     // epgaRotor.sandwich(epgaDir, mv0)
		// 	// log("with PGA:")
        //     // mv0.log()

		// 	// let threeDir = new THREE.Vector3(1., 0., 0.)
		// 	// let threeQuaternion = new THREE.Quaternion(0., 1., 0., 1.)
        //     // threeQuaternion.normalize()
        //     // threeDir.applyQuaternion(threeQuaternion)
		// 	// log("with THREE:")
		// 	// log(threeDir)
        // }

		norm() {
			this.conjugate(localMv0)
			product(this, localMv0,localMv1)
			return Math.sqrt(Math.abs(localMv1[0]))
		}

		idealNorm() {
			return this[1] != 0. ?
				this[1] :
				this[15] != 0. ?
					this[15] :
					(this.dual(localMv3)).norm();
		}

		normalize() {
			let normToUse = this.norm()
			if (normToUse == 0.)
				normToUse = this.idealNorm()
			this.multiplyScalar(1. / normToUse)
			//what does the ideal norm even mean in this context though?
			return this
		}

		//aliasing works
		sqrtSimpleMotor(target) {
			if (target === undefined)
				target = new Mv()
			target.copy(this)

			let scalarAddition = target[0] == -1. ? -1. : 1.
			target[0] += scalarAddition
			target.normalize()
			return target
		}

		sandwich(mvToBeSandwiched, target) {
			if (target === undefined)
				target = new Mv()

			this.reverse(localMv0)

			product(this, mvToBeSandwiched, localMv1)
			product(localMv1,localMv0,target)
		}
	}

	projectPointOnLine = (p, l, target) => {
		if (target === undefined)
			target = new Mv()
		cleave(l, p, localMv3)
		product(localMv3, l, target)

		return target
	}

	projectLineOnPoint = (l, p, target) => {
		if (target === undefined)
			target = new Mv()

		cleave(l, p, localMv0)
		product(localMv0, p, target)

		return target
	}

	distancePointPoint = (p1,p2) => {
		localMv3.copy(p1).normalize()
		localMv4.copy(p2).normalize()

		join(localMv3,localMv4,localMv5)
		return localMv5.norm()
	}

	window.Mv = Mv

	function MvFromIndexAndFloat(float, index) {
		let mv = new Mv()
		mv[index] = float
		return mv
	}

	zeroMv = new Mv()
	oneMv = new Mv()
	oneMv[0] = 1.

	e0 = MvFromIndexAndFloat(1.0, 1)
	e1 = MvFromIndexAndFloat(1.0, 2)
	e2 = MvFromIndexAndFloat(1.0, 3)
	e3 = MvFromIndexAndFloat(1.0, 4)
	e01 = product(e0, e1)
	e02 = product(e0, e2)
	e03 = product(e0, e3)
	e12 = product(e1, e2)
	e31 = product(e3, e1)
	e23 = product(e2, e3)
	e021 = product(e02, e1)
	e013 = product(e01, e3)
	e032 = product(e03, e2)
	e123 = product(e12, e3)
	e0123 = product(e0, e123)

	let localMv0 = new Mv()
	let localMv1 = new Mv()
	let localMv2 = new Mv()
	let localMv3 = new Mv()
	let localMv4 = new Mv()
	let localMv5 = new Mv()

	mv0 = new Mv()
	mv1 = new Mv()
	mv2 = new Mv()
	mv3 = new Mv()
	mv4 = new Mv()
}

function product( a, b, target)
{
	if(target === undefined)
		target = new Mv()
		
	target[0]=b[0]*a[0]+b[1]*a[1]+b[2]*a[2]+b[3]*a[3]+b[4]*a[4]-b[5]*a[5]-b[6]*a[6]-b[7]*a[7]-b[8]*a[8]-b[9]*a[9]-b[10]*a[10]-b[11]*a[11]-b[12]*a[12]-b[13]*a[13]-b[14]*a[14]+b[15]*a[15];
	target[1]=b[1]*a[0]+b[0]*a[1]-b[5]*a[2]-b[6]*a[3]-b[7]*a[4]+b[2]*a[5]+b[3]*a[6]+b[4]*a[7]-b[11]*a[8]-b[12]*a[9]-b[13]*a[10]-b[8]*a[11]-b[9]*a[12]-b[10]*a[13]+b[15]*a[14]-b[14]*a[15];
	target[2]=b[2]*a[0]+b[5]*a[1]+b[0]*a[2]-b[8]*a[3]-b[9]*a[4]-b[1]*a[5]+b[11]*a[6]+b[12]*a[7]+b[3]*a[8]+b[4]*a[9]-b[14]*a[10]+b[6]*a[11]+b[7]*a[12]-b[15]*a[13]-b[10]*a[14]+b[13]*a[15];
	target[3]=b[3]*a[0]+b[6]*a[1]+b[8]*a[2]+b[0]*a[3]-b[10]*a[4]-b[11]*a[5]-b[1]*a[6]+b[13]*a[7]-b[2]*a[8]+b[14]*a[9]+b[4]*a[10]-b[5]*a[11]+b[15]*a[12]+b[7]*a[13]+b[9]*a[14]-b[12]*a[15];
	target[4]=b[4]*a[0]+b[7]*a[1]+b[9]*a[2]+b[10]*a[3]+b[0]*a[4]-b[12]*a[5]-b[13]*a[6]-b[1]*a[7]-b[14]*a[8]-b[2]*a[9]-b[3]*a[10]-b[15]*a[11]-b[5]*a[12]-b[6]*a[13]-b[8]*a[14]+b[11]*a[15];
	target[5]=b[5]*a[0]+b[2]*a[1]-b[1]*a[2]+b[11]*a[3]+b[12]*a[4]+b[0]*a[5]-b[8]*a[6]-b[9]*a[7]+b[6]*a[8]+b[7]*a[9]-b[15]*a[10]+b[3]*a[11]+b[4]*a[12]-b[14]*a[13]+b[13]*a[14]-b[10]*a[15];
	target[6]=b[6]*a[0]+b[3]*a[1]-b[11]*a[2]-b[1]*a[3]+b[13]*a[4]+b[8]*a[5]+b[0]*a[6]-b[10]*a[7]-b[5]*a[8]+b[15]*a[9]+b[7]*a[10]-b[2]*a[11]+b[14]*a[12]+b[4]*a[13]-b[12]*a[14]+b[9]*a[15];
	target[7]=b[7]*a[0]+b[4]*a[1]-b[12]*a[2]-b[13]*a[3]-b[1]*a[4]+b[9]*a[5]+b[10]*a[6]+b[0]*a[7]-b[15]*a[8]-b[5]*a[9]-b[6]*a[10]-b[14]*a[11]-b[2]*a[12]-b[3]*a[13]+b[11]*a[14]-b[8]*a[15];
	target[8]=b[8]*a[0]+b[11]*a[1]+b[3]*a[2]-b[2]*a[3]+b[14]*a[4]-b[6]*a[5]+b[5]*a[6]-b[15]*a[7]+b[0]*a[8]-b[10]*a[9]+b[9]*a[10]+b[1]*a[11]-b[13]*a[12]+b[12]*a[13]+b[4]*a[14]-b[7]*a[15];
	target[9]=b[9]*a[0]+b[12]*a[1]+b[4]*a[2]-b[14]*a[3]-b[2]*a[4]-b[7]*a[5]+b[15]*a[6]+b[5]*a[7]+b[10]*a[8]+b[0]*a[9]-b[8]*a[10]+b[13]*a[11]+b[1]*a[12]-b[11]*a[13]-b[3]*a[14]+b[6]*a[15];
	target[10]=b[10]*a[0]+b[13]*a[1]+b[14]*a[2]+b[4]*a[3]-b[3]*a[4]-b[15]*a[5]-b[7]*a[6]+b[6]*a[7]-b[9]*a[8]+b[8]*a[9]+b[0]*a[10]-b[12]*a[11]+b[11]*a[12]+b[1]*a[13]+b[2]*a[14]-b[5]*a[15];
	target[11]=b[11]*a[0]+b[8]*a[1]-b[6]*a[2]+b[5]*a[3]-b[15]*a[4]+b[3]*a[5]-b[2]*a[6]+b[14]*a[7]+b[1]*a[8]-b[13]*a[9]+b[12]*a[10]+b[0]*a[11]-b[10]*a[12]+b[9]*a[13]-b[7]*a[14]+b[4]*a[15];
	target[12]=b[12]*a[0]+b[9]*a[1]-b[7]*a[2]+b[15]*a[3]+b[5]*a[4]+b[4]*a[5]-b[14]*a[6]-b[2]*a[7]+b[13]*a[8]+b[1]*a[9]-b[11]*a[10]+b[10]*a[11]+b[0]*a[12]-b[8]*a[13]+b[6]*a[14]-b[3]*a[15];
	target[13]=b[13]*a[0]+b[10]*a[1]-b[15]*a[2]-b[7]*a[3]+b[6]*a[4]+b[14]*a[5]+b[4]*a[6]-b[3]*a[7]-b[12]*a[8]+b[11]*a[9]+b[1]*a[10]-b[9]*a[11]+b[8]*a[12]+b[0]*a[13]-b[5]*a[14]+b[2]*a[15];
	target[14]=b[14]*a[0]+b[15]*a[1]+b[10]*a[2]-b[9]*a[3]+b[8]*a[4]-b[13]*a[5]+b[12]*a[6]-b[11]*a[7]+b[4]*a[8]-b[3]*a[9]+b[2]*a[10]+b[7]*a[11]-b[6]*a[12]+b[5]*a[13]+b[0]*a[14]-b[1]*a[15];
	target[15]=b[15]*a[0]+b[14]*a[1]-b[13]*a[2]+b[12]*a[3]-b[11]*a[4]+b[10]*a[5]-b[9]*a[6]+b[8]*a[7]+b[7]*a[8]-b[6]*a[9]+b[5]*a[10]+b[4]*a[11]-b[3]*a[12]+b[2]*a[13]-b[1]*a[14]+b[0]*a[15];
	return target;
}

function meet( a, b, target)
{
	if(target === undefined)
		target = new Mv()
		
	target[0]=b[0]*a[0];
	target[1]=b[1]*a[0]+b[0]*a[1];
	target[2]=b[2]*a[0]+b[0]*a[2];
	target[3]=b[3]*a[0]+b[0]*a[3];
	target[4]=b[4]*a[0]+b[0]*a[4];
	target[5]=b[5]*a[0]+b[2]*a[1]-b[1]*a[2]+b[0]*a[5];
	target[6]=b[6]*a[0]+b[3]*a[1]-b[1]*a[3]+b[0]*a[6];
	target[7]=b[7]*a[0]+b[4]*a[1]-b[1]*a[4]+b[0]*a[7];
	target[8]=b[8]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[8];
	target[9]=b[9]*a[0]+b[4]*a[2]-b[2]*a[4]+b[0]*a[9];
	target[10]=b[10]*a[0]+b[4]*a[3]-b[3]*a[4]+b[0]*a[10];
	target[11]=b[11]*a[0]+b[8]*a[1]-b[6]*a[2]+b[5]*a[3]+b[3]*a[5]-b[2]*a[6]+b[1]*a[8]+b[0]*a[11];
	target[12]=b[12]*a[0]+b[9]*a[1]-b[7]*a[2]+b[5]*a[4]+b[4]*a[5]-b[2]*a[7]+b[1]*a[9]+b[0]*a[12];
	target[13]=b[13]*a[0]+b[10]*a[1]-b[7]*a[3]+b[6]*a[4]+b[4]*a[6]-b[3]*a[7]+b[1]*a[10]+b[0]*a[13];
	target[14]=b[14]*a[0]+b[10]*a[2]-b[9]*a[3]+b[8]*a[4]+b[4]*a[8]-b[3]*a[9]+b[2]*a[10]+b[0]*a[14];
	target[15]=b[15]*a[0]+b[14]*a[1]-b[13]*a[2]+b[12]*a[3]-b[11]*a[4]+b[10]*a[5]-b[9]*a[6]+b[8]*a[7]+b[7]*a[8]-b[6]*a[9]+b[5]*a[10]+b[4]*a[11]-b[3]*a[12]+b[2]*a[13]-b[1]*a[14]+b[0]*a[15];
	return target;
}

function join( a, b, target)
{
	if(target === undefined)
		target = new Mv()
		
	target[15]=1*(a[15]*b[15]);
	target[14]=-1*(a[14]*-1*b[15]+a[15]*b[14]*-1);
	target[13]=1*(a[13]*b[15]+a[15]*b[13]);
	target[12]=-1*(a[12]*-1*b[15]+a[15]*b[12]*-1);
	target[11]=1*(a[11]*b[15]+a[15]*b[11]);
	target[10]=1*(a[10]*b[15]+a[13]*b[14]*-1-a[14]*-1*b[13]+a[15]*b[10]);
	target[9]=-1*(a[9]*-1*b[15]+a[12]*-1*b[14]*-1-a[14]*-1*b[12]*-1+a[15]*b[9]*-1);
	target[8]=1*(a[8]*b[15]+a[11]*b[14]*-1-a[14]*-1*b[11]+a[15]*b[8]);
	target[7]=1*(a[7]*b[15]+a[12]*-1*b[13]-a[13]*b[12]*-1+a[15]*b[7]);
	target[6]=-1*(a[6]*-1*b[15]+a[11]*b[13]-a[13]*b[11]+a[15]*b[6]*-1);
	target[5]=1*(a[5]*b[15]+a[11]*b[12]*-1-a[12]*-1*b[11]+a[15]*b[5]);
	target[4]=-1*(a[4]*-1*b[15]+a[7]*b[14]*-1-a[9]*-1*b[13]+a[10]*b[12]*-1+a[12]*-1*b[10]-a[13]*b[9]*-1+a[14]*-1*b[7]+a[15]*b[4]*-1);
	target[3]=1*(a[3]*b[15]+a[6]*-1*b[14]*-1-a[8]*b[13]+a[10]*b[11]+a[11]*b[10]-a[13]*b[8]+a[14]*-1*b[6]*-1+a[15]*b[3]);
	target[2]=-1*(a[2]*-1*b[15]+a[5]*b[14]*-1-a[8]*b[12]*-1+a[9]*-1*b[11]+a[11]*b[9]*-1-a[12]*-1*b[8]+a[14]*-1*b[5]+a[15]*b[2]*-1);
	target[1]=1*(a[1]*b[15]+a[5]*b[13]-a[6]*-1*b[12]*-1+a[7]*b[11]+a[11]*b[7]-a[12]*-1*b[6]*-1+a[13]*b[5]+a[15]*b[1]);
	target[0]=1*(a[0]*b[15]+a[1]*b[14]*-1-a[2]*-1*b[13]+a[3]*b[12]*-1-a[4]*-1*b[11]+a[5]*b[10]-a[6]*-1*b[9]*-1+a[7]*b[8]+a[8]*b[7]-a[9]*-1*b[6]*-1+a[10]*b[5]+a[11]*b[4]*-1-a[12]*-1*b[3]+a[13]*b[2]*-1-a[14]*-1*b[1]+a[15]*b[0]);
	return target;
}

function cleave( a, b, target)
{
	if(target === undefined)
		target = new Mv()
		
	target[0]=b[0]*a[0]+b[1]*a[1]+b[2]*a[2]+b[3]*a[3]+b[4]*a[4]-b[5]*a[5]-b[6]*a[6]-b[7]*a[7]-b[8]*a[8]-b[9]*a[9]-b[10]*a[10]-b[11]*a[11]-b[12]*a[12]-b[13]*a[13]-b[14]*a[14]+b[15]*a[15];
	target[1]=b[1]*a[0]+b[0]*a[1]-b[5]*a[2]-b[6]*a[3]-b[7]*a[4]+b[2]*a[5]+b[3]*a[6]+b[4]*a[7]-b[11]*a[8]-b[12]*a[9]-b[13]*a[10]-b[8]*a[11]-b[9]*a[12]-b[10]*a[13]+b[15]*a[14]-b[14]*a[15];
	target[2]=b[2]*a[0]+b[5]*a[1]+b[0]*a[2]-b[8]*a[3]-b[9]*a[4]-b[1]*a[5]+b[11]*a[6]+b[12]*a[7]+b[3]*a[8]+b[4]*a[9]-b[14]*a[10]+b[6]*a[11]+b[7]*a[12]-b[15]*a[13]-b[10]*a[14]+b[13]*a[15];
	target[3]=b[3]*a[0]+b[6]*a[1]+b[8]*a[2]+b[0]*a[3]-b[10]*a[4]-b[11]*a[5]-b[1]*a[6]+b[13]*a[7]-b[2]*a[8]+b[14]*a[9]+b[4]*a[10]-b[5]*a[11]+b[15]*a[12]+b[7]*a[13]+b[9]*a[14]-b[12]*a[15];
	target[4]=b[4]*a[0]+b[7]*a[1]+b[9]*a[2]+b[10]*a[3]+b[0]*a[4]-b[12]*a[5]-b[13]*a[6]-b[1]*a[7]-b[14]*a[8]-b[2]*a[9]-b[3]*a[10]-b[15]*a[11]-b[5]*a[12]-b[6]*a[13]-b[8]*a[14]+b[11]*a[15];
	target[5]=b[5]*a[0]+b[11]*a[3]+b[12]*a[4]+b[0]*a[5]-b[15]*a[10]+b[3]*a[11]+b[4]*a[12]-b[10]*a[15];
	target[6]=b[6]*a[0]-b[11]*a[2]+b[13]*a[4]+b[0]*a[6]+b[15]*a[9]-b[2]*a[11]+b[4]*a[13]+b[9]*a[15];
	target[7]=b[7]*a[0]-b[12]*a[2]-b[13]*a[3]+b[0]*a[7]-b[15]*a[8]-b[2]*a[12]-b[3]*a[13]-b[8]*a[15];
	target[8]=b[8]*a[0]+b[11]*a[1]+b[14]*a[4]-b[15]*a[7]+b[0]*a[8]+b[1]*a[11]+b[4]*a[14]-b[7]*a[15];
	target[9]=b[9]*a[0]+b[12]*a[1]-b[14]*a[3]+b[15]*a[6]+b[0]*a[9]+b[1]*a[12]-b[3]*a[14]+b[6]*a[15];
	target[10]=b[10]*a[0]+b[13]*a[1]+b[14]*a[2]-b[15]*a[5]+b[0]*a[10]+b[1]*a[13]+b[2]*a[14]-b[5]*a[15];
	target[11]=b[11]*a[0]-b[15]*a[4]+b[0]*a[11]+b[4]*a[15];
	target[12]=b[12]*a[0]+b[15]*a[3]+b[0]*a[12]-b[3]*a[15];
	target[13]=b[13]*a[0]-b[15]*a[2]+b[0]*a[13]+b[2]*a[15];
	target[14]=b[14]*a[0]+b[15]*a[1]+b[0]*a[14]-b[1]*a[15];
	target[15]=b[15]*a[0]+b[0]*a[15];
	return target;
}

function add( a, b, target)
{
	if(target === undefined)
		target = new Mv()
		
	target[0] = a[0]+b[0];
	target[1] = a[1]+b[1];
	target[2] = a[2]+b[2];
	target[3] = a[3]+b[3];
	target[4] = a[4]+b[4];
	target[5] = a[5]+b[5];
	target[6] = a[6]+b[6];
	target[7] = a[7]+b[7];
	target[8] = a[8]+b[8];
	target[9] = a[9]+b[9];
	target[10] = a[10]+b[10];
	target[11] = a[11]+b[11];
	target[12] = a[12]+b[12];
	target[13] = a[13]+b[13];
	target[14] = a[14]+b[14];
	target[15] = a[15]+b[15];
	return target;
}

function subtract( a, b, target)
{
	if(target === undefined)
		target = new Mv()
		
	target[0] = a[0]-b[0];
	target[1] = a[1]-b[1];
	target[2] = a[2]-b[2];
	target[3] = a[3]-b[3];
	target[4] = a[4]-b[4];
	target[5] = a[5]-b[5];
	target[6] = a[6]-b[6];
	target[7] = a[7]-b[7];
	target[8] = a[8]-b[8];
	target[9] = a[9]-b[9];
	target[10] = a[10]-b[10];
	target[11] = a[11]-b[11];
	target[12] = a[12]-b[12];
	target[13] = a[13]-b[13];
	target[14] = a[14]-b[14];
	target[15] = a[15]-b[15];
	return target;
}