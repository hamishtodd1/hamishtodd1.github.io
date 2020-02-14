/*
	you may want to put stuff on the left or the right
	Therefore, "result" needs to be able to switch to right or left
	Therefore, little t-shaped things showing what results from what
	There again, who says right- and left- multiplying is the right thing to do?
	are left and right multiply the same as multiply by conjugate?

	Arguably the add should contain a load of multiplies. Er, other way around surely?

	Other operations, ugh
		Derivative is taken with respect to whatever is varying them in the output
		"to the power of"
			Gives you square root, reciprocals-> division
			Possibly only power of scalars matters
		log, jeez
		ideally it only takes scalars
		Would be nice if that could emerge
		Integral?
		e^ is very good because you don't even have to give two inputs

	"i as the circle constant"
		2*pi*i is the real thing https://blog.wolfram.com/2015/06/28/2-pi-or-not-2-pi/
		d/dt i^(2*t) - suspicious, you might think that that'd be d/dt (-1)^t = 0
		https://blog.wolfram.com/2015/06/28/2-pi-or-not-2-pi/ concludes 2*pi*i is very appealing
		of interest because it looks soooo much more elegantcould have a "pow" that only takes in scalars
		On the other hand
			radians is good for arclength and area considerations
			and it differentiates better. Or does it? Maybe it is more natural for pi to fall out of differentiating?
		Look it's ok from a visual standpoint
		Radians to degrees is just a scalar conversion. You can have radians to a base-4 system as well. Consider .54...+i.84... - that is e^i, the unit of our rotation system. Degrees is asking about the complex number .9998+i.017. possibly e^i makes differentiation easier, that is believable but better check. Point is though, the default base of your power and log can be the pseudoscalar for many cases
*/

async function initOperatorAppearances()
{
	let materials = {
		geometricProduct:new THREE.MeshBasicMaterial({color:0xFF0000,transparent:true /*because transparent part of texture*/ }),
		geometricSum:new THREE.MeshBasicMaterial({color:0x80FF00,transparent:true /*because transparent part of texture*/ }),
	}

	let loader = new THREE.TextureLoader()
	loader.crossOrigin = true
	await new Promise(resolve => {
		loader.load("data/frog.png",function(result)
		{
			materials.geometricSum.map = result
			// textures.geometricProduct = result
			resolve()
		})
	})

	await new Promise(resolve => {
		loader.load("data/frog.png",function(result)
		{
			materials.geometricProduct.map = result;
			resolve()
		})
	})

	OperatorAppearance = function(func)
	{
		let operatorSymbol = new THREE.Mesh( unchangingUnitSquareGeometry, 
			func===geometricSum ? materials.geometricSum.clone():materials.geometricProduct.clone() )
		operatorSymbol.function = func

		return operatorSymbol
	}
}