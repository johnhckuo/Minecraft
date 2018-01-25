import '../scss/reset.scss';
import '../scss/main.scss';
import 'three';
import 'three/OrbitControls';

import dat from 'dat.gui/build/dat.gui.js'
import Stats from './lib/Stats.js';
import RendererStats from './lib/threex.rendererstats.js';

import './sky.js';
import './terrain.js';

import grass from "../img/grass.png";
import moon from "../img/moon.jpg";

var scene, camera, renderer, controls, stats, sky, rendererStats;
var boxSize = 900;
var now, hours, minutes, lastMinute;
var parent, sunLight, moonLight, spinRadius = boxSize, lightOffset = 0.5, PI15 = Math.PI * 1.5, PI05 = Math.PI * 0.5;
var starParticle;
var manual = false, speedUp = true;
var loader = new THREE.TextureLoader();
var worldWidth = boxSize, worldDepth = boxSize;
var worldHalfWidth = worldWidth/2, worldHalfDepth = worldDepth / 2;
var terrain, cubeSize = 30, terrainMaxHeight = 3, seed = 0.0;

init();

function init(){

    scene = new THREE.Scene();

    //////////
    //camera//
    //////////

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 50, 20000 );
    camera.position.z = -1000;
    camera.position.y = 1000;

    ////////////
    //renderer//
    ////////////

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.appendChild( renderer.domElement );

    ////////
    //Stat//
    ////////

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
    document.body.appendChild(stats.domElement);

    rendererStats	= new RendererStats()
    rendererStats.domElement.style.position	= 'absolute'
    rendererStats.domElement.style.left	= '0px'
    rendererStats.domElement.style.bottom	= '0px'
    document.body.appendChild( rendererStats.domElement )

    ////////////
    //controls//
    ////////////

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    /////////////////
    //ambient light//
    /////////////////

    var light = new THREE.AmbientLight( 0x081640 ); // soft moon light
    scene.add( light );

    ////////////
    //sunLight//
    ////////////

    sunLight = new THREE.DirectionalLight(0xffffff, 1);

    sunLight.position.set(0, -spinRadius, 0);
    var lightRange = Math.sqrt(worldHalfWidth * worldHalfWidth + worldHalfDepth * worldHalfDepth);
    var lightQuality = 512;

    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = lightQuality;
    sunLight.shadow.mapSize.height = lightQuality;
    sunLight.shadow.camera.near = boxSize /2 ;    
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
    moonLight.shadow.camera.near = boxSize /2 ;    
    moonLight.shadow.camera.far = boxSize * 2;  

    moonLight.shadow.camera.left = -lightRange;
    moonLight.shadow.camera.right = lightRange;
    moonLight.shadow.camera.top = lightRange;
    moonLight.shadow.camera.bottom = -lightRange;
    
    ////////////
    //sun&moon//
    ////////////

    var geometry = new THREE.SphereGeometry( cubeSize * 2, 16, 16 );

    var Sun = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xFFFF33, vertexColors: THREE.FaceColors } ) );
    var Moon = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {map: loader.load(moon)} ) );
    Sun.position.set(0, -spinRadius, 0);
    Moon.position.set(0, spinRadius, 0)

    parent = new THREE.Group();

    parent.add( Sun );
    parent.add( Moon );
    parent.add( sunLight );
    parent.add( moonLight );

    parent.rotation.y = Math.PI * 1.25;


    now = new Date();
    hours = now.getHours();
    minutes = now.getMinutes();

    sunUpdate();

    scene.add( parent );

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

    scene.fog = new THREE.FogExp2( 0xAAAAAA, 0.00001 );

    //////////
    //ground//
    //////////

    var terrainMesh = new THREE.Terrain({
                                  worldWidth : worldWidth,
                                  worldDepth : worldDepth,
                                  texture : loader.load( grass ),
                                  terrainMaxHeight : terrainMaxHeight,
                                  cubeSize : cubeSize
                                });
    terrain = new THREE.Mesh( terrainMesh.geometry, terrainMesh.material );
    terrain.position.set(- worldWidth / 2, - terrainMaxHeight * cubeSize / 2, - worldDepth / 2);
    scene.add(terrain);
    terrain.castShadow = true;
    terrain.receiveShadow = true;

    //////////
    //skyBox//
    //////////

    sky = new THREE.Sky({side:THREE.FrontSide});

    //skysphere
    var skyBox = new THREE.Mesh(
      new THREE.SphereBufferGeometry( boxSize, 32, 32),
      sky.material
    );
    skyBox.material.side = THREE.BackSide;
    scene.add(skyBox);
    skyBox.rotation.x = Math.PI;

    /////////
    //panel//
    /////////

    var gui = new dat.GUI({
        height : 5 * 32 - 1
    });

    var params = {
        Hours: hours,
        Minutes: minutes,
        SpeedUp: speedUp,
        Seed: seed
    };

    gui.add(params, 'SpeedUp').onFinishChange(function(){
      speedUp = params.SpeedUp;
    });

    gui.add(params, 'Hours').min(0).max(23).step(1).onChange(function(){
      manual = true;
      sky.render({hours:params.Hours, minutes:params.Minutes});
      hours = params.Hours;
    });

    gui.add(params, 'Minutes').min(0).max(60).step(1).onChange(function(){
      manual = true;
      sky.render({hours:params.Hours, minutes:params.Minutes});
      minutes = params.Minutes;
    });

    gui.add(params, 'Seed').min(0).max(1).step(0.01).onFinishChange(function(){
      //seed = params.Seed;
      scene.remove(terrain);
      //terrain_init();
    });

    ///////////
    //animate//
    ///////////

    var clock = new THREE.Clock();

    var render = function () {
        var delta = clock.getDelta();

        if (speedUp){
            minutes = minutes+1;
            if (minutes >= 60){
                hours = (hours+1)%24;
                minutes = 0;
            }
            gui.__controllers[1].setValue(hours);
            gui.__controllers[2].setValue(minutes);
            sky.render({hours:hours, minutes:minutes});
        }else if (!manual){
            hours = now.getHours();
            minutes = now.getMinutes();
        }

        requestAnimationFrame( render );
        renderer.render(scene, camera);
        controls.update();
        stats.update();
        rendererStats.update(renderer);

        sunUpdate();

    };

    render();
    window.addEventListener('resize', onWindowResize, false);
}


function sunUpdate(){

    var timeSplice = 2*Math.PI/1440;
    parent.rotation.z = timeSplice * (hours*60 + minutes);

    if ((parent.rotation.z < PI15 + lightOffset) && (parent.rotation.z > PI15 - lightOffset)){
        var lightIntensity = ((PI15 + lightOffset) - parent.rotation.z) / (lightOffset * 2);
        sunLight.intensity = lightIntensity >= 1 ? 1 : lightIntensity;
        moonLight.intensity = 1 - (lightIntensity >= 1 ? 1 : lightIntensity);
    }else if ((parent.rotation.z < PI05 + lightOffset) && (parent.rotation.z > PI05 - lightOffset)){
        var lightIntensity = ((PI05 + lightOffset) - parent.rotation.z) / (lightOffset * 2);
        sunLight.intensity = 1 - (lightIntensity >= 1 ? 1 : lightIntensity);
        moonLight.intensity = lightIntensity >= 1 ? 1 : lightIntensity;
    }

    if ((parent.rotation.z < PI15) && (parent.rotation.z > PI05)){
        sunLight.castShadow = true;
        moonLight.castShadow = false;
    }else{
        sunLight.castShadow = false;
        moonLight.castShadow = true;
    }

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
