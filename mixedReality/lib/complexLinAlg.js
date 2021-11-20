// function initChangingParallelStates() {
//     // initialized to 00
//     let state = new ComplexVector(4)
//     state.elements[0].re = 1.

    
    
//     return state
// }

function initChangingQuantumState(state) {
    // let controlsArray = [
    //     pauliX, "t", "g",
    //     pauliY, "i", "k",
    //     pauliZ, "w", "s",
    // ]

    // let dummy4x4 = new ComplexMat(4)
    // let dummyState = new ComplexVector(4)

    // for (let j = 0, jl = controlsArray.length / 3; j < jl; ++j) {
    //     bindButton(controlsArray[j * 3 + 1], () => {
    //         dummy4x4.fromTensorProduct(controlsArray[j*3], identity2x2)
    //         dummy4x4.multiplyColumnVector( state, dummyState )
    //         state.copy(dummyState)
    //         // state.log()
    //     })
    //     bindButton(controlsArray[j * 3 + 2], () => {
    //         dummy4x4.fromTensorProduct(identity2x2, controlsArray[j*3])
    //         dummy4x4.multiplyColumnVector( state, dummyState )
    //         state.copy(dummyState)
    //         // state.log()
    //     })
    // }
}

class ComplexVector {
	constructor(n) {
		if(n === undefined)
			console.error("need to know how many there are!")
		else {
            this.elements = Array(n)
			for(let i = 0; i < n; ++i)
				this.elements[i] = new Complex(0.,0.)
		}
	}

    copy(toBeCopied) {
        for(let i = 0, il = this.elements.length; i < il; ++i)
            this.elements[i].copy(toBeCopied.elements[i])
    }

    log(msg) {
        let str = ""
        for (let i = 0; i < this.elements.length; ++i) {
            if (this.elements[i].re !== 0. || this.elements[i].im !== 0.) {
                if (str !== "")
                    str += " +\n"

                str += this.elements[i].toString()

                let twoDigitBinaryRepOfThisIndex = ""
                for (let j = 0; j < 2; ++j)
                    twoDigitBinaryRepOfThisIndex = ((i & (1 << j)) ? "1" : "0") + twoDigitBinaryRepOfThisIndex
                str += " |" + twoDigitBinaryRepOfThisIndex + ">"
            }
        }

        if (msg !== undefined)
            str = msg + ": " + str

        log(str)
    }

	// multiplyOneEntry(input, ourIndex, inputIndex, target, targetIndex) {
	// 	let a = this.re(ourIndex)
	// 	let b = this.im(ourIndex)

	// 	let c = input.re(inputIndex)
	// 	let d = input.im(inputIndex)

	// 	target.setRe(targetIndex, (a * c - b * d))
	// 	target.setIm(targetIndex, (c * b + a * d))
	// }

	// tensorProduct(b) {
	// 	let a = this
	// 	let ret = new ComplexVector(a.length * b.length / 4)
	// 	for (let i = 0, il = a.length / 2; i < il; ++i) {
	// 		for (let j = 0, jl = b.length / 2; j < jl; ++j) {
	// 			a.multiplyOneEntry(b, i, j, ret, i * jl + j)
	// 		}
	// 	}

	// 	return ret
	// }
}

class ComplexMat {

    constructor(dim,values) {
        this.dim = dim

        this.elements = Array(dim*dim)
        for (let i = 0; i < this.dim; ++i) {
            for (let j = 0; j < this.dim; ++j) {
                this.elements[i * this.dim + j] = new Complex()
            }
        }
        
        if(values!==undefined) {
            this.forEachElement((row, col, element) => {
                let pairIndex = col + this.dim * row //reversed because row-major input
                element.set(values[pairIndex][0], values[pairIndex][1])
            })
        }
    }

    get(row, col) {
        return this.elements[col * this.dim + row]
    }
    set(row, col, val) {
        this.elements[col * this.dim + row].copy(val)
    }

	copy(m) {
		this.forEachElement((row,col,el)=>{
			el.copy(m.get(row,col))
		})
	}

