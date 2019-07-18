var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(A, h, M) {
    A != Array.prototype && A != Object.prototype && (A[h] = M.value)
};
$jscomp.getGlobal = function(A) {
    return "undefined" != typeof window && window === A ? A : "undefined" != typeof global && null != global ? global : A
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function(A, h) {
    if (h) {
        var M = $jscomp.global;
        A = A.split(".");
        for (var P = 0; P < A.length - 1; P++) {
            var ka = A[P];
            ka in M || (M[ka] = {});
            M = M[ka]
        }
        A = A[A.length - 1];
        P = M[A];
        h = h(P);
        h != P && null != h && $jscomp.defineProperty(M, A, {
            configurable: !0,
            writable: !0,
            value: h
        })
    }
};
$jscomp.polyfill("Math.trunc", function(A) {
    return A ? A : A = function(h) {
        h = Number(h);
        if (isNaN(h) || Infinity === h || -Infinity === h || 0 === h) return h;
        var M = Math.floor(Math.abs(h));
        return 0 > h ? -M : M
    }
}, "es6", "es3");
$jscomp.arrayIteratorImpl = function(A) {
    var h = 0;
    return function() {
        return h < A.length ? {
            done: !1,
            value: A[h++]
        } : {
            done: !0
        }
    }
};
$jscomp.arrayIterator = function(A) {
    return {
        next: $jscomp.arrayIteratorImpl(A)
    }
};
$jscomp.makeIterator = function(A) {
    var h = "undefined" != typeof Symbol && Symbol.iterator && A[Symbol.iterator];
    return h ? h.call(A) : $jscomp.arrayIterator(A)
};
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill("Promise", function(A) {
    function h() {
        this.batch_ = null
    }

    function M(D) {
        return D instanceof V ? D : new V(function(I) {
            I(D)
        })
    }
    if (A && !$jscomp.FORCE_POLYFILL_PROMISE) return A;
    h.prototype.asyncExecute = function(D) {
        if (null == this.batch_) {
            this.batch_ = [];
            var I = this;
            this.asyncExecuteFunction(function() {
                I.executeBatch_()
            })
        }
        this.batch_.push(D)
    };
    var P = $jscomp.global.setTimeout;
    h.prototype.asyncExecuteFunction = function(D) {
        P(D, 0)
    };
    h.prototype.executeBatch_ = function() {
        for (; this.batch_ && this.batch_.length;) {
            var D =
                this.batch_;
            this.batch_ = [];
            for (var I = 0; I < D.length; ++I) {
                var O = D[I];
                D[I] = null;
                try {
                    O()
                } catch (Y) {
                    this.asyncThrow_(Y)
                }
            }
        }
        this.batch_ = null
    };
    h.prototype.asyncThrow_ = function(D) {
        this.asyncExecuteFunction(function() {
            throw D;
        })
    };
    var ka = {
            PENDING: 0,
            FULFILLED: 1,
            REJECTED: 2
        },
        V = function(D) {
            this.state_ = ka.PENDING;
            this.result_ = void 0;
            this.onSettledCallbacks_ = [];
            var I = this.createResolveAndReject_();
            try {
                D(I.resolve, I.reject)
            } catch (O) {
                I.reject(O)
            }
        };
    V.prototype.createResolveAndReject_ = function() {
        function D(Y) {
            return function(ia) {
                O ||
                    (O = !0, Y.call(I, ia))
            }
        }
        var I = this,
            O = !1;
        return {
            resolve: D(this.resolveTo_),
            reject: D(this.reject_)
        }
    };
    V.prototype.resolveTo_ = function(D) {
        if (D === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
        else if (D instanceof V) this.settleSameAsPromise_(D);
        else {
            a: switch (typeof D) {
                case "object":
                    var I = null != D;
                    break a;
                case "function":
                    I = !0;
                    break a;
                default:
                    I = !1
            }
            I ? this.resolveToNonPromiseObj_(D) : this.fulfill_(D)
        }
    };
    V.prototype.resolveToNonPromiseObj_ = function(D) {
        var I = void 0;
        try {
            I = D.then
        } catch (O) {
            this.reject_(O);
            return
        }
        "function" == typeof I ? this.settleSameAsThenable_(I, D) : this.fulfill_(D)
    };
    V.prototype.reject_ = function(D) {
        this.settle_(ka.REJECTED, D)
    };
    V.prototype.fulfill_ = function(D) {
        this.settle_(ka.FULFILLED, D)
    };
    V.prototype.settle_ = function(D, I) {
        if (this.state_ != ka.PENDING) throw Error("Cannot settle(" + D + ", " + I + "): Promise already settled in state" + this.state_);
        this.state_ = D;
        this.result_ = I;
        this.executeOnSettledCallbacks_()
    };
    V.prototype.executeOnSettledCallbacks_ = function() {
        if (null != this.onSettledCallbacks_) {
            for (var D =
                    0; D < this.onSettledCallbacks_.length; ++D) Qb.asyncExecute(this.onSettledCallbacks_[D]);
            this.onSettledCallbacks_ = null
        }
    };
    var Qb = new h;
    V.prototype.settleSameAsPromise_ = function(D) {
        var I = this.createResolveAndReject_();
        D.callWhenSettled_(I.resolve, I.reject)
    };
    V.prototype.settleSameAsThenable_ = function(D, I) {
        var O = this.createResolveAndReject_();
        try {
            D.call(I, O.resolve, O.reject)
        } catch (Y) {
            O.reject(Y)
        }
    };
    V.prototype.then = function(D, I) {
        function O(K, ra) {
            return "function" == typeof K ? function(wa) {
                    try {
                        Y(K(wa))
                    } catch (fb) {
                        ia(fb)
                    }
                } :
                ra
        }
        var Y, ia, Ia = new V(function(K, ra) {
            Y = K;
            ia = ra
        });
        this.callWhenSettled_(O(D, Y), O(I, ia));
        return Ia
    };
    V.prototype["catch"] = function(D) {
        return this.then(void 0, D)
    };
    V.prototype.callWhenSettled_ = function(D, I) {
        function O() {
            switch (Y.state_) {
                case ka.FULFILLED:
                    D(Y.result_);
                    break;
                case ka.REJECTED:
                    I(Y.result_);
                    break;
                default:
                    throw Error("Unexpected state: " + Y.state_);
            }
        }
        var Y = this;
        null == this.onSettledCallbacks_ ? Qb.asyncExecute(O) : this.onSettledCallbacks_.push(O)
    };
    V.resolve = M;
    V.reject = function(D) {
        return new V(function(I,
            O) {
            O(D)
        })
    };
    V.race = function(D) {
        return new V(function(I, O) {
            for (var Y = $jscomp.makeIterator(D), ia = Y.next(); !ia.done; ia = Y.next()) M(ia.value).callWhenSettled_(I, O)
        })
    };
    V.all = function(D) {
        var I = $jscomp.makeIterator(D),
            O = I.next();
        return O.done ? M([]) : new V(function(Y, ia) {
            function Ia(wa) {
                return function(fb) {
                    K[wa] = fb;
                    ra--;
                    0 == ra && Y(K)
                }
            }
            var K = [],
                ra = 0;
            do K.push(void 0), ra++, M(O.value).callWhenSettled_(Ia(K.length - 1), ia), O = I.next(); while (!O.done)
        })
    };
    return V
}, "es6", "es3");
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function() {
    $jscomp.initSymbol = function() {};
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol)
};
$jscomp.SymbolClass = function(A, h) {
    this.$jscomp$symbol$id_ = A;
    $jscomp.defineProperty(this, "description", {
        configurable: !0,
        writable: !0,
        value: h
    })
};
$jscomp.SymbolClass.prototype.toString = function() {
    return this.$jscomp$symbol$id_
};
$jscomp.Symbol = function() {
    function A(M) {
        if (this instanceof A) throw new TypeError("Symbol is not a constructor");
        return new $jscomp.SymbolClass($jscomp.SYMBOL_PREFIX + (M || "") + "_" + h++, M)
    }
    var h = 0;
    return A
}();
$jscomp.initSymbolIterator = function() {
    $jscomp.initSymbol();
    var A = $jscomp.global.Symbol.iterator;
    A || (A = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("Symbol.iterator"));
    "function" != typeof Array.prototype[A] && $jscomp.defineProperty(Array.prototype, A, {
        configurable: !0,
        writable: !0,
        value: function() {
            return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))
        }
    });
    $jscomp.initSymbolIterator = function() {}
};
$jscomp.initSymbolAsyncIterator = function() {
    $jscomp.initSymbol();
    var A = $jscomp.global.Symbol.asyncIterator;
    A || (A = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol("Symbol.asyncIterator"));
    $jscomp.initSymbolAsyncIterator = function() {}
};
$jscomp.iteratorPrototype = function(A) {
    $jscomp.initSymbolIterator();
    A = {
        next: A
    };
    A[$jscomp.global.Symbol.iterator] = function() {
        return this
    };
    return A
};
$jscomp.iteratorFromArray = function(A, h) {
    $jscomp.initSymbolIterator();
    A instanceof String && (A += "");
    var M = 0,
        P = {
            next: function() {
                if (M < A.length) {
                    var ka = M++;
                    return {
                        value: h(ka, A[ka]),
                        done: !1
                    }
                }
                P.next = function() {
                    return {
                        done: !0,
                        value: void 0
                    }
                };
                return P.next()
            }
        };
    P[Symbol.iterator] = function() {
        return P
    };
    return P
};
$jscomp.polyfill("Array.prototype.entries", function(A) {
    return A ? A : A = function() {
        return $jscomp.iteratorFromArray(this, function(h, M) {
            return [h, M]
        })
    }
}, "es6", "es3");
$jscomp.polyfill("Array.prototype.values", function(A) {
    return A ? A : A = function() {
        return $jscomp.iteratorFromArray(this, function(h, M) {
            return M
        })
    }
}, "es8", "es3");
$jscomp.polyfill("Math.fround", function(A) {
    if (A) return A;
    if ($jscomp.SIMPLE_FROUND_POLYFILL || "function" !== typeof Float32Array) return function(M) {
        return M
    };
    var h = new Float32Array(1);
    return A = function(M) {
        h[0] = M;
        return h[0]
    }
}, "es6", "es3");
(function(A, h, M, P, ka, V, Qb, D, I, O, Y, ia, Ia) {
    try {
        var K = function(a) {
                if (h.onAbort) h.onAbort(a);
                void 0 !== a ? (tb(a), ca(a), a = JSON.stringify(a)) : a = "";
                xa = !0;
                throw "abort(" + a + "). Build with -s ASSERTIONS=1 for more info.";
            },
            ra = function() {
                function a() {
                    if (!h.calledRun && (h.calledRun = !0, !xa)) {
                        ub || (ub = !0, h.noFSInit || g.init.initialized || g.init(), Ja.init(), vb(nc));
                        g.ignorePermissions = !1;
                        vb(Rc);
                        if (h.onRuntimeInitialized) h.onRuntimeInitialized();
                        if (h.postRun)
                            for ("function" == typeof h.postRun && (h.postRun = [h.postRun]); h.postRun.length;) oc.unshift(h.postRun.shift());
                        vb(oc)
                    }
                }
                if (!(0 < Pa)) {
                    if (h.preRun)
                        for ("function" == typeof h.preRun && (h.preRun = [h.preRun]); h.preRun.length;) pc.unshift(h.preRun.shift());
                    vb(pc);
                    0 < Pa || h.calledRun || (h.setStatus ? (h.setStatus("Running..."), setTimeout(function() {
                        setTimeout(function() {
                            h.setStatus("")
                        }, 1);
                        a()
                    }, 1)) : a())
                }
            },
            wa = function(a) {
                this.name = "ExitStatus";
                this.message = "Program terminated with exit(" + a + ")";
                this.status = a
            },
            fb = function(a, b, c, d, e, f, k, n, q, r, t, w, x, u, z, E) {
                var L = T();
                try {
                    Sc(a, b, c, d, e, f, k, n, q, r, t, w, x, u, z, E)
                } catch (W) {
                    U(L);
                    if (W !== W +
                        0 && "longjmp" !== W) throw W;
                    Q(1, 0)
                }
            },
            Uc = function(a, b, c, d, e, f, k, n, q, r, t) {
                var w = T();
                try {
                    Tc(a, b, c, d, e, f, k, n, q, r, t)
                } catch (x) {
                    U(w);
                    if (x !== x + 0 && "longjmp" !== x) throw x;
                    Q(1, 0)
                }
            },
            Wc = function(a, b, c, d, e, f, k, n) {
                var q = T();
                try {
                    Vc(a, b, c, d, e, f, k, n)
                } catch (r) {
                    U(q);
                    if (r !== r + 0 && "longjmp" !== r) throw r;
                    Q(1, 0)
                }
            },
            Yc = function(a, b, c, d, e) {
                var f = T();
                try {
                    Xc(a, b, c, d, e)
                } catch (k) {
                    U(f);
                    if (k !== k + 0 && "longjmp" !== k) throw k;
                    Q(1, 0)
                }
            },
            $c = function(a, b, c, d) {
                var e = T();
                try {
                    Zc(a, b, c, d)
                } catch (f) {
                    U(e);
                    if (f !== f + 0 && "longjmp" !== f) throw f;
                    Q(1, 0)
                }
            },
            bd =
            function(a, b, c) {
                var d = T();
                try {
                    ad(a, b, c)
                } catch (e) {
                    U(d);
                    if (e !== e + 0 && "longjmp" !== e) throw e;
                    Q(1, 0)
                }
            },
            dd = function(a, b) {
                var c = T();
                try {
                    cd(a, b)
                } catch (d) {
                    U(c);
                    if (d !== d + 0 && "longjmp" !== d) throw d;
                    Q(1, 0)
                }
            },
            fd = function(a) {
                var b = T();
                try {
                    ed(a)
                } catch (c) {
                    U(b);
                    if (c !== c + 0 && "longjmp" !== c) throw c;
                    Q(1, 0)
                }
            },
            hd = function(a, b, c, d, e) {
                var f = T();
                try {
                    return gd(a, b, c, d, e)
                } catch (k) {
                    U(f);
                    if (k !== k + 0 && "longjmp" !== k) throw k;
                    Q(1, 0)
                }
            },
            jd = function(a, b, c, d, e, f, k) {
                var n = T();
                try {
                    return id(a, b, c, d, e, f, k)
                } catch (q) {
                    U(n);
                    if (q !== q + 0 && "longjmp" !==
                        q) throw q;
                    Q(1, 0)
                }
            },
            ld = function(a, b, c, d, e, f, k, n, q, r, t, w, x) {
                var u = T();
                try {
                    return kd(a, b, c, d, e, f, k, n, q, r, t, w, x)
                } catch (z) {
                    U(u);
                    if (z !== z + 0 && "longjmp" !== z) throw z;
                    Q(1, 0)
                }
            },
            nd = function(a, b, c, d, e, f, k, n, q, r, t, w) {
                var x = T();
                try {
                    return md(a, b, c, d, e, f, k, n, q, r, t, w)
                } catch (u) {
                    U(x);
                    if (u !== u + 0 && "longjmp" !== u) throw u;
                    Q(1, 0)
                }
            },
            pd = function(a, b, c, d, e, f, k, n, q, r, t) {
                var w = T();
                try {
                    return od(a, b, c, d, e, f, k, n, q, r, t)
                } catch (x) {
                    U(w);
                    if (x !== x + 0 && "longjmp" !== x) throw x;
                    Q(1, 0)
                }
            },
            rd = function(a, b, c, d, e, f, k, n, q) {
                var r = T();
                try {
                    return qd(a,
                        b, c, d, e, f, k, n, q)
                } catch (t) {
                    U(r);
                    if (t !== t + 0 && "longjmp" !== t) throw t;
                    Q(1, 0)
                }
            },
            td = function(a, b, c, d, e, f, k, n) {
                var q = T();
                try {
                    return sd(a, b, c, d, e, f, k, n)
                } catch (r) {
                    U(q);
                    if (r !== r + 0 && "longjmp" !== r) throw r;
                    Q(1, 0)
                }
            },
            vd = function(a, b, c, d, e, f, k) {
                var n = T();
                try {
                    return ud(a, b, c, d, e, f, k)
                } catch (q) {
                    U(n);
                    if (q !== q + 0 && "longjmp" !== q) throw q;
                    Q(1, 0)
                }
            },
            xd = function(a, b, c, d, e, f) {
                var k = T();
                try {
                    return wd(a, b, c, d, e, f)
                } catch (n) {
                    U(k);
                    if (n !== n + 0 && "longjmp" !== n) throw n;
                    Q(1, 0)
                }
            },
            zd = function(a, b, c, d, e, f) {
                var k = T();
                try {
                    return yd(a, b, c, d, e,
                        f)
                } catch (n) {
                    U(k);
                    if (n !== n + 0 && "longjmp" !== n) throw n;
                    Q(1, 0)
                }
            },
            Bd = function(a, b, c, d, e) {
                var f = T();
                try {
                    return Ad(a, b, c, d, e)
                } catch (k) {
                    U(f);
                    if (k !== k + 0 && "longjmp" !== k) throw k;
                    Q(1, 0)
                }
            },
            Dd = function(a, b, c, d) {
                var e = T();
                try {
                    return Cd(a, b, c, d)
                } catch (f) {
                    U(e);
                    if (f !== f + 0 && "longjmp" !== f) throw f;
                    Q(1, 0)
                }
            },
            Fd = function(a, b, c) {
                var d = T();
                try {
                    return Ed(a, b, c)
                } catch (e) {
                    U(d);
                    if (e !== e + 0 && "longjmp" !== e) throw e;
                    Q(1, 0)
                }
            },
            Hd = function(a, b) {
                var c = T();
                try {
                    return Gd(a, b)
                } catch (d) {
                    U(c);
                    if (d !== d + 0 && "longjmp" !== d) throw d;
                    Q(1, 0)
                }
            },
            Jd = function(a) {
                var b =
                    T();
                try {
                    return Id(a)
                } catch (c) {
                    U(b);
                    if (c !== c + 0 && "longjmp" !== c) throw c;
                    Q(1, 0)
                }
            },
            Ld = function(a, b, c, d) {
                var e = T();
                try {
                    return Kd(a, b, c, d)
                } catch (f) {
                    U(e);
                    if (f !== f + 0 && "longjmp" !== f) throw f;
                    Q(1, 0)
                }
            },
            Nd = function(a, b, c, d) {
                var e = T();
                try {
                    return Md(a, b, c, d)
                } catch (f) {
                    U(e);
                    if (f !== f + 0 && "longjmp" !== f) throw f;
                    Q(1, 0)
                }
            },
            Ua = function(a, b, c) {
                c = 0 < c ? c : Ta(a) + 1;
                c = Array(c);
                a = la(a, c, 0, c.length);
                b && (c.length = a);
                return c
            },
            Od = function(a) {
                switch (a) {
                    case 30:
                        return 16384;
                    case 85:
                        return a = G.length, a / 16384;
                    case 132:
                    case 133:
                    case 12:
                    case 137:
                    case 138:
                    case 15:
                    case 235:
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                    case 149:
                    case 13:
                    case 10:
                    case 236:
                    case 153:
                    case 9:
                    case 21:
                    case 22:
                    case 159:
                    case 154:
                    case 14:
                    case 77:
                    case 78:
                    case 139:
                    case 80:
                    case 81:
                    case 82:
                    case 68:
                    case 67:
                    case 164:
                    case 11:
                    case 29:
                    case 47:
                    case 48:
                    case 95:
                    case 52:
                    case 51:
                    case 46:
                        return 200809;
                    case 79:
                        return 0;
                    case 27:
                    case 246:
                    case 127:
                    case 128:
                    case 23:
                    case 24:
                    case 160:
                    case 161:
                    case 181:
                    case 182:
                    case 242:
                    case 183:
                    case 184:
                    case 243:
                    case 244:
                    case 245:
                    case 165:
                    case 178:
                    case 179:
                    case 49:
                    case 50:
                    case 168:
                    case 169:
                    case 175:
                    case 170:
                    case 171:
                    case 172:
                    case 97:
                    case 76:
                    case 32:
                    case 173:
                    case 35:
                        return -1;
                    case 176:
                    case 177:
                    case 7:
                    case 155:
                    case 8:
                    case 157:
                    case 125:
                    case 126:
                    case 92:
                    case 93:
                    case 129:
                    case 130:
                    case 131:
                    case 94:
                    case 91:
                        return 1;
                    case 74:
                    case 60:
                    case 69:
                    case 70:
                    case 4:
                        return 1024;
                    case 31:
                    case 42:
                    case 72:
                        return 32;
                    case 87:
                    case 26:
                    case 33:
                        return 2147483647;
                    case 34:
                    case 1:
                        return 47839;
                    case 38:
                    case 36:
                        return 99;
                    case 43:
                    case 37:
                        return 2048;
                    case 0:
                        return 2097152;
                    case 3:
                        return 65536;
                    case 28:
                        return 32768;
                    case 44:
                        return 32767;
                    case 75:
                        return 16384;
                    case 39:
                        return 1E3;
                    case 89:
                        return 700;
                    case 71:
                        return 256;
                    case 40:
                        return 255;
                    case 2:
                        return 100;
                    case 180:
                        return 64;
                    case 25:
                        return 20;
                    case 5:
                        return 16;
                    case 6:
                        return 6;
                    case 73:
                        return 4;
                    case 84:
                        return "object" === typeof navigator ? navigator.hardwareConcurrency || 1 : 1
                }
                Ka(22);
                return -1
            },
            Qd = function(a, b, c, d) {
                return Pd(a, b, c, d)
            },
            Pd = function(a, b, c, d) {
                function e(u, z, E) {
                    for (u = "number" === typeof u ? u.toString() : u || ""; u.length < z;) u = E[0] + u;
                    return u
                }

                function f(u, z) {
                    return e(u, z, "0")
                }

                function k(u, z) {
                    function E(W) {
                        return 0 > W ? -1 : 0 < W ? 1 : 0
                    }
                    var L;
                    0 === (L = E(u.getFullYear() - z.getFullYear())) && 0 === (L = E(u.getMonth() - z.getMonth())) && (L = E(u.getDate() - z.getDate()));
                    return L
                }

                function n(u) {
                    switch (u.getDay()) {
                        case 0:
                            return new Date(u.getFullYear() - 1, 11, 29);
                        case 1:
                            return u;
                        case 2:
                            return new Date(u.getFullYear(),
                                0, 3);
                        case 3:
                            return new Date(u.getFullYear(), 0, 2);
                        case 4:
                            return new Date(u.getFullYear(), 0, 1);
                        case 5:
                            return new Date(u.getFullYear() - 1, 11, 31);
                        case 6:
                            return new Date(u.getFullYear() - 1, 11, 30)
                    }
                }

                function q(u) {
                    u = wb(new Date(u.tm_year + 1900, 0, 1), u.tm_yday);
                    var z = new Date(u.getFullYear(), 0, 4),
                        E = new Date(u.getFullYear() + 1, 0, 4);
                    z = n(z);
                    E = n(E);
                    return 0 >= k(z, u) ? 0 >= k(E, u) ? u.getFullYear() + 1 : u.getFullYear() : u.getFullYear() - 1
                }
                var r = p[d + 40 >> 2];
                d = {
                    tm_sec: p[d >> 2],
                    tm_min: p[d + 4 >> 2],
                    tm_hour: p[d + 8 >> 2],
                    tm_mday: p[d + 12 >> 2],
                    tm_mon: p[d + 16 >> 2],
                    tm_year: p[d + 20 >> 2],
                    tm_wday: p[d + 24 >> 2],
                    tm_yday: p[d + 28 >> 2],
                    tm_isdst: p[d + 32 >> 2],
                    tm_gmtoff: p[d + 36 >> 2],
                    tm_zone: r ? ea(r) : ""
                };
                c = ea(c);
                r = {
                    "%c": "%a %b %d %H:%M:%S %Y",
                    "%D": "%m/%d/%y",
                    "%F": "%Y-%m-%d",
                    "%h": "%b",
                    "%r": "%I:%M:%S %p",
                    "%R": "%H:%M",
                    "%T": "%H:%M:%S",
                    "%x": "%m/%d/%y",
                    "%X": "%H:%M:%S"
                };
                for (var t in r) c = c.replace(new RegExp(t, "g"), r[t]);
                var w = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
                    x = "January February March April May June July August September October November December".split(" ");
                r = {
                    "%a": function(u) {
                        return w[u.tm_wday].substring(0, 3)
                    },
                    "%A": function(u) {
                        return w[u.tm_wday]
                    },
                    "%b": function(u) {
                        return x[u.tm_mon].substring(0, 3)
                    },
                    "%B": function(u) {
                        return x[u.tm_mon]
                    },
                    "%C": function(u) {
                        u = u.tm_year + 1900;
                        return f(u / 100 | 0, 2)
                    },
                    "%d": function(u) {
                        return f(u.tm_mday, 2)
                    },
                    "%e": function(u) {
                        return e(u.tm_mday, 2, " ")
                    },
                    "%g": function(u) {
                        return q(u).toString().substring(2)
                    },
                    "%G": function(u) {
                        return q(u)
                    },
                    "%H": function(u) {
                        return f(u.tm_hour, 2)
                    },
                    "%I": function(u) {
                        u = u.tm_hour;
                        0 == u ? u = 12 : 12 < u && (u -= 12);
                        return f(u,
                            2)
                    },
                    "%j": function(u) {
                        return f(u.tm_mday + Rb(xb(u.tm_year + 1900) ? yb : zb, u.tm_mon - 1), 3)
                    },
                    "%m": function(u) {
                        return f(u.tm_mon + 1, 2)
                    },
                    "%M": function(u) {
                        return f(u.tm_min, 2)
                    },
                    "%n": function() {
                        return "\n"
                    },
                    "%p": function(u) {
                        return 0 <= u.tm_hour && 12 > u.tm_hour ? "AM" : "PM"
                    },
                    "%S": function(u) {
                        return f(u.tm_sec, 2)
                    },
                    "%t": function() {
                        return "\t"
                    },
                    "%u": function(u) {
                        u = new Date(u.tm_year + 1900, u.tm_mon + 1, u.tm_mday, 0, 0, 0, 0);
                        return u.getDay() || 7
                    },
                    "%U": function(u) {
                        var z = new Date(u.tm_year + 1900, 0, 1),
                            E = 0 === z.getDay() ? z : wb(z, 7 - z.getDay());
                        u = new Date(u.tm_year + 1900, u.tm_mon, u.tm_mday);
                        return 0 > k(E, u) ? (z = Rb(xb(u.getFullYear()) ? yb : zb, u.getMonth() - 1) - 31, E = 31 - E.getDate(), E = E + z + u.getDate(), f(Math.ceil(E / 7), 2)) : 0 === k(E, z) ? "01" : "00"
                    },
                    "%V": function(u) {
                        var z = new Date(u.tm_year + 1900, 0, 4),
                            E = new Date(u.tm_year + 1901, 0, 4);
                        z = n(z);
                        E = n(E);
                        var L = wb(new Date(u.tm_year + 1900, 0, 1), u.tm_yday);
                        if (0 > k(L, z)) return "53";
                        if (0 >= k(E, L)) return "01";
                        u = z.getFullYear() < u.tm_year + 1900 ? u.tm_yday + 32 - z.getDate() : u.tm_yday + 1 - z.getDate();
                        return f(Math.ceil(u / 7), 2)
                    },
                    "%w": function(u) {
                        u =
                            new Date(u.tm_year + 1900, u.tm_mon + 1, u.tm_mday, 0, 0, 0, 0);
                        return u.getDay()
                    },
                    "%W": function(u) {
                        var z = new Date(u.tm_year, 0, 1),
                            E = 1 === z.getDay() ? z : wb(z, 0 === z.getDay() ? 1 : 7 - z.getDay() + 1);
                        u = new Date(u.tm_year + 1900, u.tm_mon, u.tm_mday);
                        return 0 > k(E, u) ? (z = Rb(xb(u.getFullYear()) ? yb : zb, u.getMonth() - 1) - 31, E = 31 - E.getDate(), E = E + z + u.getDate(), f(Math.ceil(E / 7), 2)) : 0 === k(E, z) ? "01" : "00"
                    },
                    "%y": function(u) {
                        return (u.tm_year + 1900).toString().substring(2)
                    },
                    "%Y": function(u) {
                        return u.tm_year + 1900
                    },
                    "%z": function(u) {
                        u = u.tm_gmtoff;
                        var z = 0 <= u;
                        u = Math.abs(u) / 60;
                        u = u / 60 * 100 + u % 60;
                        return (z ? "+" : "-") + String("0000" + u).slice(-4)
                    },
                    "%Z": function(u) {
                        return u.tm_zone
                    },
                    "%%": function() {
                        return "%"
                    }
                };
                for (t in r) 0 <= c.indexOf(t) && (c = c.replace(new RegExp(t, "g"), r[t](d)));
                t = Ua(c, !1);
                if (t.length > b) return 0;
                X.set(t, a);
                return t.length - 1
            },
            wb = function(a, b) {
                for (a = new Date(a.getTime()); 0 < b;) {
                    var c = xb(a.getFullYear()),
                        d = a.getMonth();
                    c = (c ? yb : zb)[d];
                    if (b > c - a.getDate()) b -= c - a.getDate() + 1, a.setDate(1), 11 > d ? a.setMonth(d + 1) : (a.setMonth(0), a.setFullYear(a.getFullYear() +
                        1));
                    else {
                        a.setDate(a.getDate() + b);
                        break
                    }
                }
                return a
            },
            Rb = function(a, b) {
                for (var c = 0, d = 0; d <= b; c += a[d++]);
                return c
            },
            xb = function(a) {
                return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400)
            },
            Rd = function() {
                return 0
            },
            Sd = function(a, b) {
                return a == b
            },
            Td = function() {
                return 0
            },
            Ud = function() {
                return 0
            },
            Vd = function() {
                return 0
            },
            Wd = function() {
                return 0
            },
            Xd = function(a, b) {
                var c = p[a >> 2];
                a = p[a + 4 >> 2];
                0 !== b && (p[b >> 2] = 0, p[b + 4 >> 2] = 0);
                return qc(1E6 * c + a / 1E3)
            },
            qc = function(a) {
                a /= 1E3;
                if ((Va || sa) && self.performance && self.performance.now)
                    for (var b = self.performance.now(); self.performance.now() -
                        b < a;);
                else
                    for (b = Date.now(); Date.now() - b < a;);
                return 0
            },
            Yd = function(a) {
                Ab();
                var b = new Date(p[a + 20 >> 2] + 1900, p[a + 16 >> 2], p[a + 12 >> 2], p[a + 8 >> 2], p[a + 4 >> 2], p[a >> 2], 0),
                    c = p[a + 32 >> 2],
                    d = b.getTimezoneOffset(),
                    e = new Date(b.getFullYear(), 0, 1),
                    f = (new Date(2E3, 6, 1)).getTimezoneOffset(),
                    k = e.getTimezoneOffset(),
                    n = Math.min(k, f);
                0 > c ? p[a + 32 >> 2] = Number(f != k && n == d) : 0 < c != (n == d) && (f = Math.max(k, f), c = 0 < c ? n : f, b.setTime(b.getTime() + 6E4 * (c - d)));
                p[a + 24 >> 2] = b.getDay();
                d = (b.getTime() - e.getTime()) / 864E5 | 0;
                p[a + 28 >> 2] = d;
                return b.getTime() /
                    1E3 | 0
            },
            Zd = function(a, b, c) {
                G.set(G.subarray(b, b + c), a)
            },
            $d = function(a, b) {
                Ab();
                a = new Date(1E3 * p[a >> 2]);
                p[b >> 2] = a.getSeconds();
                p[b + 4 >> 2] = a.getMinutes();
                p[b + 8 >> 2] = a.getHours();
                p[b + 12 >> 2] = a.getDate();
                p[b + 16 >> 2] = a.getMonth();
                p[b + 20 >> 2] = a.getFullYear() - 1900;
                p[b + 24 >> 2] = a.getDay();
                var c = new Date(a.getFullYear(), 0, 1),
                    d = (a.getTime() - c.getTime()) / 864E5 | 0;
                p[b + 28 >> 2] = d;
                p[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
                d = (new Date(2E3, 6, 1)).getTimezoneOffset();
                c = c.getTimezoneOffset();
                a = (d != c && a.getTimezoneOffset() == Math.min(c,
                    d)) | 0;
                p[b + 32 >> 2] = a;
                a = p[gb() + (a ? 4 : 0) >> 2];
                p[b + 40 >> 2] = a;
                return b
            },
            Ab = function() {
                function a(f) {
                    return (f = f.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? f[1] : "GMT"
                }
                if (!Ab.called) {
                    Ab.called = !0;
                    p[ae() >> 2] = 60 * (new Date).getTimezoneOffset();
                    var b = new Date(2E3, 0, 1),
                        c = new Date(2E3, 6, 1);
                    p[be() >> 2] = Number(b.getTimezoneOffset() != c.getTimezoneOffset());
                    var d = a(b),
                        e = a(c);
                    d = rc(Ua(d), "i8", 0);
                    e = rc(Ua(e), "i8", 0);
                    c.getTimezoneOffset() < b.getTimezoneOffset() ? (p[gb() >> 2] = d, p[gb() + 4 >> 2] = e) : (p[gb() >> 2] = e, p[gb() + 4 >> 2] = d)
                }
            },
            ce =
            function() {
                K("trap!")
            },
            Sb = function() {
                var a = Sb;
                a.LLVM_SAVEDSTACKS || (a.LLVM_SAVEDSTACKS = []);
                a.LLVM_SAVEDSTACKS.push(T());
                return a.LLVM_SAVEDSTACKS.length - 1
            },
            de = function(a) {
                var b = Sb,
                    c = b.LLVM_SAVEDSTACKS[a];
                b.LLVM_SAVEDSTACKS.splice(a, 1);
                U(c)
            },
            fe = function(a) {
                return ee(a)
            },
            ee = function(a) {
                return Math.log(a) / Math.LN2
            },
            he = function(a, b) {
                a = new Date(1E3 * p[a >> 2]);
                p[b >> 2] = a.getUTCSeconds();
                p[b + 4 >> 2] = a.getUTCMinutes();
                p[b + 8 >> 2] = a.getUTCHours();
                p[b + 12 >> 2] = a.getUTCDate();
                p[b + 16 >> 2] = a.getUTCMonth();
                p[b + 20 >> 2] = a.getUTCFullYear() -
                    1900;
                p[b + 24 >> 2] = a.getUTCDay();
                p[b + 36 >> 2] = 0;
                p[b + 32 >> 2] = 0;
                var c = Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
                a = (a.getTime() - c) / 864E5 | 0;
                p[b + 28 >> 2] = a;
                p[b + 40 >> 2] = ge;
                return b
            },
            ie = function(a) {
                var b = Date.now();
                p[a >> 2] = b / 1E3 | 0;
                p[a + 4 >> 2] = b % 1E3 * 1E3 | 0;
                return 0
            },
            je = function() {
                return 16384
            },
            hb = function(a) {
                if (0 === a) return 0;
                a = ea(a);
                if (!oa.hasOwnProperty(a)) return 0;
                hb.ret && qa(hb.ret);
                a = oa[a];
                var b = Ta(a) + 1,
                    c = ta(b);
                c && la(a, X, c, b);
                a = c;
                hb.ret = a;
                return hb.ret
            },
            ke = function(a) {
                sc(a)
            },
            sc = function() {
                K("OOM")
            },
            le = function(a,
                b) {
                tc(a, b)
            },
            tc = function(a, b) {
                Q(a, b || 1);
                throw "longjmp";
            },
            me = function(a, b, c, d) {
                c >>>= 0;
                d >>>= 0;
                c = 4294967295 == c && 4294967295 == d ? -1 : +(c >>> 0) + 4294967296 * +(d >>> 0);
                m.waitSync(l.syncs[a], b, c)
            },
            ne = function(a, b, c, d) {
                m.viewport(a, b, c, d)
            },
            oe = function(a, b, c, d, e, f) {
                m.vertexAttribPointer(a, b, c, !!d, e, f)
            },
            pe = function(a, b, c, d, e) {
                m.vertexAttribIPointer(a, b, c, d, e)
            },
            qe = function(a, b) {
                m.vertexAttribI4ui(a, R[b >> 2], R[b + 4 >> 2], R[b + 8 >> 2], R[b + 12 >> 2])
            },
            re = function(a, b, c, d, e) {
                m.vertexAttribI4ui(a, b, c, d, e)
            },
            se = function(a, b) {
                m.vertexAttribI4i(a,
                    p[b >> 2], p[b + 4 >> 2], p[b + 8 >> 2], p[b + 12 >> 2])
            },
            te = function(a, b, c, d, e) {
                m.vertexAttribI4i(a, b, c, d, e)
            },
            ue = function(a, b) {
                m.vertexAttribDivisor(a, b)
            },
            ve = function(a, b) {
                m.vertexAttribDivisor(a, b)
            },
            we = function(a, b) {
                m.vertexAttribDivisor(a, b)
            },
            xe = function(a, b) {
                m.vertexAttribDivisor(a, b)
            },
            ye = function(a, b) {
                m.vertexAttribDivisor(a, b)
            },
            ze = function(a, b) {
                m.vertexAttrib4f(a, y[b >> 2], y[b + 4 >> 2], y[b + 8 >> 2], y[b + 12 >> 2])
            },
            Ae = function(a, b, c, d, e) {
                m.vertexAttrib4f(a, b, c, d, e)
            },
            Be = function(a, b) {
                m.vertexAttrib3f(a, y[b >> 2], y[b + 4 >> 2],
                    y[b + 8 >> 2])
            },
            Ce = function(a, b, c, d) {
                m.vertexAttrib3f(a, b, c, d)
            },
            De = function(a, b) {
                m.vertexAttrib2f(a, y[b >> 2], y[b + 4 >> 2])
            },
            Ee = function(a, b, c) {
                m.vertexAttrib2f(a, b, c)
            },
            Fe = function(a, b) {
                m.vertexAttrib1f(a, y[b >> 2])
            },
            Ge = function(a, b) {
                m.vertexAttrib1f(a, b)
            },
            He = function(a) {
                m.validateProgram(l.programs[a])
            },
            Ie = function(a) {
                m.useProgram(l.programs[a])
            },
            Je = function() {
                ca("missing function: emscripten_glUnmapBuffer");
                K(-1)
            },
            Ke = function(a, b, c, d) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniformMatrix4x3fv(l.uniforms[a], !!c, y, d >> 2, 12 * b) : m.uniformMatrix4x3fv(l.uniforms[a], !!c, y.subarray(d >> 2, d + 48 * b >> 2))
            },
            Le = function(a, b, c, d) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniformMatrix4x2fv(l.uniforms[a], !!c, y, d >> 2, 8 * b) : m.uniformMatrix4x2fv(l.uniforms[a], !!c, y.subarray(d >> 2, d + 32 * b >> 2))
            },
            Me = function(a, b, c, d) {
                if (l.currentContext.supportsWebGL2EntryPoints) m.uniformMatrix4fv(l.uniforms[a], !!c, y, d >> 2, 16 * b);
                else {
                    if (16 * b <= l.MINI_TEMP_BUFFER_SIZE)
                        for (var e = l.miniTempBufferViews[16 * b - 1], f = 0; f < 16 * b; f += 16) e[f] = y[d + 4 * f >> 2], e[f +
                            1] = y[d + (4 * f + 4) >> 2], e[f + 2] = y[d + (4 * f + 8) >> 2], e[f + 3] = y[d + (4 * f + 12) >> 2], e[f + 4] = y[d + (4 * f + 16) >> 2], e[f + 5] = y[d + (4 * f + 20) >> 2], e[f + 6] = y[d + (4 * f + 24) >> 2], e[f + 7] = y[d + (4 * f + 28) >> 2], e[f + 8] = y[d + (4 * f + 32) >> 2], e[f + 9] = y[d + (4 * f + 36) >> 2], e[f + 10] = y[d + (4 * f + 40) >> 2], e[f + 11] = y[d + (4 * f + 44) >> 2], e[f + 12] = y[d + (4 * f + 48) >> 2], e[f + 13] = y[d + (4 * f + 52) >> 2], e[f + 14] = y[d + (4 * f + 56) >> 2], e[f + 15] = y[d + (4 * f + 60) >> 2];
                    else e = y.subarray(d >> 2, d + 64 * b >> 2);
                    m.uniformMatrix4fv(l.uniforms[a], !!c, e)
                }
            },
            Ne = function(a, b, c, d) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniformMatrix3x4fv(l.uniforms[a], !!c, y, d >> 2, 12 * b) : m.uniformMatrix3x4fv(l.uniforms[a], !!c, y.subarray(d >> 2, d + 48 * b >> 2))
            },
            Oe = function(a, b, c, d) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniformMatrix3x2fv(l.uniforms[a], !!c, y, d >> 2, 6 * b) : m.uniformMatrix3x2fv(l.uniforms[a], !!c, y.subarray(d >> 2, d + 24 * b >> 2))
            },
            Pe = function(a, b, c, d) {
                if (l.currentContext.supportsWebGL2EntryPoints) m.uniformMatrix3fv(l.uniforms[a], !!c, y, d >> 2, 9 * b);
                else {
                    if (9 * b <= l.MINI_TEMP_BUFFER_SIZE)
                        for (var e = l.miniTempBufferViews[9 * b - 1], f = 0; f < 9 * b; f += 9) e[f] = y[d + 4 * f >> 2], e[f + 1] = y[d +
                            (4 * f + 4) >> 2], e[f + 2] = y[d + (4 * f + 8) >> 2], e[f + 3] = y[d + (4 * f + 12) >> 2], e[f + 4] = y[d + (4 * f + 16) >> 2], e[f + 5] = y[d + (4 * f + 20) >> 2], e[f + 6] = y[d + (4 * f + 24) >> 2], e[f + 7] = y[d + (4 * f + 28) >> 2], e[f + 8] = y[d + (4 * f + 32) >> 2];
                    else e = y.subarray(d >> 2, d + 36 * b >> 2);
                    m.uniformMatrix3fv(l.uniforms[a], !!c, e)
                }
            },
            Qe = function(a, b, c, d) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniformMatrix2x4fv(l.uniforms[a], !!c, y, d >> 2, 8 * b) : m.uniformMatrix2x4fv(l.uniforms[a], !!c, y.subarray(d >> 2, d + 32 * b >> 2))
            },
            Re = function(a, b, c, d) {
                l.currentContext.supportsWebGL2EntryPoints ?
                    m.uniformMatrix2x3fv(l.uniforms[a], !!c, y, d >> 2, 6 * b) : m.uniformMatrix2x3fv(l.uniforms[a], !!c, y.subarray(d >> 2, d + 24 * b >> 2))
            },
            Se = function(a, b, c, d) {
                if (l.currentContext.supportsWebGL2EntryPoints) m.uniformMatrix2fv(l.uniforms[a], !!c, y, d >> 2, 4 * b);
                else {
                    if (4 * b <= l.MINI_TEMP_BUFFER_SIZE)
                        for (var e = l.miniTempBufferViews[4 * b - 1], f = 0; f < 4 * b; f += 4) e[f] = y[d + 4 * f >> 2], e[f + 1] = y[d + (4 * f + 4) >> 2], e[f + 2] = y[d + (4 * f + 8) >> 2], e[f + 3] = y[d + (4 * f + 12) >> 2];
                    else e = y.subarray(d >> 2, d + 16 * b >> 2);
                    m.uniformMatrix2fv(l.uniforms[a], !!c, e)
                }
            },
            Te = function(a,
                b, c) {
                a = l.programs[a];
                m.uniformBlockBinding(a, b, c)
            },
            Ue = function(a, b, c) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniform4uiv(l.uniforms[a], R, c >> 2, 4 * b) : m.uniform4uiv(l.uniforms[a], R.subarray(c >> 2, c + 16 * b >> 2))
            },
            Ve = function(a, b, c, d, e) {
                m.uniform4ui(l.uniforms[a], b, c, d, e)
            },
            We = function(a, b, c) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniform4iv(l.uniforms[a], p, c >> 2, 4 * b) : m.uniform4iv(l.uniforms[a], p.subarray(c >> 2, c + 16 * b >> 2))
            },
            Xe = function(a, b, c, d, e) {
                m.uniform4i(l.uniforms[a], b, c, d, e)
            },
            Ye = function(a, b,
                c) {
                if (l.currentContext.supportsWebGL2EntryPoints) m.uniform4fv(l.uniforms[a], y, c >> 2, 4 * b);
                else {
                    if (4 * b <= l.MINI_TEMP_BUFFER_SIZE)
                        for (var d = l.miniTempBufferViews[4 * b - 1], e = 0; e < 4 * b; e += 4) d[e] = y[c + 4 * e >> 2], d[e + 1] = y[c + (4 * e + 4) >> 2], d[e + 2] = y[c + (4 * e + 8) >> 2], d[e + 3] = y[c + (4 * e + 12) >> 2];
                    else d = y.subarray(c >> 2, c + 16 * b >> 2);
                    m.uniform4fv(l.uniforms[a], d)
                }
            },
            Ze = function(a, b, c, d, e) {
                m.uniform4f(l.uniforms[a], b, c, d, e)
            },
            $e = function(a, b, c) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniform3uiv(l.uniforms[a], R, c >> 2, 3 * b) : m.uniform3uiv(l.uniforms[a],
                    R.subarray(c >> 2, c + 12 * b >> 2))
            },
            af = function(a, b, c, d) {
                m.uniform3ui(l.uniforms[a], b, c, d)
            },
            bf = function(a, b, c) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniform3iv(l.uniforms[a], p, c >> 2, 3 * b) : m.uniform3iv(l.uniforms[a], p.subarray(c >> 2, c + 12 * b >> 2))
            },
            cf = function(a, b, c, d) {
                m.uniform3i(l.uniforms[a], b, c, d)
            },
            df = function(a, b, c) {
                if (l.currentContext.supportsWebGL2EntryPoints) m.uniform3fv(l.uniforms[a], y, c >> 2, 3 * b);
                else {
                    if (3 * b <= l.MINI_TEMP_BUFFER_SIZE)
                        for (var d = l.miniTempBufferViews[3 * b - 1], e = 0; e < 3 * b; e += 3) d[e] = y[c +
                            4 * e >> 2], d[e + 1] = y[c + (4 * e + 4) >> 2], d[e + 2] = y[c + (4 * e + 8) >> 2];
                    else d = y.subarray(c >> 2, c + 12 * b >> 2);
                    m.uniform3fv(l.uniforms[a], d)
                }
            },
            ef = function(a, b, c, d) {
                m.uniform3f(l.uniforms[a], b, c, d)
            },
            ff = function(a, b, c) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniform2uiv(l.uniforms[a], R, c >> 2, 2 * b) : m.uniform2uiv(l.uniforms[a], R.subarray(c >> 2, c + 8 * b >> 2))
            },
            gf = function(a, b, c) {
                m.uniform2ui(l.uniforms[a], b, c)
            },
            hf = function(a, b, c) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniform2iv(l.uniforms[a], p, c >> 2, 2 * b) : m.uniform2iv(l.uniforms[a],
                    p.subarray(c >> 2, c + 8 * b >> 2))
            },
            jf = function(a, b, c) {
                m.uniform2i(l.uniforms[a], b, c)
            },
            kf = function(a, b, c) {
                if (l.currentContext.supportsWebGL2EntryPoints) m.uniform2fv(l.uniforms[a], y, c >> 2, 2 * b);
                else {
                    if (2 * b <= l.MINI_TEMP_BUFFER_SIZE)
                        for (var d = l.miniTempBufferViews[2 * b - 1], e = 0; e < 2 * b; e += 2) d[e] = y[c + 4 * e >> 2], d[e + 1] = y[c + (4 * e + 4) >> 2];
                    else d = y.subarray(c >> 2, c + 8 * b >> 2);
                    m.uniform2fv(l.uniforms[a], d)
                }
            },
            lf = function(a, b, c) {
                m.uniform2f(l.uniforms[a], b, c)
            },
            mf = function(a, b, c) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniform1uiv(l.uniforms[a],
                    R, c >> 2, b) : m.uniform1uiv(l.uniforms[a], R.subarray(c >> 2, c + 4 * b >> 2))
            },
            nf = function(a, b) {
                m.uniform1ui(l.uniforms[a], b)
            },
            of = function(a, b, c) {
                l.currentContext.supportsWebGL2EntryPoints ? m.uniform1iv(l.uniforms[a], p, c >> 2, b) : m.uniform1iv(l.uniforms[a], p.subarray(c >> 2, c + 4 * b >> 2))
            },
            pf = function(a, b) {
                m.uniform1i(l.uniforms[a], b)
            },
            qf = function(a, b, c) {
                if (l.currentContext.supportsWebGL2EntryPoints) m.uniform1fv(l.uniforms[a], y, c >> 2, b);
                else {
                    if (b <= l.MINI_TEMP_BUFFER_SIZE)
                        for (var d = l.miniTempBufferViews[b - 1], e = 0; e < b; ++e) d[e] =
                            y[c + 4 * e >> 2];
                    else d = y.subarray(c >> 2, c + 4 * b >> 2);
                    m.uniform1fv(l.uniforms[a], d)
                }
            },
            rf = function(a, b) {
                m.uniform1f(l.uniforms[a], b)
            },
            sf = function(a, b, c, d) {
                a = l.programs[a];
                for (var e = [], f = 0; f < b; f++) e.push(ea(p[c + 4 * f >> 2]));
                m.transformFeedbackVaryings(a, e, d)
            },
            tf = function(a, b, c, d, e, f, k, n, q, r, t) {
                m.currentPixelUnpackBufferBinding ? m.texSubImage3D(a, b, c, d, e, f, k, n, q, r, t) : 0 != t ? m.texSubImage3D(a, b, c, d, e, f, k, n, q, r, ib(r), t >> (jb[r] | 0)) : m.texSubImage3D(a, b, c, d, e, f, k, n, q, r, null)
            },
            uf = function(a, b, c, d, e, f, k, n, q) {
                if (l.currentContext.supportsWebGL2EntryPoints) m.currentPixelUnpackBufferBinding ?
                    m.texSubImage2D(a, b, c, d, e, f, k, n, q) : 0 != q ? m.texSubImage2D(a, b, c, d, e, f, k, n, ib(n), q >> (jb[n] | 0)) : m.texSubImage2D(a, b, c, d, e, f, k, n, null);
                else {
                    var r = null;
                    q && (r = Tb(n, k, e, f, q, 0));
                    m.texSubImage2D(a, b, c, d, e, f, k, n, r)
                }
            },
            vf = function(a, b, c, d, e, f) {
                m.texStorage3D(a, b, c, d, e, f)
            },
            wf = function(a, b, c, d, e) {
                m.texStorage2D(a, b, c, d, e)
            },
            xf = function(a, b, c) {
                c = p[c >> 2];
                m.texParameteri(a, b, c)
            },
            yf = function(a, b, c) {
                m.texParameteri(a, b, c)
            },
            zf = function(a, b, c) {
                c = y[c >> 2];
                m.texParameterf(a, b, c)
            },
            Af = function(a, b, c) {
                m.texParameterf(a, b, c)
            },
            Bf = function(a, b, c, d, e, f, k, n, q, r) {
                m.currentPixelUnpackBufferBinding ? m.texImage3D(a, b, c, d, e, f, k, n, q, r) : 0 != r ? m.texImage3D(a, b, c, d, e, f, k, n, q, ib(q), r >> (jb[q] | 0)) : m.texImage3D(a, b, c, d, e, f, k, n, q, null)
            },
            Cf = function(a, b, c, d, e, f, k, n, q) {
                l.currentContext.supportsWebGL2EntryPoints ? m.currentPixelUnpackBufferBinding ? m.texImage2D(a, b, c, d, e, f, k, n, q) : 0 != q ? m.texImage2D(a, b, c, d, e, f, k, n, ib(n), q >> (jb[n] | 0)) : m.texImage2D(a, b, c, d, e, f, k, n, null) : m.texImage2D(a, b, c, d, e, f, k, n, q ? Tb(n, k, d, e, q, c) : null)
            },
            Df = function(a, b, c, d) {
                m.stencilOpSeparate(a,
                    b, c, d)
            },
            Ef = function(a, b, c) {
                m.stencilOp(a, b, c)
            },
            Ff = function(a, b) {
                m.stencilMaskSeparate(a, b)
            },
            Gf = function(a) {
                m.stencilMask(a)
            },
            Hf = function(a, b, c, d) {
                m.stencilFuncSeparate(a, b, c, d)
            },
            If = function(a, b, c) {
                m.stencilFunc(a, b, c)
            },
            Jf = function(a, b, c, d) {
                b = l.getSource(a, b, c, d);
                m.shaderSource(l.shaders[a], b)
            },
            Kf = function() {
                l.recordError(1280)
            },
            Lf = function(a, b, c, d) {
                m.scissor(a, b, c, d)
            },
            Mf = function(a, b, c) {
                c = p[c >> 2];
                m.samplerParameteri(l.samplers[a], b, c)
            },
            Nf = function(a, b, c) {
                m.samplerParameteri(l.samplers[a], b, c)
            },
            Of =
            function(a, b, c) {
                c = y[c >> 2];
                m.samplerParameterf(l.samplers[a], b, c)
            },
            Pf = function(a, b, c) {
                m.samplerParameterf(l.samplers[a], b, c)
            },
            Qf = function(a, b) {
                m.sampleCoverage(a, !!b)
            },
            Rf = function() {
                m.resumeTransformFeedback()
            },
            Sf = function(a, b, c, d, e) {
                m.renderbufferStorageMultisample(a, b, c, d, e)
            },
            Tf = function(a, b, c, d) {
                m.renderbufferStorage(a, b, c, d)
            },
            Uf = function() {},
            Vf = function(a, b, c, d, e, f, k) {
                l.currentContext.supportsWebGL2EntryPoints ? m.currentPixelPackBufferBinding ? m.readPixels(a, b, c, d, e, f, k) : m.readPixels(a, b, c, d, e, f,
                    ib(f), k >> (jb[f] | 0)) : (k = Tb(f, e, c, d, k, e)) ? m.readPixels(a, b, c, d, e, f, k) : l.recordError(1280)
            },
            ib = function(a) {
                switch (a) {
                    case 5120:
                        return X;
                    case 5121:
                        return G;
                    case 5122:
                        return La;
                    case 5123:
                    case 33635:
                    case 32819:
                    case 32820:
                    case 36193:
                    case 5131:
                        return Wa;
                    case 5124:
                        return p;
                    case 5125:
                    case 34042:
                    case 35902:
                    case 33640:
                    case 35899:
                    case 34042:
                        return R;
                    case 5126:
                        return y
                }
            },
            Tb = function(a, b, c, d, e) {
                if (b = Wf[b] * Xf[a]) switch (c = Yf(c, d, b, l.unpackAlignment), c = e + c, a) {
                    case 5120:
                        return X.subarray(e, c);
                    case 5121:
                        return G.subarray(e,
                            c);
                    case 5122:
                        return La.subarray(e >> 1, c >> 1);
                    case 5124:
                        return p.subarray(e >> 2, c >> 2);
                    case 5126:
                        return y.subarray(e >> 2, c >> 2);
                    case 5125:
                    case 34042:
                    case 35902:
                    case 33640:
                    case 35899:
                    case 34042:
                        return R.subarray(e >> 2, c >> 2);
                    case 5123:
                    case 33635:
                    case 32819:
                    case 32820:
                    case 36193:
                    case 5131:
                        return Wa.subarray(e >> 1, c >> 1);
                    default:
                        l.recordError(1280)
                } else l.recordError(1280)
            },
            Yf = function(a, b, c, d) {
                a *= c;
                d = a + d - 1 & -d;
                return b * d
            },
            Zf = function(a) {
                m.readBuffer(a)
            },
            $f = function(a, b) {
                m.disjointTimerQueryExt.queryCounterEXT(l.timerQueriesEXT[a],
                    b)
            },
            ag = function() {
                l.recordError(1280)
            },
            bg = function() {
                l.recordError(1280)
            },
            cg = function(a, b) {
                m.polygonOffset(a, b)
            },
            dg = function(a, b) {
                3317 == a && (l.unpackAlignment = b);
                m.pixelStorei(a, b)
            },
            eg = function() {
                m.pauseTransformFeedback()
            },
            fg = function() {
                ca("missing function: emscripten_glMapBufferRange");
                K(-1)
            },
            gg = function(a) {
                m.linkProgram(l.programs[a]);
                l.populateUniformTable(a)
            },
            hg = function(a) {
                m.lineWidth(a)
            },
            ig = function(a) {
                return (a = l.vaos[a]) ? m.isVertexArray(a) : 0
            },
            jg = function(a) {
                return (a = l.vaos[a]) ? m.isVertexArray(a) :
                    0
            },
            kg = function(a) {
                return m.isTransformFeedback(l.transformFeedbacks[a])
            },
            lg = function(a) {
                return (a = l.textures[a]) ? m.isTexture(a) : 0
            },
            mg = function(a) {
                return (a = l.syncs[a]) ? m.isSync(a) : 0
            },
            ng = function(a) {
                return (a = l.shaders[a]) ? m.isShader(a) : 0
            },
            og = function(a) {
                return (a = l.samplers[a]) ? m.isSampler(a) : 0
            },
            pg = function(a) {
                return (a = l.renderbuffers[a]) ? m.isRenderbuffer(a) : 0
            },
            qg = function(a) {
                return (a = l.timerQueriesEXT[a]) ? m.disjointTimerQueryExt.isQueryEXT(a) : 0
            },
            rg = function(a) {
                return (a = l.queries[a]) ? m.isQuery(a) : 0
            },
            sg = function(a) {
                return (a = l.programs[a]) ? m.isProgram(a) : 0
            },
            tg = function(a) {
                return (a = l.framebuffers[a]) ? m.isFramebuffer(a) : 0
            },
            ug = function(a) {
                return m.isEnabled(a)
            },
            vg = function(a) {
                return (a = l.buffers[a]) ? m.isBuffer(a) : 0
            },
            wg = function(a, b, c, d, e, f, k) {
                for (var n = Xa[b], q = 0; q < b; q++) n[q] = p[c + 4 * q >> 2];
                m.invalidateSubFramebuffer(a, n, d, e, f, k)
            },
            xg = function(a, b, c) {
                for (var d = Xa[b], e = 0; e < b; e++) d[e] = p[c + 4 * e >> 2];
                m.invalidateFramebuffer(a, d)
            },
            yg = function(a, b) {
                m.hint(a, b)
            },
            zg = function(a, b, c) {
                Bb(a, b, c, "FloatToInteger")
            },
            Ag =
            function(a, b, c) {
                Bb(a, b, c, "Float")
            },
            Bg = function(a, b, c) {
                c ? p[c >> 2] = m.getVertexAttribOffset(a, b) : l.recordError(1281)
            },
            Cg = function(a, b, c) {
                Bb(a, b, c, "Integer")
            },
            Dg = function(a, b, c) {
                Bb(a, b, c, "Integer")
            },
            Bb = function(a, b, c, d) {
                if (c)
                    if (a = m.getVertexAttrib(a, b), 34975 == b) p[c >> 2] = a.name;
                    else if ("number" == typeof a || "boolean" == typeof a) switch (d) {
                    case "Integer":
                        p[c >> 2] = a;
                        break;
                    case "Float":
                        y[c >> 2] = a;
                        break;
                    case "FloatToInteger":
                        p[c >> 2] = Math.fround(a);
                        break;
                    default:
                        throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " +
                            d;
                } else
                    for (b = 0; b < a.length; b++) switch (d) {
                        case "Integer":
                            p[c + 4 * b >> 2] = a[b];
                            break;
                        case "Float":
                            y[c + 4 * b >> 2] = a[b];
                            break;
                        case "FloatToInteger":
                            p[c + 4 * b >> 2] = Math.fround(a[b]);
                            break;
                        default:
                            throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + d;
                    } else l.recordError(1281)
            },
            Eg = function(a, b, c) {
                Ub(a, b, c, "Integer")
            },
            Fg = function(a, b, c) {
                Ub(a, b, c, "Integer")
            },
            Gg = function(a, b, c) {
                Ub(a, b, c, "Float")
            },
            Ub = function(a, b, c, d) {
                if (c)
                    if (a = m.getUniform(l.programs[a], l.uniforms[b]), "number" == typeof a || "boolean" == typeof a) switch (d) {
                        case "Integer":
                            p[c >>
                                2] = a;
                            break;
                        case "Float":
                            y[c >> 2] = a;
                            break;
                        default:
                            throw "internal emscriptenWebGLGetUniform() error, bad type: " + d;
                    } else
                        for (b = 0; b < a.length; b++) switch (d) {
                            case "Integer":
                                p[c + 4 * b >> 2] = a[b];
                                break;
                            case "Float":
                                y[c + 4 * b >> 2] = a[b];
                                break;
                            default:
                                throw "internal emscriptenWebGLGetUniform() error, bad type: " + d;
                        } else l.recordError(1281)
            },
            Hg = function(a, b) {
                b = ea(b);
                var c = 0;
                if ("]" == b[b.length - 1]) {
                    var d = b.lastIndexOf("[");
                    c = "]" != b[d + 1] ? parseInt(b.slice(d + 1)) : 0;
                    b = b.slice(0, d)
                }
                return (a = l.programInfos[a] && l.programInfos[a].uniforms[b]) &&
                    0 <= c && c < a[0] ? a[1] + c : -1
            },
            Ig = function(a, b, c, d) {
                if (d)
                    if (0 < b && (0 == c || 0 == d)) l.recordError(1281);
                    else {
                        a = l.programs[a];
                        for (var e = [], f = 0; f < b; f++) e.push(ea(p[c + 4 * f >> 2]));
                        if (a = m.getUniformIndices(a, e))
                            for (b = a.length, f = 0; f < b; f++) p[d + 4 * f >> 2] = a[f]
                    }
                else l.recordError(1281)
            },
            Jg = function(a, b) {
                return m.getUniformBlockIndex(l.programs[a], ea(b))
            },
            Kg = function(a, b, c, d, e, f, k) {
                a = l.programs[a];
                if (a = m.getTransformFeedbackVarying(a, b)) k && 0 < c ? (c = la(a.name, G, k, c), d && (p[d >> 2] = c)) : d && (p[d >> 2] = 0), e && (p[e >> 2] = a.size), f && (p[f >> 2] =
                    a.type)
            },
            Lg = function(a, b, c) {
                c ? p[c >> 2] = m.getTexParameter(a, b) : l.recordError(1281)
            },
            Mg = function(a, b, c) {
                c ? y[c >> 2] = m.getTexParameter(a, b) : l.recordError(1281)
            },
            Ng = function(a, b, c, d, e) {
                0 > c ? l.recordError(1281) : e ? (a = m.getSyncParameter(l.syncs[a], b), p[d >> 2] = a, null !== a && d && (p[d >> 2] = 1)) : l.recordError(1281)
            },
            Og = function(a, b) {
                if (2 > l.currentContext.version) return l.recordError(1282), 0;
                var c = l.stringiCache[a];
                if (c) return 0 > b || b >= c.length ? (l.recordError(1281), 0) : c[b];
                switch (a) {
                    case 7939:
                        c = m.getSupportedExtensions();
                        for (var d = [], e = 0; e < c.length; ++e) d.push(Ya(c[e])), d.push(Ya("GL_" + c[e]));
                        c = l.stringiCache[a] = d;
                        return 0 > b || b >= c.length ? (l.recordError(1281), 0) : c[b];
                    default:
                        return l.recordError(1280), 0
                }
            },
            Pg = function(a) {
                if (l.stringCache[a]) return l.stringCache[a];
                switch (a) {
                    case 7939:
                        var b = m.getSupportedExtensions();
                        for (var c = [], d = 0; d < b.length; ++d) c.push(b[d]), c.push("GL_" + b[d]);
                        b = Ya(c.join(" "));
                        break;
                    case 7936:
                    case 7937:
                    case 37445:
                    case 37446:
                        (b = m.getParameter(a)) || l.recordError(1280);
                        b = Ya(b);
                        break;
                    case 7938:
                        b = m.getParameter(m.VERSION);
                        b = 2 <= l.currentContext.version ? "OpenGL ES 3.0 (" + b + ")" : "OpenGL ES 2.0 (" + b + ")";
                        b = Ya(b);
                        break;
                    case 35724:
                        b = m.getParameter(m.SHADING_LANGUAGE_VERSION);
                        c = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
                        c = b.match(c);
                        null !== c && (3 == c[1].length && (c[1] += "0"), b = "OpenGL ES GLSL ES " + c[1] + " (" + b + ")");
                        b = Ya(b);
                        break;
                    default:
                        return l.recordError(1280), 0
                }
                return l.stringCache[a] = b
            },
            Ya = function(a) {
                var b = Ta(a) + 1,
                    c = ta(b);
                la(a, G, c, b);
                return c
            },
            Qg = function(a, b, c) {
                c ? 35716 == b ? (a = m.getShaderInfoLog(l.shaders[a]), null === a &&
                    (a = "(unknown error)"), p[c >> 2] = a.length + 1) : 35720 == b ? (a = m.getShaderSource(l.shaders[a]), a = null === a || 0 == a.length ? 0 : a.length + 1, p[c >> 2] = a) : p[c >> 2] = m.getShaderParameter(l.shaders[a], b) : l.recordError(1281)
            },
            Rg = function(a, b, c, d) {
                if (a = m.getShaderSource(l.shaders[a])) 0 < b && d ? (b = la(a, G, d, b), c && (p[c >> 2] = b)) : c && (p[c >> 2] = 0)
            },
            Sg = function(a, b, c, d) {
                a = m.getShaderPrecisionFormat(a, b);
                p[c >> 2] = a.rangeMin;
                p[c + 4 >> 2] = a.rangeMax;
                p[d >> 2] = a.precision
            },
            Tg = function(a, b, c, d) {
                a = m.getShaderInfoLog(l.shaders[a]);
                null === a && (a = "(unknown error)");
                0 < b && d ? (b = la(a, G, d, b), c && (p[c >> 2] = b)) : c && (p[c >> 2] = 0)
            },
            Ug = function(a, b, c) {
                c ? (a = l.samplers[a], p[c >> 2] = m.getSamplerParameter(a, b)) : l.recordError(1281)
            },
            Vg = function(a, b, c) {
                c ? (a = l.samplers[a], y[c >> 2] = m.getSamplerParameter(a, b)) : l.recordError(1281)
            },
            Wg = function(a, b, c) {
                c ? p[c >> 2] = m.getRenderbufferParameter(a, b) : l.recordError(1281)
            },
            Xg = function(a, b, c) {
                c ? p[c >> 2] = m.disjointTimerQueryExt.getQueryEXT(a, b) : l.recordError(1281)
            },
            Yg = function(a, b, c) {
                c ? p[c >> 2] = m.getQuery(a, b) : l.recordError(1281)
            },
            Zg = function(a, b, c) {
                c ?
                    (a = l.timerQueriesEXT[a], b = m.disjointTimerQueryExt.getQueryObjectEXT(a, b), b = "boolean" == typeof b ? b ? 1 : 0 : b, p[c >> 2] = b) : l.recordError(1281)
            },
            $g = function(a, b, c) {
                c ? (a = l.queries[a], b = m.getQueryParameter(a, b), b = "boolean" == typeof b ? b ? 1 : 0 : b, p[c >> 2] = b) : l.recordError(1281)
            },
            ah = function(a, b, c) {
                c ? (a = l.timerQueriesEXT[a], b = m.disjointTimerQueryExt.getQueryObjectEXT(a, b), b = "boolean" == typeof b ? b ? 1 : 0 : b, tempI64 = [b >>> 0, (tempDouble = b, 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble -
                    +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], p[c >> 2] = tempI64[0], p[c + 4 >> 2] = tempI64[1]) : l.recordError(1281)
            },
            bh = function(a, b, c) {
                c ? (a = l.timerQueriesEXT[a], b = m.disjointTimerQueryExt.getQueryObjectEXT(a, b), b = "boolean" == typeof b ? b ? 1 : 0 : b, p[c >> 2] = b) : l.recordError(1281)
            },
            ch = function(a, b, c) {
                c ? (a = l.timerQueriesEXT[a], b = m.disjointTimerQueryExt.getQueryObjectEXT(a, b), b = "boolean" == typeof b ? b ? 1 : 0 : b, tempI64 = [b >>> 0, (tempDouble = b, 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble -
                    +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], p[c >> 2] = tempI64[0], p[c + 4 >> 2] = tempI64[1]) : l.recordError(1281)
            },
            dh = function(a, b, c) {
                if (c)
                    if (a >= l.counter) l.recordError(1281);
                    else {
                        var d = l.programInfos[a];
                        if (d)
                            if (35716 == b) a = m.getProgramInfoLog(l.programs[a]), null === a && (a = "(unknown error)"), p[c >> 2] = a.length + 1;
                            else if (35719 == b) p[c >> 2] = d.maxUniformLength;
                        else if (35722 == b) {
                            if (-1 == d.maxAttributeLength) {
                                a = l.programs[a];
                                var e = m.getProgramParameter(a, 35721);
                                for (b = d.maxAttributeLength = 0; b < e; ++b) {
                                    var f = m.getActiveAttrib(a,
                                        b);
                                    d.maxAttributeLength = Math.max(d.maxAttributeLength, f.name.length + 1)
                                }
                            }
                            p[c >> 2] = d.maxAttributeLength
                        } else if (35381 == b) {
                            if (-1 == d.maxUniformBlockNameLength)
                                for (a = l.programs[a], e = m.getProgramParameter(a, 35382), b = d.maxUniformBlockNameLength = 0; b < e; ++b) f = m.getActiveUniformBlockName(a, b), d.maxUniformBlockNameLength = Math.max(d.maxUniformBlockNameLength, f.length + 1);
                            p[c >> 2] = d.maxUniformBlockNameLength
                        } else p[c >> 2] = m.getProgramParameter(l.programs[a], b);
                        else l.recordError(1282)
                    }
                else l.recordError(1281)
            },
            eh =
            function(a, b, c, d) {
                a = m.getProgramInfoLog(l.programs[a]);
                null === a && (a = "(unknown error)");
                0 < b && d ? (b = la(a, G, d, b), c && (p[c >> 2] = b)) : c && (p[c >> 2] = 0)
            },
            fh = function() {
                l.recordError(1282)
            },
            gh = function() {
                ca("missing function: emscripten_glGetInternalformativ");
                K(-1)
            },
            hh = function(a, b) {
                Cb(a, b, "Integer")
            },
            ih = function(a, b, c) {
                uc(a, b, c, "Integer")
            },
            jh = function(a, b) {
                Cb(a, b, "Integer64")
            },
            kh = function(a, b, c) {
                uc(a, b, c, "Integer64")
            },
            uc = function(a, b, c, d) {
                if (c) {
                    b = m.getIndexedParameter(a, b);
                    switch (typeof b) {
                        case "boolean":
                            a = b ?
                                1 : 0;
                            break;
                        case "number":
                            a = b;
                            break;
                        case "object":
                            if (null === b) switch (a) {
                                    case 35983:
                                    case 35368:
                                        a = 0;
                                        break;
                                    default:
                                        l.recordError(1280);
                                        return
                                } else if (b instanceof WebGLBuffer) a = b.name | 0;
                                else {
                                    l.recordError(1280);
                                    return
                                }
                            break;
                        default:
                            l.recordError(1280);
                            return
                    }
                    switch (d) {
                        case "Integer64":
                            tempI64 = [a >>> 0, (tempDouble = a, 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)];
                            p[c >> 2] = tempI64[0];
                            p[c + 4 >> 2] = tempI64[1];
                            break;
                        case "Integer":
                            p[c >>
                                2] = a;
                            break;
                        case "Float":
                            y[c >> 2] = a;
                            break;
                        case "Boolean":
                            X[c >> 0] = a ? 1 : 0;
                            break;
                        default:
                            throw "internal emscriptenWebGLGetIndexed() error, bad type: " + d;
                    }
                } else l.recordError(1281)
            },
            lh = function(a, b, c, d) {
                a = m.getFramebufferAttachmentParameter(a, b, c);
                if (a instanceof WebGLRenderbuffer || a instanceof WebGLTexture) a = a.name | 0;
                p[d >> 2] = a
            },
            mh = function(a, b) {
                return m.getFragDataLocation(l.programs[a], ea(b))
            },
            nh = function(a, b) {
                Cb(a, b, "Float")
            },
            oh = function() {
                if (l.lastError) {
                    var a = l.lastError;
                    l.lastError = 0;
                    return a
                }
                return m.getError()
            },
            ph = function() {
                ca("missing function: emscripten_glGetBufferPointerv");
                K(-1)
            },
            qh = function(a, b, c) {
                c ? p[c >> 2] = m.getBufferParameter(a, b) : l.recordError(1281)
            },
            rh = function(a, b, c) {
                c ? (tempI64 = [m.getBufferParameter(a, b) >>> 0, (tempDouble = m.getBufferParameter(a, b), 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], p[c >> 2] = tempI64[0], p[c + 4 >> 2] = tempI64[1]) : l.recordError(1281)
            },
            sh = function(a, b) {
                Cb(a, b, "Boolean")
            },
            Cb = function(a,
                b, c) {
                if (b) {
                    var d = void 0;
                    switch (a) {
                        case 36346:
                            d = 1;
                            break;
                        case 36344:
                            "Integer" !== c && "Integer64" !== c && l.recordError(1280);
                            return;
                        case 34814:
                        case 36345:
                            d = 0;
                            break;
                        case 34466:
                            var e = m.getParameter(34467);
                            d = e ? e.length : 0;
                            break;
                        case 33309:
                            if (2 > l.currentContext.version) {
                                l.recordError(1282);
                                return
                            }
                            e = m.getSupportedExtensions();
                            d = 2 * e.length;
                            break;
                        case 33307:
                        case 33308:
                            if (2 > l.currentContext.version) {
                                l.recordError(1280);
                                return
                            }
                            d = 33307 == a ? 3 : 0
                    }
                    if (void 0 === d) switch (e = m.getParameter(a), typeof e) {
                        case "number":
                            d = e;
                            break;
                        case "boolean":
                            d = e ? 1 : 0;
                            break;
                        case "string":
                            l.recordError(1280);
                            return;
                        case "object":
                            if (null === e) switch (a) {
                                case 34964:
                                case 35725:
                                case 34965:
                                case 36006:
                                case 36007:
                                case 32873:
                                case 34229:
                                case 35097:
                                case 36389:
                                case 34068:
                                    d = 0;
                                    break;
                                default:
                                    l.recordError(1280);
                                    return
                            } else {
                                if (e instanceof Float32Array || e instanceof Uint32Array || e instanceof Int32Array || e instanceof Array) {
                                    for (a = 0; a < e.length; ++a) switch (c) {
                                        case "Integer":
                                            p[b + 4 * a >> 2] = e[a];
                                            break;
                                        case "Float":
                                            y[b + 4 * a >> 2] = e[a];
                                            break;
                                        case "Boolean":
                                            X[b + a >> 0] = e[a] ?
                                                1 : 0;
                                            break;
                                        default:
                                            throw "internal glGet error, bad type: " + c;
                                    }
                                    return
                                }
                                try {
                                    d = e.name | 0
                                } catch (f) {
                                    l.recordError(1280);
                                    ca("GL_INVALID_ENUM in glGet" + c + "v: Unknown object returned from WebGL getParameter(" + a + ")! (error: " + f + ")");
                                    return
                                }
                            }
                            break;
                        default:
                            l.recordError(1280);
                            return
                    }
                    switch (c) {
                        case "Integer64":
                            tempI64 = [d >>> 0, (tempDouble = d, 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)];
                            p[b >> 2] = tempI64[0];
                            p[b + 4 >> 2] = tempI64[1];
                            break;
                        case "Integer":
                            p[b >> 2] = d;
                            break;
                        case "Float":
                            y[b >> 2] = d;
                            break;
                        case "Boolean":
                            X[b >> 0] = d ? 1 : 0;
                            break;
                        default:
                            throw "internal glGet error, bad type: " + c;
                    }
                } else l.recordError(1281)
            },
            th = function(a, b) {
                return m.getAttribLocation(l.programs[a], ea(b))
            },
            uh = function(a, b, c, d) {
                a = m.getAttachedShaders(l.programs[a]);
                var e = a.length;
                e > b && (e = b);
                p[c >> 2] = e;
                for (b = 0; b < e; ++b) c = l.shaders.indexOf(a[b]), p[d + 4 * b >> 2] = c
            },
            vh = function(a, b, c, d, e) {
                if (e)
                    if (0 < b && 0 == c) l.recordError(1281);
                    else {
                        a = l.programs[a];
                        for (var f = [], k = 0; k < b; k++) f.push(p[c +
                            4 * k >> 2]);
                        if (a = m.getActiveUniforms(a, f, d))
                            for (b = a.length, k = 0; k < b; k++) p[e + 4 * k >> 2] = a[k]
                    }
                else l.recordError(1281)
            },
            wh = function(a, b, c, d) {
                if (d) switch (a = l.programs[a], c) {
                    case 35393:
                        a = m.getActiveUniformBlockName(a, b);
                        p[d >> 2] = a.length + 1;
                        break;
                    default:
                        if (a = m.getActiveUniformBlockParameter(a, b, c))
                            if ("number" == typeof a) p[d >> 2] = a;
                            else
                                for (b = 0; b < a.length; b++) p[d + 4 * b >> 2] = a[b]
                } else l.recordError(1281)
            },
            xh = function(a, b, c, d, e) {
                a = l.programs[a];
                if (a = m.getActiveUniformBlockName(a, b)) e && 0 < c ? (c = la(a, G, e, c), d && (p[d >> 2] =
                    c)) : d && (p[d >> 2] = 0)
            },
            yh = function(a, b, c, d, e, f, k) {
                a = l.programs[a];
                if (a = m.getActiveUniform(a, b)) 0 < c && k ? (c = la(a.name, G, k, c), d && (p[d >> 2] = c)) : d && (p[d >> 2] = 0), e && (p[e >> 2] = a.size), f && (p[f >> 2] = a.type)
            },
            zh = function(a, b, c, d, e, f, k) {
                a = l.programs[a];
                if (a = m.getActiveAttrib(a, b)) 0 < c && k ? (c = la(a.name, G, k, c), d && (p[d >> 2] = c)) : d && (p[d >> 2] = 0), e && (p[e >> 2] = a.size), f && (p[f >> 2] = a.type)
            },
            Ah = function(a) {
                m.generateMipmap(a)
            },
            Bh = function(a, b) {
                Da(a, b, "createVertexArray", l.vaos)
            },
            Ch = function(a, b) {
                Da(a, b, "createVertexArray", l.vaos)
            },
            Dh = function(a, b) {
                Da(a, b, "createTransformFeedback", l.transformFeedbacks)
            },
            Eh = function(a, b) {
                Da(a, b, "createTexture", l.textures)
            },
            Fh = function(a, b) {
                Da(a, b, "createSampler", l.samplers)
            },
            Gh = function(a, b) {
                Da(a, b, "createRenderbuffer", l.renderbuffers)
            },
            Hh = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = m.disjointTimerQueryExt.createQueryEXT();
                    if (!d) {
                        for (l.recordError(1282); c < a;) p[b + 4 * c++ >> 2] = 0;
                        break
                    }
                    var e = l.getNewId(l.timerQueriesEXT);
                    d.name = e;
                    l.timerQueriesEXT[e] = d;
                    p[b + 4 * c >> 2] = e
                }
            },
            Ih = function(a, b) {
                Da(a, b, "createQuery",
                    l.queries)
            },
            Jh = function(a, b) {
                Da(a, b, "createFramebuffer", l.framebuffers)
            },
            Kh = function(a, b) {
                Da(a, b, "createBuffer", l.buffers)
            },
            Da = function(a, b, c, d) {
                for (var e = 0; e < a; e++) {
                    var f = m[c](),
                        k = f && l.getNewId(d);
                    f ? (f.name = k, d[k] = f) : l.recordError(1282);
                    p[b + 4 * e >> 2] = k
                }
            },
            Lh = function(a) {
                m.frontFace(a)
            },
            Mh = function(a, b, c, d, e) {
                m.framebufferTextureLayer(a, b, l.textures[c], d, e)
            },
            Nh = function(a, b, c, d, e) {
                m.framebufferTexture2D(a, b, c, l.textures[d], e)
            },
            Oh = function(a, b, c, d) {
                m.framebufferRenderbuffer(a, b, c, l.renderbuffers[d])
            },
            Ph = function() {
                ca("missing function: emscripten_glFlushMappedBufferRange");
                K(-1)
            },
            Qh = function() {
                m.flush()
            },
            Rh = function() {
                m.finish()
            },
            Sh = function(a, b) {
                return (a = m.fenceSync(a, b)) ? (b = l.getNewId(l.syncs), a.name = b, l.syncs[b] = a, b) : 0
            },
            Th = function() {
                m.endTransformFeedback()
            },
            Uh = function(a) {
                m.disjointTimerQueryExt.endQueryEXT(a)
            },
            Vh = function(a) {
                m.endQuery(a)
            },
            Wh = function(a) {
                m.enableVertexAttribArray(a)
            },
            Xh = function(a) {
                m.enable(a)
            },
            Zh = function(a, b, c, d, e, f) {
                Yh(a, d, e, f)
            },
            Yh = function(a, b, c, d) {
                m.drawElements(a,
                    b, c, d)
            },
            $h = function(a, b, c, d, e) {
                m.drawElementsInstanced(a, b, c, d, e)
            },
            ai = function(a, b, c, d, e) {
                m.drawElementsInstanced(a, b, c, d, e)
            },
            bi = function(a, b, c, d, e) {
                m.drawElementsInstanced(a, b, c, d, e)
            },
            ci = function(a, b, c, d, e) {
                m.drawElementsInstanced(a, b, c, d, e)
            },
            di = function(a, b, c, d, e) {
                m.drawElementsInstanced(a, b, c, d, e)
            },
            ei = function(a, b, c, d) {
                m.drawElements(a, b, c, d)
            },
            fi = function(a, b) {
                for (var c = Xa[a], d = 0; d < a; d++) c[d] = p[b + 4 * d >> 2];
                m.drawBuffers(c)
            },
            gi = function(a, b) {
                for (var c = Xa[a], d = 0; d < a; d++) c[d] = p[b + 4 * d >> 2];
                m.drawBuffers(c)
            },
            hi = function(a, b) {
                for (var c = Xa[a], d = 0; d < a; d++) c[d] = p[b + 4 * d >> 2];
                m.drawBuffers(c)
            },
            ii = function(a, b, c, d) {
                m.drawArraysInstanced(a, b, c, d)
            },
            ji = function(a, b, c, d) {
                m.drawArraysInstanced(a, b, c, d)
            },
            ki = function(a, b, c, d) {
                m.drawArraysInstanced(a, b, c, d)
            },
            li = function(a, b, c, d) {
                m.drawArraysInstanced(a, b, c, d)
            },
            mi = function(a, b, c, d) {
                m.drawArraysInstanced(a, b, c, d)
            },
            ni = function(a, b, c) {
                m.drawArrays(a, b, c)
            },
            oi = function(a) {
                m.disableVertexAttribArray(a)
            },
            pi = function(a) {
                m.disable(a)
            },
            qi = function(a, b) {
                m.detachShader(l.programs[a],
                    l.shaders[b])
            },
            ri = function(a, b) {
                m.depthRange(a, b)
            },
            si = function(a) {
                m.depthMask(!!a)
            },
            ti = function(a) {
                m.depthFunc(a)
            },
            ui = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = p[b + 4 * c >> 2];
                    m.deleteVertexArray(l.vaos[d]);
                    l.vaos[d] = null
                }
            },
            vi = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = p[b + 4 * c >> 2];
                    m.deleteVertexArray(l.vaos[d]);
                    l.vaos[d] = null
                }
            },
            wi = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = p[b + 4 * c >> 2],
                        e = l.transformFeedbacks[d];
                    e && (m.deleteTransformFeedback(e), e.name = 0, l.transformFeedbacks[d] = null)
                }
            },
            xi = function(a, b) {
                for (var c =
                        0; c < a; c++) {
                    var d = p[b + 4 * c >> 2],
                        e = l.textures[d];
                    e && (m.deleteTexture(e), e.name = 0, l.textures[d] = null)
                }
            },
            yi = function(a) {
                if (a) {
                    var b = l.syncs[a];
                    b ? (m.deleteSync(b), b.name = 0, l.syncs[a] = null) : l.recordError(1281)
                }
            },
            zi = function(a) {
                if (a) {
                    var b = l.shaders[a];
                    b ? (m.deleteShader(b), l.shaders[a] = null) : l.recordError(1281)
                }
            },
            Ai = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = p[b + 4 * c >> 2],
                        e = l.samplers[d];
                    e && (m.deleteSampler(e), e.name = 0, l.samplers[d] = null)
                }
            },
            Bi = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = p[b + 4 * c >> 2],
                        e = l.renderbuffers[d];
                    e && (m.deleteRenderbuffer(e), e.name = 0, l.renderbuffers[d] = null)
                }
            },
            Ci = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = p[b + 4 * c >> 2],
                        e = l.timerQueriesEXT[d];
                    e && (m.disjointTimerQueryExt.deleteQueryEXT(e), l.timerQueriesEXT[d] = null)
                }
            },
            Di = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = p[b + 4 * c >> 2],
                        e = l.queries[d];
                    e && (m.deleteQuery(e), l.queries[d] = null)
                }
            },
            Ei = function(a) {
                if (a) {
                    var b = l.programs[a];
                    b ? (m.deleteProgram(b), b.name = 0, l.programs[a] = null, l.programInfos[a] = null) : l.recordError(1281)
                }
            },
            Fi = function(a, b) {
                for (var c = 0; c < a; ++c) {
                    var d =
                        p[b + 4 * c >> 2],
                        e = l.framebuffers[d];
                    e && (m.deleteFramebuffer(e), e.name = 0, l.framebuffers[d] = null)
                }
            },
            Gi = function(a, b) {
                for (var c = 0; c < a; c++) {
                    var d = p[b + 4 * c >> 2],
                        e = l.buffers[d];
                    e && (m.deleteBuffer(e), e.name = 0, l.buffers[d] = null, d == l.currArrayBuffer && (l.currArrayBuffer = 0), d == l.currElementArrayBuffer && (l.currElementArrayBuffer = 0), d == m.currentPixelPackBufferBinding && (m.currentPixelPackBufferBinding = 0), d == m.currentPixelUnpackBufferBinding && (m.currentPixelUnpackBufferBinding = 0))
                }
            },
            Hi = function(a) {
                m.cullFace(a)
            },
            Ii = function(a) {
                var b =
                    l.getNewId(l.shaders);
                l.shaders[b] = m.createShader(a);
                return b
            },
            Ji = function() {
                var a = l.getNewId(l.programs),
                    b = m.createProgram();
                b.name = a;
                l.programs[a] = b;
                return a
            },
            Ki = function(a, b, c, d, e, f, k, n, q) {
                m.copyTexSubImage3D(a, b, c, d, e, f, k, n, q)
            },
            Li = function(a, b, c, d, e, f, k, n) {
                m.copyTexSubImage2D(a, b, c, d, e, f, k, n)
            },
            Mi = function(a, b, c, d, e, f, k, n) {
                m.copyTexImage2D(a, b, c, d, e, f, k, n)
            },
            Ni = function(a, b, c, d, e) {
                m.copyBufferSubData(a, b, c, d, e)
            },
            Oi = function(a, b, c, d, e, f, k, n, q, r, t) {
                l.currentContext.supportsWebGL2EntryPoints ? m.currentPixelUnpackBufferBinding ?
                    m.compressedTexSubImage3D(a, b, c, d, e, f, k, n, q, r, t) : m.compressedTexSubImage3D(a, b, c, d, e, f, k, n, q, G, t, r) : m.compressedTexSubImage3D(a, b, c, d, e, f, k, n, q, t ? G.subarray(t, t + r) : null)
            },
            Pi = function(a, b, c, d, e, f, k, n, q) {
                l.currentContext.supportsWebGL2EntryPoints ? m.currentPixelUnpackBufferBinding ? m.compressedTexSubImage2D(a, b, c, d, e, f, k, n, q) : m.compressedTexSubImage2D(a, b, c, d, e, f, k, G, q, n) : m.compressedTexSubImage2D(a, b, c, d, e, f, k, q ? G.subarray(q, q + n) : null)
            },
            Qi = function(a, b, c, d, e, f, k, n, q) {
                l.currentContext.supportsWebGL2EntryPoints ?
                    m.currentPixelUnpackBufferBinding ? m.compressedTexImage3D(a, b, c, d, e, f, k, n, q) : m.compressedTexImage3D(a, b, c, d, e, f, k, G, q, n) : m.compressedTexImage3D(a, b, c, d, e, f, k, q ? G.subarray(q, q + n) : null)
            },
            Ri = function(a, b, c, d, e, f, k, n) {
                l.currentContext.supportsWebGL2EntryPoints ? m.currentPixelUnpackBufferBinding ? m.compressedTexImage2D(a, b, c, d, e, f, k, n) : m.compressedTexImage2D(a, b, c, d, e, f, G, n, k) : m.compressedTexImage2D(a, b, c, d, e, f, n ? G.subarray(n, n + k) : null)
            },
            Si = function(a) {
                m.compileShader(l.shaders[a])
            },
            Ti = function(a, b, c, d) {
                m.colorMask(!!a, !!b, !!c, !!d)
            },
            Ui = function(a, b, c, d) {
                c >>>= 0;
                d >>>= 0;
                c = 4294967295 == c && 4294967295 == d ? -1 : +(c >>> 0) + 4294967296 * +(d >>> 0);
                return m.clientWaitSync(l.syncs[a], b, c)
            },
            Vi = function(a) {
                m.clearStencil(a)
            },
            Wi = function(a) {
                m.clearDepth(a)
            },
            Xi = function(a, b, c, d) {
                m.clearColor(a, b, c, d)
            },
            Yi = function(a, b, c) {
                m.clearBufferuiv(a, b, R, c >> 2)
            },
            Zi = function(a, b, c) {
                m.clearBufferiv(a, b, p, c >> 2)
            },
            $i = function(a, b, c) {
                m.clearBufferfv(a, b, y, c >> 2)
            },
            aj = function(a, b, c, d) {
                m.clearBufferfi(a, b, c, d)
            },
            bj = function(a) {
                m.clear(a)
            },
            cj = function(a) {
                return m.checkFramebufferStatus(a)
            },
            dj = function(a, b, c, d) {
                l.currentContext.supportsWebGL2EntryPoints ? m.bufferSubData(a, b, G, d, c) : m.bufferSubData(a, b, G.subarray(d, d + c))
            },
            ej = function(a, b, c, d) {
                l.currentContext.supportsWebGL2EntryPoints ? c ? m.bufferData(a, G, d, c, b) : m.bufferData(a, b, d) : m.bufferData(a, c ? G.subarray(c, c + b) : b, d)
            },
            fj = function(a, b, c, d, e, f, k, n, q, r) {
                m.blitFramebuffer(a, b, c, d, e, f, k, n, q, r)
            },
            gj = function(a, b, c, d) {
                m.blendFuncSeparate(a, b, c, d)
            },
            hj = function(a, b) {
                m.blendFunc(a, b)
            },
            ij = function(a, b) {
                m.blendEquationSeparate(a, b)
            },
            jj = function(a) {
                m.blendEquation(a)
            },
            kj = function(a, b, c, d) {
                m.blendColor(a, b, c, d)
            },
            lj = function(a) {
                m.bindVertexArray(l.vaos[a])
            },
            mj = function(a) {
                m.bindVertexArray(l.vaos[a])
            },
            nj = function(a, b) {
                m.bindTransformFeedback(a, l.transformFeedbacks[b])
            },
            oj = function(a, b) {
                m.bindTexture(a, l.textures[b])
            },
            pj = function(a, b) {
                m.bindSampler(a, l.samplers[b])
            },
            qj = function(a, b) {
                m.bindRenderbuffer(a, l.renderbuffers[b])
            },
            rj = function(a, b) {
                m.bindFramebuffer(a, l.framebuffers[b])
            },
            sj = function(a, b, c, d, e) {
                m.bindBufferRange(a, b, l.buffers[c], d, e)
            },
            tj = function(a, b, c) {
                m.bindBufferBase(a,
                    b, l.buffers[c])
            },
            uj = function(a, b) {
                35051 == a ? m.currentPixelPackBufferBinding = b : 35052 == a && (m.currentPixelUnpackBufferBinding = b);
                m.bindBuffer(a, l.buffers[b])
            },
            vj = function(a, b, c) {
                m.bindAttribLocation(l.programs[a], b, ea(c))
            },
            wj = function(a) {
                m.beginTransformFeedback(a)
            },
            xj = function(a, b) {
                m.disjointTimerQueryExt.beginQueryEXT(a, l.timerQueriesEXT[b])
            },
            yj = function(a, b) {
                m.beginQuery(a, l.queries[b])
            },
            zj = function(a, b) {
                m.attachShader(l.programs[a], l.shaders[b])
            },
            Aj = function(a) {
                m.activeTexture(a)
            },
            vc = function() {
                return X.length
            },
            Cj = function(a, b, c) {
                function d() {
                    Bj(a, "vi")(b)
                }
                h.noExitRuntime = !0;
                0 <= c ? v.safeSetTimeout(d, c) : v.safeRequestAnimationFrame(d)
            },
            Dj = function() {
                if (C.defaultDisplayInitialized)
                    if (h.ctx)
                        if (h.ctx.isContextLost()) C.setErrorCode(12302);
                        else return C.setErrorCode(12288), 1;
                else C.setErrorCode(12290);
                else C.setErrorCode(12289);
                return 0
            },
            Ej = function() {
                C.currentContext = 0;
                C.currentReadSurface = 0;
                C.currentDrawSurface = 0;
                C.setErrorCode(12288);
                return 1
            },
            Fj = function(a, b, c, d) {
                if (62E3 != a) return C.setErrorCode(12296), 0;
                if (0 !=
                    d && 62004 != d) return C.setErrorCode(12294), 0;
                if (0 != c && 62006 != c || 0 != b && 62006 != b) return C.setErrorCode(12301), 0;
                l.makeContextCurrent(d ? C.context : null);
                C.currentContext = d;
                C.currentDrawSurface = b;
                C.currentReadSurface = c;
                C.setErrorCode(12288);
                return 1
            },
            Gj = function(a, b, c) {
                if (62E3 == a) return b && (p[b >> 2] = 1), c && (p[c >> 2] = 4), C.defaultDisplayInitialized = !0, C.setErrorCode(12288), 1;
                C.setErrorCode(12296);
                return 0
            },
            Ij = function(a) {
                return Hj(a)
            },
            Jj = function() {
                C.setErrorCode(12288);
                return 62E3
            },
            Kj = function(a) {
                if (12378 ==
                    a) return C.currentReadSurface;
                if (12377 == a) return C.currentDrawSurface;
                C.setErrorCode(12300);
                return 0
            },
            Lj = function() {
                return C.currentContext ? 62E3 : 0
            },
            Mj = function() {
                return C.currentContext
            },
            Nj = function(a, b) {
                if (62E3 != a) return C.setErrorCode(12296), 0;
                if (62006 != b) return C.setErrorCode(12301), 1;
                C.currentReadSurface == b && (C.currentReadSurface = 0);
                C.currentDrawSurface == b && (C.currentDrawSurface = 0);
                C.setErrorCode(12288);
                return 1
            },
            Oj = function(a, b) {
                if (62E3 != a) return C.setErrorCode(12296), 0;
                if (62004 != b) return C.setErrorCode(12294),
                    0;
                C.setErrorCode(12288);
                return 1
            },
            Pj = function(a, b) {
                if (62E3 != a) return C.setErrorCode(12296), 0;
                if (62002 != b) return C.setErrorCode(12293), 0;
                C.setErrorCode(12288);
                return 62006
            },
            Qj = function(a, b, c, d) {
                if (62E3 != a) return C.setErrorCode(12296), 0;
                for (a = 1;;) {
                    b = p[d >> 2];
                    if (12440 == b) a = p[d + 4 >> 2];
                    else if (12344 == b) break;
                    else return C.setErrorCode(12292), 0;
                    d += 8
                }
                if (2 > a || 3 < a) return C.setErrorCode(12293), 0;
                C.contextAttributes.majorVersion = a - 1;
                C.contextAttributes.minorVersion = 0;
                C.context = l.createContext(h.canvas, C.contextAttributes);
                if (0 != C.context) return C.setErrorCode(12288), l.makeContextCurrent(C.context), h.useWebGL = !0, v.moduleContextCreatedCallbacks.forEach(function(e) {
                    e()
                }), l.makeContextCurrent(null), 62004;
                C.setErrorCode(12297);
                return 0
            },
            Rj = function(a, b, c, d, e) {
                return C.chooseConfig(a, b, c, d, e)
            },
            Sj = function(a, b, c, d, e) {
                h.noExitRuntime = !0;
                ja(!v.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
                v.mainLoop.func = a;
                v.mainLoop.arg = d;
                var f = "undefined" !== typeof d ? function() {
                    h.dynCall_vi(a, d)
                } : function() {
                    h.dynCall_v(a)
                };
                var k = v.mainLoop.currentlyRunningMainloop;
                v.mainLoop.runner = function() {
                    if (!xa)
                        if (0 < v.mainLoop.queue.length) {
                            var n = Date.now(),
                                q = v.mainLoop.queue.shift();
                            q.func(q.arg);
                            if (v.mainLoop.remainingBlockers) {
                                var r = v.mainLoop.remainingBlockers,
                                    t = 0 == r % 1 ? r - 1 : Math.floor(r);
                                q.counted ? v.mainLoop.remainingBlockers = t : (t += .5, v.mainLoop.remainingBlockers = (8 * r + t) / 9)
                            }
                            console.log('main loop blocker "' +
                                q.name + '" took ' + (Date.now() - n) + " ms");
                            v.mainLoop.updateStatus();
                            k < v.mainLoop.currentlyRunningMainloop || setTimeout(v.mainLoop.runner, 0)
                        } else k < v.mainLoop.currentlyRunningMainloop || (v.mainLoop.currentFrameNumber = v.mainLoop.currentFrameNumber + 1 | 0, 1 == v.mainLoop.timingMode && 1 < v.mainLoop.timingValue && 0 != v.mainLoop.currentFrameNumber % v.mainLoop.timingValue ? v.mainLoop.scheduler() : (0 == v.mainLoop.timingMode && (v.mainLoop.tickStartTime = Db()), "timeout" === v.mainLoop.method && h.ctx && (ca("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!"),
                            v.mainLoop.method = ""), v.mainLoop.runIter(f), k < v.mainLoop.currentlyRunningMainloop || ("object" === typeof SDL && SDL.audio && SDL.audio.queueNewAudioData && SDL.audio.queueNewAudioData(), v.mainLoop.scheduler())))
                };
                e || (b && 0 < b ? Vb(0, 1E3 / b) : Vb(1, 1), v.mainLoop.scheduler());
                if (c) throw "SimulateInfiniteLoop";
            },
            Vb = function(a, b) {
                v.mainLoop.timingMode = a;
                v.mainLoop.timingValue = b;
                if (!v.mainLoop.func) return 1;
                if (0 == a) v.mainLoop.scheduler = function() {
                    var d = Math.max(0, v.mainLoop.tickStartTime + b - Db()) | 0;
                    setTimeout(v.mainLoop.runner,
                        d)
                }, v.mainLoop.method = "timeout";
                else if (1 == a) v.mainLoop.scheduler = function() {
                    v.requestAnimationFrame(v.mainLoop.runner)
                }, v.mainLoop.method = "rAF";
                else if (2 == a) {
                    if ("undefined" === typeof setImmediate) {
                        var c = [];
                        a = function(d) {
                            if ("setimmediate" === d.data || "setimmediate" === d.data.target) d.stopPropagation(), c.shift()()
                        };
                        addEventListener("message", a, !0);
                        setImmediate = function(d) {
                            c.push(d);
                            sa ? (void 0 === h.setImmediates && (h.setImmediates = []), h.setImmediates.push(d), postMessage({
                                target: "setimmediate"
                            })) : postMessage("setimmediate",
                                "*")
                        }
                    }
                    v.mainLoop.scheduler = function() {
                        setImmediate(v.mainLoop.runner)
                    };
                    v.mainLoop.method = "immediate"
                }
                return 0
            },
            Uj = function(a, b) {
                if (0 === a) a = Date.now();
                else if (1 === a && Tj()) a = Db();
                else return Ka(22), -1;
                p[b >> 2] = a / 1E3 | 0;
                p[b + 4 >> 2] = a % 1E3 * 1E6 | 0;
                return 0
            },
            Tj = function() {
                return Ea || "undefined" !== typeof dateNow || "object" === typeof performance && performance && "function" === typeof performance.now
            },
            Db = function() {
                K()
            },
            Vj = function() {
                h.abort()
            },
            Xj = function(a) {
                return Wj(a)
            },
            Wj = function(a) {
                if (!h.noExitRuntime && (xa = !0, h.onExit)) h.onExit(a);
                h.quit(a, new wa(a))
            },
            Yj = function(a, b) {
                a = Za(a, "_emval_take_value");
                a = a.readValueFromPointer(b);
                return ua(a)
            },
            Zj = function(a) {
                var b = ma[a].value;
                kb(b);
                Wb(a)
            },
            ak = function(a) {
                return ua(Eb(a))
            },
            ck = function(a, b, c, d) {
                a = Qa(a);
                var e = wc[b];
                e || (e = bk(b), wc[b] = e);
                return e(a, c, d)
            },
            bk = function(a) {
                var b = Array(a + 1);
                return function(c, d, e) {
                    b[0] = c;
                    for (var f = 0; f < a; ++f) {
                        var k = Za(p[(d >> 2) + f], "parameter " + f);
                        b[f + 1] = k.readValueFromPointer(e);
                        e += k.argPackAdvance
                    }
                    c = new(c.bind.apply(c, b));
                    return ua(c)
                }
            },
            dk = function(a) {
                4 < a && (ma[a].refcount +=
                    1)
            },
            ek = function(a, b) {
                a = Qa(a);
                b = Qa(b);
                return ua(a[b])
            },
            hk = function(a, b) {
                var c = fk(a, b),
                    d = c[0],
                    e = Array(a - 1);
                b = function(f, k, n, q) {
                    for (var r = 0, t = 0; t < a - 1; ++t) e[t] = c[t + 1].readValueFromPointer(q + r), r += c[t + 1].argPackAdvance;
                    f = f[k].apply(f, e);
                    for (t = 0; t < a - 1; ++t) c[t + 1].deleteObject && c[t + 1].deleteObject(e[t]);
                    if (!d.isVoid) return d.toWireType(n, f)
                };
                return gk(b)
            },
            fk = function(a, b) {
                for (var c = Array(a), d = 0; d < a; ++d) c[d] = Za(p[(b >> 2) + d], "parameter " + d);
                return c
            },
            gk = function(a) {
                var b = Fb.length;
                Fb.push(a);
                return b
            },
            ik = function(a) {
                if (0 ===
                    a) return ua(xc());
                a = Eb(a);
                return ua(xc()[a])
            },
            xc = function() {
                function a(b) {
                    b.$$$embind_global$$$ = b;
                    var c = "object" === typeof $$$embind_global$$$ && b.$$$embind_global$$$ === b;
                    c || delete b.$$$embind_global$$$;
                    return c
                }
                if ("object" === typeof $$$embind_global$$$) return $$$embind_global$$$;
                "object" === typeof global && a(global) ? $$$embind_global$$$ = global : "object" === typeof window && a(window) && ($$$embind_global$$$ = window);
                if ("object" === typeof $$$embind_global$$$) return $$$embind_global$$$;
                throw Error("unable to get global object.");
            },
            jk = function(a, b, c, d) {
                a = Fb[a];
                b = Qa(b);
                c = Eb(c);
                a(b, c, null, d)
            },
            lk = function(a, b, c, d, e) {
                a = Fb[a];
                b = Qa(b);
                c = Eb(c);
                return a(b, c, kk(d), e)
            },
            Eb = function(a) {
                var b = mk[a];
                return void 0 === b ? da(a) : b
            },
            kk = function(a) {
                var b = [];
                p[a >> 2] = ua(b);
                return b
            },
            nk = function(a, b, c) {
                a = Qa(a);
                b = Za(b, "emval::as");
                var d = [],
                    e = ua(d);
                p[c >> 2] = e;
                return b.toWireType(d, a)
            },
            ok = function(a, b) {
                b = da(b);
                ya(a, {
                    isVoid: !0,
                    name: b,
                    argPackAdvance: 0,
                    fromWireType: function() {},
                    toWireType: function() {}
                })
            },
            pk = function(a, b, c, d, e, f, k, n, q) {
                Gb[a].elements.push({
                    getterReturnType: b,
                    getter: na(c, d),
                    getterContext: e,
                    setterArgumentType: f,
                    setter: na(k, n),
                    setterContext: q
                })
            },
            qk = function(a, b, c, d, e, f) {
                Gb[a] = {
                    name: da(b),
                    rawConstructor: na(c, d),
                    rawDestructor: na(e, f),
                    elements: []
                }
            },
            rk = function(a, b, c) {
                c = da(c);
                if (2 === b) {
                    var d = function() {
                        return Wa
                    };
                    var e = 1
                } else 4 === b && (d = function() {
                    return R
                }, e = 2);
                ya(a, {
                    name: c,
                    fromWireType: function(f) {
                        for (var k = d(), n = R[f >> 2], q = Array(n), r = f + 4 >> e, t = 0; t < n; ++t) q[t] = String.fromCharCode(k[r + t]);
                        qa(f);
                        return q.join("")
                    },
                    toWireType: function(f, k) {
                        var n = d(),
                            q = k.length,
                            r =
                            ta(4 + q * b);
                        R[r >> 2] = q;
                        for (var t = r + 4 >> e, w = 0; w < q; ++w) n[t + w] = k.charCodeAt(w);
                        null !== f && f.push(qa, r);
                        return r
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: lb,
                    destructorFunction: function(f) {
                        qa(f)
                    }
                })
            },
            sk = function(a, b) {
                b = da(b);
                var c = "std::string" === b;
                ya(a, {
                    name: b,
                    fromWireType: function(d) {
                        var e = R[d >> 2];
                        if (c) {
                            var f = G[d + 4 + e],
                                k = 0;
                            0 != f && (k = f, G[d + 4 + e] = 0);
                            var n = d + 4;
                            for (f = 0; f <= e; ++f) {
                                var q = d + 4 + f;
                                if (0 == G[q]) {
                                    n = ea(n);
                                    if (void 0 === r) var r = n;
                                    else r += String.fromCharCode(0), r += n;
                                    n = q + 1
                                }
                            }
                            0 != k && (G[d + 4 + e] = k)
                        } else {
                            r = Array(e);
                            for (f =
                                0; f < e; ++f) r[f] = String.fromCharCode(G[d + 4 + f]);
                            r = r.join("")
                        }
                        qa(d);
                        return r
                    },
                    toWireType: function(d, e) {
                        e instanceof ArrayBuffer && (e = new Uint8Array(e));
                        var f = "string" === typeof e;
                        f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array || J("Cannot pass non-string to std::string");
                        var k = c && f ? function() {
                            return Ta(e)
                        } : function() {
                            return e.length
                        };
                        k = k();
                        var n = ta(4 + k + 1);
                        R[n >> 2] = k;
                        if (c && f) la(e, G, n + 4, k + 1);
                        else if (f)
                            for (f = 0; f < k; ++f) {
                                var q = e.charCodeAt(f);
                                255 < q && (qa(n), J("String has UTF-16 code units that do not fit in 8 bits"));
                                G[n + 4 + f] = q
                            } else
                                for (f = 0; f < k; ++f) G[n + 4 + f] = e[f];
                        null !== d && d.push(qa, n);
                        return n
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: lb,
                    destructorFunction: function(d) {
                        qa(d)
                    }
                })
            },
            tk = function(a, b, c) {
                function d(k) {
                    k >>= 2;
                    var n = R,
                        q = n[k];
                    k = n[k + 1];
                    return new f(n.buffer, k, q)
                }
                var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array],
                    f = e[b];
                c = da(c);
                ya(a, {
                    name: c,
                    fromWireType: d,
                    argPackAdvance: 8,
                    readValueFromPointer: d
                }, {
                    ignoreDuplicateRegistrations: !0
                })
            },
            vk = function(a, b, c, d, e) {
                b = da(b); -
                1 === e && (e = 4294967295);
                var f = Hb(c),
                    k = function(r) {
                        return r
                    };
                if (0 === d) {
                    var n = 32 - 8 * c;
                    k = function(r) {
                        return r << n >>> n
                    }
                }
                var q = -1 != b.indexOf("unsigned");
                ya(a, {
                    name: b,
                    fromWireType: k,
                    toWireType: function(r, t) {
                        if ("number" !== typeof t && "boolean" !== typeof t) throw new TypeError('Cannot convert "' + $a(t) + '" to ' + this.name);
                        if (t < d || t > e) throw new TypeError('Passing a number "' + $a(t) + '" from JS side to C/C++ side to an argument of type "' + b + '", which is outside the valid range [' + d + ", " + e + "]!");
                        return q ? t >>> 0 : t | 0
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: uk(b, f, 0 !== d),
                    destructorFunction: null
                })
            },
            uk = function(a, b, c) {
                switch (b) {
                    case 0:
                        return c ? function(d) {
                            return X[d]
                        } : function(d) {
                            return G[d]
                        };
                    case 1:
                        return c ? function(d) {
                            return La[d >> 1]
                        } : function(d) {
                            return Wa[d >> 1]
                        };
                    case 2:
                        return c ? function(d) {
                            return p[d >> 2]
                        } : function(d) {
                            return R[d >> 2]
                        };
                    default:
                        throw new TypeError("Unknown integer type: " + a);
                }
            },
            wk = function(a, b, c, d, e, f) {
                var k = Ib(b, c);
                a = da(a);
                e = na(d, e);
                Xb(a, function() {
                    Ra("Cannot call " + a + " due to unbound types", k)
                }, b - 1);
                va([], k, function(n) {
                    n =
                        [n[0], null].concat(n.slice(1));
                    yc(a, Yb(a, n, null, e, f), b - 1);
                    return []
                })
            },
            yk = function(a, b, c) {
                c = Hb(c);
                b = da(b);
                ya(a, {
                    name: b,
                    fromWireType: function(d) {
                        return d
                    },
                    toWireType: function(d, e) {
                        if ("number" !== typeof e && "boolean" !== typeof e) throw new TypeError('Cannot convert "' + $a(e) + '" to ' + this.name);
                        return e
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: xk(b, c),
                    destructorFunction: null
                })
            },
            xk = function(a, b) {
                switch (b) {
                    case 2:
                        return function(c) {
                            return this.fromWireType(y[c >> 2])
                        };
                    case 3:
                        return function(c) {
                            return this.fromWireType(Zb[c >>
                                3])
                        };
                    default:
                        throw new TypeError("Unknown float type: " + a);
                }
            },
            $a = function(a) {
                if (null === a) return "null";
                var b = typeof a;
                return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a
            },
            zk = function(a, b, c) {
                var d = Za(a, "enum");
                b = da(b);
                a = d.constructor;
                d = Object.create(d.constructor.prototype, {
                    value: {
                        value: c
                    },
                    constructor: {
                        value: Jb(d.name + "_" + b, function() {})
                    }
                });
                a.values[c] = d;
                a[b] = d
            },
            Bk = function(a, b, c, d) {
                function e() {}
                c = Hb(c);
                b = da(b);
                e.values = {};
                ya(a, {
                    name: b,
                    constructor: e,
                    fromWireType: function(f) {
                        return this.constructor.values[f]
                    },
                    toWireType: function(f, k) {
                        return k.value
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: Ak(b, c, d),
                    destructorFunction: null
                });
                Xb(b, e)
            },
            Ak = function(a, b, c) {
                switch (b) {
                    case 0:
                        return function(d) {
                            var e = c ? X : G;
                            return this.fromWireType(e[d])
                        };
                    case 1:
                        return function(d) {
                            var e = c ? La : Wa;
                            return this.fromWireType(e[d >> 1])
                        };
                    case 2:
                        return function(d) {
                            var e = c ? p : R;
                            return this.fromWireType(e[d >> 2])
                        };
                    default:
                        throw new TypeError("Unknown integer type: " + a);
                }
            },
            Ck = function(a, b) {
                b = da(b);
                ya(a, {
                    name: b,
                    fromWireType: function(c) {
                        var d = ma[c].value;
                        Wb(c);
                        return d
                    },
                    toWireType: function(c, d) {
                        return ua(d)
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: lb,
                    destructorFunction: null
                })
            },
            Wb = function(a) {
                4 < a && 0 === --ma[a].refcount && (ma[a] = void 0, $b.push(a))
            },
            Dk = function(a, b, c, d, e, f, k, n, q, r) {
                b = da(b);
                e = na(d, e);
                va([], [a], function(t) {
                    t = t[0];
                    var w = t.name + "." + b,
                        x = {
                            get: function() {
                                Ra("Cannot access " + w + " due to unbound types", [c, k])
                            },
                            enumerable: !0,
                            configurable: !0
                        };
                    x.set = q ? function() {
                        Ra("Cannot access " + w + " due to unbound types", [c, k])
                    } : function() {
                        J(w + " is a read-only property")
                    };
                    Object.defineProperty(t.registeredClass.instancePrototype, b, x);
                    va([], q ? [c, k] : [c], function(u) {
                        var z = u[0],
                            E = {
                                get: function() {
                                    var W = zc(this, t, w + " getter");
                                    return z.fromWireType(e(f, W))
                                },
                                enumerable: !0
                            };
                        if (q) {
                            q = na(n, q);
                            var L = u[1];
                            E.set = function(W) {
                                var pa = zc(this, t, w + " setter"),
                                    fa = [];
                                q(r, pa, L.toWireType(fa, W));
                                kb(fa)
                            }
                        }
                        Object.defineProperty(t.registeredClass.instancePrototype, b, E);
                        return []
                    });
                    return []
                })
            },
            zc = function(a, b, c) {
                a instanceof Object || J(c + ' with invalid "this": ' + a);
                a instanceof b.registeredClass.constructor ||
                    J(c + ' incompatible with "this" of type ' + a.constructor.name);
                a.$$.ptr || J("cannot call emscripten binding method " + c + " on deleted object");
                return Kb(a.$$.ptr, a.$$.ptrType.registeredClass, b.registeredClass)
            },
            Ek = function(a, b, c, d, e, f, k, n) {
                var q = Ib(c, d);
                b = da(b);
                f = na(e, f);
                va([], [a], function(r) {
                    function t() {
                        Ra("Cannot call " + w + " due to unbound types", q)
                    }
                    r = r[0];
                    var w = r.name + "." + b;
                    n && r.registeredClass.pureVirtualFunctions.push(b);
                    var x = r.registeredClass.instancePrototype,
                        u = x[b];
                    void 0 === u || void 0 === u.overloadTable &&
                        u.className !== r.name && u.argCount === c - 2 ? (t.argCount = c - 2, t.className = r.name, x[b] = t) : (ac(x, b, w), x[b].overloadTable[c - 2] = t);
                    va([], q, function(z) {
                        z = Yb(w, z, r, f, k);
                        void 0 === x[b].overloadTable ? (z.argCount = c - 2, x[b] = z) : x[b].overloadTable[c - 2] = z;
                        return []
                    });
                    return []
                })
            },
            Fk = function(a, b, c, d, e, f) {
                var k = Ib(b, c);
                e = na(d, e);
                va([], [a], function(n) {
                    n = n[0];
                    var q = "constructor " + n.name;
                    void 0 === n.registeredClass.constructor_body && (n.registeredClass.constructor_body = []);
                    if (void 0 !== n.registeredClass.constructor_body[b - 1]) throw new ab("Cannot register multiple constructors with identical number of parameters (" +
                        (b - 1) + ") for class '" + n.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
                    n.registeredClass.constructor_body[b - 1] = function() {
                        Ra("Cannot construct " + n.name + " due to unbound types", k)
                    };
                    va([], k, function(r) {
                        n.registeredClass.constructor_body[b - 1] = function() {
                            arguments.length !== b - 1 && J(q + " called with " + arguments.length + " arguments, expected " + (b - 1));
                            var t = [],
                                w = Array(b);
                            w[0] = f;
                            for (var x = 1; x < b; ++x) w[x] = r[x].toWireType(t, arguments[x - 1]);
                            w = e.apply(null,
                                w);
                            kb(t);
                            return r[0].fromWireType(w)
                        };
                        return []
                    });
                    return []
                })
            },
            Gk = function(a, b, c, d, e, f, k) {
                var n = Ib(c, d);
                b = da(b);
                f = na(e, f);
                va([], [a], function(q) {
                    function r() {
                        Ra("Cannot call " + t + " due to unbound types", n)
                    }
                    q = q[0];
                    var t = q.name + "." + b,
                        w = q.registeredClass.constructor;
                    void 0 === w[b] ? (r.argCount = c - 1, w[b] = r) : (ac(w, b, t), w[b].overloadTable[c - 1] = r);
                    va([], n, function(x) {
                        x = [x[0], null].concat(x.slice(1));
                        x = Yb(t, x, null, f, k);
                        void 0 === w[b].overloadTable ? (x.argCount = c - 1, w[b] = x) : w[b].overloadTable[c - 1] = x;
                        return []
                    });
                    return []
                })
            },
            Ib = function(a, b) {
                for (var c = [], d = 0; d < a; d++) c.push(p[(b >> 2) + d]);
                return c
            },
            Yb = function(a, b, c, d, e) {
                var f = b.length;
                2 > f && J("argTypes array size mismatch! Must at least get return value and 'this' types!");
                var k = null !== b[1] && null !== c,
                    n = !1;
                for (c = 1; c < b.length; ++c)
                    if (null !== b[c] && void 0 === b[c].destructorFunction) {
                        n = !0;
                        break
                    }
                var q = "void" !== b[0].name,
                    r = Array(f - 2);
                return function() {
                    arguments.length !== f - 2 && J("function " + a + " called with " + arguments.length + " arguments, expected " + (f - 2) + " args!");
                    var t = n ? [] : null,
                        w;
                    k && (w = b[1].toWireType(t, this));
                    for (var x = 0; x < f - 2; ++x) r[x] = b[x + 2].toWireType(t, arguments[x]);
                    x = k ? [e, w] : [e];
                    var u = d.apply(null, x.concat(r));
                    if (n) kb(t);
                    else
                        for (x = k ? 1 : 2; x < b.length; x++) t = 1 === x ? w : r[x - 2], null !== b[x].destructorFunction && b[x].destructorFunction(t);
                    if (q) return b[0].fromWireType(u)
                }
            },
            Ik = function(a, b, c, d, e, f, k, n, q, r, t, w, x) {
                t = da(t);
                f = na(e, f);
                n && (n = na(k, n));
                r && (r = na(q, r));
                x = na(w, x);
                var u = Ac(t);
                Xb(u, function() {
                    Ra("Cannot construct " + t + " due to unbound types", [d])
                });
                va([a, b, c], d ? [d] : [], function(z) {
                    z =
                        z[0];
                    if (d) {
                        var E = z.registeredClass;
                        var L = E.instancePrototype
                    } else L = Ma.prototype;
                    z = Jb(u, function() {
                        if (Object.getPrototypeOf(this) !== W) throw new ab("Use 'new' to construct " + t);
                        if (void 0 === pa.constructor_body) throw new ab(t + " has no accessible constructor");
                        var Bc = pa.constructor_body[arguments.length];
                        if (void 0 === Bc) throw new ab("Tried to invoke ctor of " + t + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(pa.constructor_body).toString() + ") parameters instead!");
                        return Bc.apply(this, arguments)
                    });
                    var W = Object.create(L, {
                        constructor: {
                            value: z
                        }
                    });
                    z.prototype = W;
                    var pa = new Hk(t, z, W, x, E, f, n, r);
                    E = new Fa(t, pa, !0, !1, !1);
                    L = new Fa(t + "*", pa, !1, !1, !1);
                    var fa = new Fa(t + " const*", pa, !1, !0, !1);
                    Cc[a] = {
                        pointerType: L,
                        constPointerType: fa
                    };
                    yc(u, z);
                    return [E, L, fa]
                })
            },
            Ra = function(a, b) {
                function c(f) {
                    e[f] || Sa[f] || (Lb[f] ? Lb[f].forEach(c) : (d.push(f), e[f] = !0))
                }
                var d = [],
                    e = {};
                b.forEach(c);
                throw new Dc(a + ": " + d.map(Ec).join([", "]));
            },
            na = function(a, b) {
                function c(e) {
                    return function() {
                        var f =
                            Array(arguments.length + 1);
                        f[0] = b;
                        for (var k = 0; k < arguments.length; k++) f[k + 1] = arguments[k];
                        return e.apply(null, f)
                    }
                }
                a = da(a);
                if (void 0 !== h["FUNCTION_TABLE_" + a]) var d = h["FUNCTION_TABLE_" + a][b];
                else "undefined" !== typeof FUNCTION_TABLE ? d = FUNCTION_TABLE[b] : (d = h["dynCall_" + a], void 0 === d && (d = h["dynCall_" + a.replace(/f/g, "d")], void 0 === d && J("No dynCall invoker for signature: " + a)), d = c(d));
                "function" !== typeof d && J("unknown function pointer with signature " + a + ": " + b);
                return d
            },
            yc = function(a, b, c) {
                h.hasOwnProperty(a) ||
                    Mb("Replacing nonexistant public symbol");
                void 0 !== h[a].overloadTable && void 0 !== c ? h[a].overloadTable[c] = b : (h[a] = b, h[a].argCount = c)
            },
            Fa = function(a, b, c, d, e, f, k, n, q, r, t) {
                this.name = a;
                this.registeredClass = b;
                this.isReference = c;
                this.isConst = d;
                this.isSmartPointer = e;
                this.pointeeType = f;
                this.sharingPolicy = k;
                this.rawGetPointee = n;
                this.rawConstructor = q;
                this.rawShare = r;
                this.rawDestructor = t;
                e || void 0 !== b.baseClass ? this.toWireType = Jk : (this.toWireType = d ? Kk : Lk, this.destructorFunction = null)
            },
            Nk = function(a) {
                function b() {
                    return this.isSmartPointer ?
                        Nb(this.registeredClass.instancePrototype, {
                            ptrType: this.pointeeType,
                            ptr: c,
                            smartPtrType: this,
                            smartPtr: a
                        }) : Nb(this.registeredClass.instancePrototype, {
                            ptrType: this,
                            ptr: a
                        })
                }
                var c = this.getPointee(a);
                if (!c) return this.destructor(a), null;
                var d = Mk(this.registeredClass, c);
                if (void 0 !== d) {
                    if (0 === d.$$.count.value) return d.$$.ptr = c, d.$$.smartPtr = a, d.clone();
                    d = d.clone();
                    this.destructor(a);
                    return d
                }
                d = this.registeredClass.getActualType(c);
                d = Cc[d];
                if (!d) return b.call(this);
                d = this.isConst ? d.constPointerType : d.pointerType;
                var e = Fc(c, this.registeredClass, d.registeredClass);
                return null === e ? b.call(this) : this.isSmartPointer ? Nb(d.registeredClass.instancePrototype, {
                    ptrType: d,
                    ptr: e,
                    smartPtrType: this,
                    smartPtr: a
                }) : Nb(d.registeredClass.instancePrototype, {
                    ptrType: d,
                    ptr: e
                })
            },
            Nb = function(a, b) {
                b.ptrType && b.ptr || Mb("makeClassHandle requires ptr and ptrType");
                var c = !!b.smartPtrType,
                    d = !!b.smartPtr;
                c !== d && Mb("Both smartPtrType and smartPtr must be specified");
                b.count = {
                    value: 1
                };
                return Object.create(a, {
                    $$: {
                        value: b
                    }
                })
            },
            Mk = function(a, b) {
                b =
                    bc(a, b);
                return Ga[b]
            },
            Fc = function(a, b, c) {
                if (b === c) return a;
                if (void 0 === c.baseClass) return null;
                a = Fc(a, b, c.baseClass);
                return null === a ? null : c.downcast(a)
            },
            Ok = function(a) {
                if (null !== a) a["delete"]()
            },
            Pk = function(a) {
                this.rawDestructor && this.rawDestructor(a)
            },
            Qk = function(a) {
                this.rawGetPointee && (a = this.rawGetPointee(a));
                return a
            },
            Lk = function(a, b) {
                if (null === b) return this.isReference && J("null is not a valid " + this.name), 0;
                b.$$ || J('Cannot pass "' + $a(b) + '" as a ' + this.name);
                b.$$.ptr || J("Cannot pass deleted object as a pointer of type " +
                    this.name);
                b.$$.ptrType.isConst && J("Cannot convert argument of type " + b.$$.ptrType.name + " to parameter type " + this.name);
                a = b.$$.ptrType.registeredClass;
                return b = Kb(b.$$.ptr, a, this.registeredClass)
            },
            Jk = function(a, b) {
                if (null === b) {
                    this.isReference && J("null is not a valid " + this.name);
                    if (this.isSmartPointer) {
                        var c = this.rawConstructor();
                        null !== a && a.push(this.rawDestructor, c);
                        return c
                    }
                    return 0
                }
                b.$$ || J('Cannot pass "' + $a(b) + '" as a ' + this.name);
                b.$$.ptr || J("Cannot pass deleted object as a pointer of type " +
                    this.name);
                !this.isConst && b.$$.ptrType.isConst && J("Cannot convert argument of type " + (b.$$.smartPtrType ? b.$$.smartPtrType.name : b.$$.ptrType.name) + " to parameter type " + this.name);
                c = b.$$.ptrType.registeredClass;
                c = Kb(b.$$.ptr, c, this.registeredClass);
                if (this.isSmartPointer) switch (void 0 === b.$$.smartPtr && J("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
                    case 0:
                        b.$$.smartPtrType === this ? c = b.$$.smartPtr : J("Cannot convert argument of type " + (b.$$.smartPtrType ? b.$$.smartPtrType.name :
                            b.$$.ptrType.name) + " to parameter type " + this.name);
                        break;
                    case 1:
                        c = b.$$.smartPtr;
                        break;
                    case 2:
                        if (b.$$.smartPtrType === this) c = b.$$.smartPtr;
                        else {
                            var d = b.clone();
                            c = this.rawShare(c, ua(function() {
                                d["delete"]()
                            }));
                            null !== a && a.push(this.rawDestructor, c)
                        }
                        break;
                    default:
                        J("Unsupporting sharing policy")
                }
                return c
            },
            Kk = function(a, b) {
                if (null === b) return this.isReference && J("null is not a valid " + this.name), 0;
                b.$$ || J('Cannot pass "' + $a(b) + '" as a ' + this.name);
                b.$$.ptr || J("Cannot pass deleted object as a pointer of type " +
                    this.name);
                a = b.$$.ptrType.registeredClass;
                return b = Kb(b.$$.ptr, a, this.registeredClass)
            },
            Kb = function(a, b, c) {
                for (; b !== c;) b.upcast || J("Expected null or instance of " + c.name + ", got an instance of " + b.name), a = b.upcast(a), b = b.baseClass;
                return a
            },
            Hk = function(a, b, c, d, e, f, k, n) {
                this.name = a;
                this.constructor = b;
                this.instancePrototype = c;
                this.rawDestructor = d;
                this.baseClass = e;
                this.getActualType = f;
                this.upcast = k;
                this.downcast = n;
                this.pureVirtualFunctions = []
            },
            Xb = function(a, b, c) {
                h.hasOwnProperty(a) ? ((void 0 === c || void 0 !==
                    h[a].overloadTable && void 0 !== h[a].overloadTable[c]) && J("Cannot register public name '" + a + "' twice"), ac(h, a, a), h.hasOwnProperty(c) && J("Cannot register multiple overloads of a function with the same number of arguments (" + c + ")!"), h[a].overloadTable[c] = b) : (h[a] = b, void 0 !== c && (h[a].numArguments = c))
            },
            ac = function(a, b, c) {
                if (void 0 === a[b].overloadTable) {
                    var d = a[b];
                    a[b] = function() {
                        a[b].overloadTable.hasOwnProperty(arguments.length) || J("Function '" + c + "' called with an invalid number of arguments (" + arguments.length +
                            ") - expects one of (" + a[b].overloadTable + ")!");
                        return a[b].overloadTable[arguments.length].apply(this, arguments)
                    };
                    a[b].overloadTable = [];
                    a[b].overloadTable[d.argCount] = d
                }
            },
            Ma = function() {},
            Rk = function() {
                this.$$.ptr || cc(this);
                this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && J("Object already scheduled for deletion");
                mb.push(this);
                1 === mb.length && nb && nb(dc);
                this.$$.deleteScheduled = !0;
                return this
            },
            Sk = function() {
                return !this.$$.ptr
            },
            Tk = function() {
                this.$$.ptr || cc(this);
                this.$$.deleteScheduled &&
                    !this.$$.preservePointerOnDelete && J("Object already scheduled for deletion");
                --this.$$.count.value;
                var a = 0 === this.$$.count.value;
                a && (a = this.$$, a.smartPtr ? a.smartPtrType.rawDestructor(a.smartPtr) : a.ptrType.registeredClass.rawDestructor(a.ptr));
                this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0)
            },
            Vk = function() {
                this.$$.ptr || cc(this);
                if (this.$$.preservePointerOnDelete) return this.$$.count.value += 1, this;
                var a = Object.create(Object.getPrototypeOf(this), {
                    $$: {
                        value: Uk(this.$$)
                    }
                });
                a.$$.count.value += 1;
                a.$$.deleteScheduled = !1;
                return a
            },
            cc = function(a) {
                J(a.$$.ptrType.registeredClass.name + " instance already deleted")
            },
            Uk = function(a) {
                return {
                    count: a.count,
                    deleteScheduled: a.deleteScheduled,
                    preservePointerOnDelete: a.preservePointerOnDelete,
                    ptr: a.ptr,
                    ptrType: a.ptrType,
                    smartPtr: a.smartPtr,
                    smartPtrType: a.smartPtrType
                }
            },
            Wk = function(a) {
                if (!(this instanceof Ma && a instanceof Ma)) return !1;
                var b = this.$$.ptrType.registeredClass,
                    c = this.$$.ptr,
                    d = a.$$.ptrType.registeredClass;
                for (a = a.$$.ptr; b.baseClass;) c =
                    b.upcast(c), b = b.baseClass;
                for (; d.baseClass;) a = d.upcast(a), d = d.baseClass;
                return b === d && c === a
            },
            Xk = function(a, b, c, d, e) {
                var f = Hb(c);
                b = da(b);
                ya(a, {
                    name: b,
                    fromWireType: function(k) {
                        return !!k
                    },
                    toWireType: function(k, n) {
                        return n ? d : e
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: function(k) {
                        if (1 === c) var n = X;
                        else if (2 === c) n = La;
                        else if (4 === c) n = p;
                        else throw new TypeError("Unknown boolean type size: " + b);
                        return this.fromWireType(n[k >> f])
                    },
                    destructorFunction: null
                })
            },
            ya = function(a, b, c) {
                c = c || {};
                if (!("argPackAdvance" in b)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
                var d = b.name;
                a || J('type "' + d + '" must have a positive integer typeid pointer');
                if (Sa.hasOwnProperty(a)) {
                    if (c.ignoreDuplicateRegistrations) return;
                    J("Cannot register type '" + d + "' twice")
                }
                Sa[a] = b;
                delete Lb[a];
                bb.hasOwnProperty(a) && (b = bb[a], delete bb[a], b.forEach(function(e) {
                    e()
                }))
            },
            Hb = function(a) {
                switch (a) {
                    case 1:
                        return 0;
                    case 2:
                        return 1;
                    case 4:
                        return 2;
                    case 8:
                        return 3;
                    default:
                        throw new TypeError("Unknown type size: " + a);
                }
            },
            Yk = function(a) {
                var b = Gb[a];
                delete Gb[a];
                var c = b.elements,
                    d = c.length,
                    e = c.map(function(n) {
                        return n.getterReturnType
                    }).concat(c.map(function(n) {
                        return n.setterArgumentType
                    })),
                    f = b.rawConstructor,
                    k = b.rawDestructor;
                va([a], e, function(n) {
                    c.forEach(function(q, r) {
                        var t = n[r],
                            w = q.getter,
                            x = q.getterContext,
                            u = n[r + d],
                            z = q.setter,
                            E = q.setterContext;
                        q.read = function(L) {
                            return t.fromWireType(w(x, L))
                        };
                        q.write = function(L, W) {
                            var pa = [];
                            z(E, L, u.toWireType(pa, W));
                            kb(pa)
                        }
                    });
                    return [{
                        name: b.name,
                        fromWireType: function(q) {
                            for (var r = Array(d), t = 0; t < d; ++t) r[t] = c[t].read(q);
                            k(q);
                            return r
                        },
                        toWireType: function(q, r) {
                            if (d !== r.length) throw new TypeError("Incorrect number of tuple elements for " + b.name + ": expected=" +
                                d + ", actual=" + r.length);
                            for (var t = f(), w = 0; w < d; ++w) c[w].write(t, r[w]);
                            null !== q && q.push(k, t);
                            return t
                        },
                        argPackAdvance: 8,
                        readValueFromPointer: lb,
                        destructorFunction: k
                    }]
                })
            },
            va = function(a, b, c) {
                function d(n) {
                    n = c(n);
                    n.length !== a.length && Mb("Mismatched type converter count");
                    for (var q = 0; q < a.length; ++q) ya(a[q], n[q])
                }
                a.forEach(function(n) {
                    Lb[n] = b
                });
                var e = Array(b.length),
                    f = [],
                    k = 0;
                b.forEach(function(n, q) {
                    Sa.hasOwnProperty(n) ? e[q] = Sa[n] : (f.push(n), bb.hasOwnProperty(n) || (bb[n] = []), bb[n].push(function() {
                        e[q] = Sa[n];
                        ++k;
                        k === f.length && d(e)
                    }))
                });
                0 === f.length && d(e)
            },
            Mb = function(a) {
                throw new Gc(a);
            },
            lb = function(a) {
                return this.fromWireType(R[a >> 2])
            },
            kb = function(a) {
                for (; a.length;) {
                    var b = a.pop(),
                        c = a.pop();
                    c(b)
                }
            },
            Zk = function(a, b, c) {
                a = da(a);
                b = Za(b, "wrapper");
                c = Qa(c);
                var d = [].slice,
                    e = b.registeredClass,
                    f = e.instancePrototype;
                b = e.baseClass;
                var k = b.instancePrototype,
                    n = e.baseClass.constructor;
                a = Jb(a, function() {
                    e.baseClass.pureVirtualFunctions.forEach(function(r) {
                        if (this[r] === k[r]) throw new Hc("Pure virtual function " + r + " must be implemented in JavaScript");
                    }.bind(this));
                    Object.defineProperty(this, "__parent", {
                        value: f
                    });
                    this.__construct.apply(this, d.call(arguments))
                });
                f.__construct = function() {
                    this === f && J("Pass correct 'this' to __construct");
                    var r = n.implement.apply(void 0, [this].concat(d.call(arguments))),
                        t = r.$$;
                    r.notifyOnDestruction();
                    t.preservePointerOnDelete = !0;
                    Object.defineProperties(this, {
                        $$: {
                            value: t
                        }
                    });
                    r = t.ptr;
                    r = bc(e, r);
                    Ga.hasOwnProperty(r) ? J("Tried to register registered instance: " + r) : Ga[r] = this
                };
                f.__destruct = function() {
                    this === f && J("Pass correct 'this' to __destruct");
                    var r = this.$$.ptr;
                    r = bc(e, r);
                    Ga.hasOwnProperty(r) ? delete Ga[r] : J("Tried to unregister unregistered instance: " + r)
                };
                a.prototype = Object.create(f);
                for (var q in c) a.prototype[q] = c[q];
                return ua(a)
            },
            Za = function(a, b) {
                var c = Sa[a];
                void 0 === c && J(b + " has unknown type " + Ec(a));
                return c
            },
            Ec = function(a) {
                a = $k(a);
                var b = da(a);
                qa(a);
                return b
            },
            Qa = function(a) {
                a || J("Cannot use deleted val. handle = " + a);
                return ma[a].value
            },
            bc = function(a, b) {
                for (void 0 === b && J("ptr should not be undefined"); a.baseClass;) b = a.upcast(b), a = a.baseClass;
                return b
            },
            J = function(a) {
                throw new ab(a);
            },
            al = function(a) {
                nb = a;
                mb.length && nb && nb(dc)
            },
            dc = function() {
                for (; mb.length;) {
                    var a = mb.pop();
                    a.$$.deleteScheduled = !1;
                    a["delete"]()
                }
            },
            bl = function() {
                var a = [],
                    b;
                for (b in Ga) Ga.hasOwnProperty(b) && a.push(Ga[b]);
                return a
            },
            cl = function() {
                return Object.keys(Ga).length
            },
            da = function(a) {
                for (var b = ""; G[a];) b += Ic[G[a++]];
                return b
            },
            dl = function() {
                for (var a = Array(256), b = 0; 256 > b; ++b) a[b] = String.fromCharCode(b);
                Ic = a
            },
            Ob = function(a, b) {
                var c = Jb(b, function(d) {
                    this.name = b;
                    this.message =
                        d;
                    d = Error(d).stack;
                    void 0 !== d && (this.stack = this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""))
                });
                c.prototype = Object.create(a.prototype);
                c.prototype.constructor = c;
                c.prototype.toString = function() {
                    return void 0 === this.message ? this.name : this.name + ": " + this.message
                };
                return c
            },
            ua = function(a) {
                switch (a) {
                    case void 0:
                        return 1;
                    case null:
                        return 2;
                    case !0:
                        return 3;
                    case !1:
                        return 4;
                    default:
                        var b = $b.length ? $b.pop() : ma.length;
                        ma[b] = {
                            refcount: 1,
                            value: a
                        };
                        return b
                }
            },
            el = function() {
                for (var a = 5; a < ma.length; ++a)
                    if (void 0 !==
                        ma[a]) return ma[a];
                return null
            },
            fl = function() {
                for (var a = 0, b = 5; b < ma.length; ++b) void 0 !== ma[b] && ++a;
                return a
            },
            Jb = function(a, b) {
                a = Ac(a);
                return function() {
                    return b.apply(this, arguments)
                }
            },
            Ac = function(a) {
                if (void 0 === a) return "_unknown";
                a = a.replace(/[^a-zA-Z0-9_]/g, "$");
                var b = a.charCodeAt(0);
                return 48 <= b && 57 >= b ? "_" + a : a
            },
            gl = function() {},
            hl = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.get(),
                        d = B.get(),
                        e = B.mappings[c];
                    if (!e) return 0;
                    if (d === e.len) {
                        var f = g.getStream(e.fd);
                        B.doMsync(c, f, d, e.flags);
                        B.mappings[c] = null;
                        e.allocated && qa(e.malloc)
                    }
                    return 0
                } catch (k) {
                    return "undefined" !== typeof g && k instanceof g.ErrnoError || K(k), -k.errno
                }
            },
            il = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.getStreamFromFD();
                    g.close(c);
                    return 0
                } catch (d) {
                    return "undefined" !== typeof g && d instanceof g.ErrnoError || K(d), -d.errno
                }
            },
            jl = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.getStreamFromFD(),
                        d = B.get();
                    switch (d) {
                        case 21509:
                        case 21505:
                            return c.tty ? 0 : -Z.ENOTTY;
                        case 21510:
                        case 21511:
                        case 21512:
                        case 21506:
                        case 21507:
                        case 21508:
                            return c.tty ? 0 : -Z.ENOTTY;
                        case 21519:
                            if (!c.tty) return -Z.ENOTTY;
                            var e = B.get();
                            return p[e >> 2] = 0;
                        case 21520:
                            return c.tty ? -Z.EINVAL : -Z.ENOTTY;
                        case 21531:
                            return e = B.get(), g.ioctl(c, d, e);
                        case 21523:
                            return c.tty ? 0 : -Z.ENOTTY;
                        case 21524:
                            return c.tty ? 0 : -Z.ENOTTY;
                        default:
                            K("bad ioctl syscall " + d)
                    }
                } catch (f) {
                    return "undefined" !== typeof g && f instanceof g.ErrnoError || K(f), -f.errno
                }
            },
            kl = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.getStr(),
                        d = B.get(),
                        e = B.get(),
                        f = g.open(c, d, e);
                    return f.fd
                } catch (k) {
                    return "undefined" !== typeof g && k instanceof g.ErrnoError || K(k), -k.errno
                }
            },
            ll = function(a,
                b) {
                B.varargs = b;
                try {
                    var c = B.getStreamFromFD(),
                        d = B.get(),
                        e = B.get();
                    return g.write(c, X, d, e)
                } catch (f) {
                    return "undefined" !== typeof g && f instanceof g.ErrnoError || K(f), -f.errno
                }
            },
            ml = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.getStreamFromFD(),
                        d = B.get(),
                        e = B.get();
                    return g.read(c, X, d, e)
                } catch (f) {
                    return "undefined" !== typeof g && f instanceof g.ErrnoError || K(f), -f.errno
                }
            },
            nl = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.getStreamFromFD(),
                        d = B.get();
                    switch (d) {
                        case 0:
                            var e = B.get();
                            if (0 > e) return -Z.EINVAL;
                            var f = g.open(c.path, c.flags,
                                0, e);
                            return f.fd;
                        case 1:
                        case 2:
                            return 0;
                        case 3:
                            return c.flags;
                        case 4:
                            return e = B.get(), c.flags |= e, 0;
                        case 12:
                            return e = B.get(), La[e + 0 >> 1] = 2, 0;
                        case 13:
                        case 14:
                            return 0;
                        case 16:
                        case 8:
                            return -Z.EINVAL;
                        case 9:
                            return Ka(Z.EINVAL), -1;
                        default:
                            return -Z.EINVAL
                    }
                } catch (k) {
                    return "undefined" !== typeof g && k instanceof g.ErrnoError || K(k), -k.errno
                }
            },
            ql = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.get(),
                        d = B.get(),
                        e = B.get(),
                        f = B.get(),
                        k = B.get(),
                        n = B.get();
                    n <<= 12;
                    a = !1;
                    if (-1 === k) {
                        var q = ol(16384, d);
                        if (!q) return -Z.ENOMEM;
                        pl(q, 0, d);
                        a = !0
                    } else {
                        var r = g.getStream(k);
                        if (!r) return -Z.EBADF;
                        var t = g.mmap(r, G, c, d, n, e, f);
                        q = t.ptr;
                        a = t.allocated
                    }
                    B.mappings[q] = {
                        malloc: q,
                        len: d,
                        allocated: a,
                        fd: k,
                        flags: f
                    };
                    return q
                } catch (w) {
                    return "undefined" !== typeof g && w instanceof g.ErrnoError || K(w), -w.errno
                }
            },
            rl = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.getStreamFromFD(),
                        d = B.get(),
                        e = B.get();
                    return B.doWritev(c, d, e)
                } catch (f) {
                    return "undefined" !== typeof g && f instanceof g.ErrnoError || K(f), -f.errno
                }
            },
            sl = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.getStreamFromFD(),
                        d = B.get(),
                        e = B.get();
                    return B.doReadv(c, d, e)
                } catch (f) {
                    return "undefined" !== typeof g && f instanceof g.ErrnoError || K(f), -f.errno
                }
            },
            tl = function(a, b) {
                B.varargs = b;
                try {
                    var c = B.getStreamFromFD(),
                        d = B.get(),
                        e = B.get(),
                        f = B.get(),
                        k = B.get();
                    if (!(-1 == d && 0 > e || 0 == d && 0 <= e)) return -Z.EOVERFLOW;
                    a = e;
                    g.llseek(c, a, k);
                    tempI64 = [c.position >>> 0, (tempDouble = c.position, 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)];
                    p[f >> 2] = tempI64[0];
                    p[f + 4 >> 2] = tempI64[1];
                    c.getdents && 0 === a && 0 === k && (c.getdents = null);
                    return 0
                } catch (n) {
                    return "undefined" !== typeof g && n instanceof g.ErrnoError || K(n), -n.errno
                }
            },
            ul = function() {
                Ka(1);
                return -1
            },
            Ka = function(a) {
                h.___errno_location && (p[h.___errno_location() >> 2] = a);
                return a
            },
            vl = function() {},
            wl = function() {
                return !!ob.uncaught_exception
            },
            xl = function(a, b, c) {
                S.infos[a] = {
                    ptr: a,
                    adjusted: [a],
                    type: b,
                    destructor: c,
                    refcount: 0,
                    caught: !1,
                    rethrown: !1
                };
                S.last = a;
                "uncaught_exception" in ob ? ob.uncaught_exception++ : ob.uncaught_exception = 1;
                throw a;
            },
            db = function() {
                var a = S.last;
                if (!a) return cb = 0;
                var b = S.infos[a],
                    c = b.type;
                if (!c) return cb = 0, a | 0;
                var d = Array.prototype.slice.call(arguments);
                h.___cxa_is_pointer_type(c);
                db.buffer || (db.buffer = ta(4));
                p[db.buffer >> 2] = a;
                a = db.buffer;
                for (var e = 0; e < d.length; e++)
                    if (d[e] && h.___cxa_can_catch(d[e], c, a)) return a = p[a >> 2], b.adjusted.push(a), cb = d[e], a | 0;
                a = p[a >> 2];
                cb = c;
                return a | 0
            },
            yl = function(a) {
                S.last || (S.last = a);
                throw a;
            },
            zl = function() {
                var a = S.caught.pop();
                a = S.deAdjust(a);
                S.infos[a].rethrown || (S.caught.push(a), S.infos[a].rethrown = !0);
                S.last = a;
                throw a;
            },
            Al = function() {
                xa = !0;
                throw "Pure virtual function called!";
            },
            Bl = function() {
                return db.apply(null, arguments)
            },
            Cl = function() {
                return db.apply(null, arguments)
            },
            Dl = function() {
                Q(0);
                var a = S.caught.pop();
                a && (S.decRef(S.deAdjust(a)), S.last = 0)
            },
            El = function(a) {
                var b = S.infos[a];
                b && !b.caught && (b.caught = !0, ob.uncaught_exception--);
                b && (b.rethrown = !1);
                S.caught.push(a);
                S.addRef(S.deAdjust(a));
                return a
            },
            Jc = function(a) {
                try {
                    return qa(a)
                } catch (b) {}
            },
            Fl = function(a) {
                return ta(a)
            },
            ec = function(a) {
                if (ec.called) {
                    var b =
                        p[a >> 2];
                    var c = p[b >> 2]
                } else ec.called = !0, oa.USER = oa.LOGNAME = "web_user", oa.PATH = "/", oa.PWD = "/", oa.HOME = "/home/web_user", oa.LANG = "C.UTF-8", oa._ = h.thisProgram, c = ub ? ta(1024) : fc(1024), b = ub ? ta(256) : fc(256), p[b >> 2] = c, p[a >> 2] = b;
                a = [];
                var d = 0,
                    e;
                for (e in oa)
                    if ("string" === typeof oa[e]) {
                        var f = e + "=" + oa[e];
                        a.push(f);
                        d += f.length
                    }
                if (1024 < d) throw Error("Environment size exceeded TOTAL_ENV_SIZE!");
                for (e = 0; e < a.length; e++) {
                    d = f = a[e];
                    for (var k = c, n = 0; n < d.length; ++n) X[k++ >> 0] = d.charCodeAt(n);
                    X[k >> 0] = 0;
                    p[b + 4 * e >> 2] = c;
                    c += f.length +
                        1
                }
                p[b + 4 * a.length >> 2] = 0
            },
            Gl = function(a, b, c, d) {
                var e = p[a >> 2],
                    f = p[a + 4 >> 2],
                    k = p[b >> 2],
                    n = p[b + 4 >> 2];
                if (e === k && f === n) return p[a >> 2] = c, p[a + 4 >> 2] = d, 1;
                p[b >> 2] = e;
                p[b + 4 >> 2] = f;
                return 0
            },
            Hl = function(a, b, c) {
                return Kc[a](b, c)
            },
            Il = function(a) {
                return Kc[a]()
            },
            Ll = function(a) {
                function b(f) {
                    f = f.exports;
                    h.asm = f;
                    Pb("wasm-instantiate")
                }

                function c(f) {
                    b(f.instance)
                }

                function d(f) {
                    Jl().then(function(k) {
                        return WebAssembly.instantiate(k, e)
                    }).then(f, function(k) {
                        ca("failed to asynchronously prepare wasm: " + k);
                        K(k)
                    })
                }
                var e = {
                    env: a,
                    global: {
                        NaN: NaN,
                        Infinity: Infinity
                    },
                    "global.Math": Math,
                    asm2wasm: Kl
                };
                gc("wasm-instantiate");
                if (h.instantiateWasm) try {
                    return h.instantiateWasm(e, b)
                } catch (f) {
                    return ca("Module.instantiateWasm callback failed with error: " + f), !1
                }
                h.wasmBinary || "function" !== typeof WebAssembly.instantiateStreaming || Lc(Na) || "function" !== typeof fetch ? d(c) : WebAssembly.instantiateStreaming(fetch(Na, {
                    credentials: "same-origin"
                }), e).then(c, function(f) {
                    ca("wasm streaming compile failed: " + f);
                    ca("falling back to ArrayBuffer instantiation");
                    d(c)
                });
                return {}
            },
            Jl = function() {
                return h.wasmBinary || !Va && !sa || "function" !== typeof fetch ? new Promise(function(a) {
                    a(Mc())
                }) : fetch(Na, {
                    credentials: "same-origin"
                }).then(function(a) {
                    if (!a.ok) throw "failed to load wasm binary file at '" + Na + "'";
                    return a.arrayBuffer()
                })["catch"](function() {
                    return Mc()
                })
            },
            Mc = function() {
                try {
                    if (h.wasmBinary) return new Uint8Array(h.wasmBinary);
                    if (h.readBinary) return h.readBinary(Na);
                    throw "both async and sync fetching of the wasm failed";
                } catch (a) {
                    K(a)
                }
            },
            Lc = function(a) {
                return String.prototype.startsWith ?
                    a.startsWith("data:application/octet-stream;base64,") : 0 === a.indexOf("data:application/octet-stream;base64,")
            },
            Pb = function() {
                Pa--;
                h.monitorRunDependencies && h.monitorRunDependencies(Pa);
                if (0 == Pa && (null !== hc && (clearInterval(hc), hc = null), pb)) {
                    var a = pb;
                    pb = null;
                    a()
                }
            },
            gc = function() {
                Pa++;
                h.monitorRunDependencies && h.monitorRunDependencies(Pa)
            },
            vb = function(a) {
                for (; 0 < a.length;) {
                    var b = a.shift();
                    if ("function" == typeof b) b();
                    else {
                        var c = b.func;
                        "number" === typeof c ? void 0 === b.arg ? h.dynCall_v(c) : h.dynCall_vi(c, b.arg) :
                            c(void 0 === b.arg ? null : b.arg)
                    }
                }
            },
            Ml = function(a) {
                var b = /__Z[\w\d_]+/g;
                return a.replace(b, function(c) {
                    var d = c;
                    return c === d ? c : d + " [" + c + "]"
                })
            },
            Ta = function(a) {
                for (var b = 0, c = 0; c < a.length; ++c) {
                    var d = a.charCodeAt(c);
                    55296 <= d && 57343 >= d && (d = 65536 + ((d & 1023) << 10) | a.charCodeAt(++c) & 1023);
                    127 >= d ? ++b : b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4
                }
                return b
            },
            la = function(a, b, c, d) {
                if (!(0 < d)) return 0;
                var e = c;
                d = c + d - 1;
                for (var f = 0; f < a.length; ++f) {
                    var k = a.charCodeAt(f);
                    if (55296 <= k && 57343 >= k) {
                        var n = a.charCodeAt(++f);
                        k = 65536 + ((k & 1023) << 10) |
                            n & 1023
                    }
                    if (127 >= k) {
                        if (c >= d) break;
                        b[c++] = k
                    } else {
                        if (2047 >= k) {
                            if (c + 1 >= d) break;
                            b[c++] = 192 | k >> 6
                        } else {
                            if (65535 >= k) {
                                if (c + 2 >= d) break;
                                b[c++] = 224 | k >> 12
                            } else {
                                if (c + 3 >= d) break;
                                b[c++] = 240 | k >> 18;
                                b[c++] = 128 | k >> 12 & 63
                            }
                            b[c++] = 128 | k >> 6 & 63
                        }
                        b[c++] = 128 | k & 63
                    }
                }
                b[c] = 0;
                return c - e
            },
            ea = function(a, b) {
                return a ? eb(G, a, b) : ""
            },
            eb = function(a, b, c) {
                var d = b + c;
                for (c = b; a[c] && !(c >= d);) ++c;
                if (16 < c - b && a.subarray && Nc) return Nc.decode(a.subarray(b, c));
                for (d = ""; b < c;) {
                    var e = a[b++];
                    if (e & 128) {
                        var f = a[b++] & 63;
                        if (192 == (e & 224)) d += String.fromCharCode((e &
                            31) << 6 | f);
                        else {
                            var k = a[b++] & 63;
                            e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;
                            65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023))
                        }
                    } else d += String.fromCharCode(e)
                }
                return d
            },
            rc = function(a, b, c, d) {
                if ("number" === typeof a) {
                    var e = !0;
                    var f = a
                } else e = !1, f = a.length;
                var k = "string" === typeof b ? b : null;
                c = 3 == c ? d : [ta, Nl, fc][c](Math.max(f, k ? 1 : b.length));
                if (e) {
                    d = c;
                    ja(0 == (c & 3));
                    for (a = c + (f & -4); d < a; d += 4) p[d >> 2] = 0;
                    for (a = c + f; d < a;) X[d++ >> 0] = 0;
                    return c
                }
                if ("i8" === k) return a.subarray ||
                    a.slice ? G.set(a, c) : G.set(new Uint8Array(a), c), c;
                d = 0;
                for (var n, q; d < f;) {
                    var r = a[d];
                    e = k || b[d];
                    if (0 === e) d++;
                    else {
                        "i64" == e && (e = "i32");
                        var t = c + d,
                            w = e;
                        w = w || "i8";
                        "*" === w.charAt(w.length - 1) && (w = "i32");
                        switch (w) {
                            case "i1":
                                X[t >> 0] = r;
                                break;
                            case "i8":
                                X[t >> 0] = r;
                                break;
                            case "i16":
                                La[t >> 1] = r;
                                break;
                            case "i32":
                                p[t >> 2] = r;
                                break;
                            case "i64":
                                tempI64 = [r >>> 0, (tempDouble = r, 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)];
                                p[t >> 2] = tempI64[0];
                                p[t + 4 >> 2] = tempI64[1];
                                break;
                            case "float":
                                y[t >> 2] = r;
                                break;
                            case "double":
                                Zb[t >> 3] = r;
                                break;
                            default:
                                K("invalid type for setValue: " + w)
                        }
                        q !== e && (n = Ol(e), q = e);
                        d += n
                    }
                }
                return c
            },
            ja = function(a, b) {
                a || K("Assertion failed: " + b)
            },
            ic = function(a, b, c) {
                return c && c.length ? h["dynCall_" + a].apply(null, [b].concat(c)) : h["dynCall_" + a].call(null, b)
            },
            Bj = function(a, b) {
                if (a) {
                    ja(b);
                    jc[b] || (jc[b] = {});
                    var c = jc[b];
                    c[a] || (c[a] = 1 === b.length ? function() {
                        return ic(b, a)
                    } : 2 === b.length ? function(d) {
                        return ic(b, a, [d])
                    } : function() {
                        return ic(b,
                            a, Array.prototype.slice.call(arguments))
                    });
                    return c[a]
                }
            },
            qb = function(a) {
                qb.shown || (qb.shown = {});
                qb.shown[a] || (qb.shown[a] = 1, ca(a))
            },
            Ol = function(a) {
                switch (a) {
                    case "i1":
                    case "i8":
                        return 1;
                    case "i16":
                        return 2;
                    case "i32":
                        return 4;
                    case "i64":
                        return 8;
                    case "float":
                        return 4;
                    case "double":
                        return 8;
                    default:
                        if ("*" === a[a.length - 1]) return 4;
                        if ("i" === a[0]) {
                            var b = parseInt(a.substr(1));
                            ja(0 === b % 8, "getNativeTypeSize invalid bits " + b + ", type " + a);
                            return b / 8
                        }
                        return 0
                }
            },
            fc = function(a) {
                var b = p[ia >> 2];
                a = b + a + 15 & -16;
                if (a <=
                    vc()) p[ia >> 2] = a;
                else return 0;
                return b
            },
            Pl = function(a) {
                return h.locateFile ? h.locateFile(a, Ha) : Ha + a
            };
        M || (A.wasmLoadingError = void 0, A.wasmLoadingDone = !1, h.postRun = h.postRun || [], h.postRun.push(function() {
            return A.wasmLoadingDone = !0
        }));
        h.locateFile = function(a) {
            a = a.replace("_pdf", "");
            return "string" === typeof STATIC_JS_PREFIX ? STATIC_JS_PREFIX + (STATIC_JS_PREFIX.match(/\/$/) ? "" : "/") + a : a
        };
        h = "undefined" !== typeof h ? h : {};
        var rb = {},
            Oa;
        for (Oa in h) h.hasOwnProperty(Oa) && (rb[Oa] = h[Oa]);
        h.arguments = [];
        h.thisProgram =
            "./this.program";
        h.quit = function(a, b) {
            throw b;
        };
        h.preRun = [];
        h.postRun = [];
        var Va = !1,
            sa = !1,
            Ea = !1,
            Oc = !1;
        Va = "object" === typeof window;
        sa = "function" === typeof importScripts;
        Ea = "object" === typeof process && "function" === typeof require && !Va && !sa;
        Oc = !Va && !Ea && !sa;
        var Ha = "";
        if (Ea) {
            Ha = __dirname + "/";
            var kc, lc;
            h.read = function(a, b) {
                kc || (kc = require("fs"));
                lc || (lc = require("path"));
                a = lc.normalize(a);
                a = kc.readFileSync(a);
                return b ? a : a.toString()
            };
            h.readBinary = function(a) {
                a = h.read(a, !0);
                a.buffer || (a = new Uint8Array(a));
                ja(a.buffer);
                return a
            };
            1 < process.argv.length && (h.thisProgram = process.argv[1].replace(/\\/g, "/"));
            h.arguments = process.argv.slice(2);
            "undefined" !== typeof module && (module.exports = h);
            process.on("uncaughtException", function(a) {
                if (!(a instanceof wa)) throw a;
            });
            process.on("unhandledRejection", K);
            h.quit = function(a) {
                process.exit(a)
            };
            h.inspect = function() {
                return "[Emscripten Module object]"
            }
        } else if (Oc) "undefined" != typeof read && (h.read = function(a) {
            return read(a)
        }), h.readBinary = function(a) {
            if ("function" === typeof readbuffer) return new Uint8Array(readbuffer(a));
            a = read(a, "binary");
            ja("object" === typeof a);
            return a
        }, "undefined" != typeof scriptArgs ? h.arguments = scriptArgs : "undefined" != typeof arguments && (h.arguments = arguments), "function" === typeof quit && (h.quit = function(a) {
            quit(a)
        });
        else if (Va || sa) sa ? Ha = self.location.href : document.currentScript && (Ha = document.currentScript.src), Ha = 0 !== Ha.indexOf("blob:") ? Ha.substr(0, Ha.lastIndexOf("/") + 1) : "", h.read = function(a) {
            var b = new XMLHttpRequest;
            b.open("GET", a, !1);
            b.send(null);
            return b.responseText
        }, sa && (h.readBinary = function(a) {
            var b =
                new XMLHttpRequest;
            b.open("GET", a, !1);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response)
        }), h.readAsync = function(a, b, c) {
            var d = new XMLHttpRequest;
            d.open("GET", a, !0);
            d.responseType = "arraybuffer";
            d.onload = function() {
                200 == d.status || 0 == d.status && d.response ? b(d.response) : c()
            };
            d.onerror = c;
            d.send(null)
        }, h.setWindowTitle = function(a) {
            document.title = a
        };
        var tb = h.print || ("undefined" !== typeof console ? console.log.bind(console) : "undefined" !== typeof print ? print : null),
            ca = h.printErr || ("undefined" !==
                typeof printErr ? printErr : "undefined" !== typeof console && console.warn.bind(console) || tb);
        for (Oa in rb) rb.hasOwnProperty(Oa) && (h[Oa] = rb[Oa]);
        rb = void 0;
        var Kl = {
                "f64-rem": function(a, b) {
                    return a % b
                },
                "debugger": function() {
                    debugger
                }
            },
            jc = {},
            cb = 0,
            Ql = function(a) {
                cb = a
            },
            Rl = function() {
                return cb
            };
        "object" !== typeof WebAssembly && ca("no native wasm support detected");
        var xa = !1,
            Nc = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
        "undefined" !== typeof TextDecoder && new TextDecoder("utf-16le");
        var X, G, La,
            Wa, p, R, y, Zb;
        Y = 5601616;
        ia = 358704;
        var sb = h.TOTAL_MEMORY || 134217728;
        5242880 > sb && ca("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + sb + "! (TOTAL_STACK=5242880)");
        h.buffer ? P = h.buffer : "object" === typeof WebAssembly && "function" === typeof WebAssembly.Memory ? (Ia = new WebAssembly.Memory({
            initial: sb / 65536,
            maximum: sb / 65536
        }), P = Ia.buffer) : P = new ArrayBuffer(sb);
        h.HEAP8 = X = new Int8Array(P);
        h.HEAP16 = La = new Int16Array(P);
        h.HEAP32 = p = new Int32Array(P);
        h.HEAPU8 = G = new Uint8Array(P);
        h.HEAPU16 = Wa = new Uint16Array(P);
        h.HEAPU32 = R = new Uint32Array(P);
        h.HEAPF32 = y = new Float32Array(P);
        h.HEAPF64 = Zb = new Float64Array(P);
        p[ia >> 2] = Y;
        var pc = [],
            nc = [],
            Rc = [],
            oc = [],
            ub = !1,
            za = Math.abs,
            Ca = Math.ceil,
            Ba = Math.floor,
            Aa = Math.min,
            Sl = Math.trunc,
            Pa = 0,
            hc = null,
            pb = null;
        h.preloadedImages = {};
        h.preloadedAudios = {};
        var Na = "ink.wasm";
        Lc(Na) || (Na = Pl(Na));
        h.asm = function(a, b) {
            b.memory = Ia;
            b.table = new WebAssembly.Table({
                initial: 10755,
                maximum: 10755,
                element: "anyfunc"
            });
            b.__memory_base = 1024;
            b.__table_base = 0;
            return a = Ll(b)
        };
        var Kc = [function() {
                return !!h.ctx
            },
            function() {
                debugger
            },
            function(a, b) {
                console.warn(ea(a) + " " + ea(b) + "\n")
            },
            function(a, b) {
                console.error(ea(a) + " " + ea(b) + "\n")
            },
            function(a, b) {
                console.info(ea(a) + " " + ea(b) + "\n")
            }
        ];
        nc.push({
            func: function() {
                Tl()
            }
        });
        var oa = {},
            S = {
                last: 0,
                caught: [],
                infos: {},
                deAdjust: function(a) {
                    if (!a || S.infos[a]) return a;
                    for (var b in S.infos)
                        for (var c = +b, d = S.infos[c].adjusted, e = d.length, f = 0; f < e; f++)
                            if (d[f] === a) return c;
                    return a
                },
                addRef: function(a) {
                    a && (a = S.infos[a], a.refcount++)
                },
                decRef: function(a) {
                    if (a) {
                        var b = S.infos[a];
                        ja(0 <
                            b.refcount);
                        b.refcount--;
                        0 !== b.refcount || b.rethrown || (b.destructor && h.dynCall_vi(b.destructor, a), delete S.infos[a], Jc(a))
                    }
                },
                clearRef: function(a) {
                    a && (a = S.infos[a], a.refcount = 0)
                }
            },
            F = {
                splitPath: function(a) {
                    var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                    return b.exec(a).slice(1)
                },
                normalizeArray: function(a, b) {
                    for (var c = 0, d = a.length - 1; 0 <= d; d--) {
                        var e = a[d];
                        "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--)
                    }
                    if (b)
                        for (; c; c--) a.unshift("..");
                    return a
                },
                normalize: function(a) {
                    var b =
                        "/" === a.charAt(0),
                        c = "/" === a.substr(-1);
                    (a = F.normalizeArray(a.split("/").filter(function(d) {
                        return !!d
                    }), !b).join("/")) || b || (a = ".");
                    a && c && (a += "/");
                    return (b ? "/" : "") + a
                },
                dirname: function(a) {
                    var b = F.splitPath(a);
                    a = b[0];
                    b = b[1];
                    if (!a && !b) return ".";
                    b && (b = b.substr(0, b.length - 1));
                    return a + b
                },
                basename: function(a) {
                    if ("/" === a) return "/";
                    var b = a.lastIndexOf("/");
                    return -1 === b ? a : a.substr(b + 1)
                },
                extname: function(a) {
                    return F.splitPath(a)[3]
                },
                join: function() {
                    var a = Array.prototype.slice.call(arguments, 0);
                    return F.normalize(a.join("/"))
                },
                join2: function(a, b) {
                    return F.normalize(a + "/" + b)
                },
                resolve: function() {
                    for (var a = "", b = !1, c = arguments.length - 1; - 1 <= c && !b; c--) {
                        b = 0 <= c ? arguments[c] : g.cwd();
                        if ("string" !== typeof b) throw new TypeError("Arguments to path.resolve must be strings");
                        if (!b) return "";
                        a = b + "/" + a;
                        b = "/" === b.charAt(0)
                    }
                    a = F.normalizeArray(a.split("/").filter(function(d) {
                        return !!d
                    }), !b).join("/");
                    return (b ? "/" : "") + a || "."
                },
                relative: function(a, b) {
                    function c(k) {
                        for (var n = 0; n < k.length && "" === k[n]; n++);
                        for (var q = k.length - 1; 0 <= q && "" === k[q]; q--);
                        return n > q ? [] : k.slice(n, q - n + 1)
                    }
                    a = F.resolve(a).substr(1);
                    b = F.resolve(b).substr(1);
                    a = c(a.split("/"));
                    b = c(b.split("/"));
                    for (var d = Math.min(a.length, b.length), e = d, f = 0; f < d; f++)
                        if (a[f] !== b[f]) {
                            e = f;
                            break
                        }
                    d = [];
                    for (f = e; f < a.length; f++) d.push("..");
                    d = d.concat(b.slice(e));
                    return d.join("/")
                }
            },
            Ja = {
                ttys: [],
                init: function() {},
                shutdown: function() {},
                register: function(a, b) {
                    Ja.ttys[a] = {
                        input: [],
                        output: [],
                        ops: b
                    };
                    g.registerDevice(a, Ja.stream_ops)
                },
                stream_ops: {
                    open: function(a) {
                        var b = Ja.ttys[a.node.rdev];
                        if (!b) throw new g.ErrnoError(19);
                        a.tty = b;
                        a.seekable = !1
                    },
                    close: function(a) {
                        a.tty.ops.flush(a.tty)
                    },
                    flush: function(a) {
                        a.tty.ops.flush(a.tty)
                    },
                    read: function(a, b, c, d) {
                        if (!a.tty || !a.tty.ops.get_char) throw new g.ErrnoError(6);
                        for (var e = 0, f = 0; f < d; f++) {
                            try {
                                var k = a.tty.ops.get_char(a.tty)
                            } catch (n) {
                                throw new g.ErrnoError(5);
                            }
                            if (void 0 === k && 0 === e) throw new g.ErrnoError(11);
                            if (null === k || void 0 === k) break;
                            e++;
                            b[c + f] = k
                        }
                        e && (a.node.timestamp = Date.now());
                        return e
                    },
                    write: function(a, b, c, d) {
                        if (!a.tty || !a.tty.ops.put_char) throw new g.ErrnoError(6);
                        try {
                            for (var e =
                                    0; e < d; e++) a.tty.ops.put_char(a.tty, b[c + e])
                        } catch (f) {
                            throw new g.ErrnoError(5);
                        }
                        d && (a.node.timestamp = Date.now());
                        return e
                    }
                },
                default_tty_ops: {
                    get_char: function(a) {
                        if (!a.input.length) {
                            var b = null;
                            if (Ea) {
                                b = new Buffer(256);
                                var c = 0,
                                    d = "win32" != process.platform,
                                    e = process.stdin.fd;
                                if (d) {
                                    var f = !1;
                                    try {
                                        e = ba.openSync("/dev/stdin", "r"), f = !0
                                    } catch (k) {}
                                }
                                try {
                                    c = ba.readSync(e, b, 0, 256, null)
                                } catch (k) {
                                    if (-1 != k.toString().indexOf("EOF")) c = 0;
                                    else throw k;
                                }
                                f && ba.closeSync(e);
                                b = 0 < c ? b.slice(0, c).toString("utf-8") : null
                            } else "undefined" !=
                                typeof window && "function" == typeof window.prompt ? (b = window.prompt("Input: "), null !== b && (b += "\n")) : "function" == typeof readline && (b = readline(), null !== b && (b += "\n"));
                            if (!b) return null;
                            a.input = Ua(b, !0)
                        }
                        return a.input.shift()
                    },
                    put_char: function(a, b) {
                        null === b || 10 === b ? (tb(eb(a.output, 0)), a.output = []) : 0 != b && a.output.push(b)
                    },
                    flush: function(a) {
                        a.output && 0 < a.output.length && (tb(eb(a.output, 0)), a.output = [])
                    }
                },
                default_tty1_ops: {
                    put_char: function(a, b) {
                        null === b || 10 === b ? (ca(eb(a.output, 0)), a.output = []) : 0 != b && a.output.push(b)
                    },
                    flush: function(a) {
                        a.output && 0 < a.output.length && (ca(eb(a.output, 0)), a.output = [])
                    }
                }
            },
            H = {
                ops_table: null,
                mount: function() {
                    return H.createNode(null, "/", 16895, 0)
                },
                createNode: function(a, b, c, d) {
                    if (g.isBlkdev(c) || g.isFIFO(c)) throw new g.ErrnoError(1);
                    H.ops_table || (H.ops_table = {
                        dir: {
                            node: {
                                getattr: H.node_ops.getattr,
                                setattr: H.node_ops.setattr,
                                lookup: H.node_ops.lookup,
                                mknod: H.node_ops.mknod,
                                rename: H.node_ops.rename,
                                unlink: H.node_ops.unlink,
                                rmdir: H.node_ops.rmdir,
                                readdir: H.node_ops.readdir,
                                symlink: H.node_ops.symlink
                            },
                            stream: {
                                llseek: H.stream_ops.llseek
                            }
                        },
                        file: {
                            node: {
                                getattr: H.node_ops.getattr,
                                setattr: H.node_ops.setattr
                            },
                            stream: {
                                llseek: H.stream_ops.llseek,
                                read: H.stream_ops.read,
                                write: H.stream_ops.write,
                                allocate: H.stream_ops.allocate,
                                mmap: H.stream_ops.mmap,
                                msync: H.stream_ops.msync
                            }
                        },
                        link: {
                            node: {
                                getattr: H.node_ops.getattr,
                                setattr: H.node_ops.setattr,
                                readlink: H.node_ops.readlink
                            },
                            stream: {}
                        },
                        chrdev: {
                            node: {
                                getattr: H.node_ops.getattr,
                                setattr: H.node_ops.setattr
                            },
                            stream: g.chrdev_stream_ops
                        }
                    });
                    c = g.createNode(a, b, c, d);
                    g.isDir(c.mode) ?
                        (c.node_ops = H.ops_table.dir.node, c.stream_ops = H.ops_table.dir.stream, c.contents = {}) : g.isFile(c.mode) ? (c.node_ops = H.ops_table.file.node, c.stream_ops = H.ops_table.file.stream, c.usedBytes = 0, c.contents = null) : g.isLink(c.mode) ? (c.node_ops = H.ops_table.link.node, c.stream_ops = H.ops_table.link.stream) : g.isChrdev(c.mode) && (c.node_ops = H.ops_table.chrdev.node, c.stream_ops = H.ops_table.chrdev.stream);
                    c.timestamp = Date.now();
                    a && (a.contents[b] = c);
                    return c
                },
                getFileDataAsRegularArray: function(a) {
                    if (a.contents && a.contents.subarray) {
                        for (var b =
                                [], c = 0; c < a.usedBytes; ++c) b.push(a.contents[c]);
                        return b
                    }
                    return a.contents
                },
                getFileDataAsTypedArray: function(a) {
                    return a.contents ? a.contents.subarray ? a.contents.subarray(0, a.usedBytes) : new Uint8Array(a.contents) : new Uint8Array
                },
                expandFileStorage: function(a, b) {
                    var c = a.contents ? a.contents.length : 0;
                    c >= b || (b = Math.max(b, c * (1048576 > c ? 2 : 1.125) | 0), 0 != c && (b = Math.max(b, 256)), c = a.contents, a.contents = new Uint8Array(b), 0 < a.usedBytes && a.contents.set(c.subarray(0, a.usedBytes), 0))
                },
                resizeFileStorage: function(a, b) {
                    if (a.usedBytes !=
                        b)
                        if (0 == b) a.contents = null, a.usedBytes = 0;
                        else {
                            if (!a.contents || a.contents.subarray) {
                                var c = a.contents;
                                a.contents = new Uint8Array(new ArrayBuffer(b));
                                c && a.contents.set(c.subarray(0, Math.min(b, a.usedBytes)))
                            } else if (a.contents || (a.contents = []), a.contents.length > b) a.contents.length = b;
                            else
                                for (; a.contents.length < b;) a.contents.push(0);
                            a.usedBytes = b
                        }
                },
                node_ops: {
                    getattr: function(a) {
                        var b = {};
                        b.dev = g.isChrdev(a.mode) ? a.id : 1;
                        b.ino = a.id;
                        b.mode = a.mode;
                        b.nlink = 1;
                        b.uid = 0;
                        b.gid = 0;
                        b.rdev = a.rdev;
                        g.isDir(a.mode) ? b.size =
                            4096 : g.isFile(a.mode) ? b.size = a.usedBytes : b.size = g.isLink(a.mode) ? a.link.length : 0;
                        b.atime = new Date(a.timestamp);
                        b.mtime = new Date(a.timestamp);
                        b.ctime = new Date(a.timestamp);
                        b.blksize = 4096;
                        b.blocks = Math.ceil(b.size / b.blksize);
                        return b
                    },
                    setattr: function(a, b) {
                        void 0 !== b.mode && (a.mode = b.mode);
                        void 0 !== b.timestamp && (a.timestamp = b.timestamp);
                        void 0 !== b.size && H.resizeFileStorage(a, b.size)
                    },
                    lookup: function() {
                        throw g.genericErrors[2];
                    },
                    mknod: function(a, b, c, d) {
                        return H.createNode(a, b, c, d)
                    },
                    rename: function(a,
                        b, c) {
                        if (g.isDir(a.mode)) {
                            try {
                                var d = g.lookupNode(b, c)
                            } catch (f) {}
                            if (d)
                                for (var e in d.contents) throw new g.ErrnoError(39);
                        }
                        delete a.parent.contents[a.name];
                        a.name = c;
                        b.contents[c] = a;
                        a.parent = b
                    },
                    unlink: function(a, b) {
                        delete a.contents[b]
                    },
                    rmdir: function(a, b) {
                        var c = g.lookupNode(a, b),
                            d;
                        for (d in c.contents) throw new g.ErrnoError(39);
                        delete a.contents[b]
                    },
                    readdir: function(a) {
                        var b = [".", ".."],
                            c;
                        for (c in a.contents) a.contents.hasOwnProperty(c) && b.push(c);
                        return b
                    },
                    symlink: function(a, b, c) {
                        a = H.createNode(a, b, 41471,
                            0);
                        a.link = c;
                        return a
                    },
                    readlink: function(a) {
                        if (!g.isLink(a.mode)) throw new g.ErrnoError(22);
                        return a.link
                    }
                },
                stream_ops: {
                    read: function(a, b, c, d, e) {
                        var f = a.node.contents;
                        if (e >= a.node.usedBytes) return 0;
                        a = Math.min(a.node.usedBytes - e, d);
                        if (8 < a && f.subarray) b.set(f.subarray(e, e + a), c);
                        else
                            for (d = 0; d < a; d++) b[c + d] = f[e + d];
                        return a
                    },
                    write: function(a, b, c, d, e, f) {
                        if (!d) return 0;
                        a = a.node;
                        a.timestamp = Date.now();
                        if (b.subarray && (!a.contents || a.contents.subarray)) {
                            if (f) return a.contents = b.subarray(c, c + d), a.usedBytes =
                                d;
                            if (0 === a.usedBytes && 0 === e) return a.contents = new Uint8Array(b.subarray(c, c + d)), a.usedBytes = d;
                            if (e + d <= a.usedBytes) return a.contents.set(b.subarray(c, c + d), e), d
                        }
                        H.expandFileStorage(a, e + d);
                        if (a.contents.subarray && b.subarray) a.contents.set(b.subarray(c, c + d), e);
                        else
                            for (f = 0; f < d; f++) a.contents[e + f] = b[c + f];
                        a.usedBytes = Math.max(a.usedBytes, e + d);
                        return d
                    },
                    llseek: function(a, b, c) {
                        1 === c ? b += a.position : 2 === c && g.isFile(a.node.mode) && (b += a.node.usedBytes);
                        if (0 > b) throw new g.ErrnoError(22);
                        return b
                    },
                    allocate: function(a,
                        b, c) {
                        H.expandFileStorage(a.node, b + c);
                        a.node.usedBytes = Math.max(a.node.usedBytes, b + c)
                    },
                    mmap: function(a, b, c, d, e, f, k) {
                        if (!g.isFile(a.node.mode)) throw new g.ErrnoError(19);
                        c = a.node.contents;
                        if (k & 2 || c.buffer !== b && c.buffer !== b.buffer) {
                            if (0 < e || e + d < a.node.usedBytes) c = c.subarray ? c.subarray(e, e + d) : Array.prototype.slice.call(c, e, e + d);
                            a = !0;
                            d = ta(d);
                            if (!d) throw new g.ErrnoError(12);
                            b.set(c, d)
                        } else a = !1, d = c.byteOffset;
                        return {
                            ptr: d,
                            allocated: a
                        }
                    },
                    msync: function(a, b, c, d, e) {
                        if (!g.isFile(a.node.mode)) throw new g.ErrnoError(19);
                        if (e & 2) return 0;
                        H.stream_ops.write(a, b, 0, d, c, !1);
                        return 0
                    }
                }
            },
            aa = {
                dbs: {},
                indexedDB: function() {
                    if ("undefined" !== typeof indexedDB) return indexedDB;
                    var a = null;
                    "object" === typeof window && (a = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB);
                    ja(a, "IDBFS used, but indexedDB not supported");
                    return a
                },
                DB_VERSION: 21,
                DB_STORE_NAME: "FILE_DATA",
                mount: function(a) {
                    return H.mount.apply(null, arguments)
                },
                syncfs: function(a, b, c) {
                    aa.getLocalSet(a, function(d, e) {
                        if (d) return c(d);
                        aa.getRemoteSet(a,
                            function(f, k) {
                                if (f) return c(f);
                                f = b ? k : e;
                                k = b ? e : k;
                                aa.reconcile(f, k, c)
                            })
                    })
                },
                getDB: function(a, b) {
                    var c = aa.dbs[a];
                    if (c) return b(null, c);
                    try {
                        var d = aa.indexedDB().open(a, aa.DB_VERSION)
                    } catch (e) {
                        return b(e)
                    }
                    if (!d) return b("Unable to connect to IndexedDB");
                    d.onupgradeneeded = function(e) {
                        var f = e.target.result;
                        e = e.target.transaction;
                        f = f.objectStoreNames.contains(aa.DB_STORE_NAME) ? e.objectStore(aa.DB_STORE_NAME) : f.createObjectStore(aa.DB_STORE_NAME);
                        f.indexNames.contains("timestamp") || f.createIndex("timestamp",
                            "timestamp", {
                                unique: !1
                            })
                    };
                    d.onsuccess = function() {
                        c = d.result;
                        aa.dbs[a] = c;
                        b(null, c)
                    };
                    d.onerror = function(e) {
                        b(this.error);
                        e.preventDefault()
                    }
                },
                getLocalSet: function(a, b) {
                    function c(n) {
                        return "." !== n && ".." !== n
                    }

                    function d(n) {
                        return function(q) {
                            return F.join2(n, q)
                        }
                    }
                    var e = {};
                    for (a = g.readdir(a.mountpoint).filter(c).map(d(a.mountpoint)); a.length;) {
                        var f = a.pop();
                        try {
                            var k = g.stat(f)
                        } catch (n) {
                            return b(n)
                        }
                        g.isDir(k.mode) && a.push.apply(a, g.readdir(f).filter(c).map(d(f)));
                        e[f] = {
                            timestamp: k.mtime
                        }
                    }
                    return b(null, {
                        type: "local",
                        entries: e
                    })
                },
                getRemoteSet: function(a, b) {
                    var c = {};
                    aa.getDB(a.mountpoint, function(d, e) {
                        if (d) return b(d);
                        try {
                            var f = e.transaction([aa.DB_STORE_NAME], "readonly");
                            f.onerror = function(q) {
                                b(this.error);
                                q.preventDefault()
                            };
                            var k = f.objectStore(aa.DB_STORE_NAME),
                                n = k.index("timestamp");
                            n.openKeyCursor().onsuccess = function(q) {
                                q = q.target.result;
                                if (!q) return b(null, {
                                    type: "remote",
                                    db: e,
                                    entries: c
                                });
                                c[q.primaryKey] = {
                                    timestamp: q.key
                                };
                                q["continue"]()
                            }
                        } catch (q) {
                            return b(q)
                        }
                    })
                },
                loadLocalEntry: function(a, b) {
                    try {
                        var c = g.lookupPath(a);
                        var d = c.node;
                        var e = g.stat(a)
                    } catch (f) {
                        return b(f)
                    }
                    return g.isDir(e.mode) ? b(null, {
                        timestamp: e.mtime,
                        mode: e.mode
                    }) : g.isFile(e.mode) ? (d.contents = H.getFileDataAsTypedArray(d), b(null, {
                        timestamp: e.mtime,
                        mode: e.mode,
                        contents: d.contents
                    })) : b(Error("node type not supported"))
                },
                storeLocalEntry: function(a, b, c) {
                    try {
                        if (g.isDir(b.mode)) g.mkdir(a, b.mode);
                        else if (g.isFile(b.mode)) g.writeFile(a, b.contents, {
                            canOwn: !0
                        });
                        else return c(Error("node type not supported"));
                        g.chmod(a, b.mode);
                        g.utime(a, b.timestamp, b.timestamp)
                    } catch (d) {
                        return c(d)
                    }
                    c(null)
                },
                removeLocalEntry: function(a, b) {
                    try {
                        g.lookupPath(a);
                        var c = g.stat(a);
                        g.isDir(c.mode) ? g.rmdir(a) : g.isFile(c.mode) && g.unlink(a)
                    } catch (d) {
                        return b(d)
                    }
                    b(null)
                },
                loadRemoteEntry: function(a, b, c) {
                    a = a.get(b);
                    a.onsuccess = function(d) {
                        c(null, d.target.result)
                    };
                    a.onerror = function(d) {
                        c(this.error);
                        d.preventDefault()
                    }
                },
                storeRemoteEntry: function(a, b, c, d) {
                    a = a.put(c, b);
                    a.onsuccess = function() {
                        d(null)
                    };
                    a.onerror = function(e) {
                        d(this.error);
                        e.preventDefault()
                    }
                },
                removeRemoteEntry: function(a, b, c) {
                    a = a["delete"](b);
                    a.onsuccess =
                        function() {
                            c(null)
                        };
                    a.onerror = function(d) {
                        c(this.error);
                        d.preventDefault()
                    }
                },
                reconcile: function(a, b, c) {
                    function d(t) {
                        if (t) {
                            if (!d.errored) return d.errored = !0, c(t)
                        } else if (++n >= e) return c(null)
                    }
                    var e = 0,
                        f = [];
                    Object.keys(a.entries).forEach(function(t) {
                        var w = a.entries[t],
                            x = b.entries[t];
                        if (!x || w.timestamp > x.timestamp) f.push(t), e++
                    });
                    var k = [];
                    Object.keys(b.entries).forEach(function(t) {
                        var w = a.entries[t];
                        w || (k.push(t), e++)
                    });
                    if (!e) return c(null);
                    var n = 0,
                        q = "remote" === a.type ? a.db : b.db;
                    q = q.transaction([aa.DB_STORE_NAME],
                        "readwrite");
                    var r = q.objectStore(aa.DB_STORE_NAME);
                    q.onerror = function(t) {
                        d(this.error);
                        t.preventDefault()
                    };
                    f.sort().forEach(function(t) {
                        "local" === b.type ? aa.loadRemoteEntry(r, t, function(w, x) {
                            if (w) return d(w);
                            aa.storeLocalEntry(t, x, d)
                        }) : aa.loadLocalEntry(t, function(w, x) {
                            if (w) return d(w);
                            aa.storeRemoteEntry(r, t, x, d)
                        })
                    });
                    k.sort().reverse().forEach(function(t) {
                        "local" === b.type ? aa.removeLocalEntry(t, d) : aa.removeRemoteEntry(r, t, d)
                    })
                }
            },
            N = {
                isWindows: !1,
                staticInit: function() {
                    N.isWindows = !!process.platform.match(/^win/);
                    var a = process.binding("constants");
                    a.fs && (a = a.fs);
                    N.flagsForNodeMap = {
                        1024: a.O_APPEND,
                        64: a.O_CREAT,
                        128: a.O_EXCL,
                        0: a.O_RDONLY,
                        2: a.O_RDWR,
                        4096: a.O_SYNC,
                        512: a.O_TRUNC,
                        1: a.O_WRONLY
                    }
                },
                bufferFrom: function(a) {
                    return Buffer.alloc ? Buffer.from(a) : new Buffer(a)
                },
                mount: function(a) {
                    ja(Ea);
                    return N.createNode(null, "/", N.getMode(a.opts.root), 0)
                },
                createNode: function(a, b, c) {
                    if (!g.isDir(c) && !g.isFile(c) && !g.isLink(c)) throw new g.ErrnoError(22);
                    a = g.createNode(a, b, c);
                    a.node_ops = N.node_ops;
                    a.stream_ops = N.stream_ops;
                    return a
                },
                getMode: function(a) {
                    try {
                        var b = ba.lstatSync(a);
                        N.isWindows && (b.mode |= (b.mode & 292) >> 2)
                    } catch (c) {
                        if (!c.code) throw c;
                        throw new g.ErrnoError(-c.errno);
                    }
                    return b.mode
                },
                realPath: function(a) {
                    for (var b = []; a.parent !== a;) b.push(a.name), a = a.parent;
                    b.push(a.mount.opts.root);
                    b.reverse();
                    return F.join.apply(null, b)
                },
                flagsForNode: function(a) {
                    a &= -2097153;
                    a &= -2049;
                    a &= -32769;
                    a &= -524289;
                    var b = 0,
                        c;
                    for (c in N.flagsForNodeMap) a & c && (b |= N.flagsForNodeMap[c], a ^= c);
                    if (a) throw new g.ErrnoError(22);
                    return b
                },
                node_ops: {
                    getattr: function(a) {
                        a =
                            N.realPath(a);
                        try {
                            var b = ba.lstatSync(a)
                        } catch (c) {
                            if (!c.code) throw c;
                            throw new g.ErrnoError(-c.errno);
                        }
                        N.isWindows && !b.blksize && (b.blksize = 4096);
                        N.isWindows && !b.blocks && (b.blocks = (b.size + b.blksize - 1) / b.blksize | 0);
                        return {
                            dev: b.dev,
                            ino: b.ino,
                            mode: b.mode,
                            nlink: b.nlink,
                            uid: b.uid,
                            gid: b.gid,
                            rdev: b.rdev,
                            size: b.size,
                            atime: b.atime,
                            mtime: b.mtime,
                            ctime: b.ctime,
                            blksize: b.blksize,
                            blocks: b.blocks
                        }
                    },
                    setattr: function(a, b) {
                        var c = N.realPath(a);
                        try {
                            void 0 !== b.mode && (ba.chmodSync(c, b.mode), a.mode = b.mode);
                            if (void 0 !==
                                b.timestamp) {
                                var d = new Date(b.timestamp);
                                ba.utimesSync(c, d, d)
                            }
                            void 0 !== b.size && ba.truncateSync(c, b.size)
                        } catch (e) {
                            if (!e.code) throw e;
                            throw new g.ErrnoError(-e.errno);
                        }
                    },
                    lookup: function(a, b) {
                        var c = F.join2(N.realPath(a), b);
                        c = N.getMode(c);
                        return N.createNode(a, b, c)
                    },
                    mknod: function(a, b, c, d) {
                        a = N.createNode(a, b, c, d);
                        b = N.realPath(a);
                        try {
                            g.isDir(a.mode) ? ba.mkdirSync(b, a.mode) : ba.writeFileSync(b, "", {
                                mode: a.mode
                            })
                        } catch (e) {
                            if (!e.code) throw e;
                            throw new g.ErrnoError(-e.errno);
                        }
                        return a
                    },
                    rename: function(a, b, c) {
                        a =
                            N.realPath(a);
                        b = F.join2(N.realPath(b), c);
                        try {
                            ba.renameSync(a, b)
                        } catch (d) {
                            if (!d.code) throw d;
                            throw new g.ErrnoError(-d.errno);
                        }
                    },
                    unlink: function(a, b) {
                        a = F.join2(N.realPath(a), b);
                        try {
                            ba.unlinkSync(a)
                        } catch (c) {
                            if (!c.code) throw c;
                            throw new g.ErrnoError(-c.errno);
                        }
                    },
                    rmdir: function(a, b) {
                        a = F.join2(N.realPath(a), b);
                        try {
                            ba.rmdirSync(a)
                        } catch (c) {
                            if (!c.code) throw c;
                            throw new g.ErrnoError(-c.errno);
                        }
                    },
                    readdir: function(a) {
                        a = N.realPath(a);
                        try {
                            return ba.readdirSync(a)
                        } catch (b) {
                            if (!b.code) throw b;
                            throw new g.ErrnoError(-b.errno);
                        }
                    },
                    symlink: function(a, b, c) {
                        a = F.join2(N.realPath(a), b);
                        try {
                            ba.symlinkSync(c, a)
                        } catch (d) {
                            if (!d.code) throw d;
                            throw new g.ErrnoError(-d.errno);
                        }
                    },
                    readlink: function(a) {
                        var b = N.realPath(a);
                        try {
                            return b = ba.readlinkSync(b), b = Pc.relative(Pc.resolve(a.mount.opts.root), b)
                        } catch (c) {
                            if (!c.code) throw c;
                            throw new g.ErrnoError(-c.errno);
                        }
                    }
                },
                stream_ops: {
                    open: function(a) {
                        var b = N.realPath(a.node);
                        try {
                            g.isFile(a.node.mode) && (a.nfd = ba.openSync(b, N.flagsForNode(a.flags)))
                        } catch (c) {
                            if (!c.code) throw c;
                            throw new g.ErrnoError(-c.errno);
                        }
                    },
                    close: function(a) {
                        try {
                            g.isFile(a.node.mode) && a.nfd && ba.closeSync(a.nfd)
                        } catch (b) {
                            if (!b.code) throw b;
                            throw new g.ErrnoError(-b.errno);
                        }
                    },
                    read: function(a, b, c, d, e) {
                        if (0 === d) return 0;
                        try {
                            return ba.readSync(a.nfd, N.bufferFrom(b.buffer), c, d, e)
                        } catch (f) {
                            throw new g.ErrnoError(-f.errno);
                        }
                    },
                    write: function(a, b, c, d, e) {
                        try {
                            return ba.writeSync(a.nfd, N.bufferFrom(b.buffer), c, d, e)
                        } catch (f) {
                            throw new g.ErrnoError(-f.errno);
                        }
                    },
                    llseek: function(a, b, c) {
                        if (1 === c) b += a.position;
                        else if (2 === c && g.isFile(a.node.mode)) try {
                            var d =
                                ba.fstatSync(a.nfd);
                            b += d.size
                        } catch (e) {
                            throw new g.ErrnoError(-e.errno);
                        }
                        if (0 > b) throw new g.ErrnoError(22);
                        return b
                    }
                }
            },
            ha = {
                DIR_MODE: 16895,
                FILE_MODE: 33279,
                reader: null,
                mount: function(a) {
                    function b(f) {
                        f = f.split("/");
                        for (var k = d, n = 0; n < f.length - 1; n++) {
                            var q = f.slice(0, n + 1).join("/");
                            e[q] || (e[q] = ha.createNode(k, f[n], ha.DIR_MODE, 0));
                            k = e[q]
                        }
                        return k
                    }

                    function c(f) {
                        f = f.split("/");
                        return f[f.length - 1]
                    }
                    ja(sa);
                    ha.reader || (ha.reader = new FileReaderSync);
                    var d = ha.createNode(null, "/", ha.DIR_MODE, 0),
                        e = {};
                    Array.prototype.forEach.call(a.opts.files ||
                        [],
                        function(f) {
                            ha.createNode(b(f.name), c(f.name), ha.FILE_MODE, 0, f, f.lastModifiedDate)
                        });
                    (a.opts.blobs || []).forEach(function(f) {
                        ha.createNode(b(f.name), c(f.name), ha.FILE_MODE, 0, f.data)
                    });
                    (a.opts.packages || []).forEach(function(f) {
                        f.metadata.files.forEach(function(k) {
                            var n = k.filename.substr(1);
                            ha.createNode(b(n), c(n), ha.FILE_MODE, 0, f.blob.slice(k.start, k.end))
                        })
                    });
                    return d
                },
                createNode: function(a, b, c, d, e, f) {
                    d = g.createNode(a, b, c);
                    d.mode = c;
                    d.node_ops = ha.node_ops;
                    d.stream_ops = ha.stream_ops;
                    d.timestamp = (f ||
                        new Date).getTime();
                    ja(ha.FILE_MODE !== ha.DIR_MODE);
                    c === ha.FILE_MODE ? (d.size = e.size, d.contents = e) : (d.size = 4096, d.contents = {});
                    a && (a.contents[b] = d);
                    return d
                },
                node_ops: {
                    getattr: function(a) {
                        return {
                            dev: 1,
                            ino: void 0,
                            mode: a.mode,
                            nlink: 1,
                            uid: 0,
                            gid: 0,
                            rdev: void 0,
                            size: a.size,
                            atime: new Date(a.timestamp),
                            mtime: new Date(a.timestamp),
                            ctime: new Date(a.timestamp),
                            blksize: 4096,
                            blocks: Math.ceil(a.size / 4096)
                        }
                    },
                    setattr: function(a, b) {
                        void 0 !== b.mode && (a.mode = b.mode);
                        void 0 !== b.timestamp && (a.timestamp = b.timestamp)
                    },
                    lookup: function() {
                        throw new g.ErrnoError(2);
                    },
                    mknod: function() {
                        throw new g.ErrnoError(1);
                    },
                    rename: function() {
                        throw new g.ErrnoError(1);
                    },
                    unlink: function() {
                        throw new g.ErrnoError(1);
                    },
                    rmdir: function() {
                        throw new g.ErrnoError(1);
                    },
                    readdir: function(a) {
                        var b = [".", ".."],
                            c;
                        for (c in a.contents) a.contents.hasOwnProperty(c) && b.push(c);
                        return b
                    },
                    symlink: function() {
                        throw new g.ErrnoError(1);
                    },
                    readlink: function() {
                        throw new g.ErrnoError(1);
                    }
                },
                stream_ops: {
                    read: function(a, b, c, d, e) {
                        if (e >= a.node.size) return 0;
                        a = a.node.contents.slice(e, e + d);
                        d = ha.reader.readAsArrayBuffer(a);
                        b.set(new Uint8Array(d), c);
                        return a.size
                    },
                    write: function() {
                        throw new g.ErrnoError(5);
                    },
                    llseek: function(a, b, c) {
                        1 === c ? b += a.position : 2 === c && g.isFile(a.node.mode) && (b += a.node.size);
                        if (0 > b) throw new g.ErrnoError(22);
                        return b
                    }
                }
            },
            g = {
                root: null,
                mounts: [],
                devices: {},
                streams: [],
                nextInode: 1,
                nameTable: null,
                currentPath: "/",
                initialized: !1,
                ignorePermissions: !0,
                trackingDelegate: {},
                tracking: {
                    openFlags: {
                        READ: 1,
                        WRITE: 2
                    }
                },
                ErrnoError: null,
                genericErrors: {},
                filesystems: null,
                syncFSRequests: 0,
                handleFSError: function(a) {
                    if (!(a instanceof g.ErrnoError)) {
                        a: {
                            var b = Error();
                            if (!b.stack) {
                                try {
                                    throw Error(0);
                                } catch (c) {
                                    b = c
                                }
                                if (!b.stack) {
                                    b = "(no stack trace available)";
                                    break a
                                }
                            }
                            b = b.stack.toString()
                        }
                        h.extraStackTrace && (b += "\n" + h.extraStackTrace());b = Ml(b);
                        throw a + " : " + b;
                    }
                    return Ka(a.errno)
                },
                lookupPath: function(a, b) {
                    a = F.resolve(g.cwd(), a);
                    b = b || {};
                    if (!a) return {
                        path: "",
                        node: null
                    };
                    var c = {
                            follow_mount: !0,
                            recurse_count: 0
                        },
                        d;
                    for (d in c) void 0 === b[d] && (b[d] = c[d]);
                    if (8 < b.recurse_count) throw new g.ErrnoError(40);
                    a = F.normalizeArray(a.split("/").filter(function(k) {
                        return !!k
                    }), !1);
                    var e = g.root;
                    c = "/";
                    for (d = 0; d < a.length; d++) {
                        var f = d === a.length - 1;
                        if (f && b.parent) break;
                        e = g.lookupNode(e, a[d]);
                        c = F.join2(c, a[d]);
                        g.isMountpoint(e) && (!f || f && b.follow_mount) && (e = e.mounted.root);
                        if (!f || b.follow)
                            for (f = 0; g.isLink(e.mode);)
                                if (e = g.readlink(c), c = F.resolve(F.dirname(c), e), e = g.lookupPath(c, {
                                        recurse_count: b.recurse_count
                                    }), e = e.node, 40 < f++) throw new g.ErrnoError(40);
                    }
                    return {
                        path: c,
                        node: e
                    }
                },
                getPath: function(a) {
                    for (var b;;) {
                        if (g.isRoot(a)) return a = a.mount.mountpoint, b ? "/" !== a[a.length - 1] ? a + "/" +
                            b : a + b : a;
                        b = b ? a.name + "/" + b : a.name;
                        a = a.parent
                    }
                },
                hashName: function(a, b) {
                    for (var c = 0, d = 0; d < b.length; d++) c = (c << 5) - c + b.charCodeAt(d) | 0;
                    return (a + c >>> 0) % g.nameTable.length
                },
                hashAddNode: function(a) {
                    var b = g.hashName(a.parent.id, a.name);
                    a.name_next = g.nameTable[b];
                    g.nameTable[b] = a
                },
                hashRemoveNode: function(a) {
                    var b = g.hashName(a.parent.id, a.name);
                    if (g.nameTable[b] === a) g.nameTable[b] = a.name_next;
                    else
                        for (b = g.nameTable[b]; b;) {
                            if (b.name_next === a) {
                                b.name_next = a.name_next;
                                break
                            }
                            b = b.name_next
                        }
                },
                lookupNode: function(a,
                    b) {
                    var c = g.mayLookup(a);
                    if (c) throw new g.ErrnoError(c, a);
                    c = g.hashName(a.id, b);
                    for (c = g.nameTable[c]; c; c = c.name_next) {
                        var d = c.name;
                        if (c.parent.id === a.id && d === b) return c
                    }
                    return g.lookup(a, b)
                },
                createNode: function(a, b, c, d) {
                    g.FSNode || (g.FSNode = function(e, f, k, n) {
                        e || (e = this);
                        this.parent = e;
                        this.mount = e.mount;
                        this.mounted = null;
                        this.id = g.nextInode++;
                        this.name = f;
                        this.mode = k;
                        this.node_ops = {};
                        this.stream_ops = {};
                        this.rdev = n
                    }, g.FSNode.prototype = {}, Object.defineProperties(g.FSNode.prototype, {
                        read: {
                            get: function() {
                                return 365 ===
                                    (this.mode & 365)
                            },
                            set: function(e) {
                                e ? this.mode |= 365 : this.mode &= -366
                            }
                        },
                        write: {
                            get: function() {
                                return 146 === (this.mode & 146)
                            },
                            set: function(e) {
                                e ? this.mode |= 146 : this.mode &= -147
                            }
                        },
                        isFolder: {
                            get: function() {
                                return g.isDir(this.mode)
                            }
                        },
                        isDevice: {
                            get: function() {
                                return g.isChrdev(this.mode)
                            }
                        }
                    }));
                    a = new g.FSNode(a, b, c, d);
                    g.hashAddNode(a);
                    return a
                },
                destroyNode: function(a) {
                    g.hashRemoveNode(a)
                },
                isRoot: function(a) {
                    return a === a.parent
                },
                isMountpoint: function(a) {
                    return !!a.mounted
                },
                isFile: function(a) {
                    return 32768 === (a & 61440)
                },
                isDir: function(a) {
                    return 16384 === (a & 61440)
                },
                isLink: function(a) {
                    return 40960 === (a & 61440)
                },
                isChrdev: function(a) {
                    return 8192 === (a & 61440)
                },
                isBlkdev: function(a) {
                    return 24576 === (a & 61440)
                },
                isFIFO: function(a) {
                    return 4096 === (a & 61440)
                },
                isSocket: function(a) {
                    return 49152 === (a & 49152)
                },
                flagModes: {
                    r: 0,
                    rs: 1052672,
                    "r+": 2,
                    w: 577,
                    wx: 705,
                    xw: 705,
                    "w+": 578,
                    "wx+": 706,
                    "xw+": 706,
                    a: 1089,
                    ax: 1217,
                    xa: 1217,
                    "a+": 1090,
                    "ax+": 1218,
                    "xa+": 1218
                },
                modeStringToFlags: function(a) {
                    var b = g.flagModes[a];
                    if ("undefined" === typeof b) throw Error("Unknown file open mode: " +
                        a);
                    return b
                },
                flagsToPermissionString: function(a) {
                    var b = ["r", "w", "rw"][a & 3];
                    a & 512 && (b += "w");
                    return b
                },
                nodePermissions: function(a, b) {
                    if (g.ignorePermissions) return 0;
                    if (-1 === b.indexOf("r") || a.mode & 292) {
                        if (-1 !== b.indexOf("w") && !(a.mode & 146) || -1 !== b.indexOf("x") && !(a.mode & 73)) return 13
                    } else return 13;
                    return 0
                },
                mayLookup: function(a) {
                    var b = g.nodePermissions(a, "x");
                    return b ? b : a.node_ops.lookup ? 0 : 13
                },
                mayCreate: function(a, b) {
                    try {
                        return g.lookupNode(a, b), 17
                    } catch (c) {}
                    return g.nodePermissions(a, "wx")
                },
                mayDelete: function(a,
                    b, c) {
                    try {
                        var d = g.lookupNode(a, b)
                    } catch (e) {
                        return e.errno
                    }
                    if (a = g.nodePermissions(a, "wx")) return a;
                    if (c) {
                        if (!g.isDir(d.mode)) return 20;
                        if (g.isRoot(d) || g.getPath(d) === g.cwd()) return 16
                    } else if (g.isDir(d.mode)) return 21;
                    return 0
                },
                mayOpen: function(a, b) {
                    return a ? g.isLink(a.mode) ? 40 : g.isDir(a.mode) && ("r" !== g.flagsToPermissionString(b) || b & 512) ? 21 : g.nodePermissions(a, g.flagsToPermissionString(b)) : 2
                },
                MAX_OPEN_FDS: 4096,
                nextfd: function(a, b) {
                    a = a || 0;
                    for (b = b || g.MAX_OPEN_FDS; a <= b; a++)
                        if (!g.streams[a]) return a;
                    throw new g.ErrnoError(24);
                },
                getStream: function(a) {
                    return g.streams[a]
                },
                createStream: function(a, b, c) {
                    g.FSStream || (g.FSStream = function() {}, g.FSStream.prototype = {}, Object.defineProperties(g.FSStream.prototype, {
                        object: {
                            get: function() {
                                return this.node
                            },
                            set: function(f) {
                                this.node = f
                            }
                        }
                    }));
                    var d = new g.FSStream,
                        e;
                    for (e in a) d[e] = a[e];
                    a = d;
                    b = g.nextfd(b, c);
                    a.fd = b;
                    return g.streams[b] = a
                },
                closeStream: function(a) {
                    g.streams[a] = null
                },
                chrdev_stream_ops: {
                    open: function(a) {
                        var b = g.getDevice(a.node.rdev);
                        a.stream_ops = b.stream_ops;
                        a.stream_ops.open &&
                            a.stream_ops.open(a)
                    },
                    llseek: function() {
                        throw new g.ErrnoError(29);
                    }
                },
                major: function(a) {
                    return a >> 8
                },
                minor: function(a) {
                    return a & 255
                },
                makedev: function(a, b) {
                    return a << 8 | b
                },
                registerDevice: function(a, b) {
                    g.devices[a] = {
                        stream_ops: b
                    }
                },
                getDevice: function(a) {
                    return g.devices[a]
                },
                getMounts: function(a) {
                    var b = [];
                    for (a = [a]; a.length;) {
                        var c = a.pop();
                        b.push(c);
                        a.push.apply(a, c.mounts)
                    }
                    return b
                },
                syncfs: function(a, b) {
                    function c(k) {
                        g.syncFSRequests--;
                        return b(k)
                    }

                    function d(k) {
                        if (k) {
                            if (!d.errored) return d.errored = !0,
                                c(k)
                        } else ++f >= e.length && c(null)
                    }
                    "function" === typeof a && (b = a, a = !1);
                    g.syncFSRequests++;
                    1 < g.syncFSRequests && console.log("warning: " + g.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
                    var e = g.getMounts(g.root.mount),
                        f = 0;
                    e.forEach(function(k) {
                        if (!k.type.syncfs) return d(null);
                        k.type.syncfs(k, a, d)
                    })
                },
                mount: function(a, b, c) {
                    var d = "/" === c,
                        e = !c;
                    if (d && g.root) throw new g.ErrnoError(16);
                    if (!d && !e) {
                        var f = g.lookupPath(c, {
                            follow_mount: !1
                        });
                        c = f.path;
                        f = f.node;
                        if (g.isMountpoint(f)) throw new g.ErrnoError(16);
                        if (!g.isDir(f.mode)) throw new g.ErrnoError(20);
                    }
                    b = {
                        type: a,
                        opts: b,
                        mountpoint: c,
                        mounts: []
                    };
                    a = a.mount(b);
                    a.mount = b;
                    b.root = a;
                    d ? g.root = a : f && (f.mounted = b, f.mount && f.mount.mounts.push(b));
                    return a
                },
                unmount: function(a) {
                    a = g.lookupPath(a, {
                        follow_mount: !1
                    });
                    if (!g.isMountpoint(a.node)) throw new g.ErrnoError(22);
                    a = a.node;
                    var b = a.mounted,
                        c = g.getMounts(b);
                    Object.keys(g.nameTable).forEach(function(d) {
                        for (d = g.nameTable[d]; d;) {
                            var e = d.name_next; - 1 !== c.indexOf(d.mount) && g.destroyNode(d);
                            d = e
                        }
                    });
                    a.mounted = null;
                    b = a.mount.mounts.indexOf(b);
                    a.mount.mounts.splice(b, 1)
                },
                lookup: function(a, b) {
                    return a.node_ops.lookup(a, b)
                },
                mknod: function(a, b, c) {
                    var d = g.lookupPath(a, {
                        parent: !0
                    });
                    d = d.node;
                    a = F.basename(a);
                    if (!a || "." === a || ".." === a) throw new g.ErrnoError(22);
                    var e = g.mayCreate(d, a);
                    if (e) throw new g.ErrnoError(e);
                    if (!d.node_ops.mknod) throw new g.ErrnoError(1);
                    return d.node_ops.mknod(d, a, b, c)
                },
                create: function(a, b) {
                    b = void 0 !== b ? b : 438;
                    b &= 4095;
                    b |= 32768;
                    return g.mknod(a, b, 0)
                },
                mkdir: function(a, b) {
                    b = void 0 !== b ? b : 511;
                    b &= 1023;
                    b |= 16384;
                    return g.mknod(a,
                        b, 0)
                },
                mkdirTree: function(a, b) {
                    a = a.split("/");
                    for (var c = "", d = 0; d < a.length; ++d)
                        if (a[d]) {
                            c += "/" + a[d];
                            try {
                                g.mkdir(c, b)
                            } catch (e) {
                                if (17 != e.errno) throw e;
                            }
                        }
                },
                mkdev: function(a, b, c) {
                    "undefined" === typeof c && (c = b, b = 438);
                    b |= 8192;
                    return g.mknod(a, b, c)
                },
                symlink: function(a, b) {
                    if (!F.resolve(a)) throw new g.ErrnoError(2);
                    var c = g.lookupPath(b, {
                        parent: !0
                    });
                    c = c.node;
                    if (!c) throw new g.ErrnoError(2);
                    b = F.basename(b);
                    var d = g.mayCreate(c, b);
                    if (d) throw new g.ErrnoError(d);
                    if (!c.node_ops.symlink) throw new g.ErrnoError(1);
                    return c.node_ops.symlink(c,
                        b, a)
                },
                rename: function(a, b) {
                    var c = F.dirname(a),
                        d = F.dirname(b),
                        e = F.basename(a),
                        f = F.basename(b);
                    try {
                        var k = g.lookupPath(a, {
                            parent: !0
                        });
                        var n = k.node;
                        k = g.lookupPath(b, {
                            parent: !0
                        });
                        var q = k.node
                    } catch (t) {
                        throw new g.ErrnoError(16);
                    }
                    if (!n || !q) throw new g.ErrnoError(2);
                    if (n.mount !== q.mount) throw new g.ErrnoError(18);
                    k = g.lookupNode(n, e);
                    d = F.relative(a, d);
                    if ("." !== d.charAt(0)) throw new g.ErrnoError(22);
                    d = F.relative(b, c);
                    if ("." !== d.charAt(0)) throw new g.ErrnoError(39);
                    try {
                        var r = g.lookupNode(q, f)
                    } catch (t) {}
                    if (k !==
                        r) {
                        c = g.isDir(k.mode);
                        if (e = g.mayDelete(n, e, c)) throw new g.ErrnoError(e);
                        if (e = r ? g.mayDelete(q, f, c) : g.mayCreate(q, f)) throw new g.ErrnoError(e);
                        if (!n.node_ops.rename) throw new g.ErrnoError(1);
                        if (g.isMountpoint(k) || r && g.isMountpoint(r)) throw new g.ErrnoError(16);
                        if (q !== n && (e = g.nodePermissions(n, "w"))) throw new g.ErrnoError(e);
                        try {
                            g.trackingDelegate.willMovePath && g.trackingDelegate.willMovePath(a, b)
                        } catch (t) {
                            console.log("FS.trackingDelegate['willMovePath']('" + a + "', '" + b + "') threw an exception: " + t.message)
                        }
                        g.hashRemoveNode(k);
                        try {
                            n.node_ops.rename(k, q, f)
                        } catch (t) {
                            throw t;
                        } finally {
                            g.hashAddNode(k)
                        }
                        try {
                            if (g.trackingDelegate.onMovePath) g.trackingDelegate.onMovePath(a, b)
                        } catch (t) {
                            console.log("FS.trackingDelegate['onMovePath']('" + a + "', '" + b + "') threw an exception: " + t.message)
                        }
                    }
                },
                rmdir: function(a) {
                    var b = g.lookupPath(a, {
                        parent: !0
                    });
                    b = b.node;
                    var c = F.basename(a),
                        d = g.lookupNode(b, c),
                        e = g.mayDelete(b, c, !0);
                    if (e) throw new g.ErrnoError(e);
                    if (!b.node_ops.rmdir) throw new g.ErrnoError(1);
                    if (g.isMountpoint(d)) throw new g.ErrnoError(16);
                    try {
                        g.trackingDelegate.willDeletePath && g.trackingDelegate.willDeletePath(a)
                    } catch (f) {
                        console.log("FS.trackingDelegate['willDeletePath']('" + a + "') threw an exception: " + f.message)
                    }
                    b.node_ops.rmdir(b, c);
                    g.destroyNode(d);
                    try {
                        if (g.trackingDelegate.onDeletePath) g.trackingDelegate.onDeletePath(a)
                    } catch (f) {
                        console.log("FS.trackingDelegate['onDeletePath']('" + a + "') threw an exception: " + f.message)
                    }
                },
                readdir: function(a) {
                    a = g.lookupPath(a, {
                        follow: !0
                    });
                    a = a.node;
                    if (!a.node_ops.readdir) throw new g.ErrnoError(20);
                    return a.node_ops.readdir(a)
                },
                unlink: function(a) {
                    var b = g.lookupPath(a, {
                        parent: !0
                    });
                    b = b.node;
                    var c = F.basename(a),
                        d = g.lookupNode(b, c),
                        e = g.mayDelete(b, c, !1);
                    if (e) throw new g.ErrnoError(e);
                    if (!b.node_ops.unlink) throw new g.ErrnoError(1);
                    if (g.isMountpoint(d)) throw new g.ErrnoError(16);
                    try {
                        g.trackingDelegate.willDeletePath && g.trackingDelegate.willDeletePath(a)
                    } catch (f) {
                        console.log("FS.trackingDelegate['willDeletePath']('" + a + "') threw an exception: " + f.message)
                    }
                    b.node_ops.unlink(b, c);
                    g.destroyNode(d);
                    try {
                        if (g.trackingDelegate.onDeletePath) g.trackingDelegate.onDeletePath(a)
                    } catch (f) {
                        console.log("FS.trackingDelegate['onDeletePath']('" +
                            a + "') threw an exception: " + f.message)
                    }
                },
                readlink: function(a) {
                    a = g.lookupPath(a);
                    a = a.node;
                    if (!a) throw new g.ErrnoError(2);
                    if (!a.node_ops.readlink) throw new g.ErrnoError(22);
                    return F.resolve(g.getPath(a.parent), a.node_ops.readlink(a))
                },
                stat: function(a, b) {
                    a = g.lookupPath(a, {
                        follow: !b
                    });
                    a = a.node;
                    if (!a) throw new g.ErrnoError(2);
                    if (!a.node_ops.getattr) throw new g.ErrnoError(1);
                    return a.node_ops.getattr(a)
                },
                lstat: function(a) {
                    return g.stat(a, !0)
                },
                chmod: function(a, b, c) {
                    "string" === typeof a && (a = g.lookupPath(a, {
                        follow: !c
                    }), a = a.node);
                    if (!a.node_ops.setattr) throw new g.ErrnoError(1);
                    a.node_ops.setattr(a, {
                        mode: b & 4095 | a.mode & -4096,
                        timestamp: Date.now()
                    })
                },
                lchmod: function(a, b) {
                    g.chmod(a, b, !0)
                },
                fchmod: function(a, b) {
                    a = g.getStream(a);
                    if (!a) throw new g.ErrnoError(9);
                    g.chmod(a.node, b)
                },
                chown: function(a, b, c, d) {
                    "string" === typeof a && (a = g.lookupPath(a, {
                        follow: !d
                    }), a = a.node);
                    if (!a.node_ops.setattr) throw new g.ErrnoError(1);
                    a.node_ops.setattr(a, {
                        timestamp: Date.now()
                    })
                },
                lchown: function(a, b, c) {
                    g.chown(a, b, c, !0)
                },
                fchown: function(a,
                    b, c) {
                    a = g.getStream(a);
                    if (!a) throw new g.ErrnoError(9);
                    g.chown(a.node, b, c)
                },
                truncate: function(a, b) {
                    if (0 > b) throw new g.ErrnoError(22);
                    "string" === typeof a && (a = g.lookupPath(a, {
                        follow: !0
                    }), a = a.node);
                    if (!a.node_ops.setattr) throw new g.ErrnoError(1);
                    if (g.isDir(a.mode)) throw new g.ErrnoError(21);
                    if (!g.isFile(a.mode)) throw new g.ErrnoError(22);
                    var c = g.nodePermissions(a, "w");
                    if (c) throw new g.ErrnoError(c);
                    a.node_ops.setattr(a, {
                        size: b,
                        timestamp: Date.now()
                    })
                },
                ftruncate: function(a, b) {
                    a = g.getStream(a);
                    if (!a) throw new g.ErrnoError(9);
                    if (0 === (a.flags & 2097155)) throw new g.ErrnoError(22);
                    g.truncate(a.node, b)
                },
                utime: function(a, b, c) {
                    a = g.lookupPath(a, {
                        follow: !0
                    });
                    a = a.node;
                    a.node_ops.setattr(a, {
                        timestamp: Math.max(b, c)
                    })
                },
                open: function(a, b, c, d, e) {
                    if ("" === a) throw new g.ErrnoError(2);
                    b = "string" === typeof b ? g.modeStringToFlags(b) : b;
                    c = "undefined" === typeof c ? 438 : c;
                    c = b & 64 ? c & 4095 | 32768 : 0;
                    if ("object" === typeof a) var f = a;
                    else {
                        a = F.normalize(a);
                        try {
                            var k = g.lookupPath(a, {
                                follow: !(b & 131072)
                            });
                            f = k.node
                        } catch (n) {}
                    }
                    k = !1;
                    if (b & 64)
                        if (f) {
                            if (b & 128) throw new g.ErrnoError(17);
                        } else f = g.mknod(a, c, 0), k = !0;
                    if (!f) throw new g.ErrnoError(2);
                    g.isChrdev(f.mode) && (b &= -513);
                    if (b & 65536 && !g.isDir(f.mode)) throw new g.ErrnoError(20);
                    if (!k && (c = g.mayOpen(f, b))) throw new g.ErrnoError(c);
                    b & 512 && g.truncate(f, 0);
                    b &= -641;
                    d = g.createStream({
                        node: f,
                        path: g.getPath(f),
                        flags: b,
                        seekable: !0,
                        position: 0,
                        stream_ops: f.stream_ops,
                        ungotten: [],
                        error: !1
                    }, d, e);
                    d.stream_ops.open && d.stream_ops.open(d);
                    !h.logReadFiles || b & 1 || (g.readFiles || (g.readFiles = {}), a in g.readFiles || (g.readFiles[a] = 1, console.log("FS.trackingDelegate error on read file: " +
                        a)));
                    try {
                        g.trackingDelegate.onOpenFile && (e = 0, 1 !== (b & 2097155) && (e |= g.tracking.openFlags.READ), 0 !== (b & 2097155) && (e |= g.tracking.openFlags.WRITE), g.trackingDelegate.onOpenFile(a, e))
                    } catch (n) {
                        console.log("FS.trackingDelegate['onOpenFile']('" + a + "', flags) threw an exception: " + n.message)
                    }
                    return d
                },
                close: function(a) {
                    if (g.isClosed(a)) throw new g.ErrnoError(9);
                    a.getdents && (a.getdents = null);
                    try {
                        a.stream_ops.close && a.stream_ops.close(a)
                    } catch (b) {
                        throw b;
                    } finally {
                        g.closeStream(a.fd)
                    }
                    a.fd = null
                },
                isClosed: function(a) {
                    return null ===
                        a.fd
                },
                llseek: function(a, b, c) {
                    if (g.isClosed(a)) throw new g.ErrnoError(9);
                    if (!a.seekable || !a.stream_ops.llseek) throw new g.ErrnoError(29);
                    if (0 != c && 1 != c && 2 != c) throw new g.ErrnoError(22);
                    a.position = a.stream_ops.llseek(a, b, c);
                    a.ungotten = [];
                    return a.position
                },
                read: function(a, b, c, d, e) {
                    if (0 > d || 0 > e) throw new g.ErrnoError(22);
                    if (g.isClosed(a)) throw new g.ErrnoError(9);
                    if (1 === (a.flags & 2097155)) throw new g.ErrnoError(9);
                    if (g.isDir(a.node.mode)) throw new g.ErrnoError(21);
                    if (!a.stream_ops.read) throw new g.ErrnoError(22);
                    var f = "undefined" !== typeof e;
                    if (!f) e = a.position;
                    else if (!a.seekable) throw new g.ErrnoError(29);
                    b = a.stream_ops.read(a, b, c, d, e);
                    f || (a.position += b);
                    return b
                },
                write: function(a, b, c, d, e, f) {
                    if (0 > d || 0 > e) throw new g.ErrnoError(22);
                    if (g.isClosed(a)) throw new g.ErrnoError(9);
                    if (0 === (a.flags & 2097155)) throw new g.ErrnoError(9);
                    if (g.isDir(a.node.mode)) throw new g.ErrnoError(21);
                    if (!a.stream_ops.write) throw new g.ErrnoError(22);
                    a.flags & 1024 && g.llseek(a, 0, 2);
                    var k = "undefined" !== typeof e;
                    if (!k) e = a.position;
                    else if (!a.seekable) throw new g.ErrnoError(29);
                    b = a.stream_ops.write(a, b, c, d, e, f);
                    k || (a.position += b);
                    try {
                        if (a.path && g.trackingDelegate.onWriteToFile) g.trackingDelegate.onWriteToFile(a.path)
                    } catch (n) {
                        console.log("FS.trackingDelegate['onWriteToFile']('" + a.path + "') threw an exception: " + n.message)
                    }
                    return b
                },
                allocate: function(a, b, c) {
                    if (g.isClosed(a)) throw new g.ErrnoError(9);
                    if (0 > b || 0 >= c) throw new g.ErrnoError(22);
                    if (0 === (a.flags & 2097155)) throw new g.ErrnoError(9);
                    if (!g.isFile(a.node.mode) && !g.isDir(a.node.mode)) throw new g.ErrnoError(19);
                    if (!a.stream_ops.allocate) throw new g.ErrnoError(95);
                    a.stream_ops.allocate(a, b, c)
                },
                mmap: function(a, b, c, d, e, f, k) {
                    if (1 === (a.flags & 2097155)) throw new g.ErrnoError(13);
                    if (!a.stream_ops.mmap) throw new g.ErrnoError(19);
                    return a.stream_ops.mmap(a, b, c, d, e, f, k)
                },
                msync: function(a, b, c, d, e) {
                    return a && a.stream_ops.msync ? a.stream_ops.msync(a, b, c, d, e) : 0
                },
                munmap: function() {
                    return 0
                },
                ioctl: function(a, b, c) {
                    if (!a.stream_ops.ioctl) throw new g.ErrnoError(25);
                    return a.stream_ops.ioctl(a, b, c)
                },
                readFile: function(a, b) {
                    b = b || {};
                    b.flags = b.flags || "r";
                    b.encoding = b.encoding || "binary";
                    if ("utf8" !== b.encoding && "binary" !== b.encoding) throw Error('Invalid encoding type "' + b.encoding + '"');
                    var c, d = g.open(a, b.flags);
                    a = g.stat(a);
                    a = a.size;
                    var e = new Uint8Array(a);
                    g.read(d, e, 0, a, 0);
                    "utf8" === b.encoding ? c = eb(e, 0) : "binary" === b.encoding && (c = e);
                    g.close(d);
                    return c
                },
                writeFile: function(a, b, c) {
                    c = c || {};
                    c.flags = c.flags || "w";
                    a = g.open(a, c.flags, c.mode);
                    if ("string" === typeof b) {
                        var d = new Uint8Array(Ta(b) + 1);
                        b = la(b, d, 0, d.length);
                        g.write(a, d, 0, b, void 0, c.canOwn)
                    } else if (ArrayBuffer.isView(b)) g.write(a, b,
                        0, b.byteLength, void 0, c.canOwn);
                    else throw Error("Unsupported data type");
                    g.close(a)
                },
                cwd: function() {
                    return g.currentPath
                },
                chdir: function(a) {
                    a = g.lookupPath(a, {
                        follow: !0
                    });
                    if (null === a.node) throw new g.ErrnoError(2);
                    if (!g.isDir(a.node.mode)) throw new g.ErrnoError(20);
                    var b = g.nodePermissions(a.node, "x");
                    if (b) throw new g.ErrnoError(b);
                    g.currentPath = a.path
                },
                createDefaultDirectories: function() {
                    g.mkdir("/tmp");
                    g.mkdir("/home");
                    g.mkdir("/home/web_user")
                },
                createDefaultDevices: function() {
                    g.mkdir("/dev");
                    g.registerDevice(g.makedev(1,
                        3), {
                        read: function() {
                            return 0
                        },
                        write: function(d, e, f, k) {
                            return k
                        }
                    });
                    g.mkdev("/dev/null", g.makedev(1, 3));
                    Ja.register(g.makedev(5, 0), Ja.default_tty_ops);
                    Ja.register(g.makedev(6, 0), Ja.default_tty1_ops);
                    g.mkdev("/dev/tty", g.makedev(5, 0));
                    g.mkdev("/dev/tty1", g.makedev(6, 0));
                    if ("object" === typeof crypto && "function" === typeof crypto.getRandomValues) {
                        var a = new Uint8Array(1);
                        var b = function() {
                            crypto.getRandomValues(a);
                            return a[0]
                        }
                    } else if (Ea) try {
                        var c = require("crypto");
                        b = function() {
                            return c.randomBytes(1)[0]
                        }
                    } catch (d) {}
                    b ||
                        (b = function() {
                            K("random_device")
                        });
                    g.createDevice("/dev", "random", b);
                    g.createDevice("/dev", "urandom", b);
                    g.mkdir("/dev/shm");
                    g.mkdir("/dev/shm/tmp")
                },
                createSpecialDirectories: function() {
                    g.mkdir("/proc");
                    g.mkdir("/proc/self");
                    g.mkdir("/proc/self/fd");
                    g.mount({
                        mount: function() {
                            var a = g.createNode("/proc/self", "fd", 16895, 73);
                            a.node_ops = {
                                lookup: function(b, c) {
                                    b = +c;
                                    var d = g.getStream(b);
                                    if (!d) throw new g.ErrnoError(9);
                                    b = {
                                        parent: null,
                                        mount: {
                                            mountpoint: "fake"
                                        },
                                        node_ops: {
                                            readlink: function() {
                                                return d.path
                                            }
                                        }
                                    };
                                    return b.parent = b
                                }
                            };
                            return a
                        }
                    }, {}, "/proc/self/fd")
                },
                createStandardStreams: function() {
                    h.stdin ? g.createDevice("/dev", "stdin", h.stdin) : g.symlink("/dev/tty", "/dev/stdin");
                    h.stdout ? g.createDevice("/dev", "stdout", null, h.stdout) : g.symlink("/dev/tty", "/dev/stdout");
                    h.stderr ? g.createDevice("/dev", "stderr", null, h.stderr) : g.symlink("/dev/tty1", "/dev/stderr");
                    g.open("/dev/stdin", "r");
                    g.open("/dev/stdout", "w");
                    g.open("/dev/stderr", "w")
                },
                ensureErrnoError: function() {
                    g.ErrnoError || (g.ErrnoError = function(a, b) {
                        this.node =
                            b;
                        this.setErrno = function(c) {
                            this.errno = c
                        };
                        this.setErrno(a);
                        this.message = "FS error";
                        this.stack && Object.defineProperty(this, "stack", {
                            value: Error().stack,
                            writable: !0
                        })
                    }, g.ErrnoError.prototype = Error(), g.ErrnoError.prototype.constructor = g.ErrnoError, [2].forEach(function(a) {
                        g.genericErrors[a] = new g.ErrnoError(a);
                        g.genericErrors[a].stack = "<generic error, no stack>"
                    }))
                },
                staticInit: function() {
                    g.ensureErrnoError();
                    g.nameTable = Array(4096);
                    g.mount(H, {}, "/");
                    g.createDefaultDirectories();
                    g.createDefaultDevices();
                    g.createSpecialDirectories();
                    g.filesystems = {
                        MEMFS: H,
                        IDBFS: aa,
                        NODEFS: N,
                        WORKERFS: ha
                    }
                },
                init: function(a, b, c) {
                    g.init.initialized = !0;
                    g.ensureErrnoError();
                    h.stdin = a || h.stdin;
                    h.stdout = b || h.stdout;
                    h.stderr = c || h.stderr;
                    g.createStandardStreams()
                },
                quit: function() {
                    g.init.initialized = !1;
                    var a = h._fflush;
                    a && a(0);
                    for (a = 0; a < g.streams.length; a++) {
                        var b = g.streams[a];
                        b && g.close(b)
                    }
                },
                getMode: function(a, b) {
                    var c = 0;
                    a && (c |= 365);
                    b && (c |= 146);
                    return c
                },
                joinPath: function(a, b) {
                    a = F.join.apply(null, a);
                    b && "/" == a[0] && (a = a.substr(1));
                    return a
                },
                absolutePath: function(a, b) {
                    return F.resolve(b, a)
                },
                standardizePath: function(a) {
                    return F.normalize(a)
                },
                findObject: function(a, b) {
                    a = g.analyzePath(a, b);
                    if (a.exists) return a.object;
                    Ka(a.error);
                    return null
                },
                analyzePath: function(a, b) {
                    try {
                        var c = g.lookupPath(a, {
                            follow: !b
                        });
                        a = c.path
                    } catch (e) {}
                    var d = {
                        isRoot: !1,
                        exists: !1,
                        error: 0,
                        name: null,
                        path: null,
                        object: null,
                        parentExists: !1,
                        parentPath: null,
                        parentObject: null
                    };
                    try {
                        c = g.lookupPath(a, {
                                parent: !0
                            }), d.parentExists = !0, d.parentPath = c.path, d.parentObject = c.node,
                            d.name = F.basename(a), c = g.lookupPath(a, {
                                follow: !b
                            }), d.exists = !0, d.path = c.path, d.object = c.node, d.name = c.node.name, d.isRoot = "/" === c.path
                    } catch (e) {
                        d.error = e.errno
                    }
                    return d
                },
                createFolder: function(a, b, c, d) {
                    a = F.join2("string" === typeof a ? a : g.getPath(a), b);
                    c = g.getMode(c, d);
                    return g.mkdir(a, c)
                },
                createPath: function(a, b) {
                    a = "string" === typeof a ? a : g.getPath(a);
                    for (b = b.split("/").reverse(); b.length;) {
                        var c = b.pop();
                        if (c) {
                            var d = F.join2(a, c);
                            try {
                                g.mkdir(d)
                            } catch (e) {}
                            a = d
                        }
                    }
                    return d
                },
                createFile: function(a, b, c, d, e) {
                    a = F.join2("string" ===
                        typeof a ? a : g.getPath(a), b);
                    d = g.getMode(d, e);
                    return g.create(a, d)
                },
                createDataFile: function(a, b, c, d, e, f) {
                    a = b ? F.join2("string" === typeof a ? a : g.getPath(a), b) : a;
                    d = g.getMode(d, e);
                    e = g.create(a, d);
                    if (c) {
                        if ("string" === typeof c) {
                            a = Array(c.length);
                            b = 0;
                            for (var k = c.length; b < k; ++b) a[b] = c.charCodeAt(b);
                            c = a
                        }
                        g.chmod(e, d | 146);
                        a = g.open(e, "w");
                        g.write(a, c, 0, c.length, 0, f);
                        g.close(a);
                        g.chmod(e, d)
                    }
                    return e
                },
                createDevice: function(a, b, c, d) {
                    a = F.join2("string" === typeof a ? a : g.getPath(a), b);
                    b = g.getMode(!!c, !!d);
                    g.createDevice.major ||
                        (g.createDevice.major = 64);
                    var e = g.makedev(g.createDevice.major++, 0);
                    g.registerDevice(e, {
                        open: function(f) {
                            f.seekable = !1
                        },
                        close: function() {
                            d && d.buffer && d.buffer.length && d(10)
                        },
                        read: function(f, k, n, q) {
                            for (var r = 0, t = 0; t < q; t++) {
                                try {
                                    var w = c()
                                } catch (x) {
                                    throw new g.ErrnoError(5);
                                }
                                if (void 0 === w && 0 === r) throw new g.ErrnoError(11);
                                if (null === w || void 0 === w) break;
                                r++;
                                k[n + t] = w
                            }
                            r && (f.node.timestamp = Date.now());
                            return r
                        },
                        write: function(f, k, n, q) {
                            for (var r = 0; r < q; r++) try {
                                d(k[n + r])
                            } catch (t) {
                                throw new g.ErrnoError(5);
                            }
                            q &&
                                (f.node.timestamp = Date.now());
                            return r
                        }
                    });
                    return g.mkdev(a, b, e)
                },
                createLink: function(a, b, c) {
                    a = F.join2("string" === typeof a ? a : g.getPath(a), b);
                    return g.symlink(c, a)
                },
                forceLoadFile: function(a) {
                    if (a.isDevice || a.isFolder || a.link || a.contents) return !0;
                    var b = !0;
                    if ("undefined" !== typeof XMLHttpRequest) throw Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
                    if (h.read) try {
                        a.contents =
                            Ua(h.read(a.url), !0), a.usedBytes = a.contents.length
                    } catch (c) {
                        b = !1
                    } else throw Error("Cannot load without read() or XMLHttpRequest.");
                    b || Ka(5);
                    return b
                },
                createLazyFile: function(a, b, c, d, e) {
                    function f() {
                        this.lengthKnown = !1;
                        this.chunks = []
                    }
                    f.prototype.get = function(r) {
                        if (!(r > this.length - 1 || 0 > r)) {
                            var t = r % this.chunkSize;
                            r = r / this.chunkSize | 0;
                            return this.getter(r)[t]
                        }
                    };
                    f.prototype.setDataGetter = function(r) {
                        this.getter = r
                    };
                    f.prototype.cacheLength = function() {
                        var r = new XMLHttpRequest;
                        r.open("HEAD", c, !1);
                        r.send(null);
                        if (!(200 <= r.status && 300 > r.status || 304 === r.status)) throw Error("Couldn't load " + c + ". Status: " + r.status);
                        var t = Number(r.getResponseHeader("Content-length")),
                            w, x = (w = r.getResponseHeader("Accept-Ranges")) && "bytes" === w;
                        r = (w = r.getResponseHeader("Content-Encoding")) && "gzip" === w;
                        var u = 1048576;
                        x || (u = t);
                        var z = this;
                        z.setDataGetter(function(E) {
                            var L = E * u,
                                W = (E + 1) * u - 1;
                            W = Math.min(W, t - 1);
                            if ("undefined" === typeof z.chunks[E]) {
                                var pa = z.chunks;
                                if (L > W) throw Error("invalid range (" + L + ", " + W + ") or no bytes requested!");
                                if (W > t - 1) throw Error("only " + t + " bytes available! programmer error!");
                                var fa = new XMLHttpRequest;
                                fa.open("GET", c, !1);
                                t !== u && fa.setRequestHeader("Range", "bytes=" + L + "-" + W);
                                "undefined" != typeof Uint8Array && (fa.responseType = "arraybuffer");
                                fa.overrideMimeType && fa.overrideMimeType("text/plain; charset=x-user-defined");
                                fa.send(null);
                                if (!(200 <= fa.status && 300 > fa.status || 304 === fa.status)) throw Error("Couldn't load " + c + ". Status: " + fa.status);
                                L = void 0 !== fa.response ? new Uint8Array(fa.response || []) : Ua(fa.responseText ||
                                    "", !0);
                                pa[E] = L
                            }
                            if ("undefined" === typeof z.chunks[E]) throw Error("doXHR failed!");
                            return z.chunks[E]
                        });
                        if (r || !t) u = t = 1, u = t = this.getter(0).length, console.log("LazyFiles on gzip forces download of the whole file when length is accessed");
                        this._length = t;
                        this._chunkSize = u;
                        this.lengthKnown = !0
                    };
                    if ("undefined" !== typeof XMLHttpRequest) {
                        if (!sa) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                        var k = new f;
                        Object.defineProperties(k, {
                            length: {
                                get: function() {
                                    this.lengthKnown ||
                                        this.cacheLength();
                                    return this._length
                                }
                            },
                            chunkSize: {
                                get: function() {
                                    this.lengthKnown || this.cacheLength();
                                    return this._chunkSize
                                }
                            }
                        });
                        k = {
                            isDevice: !1,
                            contents: k
                        }
                    } else k = {
                        isDevice: !1,
                        url: c
                    };
                    var n = g.createFile(a, b, k, d, e);
                    k.contents ? n.contents = k.contents : k.url && (n.contents = null, n.url = k.url);
                    Object.defineProperties(n, {
                        usedBytes: {
                            get: function() {
                                return this.contents.length
                            }
                        }
                    });
                    var q = {};
                    a = Object.keys(n.stream_ops);
                    a.forEach(function(r) {
                        var t = n.stream_ops[r];
                        q[r] = function() {
                            if (!g.forceLoadFile(n)) throw new g.ErrnoError(5);
                            return t.apply(null, arguments)
                        }
                    });
                    q.read = function(r, t, w, x, u) {
                        if (!g.forceLoadFile(n)) throw new g.ErrnoError(5);
                        r = r.node.contents;
                        if (u >= r.length) return 0;
                        x = Math.min(r.length - u, x);
                        if (r.slice)
                            for (var z = 0; z < x; z++) t[w + z] = r[u + z];
                        else
                            for (z = 0; z < x; z++) t[w + z] = r.get(u + z);
                        return x
                    };
                    n.stream_ops = q;
                    return n
                },
                createPreloadedFile: function(a, b, c, d, e, f, k, n, q, r) {
                    function t(u) {
                        function z(L) {
                            r && r();
                            n || g.createDataFile(a, b, L, d, e, q);
                            f && f();
                            Pb(x)
                        }
                        var E = !1;
                        h.preloadPlugins.forEach(function(L) {
                            !E && L.canHandle(w) && (L.handle(u,
                                w, z,
                                function() {
                                    k && k();
                                    Pb(x)
                                }), E = !0)
                        });
                        E || z(u)
                    }
                    v.init();
                    var w = b ? F.resolve(F.join2(a, b)) : a,
                        x = "cp " + w;
                    gc(x);
                    "string" == typeof c ? v.asyncLoad(c, function(u) {
                        t(u)
                    }, k) : t(c)
                },
                indexedDB: function() {
                    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
                },
                DB_NAME: function() {
                    return "EM_FS_" + window.location.pathname
                },
                DB_VERSION: 20,
                DB_STORE_NAME: "FILE_DATA",
                saveFilesToDB: function(a, b, c) {
                    b = b || function() {};
                    c = c || function() {};
                    var d = g.indexedDB();
                    try {
                        var e = d.open(g.DB_NAME(), g.DB_VERSION)
                    } catch (f) {
                        return c(f)
                    }
                    e.onupgradeneeded =
                        function() {
                            console.log("creating db");
                            var f = e.result;
                            f.createObjectStore(g.DB_STORE_NAME)
                        };
                    e.onsuccess = function() {
                        var f = e.result;
                        f = f.transaction([g.DB_STORE_NAME], "readwrite");
                        var k = f.objectStore(g.DB_STORE_NAME),
                            n = 0,
                            q = 0,
                            r = a.length;
                        a.forEach(function(t) {
                            t = k.put(g.analyzePath(t).object.contents, t);
                            t.onsuccess = function() {
                                n++;
                                n + q == r && (0 == q ? b() : c())
                            };
                            t.onerror = function() {
                                q++;
                                n + q == r && (0 == q ? b() : c())
                            }
                        });
                        f.onerror = c
                    };
                    e.onerror = c
                },
                loadFilesFromDB: function(a, b, c) {
                    b = b || function() {};
                    c = c || function() {};
                    var d = g.indexedDB();
                    try {
                        var e = d.open(g.DB_NAME(), g.DB_VERSION)
                    } catch (f) {
                        return c(f)
                    }
                    e.onupgradeneeded = c;
                    e.onsuccess = function() {
                        var f = e.result;
                        try {
                            var k = f.transaction([g.DB_STORE_NAME], "readonly")
                        } catch (w) {
                            c(w);
                            return
                        }
                        var n = k.objectStore(g.DB_STORE_NAME),
                            q = 0,
                            r = 0,
                            t = a.length;
                        a.forEach(function(w) {
                            var x = n.get(w);
                            x.onsuccess = function() {
                                g.analyzePath(w).exists && g.unlink(w);
                                g.createDataFile(F.dirname(w), F.basename(w), x.result, !0, !0, !0);
                                q++;
                                q + r == t && (0 == r ? b() : c())
                            };
                            x.onerror = function() {
                                r++;
                                q + r == t && (0 == r ? b() : c())
                            }
                        });
                        k.onerror =
                            c
                    };
                    e.onerror = c
                }
            },
            Z = {
                EPERM: 1,
                ENOENT: 2,
                ESRCH: 3,
                EINTR: 4,
                EIO: 5,
                ENXIO: 6,
                E2BIG: 7,
                ENOEXEC: 8,
                EBADF: 9,
                ECHILD: 10,
                EAGAIN: 11,
                EWOULDBLOCK: 11,
                ENOMEM: 12,
                EACCES: 13,
                EFAULT: 14,
                ENOTBLK: 15,
                EBUSY: 16,
                EEXIST: 17,
                EXDEV: 18,
                ENODEV: 19,
                ENOTDIR: 20,
                EISDIR: 21,
                EINVAL: 22,
                ENFILE: 23,
                EMFILE: 24,
                ENOTTY: 25,
                ETXTBSY: 26,
                EFBIG: 27,
                ENOSPC: 28,
                ESPIPE: 29,
                EROFS: 30,
                EMLINK: 31,
                EPIPE: 32,
                EDOM: 33,
                ERANGE: 34,
                ENOMSG: 42,
                EIDRM: 43,
                ECHRNG: 44,
                EL2NSYNC: 45,
                EL3HLT: 46,
                EL3RST: 47,
                ELNRNG: 48,
                EUNATCH: 49,
                ENOCSI: 50,
                EL2HLT: 51,
                EDEADLK: 35,
                ENOLCK: 37,
                EBADE: 52,
                EBADR: 53,
                EXFULL: 54,
                ENOANO: 55,
                EBADRQC: 56,
                EBADSLT: 57,
                EDEADLOCK: 35,
                EBFONT: 59,
                ENOSTR: 60,
                ENODATA: 61,
                ETIME: 62,
                ENOSR: 63,
                ENONET: 64,
                ENOPKG: 65,
                EREMOTE: 66,
                ENOLINK: 67,
                EADV: 68,
                ESRMNT: 69,
                ECOMM: 70,
                EPROTO: 71,
                EMULTIHOP: 72,
                EDOTDOT: 73,
                EBADMSG: 74,
                ENOTUNIQ: 76,
                EBADFD: 77,
                EREMCHG: 78,
                ELIBACC: 79,
                ELIBBAD: 80,
                ELIBSCN: 81,
                ELIBMAX: 82,
                ELIBEXEC: 83,
                ENOSYS: 38,
                ENOTEMPTY: 39,
                ENAMETOOLONG: 36,
                ELOOP: 40,
                EOPNOTSUPP: 95,
                EPFNOSUPPORT: 96,
                ECONNRESET: 104,
                ENOBUFS: 105,
                EAFNOSUPPORT: 97,
                EPROTOTYPE: 91,
                ENOTSOCK: 88,
                ENOPROTOOPT: 92,
                ESHUTDOWN: 108,
                ECONNREFUSED: 111,
                EADDRINUSE: 98,
                ECONNABORTED: 103,
                ENETUNREACH: 101,
                ENETDOWN: 100,
                ETIMEDOUT: 110,
                EHOSTDOWN: 112,
                EHOSTUNREACH: 113,
                EINPROGRESS: 115,
                EALREADY: 114,
                EDESTADDRREQ: 89,
                EMSGSIZE: 90,
                EPROTONOSUPPORT: 93,
                ESOCKTNOSUPPORT: 94,
                EADDRNOTAVAIL: 99,
                ENETRESET: 102,
                EISCONN: 106,
                ENOTCONN: 107,
                ETOOMANYREFS: 109,
                EUSERS: 87,
                EDQUOT: 122,
                ESTALE: 116,
                ENOTSUP: 95,
                ENOMEDIUM: 123,
                EILSEQ: 84,
                EOVERFLOW: 75,
                ECANCELED: 125,
                ENOTRECOVERABLE: 131,
                EOWNERDEAD: 130,
                ESTRPIPE: 86
            },
            B = {
                DEFAULT_POLLMASK: 5,
                mappings: {},
                umask: 511,
                calculateAt: function(a, b) {
                    if ("/" !== b[0]) {
                        if (-100 === a) a = g.cwd();
                        else {
                            a = g.getStream(a);
                            if (!a) throw new g.ErrnoError(Z.EBADF);
                            a = a.path
                        }
                        b = F.join2(a, b)
                    }
                    return b
                },
                doStat: function(a, b, c) {
                    try {
                        var d = a(b)
                    } catch (e) {
                        if (e && e.node && F.normalize(b) !== F.normalize(g.getPath(e.node))) return -Z.ENOTDIR;
                        throw e;
                    }
                    p[c >> 2] = d.dev;
                    p[c + 4 >> 2] = 0;
                    p[c + 8 >> 2] = d.ino;
                    p[c + 12 >> 2] = d.mode;
                    p[c + 16 >> 2] = d.nlink;
                    p[c + 20 >> 2] = d.uid;
                    p[c + 24 >> 2] = d.gid;
                    p[c + 28 >> 2] = d.rdev;
                    p[c + 32 >> 2] = 0;
                    tempI64 = [d.size >>> 0, (tempDouble = d.size, 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble -
                        +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)];
                    p[c + 40 >> 2] = tempI64[0];
                    p[c + 44 >> 2] = tempI64[1];
                    p[c + 48 >> 2] = 4096;
                    p[c + 52 >> 2] = d.blocks;
                    p[c + 56 >> 2] = d.atime.getTime() / 1E3 | 0;
                    p[c + 60 >> 2] = 0;
                    p[c + 64 >> 2] = d.mtime.getTime() / 1E3 | 0;
                    p[c + 68 >> 2] = 0;
                    p[c + 72 >> 2] = d.ctime.getTime() / 1E3 | 0;
                    p[c + 76 >> 2] = 0;
                    tempI64 = [d.ino >>> 0, (tempDouble = d.ino, 1 <= +za(tempDouble) ? 0 < tempDouble ? (Aa(+Ba(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ca((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)];
                    p[c + 80 >> 2] = tempI64[0];
                    p[c + 84 >> 2] = tempI64[1];
                    return 0
                },
                doMsync: function(a,
                    b, c, d) {
                    a = new Uint8Array(G.subarray(a, a + c));
                    g.msync(b, a, 0, c, d)
                },
                doMkdir: function(a, b) {
                    a = F.normalize(a);
                    "/" === a[a.length - 1] && (a = a.substr(0, a.length - 1));
                    g.mkdir(a, b, 0);
                    return 0
                },
                doMknod: function(a, b, c) {
                    switch (b & 61440) {
                        case 32768:
                        case 8192:
                        case 24576:
                        case 4096:
                        case 49152:
                            break;
                        default:
                            return -Z.EINVAL
                    }
                    g.mknod(a, b, c);
                    return 0
                },
                doReadlink: function(a, b, c) {
                    if (0 >= c) return -Z.EINVAL;
                    a = g.readlink(a);
                    var d = Math.min(c, Ta(a)),
                        e = X[b + d];
                    la(a, G, b, c + 1);
                    X[b + d] = e;
                    return d
                },
                doAccess: function(a, b) {
                    if (b & -8) return -Z.EINVAL;
                    a = g.lookupPath(a, {
                        follow: !0
                    });
                    a = a.node;
                    var c = "";
                    b & 4 && (c += "r");
                    b & 2 && (c += "w");
                    b & 1 && (c += "x");
                    return c && g.nodePermissions(a, c) ? -Z.EACCES : 0
                },
                doDup: function(a, b, c) {
                    var d = g.getStream(c);
                    d && g.close(d);
                    return g.open(a, b, 0, c, c).fd
                },
                doReadv: function(a, b, c, d) {
                    for (var e = 0, f = 0; f < c; f++) {
                        var k = p[b + 8 * f >> 2],
                            n = p[b + (8 * f + 4) >> 2];
                        k = g.read(a, X, k, n, d);
                        if (0 > k) return -1;
                        e += k;
                        if (k < n) break
                    }
                    return e
                },
                doWritev: function(a, b, c, d) {
                    for (var e = 0, f = 0; f < c; f++) {
                        var k = p[b + 8 * f >> 2],
                            n = p[b + (8 * f + 4) >> 2];
                        k = g.write(a, X, k, n, d);
                        if (0 > k) return -1;
                        e +=
                            k
                    }
                    return e
                },
                varargs: 0,
                get: function() {
                    B.varargs += 4;
                    var a = p[B.varargs - 4 >> 2];
                    return a
                },
                getStr: function() {
                    var a = ea(B.get());
                    return a
                },
                getStreamFromFD: function() {
                    var a = g.getStream(B.get());
                    if (!a) throw new g.ErrnoError(Z.EBADF);
                    return a
                },
                getSocketFromFD: function() {
                    var a = SOCKFS.getSocket(B.get());
                    if (!a) throw new g.ErrnoError(Z.EBADF);
                    return a
                },
                getSocketAddress: function(a) {
                    var b = B.get(),
                        c = B.get();
                    if (a && 0 === b) return null;
                    a = __read_sockaddr(b, c);
                    if (a.errno) throw new g.ErrnoError(a.errno);
                    a.addr = DNS.lookup_addr(a.addr) ||
                        a.addr;
                    return a
                },
                get64: function() {
                    var a = B.get();
                    B.get();
                    return a
                },
                getZero: function() {
                    B.get()
                }
            },
            $b = [],
            ma = [{}, {
                value: void 0
            }, {
                value: null
            }, {
                value: !0
            }, {
                value: !1
            }],
            Hc = void 0,
            Ic = void 0,
            mb = [],
            nb = void 0,
            Ga = {},
            ab = void 0,
            Sa = {},
            Gb = {},
            bb = {},
            Lb = {},
            Gc = void 0,
            Cc = {},
            Dc = void 0,
            mk = {},
            Fb = [],
            wc = {},
            v = {
                mainLoop: {
                    scheduler: null,
                    method: "",
                    currentlyRunningMainloop: 0,
                    func: null,
                    arg: 0,
                    timingMode: 0,
                    timingValue: 0,
                    currentFrameNumber: 0,
                    queue: [],
                    pause: function() {
                        v.mainLoop.scheduler = null;
                        v.mainLoop.currentlyRunningMainloop++
                    },
                    resume: function() {
                        v.mainLoop.currentlyRunningMainloop++;
                        var a = v.mainLoop.timingMode,
                            b = v.mainLoop.timingValue,
                            c = v.mainLoop.func;
                        v.mainLoop.func = null;
                        Sj(c, 0, !1, v.mainLoop.arg, !0);
                        Vb(a, b);
                        v.mainLoop.scheduler()
                    },
                    updateStatus: function() {
                        if (h.setStatus) {
                            var a = h.statusMessage || "Please wait...",
                                b = v.mainLoop.remainingBlockers,
                                c = v.mainLoop.expectedBlockers;
                            b ? b < c ? h.setStatus(a + " (" + (c - b) + "/" + c + ")") : h.setStatus(a) : h.setStatus("")
                        }
                    },
                    runIter: function(a) {
                        if (!xa) {
                            if (h.preMainLoop) {
                                var b = h.preMainLoop();
                                if (!1 === b) return
                            }
                            try {
                                a()
                            } catch (c) {
                                if (c instanceof wa) return;
                                c && "object" ===
                                    typeof c && c.stack && ca("exception thrown: " + [c, c.stack]);
                                throw c;
                            }
                            h.postMainLoop && h.postMainLoop()
                        }
                    }
                },
                isFullscreen: !1,
                pointerLock: !1,
                moduleContextCreatedCallbacks: [],
                workers: [],
                init: function() {
                    function a() {
                        v.pointerLock = document.pointerLockElement === h.canvas || document.mozPointerLockElement === h.canvas || document.webkitPointerLockElement === h.canvas || document.msPointerLockElement === h.canvas
                    }
                    h.preloadPlugins || (h.preloadPlugins = []);
                    if (!v.initted) {
                        v.initted = !0;
                        try {
                            v.hasBlobConstructor = !0
                        } catch (c) {
                            v.hasBlobConstructor = !1, console.log("warning: no blob constructor, cannot create blobs with mimetypes")
                        }
                        v.BlobBuilder = "undefined" != typeof MozBlobBuilder ? MozBlobBuilder : "undefined" != typeof WebKitBlobBuilder ? WebKitBlobBuilder : v.hasBlobConstructor ? null : console.log("warning: no BlobBuilder");
                        v.URLObject = "undefined" != typeof window ? window.URL ? window.URL : window.webkitURL : void 0;
                        h.noImageDecoding || "undefined" !== typeof v.URLObject || (console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available."),
                            h.noImageDecoding = !0);
                        var b = {
                            canHandle: function(c) {
                                return !h.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(c)
                            },
                            handle: function(c, d, e, f) {
                                var k = null;
                                if (v.hasBlobConstructor) try {
                                    k = new Blob([c], {
                                        type: v.getMimetype(d)
                                    }), k.size !== c.length && (k = new Blob([(new Uint8Array(c)).buffer], {
                                        type: v.getMimetype(d)
                                    }))
                                } catch (r) {
                                    qb("Blob constructor present but fails: " + r + "; falling back to blob builder")
                                }
                                k || (k = new v.BlobBuilder, k.append((new Uint8Array(c)).buffer), k = k.getBlob());
                                var n = v.URLObject.createObjectURL(k),
                                    q = new Image;
                                q.onload = function() {
                                    ja(q.complete, "Image " + d + " could not be decoded");
                                    var r = document.createElement("canvas");
                                    r.width = q.width;
                                    r.height = q.height;
                                    var t = r.getContext("2d");
                                    t.drawImage(q, 0, 0);
                                    h.preloadedImages[d] = r;
                                    v.URLObject.revokeObjectURL(n);
                                    e && e(c)
                                };
                                q.onerror = function() {
                                    console.log("Image " + n + " could not be decoded");
                                    f && f()
                                };
                                q.src = n
                            }
                        };
                        h.preloadPlugins.push(b);
                        b = {
                            canHandle: function(c) {
                                return !h.noAudioDecoding && c.substr(-4) in {
                                    ".ogg": 1,
                                    ".wav": 1,
                                    ".mp3": 1
                                }
                            },
                            handle: function(c, d, e, f) {
                                function k(w) {
                                    q ||
                                        (q = !0, h.preloadedAudios[d] = w, e && e(c))
                                }

                                function n() {
                                    q || (q = !0, h.preloadedAudios[d] = new Audio, f && f())
                                }
                                var q = !1;
                                if (v.hasBlobConstructor) {
                                    try {
                                        var r = new Blob([c], {
                                            type: v.getMimetype(d)
                                        })
                                    } catch (w) {
                                        return n()
                                    }
                                    r = v.URLObject.createObjectURL(r);
                                    var t = new Audio;
                                    t.addEventListener("canplaythrough", function() {
                                        k(t)
                                    }, !1);
                                    t.onerror = function() {
                                        if (!q) {
                                            console.log("warning: browser could not fully decode audio " + d + ", trying slower base64 approach");
                                            var w = "data:audio/x-" + d.substr(-3) + ";base64,";
                                            var x = "";
                                            for (var u = 0, z =
                                                    0, E = 0; E < c.length; E++)
                                                for (u = u << 8 | c[E], z += 8; 6 <= z;) {
                                                    var L = u >> z - 6 & 63;
                                                    z -= 6;
                                                    x += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [L]
                                                }
                                            2 == z ? (x += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [(u & 3) << 4], x += "==") : 4 == z && (x += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [(u & 15) << 2], x += "=");
                                            t.src = w + x;
                                            k(t)
                                        }
                                    };
                                    t.src = r;
                                    v.safeSetTimeout(function() {
                                        k(t)
                                    }, 1E4)
                                } else return n()
                            }
                        };
                        h.preloadPlugins.push(b);
                        if (b = h.canvas) b.requestPointerLock = b.requestPointerLock || b.mozRequestPointerLock ||
                            b.webkitRequestPointerLock || b.msRequestPointerLock || function() {}, b.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || function() {}, b.exitPointerLock = b.exitPointerLock.bind(document), document.addEventListener("pointerlockchange", a, !1), document.addEventListener("mozpointerlockchange", a, !1), document.addEventListener("webkitpointerlockchange", a, !1), document.addEventListener("mspointerlockchange", a, !1), h.elementPointerLock &&
                            b.addEventListener("click", function(c) {
                                !v.pointerLock && h.canvas.requestPointerLock && (h.canvas.requestPointerLock(), c.preventDefault())
                            }, !1)
                    }
                },
                createContext: function(a, b, c, d) {
                    if (b && h.ctx && a == h.canvas) return h.ctx;
                    var e;
                    if (b) {
                        var f = {
                            antialias: !1,
                            alpha: !1,
                            majorVersion: "undefined" !== typeof WebGL2RenderingContext ? 2 : 1
                        };
                        if (d)
                            for (var k in d) f[k] = d[k];
                        if ("undefined" !== typeof l && (e = l.createContext(a, f))) var n = l.getContext(e).GLctx
                    } else n = a.getContext("2d");
                    if (!n) return null;
                    c && (b || ja("undefined" === typeof m,
                        "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"), h.ctx = n, b && l.makeContextCurrent(e), h.useWebGL = b, v.moduleContextCreatedCallbacks.forEach(function(q) {
                        q()
                    }), v.init());
                    return n
                },
                destroyContext: function() {},
                fullscreenHandlersInstalled: !1,
                lockPointer: void 0,
                resizeCanvas: void 0,
                requestFullscreen: function(a, b, c) {
                    function d() {
                        v.isFullscreen = !1;
                        var k = e.parentNode;
                        (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement ||
                            document.webkitCurrentFullScreenElement) === k ? (e.exitFullscreen = v.exitFullscreen, v.lockPointer && e.requestPointerLock(), v.isFullscreen = !0, v.resizeCanvas ? v.setFullscreenCanvasSize() : v.updateCanvasDimensions(e)) : (k.parentNode.insertBefore(e, k), k.parentNode.removeChild(k), v.resizeCanvas ? v.setWindowedCanvasSize() : v.updateCanvasDimensions(e));
                        if (h.onFullScreen) h.onFullScreen(v.isFullscreen);
                        if (h.onFullscreen) h.onFullscreen(v.isFullscreen)
                    }
                    v.lockPointer = a;
                    v.resizeCanvas = b;
                    v.vrDevice = c;
                    "undefined" === typeof v.lockPointer &&
                        (v.lockPointer = !0);
                    "undefined" === typeof v.resizeCanvas && (v.resizeCanvas = !1);
                    "undefined" === typeof v.vrDevice && (v.vrDevice = null);
                    var e = h.canvas;
                    v.fullscreenHandlersInstalled || (v.fullscreenHandlersInstalled = !0, document.addEventListener("fullscreenchange", d, !1), document.addEventListener("mozfullscreenchange", d, !1), document.addEventListener("webkitfullscreenchange", d, !1), document.addEventListener("MSFullscreenChange", d, !1));
                    var f = document.createElement("div");
                    e.parentNode.insertBefore(f, e);
                    f.appendChild(e);
                    f.requestFullscreen = f.requestFullscreen || f.mozRequestFullScreen || f.msRequestFullscreen || (f.webkitRequestFullscreen ? function() {
                        f.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
                    } : null) || (f.webkitRequestFullScreen ? function() {
                        f.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
                    } : null);
                    c ? f.requestFullscreen({
                        vrDisplay: c
                    }) : f.requestFullscreen()
                },
                requestFullScreen: function(a, b, c) {
                    ca("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
                    v.requestFullScreen =
                        function(d, e, f) {
                            return v.requestFullscreen(d, e, f)
                        };
                    return v.requestFullscreen(a, b, c)
                },
                exitFullscreen: function() {
                    if (!v.isFullscreen) return !1;
                    var a = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen || document.webkitCancelFullScreen || function() {};
                    a.apply(document, []);
                    return !0
                },
                nextRAF: 0,
                fakeRequestAnimationFrame: function(a) {
                    var b = Date.now();
                    if (0 === v.nextRAF) v.nextRAF = b + 1E3 / 60;
                    else
                        for (; b + 2 >= v.nextRAF;) v.nextRAF += 1E3 / 60;
                    b = Math.max(v.nextRAF - b, 0);
                    setTimeout(a, b)
                },
                requestAnimationFrame: function(a) {
                    "undefined" === typeof window ? v.fakeRequestAnimationFrame(a) : (window.requestAnimationFrame || (window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || v.fakeRequestAnimationFrame), window.requestAnimationFrame(a))
                },
                safeCallback: function(a) {
                    return function() {
                        if (!xa) return a.apply(null, arguments)
                    }
                },
                allowAsyncCallbacks: !0,
                queuedAsyncCallbacks: [],
                pauseAsyncCallbacks: function() {
                    v.allowAsyncCallbacks = !1
                },
                resumeAsyncCallbacks: function() {
                    v.allowAsyncCallbacks = !0;
                    if (0 < v.queuedAsyncCallbacks.length) {
                        var a = v.queuedAsyncCallbacks;
                        v.queuedAsyncCallbacks = [];
                        a.forEach(function(b) {
                            b()
                        })
                    }
                },
                safeRequestAnimationFrame: function(a) {
                    return v.requestAnimationFrame(function() {
                        xa || (v.allowAsyncCallbacks ? a() : v.queuedAsyncCallbacks.push(a))
                    })
                },
                safeSetTimeout: function(a, b) {
                    h.noExitRuntime = !0;
                    return setTimeout(function() {
                        xa || (v.allowAsyncCallbacks ?
                            a() : v.queuedAsyncCallbacks.push(a))
                    }, b)
                },
                safeSetInterval: function(a, b) {
                    h.noExitRuntime = !0;
                    return setInterval(function() {
                        xa || v.allowAsyncCallbacks && a()
                    }, b)
                },
                getMimetype: function(a) {
                    return {
                        jpg: "image/jpeg",
                        jpeg: "image/jpeg",
                        png: "image/png",
                        bmp: "image/bmp",
                        ogg: "audio/ogg",
                        wav: "audio/wav",
                        mp3: "audio/mpeg"
                    }[a.substr(a.lastIndexOf(".") + 1)]
                },
                getUserMedia: function(a) {
                    window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia);
                    window.getUserMedia(a)
                },
                getMovementX: function(a) {
                    return a.movementX ||
                        a.mozMovementX || a.webkitMovementX || 0
                },
                getMovementY: function(a) {
                    return a.movementY || a.mozMovementY || a.webkitMovementY || 0
                },
                getMouseWheelDelta: function(a) {
                    switch (a.type) {
                        case "DOMMouseScroll":
                            var b = a.detail / 3;
                            break;
                        case "mousewheel":
                            b = a.wheelDelta / 120;
                            break;
                        case "wheel":
                            b = a.deltaY;
                            switch (a.deltaMode) {
                                case 0:
                                    b /= 100;
                                    break;
                                case 1:
                                    b /= 3;
                                    break;
                                case 2:
                                    b *= 80;
                                    break;
                                default:
                                    throw "unrecognized mouse wheel delta mode: " + a.deltaMode;
                            }
                            break;
                        default:
                            throw "unrecognized mouse wheel event: " + a.type;
                    }
                    return b
                },
                mouseX: 0,
                mouseY: 0,
                mouseMovementX: 0,
                mouseMovementY: 0,
                touches: {},
                lastTouches: {},
                calculateMouseEvent: function(a) {
                    if (v.pointerLock) "mousemove" != a.type && "mozMovementX" in a ? v.mouseMovementX = v.mouseMovementY = 0 : (v.mouseMovementX = v.getMovementX(a), v.mouseMovementY = v.getMovementY(a)), "undefined" != typeof SDL ? (v.mouseX = SDL.mouseX + v.mouseMovementX, v.mouseY = SDL.mouseY + v.mouseMovementY) : (v.mouseX += v.mouseMovementX, v.mouseY += v.mouseMovementY);
                    else {
                        var b = h.canvas.getBoundingClientRect(),
                            c = h.canvas.width,
                            d = h.canvas.height,
                            e = "undefined" !== typeof window.scrollX ? window.scrollX : window.pageXOffset,
                            f = "undefined" !== typeof window.scrollY ? window.scrollY : window.pageYOffset;
                        if ("touchstart" === a.type || "touchend" === a.type || "touchmove" === a.type) {
                            var k = a.touch;
                            if (void 0 !== k)
                                if (e = k.pageX - (e + b.left), f = k.pageY - (f + b.top), e *= c / b.width, f *= d / b.height, b = {
                                        x: e,
                                        y: f
                                    }, "touchstart" === a.type) v.lastTouches[k.identifier] = b, v.touches[k.identifier] = b;
                                else if ("touchend" === a.type || "touchmove" === a.type)(a = v.touches[k.identifier]) || (a = b), v.lastTouches[k.identifier] =
                                a, v.touches[k.identifier] = b
                        } else k = a.pageX - (e + b.left), a = a.pageY - (f + b.top), k *= c / b.width, a *= d / b.height, v.mouseMovementX = k - v.mouseX, v.mouseMovementY = a - v.mouseY, v.mouseX = k, v.mouseY = a
                    }
                },
                asyncLoad: function(a, b, c, d) {
                    var e = d ? "" : "al " + a;
                    h.readAsync(a, function(f) {
                        ja(f, 'Loading data file "' + a + '" failed (no arrayBuffer).');
                        b(new Uint8Array(f));
                        e && Pb(e)
                    }, function() {
                        if (c) c();
                        else throw 'Loading data file "' + a + '" failed.';
                    });
                    e && gc(e)
                },
                resizeListeners: [],
                updateResizeListeners: function() {
                    var a = h.canvas;
                    v.resizeListeners.forEach(function(b) {
                        b(a.width,
                            a.height)
                    })
                },
                setCanvasSize: function(a, b, c) {
                    var d = h.canvas;
                    v.updateCanvasDimensions(d, a, b);
                    c || v.updateResizeListeners()
                },
                windowedWidth: 0,
                windowedHeight: 0,
                setFullscreenCanvasSize: function() {
                    if ("undefined" != typeof SDL) {
                        var a = R[SDL.screen >> 2];
                        a |= 8388608;
                        p[SDL.screen >> 2] = a
                    }
                    v.updateCanvasDimensions(h.canvas);
                    v.updateResizeListeners()
                },
                setWindowedCanvasSize: function() {
                    if ("undefined" != typeof SDL) {
                        var a = R[SDL.screen >> 2];
                        a &= -8388609;
                        p[SDL.screen >> 2] = a
                    }
                    v.updateCanvasDimensions(h.canvas);
                    v.updateResizeListeners()
                },
                updateCanvasDimensions: function(a, b, c) {
                    b && c ? (a.widthNative = b, a.heightNative = c) : (b = a.widthNative, c = a.heightNative);
                    var d = b,
                        e = c;
                    h.forcedAspectRatio && 0 < h.forcedAspectRatio && (d / e < h.forcedAspectRatio ? d = Math.round(e * h.forcedAspectRatio) : e = Math.round(d / h.forcedAspectRatio));
                    if ((document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === a.parentNode && "undefined" != typeof screen) {
                        var f = Math.min(screen.width /
                            d, screen.height / e);
                        d = Math.round(d * f);
                        e = Math.round(e * f)
                    }
                    v.resizeCanvas ? (a.width != d && (a.width = d), a.height != e && (a.height = e), "undefined" != typeof a.style && (a.style.removeProperty("width"), a.style.removeProperty("height"))) : (a.width != b && (a.width = b), a.height != c && (a.height = c), "undefined" != typeof a.style && (d != b || e != c ? (a.style.setProperty("width", d + "px", "important"), a.style.setProperty("height", e + "px", "important")) : (a.style.removeProperty("width"), a.style.removeProperty("height"))))
                },
                wgetRequests: {},
                nextWgetRequestHandle: 0,
                getNextWgetRequestHandle: function() {
                    var a = v.nextWgetRequestHandle;
                    v.nextWgetRequestHandle++;
                    return a
                }
            },
            C = {
                errorCode: 12288,
                defaultDisplayInitialized: !1,
                currentContext: 0,
                currentReadSurface: 0,
                currentDrawSurface: 0,
                contextAttributes: {
                    alpha: !1,
                    depth: !1,
                    stencil: !1,
                    antialias: !1
                },
                stringCache: {},
                setErrorCode: function(a) {
                    C.errorCode = a
                },
                chooseConfig: function(a, b, c, d, e) {
                    if (62E3 != a) return C.setErrorCode(12296), 0;
                    if (b)
                        for (;;) {
                            a = p[b >> 2];
                            if (12321 == a) a = p[b + 4 >> 2], C.contextAttributes.alpha = 0 < a;
                            else if (12325 == a) a = p[b +
                                4 >> 2], C.contextAttributes.depth = 0 < a;
                            else if (12326 == a) a = p[b + 4 >> 2], C.contextAttributes.stencil = 0 < a;
                            else if (12337 == a) a = p[b + 4 >> 2], C.contextAttributes.antialias = 0 < a;
                            else if (12338 == a) a = p[b + 4 >> 2], C.contextAttributes.antialias = 1 == a;
                            else if (12544 == a) a = p[b + 4 >> 2], C.contextAttributes.lowLatency = 12547 != a;
                            else if (12344 == a) break;
                            b += 8
                        }
                    if (!(c && d || e)) return C.setErrorCode(12300), 0;
                    e && (p[e >> 2] = 1);
                    c && 0 < d && (p[c >> 2] = 62002);
                    C.setErrorCode(12288);
                    return 1
                }
            },
            l = {
                counter: 1,
                lastError: 0,
                buffers: [],
                mappedBuffers: {},
                programs: [],
                framebuffers: [],
                renderbuffers: [],
                textures: [],
                uniforms: [],
                shaders: [],
                vaos: [],
                contexts: {},
                currentContext: null,
                offscreenCanvases: {},
                timerQueriesEXT: [],
                queries: [],
                samplers: [],
                transformFeedbacks: [],
                syncs: [],
                programInfos: {},
                stringCache: {},
                stringiCache: {},
                unpackAlignment: 4,
                init: function() {
                    l.miniTempBuffer = new Float32Array(l.MINI_TEMP_BUFFER_SIZE);
                    for (var a = 0; a < l.MINI_TEMP_BUFFER_SIZE; a++) l.miniTempBufferViews[a] = l.miniTempBuffer.subarray(0, a + 1)
                },
                recordError: function(a) {
                    l.lastError || (l.lastError = a)
                },
                getNewId: function(a) {
                    for (var b =
                            l.counter++, c = a.length; c < b; c++) a[c] = null;
                    return b
                },
                MINI_TEMP_BUFFER_SIZE: 256,
                miniTempBuffer: null,
                miniTempBufferViews: [0],
                getSource: function(a, b, c, d) {
                    a = "";
                    for (var e = 0; e < b; ++e) {
                        var f = d ? p[d + 4 * e >> 2] : -1;
                        a += ea(p[c + 4 * e >> 2], 0 > f ? void 0 : f)
                    }
                    return a
                },
                createContext: function(a, b) {
                    return (a = 1 < b.majorVersion ? a.getContext("webgl2", b) : a.getContext("webgl", b) || a.getContext("experimental-webgl", b)) && l.registerContext(a, b)
                },
                registerContext: function(a, b) {
                    function c() {
                        var f = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
                        return f ? parseInt(f[2], 10) : !1
                    }
                    var d = ta(8),
                        e = {
                            handle: d,
                            attributes: b,
                            version: b.majorVersion,
                            GLctx: a
                        };
                    e.supportsWebGL2EntryPoints = 2 <= e.version && (!1 === c() || 58 <= c());
                    a.canvas && (a.canvas.GLctxObject = e);
                    l.contexts[d] = e;
                    ("undefined" === typeof b.enableExtensionsByDefault || b.enableExtensionsByDefault) && l.initExtensions(e);
                    return d
                },
                makeContextCurrent: function(a) {
                    l.currentContext = l.contexts[a];
                    h.ctx = m = l.currentContext && l.currentContext.GLctx;
                    return !(a && !m)
                },
                getContext: function(a) {
                    return l.contexts[a]
                },
                deleteContext: function(a) {
                    l.currentContext ===
                        l.contexts[a] && (l.currentContext = null);
                    "object" === typeof JSEvents && JSEvents.removeAllHandlersOnTarget(l.contexts[a].GLctx.canvas);
                    l.contexts[a] && l.contexts[a].GLctx.canvas && (l.contexts[a].GLctx.canvas.GLctxObject = void 0);
                    qa(l.contexts[a]);
                    l.contexts[a] = null
                },
                initExtensions: function(a) {
                    a || (a = l.currentContext);
                    if (!a.initExtensionsDone) {
                        a.initExtensionsDone = !0;
                        var b = a.GLctx;
                        if (2 > a.version) {
                            var c = b.getExtension("ANGLE_instanced_arrays");
                            c && (b.vertexAttribDivisor = function(k, n) {
                                c.vertexAttribDivisorANGLE(k,
                                    n)
                            }, b.drawArraysInstanced = function(k, n, q, r) {
                                c.drawArraysInstancedANGLE(k, n, q, r)
                            }, b.drawElementsInstanced = function(k, n, q, r, t) {
                                c.drawElementsInstancedANGLE(k, n, q, r, t)
                            });
                            var d = b.getExtension("OES_vertex_array_object");
                            d && (b.createVertexArray = function() {
                                return d.createVertexArrayOES()
                            }, b.deleteVertexArray = function(k) {
                                d.deleteVertexArrayOES(k)
                            }, b.bindVertexArray = function(k) {
                                d.bindVertexArrayOES(k)
                            }, b.isVertexArray = function(k) {
                                return d.isVertexArrayOES(k)
                            });
                            var e = b.getExtension("WEBGL_draw_buffers");
                            e &&
                                (b.drawBuffers = function(k, n) {
                                    e.drawBuffersWEBGL(k, n)
                                })
                        }
                        b.disjointTimerQueryExt = b.getExtension("EXT_disjoint_timer_query");
                        var f = "OES_texture_float OES_texture_half_float OES_standard_derivatives OES_vertex_array_object WEBGL_compressed_texture_s3tc WEBGL_depth_texture OES_element_index_uint EXT_texture_filter_anisotropic EXT_frag_depth WEBGL_draw_buffers ANGLE_instanced_arrays OES_texture_float_linear OES_texture_half_float_linear EXT_blend_minmax EXT_shader_texture_lod WEBGL_compressed_texture_pvrtc EXT_color_buffer_half_float WEBGL_color_buffer_float EXT_sRGB WEBGL_compressed_texture_etc1 EXT_disjoint_timer_query WEBGL_compressed_texture_etc WEBGL_compressed_texture_astc EXT_color_buffer_float WEBGL_compressed_texture_s3tc_srgb EXT_disjoint_timer_query_webgl2".split(" ");
                        (a = b.getSupportedExtensions()) && 0 < a.length && b.getSupportedExtensions().forEach(function(k) {
                            -1 != f.indexOf(k) && b.getExtension(k)
                        })
                    }
                },
                populateUniformTable: function(a) {
                    var b = l.programs[a];
                    a = l.programInfos[a] = {
                        uniforms: {},
                        maxUniformLength: 0,
                        maxAttributeLength: -1,
                        maxUniformBlockNameLength: -1
                    };
                    for (var c = a.uniforms, d = m.getProgramParameter(b, 35718), e = 0; e < d; ++e) {
                        var f = m.getActiveUniform(b, e),
                            k = f.name;
                        a.maxUniformLength = Math.max(a.maxUniformLength, k.length + 1);
                        "]" == k.slice(-1) && (k = k.slice(0, k.lastIndexOf("[")));
                        var n = m.getUniformLocation(b, k);
                        if (n) {
                            var q = l.getNewId(l.uniforms);
                            c[k] = [f.size, q];
                            l.uniforms[q] = n;
                            for (var r = 1; r < f.size; ++r) n = k + "[" + r + "]", n = m.getUniformLocation(b, n), q = l.getNewId(l.uniforms), l.uniforms[q] = n
                        }
                    }
                }
            },
            Xa = [],
            Wf = {
                6402: 1,
                6403: 1,
                6406: 1,
                6407: 3,
                6408: 4,
                6409: 1,
                6410: 2,
                33319: 2,
                33320: 2,
                35904: 3,
                35906: 4,
                36244: 1,
                36248: 3,
                36249: 4
            },
            Xf = {
                5120: 1,
                5121: 1,
                5122: 2,
                5123: 2,
                5124: 4,
                5125: 4,
                5126: 4,
                5131: 2,
                32819: 2,
                32820: 2,
                33635: 2,
                33640: 4,
                34042: 4,
                35899: 4,
                35902: 4,
                36193: 2
            },
            jb = {
                5122: 1,
                5123: 1,
                5124: 2,
                5125: 2,
                5126: 2,
                5131: 1,
                32819: 1,
                32820: 1,
                33635: 1,
                33640: 2,
                34042: 2,
                35899: 2,
                35902: 2,
                36193: 1
            },
            ge = (la("GMT", G, 358608, 4), 358608),
            Ul = Sl;
        h._usleep = qc;
        var yb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            zb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        g.staticInit();
        if (Ea) {
            var ba = require("fs"),
                Pc = require("path");
            N.staticInit()
        }
        h.count_emval_handles = fl;
        h.get_first_emval = el;
        Hc = h.PureVirtualError = Ob(Error, "PureVirtualError");
        dl();
        h.getInheritedInstanceCount = cl;
        h.getLiveInheritedInstances = bl;
        h.flushPendingDeletes = dc;
        h.setDelayFunction = al;
        ab = h.BindingError =
            Ob(Error, "BindingError");
        Gc = h.InternalError = Ob(Error, "InternalError");
        Ma.prototype.isAliasOf = Wk;
        Ma.prototype.clone = Vk;
        Ma.prototype["delete"] = Tk;
        Ma.prototype.isDeleted = Sk;
        Ma.prototype.deleteLater = Rk;
        Fa.prototype.getPointee = Qk;
        Fa.prototype.destructor = Pk;
        Fa.prototype.argPackAdvance = 8;
        Fa.prototype.readValueFromPointer = lb;
        Fa.prototype.deleteObject = Ok;
        Fa.prototype.fromWireType = Nk;
        Dc = h.UnboundTypeError = Ob(Error, "UnboundTypeError");
        Db = Ea ? function() {
                var a = process.hrtime();
                return 1E3 * a[0] + a[1] / 1E6
            } : "undefined" !==
            typeof dateNow ? dateNow : "object" === typeof performance && performance && "function" === typeof performance.now ? function() {
                return performance.now()
            } : Date.now;
        h.requestFullScreen = function(a, b, c) {
            ca("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
            h.requestFullScreen = h.requestFullscreen;
            v.requestFullScreen(a, b, c)
        };
        h.requestFullscreen = function(a, b, c) {
            v.requestFullscreen(a, b, c)
        };
        h.requestAnimationFrame = function(a) {
            v.requestAnimationFrame(a)
        };
        h.setCanvasSize = function(a, b,
            c) {
            v.setCanvasSize(a, b, c)
        };
        h.pauseMainLoop = function() {
            v.mainLoop.pause()
        };
        h.resumeMainLoop = function() {
            v.mainLoop.resume()
        };
        h.getUserMedia = function() {
            v.getUserMedia()
        };
        h.createContext = function(a, b, c, d) {
            return v.createContext(a, b, c, d)
        };
        var m;
        l.init();
        for (var mc = 0; 32 > mc; mc++) Xa.push(Array(mc));
        var Vl = {},
            Wl = {
                n: K,
                y: Ql,
                c: Rl,
                ea: Nd,
                ya: Ld,
                x: Jd,
                d: Hd,
                j: Fd,
                L: Dd,
                t: Bd,
                Gg: zd,
                aa: xd,
                $: vd,
                Ea: td,
                Da: rd,
                K: pd,
                ga: nd,
                W: ld,
                db: jd,
                cb: hd,
                o: fd,
                s: dd,
                g: bd,
                l: $c,
                D: Yc,
                M: Wc,
                V: Uc,
                fa: fb,
                bb: Gl,
                Id: ec,
                B: Fl,
                F: El,
                J: Dl,
                e: Cl,
                i: Bl,
                H: Jc,
                rc: Al,
                Ca: zl,
                C: xl,
                Ob: wl,
                Ba: vl,
                tb: ul,
                f: yl,
                xa: Ka,
                ab: tl,
                $a: sl,
                va: rl,
                _a: ql,
                Y: nl,
                Za: ml,
                Ya: ll,
                ua: kl,
                ta: jl,
                ha: il,
                Xa: hl,
                X: gl,
                Wa: Zk,
                Va: Yk,
                Ua: Xk,
                r: Ik,
                sa: Gk,
                u: Fk,
                h: Ek,
                q: Dk,
                Ta: Ck,
                I: Bk,
                k: zk,
                ra: yk,
                qa: wk,
                O: vk,
                E: tk,
                pa: sk,
                Sa: rk,
                Ra: qk,
                oa: pk,
                Qa: ok,
                S: nk,
                da: lk,
                z: jk,
                p: Wb,
                na: ik,
                w: hk,
                R: ek,
                v: dk,
                ma: ck,
                T: ak,
                N: Zj,
                G: Yj,
                Pa: Xj,
                b: Vj,
                ca: Uj,
                la: Rj,
                Oa: Qj,
                Na: Pj,
                Ma: Oj,
                La: Nj,
                Ka: Mj,
                Ja: Lj,
                ba: Kj,
                Ia: Jj,
                Ha: Ij,
                Ga: Gj,
                Fa: Fj,
                Fg: Ej,
                Eg: Dj,
                ka: Il,
                ja: Hl,
                Dg: Cj,
                Cg: vc,
                Bg: Aj,
                Ag: zj,
                zg: yj,
                yg: xj,
                xg: wj,
                wg: vj,
                vg: uj,
                ug: tj,
                tg: sj,
                sg: rj,
                rg: qj,
                qg: pj,
                pg: oj,
                og: nj,
                ng: mj,
                mg: lj,
                lg: kj,
                kg: jj,
                jg: ij,
                ig: hj,
                hg: gj,
                gg: fj,
                fg: ej,
                eg: dj,
                dg: cj,
                cg: bj,
                bg: aj,
                ag: $i,
                $f: Zi,
                _f: Yi,
                Zf: Xi,
                Yf: Wi,
                Xf: Vi,
                Wf: Ui,
                Vf: Ti,
                Uf: Si,
                Tf: Ri,
                Sf: Qi,
                Rf: Pi,
                Qf: Oi,
                Pf: Ni,
                Of: Mi,
                Nf: Li,
                Mf: Ki,
                Lf: Ji,
                Kf: Ii,
                Jf: Hi,
                If: Gi,
                Hf: Fi,
                Gf: Ei,
                Ff: Di,
                Ef: Ci,
                Df: Bi,
                Cf: Ai,
                Bf: zi,
                Af: yi,
                zf: xi,
                yf: wi,
                xf: vi,
                wf: ui,
                vf: ti,
                uf: si,
                tf: ri,
                sf: qi,
                rf: pi,
                qf: oi,
                pf: ni,
                of: mi,
                nf: li,
                mf: ki,
                lf: ji,
                kf: ii,
                jf: hi,
                hf: gi,
                gf: fi,
                ff: ei,
                ef: di,
                df: ci,
                cf: bi,
                bf: ai,
                af: $h,
                $e: Zh,
                _e: Xh,
                Ze: Wh,
                Ye: Vh,
                Xe: Uh,
                We: Th,
                Ve: Sh,
                Ue: Rh,
                Te: Qh,
                Se: Ph,
                Re: Oh,
                Qe: Nh,
                Pe: Mh,
                Oe: Lh,
                Ne: Kh,
                Me: Jh,
                Le: Ih,
                Ke: Hh,
                Je: Gh,
                Ie: Fh,
                He: Eh,
                Ge: Dh,
                Fe: Ch,
                Ee: Bh,
                De: Ah,
                Ce: zh,
                Be: yh,
                Ae: xh,
                ze: wh,
                ye: vh,
                xe: uh,
                we: th,
                ve: sh,
                ue: rh,
                te: qh,
                se: ph,
                re: oh,
                qe: nh,
                pe: mh,
                oe: lh,
                ne: kh,
                me: jh,
                le: ih,
                ke: hh,
                je: gh,
                ie: fh,
                he: eh,
                ge: dh,
                fe: ch,
                ee: bh,
                de: ah,
                ce: $g,
                be: Zg,
                ae: Yg,
                $d: Xg,
                _d: Wg,
                Zd: Vg,
                Yd: Ug,
                Xd: Tg,
                Wd: Sg,
                Vd: Rg,
                Ud: Qg,
                Td: Pg,
                Sd: Og,
                Rd: Ng,
                Qd: Mg,
                Pd: Lg,
                Od: Kg,
                Nd: Jg,
                Md: Ig,
                Ld: Hg,
                Kd: Gg,
                Jd: Fg,
                Hd: Eg,
                Gd: Dg,
                Fd: Cg,
                Ed: Bg,
                Dd: Ag,
                Cd: zg,
                Bd: yg,
                Ad: xg,
                zd: wg,
                yd: vg,
                xd: ug,
                wd: tg,
                vd: sg,
                ud: rg,
                td: qg,
                sd: pg,
                rd: og,
                qd: ng,
                pd: mg,
                od: lg,
                nd: kg,
                md: jg,
                ld: ig,
                kd: hg,
                jd: gg,
                id: fg,
                hd: eg,
                gd: dg,
                fd: cg,
                ed: bg,
                dd: ag,
                cd: $f,
                bd: Zf,
                ad: Vf,
                $c: Uf,
                _c: Tf,
                Zc: Sf,
                Yc: Rf,
                Xc: Qf,
                Wc: Pf,
                Vc: Of,
                Uc: Nf,
                Tc: Mf,
                Sc: Lf,
                Rc: Kf,
                Qc: Jf,
                Pc: If,
                Oc: Hf,
                Nc: Gf,
                Mc: Ff,
                Lc: Ef,
                Kc: Df,
                Jc: Cf,
                Ic: Bf,
                Hc: Af,
                Gc: zf,
                Fc: yf,
                Ec: xf,
                Dc: wf,
                Cc: vf,
                Bc: uf,
                Ac: tf,
                zc: sf,
                yc: rf,
                xc: qf,
                wc: pf,
                vc: of,
                uc: nf,
                tc: mf,
                sc: lf,
                qc: kf,
                pc: jf,
                oc: hf,
                nc: gf,
                mc: ff,
                lc: ef,
                kc: df,
                jc: cf,
                ic: bf,
                hc: af,
                gc: $e,
                fc: Ze,
                ec: Ye,
                dc: Xe,
                cc: We,
                bc: Ve,
                ac: Ue,
                $b: Te,
                _b: Se,
                Zb: Re,
                Yb: Qe,
                Xb: Pe,
                Wb: Oe,
                Vb: Ne,
                Ub: Me,
                Tb: Le,
                Sb: Ke,
                Rb: Je,
                Qb: Ie,
                Pb: He,
                Nb: Ge,
                Mb: Fe,
                Lb: Ee,
                Kb: De,
                Jb: Ce,
                Ib: Be,
                Hb: Ae,
                Gb: ze,
                Fb: ye,
                Eb: xe,
                Db: we,
                Cb: ve,
                Bb: ue,
                Ab: te,
                zb: se,
                yb: re,
                xb: qe,
                wb: pe,
                vb: oe,
                ub: ne,
                sb: me,
                rb: le,
                qb: Zd,
                pb: ke,
                _: hb,
                Aa: je,
                za: ie,
                ob: he,
                nb: fe,
                Q: de,
                P: Sb,
                A: ce,
                mb: Ul,
                Z: $d,
                m: tc,
                lb: Yd,
                ia: Xd,
                kb: Wd,
                jb: Vd,
                ib: Ud,
                wa: Td,
                hb: Sd,
                U: Rd,
                gb: Qd,
                fb: Od,
                eb: sc,
                a: ia
            },
            Qc = h.asm(Vl, Wl, P);
        h.asm = Qc;
        var ob = h.__ZSt18uncaught_exceptionv = function() {
            return h.asm.Hg.apply(null, arguments)
        };
        h.___errno_location = function() {
            return h.asm.Ig.apply(null, arguments)
        };
        var $k = h.___getTypeName = function() {
                return h.asm.Jg.apply(null, arguments)
            },
            be = h.__get_daylight = function() {
                return h.asm.Kg.apply(null,
                    arguments)
            },
            ae = h.__get_timezone = function() {
                return h.asm.Lg.apply(null, arguments)
            },
            gb = h.__get_tzname = function() {
                return h.asm.Mg.apply(null, arguments)
            },
            Hj = h._emscripten_GetProcAddress = function() {
                return h.asm.Ng.apply(null, arguments)
            },
            qa = h._free = function() {
                return h.asm.Og.apply(null, arguments)
            },
            ta = h._malloc = function() {
                return h.asm.Pg.apply(null, arguments)
            },
            ol = h._memalign = function() {
                return h.asm.Qg.apply(null, arguments)
            },
            pl = h._memset = function() {
                return h.asm.Rg.apply(null, arguments)
            },
            Q = h._setThrew = function() {
                return h.asm.Sg.apply(null,
                    arguments)
            },
            Tl = h.globalCtors = function() {
                return h.asm.ki.apply(null, arguments)
            },
            Nl = h.stackAlloc = function() {
                return h.asm.li.apply(null, arguments)
            },
            U = h.stackRestore = function() {
                return h.asm.mi.apply(null, arguments)
            },
            T = h.stackSave = function() {
                return h.asm.ni.apply(null, arguments)
            };
        h.dynCall_di = function() {
            return h.asm.Tg.apply(null, arguments)
        };
        h.dynCall_dii = function() {
            return h.asm.Ug.apply(null, arguments)
        };
        var Md = h.dynCall_diii = function() {
            return h.asm.Vg.apply(null, arguments)
        };
        h.dynCall_fi = function() {
            return h.asm.Wg.apply(null,
                arguments)
        };
        h.dynCall_fif = function() {
            return h.asm.Xg.apply(null, arguments)
        };
        h.dynCall_fii = function() {
            return h.asm.Yg.apply(null, arguments)
        };
        var Kd = h.dynCall_fiii = function() {
            return h.asm.Zg.apply(null, arguments)
        };
        h.dynCall_fiiif = function() {
            return h.asm._g.apply(null, arguments)
        };
        var Id = h.dynCall_i = function() {
                return h.asm.$g.apply(null, arguments)
            },
            Gd = h.dynCall_ii = function() {
                return h.asm.ah.apply(null, arguments)
            };
        h.dynCall_iidiiii = function() {
            return h.asm.bh.apply(null, arguments)
        };
        h.dynCall_iiffff = function() {
            return h.asm.ch.apply(null,
                arguments)
        };
        var Ed = h.dynCall_iii = function() {
                return h.asm.dh.apply(null, arguments)
            },
            Cd = h.dynCall_iiii = function() {
                return h.asm.eh.apply(null, arguments)
            };
        h.dynCall_iiiid = function() {
            return h.asm.fh.apply(null, arguments)
        };
        var Ad = h.dynCall_iiiii = function() {
                return h.asm.gh.apply(null, arguments)
            },
            yd = h.dynCall_iiiiid = function() {
                return h.asm.hh.apply(null, arguments)
            },
            wd = h.dynCall_iiiiii = function() {
                return h.asm.ih.apply(null, arguments)
            };
        h.dynCall_iiiiiid = function() {
            return h.asm.jh.apply(null, arguments)
        };
        var ud =
            h.dynCall_iiiiiii = function() {
                return h.asm.kh.apply(null, arguments)
            },
            sd = h.dynCall_iiiiiiii = function() {
                return h.asm.lh.apply(null, arguments)
            },
            qd = h.dynCall_iiiiiiiii = function() {
                return h.asm.mh.apply(null, arguments)
            },
            od = h.dynCall_iiiiiiiiiii = function() {
                return h.asm.nh.apply(null, arguments)
            },
            md = h.dynCall_iiiiiiiiiiii = function() {
                return h.asm.oh.apply(null, arguments)
            },
            kd = h.dynCall_iiiiiiiiiiiii = function() {
                return h.asm.ph.apply(null, arguments)
            },
            id = h.dynCall_iiiiij = function() {
                return h.asm.qh.apply(null, arguments)
            };
        h.dynCall_iijj = function() {
            return h.asm.rh.apply(null, arguments)
        };
        h.dynCall_ji = function() {
            return h.asm.sh.apply(null, arguments)
        };
        var gd = h.dynCall_jiiii = function() {
            return h.asm.th.apply(null, arguments)
        };
        h.dynCall_jiji = function() {
            return h.asm.uh.apply(null, arguments)
        };
        var ed = h.dynCall_v = function() {
            return h.asm.vh.apply(null, arguments)
        };
        h.dynCall_vf = function() {
            return h.asm.wh.apply(null, arguments)
        };
        h.dynCall_vff = function() {
            return h.asm.xh.apply(null, arguments)
        };
        h.dynCall_vffff = function() {
            return h.asm.yh.apply(null,
                arguments)
        };
        h.dynCall_vfi = function() {
            return h.asm.zh.apply(null, arguments)
        };
        var cd = h.dynCall_vi = function() {
            return h.asm.Ah.apply(null, arguments)
        };
        h.dynCall_vid = function() {
            return h.asm.Bh.apply(null, arguments)
        };
        h.dynCall_vidi = function() {
            return h.asm.Ch.apply(null, arguments)
        };
        h.dynCall_vif = function() {
            return h.asm.Dh.apply(null, arguments)
        };
        h.dynCall_viff = function() {
            return h.asm.Eh.apply(null, arguments)
        };
        h.dynCall_vifff = function() {
            return h.asm.Fh.apply(null, arguments)
        };
        h.dynCall_viffff = function() {
            return h.asm.Gh.apply(null,
                arguments)
        };
        h.dynCall_vifi = function() {
            return h.asm.Hh.apply(null, arguments)
        };
        h.dynCall_vifiii = function() {
            return h.asm.Ih.apply(null, arguments)
        };
        var ad = h.dynCall_vii = function() {
            return h.asm.Jh.apply(null, arguments)
        };
        h.dynCall_viid = function() {
            return h.asm.Kh.apply(null, arguments)
        };
        h.dynCall_viif = function() {
            return h.asm.Lh.apply(null, arguments)
        };
        h.dynCall_viifi = function() {
            return h.asm.Mh.apply(null, arguments)
        };
        var Zc = h.dynCall_viii = function() {
            return h.asm.Nh.apply(null, arguments)
        };
        h.dynCall_viiid = function() {
            return h.asm.Oh.apply(null,
                arguments)
        };
        h.dynCall_viiiff = function() {
            return h.asm.Ph.apply(null, arguments)
        };
        h.dynCall_viiifi = function() {
            return h.asm.Qh.apply(null, arguments)
        };
        h.dynCall_viiifii = function() {
            return h.asm.Rh.apply(null, arguments)
        };
        var Xc = h.dynCall_viiii = function() {
            return h.asm.Sh.apply(null, arguments)
        };
        h.dynCall_viiiidff = function() {
            return h.asm.Th.apply(null, arguments)
        };
        h.dynCall_viiiidfffffff = function() {
            return h.asm.Uh.apply(null, arguments)
        };
        h.dynCall_viiiif = function() {
            return h.asm.Vh.apply(null, arguments)
        };
        h.dynCall_viiiii =
            function() {
                return h.asm.Wh.apply(null, arguments)
            };
        h.dynCall_viiiiidff = function() {
            return h.asm.Xh.apply(null, arguments)
        };
        h.dynCall_viiiiidfffffff = function() {
            return h.asm.Yh.apply(null, arguments)
        };
        h.dynCall_viiiiii = function() {
            return h.asm.Zh.apply(null, arguments)
        };
        var Vc = h.dynCall_viiiiiii = function() {
            return h.asm._h.apply(null, arguments)
        };
        h.dynCall_viiiiiiii = function() {
            return h.asm.$h.apply(null, arguments)
        };
        h.dynCall_viiiiiiiii = function() {
            return h.asm.ai.apply(null, arguments)
        };
        var Tc = h.dynCall_viiiiiiiiii =
            function() {
                return h.asm.bi.apply(null, arguments)
            };
        h.dynCall_viiiiiiiiiii = function() {
            return h.asm.ci.apply(null, arguments)
        };
        var Sc = h.dynCall_viiiiiiiiiiiiiii = function() {
            return h.asm.di.apply(null, arguments)
        };
        h.dynCall_viiiiij = function() {
            return h.asm.ei.apply(null, arguments)
        };
        h.dynCall_viij = function() {
            return h.asm.fi.apply(null, arguments)
        };
        h.dynCall_viijii = function() {
            return h.asm.gi.apply(null, arguments)
        };
        h.dynCall_vij = function() {
            return h.asm.hi.apply(null, arguments)
        };
        h.dynCall_viji = function() {
            return h.asm.ii.apply(null,
                arguments)
        };
        h.dynCall_vj = function() {
            return h.asm.ji.apply(null, arguments)
        };
        h.asm = Qc;
        h.ENV = oa;
        wa.prototype = Error();
        wa.prototype.constructor = wa;
        pb = function b() {
            h.calledRun || ra();
            h.calledRun || (pb = b)
        };
        h.run = ra;
        h.abort = K;
        if (h.preInit)
            for ("function" == typeof h.preInit && (h.preInit = [h.preInit]); 0 < h.preInit.length;) h.preInit.pop()();
        h.noExitRuntime = !0;
        ra();
        A.Module = h;
        A.Browser = v;
        A.__register_pthread_ptr = "undefined" !== typeof __register_pthread_ptr ? __register_pthread_ptr : void 0;
        A.assert = ja;
        A.PThread = "undefined" !==
            typeof PThread ? PThread : void 0;
        A._pthread_self = "undefined" !== typeof _pthread_self ? _pthread_self : void 0;
        A.establishStackSpace = h.establishStackSpace && h.establishStackSpace.bind(h);
        A.wasmMemory = Ia;
        A._emscripten_current_thread_process_queued_calls = "undefined" !== typeof _emscripten_current_thread_process_queued_calls ? _emscripten_current_thread_process_queued_calls : void 0
    } catch (a) {
        A.wasmLoadingError = a, h.onLoadingError && h.onLoadingError.forEach(function(b) {
            return b(a)
        })
    }
})("undefined" != typeof window && window ===
    this ? this : "undefined" != typeof global && null != global ? global : this, "undefined" !== typeof Module ? Module : {}, "undefined" !== typeof ENVIRONMENT_IS_PTHREAD ? ENVIRONMENT_IS_PTHREAD : void 0, "undefined" !== typeof buffer ? buffer : void 0, "undefined" !== typeof PthreadWorkerInit ? PthreadWorkerInit : void 0, "undefined" !== typeof STATIC_BASE ? STATIC_BASE : void 0, "undefined" !== typeof STATICTOP ? STATICTOP : void 0, "undefined" !== typeof STACK_BASE ? STACK_BASE : void 0, "undefined" !== typeof STACKTOP ? STACKTOP : void 0, "undefined" !== typeof STACK_MAX ?
    STACK_MAX : void 0, "undefined" !== typeof DYNAMIC_BASE ? DYNAMIC_BASE : void 0, "undefined" !== typeof DYNAMICTOP_PTR ? DYNAMICTOP_PTR : void 0, "undefined" !== typeof wasmMemory ? wasmMemory : void 0);