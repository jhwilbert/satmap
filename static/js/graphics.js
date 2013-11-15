
var Shaders = {
  'earth' : {
    uniforms: {
      'texture': { type: 't', value: THREE.ImageUtils.loadTexture( "imgs/map3.jpg" ) }
    },
    vertexShader: [
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        'vNormal = normalize( normalMatrix * normal );',
        'vUv = uv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D texture;',
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
        'vec3 diffuse = texture2D( texture, vUv ).xyz;',
        'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
        'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 2.0 );',
        'gl_FragColor = vec4( diffuse + atmosphere, 0.3 );',
      '}'
    ].join('\n')
  },
  'atmosphere' : {
    uniforms: {},
    vertexShader: [
      'varying vec3 vNormal;',
      'void main() {',
        'vNormal = normalize( normalMatrix * normal );',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vNormal;',
      'void main() {',
        'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
        'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
      '}'
    ].join('\n')
  }
};

/*****************************************************
/* GLOBAL                                           */
/****************************************************/

var CAM_POS_X = 1800;
var CAM_POS_Y = 500;
var CAM_POS_Z = 2000;
var globeGroup;

init();
animate();

//http://jsfiddle.net/crossphire/DAktM/

/*****************************************************
/* ENGINE                                           */
/****************************************************/

function init() {
  camera = new THREE.PerspectiveCamera( 45  , window.innerWidth / window.innerHeight,1,6000 );
  camera.position.set(CAM_POS_X,CAM_POS_Y, CAM_POS_Z);
  camera.lookAt(new THREE.Vector3(0,0,0));
  globeGroup = new THREE.Object3D();
  
  scene = new THREE.Scene();
  scene.add(camera);
  scene.add(globeGroup);
  
  addEarth();
  addClouds();
  
  //renderer = new THREE.CanvasRenderer();
  renderer = new THREE.WebGLRenderer({antialias: true});
  
  renderer.setSize( window.innerWidth, window.innerHeight);
  renderer.setClearColorHex(0x070707);
  var container = document.getElementById("container");
  container.appendChild( renderer.domElement );
}

function animate() {
    var timer = Date.now() * 0.0001;
    //animateSat();
    camera.position.x = (Math.cos( timer ) *  3900);
    camera.position.z = (Math.sin( timer ) * 3900) ;
    camera.lookAt( scene.position );
    renderer.render( scene, camera );    
    requestAnimationFrame( animate );
}

/*****************************************************
/* WORLD                                            */
/****************************************************/

// Earth
function addEarth() {
   var spGeo = new THREE.SphereGeometry(800,50,50);
   //var planetTexture = THREE.ImageUtils.loadTexture( "imgs/map3.jpg" );
   
   shader = Shaders['earth'];

   material = new THREE.ShaderMaterial({
         uniforms: shader.uniforms,
         vertexShader: shader.vertexShader,
         fragmentShader: shader.fragmentShader
    });

   sp = new THREE.Mesh(spGeo,material);
   sp.matrixAutoUpdate = false;
       
   globeGroup.add(sp);
}

// Clouds
function addClouds() {
    /*
    var spGeo = new THREE.SphereGeometry(800,50,50);
    var cloudsTexture = THREE.ImageUtils.loadTexture( "imgs/clouds.jpg" );
    var materialClouds = new THREE.MeshPhongMaterial( { color: 0xffffff, map: cloudsTexture, transparent:true, opacity:0.3 } );

    meshClouds = new THREE.Mesh( spGeo, materialClouds );
    meshClouds.scale.set( 1.015, 1.015, 1.015 );
    globeGroup.add( meshClouds );
    */
}

// Light
function addLights() {
   light = new THREE.DirectionalLight(0x3333ee, 3.5, 200 );
   scene.add( light );
   light.position.set(POS_X,POS_Y,POS_Z);
}

// Caption

function createText(textStr,position) {
    var upperCase = textStr.toUpperCase();
    var text = new THREE.TextGeometry( upperCase, { opacity: 0.5, size: 20, height: 1, font: "helvetiker",  });
    var material = new THREE.MeshBasicMaterial({color: 0x4ba0a3});
     var textGeo = new THREE.Mesh(text, material); 
      
    textGeo.position.x = position.x;
    textGeo.position.y = position.y;
    textGeo.position.z = position.z;
    
    scene.add(textGeo);
}

/*****************************************************
/* SAT                                              */
/****************************************************/

function plotSatellite(data,label) {
    
    
    //console.debug(data);
    // Plot Path
    var material = new THREE.LineBasicMaterial({linewidth: 1, color: 0x70c2c7, opacity: 0.8 });
    var geometry = new THREE.Geometry();

    for(i=0; i < data.X.length; i++) {
        
        x = data.X[i]/earthRadiusKm * 1000;
        y = data.Y[i]/earthRadiusKm * 1000;
        z = data.Z[i]/earthRadiusKm * 1000;
        //console.debug("X",x,"Y",y,"Z",z);
        geometry.vertices.push(new THREE.Vector3(x, y, z));
    }
    
    var line = new THREE.Line(geometry, material);
    scene.add(line);   
    

    
    //scaleObject(line,0,1,1000);
    posLineStart = new THREE.Vector3(data.X[0]/earthRadiusKm * 1000,data.Y[0]/earthRadiusKm * 1000,data.Z[0]/earthRadiusKm * 1000);
    posLineEnd = new THREE.Vector3(data.X[data.X.length-1]/earthRadiusKm * 1000,data.Y[data.Y.length-1]/earthRadiusKm * 1000,data.Z[data.Z.length-1]/earthRadiusKm * 1000);
    
    // Plot Start Point
    createText(label,posLineStart);

    
    partStartMaterial = new THREE.ParticleBasicMaterial( { opacity: 0.5, color: 0x3d6d70, size  : 80} );
    particleGeometry = new THREE.Geometry();        
    particleGeometry.vertices.push(posLineStart);
    particleGeometry.vertices.push(posLineEnd);
    
  var pathLimits = new THREE.ParticleSystem( particleGeometry, partStartMaterial );
  scene.add(pathLimits);

    
}

function drawAsParticles(data,label) {
    var geometry = new THREE.Geometry();
    var x,y,z;
    
    for (i = 0; i < data.X.length; i ++) {
        x = data.X[i]/earthRadiusKm * 1000;
        y = data.Y[i]/earthRadiusKm * 1000;
        z = data.Z[i]/earthRadiusKm * 1000;
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        //console.debug(x,y,z)
    }
    
    material = new THREE.ParticleBasicMaterial({ opacity:0.8, color: 0x39797b, size: 4 });
    particles = new THREE.ParticleSystem( geometry, material );
    scene.add( particles );
    				
}


