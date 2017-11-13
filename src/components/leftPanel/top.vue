<template>
<div>
	<input @change="fileSelected()" id="fileToUpload" name="file" style="display:none" type="file"/>
	<el-button class="addRoute" onclick="document.getElementById('fileToUpload').click()"  type="text">
		<i class="el-icon-fa-plus-square">
            导入路线
        </i>
    </el-button>
    <el-button class="saveRoute" :disabled="disabled" type="text" v-on:click="download">
    	<i class="el-icon-fa-save">
    		清除所有
    	</i>
    </el-button>

    <i @click="showPanel" class="el-icon-fa-step-backward" style="width: 0;"></i>
</div>
</template>
<script>
export default{
	data(){
		return{
			text:'',
			xmlDoc:'',
			fts:[],
			trainGeojsons:[],
			subwayGeojsons:[],
			trainName:[],
			subwayNameData:[],
			trainFeatureLayer:[],
			subwayFeatureLayer:[],

		}
	},
	methods:{
		onEachFeature:function(feature,layer){
			layer.bindPopup(feature.properties.name);
			//vm.editableLayers.addLayer(layer);
		},
		fileSelected:function(){
			let vm = this;
			let files = document.getElementById('fileToUpload').files;
			var fd = new FormData();
			fd.append('file', files[0]);
			var fileName = files[0].name;
			var fileTypes = new Array("xml","kml","geojson");
			var fileTypeFlag = "0";
			var newFileName = fileName.split('.');
			var newFileNameType = newFileName[newFileName.length-1];
			for(var i =0;i<fileTypes.length;i++){
				if(fileTypes[i] == newFileNameType){
					fileTypeFlag = "1";
				}
			}
			if(fileTypeFlag == "0"){
				alert("文件必须是xml、kml、geojson格式");
				return false;
			};

			var reader = new FileReader();
			reader.readAsText(files[0]);
			reader.onload = function(){
				vm.text=reader.result;
				switch (newFileNameType){
					case 'xml':vm.xlm2geojson(vm.text);
					break;
					case 'kml':vm.kml2geojson(vm.text);
					break;
					default:vm.initGeojson(files[0]);
				}
			};

			reader.onerror = function(e){
				console.log('Error',e);
			}

		},
		parseXML:function(text){
			var xmlDoc;
			try{
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(text);
			}catch(e){
				try{
					var parser = new DOMParser();
					xmlDoc = parser.parseFromString(text, "text/xml");					
				}catch(e){
					alert(e.message);
				}
			}
			this.xmlDoc = xmlDoc;
			return xmlDoc;
		},
		xlm2geojson:function(text){
			let vm = this;
			var txt = this.text;
			var xmlDoc = this.parseXML(txt);
			var city = xmlDoc.getElementsByTagName("City");
			var features = [];
			this.fts = features;
			for(var z=0;z<xmlDoc.getElementsByTagName("MetroLine").length;z++){
				var feature = [];
				var coordinates = [];
				for(var j=3;j<xmlDoc.getElementsByTagName("MetroLine")[z].childNodes.length;j+=4){
					var subitems = xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[j];
					//var coords = [];
					for(var b=1;b<(xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[j].childNodes).length;b+=2){
						var coord = [];
						coord.push(xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[j].childNodes[b].attributes[0].value,xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[j].childNodes[b].attributes[1].value);
						coordinates.push(coord);
					}
				};

				var metroLine = xmlDoc.getElementsByTagName("MetroLine")[z];
				feature.push({
					type: 'Feature',
					geometry:{
						type: 'LineString',
						coordinates: coordinates,
					},
					properties:{
						name:metroLine.getAttribute("Name")
					}
				});

				for(var i=1;i<xmlDoc.getElementsByTagName("MetroLine")[z].childNodes.length;i+=4){
					var staions = xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[i];
					var coords = [];
					coords.push(xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[i].getAttribute("Longitude"),xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[i].getAttribute("Latitude"))
					feature.push({
						type: 'Feature',
						geometry:{
							type: 'Point',
							coordinates: coords
						},
						properties:{
							name:staions.getAttribute("Name")
						}
					});
				};
				features.push(feature);
			};

			var lines = [];
			for(var f=0;f<this.fts.length;f++){
				var subwayData = {
					"type":"FeatureCollection",
					"features":this.fts[f],
					"properties":{
						"cityName":city["0"].attributes["0"].value
					},
				};

				vm.subwayGeojsons.push(subwayData);

				var subwayFeatureLayer = L.geoJSON(trainData,{
					onEachFeature:vm.onEachFeature()
				});

				vm.subwayFeatureLayer.push(subwayFeatureLayer);
				vm.map.addLayer(subwayFeatureLayer);

				lines.push(subwayData.features["0"].properties.name);

			};
			var subwayNameData = {
				city:subwayData.properties.cityName,
				lines:lines
			};
			vm.subwayNameData.push(subwayNameData);
		},
		kml2geojson:function(text){

		},
		initGeojson:function(text){

		}
	}
}
</script>