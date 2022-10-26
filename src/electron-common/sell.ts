export interface SellOptions {
  buildMaterial: boolean
  rareEquip: boolean
  black: Array<string | RegExp>
  white: Array<string | RegExp>
  equipWhite: Array<string | RegExp>
}
