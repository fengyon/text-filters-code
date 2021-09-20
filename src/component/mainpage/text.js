const getType = (data) => Object.prototype.toString.call(data);
let variousData = [
  { type: [], cloneFun: (arr) => arr.map((data) => deepClone(data)) },
  {
    type: {},
    cloneFun: (obj) => {
      let objForR = {};
      objForR.__proto__ = obj.prototype;
      Object.keys(obj).forEach(
        (key) => (objForR[`${key}`] = deepClone(obj[`${key}`]))
      );
      return objForR;
    },
  },
  {
    type: new Set(),
    cloneFun: (set) => {
      let setR = new Set();
      set.forEach((data) => setR.add(deepClone(setR)));
      return setR;
    },
  },
  {
    type: new Map(),
    cloneFun: (map) => {
      let mapR = new Map();
      map.forEach((value, key) => mapR.set(deepClone(value), deepClone(key)));
      return mapR;
    },
  },
];
let cloneFunctions = variousData.reduce((obj, data) => {
  obj[`${getType(data.type)}`] = data.cloneFun;
  return obj;
}, {});
variousData = null; //释放资源
const deepClone = (data) => {
  if (cloneFunctions[`${getType(data)}`]) {
    return cloneFunctions[`${getType(data)}`](data);
  } else {
    return data;
  }
};
