<template>
  <dv-full-screen-container class="large-screen">
    <dv-loading v-if="loading">加载中...</dv-loading>
    <article v-else class="large-view">
      <header>
        <div class="nav-left" @click="screenChange('0')">
          <p class="time-running">{{ time }}</p>
          <div :class="['nav-menu', { active: screenType == '0' }]">{{ menuNm1 }}</div>
        </div>
        <div class="nav-mid">{{ title }}</div>
        <div class="nav-right" @click="screenChange('1')">
          <div :class="['nav-menu', { active: screenType == '1' }]">{{ menuNm2 }}</div>
          <p class="back" @click="backHome">
            <i class="el-icon-s-home"></i>
            返回门户
          </p>
          <p class="user-tools"></p>
        </div>
      </header>
      <div class="large-form">
        <el-date-picker v-model="queryDate" type="daterange" align="right" unlink-panels range-separator="-"
          start-placeholder="开始时间" end-placeholder="结束时间" :picker-options="pickerOptions" value-format="yyyy-MM-dd"
          size="mini" @change="changedDate" @clear="changedDate">
        </el-date-picker>
        <el-select v-model="deptId" placeholder="请选择单位" size="mini" clearable @change="changedDept"
          @clear="changedDept">
          <el-option v-for="item in deptOps" :key="item.id" :label="item.deptName" :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="projectId" placeholder="请选择项目" size="mini" clearable @change="changedProject"
          @clear="changedProject">
          <el-option v-for="item in projectOps" :key="item.id" :label="item.projectName" :value="item.id">
          </el-option>
        </el-select>
        <el-select v-if="screenType == '1'" v-model="matBigCateName" placeholder="请选择物资大类" size="mini"
          @change="getSelfPurchased">
          <el-option v-for="item in purchaseOps" :key="item.code" :label="item.name" :value="item.name">
          </el-option>
        </el-select>
      </div>

      <div class="large-flex" v-if="screenType == '0'">
        <div class="left">
          <!-- 投资总览 -->
          <div class="item item-1">
            <header>投资总览</header>
            <div class="item-body">
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="icon" viewBox="0 0 1024 1024">
                    <path fill="#6AD3E8"
                      d="M976 544.1c0 22.6-1.5 44.9-4.3 66.7-1.1 8.6-9.4 14.3-17.9 12.4l-47-10.7-31.3-7.2-62.6-14.3-274.4-62.7c-3.2-.7-4.2-4.7-1.8-6.9l280-253.7 35.7-32.4c6.4-5.8 16.5-4.9 21.6 2.1 64.1 85.4 102 191.6 102 306.7zM773.6 198.5c6.5 5.8 6.4 16 0 21.8L738 252.6 469.5 496a4 4 0 0 1-5.7-.3L255 260.8l-32-36-10.6-12-21.3-24a14.8 14.8 0 0 1 2.5-21.8c76.2-54.7 169.6-87 270.5-87 118.9.1 227.4 44.9 309.5 118.5z" />
                    <path fill="#6AD3E8"
                      d="M856.1 683.3c-57.2 161.1-210.8 276.5-391.4 276.8C234.1 960.5 48 774.7 48 544.2 48 437.9 87.8 341 153.3 267.5a14.7 14.7 0 0 1 22 0l31.9 35.9L439.7 565l.4.4c.5.5 1.2 1.3 1.7 1.8.2.2.4.3.5.5l.2.2c.3.3.6.5.9.8 1.2 1 2.5 2 3.9 2.8.2.2.5.3.7.4l1.8.9c.2.1.3.2.5.2.8.4 1.5.7 2.3 1 .2.1.4.2.7.2l.9.3 1.1.3 1.3.3c.1 0 .1 0 .2.1l341.8 78.1 46.8 10.7c8.7 2.1 13.7 11 10.7 19.3z" />
                  </svg>
                </div>
                <div class="body-num">
                  <p>项目数量</p>
                  <count-to :start-val="0" :end-val="projectCount" :duration="3600" class="card-panel-num"
                    :decimals="0" />
                  <span>个</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024">
                    <path fill="#6AD3E8"
                      d="m173.3 360.37 194.95 98.46c90.58 45.3 196.92 45.3 285.53-1.97l196.93-102.4c47.26-25.6 47.26-94.52 0-120.12L657.72 133.9c-90.58-47.26-200.86-47.26-291.44 1.97L173.29 240.25c-49.23 25.6-47.26 94.52 0 120.12Z" />
                    <path fill="#6AD3E8"
                      d="m813.3 478.52-177.24 98.46c-72.86 39.39-173.3 39.39-248.12 0L210.7 478.52c-23.63-13.78-53.17-3.94-66.96 19.7-13.78 23.63-3.94 53.16 19.7 66.95l179.2 98.46c53.16 27.57 112.24 39.39 171.32 39.39s120.12-13.79 171.32-41.36l177.23-98.46c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.67-45.3-31.51-68.93-17.73Z" />
                    <path fill="#6AD3E8"
                      d="M813.3 695.14 636.05 793.6c-72.86 39.38-173.3 39.38-248.12 0L210.7 695.14c-23.63-13.79-53.17-3.94-66.96 19.69-13.78 23.63-3.94 53.17 19.7 66.95l179.2 98.47c53.16 27.56 112.24 39.38 171.32 39.38s120.12-13.78 171.32-41.35l177.23-98.47c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.66-45.3-31.5-68.93-17.72Z" />
                  </svg>
                </div>
                <div class="body-num">
                  <p>标段数量</p>
                  <count-to :start-val="0" :end-val="sectionCount" :duration="3600" class="card-panel-num"
                    :decimals="0" />
                  <span>个</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8" d="M40 33V42C40 43.1046 39.1046 44 38 44H31.5" stroke="#6AD3E8"
                        stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                      <path
                        d="M40 16V6C40 4.89543 39.1046 4 38 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H16"
                        stroke="#6AD3E8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                      <path d="M16 16H30" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"></path>
                      <path d="M23 44L40 23" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"></path>
                      <path d="M16 24H24" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"></path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>启用合同数量</p>
                  <count-to :start-val="0" :end-val="contractCount" :duration="3600" class="card-panel-num"
                    :decimals="0" />
                  <span>份</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 32 32">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8"
                        d="M8.16 19.904c-1.952 0-3.488 1.568-3.488 3.488s1.536 3.488 3.488 3.488 3.488-1.568 3.488-3.488c0-0.004 0-0.008 0-0.012 0-1.92-1.556-3.476-3.476-3.476-0.004 0-0.008 0-0.013 0h0.001zM8.16 24.544c-0.64 0-1.152-0.512-1.152-1.152s0.512-1.152 1.152-1.152c0.64 0 1.152 0.512 1.152 1.152s-0.512 1.152-1.152 1.152zM29.312 20.096c0.096 0 0.192-0.064 0.192-0.16v-4.896c0-0.096-0.032-0.256-0.096-0.32l-1.92-2.976c-0.076-0.072-0.176-0.119-0.286-0.128l-0.002-0h-7.008c-0.096 0-0.192 0.064-0.192 0.16v6.784c0 0.096 0.096 0.192 0.192 0.16 0.16 0 0.448-0.032 0.96-0.032 2.016 0 3.104 0.96 3.68 1.728 0.032 0.096 0.128 0.096 0.224 0.032 0.256-0.224 0.576-0.352 0.96-0.352h3.296zM24.192 17.12c-0.103-0.007-0.185-0.089-0.192-0.191l-0-0.001v-3.648c0-0.096 0.096-0.16 0.192-0.16h2.624c0.096 0 0.224 0.064 0.288 0.128l0.8 1.312c0.064 0.064 0.096 0.224 0.096 0.32v2.048c0 0.096-0.064 0.192-0.16 0.192h-3.648zM18.848 18.976c0.064-0.032 0.16-0.128 0.16-0.224v-7.968c0-0.096 0.064-0.192 0.16-0.192h8.448c0.112-0.009 0.212-0.056 0.288-0.128l-0 0 1.248-1.728c0.064-0.064 0.032-0.128-0.064-0.128h-10.912c-0.096 0-0.192 0.064-0.256 0.16l-1.216 2.688c-0.032 0.064-0.16 0.16-0.256 0.16h-14.272c-0.096 0-0.16 0.064-0.16 0.16v1.664c0 0.096 0.064 0.16 0.16 0.16h1.152c0.096 0 0.16 0.096 0.16 0.192v2.624c0 0.128 0.064 0.192 0.16 0.224 1.184 0.256 7.936 1.792 9.12 5.312 0.034 0.093 0.121 0.159 0.224 0.16h3.424c0.103-0.001 0.19-0.067 0.223-0.158l0.001-0.002c0.128-0.576 0.704-2.336 2.208-2.976zM29.504 21.12h-3.488c-0.256 0-0.448 0.16-0.48 0.384-0.032 0.032-0.032 0.064-0.032 0.096v1.024c0 0.256 0.224 0.48 0.512 0.48h3.488c0.288 0 0.512-0.224 0.512-0.48v-1.024c0-0.256-0.224-0.48-0.512-0.48zM24.512 22.368c-0.461-1.44-1.788-2.464-3.354-2.464-0.002 0-0.004 0-0.006 0h0c-1.92 0-3.488 1.568-3.488 3.488s1.568 3.488 3.488 3.488c1.952 0 3.52-1.568 3.52-3.488l-0.032-0.128c0-0.32-0.064-0.64-0.128-0.896zM21.152 24.544c-0.64 0-1.152-0.512-1.152-1.152s0.512-1.152 1.152-1.152 1.152 0.512 1.152 1.152c0 0.64-0.512 1.152-1.152 1.152zM15.584 10.592c0.096 0 0.192-0.064 0.256-0.16l0.928-1.888c0.015-0.053 0.024-0.113 0.024-0.176s-0.009-0.123-0.025-0.181l0.001 0.005-0.384-0.928c-0.032-0.096-0.16-0.16-0.256-0.16h-1.12c-0.001 0-0.001 0-0.002 0-0.12 0-0.226-0.063-0.285-0.159l-0.001-0.001-1.12-1.696c-0.064-0.064-0.192-0.16-0.288-0.16h-1.568c-0.119 0.008-0.222 0.068-0.287 0.159l-0.001 0.001-1.856 2.208c-0.066 0.092-0.169 0.152-0.287 0.16l-0.001 0h-1.216c-0.096 0-0.224 0.032-0.288 0.128l-1.184 1.248c-0.076 0.072-0.176 0.119-0.286 0.128l-0.002 0h-0.736c-0.119 0.002-0.229 0.038-0.322 0.097l0.002-0.001-1.408 1.28c-0.064 0.064-0.032 0.096 0.064 0.096h11.648z">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>合同物资总金额</p>
                  <count-to :start-val="0" :end-val="contractsAmount" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 物资计划 -->
          <div class="item item-4">
            <header>物资计划</header>
            <div class="item-body">
              <div class="body-item">
                <div class="icon-com num-bg">
                  <p>
                    <count-to :start-val="0" :end-val="planCount" :duration="3600" class="card-panel-num"
                      :decimals="0" />
                    <span class="desc">次</span>
                  </p>
                </div>
                <div class="body-num">
                  计划下达数
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com amount-bg">
                  <p>
                    <count-to :start-val="0" :end-val="planAmount" :duration="3600" class="card-panel-num"
                      :decimals="2" />
                    <span class="desc">万元</span>
                  </p>
                </div>
                <div class="body-num">
                  下达物资金额
                </div>
              </div>
            </div>
          </div>

          <!-- 物资供应 -->
          <div class="item item-6">
            <header>物资供应</header>
            <div class="item-body">
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 24 24">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8"
                        d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>供应批次</p>
                  <count-to :start-val="0" :end-val="shippingCount" :duration="3600" class="card-panel-num"
                    :decimals="0" />
                  <span>批</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48" fill="none">
                    <defs></defs>
                    <g>
                      <path d="M38 15V7H10V15" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                      <path d="M43 27V15H5V41H43" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                      <path d="M29 27L24 34L43 34" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                      <path d="M26 21H22" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round">
                      </path>
                      <path d="M16 21H12" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>供应总金额</p>
                  <count-to :start-val="0" :end-val="sendAmount" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 32 32">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8"
                        d="M21.248 3.333l7.419 7.423v10.493l-7.419 7.417h-10.493l-7.421-7.419v-10.493l7.421-7.421h10.493zM10.667 14.667v2.667h10.667v-2.667h-10.667z">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>退货次数</p>
                  <count-to :start-val="0" :end-val="shippingFailCount" :duration="3600" class="card-panel-num"
                    :decimals="0" />
                  <span>批</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48" fill="none">
                    <defs></defs>
                    <g>
                      <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect>
                      <path d="M36 12L24 24L12 12" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                      <path d="M36 24L24 36L12 24" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>退货总金额</p>
                  <count-to :start-val="0" :end-val="refundAmount" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="middle">
          <!-- 地图 -->
          <dv-border-box-8 class="item item-2">
            <baseMap :projectId="projectId" ref="map" />
          </dv-border-box-8>
          <!-- 供应商考核 -->
          <div class="item item-7">
            <header>供应商考核</header>
            <div class="item7-body">
              <div class="item7-chart">
                <div class="item7-chart-item">
                  <p>
                    <span class="value">0</span> <span class="label">批</span>
                  </p>
                  <i class="body-pic"></i>
                  <p class="body-item-name">累计退货次数</p>
                </div>
                <div class="item7-chart-item">
                  <p>
                    <span class="value">0</span>
                    <span class="label">万元</span>
                  </p>
                  <i class="body-pic body-pic-2"></i>
                  <p class="body-item-name">累计退货金额</p>
                </div>
              </div>
              <dv-scroll-board :config="boardConfig" style="width: 60%" />
            </div>
          </div>
        </div>

        <div class="right">
          <!-- 物资初验 -->
          <div class="item item-3">
            <header>物资初验</header>
            <div class="item-body">
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="64 64 896 896">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8"
                        d="M218.9 636.3l42.6 26.6c.1.1.3.2.4.3l12.7 8 .3.3a186.9 186.9 0 0 0 94.1 25.1c44.9 0 87.2-15.7 121-43.8a256.27 256.27 0 0 1 164.9-59.9c52.3 0 102.2 15.7 144.6 44.5l7.9 5-111.6-289V179.8h63.5c4.4 0 8-3.6 8-8V120c0-4.4-3.6-8-8-8H264.7c-4.4 0-8 3.6-8 8v51.9c0 4.4 3.6 8 8 8h63.5v173.6L218.9 636.3zm333-203.1c22 0 39.9 17.9 39.9 39.9S573.9 513 551.9 513 512 495.1 512 473.1s17.9-39.9 39.9-39.9zM878 825.1l-29.9-77.4-85.7-53.5-.1.1c-.7-.5-1.5-1-2.2-1.5l-8.1-5-.3-.3c-29-17.5-62.3-26.8-97-26.8-44.9 0-87.2 15.7-121 43.8a256.27 256.27 0 0 1-164.9 59.9c-53 0-103.5-16.1-146.2-45.6l-28.9-18.1L146 825.1c-2.8 7.4-4.3 15.2-4.3 23 0 35.2 28.6 63.8 63.8 63.8h612.9c7.9 0 15.7-1.5 23-4.3a63.6 63.6 0 0 0 36.6-82.5z">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>初验次数</p>
                  <count-to :start-val="0" :end-val="takeCount" :duration="3600" class="card-panel-num" :decimals="0" />
                  <span>次</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024">
                    <path fill="#6AD3E8"
                      d="m173.3 360.37 194.95 98.46c90.58 45.3 196.92 45.3 285.53-1.97l196.93-102.4c47.26-25.6 47.26-94.52 0-120.12L657.72 133.9c-90.58-47.26-200.86-47.26-291.44 1.97L173.29 240.25c-49.23 25.6-47.26 94.52 0 120.12Z" />
                    <path fill="#6AD3E8"
                      d="m813.3 478.52-177.24 98.46c-72.86 39.39-173.3 39.39-248.12 0L210.7 478.52c-23.63-13.78-53.17-3.94-66.96 19.7-13.78 23.63-3.94 53.16 19.7 66.95l179.2 98.46c53.16 27.57 112.24 39.39 171.32 39.39s120.12-13.79 171.32-41.36l177.23-98.46c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.67-45.3-31.51-68.93-17.73Z" />
                    <path fill="#6AD3E8"
                      d="M813.3 695.14 636.05 793.6c-72.86 39.38-173.3 39.38-248.12 0L210.7 695.14c-23.63-13.79-53.17-3.94-66.96 19.69-13.78 23.63-3.94 53.17 19.7 66.95l179.2 98.47c53.16 27.56 112.24 39.38 171.32 39.38s120.12-13.78 171.32-41.35l177.23-98.47c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.66-45.3-31.5-68.93-17.72Z" />
                  </svg>
                </div>
                <div class="body-num">
                  <p>收货金额</p>
                  <count-to :start-val="0" :end-val="putTotalAmount" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48" fill="none">
                    <defs></defs>
                    <g>
                      <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect>
                      <path fill="#6AD3E8"
                        d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z"
                        stroke="#333" stroke-width="4" stroke-linejoin="round"></path>
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M24 37C25.3807 37 26.5 35.8807 26.5 34.5C26.5 33.1193 25.3807 32 24 32C22.6193 32 21.5 33.1193 21.5 34.5C21.5 35.8807 22.6193 37 24 37Z"
                        fill="#333"></path>
                      <path d="M24 12V28" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>初验不合格数</p>
                  <count-to :start-val="0" :end-val="takeFailCount" :duration="3600" class="card-panel-num"
                    :decimals="0" />
                  <span>批</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <!-- <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 32 32"
                  >
                    <defs></defs>
                    <g>
                      <path
                        fill="#6AD3E8"
                        d="M8.16 19.904c-1.952 0-3.488 1.568-3.488 3.488s1.536 3.488 3.488 3.488 3.488-1.568 3.488-3.488c0-0.004 0-0.008 0-0.012 0-1.92-1.556-3.476-3.476-3.476-0.004 0-0.008 0-0.013 0h0.001zM8.16 24.544c-0.64 0-1.152-0.512-1.152-1.152s0.512-1.152 1.152-1.152c0.64 0 1.152 0.512 1.152 1.152s-0.512 1.152-1.152 1.152zM29.312 20.096c0.096 0 0.192-0.064 0.192-0.16v-4.896c0-0.096-0.032-0.256-0.096-0.32l-1.92-2.976c-0.076-0.072-0.176-0.119-0.286-0.128l-0.002-0h-7.008c-0.096 0-0.192 0.064-0.192 0.16v6.784c0 0.096 0.096 0.192 0.192 0.16 0.16 0 0.448-0.032 0.96-0.032 2.016 0 3.104 0.96 3.68 1.728 0.032 0.096 0.128 0.096 0.224 0.032 0.256-0.224 0.576-0.352 0.96-0.352h3.296zM24.192 17.12c-0.103-0.007-0.185-0.089-0.192-0.191l-0-0.001v-3.648c0-0.096 0.096-0.16 0.192-0.16h2.624c0.096 0 0.224 0.064 0.288 0.128l0.8 1.312c0.064 0.064 0.096 0.224 0.096 0.32v2.048c0 0.096-0.064 0.192-0.16 0.192h-3.648zM18.848 18.976c0.064-0.032 0.16-0.128 0.16-0.224v-7.968c0-0.096 0.064-0.192 0.16-0.192h8.448c0.112-0.009 0.212-0.056 0.288-0.128l-0 0 1.248-1.728c0.064-0.064 0.032-0.128-0.064-0.128h-10.912c-0.096 0-0.192 0.064-0.256 0.16l-1.216 2.688c-0.032 0.064-0.16 0.16-0.256 0.16h-14.272c-0.096 0-0.16 0.064-0.16 0.16v1.664c0 0.096 0.064 0.16 0.16 0.16h1.152c0.096 0 0.16 0.096 0.16 0.192v2.624c0 0.128 0.064 0.192 0.16 0.224 1.184 0.256 7.936 1.792 9.12 5.312 0.034 0.093 0.121 0.159 0.224 0.16h3.424c0.103-0.001 0.19-0.067 0.223-0.158l0.001-0.002c0.128-0.576 0.704-2.336 2.208-2.976zM29.504 21.12h-3.488c-0.256 0-0.448 0.16-0.48 0.384-0.032 0.032-0.032 0.064-0.032 0.096v1.024c0 0.256 0.224 0.48 0.512 0.48h3.488c0.288 0 0.512-0.224 0.512-0.48v-1.024c0-0.256-0.224-0.48-0.512-0.48zM24.512 22.368c-0.461-1.44-1.788-2.464-3.354-2.464-0.002 0-0.004 0-0.006 0h0c-1.92 0-3.488 1.568-3.488 3.488s1.568 3.488 3.488 3.488c1.952 0 3.52-1.568 3.52-3.488l-0.032-0.128c0-0.32-0.064-0.64-0.128-0.896zM21.152 24.544c-0.64 0-1.152-0.512-1.152-1.152s0.512-1.152 1.152-1.152 1.152 0.512 1.152 1.152c0 0.64-0.512 1.152-1.152 1.152zM15.584 10.592c0.096 0 0.192-0.064 0.256-0.16l0.928-1.888c0.015-0.053 0.024-0.113 0.024-0.176s-0.009-0.123-0.025-0.181l0.001 0.005-0.384-0.928c-0.032-0.096-0.16-0.16-0.256-0.16h-1.12c-0.001 0-0.001 0-0.002 0-0.12 0-0.226-0.063-0.285-0.159l-0.001-0.001-1.12-1.696c-0.064-0.064-0.192-0.16-0.288-0.16h-1.568c-0.119 0.008-0.222 0.068-0.287 0.159l-0.001 0.001-1.856 2.208c-0.066 0.092-0.169 0.152-0.287 0.16l-0.001 0h-1.216c-0.096 0-0.224 0.032-0.288 0.128l-1.184 1.248c-0.076 0.072-0.176 0.119-0.286 0.128l-0.002 0h-0.736c-0.119 0.002-0.229 0.038-0.322 0.097l0.002-0.001-1.408 1.28c-0.064 0.064-0.032 0.096 0.064 0.096h11.648z"
                      >
                      </path>
                    </g>
                  </svg> -->
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 32 32">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8"
                        d="M26.048 22.976c-0.715-0.701-1.675-1.153-2.74-1.215l-0.012-0.001h-0.16c-1.12 0-2.176 0.48-2.912 1.216s-1.216 1.76-1.216 2.912c0 0.576 0.128 1.12 0.352 1.632 0.192 0.48 0.512 0.928 0.864 1.28 0.747 0.745 1.774 1.207 2.91 1.216h0.002c2.278-0.006 4.122-1.85 4.128-4.127v-0.001c-0.002-1.139-0.466-2.169-1.216-2.912l-0-0zM25.024 26.432h-3.776v-1.088h3.776v1.088zM20.96 20.256c-0.032-0.48-0.16-0.96-0.32-1.376-0.224-0.64-0.544-1.216-0.96-1.696s-0.928-0.896-1.536-1.216c-0.576-0.288-1.216-0.512-1.888-0.576v-0.096c1.12-0.352 2.048-0.96 2.752-1.792s1.056-1.92 1.056-3.232c0-1.024-0.192-1.92-0.576-2.656s-0.896-1.312-1.536-1.792c-0.62-0.443-1.347-0.785-2.132-0.983l-0.044-0.009c-0.32-0.096-0.64-0.16-0.96-0.192v-2.656h-2.656v2.528h-1.184v-2.528h-2.656v2.528h-3.584v22.976h3.552v2.528h2.688v-2.528h1.152v2.528h2.688v-2.688c0.32-0.032 0.608-0.096 0.896-0.16 0.651-0.126 1.229-0.326 1.768-0.594l-0.040 0.018c-0.135-0.459-0.216-0.986-0.224-1.532l-0-0.004c0-2.304 1.6-4.256 3.744-4.8zM8.64 8h3.232c1.504 0 2.592 0.256 3.264 0.736s1.024 1.248 1.024 2.24c0 0.864-0.32 1.568-0.992 2.080-0.64 0.544-1.632 0.8-2.944 0.8h-3.584v-5.856zM16.64 22.4c-0.32 0.448-0.704 0.8-1.184 1.024-0.48 0.256-1.024 0.384-1.6 0.448s-1.088 0.096-1.6 0.096h-3.616v-6.592h3.776c1.6 0 2.784 0.224 3.52 0.704 0.768 0.48 1.152 1.312 1.152 2.528 0 0.768-0.16 1.344-0.448 1.792z">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>退货物资金额</p>
                  <count-to :start-val="0" :end-val="refundTotalAmount" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 质检入库 -->
          <div class="item item-5">
            <header>质检入库</header>
            <div class="item-body">
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 48 48" width="40" height="40">
                    <defs></defs>
                    <g>
                      <path d="M4 44H44" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                      <path d="M12 14H36" stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                      <path
                        d="M14 14H24H34L34.8772 21.0175C34.9589 21.6709 35.1049 22.3147 35.3131 22.9394L38.6474 32.9422C38.8817 33.6452 39.0372 34.3721 39.1109 35.1095L40 44H8L8.88905 35.1095C8.96279 34.3721 9.11826 33.6452 9.35259 32.9422L12.6869 22.9394C12.8951 22.3147 13.0411 21.6709 13.1228 21.0175L14 14Z"
                        fill="none" stroke="#6AD3E8" stroke-width="4" stroke-linejoin="round"></path>
                      <path
                        d="M24 8L24.8284 7.17157C25.5786 6.42143 26.596 6 27.6569 6H28.3431C29.404 6 30.4214 5.57857 31.1716 4.82843L32 4"
                        stroke="#6AD3E8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                      <path
                        d="M17 31C17 32.8728 17.7354 34.5738 18.9333 35.83C19.5891 36.5178 20.3836 37.0722 21.2718 37.4484"
                        stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"></path>
                      <path
                        d="M30.9999 31C30.9999 32.8728 30.2644 34.5738 29.0666 35.83C28.4107 36.5178 27.6163 37.0722 26.728 37.4484"
                        stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"></path>
                      <path
                        d="M18.9331 26.17C20.208 24.8331 22.0066 24 23.9998 24C25.993 24 27.7917 24.8331 29.0665 26.17"
                        stroke="#6AD3E8" stroke-width="4" stroke-linecap="round"></path>
                      <circle cx="24" cy="31" r="2" fill="#6AD3E8"></circle>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>质检次数</p>
                  <count-to :start-val="0" :end-val="storeCount" :duration="3600" class="card-panel-num"
                    :decimals="0" />
                  <span>次</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">

                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 32 32" width="40" height="40">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8"
                        d="M26.048 22.976c-0.715-0.701-1.675-1.153-2.74-1.215l-0.012-0.001h-0.16c-1.12 0-2.144 0.48-2.912 1.216-0.75 0.744-1.214 1.773-1.216 2.912v0c0 0.576 0.128 1.12 0.352 1.632 0.224 0.48 0.512 0.928 0.864 1.28 0.768 0.736 1.76 1.216 2.912 1.216 2.278-0.006 4.122-1.85 4.128-4.127v-0.001c0-1.152-0.448-2.176-1.216-2.912zM25.088 26.496h-1.344v1.344h-1.184v-1.344h-1.344v-1.216h1.344v-1.344h1.184v1.344h1.344v1.216zM20.96 20.256c-0.032-0.48-0.16-0.96-0.32-1.376-0.224-0.64-0.576-1.216-0.992-1.696s-0.896-0.896-1.504-1.216c-0.555-0.31-1.208-0.517-1.902-0.575l-0.018-0.001v-0.096c1.152-0.352 2.080-0.96 2.784-1.792s1.056-1.92 1.056-3.232c0-1.024-0.192-1.92-0.608-2.656-0.38-0.72-0.897-1.319-1.522-1.782l-0.014-0.010c-0.608-0.449-1.326-0.792-2.103-0.983l-0.041-0.009c-0.288-0.091-0.625-0.159-0.973-0.191l-0.019-0.001v-2.656h-2.656v2.528h-1.184v-2.528h-2.656v2.528h-3.584v22.976h3.584v2.528h2.656v-2.528h1.184v2.528h2.656v-2.688c0.32-0.032 0.64-0.096 0.928-0.16 0.655-0.138 1.232-0.337 1.775-0.596l-0.047 0.020c-0.142-0.435-0.225-0.935-0.225-1.455 0-0.029 0-0.057 0.001-0.085l-0 0.004c0-0.002 0-0.005 0-0.008 0-2.303 1.577-4.238 3.71-4.785l0.034-0.007zM8.64 8h3.232c1.504 0 2.592 0.256 3.264 0.736s1.024 1.248 1.024 2.24c0 0.864-0.352 1.568-0.992 2.080-0.672 0.544-1.632 0.8-2.944 0.8h-3.584v-5.856zM16.608 22.4c-0.32 0.448-0.704 0.8-1.184 1.024-0.48 0.256-0.992 0.384-1.568 0.448s-1.12 0.096-1.6 0.096h-3.616v-6.592h3.776c1.568 0 2.752 0.224 3.52 0.704s1.12 1.312 1.12 2.528c0 0.768-0.128 1.344-0.448 1.792z">
                      </path>
                    </g>
                  </svg>

                </div>
                <div class="body-num">
                  <p>入库金额</p>
                  <count-to :start-val="0" :end-val="storeTotalAmount" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">

                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 48 48" fill="none">
                    <defs></defs>
                    <g>
                      <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect>
                      <path fill="#6AD3E8"
                        d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z"
                        stroke="#333" stroke-width="4" stroke-linejoin="round"></path>
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M24 37C25.3807 37 26.5 35.8807 26.5 34.5C26.5 33.1193 25.3807 32 24 32C22.6193 32 21.5 33.1193 21.5 34.5C21.5 35.8807 22.6193 37 24 37Z"
                        fill="#333"></path>
                      <path d="M24 12V28" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>质检不合格数</p>
                  <count-to :start-val="0" :end-val="storeFailCount" :duration="3600" class="card-panel-num"
                    :decimals="0" />
                  <span>批</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">

                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 32 32">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8"
                        d="M26.048 22.976c-0.715-0.701-1.675-1.153-2.74-1.215l-0.012-0.001h-0.16c-1.12 0-2.176 0.48-2.912 1.216s-1.216 1.76-1.216 2.912c0 0.576 0.128 1.12 0.352 1.632 0.192 0.48 0.512 0.928 0.864 1.28 0.747 0.745 1.774 1.207 2.91 1.216h0.002c2.278-0.006 4.122-1.85 4.128-4.127v-0.001c-0.002-1.139-0.466-2.169-1.216-2.912l-0-0zM25.024 26.432h-3.776v-1.088h3.776v1.088zM20.96 20.256c-0.032-0.48-0.16-0.96-0.32-1.376-0.224-0.64-0.544-1.216-0.96-1.696s-0.928-0.896-1.536-1.216c-0.576-0.288-1.216-0.512-1.888-0.576v-0.096c1.12-0.352 2.048-0.96 2.752-1.792s1.056-1.92 1.056-3.232c0-1.024-0.192-1.92-0.576-2.656s-0.896-1.312-1.536-1.792c-0.62-0.443-1.347-0.785-2.132-0.983l-0.044-0.009c-0.32-0.096-0.64-0.16-0.96-0.192v-2.656h-2.656v2.528h-1.184v-2.528h-2.656v2.528h-3.584v22.976h3.552v2.528h2.688v-2.528h1.152v2.528h2.688v-2.688c0.32-0.032 0.608-0.096 0.896-0.16 0.651-0.126 1.229-0.326 1.768-0.594l-0.040 0.018c-0.135-0.459-0.216-0.986-0.224-1.532l-0-0.004c0-2.304 1.6-4.256 3.744-4.8zM8.64 8h3.232c1.504 0 2.592 0.256 3.264 0.736s1.024 1.248 1.024 2.24c0 0.864-0.32 1.568-0.992 2.080-0.64 0.544-1.632 0.8-2.944 0.8h-3.584v-5.856zM16.64 22.4c-0.32 0.448-0.704 0.8-1.184 1.024-0.48 0.256-1.024 0.384-1.6 0.448s-1.088 0.096-1.6 0.096h-3.616v-6.592h3.776c1.6 0 2.784 0.224 3.52 0.704 0.768 0.48 1.152 1.312 1.152 2.528 0 0.768-0.16 1.344-0.448 1.792z">
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>退货物资金额</p>
                  <count-to :start-val="0" :end-val="refundZjTotalAmount" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
            </div>
          </div>

          <div class="item item-8">
            <header>物资出库</header>
            <div class="item-body">
              <div class="body-item item-first">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 32 32">
                    <defs></defs>
                    <g>
                      <path fill="#6AD3E8"
                        d="M10.304 19.68c-1.376 0-2.464 1.088-2.464 2.464s1.088 2.464 2.464 2.464c1.331-0.039 2.395-1.127 2.395-2.464s-1.064-2.425-2.391-2.464l-0.004-0zM10.304 23.36c-0.704 0-1.248-0.544-1.248-1.216s0.544-1.248 1.248-1.248c0.672 0 1.216 0.576 1.216 1.248s-0.544 1.216-1.216 1.216zM8.16 19.68h-5.504c-0.224 0-0.416 0.16-0.416 0.384v1.216c0 0.224 0.192 0.384 0.416 0.384h4.416c0.128-0.8 0.512-1.472 1.088-1.984zM23.2 19.68c-1.376 0-2.464 1.088-2.464 2.464s1.088 2.464 2.464 2.464 2.464-1.088 2.464-2.464c-0.032-1.376-1.12-2.464-2.464-2.464zM23.2 23.36c-0.704 0-1.248-0.544-1.248-1.216s0.544-1.248 1.248-1.248 1.216 0.576 1.216 1.248-0.544 1.216-1.216 1.216zM29.6 19.68h-0.96v-5.376c0-0.64-0.192-1.248-0.544-1.792l-2.4-3.552c-0.608-0.864-1.568-1.408-2.624-1.408h-3.744c-0.448 0-0.8 0.352-0.8 0.8v11.328h-6.112c0.576 0.512 0.992 1.184 1.088 1.984h6.464c0.224-1.568 1.568-2.784 3.232-2.784s2.976 1.216 3.2 2.784h3.2c0.224 0 0.416-0.16 0.416-0.384v-1.216c0-0.224-0.192-0.384-0.416-0.384zM25.664 13.248h-4.928c-0.228-0.004-0.412-0.188-0.416-0.416v-2.72c0-0.224 0.192-0.416 0.416-0.416h3.008c0.128 0 0.256 0.064 0.32 0.192l1.92 2.72c0.192 0.256 0 0.64-0.32 0.64zM16.64 18.88h-13.856c-0.416 0-0.768-0.352-0.768-0.8v-3.552c0-0.448 0.352-0.8 0.768-0.8h13.856c0.448 0 0.8 0.352 0.8 0.8v3.552c0 0.448-0.352 0.8-0.8 0.8zM8.352 12.544h-5.568c-0.422-0.006-0.762-0.346-0.768-0.767v-3.585c0-0.448 0.352-0.8 0.768-0.8h5.536c0.448 0 0.8 0.352 0.8 0.8v3.552c0 0.448-0.352 0.8-0.768 0.8zM16.64 12.544h-5.536c-0.448 0-0.8-0.352-0.8-0.768v-3.584c0-0.448 0.384-0.8 0.8-0.8h5.536c0.448 0 0.8 0.384 0.8 0.8v3.584c0 0.416-0.352 0.768-0.8 0.768z">
                      </path>
                    </g>
                  </svg>
                </div>
                <p class="label">出库金额</p>
                <div class="body-num">
                  <count-to :start-val="0" :end-val="outTotalAmount" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="icon" viewBox="0 0 1024 1024">
                    <path fill="#6AD3E8"
                      d="M182.53 99.07h658.94c45.83 0 82.95 37 82.95 82.56V672c0 45.63-37.12 82.56-82.95 82.56H182.53A82.75 82.75 0 0 1 99.58 672V181.7c0-45.64 37.12-82.56 82.95-82.56zm0-99.07A182.08 182.08 0 0 0 0 181.7V672a182.08 182.08 0 0 0 182.53 181.7h658.94A182.08 182.08 0 0 0 1024 672V181.7A182.08 182.08 0 0 0 841.47 0H182.53zM896 972.22a50.75 50.75 0 0 1-50.62 50.76l-666.76.96a50.56 50.56 0 1 1 0-101.32l666.76-.96A50.56 50.56 0 0 1 896 972.22z" />
                    <path fill="#6AD3E8"
                      d="m730.69 256 85.7 95.1-285.45 256.96-58.81-65.34-69.57-74.62-124.93 108.86L192 481.92l221.38-192.96 81.47 90.5 45.05 48.32L730.7 256z" />
                  </svg>
                </div>
                <div class="body-num">
                  <p>需求库存金额</p>
                  <count-to :start-val="0" :end-val="storeTotalAmount8" :duration="3600" class="card-panel-num"
                    :decimals="2" />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="icon" viewBox="0 0 1024 1024">
                    <path fill="#6AD3E8"
                      d="M961.34 662c-12.3-40.4-38-84.6-74.8-129.6a31.96 31.96 0 0 1 0-40.6c73.7-90 102.9-177 69-235.7-25.4-44-82.2-65.2-157.4-65.2-25.2 0-52.4 2.4-81.3 7.1-15 2.5-29.8-6-35.1-20.3C640.64 68.8 579.84 0 512.04 0s-128.6 68.8-169.6 177.6a32.12 32.12 0 0 1-35.2 20.3c-28.8-4.7-56.1-7.1-81.3-7.1-25.2 0-48.3 2.4-68.9 7.2a95.64 95.64 0 0 0-65-21.9c-50 2-90.5 42.9-92 93.1-1.2 42.5 25.3 79 62.7 92.9 12.3 40.4 38 84.6 74.8 129.6 9.7 11.8 9.7 28.8 0 40.6-73.7 90-102.9 177-69 235.7 25.4 44 82.2 65.2 157.4 65.2 25.2 0 52.4-2.4 81.3-7.1 15-2.5 29.8 6 35.1 20.3 41.1 108.7 101.9 177.6 169.7 177.6s128.6-68.9 169.6-177.6a32.12 32.12 0 0 1 35.2-20.3c28.8 4.7 56.1 7.1 81.3 7.1 25.2 0 48.3-2.4 68.9-7.2a95.46 95.46 0 0 0 65 21.9c50.1-2 90.6-42.9 92.1-93.1 1.1-42.4-25.4-79-62.8-92.8zm-653.7 99.1c-29.3 5.4-56.8 8.1-81.6 8.1-29.4 0-54.8-4-73.4-11.5-13.8-5.6-23.4-12.9-28.5-21.8-6.5-11.3-7.2-27.5-2.1-48.1 6.9-27.5 23.8-60 48.9-94.1 7.2-9.8 15-19.5 23.3-29.3 3-3.5 8.2-3.8 11.5-.7 23.7 22.2 49.9 44.1 78.2 65.4 7 5.3 11.5 13.1 12.6 21.8 4.3 35.1 10.3 68.8 17.6 100.4.9 4.5-2 8.9-6.5 9.8zm6.4-488.5c-7.3 31.6-13.3 65.2-17.6 100.4-1.1 8.7-5.6 16.5-12.6 21.8a989.78 989.78 0 0 0-78.2 65.4 7.93 7.93 0 0 1-11.5-.7c-8.3-9.8-16.1-19.6-23.3-29.3-17.7-24.1-31.3-47.4-40.3-68.6 35.9-13.9 61.5-48.8 61.5-89.6 0-5.1-.4-10.2-1.2-15.1 10.8-1.4 22.6-2.1 35.2-2.1 24.8 0 52.3 2.8 81.6 8.2 4.5.8 7.4 5.2 6.4 9.6zm230 239.4c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32zm-145.5-301.5c4.3-12.1 8.9-23.8 13.8-34.9 17-38.8 36.7-69.7 57-89.4 15.3-14.7 29.6-22.2 42.7-22.2s27.4 7.5 42.7 22.3c20.3 19.7 40.1 50.6 57 89.4 4.9 11.1 9.5 22.7 13.8 34.8 1.5 4.3-.8 9-5.2 10.3-27.7 8.4-56.1 18.6-85 30.5a64.17 64.17 0 0 1-47.4.4c-23.6-9.2-59.6-23-84.3-30.8-4.3-1.5-6.7-6.2-5.1-10.4zm227 603.1c-4.3 12.1-8.9 23.7-13.8 34.8-17 38.8-36.7 69.7-57 89.4-15.3 14.7-29.6 22.2-42.7 22.2s-27.4-7.5-42.7-22.3c-20.3-19.7-40.1-50.6-57-89.4-4.9-11.1-9.5-22.7-13.8-34.8-1.5-4.3.8-9 5.2-10.3a964.4 964.4 0 0 0 84.2-30.1c15.5-6.3 32.9-6.3 48.4 0 28.6 11.7 56.8 21.8 84.1 30.1 4.3 1.4 6.7 6.1 5.1 10.4zm90.9-550.7c29.3-5.4 56.8-8.1 81.6-8.2 29.4 0 54.8 4 73.4 11.5 13.8 5.6 23.4 12.9 28.5 21.8 6.5 11.3 7.2 27.5 2.1 48.1-6.9 27.5-23.8 60-48.9 94.1-7.2 9.8-15 19.5-23.3 29.3-3 3.5-8.2 3.8-11.5.7a951.54 951.54 0 0 0-78.2-65.4c-7-5.3-11.5-13.1-12.6-21.8-4.3-35.1-10.3-68.8-17.6-100.4-.9-4.4 2-8.8 6.5-9.7zM832.04 752c0 5.1.4 10.2 1.2 15.1-10.8 1.4-22.6 2.1-35.2 2.1-24.8 0-52.3-2.8-81.6-8.1a7.9 7.9 0 0 1-6.3-9.7c7.3-31.6 13.3-65.2 17.6-100.4 1.1-8.7 5.6-16.5 12.6-21.8 28.3-21.3 54.4-43.3 78.2-65.4 3.3-3.1 8.6-2.8 11.5.7 8.3 9.8 16.1 19.6 23.3 29.3 17.7 24.1 31.3 47.4 40.3 68.6-36.1 13.9-61.6 48.9-61.6 89.6z" />
                  </svg>
                </div>
                <div class="body-num">
                  <p>库存金额比例</p>
                  <count-to :start-val="0" :end-val="ratio" :duration="3600" class="card-panel-num" :decimals="2" />
                  <span>%</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div class="large-flex self-flex" v-if="screenType == '1'">
        <div class="left">
          <ChartCard title="自购物资合同设备数">
            <EChartsWrapper :options="lineOptions" style="height: 90%;" />
          </ChartCard>
          <ChartCard title="物资种类合同核备数">
            <EChartsWrapper :options="pieOptions" style="height: 100%;" />
          </ChartCard>
        </div>
        <div class="middle">
          <ChartCard title="自购物资合同核备审批">
            <div class="custom-table-container">
              <el-table :data="tableData" style="width: 100%" class="large-screen-table" size="small">
                <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                <el-table-column prop="date" show-overflow-tooltip label="合同名称">
                </el-table-column>
                <el-table-column prop="name" show-overflow-tooltip label="合同编号">
                </el-table-column>
                <el-table-column prop="address" show-overflow-tooltip label="规格型号">
                </el-table-column>
                <el-table-column prop="address" show-overflow-tooltip label="供应商">
                </el-table-column>
                <el-table-column prop="address" show-overflow-tooltip label="标段项目">
                </el-table-column>
                <el-table-column prop="address" show-overflow-tooltip label="提交时间">
                </el-table-column>
                <el-table-column prop="status" label="审批状态">
                  <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.status)" size="mini" effect="dark">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <!-- <dv-scroll-board
              :config="tableConfig"
              style="width: 100%"
            /> -->
          </ChartCard>
        </div>
        <div class="right">
          <ChartCard title="标段项目合同核备数">
            <EChartsWrapper :options="barOptions1" style="height: 100%;" />
          </ChartCard>
          <ChartCard title="物资种类合同核备金额(万元)">
            <EChartsWrapper :options="barOptions2" style="height: 100%;" />
          </ChartCard>
        </div>
      </div>
    </article>
  </dv-full-screen-container>
