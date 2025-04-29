export interface IDimensionOption {
  value: string
  label: string
}

export interface ILineChartOption {
  title: {
    text: string
    left?: string
  }
  tooltip: {
    trigger: string
  }
  legend: {
    type: string
    orient: string
    bottom: number
    data: any[]
  }
  grid: {
    left: string
    right: string
    bottom: string
    top?: string
    containLabel: boolean
  }
  toolbox: {
    feature: {
      saveAsImage: Record<string, any>
    }
  }
  xAxis: {
    type: string
    boundaryGap: boolean
    data: any[]
    axisLabel?: {
      interval: number
      rotate: number
      textStyle?: {
        fontSize: number
      }
    }
  }
  yAxis: {
    type: string
    name?: string
    nameTextStyle?: {
      padding?: number[]
    }
  }
  series: any[]
}

export const LineOption: ILineChartOption = {
  title: {
    text: "Book Borrowing Trend",
    left: "center"
  },
  tooltip: {
    trigger: "axis"
  },
  legend: {
    type: "scroll",
    orient: "horizontal",
    bottom: 10,
    data: []
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "15%",
    top: "10%",
    containLabel: true
  },
  toolbox: {
    feature: {
      saveAsImage: {}
    }
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: [],
    axisLabel: {
      interval: 0,
      rotate: 45,
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
  series: []
}
