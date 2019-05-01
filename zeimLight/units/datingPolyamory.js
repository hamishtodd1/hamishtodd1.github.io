/*
	The way to phrase stratification: with two random (heterosexuals of the same gender)
	Give them both a pile of pictures of N people, what is the probability that they rank their attractiveness in the same order?
	If stratification is 0, probability is 1/N!
	I don't know if anyone has done this experiment, but if there are any psychologists out there, you can try to figure out this parameter
	Could animate/graph this

	TODO
		Parameters
			Max partners
			Number of people in population who are poly
			Spending time with your partner makes you how happy?
			How jealousy affects your happiness level?
			Getting the partner you want makes you how happy?
				Important parameters; if people would actually be just as happy with any partner so long as they had one, then one extra lonely person is a bigger deal. Maybe we could say that as a society we should adjust what makes us happy; be more demanding of time spent with partners.
		Visuals
			More attractive = more green? more wide?
			Arms that grasp each other. Poly people get multiple arms
			They should probably have a bit of drift/vibrate to keep it visually interesting
			Smiles
			The "pairing" "animation" - initially shown slowly, then can happen once per frame, then multiple per frame
				A single sim ranks those that it finds the most attractive
					Do the most generally attractive sims get first pick? Probably
				One by one it sends a projectile (envelope with love heart) towards another
				A bond is made, and they get closer til they collide as hard spheres

	The thing that should make us a little sad in the monogamous world: poly people are sad that they are not having fun that they could otherwise have

	Script
		Intro
			If I'm perfectly honest, I think there's a reasonable probability that you'll just be bored by this, it builds in so many assumptions. But that's maths.
			Introduce argument
			"Stooping" "settling"
		Model
			One of the most important mathematical or game theoretic results is called the stable marriage theore
			Basically it might mean that incels get MORE sex, because people don’t have to pledge as much to give them a small amount
			To think about different kinds of society we need a way to assess it, and what I have is a slightly hybrid utilitarianism
				If there’s even one person who has a higher probability of being lonely, that does suck for them
			Are we talking about relationships or sex? Probably relationships.
		Then we bring in gender
			Alpha men hogging all women.
			Note that at the Edinburgh poly meetup, most attendees are female. Not a surprise though, it benefits them?

	Title
		"Simulating red pill sex philosophy"
		"Simulating polyamory: happier or sadder?"

	Nice to have ("for a sequel folks! Let me know if you think these would make a difference")
		In a society with more movies or whatever, things will be homogenized. Show a movie and a few individuals will be made much more attractive
		One way gender might matter is it could turn out that homosexual relationships are better poly than hetero because of this age thing
		A combo of mono and poly people
		Forget about gender to begin with
			Gender could affect how fussy you are
			Make them blue and pink
		All creatures are equally accessible to all
		Polyamorous people less happy? Maybe some folks are gonna revolt too?
		Should prooooobably be allowed to vary how many of them are polyamorous
			Correlation between attractiveness and being poly
		Another benefit of polyamory: when you break up with someone you’re not as lonely
		“If you want to be with someone in a monogamous world, you’ll want to be with them in a poly world” to what extent is that true?

	https://docs.google.com/document/d/1KbcixmjXkL57k9IX_l7O7ZPnSKb_eVgJUWvm6ExE3uI/edit
*/

function initPolyamory()
{
	// let slideFileNames = [
	// 	//note that you should have a few...
	// 	"redPill.png",
	// 	"rooshV.png",
	// ]
	// initImagesAndVideos(slideFileNames)

	{	
		//what would be good is: every time there is a change of smiliness anywhere, this doesn't get updated until a copy of the smile goes over and hits it

		let height = 0.1
		let padding = height * 0.1

		let label = makeTextSign("Smiliness :)", false, false, true)
		label.scale.multiplyScalar(0.1)
		label.position.y = height + padding*2

		let meter = new THREE.Mesh(new THREE.OriginCorneredPlaneBufferGeometry(1,height))
		meter.position.z += 0.01
		meter.position.x += 0.01
		meter.position.y += 0.01
		meter.scale.x = Math.random()

		let happinessMeter = new THREE.Mesh(new THREE.OriginCorneredPlaneBufferGeometry(1,height+padding*2),new THREE.MeshBasicMaterial({color:0x666666}))
		happinessMeter.add(label,meter)
		happinessMeter.scale.multiplyScalar(0.8)
		toysToBeArranged.push(happinessMeter)
		// scene.add(happinessMeter)

		// let happiness = 0
		// for(let i = 0; i < peeps.length; i++)
		// {
		// 	if( 1 ) //veeeeeery naieve! Want a bullet-pointy menu for it
		// 	{
		// 		happiness += peep.partners.length
		// 	}
		// }
	}

	{
		var visibilityPanel = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(), new THREE.MeshBasicMaterial());
		visibilityPanel.position.z = -0.1
		visibilityPanel.position.y = 0.08
		visibilityPanel.scale.setScalar(0.3)
		// bestowDefaultMouseDragProperties(visibilityPanel)
		scene.add(visibilityPanel);

		var signs = [];
		signs.push(makeTextSign( "What causes happiness?" ));
		signs.push(makeTextSign( "A relationship" ))
		signs.push(makeTextSign( "A relationship with an attractive person" ))
		signs.push(makeTextSign( "living in a society THAT ISN'T CORRUPTED!!!!" ))

		var onColor = new THREE.Color(0x808080)
		var offColor = new THREE.Color(0xFFFFFF);
		
		for(var i = 0; i < signs.length; i++)
		{
			signs[i].scale.multiplyScalar(0.15)
			signs[i].position.x = 0.5;
			signs[i].position.y = (0.9 - 0.24 * i);
			signs[i].position.z = 0.01;
			
			visibilityPanel.add(signs[i]);

			if(i)
			{
				signs[i].children[0].material.color.copy(onColor)
				clickables.push(signs[i]);
				signs[i].onClick = function()
				{
					var toSetTo = 1 - allPolyhedra[0][this.text+"Mesh"].material.opacity;
					for(var j = 0; j < allPolyhedra.length; j++)
					{
						allPolyhedra[j][this.text+"Mesh"].material.opacity = toSetTo;
					}

					if(toSetTo)
					{
						this.material.color.copy(onColor)
					}
					else
					{
						this.material.color.copy(offColor)
					}
				}
			}
		}
	}
	return


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