import { historyKeyType, dataKindType, matchRuleType } from "./type";
export const initSeparator: {
  rowSepa: string; //行分隔符
  columnSepa: string; //列分隔符
} = {
  rowSepa: "[\n|\r]",
  columnSepa: "\t",
};
export const keyOfHistory: string = "arrHistoryKey";
export const initPlaceHolder: string = "当前值：";
export const initMatchRules: Array<matchRuleType> = [
  { key: "nm", isNeed: false, dataKindIndex: 0 },
  { key: "Abs", isNeed: true, dataKindIndex: 0 },
];
export const initHistory: Array<historyKeyType> = [
  {
    isEmptyColumn: false,
    arrOfKey: [
      {
        isNeed: false,
        key: "nm",
        dataKindIndex: 0,
      },
      {
        isNeed: true,
        key: "Abs",
        dataKindIndex: 0,
      },
    ],
    columnSepara: "\t",
    lastTime: 100,
    useCount: 0,
    keyName: "吸光度-波长",
    isFilFirst: false,
  },
  {
    isEmptyColumn: false,
    arrOfKey: [
      {
        isNeed: false,
        key: "Peak #",
        dataKindIndex: 0,
      },
      {
        isNeed: false,
        key: "Start (nm)",
        dataKindIndex: 0,
      },
      {
        isNeed: true,
        key: "Apex (nm)",
        dataKindIndex: 0,
      },
      {
        isNeed: false,
        key: "End (nm)",
        dataKindIndex: 0,
      },
      {
        isNeed: true,
        key: "Height (Abs)",
        dataKindIndex: 0,
      },
      {
        isNeed: false,
        key: "Valley (nm)",
        dataKindIndex: 0,
      },
      {
        isNeed: false,
        key: "Valley (Abs)",
        dataKindIndex: 0,
      },
    ],
    columnSepara: "\t",
    lastTime: 99,
    useCount: 0,
    keyName: "峰值吸光度-峰值波长",
    isFilFirst: true,
  },
  {
    columnSepara: ",",
    isEmptyColumn: false,
    arrOfKey: [
      {
        isNeed: true,
        dataKindIndex: 0,
        key: "Potential/V",
      },
      {
        isNeed: false,
        dataKindIndex: 2,
        key: "Current/A",
      },
      {
        isNeed: true,
        dataKindIndex: 2,
        key: "log(i/A)",
      },
    ],
    lastTime: 98,
    useCount: 0,
    isFilFirst: true,
    keyName: "极化曲线 E-lgI",
  },
  {
    columnSepara: ",",
    isEmptyColumn: false,
    arrOfKey: [
      {
        isNeed: false,
        dataKindIndex: 2,
        key: "Time/sec",
      },
      {
        isNeed: true,
        dataKindIndex: 2,
        key: "Potential/V",
      },
    ],
    lastTime: 97,
    useCount: 0,
    isFilFirst: false,
    keyName: "时间-开路电位",
  },
  {
    columnSepara: ",",
    isEmptyColumn: false,
    arrOfKey: [
      {
        isNeed: true,
        dataKindIndex: 2,
        key: "Freq/Hz",
      },
      {
        isNeed: true,
        dataKindIndex: 2,
        key: "Z'/ohm",
      },
      {
        isNeed: true,
        dataKindIndex: 2,
        key: 'Z"/ohm',
      },
      {
        isNeed: false,
        dataKindIndex: 2,
        key: "Z/ohm",
      },
      {
        isNeed: false,
        dataKindIndex: 0,
        key: "Phase/deg",
      },
    ],
    lastTime: 96,
    useCount: 0,
    isFilFirst: true,
    keyName: "阻抗拟合数据",
  },
];
export const initDataKinds: Array<dataKindType> = [
  {
    text: "数字",
    reg: /^[\-|\+]{0,1}[\d]+[\.]{0,1}[\d]*$/,
    parseFun: (s: string) => (Number.isNaN(Number(s)) ? s : Number(s)),
  },
  {
    text: "百分数",
    reg: /^[\-|\+]{0,1}[\d]+[\.]{0,1}[\d]*%$/,
    parseFun: (s: string) =>
      Number.isNaN(Number(s.replace(/%$/, "")))
        ? s
        : Number(s.replace(/%$/, "")) / 100,
  },
  {
    text: "科学计数法",
    reg: /^[\-|\+]{0,1}[\d]+[\.]{0,1}[\d]*[e|E][\-|\+]{0,1}[\d]+[\.]{0,1}[\d]*$/,
    parseFun: (s: string) => (Number.isNaN(Number(s)) ? s : Number(s)),
  },
  {
    text: "任意字符",
    reg: /[^\s]+/,
    parseFun: (s: string) => (Number.isNaN(Number(s)) ? s : Number(s)),
  },
];
export const initEncodes: Array<string> = ["GBK", "ASCII", "Unicode", "UTF-8"];
export const initSortWays: Array<{
  text: string;
  fun: (file1: File, file2: File) => number;
}> = [
  {
    text: "按时间排序",
    fun: (file1: File, file2: File) => {
      return file1.lastModified - file2.lastModified;
    },
  },
];
