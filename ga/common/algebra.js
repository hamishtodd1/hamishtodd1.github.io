/*
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
let zeroMultivector = new Float32Array(8)
MathematicalMultivector = function()
{
	return new Float32Array([1., 0., 0., 0., 0., 0., 0., 0.,])
}

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

function geometricProduct(a,b,target)
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
		target[0] = 0.

		target[1] = from.x
		target[2] = from.y
		target[3] = from.z

		target[4] = 0.
		target[5] = 0.
		target[6] = 0.

		target[7] = 0.
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