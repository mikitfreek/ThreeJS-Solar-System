/////////////////////////////////////
// Projekt: Układ Słoneczny - PGK
// Mikołaj Osial Informatyka Stosowana 2 Rok UŁ WFiS

/////////////////////////////////////
// SCALE

let d=.02, o=0, r=1,  //1:1
// let d=.015, o=5, r=5,  

///// PLANETS
// - distance from sun
distScale = d,
// - orbit time
orbScale = o,
// - radius 
radScale = r

///// MOONS
moonDistScale = 1 //3
moonRadScale = 1 //50


/////////////////////////////////////
//          ŹRÓDŁA
/////////////////////////////////////
// https://nasa3d.arc.nasa.gov/
// https://solarsystem.nasa.gov/planets/overview/
// https://en.wikipedia.org/wiki/Solar_System
/////////////////////////////////////

/////////////////////////////////////
//          STEROWANIE
/////////////////////////////////////
// WSAD - kąt lotu; Q,E - obrót; R - akceleracja; F - hamowanie
// Sterowanie kamerą za pomocą lewego przycisku myszy,
// wysoka prędkość podróży ją blokuje.

// Axes helpers, grid
function helpers(light){
    const helper = new THREE.PointLightHelper(light)
    scene.add(helper)

    // axesHelper
    // scene.add(new THREE.AxesHelper(5000))

    const grid = new THREE.GridHelper(80000, 100, 0xffffff, 0xffffff);
    grid.material.opacity = 0.1;
    grid.material.transparent = true;
    scene.add(grid);

    // Ship axesHelper
    // ship.add(new THREE.AxesHelper(.03))
}
//////////////////////////////////////////////////////////////

// Components
let scene, camera, renderer, controls,
// Objects
    ship,
    sun, sunAuraGroup,
    mercury,
    venus,
    earth, moon,
    mars,
    jupiter, 
    saturn, 
    uranus,
    neptune,
    moons = {
        mars:[],
        jupiter:[], 
        saturn:[], 
        uranus:[],
        neptune:[]
    },
// Utility
    direction = new THREE.Vector3(),
    shipDirection = new THREE.Vector3(),
    keycontrols = {
        left: false,
        up: false,
        right: false,
        down: false,
        flipLeft: false,
        flipRight: false,
        forward: false,
        backward: false
    },
    axisX, axisY, axisZ,
    axisSpeed = .005,
    spd = 0, speed = 0, angle = 0,
    elapsed, _elapsed = 0, tick = 0, //time related
    orbits = {
        mercury,
        venus,
        earth,
        moon,
        mars,
        jupiter,
        saturn,
        uranus,
        neptune
    },
    moonsOrbits = {
        mars:[],
        jupiter:[], 
        saturn:[], 
        uranus:[],
        neptune:[]
    },
    dist = 2344.5*distScale, orb = orbScale, rad = 63781/radScale,
    moonDist = 2344.5*moonDistScale
    moonRad = 63781/moonRadScale

