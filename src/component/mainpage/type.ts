export type listType = {
  [key: string]: string;
};
export type sheetType = {
  [key: string]: { t: "s" | "n"; v: string | number };
};
export type jsonType = {
  row: number;
  column: number;
  [key: string]: string | number;
};
export type dataType = {
  row: number;
  column: number;
  [key: string]: string | number;
};
export type possibleKeyType = {
  isEmptyColumn: boolean;
  arrOfKey: Array<matchRuleType>;
  columnSepara: string;
};
export type dataKindType = {
  text: string;
  reg: RegExp;
  parseFun: (s: string) => number | string;
};
export type matchRuleType = {
  key: string;
  isNeed: boolean;
  dataKindIndex: number;
};
export type historyKeyType = {
  isEmptyColumn: boolean;
  arrOfKey: Array<matchRuleType>;
  columnSepara: string;
  keyName?: string;
  lastTime: number;
  useCount: number;
  isFilFirst: boolean;
  [key: string]: any;
};
export type matchDataType = {
  columnSepara: string;
  rowSepara: string;
  dataKinds: Array<dataKindType>;
  needFilFirst: boolean;
  matchRules: Array<matchRuleType>;
  isMatchData: boolean;
};
export type allDataType = {
  fileData: {
    fileList: Array<File>;
    fileSuffix: string;
    codeFormat: string;
  };
  matchData: matchDataType;
  turnData?: {
    extraName?: string;
    // historyMatchRules:Array<historyMatchRuleType>
  };
};
// export type successMessType = {
//     records:Array<string>,
//     historyMatchRules:Array<historyMatchRuleType>,

// }
// export type failMessType = {
//     message:string,
//     duration?:number|null,
//     top?:number,
//     placement?:string,
//     style?:React.CSSProperties
// }
