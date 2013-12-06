
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

var i = 0;
var positions = [];

init();
animate();


//http://jsfiddle.net/crossphire/DAktM/
//http://ahighfive.com/2013/03/scaling-a-three-js-geometry-using-morphtargets/

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
  
  //renderer = new THREE.CanvasRenderer();
  renderer = new THREE.WebGLRenderer({antialias: true});
  
  renderer.setSize( window.innerWidth, window.innerHeight);
  renderer.setClearColorHex(0x070707);
  var container = document.getElementById("container");
  container.appendChild( renderer.domElement );
}
var hasData = false;

function animate() {
    var timer = Date.now() * 0.0001;
    
    camera.position.x = (Math.cos( timer ) *  3900);
    camera.position.z = (Math.sin( timer ) * 3900) ;
    
    if(hasData) {
        //sat.updatePosition();
    }
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


// Light
function addLights() {
   light = new THREE.DirectionalLight(0x3333ee, 3.5, 200 );
   scene.add( light );
   light.position.set(POS_X,POS_Y,POS_Z);
}

// Caption

function createText(textStr,position) {
    var upperCase = textStr.toUpperCase();
    var text = new THREE.TextGeometry( upperCase, { opacity: 0.5, size: 40, height: 1, font: "helvetiker",  });
    var material = new THREE.MeshBasicMaterial({color: 0x4ba0a3});
    var textGeo = new THREE.Mesh(text, material); 
      
    textGeo.position.x = position.x;
    textGeo.position.y = position.y;
    textGeo.position.z = position.z;
    
    scene.add(textGeo);
}

var t = 0.0;//traversal on path
var s = 0.001;//speed of traversal


/*****************************************************
/* SAT                                              */
/****************************************************/


function createOrbitPos(data) {
    for(i=0; i < data.Time.length; i++) {
        x = data.Coordinates.X[i]/earthRadiusKm * 1000;
        y = data.Coordinates.Y[i]/earthRadiusKm * 1000;
        z = data.Coordinates.Z[i]/earthRadiusKm * 1000;
        positions.push(new THREE.Vector3(x, y, z));
    }
    console.debug(positions);
}

function updatePosition() {
    if(positions.length == 0) {
        console.debug("Waiting for data");
    } else if(i == positions.length) {
        i = 0;
    } else {
        i++;
        console.debug(i);
    }
    
}


function parseTrajectory(coordinates) {
    var posTrajectory = [];
    for(i = 0; i < coordinates.X.length; i++) {
         posTrajectory.push(new THREE.Vector3(coordinates.X[i]/earthRadiusKm * 1000,coordinates.Y[i]/earthRadiusKm * 1000,coordinates.Z[i]/earthRadiusKm * 1000));
     }
     return posTrajectory;
    
}


//var elements = [];
function SatelliteSystem() {
    
    this.satelliteList = [];
    
    var i = 0;
    
    var satMaterial,satGeometry,satSystem;
    satMaterial = new THREE.ParticleBasicMaterial( { opacity: 0.5, color: 0xffffff, size  : 100} );
    satGeometry = new THREE.Geometry();
    satSystem = new THREE.ParticleSystem( satGeometry, satMaterial );
    satSystem.dynamic = true;
    //scene.add(satSystem);        
    
    this.addSatellite = function(data) {
        var satellite = {
            "id" : data.Id,
            "trajectory" : parseTrajectory(data.Coordinates),
            "time" : data.Time
            
        }
        this.satelliteList.push(satellite);
        
        console.debug(satellite["trajectory"][0]);
        satGeometry.vertices.push(satellite["trajectory"][0]);
            scene.add(satSystem);        
    }
    
    this.updatePosition = function() {
    /*    if(i == this.coordinates.length-1) {
            i = 0;
        } else {
            i++;
            this.currPos = this.coordinates[i];
            satSystem.position = this.currPos;
            console.debug(this.currPos);
        } 
        //this.currPos = this.coordinates[i];
        //console.debug(this.currPos);
        //console.debug(satSystem.geometry.vertices[0].x);
        //console.debug(this.CurrPos.x);
        //satSystem.geometry.vertices[0].x = this.CurrPos.x;
        
        //satSystem.geometry.vertices[0].x = this.CurrPos;
    */
    }
    
}

function plotSatellite(data,label) {
    
    
    //console.debug(data);
    // Plot Path
    var material = new THREE.LineBasicMaterial({linewidth: 1, color: 0x70c2c7, opacity: 0.5 });
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
    }
    
    material = new THREE.ParticleBasicMaterial({ opacity: 1, color: 0x39797b, size: 4 });
    particles = new THREE.ParticleSystem( geometry, material );
    scene.add( particles );
    				
}


