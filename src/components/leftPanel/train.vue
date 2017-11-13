<template>
<div>
<el-input icon="search" placeholder="搜索" style="width: 260px;" v-model="nameBox"></el-input>
<el-table :data="newNames" style="width: 260px;text-align:left">
	<el-table-column width="200">
		<template scope="scope">
			<i class="el-icon-fa-train"></i>
			<span @click="showRoute(scope.$index)" style="margin-left: 10px">{{scope.row}}</span>
		</template>
	</el-table-column>
	<el-table-column width="58">
		<template scope="scope">
			<i class="el-icon-delete" @click="handleDeleteTrain(scope.$index, scope.row)"></i>
			<a href="javascript:;" name="download" style="color: #169bd5;font-size: 14px;padding-top: 7px" @click="downloadTrain(scope.$index, scope.row)"  download="download.geojson" :id=scope.$index>
			<i class="el-icon-fa-arrow-down" ></i></a>
		</template>
	</el-table-column>
</el-table>

</div>
</template>
<script>
export default{
	data(){
		return{
			nameBox:'',

		}
	}
}
</script>