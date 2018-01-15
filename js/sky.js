THREE.ShaderLib["sky"] = {
  uniforms: {
    "previousColors": {type:'v3v', value:[new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0)]},
    "colors": {type:'v3v', value:[new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0)]},
    "positions": {type:'fv1', value:[1.0, 1.0, 1.0, 1.0, 1.0]},
    "previousPositions": {type:'fv1', value:[1.0, 1.0, 1.0, 1.0, 1.0]},
    "percentage": {type:'f', value:0.0},
  },
  vertexShader:[
    '#ifdef GL_ES',
    'precision mediump float;',
    '#endif',

    'varying vec2 uVu;',

    'void main(){',
      'uVu = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n'),
  fragmentShader:[
    '#ifdef GL_ES',
    'precision mediump float;',
    '#endif',

    'uniform vec3 colors[5];',
    'uniform vec3 previousColors[5];',
    'uniform float positions[5];',
    'uniform float previousPositions[5];',
    'uniform float percentage;',

    'varying vec2 uVu;',

    'float normalize(in float upperBound, in float lowerBound, in float value){',
    '    return (value - lowerBound) / (upperBound - lowerBound);',
    '}',

    'float If_Greater(in float boundary, in float value){',
    '    return step(boundary, value);',
    '}',

    'float If_Smaller(in float boundary, in float value){',
    '    return 1. - step(boundary, value);',
    '}',

    'float getCurrentIndex(in vec2 st){',
    '    return step(positions[0], st.y) + step(positions[1], st.y) + step(positions[2], st.y) + step(positions[3], st.y) + step(positions[4], st.y) -1.0;',
    '}',

    'float getPreviousIndex(in vec2 st){',
    '    return step(previousPositions[0], st.y) + step(previousPositions[1], st.y) + step(previousPositions[2], st.y) + step(previousPositions[3], st.y) + step(previousPositions[4], st.y) -1.0;',
    '}',

    'vec3 gradient(in vec2 st){',
    '    int index = int(getCurrentIndex(st));',
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
    '           percent = If_Greater(previousPositions[j], st.y) * If_Smaller(previousPositions[j+1], st.y) * normalize(previousPositions[j+1], previousPositions[j], st.y);',
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
  ].join('\n')
};

