/* residue pair selection

	Single residue (need atoms organized into residues)
	Have sphere selection, with radius that can be varied and makes atoms inside light up.
	
	"here to here along this strand"
		That needs a "spraycan" like tool
	
	Humm, need "undo"
		
	hey shouldn't there be coloring for how far away from you surface is?
	
	Big question: out of order or in sequence order? Will there be any speedups from keeping order?
	
	Superposing is the way that you could "accept or reject" coot's stuff
	
	You know what, there isn't much reason to follow Paul's methods at all. It's already gotten bad, "sphere refine"? That doesn't happen IRL.
*/

/*
 * Obvious control scheme: side button for grabbing whole thing (and scaling if you grab with both), trigger button for grabbing little things
 */

function mobileLoop(socket, cursor, labels) {
	delta_t = ourClock.getDelta();
//	console.log((1/delta_t))

	ourOrientationControls.update();
	
//	if(selector)
//		selector.update();
	
//	if(mutator !== undefined)
//		mutator.update();
//	mutator.rotation.y += 0.01
	
	for(var i = 0; i < labels.length; i++)
		labels[i].update();
	
	socket.send("loopDone")
	
	requestAnimationFrame( function(){
		mobileLoop(socket, cursor, labels);
	} );
	ourStereoEffect.render( scene, camera );
}