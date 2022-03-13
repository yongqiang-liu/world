import { Menu } from "electron";
import MainWidow from "./windows";

export interface MenuOptions {
  enable: boolean;
  registerAccelerator: boolean;
}

function lowerFunction(
  window: MainWidow,
  options: MenuOptions
): Electron.MenuItemConstructorOptions[] {
  const menu: Electron.MenuItemConstructorOptions[] = [
    {
      label: "自动日常",
      type: 'checkbox',
    }
  ];

  return menu;
}

function quickFunction(
  window: MainWidow,
  options: MenuOptions
): Electron.MenuItemConstructorOptions {
  const menu: Electron.MenuItemConstructorOptions = {};

  return menu;
}

export function setupMenu(
  window: MainWidow,
  options: MenuOptions = { enable: false, registerAccelerator: false }
) {
  const menu = Menu.buildFromTemplate([
    ...lowerFunction(window, options),
    quickFunction(window, options),
  ]);

  window.setMenu(menu);
}
