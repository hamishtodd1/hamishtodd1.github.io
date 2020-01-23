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

function generateRandomMultivectorElementsFromScope(scope, seed)
{
	console.assert(scope.length > 0)

	if(seed === undefined)
		seed = Math.random()
	let randomSequence = RandomSequenceSeeded(seed)

	let numOperations = 5;
	let generatorScope = []
	for(let i = 0; i < scope.length; i++)
		generatorScope.push(scope[i].elements)
	for(let operation = 0; operation < numOperations; operation++)
	{
		let operandA = generatorScope[ Math.floor( randomSequence.getValue() * generatorScope.length ) ];
		let operandB = generatorScope[ Math.floor( randomSequence.getValue() * generatorScope.length ) ];
		// let operandA = generatorScope[ generatorScope.length - (randomSequence.getValue() < .5 ? 1:2) ];
		// let operandB = generatorScope[ generatorScope.length - (randomSequence.getValue() < .5 ? 1:2) ];

		let functionToUse = randomSequence.getValue() < .5 ? geometricProduct : geometricSum;

		let result = functionToUse(operandA,operandB)

		// if(searchArray(generatorScope,result))
		// {
		// 	operation--
		// }
		// else
		{
			generatorScope.push(result)
		}
	}

	delete RandomSequenceSeeded

	return generatorScope[generatorScope.length-1]
}

function geometricProduct(a,b,target)
{
	if(target === undefined)
	{
		target = new Float32Array(8)
	}

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

function geometricSum(a,b,target)
{
	if(target === undefined)
	{
		target = new Float32Array(8)
	}
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