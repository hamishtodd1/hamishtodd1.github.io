/*
	One button to deplete a limited fuel reservoir that makes your acceleration positive
	Another to abstract over all amounts of time you could have done that for
		immediate benefit: if there's only one that makes it, you're sorted!
		And if there's some teeny tiny little gap that only works with frame-perfect timing, you can definitely make it
		Even if there's a series of 2 where you have to have the first then the second

		Angry birds / a thing where you do one parabola after another might be better

	Marketing
		"A platformer that you must win... on average"

	If you're careful enough with the colors, you can play flappy bird with a single pixel.
	And therefore, play an R2 of flappy birds

	Motivation
		Metaphysically interesting;
		morally interesting;
		teaches statistics;
		pushes games medium forward;
		addresses your simulations vs games concerns
		Visually interesting

	Hey, it's how drug developers work!

	Protagonist very small, can be turned into point. doesn't go too fast.

	Little comic books

	Claim: the flappy bird extrusion game IS the probability game
	You extrude all the possibilities then pick one? Do you have a timer?
	It's predictable, it's kind of about phase space too

	Ivan: there's at least a bit of a cognitive gap between "this is the right series of actions" and "this is scientifically something I know the outcome of"

	You COULD try to be faithful about it being a continuum

	There's a theoretical maximum speed someone can hammer a button.

	Aesthetics
		Switch from essentially-orthographic to perspective
		Crush3D-esque "pop" sound
*/
function initFlappyBird()
{
	let avatarVelocity = new THREE.Vector3(0,0.,0.);

	let avatars = Array(50)
	let geo = new THREE.CircleBufferGeometry(0.01,32)
	let mat = new THREE.MeshBasicMaterial({color:0xF0000})
	for(let i = 0; i < avatars.length; i++)
	{
		avatars[i] = new THREE.Mesh(geo,mat)
		scene.add(avatars[i])
	}

	let backdrop = new THREE.Mesh(new THREE.PlaneGeometry(20,0.1,80));
	for(let i = 0; i < backdrop.geometry.vertices.length/2; i++)
	{
		backdrop.geometry.vertices[i].y = 0.1 * Math.random()
	}
	backdrop.position.y -= 0.5
	scene.add(backdrop)

	bindButton("z",function()
	{
		avatarVelocity.x = 0.01
		avatarVelocity.y += 0.015;
	})

	bindButton("x",function()
	{
		camera.rotation.y = -0.8
		camera.position.x -= 0.6

		for(let i = 0; i < avatars.length; i++)
		{
			avatars[i].position.z = 0.02 * i;
		}
	})

	camera.position.z = 1

	updateFunctions.push(function()
	{
		if(avatarVelocity.x !== 0 && avatarVelocity.y > -0.011)
		{
			avatarVelocity.y -= 0.0003;
		}
		for(let i = 0; i < avatars.length; i++)
		{
			avatars[i].position.add( avatarVelocity );
		}

		camera.position.x += avatarVelocity.x;
	})
}