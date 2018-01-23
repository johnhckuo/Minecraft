THREE.terrain = function(options){
	THREE.Object3D.call(this);
	this.name = "terrain_" + this.id;
	options = options || {};

	function params(value, defaultValue){
    	return value !== undefined ? value : defaultValue;
  	}

  this.width = params(options.width, 500);
  this.height = params(options.height, 500);

  var skyShader = THREE.ShaderLib["sky"];
  var skyUniforms = THREE.UniformsUtils.clone(skyShader.uniforms);

  this.material = new THREE.ShaderMaterial({
    fragmentShader: skyShader.fragmentShader,
    vertexShader: skyShader.vertexShader,
    uniforms: skyUniforms
  });

  this.material.side = this.side;
  this.previousHours = null;
  this.hours = null;

  this.mesh = new THREE.Object3D();
}