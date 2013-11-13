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
  
  renderer = new THREE.CanvasRenderer();
  //renderer = new THREE.WebGLRenderer();
  
  renderer.setSize( window.innerWidth, window.innerHeight);
  renderer.setClearColorHex(0x111111);
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
   var planetTexture = THREE.ImageUtils.loadTexture( "imgs/map3.jpg" );
   var mat2 =  new THREE.MeshPhongMaterial( {
       map: planetTexture,
       shininess: 0.2 } );
   sp = new THREE.Mesh(spGeo,mat2);
   globeGroup.add(sp);
}

// Clouds
function addClouds() {
    var spGeo = new THREE.SphereGeometry(800,50,50);
    var cloudsTexture = THREE.ImageUtils.loadTexture( "imgs/clouds.jpg" );
    var materialClouds = new THREE.MeshPhongMaterial( { color: 0xffffff, map: cloudsTexture, transparent:true, opacity:0.3 } );

    meshClouds = new THREE.Mesh( spGeo, materialClouds );
    meshClouds.scale.set( 1.015, 1.015, 1.015 );
    globeGroup.add( meshClouds );
}

// Light
function addLights() {
   light = new THREE.DirectionalLight(0x3333ee, 3.5, 500 );
   scene.add( light );
   light.position.set(POS_X,POS_Y,POS_Z);
}

// Particle
function particleRender( context ) {
	context.beginPath();
	context.arc( 0, 0, 1, 0,  Math.PI * 2, true );
	context.fill();
}

/*****************************************************
/* SAT                                              */
/****************************************************/

function plotSatellite(data) {
    
    // Plot Path
    var material = new THREE.LineBasicMaterial({linewidth: 1, color: 0x70c2c7,opacity: 0.5});
    var geometry = new THREE.Geometry();
    var x,y,z;
    
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
    lineStart = new THREE.Vector3(data.X[0]/earthRadiusKm * 1000,data.Y[0]/earthRadiusKm * 1000,data.Z[0]/earthRadiusKm * 1000);
    lineEnd = new THREE.Vector3(data.X[data.X.length-1]/earthRadiusKm * 1000,data.Y[data.Y.length-1]/earthRadiusKm * 1000,data.Z[data.Z.length-1]/earthRadiusKm * 1000);
    
    // Plot Start Point
    partStartMaterial = new THREE.ParticleCanvasMaterial( { opacity: 0.5, color: 0xffffff, program: particleRender } );
    particleStart = new THREE.Particle(partStartMaterial);
    //particleStart.position = lineStart;
    particleStart.scale.x = particleStart.scale.y = particleStart.scale.z = 20;
    scene.add(particleStart);
    
    // Plot End Point
    partEndMaterial = new THREE.ParticleCanvasMaterial( { opacity: 0.5, color: 0xffffff, program: particleRender } );
    particleEnd = new THREE.Particle(partEndMaterial);
    particleEnd.position = lineEnd;
    particleEnd.scale.x = particleEnd.scale.y = particleEnd.scale.z = 20;
    scene.add(particleEnd);
    
}

function drawAsParticles(data) {
    var geometry = new THREE.Geometry();
    var x,y,z;
    
    for (i = 0; i < data.X.length; i ++) {
        x = data.X[i]/earthRadiusKm * 1000;
        y = data.Y[i]/earthRadiusKm * 1000;
        z = data.Z[i]/earthRadiusKm * 1000;
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        //console.debug(x,y,z)
    }
    
    material = new THREE.ParticleBasicMaterial({ color: 0xffffff, size: 4 });
    particles = new THREE.ParticleSystem( geometry, material );
    scene.add( particles );
    				
}


