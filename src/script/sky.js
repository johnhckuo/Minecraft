THREE.ShaderLib["sky"] = {
  uniforms: {
    "previousColors": {type:'v3v', value:[new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0)]},
    "colors": {type:'v3v', value:[new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0)]},
    "positions": {type:'fv1', value:[1.0, 1.0, 1.0, 1.0, 1.0]},
    "previousPositions": {type:'fv1', value:[1.0, 1.0, 1.0, 1.0, 1.0]},
    "percentage": {type:'f', value:0.0}
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

    'const int maxColorCode = 5;',

    'uniform vec3 colors[maxColorCode];',
    'uniform vec3 previousColors[maxColorCode];',
    'uniform float positions[maxColorCode];',
    'uniform float previousPositions[maxColorCode];',
    'uniform float percentage;',

    'varying vec2 uVu;',

    'float normalizePosition(in float upperBound, in float lowerBound, in float value){',
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

    '    float percent;',
    '    vec3 currentColor;',
    '    vec3 previousColor;',

    '    int index = int(getCurrentIndex(st));',
    '    for (int i = 0 ; i < maxColorCode -1 ; i++){',
    '        // a workaround since glsl only accepts constant variables and loop indices as array index ',
    '        if (i == index){',
    '           percent = If_Greater(positions[i], st.y) * If_Smaller(positions[i+1], st.y) * normalizePosition(positions[i+1], positions[i], st.y);',
    '           currentColor = step(0.0001, percent) * (mix(colors[i], colors[i+1], percent));',
    '        }',
    '    }',

    '    int previousIndex = int(getPreviousIndex(st));',
    '    for (int j = 0 ; j < maxColorCode -1 ; j++){',
    '        // a workaround since glsl only accepts constant variables and loop indices as array index ',
    '        if (j == previousIndex){',
    '           percent = If_Greater(previousPositions[j], st.y) * If_Smaller(previousPositions[j+1], st.y) * normalizePosition(previousPositions[j+1], previousPositions[j], st.y);',
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
    [{color: new THREE.Vector3(0, 0, 0.047), position:0},{color: new THREE.Vector3(0, 0, 0.047), position:1.0}],
    [{color: new THREE.Vector3(0.007, 0.003, 0.066),position:0},{color: new THREE.Vector3(0.007, 0.003, 0.066),position:0.85},{color:new THREE.Vector3(0.098, 0.086, 0.129),position:1.0}],
    [{color:new THREE.Vector3(0.007, 0.003, 0.066),position:0},{color:new THREE.Vector3(0.007, 0.003, 0.066),position:0.6},{color:new THREE.Vector3(0.125, 0.125, 0.172),position:1.0}],
    [{color:new THREE.Vector3(0.007, 0.003, 0.066),position:0},{color:new THREE.Vector3(0.007, 0.003, 0.066),position:0.1},{color:new THREE.Vector3(0.227, 0.227, 0.321),position:1.0}],
    [{color:new THREE.Vector3(0.125, 0.125, 0.172),position:0},{color:new THREE.Vector3(0.317, 0.317, 0.458),position:1.0}],
    [{color:new THREE.Vector3(0.250, 0.250, 0.360),position:0},{color:new THREE.Vector3(0.435, 0.443, 0.666),position:0.8},{color:new THREE.Vector3(0.541, 0.462, 0.670),position:1.0}],
    [{color:new THREE.Vector3(0.290, 0.286, 0.411),position:0},{color:new THREE.Vector3(0.439, 0.447, 0.670),position:0.5},{color:new THREE.Vector3(0.803, 0.509, 0.627),position:1.0}],
    [{color:new THREE.Vector3(0.458, 0.478, 0.749),position:0},{color:new THREE.Vector3(0.521, 0.513, 0.745),position:0.6},{color:new THREE.Vector3(0.917, 0.690, 0.819),position:1.0}],
    [{color:new THREE.Vector3(0.509, 0.678, 0.858),position:0},{color:new THREE.Vector3(0.921, 0.698, 0.694),position:1.0}],
    [{color:new THREE.Vector3(0.580, 0.772, 0.972),position:0},{color:new THREE.Vector3(0.580, 0.772, 0.972),position:0.01},{color:new THREE.Vector3(0.650, 0.901, 1),position:0.7},{color:new THREE.Vector3(0.694, 0.709, 0.917),position:1.0}],
    [{color:new THREE.Vector3(0.717, 0.917, 1),position:0},{color:new THREE.Vector3(0.580, 0.874, 1),position:1.0}],
    [{color:new THREE.Vector3(0.607, 0.886, 0.996),position:0},{color:new THREE.Vector3(0.403, 0.819, 0.984),position:1.0}],
    [{color:new THREE.Vector3(0.564, 0.874, 0.996),position:0},{color:new THREE.Vector3(0.219, 0.639, 0.819),position:1.0}],
    [{color:new THREE.Vector3(0.341, 0.756, 0.921),position:0},{color:new THREE.Vector3(0.141, 0.435, 0.658),position:1.0}],
    [{color:new THREE.Vector3(0.176, 0.568, 0.760),position:0},{color:new THREE.Vector3(0.117, 0.321, 0.556),position:1.0}],
    [{color:new THREE.Vector3(0.141, 0.450, 0.670),position:0},{color:new THREE.Vector3(0.117, 0.321, 0.556),position:0.7},{color:new THREE.Vector3(0.356, 0.474, 0.513),position:1.0}],
    [{color:new THREE.Vector3(0.117, 0.321, 0.556),position:0},{color:new THREE.Vector3(0.149, 0.345, 0.537),position:0.5},{color:new THREE.Vector3(0.615, 0.650, 0.443),position:1.0}],
    [{color:new THREE.Vector3(0.117, 0.321, 0.556),position:0},{color:new THREE.Vector3(0.447, 0.541, 0.486),position:0.5},{color:new THREE.Vector3(0.913, 0.807, 0.364),position:1.0}],
    [{color:new THREE.Vector3(0.082, 0.258, 0.466),position:0},{color:new THREE.Vector3(0.341, 0.431, 0.443),position:0.3},{color:new THREE.Vector3(0.882, 0.768, 0.368),position:0.7},{color:new THREE.Vector3(0.698, 0.388, 0.223),position:1.0}],
    [{color:new THREE.Vector3(0.086, 0.235, 0.321),position:0},{color:new THREE.Vector3(0.309, 0.309, 0.278),position:0.3},{color:new THREE.Vector3(0.772, 0.458, 0.176),position:0.6},{color:new THREE.Vector3(0.717, 0.286, 0.058),position:0.8},{color:new THREE.Vector3(0.184, 0.066, 0.027),position:1.0}],
    [{color:new THREE.Vector3(0.027, 0.105, 0.149),position:0},{color:new THREE.Vector3(0.027, 0.105, 0.149),position:0.3},{color:new THREE.Vector3(0.541, 0.231, 0.070),position:0.8},{color:new THREE.Vector3(0.141, 0.054, 0.011),position:1.0}],
    [{color:new THREE.Vector3(0.003, 0.039, 0.062),position:0},{color:new THREE.Vector3(0.003, 0.039, 0.062),position:0.3},{color:new THREE.Vector3(0.349, 0.137, 0.043),position:0.8},{color:new THREE.Vector3(0.184, 0.066, 0.027),position:1.0}],
    [{color:new THREE.Vector3(0.035, 0.015, 0.003),position:0},{color:new THREE.Vector3(0.035, 0.015, 0.003),position:0.5},{color:new THREE.Vector3(0.294, 0.113, 0.023),position:1.0}],
    [{color:new THREE.Vector3(0, 0, 0.047),position:0},{color:new THREE.Vector3(0, 0, 0.047),position:0.8},{color:new THREE.Vector3(0.082, 0.031, 0),position:1.0}],
  ];

  THREE.Object3D.call(this);
  this.name = "sky_" + this.id;
  options = options || {};

  function params(value, defaultValue){
    return value !== undefined ? value : defaultValue;
  }

  this.side = params(options.side, THREE.FrontSide);

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
};

