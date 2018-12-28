/*
 * You make proteins, they do random walks.
 * An interactive version of those blobby diagrams that biologists like to make
 * 
 * This is about protein function emerging from protein geometry. That is interesting.
 * 		Tremendous variety of forms, leading to all diversity from facial features to multicellularity. But their form only matters insofaras it changes the protein's interaction with other things
 * 		All this shit about folding and genetics is just to make a shape (often rigid) with hydrogen bonds in the right places (on the surface)
 * 		A shape whose precise geometry then affects its behaviour, often over the long term. Hydrogen bonds in *exactly* the right place vs slightly off = different behaviour
 * 		attractors (hydrogen bonds, attract each other) and repulsors (which stand in for the rest of it, they repel each other)?
			Simple UI that keeps to the core of it
			No worrying about whole shape at once (which is hard to think about), just placement of points
		But how does it affect their movement? Slightly biases the random walk?
 * 
 * 
 * So this allows for things like: 
 * 		one end binds to one protein, one to another, allowing them to do something together
 * 		binds to a particular place on one protein more effectively than some other protein that is binding to it, stopping that binding
 * 		lots of these simultaneously
 * 
 * Your goal
 * 		Stop the red things from being produced. The thing that could be doing that could change from level to level?
 * 
 * You should be able to control the concentration of your protein
 */

function initProteinGame()
{
	var molA = new THREE.Object3D();
	molA.position.x = 0.2;
	var attractor = new THREE.Mesh(new THREE.CircleGeometry(0.05), new THREE.MeshBasicMaterial({color:0xFF0000}));
	molA.add(attractor);
	scene.add(molA);
}