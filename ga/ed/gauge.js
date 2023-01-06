/*
	You type in one thing
	You type in another thing
	It visualizes the two and animates them collapsing
	Initial example


	Show:
		You get rid of reflections two at a time
		You can't get rid of e0. Can use lower-dimensional analogy to explain why
		A given gauge is “applying a transform to a pair of planes”
		Why in the quaternions, ij = k   (e12*e23=e1223=e13)
		Yes, if you have two reflections side by side like e12, you can turn that into -e21
		There is no such thing as a "screwflection" in 3D	
		Mirrors "cancel" in a manner at least slightly analogous to common factors


	First figure out exactly where it fits in
	Should you do it in the context of ed? Might make sense, sounds like you're not making new visualizations!

	As an ed thing:
		The animation replaces the lines with the right-angle-crossed mirrors
		Lets you label!

	Ed does the coordinate system, this does the metric part
	
	Want to have labels of the elements GEE IF ONLY THERE WERE SOME WAY
	Ideally, you can show doing stuff to the algebra
	
	You can never gauge elements away from the surface
	The infinity sphere is best thought of as ePlusMinus

	Maybe this thing should also have:
		-the sandwich. And therefore presumably orientations!
		-show lots of 2D so you can say the eye thing
		-Is there a gauge visualization for commuting two planes? Applying one of the reflections, perhaps
*/

function initGauge() {
	log("hey")

	let dqAppearances = appearanceTypes.find((at)=>at.glslName === "Dq" && !at.isArray ).appearances
	dqAppearances.forEach((a)=>{
		log(a)
	})
}