THREE.Sky = function(options){

  // gradient colors from http://cdpn.io/rDEAl
  this.grads = [
    [{color: new THREE.Vector3(0,0,12), position:0},{color: new THREE.Vector3(0,0,12), position:1.0}],
    [{color: new THREE.Vector3(2,1,17),position:0},{color: new THREE.Vector3(2,1,17),position:0.85},{color:new THREE.Vector3(25,22,33),position:1.0}],
    [{color:new THREE.Vector3(2,1,17),position:0},{color:new THREE.Vector3(2,1,17),position:0.6},{color:new THREE.Vector3(32,32,44),position:1.0}],
    [{color:new THREE.Vector3(2,1,17),position:0},{color:new THREE.Vector3(2,1,17),position:0.1},{color:new THREE.Vector3(58,58,82),position:1.0}],
    [{color:new THREE.Vector3(32,32,44),position:0},{color:new THREE.Vector3(81,81,117),position:1.0}],
    [{color:new THREE.Vector3(64,64,92),position:0},{color:new THREE.Vector3(111,113,170),position:0.8},{color:new THREE.Vector3(138,118,171),position:1.0}],
    [{color:new THREE.Vector3(74,73,105),position:0},{color:new THREE.Vector3(112,114,171),position:0.5},{color:new THREE.Vector3(205,130,160),position:1.0}],
    [{color:new THREE.Vector3(117,122,191),position:0},{color:new THREE.Vector3(133,131,190),position:0.6},{color:new THREE.Vector3(234,176,209),position:1.0}],
    [{color:new THREE.Vector3(130,173,219),position:0},{color:new THREE.Vector3(235,178,177),position:1.0}],
    [{color:new THREE.Vector3(148,197,248),position:0},{color:new THREE.Vector3(148,197,248),position:0.01},{color:new THREE.Vector3(166,230,255),position:0.7},{color:new THREE.Vector3(177,181,234),position:1.0}],
    [{color:new THREE.Vector3(183,234,255),position:0},{color:new THREE.Vector3(148,223,255),position:1.0}],
    [{color:new THREE.Vector3(155,226,254),position:0},{color:new THREE.Vector3(103,209,251),position:1.0}],
    [{color:new THREE.Vector3(144,223,254),position:0},{color:new THREE.Vector3(56,163,209),position:1.0}],
    [{color:new THREE.Vector3(87,193,235),position:0},{color:new THREE.Vector3(36,111,168),position:1.0}],
    [{color:new THREE.Vector3(45,145,194),position:0},{color:new THREE.Vector3(30,82,142),position:1.0}],
    [{color:new THREE.Vector3(36,115,171),position:0},{color:new THREE.Vector3(30,82,142),position:0.7},{color:new THREE.Vector3(91,121,131),position:1.0}],
    [{color:new THREE.Vector3(30,82,142),position:0},{color:new THREE.Vector3(38,88,137),position:0.5},{color:new THREE.Vector3(157,166,113),position:1.0}],
    [{color:new THREE.Vector3(30,82,142),position:0},{color:new THREE.Vector3(114,138,124),position:0.5},{color:new THREE.Vector3(233,206,93),position:1.0}],
    [{color:new THREE.Vector3(21,66,119),position:0},{color:new THREE.Vector3(87,110,113),position:0.3},{color:new THREE.Vector3(225,196,94),position:0.7},{color:new THREE.Vector3(178,99,57),position:1.0}],
    [{color:new THREE.Vector3(22,60,82),position:0},{color:new THREE.Vector3(79,79,71),position:0.3},{color:new THREE.Vector3(197,117,45),position:0.6},{color:new THREE.Vector3(183,73,15),position:0.8},{color:new THREE.Vector3(47,17,7),position:1.0}],
    [{color:new THREE.Vector3(7,27,38),position:0},{color:new THREE.Vector3(7,27,38),position:0.3},{color:new THREE.Vector3(138,59,18),position:0.8},{color:new THREE.Vector3(36,14,3),position:1.0}],
    [{color:new THREE.Vector3(1,10,16),position:0},{color:new THREE.Vector3(1,10,16),position:0.3},{color:new THREE.Vector3(89,35,11),position:0.8},{color:new THREE.Vector3(47,17,7),position:1.0}],
    [{color:new THREE.Vector3(9,4,1),position:0},{color:new THREE.Vector3(9,4,1),position:0.5},{color:new THREE.Vector3(75,29,6),position:1.0}],
    [{color:new THREE.Vector3(0,0,12),position:0},{color:new THREE.Vector3(0,0,12),position:0.8},{color:new THREE.Vector3(21,8,0),position:1.0}],
  ];


  // gradient colors from http://cdpn.io/rDEAl
  // this.grads = [
  //   [{color: new THREE.Vector3(0,0,12), position:0},{color: new THREE.Vector3(0,0,12), position:0}],
  //   [{color: new THREE.Vector3(2,1,17),position:0.85},{color:new THREE.Vector3(25,22,33),position:1.0}],
  //   [{color:new THREE.Vector3(2,1,17),position:0.6},{color:new THREE.Vector3(32,32,44),position:1.0}],
  //   [{color:new THREE.Vector3(2,1,17),position:0.1},{color:new THREE.Vector3(58,58,82),position:1.0}],
  //   [{color:new THREE.Vector3(32,32,44),position:0},{color:new THREE.Vector3(81,81,117),position:1.0}],
  //   [{color:new THREE.Vector3(64,64,92),position:0},{color:new THREE.Vector3(111,113,170),position:0.8},{color:new THREE.Vector3(138,118,171),position:1.0}],
  //   [{color:new THREE.Vector3(74,73,105),position:0},{color:new THREE.Vector3(112,114,171),position:0.5},{color:new THREE.Vector3(205,130,160),position:1.0}],
  //   [{color:new THREE.Vector3(117,122,191),position:0},{color:new THREE.Vector3(133,131,190),position:0.6},{color:new THREE.Vector3(234,176,209),position:1.0}],
  //   [{color:new THREE.Vector3(130,173,219),position:0},{color:new THREE.Vector3(235,178,177),position:1.0}],
  //   [{color:new THREE.Vector3(148,197,248),position:0.01},{color:new THREE.Vector3(166,230,255),position:0.7},{color:new THREE.Vector3(177,181,234),position:1.0}],
  //   [{color:new THREE.Vector3(183,234,255),position:0},{color:new THREE.Vector3(148,223,255),position:1.0}],
  //   [{color:new THREE.Vector3(155,226,254),position:0},{color:new THREE.Vector3(103,209,251),position:1.0}],
  //   [{color:new THREE.Vector3(144,223,254),position:0},{color:new THREE.Vector3(56,163,209),position:1.0}],
  //   [{color:new THREE.Vector3(87,193,235),position:0},{color:new THREE.Vector3(36,111,168),position:1.0}],
  //   [{color:new THREE.Vector3(45,145,194),position:0},{color:new THREE.Vector3(30,82,142),position:1.0}],
  //   [{color:new THREE.Vector3(36,115,171),position:0},{color:new THREE.Vector3(30,82,142),position:0.7},{color:new THREE.Vector3(91,121,131),position:1.0}],
  //   [{color:new THREE.Vector3(30,82,142),position:0},{color:new THREE.Vector3(38,88,137),position:0.5},{color:new THREE.Vector3(157,166,113),position:1.0}],
  //   [{color:new THREE.Vector3(30,82,142),position:0},{color:new THREE.Vector3(114,138,124),position:0.5},{color:new THREE.Vector3(233,206,93),position:1.0}],
  //   [{color:new THREE.Vector3(21,66,119),position:0},{color:new THREE.Vector3(87,110,113),position:0.3},{color:new THREE.Vector3(225,196,94),position:0.7},{color:new THREE.Vector3(178,99,57),position:1.0}],
  //   [{color:new THREE.Vector3(22,60,82),position:0},{color:new THREE.Vector3(79,79,71),position:0.3},{color:new THREE.Vector3(197,117,45),position:0.6},{color:new THREE.Vector3(183,73,15),position:0.8},{color:new THREE.Vector3(47,17,7),position:1.0}],
  //   [{color:new THREE.Vector3(7,27,38),position:0},{color:new THREE.Vector3(7,27,38),position:0.3},{color:new THREE.Vector3(138,59,18),position:0.8},{color:new THREE.Vector3(36,14,3),position:1.0}],
  //   [{color:new THREE.Vector3(1,10,16),position:0.3},{color:new THREE.Vector3(89,35,11),position:0.8},{color:new THREE.Vector3(47,17,7),position:1.0}],
  //   [{color:new THREE.Vector3(9,4,1),position:0.5},{color:new THREE.Vector3(75,29,6),position:1.0}],
  //   [{color:new THREE.Vector3(0,0,12),position:0.8},{color:new THREE.Vector3(21,8,0),position:1.0}],
  // ];

  THREE.Object3D.call(this);
  this.name = "sky_" + this.id;
  options = options || {};

  function params(value, defaultValue){
    return value !== undefined ? value : defaultValue;
  }

  var skyShader = THREE.ShaderLib["sky"];
  var skyUniforms = THREE.UniformsUtils.clone(skyShader.uniforms);

  this.material = new THREE.ShaderMaterial({
    fragmentShader: skyShader.fragmentShader,
    vertexShader: skyShader.vertexShader,
    uniforms: skyUniforms
  });

  this.mesh = new THREE.Object3D();
};

THREE.Sky.prototype = Object.create(THREE.Object3D.prototype);

THREE.Sky.prototype.render = function(options){

      options = options || {};

      function params(value, defaultValue){
        return value !== undefined ? value : defaultValue;
      }

      var now = new Date();
      var hours = params(options.hours, now.getHours());
      var minute = params(options.minute, now.getMinutes());
      var percentage = params(options.percentage, minute/60);
      // hours = 23;
      this.material.uniforms.percentage.value = percentage;

      var previousHours = (hours - 1 + 24) % 24;
      for (var i = 0 ; i < this.grads[previousHours].length; i++){
        this.material.uniforms.previousColors.value[i] = this.grads[previousHours][i].color.normalize();
        this.material.uniforms.previousPositions.value[i] = this.grads[previousHours][i].position;
      }

      for (var j = 0 ; j < this.grads[hours].length ; j++){
        this.material.uniforms.colors.value[j] = this.grads[hours][j].color.normalize();
        this.material.uniforms.positions.value[j] = this.grads[hours][j].position;
      }

};
