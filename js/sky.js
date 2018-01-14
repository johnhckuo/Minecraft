THREE.ShaderLib["sky"] = {
  uniforms: {
    "firstLayer": {type:'c', value:null},
    "secondLayer": {type:'c', value:null},
    "thirdLayer": {type:'c', value:null},
    "percentage": {type:'f', value:0.0},


  },
  vertexShader:[
    '#ifdef GL_ES',
    'precision mediump float;',
    '#endif',
    'varying vec2 uVu',

    'uniform vec3 firstLayer',
    'uniform vec3 secondLayer',
    'uniform vec3 thirdLayer',
    'uniform float percentage',

    'void main(){',
      'gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * vec4(position, 1.0);',
    '}'
  ],
  fragmentShader:[
    '#ifdef GL_ES',
    'precision mediump float;',
    '#endif',

    'uniform vec3 firstLayer',
    'uniform vec3 secondLayer',
    'uniform vec3 thirdLayer',
    'uniform float percentage',

    'void main(){',
      'gl_FragColor = vec4(1.0,0.0,1.0,1.0);',
    '}'
  ]
}

THREE.Sky = function(options){

  THREE.Object3D.call(this);
  this.name = "sky_" + this.id;
  options = options || {};

  function params(value, defaultValue){
    return value !== undefined ? value : defaultValue;
  }

  THREE.Sky.prototype = Object.create(THREE.Object3D.prototype);
  THREE.Sky.prototype.render = function(){

  }
  THREE.Sky.prototype.updateTexture = function(){

  }


}
