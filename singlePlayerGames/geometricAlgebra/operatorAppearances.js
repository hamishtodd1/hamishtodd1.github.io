/*
	you may want to put stuff on the left or the right
	Therefore, "result" needs to be able to switch to right or left
	Therefore, little t-shaped things showing what results from what
	There again, who says right- and left- multiplying is the right thing to do?
	are left and right multiply the same as multiply by conjugate?
*/

async function initOperatorAppearance()
{
	var geometry = new THREE.PlaneGeometry(1.,1.)

	let texture = null
	await new Promise(resolve => {
		new THREE.TextureLoader().load("data/squarePipe.png",function(result)
		{
			texture = result;
			resolve()
		})
	})

	log(texture)
	OperatorAppearance = function()
	{
		let operatorSymbol = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({
			map: texture,
			color: discreteViridis[0].hex,
			transparent:true //because transparent part of texture
		}))

		return operatorSymbol
	}
}