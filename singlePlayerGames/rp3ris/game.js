/*
    RP3 game: there is a solid ball in the middle, fixed in front of you, fixed orientation. Spherical layers fall. With a hand you can rotate the layer fully

Or maybe the ball is controlled by one hand, the falling stuff by the other

    Can start off with replicating real tetris, so you can only turn around z and it only one block

    There's room for the double cover thing in here. Probably you had this idea in there.
*/

function initGame()
{
    let target = new THREE.Group()
    let layer = new THREE.Group()

    let kiteVerts = Array(4)
    for(let i = 0; i < kiteVerts.length; i++)
        kiteVerts[i] = new THREE.Vector3()
    kiteVerts[0] = new THREE.Vector3(PHI,1.,0.)
    kiteVerts[1] = new THREE.Vector3(1.,1.,1.)
    kiteVerts[2] = kiteVerts[0].clone().lerp(new THREE.Vector3(0.,PHI,1.),.5)

    updateFunctions.push(function()
    {
        rightHand.position.copy(camera.position)
        rightHand.position.z = -1.
    })
}