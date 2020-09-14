/*
	exp() is also a modifier, like reverse() or dual()

	So the animation is...

	all * scalar = enlarge
	trivec * vector   = dual bivector
	trivec * bivector = dual vector
	vector * bivector = 
	For scalar-pseudoscalar pair, could turn into the argand diagram version, then transform, then turn back!

	1. Line all up in a table
	2. Everything gets applied in some order.
	3. Things get grouped together into the different blades
	4. Those get combined
*/




function bivectorMagnitude(elements) {
	return Math.sqrt(sq(elements[4]) + sq(elements[5]) + sq(elements[6]))
}

function identity(m) {
	m[0] = 1.
	m[1] = 0.
	m[2] = 0.
	m[3] = 0.
	m[4] = 0.
	m[5] = 0.
	m[6] = 0.
	m[7] = 0.
}

let zeroMultivector = new Float32Array(8)
MathematicalMultivector = function(a,b,c,d,e,f,g,h)
{
	let m = new Float32Array(8)
	identity(m)
	if (a !== undefined) m[0] = a
	if (b !== undefined) m[1] = b
	if (c !== undefined) m[2] = c
	if (d !== undefined) m[3] = d
	if (e !== undefined) m[4] = e
	if (f !== undefined) m[5] = f
	if (g !== undefined) m[6] = g
	if (h !== undefined) m[7] = h
	return m
}
let mm = MathematicalMultivector()
let mm1 = MathematicalMultivector()
let mm2 = MathematicalMultivector()

function getVector(mv,target)
{
	target.x = mv[1]
	target.y = mv[2]
	target.z = mv[3]
	return target
}
function getBivec(mv, target)
{
	target.x = mv[4]
	target.y = mv[5]
	target.z = mv[6]
	return target
}

//"conjugate"
function reverse(mv,target) {
	target[0] = mv[0]
	target[1] = mv[1]
	target[2] = mv[2]
	target[3] = mv[3]
	target[4] = -mv[4]
	target[5] = -mv[5]
	target[6] = -mv[6]
	target[7] = -mv[7]
	return target
};

function wedge(a,b) //aka antisymmetric
{
	let p = geometricProduct(a, b)
	let q = geometricProduct(b, a)
	let ret = geometricSum(p,q)
	delete p;
	delete q;
	for(let i = 0; i < 8; i++)
		ret[i] *= .5;
	return ret
}

function multivectorDot(a,b)
{
	return b[0] * a[0] + b[1] * a[1] - b[2] * a[2] - b[3] * a[3] + b[4] * a[4] + b[5] * a[5] - b[6] * a[6] - b[7] * a[7];
}

function generateRandomMultivectorElementsFromScope(scope, seed)
{
	console.assert(scope.length > 0)

	if(seed === undefined)
		seed = Math.random()
	let randomSequence = RandomSequenceSeeded(seed)

	let record = Array(numOperations)
	for(let i = 0; i < numOperations; i++)
		record[i] = randomSequence.getValue() < .5 ? geometricProduct : geometricSum

	let numOperations = 5;
	let generatorScope = []
	for(let i = 0; i < scope.length; i++)
		generatorScope.push(scope[i].elements)
	for(let i = 0; i < numOperations; i++)
	{
		let operandA = generatorScope[ Math.floor( randomSequence.getValue() * generatorScope.length ) ];
		let operandB = generatorScope[ Math.floor( randomSequence.getValue() * generatorScope.length ) ];
		// let operandA = generatorScope[ generatorScope.length - (randomSequence.getValue() < .5 ? 1:2) ];
		// let operandB = generatorScope[ generatorScope.length - (randomSequence.getValue() < .5 ? 1:2) ];

		let result = record[i](operandA,operandB)

		// if(searchArray(generatorScope,result))
		// {
		// 	i--
		// }
		// else
		{
			generatorScope.push(result)
		}
	}

	delete RandomSequenceSeeded
	let ret = generatorScope[generatorScope.length-1]
	for(let i = 0; i < generatorScope.length-1; i++)
		delete generatorScope[i]

	return generatorScope[generatorScope.length-1]
}

