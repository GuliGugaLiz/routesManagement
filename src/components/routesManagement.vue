<template>

<div class="routesManagement">
<div class="leftPanel" v-show="show">
  <v-leftPanel ></v-leftPanel>
  </div>
  <div class="mainMap">
  <v-mainMap @onshow="isShow"></v-mainMap>
  </div>

</div>
</template>
<script>
import leftPanel from './leftPanel/panel.vue'
import mainMap from './mainMap/map.vue'
export default{
  data() {
    return {
      show:true,

    }
  },
  components: {
    'v-leftPanel':leftPanel,
    'v-mainMap':mainMap
  },
  methods:{
    isShow:function(str){
      alert(222222222);
      this.show = str.show
      //this.msg = opt
      
    }
  }
}
</script>
<style>
.routesManagement{
  display: flex;
  position:absolute;
  top:50px;
  widows: 100%;
  overflow: hidden;
}

.leftPanel{
  flex:0 0 260px;
  width:260px;
}

.mainMap{
  flex:1;
}
</style>