</template>

<script>
import "./dataV.js";
import CountTo from "vue-count-to";
import * as Api from "@/api/largeScreen/aSupplyMaterials";
import baseMap from './baseMap.vue'
import dayjs from 'dayjs'
import ChartCard from './ChartCard.vue'
import EChartsWrapper from './EChartsWrapper.vue'


export default {
  name: "largeScreen",
  components: {
    CountTo,
    baseMap,
    EChartsWrapper,
    ChartCard
  },
  data() {
    const vw = (px) => {
      return px * (document.body.clientWidth / 1920);
    };
    return {
      loading: false,
      title: "铁路建设物资管理大屏",
      menuNm1: "甲供物资",
      menuNm2: "自购物资",
      screenType: '0',
      time: "",
      queryDate: [],
      deptId: "",
      projectId: "",
      deptOps: [],
      projectOps: [],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      boardConfig: {
        header: ["供应商名称", "退货次数", "退货金额（万元）"],
        data: [["", "暂无数据", ""]],
        //  ["上海合合信息科技股份有限公司", "1", "0.11"],
        // ["上海达机皮带有限公司", "1", "0.12"],
        // ["富裕注塑制模（上海）有限公司", "1", "0.01"],
        // ["易格斯拖链轴承仓储贸易（上海）有限公司", "1", "0.21"],
        // ["上海寰鹰航空技术有限公司", "1", "0.02"],
        // ["易格斯拖链轴承仓储贸易（上海）有限公司", "1", "0.20"],

        index: true,
        columnWidth: [50, 120, 80],
        align: ['center', 'left', 'center', 'center'],
        headerBGC: '#03001742',
        oddRowBGC: 'transparent',
        evenRowBGC: 'transparent',
        rowNum: 4,
      },
      timer: null,
      "contractCount": 0,
      "contractsAmount": 0,
      "projectCount": 0,
      "sectionCount": 0,
      "refundAmount": 0,
      "sendAmount": 0,
      "shippingCount": 0,
      "shippingFailCount": 0,
      "refundZjTotalAmount": 0,
      "storeCount": 0,
      "storeFailCount": 0,
      "storeTotalAmount": 0,
      "putTotalAmount": 0,
      "refundTotalAmount": 0,
      "takeCount": 0,
      "takeFailCount": 0,
      planAmount: 0,
      planCount: 0,
      outTotalAmount: 0,
      ratio: 0,
      storeTotalAmount8: 0,

      // 自购物资图片配置
      // 折线图配置
      lineOptions: {
        legend: {
          show: true,
          textStyle: {
            color: '#ccc'
          },
          top: 10,
          left: 'center',
          orient: 'horizontal',
        },
        backgroundColor: 'transparent', // 背景由外层控制
        title: { show: false },
        tooltip: {
          trigger: 'axis',
          textStyle: { fontSize: vw(16), color: '#fff' },
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderColor: '#2584FB'
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月'],
          axisLabel: { color: '#ccc', fontSize: vw(14) },
          axisLine: { lineStyle: { color: '#ccc' } },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },   // 隐藏轴线
          axisLabel: { color: '#ccc', fontSize: vw(14) },
          splitLine: { lineStyle: { color: '#ccc' } }
        },
        series: [
          {
            name: '自购物资合同设备数',
            type: 'line',
            data: [1200, 2300, 1800, 2700, 3200, 4100, 3800],
            smooth: false,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#fff',
              borderColor: '#2584FB',
              borderWidth: 3
            },
            lineStyle: { width: 2, color: '#2584FB' },
          }
        ],
      },
      tableData: [{
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '已审核',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '已审核',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '未提交',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '未提交',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '已审核',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '已审核',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
        }, {
        date: '粉煤灰采购',
        name: 'FMHCG-250621-001',
        address: '粉煤灰',
        status: '审核中',
      }],
      // 表格配置
      // tableConfig: {
      //   header: ["合同名称", "合同编号", "规格型号", "供应商", "标段项目", "提交时间", "审批状态"],
      //   data: [
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["粉煤灰采购", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //     ["22", "FMHCG-250621-001", "粉煤灰", "上海市xx商贸公司", "宁淮1标", "2024/12/2", "审核中"],
      //   ],
      //   index: true,
      //   columnWidth: [50, 140, 120],
      //   align: ['center', 'left', 'center', 'center'],
      //   headerBGC: '#03001742',
      //   oddRowBGC: 'transparent',
      //   evenRowBGC: 'transparent',
      //   rowNum: 16,
      //   carousel: 'off',
      // },
      // 柱状图配置
      barOptions1: {
        legend: {
          show: true,
          textStyle: {
            color: '#ccc'
          },
          top: 10,
          left: 'center',
          orient: 'horizontal',
        },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          textStyle: { fontSize: vw(16), color: '#fff' },
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderColor: '#2584FB'
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['宁淮5标', '南京上元门站前4站', '南京北站站房1标', '盐宜站前4标', '宁淮2标', '宁淮4标'],
          axisLabel: { color: '#ccc', fontSize: vw(14), rotate: 45, },
          axisLine: { lineStyle: { color: '#ccc' } },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },   // 隐藏轴线
          axisLabel: { color: '#ccc', fontSize: vw(14) },
          splitLine: { lineStyle: { color: '#ccc' } }
        },
        series: [
          {
            name: '标段项目合同核备数',
            type: 'bar',
            data: [530, 820, 410, 390, 620, 750],
            itemStyle: {
              color: '#2584FB',
              borderRadius: [6, 6, 0, 0]
            },
            barWidth: '30%'
          }
        ]
      },
      barOptions2: {
        legend: { show: false },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          textStyle: { fontSize: vw(16), color: '#fff' },
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderColor: '#2584FB'
        },
        grid: { left: '2%', right: '4%', top: '15%', containLabel: true },
        xAxis: {
          type: 'value',
          max: 8000, // 增加最大值，为标签留出空间
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'category',
          data: ['宁淮5标', '南京上元门站前4站', '南京北站站房1标', '盐宜站前4标', '宁淮2标', '宁淮4标'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#ccc',
            fontSize: vw(14)
          },
          splitLine: { show: false }
        },
        series: [
          {
            name: '',
            type: 'bar',
            data: [8000, 8000, 8000, 8000, 8000, 8000],
            itemStyle: {
              color: 'rgba(255,255,255,0.15)',
              borderRadius: [6, 6, 0, 0]
            },
            barWidth: 15,
            barCategoryGap: '80%',
            barGap: '-100%',
            label: { show: false },
            tooltip: { show: false },
            z: 1
          },
          {
            name: '物资种类合同核备金额',
            type: 'bar',
            data: [530, 820, 410, 390, 620, 750],
            itemStyle: {
              color: function (params) {
                const colorList = ['#2584FB', '#2B72CA', '#52D19D', '#4F9A54', '#EFB645', '#C18B35', '#EA6D33', '#D34A3D'];
                return colorList[params.dataIndex % colorList.length];
              },
              borderRadius: [6, 6, 0, 0]
            },
            barWidth: vw(16),
            barCategoryGap: '50%',
            label: {
              show: true,
              position: 'right',
              color: '#fff',
              fontSize: vw(14),
              fontWeight: 'bold',
              formatter: '{c}',
              distance: 8
            }
          }
        ]
      },

      // 饼图配置
      pieOptions: {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        legend: {
          orient: 'vertical',
          left: '60%',
          top: 'center',
          textStyle: { color: '#ccc', fontSize: vw(14) },
          itemWidth: vw(20),
          itemHeight: vw(14),
        },
        series: [
          {
            name: '物资种类合同核备数',
            type: 'pie',
            radius: [0, '60%'],
            center: ['30%', '50%'],
            avoidLabelOverlap: false,
            color: ['#487BE6', '#5EB2BB', '#4F9A54', '#EFB645', '#EA6D33', '#D34A3D'],
            itemStyle: {
              borderRadius: 10,
              borderColor: 'transparent',
              borderWidth: 2
            },
            label: { show: false },
            emphasis: {
              scale: true,
              label: { show: true, fontSize: vw(14) }
            },
            data: [
              { value: 1048, name: '水泥' },
              { value: 735, name: '粗骨料' },
              { value: 580, name: '钢筋' },
              { value: 484, name: '工子钢' },
              { value: 300, name: '钢管' },
              { value: 300, name: '减水剂' }
            ]
          }
        ]
      },
      // 大类名称
      matBigCateName: '',
      purchaseOps: [],


    }
  },
  computed: {
    comParams() {
      const dateArray = Array.isArray(this.queryDate) ? this.queryDate : [];
      const [startDate = '', endDate = ''] = dateArray
      return {
        startDate,
        endDate,
        deptId: this.deptId,
        projectId: this.projectId,
        // 物资大类名称
        ...(this.screenType === '1' && { name: this.matBigCateName })
      }
    },
    getStatusType() {
      return (status) => {
        const statusMap = {
          '审核中': 'primary',
          '已审核': 'success',
          '未提交': 'info'
        };
        return statusMap[status] || 'info';
      }
    },

  },

  mounted() {
    this.init();
    this.headerInterval(this.updateClock, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    async init() {
      this.initDefault()
      const { data: deptOps } = await Api.newListByDeptCode();
      this.deptOps = deptOps;
      const { data: projectOps } = await Api.getProjectByUser();
      this.projectOps = projectOps;

      this.screenChange('0')
      this.getPurchaseList()
    },
    initDefault() {
      const now = dayjs(); // 获取当前时间
      const curYear = now.format('YYYY')
      const startDate = `${curYear}-01-01`
      const endDate = now.format('YYYY-MM-DD')
      this.queryDate = [startDate, endDate]
    },
    screenChange(type) {
      this.screenType = type
      switch (type) {
        case "0":
          this.changedDept()
          break;
        case "1":
          this.getSelfPurchased()
          break;
      }
    },
    changedDate() {
      switch (this.screenType) {
        case "0":
          this.getMaterialPlan()
          this.getMaterialShipping()
          this.getMaterialTake()
          this.getMaterialStore()
          this.getMaterialOut()
          break;
        case "1":
          this.getSelfPurchased()
          break;
      }

    },
    changedDept() {
      switch (this.screenType) {
        case "0":
          this.changedDate()
          const params = {
            deptId: this.deptId,
            projectId: this.projectId,
          }
          this.getProjectStatistics(params)
          this.getProjectSite(params)
          break;
        case "1":
          this.getSelfPurchased()
          break;
      }

    },
    changedProject() {
      switch (this.screenType) {
        case "0":
          this.changedDate()
          const params = {
            deptId: this.deptId,
            projectId: this.projectId,
          }
          this.getProjectStatistics(params)
          this.getProjectSite(params)
          break;
        case "1":
          this.getSelfPurchased()
          break;
      }
    },
    getProjectSite(params) {
      this.$nextTick(() => {
        this.$refs.map.getProjectSite(params)
      })
    },
    updateClock() {
      const now = dayjs(); // 获取当前时间
      this.time = now.format('YYYY/MM/DD HH:mm:ss')
    },
    // 定时器
    headerInterval(cb, t) {
      this.timer = setInterval(cb, t)
    },
    // 投资总览
    async getProjectStatistics(params) {
      try {
        const { success, data } = await Api.projectStatistics(params)
        if (success && data) {
          this.contractCount = +data.contractCount || 0
          this.contractsAmount = (+data.contractsAmount / 1e4) || 0
          this.projectCount = +data.projectCount || 0
          this.sectionCount = +data.sectionCount || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 物资计划
    async getMaterialPlan() {
      try {
        const { success, data } = await Api.materialPlan(this.comParams)
        if (success && data) {
          this.planAmount = (+data.planAmount / 1e4) || 0
          this.planCount = +data.planCount || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 物资供应
    async getMaterialShipping() {
      try {
        const { success, data } = await Api.materialShipping(this.comParams)
        if (success && data) {
          this.refundAmount = (+data.refundAmount / 1e4) || 0
          this.sendAmount = (+data.sendAmount / 1e4) || 0
          this.shippingCount = +data.shippingCount || 0
          this.shippingFailCount = +data.shippingFailCount || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 供应商考核
    // async getProjectStatistics(){
    //   try {
    //     const { success, data } = await Api.materialOut(this.comParams)
    //     if (success && data) {
    // 
    //     }
    //   } catch (err) {
    //     console.log(err)
    //   }
    // },
    // 物资初验
    async getMaterialTake() {
      try {
        const { success, data } = await Api.materialTake(this.comParams)
        if (success && data) {
          this.putTotalAmount = (+data.putTotalAmount / 1e4) || 0
          this.refundTotalAmount = (+data.refundTotalAmount / 1e4) || 0
          this.takeCount = +data.takeCount || 0
          this.takeFailCount = +data.takeFailCount || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 质检入库
    async getMaterialStore() {
      try {
        const { success, data } = await Api.materialStore(this.comParams)
        if (success && data) {
          this.refundZjTotalAmount = (+data.refundZjTotalAmount / 1e4) || 0
          this.storeCount = +data.storeCount || 0
          this.storeFailCount = +data.storeFailCount || 0
          // 入库金额
          this.storeTotalAmount = (+data.storeTotalAmount / 1e4) || 0

        }
      } catch (err) {
        console.log(err)
      }
    },
    // 物资出库
    async getMaterialOut() {
      try {
        const { success, data } = await Api.materialOut(this.comParams)
        if (success && data) {
          this.outTotalAmount = (+data.outTotalAmount / 1e4) || 0
          this.ratio = +data.ratio || 0
          // 需求库存金额
          this.storeTotalAmount8 = (+data.storeTotalAmount / 1e4) || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    backHome() {
      let route = { path: '/portal' }
      this.$router
        .push(route)
        .catch(() => { });
    },
    // 自购物资------------------------------------------------------------------------------------------------------------------------
    getSelfPurchased() {
      this.getgroupByMonth()
      this.getgroupByPurchaseType()
      this.getgroupByPurchaseTypeAmount()
      this.getgroupBySectionName()
    },
    // 自购物资list
    async getPurchaseList() {
      try {
        const params = {
          pageNum: 1,
          pageSize: 9999,
        }
        const { success, data } = await Api.purchaseList(params)
        if (success && data && Array.isArray(data.list)) {
          this.purchaseOps = data.list.reduce((pre, cur) => {
            const isHad = pre.some(item => item.code === cur.code)
            if (!isHad) pre.push(cur)
            return pre
          }, [])
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 自购物资合同核备数
    async getgroupByMonth() {
      try {
        const { success, data } = await Api.groupByMonth(this.comParams)
        if (success && Array.isArray(data) && data.length) {
          this.lineOptions.xAxis.data = data.map(item => item.abscissa + '月')
          this.lineOptions.series[0].data = data.map(item => item.ordinate)
        } else {
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 物资种类合同核备数
    async getgroupByPurchaseType() {
      try {
        const { success, data } = await Api.groupByPurchaseType(this.comParams)
        if (success && Array.isArray(data) && data.length) {
          this.pieOptions.series[0].data = data.map(item => {
            return { value: item.ordinate, name: item.abscissa }
          })
        } else {
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 物资种类合同核备金额
    async getgroupByPurchaseTypeAmount() {
      try {
        const { success, data } = await Api.groupByPurchaseTypeAmount(this.comParams)
        if (success && Array.isArray(data) && data.length) {
          this.barOptions2.yAxis.data = data.map(item => item.abscissa)
          this.barOptions2.series[1].data = data.map(item => item.ordinate)

          const maxValue = Math.max(...data.map(item => item.ordinate))

          this.barOptions2.xAxis.max = maxValue * 1.5
          this.barOptions2.series[0].data = data.map(() => maxValue * 1.5)
        } else {
          this.barOptions2.xAxis.max = 100
          this.barOptions2.series[0].data = [100, 100, 100, 100, 100, 100]
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 标段项目合同核备数
    async getgroupBySectionName() {
      try {
        const { success, data } = await Api.groupBySectionName(this.comParams)
        if (success && Array.isArray(data) && data.length) {
          this.barOptions1.xAxis.data = data.map(item => item.abscissa)
          this.barOptions1.series[0].data = data.map(item => item.ordinate)
        } else {
        }
      } catch (err) {
        console.log(err)
      }
    },
  },
};
</script>
<style>
p {
  margin: 0;
}
</style>
<style lang="scss" scoped>
@import "@/assets/styles/index.scss";

.large-screen {
  width: vw(1920) !important;
  height: vh(1000) !important;
  transform: unset !important;
  background-color: rgba(229, 229, 229, 1);
  background-image: url("../../assets/large/bg.png");
  background-size: cover;
  background-position: center;
  position: relative;
  color: #fff;
  font-family: PingFangSC-bold;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    width: 100%;
    height: 100%;
    background-image: url("../../assets/large/v2_spjxax.png");
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -1;
  }

  .large-view {
    width: 100%;
    height: 100%;
    padding: 0 vw(40);

    >header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: vh(10);
      height: vh(70);

      >div {
        width: 33.33%;
      }
    }
  }

  .nav-mid {
    font-size: vw(36);
    text-align: center;
  }

  .nav-left,
  .nav-right {
    display: flex;
    align-items: center;
    gap: vw(16); // 替代 margin
  }

  .nav-right {
    justify-content: flex-end;
  }

  .nav-menu {
    background-image: url("../../assets/large/v2_spjxzk.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: vw(120);
    height: vh(40);
    line-height: vh(40);
    text-align: center;
    cursor: pointer;
    font-size: vw(16); // 补充字体
  }

  .time-running {
    font-size: vw(16);
  }

  .large-form {
    height: vh(40);
    display: flex;
    align-items: center;
    gap: vw(16); // 统一间距
  }
}

// 输入框全局样式
.el-date-editor,
.el-select {
  background: #0310234b;
}

.el-date-editor--daterange.el-date-editor {
  width: vw(252) !important;
}

.el-select {
  width: vw(160);
}

::v-deep .el-range-input,
::v-deep .el-input__inner {
  background: transparent;
  color: #75f9fd;
  font-size: vw(14);
}

.el-date-editor,
::v-deep .el-input__inner {
  border: 1px solid #bbb;
  border-radius: vw(6);
  border-color: #0b5ddf;
}

::v-deep .el-date-editor .el-range__icon,
::v-deep .el-select .el-input .el-select__caret,
::v-deep .el-range-input::placeholder,
::v-deep .el-input__inner::placeholder {
  color: #bbb;
}

// 主体布局：三栏
.large-flex {
  padding: vh(8) 0;
  display: flex;
  align-items: flex-start; // 避免子项拉伸
  justify-content: space-between;
  height: calc(100% - #{vh(140)});

  >.left,
  >.right {
    width: vw(475); // 1920 * 0.25
    display: flex;
    flex-direction: column;
    gap: vh(20); // 卡片间距
  }

  >.middle {
    width: vw(950); // 1920 * 0.5
    display: flex;
    flex-direction: column;
    gap: vh(20);
    padding: 0 vw(20);
  }
}

.item-1,
.item-3,
.item-4,
.item-5,
.item-6,
.item-8 {
  background-image: url("../../assets/large/v2_si3d0n.png");
}

.item-7 {
  background-image: url("../../assets/large/v2_shxttf.png");
}

// 卡片通用样式
.item {
  height: vh(270);
  background-size: 100% 100% !important;
  background-repeat: no-repeat !important;
  border-radius: vw(8);

  >header {
    padding: vh(10) vw(20);
    font-size: vw(20);
    font-family: HarmonyOS_Sans_SC-bold;
    color: #75f9fd;
    text-align: center;
  }
}

// 中间区域特殊卡片
.item-2 {
  height: vh(550) !important;
  border-radius: vw(8);
  padding: vh(12) vw(12);
}

.item-7 {
  height: vh(280) !important;
  padding-top: vh(8);

  .value {
    font-size: vw(20);
    color: #fff;
    font-weight: 500;
  }

  .label {
    font-size: vw(12);
    color: rgb(255, 191, 43);
  }

  .body-item-name {
    color: #75f9fd;
    font-size: vw(14);
  }
}

// 卡片内容
.item-body {
  height: calc(100% - #{vh(50)}); // header 高度约 50
  display: flex;
  flex-wrap: wrap;
  padding: 0 vw(20);

  >.body-item {
    width: 50%;
    display: flex;
    align-items: center;
    padding: vh(10) 0;
    gap: vw(16);
  }
}

.icon-com {
  width: vw(70);
  height: vh(86);
  background-image: url("../../assets/large/v2_sjat1h.png");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.body-num {
  width: calc(100% - #{vw(80)});
  font-size: vw(14);
  color: #75f9fd;

  .card-panel-num {
    color: #fff;
    font-size: vw(16);
    font-weight: 500;
  }
}

// 物资计划特殊样式
.item-4 {
  .body-item {
    flex-direction: column;
    justify-content: center;
    align-items: space-between;
    padding: vh(10) 0 vh(30);

    .icon-com {
      width: 50%;
      height: 50%;
      background-size: 190%;

      &.amount-bg {
        background-size: 220%;
        padding-bottom: vh(50);
      }
    }

    .desc {
      font-size: vw(12);
      color: rgb(255, 191, 43);
    }

    .body-num {
      text-align: center;
      font-size: vw(14);
    }
  }
}

.item-4 .icon-com.num-bg {
  width: vw(150);
  height: vh(150);
  background-image: url("../../assets/large/v2_sfbiz4.png");
  background-size: 190%;
}

.item-4 .icon-com.amount-bg {
  width: vw(150);
  height: vh(150);
  background-image: url("../../assets/large/v2_sfbk82.png");
  background-size: 220%;
}

// 供应商考核
.item7-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: vh(24) vw(20) 0;
}

.item7-chart {
  display: flex;
  gap: vw(30);
}

.item7-chart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: vh(8);
}

.item-8 {
  .item-first {
    width: 100% !important;
    justify-content: space-around;
    padding: 0 vw(60);

    margin .icon-com {
      width: vw(92);
    }

    .label {
      width: vw(100);
      color: #75f9fd;
    }

    .body-num {
      width: vw(120);
    }
  }
}

.icon {
  width: vw(34);
  height: vh(34);
}

.body-pic {
  width: vw(127);
  height: vh(99);
  background-image: url("../../assets/large/ljthcs@1x.png");
  background-size: 90%;
  background-position: center;
  background-repeat: no-repeat;
}

.body-pic-2 {
  background-image: url("../../assets/large/ljthje@1x.png");
  background-size: 130%;
}

// 字体重置
p {
  margin: 0;
  font-size: vw(16);
}

.dv-scroll-board {
  ::v-deep .header {
    font-size: vw(15) !important;
    color: #75f9fd;
  }

  ::v-deep .row-item {
    font-size: vw(14) !important;
  }
}

.item-7 {
  .dv-scroll-board {
    height: vh(160) !important;
  }
}

.self-flex {
  .dv-scroll-board {
    height: vh(780) !important;

    ::v-deep .row-item {
      color: #869ab9;
    }
  }
}

.self-purchased {
  margin: vh(100) auto;
  font-size: vw(24);
  color: #75f9fd;
}

.back {
  cursor: pointer;
}

// 自购物资
.self-flex {
  display: flex;

  .left,
  .right {
    .chart-card {
      height: vh(410);
    }
  }

  .middle {
    .chart-card {
      height: vh(840);
    }

    // 自定义表格容器
    .custom-table-container {
      height: 100%;
      padding: vh(10) vw(10);

      .el-table {
        margin: unset;
        height: vh(760);

        &::before{
          background-color: unset;
        }

        ::v-deep .el-table__body-wrapper {
          height: vh(720) !important;
          overflow: auto;
        }
      }

      .el-table th {
        height: vh(40);
      }

      .el-table__row {
        height: vh(40);
      }

      // 表格样式
      .large-screen-table {
        background: transparent;

        // 表头样式
        ::v-deep .el-table__header-wrapper th {
          background: #0E142B !important;
          color: #75f9fd !important;
          font-size: vw(15) !important;
          border: none !important;
        }

        // 表格行样式
        ::v-deep .el-table__body-wrapper tbody td {
          color: #869ab9 !important;
          font-size: vw(14) !important;
          border: none !important;
          background: transparent !important;
        }

        // 奇偶行背景（保持透明）
        ::v-deep .el-table__body-wrapper tbody tr:nth-child(odd) {
          background: transparent !important;
        }

        ::v-deep .el-table__body-wrapper tbody tr:nth-child(even) {
          background: transparent !important;
        }

        // 滚动条样式
        ::v-deep .el-table__body-wrapper {
          &::-webkit-scrollbar {
            width: vw(6) !important;
          }

          &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1) !important;
            border-radius: vw(3) !important;
          }

          &::-webkit-scrollbar-thumb {
            background: #75f9fd !important;
            border-radius: vw(3) !important;
          }
        }

        // 表格边框
        ::v-deep .el-table--enable-row-hover .el-table__body tr:hover>td {
          background-color: rgba(117, 249, 253, 0.1) !important;
        }
      }
    }
  }
}

.nav-menu {
  color: #bbb;
}

.nav-menu.active {
  color: #75f9fd;
}
</style>
