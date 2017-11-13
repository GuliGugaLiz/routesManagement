<template>
    <div class="routesManagement" >
        <div class="left" v-show="show">
            <span>
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
                <i @click="showPanel" class="el-icon-fa-step-backward" style="width: 0;">
                </i>
            </span>
            <el-tabs style="height: 600px;">
                <el-tab-pane>
                    <span slot="label">
                        <i class="el-icon-fa-train">
                        </i>
                        高铁
                    </span>
                    <el-input icon="search" placeholder="搜索" style="width: 260px;" v-model="nameBox">
                    </el-input>
                    <el-table :data="newNames" style="width: 260px;text-align:left">
                        <el-table-column width="200">
                            <template scope="scope">
                                <i class="el-icon-fa-train">
                                </i>
                                <span @click="showRoute(scope.$index)" style="margin-left: 10px">
                                    {{scope.row}}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column width="58">
                            <template scope="scope">
                                <i class="el-icon-delete" @click="handleDeleteTrain(scope.$index, scope.row)">
                                    </i>

                                     <a href="javascript:;"   name="download" style="color: #169bd5;font-size: 14px;padding-top: 7px" @click="downloadTrain(scope.$index, scope.row)" download="download.geojson" :id=scope.$index><i class="el-icon-fa-arrow-down" ></i></a>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane>
                    <span slot="label">
                        <i class="el-icon-fa-subway">
                        </i>
                        地铁
                    </span>
                    <el-input icon="search" placeholder="搜索" style="width: 260px;" v-model="nameBox">
                    </el-input>
                    <el-table :data="subwayNameData" style="width: 260px;text-align:left">
                        <el-table-column type="expand">
                            <template scope="scope">
                                <span v-for="(val,key) in (scope.row.lines)">
                                    <el-form class="demo-table-expand" inline="" label-position="left">
                                        <el-form-item>
                                            <i class="el-icon-fa-subway">
                                            </i>
                                            <span @click="showRoute(scope.$index)" le="margin-left: 10px">
                                                {{scope.row.lines[key]}}
                                            </span>
                                            <i class="el-icon-delete" @click="handleDeleteSubway(scope.$index, scope.row)">
                                                </i>
                                        </el-form-item>
                                    </el-form>
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column>
                            <template scope="scope">
                                <span>
                                    {{scope.row.city}}
                                </span>
                                 <a href="javascript:;" style="color: #169bd5;font-size: 14px;padding-top: 7px" @click="downloadSubway(scope.$index, scope.row)" download="download.geojson" :id=scope.$index><i class="el-icon-fa-arrow-down" ></i></a>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div id="leaflet-map">
        </div>
    </div>
</template>
<script>
    import Leaflet from 'leaflet'
import axios from 'axios'
import "../../node_modules/leaflet/dist/leaflet.css"
import 'leaflet-draw'
import '../../node_modules/leaflet-draw/dist/leaflet.draw.css'
import '../../node_modules/leaflet-draw/dist/leaflet.draw.js'

