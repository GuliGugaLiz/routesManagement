<template>
<div>
<el-tabs style="height:460px;">
	<el-tab-pane>
		<span slot="label">
			<i class="el-icon-fa-train"></i>
			高铁
		</span>
		<v-train></v-train>
	</el-tab-pane>

	<el-tab-pane>
		<span slot="label">
			<i class="el-icon-fa-subway"></i>
			地铁
		</span>
		<v-subway></v-subway>
	</el-tab-pane>
</el-tabs>
</div>
</template>
<script>
import train from './train.vue'
import subway from './subway.vue'

export default{
	components:{
		'v-train':train,
		'v-subway':subway
	}
}
</script>