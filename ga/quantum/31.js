function init31() {

    let basisNames = ["", "1", "2", "3", "4", "12", "13", "14", "23", "24", "34", "123", "412", "341", "234", "0123"]
	let onesWithMinus = ["31", "021", "032"] //yes you could reverse the orders in the string but it's established

	let indexForXPartOfQuaternion = 8
	let indexForYPartOfQuaternion = 6
	let indexForZPartOfQuaternion = 5



	const GRADES_OF_ELEMENTS = [0, 1,1,1,1, 2,2,2,2,2,2, 3,3,3,3, 4]

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

		log(label) {
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

			if (label !== undefined)
				str = label + ": " + str

			log(str)
		}

		reverse(target) {
			if (target === undefined)
				target = new Mv()

			target[0]=this[0]
            target[1]=this[1]
            target[2]=this[2]
            target[3]=this[3]
            target[4]=this[4]
            target[5]=-this[5]
            target[6]=-this[6]
            target[7]=-this[7]
            target[8]=-this[8]
            target[9]=-this[9]
            target[10]=-this[10]
            target[11]=-this[11]
            target[12]=-this[12]
            target[13]=-this[13]
            target[14]=-this[14]
            target[15]=this[15]
			return target
		}

		meet(b,target) {
			if(target === undefined)
				target = new Mv()
			target[0]=b[0]*this[0];
			target[1]=b[1]*this[0]+b[0]*this[1];
			target[2]=b[2]*this[0]+b[0]*this[2];
			target[3]=b[3]*this[0]+b[0]*this[3];
			target[4]=b[4]*this[0]+b[0]*this[4];
			target[5]=b[5]*this[0]+b[2]*this[1]-b[1]*this[2]+b[0]*this[5];
			target[6]=b[6]*this[0]+b[3]*this[1]-b[1]*this[3]+b[0]*this[6];
			target[7]=b[7]*this[0]+b[4]*this[1]-b[1]*this[4]+b[0]*this[7];
			target[8]=b[8]*this[0]+b[3]*this[2]-b[2]*this[3]+b[0]*this[8];
			target[9]=b[9]*this[0]+b[4]*this[2]-b[2]*this[4]+b[0]*this[9];
			target[10]=b[10]*this[0]+b[4]*this[3]-b[3]*this[4]+b[0]*this[10];
			target[11]=b[11]*this[0]+b[8]*this[1]-b[6]*this[2]+b[5]*this[3]+b[3]*this[5]-b[2]*this[6]+b[1]*this[8]+b[0]*this[11];
			target[12]=b[12]*this[0]+b[9]*this[1]-b[7]*this[2]+b[5]*this[4]+b[4]*this[5]-b[2]*this[7]+b[1]*this[9]+b[0]*this[12];
			target[13]=b[13]*this[0]+b[10]*this[1]-b[7]*this[3]+b[6]*this[4]+b[4]*this[6]-b[3]*this[7]+b[1]*this[10]+b[0]*this[13];
			target[14]=b[14]*this[0]+b[10]*this[2]-b[9]*this[3]+b[8]*this[4]+b[4]*this[8]-b[3]*this[9]+b[2]*this[10]+b[0]*this[14];
			target[15]=b[15]*this[0]+b[14]*this[1]-b[13]*this[2]+b[12]*this[3]-b[11]*this[4]+b[10]*this[5]-b[9]*this[6]+b[8]*this[7]+b[7]*this[8]-b[6]*this[9]+b[5]*this[10]+b[4]*this[11]-b[3]*this[12]+b[2]*this[13]-b[1]*this[14]+b[0]*this[15];
			return target;
		}

		join(b, target) {
			if(target === undefined)
				target = new Mv()
			target[15]=1.*(this[15]*b[15]);
			target[14]=-1.*(this[14]*-1.*b[15]+this[15]*b[14]*-1);
			target[13]=1.*(this[13]*b[15]+this[15]*b[13]);
			target[12]=-1.*(this[12]*-1.*b[15]+this[15]*b[12]*-1);
			target[11]=1.*(this[11]*b[15]+this[15]*b[11]);
			target[10]=1.*(this[10]*b[15]+this[13]*b[14]*-1-this[14]*-1.*b[13]+this[15]*b[10]);
			target[9]=-1.*(this[9]*-1.*b[15]+this[12]*-1.*b[14]*-1-this[14]*-1.*b[12]*-1+this[15]*b[9]*-1);
			target[8]=1.*(this[8]*b[15]+this[11]*b[14]*-1-this[14]*-1.*b[11]+this[15]*b[8]);
			target[7]=1.*(this[7]*b[15]+this[12]*-1.*b[13]-this[13]*b[12]*-1+this[15]*b[7]);
			target[6]=-1.*(this[6]*-1.*b[15]+this[11]*b[13]-this[13]*b[11]+this[15]*b[6]*-1);
			target[5]=1.*(this[5]*b[15]+this[11]*b[12]*-1-this[12]*-1.*b[11]+this[15]*b[5]);
			target[4]=-1.*(this[4]*-1.*b[15]+this[7]*b[14]*-1-this[9]*-1.*b[13]+this[10]*b[12]*-1+this[12]*-1.*b[10]-this[13]*b[9]*-1+this[14]*-1.*b[7]+this[15]*b[4]*-1);
			target[3]=1.*(this[3]*b[15]+this[6]*-1.*b[14]*-1-this[8]*b[13]+this[10]*b[11]+this[11]*b[10]-this[13]*b[8]+this[14]*-1.*b[6]*-1+this[15]*b[3]);
			target[2]=-1.*(this[2]*-1.*b[15]+this[5]*b[14]*-1-this[8]*b[12]*-1+this[9]*-1.*b[11]+this[11]*b[9]*-1-this[12]*-1.*b[8]+this[14]*-1.*b[5]+this[15]*b[2]*-1);
			target[1]=1.*(this[1]*b[15]+this[5]*b[13]-this[6]*-1.*b[12]*-1+this[7]*b[11]+this[11]*b[7]-this[12]*-1.*b[6]*-1+this[13]*b[5]+this[15]*b[1]);
			target[0]=1.*(this[0]*b[15]+this[1]*b[14]*-1-this[2]*-1.*b[13]+this[3]*b[12]*-1-this[4]*-1.*b[11]+this[5]*b[10]-this[6]*-1.*b[9]*-1+this[7]*b[8]+this[8]*b[7]-this[9]*-1.*b[6]*-1+this[10]*b[5]+this[11]*b[4]*-1-this[12]*-1.*b[3]+this[13]*b[2]*-1-this[14]*-1.*b[1]+this[15]*b[0]);
			return target;
		}

		inner(b, target) {
			if(target === undefined)
				target = new Mv()
			target[0]=b[0]*this[0]+b[1]*this[1]+b[2]*this[2]+b[3]*this[3]-b[4]*this[4]-b[5]*this[5]-b[6]*this[6]+b[7]*this[7]-b[8]*this[8]+b[9]*this[9]+b[10]*this[10]-b[11]*this[11]+b[12]*this[12]+b[13]*this[13]+b[14]*this[14]-b[15]*this[15];
			target[1]=b[1]*this[0]+b[0]*this[1]-b[5]*this[2]-b[6]*this[3]+b[7]*this[4]+b[2]*this[5]+b[3]*this[6]-b[4]*this[7]-b[11]*this[8]+b[12]*this[9]+b[13]*this[10]-b[8]*this[11]+b[9]*this[12]+b[10]*this[13]-b[15]*this[14]+b[14]*this[15];
			target[2]=b[2]*this[0]+b[5]*this[1]+b[0]*this[2]-b[8]*this[3]+b[9]*this[4]-b[1]*this[5]+b[11]*this[6]-b[12]*this[7]+b[3]*this[8]-b[4]*this[9]+b[14]*this[10]+b[6]*this[11]-b[7]*this[12]+b[15]*this[13]+b[10]*this[14]-b[13]*this[15];
			target[3]=b[3]*this[0]+b[6]*this[1]+b[8]*this[2]+b[0]*this[3]+b[10]*this[4]-b[11]*this[5]-b[1]*this[6]-b[13]*this[7]-b[2]*this[8]-b[14]*this[9]-b[4]*this[10]-b[5]*this[11]-b[15]*this[12]-b[7]*this[13]-b[9]*this[14]+b[12]*this[15];
			target[4]=b[4]*this[0]+b[7]*this[1]+b[9]*this[2]+b[10]*this[3]+b[0]*this[4]-b[12]*this[5]-b[13]*this[6]-b[1]*this[7]-b[14]*this[8]-b[2]*this[9]-b[3]*this[10]-b[15]*this[11]-b[5]*this[12]-b[6]*this[13]-b[8]*this[14]+b[11]*this[15];
			target[5]=b[5]*this[0]+b[11]*this[3]-b[12]*this[4]+b[0]*this[5]+b[15]*this[10]+b[3]*this[11]-b[4]*this[12]+b[10]*this[15];
			target[6]=b[6]*this[0]-b[11]*this[2]-b[13]*this[4]+b[0]*this[6]-b[15]*this[9]-b[2]*this[11]-b[4]*this[13]-b[9]*this[15];
			target[7]=b[7]*this[0]-b[12]*this[2]-b[13]*this[3]+b[0]*this[7]-b[15]*this[8]-b[2]*this[12]-b[3]*this[13]-b[8]*this[15];
			target[8]=b[8]*this[0]+b[11]*this[1]-b[14]*this[4]+b[15]*this[7]+b[0]*this[8]+b[1]*this[11]-b[4]*this[14]+b[7]*this[15];
			target[9]=b[9]*this[0]+b[12]*this[1]-b[14]*this[3]+b[15]*this[6]+b[0]*this[9]+b[1]*this[12]-b[3]*this[14]+b[6]*this[15];
			target[10]=b[10]*this[0]+b[13]*this[1]+b[14]*this[2]-b[15]*this[5]+b[0]*this[10]+b[1]*this[13]+b[2]*this[14]-b[5]*this[15];
			target[11]=b[11]*this[0]+b[15]*this[4]+b[0]*this[11]-b[4]*this[15];
			target[12]=b[12]*this[0]+b[15]*this[3]+b[0]*this[12]-b[3]*this[15];
			target[13]=b[13]*this[0]-b[15]*this[2]+b[0]*this[13]+b[2]*this[15];
			target[14]=b[14]*this[0]+b[15]*this[1]+b[0]*this[14]-b[1]*this[15];
			target[15]=b[15]*this[0]+b[0]*this[15];
			return target;
		}

		sub(b, target) {
			if (target !== undefined)
				console.error("no target for this")
			this[1] = this[1]-b[1];
			this[2] = this[2]-b[2];
			this[3] = this[3]-b[3];
			this[4] = this[4]-b[4];
			this[5] = this[5]-b[5];
			this[6] = this[6]-b[6];
			this[7] = this[7]-b[7];
			this[8] = this[8]-b[8];
			this[9] = this[9]-b[9];
			this[10] = this[10]-b[10];
			this[11] = this[11]-b[11];
			this[12] = this[12]-b[12];
			this[13] = this[13]-b[13];
			this[14] = this[14]-b[14];
			this[15] = this[15]-b[15];
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

			target[0]=-this[15];
            target[1]=-this[14];
            target[2]=this[13];
            target[3]=-this[12];
            target[4]=-this[11];
            target[5]=this[10];
            target[6]=-this[9];
            target[7]=-this[8];
            target[8]=this[7];
            target[9]=this[6];
            target[10]=-this[5];
            target[11]=this[4];
            target[12]=this[3];
            target[13]=-this[2];
            target[14]=this[1];
            target[15]=this[0];
			return target;
		}

		mul(b, target) {
			if(target === undefined)
				target = new Mv()
			target[0]=b[0]*this[0]+b[1]*this[1]+b[2]*this[2]+b[3]*this[3]-b[4]*this[4]-b[5]*this[5]-b[6]*this[6]+b[7]*this[7]-b[8]*this[8]+b[9]*this[9]+b[10]*this[10]-b[11]*this[11]+b[12]*this[12]+b[13]*this[13]+b[14]*this[14]-b[15]*this[15];
			target[1]=b[1]*this[0]+b[0]*this[1]-b[5]*this[2]-b[6]*this[3]+b[7]*this[4]+b[2]*this[5]+b[3]*this[6]-b[4]*this[7]-b[11]*this[8]+b[12]*this[9]+b[13]*this[10]-b[8]*this[11]+b[9]*this[12]+b[10]*this[13]-b[15]*this[14]+b[14]*this[15];
			target[2]=b[2]*this[0]+b[5]*this[1]+b[0]*this[2]-b[8]*this[3]+b[9]*this[4]-b[1]*this[5]+b[11]*this[6]-b[12]*this[7]+b[3]*this[8]-b[4]*this[9]+b[14]*this[10]+b[6]*this[11]-b[7]*this[12]+b[15]*this[13]+b[10]*this[14]-b[13]*this[15];
			target[3]=b[3]*this[0]+b[6]*this[1]+b[8]*this[2]+b[0]*this[3]+b[10]*this[4]-b[11]*this[5]-b[1]*this[6]-b[13]*this[7]-b[2]*this[8]-b[14]*this[9]-b[4]*this[10]-b[5]*this[11]-b[15]*this[12]-b[7]*this[13]-b[9]*this[14]+b[12]*this[15];
			target[4]=b[4]*this[0]+b[7]*this[1]+b[9]*this[2]+b[10]*this[3]+b[0]*this[4]-b[12]*this[5]-b[13]*this[6]-b[1]*this[7]-b[14]*this[8]-b[2]*this[9]-b[3]*this[10]-b[15]*this[11]-b[5]*this[12]-b[6]*this[13]-b[8]*this[14]+b[11]*this[15];
			target[5]=b[5]*this[0]+b[2]*this[1]-b[1]*this[2]+b[11]*this[3]-b[12]*this[4]+b[0]*this[5]-b[8]*this[6]+b[9]*this[7]+b[6]*this[8]-b[7]*this[9]+b[15]*this[10]+b[3]*this[11]-b[4]*this[12]+b[14]*this[13]-b[13]*this[14]+b[10]*this[15];
			target[6]=b[6]*this[0]+b[3]*this[1]-b[11]*this[2]-b[1]*this[3]-b[13]*this[4]+b[8]*this[5]+b[0]*this[6]+b[10]*this[7]-b[5]*this[8]-b[15]*this[9]-b[7]*this[10]-b[2]*this[11]-b[14]*this[12]-b[4]*this[13]+b[12]*this[14]-b[9]*this[15];
			target[7]=b[7]*this[0]+b[4]*this[1]-b[12]*this[2]-b[13]*this[3]-b[1]*this[4]+b[9]*this[5]+b[10]*this[6]+b[0]*this[7]-b[15]*this[8]-b[5]*this[9]-b[6]*this[10]-b[14]*this[11]-b[2]*this[12]-b[3]*this[13]+b[11]*this[14]-b[8]*this[15];
			target[8]=b[8]*this[0]+b[11]*this[1]+b[3]*this[2]-b[2]*this[3]-b[14]*this[4]-b[6]*this[5]+b[5]*this[6]+b[15]*this[7]+b[0]*this[8]+b[10]*this[9]-b[9]*this[10]+b[1]*this[11]+b[13]*this[12]-b[12]*this[13]-b[4]*this[14]+b[7]*this[15];
			target[9]=b[9]*this[0]+b[12]*this[1]+b[4]*this[2]-b[14]*this[3]-b[2]*this[4]-b[7]*this[5]+b[15]*this[6]+b[5]*this[7]+b[10]*this[8]+b[0]*this[9]-b[8]*this[10]+b[13]*this[11]+b[1]*this[12]-b[11]*this[13]-b[3]*this[14]+b[6]*this[15];
			target[10]=b[10]*this[0]+b[13]*this[1]+b[14]*this[2]+b[4]*this[3]-b[3]*this[4]-b[15]*this[5]-b[7]*this[6]+b[6]*this[7]-b[9]*this[8]+b[8]*this[9]+b[0]*this[10]-b[12]*this[11]+b[11]*this[12]+b[1]*this[13]+b[2]*this[14]-b[5]*this[15];
			target[11]=b[11]*this[0]+b[8]*this[1]-b[6]*this[2]+b[5]*this[3]+b[15]*this[4]+b[3]*this[5]-b[2]*this[6]-b[14]*this[7]+b[1]*this[8]+b[13]*this[9]-b[12]*this[10]+b[0]*this[11]+b[10]*this[12]-b[9]*this[13]+b[7]*this[14]-b[4]*this[15];
			target[12]=b[12]*this[0]+b[9]*this[1]-b[7]*this[2]+b[15]*this[3]+b[5]*this[4]+b[4]*this[5]-b[14]*this[6]-b[2]*this[7]+b[13]*this[8]+b[1]*this[9]-b[11]*this[10]+b[10]*this[11]+b[0]*this[12]-b[8]*this[13]+b[6]*this[14]-b[3]*this[15];
			target[13]=b[13]*this[0]+b[10]*this[1]-b[15]*this[2]-b[7]*this[3]+b[6]*this[4]+b[14]*this[5]+b[4]*this[6]-b[3]*this[7]-b[12]*this[8]+b[11]*this[9]+b[1]*this[10]-b[9]*this[11]+b[8]*this[12]+b[0]*this[13]-b[5]*this[14]+b[2]*this[15];
			target[14]=b[14]*this[0]+b[15]*this[1]+b[10]*this[2]-b[9]*this[3]+b[8]*this[4]-b[13]*this[5]+b[12]*this[6]-b[11]*this[7]+b[4]*this[8]-b[3]*this[9]+b[2]*this[10]+b[7]*this[11]-b[6]*this[12]+b[5]*this[13]+b[0]*this[14]-b[1]*this[15];
			target[15]=b[15]*this[0]+b[14]*this[1]-b[13]*this[2]+b[12]*this[3]-b[11]*this[4]+b[10]*this[5]-b[9]*this[6]+b[8]*this[7]+b[7]*this[8]-b[6]*this[9]+b[5]*this[10]+b[4]*this[11]-b[3]*this[12]+b[2]*this[13]-b[1]*this[14]+b[0]*this[15];

			return target
		}

		add(b, target) {
			if (target !== undefined)
				console.error("no target for this")

			this[0] = this[0] + b[0];
			this[1] = this[1] + b[1];
			this[2] = this[2] + b[2];
			this[3] = this[3] + b[3];
			this[4] = this[4] + b[4];
			this[5] = this[5] + b[5];
			this[6] = this[6] + b[6];
			this[7] = this[7] + b[7];
			this[8] = this[8] + b[8];
			this[9] = this[9] + b[9];
			this[10] = this[10] + b[10];
			this[11] = this[11] + b[11];
			this[12] = this[12] + b[12];
			this[13] = this[13] + b[13];
			this[14] = this[14] + b[14];
			this[15] = this[15] + b[15];
			return this;
		}

		dualSelf() {
			this.dual(localMv0)
			this.copy(localMv0)

			return this
		}

		point(x, y, z, w) {
			this.copy(zeroMv)
			this[13] = x
			this[12] = y
			this[11] = z

			this[14] = w === undefined ? 1. : w

			return this
		}

		similarTo(m) {
			let ret = true
			for(let i = 0; i < 16; ++i) {
				if (Math.abs(m[i] - this[i]) > 0.01)
					ret = false
			}
			return ret
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

			this.normalize()
			target.x = this[14] / this[11]
			target.y = this[13] / this[11]
			target.z = this[12] / this[11]

			return target
		}

		// fromQuaternion(q) {

		// }

		toQuaternion(target) {
			if(target === undefined)
				target = new THREE.Quaternion()

			target.set(
				this[indexForXPartOfQuaternion], 
				this[indexForYPartOfQuaternion], 
				this[indexForZPartOfQuaternion], 
				this[0])
			target.normalize()
			return target
		}

		fromQuaternion(q) {
			this[0] = q.w
			this[10] = q.x
			this[9] = q.y
			this[8] = q.z
			return this
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

		equals(mv) {
			let ret = true
			for(let i = 0; i < 16; ++i) {
				if(mv[i] !== this[i])
					ret = false
			}
			return ret
		}

		norm() {
			// float norm() { return sqrt(std:: abs(((* this) * Conjugate())[0]); }
    // float inorm() { return (!(* this)).norm(); }
    // R310 normalized() { return (* this) * (1 / norm()); }

			this.conjugate(localMv0)
			this.mul( localMv0,localMv1)
			return Math.sqrt(Math.abs(localMv1[0]))
		}

		normalize() {
			this.multiplyScalar(1. / this.norm() )
			return this
		}

		//aliasing works
		sqrtBiReflection(target) {
			if (target === undefined)
				target = new Mv()
			target.copy(this)

			let scalarAddition = target[0] == -1. ? -1. : 1.
			target[0] += scalarAddition
			target.normalize()
			return target
		}
		sqrtQuadReflection(target) {
			if (target === undefined)
				target = new Mv()
			target.copy(this)

			localMv0.copy(this)
			localMv2.copy(this)
			localMv0[0] += 1.
			localMv2[0] += 1.
			localMv2.reverse(localMv3)

			localMv3[15] -= .5 * this[15]
			localMv0.mul( localMv3, target )

			return target
		}

		selectGrade(grade,target) {
			target.copy(this)
			for(let i = 0; i < 16; ++i) {
				if(grade !== GRADES_OF_ELEMENTS[i])
					target[i] = 0.
			}

			return target
		}

		// logarithm(target) {
		// 	let b = this.selectGrade(2, lv2LocalMv0)
		// 	let minusBSquared = (b.cleave(b, lv2LocalMv1)).multiplyScalar(-1.)
		// 	let s = Math.sqrt(minusBSquared)
		// 	let p = meet(b, b, lv2LocalMv3).multiplyScalar(2. * s)

		// 	let scalarInBrackets = Math.atan(s/this[0]) + 
		// }

		grade() {
			let ret = -1
			if(this[0] !== 0.)
				return 0
			else if (this[1] !== 0. || this[2] !== 0. || this[3] !== 0. || this[4] !== 0. )
				return 1
			else if (this[5] !== 0. || this[6] !== 0. || this[7] !== 0. || this[8] !== 0. || this[9] !== 0. || this[10] !== 0. )
				return 2
			else if (this[11] !== 0. || this[12] !== 0. || this[13] !== 0. || this[14] !== 0.)
				return 3
			else if (this[15] !== 0.)
				return 4
			return -1
		}

		sandwich(mvToBeSandwiched, target) {
			if (target === undefined)
				target = new Mv()

			this.reverse(localMv0)

			this.mul(mvToBeSandwiched, localMv1)
			localMv1.mul(localMv0,target)

			// let ks = mvToBeSandwiched.grade() * this.grade()
			// if(ks % 2 === 0)
			// 	target.multiplyScalar(-1.)

			return target
		}
	}
	window.Mv = Mv

	projectPointOnLine = (p, l, target) => {
		if (target === undefined)
			target = new Mv()
		cleave(l, p, lv2LocalMv0)
		lv2LocalMv0.mul( l, target)

		return target
	}

	projectLineOnPoint = (l, p, target) => {
		if (target === undefined)
			target = new Mv()

		cleave(l, p, lv2LocalMv0)
		lv2LocalMv0.mul(p, target)

		return target
	}

	rotorFromAxisAngle = (axis,angle,target) => {
		if (target === undefined)
			target = new Mv()

		target.copy(axis)
		target.normalize()
		target.multiplyScalar(Math.sin(angle / 2.))
		
		target[0] = Math.cos(angle / 2.)

		return target
	}

	orientedDistancePointPlane = (pt, pl) => {
		lv2LocalMv0.copy(pt).normalize()
		lv2LocalMv1.copy(pl).normalize()
		join(lv2LocalMv0, lv2LocalMv1, lv2LocalMv2)
		return lv2LocalMv2[0]
	}
	distancePointPlane = (pt,pl) => {
		return Math.abs(orientedDistancePointPlane(pt,pl))
	}

	distancePointPoint = (pt1, pt2) => {
		lv2LocalMv0.copy(pt1).normalize()
		lv2LocalMv1.copy(pt2).normalize()
		join(lv2LocalMv0, lv2LocalMv1, lv2LocalMv2)
		return Math.abs(lv2LocalMv2.norm())
	}

	function MvFromIndexAndFloat(float, index) {
		let mv = new Mv()
		mv[index] = float
		return mv
	}

	zeroMv = new Mv()
	oneMv = new Mv()
	oneMv[0] = 1.

	e1 = MvFromIndexAndFloat(1., 1)
	e2 = MvFromIndexAndFloat(1., 2)
	e3 = MvFromIndexAndFloat(1., 3)
	e4 = MvFromIndexAndFloat(1., 4)
	e41 = e4.mul(e1)
	e42 = e4.mul(e2)
	e43 = e4.mul(e3)
	e12 = e1.mul(e2)
	e31 = e3.mul(e1)
	e23 = e2.mul(e3)
	e421 = e42.mul(e1)
	e413 = e41.mul(e3)
	e432 = e43.mul(e2)
	e123 = e12.mul(e3)
	e4123 = e4.mul(e123)

    // static R310 e1(1.0f, 1);
    // static R310 e2(1.0f, 2);
    // static R310 e3(1.0f, 3);
    // static R310 e4(1.0f, 4);
    // static R310 e12(1.0f, 5);
    // static R310 e13(1.0f, 6);
    // static R310 e14(1.0f, 7);
    // static R310 e23(1.0f, 8);
    // static R310 e24(1.0f, 9);
    // static R310 e34(1.0f, 10);
    // static R310 e123(1.0f, 11);
    // static R310 e124(1.0f, 12);
    // static R310 e134(1.0f, 13);
    // static R310 e234(1.0f, 14);
    // static R310 e1234(1.0f, 15);

	let localMv0 = new Mv()
	let localMv1 = new Mv()
	let localMv2 = new Mv()
	let localMv3 = new Mv()

	let lv2LocalMv0 = new Mv()
	let lv2LocalMv1 = new Mv()
	let lv2LocalMv2 = new Mv()
	let lv2LocalMv3 = new Mv()

	mv0 = new Mv()
	mv1 = new Mv()
	mv2 = new Mv()
	mv3 = new Mv()
	mv4 = new Mv()
}