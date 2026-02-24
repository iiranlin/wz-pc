<template>
  <div id="mapDiv">

  </div>
</template>

<script>
export default {
  name: 'map',
  mounted(){
    this.initMap()
  },
  methods: {
    initMap(){
      const base_url = '/'
      const layers = [
        new AMap.TileLayer({
          getTileUrl: function(x,y,z){
            return `${base_url}GisMap/${z}/${x}/${y}.png`
          },
          opacity: 1,
          zIndex: 99,
        })
      ]
      this.mapObj = new AMap.Map('mapDiv', {
        resizeEnable: true,
        zoom: 12,
        rotateEnable: true,
        pitchEnable: true,
        center: [121.474,31.230],
        defaultCursor: 'pointer',
        mapStyle: 'amap://styles/whitesmoke',
        showLabel: true,
        layers: layers,
      })
      
    }
  }
}
</script>

<style>
#mapDiv {
  width: 100%;
  height: 100%;
}
</style>