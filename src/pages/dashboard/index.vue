<script lang="ts" setup>
import * as echarts from "echarts"
import { ElMessage } from "element-plus"
import { cloneDeep } from "lodash"
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import { getPopularBooksApi, getPredictiveApi } from "./apis/index"
import { LineOption } from "./configs/index"
import { getAxisData, getLineSeriesData, getObjectAxisData, getObjectSeriesData } from "./utils/index"

interface ChartInstance {
  setOption: (option: any) => void
  resize: () => void
  dispose: () => void
}

interface CategoryData {
  category_name: string
  borrow_count: number
}

interface ApiResponse {
  data?: {
    top_categories?: CategoryData[]
    total_borrows?: number
    categories_count?: number
    chart_data?: {
      [key: string]: any
    }
    ai_summary?: {
      text: string
      analysis_time: string
      data_based_on: string
    }
    predicted_counts?: number[]
    future_dates?: string[]
    model_info?: {
      type: string
      parameters: string
      data_points_used: number
    }
  }
  message?: string
  status?: number
  top_categories?: CategoryData[]
  total_borrows?: number
  categories_count?: number
  chart_data?: {
    [key: string]: any
  }
  ai_summary?: {
    text: string
    analysis_time: string
    data_based_on: string
  }
}

const state = reactive({
  dimension: "year",
  top_data: 5,
  currentKey: "bar_chart",
  topDataCache: {} as Record<string, any>,
  // timeDimensionOption,
  showAiAnalysis: false,
  aiAnalysisSummary: "",
  aiLoading: false,
  future_days: 30,
  categoryList: [] as Array<{ id: number, name: string }>
})

const topTrendsChartRef = ref<HTMLElement | null>(null)
const predicteRef = ref<HTMLElement | null>(null)

const myCharts: (ChartInstance | null)[] = []

function initTopTrendsChart() {
  if (topTrendsChartRef.value) {
    // Dispose existing chart instance if any
    if (myCharts[0]) {
      myCharts[0].dispose()
      myCharts[0] = null
    }

    try {
      const myChart = echarts.init(topTrendsChartRef.value)
      myCharts[0] = myChart as ChartInstance

      // Add resize event listener
      window.addEventListener("resize", () => {
        myChart.resize()
      })

      console.log("Chart initialized successfully")
    } catch (error) {
      console.error("Failed to initialize chart:", error)
      ElMessage.error("Chart initialization failed")
    }
  } else {
    console.error("Chart container not found")
  }
}

function initPredictChart() {
  if (predicteRef.value) {
    // Dispose existing chart instance if any
    if (myCharts[1]) {
      myCharts[1].dispose()
      myCharts[1] = null
    }

    try {
      const myChart = echarts.init(predicteRef.value)
      myCharts[1] = myChart as ChartInstance

      // Add resize event listener
      window.addEventListener("resize", () => {
        myChart.resize()
      })

      console.log("Predict chart initialized successfully")
    } catch (error) {
      console.error("Failed to initialize predict chart:", error)
      ElMessage.error("Predict chart initialization failed")
    }
  } else {
    console.error("Predict chart container not found")
  }
}

