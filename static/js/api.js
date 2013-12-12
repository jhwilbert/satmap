/*****************************************************
/* VARS                                             */
/****************************************************/

var sscUrl = "http://sscweb.gsfc.nasa.gov/WS/sscr/2";
var dataReqXml1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema">'; // part 1 of a DataRequest
var dataReqXml2 = '<BFieldModel><InternalBFieldModel>IGRF-10</InternalBFieldModel><ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel"><KeyParameterValues>KP3_3_3</KeyParameterValues></ExternalBFieldModel><TraceStopAltitude>100</TraceStopAltitude></BFieldModel>'; // part 2 of a DataRequest
var dataReqXml3 = '<OutputOptions><AllLocationFilters>true</AllLocationFilters><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>X</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Y</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Z</Component></CoordinateOptions><MinMaxPoints>2</MinMaxPoints></OutputOptions></DataRequest>'; // part 3 of a DataRequest
var earthRadiusKm = 6378;  
var TIME_WINDOW = 1;

getSatellites();

/*****************************************************
/* GET SATELLITE LIST                               */
/****************************************************/ 

function getSatellites() {
    $.get(sscUrl + '/observatories', handleObservatories, 'json');
}

function handleObservatories(data) {
    var elId;
     
    console.debug("Could fetch:",data.Observatory.length,"satellites");
    console.debug("Sats are:",data);
    
    // Get One Satellite
    //var testEl = data.Observatory[3].Id;  
    //startTime = removeOneHour(data.Observatory[3].EndTime); // remove one hour
    //endTime = data.Observatory[3].EndTime;
    
    //satsystem = new SatelliteSystem();
    //getLocation(testEl,startTime,endTime); // new API call
    
    // Get all satellites
    $.each(data.Observatory, function(index,value) {
        elId = data.Observatory[index].Id;       
        startTime = removeOneHour(data.Observatory[index].EndTime); // remove one hour
        endTime = data.Observatory[index].EndTime;
        getLocation(elId,startTime,endTime); // new API call
    });
    
    
}


/*****************************************************
/* GET SATELLITE LOCATIONS                          */
/****************************************************/

function getLocation(id,startTime,endTime) {
    
    var timeReqXml = '<TimeInterval><Start>' + startTime +'</Start><End>' + endTime + '</End></TimeInterval>';  // Time format: 1997-08-26T00:00:00.000Z
    var satReqXml = '<Satellites><Id>' + id + '</Id>' + '<ResolutionFactor>2</ResolutionFactor></Satellites>';
    var request = dataReqXml1 + timeReqXml + dataReqXml2 + satReqXml + dataReqXml3;    
    
    $.ajax({
        type: 'POST',
        url: sscUrl + '/locations', 
        data: request,
        dataType: 'xml',
        contentType: 'application/xml',
        processData: false,
        success: handleXML, 
    });
}

function handleXML(data) {
    var json_data = $.xml2json(data);
    
    if(json_data.Result.StatusCode == "Success") {  
        console.debug("SUCCESS Satellite:",json_data.Result.Data.Id, " ",json_data.Result);     // If can get current locations store in array
        plotSatellite(json_data.Result.Data.Coordinates,json_data.Result.Data.Id);
        createOrbitPos(json_data.Result.Data);
        drawAsParticles(json_data.Result.Data.Coordinates,json_data.Result.Data.Id);
        //satsystem.addSatellite(json_data.Result.Data);
        hasData = true;
    } else {
        console.debug("FAILED: Satellite:",json_data.Result.StatusCode,json_data.Result.StatusSubCode);
    }
    
}


function handleLocations(data) {
    console.debug(data)
    /*
    if(data.Result.StatusCode == "Success") {  
        console.debug("SUCCESS Satellite:",data.Result.Data.Id, " ",data.Result);     // If can get current locations store in array
        plotSatellite(data.Result.Data.Coordinates,data.Result.Data.Id);
        createOrbitPos(data.Result.Data);
        drawAsParticles(data.Result.Data.Coordinates,data.Result.Data.Id);
        //satsystem.addSatellite(data.Result.Data);
        hasData = true;
    } else {
        console.debug("FAILED: Satellite:",data.Result.StatusCode,data.Result.StatusSubCode);
    }
    */
}

/*****************************************************
/* HELPERS                                          */
/****************************************************/

Date.prototype.removeHours= function(h){
    this.setHours(this.getHours()-h);
    return this;
}

function removeOneHour(str) {
    // 1991-09-05T00:00:00Z
    str = str.substring(0, str.length - 1);
    var date = new Date(str).removeHours(TIME_WINDOW);
    return date.toISOString();
}