import { e, r as reactExports } from "./react.mjs";
function u() {
  return (u = Object.assign || function(e2) {
    for (var r = 1; r < arguments.length; r++) {
      var n = arguments[r];
      for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e2[t] = n[t]);
    }
    return e2;
  }).apply(this, arguments);
}
function c(e2, r) {
  if (null == e2) return {};
  var n, t, o = {}, a = Object.keys(e2);
  for (t = 0; t < a.length; t++) r.indexOf(n = a[t]) >= 0 || (o[n] = e2[n]);
  return o;
}
function i(e2) {
  var n = reactExports.useRef(e2), t = reactExports.useRef(function(e3) {
    n.current && n.current(e3);
  });
  return n.current = e2, t.current;
}
var s = function(e2, r, n) {
  return void 0 === r && (r = 0), void 0 === n && (n = 1), e2 > n ? n : e2 < r ? r : e2;
}, f = function(e2) {
  return "touches" in e2;
}, v = function(e2) {
  return e2 && e2.ownerDocument.defaultView || self;
}, d = function(e2, r, n) {
  var t = e2.getBoundingClientRect(), o = f(r) ? (function(e3, r2) {
    for (var n2 = 0; n2 < e3.length; n2++) if (e3[n2].identifier === r2) return e3[n2];
    return e3[0];
  })(r.touches, n) : r;
  return { left: s((o.pageX - (t.left + v(e2).pageXOffset)) / t.width), top: s((o.pageY - (t.top + v(e2).pageYOffset)) / t.height) };
}, h = function(e2) {
  !f(e2) && e2.preventDefault();
}, g = e.memo(function(o) {
  var a = o.onMove, l = o.onKey, s2 = o.onEnd, g2 = c(o, ["onMove", "onKey", "onEnd"]), m2 = reactExports.useRef(null), p2 = i(a), b2 = i(l), _ = i(s2), E2 = reactExports.useRef(null), C2 = reactExports.useRef(false), x = reactExports.useMemo(function() {
    var e2 = function(e3) {
      h(e3), (f(e3) ? e3.touches.length > 0 : e3.buttons > 0) && m2.current ? p2(d(m2.current, e3, E2.current)) : (n(false), _());
    }, r = function() {
      n(false), _();
    };
    function n(n2) {
      var t = C2.current, o2 = v(m2.current), a2 = n2 ? o2.addEventListener : o2.removeEventListener;
      a2(t ? "touchmove" : "mousemove", e2), a2(t ? "touchend" : "mouseup", r);
    }
    return [function(e3) {
      var r2 = e3.nativeEvent, t = m2.current;
      if (t && (h(r2), !(function(e4, r3) {
        return r3 && !f(e4);
      })(r2, C2.current) && t)) {
        if (f(r2)) {
          C2.current = true;
          var o2 = r2.changedTouches || [];
          o2.length && (E2.current = o2[0].identifier);
        }
        t.focus(), p2(d(t, r2, E2.current)), n(true);
      }
    }, function(e3) {
      var r2 = e3.which || e3.keyCode;
      r2 < 37 || r2 > 40 || (e3.preventDefault(), b2({ left: 39 === r2 ? 0.05 : 37 === r2 ? -0.05 : 0, top: 40 === r2 ? 0.05 : 38 === r2 ? -0.05 : 0 }));
    }, function(e3) {
      var r2 = e3.which || e3.keyCode;
      r2 >= 37 && r2 <= 40 && _();
    }, n];
  }, [b2, p2, _]), H = x[0], M = x[1], N = x[2], w2 = x[3];
  return reactExports.useEffect(function() {
    return w2;
  }, [w2]), e.createElement("div", u({}, g2, { onTouchStart: H, onMouseDown: H, className: "react-colorful__interactive", ref: m2, onKeyDown: M, onKeyUp: N, tabIndex: 0, role: "slider" }));
}), m = function(e2) {
  return e2.filter(Boolean).join(" ");
}, p = function(r) {
  var n = r.color, t = r.left, o = r.top, a = void 0 === o ? 0.5 : o, l = m(["react-colorful__pointer", r.className]);
  return e.createElement("div", { className: l, style: { top: 100 * a + "%", left: 100 * t + "%" } }, e.createElement("div", { className: "react-colorful__pointer-fill", style: { backgroundColor: n } }));
}, b = function(e2, r, n) {
  return void 0 === r && (r = 0), void 0 === n && (n = Math.pow(10, r)), Math.round(n * e2) / n;
}, E = function(e2) {
  return L(C(e2));
}, C = function(e2) {
  return "#" === e2[0] && (e2 = e2.substring(1)), e2.length < 6 ? { r: parseInt(e2[0] + e2[0], 16), g: parseInt(e2[1] + e2[1], 16), b: parseInt(e2[2] + e2[2], 16), a: 4 === e2.length ? b(parseInt(e2[3] + e2[3], 16) / 255, 2) : 1 } : { r: parseInt(e2.substring(0, 2), 16), g: parseInt(e2.substring(2, 4), 16), b: parseInt(e2.substring(4, 6), 16), a: 8 === e2.length ? b(parseInt(e2.substring(6, 8), 16) / 255, 2) : 1 };
}, w = function(e2) {
  return D(I(e2));
}, y = function(e2) {
  var r = e2.s, n = e2.v, t = e2.a, o = (200 - r) * n / 100;
  return { h: b(e2.h), s: b(o > 0 && o < 200 ? r * n / 100 / (o <= 100 ? o : 200 - o) * 100 : 0), l: b(o / 2), a: b(t, 2) };
}, q = function(e2) {
  var r = y(e2);
  return "hsl(" + r.h + ", " + r.s + "%, " + r.l + "%)";
}, I = function(e2) {
  var r = e2.h, n = e2.s, t = e2.v, o = e2.a;
  r = r / 360 * 6, n /= 100, t /= 100;
  var a = Math.floor(r), l = t * (1 - n), u2 = t * (1 - (r - a) * n), c2 = t * (1 - (1 - r + a) * n), i2 = a % 6;
  return { r: b(255 * [t, u2, l, l, c2, t][i2]), g: b(255 * [c2, t, t, u2, l, l][i2]), b: b(255 * [l, l, c2, t, t, u2][i2]), a: b(o, 2) };
}, B = function(e2) {
  var r = e2.toString(16);
  return r.length < 2 ? "0" + r : r;
}, D = function(e2) {
  var r = e2.r, n = e2.g, t = e2.b, o = e2.a, a = o < 1 ? B(b(255 * o)) : "";
  return "#" + B(r) + B(n) + B(t) + a;
}, L = function(e2) {
  var r = e2.r, n = e2.g, t = e2.b, o = e2.a, a = Math.max(r, n, t), l = a - Math.min(r, n, t), u2 = l ? a === r ? (n - t) / l : a === n ? 2 + (t - r) / l : 4 + (r - n) / l : 0;
  return { h: b(60 * (u2 < 0 ? u2 + 6 : u2)), s: b(a ? l / a * 100 : 0), v: b(a / 255 * 100), a: o };
}, S = e.memo(function(r) {
  var n = r.hue, t = r.onChange, o = r.onChangeEnd, a = m(["react-colorful__hue", r.className]);
  return e.createElement("div", { className: a }, e.createElement(g, { onMove: function(e2) {
    t({ h: 360 * e2.left });
  }, onKey: function(e2) {
    t({ h: s(n + 360 * e2.left, 0, 360) });
  }, onEnd: o, "aria-label": "Hue", "aria-valuenow": b(n), "aria-valuemax": "360", "aria-valuemin": "0" }, e.createElement(p, { className: "react-colorful__hue-pointer", left: n / 360, color: q({ h: n, s: 100, v: 100, a: 1 }) })));
}), T = e.memo(function(r) {
  var n = r.hsva, t = r.onChange, o = r.onChangeEnd, a = { backgroundColor: q({ h: n.h, s: 100, v: 100, a: 1 }) };
  return e.createElement("div", { className: "react-colorful__saturation", style: a }, e.createElement(g, { onMove: function(e2) {
    t({ s: 100 * e2.left, v: 100 - 100 * e2.top });
  }, onKey: function(e2) {
    t({ s: s(n.s + 100 * e2.left, 0, 100), v: s(n.v - 100 * e2.top, 0, 100) });
  }, onEnd: o, "aria-label": "Color", "aria-valuetext": "Saturation " + b(n.s) + "%, Brightness " + b(n.v) + "%" }, e.createElement(p, { className: "react-colorful__saturation-pointer", top: 1 - n.v / 100, left: n.s / 100, color: q(n) })));
}), F = function(e2, r) {
  if (e2 === r) return true;
  for (var n in e2) if (e2[n] !== r[n]) return false;
  return true;
}, X = function(e2, r) {
  return e2.toLowerCase() === r.toLowerCase() || F(C(e2), C(r));
};
function Y(e2, n, l, u2) {
  var c2 = i(l), s2 = i(u2), f2 = reactExports.useState(function() {
    return e2.toHsva(n);
  }), v2 = f2[0], d2 = f2[1], h2 = reactExports.useRef({ color: n, hsva: v2 }), g2 = reactExports.useRef(false);
  reactExports.useEffect(function() {
    if (!e2.equal(n, h2.current.color)) {
      var r = e2.toHsva(n);
      h2.current = { hsva: r, color: n }, d2(r), g2.current = false;
    }
  }, [n, e2]), reactExports.useEffect(function() {
    var r;
    F(v2, h2.current.hsva) || e2.equal(r = e2.fromHsva(v2), h2.current.color) || (h2.current = { hsva: v2, color: r }, c2(r), g2.current = true);
  }, [v2, e2, c2]);
  var m2 = reactExports.useCallback(function(e3) {
    d2(function(r) {
      return Object.assign({}, r, e3);
    });
  }, []), p2 = reactExports.useCallback(function() {
    g2.current && (g2.current = false, s2(h2.current.color));
  }, [s2]);
  return [v2, m2, p2];
}
var U = "undefined" != typeof window ? reactExports.useLayoutEffect : reactExports.useEffect, V = function() {
  return "undefined" != typeof __webpack_nonce__ ? __webpack_nonce__ : void 0;
}, G = /* @__PURE__ */ new Map(), J = function(e2) {
  U(function() {
    var r = e2.current ? e2.current.ownerDocument : document;
    if (void 0 !== r && !G.has(r)) {
      var n = r.createElement("style");
      n.innerHTML = `.react-colorful{position:relative;display:flex;flex-direction:column;width:200px;height:200px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default}.react-colorful__saturation{position:relative;flex-grow:1;border-color:transparent;border-bottom:12px solid #000;border-radius:8px 8px 0 0;background-image:linear-gradient(0deg,#000,transparent),linear-gradient(90deg,#fff,hsla(0,0%,100%,0))}.react-colorful__alpha-gradient,.react-colorful__pointer-fill{content:"";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;border-radius:inherit}.react-colorful__alpha-gradient,.react-colorful__saturation{box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}.react-colorful__alpha,.react-colorful__hue{position:relative;height:24px}.react-colorful__hue{background:linear-gradient(90deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red)}.react-colorful__last-control{border-radius:0 0 8px 8px}.react-colorful__interactive{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;outline:none;touch-action:none}.react-colorful__pointer{position:absolute;z-index:1;box-sizing:border-box;width:28px;height:28px;transform:translate(-50%,-50%);background-color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2)}.react-colorful__interactive:focus .react-colorful__pointer{transform:translate(-50%,-50%) scale(1.1)}.react-colorful__alpha,.react-colorful__alpha-pointer{background-color:#fff;background-image:url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>')}.react-colorful__saturation-pointer{z-index:3}.react-colorful__hue-pointer{z-index:2}`, G.set(r, n);
      var t = V();
      t && n.setAttribute("nonce", t), r.head.appendChild(n);
    }
  }, []);
}, Q = function(n) {
  var t = n.className, o = n.colorModel, a = n.color, l = void 0 === a ? o.defaultColor : a, i2 = n.onChange, s2 = n.onChangeEnd, f2 = c(n, ["className", "colorModel", "color", "onChange", "onChangeEnd"]), v2 = reactExports.useRef(null);
  J(v2);
  var d2 = Y(o, l, i2, s2), h2 = d2[0], g2 = d2[1], p2 = d2[2], b2 = m(["react-colorful", t]);
  return e.createElement("div", u({}, f2, { ref: v2, className: b2 }), e.createElement(T, { hsva: h2, onChange: g2, onChangeEnd: p2 }), e.createElement(S, { hue: h2.h, onChange: g2, onChangeEnd: p2, className: "react-colorful__last-control" }));
}, W = { defaultColor: "000", toHsva: E, fromHsva: function(e2) {
  return w({ h: e2.h, s: e2.s, v: e2.v, a: 1 });
}, equal: X }, Z = function(r) {
  return e.createElement(Q, u({}, r, { colorModel: W }));
}, qe = /^#?([0-9A-F]{3,8})$/i, ke = function(r) {
  var n = r.color, l = void 0 === n ? "" : n, s2 = r.onChange, f2 = r.onBlur, v2 = r.escape, d2 = r.validate, h2 = r.format, g2 = r.process, m2 = c(r, ["color", "onChange", "onBlur", "escape", "validate", "format", "process"]), p2 = reactExports.useState(function() {
    return v2(l);
  }), b2 = p2[0], _ = p2[1], E2 = i(s2), C2 = i(f2), x = reactExports.useCallback(function(e2) {
    var r2 = v2(e2.target.value);
    _(r2), d2(r2) && E2(g2 ? g2(r2) : r2);
  }, [v2, g2, d2, E2]), H = reactExports.useCallback(function(e2) {
    d2(e2.target.value) || _(v2(l)), C2(e2);
  }, [l, v2, d2, C2]);
  return reactExports.useEffect(function() {
    _(v2(l));
  }, [l, v2]), e.createElement("input", u({}, m2, { value: h2 ? h2(b2) : b2, spellCheck: "false", onChange: x, onBlur: H }));
}, Ie = function(e2) {
  return "#" + e2;
}, Oe = function(r) {
  var n = r.prefixed, t = r.alpha, o = c(r, ["prefixed", "alpha"]), l = reactExports.useCallback(function(e2) {
    return e2.replace(/([^0-9A-F]+)/gi, "").substring(0, t ? 8 : 6);
  }, [t]), i2 = reactExports.useCallback(function(e2) {
    return (function(e3, r2) {
      var n2 = qe.exec(e3), t2 = n2 ? n2[1].length : 0;
      return 3 === t2 || 6 === t2 || !!r2 && 4 === t2 || !!r2 && 8 === t2;
    })(e2, t);
  }, [t]);
  return e.createElement(ke, u({}, o, { escape: l, format: n ? Ie : void 0, process: Ie, validate: i2 }));
};
export {
  Oe as O,
  Z
};
