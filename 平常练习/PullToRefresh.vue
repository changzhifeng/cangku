<template lang="html">
  <div class="yo-scroll"
  :class="{'down':(state===0),'up':(state==1),refresh:(state===2),touch:touching}"
  @touchstart="touchStart($event)"
  @touchmove="touchMove($event)"
  @touchend="touchEnd($event)"
  @scroll="(onInfinite || infiniteLoading) ? onScroll($event) : undefined">
    <section class="inner" :style="{ transform: 'translate3d(0, ' + top + 'px, 0)' }">
      <header class="pull-refresh">
        <slot name="pull-refresh">
           <span class="down-tip">下拉更新</span>
           <span class="up-tip">松开更新</span>
           <span class="refresh-tip">更新中</span>
        </slot>
      </header>
      <slot></slot>
      <footer class="load-more">
        <slot name="load-more">
          <span>加载中……</span>
        </slot>
      </footer>
    </section>
  </div>
</template>
 
<script>
export default {
  props: {
    offset: {
      type: Number,
      default: 40
    },
    enableInfinite: {
      type: Boolean,
      default: true
    },
    enableRefresh: {
      type: Boolean,
      default: true
    },
    onRefresh: {
      type: Function,
      default: undefined,
      required: false
    },
    onInfinite: {
      type: Function,
      default: undefined,
      require: false
    }
  },
  data() {
    return {
      top: 0,
      state: 0,
      startY: 0,
      touching: false,
      infiniteLoading: false
    }
  },
  methods: {
    touchStart(e) {
      this.startY = e.targetTouches[0].pageY
      this.startScroll = this.$el.scrollTop || 0
      this.touching = true
    },
    touchMove(e) {
      if (!this.enableRefresh || this.$el.scrollTop > 0 || !this.touching) {
        return
      }
      let diff = e.targetTouches[0].pageY - this.startY - this.startScroll
      if (diff > 0) e.preventDefault()
      this.top = Math.pow(diff, 0.8) + (this.state === 2 ? this.offset : 0)
 
      if (this.state === 2) { // in refreshing
        return
      }
      if (this.top >= this.offset) {
        this.state = 1
      } else {
        this.state = 0
      }
    },
    touchEnd(e) {
      if (!this.enableRefresh) return
      this.touching = false
      if (this.state === 2) { // in refreshing
        this.state = 2
        this.top = this.offset
        return
      }
      if (this.top >= this.offset) { // do refresh
        this.refresh()
      } else { // cancel refresh
        this.state = 0
        this.top = 0
      }
    },
    refresh() {
      this.state = 2
      this.top = this.offset
      this.onRefresh(this.refreshDone)
    },
    refreshDone() {
      this.state = 0
      this.top = 0
    },
 
    infinite() {
      this.infiniteLoading = true
      this.onInfinite(this.infiniteDone)
    },
 
    infiniteDone() {
      this.infiniteLoading = false
    },
 
    onScroll(e) {
      if (!this.enableInfinite || this.infiniteLoading) {
        return
      }
      let outerHeight = this.$el.clientHeight
      let innerHeight = this.$el.querySelector('.inner').clientHeight
      let scrollTop = this.$el.scrollTop
      let ptrHeight = this.onRefresh ? this.$el.querySelector('.pull-refresh').clientHeight : 0
      let infiniteHeight = this.$el.querySelector('.load-more').clientHeight
      let bottom = innerHeight - outerHeight - scrollTop - ptrHeight
      if (bottom < infiniteHeight) this.infinite()
    }
  }
}
</script>
<style>
.yo-scroll {
  position: absolute;
  top: 2.5rem;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #ddd
}
.yo-scroll .inner {
  position: absolute;
  top: -2rem;
  width: 100%;
  transition-duration: 300ms;
}
.yo-scroll .pull-refresh {
  position: relative;
  left: 0;
  top: 0;
  width: 100%;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.yo-scroll.touch .inner {
  transition-duration: 0ms;
}
.yo-scroll.down .down-tip {
  display: block;
}
.yo-scroll.up .up-tip {
  display: block;
}
.yo-scroll.refresh .refresh-tip {
  display: block;
}
.yo-scroll .down-tip,
.yo-scroll .refresh-tip,
.yo-scroll .up-tip {
  display: none;
}
.yo-scroll .load-more {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}  
</style>
在想使用该功能的vue文件中，具体步骤如下：
<template>
  <div>
      <!-- 2. 给想要加载的数据列表外层添加该标签和方法 -->
       <v-scroll :on-refresh="onRefresh" :on-infinite="onInfinite">
            <ul>
                <li v-for="(item,index) in currentlist" >{{item.name}}</li>
            </ul>
       </v-scroll>
  </div>
</template>
<script>
import Scroll from "./PullToRefresh";//  1.在此引入封装好的刷新和加载的插件
export default {
  data() {
    return {
      endId: "", //记录上拉加载时应该从哪一条数据开始取
      pageCount: "", //每次请求的条数
      currentlist: [], //当前显示的列表
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd1VybHMiOiJbXCIvXCIsXCJsb3N0XCIsXCJtZWRpY2FsUmVwb3J0XCIsXCJjYXJkXCIsXCJzY2hvb2xOZXRcIixcImFubnVhbFBheW1lbnRcIixcInJlc2VhcmNoUHJvamVjdFwiLFwibWFya2V0XCIsXCJ0ZWFjaGVySW5jb21lXCIsXCJpbVwiLFwic2NoZWR1bGVcIixcImNhcmRNYW5hZ2VcIixcIm5ld3NcIixcInZlbnVlXCIsXCJvZmZpY2VQaG9uZVwiXSIsImF1ZCI6WyJzcGFya2xyIl0sInNjb3BlIjpbInJlYWQiLCJ3cml0ZSIsInRydXN0Il0sIm5hbWUiOiLnjovmlowxIiwiaWQiOiJmNzk2NDE4M2YzMjE0ODE3ODI0MThmMDQxOGZmOGMzZiIsImV4cCI6MTUyNTgzMTkyNSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIl0sImp0aSI6IjUzMjk4Y2QwLTg4MDgtNGUzMS1iODllLWY2OWRkZDliYjU0YyIsImNsaWVudF9pZCI6IjAwMDAwMCJ9.WOwgMAtlOsCmRq8Hf6OoUAVGnEG0NyOzueeluT7CREY",
      deviceType: ""
    };
  },
  mounted: function() {
    this.onRefresh();
  },
  methods: {
    /**@done 加载数据成功的回调
     * 下拉刷新方法
     */
    onRefresh: function(done) {
    //   3. 在刷新方法内部进行自己的逻辑处理 此处调用了后台接口
      this.onRefreshPort(done);
    },
 
    /**@done 加载数据成功的回调
     * 下拉刷新接口
     */
    onRefreshPort(done) {
      this.$http.defaults.headers.common["token"] = this.token;
      var that = this;
      let url = "http://42.236.83.132:90/market/market/getAllList";
      this.$http
        .get(url)
        .then(function(response) {
          if (response.data.message == "OK") {
            //下拉刷新直接用最新的数据将原来的覆盖
            that.currentlist = response.data.data;
            // 5. 在后台接口返回数据之后一定记得调用done方法，将信息传给插件从而将状态从加载中变为下拉更新或者上拉更新
            done();
          } else {
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    },
 
    /**@augments
     * 上拉加载方法
     */
    onInfinite: function(done) {
      this.onInfinitePort(done);
    },
    /**
     * 上拉加载接口
     */
    onInfinitePort(done) {
      this.$http.defaults.headers.common["token"] = this.token;
      var that = this;
      let url = "http://42.236.83.132:90/market/market/getAllList";
      this.$http
        .get(url)
        .then(function(response) {
          if (response.data.message == "OK") {
            //上拉加载将请求回来的数据追加到现有数据的最后面
            that.currentlist = that.currentlist.concat(response.data.data);
            done();
          } else {
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  },
  components: {
    "v-scroll": Scroll
  }
};
</script>