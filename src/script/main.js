import '../scss/reset.scss';
import '../scss/main.scss';
import 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ImprovedNoise from './lib/ImprovedNoise.js';
import {cubeTexture} from "../texture/data.js";

import dat from 'dat.gui/build/dat.gui.js'
import Stats from './lib/Stats.js';

import Sky from './sky.js';
import VoxelWorld from './terrain.js';

import grass from "../img/grass.png";
import moon from "../img/moon.jpg";
import atlas from "../texture/atlas3.png";

// number of blocks hoizontally
const blockCount = 9;
// size of each texture
var tileSize;
var scene, camera, renderer, controls, stats, sky;
var boxSize = 900;
var now, hours, minutes, lastMinute;
var parent, sunLight, moonLight, spinRadius = boxSize, lightOffset = 0.5, PI15 = Math.PI * 1.5, PI05 = Math.PI * 0.5;
var starParticle;
var manual = false, speedUp = true;

const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);
var WorldWidth = 1, WorldDepth = 1;
//var worldHalfWidth = worldWidth/2, worldHalfDepth = worldDepth / 2;
var world, terrain, cellSize = 32, terrainMaxHeight = 40, seed = 1, smooth = 15;
//testing
var test_x = 0, test_y = 0;

init();

function init() {

    const loadingElem = document.querySelector('#loading');
    const progressBarElem = loadingElem.querySelector('.progressbar');
    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transform = `scaleX(${progress})`;
    };

    loadManager.onLoad = () => {
        loadingElem.style.display = 'none';
        // const cube = new THREE.Mesh(geometry, materials);
        // scene.add(cube);
        // cubes.push(cube);  // add to our list of cubes to rotate
    };

    scene = new THREE.Scene();

    //////////
    //camera//
    //////////

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.z = 30;
    camera.position.y = 10;
    camera.position.x = -30;


    ////////////
    //renderer//
    ////////////

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.appendChild(renderer.domElement);

    ////////
    //Stat//
    ////////

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
    document.body.appendChild(stats.domElement);

    ////////////
    //controls//
    ////////////

    controls = new OrbitControls(camera, renderer.domElement);

    /////////////////
    //ambient light//
    /////////////////

    var light = new THREE.AmbientLight( 0x081640 ); // soft moon light
    scene.add( light );

    // var light = new THREE.AmbientLight(0xFFFFFF); // soft moon light
    // scene.add(light);

    ////////////
    //sunLight//
    ////////////

    sunLight = new THREE.DirectionalLight(0xffffff, 1);

    sunLight.position.set(0, -spinRadius, 0);
    var lightRange = Math.sqrt(WorldWidth / 2 * WorldWidth / 2 + WorldDepth / 2 * WorldDepth / 2);
    var lightQuality = 512;

    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = lightQuality;
    sunLight.shadow.mapSize.height = lightQuality;
    sunLight.shadow.camera.near = boxSize / 2;
    sunLight.shadow.camera.far = boxSize * 2;

    sunLight.shadow.camera.left = -lightRange;
    sunLight.shadow.camera.right = lightRange;
    sunLight.shadow.camera.top = lightRange;
    sunLight.shadow.camera.bottom = -lightRange;

    moonLight = new THREE.DirectionalLight(0x081640, 1.0);
    moonLight.position.set(0, spinRadius, 0);

    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = lightQuality;
    moonLight.shadow.mapSize.height = lightQuality;
    moonLight.shadow.camera.near = boxSize / 2;
    moonLight.shadow.camera.far = boxSize * 2;

    moonLight.shadow.camera.left = -lightRange;
    moonLight.shadow.camera.right = lightRange;
    moonLight.shadow.camera.top = lightRange;
    moonLight.shadow.camera.bottom = -lightRange;

    ////////////
    //sun&moon//
    ////////////

    //var spheres = new THREE.SphereGeometry(cellSize, 16, 16);
    
    let planetScale = 5;
    let planetGeo = new THREE.BoxGeometry(cellSize*planetScale, cellSize*planetScale, cellSize*planetScale);

    var Sun = new THREE.Mesh(planetGeo, new THREE.MeshBasicMaterial({ color: 0xFFFF33}));
    var Moon = new THREE.Mesh(planetGeo, new THREE.MeshBasicMaterial({ map: loader.load(moon) }));
    Sun.position.set(0, -spinRadius, 0);
    Moon.position.set(0, spinRadius, 0)

    parent = new THREE.Group();

    parent.add(Sun);
    parent.add(Moon);
    parent.add(sunLight);
    parent.add(moonLight);

    parent.rotation.y = Math.PI * 1.25;


    now = new Date();
    hours = now.getHours();
    minutes = now.getMinutes();

    sunUpdate();

    scene.add(parent);


    /////////
    //light//
    /////////


    // function addLight(x, y, z) {
    //     const color = 0xFFFFFF;
    //     const intensity = 1;
    //     const light = new THREE.DirectionalLight(color, intensity);
    //     light.position.set(x, y, z);
    //     scene.add(light);
    // }
    // addLight(-1, 2, 4);
    // addLight(1, -1, -2);

    /////////
    //cluod//
    /////////
    /*
        // geometry
        var cloudSize = 20;
        var geometry = new THREE.BoxGeometry( cloudSize*2, cloudSize, cloudSize );
    
        // material
        var material = new THREE.MeshBasicMaterial( {
            color: 0xffffff,
            wireframe: true
        } );
    
        var mesh = new THREE.Mesh( geometry, material );
    
    
        scene.add( mesh );
    
        var geometry = new THREE.Geometry();
        var material = new THREE.PointCloudMaterial( { size: 1 } );
        for (var i = 0; i < 500; i++)
        {
            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * cloudSize - cloudSize/2;
            vertex.y = Math.random() * cloudSize - cloudSize/2;
            vertex.z = Math.random() * cloudSize - cloudSize/2;
    
            geometry.vertices.push( vertex );
    
        }
    
    
        var particle = new THREE.PointCloud( geometry, material );
    
        mesh.add(particle);
    
        mesh.position.set(10,0,0)
    
    */
    ///////
    //fog//
    ///////

    scene.fog = new THREE.FogExp2(0xAAAAAA, 0.00001);

    //////////
    //ground//
    //////////

    // var terrainMesh = new Terrain({
    //                               worldWidth : worldWidth,
    //                               worldDepth : worldDepth,
    //                               texture : loader.load( grass ),
    //                               terrainMaxHeight : terrainMaxHeight,
    //                               cellSize : cellSize
    //                             });
    // terrain = new THREE.Mesh( terrainMesh.geometry, terrainMesh.material );
    // terrain.position.set(- worldWidth / 2, 0, - worldDepth / 2);
    // scene.add(terrain);
    // terrain.castShadow = true;
    // terrain.receiveShadow = true;

    generate()

    //////////
    //skyBox//
    //////////

    sky = new Sky({ side: THREE.FrontSide });

    //skysphere
    var skyBox = new THREE.Mesh(
        new THREE.SphereBufferGeometry(boxSize, 32, 32),
        sky.material
    );
    skyBox.material.side = THREE.BackSide;
    scene.add(skyBox);
    skyBox.rotation.x = Math.PI;
    sky.render({ hours: now.getHours(), minutes: now.getMinutes() });

    /////////
    //panel//
    /////////

    let gui = new dat.GUI({
        height: 5 * 32 - 1
    });

    var params = {
        Hours: hours,
        Minutes: minutes,
        SpeedUp: speedUp,
        Seed: seed,
        Smooth: smooth,
        MaxHeight: terrainMaxHeight,
        WorldWidth: WorldWidth,
        WorldDepth: WorldDepth,
        X: test_x,
        Y: test_y
    };


    gui.add(params, 'SpeedUp').onFinishChange(function () {
        speedUp = params.SpeedUp;
    });

    gui.add(params, 'Hours').min(0).max(23).step(1).onChange(function () {
        manual = true;
        sky.render({ hours: params.Hours, minutes: params.Minutes });
        hours = params.Hours;
    });

    gui.add(params, 'Minutes').min(0).max(60).step(1).onChange(function () {
        manual = true;
        sky.render({ hours: params.Hours, minutes: params.Minutes });
        minutes = params.Minutes;
    });

    
    gui.add(params, 'X').min(0).max(1000).step(1).onFinishChange(function () {
        test_x = params.X;
        generate()
    });

    gui.add(params, 'Y').min(0).max(1000).step(1).onFinishChange(function () {
        test_y = params.Y;
        generate()
    });


    gui.add(params, 'MaxHeight').min(1).max(100).step(1).onChange(function () {
        terrainMaxHeight = params.MaxHeight;
        generate()
    });

    gui.add(params, 'WorldDepth').min(1).max(4).step(1).onChange(function () {
        WorldDepth = params.WorldDepth;
        generate()
    });

    gui.add(params, 'WorldWidth').min(1).max(4).step(1).onChange(function () {
        WorldWidth = params.WorldWidth;
        generate()
    });

    gui.add(params, 'Smooth').min(2).max(50).step(1).onChange(function () {
        smooth = params.Smooth;
        generate()
    });

    gui.add(params, 'Seed').min(1).max(100).step(1).onChange(function () {
        seed = params.Seed;
        generate()
    });

    ///////////
    //animate//
    ///////////

    var render = function() {
        if (speedUp) {
            minutes = minutes + 1;
            if (minutes >= 60) {
                hours = (hours + 1) % 24;
                minutes = 0;
            }
            gui.__controllers[1].setValue(hours);
            gui.__controllers[2].setValue(minutes);
            sky.render({ hours: hours, minutes: minutes });
        } else if (!manual) {
            hours = now.getHours();
            minutes = now.getMinutes();
        }
    
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        controls.update();
        stats.update();
        sunUpdate();
    
    };

    render();
    window.addEventListener('resize', onWindowResize, false);
}


