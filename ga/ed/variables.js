const textarea = document.getElementById("editing")

const inlineDwElem = document.getElementById("inlineDwElem")

const topRightDwElem = document.getElementById('topRightDwElem')
const generalDwAspect = eval(getComputedStyle(topRightDwElem).aspectRatio)

const basicVertex = `void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`

const basicFragment = `void main()
{
    gl_FragColor = vec4(1., 0., 0., 1.);
}`