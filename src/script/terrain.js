THREE.Terrain = function(options){
	THREE.Object3D.call(this);
	this.name = "terrain_" + this.id;
	options = options || {};

	function params(value, defaultValue){
    	return value !== undefined ? value : defaultValue;
  }

  this.worldWidth = params(options.worldWidth, 1000);
  this.worldDepth = params(options.worldDepth, 1000);
	this.seed = params(options.seed, 0.0);
	this.terrainMaxHeight = params(options.terrainMaxHeight, 5);
	this.cubeSize = params(options.cubeSize, 100);
	this.quality = params(options.quality, 0.1);
	this.texture = params(options.texture, new THREE.Texture());
	this.height = [];

  this.mesh = new THREE.Object3D();

	// texture.magFilter = THREE.NearestFilter;
	// texture.minFilter = THREE.LinearMipMapLinearFilter;
	this.texture.format = THREE.RGBFormat;
	this.texture.minFilter = THREE.LinearFilter;
	this.texture.magFilter = THREE.LinearFilter;

	this.geometry = new THREE.Geometry();
	this.material = new THREE.MeshLambertMaterial({ map: this.texture, side: THREE.FrontSide });

	/* --------------
	- generate cube -
	-------------- */

	var geometry = new THREE.CubeGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
	var material = new THREE.MeshBasicMaterial({ map: this.texture, side: THREE.FrontSide });

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

	/* ----------------
	- generate height -
	---------------- */

	var perlin = new ImprovedNoise();
	for (var i = 0 ; i < this.worldWidth ; i++){
			for (var j = 0 ; j < this.worldDepth ; j++){
					this.height.push(Math.floor(perlin.noise(i * this.quality, j * this.quality, this.seed) * this.terrainMaxHeight) * this.cubeSize);
			}
	}

	/* ---------------
	- render terrain -
	--------------- */

	for (var i = 0 ; i < this.worldWidth/this.cubeSize ; i++){
	  for (var j = 0 ; j < this.worldDepth/this.cubeSize ; j++){
	    var y = this.height[ i * this.worldDepth + j ];
	    cube.position.set(i * this.cubeSize, y, j * this.cubeSize);
	    cube.updateMatrix();
	    this.geometry.merge(cube.geometry, cube.matrix);
	    for (var w = - this.terrainMaxHeight * this.cubeSize ; w < y ; w += this.cubeSize){
	      cube.position.set(i * this.cubeSize, w, j * this.cubeSize);
	      cube.updateMatrix();
	      this.geometry.merge(cube.geometry, cube.matrix);
	    }
	  }
	}
	this.material = new THREE.MeshLambertMaterial({ map: this.texture, side: THREE.FrontSide });
	this.terrain = new THREE.Mesh( this.geometry, this.material );
	console.log("ffff")
}
THREE.Terrain.prototype = Object.create(THREE.Object3D.prototype);

// http://mrl.nyu.edu/~perlin/noise/

var ImprovedNoise = function () {

	var p = [ 151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,
		 23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
		 174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
		 133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
		 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,
		 202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
		 248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
		 178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,
		 14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,
		 93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180 ];

	for (var i = 0; i < 256 ; i ++) {

		p[256 + i] = p[i];

	}

	function fade(t) {

		return t * t * t * (t * (t * 6 - 15) + 10);

	}

	function lerp(t, a, b) {

		return a + t * (b - a);

	}

	function grad(hash, x, y, z) {

		var h = hash & 15;
		var u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
		return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);

	}

	return {

		noise: function (x, y, z) {

			var floorX = Math.floor(x), floorY = Math.floor(y), floorZ = Math.floor(z);

			var X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;

			x -= floorX;
			y -= floorY;
			z -= floorZ;

			var xMinus1 = x - 1, yMinus1 = y - 1, zMinus1 = z - 1;

			var u = fade(x), v = fade(y), w = fade(z);

			var A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

			return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
							grad(p[BA], xMinus1, y, z)),
						lerp(u, grad(p[AB], x, yMinus1, z),
							grad(p[BB], xMinus1, yMinus1, z))),
					lerp(v, lerp(u, grad(p[AA + 1], x, y, zMinus1),
							grad(p[BA + 1], xMinus1, y, z - 1)),
						lerp(u, grad(p[AB + 1], x, yMinus1, zMinus1),
							grad(p[BB + 1], xMinus1, yMinus1, zMinus1))));

		}
	}
};
