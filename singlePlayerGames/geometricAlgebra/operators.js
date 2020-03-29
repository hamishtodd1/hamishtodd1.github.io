/*
	Ideally the animations can concatenate into simpler, elegant, cooler, animations that are aware of some additional geometric analogy that is possible
		Or, well, maybe that doesn't matter. Point is to make yourself a little machine where you tweak the inputs and see the outputs
		You're building animations from animations.
			With, say, the reflection of a vector on a bivector, that is an animation that you try to model
		Once you have built the function for it, it enters your scope, and when you use it from your scope
		it can play out that animation again, rather than having to play out all the atomic operations

	Addition sign in the multivectors?
	Maybe the scalar line wobbles about a lot to show irrelevance of its dir
	The bivectors should change to being angle shaped when you do exp=

	Things learned due to home quarantine: I drink about a liter of some form of diet cola every day. Previously from assorted pubs and shops, now just from local shop. Optimistically it's £500 a year!

	I kinda feel bad about that... except that cola is my one drink I enjoy (+1 hot chocolate/week). I don't like tea, coffee, or alchohol.

	you may want to put stuff on the left or the right
	Therefore, "result" needs to be able to switch to right or left
	Therefore, little t-shaped things showing what results from what
	There again, who says right- and left- multiplying is the right thing to do?
	are left and right multiply the same as multiply by conjugate?

	Arguably the add should contain a load of multiplies. Er, other way around surely?

	Other operations, sigh
		See how far you can get ok
		Derivative is taken with respect to whatever is varying them in the output
		"to the power of"
			Gives you square root, reciprocals-> division
			Possibly only power of scalars matters
		log, jeez
		ideally it only takes scalars
		Would be nice if that could emerge
		Integral?
		e^ is very good because you don't even have to give two inputs
		If you want to exponentiate, how about this feedback thing/
		Animation:
			You put in a bivector. It becomes an angle wedge, area conserving obv
			The wedge is positioned such that the real line cuts it in half
			If the bivector is red, the resulting complex number is the corner of the wedge clockwise from the real line

	The dotted scalar line (dots should be circles of unit diameter btw) moves around fairly randomly

	"i as the circle constant"
		split complex numbers with polar coordinates
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
			materials.geometricProduct.map = result;
			resolve()
		})
	})

	OperatorAppearance = function(func)
	{
		let operatorSymbol = new THREE.Mesh( unchangingUnitSquareGeometry, 
			func===geometricSum ? materials.geometricSum.clone():materials.geometricProduct.clone() )
		operatorSymbol.function = func

		operatorSymbol.scale.multiplyScalar(2.)

		return operatorSymbol
	}
}