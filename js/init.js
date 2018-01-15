var scene, camera, renderer, controls, stats;    
var boxSize = 2000, skyBox;
var planeY = -boxSize/2 ;
var lastHour;
var parent, sunLight, moonLight, spinRadius = boxSize/2;
var materialArray = [];
var testCounter = 240;
var totalMinute = 1440;
var starParticle;
var cubeNumber =400;
var originCube;
$(document).ready(function(){

    var now = new Date();
    var hours = now.getHours();
    lastHour = hours;

    scene = new THREE.Scene();

    //////////
    //camera//
    //////////

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
    camera.position.z = -500;
    camera.position.y = -800;
   // camera.position.y = -boxSize/2;


    ////////////
    //renderer//
    ////////////

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    document.body.appendChild( renderer.domElement );

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

    

    ////////
    //info//
    ////////

    info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = '#fff';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    info.innerHTML = 'Move mouse to rotate camera; WASD to move';
    document.body.appendChild( info );

    ////////
    //Stat//
    ////////

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
    document.body.appendChild(stats.domElement);

    ////////////
    //CONTROLS//
    ////////////

    controls = new THREE.FirstPersonControls(camera);
    controls.lookSpeed = 0.05;
    controls.movementSpeed = 40;
    controls.noFly = true;
    controls.lookVertical = true;
    controls.constrainVertical = true;
    controls.verticalMin = 1.0;
    controls.verticalMax = 2.0;
   
    ////////
    //axes//
    ////////
/*
    axes = buildAxes( 2500 );
    scene.add(axes);

    
*/

    ////////////
    //sunLight//
    ////////////

    sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(0, -spinRadius, 200);
 //   sunLight.position.multiplyScalar(1.3);

    sunLight.castShadow = true;
   // sunLight.shadowCameraVisible = true;

    sunLight.shadowMapWidth = 2048;
    sunLight.shadowMapHeight = 2048;

    var sunlightRange = boxSize/2;

    sunLight.shadowCameraLeft = -sunlightRange;
    sunLight.shadowCameraRight = sunlightRange;
    sunLight.shadowCameraTop = sunlightRange;
    sunLight.shadowCameraBottom = -sunlightRange;

 //   sunLight.shadowCameraFar = 1000;
    sunLight.shadowDarkness = 0.8;

    scene.add(sunLight);



    /////////////
    //moonlight//
    /////////////


    moonLight = new THREE.DirectionalLight(0xffffff, 0.1);
    moonLight.position.set(0, spinRadius, 200);
 //   moonLight.position.multiplyScalar(1.3);

    moonLight.castShadow = true;
   // moonLight.shadowCameraVisible = true;

    moonLight.shadowMapWidth = 2048;
    moonLight.shadowMapHeight = 2048;

    var moonlightRange = boxSize/2;

    moonLight.shadowCameraLeft = -moonlightRange;
    moonLight.shadowCameraRight = moonlightRange;
    moonLight.shadowCameraTop = moonlightRange;
    moonLight.shadowCameraBottom = -moonlightRange;

 //   moonLight.shadowCameraFar = 1000;
    moonLight.shadowDarkness = 0.1;

    scene.add(moonLight);




    ////////////
    //sun&moon//
    ////////////

    var geometry = new THREE.SphereGeometry( 25, 32, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xFFFF33, vertexColors: THREE.FaceColors } );
    var moonMaterial =  new THREE.MeshLambertMaterial();
    moonMaterial.map    = THREE.ImageUtils.loadTexture('img/moon.jpg')


    // parent
    parent = new THREE.Object3D();
    scene.add( parent );

    // pivots
    var pivot1 = new THREE.Object3D();
    var pivot2 = new THREE.Object3D();
    var pivot3 = new THREE.Object3D();
    var pivot4 = new THREE.Object3D();
    parent.add( pivot1 );
    parent.add( pivot2 );
    parent.add( pivot3 );
    parent.add( pivot4 );

    // mesh
    var Sun = new THREE.Mesh( geometry, material );
    var Moon = new THREE.Mesh( geometry, moonMaterial );


    Sun.position.set(0, -spinRadius, 0);
    Moon.position.set(0, spinRadius, 0)
    pivot1.add( Sun );
    pivot2.add( Moon );
    pivot3.add( sunLight );
    pivot4.add( moonLight );
    parent.position.y = -boxSize/2;


    ///////
    //sky//
    ///////
    var now = new Date();
    var hours = now.getHours();
    var minute = now.getMinutes();
    var currentMinute = calculateMinute(hours, minute);
    landscapeUpdate(currentMinute);


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
    scene.fog = new THREE.FogExp2( 0xffffff, 0.00001 );

   
    //////////
    //ground//    
    //////////

    
    var cubeSize = 50;
    var geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );   
   

    materialArray = [
                    new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'img/grass.jpg' ) ,side: THREE.FrontSide } ), // right
                    new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'img/grass.jpg' ) ,side: THREE.FrontSide } ), // left
                    new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'img/grasstop.jpg' ) ,side: THREE.FrontSide } ), // top
                    new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'img/dirt.jpg' ) ,side: THREE.FrontSide } ), // bottom
                    new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'img/grass.jpg' ) ,side: THREE.FrontSide } ), // back
                    new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'img/grass.jpg' ) ,side: THREE.FrontSide } )  // front
                
                ];          
    
    var material = new THREE.MeshFaceMaterial( materialArray );

    var plane_geometry = new THREE.Geometry();
    var step = boxSize/cubeSize;


    for (var i = -boxSize/2; i < boxSize/2; i+=step) 
    {
        var planeCube = new THREE.Mesh( geometry, material );
        planeCube.castShadow = true;
        planeCube.receiveShadow = true;

        planeCube.position.y = planeY;
        planeCube.position.x = cubeSize + i;
        for (var j = -boxSize/2 ; j < boxSize/2 ; j+=step){
            planeCube.position.z = cubeSize + j;
            planeCube.updateMatrix();
            plane_geometry.merge(planeCube.geometry, planeCube.matrix);
        }
        
        
        

        //sunLight.castShadow = true;
    }

    plane_geometry = generateHeight(plane_geometry);

    var plane = new THREE.Mesh( plane_geometry, material );
    plane.castShadow = true;
    plane.receiveShadow = true;
    scene.add( plane );
    
    //////////////
    //originCube//
    //////////////

    originCube = new THREE.Mesh( geometry, material );
    originCube.position.y = planeY+cubeSize;
    originCube.castShadow = true;
    originCube.receiveShadow = true;
    scene.add(originCube);

    sunLight.target = originCube;
    moonLight.target = originCube;
    controls.target = new THREE.Vector3(0, planeY+100, 0);    //set camera lookAt()
    

    ///////////
    //animate//
    ///////////
    var clock = new THREE.Clock();

    var render = function () {
        var delta = clock.getDelta();

        var now = new Date();
        var hours = now.getHours();
        var minute = now.getMinutes();

        requestAnimationFrame( render );
        renderer.render(scene, camera);
        controls.update(delta); //for cameras

        stats.update();
        /*                                                            //this comment can use to reflect real world day/night condition
        var currentMinute = calculateMinute(hours, minute);
        skyUpdate(currentMinute);
        sunUpdate(currentMinute);
        */

        if (testCounter == totalMinute)
            testCounter = 0;
        //skyUpdate(testCounter);
        //sunUpdate(testCounter);
        testCounter+=2;

    };

    render();
    window.addEventListener('resize', onWindowResize, false);
});

