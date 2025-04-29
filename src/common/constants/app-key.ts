/** Device types */
export enum DeviceEnum {
  Mobile,
  Desktop
}

/** Layout modes */
export enum LayoutModeEnum {
  Left = "left",
  Top = "top",
  LeftTop = "left-top"
}

/** Sidebar opened state constant */
export const SIDEBAR_OPENED = "opened"

/** Sidebar closed state constant */
export const SIDEBAR_CLOSED = "closed"

export type SidebarOpened = typeof SIDEBAR_OPENED
export type SidebarClosed = typeof SIDEBAR_CLOSED