THREE.Sky.prototype = Object.create(THREE.Object3D.prototype);

THREE.Sky.prototype.render = function(options){

      options = options || {};

      function params(value, defaultValue){
        return value !== undefined ? value : defaultValue;
      }

      var now = new Date();
      var hours = params(options.hours, now.getHours());
      var minutes = params(options.minutes, now.getMinutes());

      var percentage = minutes/60;
      this.material.uniforms.percentage.value = percentage;

      if (hours == this.previousHours){

      }else if (hours > this.previousHours || this.previousHours == null){
        this.previousHours = (hours - 1 + 24) % 24;
      }else{
        this.previousHours = (hours + 1) % 24;
      }

      this.hours = hours;

      for (var i = 0 ; i < 5; i++){
        if (i < this.grads[this.previousHours].length){
            this.material.uniforms.previousColors.value[i] = this.grads[this.previousHours][i].color;
            this.material.uniforms.previousPositions.value[i] = this.grads[this.previousHours][i].position;
        }else{
            this.material.uniforms.previousPositions.value[i] = 1.0;
        }
      }

      for (var j = 0 ; j <  5; j++){
        if (j < this.grads[this.hours].length){
          this.material.uniforms.colors.value[j] = this.grads[this.hours][j].color;
          this.material.uniforms.positions.value[j] = this.grads[this.hours][j].position;
        }else{
          this.material.uniforms.positions.value[j] = 1.0;
        }
      }

};
