/*
	you may want to put stuff on the left or the right
	Therefore, "result" needs to be able to switch to right or left
	Therefore, little t-shaped things showing what results from what
	There again, who says right- and left- multiplying is the right thing to do?
	are left and right multiply the same as multiply by conjugate?

	Arguably the add should contain a load of multiplies

	Other operations, ugh
		"to the power of". Gives you square root, reciprocals-> division
		2*pi*i is the real thing https://blog.wolfram.com/2015/06/28/2-pi-or-not-2-pi/
		log, jeez
		Would be nice if that could emerge
		The vector derivative would be nice
		Integral?
*/

async function initOperatorAppearances()
{
	let texture = null
	await new Promise(resolve => {
		new THREE.TextureLoader().load("data/frog.png",function(result)
		{
			texture = result;
			resolve()
		})
	})

	var geometry = new THREE.PlaneGeometry(1.5,1.5)
	OperatorAppearance = function(func)
	{
		let operatorSymbol = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({
			map: texture,
			transparent:true //because transparent part of texture
		}))

		operatorSymbol.function = func
		if(func === geometricProduct)
			operatorSymbol.material.color.setRGB(1.,0.,0.)

		return operatorSymbol
	}
}