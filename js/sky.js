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
    'uniform vec3 fourthLayer',
    'uniform vec3 fifthLayer',

    'uniform float firstPosition',
    'uniform float secondPosition',
    'uniform float thirdPosition',
    'uniform float fourthPosition',
    'uniform float fifthPosition',

    'uniform float percentage',

    'void main(){',
      'gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * vec4(position, 1.0);',
    '}'
  ],
  fragmentShader:[
    '#ifdef GL_ES',
    'precision mediump float;',
    '#endif',

    'uniform vec3 colors[5]',
    'uniform vec3 previousColors[5]',
    'uniform float positions[5]',
    'uniform float percentage;',

    'float normalize(in float upperBound, in float lowerBound, in float value){',
    '    return (value - lowerBound) / (upperBound - lowerBound);',
    '}',

    'float If_Greater(in float boundary, in float value){',
    '    return step(boundary, value);',
    '}',

    'float If_Smaller(in float boundary, in float value){',
    '    return 1. - step(boundary, value);',
    '}',

    'float getIndex(in vec2 st){',
    '    return step(positions[0], st.y) + step(positions[1], st.y) + step(positions[2], st.y) + step(positions[3], st.y) + step(positions[4], st.y) -1.0;',
    '}',

    'vec3 gradient(in vec2 st){',
    '    int index = int(getIndex(st));',
    '    float percent;',
    '    vec3 currentColor;',
    '    vec3 previousColor;',

    '    for (int i = 0 ; i < 4 ; i++){',
    '        // a workaround since glsl only accepts constant variables and loop indices as array index ',
    '        if (i == index){',
    '           percent = If_Greater(positions[i], st.y) * If_Smaller(positions[i+1], st.y) * normalize(positions[i+1], positions[i], st.y);',
    '           currentColor = step(0.0001, percent) * (mix(colors[i], colors[i+1], percent));',
    '        }',
    '    }',
    '    for (int j = 0 ; j < 4 ; j++){',
    '        // a workaround since glsl only accepts constant variables and loop indices as array index ',
    '        if (j == index){',
    '           percent = If_Greater(positions[j], st.y) * If_Smaller(positions[j+1], st.y) * normalize(positions[j+1], positions[j], st.y);',
    '           previousColor = step(0.0001, percent) * (mix(previousColors[j], previousColors[j+1], percent));',
    '        }',
    '    }',
    '    return mix(previousColor, currentColor, percentage);',
    '}',

    'void main(){',
      'vec2 st = uVu.xy;',
      'vec3 color = vec3(0.0);',
      'color += gradient(st);',
      'gl_FragColor = vec4(color ,1.0);',
    '}'
  ]
}

