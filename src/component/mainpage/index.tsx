import React, { useEffect, useState, useRef } from "react";
import { notification, Menu, Dropdown, Spin } from "antd";
import {
  DownOutlined,
  PlusCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import Clipboard from "clipboard";
import styles from "./index.less";
import {
  getIsIE,
  getPossibleKeysFromText,
  fileFilter,
  getRegFromSeperator,
  getRegFromMatchRules,
  getNeedJson,
  getMessFromNumber,
  getNameFromSepa,
  downloadExcel,
  getMatchRulesFromLine,
  getPlaceFromCurrent,
} from "./functions";
import {
  jsonType,
  historyKeyType,
  possibleKeyType,
  dataKindType,
  allDataType,
  matchDataType,
  matchRuleType,
  dataType,
} from "./type";
import {
  initSeparator,
  initHistory,
  initEncodes,
  initDataKinds,
  initMatchRules,
  keyOfHistory,
} from "./initParams";
let isFromHis: boolean = false;
let startFilTime: number = 0;
const MainPage: React.FC = () => {
  const myMail: string = "fyg1234@yeah.net";
  const [historyKeys, setHistoryKeys] = useState<Array<historyKeyType>>([]);
  const [loadingMessage, setLoadingMessage] = useState<null | string>(null);
  const loadingStatus: Array<{ message: string; display: string }> = [
    { message: "", display: "none" },
    { message: "加载中...", display: "block" },
    { message: "读取、转换中...", display: "block" },
  ];
  const [isFilFirst, setIsFilFirst] = useState<boolean>(false);
  const [fileSuffix, setFileSuffix] = useState<string>(".*");
  const upLoadEle = useRef<any>(null);
  const mailEle = useRef<any>(null);
  const textEle = useRef<any>(null);
  const tableEle = useRef<any>(null);
  const startLineEle = useRef<any>(null);
  const loadingEle = useRef<any>(null);
  const [jsonForTurn, setJsonForTurn] = useState<Array<jsonType>>([]);
  const [encoding, setEncodeing] = useState<string>(initEncodes[0]);
  const [isShowFull, setIsShowFull] = useState<boolean>(false);
  const [rowSeparator, setRowSeparator] = useState<string>(
    initSeparator.rowSepa
  );
  const [columnSeparator, setColumnSeparator] = useState<string>(
    initSeparator.columnSepa
  );
  const [isNeedMerge, setIsNeedMerge] = useState<boolean>(true);
  const [isEmptyColumn, setIsEmptyColumn] = useState<boolean>(false);
  const [checkRecords, setCheckRecords] = useState<Array<string>>([]);
  const [keyNeedSelect, setKeyNeedSelect] = useState<boolean>(false);
  const [needSelectHis, setNeedSelectHis] = useState<boolean>(true);
  const textName = `文件路径/测试文本`;
  const [loadingState, setLoadingState] = useState<number>(0);
  const [textAreaValue, setTextAreaValue] = useState<string | null>(null);
  const [possibleKeys, setPossibleKeys] = useState<Array<possibleKeyType>>([]);
  let clickEvent: MouseEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent("click", true, false);
  const [extraName, setExtraName] = useState<string>("");
  const [matchRules, setMatchRules] = useState<Array<matchRuleType>>(
    initMatchRules
  );
  const [dataKinds, setDataKinds] = useState<Array<dataKindType>>(
    initDataKinds
  );
  const [isQuickDisplay, setIsQuickDisplay] = useState<boolean>(true);
  const fileMode: number = 438;
  const inputDire = document.getElementById("input-directory");
  const inputFile = document.getElementById("input-file");
  useEffect(() => {
    if (mailEle?.current) {
      new Clipboard(mailEle.current, {
        text: () => {
          return myMail;
        },
      }).on("success", (e) => {
        e.clearSelection();
        openNotification("复制成功");
      });
    }
  }, [mailEle]);
  useEffect(() => {
    showReview();
    if (isFromHis) {
      isFromHis = false;
    } else {
      setExtraName("");
    }
    // console.log(matchRules)
  }, [matchRules, isEmptyColumn, rowSeparator, columnSeparator]);
  useEffect(() => {
    if (upLoadEle) {
      let tinputDire: any = document.getElementById("input-directory");
      if (tinputDire) {
        tinputDire.webkitdirectory = true;
        tinputDire.directory = true;
        tinputDire.mozdirectory = true;
      }
    }
  }, [upLoadEle]);
  useEffect(() => {
    if (keyNeedSelect) {
      if (possibleKeys?.length) {
        setIsEmptyColumn(possibleKeys[0].isEmptyColumn);
        setColumnSeparator(possibleKeys[0].columnSepara);
        setMatchRules(possibleKeys[0].arrOfKey);
      }
    }
  }, [keyNeedSelect]);
  window.onbeforeunload = () => {
    // console.log(historyKeys)
    if (window?.localStorage) {
      try {
        window?.localStorage?.setItem(
          keyOfHistory,
          JSON.stringify(historyKeys)
        );
      } catch (err) {
        console.log(err);
        window?.localStorage?.setItem(
          keyOfHistory,
          JSON.stringify(initHistory)
        );
      }
    }
    window.onbeforeunload = null;
  };
  const openNotification = (message: string, duration: number = 0.5) => {
    notification.open({
      message: message,
      duration: duration,
      placement: "topLeft",
    });
  };
  useEffect(() => {
    if (getIsIE()) {
      notification.open({
        message:
          "检测到正在使用IE浏览器，可能无法读取文件夹，建议换用其他浏览器尝试",
        duration: null,
        top: 100,
        placement: "topLeft",
        style: { width: "750px", height: "300px", left: "10%" },
      });
    }
    if (window?.localStorage) {
      let arrHisKey: string | null = window?.localStorage?.getItem(
        keyOfHistory
      );
      if (arrHisKey && arrHisKey.length > 0) {
        try {
          setHistoryKeys(JSON.parse(arrHisKey));
        } catch (err) {
          console.log(err);
          setHistoryKeys(initHistory);
        }
      } else {
        setHistoryKeys(initHistory);
      }
    } else {
      window.onload = () => {
        // console.log('jiazai')
        if (window?.localStorage) {
          let arrHisKey: string | null = window?.localStorage?.getItem(
            keyOfHistory
          );
          if (arrHisKey && arrHisKey.length > 0) {
            try {
              setHistoryKeys(JSON.parse(arrHisKey));
            } catch (err) {
              console.log(err);
              setHistoryKeys(initHistory);
            }
          }
          // console.log(arrHisKey)
        } else {
          openNotification(
            "浏览器不支持存储历史记录,请尝试用新版非IE浏览器",
            4
          );
        }
        window.onload = null;
      };
    }
  }, []);
  {
    /*
  // const getNeedSheet
  //   = (sheet: XLSX.WorkSheet, fileLength: number, columnOfOneFile: number)
  //     : Promise<XLSX.WorkSheet> => {
  //     let merge: Array<any> = []
  //     let sheetKeys: Array<string> = getSheetKeyFromRef(sheet['!ref'] || 'A')
  //     let sameStart: boolean = true
  //     let startString: string = sheet['A1'].v.split('/')[0] || ''
  //     let arr = sheet['A1'].v.replace(/\-[列]\d+$/, '').split('.')
  //     let endString: string = arr[arr.length - 1] || ''
  //     let sameEnd: boolean = true
  //     for (let i = 0; i < sheetKeys.length; i++) {
  //       sheet[`${sheetKeys[i]}1`].v = sheet[`${sheetKeys[i]}1`].v.replace(/\-[列]\d+$/, '')
  //       let tarr = sheet[`${sheetKeys[i]}1`].v.split('.')
  //       if (sheet[`${sheetKeys[i]}1`].v.split('/')[0] !== startString) {
  //         sameStart = false
  //         if (!sameEnd) {
  //           break
  //         }
  //       }
  //       if (tarr[tarr.length - 1] !== endString) {
  //         sameEnd = false
  //         if (!sameStart) {
  //           break
  //         }
  //       }
  //     }
  //     if (sameEnd) {
  //       sheetKeys?.map((res: string) => {
  //         sheet[`${res}1`].v = sheet[`${res}1`].v.replace(new RegExp(`.${endString}$`), '')
  //       })
  //     }
  //     if (sameStart) {
  //       sheetKeys?.map((res: string) => {
  //         sheet[`${res}1`].v = sheet[`${res}1`].v.replace(new RegExp(`^${startString}\/`), '')
  //       })
  //     }
  //     if (isNeedMerge && fileLength > 0) {
  //       let lenOfFirst: number = sheetKeys.length
  //       let lastValue: string = sheet[`A1`]['v']?.replace(/\-[列]\d+$/, '') || ''
  //       for (let i = 0; i < sheetKeys.length ; i++) {
  //         if (lastValue !== sheet[`${sheetKeys[i]}1`]['v']) {
  //           lenOfFirst = i
  //           break
  //         }
  //       }
  //       merge.push({
  //         s: {
  //           c: 0,
  //           r: 0
  //         },
  //         e: {
  //           c: lenOfFirst - 1,
  //           r: 0
  //         }
  //       })
  //       for (let i = 0; i < fileLength - 1; i++) {
  //         merge.push({
  //           s: {
  //             c: i * columnOfOneFile + lenOfFirst,
  //             r: 0
  //           },
  //           e: {
  //             c: (i + 1) * columnOfOneFile - 1 + lenOfFirst,
  //             r: 0
  //           }
  //         })
  //       }
  //       sheet['!merges'] = merge
  //       return new Promise((resolve) => {
  //         resolve(sheet)
  //       })
  //     } else {
  //       return new Promise((resolve) => {
  //         resolve(sheet)
  //       })
  //     }

  //   }
  // const downloadExcel =
  //   (infomation:{tjson: Array<jsonType>,
  //     filename?: string , 
  //     fileLength: number,
  //     isMatchData:boolean,
  //     tmatchRules:Array<matchRuleType>,
  //     columnSepa:string,
  //     needFilFirst:boolean,
  //   }) => {
  //       const {tjson,
  //         fileLength,
  //         isMatchData,
  //         tmatchRules,
  //       columnSepa,
  //     needFilFirst} = infomation
  //       const filename:string = infomation?.filename?.length 
  //        ? `${infomation.filename}.xlsx`
  //        : 'megered.xlsx'
  //     if (tjson.length > 0) {
  //       let ws = XLSX.utils.json_to_sheet(tjson);
  //       getNeedSheet(
  //         ws,
  //         fileLength,
  //         getRealLengthFromMaRules(tmatchRules,isMatchData)
  //       ).then((sheet: XLSX.WorkSheet) => {
  //       let wb = XLSX.utils.book_new();
  //         XLSX.utils.book_append_sheet(
  //           wb,
  //           sheet,
  //           filename.replace(/\.xlsx$/, ''));
  //         setCheckRecords((records) =>
  //           [`${filename}：合并了${fileLength}个文件${correctInfo}`].concat(records)
  //         )
  //         XLSX.writeFile(wb, filename);
  //         let keyForAdd: historyKeyType = {
  //           columnSepara: columnSepa,
  //           isEmptyColumn: isMatchData,
  //           arrOfKey: tmatchRules,
  //           lastTime: new Date().getTime(),
  //           useCount: 1,
  //           isFilFirst:needFilFirst
  //         }
  //         addHistory(historyKeys, keyForAdd).then(res => setHistoryKeys(res))
  //       })
  //     } else {
  //       openNotification('没有提取到信息')
  //     }
  //     setLoadingState(0)
  //   }
  */
  }
  const uploadDirectoryOrFile = (isDirector: boolean) => {
    clickEvent = document.createEvent("MouseEvent");
    clickEvent.initEvent("click", false, false);
    if (isDirector) {
      inputDire?.dispatchEvent(clickEvent);
    } else {
      inputFile?.dispatchEvent(clickEvent);
    }
  };
  const showReview = (): Promise<boolean> => {
    if (textEle?.current?.value?.length) {
      return new Promise((resolve) => {
        getArrDataFromText(
          {
            textName: textName,
            text: textEle.current.value,
          },
          {
            columnSepara: columnSeparator,
            rowSepara: rowSeparator,
            dataKinds: dataKinds,
            needFilFirst: true,
            matchRules: matchRules,
            isMatchData: isEmptyColumn,
          }
        ).then((arrData: Array<dataType>) => {
          if (arrData?.length) {
            setJsonForTurn(arrData);
            setCheckRecords([`测试文本：${textName}`]);
            resolve(true);
          } else {
            setJsonForTurn([]);
            resolve(false);
          }
        });
      });
    } else {
      setJsonForTurn([]);
      return new Promise((resolve) => resolve(false));
    }
  };
  const getArrDataFromText = (
    textInfo: { textName: string; text: string; textNumber?: number },
    matchData: matchDataType
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
      // const proofKey = Symbol('key')
      let arrJson: Array<dataType> = [];
      let lines: Array<string> = text.split(getRegFromSeperator(rowSepara));
      // let lines:Array<string> = []
      let dataLines: Array<string> | null = null;
      // console.log(lines)
      // console.log(getRegFromSeperator(rowSepara),getRegFromSeperator(columnSepara))
      setLoadingMessage(`读取${name}中...`);
      // console.log(isMatchData)
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
            let tarrData = lines[i + 1].split(
              getRegFromSeperator(columnSepara)
            );
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
                  !dataKinds[matchRules[ti].dataKindIndex]?.reg.test(
                    arrData[ti]
                  )
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
                i === lines.length - 1
                  ? null
                  : lines?.slice(i + 1, lines.length);
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
                    if (
                      matchRule.isNeed ||
                      (textNumber === 1 && !needFilFirst)
                    ) {
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
  const setPossibleData = (file: File) => {
    let reader: FileReader | null = new FileReader();
    reader.readAsText(file, encoding);
    reader.onload = () => {
      setTextAreaValue(reader?.result);
      getPossibleKeysFromText(reader?.result, rowSeparator, dataKinds).then(
        (res) => {
          // console.log(res)
          if (res.length > 0) {
            setPossibleKeys(res);
            setKeyNeedSelect(true);
          } else {
            setPossibleKeys([]);
            setKeyNeedSelect(false);
            openNotification(
              "无法自动生成规则，请检查文本是否正确或手动输入规则",
              5
            );
          }
        }
      );
      reader = null;
    };
  };
  const readFileList = (allDate: allDataType): void => {
    startFilTime = new Date().getTime();
    let fileList: Array<any> = allDate?.fileData?.fileList || [];
    const fileSuffix: string = allDate?.fileData?.fileSuffix || "";
    let jsonForSort: Array<{
      index: number;
      json: Array<dataType>;
      fileName: string;
    }> = [];
    if (fileList?.length < 1) {
      openNotification(
        `无${
          fileSuffix === ".*" ? "任何" : fileSuffix.replace(/^./, "")
        }文件，请重新导入或更改文件后缀名`,
        5
      );
      setLoadingState(0);
      return;
    } else if (!fileList[0]?.webkitRelativePath?.length) {
      notification.open({
        message:
          "无法获取到文件路径，无法智能命名，难以分辨数据来源。建议换非IE浏览器尝试",
        duration: null,
        top: 100,
        placement: "topLeft",
        style: { width: "750px", height: "300px", left: "10%" },
      });
    }
    if (fileList.length > 1000) {
      if (
        !window.confirm(
          "文件超过1000个，数据太多（超过1百万条数据）可能会卡死，是否继续"
        )
      ) {
        setLoadingState(0);
        openNotification(
          "可以设置文件后缀，筛选一些不需要的文件，或者分批次传入文件夹",
          5
        );
        return;
      }
    }
    setLoadingState(2);
    let realFileLength: number = 0;
    let length: number = fileList.length;
    //断点修改
    let filename: string =
      (fileList[0].webkitRelativePath.split("/") || ["合并文件"])[0] +
      (allDate?.turnData?.extraName || "");
    for (let index: number = 0; index < fileList.length; index++) {
      const file = fileList[index];
      let textName: string =
        file?.webkitRelativePath || `${file?.name || "文件"}(${index + 1})`;
      let reader: FileReader | null = new FileReader();
      reader.readAsText(file, encoding);
      reader.onload = () => {
        getArrDataFromText(
          {
            textName: textName,
            text: reader?.result || "",
            textNumber: realFileLength + 1,
          },
          allDate.matchData
        ).then((data: Array<dataType>) => {
          let objForPush: any = {
            index: index,
            json: data,
            fileName: textName,
          };
          if (objForPush?.json?.length) {
            realFileLength++;
            jsonForSort.push(objForPush);
          }
          if (index === length - 1) {
            if (jsonForSort.length === realFileLength) {
              setLoadingMessage("检测数据完整性，将数据排序...");
              setTimeout(() => {
                getNeedJson(jsonForSort).then((needObj) => {
                  if (needObj?.arrJson?.length) {
                    let dataLength: number =
                      Object.keys(needObj.arrJson[0])?.length *
                      needObj?.arrJson?.length;
                    // console.log(needObj.arrJson)
                    setLoadingMessage(
                      `转换为xlsx中(共有${getMessFromNumber(
                        dataLength
                      )}条数据)...`
                    );
                    setTimeout(() => {
                      downloadExcel({
                        tjson: needObj.arrJson,
                        tmatchRules: allDate.matchData.matchRules,
                        filename: filename,
                        fileLength: realFileLength,
                        isMatchData: allDate.matchData.isMatchData,
                        columnSepa: allDate.matchData.columnSepara,
                        needFilFirst: allDate.matchData.needFilFirst,
                        isNeedMerge: isNeedMerge,
                        currentHisKeys: historyKeys,
                        currentRecords: needObj?.records || [],
                        startFilTime: startFilTime,
                      }).then((downloadInfo) => {
                        setLoadingState(0);
                        setLoadingMessage(null);
                        if (downloadInfo) {
                          setCheckRecords(downloadInfo.newRecords);
                          setHistoryKeys(downloadInfo.newHisKeys);
                        } else {
                          openNotification("没有提取到信息");
                        }
                      });
                    }, 10);
                  } else {
                    setLoadingState(0);
                    setLoadingMessage(null);
                    openNotification("没有提取到信息", 5);
                  }
                });
              }, 10);
            } else {
              throw new Error("文件丢失");
            }
          }
          reader = null;
        });
      };
    }
  };
  const setNewMatchRules = (
    currentRules: Array<matchRuleType>,
    setRule: {
      ruleIndex: number;
      key?: string;
      dataKindIndex?: number;
      isAutoAdd?: boolean;
    }
  ): void => {
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
    setMatchRules(currentRules);
  };
  const startLineOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    event.preventDefault();
    let line: string = event?.target?.value || "";
    if (line.length) {
      getMatchRulesFromLine(line, {
        isEmptyColumn: isEmptyColumn,
        columnSe: columnSeparator,
        dataKinds: dataKinds,
      }).then(
        (data: Array<matchRuleType>) => {
          setMatchRules(data);
          if (data?.length > 1) {
            openNotification("规则设置成功", 0.5);
          }
        },
        (reason) => {
          openNotification(reason || "无法生成规则，请检查分隔符", 2);
        }
      );
    }
  };
  const columnSeOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    event.preventDefault();
    let columnSe: string = event?.target?.value;
    if (!columnSe?.length) {
      columnSe = initSeparator.columnSepa;
    } else {
      columnSe = columnSe.replace(/^[ ]+/, "").replace(/[ ]+$/, ""); //空格
      if (!columnSe?.length) {
        columnSe = " "; //空格
      }
    }
    setColumnSeparator(columnSe);
    if (startLineEle?.current?.value?.length) {
      getMatchRulesFromLine(startLineEle.current.value, {
        isEmptyColumn: isEmptyColumn,
        columnSe: columnSe,
        dataKinds: dataKinds,
      }).then(
        (data: Array<matchRuleType>) => {
          setMatchRules(data);
          if (data?.length > 1) {
            openNotification("规则设置成功", 0.5);
          }
        },
        (reason) => {
          openNotification(reason || "无法生成规则，请检查分隔符", 2);
        }
      );
    }
  };
  const quickActing = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (jsonForTurn?.length && possibleKeys?.length) {
      setKeyNeedSelect(true);
      openNotification(
        "请仔细观察文本数据的规律，选择并调整合适的规则用于提取",
        6
      );
    } else if (textEle?.current?.value?.length) {
      getPossibleKeysFromText(
        textEle?.current?.value,
        rowSeparator,
        dataKinds
      ).then((res) => {
        // console.log(res)
        if (res.length > 0) {
          setPossibleKeys(res);
          setKeyNeedSelect(true);
        } else {
          uploadDirectoryOrFile(false);
          openNotification("请先上传一个需要提取的文件", 6);
        }
      });
    } else {
      openNotification("请先上传一个需要提取的文件", 6);
      uploadDirectoryOrFile(false);
    }
  };
  return (
    <div className={styles["all-page"]}>
      <div
        style={{
          width: "100%",
          backgroundColor: "rgba(200,200,200,0.6)",
          height: "100%",
          position: "fixed",
          zIndex: 12,
          display: loadingStatus[loadingState]?.display || "none",
          top: 0,
        }}
      >
        <div
          style={{
            margin: "15% 0",
            width: "100%",
            textAlign: "center",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          <Spin
            delay={0.5}
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
          <br />
          <span ref={loadingEle} id="loading-message">
            {loadingMessage ||
              loadingStatus[loadingState]?.message ||
              "加载中..."}
          </span>
          <br />
          <br />
          <a
            onClick={() => {
              setLoadingState(0);
            }}
          >
            手动关闭此页
          </a>
        </div>
      </div>
      <div
        className={styles["possiblekey-container"]}
        style={{
          display: keyNeedSelect ? "block" : "none",
        }}
      >
        <div className={styles["possiblekey-title"]}>
          <a
            key={`filFirst${isFilFirst}`}
            style={{
              fontSize: "14px",
            }}
            className={styles[`filFirstFile-${isFilFirst ? "true" : "false"}`]}
            onClick={() => setIsFilFirst(!isFilFirst)}
          >
            保留第一个文件的所有数据
          </a>
          选择并调整提取规则
          <span
            onClick={(event) => {
              setKeyNeedSelect(false);
              event.stopPropagation();
              event.preventDefault();
              uploadDirectoryOrFile(false);
            }}
          >
            重新生成规则
          </span>
          <span onClick={() => setKeyNeedSelect(false)}>关闭此页</span>
        </div>
        <div className={styles["preview-container"]}>
          {jsonForTurn?.length > 0 ? (
            <table ref={tableEle}>
              {
                <thead>
                  <tr key={"dataTitle"}>
                    {isNeedMerge ? (
                      <th colSpan={matchRules.length + 1}>{textName}</th>
                    ) : (
                      matchRules.map((res, index: number) =>
                        jsonForTurn[0][`${textName}-列${index + 1}`] ||
                        jsonForTurn[0][`${textName}-列${index + 1}`] === 0 ? (
                          <th key={`keyshead${index}`}>{textName}</th>
                        ) : (
                          <></>
                        )
                      )
                    )}
                  </tr>
                </thead>
              }
              <tbody>
                {jsonForTurn.length < 6 ? (
                  jsonForTurn.map((obj: jsonType, jsonIndex: number) => (
                    <tr key={`jsonForTurn${jsonIndex}`}>
                      {matchRules.map((res, index: number) =>
                        obj[`${textName}-列${index + 1}`] ||
                        obj[`${textName}-列${index + 1}`] === 0 ? (
                          <td key={`jsonForTurn${jsonIndex}keys${index}`}>
                            {obj[`${textName}-列${index + 1}`]}
                          </td>
                        ) : (
                          <></>
                        )
                      )}
                    </tr>
                  ))
                ) : (
                  <>
                    {jsonForTurn
                      .slice(0, 3)
                      .map((obj: jsonType, jsonIndex: number) => (
                        <tr key={`jsonForTurn${jsonIndex}`}>
                          {matchRules.map((res, index: number) =>
                            obj[`${textName}-列${index + 1}`] ||
                            obj[`${textName}-列${index + 1}`] === 0 ? (
                              <td key={`jsonForTurn${jsonIndex}keys${index}`}>
                                {obj[`${textName}-列${index + 1}`]}
                              </td>
                            ) : (
                              <></>
                            )
                          )}
                        </tr>
                      ))}
                    <tr
                      key={"dataFold"}
                      style={{
                        verticalAlign: "middle",
                      }}
                    >
                      <td
                        key={"dataFoldMessage"}
                        colSpan={matchRules.length + 1}
                      >
                        ...（还有{jsonForTurn.length - 5}条数据）
                      </td>
                    </tr>
                    {jsonForTurn
                      .slice(jsonForTurn.length - 2, jsonForTurn.length)
                      .map((obj: jsonType, jsonIndex: number) => (
                        <tr key={`jsonForTurn${jsonIndex}`}>
                          {matchRules.map((res, index: number) =>
                            obj[`${textName}-列${index + 1}`] ||
                            obj[`${textName}-列${index + 1}`] === 0 ? (
                              <td key={`jsonForTurn${jsonIndex}keys${index}`}>
                                {obj[`${textName}-列${index + 1}`]}
                              </td>
                            ) : (
                              <></>
                            )
                          )}
                        </tr>
                      ))}
                  </>
                )}
              </tbody>
            </table>
          ) : (
            <p
              key={"nullData"}
              style={{
                fontSize: "28px",
              }}
            >
              无预览数据，请修改下方规则
            </p>
          )}
        </div>
        <div className={styles["possiblekeys-page"]} style={{ top: "350px" }}>
          {possibleKeys.map((res: possibleKeyType, index: number) => (
            <ul
              key={`possibleKey${index}`}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                setIsEmptyColumn(res.isEmptyColumn);
                setColumnSeparator(res.columnSepara);
                setMatchRules(res.arrOfKey);
                setKeyNeedSelect(false);
                openNotification("请上传需要提取的文件夹", 5);
                uploadDirectoryOrFile(true);
              }}
            >
              {res.isEmptyColumn ? (
                <li>
                  <span>
                    {index + 1}、 没有特定的起始行，根据数据类型与数量来提取
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      border: "1px solid rgb(51,51,51)",
                      margin: "0 5px",
                    }}
                  >
                    分隔符：
                    {getNameFromSepa(res.columnSepara)}
                  </span>
                  {res?.arrOfKey?.map(
                    (key: matchRuleType, indexOfKey: number) => (
                      <a
                        className={styles["change-a"]}
                        key={`possibleKeysfilter${indexOfKey}`}
                        style={{
                          border: "1px solid rgb(97,97,97)",
                          color: "rgb(51,51,51)",
                          margin: "0 5px",
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          let tkeys: Array<possibleKeyType> = [...possibleKeys];
                          tkeys[index].arrOfKey[indexOfKey].isNeed = !tkeys[
                            index
                          ]?.arrOfKey[indexOfKey]?.isNeed;
                          setPossibleKeys(tkeys);
                          setIsEmptyColumn(res.isEmptyColumn);
                          setColumnSeparator(res.columnSepara);
                          setMatchRules([...res.arrOfKey]);
                          console.log(res.arrOfKey);
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{
                            cursor: "pointer",
                          }}
                          key={`isNeedCheckBox${key.isNeed}`}
                          checked={key.isNeed}
                          readOnly={true}
                        />
                        <span>
                          第{indexOfKey + 1}列：
                          <span
                            style={{
                              color: "red",
                              fontWeight: "bold",
                              fontSize: "18px",
                            }}
                          >
                            {dataKinds[key.dataKindIndex].text}
                          </span>
                        </span>
                      </a>
                    )
                  )}
                </li>
              ) : (
                <li>
                  <span>{index + 1}、 有特定的起始行：</span>
                  <span
                    style={{
                      fontSize: "12px",
                      border: "1px solid rgb(51,51,51)",
                      margin: "0 5px",
                    }}
                  >
                    分隔符：
                    {getNameFromSepa(res.columnSepara)}
                  </span>
                  {res.arrOfKey.map((key: matchRuleType, indexOfKey) => (
                    <a
                      className={styles["change-a"]}
                      onClick={(event) => {
                        event.stopPropagation();
                        let tkeys: Array<possibleKeyType> = [...possibleKeys];
                        tkeys[index].arrOfKey[indexOfKey].isNeed = !tkeys[index]
                          ?.arrOfKey[indexOfKey]?.isNeed;
                        setPossibleKeys(tkeys);
                        setIsEmptyColumn(res.isEmptyColumn);
                        setColumnSeparator(res.columnSepara);
                        setMatchRules([...res.arrOfKey]);
                      }}
                      key={`isEmpty-Columnkeys-filter${indexOfKey}`}
                      style={{
                        border: "1px solid rgb(97,97,97)",
                        color: "rgb(51,51,51)",
                        margin: "0 5px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        key={`isNeedCheckBox${key.isNeed}`}
                        type="checkbox"
                        style={{
                          cursor: "pointer",
                        }}
                        checked={key.isNeed}
                        readOnly={true}
                      />
                      <span>
                        {key.key}
                        &#40;类型:
                        <span>{dataKinds[key.dataKindIndex].text}</span>
                        &#41;
                      </span>
                    </a>
                  ))}
                </li>
              )}
            </ul>
          ))}
          <ul
            style={{
              textAlign: "center",
              fontSize: "18px",
            }}
            key={"reuploadfile"}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setKeyNeedSelect(false);
              uploadDirectoryOrFile(false);
            }}
          >
            不是这个文件？重新上传文件生成规则
          </ul>
          <ul
            style={{
              textAlign: "center",
              fontSize: "18px",
            }}
            key={"nodata"}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setKeyNeedSelect(false);
            }}
          >
            文件上传对了，没有想要的数据？请自定义规则
          </ul>
        </div>
      </div>
      <div
        className={styles["possiblekey-container"]}
        style={{
          display: needSelectHis ? "block" : "none",
        }}
      >
        <div className={styles["possiblekey-title"]}>
          选择历史提取规则
          <span
            onClick={(event) => {
              setNeedSelectHis(false);
              event.stopPropagation();
              event.preventDefault();
              uploadDirectoryOrFile(false);
            }}
          >
            上传文件自动生成规则
          </span>
          <span onClick={() => setNeedSelectHis(false)}>关闭此页</span>
        </div>
        <div className={styles["possiblekeys-page"]}>
          {historyKeys.map((res: historyKeyType, index: number) => (
            <ul
              key={`hisKey${res.lastTime}`}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                isFromHis = true;
                setIsEmptyColumn(res.isEmptyColumn);
                setColumnSeparator(res.columnSepara);
                setIsFilFirst(res?.isFilFirst);
                setMatchRules(res.arrOfKey);
                setNeedSelectHis(false);
                setExtraName(res.keyName || "");
                if (upLoadEle?.current?.files?.length > 0) {
                  fileFilter(upLoadEle.current.files, fileSuffix).then(
                    (fileList: Array<File>) => {
                      readFileList({
                        fileData: {
                          fileList: fileList,
                          fileSuffix: fileSuffix,
                          codeFormat: encoding,
                        },
                        matchData: {
                          columnSepara: res.columnSepara,
                          rowSepara: rowSeparator,
                          dataKinds: dataKinds,
                          needFilFirst: res?.isFilFirst,
                          matchRules: res.arrOfKey,
                          isMatchData: res.isEmptyColumn,
                        },
                        turnData: {
                          extraName: res.keyName || "",
                        },
                      });
                    }
                  );
                } else if (upLoadEle?.current?.fileList?.length > 0) {
                  fileFilter(upLoadEle.current.files, fileSuffix).then(
                    (fileList: Array<File>) => {
                      readFileList({
                        fileData: {
                          fileList: fileList,
                          fileSuffix: fileSuffix,
                          codeFormat: encoding,
                        },
                        matchData: {
                          columnSepara: res.columnSepara,
                          rowSepara: rowSeparator,
                          dataKinds: dataKinds,
                          needFilFirst: res?.isFilFirst,
                          matchRules: res.arrOfKey,
                          isMatchData: res.isEmptyColumn,
                        },
                        turnData: {
                          extraName: res.keyName || "",
                        },
                      });
                    }
                  );
                } else {
                  uploadDirectoryOrFile(true);
                }
              }}
              style={{
                paddingLeft: "60px",
              }}
            >
              {res.isEmptyColumn ? (
                <li>
                  <span
                    className={styles["icon-delete"]}
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      setHistoryKeys((hisKeys) =>
                        hisKeys
                          .slice(0, index)
                          .concat(hisKeys.slice(index + 1, hisKeys.length))
                      );
                    }}
                  >
                    &#215;
                  </span>
                  <div>
                    <div className={styles["message-delete"]}>
                      删除此历史
                      <div className={styles["line-delete"]}></div>
                    </div>
                    <span>
                      {index + 1}
                      、
                      <input
                        type="text"
                        key={`keyName${res.lastTime}`}
                        defaultValue={res.keyName}
                        placeholder={"暂没有命名，可在此处命名"}
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                        }}
                        onChange={(event) => {
                          if (event?.target?.value?.length > 0) {
                            let hisKeys: Array<historyKeyType> = [
                              ...historyKeys,
                            ];
                            hisKeys[index].keyName = event?.target?.value;
                            setHistoryKeys(hisKeys);
                          }
                        }}
                        style={{
                          width: "15em",
                          height: "1.5em",
                          border: "none",
                          outline: "none",
                          fontSize: "20px",
                        }}
                      />
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        border: "1px solid rgb(51,51,51)",
                        margin: "0 5px",
                      }}
                    >
                      分隔符：
                      {getNameFromSepa(res.columnSepara)}
                    </span>
                    {res?.arrOfKey?.map(
                      (key: matchRuleType, indexOfKey: number) => (
                        <a key={`possibleKeysfilter${indexOfKey}`}>
                          <input
                            style={{
                              outline: "none",
                              cursor: "pointer",
                            }}
                            key={`isNeedCheckBox${key.isNeed}`}
                            type="checkbox"
                            checked={key.isNeed}
                            readOnly={true}
                          />
                          <span>
                            第{indexOfKey + 1}列：
                            <span
                              style={{
                                color: "red",
                                fontWeight: "bold",
                                fontSize: "18px",
                              }}
                            >
                              {dataKinds[key.dataKindIndex].text}
                            </span>
                          </span>
                        </a>
                      )
                    )}

                    <a
                      key={`filFirst${res?.isFilFirst}`}
                      className={
                        styles[
                          `filFirstFile-${res?.isFilFirst ? "true" : "false"}`
                        ]
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        let tHisKey: Array<historyKeyType> = [...historyKeys];
                        tHisKey[index].isFilFirst = !tHisKey[index]?.isFilFirst;
                        setHistoryKeys(tHisKey);
                      }}
                    >
                      <input
                        type="checkbox"
                        style={{
                          cursor: "pointer",
                        }}
                        key={`isNeedCheckBox${!res?.isFilFirst}`}
                        checked={!res?.isFilFirst}
                        readOnly={true}
                      />
                      保留第一个文件的所有数据
                    </a>
                  </div>
                </li>
              ) : (
                <li>
                  <span
                    className={styles["icon-delete"]}
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      setHistoryKeys((hisKeys) =>
                        hisKeys
                          .slice(0, index)
                          .concat(hisKeys.slice(index + 1, hisKeys.length))
                      );
                    }}
                  >
                    &#215;
                  </span>
                  <div>
                    <div className={styles["message-delete"]}>
                      删除此历史
                      <div className={styles["line-delete"]}></div>
                    </div>
                    <span>
                      {index + 1}、
                      <input
                        type="text"
                        key={`keyName${res.lastTime}`}
                        defaultValue={res.keyName}
                        placeholder={"暂没有命名，可在此处命名"}
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                        }}
                        onChange={(event) => {
                          if (event?.target?.value?.length > 0) {
                            let hisKeys: Array<historyKeyType> = [
                              ...historyKeys,
                            ];
                            hisKeys[index].keyName = event?.target?.value;
                            setHistoryKeys(hisKeys);
                          }
                        }}
                        style={{
                          width: `15em`,
                          height: "1.5em",
                          outline: "none",
                          border: "none",
                          fontSize: "20px",
                        }}
                      />
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        border: "1px solid rgb(51,51,51)",
                        margin: "0 5px",
                      }}
                    >
                      分隔符：
                      {getNameFromSepa(res.columnSepara)}
                    </span>
                    {res.arrOfKey.map((key: matchRuleType, indexOfKey) => (
                      <a key={`isEmpty-Columnkeys-filter${indexOfKey}`}>
                        <input
                          type="checkbox"
                          key={`isNeedCheckBox${key.isNeed}`}
                          style={{
                            outline: "none",
                            cursor: "pointer",
                          }}
                          checked={key.isNeed}
                          readOnly={true}
                        />
                        <span>
                          {key.key}
                          &#40;类型:
                          <span>{dataKinds[key.dataKindIndex]?.text}</span>
                          &#41;
                        </span>
                      </a>
                    ))}

                    <a
                      key={`filFirst${res?.isFilFirst}`}
                      className={
                        styles[
                          `filFirstFile-${res?.isFilFirst ? "true" : "false"}`
                        ]
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        let tHisKey: Array<historyKeyType> = [...historyKeys];
                        tHisKey[index].isFilFirst = !tHisKey[index]?.isFilFirst;
                        setHistoryKeys(tHisKey);
                      }}
                    >
                      <input
                        type="checkbox"
                        style={{
                          cursor: "pointer",
                        }}
                        key={`isNeedCheckBox${!res?.isFilFirst}`}
                        checked={!res?.isFilFirst}
                        readOnly={true}
                      />
                      保留第一个文件的所有数据
                    </a>
                  </div>
                </li>
              )}
            </ul>
          ))}
          <ul
            key={"uploadFileToRules"}
            style={{
              textAlign: "center",
            }}
            onClick={(event) => {
              setNeedSelectHis(false);
              event.stopPropagation();
              event.preventDefault();
              uploadDirectoryOrFile(false);
            }}
          >
            上传文件自动生成规则
          </ul>
        </div>
      </div>
      <div
        className={styles["quick-acting"]}
        style={isQuickDisplay ? {} : { display: "none" }}
        onClick={quickActing}
        id={"next-step"}
      >
        <span
          className={styles["quick-guanbi"]}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setIsQuickDisplay(false);
          }}
        >
          &Chi;
        </span>
        <div>下一步</div>
      </div>
      <div className={styles["page"]} key={"mainPage"}>
        <div
          style={{
            textAlign: "end",
            fontSize: "6px",
            float: "right",
            color: "rgb(241,241,241)",
          }}
        >
          <span>联系作者:</span>
          <a
            style={{
              textDecoration: "underline",
              margin: "15px 15px",
              color: "rgb(241,241,241)",
            }}
            ref={mailEle}
          >
            {myMail}
          </a>
        </div>

        <div
          style={{
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: "28px",
            }}
          >
            第一步：选择历史提取规则或新建提取规则：
          </span>
          <br />
          <span
            style={{
              fontSize: "20px",
              marginLeft: "10px",
            }}
          >
            第一步——选择用过的提取规则：
          </span>
          {historyKeys?.length > 0 && (
            <span
              style={{
                fontSize: "18px",
                textDecoration: "underline",
                cursor: "pointer",
                color: "rgb(44,155,155)",
              }}
              onClick={() => setNeedSelectHis(true)}
            >
              重新选择提取规则
            </span>
          )}
          <a
            key={`filFirst${isFilFirst}`}
            // style={
            //   isFilFirst
            //     ? {
            //       margin: '0 15px',
            //       color: 'rgb(112,112,112)',
            //       padding: '0 10px',
            //       fontSize: '20px'
            //     } :
            //     {
            //       color: 'rgb(236,65,65)',
            //       backgroundColor: 'rgb(253,245,245)',
            //       borderRadius: '30px',
            //       margin: '0 15px',
            //       padding: '0 10px',
            //       fontSize: '20px'
            //     }

            // }

            className={styles[`filFirstFile-${isFilFirst ? "true" : "false"}`]}
            onClick={() => {
              setIsFilFirst(!isFilFirst);
            }}
          >
            保留第一个文件的所有数据
          </a>
          <br />
          <div>
            <span
              style={{
                fontSize: "28px",
              }}
            >
              第二步：导入需要提取的文件夹然后导出为xlsx：
            </span>
            <span>
              <input
                type={"file"}
                style={{
                  color: "#000",
                  fontSize: "18px",
                  marginRight: "10px",
                }}
                multiple={true}
                ref={upLoadEle}
                id={"input-directory"}
                onChange={(ele) => {
                  setLoadingState(2);
                  fileFilter(ele?.target?.files || null, fileSuffix).then(
                    (fileList: Array<File>) => {
                      readFileList({
                        fileData: {
                          fileList: fileList,
                          fileSuffix: fileSuffix,
                          codeFormat: encoding,
                        },
                        matchData: {
                          columnSepara: columnSeparator,
                          rowSepara: rowSeparator,
                          dataKinds: dataKinds,
                          needFilFirst: isFilFirst,
                          matchRules: matchRules,
                          isMatchData: isEmptyColumn,
                        },
                        turnData: {
                          extraName: extraName || "",
                        },
                      });
                    }
                  );
                }}
              />
            </span>
            <button
              style={{
                fontSize: "18px",
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (upLoadEle?.current?.files?.length > 0) {
                  fileFilter(upLoadEle.current.files, fileSuffix).then(
                    (fileList: Array<File>) => {
                      readFileList({
                        fileData: {
                          fileList: fileList,
                          fileSuffix: fileSuffix,
                          codeFormat: encoding,
                        },
                        matchData: {
                          columnSepara: columnSeparator,
                          rowSepara: rowSeparator,
                          dataKinds: dataKinds,
                          needFilFirst: isFilFirst,
                          matchRules: matchRules,
                          isMatchData: isEmptyColumn,
                        },
                        turnData: {
                          extraName: extraName || "",
                        },
                      });
                    }
                  );
                } else if (upLoadEle?.current?.fileList?.length > 0) {
                  fileFilter(upLoadEle.current.files, fileSuffix).then(
                    (fileList: Array<File>) => {
                      readFileList({
                        fileData: {
                          fileList: fileList,
                          fileSuffix: fileSuffix,
                          codeFormat: encoding,
                        },
                        matchData: {
                          columnSepara: columnSeparator,
                          rowSepara: rowSeparator,
                          dataKinds: dataKinds,
                          needFilFirst: isFilFirst,
                          matchRules: matchRules,
                          isMatchData: isEmptyColumn,
                        },
                        turnData: {
                          extraName: extraName || "",
                        },
                      });
                    }
                  );
                } else {
                  openNotification("请上传文件夹", 2);
                  uploadDirectoryOrFile(true);
                }
              }}
            >
              再次导出
            </button>
            <br />
          </div>
          <span
            style={{
              fontSize: "20px",
              marginLeft: "10px",
            }}
          >
            第一步——新建或修改提取规则：
          </span>
          <br />
        </div>
        <span
          style={{
            fontSize: "20px",
            margin: "0 20px",
          }}
        >
          一.1:智能生成规则
        </span>
        {possibleKeys.length > 0 && (
          <span
            style={{
              fontSize: "18px",
              textDecoration: "underline",
              cursor: "pointer",
              color: "rgb(44,155,155)",
            }}
            onClick={() => setKeyNeedSelect(true)}
          >
            重新选择提取规则
          </span>
        )}
        <div
          style={{
            height: "330px",
            width: "100%",
          }}
          className={styles["filter-area"]}
        >
          <div
            style={{
              width: "100%",
              height: "30px",
            }}
          >
            <span
              style={{
                color: "rgb(51,51,51)",
                fontSize: "18px",
                marginBottom: "5px",
                marginLeft: "20px",
                display: "inline-block",
              }}
            >
              上传文件:
              <input
                id={"input-file"}
                style={{
                  marginLeft: "10px",
                }}
                type="file"
                onChange={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  if (event?.target?.files?.length) {
                    setPossibleData(event.target.files[0]);
                  }
                }}
              />
            </span>
          </div>
          <textarea
            ref={textEle}
            key={`textArea${textAreaValue?.length || "null"}`}
            defaultValue={textAreaValue || undefined}
            placeholder={"在此粘贴文本进行设置提取规则"}
            onChange={(ele) => {
              if (ele?.target?.value?.length > 0) {
                showReview();
                getPossibleKeysFromText(
                  ele?.target?.value,
                  rowSeparator,
                  dataKinds
                ).then((res) => {
                  if (res.length > 0) {
                    setPossibleKeys(res);
                    setKeyNeedSelect(true);
                  } else {
                    setPossibleKeys([]);
                    setKeyNeedSelect(false);
                    openNotification(
                      "无法自动生成规则，请检查文本是否正确或手动输入规则",
                      5
                    );
                  }
                });
              }
            }}
            style={{
              float: "left",
              display: "block",
              height: "300px",
              width: "40%",
              overflow: "auto",
              border: "1px solid rgb(51,51,51)",
            }}
          />
          <div
            style={{
              height: "300px",
              float: "left",
              width: "40%",
              position: "relative",
              overflow: "visible",
              marginLeft: "2%",
              border:
                jsonForTurn?.length > 0 ? "none" : "1px solid rgb(51,51,51)",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                textDecoration: "underline",
                position: "absolute",
                left: 0,
                top: "-25px",
                display: "block",
                width: "100%",
              }}
              onClick={() => {
                if (textEle?.current?.value?.length > 0) {
                  if (showReview()) {
                  } else {
                    openNotification(
                      "无提取信息，请仔细检查（！列的完整性！）及（！类型！）是否准确",
                      4
                    );
                  }
                } else {
                  openNotification("请先输入测试文本", 4);
                }
              }}
            >
              <a
                style={
                  isShowFull
                    ? {
                        color: "rgb(236,65,65)",
                        backgroundColor: "rgb(253,245,245)",
                        borderRadius: "30px",
                        margin: "0 15px",
                        padding: "0 10px",
                      }
                    : {
                        margin: "0 15px",
                        color: "rgb(112,112,112)",
                        padding: "0 10px",
                      }
                }
                onClick={() => setIsShowFull(true)}
              >
                完整预览
              </a>
              <a
                style={
                  isShowFull
                    ? {
                        margin: "0 15px",
                        color: "rgb(112,112,112)",
                        padding: "0 10px",
                      }
                    : {
                        color: "rgb(236,65,65)",
                        backgroundColor: "rgb(253,245,245)",
                        borderRadius: "30px",
                        margin: "0 15px",
                        padding: "0 10px",
                      }
                }
                onClick={() => setIsShowFull(false)}
              >
                简略预览
              </a>

              <a
                style={
                  jsonForTurn?.length > 0
                    ? {
                        marginLeft: "20%",
                      }
                    : { display: "none" }
                }
                onClick={() => {
                  startFilTime = new Date().getTime();
                  getNeedJson([
                    {
                      index: 0,
                      fileName: "演示文本" + (extraName || ""),
                      json: jsonForTurn,
                    },
                  ]).then((needObj) => {
                    setCheckRecords(needObj?.records || []);
                    if (needObj?.arrJson?.length) {
                      downloadExcel({
                        tjson: needObj.arrJson,
                        tmatchRules: matchRules,
                        filename: "演示文本" + (extraName || ""),
                        fileLength: 1,
                        isMatchData: isEmptyColumn,
                        columnSepa: columnSeparator,
                        needFilFirst: false,
                        isNeedMerge: isNeedMerge,
                        currentRecords: [],
                        currentHisKeys: historyKeys,
                        startFilTime: startFilTime,
                      }).then((downloadInfo) => {
                        setLoadingState(0);
                        setLoadingMessage(null);
                        if (downloadInfo) {
                          setCheckRecords(downloadInfo.newRecords);
                          setHistoryKeys(downloadInfo.newHisKeys);
                        } else {
                          openNotification("没有提取到信息", 5);
                        }
                      });
                    } else {
                      setLoadingState(0);
                      setLoadingMessage(null);
                      openNotification("没有提取到信息", 5);
                    }
                  });
                }}
              >
                将此表格导出为xlsx
              </a>
            </span>
            {jsonForTurn?.length > 0 ? (
              <table ref={tableEle}>
                {
                  <thead>
                    <tr key={"dataTitle"}>
                      {isNeedMerge ? (
                        <th colSpan={matchRules.length + 1} key={"mergename"}>
                          {textName}
                        </th>
                      ) : (
                        matchRules.map((res, index: number) =>
                          jsonForTurn[0][`${textName}-列${index + 1}`] ||
                          jsonForTurn[0][`${textName}-列${index + 1}`] === 0 ? (
                            <th key={`keyshead${index}`}>{textName}</th>
                          ) : (
                            <></>
                          )
                        )
                      )}
                    </tr>
                  </thead>
                }
                <tbody>
                  {jsonForTurn.length < 6 || isShowFull ? (
                    jsonForTurn.map((obj: jsonType, jsonIndex: number) => (
                      <tr key={`jsonForTurn${jsonIndex}`}>
                        {matchRules.map((res, index: number) =>
                          obj[`${textName}-列${index + 1}`] ||
                          obj[`${textName}-列${index + 1}`] === 0 ? (
                            <td key={`jsonForTurn${jsonIndex}keys${index}`}>
                              {obj[`${textName}-列${index + 1}`]}
                            </td>
                          ) : (
                            <></>
                          )
                        )}
                      </tr>
                    ))
                  ) : (
                    <>
                      {jsonForTurn
                        .slice(0, 3)
                        .map((obj: jsonType, jsonIndex: number) => (
                          <tr key={`jsonForTurn${jsonIndex}`}>
                            {matchRules.map((res, index: number) =>
                              obj[`${textName}-列${index + 1}`] ||
                              obj[`${textName}-列${index + 1}`] === 0 ? (
                                <td key={`jsonForTurn${jsonIndex}keys${index}`}>
                                  {obj[`${textName}-列${index + 1}`]}
                                </td>
                              ) : (
                                <></>
                              )
                            )}
                          </tr>
                        ))}
                      <tr
                        key={"dataFold"}
                        style={{
                          verticalAlign: "middle",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setIsShowFull(true);
                        }}
                      >
                        <td
                          key={"dataFoldMessage"}
                          colSpan={matchRules.length + 1}
                        >
                          ...（还有{jsonForTurn.length - 5}条数据）展开
                        </td>
                      </tr>
                      {jsonForTurn
                        .slice(jsonForTurn.length - 2, jsonForTurn.length)
                        .map((obj: jsonType, jsonIndex: number) => (
                          <tr key={`jsonForTurn${jsonIndex}`}>
                            {matchRules.map((res, index: number) =>
                              obj[`${textName}-列${index + 1}`] ||
                              obj[`${textName}-列${index + 1}`] === 0 ? (
                                <td key={`jsonForTurn${jsonIndex}keys${index}`}>
                                  {obj[`${textName}-列${index + 1}`]}
                                </td>
                              ) : (
                                <></>
                              )
                            )}
                          </tr>
                        ))}
                    </>
                  )}
                </tbody>
              </table>
            ) : (
              <p
                key={"nullData"}
                style={{
                  fontSize: "28px",
                  marginTop: "10%",
                  textAlign: "center",
                }}
              >
                无数据
              </p>
            )}
          </div>
        </div>
        <div
          style={{
            margin: "5px 0",
            fontSize: "16px",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              margin: " 0 20px",
            }}
          >
            一.2:进一步筛选
          </span>
          {matchRules.map((res: matchRuleType, index: number) =>
            isEmptyColumn ? (
              <span
                key={`keysfilter${index}`}
                onClick={(event: any) => {
                  event.stopPropagation();
                  let trules: Array<matchRuleType> = [...matchRules];
                  trules[index].isNeed = !trules[index]?.isNeed;
                  setMatchRules(trules);
                }}
                style={{
                  border: "1px solid rgb(97,97,97)",
                  color: "rgb(51,51,51)",
                  margin: "0 5px",
                }}
              >
                <input
                  key={`isNeedCheckBox${res.isNeed}`}
                  type="checkbox"
                  checked={res.isNeed}
                  readOnly={true}
                />
                <span>
                  第{index + 1}列：
                  <Dropdown
                    overlay={
                      <Menu>
                        {dataKinds.map((value, inOfVa) => (
                          <Menu.Item
                            key={`keyscolumn${index}dataKinds${inOfVa}`}
                          >
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                let currentRules = [...matchRules];
                                setNewMatchRules(currentRules, {
                                  ruleIndex: index,
                                  dataKindIndex: inOfVa,
                                  isAutoAdd: false,
                                });
                              }}
                            >
                              {value.text}
                            </a>
                          </Menu.Item>
                        ))}
                      </Menu>
                    }
                  >
                    <a className="ant-dropdown-link">
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          let tvalueIndex: number =
                            matchRules[index].dataKindIndex;
                          if (tvalueIndex > dataKinds.length - 2) {
                            tvalueIndex = 0;
                          } else {
                            tvalueIndex = tvalueIndex + 1;
                          }
                          let currentRules = [...matchRules];
                          setNewMatchRules(currentRules, {
                            ruleIndex: index,
                            dataKindIndex: tvalueIndex,
                            isAutoAdd: !isEmptyColumn,
                          });
                        }}
                      >
                        {dataKinds[res.dataKindIndex].text}
                      </span>
                      <DownOutlined />
                    </a>
                  </Dropdown>
                </span>
              </span>
            ) : (
              res.key.length > 0 && (
                <span
                  key={`isEmpty-Columnkeys-filter${index}`}
                  onClick={(event: any) => {
                    event.stopPropagation();
                    let trules = [...matchRules];
                    trules[index].isNeed = !trules[index].isNeed;
                    setMatchRules(trules);
                  }}
                  style={{
                    border: "1px solid rgb(97,97,97)",
                    color: "rgb(51,51,51)",
                    margin: "0 5px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    key={`isNeedCheckBox${res.isNeed}`}
                    style={{
                      cursor: "pointer",
                    }}
                    type="checkbox"
                    checked={res.isNeed}
                    readOnly={true}
                  />
                  <span>
                    {res.key}
                    &#40; 类型:
                    <Dropdown
                      overlay={
                        <Menu>
                          {dataKinds.map((value, inOfVa) => (
                            <Menu.Item
                              key={`keyscolumn${index}dataKinds${inOfVa}`}
                            >
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  let currentRules = [...matchRules];
                                  setNewMatchRules(currentRules, {
                                    ruleIndex: index,
                                    dataKindIndex: inOfVa,
                                    isAutoAdd: true,
                                  });
                                }}
                              >
                                {value.text}
                              </a>
                            </Menu.Item>
                          ))}
                        </Menu>
                      }
                    >
                      <a className="ant-dropdown-link">
                        <span
                          style={{
                            textDecoration: "underline",
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            let tvalueIndex: number =
                              matchRules[index].dataKindIndex;
                            if (tvalueIndex > dataKinds.length - 2) {
                              tvalueIndex = 0;
                            } else {
                              tvalueIndex = tvalueIndex + 1;
                            }
                            let currentRules = [...matchRules];
                            setNewMatchRules(currentRules, {
                              ruleIndex: index,
                              dataKindIndex: tvalueIndex,
                              isAutoAdd: !isEmptyColumn,
                            });
                          }}
                        >
                          {dataKinds[res.dataKindIndex].text}
                        </span>
                        <DownOutlined />
                      </a>
                    </Dropdown>
                    &#41;
                  </span>
                </span>
              )
            )
          )}
          <a
            key={`filFirst${isFilFirst}`}
            className={styles[`filFirstFile-${isFilFirst ? "true" : "false"}`]}
            onClick={() => {
              setIsFilFirst(!isFilFirst);
            }}
          >
            保留第一个文件的所有数据
          </a>
        </div>
        <span
          style={{
            fontSize: "20px",
            marginLeft: "20px",
          }}
        >
          一.1-1:自定义规则
        </span>
        <div
          style={{
            display: "inline-block",
            border: "1px solid rgb(51,51,51)",
            margin: "0 10px ",
          }}
        >
          分隔符&#40;注意中英文差异&#41;：
          <input
            key={"column-input"}
            type="text"
            placeholder={`${getPlaceFromCurrent(
              getNameFromSepa(columnSeparator)
            )}`}
            onChange={columnSeOnChange}
          />
        </div>
        <a
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            let b = isEmptyColumn;
            if (b) {
              openNotification("请输入数据之前的一行（固定的）", 1);
            } else {
              openNotification("请输入第一行数据", 2);
            }
            setIsEmptyColumn(!b);
          }}
          style={
            isEmptyColumn
              ? {
                  fontSize: "18px",
                  margin: "0 15px",
                  color: "rgb(112,112,112)",
                  padding: "0 10px",
                }
              : {
                  color: "rgb(236,65,65)",
                  fontSize: "18px",
                  backgroundColor: "rgb(253,245,245)",
                  borderRadius: "30px",
                  margin: "0 15px",
                  padding: "0 10px",
                }
          }
        >
          数据前有固定的一行
        </a>
        <div
          style={{
            display: "inline-block",
            border: "1px solid rgb(51,51,51)",
          }}
        >
          {isEmptyColumn ? "第一行数据：" : "数据前的固定行："}
          <input
            type="value"
            key={`startLine-input`}
            placeholder={"请先输入分隔符"}
            ref={startLineEle}
            onChange={startLineOnChange}
          />
        </div>
        <br />
        <span
          style={{
            fontSize: "28px",
          }}
        >
          其他功能：
        </span>
        <div
          style={{
            verticalAlign: "middle",
            lineHeight: "40px",
          }}
        >
          <a
            style={
              isNeedMerge
                ? {
                    fontSize: "18px",
                    margin: "0 15px",
                    color: "rgb(112,112,112)",
                    padding: "0 10px",
                  }
                : {
                    color: "rgb(236,65,65)",
                    fontSize: "18px",
                    backgroundColor: "rgb(253,245,245)",
                    borderRadius: "30px",
                    margin: "0 15px",
                    padding: "0 10px",
                  }
            }
            onClick={() => {
              setIsNeedMerge((isNeedMerge) => !isNeedMerge);
            }}
          >
            取消自动合并单元格（可在excel中取消合并）
          </a>
          <div className={styles["filter"]}>
            <span style={{ color: "rgb(236,65,65)" }}>文件后缀：</span>
            <input
              type="text"
              style={{
                width: "150px",
              }}
              onChange={(ele) => {
                if (ele?.currentTarget?.value?.length > 0) {
                  let value = ele.currentTarget.value;
                  if (/\.$/.test(value)) {
                    setFileSuffix(value);
                  } else {
                    setFileSuffix(`.${value}`);
                  }
                } else {
                  setFileSuffix(".*");
                }
              }}
              placeholder={"默认所有文件"}
            />
            <span>编码格式：</span>
            <input
              type="text"
              placeholder={`${getPlaceFromCurrent(encoding)}`}
              onChange={(ele) => {
                if (ele?.target?.value?.length > 0) {
                  setEncodeing(ele?.target?.value);
                } else {
                  setEncodeing(initEncodes[0]);
                }
              }}
            />
            <Dropdown
              overlay={
                <Menu>
                  {initEncodes.map((encode, index: number) => (
                    <Menu.Item key={`initEncodes${index}`}>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          setEncodeing(encode);
                        }}
                      >
                        {encode}
                      </a>
                    </Menu.Item>
                  ))}
                </Menu>
              }
            >
              <a
                onClick={() => {
                  let index: number = initEncodes.indexOf(encoding);
                  if (index < 0 || index === initEncodes.length - 1) {
                    setEncodeing(initEncodes[0]);
                  } else {
                    setEncodeing(initEncodes[index + 1]);
                  }
                }}
              >
                <span
                  style={{
                    color: "rgb(236,65,65)",
                    backgroundColor: "rgb(253,245,245)",
                    borderRadius: "20px",
                    padding: "0 10px",
                  }}
                >
                  {encoding}
                </span>
                <DownOutlined />
              </a>
            </Dropdown>
          </div>
        </div>
        <div
          style={{
            height: "300px",
            width: "16%",
            position: "relative",
            marginLeft: "2%",
            border: "1px solid rgb(51,51,51)",
            float: "left",
            marginTop: "25px",
          }}
        >
          <span
            style={
              checkRecords?.length > 0
                ? {
                    fontSize: "12px",
                    fontWeight: "bold",
                    position: "absolute",
                    left: 0,
                    top: "-20px",
                    color: "green",
                  }
                : {
                    fontSize: "12px",
                    fontWeight: "bold",
                    position: "absolute",
                    left: 0,
                    top: "-20px",
                  }
            }
          >
            数据完整性检测：&nbsp;{checkRecords?.length > 0 && `OK`}
          </span>
          <div
            style={{
              overflow: "auto",
              height: "300px",
            }}
          >
            {checkRecords?.map((res, index: number) => (
              <p
                key={`checkRecords${index}`}
                style={{
                  wordBreak: "break-all",
                }}
              >
                {res}
              </p>
            ))}
          </div>
        </div>

        <span
          style={{
            margin: "20px 0",
            display: "block",
            fontSize: "16px",
          }}
        >
          提取列：
          <a
            onClick={() => {
              setMatchRules((matchRules) =>
                matchRules.concat([
                  {
                    dataKindIndex: 0,
                    isNeed: true,
                    key: "",
                  },
                ])
              );
            }}
            style={{
              fontSize: "28px",
              margin: "0 15px",
            }}
          >
            <PlusCircleOutlined />
          </a>
          <a
            onClick={() => {
              setMatchRules((rules) => rules.slice(0, rules.length - 1 || 1));
            }}
            style={{
              fontSize: "28px",
              margin: "0 15px",
            }}
          >
            <MinusCircleOutlined />
          </a>
          <br />
          <div
            style={{
              display: "inline-block",
              marginTop: "10px",
              border: "1px solid rgb(51,51,51)",
            }}
          >
            行分隔符：
            <input
              type="text"
              placeholder={`${getPlaceFromCurrent(
                "换行/回车符"
              )}（不建议修改）`}
              style={{
                width: "20em",
              }}
              onChange={(ele) => {
                ele.stopPropagation();
                ele.preventDefault();
                let columnSe: string = ele?.target?.value || "";
                if (columnSe.length > 0) {
                  setRowSeparator(columnSe);
                } else {
                  setRowSeparator(initSeparator.rowSepa);
                }
              }}
            />
          </div>
        </span>
        {matchRules.map((res, index: number) => (
          <div
            key={`keyscolumn${index}`}
            style={{
              display: "inline-block",
              marginRight: "20px",
              border: "1px solid rgb(51,51,51)",
            }}
          >
            <span>列{index + 1}：</span>
            <input
              type="text"
              placeholder={
                res.key?.length > 0
                  ? `${getPlaceFromCurrent(res.key)}`
                  : index === matchRules.length - 1
                  ? "无值，将忽略"
                  : "请输入列名"
              }
              onChange={(ele: any) => {
                let currentRules = [...matchRules];
                setNewMatchRules(currentRules, {
                  ruleIndex: index,
                  key: ele?.currentTarget?.value || "",
                });
                // getNewMatchRules(matchRules,
                //   {
                //     ruleIndex:index,
                //     key:ele?.currentTarget?.value || '',

                //   })
              }}
              style={
                isEmptyColumn
                  ? { display: "none" }
                  : res.key.length > 0 || index === matchRules.length - 1
                  ? {}
                  : { border: "3px solid red" }
              }
            />
            <span>类型：</span>
            <Dropdown
              overlay={
                <Menu>
                  {dataKinds.map((value, inOfVa) => (
                    <Menu.Item key={`keyscolumn${index}dataKinds${inOfVa}`}>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          let currentRules = [...matchRules];
                          setNewMatchRules(currentRules, {
                            ruleIndex: index,
                            dataKindIndex: inOfVa,
                          });
                          // getNewMatchRules(matchRules,{
                          //   ruleIndex:index,
                          //   dataKindIndex:inOfVa
                          // }).then(res=>setMatchRules(res))
                        }}
                      >
                        {value.text}
                      </a>
                    </Menu.Item>
                  ))}
                </Menu>
              }
            >
              <a className="ant-dropdown-link">
                <span
                  style={
                    isEmptyColumn
                      ? {
                          color: "red",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }
                      : {
                          textDecoration: "underline",
                        }
                  }
                  onClick={(event: any) => {
                    event.stopPropagation();
                    let tvalueIndex: number = matchRules[index].dataKindIndex;
                    if (tvalueIndex > dataKinds.length - 2) {
                      tvalueIndex = 0;
                    } else {
                      tvalueIndex = tvalueIndex + 1;
                    }
                    let currentRules = [...matchRules];
                    setNewMatchRules(currentRules, {
                      ruleIndex: index,
                      dataKindIndex: tvalueIndex,
                    });
                    // getNewMatchRules(matchRules,{
                    //   ruleIndex:index,
                    //   dataKindIndex:tvalueIndex
                    // }).then(res=>setMatchRules(res))
                    event = null;
                  }}
                >
                  {dataKinds[res.dataKindIndex].text}
                </span>
                <DownOutlined />
              </a>
            </Dropdown>
          </div>
        ))}
        <a
          onClick={() => {
            setMatchRules((rules) => [
              ...rules,
              {
                dataKindIndex: 0,
                isNeed: true,
                key: "",
              },
            ]);
          }}
          style={{ fontSize: "28px", margin: "0 15px" }}
        >
          <PlusCircleOutlined />
        </a>
        <a
          onClick={() => {
            setMatchRules((rules) => rules.slice(0, rules.length - 1 || 1));
          }}
          style={{ fontSize: "28px", margin: "0 15px" }}
        >
          <MinusCircleOutlined />
        </a>
        <br />
      </div>
    </div>
  );
};

export default MainPage;
