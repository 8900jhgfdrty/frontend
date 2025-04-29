export function getAxisData(list: any[], key: string): string[] {
  return list.map(l => l[key])
}

export function getLineSeriesData(list: any[], excludeKey: string): any[] {
  if (!list || list.length === 0) {
    return []
  }

  const item = list[0] ?? {}
  return Object.keys(item)
    .filter(key => key !== excludeKey)
    .map((bookName) => {
      return {
        name: bookName,
        type: "line",
        stack: "Total",
        data: list.map(l => l[bookName])
      }
    })
}

export function getObjectAxisData(dataobj: Record<string, any>): string[] {
  return Object.keys(dataobj)
}

export function getObjectSeriesData(dataObj: any[], key: string): any[] {
  if (!Array.isArray(dataObj)) {
    return []
  }
  return dataObj.map(item => item[key] || 0)
}
