export const KEYMAP = {
  KEY_A: "A",
  KEY_D: "D",
  KEY_S: "S",
  KEY_R: "R",
  KEY_T: "T",
  KEY_N: "N",
  CTRL: "Ctrl",
  ALT: "Alt",
  NUM_1: ["num1", "1"],
  NUM_2: ["num2", "2"],
};

export function combineKey(...keys: string[]) {
  let _keys: string[] = [];

  keys.map((v) => {
    if (Array.isArray(v)) {
      _keys.push(`${v[0]}Or${v[1]}`);
    } else {
      _keys.push(v);
    }
  });

  return _keys.flat(1).join("+");
}