function generateHeight(plane_geometry){

    var cubeCoordinate = [];
    

    var cubeSize = 50;
    var geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );   
    var x,y,z;
     
    
    var material = new THREE.MeshFaceMaterial( materialArray );


    for (var i = 0; i < cubeNumber; i++) 
    {
        var planeCube = new THREE.Mesh( geometry, material );
        planeCube.castShadow = true;
        planeCube.receiveShadow = true;

        
        x = Math.floor((Math.random() * boxSize - boxSize/2)/cubeSize)*cubeSize;
        y = planeY + cubeSize;
        z = Math.floor((Math.random() * boxSize - boxSize/2)/cubeSize)*cubeSize;


        for (var j = 0 ; j < cubeCoordinate.length; j++){
            if (x == cubeCoordinate[j].x && z == cubeCoordinate[j].z){
                if (y <= cubeCoordinate[j].y){
                    y = cubeCoordinate[j].y + cubeSize;
                   
                }
            }


        }
        planeCube.position.x = x;
        planeCube.position.y = y;
        planeCube.position.z = z;

        planeCube.updateMatrix();
        cubeCoordinate.push(planeCube.position);
        plane_geometry.merge(planeCube.geometry, planeCube.matrix);
        
        
        
        

        //sunLight.castShadow = true;
    }
    return plane_geometry;
    
  
    


}