	multiplyScalar(scalar) {
		this.forEachElement((row, col, el) => {
			el.re *= scalar
			el.im *= scalar
		})
	}

    forEachElement(func) {
        for(let row = 0; row < this.dim; ++row) {
            for(let col = 0; col < this.dim; ++col) {
                func(row, col, this.get(row,col))
            }
        }
    }

    log() {
        for (let row = 0; row < this.dim; ++row) {
            let str = ""
            for (let col = 0; col < this.dim; ++col )
                str += this.get(row, col).toString() + ", "
            log(str)
        }
    }

    fromTensorProduct(m1, m2) {
        if (this.dim !== m1.dim * m2.dim)
            console.error("dimensions mismatch:", this.dim, m1.dim, m2.dim)

        const dummy = new Complex()
        m1.forEachElement( (row1, col1, element1) => {
            m2.forEachElement( (row2, col2, element2) => {
                element1.mul(element2,dummy)
                this.set(
                    row1*m2.dim + row2,
                    col1*m2.dim + col2, dummy )
            })
        })

        return this
    }

    multiplyColumnVector(v, target) {
        let dim = v.elements.length
        if (this.elements.length !== dim * dim)
            console.error("matrix size mismatch!", dim, this.elements.length)

        if (target === undefined)
            target = new ComplexVector(dim)

        for (let i = 0; i < dim; ++i)
            target.elements[i].set(0., 0.)

        const dummy = new Complex()
        this.forEachElement((row, col, element) => {
            element.mul(v.elements[col], dummy)
            target.elements[row].add(dummy)
        })

        return target
    }

	multiply(rightMultiple,target) {
		let temp = new Complex()

		for(let i = 0; i < this.dim; ++i) {
			for (let j = 0; j < this.dim; ++j) {
				let targ = target.get(i,j)
				targ.set(0.,0.)
				
				for(let k = 0; k < this.dim; ++k) {
					this.get(i, k).mul(rightMultiple.get(j, k), temp)
					targ.add(temp)
				}
			}
		}
	}
}


if(0)
{
	let q1 = new THREE.Quaternion()
	let q2 = new THREE.Quaternion()

	function complexToQuat(c1,c2,quat) {
		quat.w = c1.re
		quat.x = c1.im
		quat.y = c2.re
		quat.z = c2.im
	}
	function quatToComplex(quat,c1,c2) {
		c1.re = quat.w
		c1.im = quat.x
		c2.re = quat.y
		c2.im = quat.z
	}

	// let isMaximallyEntangled = //C2's norm is .5
	
	// let bellStates = Array(4)
	// for(let i = 0; i < 4; ++i) {
	// 	bellStates[i] = {
	// 		q1: new THREE.Quaternion()
	// 		q2: new THREE.Quaternion()
	// 	}
	// 	// setFromComplexPair([1./Math.sqrt(2.), 0.], [1./Math.sqrt(2.), 0.], bellStates[i].q1)
	// }

	// function c1c2FromS7() {
	// 	const alphaConjugateGamma = new Complex().copy(alpha).conjugate().multiply(gamma)
	// 	const betaConjugateDelta = new Complex().copy(beta).conjugate().multiply(delta)
	// 	const c1 = new Complex().copy(alphaConjugateGamma).add(betaConjugateDelta)

	// 	const betaGamma = new Complex().copy(beta).multiply(gamma)
	// 	const c2 = new Complex().copy(alpha).multiply(delta).sub(betaGamma)

	// 	2. * c1.re
	// 	2. * c1.im
	// 	2. * c2.re
	// 	2. * c2.im
	// }

	//pretty fucking sure that it's bad for it to be stereographic projection given that a bunch of stuff happens "at infinity"

	function h1(q1,q2,target) {
		if( target === undefined )
			target = new Float32Array(5)
		
		if( q2.length() === 0.) {
			//it's point at infinity. Awkward because there is an extra bloch sphere, or whatever the fuck, in here
			

		}
		else {
			const q2Inverse = new THREE.Quaternion()
				.copy(q2)
				.conjugate()
				.multiplyScalar(1./q2.length())

			//a point in 4D I guess!
			const Q = new THREE.Quaternion().multiplyQuaternions(q1,q2Inverse)
			Q.conjugate()
			let l = Q.length() //generically, not 1!
			let discriminant = Math.sqrt(sq(l)-(sq(l)-1.)*(sq(l)+1.))
			let fifthDimensionElevationA = (l + discriminant) / (sq(l)-1.)
			let fifthDimensionElevationB = (l - discriminant) / (sq(l)-1.)
			log( fifthDimensionElevationA, fifthDimensionElevationB ) //below want the one that's not generically 1

			let distanceTowardsQ = Math.sqrt( 1. - sq(fifthDimensionElevationA) )
			let lerpAmount = distanceTowardsQ / l

			const fifthDimensionUnit = new Float32Array(1., 0., 0., 0., 0.)
			const fiveVector = new Float32Array(0., Q.x, Q.y, Q.z, Q.w)
			for(let i = 0; i < 5; ++i) {
				fiveVector[i] = lerp(fifthDimensionUnit[i], fiveVector[i], lerpAmount)
			}

			//aaargh alternatively use their list
		}
	}

	//so probably you want to take this angle 2Omega. Its maximum is pi. If you turn it all the way around e12 you know what you get, same if all the way around -e12
}

