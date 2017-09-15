class A {
  constructor (){
    this.a = 0;
  }
  static s(){
    console.log(this);
  }
}

console.log(A.s)