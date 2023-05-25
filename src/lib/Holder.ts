class Holder<T> {
  promise: Promise<T>;
  resolve: Function;
  reject: Function;
  constructor() {
    this.promise = new Promise((resolve, reject) =>
      Object.assign(this, { reject, resolve }),
    );
  }
}

export default Holder;
