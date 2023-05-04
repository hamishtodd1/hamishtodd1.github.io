/*
    TODO 1D
        make a curve with a weight paint. It should have a little thickness
        Bones
            4 because fuck indexing
            You can move, rotate, scale the bones                               


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
    initMouse()

    let bones = Array()
    let boneGeo = new THREE.IcosahedronGeometry(.1, 2)
    boneGeo.computeBoundingBox()
    class Bone extends DqMesh {
        constructor(col) {
            super(
                boneGeo,
                new THREE.MeshPhongMaterial({ color: col })
            )

            bones.push(this)
            grabbables.push(this)
            scene.add(this)
            this.dq.translator(Math.random() - .5, Math.random() - .5 + 1.6, 0.)
        }

        onMouseMove(mvmt) {
            // mvmt.log(`translator`, 30)
            // log(mvmt)
            this.dq.mul( mvmt, dq0 )
            this.dq.copy(dq0)
            
            // delta.log()
        }

        onClick() {

        }
    }
    new Bone(0xFF0000)
    new Bone(0x00FF00)
    new Bone(0x0000FF)
    new Bone(0xFFFFFF)

    class TheCurve extends THREE.Curve {

        getPoint(t, optionalTarget = new THREE.Vector3()) {

            const tx = t * 3 - 1.5;
            const ty = Math.sin(2 * Math.PI * t);
            const tz = 0;

            return optionalTarget.set(tx, ty, tz)
        }

    }

    const path = new TheCurve()
    const curveGeo = new THREE.TubeGeometry(path, 127, .02, 7, false)
    const mesh = new THREE.Mesh(curveGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
    mesh.position.y += 1.6
    scene.add(mesh)
}