class Complex {

	constructor(re,im) {
		this.re = re === undefined ? 0. : re
		this.im = im === undefined ? 0. : im
	}

	clone() {
		return new Complex(this.re, this.im)
	}

	copy(toBeCopied) {
		this.re = toBeCopied.re
		this.im = toBeCopied.im
		return this
	}

	toString() {
		if (this.re !== 0. && this.im === 0.)
			return this.re.toFixed(1)
		else if (this.re === 0. && this.im !== 0.)
			return this.im.toFixed(1) + "i"
		else if (this.re !== 0. && this.im !== 0.)
			return "(" + this.re.toFixed(1) + "+" + this.im.toFixed(1) + "i)"
		else
			return "0.0"
	}

	squaredMagnitude() {
		return this.re * this.re + this.im * this.im
	}

	magnitude() {
		return Math.sqrt(this.squaredMagnitude())
	}

	set(re,im) {
		this.re = re
		this.im = im
	}

	getConjugate(target) {
		if(target === undefined)
			target = new Complex()
		target.copy(this)
		target.im *= -1.

		return target
	}

	add(c) {
		this.re += c.re
		this.im += c.im
	}
	sub(c) {
		this.re -= c.re
		this.im -= c.im
	}

	mul(c,target) {
		if (target === undefined)
			target = new Complex()
		target.re = this.re * c.re - this.im * c.im
		target.im = this.re * c.im + this.im * c.re

        return target
	}

    log() {
        console.log(this.toString())
    }
}

const c1 = new Complex()
const c2 = new Complex()
const c3 = new Complex()
const c4 = new Complex()
const c5 = new Complex()
const c6 = new Complex()

cnot = new ComplexMat(4, [
    [1., 0.], [0., 0.], [0., 0.], [0., 0.],
    [0., 0.], [1., 0.], [0., 0.], [0., 0.],
    [0., 0.], [0., 0.], [0., 0.], [1., 0.],
    [0., 0.], [0., 0.], [1., 0.], [0., 0.],
])

identity2x2 = new ComplexMat(2, [
    [1., 0.], [0., 0.],
    [0., 0.], [1., 0.],
])
pauliX = new ComplexMat(2, [
    [0., 0.], [1., 0.],
    [1., 0.], [0., 0.],
])
pauliY = new ComplexMat(2, [
    [0., 0.], [0., -1.],
    [0., 1.], [0., 0.],
])
pauliZ = new ComplexMat(2, [
    [1., 0.], [0., 0.],
    [0., 0.], [-1., 0.],
])

hadamard = new ComplexMat(2, [
    [1. / Math.SQRT2, 0.], [1. / Math.SQRT2, 0.],
    [1. / Math.SQRT2, 0.], [-1. / Math.SQRT2, 0.],
])