function initTopChartsData(value: number) {
  state.topDataCache = {}
  state.aiAnalysisSummary = ""

  getPopularBooksApi(value).then((response: ApiResponse) => {
    console.log("Raw API response:", response)

    if (!response) {
      console.error("No response from API")
      ElMessage.error("Get data failed, please check the network connection")
      return
    }

    // Handle both cases where data might be directly in response or in response.data
    const data = response.data || response
    console.log("Processed response data:", data)

    if (!data) {
      console.error("API returned empty data")
      ElMessage.error("Get data failed, return data is empty")
      return
    }

    state.topDataCache = data

    try {
      // Ensure existing chart is cleared before loading data
      if (myCharts[0]) {
        myCharts[0].dispose()
        // Reinitialize the chart
        const myChart = echarts.init(topTrendsChartRef.value)
        myCharts[0] = myChart as ChartInstance
      } else {
        // If the chart does not exist, initialize it
        initTopTrendsChart()
      }

      // Use chart data from backend if available
      if (data.chart_data && data.chart_data[state.currentKey]) {
        const chartData = data.chart_data[state.currentKey]
        if (state.currentKey === "bar_chart") {
          const option = {
            title: {
              text: chartData.title || "Popular Book Category Analysis",
              left: "center"
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "shadow"
              },
              formatter: chartData.tooltip_formatter || ((params: any) => {
                const data = params[0]
                return `${data.name}<br/><div style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></div>借阅次数: ${data.value}`
              })
            },
            grid: {
              left: "3%",
              right: "4%",
              bottom: "10%",
              containLabel: true
            },
            xAxis: {
              type: "category",
              data: chartData.xAxis.data || [],
              axisLabel: {
                interval: 0,
                rotate: 30,
                textStyle: {
                  fontSize: 12
                }
              }
            },
            yAxis: {
              type: "value",
              name: "Borrowing Count",
              nameTextStyle: {
                padding: [0, 0, 0, 40]
              }
            },
            series: chartData.series || []
          }
          if (myCharts[0]) {
            myCharts[0].setOption(option)
          } else {
            console.error("Chart instance not found")
          }
        } else if (state.currentKey === "pie_chart") {
          const option = {
            title: {
              text: chartData.title || "Book Category Borrowing Distribution",
              left: "center"
            },
            tooltip: {
              trigger: "item",
              formatter: chartData.tooltip_formatter || ((params: any) => {
                return `${params.name}<br/>Borrowing Count: ${params.value} (${params.percent}%)`
              })
            },
            legend: {
              type: "scroll",
              orient: "horizontal",
              bottom: 10,
              data: chartData.legend?.data || []
            },
            series: [{
              name: "Borrowing Count",
              type: "pie",
              radius: "55%",
              center: ["50%", "50%"],
              data: chartData.series[0].data,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)"
                }
              },
              label: {
                formatter: "{b}: {c} ({d}%)",
                fontSize: 14
              }
            }]
          }

          console.log("Setting pie chart with options:", option)
          if (myCharts[0]) {
            myCharts[0].setOption(option)
          } else {
            console.error("Pie chart instance not found")
          }
        }
      } else {
        // Fallback to processing raw data
        let categoryData = data.top_categories || []
        if (!Array.isArray(categoryData)) {
          console.error("Invalid category data format:", categoryData)
          ElMessage.error("Data format error: Invalid category data")
          return
        }

        if (categoryData.length === 0) {
          console.warn("No category data available")
          ElMessage.warning("No category data available")
          return
        }

        categoryData = categoryData
          .sort((a: any, b: any) => b.borrow_count - a.borrow_count)
          .slice(0, value)

        const categoryNames = categoryData.map((cat: any) => cat.category_name)
        const categoryValues = categoryData.map((cat: any) => cat.borrow_count)

        if (state.currentKey === "bar_chart") {
          const option = {
            title: {
              text: "Popular Book Category Analysis",
              left: "center"
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "shadow"
              },
              formatter(params: any) {
                const data = params[0]
                return `${data.name}<br/><div style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></div>借阅次数: ${data.value}`
              }
            },
            grid: {
              left: "3%",
              right: "4%",
              bottom: "10%",
              containLabel: true
            },
            xAxis: {
              type: "category",
              data: categoryNames,
              axisLabel: {
                interval: 0,
                rotate: 30,
                textStyle: {
                  fontSize: 12
                }
              }
            },
            yAxis: {
              type: "value",
              name: "Borrowing Count",
              nameTextStyle: {
                padding: [0, 0, 0, 40]
              }
            },
            series: [
              {
                type: "bar",
                barWidth: "60%",
                data: categoryValues,
                itemStyle: {
                  color(params: any) {
                    const colorList = [
                      "#5470c6",
                      "#91cc75",
                      "#fac858",
                      "#ee6666",
                      "#73c0de",
                      "#3ba272",
                      "#fc8452",
                      "#9a60b4",
                      "#ea7ccc"
                    ]
                    return colorList[params.dataIndex % colorList.length]
                  }
                },
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)"
                  }
                },
                label: {
                  show: true,
                  position: "top",
                  formatter: "{c}"
                }
              }
            ]
          }
          if (myCharts[0]) {
            myCharts[0].setOption(option)
          } else {
            console.error("Chart instance not found")
          }
        } else if (state.currentKey === "pie_chart") {
          const option = {
            title: {
              text: "Popular Book Category Analysis",
              left: "center"
            },
            tooltip: {
              trigger: "item",
              formatter(params: any) {
                return `${params.name}<br/>Borrowing Count: ${params.value} (${params.percent}%)`
              }
            },
            legend: {
              type: "scroll",
              orient: "horizontal",
              bottom: 0,
              data: categoryNames
            },
            series: [
              {
                name: "Borrowing Count",
                type: "pie",
                radius: "55%",
                center: ["50%", "50%"],
                data: categoryData.map((cat: any, index: number) => {
                  const colorList = [
                    "#5470c6",
                    "#91cc75",
                    "#fac858",
                    "#ee6666",
                    "#73c0de",
                    "#3ba272",
                    "#fc8452",
                    "#9a60b4",
                    "#ea7ccc"
                  ]
                  return {
                    name: cat.category_name,
                    value: cat.borrow_count,
                    itemStyle: {
                      color: colorList[index % colorList.length]
                    }
                  }
                }),
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)"
                  }
                },
                label: {
                  formatter: "{b}: {c} ({d}%)",
                  fontSize: 14
                }
              }
            ]
          }
          if (myCharts[0]) {
            myCharts[0].setOption(option)
          } else {
            console.error("Chart instance not found")
          }
        }
      }

      if (data.ai_summary) {
        state.aiAnalysisSummary = data.ai_summary.text || ""
      } else {
        state.aiAnalysisSummary = ""
      }
    } catch (error) {
      console.error("Error processing chart data:", error)
      ElMessage.error("Error processing chart data, please try again later")
    }
  }).catch((error) => {
    console.error("Failed to get popular data:", error)
    ElMessage.error("Get data failed, please try again later")
  })
}

