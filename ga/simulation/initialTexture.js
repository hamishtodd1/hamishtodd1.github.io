/*
    we visualize it as running horizontally, with x and y but x is long, it ha z too
    tSpace is x in [0.,1.], y in [0.,1.]
    so: if you have xt, yt in the texture, and the texture is "stacks" high
    that corresponds to y = yt, x = xt / stacks, z = floor((xt-x)/stacks)

    we assume coordinates are as usual. Far bottom left corner is 0,0,0
    update your wireframe box to reflect that

    eSpace in [0,1],[0,1],[0,1], tSpace is [0,1],[0,1]
*/

function initUserDefinedField(){

    dimensions = new THREE.Vector2(voxelsWide * voxelsWide, voxelsWide);
    const w = voxelsWide.toString() + `.`
    tSpaceESpaceConversion = `

vec2 eSpaceToTSpace(in vec3 eSpace ) {

    float sx = eSpace.x + floor(eSpace.z * `+w+`); //stacked space
    float tx = sx / `+w+`;
    return vec2( tx, eSpace.y );

}
vec3 tSpaceToESpace(in vec2 tSpace ) {

    float sx = tSpace.x * `+w+`;
    float ex = sx - floor(sx);
    float ez = (floor(sx) + 0.5) / `+w+`;
    return vec3(ex, tSpace.y, ez);

}

`
    let jsStr = tSpaceESpaceConversion
        .replaceAll(`in vec2`, ``).replaceAll(`in vec3`, ``)
        .replaceAll(`float`, `let`)
        .replaceAll(`\nvec2`, `\nfunction`).replaceAll(`\nvec3`, `\nfunction`).replaceAll(`\nvec4`, `\nfunction`)
        .replaceAll(`    vec2`, `    let`).replaceAll(`    vec3`, `    let`).replaceAll(`    vec4`, `    let`)
        .replaceAll(`floor`, `Math.floor`)
        .replaceAll(`vec3`, `v1.set`).replaceAll(`vec2`, `v1_2d.set`)
    eval(jsStr)

    let stateArray = new Float32Array(dimensions.x * dimensions.y * 4)
    let tCoords = new THREE.Vector2()
    
    let ourColor = new THREE.Color()
    putSphereInField = ( center, radius, r=1.,g=0.,b=0. ) => {

        let radiusSq = radius * radius
        for (let row = 0; row < dimensions.y; ++row) {
            for (let column = 0; column < dimensions.x; ++column) {

                tCoords.set((column + .5) / dimensions.x, (row + .5) / dimensions.y)
                let pos = tSpaceToESpace(tCoords) //v1
                //remember you are in the space where xyz is [0,1], [0,1], [0,1]

                let val = 3. * (radiusSq - pos.distanceToSquared(center))
                if (val < 0.)
                    val = 0.

                ourColor.setRGB(r,g,b).multiplyScalar(val)

                let firstIndex = (row * dimensions.x + column) * 4
                stateArray[firstIndex + 0] += ourColor.r
                stateArray[firstIndex + 1] += ourColor.g
                stateArray[firstIndex + 2] += ourColor.b
                stateArray[firstIndex + 3] += 0.

            }
        }
    }    

    return stateArray
}