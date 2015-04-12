// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

assertEquals(42, function*() {}().return(42).value);
assertEquals(42, function*() { yield }().return(42).value);

var sentinel = {};

(function TestTryCatch() {
  function* g() {
    try {
      yield 1;
    } catch (e) {
      yield 2;
    }
  }
  var it = g();
  assertEquals(1, it.next().value);
  it.throw(Error());
  assertEquals(sentinel, it.return(sentinel).value);
})();

(function TestTryFinallyReturn() {
  var fins = 0;
  function* g() {
    try {
      yield 1;
    } finally {
      fins += 1;
      return sentinel;
    }
  }
  var it = g();
  assertEquals(0, fins);
  assertEquals(1, it.next().value);
  assertEquals(0, fins);
  assertEquals(sentinel, it.return().value);
  assertEquals(1, fins);
})();

(function TestNestedTryFinallyReturn() {
  var innerfins = 0;
  var outerfins = 0;
  function* g() {
    try {
      yield 1;
    } finally {
      outerfins += 1;
      try {
        yield 2;
      } finally {
        innerfins += 1;
        yield 3;
      }
      outerfins += 1;
      yield 4;
    }
    throw 'unreachable';
  }
  var it = g();
  assertEquals(0, innerfins);
  assertEquals(0, outerfins);
  assertEquals(1, it.next().value);
  assertEquals(0, innerfins);
  assertEquals(0, outerfins);
  assertEquals(2, it.return().value);
  assertEquals(0, innerfins);
  assertEquals(1, outerfins);
  assertEquals(3, it.return().value);
  assertEquals(1, innerfins);
  assertEquals(1, outerfins);
  //assertEquals(4, it.return().value);
  //assertEquals(1, innerfins);
  //assertEquals(2, outerfins);
  assertEquals(sentinel, it.return(sentinel).value);
})();

(function TestTryFinallyYieldReturnNext() {
  var fins = 0;
  function* g() {
    try {
      yield 1;
    } finally {
      fins += 1;
      yield 2;
      fins += 1;
    }
  }
  var it = g();
  assertEquals(0, fins);
  assertEquals(1, it.next().value);
  assertEquals(0, fins);
  assertEquals(2, it.return(sentinel).value);
  assertEquals(1, fins);
  assertEquals(sentinel, it.next().value);
  assertEquals(2, fins);
  //assertEquals(undefined, it.next().value);
})();

(function TestTryFinallyYieldReturnReturn() {
  var fins = 0;
  function* g() {
    try {
      yield 1;
    } finally {
      fins += 1;
      yield 2;
      fins += 1;
    }
  }
  var it = g();
  assertEquals(0, fins);
  assertEquals(1, it.next().value);
  assertEquals(0, fins);
  assertEquals(2, it.return(sentinel).value);
  assertEquals(1, fins);
  var marker = {};
  assertEquals(sentinel, it.return(marker).value);
  assertEquals(1, fins);
  for (var i = 0; i < 42; i += 1) {
    var marker = {};
    assertEquals(marker, it.return(marker).value);
    assertEquals(1, fins);
  }
})();

(function TestTryFinallyBreakYield() {
  var fins = 0;
  function* g() {
    L: try {
      yield 1;
    } finally {
      fins += 1;
      break L;
    }
    yield 2;
  }
  var it = g();
  assertEquals(0, fins);
  assertEquals(1, it.next().value);
  assertEquals(0, fins);
  assertEquals(2, it.return(sentinel).value);
  assertEquals(1, fins);
  assertEquals(undefined, it.next().value);
  assertEquals(undefined, it.next().value);
})();

(function TestTryFinallyBreakReturn() {
  var fins = 0;
  function* g() {
    L: try {
      yield 1;
    } finally {
      fins += 1;
      break L;
    }
    return 2;
  }
  var it = g();
  assertEquals(0, fins);
  assertEquals(1, it.next().value);
  assertEquals(0, fins);
  assertEquals(2, it.return(sentinel).value);
  assertEquals(1, fins);
  assertEquals(undefined, it.next().value);
  assertEquals(undefined, it.next().value);
})();
