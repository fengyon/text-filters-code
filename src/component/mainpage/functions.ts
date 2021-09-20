import {
  possibleKeyType,
  historyKeyType,
  dataKindType,
  matchRuleType,
  jsonType,
  dataType,
  matchDataType,
} from "./type";
import { initSeparator } from "./initParams";
import XLSX from "xlsx";
export const fileFilter = (
  fileList: FileList | null,
  tfileSuffix: string,
  sortWays: (a: File, b: File) => number = (a: File, b: File) =>
    a?.lastModified - b?.lastModified || 0
): Promise<Array<File>> => {
  if (tfileSuffix === ".*") {
    return new Promise((resolve) =>
      resolve(Array.from<File>(fileList || []).sort(sortWays))
    );
  }
  let fileListForFil: Array<File> = [];
  if (fileList && fileList?.length > 0) {
    for (let i = 0; i < fileList?.length; i++) {
      if (new RegExp(`${getTurnedStr(tfileSuffix)}\$`).test(fileList[i].name)) {
        fileListForFil.push(fileList[i]);
      }
    }
  }
  return new Promise((resolve) => resolve(fileListForFil.sort(sortWays)));
};
export const getPlaceFromCurrent = (str: string) => {
  return `${str}（当前值）`;
};
//生成正则来判断需转义
const getDiffFromNow = (time: number): string => {
  let diffSeconds = (new Date().getTime() - time) / 1000;
  let minutes = Math.floor(diffSeconds / 60);
  let seconds = diffSeconds - minutes * 60;
  if (minutes) {
    return minutes + "分" + seconds.toFixed(3) + "秒";
  } else {
    return seconds.toFixed(3) + "秒";
  }
};
export const getPossibleKeysFromText = (
  text: string,
  rowSe: string,
  dataKinds: Array<dataKindType>
): Promise<Array<possibleKeyType>> => {
  if (dataKinds.length - 2 > 0) {
    let regStr = dataKinds[dataKinds.length - 2].reg
      .toString()
      .replace(/^\/\^/, "(")
      .replace(/\$\/$/, ")");
    for (let i = dataKinds.length - 3; i > -1; i--) {
      regStr =
        regStr +
        "|" +
        dataKinds[i].reg.toString().replace(/^\/\^/, "(").replace(/\$\/$/, ")");
    }
    let possibleKey: Array<{
      startIndex: number;
      endIndex: number;
      startLine: string;
      columnSepara: string;
    }> = [];
    let startReg = new RegExp(`^(${regStr})`);
    // console.log(regStr)
    let lines: Array<string> = text
      .split(getRegFromSeperator(rowSe))
      .map((data) => data.replace(/^\s+/, ""));
    linesItreator: for (let i = 0; i < lines.length; i++) {
      let possibleRow: string = "";
      let strLine: string = lines[i];
      if (startReg.test(strLine)) {
        possibleRow = strLine
          .replace(startReg, "")
          .replace(/[+|-]{0,1}\d+.*$/, "");
        let columnSe: string = possibleRow
          .replace(/^[ ]{1,}/, "")
          .replace(/[ ]{1,}$/, "");
        //取代后面的数字
        if (possibleRow?.length > 0) {
          if (columnSe?.length < 1) {
            columnSe = " "; //此处有空格
          }
          if (possibleKey.length) {
            if (
              possibleKey[possibleKey.length - 1].endIndex === i &&
              possibleKey[possibleKey.length - 1].columnSepara === columnSe
            ) {
              possibleKey[possibleKey.length - 1].endIndex =
                possibleKey[possibleKey.length - 1].endIndex + 1;
            } else {
              possibleKey.push({
                startIndex: i,
                endIndex: i + 1,
                columnSepara: columnSe,
                startLine: lines[i],
              });
            }
          } else {
            possibleKey = [
              {
                startIndex: i,
                endIndex: i + 1,
                columnSepara: columnSe,
                startLine: lines[i],
              },
            ];
          }
        }
      }
      // console.log(arrOfLine,replaceCount)
    }
    if (possibleKey.length > 0) {
      let possibleKeysForRe: Array<possibleKeyType> = [];
      for (let i = 0; i < possibleKey.length; i++) {
        let splitReg = new RegExp(
          `[ ]{0,}${possibleKey[i].columnSepara}+[ ]{0,}`
        );
        let startArr: Array<number> = [];
        possibleKey[i].startLine.split(splitReg).forEach((res) => {
          if (res?.length > 0) {
            length++;
            for (let i = 0; i < dataKinds.length - 1; i++) {
              if (dataKinds[i]?.reg?.test(res)) {
                startArr.push(i);
                break;
              }
            }
          }
        });
        for (let j = possibleKey[i].startIndex - 1; j > -1; j--) {
          if (lines[j] && lines[j].length) {
            let arrStr: Array<string> = [];
            lines[j].split(splitReg).forEach((res) => {
              if (res?.length > 0) {
                arrStr.push(res);
              }
            });
            if (startArr.length === arrStr.length) {
              let keys: Array<matchRuleType> = [];
              for (let i = 0; i < startArr.length; i++) {
                keys.push({
                  isNeed: true,
                  dataKindIndex: startArr[i],
                  key: arrStr[i],
                });
              }
              if (keys.length > 1) {
                possibleKeysForRe.push({
                  isEmptyColumn: false,
                  arrOfKey: keys,
                  columnSepara: possibleKey[i].columnSepara,
                });
              }
            } else {
              break;
            }
          }
        }
        let keysForPush: Array<matchRuleType> = [];
        for (let i = 0; i < startArr.length; i++) {
          keysForPush.push({
            isNeed: true,
            dataKindIndex: startArr[i],
            key: "nm",
          });
        }
        if (keysForPush.length > 1) {
          possibleKeysForRe.push({
            isEmptyColumn: true,
            arrOfKey: keysForPush,
            columnSepara: possibleKey[i].columnSepara,
          });
        }
      }
      return new Promise((resolve) => resolve(possibleKeysForRe));
    } else {
      return new Promise((resolve) => resolve([]));
    }
  } else {
    return new Promise((resolve) => resolve([]));
  }
};
export const getSheetKeyFromRef = (ref: string): Array<string> => {
  //A-Z
  const arrCode: Array<string> = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  const len = arrCode.length;
  const start = "A".charCodeAt(0);
  const maxColumn = ref.replace(/^.*:/, "").replace(/\d+/, "");
  if (maxColumn.length > 1) {
    let arr: Array<string> = arrCode;
    digit: for (let i = 1; i < maxColumn.length; i++) {
      const currentLength: number = arr.length;
      for (let ti = Math.pow(len, i); ti > 0; ti--) {
        // arr.slice(arr.length - len, arr.length).forEach((res) => {
        for (let ii = 0; ii < len; ii++) {
          const column = `${arr[currentLength - ti]}${arrCode[ii]}`;
          arr.push(column);
          if (column == maxColumn) {
            // console.log(column)
            break digit;
          }
        }
      }
    }
    return arr;
  } else {
    return arrCode.slice(0, maxColumn.charCodeAt(0) - start + 1);
  }
};
export const getRegFromMatchRules = (
  matchRules: Array<matchRuleType>,
  columnSepara: string
): RegExp | null => {
  let reg: string = "";
  matchRules?.forEach((matchRule) => {
    if (matchRule?.key?.length) {
      let str: string = getTurnedStr(matchRule.key);
      if (reg.length > 0) {
        reg = `${reg}[ ]{0,}${getTurnedStr(columnSepara)}[ ]{0,}${str}`;
      } else {
        reg = str;
      }
    }
  });
  // console.log(reg)
  if (reg.length > 0) {
    // console.log(reg)
    try {
      return new RegExp(reg);
    } catch (err) {
      console.log(err);
      return null;
    }
  } else {
    return null;
  }
};
export const getRealLengthFromMaRules = (
  keys: Array<matchRuleType>,
  isEmptyColumn: boolean
): number => {
  let len: number = 0;
  if (isEmptyColumn) {
    keys.forEach((res: matchRuleType) => {
      if (res.isNeed) {
        len++;
      }
    });
  } else {
    keys.forEach((res: matchRuleType) => {
      if (res.key?.length > 0 && res.isNeed) {
        len++;
      }
    });
  }
  return len;
};
export const getNameFromSepa = (separator: string): string => {
  return separator === " " ? "空格" : separator === "\t" ? "制表符" : separator;
};
const getTurnedStr = (strForTurn: string): string => {
  let strTurned: string = "";
  for (let i = 0; i < strForTurn?.length; i++) {
    let code: string = strForTurn?.charAt(i) || "";
    if (/[^A-Za-z0-9\u4e00-\u9fa5]/.test(code)) {
      strTurned = `${strTurned}\\${code}`;
    } else {
      strTurned = strTurned + code;
    }
  }
  return strTurned;
};
export const getRegFromSeperator = (seperatorStr: string): RegExp => {
  if (seperatorStr === initSeparator.rowSepa) {
    return new RegExp(`${seperatorStr}+`);
  }
  if (/^[ ]+$/.test(seperatorStr)) {
    return new RegExp("[ ]+");
  } else {
    return new RegExp(`[ ]{0,}${getTurnedStr(seperatorStr)}[ ]{0,}`);
  }
};
const isSame = (key1: historyKeyType, key2: historyKeyType): boolean => {
  let keysOfObj: Array<string> = Object.keys(key1) || [];
  if (key1.isEmptyColumn !== key2.isEmptyColumn) {
    return false;
  } else {
    if (key1.isEmptyColumn) {
      for (let i = 0; i < keysOfObj.length; i++) {
        let keyOfObj: string = keysOfObj[i];
        if (
          keyOfObj === "keyName" ||
          keyOfObj === "lastTime" ||
          keyOfObj === "useCount" ||
          keyOfObj === "isFilFirst"
        ) {
        } else if (keyOfObj === "arrOfKey") {
          if (key1.arrOfKey.length === key2.arrOfKey.length) {
            for (let j = 0; j < key1.arrOfKey.length; j++) {
              let ttarr: Array<string> = Object.keys(key1.arrOfKey[j]);
              for (let k = 0; k < ttarr.length; k++) {
                if (ttarr[k] !== "key") {
                  if (
                    key1.arrOfKey[j][`${ttarr[k]}`] !==
                    key2.arrOfKey[j][`${ttarr[k]}`]
                  ) {
                    // console.log(key1.arrOfKey[j][`${ttarr[k]}`], key2.arrOfKey[j][`${ttarr[k]}`])
                    return false;
                  }
                }
              }
            }
          } else {
            console.log(key1.arrOfKey.length, key2.arrOfKey.length);
            return false;
          }
        } else {
          if (key1[`${keyOfObj}`] != key2[`${keyOfObj}`]) {
            console.log(key1[`${keyOfObj}`], key2[`${keyOfObj}`]);
            return false;
          }
        }
      }
    } else {
      for (let i = 0; i < keysOfObj.length; i++) {
        let keyOfObj: string = keysOfObj[i];
        if (
          keyOfObj === "keyName" ||
          keyOfObj === "lastTime" ||
          keyOfObj === "useCount" ||
          keyOfObj === "isFilFirst"
        ) {
        } else if (keyOfObj === "arrOfKey") {
          if (key1.arrOfKey.length === key2.arrOfKey.length) {
            for (let j = 0; j < key1.arrOfKey.length; j++) {
              let ttarr: Array<any> = Object.keys(key1.arrOfKey[j]);
              for (let k = 0; k < ttarr.length; k++) {
                if (
                  key1.arrOfKey[j][`${ttarr[k]}`] !==
                  key2.arrOfKey[j][`${ttarr[k]}`]
                ) {
                  // console.log(key1.arrOfKey[j][`${ttarr[k]}`], key2.arrOfKey[j][`${ttarr[k]}`])
                  return false;
                }
              }
            }
          } else {
            console.log(key1.arrOfKey.length, key2.arrOfKey.length);
            return false;
          }
        } else {
          if (key1[`${keyOfObj}`] != key2[`${keyOfObj}`]) {
            console.log(key1[`${keyOfObj}`], key2[`${keyOfObj}`]);
            return false;
          }
        }
      }
    }
  }
  return true;
};
const sortByIndex = (
  json1: {
    index: number;
    json: Array<jsonType>;
  },
  json2: {
    index: number;
    json: Array<jsonType>;
  }
): number => {
  return json1.index - json2.index;
};
export const checkData = (
  arrForCheck: Array<jsonType>,
  startIndex: number = 0
): boolean => {
  for (let i = startIndex; i < arrForCheck.length - 1; i++) {
    if (
      (arrForCheck[i + 1].column - arrForCheck[i].column !== 1 ||
        arrForCheck[i + 1].row !== arrForCheck[i].row) &&
      (arrForCheck[i + 1].row - arrForCheck[i].row < 0 ||
        arrForCheck[i + 1].column !== 0)
    ) {
      throw new Error(`${Object.keys(arrForCheck[0])}数据丢失或顺序出错`);
    }
  }
  return true;
};
export const getNeedJson = (
  jsonForSort: Array<{
    index: number;
    json: Array<jsonType>;
    fileName: string;
  }>
): Promise<{
  arrJson: Array<jsonType>;
  records: Array<string>;
}> => {
  let maxLength: number = 0;
  let json: Array<jsonType> = [];
  let records: Array<string> = [];
  jsonForSort.sort(sortByIndex);
  jsonForSort.forEach((res, index) => {
    if (checkData(res.json)) {
      if (index > 0 && res.index <= jsonForSort[index - 1].index) {
        throw new Error(`${res.fileName}顺序出错`);
      }
      if (res.json.length > maxLength) {
        maxLength = res.json.length;
      }
      records.push(`${index + 1}：${res.fileName}`);
    }
  });
  for (let i = 0; i < maxLength; i++) {
    let obj: any = {};
    for (let ti = 0; ti < jsonForSort.length; ti++) {
      if (i < jsonForSort[ti].json.length) {
        obj = {
          ...obj,
          ...jsonForSort[ti].json[i],
        };
      } else {
        Object.keys(jsonForSort[ti].json[0]).forEach((res) => {
          if (res !== "column" && res !== "row") {
            obj[`${res}`] = undefined;
          }
        });
      }
    }
    if (Object.keys(obj).length > 0) {
      delete obj["row"];
      delete obj["column"];
      json.push(obj);
    }
  }
  return new Promise((resolve) => resolve({ arrJson: json, records: records }));
};
export const getMessFromNumber = (num: number): string => {
  num = Math.floor(num);
  if (num > 99999999) {
    //一亿
    return (num / 100000000).toFixed(3) + "亿";
  } else if (num > 999999) {
    return (num / 1000000).toFixed(3) + "百万";
  } else if (num > 9999) {
    return (num / 10000).toFixed(3) + "万";
  } else {
    return num.toString();
  }
};
export const getNewMatchRules = (
  currentRules: Array<matchRuleType>,
  setRule: {
    ruleIndex: number;
    key?: string;
    dataKindIndex?: number;
    isAutoAdd?: boolean;
  }
): Promise<Array<matchRuleType>> => {
  return new Promise((resolve) => {
    if (setRule?.ruleIndex > -1 && setRule?.ruleIndex < currentRules.length) {
      if (setRule.key) {
        currentRules[setRule?.ruleIndex].key = setRule.key;
      }
      if (setRule?.dataKindIndex === 0 || setRule?.dataKindIndex) {
        currentRules[setRule?.ruleIndex].dataKindIndex = setRule.dataKindIndex;
      }
    }
    if (setRule?.isAutoAdd && setRule.ruleIndex === currentRules?.length - 1) {
      currentRules.push({
        key: "",
        isNeed: true,
        dataKindIndex: 0,
      });
    }
    resolve(currentRules);
  });
};
export const addHistory = (
  arrHis: Array<historyKeyType>,
  hisKey: historyKeyType
): Promise<Array<historyKeyType>> => {
  let sameIndex = -1;
  for (let i = 0; i < arrHis.length; i++) {
    if (isSame(hisKey, arrHis[i])) {
      sameIndex = i;
      break;
    }
  }
  if (sameIndex > -1) {
    if (hisKey.keyName && hisKey.keyName.length > 0) {
      arrHis[sameIndex].keyName = hisKey.keyName;
    }
    arrHis[sameIndex].lastTime = hisKey.lastTime;
    if (arrHis[sameIndex].useCount < 1000) {
      arrHis[sameIndex].useCount = arrHis[sameIndex].useCount + 1;
    }
    arrHis[sameIndex].isFilFirst = hisKey.isFilFirst;
  } else {
    arrHis.push(hisKey);
  }
  //30天内按使用次数排序，30天外按历史排序
  arrHis.sort((a, b) =>
    Math.abs(b.lastTime - a.lastTime) < 259200000
      ? b.useCount - a.useCount || b.lastTime - a.lastTime
      : b.lastTime - a.lastTime
  );
  if (arrHis.length > 70) {
    arrHis = arrHis.slice(0, 50);
  }
  // console.log(arrHis)
  return new Promise((resolve) => resolve(arrHis));
};
export const getBrowerName = (): string => {
  const { userAgent } = navigator; //取得浏览器的userAgent字符串
  let isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
  let isIE =
    userAgent.indexOf("compatible") > -1 &&
    userAgent.indexOf("MSIE") > -1 &&
    !isOpera; //判断是否IE浏览器
  let isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
  var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
  var isSafari =
    userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
  var isChrome =
    userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器
  console.log(userAgent);
  if (isIE) {
    var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
    reIE.test(userAgent);
    var fIEVersion = parseFloat(RegExp["$1"]);
    if (fIEVersion == 7) {
      return "IE7";
    } else if (fIEVersion == 8) {
      return "IE8";
    } else if (fIEVersion == 9) {
      return "IE9";
    } else if (fIEVersion == 10) {
      return "IE10";
    } else if (fIEVersion == 11) {
      return "IE11";
    } else {
      return "IE";
    } //IE版本过低
  }
  if (isOpera) {
    return "Opera";
  }
  if (isEdge) {
    return "Edge";
  }
  if (isFF) {
    return "FireFox";
  }
  if (isSafari) {
    return "Safari";
  }
  if (isChrome) {
    return "Chrome";
  }
  return "";
};
export const getIsIE = (): boolean => {
  const { userAgent } = window.navigator; //取得浏览器的userAgent字符串
  if (/Opera/i.test(userAgent)) {
    return false;
  } else if (/compatible/i.test(userAgent) && /MSIE/i.test(userAgent)) {
    return true;
  } else if (
    /Edge/i.test(userAgent) ||
    "ActiveXObject" in window ||
    window.ActiveXObject
  ) {
    return true;
  } else {
    return false;
  }
};
const getArrDataFromText = (
  textInfo: { textName: string; text: string; textNumber?: number },
  matchData: matchDataType,
  setLoadingMessage: (s: string) => void
): Promise<Array<dataType>> => {
  return new Promise((resolve) => {
    const name = textInfo.textName;
    // console.log(name)
    const { text } = textInfo;
    let textNumber: number = textInfo?.textNumber || 1;
    const {
      columnSepara,
      rowSepara,
      dataKinds,
      needFilFirst,
      matchRules,
      isMatchData,
    } = matchData;
    let arrJson: Array<dataType> = [];
    let lines: Array<string> = text.split(getRegFromSeperator(rowSepara));
    let dataLines: Array<string> | null = null;
    setLoadingMessage(`读取${name}中...`);
    if (isMatchData) {
      dataLines: for (let i = 0; i < lines.length; i++) {
        let tarrData = lines[i].split(getRegFromSeperator(columnSepara));
        // console.log(tarrData)
        let arrData: Array<string> = [];
        tarrData.forEach((res: string) => {
          let sforp: string = res?.trim() || "";
          if (sforp.length > 0) {
            arrData.push(res);
          }
        });
        // console.log(arrData)
        if (arrData.length > matchRules?.length) {
        } else {
          let isWill: boolean = true;
          for (let ti = 0; ti < matchRules?.length; ti++) {
            if (
              !dataKinds[matchRules[ti]?.dataKindIndex]?.reg.test(arrData[ti])
            ) {
              isWill = false;
            }
            if (isWill) {
              dataLines = lines.slice(i, lines.length);
              // console.log(dataLines)
              break dataLines;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < lines.length - 1; i++) {
        if (getRegFromMatchRules(matchRules, columnSepara)?.test(lines[i])) {
          let tarrData = lines[i + 1].split(getRegFromSeperator(columnSepara));
          let arrData: Array<string> = [];
          let isWill: boolean = true;
          tarrData.forEach((res: string) => {
            let sforp: string = res?.trim() || "";
            if (sforp.length > 0) {
              arrData.push(res);
            }
          });
          // console.log(arrData)
          for (let ti = 0; ti < matchRules?.length; ti++) {
            if (matchRules[ti].key?.length < 1) {
              continue;
            }
            if (arrData[ti]?.length > 0) {
              if (
                !dataKinds[matchRules[ti].dataKindIndex]?.reg.test(arrData[ti])
              ) {
                isWill = false;
              }
            } else {
              isWill = false;
            }
          }
          if (isWill) {
            //跳过第一行，第一行是列名
            dataLines =
              i === lines.length - 1 ? null : lines?.slice(i + 1, lines.length);
            lines = [];
            break;
          }
        }
      }
    }
    // console.log(dataLines)
    if (dataLines?.length) {
      let canSet: boolean = true;
      dataLines: for (let index = 0; index < dataLines.length; index++) {
        // console.log(res)
        const res = dataLines[index];
        if (res?.length > 0) {
          let datas: Array<string> = res.split(
            getRegFromSeperator(columnSepara)
          );
          let obj: any | null = {};
          // console.log(datas)
          keys: for (let i = 0; i < matchRules.length; i++) {
            if (matchRules[i].key?.length === 0 && !isMatchData) {
              // console.log(`第${i}个结束`)
              continue keys;
            }
            let dataI: string = datas[i]?.trim() || "";
            if (dataI?.length > 0) {
              if (dataKinds[matchRules[i].dataKindIndex]?.reg.test(dataI)) {
                if (
                  matchRules[i].isNeed ||
                  (textNumber === 1 && !needFilFirst)
                ) {
                  obj[`${name}-列${i + 1}`] = dataKinds[
                    matchRules[i].dataKindIndex
                  ].parseFun(dataI);
                  obj["row"] = i;
                  obj["column"] = index;
                }
              } else {
                obj = null;
                break dataLines;
              }
            } else if (isMatchData) {
              obj = null;
              break keys;
            }
          }
          if (obj && Object.keys(obj)?.length > 0) {
            obj["row"] = textNumber;
            obj["column"] = index;
            if (canSet && !isMatchData) {
              let ttobj: any = {};
              matchRules.forEach((matchRule: matchRuleType, i: number) => {
                if (matchRule.key?.length > 0) {
                  if (matchRule.isNeed || (textNumber === 1 && !needFilFirst)) {
                    ttobj[`${name}-列${i + 1}`] = matchRule.key;
                    ttobj["row"] = textNumber;
                    ttobj["column"] = 0;
                  }
                }
              });
              obj["row"] = textNumber;
              obj["column"] = index;
              arrJson.push(ttobj);
              arrJson.push(obj);
              canSet = false;
            } else {
              obj["row"] = textNumber;
              obj["column"] = isMatchData ? index - 1 : index;
              arrJson.push(obj);
            }
          }
        }
      }
    }
    if (arrJson.length > 0) {
      resolve(arrJson);
    } else {
      resolve([]);
    }
  });
};
const getNeedSheet = (
  sheet: XLSX.WorkSheet,
  fileLength: number,
  columnOfOneFile: number,
  isNeedMerge: boolean
): Promise<XLSX.WorkSheet> => {
  return new Promise((resolve) => {
    let merge: Array<any> = [];
    let sheetKeys: Array<string> = getSheetKeyFromRef(sheet["!ref"] || "A");
    let sameStart: boolean = true;
    let startString: string = sheet["A1"].v.split("/")[0] || "";
    let arr = sheet["A1"].v.replace(/\-[列]\d+$/, "").split(".");
    let endString: string = arr[arr.length - 1] || "";
    let sameEnd: boolean = true;
    for (let i = 0; i < sheetKeys.length; i++) {
      sheet[`${sheetKeys[i]}1`].v = sheet[`${sheetKeys[i]}1`].v.replace(
        /\-[列]\d+$/,
        ""
      );
      let tarr = sheet[`${sheetKeys[i]}1`].v.split(".");
      if (sheet[`${sheetKeys[i]}1`].v.split("/")[0] !== startString) {
        sameStart = false;
        if (!sameEnd) {
          break;
        }
      }
      if (tarr[tarr.length - 1] !== endString) {
        sameEnd = false;
        if (!sameStart) {
          break;
        }
      }
    }
    if (sameEnd) {
      sheetKeys?.map((res: string) => {
        sheet[`${res}1`].v = sheet[`${res}1`].v.replace(
          new RegExp(`.${endString}$`),
          ""
        );
      });
    }
    if (sameStart) {
      sheetKeys?.map((res: string) => {
        sheet[`${res}1`].v = sheet[`${res}1`].v.replace(
          new RegExp(`^${startString}\/`),
          ""
        );
      });
    }
    if (isNeedMerge && fileLength > 0) {
      let lenOfFirst: number = sheetKeys.length;
      let lastValue: string = sheet[`A1`]["v"]?.replace(/\-[列]\d+$/, "") || "";
      for (let i = 0; i < sheetKeys.length; i++) {
        if (lastValue !== sheet[`${sheetKeys[i]}1`]["v"]) {
          lenOfFirst = i;
          break;
        }
      }
      merge.push({
        s: {
          c: 0,
          r: 0,
        },
        e: {
          c: lenOfFirst - 1,
          r: 0,
        },
      });
      for (let i = 0; i < fileLength - 1; i++) {
        merge.push({
          s: {
            c: i * columnOfOneFile + lenOfFirst,
            r: 0,
          },
          e: {
            c: (i + 1) * columnOfOneFile - 1 + lenOfFirst,
            r: 0,
          },
        });
      }
      sheet["!merges"] = merge;
      resolve(sheet);
    } else {
      resolve(sheet);
    }
  });
};
export const downloadExcel = (infomation: {
  tjson: Array<jsonType>;
  filename?: string;
  fileLength: number;
  isMatchData: boolean;
  tmatchRules: Array<matchRuleType>;
  columnSepa: string;
  needFilFirst: boolean;
  isNeedMerge: boolean;
  currentRecords: Array<string>;
  currentHisKeys: Array<historyKeyType>;
  startFilTime: number;
}): Promise<{
  newRecords: Array<string>;
  newHisKeys: Array<historyKeyType>;
} | null> => {
  return new Promise((resolve) => {
    const {
      tjson,
      fileLength,
      isMatchData,
      tmatchRules,
      columnSepa,
      needFilFirst,
      startFilTime,
    } = infomation;
    const filename: string = infomation?.filename?.length
      ? `${infomation.filename}.xlsx`
      : "megered.xlsx";
    if (tjson.length > 0) {
      let ws = XLSX.utils.json_to_sheet(tjson);
      getNeedSheet(
        ws,
        fileLength,
        getRealLengthFromMaRules(tmatchRules, isMatchData),
        infomation?.isNeedMerge
      ).then((sheet: XLSX.WorkSheet) => {
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          wb,
          sheet,
          filename.replace(/\.xlsx$/, "")
        );
        XLSX.writeFile(wb, filename);
        let dataLength: number = Object.keys(tjson[0])?.length * tjson.length;
        let keyForAdd: historyKeyType = {
          columnSepara: columnSepa,
          isEmptyColumn: isMatchData,
          arrOfKey: tmatchRules,
          lastTime: new Date().getTime(),
          useCount: 1,
          isFilFirst: needFilFirst,
        };
        addHistory(infomation?.currentHisKeys || [], keyForAdd).then((res) => {
          let str: string =
            dataLength > 0
              ? `，共有${getMessFromNumber(
                  dataLength
                )}条数据，用时${getDiffFromNow(startFilTime)}`
              : "";
          resolve({
            newRecords: [`${filename}：合并了${fileLength}个文件${str}`].concat(
              infomation.currentRecords
            ),
            newHisKeys: res,
          });
        });
      });
    } else {
      resolve(null);
    }
  });
};
export const getMatchRulesFromLine = (
  value: string,
  info: {
    isEmptyColumn: boolean;
    columnSe: string;
    dataKinds: Array<dataKindType>;
  }
): Promise<Array<matchRuleType>> => {
  return new Promise((resolve, reject) => {
    const { isEmptyColumn, columnSe, dataKinds } = info;
    let rulesForSet: Array<matchRuleType> = [];
    if (isEmptyColumn) {
      let arr: Array<string> = [];
      value
        .split(getRegFromSeperator(columnSe))
        .forEach((res) => res?.length && arr.push(res));
      arr.map((data: string) => {
        for (let i = 0; i < dataKinds.length; i++) {
          if (dataKinds[i]?.reg?.test(data)) {
            rulesForSet.push({ key: data, isNeed: true, dataKindIndex: i });
            break;
          }
        }
      });
    } else {
      value
        .split(getRegFromSeperator(columnSe))
        .forEach(
          (res: string) =>
            res?.length > 0 &&
            rulesForSet.push({ key: res, isNeed: true, dataKindIndex: 0 })
        );
    }
    if (rulesForSet?.length) {
      resolve(rulesForSet);
    } else {
      reject("无法生成规则，请检查分隔符");
    }
  });
};
