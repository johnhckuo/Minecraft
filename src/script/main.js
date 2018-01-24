import '../scss/reset.scss';
import '../scss/main.scss';
import './sky.js';

import grass from "../img/grass.png";
import moon from "../img/moon.jpg";

import dat from 'dat.gui/build/dat.gui.js'
import Stats from './Stats.js';
import ImprovedNoise from './ImprovedNoise.js';

import 'three';
import 'three/OrbitControls';

var scene, camera, renderer, controls, stats, sky;
var boxSize = 3000;
var planeY = -boxSize/2 ;
var now, hours, minutes, lastMinute;
var parent, sunLight, moonLight, spinRadius = boxSize;
var materialArray = [];
var testCounter = 240;
var totalMinute = 1440;
var starParticle;
var cubeNumber =400;
var originCube;
var manual = false, speedUp = true;
var loader = new THREE.TextureLoader();
var worldWidth = boxSize, worldDepth = boxSize;
var cubeSize = 100, terrainMaxHeight = 5;
var seed = 0.0, terrain;

function terrain_init(){

    var plane_geometry = new THREE.Geometry();

    var texture = new THREE.TextureLoader().load( grass );
    // texture.magFilter = THREE.NearestFilter;
    // texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.format = THREE.RGBFormat;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    var cube = cube_init(texture);
    var height = generateHeight();
    for (var i = 0 ; i < worldWidth/cubeSize ; i++){
      for (var j = 0 ; j < worldDepth/cubeSize ; j++){
        var y = height[ i * worldDepth + j ];
        cube.position.set(i * cubeSize, y, j * cubeSize);
        cube.updateMatrix();
        plane_geometry.merge(cube.geometry, cube.matrix);
        for (var w = -terrainMaxHeight*cubeSize ; w < y ; w += cubeSize){
          cube.position.set(i * cubeSize, w, j * cubeSize);
          cube.updateMatrix();
          plane_geometry.merge(cube.geometry, cube.matrix);
        }
      }
    }
    var material = new THREE.MeshLambertMaterial({ map: texture, side: THREE.FrontSide });
    terrain = new THREE.Mesh( plane_geometry, material );
    terrain.position.set(-worldWidth/ 2, -terrainMaxHeight*cubeSize/2, -worldDepth/ 2);
    scene.add(terrain);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
}

function generateHeight(){
    var perlin = new ImprovedNoise();
    var height = [];
    var quality = 0.1;
    for (var i = 0 ; i < worldWidth ; i++){
        for (var j = 0 ; j < worldDepth ; j++){
            height.push(Math.floor(perlin.noise(i * quality, j * quality, seed) * terrainMaxHeight) * cubeSize);
        }
    }
    return height;
}

function cube_init(texture) {

    var geometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
    var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });

    var oneFourth = 1/4;
    var half = 1/2;
    var threeFourth = 3/4;

    var oneThird = 1/3;
    var twoThird = 2/3;

    // each face has been shifted counter clockwise once
    var face1 = [new THREE.Vector2(0, twoThird), new THREE.Vector2(0, oneThird), new THREE.Vector2(oneFourth, oneThird), new THREE.Vector2(oneFourth, twoThird)];
    var face2 = [new THREE.Vector2(oneFourth, twoThird), new THREE.Vector2(oneFourth, oneThird), new THREE.Vector2(half, oneThird), new THREE.Vector2(half, twoThird)];
    var top = [new THREE.Vector2(oneFourth, 1), new THREE.Vector2(oneFourth, twoThird), new THREE.Vector2(half, twoThird), new THREE.Vector2(half, 1)];
    var bottom = [new THREE.Vector2(oneFourth, oneThird), new THREE.Vector2(oneFourth, 0), new THREE.Vector2(half, 0), new THREE.Vector2(half, oneThird)];
    var face3 = [new THREE.Vector2(half, twoThird), new THREE.Vector2(half, oneThird), new THREE.Vector2(threeFourth, oneThird), new THREE.Vector2(threeFourth, twoThird)];
    var face4 = [new THREE.Vector2(threeFourth, twoThird), new THREE.Vector2(threeFourth, oneThird), new THREE.Vector2(1, oneThird), new THREE.Vector2(1, twoThird)];

    //This clears out any UV mapping that may have already existed on the cube.
    geometry.faceVertexUvs[0] = [];

    //UV mapping start
    geometry.faceVertexUvs[0][0] = [face1[0], face1[1], face1[3]];
    geometry.faceVertexUvs[0][1] = [face1[1], face1[2], face1[3]];

    geometry.faceVertexUvs[0][2] = [face2[0], face2[1], face2[3]];
    geometry.faceVertexUvs[0][3] = [face2[1], face2[2], face2[3]];

    geometry.faceVertexUvs[0][4] = [top[0], top[1], top[3]];
    geometry.faceVertexUvs[0][5] = [top[1], top[2], top[3]];

    geometry.faceVertexUvs[0][6] = [bottom[0], bottom[1], bottom[3]];
    geometry.faceVertexUvs[0][7] = [bottom[1], bottom[2], bottom[3]];

    geometry.faceVertexUvs[0][8] = [face3[0], face3[1], face3[3]];
    geometry.faceVertexUvs[0][9] = [face3[1], face3[2], face3[3]];

    geometry.faceVertexUvs[0][10] = [face4[0], face4[1], face4[3]];
    geometry.faceVertexUvs[0][11] = [face4[1], face4[2], face4[3]];

    var cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    return cube;

}