function geometricScalarMultiply(scalar, b, target) {
	for(let i = 0; i < 8; ++i)
		target[i] = scalar * b[i]
}

function geometricProduct(a,b,target) //no aliasing
{
	if(target === undefined)
		target = new Float32Array(8)

	b = b ? b : a //and skip the antisymmetric part?

	if(a.isVector3 && b.isVector3)
	{
		target[0] = b.x  * a.x + b.y * a.y  + b.z  * a.z

		target[4] = b.y * a.x - b.x * a.y
		target[5] = b.z * a.x - b.x * a.z
		target[6] = b.z * a.y - b.y * a.z

		return target;
	} //could have a quaternion? and a complex? Oh yeah Chris says check grade. Heh, 

	//from ganja.js
	target[0]= b[0]*a[0] + b[1]*a[1] + b[2]*a[2] + b[3]*a[3] - b[4]*a[4] - b[5]*a[5] - b[6]*a[6] - b[7]*a[7]

	target[1]= b[1]*a[0] + b[0]*a[1] - b[4]*a[2] - b[5]*a[3] + b[2]*a[4] + b[3]*a[5] - b[7]*a[6] - b[6]*a[7]
	target[2]= b[2]*a[0] + b[4]*a[1] + b[0]*a[2] - b[6]*a[3] - b[1]*a[4] + b[7]*a[5] + b[3]*a[6] + b[5]*a[7]
	target[3]= b[3]*a[0] + b[5]*a[1] + b[6]*a[2] + b[0]*a[3] - b[7]*a[4] - b[1]*a[5] - b[2]*a[6] - b[4]*a[7]

	target[4]= b[4]*a[0] + b[2]*a[1] - b[1]*a[2] + b[7]*a[3] + b[0]*a[4] - b[6]*a[5] + b[5]*a[6] + b[3]*a[7]
	target[5]= b[5]*a[0] + b[3]*a[1] - b[7]*a[2] - b[1]*a[3] + b[6]*a[4] + b[0]*a[5] - b[4]*a[6] - b[2]*a[7]
	target[6]= b[6]*a[0] + b[7]*a[1] + b[3]*a[2] - b[2]*a[3] - b[5]*a[4] + b[4]*a[5] + b[0]*a[6] + b[1]*a[7]

	target[7]= b[7]*a[0] + b[6]*a[1] - b[5]*a[2] + b[4]*a[3] + b[3]*a[4] - b[2]*a[5] + b[1]*a[6] + b[0]*a[7]

	// log(target)

	return target;
}

//x is the weird vector
function geometricProductSpacetime(a, b, target)
{
	if(target === undefined)
		target = new Float32Array(8)

	target[0]= b[0]*a[0] + b[1]*a[1] - b[2]*a[2] - b[3]*a[3] + b[4]*a[4] + b[5]*a[5] - b[6]*a[6] - b[7]*a[7];

	target[1]= b[1]*a[0] + b[0]*a[1] + b[4]*a[2] + b[5]*a[3] - b[2]*a[4] - b[3]*a[5] - b[7]*a[6] - b[6]*a[7];
	target[2]= b[2]*a[0] + b[4]*a[1] + b[0]*a[2] + b[6]*a[3] - b[1]*a[4] - b[7]*a[5] - b[3]*a[6] - b[5]*a[7];
	target[3]= b[3]*a[0] + b[5]*a[1] - b[6]*a[2] + b[0]*a[3] + b[7]*a[4] - b[1]*a[5] + b[2]*a[6] + b[4]*a[7];

	target[4]= b[4]*a[0] + b[2]*a[1] - b[1]*a[2] - b[7]*a[3] + b[0]*a[4] + b[6]*a[5] - b[5]*a[6] - b[3]*a[7];
	target[5]= b[5]*a[0] + b[3]*a[1] + b[7]*a[2] - b[1]*a[3] - b[6]*a[4] + b[0]*a[5] + b[4]*a[6] + b[2]*a[7];
	target[6]= b[6]*a[0] + b[7]*a[1] + b[3]*a[2] - b[2]*a[3] - b[5]*a[4] + b[4]*a[5] + b[0]*a[6] + b[1]*a[7];

	target[7]= b[7]*a[0] + b[6]*a[1] - b[5]*a[2] + b[4]*a[3] + b[3]*a[4] - b[2]*a[5] + b[1]*a[6] + b[0]*a[7];
	return target;
};

