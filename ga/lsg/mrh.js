/*
    Goal is to render ePlus, properly. Can transform into a hyperboloid
    Send in pss
    With pixel, create ray... wedge with 1-vector

    Pretty likely that point pairs are a separate pass, I mean they're only in one place

    A thing that MIGHT work is to use your norms-ratio approach to get a "distance"
    Yes it's a bizarre distance and it's in minkowski space. It MIGHT work.

    Hey, could even work for Todd Ell
 */

function initMrh() {

    let geo = new THREE.PlaneGeometry(1, 1)
    let mat = new THREE.MeshPhong2Material({})
    mat.injections = [
        {
            type: `vertex`,
            precedes: ``,
            str: egaVerboseGlsl + egaGlsl + `
                out vec4 vPos;
            \n`
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `
                vPos = vec4( transformed, 1. );
            `,
        },
        {
            type: `fragment`,
            precedes: ``,
            str: `
                uniform vec4 extraVec1; //the 1-vector
                in vec4 vPos;
            \n`
        },
        {
            type: `fragment`,
            precedes: `	#include <dithering_fragment>`,
            str: `
                //get Ray from vPos. The pss sent in gives you "basis" for ray's pluckers.
                //Intersect with 1-vector, got 2-vector
                //Figure out distance from camera? Should be possible, "cast" to 1D CGA
                

                if(vPos.x < 0.)
                    gl_FragColor.r = 0.;
            \n`
        },
    ]
    let mesh = new THREE.Mesh(geo, mat)
    mat.extraVec1.set(1., 0., 0., 0.)
    mesh.position.y = 1.6
    mesh.position.x = 1.
    scene.add(mesh)
}