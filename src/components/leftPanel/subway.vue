<template>
<div>
<el-input icon="search" placeholder="搜索" style="width: 260px;" v-model="nameBox"></el-input>
<el-table :data="subwayNameData" style="width: 260px;text-align:left">
	<el-table-column type="expand">
		<template scope="scope">
			<span v-for="(val,key) in (scope.row.lines)">
				<el-form class="demo-table-expand" inline="" label-position="left">
					<el-form-item>
						<i class="el-icon-fa-subway"></i>
						<span @click="showRoute(scope.$index)" le="margin-left: 10px">{{scope.row.lines[key]}}</span>
						<i class="el-icon-delete" @click="handleDeleteSubway(scope.$index, scope.row)"></i>
					</el-form-item>
				</el-form>
			</span>
		</template>
	</el-table-column>
	<el-table-column>
		<template scope="scope">
			<span>{{scope.row.city}}</span>
			<a href="javascript:;" style="color: #169bd5;font-size: 14px;padding-top: 7px" @click="downloadSubway(scope.$index, scope.row)" download="download.geojson" :id=scope.$index><i class="el-icon-fa-arrow-down" ></i></a>
		</template>
	</el-table-column>
</el-table>
</div>
</template>