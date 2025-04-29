import type { App } from "vue"
import VXETable from "vxe-table" // https://vxetable.cn/#/start/install

// Global default settings
VXETable.setConfig({
  // Global size
  size: "medium",
  // Global starting zIndex; if the project's z-index styles are large, increase this to avoid being covered
  zIndex: 9999,
  // Version number; used for features with data caching—incrementing can reset cached data
  version: 0,
  // Global loading text; if null, no text is displayed
  loadingText: null,
  table: {
    showHeader: true,
    showOverflow: "tooltip",
    showHeaderOverflow: "tooltip",
    autoResize: true,
    // stripe: false,
    border: "inner",
    // round: false,
    emptyText: "No data available",
    rowConfig: {
      isHover: true,
      isCurrent: true,
      // Unique primary key field name for row data
      keyField: "_VXE_ID"
    },
    columnConfig: {
      resizable: false
    },
    align: "center",
    headerAlign: "center"
  },
  pager: {
    // size: "medium",
    // Corresponding style
    perfect: false,
    pageSize: 10,
    pagerCount: 7,
    pageSizes: [10, 20, 50],
    layouts: ["Total", "PrevJump", "PrevPage", "Number", "NextPage", "NextJump", "Sizes", "FullJump"]
  },
  modal: {
    minWidth: 500,
    minHeight: 400,
    lockView: true,
    mask: true,
    // duration: 3000,
    // marginSize: 20,
    dblclickZoom: false,
    showTitleOverflow: true,
    transfer: true,
    draggable: false
  }
})

export function installVxeTable(app: App) {
  // Full import of Vxe Table component
  app.use(VXETable)
}