function geometricSum(a,b,target)
{
	if(target === undefined)
		target = new Float32Array(8)
	for(let i = 0; i < target.length; i++)
		target[i] = a[i] + b[i];

	return target;
}

function randomMultivector(index1,index2,index3)
{
	let multivec = new Float32Array(8)

	if(index1 !== undefined)
		multivec[index1] = Math.random()
	if(index2 !== undefined)
		multivec[index2] = Math.random()
	if(index3 !== undefined)
		multivec[index3] = Math.random()

	return multivec
}

function equalsMultivector(a,b)
{
	for(let i = 0; i < 8; i++)
	{
		if( Math.abs(a[i]-b[i]) > .01 )
			return false
	}

	return true
}

function searchArray(arr,elements)
{
	for(let i = 0; i < arr.length; i++)
	{
		if( equalsMultivector(elements,arr[i].elements) )
		{
			return true
		}
	}

	return false
}

function copyMultivector(fromElements, toElements)
{
	if (fromElements.isVector3)
	{
		toElements[0] = 0.

		toElements[1] = fromElements.x
		toElements[2] = fromElements.y
		toElements[3] = fromElements.z

		toElements[4] = 0.
		toElements[5] = 0.
		toElements[6] = 0.

		toElements[7] = 0.
	}
	else
	{
		for (let i = 0; i < 8; i++)
		{
			toElements[i] = fromElements[i]
		}
	}
}

function areAnyOthersNonZero(arr, elementsToIgnore)
{
	for (let i = 0; i < arr.length; i++)
	{
		if (elementsToIgnore.indexOf(i) !== -1)
			continue;
		else if (arr[i] !== 0.)
			return true;
	}
	return false;
}
function getMultivectorGrade(e)
{
	if (!areAnyOthersNonZero(e, [])) //only blades can have a grade?
		return -1;

	if (e[0] !== 0. && !areAnyOthersNonZero(e, [0]))
		return 0;
	if ((e[1] !== 0. || e[2] !== 0. || e[3] !== 0.) && !areAnyOthersNonZero(e, [1, 2, 3]))
		return 1;
	if ((e[4] !== 0. || e[5] !== 0. || e[6] !== 0.) && !areAnyOthersNonZero(e, [4, 5, 6]))
		return 2;
	if (e[7] !== 0. && !areAnyOthersNonZero(e, [7]))
		return 3;

	return "compound";
}


function gexp(a,target)
{
	if(target ===undefined )
		target = MathematicalMultivector()
	identity(target)

	identity(mm1)

	let inverseIFactorial = 1
	for (let i = 1; i < 15; i++) {
		inverseIFactorial /= i
		let aToThePowerOfIMinus1   = i % 2 ? mm1 : mm2
		let aToThePowerOfI = i % 2 ? mm2 : mm1

		geometricProduct(aToThePowerOfIMinus1, a, aToThePowerOfI)
		
		geometricScalarMultiply(inverseIFactorial, aToThePowerOfI, mm)

		geometricSum(target,mm,target)

		copyMultivector(aToThePowerOfI, aToThePowerOfIMinus1)
	}

	return target
}

// let test = MathematicalMultivector(1., 0., 0., 0., 0., 0., 0., 0.)
// log(Math.E,gexp(test))

let test = MathematicalMultivector(0., 0., 0., 0., TAU / 8., 0., 0., 0.)
log(gexp(test)) //expecting 1.+.5*thingy