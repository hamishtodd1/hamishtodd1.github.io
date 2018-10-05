/*
    Spirals happen naturally. Everyone likes spirals!

    To have them click anywhere or to not have them click anywhere?

    Nice little jam game; just set a goal and a way to get there
*/

function initComplexAnalysis()
{
    let complexPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10,10),new THREE.MeshBasicMaterial({transparent:true,opacity:0.0001}))
    {
        let axesThickness = 0.017
        var axesMaterial = new THREE.MeshBasicMaterial({color:0x000000})
        let reAxis = new THREE.Mesh(new THREE.PlaneBufferGeometry(20,axesThickness),axesMaterial)
        let imAxis = new THREE.Mesh(new THREE.PlaneBufferGeometry(axesThickness,20),axesMaterial)
        let unitCircle = new THREE.Mesh(new THREE.RingBufferGeometry(1-axesThickness/2,1+axesThickness/2,128),axesMaterial)
        complexPlane.add(reAxis,imAxis,unitCircle)
        complexPlane.scale.multiplyScalar(0.3)
        scene.add(complexPlane)
    }

    let cnGeometry = new THREE.SphereBufferGeometry(0.03)
    function ComplexNumber(x,y)
    {
        let cn = new THREE.Mesh(cnGeometry, new THREE.MeshBasicMaterial({color:0x000000}))
        cn.position.set(x,y,0)
        complexPlane.add(cn)

        return cn
    }

    function complexMultiply(a,b,target)
    {
        if(target === undefined)
        {
            target = new THREE.Vector3()
        }
        
        target.x = a.x*b.x - a.y*b.y
        target.y = a.y*b.x + a.x*b.y

        return target
    }

    var adding = false
    bindButton("a",function()
    {
        console.log("addition toggled");
        adding = !adding
    },"Toggle addition")

    let avatar = ComplexNumber(0.1,0.1)
    avatar.material.color.setRGB(1,0,0)

    for(let i = 0; i < 4; i++)
    {
        let multiplier = ComplexNumber(1,0)
        multiplier.position.multiplyScalar(Math.random()*2)
        multiplier.position.applyAxisAngle(zUnit,Math.random()*TAU)
        multiplier.onClick = function()
        {
            if(!adding)
            {
                let newAvatarPosition = complexMultiply( avatar.position, this.position )
                avatar.position.copy(newAvatarPosition)
            }
            else
            {
                avatar.position.add( this.position )
            }
        }
        clickables.push(multiplier)
    }
}