const clock = new THREE.Clock(),
///////////////////////////////////
//          Data sheet
///////////////////////////////////
data = {
    sun: {                  // r=695500
        rad: 695500
    },
    mercury: {              // 0.4 AU 88 days r=2439.5
        rad: 2439.5,
        dist: 0.4,
        orb: 0.241              // orb: 88
    },
    venus: {                // 0.7 AU 225 days r=6051.8
        rad: 6051.8,
        dist: 0.7,
        orb: 0.6164             // orb: 225
    },
    earth: {                // 1 AU = 8.3 light-min from sun, 149 598 000km; 1 moon r=6378.1
        rad: 6378.1,
        dist: 1,
        orb: 1,                 // orb: 365
        moon: {                 // r=1738.1
            rad: 1738.1,
            dist: 0.00257,
            orb: 0.0758
        }
    },
    mars: {                 // 1.5 AU 1.88 years 2 moons r=3396.2
        rad: 3396.2,
        dist: 1.5,
        orb: 1.88,
        moons: [
            {
                rad: 22.2,
                dist: 9377/149598000,
                orb: 1.7691/365
            },
            {
                rad: 16.6,
                dist: 23460/149598000,
                orb: 3.5512/365
            }
        ]
    },
    jupiter: {              // 5.2 AU 11.86 years 79 moons r=71492
        rad: 71492,
        dist: 5.2,
        orb: 11.86,
        moons: [
            {
                rad: 1821.6,
                dist: 421700/149598000,
                orb: 1.7691/365
            },
            {
                rad: 1560.8,
                dist: 671034/149598000,
                orb: 3.5512/365
            },
            {
                rad: 2634.1,
                dist: 1070412/149598000,
                orb: 7.1546/365
            },
            {
                rad: 2410.3,
                dist: 1882709/149598000,
                orb: 16.689/365
            }
        ]
    },
    saturn: {               // 9.5 AU 29.45 years 62 moons r=60268
        rad: 60268,
        dist: 9.5,
        orb: 29.45,
        moons: [
            {
                rad: 396/2,
                dist: 185539/149598000,
                orb: 0.9/365
            },
            {
                rad: 504/2,
                dist: 237948/149598000,
                orb: 1.4/365
            },
            {
                rad: 1062/2,
                dist: 294619/149598000,
                orb: 1.9/365
            },
            {
                rad: 1123/2,
                dist: 377396/149598000,
                orb: 2.7/365
            },
            {
                rad: 1527/2,
                dist: 527108/149598000,
                orb: 4.5/365
            },
            {
                rad: 5149/2,
                dist: 1221870/149598000,
                orb: 16/365
            },
            {
                rad: 1470/2,
                dist: 3560820/149598000,
                orb: 79/365
            }
        ]
    },
    uranus: {               // 19.8 AU 84 years 27 moons r=25559
        rad: 25559,
        dist: 19.8,
        orb: 84,
        moons: [
            {
                rad: 235.8,
                dist: 129390/149598000,
                orb: 1.41348/365
            },
            {
                rad: 1157.8/2,
                dist: 191020/149598000,
                orb: 2.52038/365
            },
            {
                rad: 1169.4/2,
                dist: 266300/149598000,
                orb: 4.14418/365
            },
            {
                rad: 1576.8/2,
                dist: 435910/149598000,
                orb: 8.70587/365
            },
            {
                rad: 1576.8/2,
                dist: 583520/149598000,
                orb: 13.4632/365
            }
        ]
    },
    neptune: {              // 30.1 AU 164.81 years 14 moons r=24764
        rad: 24764,
        dist: 30.1,
        orb: 164.81,
        moons: [
            {
                rad: 420/2,
                dist: 117646/149598000,
                orb: 1.1223/365
            },
            {
                rad: 2705.2/2,
                dist: 354759/149598000,
                orb: -5.8769/365
            },
            {
                rad: 357/2,
                dist: 5513800/149598000,
                orb: 360.13/365
            }
        ]
    }
}

///////////////////////////////////////////////////////////////////
//                          CODE
///////////////////////////////////////////////////////////////////
init()
animate()

function frame()
{
    // time symulation
    elapsed = clock.getElapsedTime();

    if(elapsed - _elapsed >= 1 / 50) {
        tick += 2*Math.PI / 360 / 60 / 20
        if(tick>=2*Math.PI) tick = 0
        _elapsed=elapsed
        // console.log(elapsed)
    }

    // Sun animation
    sunAnimation(10)
    // 2D behavior
    sun.lookAt(camera.position)

    // Orbits
    setOrbits();

    // Speed, axis control and camera follow
    activeControls()
}

function activeControls() {
    // Speed control
    speed = Math.pow(spd, 3) / 20000000
    if (keycontrols.forward && spd<1000) { // max speed
            spd += 1
            updateUI()
    }
    if (keycontrols.backward && spd>=1) { // 0 minimum
            spd -= 1
            updateUI()
    }

    // Rotate controls
    axisX=0; axisY=0; axisZ=0
    if (keycontrols.up)     axisX-=axisSpeed
    if (keycontrols.down)   axisX+=axisSpeed
    if (keycontrols.right)  axisY-=axisSpeed
    if (keycontrols.left)   axisY+=axisSpeed
    if (keycontrols.flipLeft)   axisZ-=axisSpeed
    if (keycontrols.flipRight)  axisZ+=axisSpeed
    rotateObjectAngle(ship, axisX, axisY, axisZ)
    if (keycontrols.right || keycontrols.left) updateUI()

    // Camera follow
    camera.getWorldDirection(direction)
    ship.getWorldDirection(shipDirection)

    angle = THREE.Math.radToDeg(Math.atan2(shipDirection.x, shipDirection.z))

    ship.position.add(shipDirection.multiplyScalar(speed)) // movement
    controls.target.set(ship.position.x, ship.position.y, ship.position.z)
    direction.subVectors(camera.position, controls.target)
    direction.normalize()
}

