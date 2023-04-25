/*
    TODO 1D
        Give yourself the ability to inspect the curve with CGA
        Come up with an idea

    TODO
        Because animation, want a timeline with parameters you can put on
        Make a texture you can draw on
        A tube with three bones in it

    Intrinsic triangulation
    Displacement map
    Lighting calculation

    Might be nicer for your "domain of constant curvature" to be a sphere
 */

function init() {
    

    class TheCurve extends THREE.Curve {

        getPoint(t, optionalTarget = new THREE.Vector3()) {

            const tx = t * 3 - 1.5;
            const ty = Math.sin(2 * Math.PI * t);
            const tz = 0;

            return optionalTarget.set(tx, ty, tz)
        }

    }

    const path = new TheCurve()
    const curveGeo = new THREE.TubeGeometry(path, 127, .1, 7, false)
    const mesh = new THREE.Mesh(curveGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
    mesh.position.y += 1.6
    scene.add(mesh)
}