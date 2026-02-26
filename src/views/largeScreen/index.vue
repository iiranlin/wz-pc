<template>
  <dv-full-screen-container class="large-screen">
    <dv-loading v-if="loading">加载中...</dv-loading>
    <article
      v-else
      class="large-view"
    >
      <header>
        <div
          class="nav-left"
          @click="screenChange('0')"
        >
          <p class="time-running">{{ time }}</p>
          <div class="nav-menu">{{ menuNm1 }}</div>
        </div>
        <div class="nav-mid">{{ title }}</div>
        <div
          class="nav-right"
          @click="screenChange('1')"
        >
          <div class="nav-menu">{{ menuNm2 }}</div>
          <p
            class="back"
            @click="backHome"
          >
          <i class="el-icon-s-home"></i>
          返回门户</p>
          <p class="user-tools"></p>
        </div>
      </header>
      <div class="large-form">
        <el-date-picker
          v-model="queryDate"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :picker-options="pickerOptions"
          value-format="yyyy-MM-dd"
          size="mini"
          @change="changedParams"
        >
        </el-date-picker>
        <el-select
          v-model="deptId"
          placeholder="请选择"
          size="mini" 
          clearable
        >
          <el-option
            v-for="item in deptOps"
            :key="item.id"
            :label="item.deptName"
            :value="item.id"
          >
          </el-option>
        </el-select>
        <el-select
          v-model="projectId"
          placeholder="请选择"
          size="mini"
          clearable
          @change="changedParams"
          @clear="changedParams"
        >
          <el-option
            v-for="item in projectOps"
            :key="item.id"
            :label="item.projectName"
            :value="item.id"
          >
          </el-option>
        </el-select>
        <el-select
          v-if="screenType == '1'"
          v-model="projectId"
          placeholder="请选择物资大类"
          size="mini"
          @change="changedParams"
        >
          <el-option
            v-for="item in projectOps"
            :key="item.id"
            :label="item.projectName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>

      <div
        class="large-flex"
        v-if="screenType == '0'"
      >
        <div class="left">
          <!-- 投资总览 -->
          <div class="item item-1">
            <header>投资总览</header>
            <div class="item-body">
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    class="icon"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#6AD3E8"
                      d="M976 544.1c0 22.6-1.5 44.9-4.3 66.7-1.1 8.6-9.4 14.3-17.9 12.4l-47-10.7-31.3-7.2-62.6-14.3-274.4-62.7c-3.2-.7-4.2-4.7-1.8-6.9l280-253.7 35.7-32.4c6.4-5.8 16.5-4.9 21.6 2.1 64.1 85.4 102 191.6 102 306.7zM773.6 198.5c6.5 5.8 6.4 16 0 21.8L738 252.6 469.5 496a4 4 0 0 1-5.7-.3L255 260.8l-32-36-10.6-12-21.3-24a14.8 14.8 0 0 1 2.5-21.8c76.2-54.7 169.6-87 270.5-87 118.9.1 227.4 44.9 309.5 118.5z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="M856.1 683.3c-57.2 161.1-210.8 276.5-391.4 276.8C234.1 960.5 48 774.7 48 544.2 48 437.9 87.8 341 153.3 267.5a14.7 14.7 0 0 1 22 0l31.9 35.9L439.7 565l.4.4c.5.5 1.2 1.3 1.7 1.8.2.2.4.3.5.5l.2.2c.3.3.6.5.9.8 1.2 1 2.5 2 3.9 2.8.2.2.5.3.7.4l1.8.9c.2.1.3.2.5.2.8.4 1.5.7 2.3 1 .2.1.4.2.7.2l.9.3 1.1.3 1.3.3c.1 0 .1 0 .2.1l341.8 78.1 46.8 10.7c8.7 2.1 13.7 11 10.7 19.3z"
                    />
                  </svg>
                </div>
                <div class="body-num">
                  <p>项目数量</p>
                  <count-to
                    :start-val="0"
                    :end-val="projectCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>个</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#6AD3E8"
                      d="m173.3 360.37 194.95 98.46c90.58 45.3 196.92 45.3 285.53-1.97l196.93-102.4c47.26-25.6 47.26-94.52 0-120.12L657.72 133.9c-90.58-47.26-200.86-47.26-291.44 1.97L173.29 240.25c-49.23 25.6-47.26 94.52 0 120.12Z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="m813.3 478.52-177.24 98.46c-72.86 39.39-173.3 39.39-248.12 0L210.7 478.52c-23.63-13.78-53.17-3.94-66.96 19.7-13.78 23.63-3.94 53.16 19.7 66.95l179.2 98.46c53.16 27.57 112.24 39.39 171.32 39.39s120.12-13.79 171.32-41.36l177.23-98.46c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.67-45.3-31.51-68.93-17.73Z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="M813.3 695.14 636.05 793.6c-72.86 39.38-173.3 39.38-248.12 0L210.7 695.14c-23.63-13.79-53.17-3.94-66.96 19.69-13.78 23.63-3.94 53.17 19.7 66.95l179.2 98.47c53.16 27.56 112.24 39.38 171.32 39.38s120.12-13.78 171.32-41.35l177.23-98.47c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.66-45.3-31.5-68.93-17.72Z"
                    />
                  </svg>
                </div>
                <div class="body-num">
                  <p>标段数量</p>
                  <count-to
                    :start-val="0"
                    :end-val="sectionCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>个</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48"
                  >
                    <defs></defs>
                    <g>
                      <path
                        fill="#6AD3E8"
                        d="M40 33V42C40 43.1046 39.1046 44 38 44H31.5"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M40 16V6C40 4.89543 39.1046 4 38 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H16"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M16 16H30"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                      <path
                        d="M23 44L40 23"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                      <path
                        d="M16 24H24"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>启用合同数量</p>
                  <count-to
                    :start-val="0"
                    :end-val="contractCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>份</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
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
                  </svg>
                </div>
                <div class="body-num">
                  <p>合同物资总金额</p>
                  <count-to
                    :start-val="0"
                    :end-val="contractsAmount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
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
                    <count-to
                      :start-val="0"
                      :end-val="planCount"
                      :duration="3600"
                      class="card-panel-num"
                      :decimals="0"
                    />
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
                    <count-to
                      :start-val="0"
                      :end-val="planAmount"
                      :duration="3600"
                      class="card-panel-num"
                      :decimals="2"
                    />
                    <span class="desc">元</span>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 24 24"
                  >
                    <defs></defs>
                    <g>
                      <path
                        fill="#6AD3E8"
                        d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"
                      >
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>供应批次</p>
                  <count-to
                    :start-val="0"
                    :end-val="shippingCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>批</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <defs></defs>
                    <g>
                      <path
                        d="M38 15V7H10V15"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M43 27V15H5V41H43"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M29 27L24 34L43 34"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M26 21H22"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                      </path>
                      <path
                        d="M16 21H12"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>供应总金额</p>
                  <count-to
                    :start-val="0"
                    :end-val="sendAmount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 32 32"
                  >
                    <defs></defs>
                    <g>
                      <path
                        fill="#6AD3E8"
                        d="M21.248 3.333l7.419 7.423v10.493l-7.419 7.417h-10.493l-7.421-7.419v-10.493l7.421-7.421h10.493zM10.667 14.667v2.667h10.667v-2.667h-10.667z"
                      >
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>退货次数</p>
                  <count-to
                    :start-val="0"
                    :end-val="shippingFailCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>批</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <defs></defs>
                    <g>
                      <rect
                        width="48"
                        height="48"
                        fill="white"
                        fill-opacity="0.01"
                      ></rect>
                      <path
                        d="M36 12L24 24L12 12"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M36 24L24 36L12 24"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>退货总金额</p>
                  <count-to
                    :start-val="0"
                    :end-val="refundAmount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
                  <span>万元</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="middle">
          <!-- 地图 -->
          <dv-border-box-8 class="item item-2">
            <baseMap
              :projectId="projectId"
              ref="map"
            />
          </dv-border-box-8>
          <!-- 供应商考核 -->
          <div class="item item-7">
            <header>供应商考核</header>
            <div class="item7-body">
              <div class="item7-chart">
                <div class="item7-chart-item">
                  <p>
                    <span class="value">12</span> <span class="label">批</span>
                  </p>
                  <i class="body-pic"></i>
                  <p class="body-item-name">累计退货次数</p>
                </div>
                <div class="item7-chart-item">
                  <p>
                    <span class="value">1.23 </span>
                    <span class="label">万元</span>
                  </p>
                  <i class="body-pic body-pic-2"></i>
                  <p class="body-item-name">累计退货金额</p>
                </div>
              </div>
              <dv-scroll-board
                :config="boardConfig"
                style="width: 55%"
              />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="64 64 896 896"
                  >
                    <defs></defs>
                    <g>
                      <path
                        fill="#6AD3E8"
                        d="M218.9 636.3l42.6 26.6c.1.1.3.2.4.3l12.7 8 .3.3a186.9 186.9 0 0 0 94.1 25.1c44.9 0 87.2-15.7 121-43.8a256.27 256.27 0 0 1 164.9-59.9c52.3 0 102.2 15.7 144.6 44.5l7.9 5-111.6-289V179.8h63.5c4.4 0 8-3.6 8-8V120c0-4.4-3.6-8-8-8H264.7c-4.4 0-8 3.6-8 8v51.9c0 4.4 3.6 8 8 8h63.5v173.6L218.9 636.3zm333-203.1c22 0 39.9 17.9 39.9 39.9S573.9 513 551.9 513 512 495.1 512 473.1s17.9-39.9 39.9-39.9zM878 825.1l-29.9-77.4-85.7-53.5-.1.1c-.7-.5-1.5-1-2.2-1.5l-8.1-5-.3-.3c-29-17.5-62.3-26.8-97-26.8-44.9 0-87.2 15.7-121 43.8a256.27 256.27 0 0 1-164.9 59.9c-53 0-103.5-16.1-146.2-45.6l-28.9-18.1L146 825.1c-2.8 7.4-4.3 15.2-4.3 23 0 35.2 28.6 63.8 63.8 63.8h612.9c7.9 0 15.7-1.5 23-4.3a63.6 63.6 0 0 0 36.6-82.5z"
                      >
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>初验次数</p>
                  <count-to
                    :start-val="0"
                    :end-val="takeCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>次</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#6AD3E8"
                      d="m173.3 360.37 194.95 98.46c90.58 45.3 196.92 45.3 285.53-1.97l196.93-102.4c47.26-25.6 47.26-94.52 0-120.12L657.72 133.9c-90.58-47.26-200.86-47.26-291.44 1.97L173.29 240.25c-49.23 25.6-47.26 94.52 0 120.12Z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="m813.3 478.52-177.24 98.46c-72.86 39.39-173.3 39.39-248.12 0L210.7 478.52c-23.63-13.78-53.17-3.94-66.96 19.7-13.78 23.63-3.94 53.16 19.7 66.95l179.2 98.46c53.16 27.57 112.24 39.39 171.32 39.39s120.12-13.79 171.32-41.36l177.23-98.46c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.67-45.3-31.51-68.93-17.73Z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="M813.3 695.14 636.05 793.6c-72.86 39.38-173.3 39.38-248.12 0L210.7 695.14c-23.63-13.79-53.17-3.94-66.96 19.69-13.78 23.63-3.94 53.17 19.7 66.95l179.2 98.47c53.16 27.56 112.24 39.38 171.32 39.38s120.12-13.78 171.32-41.35l177.23-98.47c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.66-45.3-31.5-68.93-17.72Z"
                    />
                  </svg>
                </div>
                <div class="body-num">
                  <p>收货金额</p>
                  <count-to
                    :start-val="0"
                    :end-val="putTotalAmount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <defs></defs>
                    <g>
                      <rect
                        width="48"
                        height="48"
                        fill="white"
                        fill-opacity="0.01"
                      ></rect>
                      <path
                        fill="#6AD3E8"
                        d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z"
                        stroke="#333"
                        stroke-width="4"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M24 37C25.3807 37 26.5 35.8807 26.5 34.5C26.5 33.1193 25.3807 32 24 32C22.6193 32 21.5 33.1193 21.5 34.5C21.5 35.8807 22.6193 37 24 37Z"
                        fill="#333"
                      ></path>
                      <path
                        d="M24 12V28"
                        stroke="#333"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                      </path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>初验不合格数</p>
                  <count-to
                    :start-val="0"
                    :end-val="takeFailCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>批</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
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
                  </svg>
                </div>
                <div class="body-num">
                  <p>退货物资金额</p>
                  <count-to
                    :start-val="0"
                    :end-val="refundTotalAmount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#6AD3E8"
                      d="M976 544.1c0 22.6-1.5 44.9-4.3 66.7-1.1 8.6-9.4 14.3-17.9 12.4l-47-10.7-31.3-7.2-62.6-14.3-274.4-62.7c-3.2-.7-4.2-4.7-1.8-6.9l280-253.7 35.7-32.4c6.4-5.8 16.5-4.9 21.6 2.1 64.1 85.4 102 191.6 102 306.7zM773.6 198.5c6.5 5.8 6.4 16 0 21.8L738 252.6 469.5 496a4 4 0 0 1-5.7-.3L255 260.8l-32-36-10.6-12-21.3-24a14.8 14.8 0 0 1 2.5-21.8c76.2-54.7 169.6-87 270.5-87 118.9.1 227.4 44.9 309.5 118.5z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="M856.1 683.3c-57.2 161.1-210.8 276.5-391.4 276.8C234.1 960.5 48 774.7 48 544.2 48 437.9 87.8 341 153.3 267.5a14.7 14.7 0 0 1 22 0l31.9 35.9L439.7 565l.4.4c.5.5 1.2 1.3 1.7 1.8.2.2.4.3.5.5l.2.2c.3.3.6.5.9.8 1.2 1 2.5 2 3.9 2.8.2.2.5.3.7.4l1.8.9c.2.1.3.2.5.2.8.4 1.5.7 2.3 1 .2.1.4.2.7.2l.9.3 1.1.3 1.3.3c.1 0 .1 0 .2.1l341.8 78.1 46.8 10.7c8.7 2.1 13.7 11 10.7 19.3z"
                    />
                  </svg>
                </div>
                <div class="body-num">
                  <p>质检次数</p>
                  <count-to
                    :start-val="0"
                    :end-val="storeCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>次</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#6AD3E8"
                      d="m173.3 360.37 194.95 98.46c90.58 45.3 196.92 45.3 285.53-1.97l196.93-102.4c47.26-25.6 47.26-94.52 0-120.12L657.72 133.9c-90.58-47.26-200.86-47.26-291.44 1.97L173.29 240.25c-49.23 25.6-47.26 94.52 0 120.12Z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="m813.3 478.52-177.24 98.46c-72.86 39.39-173.3 39.39-248.12 0L210.7 478.52c-23.63-13.78-53.17-3.94-66.96 19.7-13.78 23.63-3.94 53.16 19.7 66.95l179.2 98.46c53.16 27.57 112.24 39.39 171.32 39.39s120.12-13.79 171.32-41.36l177.23-98.46c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.67-45.3-31.51-68.93-17.73Z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="M813.3 695.14 636.05 793.6c-72.86 39.38-173.3 39.38-248.12 0L210.7 695.14c-23.63-13.79-53.17-3.94-66.96 19.69-13.78 23.63-3.94 53.17 19.7 66.95l179.2 98.47c53.16 27.56 112.24 39.38 171.32 39.38s120.12-13.78 171.32-41.35l177.23-98.47c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.66-45.3-31.5-68.93-17.72Z"
                    />
                  </svg>
                </div>
                <div class="body-num">
                  <p>入库金额</p>
                  <count-to
                    :start-val="0"
                    :end-val="storeTotalAmount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48"
                  >
                    <defs></defs>
                    <g>
                      <path
                        d="M40 33V42C40 43.1046 39.1046 44 38 44H31.5"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M40 16V6C40 4.89543 39.1046 4 38 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H16"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M16 16H30"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                      <path
                        d="M23 44L40 23"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                      <path
                        d="M16 24H24"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>质检不合格数</p>
                  <count-to
                    :start-val="0"
                    :end-val="storeFailCount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="0"
                  />
                  <span>批</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
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
                  </svg>
                </div>
                <div class="body-num">
                  <p>退货物资金额</p>
                  <count-to
                    :start-val="0"
                    :end-val="refundZjTotalAmount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#6AD3E8"
                      d="M976 544.1c0 22.6-1.5 44.9-4.3 66.7-1.1 8.6-9.4 14.3-17.9 12.4l-47-10.7-31.3-7.2-62.6-14.3-274.4-62.7c-3.2-.7-4.2-4.7-1.8-6.9l280-253.7 35.7-32.4c6.4-5.8 16.5-4.9 21.6 2.1 64.1 85.4 102 191.6 102 306.7zM773.6 198.5c6.5 5.8 6.4 16 0 21.8L738 252.6 469.5 496a4 4 0 0 1-5.7-.3L255 260.8l-32-36-10.6-12-21.3-24a14.8 14.8 0 0 1 2.5-21.8c76.2-54.7 169.6-87 270.5-87 118.9.1 227.4 44.9 309.5 118.5z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="M856.1 683.3c-57.2 161.1-210.8 276.5-391.4 276.8C234.1 960.5 48 774.7 48 544.2 48 437.9 87.8 341 153.3 267.5a14.7 14.7 0 0 1 22 0l31.9 35.9L439.7 565l.4.4c.5.5 1.2 1.3 1.7 1.8.2.2.4.3.5.5l.2.2c.3.3.6.5.9.8 1.2 1 2.5 2 3.9 2.8.2.2.5.3.7.4l1.8.9c.2.1.3.2.5.2.8.4 1.5.7 2.3 1 .2.1.4.2.7.2l.9.3 1.1.3 1.3.3c.1 0 .1 0 .2.1l341.8 78.1 46.8 10.7c8.7 2.1 13.7 11 10.7 19.3z"
                    />
                  </svg>
                </div>
                <p class="label">出库金额</p>
                <div class="body-num">
                  <count-to
                    :start-val="0"
                    :end-val="outTotalAmount"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#6AD3E8"
                      d="m173.3 360.37 194.95 98.46c90.58 45.3 196.92 45.3 285.53-1.97l196.93-102.4c47.26-25.6 47.26-94.52 0-120.12L657.72 133.9c-90.58-47.26-200.86-47.26-291.44 1.97L173.29 240.25c-49.23 25.6-47.26 94.52 0 120.12Z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="m813.3 478.52-177.24 98.46c-72.86 39.39-173.3 39.39-248.12 0L210.7 478.52c-23.63-13.78-53.17-3.94-66.96 19.7-13.78 23.63-3.94 53.16 19.7 66.95l179.2 98.46c53.16 27.57 112.24 39.39 171.32 39.39s120.12-13.79 171.32-41.36l177.23-98.46c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.67-45.3-31.51-68.93-17.73Z"
                    />
                    <path
                      fill="#6AD3E8"
                      d="M813.3 695.14 636.05 793.6c-72.86 39.38-173.3 39.38-248.12 0L210.7 695.14c-23.63-13.79-53.17-3.94-66.96 19.69-13.78 23.63-3.94 53.17 19.7 66.95l179.2 98.47c53.16 27.56 112.24 39.38 171.32 39.38s120.12-13.78 171.32-41.35l177.23-98.47c23.63-13.78 31.51-43.32 19.7-66.95-15.76-21.66-45.3-31.5-68.93-17.72Z"
                    />
                  </svg>
                </div>
                <div class="body-num">
                  <p>需求库存金额</p>
                  <count-to
                    :start-val="0"
                    :end-val="150"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
                  <span>万元</span>
                </div>
              </div>
              <div class="body-item">
                <div class="icon-com">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="styles__StyledSVGIconPathComponent-sc-i3aj97-0 UNGQS svg-icon-path-icon fill icon"
                    viewBox="0 0 48 48"
                  >
                    <defs></defs>
                    <g>
                      <path
                        d="M40 33V42C40 43.1046 39.1046 44 38 44H31.5"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M40 16V6C40 4.89543 39.1046 4 38 4H10C8.89543 4 8 4.89543 8 6V42C8 43.1046 8.89543 44 10 44H16"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M16 16H30"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                      <path
                        d="M23 44L40 23"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                      <path
                        d="M16 24H24"
                        stroke="#6AD3E8"
                        stroke-width="4"
                        stroke-linecap="round"
                      ></path>
                    </g>
                  </svg>
                </div>
                <div class="body-num">
                  <p>库存金额比例</p>
                  <count-to
                    :start-val="0"
                    :end-val="ratio"
                    :duration="3600"
                    class="card-panel-num"
                    :decimals="2"
                  />
                  <span>%</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div
        class="large-flex"
        v-if="screenType == '1'"
      >
        <p class="self-purchased">自购物资正在建设中……</p>
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
export default {
  name: "largeScreen",
  components: {
    CountTo,
    baseMap,
  },
  data () {
    return {
      loading: false,
      title: "铁路建设物资管理系统",
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
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick (picker) {
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
        data: [
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
          ["上海xx供应商", "1", "123"],
        ],
        index: true,
        columnWidth: [50],
        align: ['center', 'center', 'center', 'right'],
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
      storeTotalAmount: 0,
    };
  },
  watch: {
    queryDate (n, o) {
      console.log("n, o ==> ", n, o);

    }
  },
  computed: {
    comParams () {
      const [startDate = '', endDate = ''] = this.queryDate
      return {
        startDate,
        endDate,
        projectId: this.projectId,
      }
    }
  },

  mounted () {
    this.init();
    this.headerInterval(this.updateClock, 1000);
  },
  beforeDestroy () {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    async init () {
      const { data: deptOps } = await Api.newListByDeptCode();
      this.deptOps = deptOps;
      const { data: projectOps } = await Api.getProjectByUser();
      this.projectOps = projectOps;

      this.changedParams()
    },
    screenChange (type) {
      this.screenType = type
    },
    changedParams () {
      this.getProjectStatistics()
      this.getMaterialPlan()
      this.getMaterialShipping()
      this.getMaterialTake()
      this.getMaterialStore()
      this.getMaterialOut()
      this.$refs.map.getProjectSite(this.projectId)
    },
    updateClock () {
      const now = dayjs(); // 获取当前时间
      this.time = now.format('YYYY/MM/DD HH:mm:ss')
    },
    // 定时器
    headerInterval (cb, t) {
      this.timer = setInterval(cb, t)
    },
    // 投资总览
    async getProjectStatistics () {
      try {
        const { success, data } = await Api.projectStatistics(this.comParams)
        if (success && data) {
          this.contractCount = +data.contractCount || 0
          this.contractsAmount = +data.contractsAmount || 0
          this.projectCount = +data.projectCount || 0
          this.sectionCount = +data.sectionCount || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 物资计划
    async getMaterialPlan () {
      try {
        const { success, data } = await Api.materialPlan(this.comParams)
        if (success && data) {
          this.planAmount = +data.planAmount || 0
          this.planCount = +data.planCount || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 物资供应
    async getMaterialShipping () {
      try {
        const { success, data } = await Api.materialShipping(this.comParams)
        if (success && data) {
          this.refundAmount = +data.refundAmount || 0
          this.sendAmount = +data.sendAmount || 0
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
    //       this.outTotalAmount = +data.outTotalAmount || 0
    //       this.ratio = +data.ratio || 0
    //       this.storeTotalAmount = +data.storeTotalAmount || 0 
    //     }
    //   } catch (err) {
    //     console.log(err)
    //   }
    // },
    // 物资初验
    async getMaterialTake () {
      try {
        const { success, data } = await Api.materialTake(this.comParams)
        if (success && data) {
          this.putTotalAmount = +data.putTotalAmount || 0
          this.refundTotalAmount = +data.refundTotalAmount || 0
          this.takeCount = +data.takeCount || 0
          this.takeFailCount = +data.takeFailCount || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    // 质检入库
    async getMaterialStore () {
      try {
        const { success, data } = await Api.materialStore(this.comParams)
        if (success && data) {
          this.refundZjTotalAmount = +data.refundZjTotalAmount || 0
          this.storeCount = +data.storeCount || 0
          this.storeFailCount = +data.storeFailCount || 0
          this.storeTotalAmount = +data.storeTotalAmount || 0

        }
      } catch (err) {
        console.log(err)
      }
    },
    // 物资出库
    async getMaterialOut () {
      try {
        const { success, data } = await Api.materialOut(this.comParams)
        if (success && data) {
          this.outTotalAmount = +data.outTotalAmount || 0
          this.ratio = +data.ratio || 0
          this.storeTotalAmount = +data.storeTotalAmount || 0
        }
      } catch (err) {
        console.log(err)
      }
    },
    backHome () {
      let route = { path: '/portal' }
      this.$router
        .push(route)
        .catch(() => { });
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

    > header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: vh(10);
      height: vh(70);

      > div {
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

  > .left,
  > .right {
    width: vw(475); // 1920 * 0.25
    display: flex;
    flex-direction: column;
    gap: vh(20); // 卡片间距
  }

  > .middle {
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

  > header {
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

  > .body-item {
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

.item-8{
  .item-first{
    width: 100% !important;
    .icon-com{
      width: vw(92);
    }
    .label{
      width: vw(100);
      color: #75f9fd;
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
  height: vh(160) !important;

  ::v-deep .header {
    font-size: vw(15) !important;
    color: #75f9fd;
  }

  ::v-deep .row-item {
    font-size: vw(14) !important;
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
</style>