$(document).ready(function(){

    scene = new THREE.Scene();

    //////////
    //camera//
    //////////

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 100, 10000 );
    camera.position.z = -1000;
    camera.position.y = 1000;
   // camera.position.y = -boxSize/2;


    ////////////
    //renderer//
    ////////////

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    document.body.appendChild( renderer.domElement );

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

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    /////////////////
    //ambient light//
    /////////////////

    var light = new THREE.AmbientLight( 0x081640 ); // soft moon light
    scene.add( light );

    ////////////
    //sunLight//
    ////////////
    var shadowQuality = 512;

    sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(0, -spinRadius, 0);

    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = shadowQuality;
    sunLight.shadow.mapSize.height = shadowQuality;
    sunLight.shadow.camera.near = 0.5;    // default
    sunLight.shadow.camera.far = boxSize;     // default
    var sunlightRange = boxSize;
    sunLight.shadow.camera.left = -sunlightRange;
    sunLight.shadow.camera.right = sunlightRange;
    sunLight.shadow.camera.top = sunlightRange;
    sunLight.shadow.camera.bottom = -sunlightRange;

    /////////////
    //moonlight//
    /////////////


    moonLight = new THREE.DirectionalLight(0x081640, 0.1);
    moonLight.position.set(0, spinRadius, 0);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = shadowQuality;
    moonLight.shadow.mapSize.height = shadowQuality;
    moonLight.shadow.camera.near = 0.5;    // default
    moonLight.shadow.camera.far = boxSize;     // default
    var moonlightRange = boxSize;
    moonLight.shadow.camera.left = -moonlightRange;
    moonLight.shadow.camera.right = moonlightRange;
    moonLight.shadow.camera.top = moonlightRange;
    moonLight.shadow.camera.bottom = -moonlightRange;

    ////////////
    //sun&moon//
    ////////////

    var geometry = new THREE.SphereGeometry( 25, 32, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xFFFF33, vertexColors: THREE.FaceColors } );
    var moonMaterial =  new THREE.MeshLambertMaterial();
    moonMaterial.map    = loader.load(moon);

    var Sun = new THREE.Mesh( geometry, material );
    var Moon = new THREE.Mesh( geometry, moonMaterial );
    Sun.position.set(0, -spinRadius, 0);
    Moon.position.set(0, spinRadius, 0)

    // parent
    parent = new THREE.Object3D();

    // pivots
    var pivot1 = new THREE.Object3D();
    var pivot2 = new THREE.Object3D();
    var pivot3 = new THREE.Object3D();
    var pivot4 = new THREE.Object3D();
    
    pivot1.add( Sun );
    pivot2.add( Moon );
    pivot3.add( sunLight );
    pivot4.add( moonLight );

    parent.add( pivot1 );
    parent.add( pivot2 );
    parent.add( pivot3 );
    //parent.add( pivot4 );

    scene.add( parent );


    ///////
    //sky//
    ///////


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

    terrain_init();

    //////////////
    //originCube//
    //////////////

    originCube = new THREE.Mesh( geometry, material );
    originCube.position.y = planeY+cubeSize;
    originCube.castShadow = true;
    originCube.receiveShadow = true;
    //scene.add(originCube);

    sunLight.target = originCube;
    moonLight.target = originCube;
    controls.target = new THREE.Vector3(0, planeY+100, 0);    //set camera lookAt()

    //////////
    //skyBox//
    //////////

    sky = new THREE.Sky({side:THREE.FrontSide});
    var skyMesh1 = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(boxSize, boxSize, 1, 1),
      sky.material
    );
    skyMesh1.position.set(boxSize/2, 0, 0);
    skyMesh1.rotation.y = -Math.PI/2;

    var skyMesh2 = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(boxSize, boxSize, 1, 1),
      sky.material
    );
    skyMesh2.position.set(0, 0, boxSize/2);
    skyMesh2.rotation.y = Math.PI;

    var skyMesh3 = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(boxSize, boxSize, 1, 1),
      sky.material
    );
    skyMesh3.position.set(-boxSize/2, 0, 0);
    skyMesh3.rotation.y = Math.PI/2;

    var skyMesh4 = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(boxSize, boxSize, 1, 1),
      sky.material
    );
    skyMesh4.position.set(0, 0, -boxSize/2);

    var skyBox = new THREE.Group();
    skyBox.add( skyMesh1 );
    skyBox.add( skyMesh2 );
    skyBox.add( skyMesh3 );
    skyBox.add( skyMesh4 );
    //scene.add(skyBox);
    skyBox.rotation.x = Math.PI;

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

    now = new Date();
    hours = now.getHours();
    minutes = now.getMinutes();

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
      seed = params.Seed;
      scene.remove(terrain);
      terrain_init();
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
          sky.render({hours:hours, minutes:minutes});
        }else if (!manual){
            hours = now.getHours();
            minutes = now.getMinutes();
        }

        originCube.rotation.x += delta;
        originCube.rotation.y += delta;

        requestAnimationFrame( render );
        renderer.render(scene, camera);
        controls.update();
        stats.update();
        // console.log("textures"+renderer.info.memory.textures)
        // console.log("geometry"+renderer.info.memory.geometries)
        // console.log("Calls: "   + renderer.info.render.calls);
        // console.log("Vertices: "    + renderer.info.render.vertices)
        // console.log("Faces: "   + renderer.info.render.faces);
        // console.log("Points: "  + renderer.info.render.points);
        /*                                                            //this comment can use to reflect real world day/night condition
        skyUpdate(currentMinute);
        */
        var currentMinute = calculateMinute(hours, minutes);
        sunUpdate(currentMinute);


        // if (minutes != lastMinute){
        //     sky.render();
        //     lastMinute = minutes;
        // }


    };

    render();
    window.addEventListener('resize', onWindowResize, false);
});

