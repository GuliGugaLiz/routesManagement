<template>
<div>
<el-container>
  <el-header>
  	<v-top></v-top>
  </el-header>
  <el-main>
  	<v-tabs></v-tabs>
  </el-main>
</el-container>

</div>
</template>

<script>
import topPanel from './top.vue'
import tabsPanel from './tabs.vue'
export default{
	data(){
		return{

		}
	},
	components:{
		'v-top':topPanel,
		'v-tabs':tabsPanel
	}
}
</script>
<style>

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