function rotateObjectAngle(object, axisX, axisY, axisZ) {
    object.rotateX(axisX)
    object.rotateY(axisY)
    object.rotateZ(axisZ)
}

function orbit(a, b, s, c=0) {
    let x = a * Math.cos(tick/s),
        y = b * Math.sin(tick/s),
        z = c * Math.sin(tick/s)
        // console.log([tick/(2*Math.PI)], [earth.position.x])
    return {x, z, y}
}

function sunAnimation(sunspeed) {
    for (let i=0; i < 9; i++) {
        if(i!=8) {
            if(i%2!=0) sunAuraGroup.children[i].rotation.x += Math.random() * (.00001 * sunspeed) + (i+1)/(10000-Math.random()*100)
            else sunAuraGroup.children[i].rotation.x -= Math.random() * (.00001 * sunspeed) + (i+1)/(10000-Math.random()*100)
        }
        else sunAuraGroup.children[i].rotation.y += .00002*orbScale
    }
}

function setOrbits() {
    orbits.mercury=orbit(
        data.mercury.dist*dist,
        data.mercury.dist*dist,
        data.mercury.orb/orb
    )
    mercury.position.set(orbits.mercury.x, orbits.mercury.z, orbits.mercury.y)

    orbits.venus=orbit(
        data.venus.dist*dist,
        data.venus.dist*dist,
        data.venus.orb/orb
    )
    venus.position.set(orbits.venus.x, orbits.venus.z, orbits.venus.y)

    orbits.earth=orbit(
        data.earth.dist*dist,
        data.earth.dist*dist,
        data.earth.orb/orb
    ) 
    earth.position.set(orbits.earth.x, orbits.earth.z, orbits.earth.y)

    orbits.moon=orbit(
        data.earth.moon.dist*moonDist,
        data.earth.moon.dist*moonDist,
        data.earth.moon.orb/orb
    )
    moon.position.set(orbits.earth.x + orbits.moon.x,
        orbits.earth.z + orbits.moon.z, orbits.earth.y + orbits.moon.y)

    orbits.mars=orbit(
        data.mars.dist*dist,
        data.mars.dist*dist,
        data.mars.orb/orb
    )
    mars.position.set(orbits.mars.x, orbits.mars.z, orbits.mars.y)
    for (let i=0; i<data.mars.moons.length; i++) {
        moonsOrbits.mars[i]=orbit(
            data.mars.moons[i].dist*moonDist,
            data.mars.moons[i].dist*moonDist,
            data.mars.moons[i].orb/orb
        )
        moons.mars[i].position.set(orbits.mars.x + moonsOrbits.mars[i].x,
            orbits.mars.z + moonsOrbits.mars[i].z, orbits.mars.y + moonsOrbits.mars[i].y)
    }
    
    orbits.jupiter=orbit(
        data.jupiter.dist*dist,
        data.jupiter.dist*dist,
        data.jupiter.orb/orb
    )
    jupiter.position.set(orbits.jupiter.x, orbits.jupiter.z, orbits.jupiter.y)
    for (let i=0; i<data.jupiter.moons.length; i++) {
        moonsOrbits.jupiter[i]=orbit(
            data.jupiter.moons[i].dist*moonDist,
            data.jupiter.moons[i].dist*moonDist,
            data.jupiter.moons[i].orb/orb,
            -data.uranus.moons[i].dist*moonDist/4
        )
        moons.jupiter[i].position.set(orbits.jupiter.x + moonsOrbits.jupiter[i].x,
            orbits.jupiter.z + moonsOrbits.jupiter[i].z, orbits.jupiter.y + moonsOrbits.jupiter[i].y)
    }
    
    orbits.saturn=orbit(
        data.saturn.dist*dist,
        data.saturn.dist*dist,
        data.saturn.orb/orb
    )
    saturn.position.set(orbits.saturn.x, orbits.saturn.z, orbits.saturn.y)
    for (let i=0; i<data.saturn.moons.length; i++) {
        moonsOrbits.saturn[i]=orbit(
            data.saturn.moons[i].dist*moonDist,
            data.saturn.moons[i].dist*moonDist,
            data.saturn.moons[i].orb/orb,
            -data.saturn.moons[i].dist*moonDist
        )
        moons.saturn[i].position.set(orbits.saturn.x + moonsOrbits.saturn[i].x,
            orbits.saturn.z + moonsOrbits.saturn[i].z, orbits.saturn.y + moonsOrbits.saturn[i].y)
    }

    orbits.uranus=orbit(
        data.uranus.dist*dist,
        data.uranus.dist*dist,
        data.uranus.orb/orb
    )
    uranus.position.set(orbits.uranus.x, orbits.uranus.z, orbits.uranus.y)
    for (let i=0; i<data.uranus.moons.length; i++) {
        moonsOrbits.uranus[i]=orbit(
            data.uranus.moons[i].dist*moonDist,
            data.uranus.moons[i].dist*moonDist,
            data.uranus.moons[i].orb/orb,
            data.uranus.moons[i].dist*moonDist
        )
        moons.uranus[i].position.set(orbits.uranus.x + moonsOrbits.uranus[i].x,
            orbits.uranus.z + moonsOrbits.uranus[i].z, orbits.uranus.y + moonsOrbits.uranus[i].y)
    }

    orbits.neptune=orbit(
        data.neptune.dist*dist,
        data.neptune.dist*dist,
        data.neptune.orb/orb
    )
    neptune.position.set(orbits.neptune.x, orbits.neptune.z, orbits.neptune.y)
    for (let i=0; i<data.neptune.moons.length; i++) {
        moonsOrbits.neptune[i]=orbit(
            data.neptune.moons[i].dist*moonDist,
            data.neptune.moons[i].dist*moonDist,
            data.neptune.moons[i].orb/orb
        )
        moons.neptune[i].position.set(orbits.neptune.x + moonsOrbits.neptune[i].x,
            orbits.neptune.z + moonsOrbits.neptune[i].z, orbits.neptune.y + moonsOrbits.neptune[i].y)
    }
}