THREE.Sky = function(options){

  // gradient colors from http://cdpn.io/rDEAl
  this.grads = [
    [{color:"00000c",position:0},{color:"00000c",position:0}],
    [{color:"020111",position:0.85},{color:"191621",position:1.0}],
    [{color:"020111",position:0.6},{color:"20202c",position:1.0}],
    [{color:"020111",position:0.1},{color:"3a3a52",position:1.0}],
    [{color:"20202c",position:0},{color:"515175",position:1.0}],
    [{color:"40405c",position:0},{color:"6f71aa",position:0.8},{color:"8a76ab",position:1.0}],
    [{color:"4a4969",position:0},{color:"7072ab",position:0.5},{color:"cd82a0",position:1.0}],
    [{color:"757abf",position:0},{color:"8583be",position:0.6},{color:"eab0d1",position:1.0}],
    [{color:"82addb",position:0},{color:"ebb2b1",position:1.0}],
    [{color:"94c5f8",position:0.01},{color:"a6e6ff",position:0.7},{color:"b1b5ea",position:1.0}],
    [{color:"b7eaff",position:0},{color:"94dfff",position:1.0}],
    [{color:"9be2fe",position:0},{color:"67d1fb",position:1.0}],
    [{color:"90dffe",position:0},{color:"38a3d1",position:1.0}],
    [{color:"57c1eb",position:0},{color:"246fa8",position:1.0}],
    [{color:"2d91c2",position:0},{color:"1e528e",position:1.0}],
    [{color:"2473ab",position:0},{color:"1e528e",position:0.7},{color:"5b7983",position:1.0}],
    [{color:"1e528e",position:0},{color:"265889",position:0.5},{color:"9da671",position:1.0}],
    [{color:"1e528e",position:0},{color:"728a7c",position:0.5},{color:"e9ce5d",position:1.0}],
    [{color:"154277",position:0},{color:"576e71",position:0.3},{color:"e1c45e",position:0.7},{color:"b26339",position:1.0}],
    [{color:"163C52",position:0},{color:"4F4F47",position:0.3},{color:"C5752D",position:0.6},{color:"B7490F",position:0.8},{color:"2F1107",position:1.0}],
    [{color:"071B26",position:0},{color:"071B26",position:0.3},{color:"8A3B12",position:0.8},{color:"240E03",position:1.0}],
    [{color:"010A10",position:0.3},{color:"59230B",position:0.8},{color:"2F1107",position:1.0}],
    [{color:"090401",position:0.5},{color:"4B1D06",position:1.0}],
    [{color:"00000c",position:0.8},{color:"150800",position:1.0}],
  ];

  THREE.Object3D.call(this);
  this.name = "sky_" + this.id;
  options = options || {};

  function params(value, defaultValue){
    return value !== undefined ? value : defaultValue;
  }

  this.firstLayer = params(options.firstLayer);
  this.secondLayer = params(options.secondLayer);
  this.thirdLayer = params(options.thirdLayer);
  this.fourthLayer = params(options.fourthLayer);
  this.fifthLayer = params(options.fifthLayer);

  this.firstPosition = params(options.firstPosition);
  this.secondPosition = params(options.secondPosition);
  this.thirdPosition = params(options.thirdPosition);
  this.fourthPosition = params(options.fourthPosition);
  this.fifthPosition = params(options.fifthPosition);

  var skyShader = THREE.ShaderLib["sky"];
  var skyUniforms = THREE.UniformsUtils.clone(skyShader.uniforms);

  this.material = new THREE.ShaderMaterial({ 
    fragmentShader: skyShader.fragmentShader, 
    vertexShader: skyShader.vertexShader, 
    uniforms: skyUniforms
  });

  this.material.uniforms.firstLayer.value = this.firstLayer;
  this.material.uniforms.secondLayer.value = this.secondLayer;
  this.material.uniforms.thirdLayer.value = this.thirdLayer;
  this.material.uniforms.fourthLayer.value = this.fourthLayer;
  this.material.uniforms.fifthLayer.value = this.fifthLayer;

  this.material.uniforms.firstPosition.value = this.firstPosition;
  this.material.uniforms.secondPosition.value = this.secondPosition;
  this.material.uniforms.thirdPosition.value = this.thirdPosition;
  this.material.uniforms.fourthPosition.value = this.fourthPosition;
  this.material.uniforms.fifthPosition.value = this.fifthPosition;

  this.mesh = new THREE.Object3D();

  THREE.Sky.prototype = Object.create(THREE.Object3D.prototype);
  THREE.Sky.prototype.render = function(){

      var now = new Date();
      var hours = now.getHours();
      var minute = now.getMinutes();

      for (var i = 0 ; i < this.grads[hours]; i++){
        var percentage = minute/60;
        this.material.uniforms.percentage.value = percentage;
        for (var j = 0 ; j < 5 ; j++){
          this.material.uniforms.colors[j] = this.grads[i][j].color;
          this.material.uniforms.previousColors[j] = this.grads[(i-1)%24][j].color;
          this.material.uniforms.positions[j] = this.grads[i][j].position;
        }

      }
  }
  THREE.Sky.prototype.updateTexture = function(){

  }


}
