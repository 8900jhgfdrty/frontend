import type { Directive } from "vue"

export {}

// custom directives registered with app.directive need to be declared here to get type hints
declare module "vue" {
  export interface ComponentCustomProperties {
    vPermission: Directive<Element, string[]>
  }
}