function sunUpdate() {

    var timeSplice = 2 * Math.PI / 1440;
    parent.rotation.z = timeSplice * (hours * 60 + minutes);

    if ((parent.rotation.z < PI15 + lightOffset) && (parent.rotation.z > PI15 - lightOffset)) {
        var lightIntensity = ((PI15 + lightOffset) - parent.rotation.z) / (lightOffset * 2);
        sunLight.intensity = lightIntensity >= 1 ? 1 : lightIntensity;
        moonLight.intensity = 1 - (lightIntensity >= 1 ? 1 : lightIntensity);
    } else if ((parent.rotation.z < PI05 + lightOffset) && (parent.rotation.z > PI05 - lightOffset)) {
        var lightIntensity = ((PI05 + lightOffset) - parent.rotation.z) / (lightOffset * 2);
        sunLight.intensity = 1 - (lightIntensity >= 1 ? 1 : lightIntensity);
        moonLight.intensity = lightIntensity >= 1 ? 1 : lightIntensity;
    }

    if ((parent.rotation.z < PI15) && (parent.rotation.z > PI05)) {
        sunLight.castShadow = true;
        moonLight.castShadow = false;
    } else {
        sunLight.castShadow = false;
        moonLight.castShadow = true;
    }

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}




function generate() {
    scene.remove(terrain);
    loader.load(atlas, (texture) => {
        //console.log(texture.image.width);
        const tileTextureWidth = texture.image.width;
        const tileTextureHeight = texture.image.height;
        tileSize = tileTextureWidth / blockCount;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        //console.log(temp.sort())
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            //side: THREE.DoubleSide,
            alphaTest: 0.8,
            transparent: true,
            opacity: 1
        });

        world = new VoxelWorld({
            cellSize,
            tileSize,
            tileTextureWidth,
            tileTextureHeight,
        });
        var perlin = new ImprovedNoise();

        //var temp = []
        let waterLevel = 1
        for (let y = 0; y < cellSize; ++y) {
            for (let z = 0; z < cellSize * WorldDepth; ++z) {
                for (let x = 0; x < cellSize * WorldWidth; ++x) {
                    // -1 ~ 1
                    //console.log(x, z)
                    //console.log(x*smooth, z*smooth)
                    //const height = perlin.noise(x / (smooth*3), seed, z / (smooth*3)) * terrainMaxHeight;
                    let height = perlin.noise(x / smooth, seed, z / smooth) * terrainMaxHeight;
                    height = (height + 1 )/2
                    //const height = perlin.noise(x*test_y, seed, z*test_y) * terrainMaxHeight;
                    
                   // temp.push(height)
                    if (height < waterLevel && y <= waterLevel){
                        world.setVoxel(x, y, z, randInt(cubeTexture["water"], cubeTexture["water"]));
                    }
                    else if (y < height) {
                        //world.setVoxel(x, y, z, randInt(1, 17));
                        // 0 ~ 32
                        world.setVoxel(x, y, z, randInt(cubeTexture["land"], cubeTexture["land"]));
                    }
                }
            }
        }
        //console.log(temp)

        for (let worldWidth = 0; worldWidth < WorldWidth; worldWidth++) {
            for (let worldDepth = 0; worldDepth < WorldDepth; worldDepth++) {



                const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(worldWidth, 0, worldDepth);
                const { opacity } = world.generateMaterialDataForCell(worldWidth, 0, worldDepth);

                const positionNumComponents = 3;
                const normalNumComponents = 3;
                const uvNumComponents = 2;
                geometry.setAttribute(
                    'position',
                    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
                geometry.setAttribute(
                    'normal',
                    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
                geometry.setAttribute(
                    'uv',
                    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
                geometry.setIndex(indices);
                console.log(geometry)

                material.setValues({color: '#FFFFFF'})
            }
        }
        //geometry.computeVertexNormals()

        terrain = new THREE.Mesh(geometry, material);
        // terrain.castShadow = true;
        // terrain.receiveShadow = true;
        scene.add(terrain);
        terrain.position.set(-cellSize/2, 0, -cellSize/2);


    });
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

