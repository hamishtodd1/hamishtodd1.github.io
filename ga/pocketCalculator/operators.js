/*
	Might be the only thing you need to hire someone for.
		Want a skinnable skeletal animation where you can re-impose custom things
		Waifu, fairy, robot, vampire
		Customize it yourself I guess

	Building animations from animations
		Ideally the animations can concatenate into simpler, elegant, cooler, animations
		that are aware of some additional geometric analogy that is possible
			With, say, the reflection of a vector on a bivector, that is an animation that you try to model
		Can detect, for example, that some part is eventually equal to 0. Huh, so it's simplifying the equation
		Once you have built the function for it, it enters your scope, and when you use it from your scope
		it can play out that animation again, rather than having to play out all the atomic operations

	exponential viz (should be an example of animation from animation...)
		The bivectors should change to being angle shaped when you do exp=
		good viz of complex exponential https://twitter.com/panlepan/status/1286968452306141184

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
			can it do sqrt? Steven said he'd take it to desert island...
		If you want to exponentiate, how about this feedback thing/
		Animation:
			You put in a bivector. It becomes an angle wedge, area conserving obv
			The wedge is positioned such that the real line cuts it in half
			If the bivector is red, the resulting complex number is the corner of the wedge clockwise from the real line
		kronecker delta

	"i as the circle constant"
		In schrodinger equation you have i/2pi
		alright so you get an extra constant if you differentiate with respect to angle, maybe that's as it should be?
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

	"make your own function" = levl editor
		It gets all the globals, so at least the two basis vectors
		And some modifyiable multivectors as inputs that you can alter fully
		Do your thing
		And whatever the last thing you create is, that's the output?
*/

async function initOperatorAppearances()
{
	let materials = {
		geometricProduct: new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true /*because transparent part of texture*/ }),
		geometricSum: new THREE.MeshBasicMaterial({ color: 0x80FF00, transparent: true /*because transparent part of texture*/ }),
	}

	let loader = new THREE.TextureLoader()
	loader.crossOrigin = true
	await new Promise(resolve =>
	{
		loader.load("../common/data/frog.png", function (result)
		{
			materials.geometricSum.map = result
			// textures.geometricProduct = result
			materials.geometricProduct.map = result;
			resolve()
		})
	})

	OperatorAppearance = function (func)
	{
		let operatorSymbol = new THREE.Mesh(unchangingUnitSquareGeometry,
			func === geometricSum ? materials.geometricSum.clone() : materials.geometricProduct.clone())
		operatorSymbol.function = func

		operatorSymbol.scale.multiplyScalar(2.)

		return operatorSymbol
	}
}