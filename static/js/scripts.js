var POS_X = 1800;
var POS_Y = 500;
var POS_Z = 2000;

var globeGroup;

init();
animate();


function init() {
  camera = new THREE.PerspectiveCamera( 45  , window.innerWidth / window.innerHeight,1,6000 );
  camera.position.set(POS_X,POS_Y, POS_Z);
  camera.lookAt(new THREE.Vector3(0,0,0));
  globeGroup = new THREE.Object3D();
  
  scene = new THREE.Scene();
  scene.add(camera);
  scene.add(globeGroup);
  
  addEarth();
  addClouds();
  addStructure();
  
  //renderer = new THREE.CanvasRenderer();
  renderer = new THREE.WebGLRenderer();
  
  renderer.setSize( window.innerWidth, window.innerHeight);
  renderer.setClearColorHex(0x111111);
  var container = document.getElementById("container");
  container.appendChild( renderer.domElement );
}

function addStructure() {
    
    
    var nodeGroup = new THREE.Object3D();
    nodeGeometry = new THREE.IcosahedronGeometry(900,2);
    
    nodeMaterial = new THREE.MeshBasicMaterial({ linewidth: 2, opacity:0.05, color : 0xfffff, wireframe : true });
    nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);			
    //nodeMesh.position = position;
    //console.debug(nodeMesh.geometry.faces);

    var faces = nodeMesh.geometry.vertices;
    for(var i=0; i < faces.length; i++) {
        //console.debug(faces[i]);
        
        
        material = new THREE.ParticleCanvasMaterial( { opacity: 0.5, color: 0xffffff, program: particleRender } );
        particle = new THREE.Particle(material);
        particle.position = new THREE.Vector3(faces[i].x,faces[i].y,faces[i].z);
        //globeGroup.add(particle);
        particle.scale.x = particle.scale.y = particle.scale.z = 3;
        
        //faces[i].color.r = 0xb10707;
        //faces[i].color = "#"+((1<<24)*Math.random()|0).toString(16);
    }
    
    //scene.add(nodeMesh);
    
}
// add the earth
function addEarth() {
   var spGeo = new THREE.SphereGeometry(800,50,50);
   var planetTexture = THREE.ImageUtils.loadTexture( "imgs/map3.jpg" );
   var mat2 =  new THREE.MeshPhongMaterial( {
       map: planetTexture,
       shininess: 0.2 } );
   sp = new THREE.Mesh(spGeo,mat2);
   globeGroup.add(sp);
}

// add clouds
function addClouds() {
    var spGeo = new THREE.SphereGeometry(800,50,50);
    var cloudsTexture = THREE.ImageUtils.loadTexture( "imgs/clouds.jpg" );
    var materialClouds = new THREE.MeshPhongMaterial( { color: 0xffffff, map: cloudsTexture, transparent:true, opacity:0.3 } );

    meshClouds = new THREE.Mesh( spGeo, materialClouds );
    meshClouds.scale.set( 1.015, 1.015, 1.015 );
    globeGroup.add( meshClouds );
}

// add a simple light
function addLights() {
   light = new THREE.DirectionalLight(0x3333ee, 3.5, 500 );
   scene.add( light );
   light.position.set(POS_X,POS_Y,POS_Z);
}

function animate() {
    var timer = Date.now() * 0.0001;
    
    camera.position.x = (Math.cos( timer ) *  3900);
    camera.position.z = (Math.sin( timer ) * 3900) ;
    camera.lookAt( scene.position );
    renderer.render( scene, camera );    
    requestAnimationFrame( animate );
}


function latLongToVector3(lat, lon, radius, heigth) {
    var phi = (lat)*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;

    var x = -(radius+heigth) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+heigth) * Math.sin(phi);
    var z = (radius+heigth) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
}

function particleRender( context ) {
	context.beginPath();
	context.arc( 0, 0, 1, 0,  Math.PI * 2, true );
	context.fill();
}

function mapPoint(lat,lon) {
    material = new THREE.ParticleCanvasMaterial( { color: 0xffffff, program: particleRender } );
    particle = new THREE.Particle(material);
    var pos = latLongToVector3(lat,lon,805,2);
    particle.position = pos;
    particle.scale.x = particle.scale.y = particle.scale.z = 9;
    //globeGroup.add(particle);
    return pos;
}

function createConnection(p1,p2) {
    // smooth my curve over this many points
    var numPoints = 100;

    var midx = (p1.x + p2.x);
    var midy = (p1.y + p2.y);
    
    
    spline = new THREE.SplineCurve3([
       p1,
       new THREE.Vector3(midx, midy, 500),
       p2
    ]);

    var material = new THREE.LineBasicMaterial({
        color: 0x00ae6f, opacity: 1, linewidth: 3
    });

    var geometry = new THREE.Geometry();
    var splinePoints = spline.getPoints(numPoints);

    for(var i = 0; i < splinePoints.length; i++){
        geometry.vertices.push(splinePoints[i]);  
    }

    var line = new THREE.Line(geometry, material);
   
    //globeGroup.add(line);
    
}

function pointPair(p1,p2) {
    var point1 = new mapPoint(p1.lat,p1.lon);
    var point2 = new mapPoint(p2.lat,p2.lon);
    //createConnection(point1,point2);
}

/*
pointPair(
    { 
        lat: -19.9597163, 
        lon: -43.9307278 
    },
    {   lat: 24.84656534821976, 
        lon: -78.22265625 
});
*/

pointPair(
    { 
        lat: 20.000000, 
        lon: -10.000000 
    },
    {   lat: 51.509426, 
        lon: -0.10437 
});

