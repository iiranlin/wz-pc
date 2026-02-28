<template>
  <div id="mapDiv">

  </div>
</template>

<script>
import * as Api from "@/api/largeScreen/aSupplyMaterials";
import markerIcon from '@/assets/large/v2_syelji.png'
export default {
  name: 'baseMap',
  props: {
  },
  data () {
    return {
      zoom: 8,
      zooms: [5, 12], //可见级别
      center: [121.474, 31.230],
      markers: [],
      siteList: [],
      mapObj: null,
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    async getProjectSite (params) {
      try {
        this.removeMarkers()
        const { success, data } = await Api.getProjectSite(params)
        if (success && Array.isArray(data) && data.length) {
          this.siteList = data.map(item => {
            return {
              name: item.siteName,
              icon: markerIcon,
              position: [+item.longitude, +item.latitude],
              info: item,
            }
          })

          const _this = this
          //点标记显示内容
          const markerContent = (name, icon) => {
            return `<div class="custom-content-marker">
                <img src="${icon}">
                <div class="label" >${name}</div>
                </div>`
          }
          // // 添加一些分布不均的点到地图上,地图上添加三个点标记，作为参照
          this.siteList.forEach(function (item) {
            const marker = new AMap.Marker({
              map: _this.mapObj,
              content: markerContent(item.name, item.icon), //将 html 传给 content
              position: [item.position[0], item.position[1]],
              offset: new AMap.Pixel(0, -25),
              anchor: 'center',
            })
            _this.markers.push(marker);
          });
          const { longitude, latitude } = data[0]
          this.mapObj.setZoomAndCenter(8, [longitude, latitude], false, 2000); //设置地图中心点
        }
      } catch (err) {
        console.log(err)
      }
    },
    async initMap () {
      const base_url = '/'
      const layers = [
        new AMap.TileLayer({
          getTileUrl: function (x, y, z) {
            return `${base_url}GisMap/${z}/${x}/${y}.png`
          },
          opacity: 1,
          zIndex: 99,
        })
      ]
      this.mapObj = new AMap.Map('mapDiv', {
        resizeEnable: true,
        zoom: this.zoom,
        zooms: this.zooms, //可见级别
        rotateEnable: true,
        pitchEnable: true,
        center: this.center,
        defaultCursor: 'pointer',
        mapStyle: 'amap://styles/whitesmoke',
        showLabel: true,
        layers: layers,
      })
      //2、创建省市简易行政区图层
      const distProvince = new AMap.DistrictLayer.Province({
        zIndex: 100, //设置图层层级
        zooms: [5, 12], //设置图层显示范围
        depth: 2, //设置数据显示层级，0：显示国家面，1：显示省级，当国家为中国时设置depth为2的可以显示市一级
      });

      // 3、设置行政区图层样式
      distProvince.setStyles({
        "stroke-width": 1, //描边线宽
        fill: function (data) { 
          return [0, 1, 1, 0.1];//
        },
      });
      distProvince.setDistricts(["310000", "320000", "330000", "340000"]);
      //4、将简易行政区图层添加到地图
      this.mapObj.add(distProvince);
    },
    removeMarkers () {
      this.markers.length && this.mapObj.remove(this.markers);
    }
  }
}
</script>

<style lang="scss" >
#mapDiv {
  width: 100%;
  height: 100%;
  .custom-content-marker {
    position: relative;
    width: 95px;
    height: 85px;
  }

  .custom-content-marker img {
    width: 100%;
    height: 100%;
  }

  .custom-content-marker .label {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 23px;
    font-size: 12px;
    color: #fff;
    text-align: center;
    line-height: 23px;
  }
}
</style>