delete Leaflet.Icon.Default.prototype._getIconUrl
Leaflet.Icon.Default.imagePath = ''
Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: require('../assets/markers/marker-icon-2x.png'),
  iconUrl: require('../assets/markers/marker-icon.png'),
  shadowUrl: require('../assets/markers/marker-shadow.png')
})

  export default {
    data() {
      return {
        map:null,
        map_config:{
            url:'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            center:[37.5,106],
            zoom:4,
            minZoom:2,
            maxZoom:18,
            zoomControl:false,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        },

        nameBox:'',
        show:true,
        disabled:false,
        text:'',
        xmlDoc:'',
        fts:[],
        trainGeojsons:[],
        subwayGeojsons:[],
        createdGeojsons:[],
        geojsons:[],
        trainName:[],
        subwayNameData:[],
        trainFeatureLayer:[],
        subwayFeatureLayer:[],
        editableLayers:null,
      }
    },
    mounted:function(){
        this.initMap();
        this.initPanel();
        this.initDrawPanel();
    },
    methods: {
        initMap:function(){
            this.map = new L.map('leaflet-map',{
                center:this.map_config.center,
                zoom:this.map_config.zoom,
                minZoom:this.map_config.minZoom,
                maxZoom:this.map_config.maxZoom,
                zoomControl:this.map_config.zoomControl
            });
            L.tileLayer(this.map_config.url,{
                attribution:this.map_config.attribution

            }).addTo(this.map);

        },
        initDrawPanel:function(){
            var editableLayers = new L.FeatureGroup().addTo(this.map);
            var options = {
                position:'topright',
                draw:{
                    marker:false
                },
                edit:{
                    featureGroup:editableLayers,
                    remove:true
                }
            };
            var drawControl = new L.Control.Draw(options);
            this.map.addControl(drawControl);
            let vm = this;
            //建新图层
            this.map.on(L.Draw.Event.CREATED, function (e) {
                var layer = e.layer;
                var content = JSON.stringify(e.layer.toGeoJSON());
                console.log(content);
                editableLayers.addLayer(layer);
            });
            //编辑图层
            this.map.on('draw:edited',function(e){
                var layers = e.layers;
                var content = null;
                layers.eachLayer(function(e){
                    content = JSON.stringify(layer.toGeoJSON());
                });
                var fts_content = JSON.parse(content);
                var editGeojson = {
                    "type":"FeatureCollection",
                    "features":[fts_content]
                };                    
            });
            this.map.on('draw:deleted',function(e){
                var layer = e.layer;
            });
            this.editableLayers = editableLayers;
        },
        onEachFeature:function(feature,layer){
            layer.bindPopup(feature.properties.name);
            this.editableLayers.addLayer(layer);
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
            //按地铁线路循环取数据
            for(var z=0;z<xmlDoc.getElementsByTagName("MetroLine").length;z++){
             var feature = [];
             var coordinates = []; 
             //取出每个站点途径的坐标点
            for(var j=3;j<xmlDoc.getElementsByTagName("MetroLine")[z].childNodes.length;j+=4){
             var subitems = xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[j];
                for(var b=1;b<(xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[j].childNodes).length;b+=2){
                    var coord = [];
                    coord.push(xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[j].childNodes[b].attributes[0].value,xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[j].childNodes[b].attributes[1].value);
                 coordinates.push(coord);
    }

      };
             var metroLine = xmlDoc.getElementsByTagName("MetroLine")[z];
               feature.push({
                 type: 'Feature',
                     geometry: {
                         type: 'LineString',
                         coordinates: coordinates,
                         },
                         properties:{
                           name:metroLine.getAttribute("Name")
                         }

               });
               //取出每个站点的信息，站点名、站点坐标
               for(var i=1;i<xmlDoc.getElementsByTagName("MetroLine")[z].childNodes.length;i+=4){

                  var staions = xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[i];
                  var coords = [];
                  coords.push(xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[i].getAttribute("Longitude"),xmlDoc.getElementsByTagName("MetroLine")[z].childNodes[i].getAttribute("Latitude"))

                feature.push(
                  {
                    type: 'Feature',
                    geometry: {
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
                var subwayData =  {
                    "type":"FeatureCollection",
                    "features":this.fts[f],
                    "properties":{
                        "cityName":city["0"].attributes["0"].value
                    },
              };

              vm.subwayGeojsons.push(subwayData);

             var subwayFeatureLayer = L.geoJSON(subwayData,{
                onEachFeature:vm.onEachFeature
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
           //console.log(vm.subwayGeojsons);

        },
        kml2geojson:function(text){
            let vm = this;
            var txt = this.text;
            var xmlDoc = this.parseXML(txt);
            var feature = [];
            var i = 0;
            //路线名字
            var plname = xmlDoc.getElementsByTagName("Placemark")[i].childNodes[1].textContent;
            var nodeLength = xmlDoc.getElementsByTagName("Placemark")[i].childNodes.length;
            //组成路线的坐标点
            var plcoordinates = xmlDoc.getElementsByTagName("Placemark")[i].childNodes[(nodeLength-2)].childNodes[3].textContent;
            //将plcoordinates处理成可识别的坐标对
            var p1=plcoordinates.trim();
            var coords = [];
            var p2 = p1.split(" ");
            for(var a=0;a<p2.length;a++){
                var p3 = p2[a].split(",");
                coords.push(p3);
            }

            feature.push(
            {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: coords
                    },
                properties:{
                    name:plname
                }
            });

            var trainData =  {
                "type":"FeatureCollection",
                "features":feature,
          };

          vm.trainName.push(trainData.features["0"].properties.name);

          vm.trainGeojsons.push(trainData);

         var trainFeatureLayer = L.geoJSON(trainData,{
            onEachFeature:vm.onEachFeature
          });

         vm.trainFeatureLayer.push(trainFeatureLayer);

         vm.map.addLayer(trainFeatureLayer);

         //vm.geojsonLayers.addLayer(geojsonLayer)
},
        initGeojson:function(f){
            let vm = this;
            var txt = vm.text;
            //var geojsonData = eval("("+txt+")");
            var geojsonData = JSON.parse(txt);
            vm.geojsons.push(geojsonData);
           // console.log(geojsonData);
              L.geoJSON(geojsonData,{
                   onEachFeature:function(feature,layer){
                    //console.log(feature.properties.name);
                   /* console.log(layer);
                    if(feature.length = 1){
                        vm.trainName.push (feature.properties.name);
                    }else{

                        console.log(3333)

                    }*/
                        //this.trainName.push (feature.properties.name);
                        vm.editableLayers.addLayer(layer);
            }
                 }).addTo(this.map);
        },

        initPanel:function(){
            let vm = this;
            var info = L.control({
                position:'topleft'
            });

            info.onAdd = function(map){
                 this._div = L.DomUtil.create('div','info legend'),
                 this.update();
                 return this._div;
                 console.log(this._div);
                 };
            info.update = function(){
                this._div.innerHTML ='<i class="el-icon-fa-step-forward" style="width:15px;height:15px"></i>';
                    L.DomEvent.on(this._div,'click',this.showPanel,this)
                 };
            info.showPanel = function(e){
                  vm.show = true;
                 }
            info.addTo(this.map);
        },
        handleDeleteTrain:function(index,row){
            this.trainName.splice(index,1);
            this.map.removeLayer(this.trainFeatureLayer[index]);
            this.trainFeatureLayer.splice(index,1);
            this.$message({
              message:'操作成功',
              type:'success'
            });
          },
        handleDeleteSubway:function(index,row){
        },
        downloadTrain: function(index,row) {
            var id = index;
            var obj = document.getElementById(id);
            console.log(this.trainGeojsons[index]);
            var str = JSON.stringify(this.trainGeojsons[index]);
            var fileName = this.trainName[index];
            str = encodeURIComponent(str);
            obj.href = "data:text/geojson;charset=utf-8,\ufeff" + str;
            obj.download = fileName+".geojson";
          },
        downloadSubway:function(index,row){
            var id = index;
            var obj = document.getElementById(id);
            var str = JSON.stringify(this.subwayGeojsons[index]);
            var fileName = this.cityName[index];
            str = encodeURIComponent(str);
            obj.href = "data:text/geojson;charset=utf-8,\ufeff" + str;
            obj.download = fileName+".geojson";
        },
        showRoute:function(index){
            var routeName = this.trainName[index];
            var path = '';

            for(var r=0;r<this.trainName.length;r++){
                this.trainName[r] == routeName;
                path = this.trainGeojsons[r];

            }

          var pathLayer =   L.geoJson(path)
                .bindPopup(function (layer) {
                       return layer.feature.properties.name;})
                .addTo(this.map);
                this.map.fitBounds(pathLayer.getBounds());
      },
              showPanel:function(){
            this.show = !this.show;
        },
    },
    computed: {
        newNames: function () {
            var that = this;
            return that.trainName.filter(function (name) {
              return name.toLowerCase().indexOf(that.nameBox.toLowerCase()) !== -1;
               })
       }
     },
     watch:{
        names:function(val,oldVal){
           if(val == null){
            this.show = false;
            this.disabled = true;
           }else{
            this.show = true;
            this.disabled = false;
           }
        },
        show:function(val,oldVal){
          if(val == true){
            this.divset = document.getElementsByClassName("info legend leaflet-control");
                    for(var i=0;i<this.divset.length;i++){
                      this.divset[i].style.display="none";
                    };
            document.getElementById("leaflet-map").style.width="75%"
          }else{
            this.divset = document.getElementsByClassName("info legend leaflet-control");
                    for(var i=0;i<this.divset.length;i++){
                      this.divset[i].style.display="block";
                    };
                    document.getElementById("leaflet-map").style.width="100%"
          }
        },
        edit:function(val,oldVal){
            console.log(val);
        },
    }
  }
</script>
<style>
.routesManagement{
    width:1300px;
     margin:0 auto;
     height: 100%;
}

.left{
    float:left;
}

.addRoute{
    float:left;
    margin-left:10px
}

.saveRoute{
    margin-left:40px
}

#leaflet-map{
    float:left;
    width:980px;
    height:600px;
    margin-left:5px

}

.el-table__header-wrapper{
    display:none;
}

.el-tabs__item{
    width:130px;
}

.el-table .cell{
    padding-left:8px;
}

.el-table__expanded-cell{
    padding:10px 10px;
}

.el-form-item__content{
    line-height:20px;
}

.el-icon-delete{
    color: red;
}

.leaflet-marker-icon leaflet-div-icon leaflet-editing-icon leaflet-touch-icon leaflet-zoom-animated leaflet-interactive leaflet-marker-draggable{
    width:5px;
    height:5px;
}
</style>