function createStar(type) {
    var starNumber;
    scene.remove(starParticle);
    if (type == 'max'){
        starNumber = 500;
    }else if ( type == 'normal'){
        starNumber = 250
    }else if (type == 'min'){
        starNumber = 150;
    }else{
        starNumber = 0;
    }


    var geometry = new THREE.Geometry();
    var material = new THREE.PointCloudMaterial( { size: 1 } );
    //top
    for (var i = 0; i < starNumber; i++)
    {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * boxSize - boxSize/2;
        vertex.y = boxSize/2 -2;
        vertex.z = Math.random() * boxSize - boxSize/2;

        geometry.vertices.push( vertex );
         //sunLight.castShadow = true;
    }

    //north
    for (var i = 0; i < starNumber; i++)
    {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * boxSize - boxSize/2;
        vertex.y = Math.random() * boxSize - boxSize/2;
        vertex.z = boxSize/2 -1;

        geometry.vertices.push( vertex );
        //sunLight.castShadow = true;
    }

    //west
    for (var i = 0; i < starNumber; i++)
    {
        var vertex = new THREE.Vector3();
        vertex.x = boxSize/2 -1;
        vertex.y = Math.random() * boxSize - boxSize/2;
        vertex.z = Math.random() * boxSize - boxSize/2;

        geometry.vertices.push( vertex );
        //sunLight.castShadow = true;
    }

    //south
    for (var i = 0; i < starNumber; i++)
    {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * boxSize - boxSize/2;
        vertex.y = Math.random() * boxSize - boxSize/2;
        vertex.z = -boxSize/2 +1;

        geometry.vertices.push( vertex );
                //sunLight.castShadow = true;
    }

    //east
    for (var i = 0; i < starNumber; i++)
    {
        var vertex = new THREE.Vector3();
        vertex.x = -boxSize/2 +1;
        vertex.y = Math.random() * boxSize - boxSize/2;
        vertex.z = Math.random() * boxSize - boxSize/2;

        geometry.vertices.push( vertex );
        //sunLight.castShadow = true;
    }

    starParticle = new THREE.PointCloud( geometry, material );
    //create mesh and add to scene
    scene.add(starParticle);



}


