
// API STUFF
var sscUrl = "http://sscweb.gsfc.nasa.gov/WS/sscr/2";
var dataReqXml1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema">'; // part 1 of a DataRequest
var dataReqXml2 = '<BFieldModel><InternalBFieldModel>IGRF-10</InternalBFieldModel><ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel"><KeyParameterValues>KP3_3_3</KeyParameterValues></ExternalBFieldModel><TraceStopAltitude>100</TraceStopAltitude></BFieldModel>'; // part 2 of a DataRequest
var dataReqXml3 = '<OutputOptions><AllLocationFilters>true</AllLocationFilters><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>X</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Y</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Z</Component></CoordinateOptions><MinMaxPoints>2</MinMaxPoints></OutputOptions></DataRequest>'; // part 3 of a DataRequest

var earthRadiusKm = 6378;  

var plotList = [];
var ONE_HOUR = 60 * 60 * 1000; /* ms */
                                                                
getObservatories();

////////////////////// Get Locations ////////////////////// 


function plotSatellite(data) {
    
    // Plot Path
    var material = new THREE.LineBasicMaterial({linewidth: 1, color: 0xffffff,opacity: 0.5});
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
    
    lineStart = new THREE.Vector3(data.X[0]/earthRadiusKm * 1000,data.Y[0]/earthRadiusKm * 1000,data.Z[0]/earthRadiusKm * 1000);
    lineEnd = new THREE.Vector3(data.X[data.X.length-1]/earthRadiusKm * 1000,data.Y[data.Y.length-1]/earthRadiusKm * 1000,data.Z[data.Z.length-1]/earthRadiusKm * 1000);
    
    // Plot Start Point
    partStartMaterial = new THREE.ParticleCanvasMaterial( { opacity: 0.5, color: 0xffffff, program: particleRender } );
    particleStart = new THREE.Particle(partStartMaterial);
    particleStart.position = lineStart;
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
    for ( i = 0; i < data.X.length; i ++ ) {

        x = data.X[i]/earthRadiusKm * 1000;
        y = data.Y[i]/earthRadiusKm * 1000;
        z = data.Z[i]/earthRadiusKm * 1000;
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        console.debug(x,y,z)
    }
    material = new THREE.ParticleBasicMaterial({ color: 0xffffff, size: 4 });
   
    particles = new THREE.ParticleSystem( geometry, material );
    scene.add( particles );
    				
}

function getLocation(id,startTime,endTime) {
    
    var timeReqXml = '<TimeInterval><Start>' + startTime +'</Start><End>' + endTime + '</End></TimeInterval>';     // Time format: 1997-08-26T00:00:00.000Z
    var satReqXml = '<Satellites><Id>' + id + '</Id>' + '<ResolutionFactor>2</ResolutionFactor></Satellites>';
    var request = dataReqXml1 + timeReqXml + dataReqXml2 + satReqXml + dataReqXml3;    
    
    //console.debug("XML Request",request);
    
    var xmlRequest = $.ajax({
        type: 'POST',
        url: sscUrl + '/locations', 
        data: request,
        dataType: 'json',
        contentType: 'application/xml',
        processData: false,
        success: handleLocations, 
    }); 
    
    
}
function handleLocations(data) {
    
    if(data.Result.StatusCode == "Success") {
        console.debug("SUCCESS Satellite:",data.Result.Data.Id, " ",data.Result);     // If can get current locations store in array
        //plotSatellite(data.Result.Data.Coordinates);
        drawAsParticles(data.Result.Data.Coordinates);
        
    } else {
        console.debug("FAILED: Satellite:",data.Result.StatusCode,data.Result.StatusSubCode);
    }
    
}


////////////////////// Get Satellites ////////////////////// 

function getObservatories() {
    var xmlRequest = $.ajax({
      type: 'GET',
      url: sscUrl + '/observatories', 
      dataType: 'json',
      contentType: 'application/json',
    });

    xmlRequest.done( handleObservatories );    
}

function handleObservatories(data) {
    var elStartTime = getDateTime().now;
    var elEndTime = getDateTime().later;
    var elId;
     
    
    console.debug("Could fetch:",data.Observatory.length,"satellites");
    console.debug("Sats are:",data);
    
    // Get all satellites
    $.each(data.Observatory, function(index,value) {
        
        
        
        elId = data.Observatory[index].Id;        
        startTime = removeOneHour(data.Observatory[index].EndTime); // remove one hour
        endTime = data.Observatory[index].EndTime;
        getLocation(elId,startTime,endTime); // new API call
    });
    
    
    
    
}


////////////////////// Get Locations //////////////////////
Date.prototype.removeHours= function(h){
    this.setHours(this.getHours()-h);
    return this;
}

function removeOneHour(str) {
    // "2013-11-03T22:00:00.000Z"
    str = str.substring(0, str.length - 5);
    var date = new Date(str).removeHours(24);
    return date.toISOString();
}



function getDateTime() {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var now = year+'-'+month+'-'+day+'T'+hour+':'+minute+':'+second+".000Z";   
    var later = year+'-'+month+'-'+day+'T'+(hour+1)+':'+minute+':'+second+".000Z";   
    
    // One hour later
    return { "now" : now, "later" : later };
}


