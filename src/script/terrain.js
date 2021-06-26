import {cubeTexture} from "../texture/data.js";

class VoxelWorld {
	constructor(options) {
		this.cellSize = options.cellSize;
		this.tileSize = options.tileSize;
		this.tileTextureWidth = options.tileTextureWidth;
		this.tileTextureHeight = options.tileTextureHeight;
		const { cellSize } = this;
		this.cellSliceSize = cellSize * cellSize;
		this.cell = new Int8Array(cellSize * cellSize * cellSize).fill(-1);
	}
	// this is to map 3 dimension index into 1 dimensional array
	computeVoxelOffset(x, y, z) {
		const { cellSize, cellSliceSize } = this;
		const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
		const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
		const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
		return voxelY * cellSliceSize +
			voxelZ * cellSize +
			voxelX;
	}
	getCellForVoxel(x, y, z) {
		const { cellSize } = this;
		const cellX = Math.floor(x / cellSize);
		const cellY = Math.floor(y / cellSize);
		const cellZ = Math.floor(z / cellSize);
		if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
			return null;
		}
		return this.cell;
	}
	setVoxel(x, y, z, v) {
		const cell = this.getCellForVoxel(x, y, z);
		if (!cell) {
			return;  // TODO: add a new cell?
		}
		const voxelOffset = this.computeVoxelOffset(x, y, z);
		cell[voxelOffset] = v;
	}
	getVoxel(x, y, z) {
		//check if x, y, z has out of boundary(cellSize)
		const cell = this.getCellForVoxel(x, y, z);
		if (!cell) {
			return -1;
		}
		const voxelOffset = this.computeVoxelOffset(x, y, z);
		return cell[voxelOffset];
	}
	generateGeometryDataForCell(cellX, cellY, cellZ) {
		const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;
		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		const startX = cellX * cellSize;
		const startY = cellY * cellSize;
		const startZ = cellZ * cellSize;

		for (let y = 0; y < cellSize; ++y) {
			const voxelY = startY + y;
			for (let z = 0; z < cellSize; ++z) {
				const voxelZ = startZ + z;
				for (let x = 0; x < cellSize; ++x) {
					const voxelX = startX + x;
					const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
					// voxel == -1 means it is empty space
					if (voxel != -1) {
						// There is a voxel here but do we need faces for it?
						for (const { dir, corners, uvRow } of VoxelWorld.faces) {
							const neighbor = this.getVoxel(
								voxelX + dir[0],
								voxelY + dir[1],
								voxelZ + dir[2]);
							// if it has no neighbor, or neighbor is water while voxel itself is land(water is transparent), then we'll need to render the face
							if (neighbor == -1 || (neighbor == cubeTexture["water"] && voxel != cubeTexture["water"] )) {
								// this voxel has no neighbor in this direction so we need a face.
								const ndx = positions.length / 3;
								for (const { pos, uv } of corners) {
									let uvX = (voxel + uv[0]) * tileSize / tileTextureWidth
									let uvY = 1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight
									//console.log(uvX, uvY)
									positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
									normals.push(...dir);
									uvs.push(uvX, uvY);
								}
								indices.push(
									ndx, ndx + 1, ndx + 2,
									ndx + 2, ndx + 1, ndx + 3,
								);
							}
						}
					}
				}
			}
		}

		return {
			positions,
			normals,
			uvs,
			indices,
		};
	}


	generateMaterialDataForCell(cellX, cellY, cellZ) {
		const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;
		const opacity = [];

		const startX = cellX * cellSize;
		const startY = cellY * cellSize;
		const startZ = cellZ * cellSize;

		for (let y = 0; y < cellSize; ++y) {
			const voxelY = startY + y;
			for (let z = 0; z < cellSize; ++z) {
				const voxelZ = startZ + z;
				for (let x = 0; x < cellSize; ++x) {
					const voxelX = startX + x;
					const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
					if (voxel != -1) {
						if (voxel == cubeTexture["water"]){
							opacity.push(0.8);
						}else{
							opacity.push(1);
						}
					}
				}
			}
		}

		return {
			opacity
		};
	}
}