function initPredicteChartsData() {
  const option = cloneDeep(LineOption)
  getPredictiveApi(state.future_days).then((response) => {
    // Ensure there is a response
    if (!response) {
      console.error("Predictive API has no response")
      ElMessage.error("Get predictive data failed, please check the network connection")
      return
    }

    // Handle different response formats
    const data = response.data || response
    console.log("Predictive API response:", data)

    if (!data) {
      console.error("Predictive API returned empty data")
      ElMessage.error("Get predictive data failed, return data is empty")
      return
    }

    try {
      if (data.chart_data && data.chart_data.forecast_bar) {
        const chartData = data.chart_data.forecast_bar
        option.title.text = chartData.title || "Predict Future Book Borrowing Count"
        option.xAxis.data = chartData.xAxis.data || []
        if (chartData.series && chartData.series.length > 0) {
          option.series = chartData.series.map((series: any) => ({
            ...series,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            lineStyle: {
              width: 3
            }
          }))
        } else {
          option.series = []
        }
        if (myCharts[1]) {
          myCharts[1].setOption(option)
        } else {
          console.error("Predictive chart instance does not exist")
        }
      }
      // Handle time_series data (add specific handling for this format)
      else if (data.chart_data && data.chart_data.time_series) {
        const timeSeriesData = data.chart_data.time_series
        option.title.text = timeSeriesData.title || "Predict Future Book Borrowing Count"

        // If you need to display all time axes, including historical data and predicted data
        if (state.future_days > 7) {
          option.xAxis.data = timeSeriesData.xAxis.data || []
          // Handle series data and ensure null value processing
          if (timeSeriesData.series && timeSeriesData.series.length > 0) {
            option.series = timeSeriesData.series.map((series: any) => {
              // Create a copy to avoid modifying the original data
              const formattedSeries = {
                ...series,
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 6,
                lineStyle: {
                  width: 3
                }
              }

              // Handle time series data containing null values
              if (Array.isArray(series.data)) {
                // Find the index of the first non-null value
                const firstValidIndex = series.data.findIndex((val: any) => val !== null)
                if (firstValidIndex !== -1) {
                  //
                  formattedSeries.data = series.data.slice(firstValidIndex)
                  //
                  option.xAxis.data = timeSeriesData.xAxis.data.slice(firstValidIndex)
                }
              }

              return formattedSeries
            })
          } else {
            option.series = []
          }
        } else {
          //
          //
          const dataLength = timeSeriesData.xAxis.data.length
          const startIndex = Math.max(0, dataLength - state.future_days)

          option.xAxis.data = timeSeriesData.xAxis.data.slice(startIndex)

          if (timeSeriesData.series && timeSeriesData.series.length > 0) {
            option.series = timeSeriesData.series.map((series: any) => ({
              ...series,
              type: "line",
              smooth: true,
              symbol: "circle",
              symbolSize: 6,
              data: Array.isArray(series.data) ? series.data.slice(startIndex).filter(item => item !== null) : [],
              lineStyle: {
                width: 3
              }
            }))
          } else {
            option.series = []
          }
        }

        if (myCharts[1]) {
          myCharts[1].setOption(option)
        } else {
          console.error("Predictive chart instance does not exist")
        }
      } else if (data.predicted_counts && Array.isArray(data.predicted_counts)) {
        const list = data.predicted_counts
        option.xAxis.data = data.future_dates || Array.from({ length: list.length }, (_, i) => `Day ${i + 1}`)
        option.series = [{
          name: "Predicted Borrowing Count",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: "#5470c6"
          },
          itemStyle: {
            color: "#5470c6"
          },
          data: list
        }]
        option.title.text = "Predict Future Book Borrowing Count"
        if (myCharts[1]) {
          myCharts[1].setOption(option)
        } else {
          console.error("Predictive chart instance does not exist")
        }
      } else {
        console.error("Unrecognized predictive data format:", data)
        ElMessage.error("Predictive data format is incorrect, cannot display chart")
      }
    } catch (error) {
      console.error("Error processing predictive data:", error)
      ElMessage.error("Error processing predictive data, please try again later")
    }
  }).catch((error) => {
    console.error("Get predictive data failed:", error)
    ElMessage.error("Get predictive data failed, please try again later")
  })
}

