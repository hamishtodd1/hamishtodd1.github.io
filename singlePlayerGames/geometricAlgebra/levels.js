function Levels()
{
	return [
		{
			singularGoal: 
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.])
			],
			operators: [geometricSum,geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([6.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([3.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.])
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([0.,2.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.])
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([0.,1.,1.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.])
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([0.,0.,0.,0.,1.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.])
			],
			operators: [geometricSum,geometricProduct]
		}
	]
	/*
		,
		{
			singularGoal:
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.])
			],
			operators: [geometricSum,geometricProduct]
		}
	*/
}