import type { MenuItemConstructorOptions } from 'electron'
import { Menu } from 'electron'

export interface MenuOptions {
  enable: boolean
  registerAccelerator: boolean
}

export interface MenuTemplateClick {
  (
    menuItem: Electron.MenuItem,
    browserWindow: Electron.BrowserWindow | undefined,
    event: Electron.KeyboardEvent
  ): void
}

export type MenuTypes =
  | 'normal'
  | 'separator'
  | 'submenu'
  | 'checkbox'
  | 'radio'
  | undefined

export interface MenuTemplate {
  id?: string
  label: string
  accelerator?: string
  registerAccelerator?: boolean
  enable?: boolean
  checked?: boolean
  type?: MenuTypes
  submenu?: MenuTemplate[]
  click?: MenuTemplateClick
}

function calcTemplateType(template: MenuTemplate): MenuTypes {
  const submenu = template.submenu

  if (submenu && submenu.length > 0)
    return 'submenu'

  if (template.type)
    return template.type

  return 'normal'
}

function transformTemplate2MenuItemConstructorOptions(
  template: MenuTemplate,
  options: MenuOptions = { enable: false, registerAccelerator: false },
): MenuItemConstructorOptions {
  const submenu = template.submenu
    ? template.submenu.map((menu) => {
      return transformTemplate2MenuItemConstructorOptions(menu, {
        enable: template.enable ? template.enable : options.enable,
        registerAccelerator: !!template.registerAccelerator,
      })
    })
    : undefined

  return {
    id: template.id,
    label: template.label,
    accelerator: template.accelerator,
    registerAccelerator: template.registerAccelerator,
    enabled: template.enable ? template.enable : options.enable,
    submenu,
    checked: template.checked,
    type: calcTemplateType(template),
    click: template.click,
  }
}

export function buildFromTemplateWrapper(
  templates: MenuTemplate[],
  options: MenuOptions = { registerAccelerator: false, enable: true },
) {
  const menus: MenuItemConstructorOptions[] = []

  menus.push(
    ...templates.map(template =>
      transformTemplate2MenuItemConstructorOptions(
        {
          id: template.id,
          label: template.label,
          registerAccelerator: template.registerAccelerator
            ? template.registerAccelerator
            : options.registerAccelerator,
          enable: template.enable ? template.enable : options.enable,
          checked: template.checked,
          type: template.type,
          click: template.click,
          submenu: template.submenu,
        },
        options,
      ),
    ),
  )

  return Menu.buildFromTemplate(menus)
}

export function hookWindowMenuClick(
  templates: MenuTemplate[],
  wrapper: MenuTemplateClick,
) {
  return templates.map((template) => {
    if (template.click) {
      const click = template.click
      template.click = (item, window, event) => {
        click?.(item, window, event)
        setTimeout(() => wrapper?.(item, window, event))
      }
    }
    template.submenu = template.submenu
      ? hookWindowMenuClick(template.submenu, wrapper)
      : undefined
    return template
  })
}