function animate()
{
	requestAnimationFrame(animate)
    frame()
	controls.update()
	render()
}

function init() {
    setControls()

    scene = new THREE.Scene()
    const fov = 30 //45
    const aspect = window.innerWidth / window.innerHeight
    const near = 0.002
    const far = 7000
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    
    controls = new THREE.OrbitControls(camera)
    // controls.addEventListener( 'change', render );
    controls.maxDistance = 0.25
    controls.minDistance = 0.07
    
    const color = 0xFFF8CC
    const intensity = 1
    const light = new THREE.PointLight(color, intensity)
    light.position.set(0, 0, 0)
    light.castShadow = true 
    light.shadow.mapSize.width = 4096
    light.shadow.mapSize.height = 4096
    light.shadow.camera.near = 0.01
    light.shadow.camera.far = 7000
    scene.add(light)

    var light2 = new THREE.AmbientLight(0x404040);
    scene.add(light2);
    
    // object constructor
    const Object3D = function() {
        THREE.Mesh.apply(this, arguments)
    }
    Object3D.prototype = Object.create(THREE.Mesh.prototype)
    Object3D.prototype.constructor = Object3D
    
    // shadows helper
    // const planeGeo = new THREE.PlaneGeometry(90,3)
    // const planeMat = new THREE.MeshStandardMaterial({color: 0x00ff00 })
    // const plane = new Object3D(planeGeo, planeMat)
    // plane.castShadow = false
    // plane.receiveShadow = true
    // plane.position.set(0, 0, 100)
    // scene.add(plane)
    // plane.rotation.x = Math.PI
    
    ///////////////////////////////////////////
    //  Materials
    const loader = new THREE.TextureLoader();

    const moonsMat = new THREE.MeshStandardMaterial({
        map: loader.load('textures/2k_ceres_fictional.jpg')
    })
    ///////////////////////////////////////////

    // Ship
    const shipGeo = new THREE.TorusKnotGeometry(.004, 0.0016, 80, 8)//new THREE.CubeGeometry(.01,.005,.06)
    const shipMat = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        emissive: 0xdddddd,
        transparent: false,
        // wireframe: true,
        roughness: .5,
        metalness: .5
    })
    ship = new THREE.Object3D()
    _ship = new Object3D(shipGeo, shipMat)
    _ship.rotation.x = - Math.PI / 2
    _ship.rotation.z = - .75 * Math.PI / 4
    _ship.castShadow = true
    _ship.receiveShadow = true
    ship.add(_ship)
    ship.castShadow = true
    ship.receiveShadow = true
    scene.add(ship)
    ship.position.set(dist-2, 0, .5)
    // ship.lookAt(new THREE.Vector3(0, 0, 109))
    // Sun
    const sunGeo = new THREE.SphereGeometry(10.9/4.8)// object is 4.8 times larger bcs of group
    const sunMat = new THREE.MeshStandardMaterial({
        // color: 0xfce570,
        emissive: 0xf2ab38,
        // transparent: false
    })
    sun = new Object3D(sunGeo, sunMat)
    sunAuraGroup = new THREE.Group()
    const sunTmp = sun.clone()
    for (let i=1; i < 10; i++) {
        const sunAura = sunTmp.clone()
        const scale = 1 + (4+i/4)*i/12
        sunAura.scale.set(scale, scale, scale)
        sunAura.material = new THREE.MeshStandardMaterial({
            // color: 0xfce570,
            emissive: 0xf2ab38,
            map: loader.load('textures/2k_sun.jpg'),
            transparent: true,
            opacity: 0.8
        })
        //sunAura.material.needsUpdate = true
        sunAuraGroup.add(sunAura)
    }
    sun.castShadow = false
    sun.add(sunAuraGroup)
    scene.add(sun)

    // mercury
    const mercuryGeo = new THREE.SphereGeometry(0.04)
    const mercuryMat = new THREE.MeshStandardMaterial({
        map: loader.load('textures/planets/2k_mercury.jpg')
    })
    mercury = new Object3D(mercuryGeo, mercuryMat)
    mercury.castShadow = true
    mercury.receiveShadow = true
    mercury.domlabel = document.createElement( 'div' );
    mercury.domlabel.innerHTML = 'Object ';
    mercury.domlabel.style.display = 'none';
    mercury.domlabel.style.position = 'absolute';
    document.body.appendChild( mercury.domlabel );
    scene.add(mercury)
    // mercury.position.set(0, 0, 150)

    // venus
    const venusGeo = new THREE.SphereGeometry(0.06)
    const venusMat = new THREE.MeshStandardMaterial({
        map: loader.load('textures/planets/2k_venus_atmosphere.jpg')
    })
    venus = new Object3D(venusGeo, venusMat)
    venus.castShadow = true
    venus.receiveShadow = true
    scene.add(venus)
    // venus.position.set(0, 0, 150.5)

    // Earth
    const earthGeo = new THREE.SphereGeometry(data.earth.rad/rad)
    const earthMat = new THREE.MeshStandardMaterial({
        map: loader.load( 'textures/planets/earth/2k_earth_daymap.jpg' )
    })
    earth = new Object3D(earthGeo, earthMat)
    ///////////
    const earthTmp = earth.clone()
    const earthClouds = earth.clone()
    ///////////
    for (let i=1; i < 5; i++) {
        const earthAtmo = earthTmp.clone()
        const scale2 = 1 + i/24
        earthAtmo.scale.set(scale2, scale2, scale2)
        earthAtmo.material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.05
        })
        earth.add(earthAtmo)
    }
    ///////////
    const scale3 = 1.01
    earthClouds.scale.set(scale3, scale3, scale3)
    earthClouds.material = new THREE.MeshStandardMaterial({
        map: loader.load( 'textures/planets/earth/2k_earth_clouds.jpg' ),
        alphaMap: loader.load( 'textures/planets/earth/2k_earth_clouds.jpg' ),
        blending: 1,
        transparent: true
    })
    earthClouds.castShadow = true
    earthClouds.receiveShadow = true
    earth.add(earthClouds)
    ///////////
    earth.castShadow = true
    earth.receiveShadow = true
    scene.add(earth)
    // earth.position.set(0, 0, 151)
    
    // moon
    const moonGeo = new THREE.SphereGeometry(data.earth.moon.rad/moonRad)
    const moonMat = new THREE.MeshStandardMaterial({
        map: loader.load( 'textures/planets/earth/2k_moon.jpg' )
    })
    moon = new Object3D(moonGeo, moonMat)
    moon.castShadow = true
    moon.receiveShadow = true
    scene.add(moon)
    // moon.position.set(0, 0, 151.5)

    // Mars
    const marsGeo = new THREE.SphereGeometry(data.mars.rad/rad)
    const marsMat = new THREE.MeshStandardMaterial({
        map: loader.load( 'textures/planets/2k_mars.jpg' )
    })
    mars = new Object3D(marsGeo, marsMat)
    mars.castShadow = true
    mars.receiveShadow = true
    scene.add(mars)
    // mars.position.set(0, 0, 152)
    // moons
    for (let i=0; i<data.mars.moons.length; i++) {
        moonsGeo = new THREE.SphereGeometry(data.mars.moons[i].rad/moonRad)
        moons.mars[i] = new Object3D(moonsGeo, moonsMat)
        moons.mars[i].castShadow = true
        moons.mars[i].receiveShadow = true
        scene.add(moons.mars[i])
        // console.log(data.mars.moons[i].rad)
    }

    // jupiter
    const jupiterGeo = new THREE.SphereGeometry(data.jupiter.rad/rad)
    const jupiterMat = new THREE.MeshStandardMaterial({
        map: loader.load('textures/planets/2k_jupiter.jpg')
    })
    jupiter = new Object3D(jupiterGeo, jupiterMat)
    jupiter.castShadow = true
    jupiter.receiveShadow = true
    scene.add(jupiter)
    // jupiter.position.set(0, 0, 154)
    // moons
    for (let i=0; i<data.jupiter.moons.length; i++) {
        moonsGeo = new THREE.SphereGeometry(data.jupiter.moons[i].rad/moonRad)
        moons.jupiter[i] = new Object3D(moonsGeo, moonsMat)
        moons.jupiter[i].castShadow = true
        moons.jupiter[i].receiveShadow = true
        scene.add(moons.jupiter[i])
        // console.log(data.jupiter.moons[i])
    }
    
    // saturn
    const saturnGeo = new THREE.SphereGeometry(data.saturn.rad/rad)
    const saturnMat = new THREE.MeshStandardMaterial({
        map: loader.load( 'textures/planets/2k_saturn.jpg' )
    })
    saturn = new Object3D(saturnGeo, saturnMat)
    saturn.castShadow = true
    saturn.receiveShadow = true
    scene.add(saturn)
    // saturn.position.set(0, 0, 156)
    // moons
    for (let i=0; i<data.saturn.moons.length; i++) {
        moonsGeo = new THREE.SphereGeometry(data.saturn.moons[i].rad/moonRad)
        moons.saturn[i] = new Object3D(moonsGeo, moonsMat)
        moons.saturn[i].castShadow = true
        moons.saturn[i].receiveShadow = true
        scene.add(moons.saturn[i])
        // console.log(data.saturn.moons[i].rad)
    }


    // uranus
    const uranusGeo = new THREE.SphereGeometry(data.uranus.rad/rad)
    const uranusMat = new THREE.MeshStandardMaterial({
        map: loader.load( 'textures/planets/2k_uranus.jpg' )
    })
    uranus = new Object3D(uranusGeo, uranusMat)
    uranus.castShadow = true
    uranus.receiveShadow = true
    scene.add(uranus)
    // uranus.position.set(0, 0, 158)
    // moons
    for (let i=0; i<data.uranus.moons.length; i++) {
        moonsGeo = new THREE.SphereGeometry(data.uranus.moons[i].rad/moonRad)
        moons.uranus[i] = new Object3D(moonsGeo, moonsMat)
        moons.uranus[i].castShadow = true
        moons.uranus[i].receiveShadow = true
        scene.add(moons.uranus[i])
        // console.log(data.uranus.moons[i].rad)
    }

    // neptune
    const neptuneGeo = new THREE.SphereGeometry(data.neptune.rad/rad)
    const neptuneMat = new THREE.MeshStandardMaterial({
        map: loader.load( 'textures/planets/2k_neptune.jpg' )
    })
    neptune = new Object3D(neptuneGeo, neptuneMat)
    neptune.castShadow = true
    neptune.receiveShadow = true
    scene.add(neptune)
    // neptune.position.set(0, 0, 160)
    // moons
    for (let i=0; i<data.neptune.moons.length; i++) {
        moonsGeo = new THREE.SphereGeometry(data.neptune.moons[i].rad/moonRad)
        moons.neptune[i] = new Object3D(moonsGeo, moonsMat)
        moons.neptune[i].castShadow = true
        moons.neptune[i].receiveShadow = true
        scene.add(moons.neptune[i])
        // console.log(data.neptune.moons[i].rad)
    }
    
    // Skybox
    const genCubeUrls = function (prefix, postfix) {
        return [
            prefix + 'px' + postfix, prefix + 'nx' + postfix,
            prefix + 'py' + postfix, prefix + 'ny' + postfix,
            prefix + 'pz' + postfix, prefix + 'nz' + postfix
        ]
    }
    const urls = genCubeUrls('textures/cube/nightsky/', '.jpg')
    const cubeloader = new THREE.CubeTextureLoader()
    cubeloader.load(urls, (cubeTexture) => {
        cubeTexture.encoding = THREE.sRGBEncoding
        scene.background = cubeTexture
        // const params = {
        //     color: '#58b0bd',//'#00ACBD',
        //     scale: 8,
        //     flowX: 0.2,
        //     flowY: 0.2
        // }
    })

    ///////////////////////////
    //          UI
    ///////////////////////////

    const stylesp = 'position:fixed;bottom:-10px;color:lightgray;font-family:consolas;'
    const speedp = document.createElement('p')
    speedp.id = 'speed'
    speedp.style.cssText += stylesp + 'right:5px'
    document.body.appendChild(speedp)
   

    const hintp = document.createElement('p')
    hintp.id = 'hint'
    hintp.style.cssText += stylesp + 'left:5px'
    hintp.innerHTML = "Sterowanie: WSAD, QE - obrót, LP Myszy - obrót, R - akceleracja, F - hamowanie"
    document.body.appendChild(hintp)

    updateUI()

    helpers(light)

	renderer = new THREE.WebGLRenderer({ antialias: true})
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setClearColor(0xBAC4CC)
	renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)

	document.body.appendChild(renderer.domElement)

	window.addEventListener('resize', onWindowResize, false)
	animate()
}

