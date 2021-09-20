export type listType = {
  [key: string]: string;
};
export type sheetType = {
  [key: string]: { t: "s" | "n"; v: string | number };
};
export type mergeRuleType = "完全合并" | "按文件分开合并" | "我都要";
export type svalueType_Type =
  | { type: "数字" }
  | { type: "字符" }
  | { type: "百分数" };
export type partFilterType = {
  mergeRule?: mergeRuleType;
  fileSuffix?: string;
  needAddTitleAuto?: boolean;
  rowTitle?: Array<string>;
  columnTitle?: Array<string>;
  valueType?: Array<svalueType_Type>;
  rowSeparator?: string;
  columnSeparator?: string;
};
export type filterType = {
  mergeRule: mergeRuleType;
  fileSuffix: string;
  needAddTitleAuto: boolean;
  rowTitle: Array<string>;
  columnTitle: Array<string>;
  valueType: Array<svalueType_Type>;
  rowSeparator?: string;
  columnSeparator?: string;
};
export type jsonType = {
  row: number;
  column: number;
  [key: string]: string | number;
};
export type valueType_Type = "number" | "string" | "percent";
export type keyType = { key: string; valueType: valueType_Type };
export type filtersType = Array<filterType>;

export type tablePropsType = {
  arrOfArrJson: Array<Array<jsonType>>;
};