function handleChange(value: string) {
  state.currentKey = value
  // Wait for the next DOM update cycle to reinitialize the chart
  nextTick(() => {
    initTopChartsData(state.top_data)
  })
}

function getAiAnalysis() {
  state.aiLoading = true
  getPopularBooksApi(state.top_data, true).then((response) => {
    // Handle different response formats
    const data = response.data || response
    console.log("AI Analysis response:", data)

    if (data && data.ai_summary) {
      state.aiAnalysisSummary = data.ai_summary.text || ""
      state.showAiAnalysis = true
    } else {
      console.warn("No analysis result obtained", data)
      ElMessage.warning("No analysis result obtained")
    }
    state.aiLoading = false
  }).catch((error) => {
    console.error("Get analysis failed:", error)
    ElMessage.error("Get analysis failed")
    state.aiLoading = false
  })
}

function initEchartsResizeFun() {
  nextTick(() => {
    for (let i = 0; i < myCharts.length; i++) {
      if (myCharts[i]) {
        myCharts[i].resize()
      }
    }
  })
}
function initEchartsResize() {
  window.addEventListener("resize", initEchartsResizeFun)
}
watch(() => state.top_data, (newVal) => {
  initTopChartsData(newVal)
})

watch(() => state.future_days, (_newVal) => {
  initPredicteChartsData()
})

// Clean up function to remove event listeners
function cleanup() {
  window.removeEventListener("resize", initEchartsResizeFun)
  myCharts.forEach((chart) => {
    if (chart) {
      chart.dispose()
    }
  })
}

onMounted(() => {
  nextTick(() => {
    initTopTrendsChart()
    initPredictChart()
    initTopChartsData(state.top_data)
    initPredicteChartsData()
    initEchartsResize()
  })
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="app-container fullscreen">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Popular Book Category Analysis</span>
              <el-button
                :loading="state.aiLoading"
                type="primary"
                size="small"
                @click="getAiAnalysis"
              >
                Get Analysis
              </el-button>
            </div>
          </template>
          <el-form :inline="true">
            <el-form-item label="Display Type">
              <el-select v-model="state.currentKey" style="width: 180px;" @change="handleChange">
                <el-option label="Bar Chart" value="bar_chart" />
                <el-option label="Pie Chart" value="pie_chart" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-collapse-transition>
            <div v-if="state.showAiAnalysis && state.aiAnalysisSummary">
              <el-alert
                type="success"
                :closable="false"
                show-icon
              >
                <template #title>
                  <div class="ai-analysis">
                    <strong>Analysis Result:</strong> {{ state.aiAnalysisSummary }}
                    <el-button type="text" @click="state.showAiAnalysis = false">
                      Hide
                    </el-button>
                  </div>
                </template>
              </el-alert>
            </div>
          </el-collapse-transition>

          <div class="chart-container" ref="topTrendsChartRef" />
        </el-card>
      </el-col>

      <el-col :span="24" style="margin-top: 20px;">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Book Borrowing Trend Prediction</span>
            </div>
          </template>
          <el-form :inline="true">
            <el-form-item label="Predict Days">
              <el-select v-model="state.future_days" style="width: 180px;">
                <el-option label="7 Days" :value="7" />
                <el-option label="15 Days" :value="15" />
                <el-option label="30 Days" :value="30" />
                <el-option label="60 Days" :value="60" />
                <el-option label="90 Days" :value="90" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="chart-container" ref="predicteRef" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.fullscreen {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 20px;
}

.chart-container {
  width: 100%;
  height: 500px;
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 100%;
  margin-bottom: 20px;
}

.ai-analysis {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
