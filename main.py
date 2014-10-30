import urllib2
import json

SSC_URL = "http://sscweb.gsfc.nasa.gov/WS/sscr/2"

class ClientRequest():
	
	def __init__(self):
		
		self.dataReqXml1 ='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema">'
		self.dataReqXml2 = '<BFieldModel><InternalBFieldModel>IGRF-10</InternalBFieldModel><ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel"><KeyParameterValues>KP3_3_3</KeyParameterValues></ExternalBFieldModel><TraceStopAltitude>100</TraceStopAltitude></BFieldModel>'
		self.dataReqXml3 = '<OutputOptions><AllLocationFilters>true</AllLocationFilters><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>X</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Y</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Z</Component></CoordinateOptions><MinMaxPoints>2</MinMaxPoints></OutputOptions></DataRequest>'

	def getSatelliteList(self):

		request = urllib2.Request(SSC_URL + '/observatories', headers = {'ACCEPT': 'application/json'})
		f = urllib2.urlopen(request)
		response = f.read()
		jsonResult = json.loads(response)['Observatory']
		f.close()

		return jsonResult

	def getSatelliteData(self,id,startTime,endTime):
	
		timeReqXml = '<TimeInterval><Start>' + startTime +'</Start><End>' + endTime + '</End></TimeInterval>'  # Time format: 1997-08-26T00:00:00.000Z
		satReqXml = '<Satellites><Id>' + id + '</Id>' + '<ResolutionFactor>2</ResolutionFactor></Satellites>'
		requestData = self.dataReqXml1 + timeReqXml + self.dataReqXml2 + satReqXml + self.dataReqXml3;   
		
		request = urllib2.Request(SSC_URL + '/locations', data=requestData, headers = {'Content-Type': 'application/xml'})
		f = urllib2.urlopen(request)
		response = f.read()
		#jsonResult = json.loads(response)
		f.close()

		return response


if __name__ == "__main__":
	client = ClientRequest()
	satellites =  client.getSatelliteList()

	print ClientRequest

	for satellite in satellites:
		#print satellite
		ident = satellite['Id']
		startTime = satellite['StartTime']
		endTime = satellite['EndTime']

		print client.getSatelliteData(ident,startTime,endTime)


		# print satellite['Name']
		# print satellite['Geometry']
		# print satellite['ResourceId']
		# print satellite['StartTime']
		# print satellite['EndTime']
		# print satellite['TrajectoryGeometry']
		# print satellite['Resolution']