VoxelWorld.faces = [
	{ // left
		uvRow: 1, 
		dir: [-1, 0, 0,],  // the directions this face points outward, can be used to detect if this face has a neighbor
		corners: [
			{ pos: [0, 1, 0], uv: [0, 1], },
			{ pos: [0, 0, 0], uv: [0, 0], },
			{ pos: [0, 1, 1], uv: [1, 1], },
			{ pos: [0, 0, 1], uv: [1, 0], },
		],
	},
	{ // right
		uvRow: 1,
		dir: [1, 0, 0,],
		corners: [
			{ pos: [1, 1, 1], uv: [0, 1], },
			{ pos: [1, 0, 1], uv: [0, 0], },
			{ pos: [1, 1, 0], uv: [1, 1], },
			{ pos: [1, 0, 0], uv: [1, 0], },
		],
	},
	{ // bottom
		uvRow: 0,
		dir: [0, -1, 0,],
		corners: [
			{ pos: [1, 0, 1], uv: [1, 0], },
			{ pos: [0, 0, 1], uv: [0, 0], },
			{ pos: [1, 0, 0], uv: [1, 1], },
			{ pos: [0, 0, 0], uv: [0, 1], },
		],
	},
	{ // top
		uvRow: 0,
		dir: [0, 1, 0,],
		corners: [
			{ pos: [0, 1, 1], uv: [1, 1], },
			{ pos: [1, 1, 1], uv: [0, 1], },
			{ pos: [0, 1, 0], uv: [1, 0], },
			{ pos: [1, 1, 0], uv: [0, 0], },
		],
	},
	{ // back
		uvRow: 1,
		dir: [0, 0, -1,],
		corners: [
			{ pos: [1, 0, 0], uv: [0, 0], },
			{ pos: [0, 0, 0], uv: [1, 0], },
			{ pos: [1, 1, 0], uv: [0, 1], },
			{ pos: [0, 1, 0], uv: [1, 1], },
		],
	},
	{ // front
		uvRow: 1,
		dir: [0, 0, 1,],
		corners: [
			{ pos: [0, 0, 1], uv: [0, 0], },
			{ pos: [1, 0, 1], uv: [1, 0], },
			{ pos: [0, 1, 1], uv: [0, 1], },
			{ pos: [1, 1, 1], uv: [1, 1], },
		],
	},
];

class Terrain {
	constructor(options) {
		options = options || {};

		function params(value, defaultValue) {
			return value !== undefined ? value : defaultValue;
		}

		this.worldWidth = params(options.worldWidth, 1000);
		this.worldDepth = params(options.worldDepth, 1000);
		this.seed = params(options.seed, 1);
		this.terrainMaxHeight = params(options.terrainMaxHeight, 1000);
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

		this.geometry = new THREE.BufferGeometry();
		this.material = new THREE.MeshLambertMaterial({ map: this.texture, side: THREE.FrontSide });
		this.init()
	}

	init() {

		/* --------------
		- generate cube -
		-------------- */
		var geometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
		var material = new THREE.MeshBasicMaterial({ map: this.texture, side: THREE.FrontSide });

		var oneFourth = 1 / 4;
		var half = 1 / 2;
		var threeFourth = 3 / 4;

		var oneThird = 1 / 3;
		var twoThird = 2 / 3;

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

		/* ----------------
		- generate height -
		---------------- */

		var perlin = new ImprovedNoise();
		var cubeNumberX = this.worldWidth / this.cubeSize;
		var cubeNumberY = this.worldDepth / this.cubeSize;
		console.log(this.quality)
		for (var i = 0; i < cubeNumberX; i++) {
			for (var j = 0; j < cubeNumberY; j++) {
				this.height.push(Math.floor(
					perlin.noise(
						i * this.quality, j * this.quality, this.seed
					) * this.terrainMaxHeight
				) * this.cubeSize);
			}
		}

		/* ---------------
		- render terrain -
		--------------- */

		for (var i = 0; i < cubeNumberX; i++) {
			for (var j = 0; j < cubeNumberY; j++) {
				var y = this.height[i * cubeNumberY + j];
				cube.position.set(i * this.cubeSize, y, j * this.cubeSize);
				cube.updateMatrix();
				this.geometry.merge(cube.geometry, cube.matrix);
				for (var w = - this.terrainMaxHeight * this.cubeSize; w < y; w += this.cubeSize) {
					cube.position.set(i * this.cubeSize, w, j * this.cubeSize);
					cube.updateMatrix();
					this.geometry.merge(cube.geometry, cube.matrix);
				}
			}
		}
		this.material = new THREE.MeshLambertMaterial({ map: this.texture, side: THREE.FrontSide });
		this.terrain = new THREE.Mesh(this.geometry, this.material);
	}

}

export default VoxelWorld;