interface MyPromiseProps {
  handler: (resolve: () => void, reason: () => void) => void;
}

class MyPromise {
  constructor(hadnler: MyPromiseProps) {
    // hadnler(this._)
  }
  then(resolve: (data: any) => void, reject: (reason: any) => void) {
    this._resolve = resolve;
    this._reject = reject;
    return this;
  }
  _resolve(data: any) {
    setTimeout(() => {
      this.then(this._resolve, this._reject);
    }, 0);
  }
  _reject(reason: any) {
    setTimeout(() => {
      this.then(this._resolve, this._reject);
    }, 0);
  }
}
new Promise((resolve, reject) => {
  resolve(null);
})
  .then(
    (data) => {},
    (reason) => {}
  )
  .then((data) => {});

new Promise((resolve, reject) => {});
