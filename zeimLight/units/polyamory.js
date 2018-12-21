/*
	Forget about gender to begin with
		Gender could affect how fussy you are
		Make them blue and pink

	Your location shouldn't matter at all
		If it does the "field" should probably be toroidal or whatever?

	If I'm perfectly honest, I think there's a reasonable probability that you'll just be bored by this, it builds in so many assumptions. But that's maths.

	The "pairing" "animation" - initially shown slowly, then can happen once per frame, then multiple per frame
		A single sim ranks those that it finds the most attractive
			Do the most generally attractive sims get first pick? Probably
		One by one it sends a projectile (envelope with love heart) towards another
		A bond is made, and they get closer til they collide as hard spheres

	They should probably have a bit of drift to keep it visually interesting

	Visualization of their happiness levels
		Fun side-effect: you can make a claim about how much less happy polyamorous people are
		You want to be able to say how happy you think poly people and non poly people and lonely people are
		Utility score is total happiness, and you might want to have some subtraction because "SOCIETY HAS BECOME CORRUPTED"

	Should prooooobably be allowed to vary how many of them are polyamorous
		Arms that grasp each other. Poly people get multiple arms

	"Artificially increase your market value" - makeup. Claim is that incels cannot increase their market value

	If anyone has things they'd like to add to the model then suggest them by all means

	stable marriage theorem

	Having your polyamory maximum will strengthen their argument

	"Stooping" "settling"

	"Simulating red pill sex philosophy

	Maybe you should allow a combo of mono and poly people

	Animation

	It's more red pill than incel
*/

function initPolyamory()
{
	let peeps = Array(30)
	let peepGeometry = new THREE.CircleBufferGeometry(0.02,32)

	let eyeGeometry = new THREE.CircleBufferGeometry(0.007)
	let eyeMaterial = new THREE.MeshBasicMaterial()
	let pupilGeometry = new THREE.CircleBufferGeometry(0.002)
	let pupilMaterial = new THREE.MeshBasicMaterial({color:0x000000})

	for(let i = 0; i < peeps.length; i++)
	{
		peeps[i] = new THREE.Mesh(peepGeometry)
		peeps[i].position.x = 0.5
		peeps[i].position.applyAxisAngle(zUnit,i/peeps.length*TAU)
		peeps[i].partners = []

		peeps[i].pupils = [
			new THREE.Mesh(pupilGeometry,pupilMaterial),
			new THREE.Mesh(pupilGeometry,pupilMaterial)
		]
		peeps[i].add( new THREE.Mesh(eyeGeometry,eyeMaterial).add(peeps[i].pupils[0]) )
		peeps[i].add( new THREE.Mesh(eyeGeometry,eyeMaterial).add(peeps[i].pupils[1]) )

		scene.add(peeps[i])
		//ddoes monogamy lead to more people being in relationships
	}

	let edgeGeometry = CylinderBufferGeometryUncentered(0.001,1,15)
	let edges = []
	function Edge(start,end)
	{
		if( start.partners.indexOf( end ) !== -1 )
		{
			return;
		}

		start.partners.push(end);
		end.partners.push(start);

		let edge = new THREE.Mesh( edgeGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
		edge.castShadow = true;
		scene.add(edge)

		edge.place = function()
		{
			this.position.copy(start.position)
			pointCylinder(this, end.position)
		}
		edge.place();
		
		edges.push(edge)
	}

	for(let i = 0;i<peeps.length;i++)
	{
		for(let j = i+1; j < peeps.length; j++)
		{
			Edge(peeps[i],peeps[j])
		}
	}

	function pointCylinder(cylinderMesh, end)
	{
		let startToEnd = end.clone().sub(cylinderMesh.position);
		cylinderMesh.scale.set(1,startToEnd.length(),1);
		cylinderMesh.quaternion.setFromUnitVectors(yUnit,startToEnd.normalize());
		cylinderMesh.quaternion.normalize();
	}
}