function sunUpdate(currentMinute){

    var timeSplice = 2*Math.PI/totalMinute;
    parent.rotation.z = timeSplice*currentMinute;

}


function landscapeUpdate (currentMinute){

    //Keep in code - Written by Computerhope.com
    //Place this script in your HTML heading section

   // document.write('It\'s now: ', hours, '<br><br>');
    //document.bgColor="#CC9900";
    var hour = Math.floor(currentMinute/60);
    switch (hour){
        case 1 :
            generateSky([0, '#00000c']);
            createStar('max');

            break;

        case 2 :
            generateSky([0.85, '#020111',1, '#191621']);
            createStar('max');
            break;

        case 3 :
            generateSky([0.6, '#020111',1, '#20202c']);
            createStar('max');

            break;

        case 4 :
            generateSky([0.1, '#020111',1, '#3a3a52']);
            createStar('normal');
            break;

        case 5 :
            generateSky([0, '#20202c',1, '#515175']);
            createStar('normal');

            break;

        case 6 :
            generateSky([0, '#40405c',0.8, '#6f71aa',1, '#8a76ab']);
            createStar('min');
            break;

        case 7 :
            generateSky([0, '#4a4969',0.5, '#7072ab',1, '#cd82a0']);
            createStar('min');
            break;

        case 8 :
            generateSky([0, '#757abf',0.6, '#8583be',1, '#eab0d1']);
            createStar('none');
            break;

        case 9 :
            generateSky([0, '#82addb',1, '#ebb2b1']);
            createStar('none');
            break;

        case 10 :
            generateSky([0.01, '#94c5f8',0.7, '#a6e6ff',1, '#b1b5ea']);
            createStar('none');
            break;

        case 11 :
            generateSky([0, '#b7eaff',1, '#94dfff']);
            createStar('none');
            break;

        case 12 :
            generateSky([0, '#9be2fe',1, '#67d1fb']);
            createStar('none');
            break;

        case 13 :
            generateSky([0, '#90dffe',1, '#38a3d1']);
            createStar('none');
            break;

        case 14 :
            generateSky([0, '#57c1eb',1, '#246fa8']);
            createStar('none');
            break;

        case 15 :
            generateSky([0, '#2d91c2',1, '#1e528e']);

            createStar('none');
            break;

        case 16 :
            generateSky([0, '#2473ab',0.7, '#1e528e',1, '#5b7983']);
            createStar('min');
            break;

        case 17 :
            generateSky([0, '#1e528e',0.5, '#265889',1, '#9da671']);
            createStar('min');

            break;

        case 18 :
            generateSky([0, '#1e528e',0.5, '#728a7c',1, '#e9ce5d']);
            createStar('min');


            break;

        case 19 :
            generateSky([0, '#154277',0.3, '#576e71',0.7, '#e1c45e',1,"#b26339"]);
            createStar('normal');

            break;

        case 20 :
            generateSky([0, '#163C52',0.3, '#4F4F47',0.6, '#C5752D',0.8, '#B7490F',1, '#2F1107']);
            createStar('normal');

            break;

        case 21 :
            generateSky([0, '#071B26',0.3, '#071B26',0.8, '#8A3B12',1, '#240E03']);
            createStar('normal');
/*
            sunLight.shadowCameraLeft = -10;
            sunLight.shadowCameraRight = 10;
            sunLight.shadowCameraTop = 10;
            sunLight.shadowCameraBottom = -10;
*/
            break;

        case 22 :
            generateSky([0.3, '#010A10',0.8, '#59230B',1, '#2F1107']);
            createStar('normal');
            break;

        case 23 :
            generateSky([0.5, '#090401',1, '#4B1D06']);
            createStar('max');
            break;

        case 24 :
            generateSky([0.8, '#00000c',1, '#150800']);
            createStar('max');
            break;


    }
    //return gradient;
}

function calculateMinute(hours,minute){
    var currentMinute = hours*60 + minutes;
    return currentMinute;
}

function generateTexture(size,gradients) {



    // create canvas
    canvas = document.createElement( 'canvas' );
    canvas.width = size;
    canvas.height = size;

    // get context
    var context = canvas.getContext( '2d' );

    // draw gradient
    context.rect( 0, 0, size, size );
    var gradient = context.createLinearGradient( -size/2, 0, -size/2, size );
    for (var i = 0 ; i < gradients.length ; i+=2){
        gradient.addColorStop(gradients[i], gradients[i+1]);
    }


    //gradient = changeColor(gradient);

    context.fillStyle = gradient;
    context.fill();

    return canvas;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