function skyUpdate(currentMinute){

    var hours = Math.floor(currentMinute/60);
    if (hours != lastHour){
        
        landscapeUpdate(currentMinute);
        lastHour = hours;
    }


}



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
   /*
    if (testCounter == 1440)
        testCounter = 0;
    testCounter+=1;


    parent.rotation.z = timeSplice*testCounter;
  */
    
}
// gradient colors from http://cdpn.io/rDEAl
/*var grads = [
  [{color:"00000c",position:0},{color:"00000c",position:0}],1
  [{color:"020111",position:85},{color:"191621",position:100}],2
  [{color:"020111",position:60},{color:"20202c",position:100}],3
  [{color:"020111",position:10},{color:"3a3a52",position:100}],4
  [{color:"20202c",position:0},{color:"515175",position:100}],5
  [{color:"40405c",position:0},{color:"6f71aa",position:80},{color:"8a76ab",position:100}],6
  [{color:"4a4969",position:0},{color:"7072ab",position:50},{color:"cd82a0",position:100}],7
  [{color:"757abf",position:0},{color:"8583be",position:60},{color:"eab0d1",position:100}],8
  [{color:"82addb",position:0},{color:"ebb2b1",position:100}],9
  [{color:"94c5f8",position:1},{color:"a6e6ff",position:70},{color:"b1b5ea",position:100}],10
  [{color:"b7eaff",position:0},{color:"94dfff",position:100}],11
  [{color:"9be2fe",position:0},{color:"67d1fb",position:100}],12
  [{color:"90dffe",position:0},{color:"38a3d1",position:100}],13
  [{color:"57c1eb",position:0},{color:"246fa8",position:100}],14
  [{color:"2d91c2",position:0},{color:"1e528e",position:100}],15
  [{color:"2473ab",position:0},{color:"1e528e",position:70},{color:"5b7983",position:100}],16
  [{color:"1e528e",position:0},{color:"265889",position:50},{color:"9da671",position:100}],17
  [{color:"1e528e",position:0},{color:"728a7c",position:50},{color:"e9ce5d",position:100}],18
  [{color:"154277",position:0},{color:"576e71",position:30},{color:"e1c45e",position:70},{color:"b26339",position:100}],19
  [{color:"163C52",position:0},{color:"4F4F47",position:30},{color:"C5752D",position:60},{color:"B7490F",position:80},{color:"2F1107",position:100}],20
  [{color:"071B26",position:0},{color:"071B26",position:30},{color:"8A3B12",position:80},{color:"240E03",position:100}],21
  [{color:"010A10",position:30},{color:"59230B",position:80},{color:"2F1107",position:100}],22
  [{color:"090401",position:50},{color:"4B1D06",position:100}],
  [{color:"00000c",position:80},{color:"150800",position:100}],
];*/

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
    var currentMinute = hours*60 + minute;
    return currentMinute;
}

function generateSky(gradients){
    
    //skybox
    var skyColor = 'blue';
    var size = boxSize;
    var skyGeometry = new THREE.BoxGeometry( size, size, size );   
    

    var texture = new THREE.Texture( generateTexture(size,gradients) );
    textureImage = texture.image;
    texture.needsUpdate = true; // important!


    var materials = [

                    new THREE.MeshBasicMaterial( { map: texture, side: THREE.BackSide } ), // right
                    new THREE.MeshBasicMaterial( { map: texture, side: THREE.BackSide } ), // left
                    new THREE.MeshBasicMaterial( {color: gradients[1], side: THREE.BackSide} ), // top
                    new THREE.MeshBasicMaterial( {color: gradients[1], side: THREE.BackSide} ), // bottom
                    new THREE.MeshBasicMaterial( { map: texture, side: THREE.BackSide } ), // back
                    new THREE.MeshBasicMaterial( { map: texture, side: THREE.BackSide } )  // front
                
                ];




    var skyMaterial = new THREE.MeshFaceMaterial( materials );
    
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );
    


  //  skyBox = new THREE.Mesh( skyGeometry, skyMaterials  );

 
 

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