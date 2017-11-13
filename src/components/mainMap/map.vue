<template>
<div id="leaflet-map"></div>
</template>
<script>
import Leaflet from 'leaflet'
import "../../../node_modules/leaflet/dist/leaflet.css"
import 'leaflet-draw'
import '../../../node_modules/leaflet-draw/dist/leaflet.draw.css'
import '../../../node_modules/leaflet-draw/dist/leaflet.draw.js'

//把图标重新引入
delete Leaflet.Icon.Default.prototype._getIconUrl
Leaflet.Icon.Default.imagePath = ''
Leaflet.Icon.Default.mergeOptions({
  	iconRetinaUrl: require('../../assets/markers/marker-icon-2x.png'),
 	iconUrl: require('../../assets/markers/marker-icon.png'),
  	shadowUrl: require('../../assets/markers/marker-shadow.png')
})

export default{
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
			editableLayers:null,

		}
	},
		mounted:function(){
			this.initMap();			
			this.initDrawPanel();
			this.initPanel();
		},
		methods:{
			initMap:function(){
				this.map = new L.map('leaflet-map',{
					center:this.map_config.center,
					zoom:this.map_config.zoom,
					mixZoom:this.map_config.minZoom,
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
			initPanel:function(){
				let vm = this;
				var iconPanel = L.control({
					position:'topleft'
				});

				iconPanel.onAdd = function(map){
					this._div = L.DomUtil.create('div','info legend'),
					this.update();
					return this._div;
				};

				iconPanel.update = function(){
					this._div.innerHTML ='<i class="el-icon-fa-step-forward" style="width:15px;height:15px"></i>';
					L.DomEvent.on(this._div,'click',this.showPanel,this);
				};

				iconPanel.showPanel = function(e){					
					//vm.show = true;
					//vm.$emit('show','xixi')
					vm.sendShow();
				};

				iconPanel.addTo(this.map);
			},
			sendShow:function(){
				this.$emit('onshow',{show:true});
				
				
			}
		},
	
}
</script>
<style>
#leaflet-map{
	width: 900px;
	height: 500px;
}

.leaflet-marker-icon leaflet-div-icon leaflet-editing-icon leaflet-touch-icon leaflet-zoom-animated leaflet-interactive leaflet-marker-draggable{
    width:5px;
    height:5px;
}
</style>