function updateUI() {
    const _speedp = document.getElementById('speed')
    _speedp.innerHTML = "angle: " + angle.toFixed(0) + ", speed: " + (speed/23.445).toFixed(6) + " AU/s"

    const _hintp = document.getElementById('hint')
    if (spd>0) _hintp.style.visibility = 'hidden'
    // console.log(speed)
}

function setControls()
{
    document.addEventListener('keydown', function(e) {
        let prevent = true
        switch (e.code) {
            case 'KeyA':
                keycontrols.left = true
                break
            case 'KeyW':
                keycontrols.up = true
                break
            case 'KeyD':
                keycontrols.right = true
                break
            case 'KeyS':
                keycontrols.down = true
                break
            case 'KeyE':
                keycontrols.flipRight = true
                break
            case 'KeyQ':
                keycontrols.flipLeft = true
                break
            case 'KeyR':
                keycontrols.forward = true
                break
            case 'KeyF':
                keycontrols.backward = true
                break
            default:
                prevent = false
        }
        // Avoid the browser to react unexpectedly
        if (prevent) {
            e.preventDefault()
        } else {
            return
        }
    })
    document.addEventListener('keyup', function(e) {
        let prevent = true
        switch (e.code) {
            case 'KeyA':
                keycontrols.left = false
                break
            case 'KeyW':
                keycontrols.up = false
                break
            case 'KeyD':
                keycontrols.right = false
                break
            case 'KeyS':
                keycontrols.down = false
                break
            case 'KeyE':
                keycontrols.flipRight = false
                break
            case 'KeyQ':
                keycontrols.flipLeft = false
                break
            case 'KeyR':
                keycontrols.forward = false
                break
            case 'KeyF':
                keycontrols.backward = false
                break
            default:
                prevent = false
        }
        // Avoid the browser to react unexpectedly
        if (prevent) {
            e.preventDefault()
        } else {
            return
        }
    })
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)

	render()
}

function render() {
	renderer.render(scene, camera)
}
