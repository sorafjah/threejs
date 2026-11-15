// ===================== キャラ15種（Three.js）単体抜き出し版 =====================
// （新キャラ11種＋ひよこ・パンダ・いぬロボ・ネコ。4体は色違いにも対応）
// 元プロジェクト：クレーンゲーム（sorafjah.github.io/crane-game）
// 依存：three.js（グローバル版。r128 でも r169 でも動く。`THREE.xxx` で参照する形式）
//
// 使い方：
//   const bear = createBear();                 // パステルのピンク（元の色）
//   const bear2 = createBear(NEW_PALETTES.sky); // 色違い（pal を渡す）
//   bear.scale.setScalar(2);                    // 元は高さ1以下の小さめサイズなので、見やすい大きさに拡大
//   scene.add(bear);
//
// まとめて使うとき：
//   NEW_CHARS = { chick:{name:'ひよこ', create:fn, orig:true}, ball:{...}, ... }（全部 create(pal) の形）
//   orig:true の4体（ひよこ・パンダ・いぬロボ・ネコ）は create() で元の色、create(pal) で色違い
//   NEW_PALETTES = { pink, sky, mint, cream, lav, peach }（それぞれ {main, deep, light}）
//
// どれも足元（y=0）が地面の基準で、顔は +Z 方向を向いています。
// 外部画像は使わず、球・箱・円柱などの組み合わせだけで作っています。
// ※ 関数名がほかのファイルとぶつからないよう、中身は即時関数でつつんであります。

(function () {
  'use strict';

  // ---- パステルの色（main=ふつうの色、deep=濃い色、light=うすい色）----
  const NEW_PALETTES = {
    pink:  { main: 0xffb3c7, deep: 0xf58fb0, light: 0xffe0ea },
    sky:   { main: 0xa9d8ff, deep: 0x7bbcf2, light: 0xdff0ff },
    mint:  { main: 0xb0ecd3, deep: 0x7fd6b4, light: 0xe0f8ee },
    cream: { main: 0xfff0a8, deep: 0xf5d76a, light: 0xfff9dc },
    lav:   { main: 0xd3c2fb, deep: 0xb39cf0, light: 0xece4ff },
    peach: { main: 0xffcfa8, deep: 0xf7a878, light: 0xffeada },
  };

  // ---- 小さな道具 ----
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0, ...o });
const sph = (r, m, ws = 18, hs = 14) => new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), m);
const box = (x, y, z, m) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m);
function put(parent, mesh, p, r, s) {
  if (p) mesh.position.set(p[0], p[1], p[2]);
  if (r) mesh.rotation.set(r[0], r[1], r[2]);
  if (s) mesh.scale.set(s[0], s[1], s[2]);
  parent.add(mesh); return mesh;
}
/* 2点をむすぶ棒 */
function stickMesh(a, b, r, m) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), m);
  me.position.copy(va).add(vb).multiplyScalar(0.5);
  me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return me;
}
  // 角丸の箱（r128 には RoundedBoxGeometry が標準で無いので、面取りした箱で代用）
  function rbox(x, y, z, r, m) {
    if (THREE.RoundedBoxGeometry) return new THREE.Mesh(new THREE.RoundedBoxGeometry(x, y, z, 4, r), m);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(x - r * 2, y, z), m));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(x, y - r * 2, z), m));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(x, y, z - r * 2), m));
    const corner = new THREE.SphereGeometry(r, 10, 8);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const c = new THREE.Mesh(corner, m);
      c.position.set(sx * (x / 2 - r), sy * (y / 2 - r), sz * (z / 2 - r));
      g.add(c);
    }
    return g;
  }
  // カプセル（r128 には CapsuleGeometry が無いので、円柱＋球2つで代用）
  function capsule(r, len, m) {
    if (THREE.CapsuleGeometry) return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), m);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), m));
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), m); c.position.y = s * len / 2; g.add(c); }
    return g;
  }

  // ---- キャラ本体 ----
/* 半径R・中心高さcyの球の正面（+z）に顔をつける。flatZ を渡すと平らな面用 */
function addFace(g, R, cy, flatZ) {
  const dark = mat(0x3a3340, { roughness: 0.4 });
  const pink = mat(0xff9fb6, { roughness: 0.9, transparent: true, opacity: 0.9 });
  const z = (k) => (flatZ != null ? flatZ : R * k);
  for (const sx of [-1, 1]) {
    put(g, sph(0.095 * R, dark, 12, 10), [sx * 0.32 * R, cy + 0.12 * R, z(0.92)], null, [1, 1.15, 0.6]);
    put(g, new THREE.Mesh(new THREE.SphereGeometry(0.03 * R, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })),
      [sx * 0.32 * R + 0.03 * R, cy + 0.17 * R, z(0.92) + 0.055 * R]);
    put(g, sph(0.11 * R, pink, 12, 10), [sx * 0.52 * R, cy - 0.1 * R, z(0.82)], null, [1, 0.7, 0.35]);
  }
  put(g, new THREE.Mesh(new THREE.TorusGeometry(0.1 * R, 0.024 * R, 8, 16, Math.PI), dark), [0, cy - 0.06 * R, z(0.975)], [0, 0, Math.PI]);
}
function makeBall(pal) {
  const g = new THREE.Group(); const m = mat(pal.main, { roughness: 0.55 }), d = mat(pal.deep, { roughness: 0.6 });
  put(g, sph(0.4, m, 28, 20), [0, 0.4, 0]);
  for (const sx of [-1, 1]) put(g, sph(0.11, d, 12, 10), [sx * 0.24, 0.72, 0.0]);
  addFace(g, 0.4, 0.4);
  return g;
}
function makeEgg(pal) {
  const g = new THREE.Group(); const m = mat(pal.light, { roughness: 0.6 }), d = mat(pal.deep, { roughness: 0.6 });
  put(g, sph(0.38, m, 28, 20), [0, 0.49, 0], null, [1, 1.29, 1]);
  put(g, sph(0.385, d, 28, 12), [0, 0.3, 0], null, [1, 0.6, 1]);           // 下半分の色
  put(g, new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), mat(0x8fd27a)), [0.03, 1.02, 0], [0, 0, -0.4]);
  addFace(g, 0.36, 0.6);
  return g;
}
function makeGourd(pal) {
  const g = new THREE.Group(); const m = mat(pal.main, { roughness: 0.55 }), d = mat(pal.deep, { roughness: 0.6 });
  put(g, sph(0.36, m, 26, 18), [-0.15, 0.36, 0]);
  put(g, sph(0.26, d, 22, 16), [0.35, 0.27, 0]);
  put(g, sph(0.07, mat(0x9a7b5a), 10, 8), [0.6, 0.3, 0]);
  const f = new THREE.Group(); f.position.set(-0.15, 0, 0); addFace(f, 0.36, 0.36); g.add(f);
  return g;
}
function makeWorm(pal) {
  const g = new THREE.Group(); const m = mat(pal.main, { roughness: 0.55 }), l = mat(pal.light, { roughness: 0.55 }), d = mat(pal.deep);
  put(g, sph(0.24, l, 20, 14), [0, 0.24, -0.5]);
  put(g, sph(0.24, m, 20, 14), [0, 0.24, -0.16]);
  put(g, sph(0.24, l, 20, 14), [0, 0.24, 0.18]);
  put(g, sph(0.28, m, 22, 16), [0, 0.28, 0.54]);
  for (const sx of [-1, 1]) {
    g.add(stickMesh([sx * 0.1, 0.5, 0.56], [sx * 0.17, 0.68, 0.6], 0.016, d));
    put(g, sph(0.04, d, 8, 8), [sx * 0.17, 0.69, 0.6]);
  }
  const f = new THREE.Group(); f.position.set(0, 0, 0.54); addFace(f, 0.28, 0.28); g.add(f);
  return g;
}
function makeRabbit(pal) {
  const g = new THREE.Group(); const m = mat(pal.light, { roughness: 0.75 }), d = mat(pal.main, { roughness: 0.7 });
  const pink = mat(0xffb3c7, { roughness: 0.8 });
  put(g, sph(0.32, d, 24, 18), [0, 0.31, 0], null, [1, 0.95, 0.95]);
  put(g, sph(0.2, m, 18, 14), [0, 0.27, 0.16], null, [1, 1, 0.7]);           // おなか
  for (const sx of [-1, 1]) {
    put(g, sph(0.1, m, 12, 10), [sx * 0.15, 0.06, 0.22], null, [1, 0.6, 1.3]);  // 足
    const ear = new THREE.Group(); ear.position.set(sx * 0.1, 0.92, 0); ear.rotation.z = -sx * 0.15; g.add(ear);
    put(ear, capsule(0.075, 0.26, d), [0, 0.15, 0]);
    put(ear, capsule(0.04, 0.2, pink), [0, 0.15, 0.045], null, [1, 1, 0.5]);
  }
  put(g, sph(0.08, m, 10, 8), [0, 0.3, -0.31]);                                // しっぽ
  const h = new THREE.Group(); h.position.set(0, 0.72, 0.05); g.add(h);
  h.add(sph(0.26, d, 22, 16));
  addFace(h, 0.26, 0);
  return g;
}
function makeCar(pal) {
  const g = new THREE.Group(); const m = mat(pal.main, { roughness: 0.45 }), l = mat(pal.light, { roughness: 0.5 });
  const tire = mat(0x5a5466, { roughness: 0.8 }), win = mat(0xffffff, { roughness: 0.3 });
  put(g, rbox(0.62, 0.32, 0.8, 0.1, m), [0, 0.28, 0]);
  put(g, rbox(0.5, 0.3, 0.44, 0.1, l), [0, 0.57, -0.05]);
  put(g, box(0.4, 0.2, 0.02, win), [0, 0.58, 0.175]);                          // まどが顔になる
  for (const sx of [-1, 1]) {
    for (const z of [-0.25, 0.25]) put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16), tire), [sx * 0.31, 0.12, z], [0, 0, Math.PI / 2]);
    put(g, sph(0.05, mat(0xfff3a0, { emissive: 0x665a10 }), 10, 8), [sx * 0.2, 0.3, 0.4]);  // ライト
  }
  addFace(g, 0.2, 0.56, 0.19);
  return g;
}
function makePudding(pal) {
  const g = new THREE.Group(); const m = mat(pal.light, { roughness: 0.4 });
  put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.36, 0.48, 32), m), [0, 0.24, 0]);
  put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.262, 0.27, 0.08, 32), mat(0xc07a3e, { roughness: 0.35 })), [0, 0.47, 0]);
  put(g, sph(0.13, mat(0xffffff, { roughness: 0.6 }), 16, 12), [0, 0.54, 0], null, [1, 0.7, 1]);
  put(g, sph(0.06, mat(pal.deep, { roughness: 0.3 }), 12, 10), [0, 0.65, 0]);
  addFace(g, 0.3, 0.22, 0.31);
  return g;
}
function makeBear(pal) {
  const g = new THREE.Group(); const m = mat(pal.main, { roughness: 0.8 }), l = mat(pal.light, { roughness: 0.8 });
  const dark = mat(0x3a3340, { roughness: 0.4 });
  put(g, sph(0.3, m, 24, 18), [0, 0.3, 0], null, [1, 0.95, 0.9]);
  put(g, sph(0.2, l, 18, 14), [0, 0.28, 0.14], null, [1, 1.05, 0.7]);           // おなか
  for (const sx of [-1, 1]) {
    put(g, sph(0.11, m, 14, 10), [sx * 0.16, 0.09, 0.2], null, [1, 0.8, 1.25]);  // 足
    put(g, sph(0.08, l, 10, 8), [sx * 0.16, 0.09, 0.32], null, [1, 1, 0.4]);     // 足のうら
    put(g, sph(0.09, m, 12, 10), [sx * 0.28, 0.36, 0.08], null, [0.9, 1.3, 0.9]); // うで
  }
  const h = new THREE.Group(); h.position.set(0, 0.7, 0.03); g.add(h);
  h.add(sph(0.25, m, 22, 16));
  for (const sx of [-1, 1]) { put(h, sph(0.09, m, 12, 10), [sx * 0.18, 0.19, -0.02], null, [1, 1, 0.6]); put(h, sph(0.05, l, 10, 8), [sx * 0.18, 0.19, 0.02], null, [1, 1, 0.4]); }
  put(h, sph(0.1, l, 14, 10), [0, -0.07, 0.2], null, [1.15, 0.85, 0.8]);       // 口のまわり
  put(h, sph(0.035, dark, 10, 8), [0, -0.03, 0.29], null, [1.3, 1, 1]);        // はな
  addFace(h, 0.25, 0.03);
  return g;
}
function makePenguin(pal) {
  const g = new THREE.Group(); const d = mat(pal.deep, { roughness: 0.6 }), w = mat(0xffffff, { roughness: 0.7 });
  const o = mat(0xffb259, { roughness: 0.6 });
  put(g, sph(0.3, d, 26, 20), [0, 0.43, 0], null, [1, 1.45, 0.95]);
  put(g, sph(0.24, w, 22, 16), [0, 0.4, 0.12], null, [1, 1.35, 0.72]);          // おなか
  for (const sx of [-1, 1]) {
    put(g, sph(0.2, d, 14, 10), [sx * 0.29, 0.42, 0], [0, 0, sx * 0.3], [0.25, 0.75, 0.5]);   // つばさ
    put(g, sph(0.08, o, 10, 8), [sx * 0.11, 0.03, 0.17], null, [1, 0.4, 1.4]);    // 足
  }
  put(g, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 10), o), [0, 0.6, 0.31], [Math.PI / 2, 0, 0]);   // くちばし
  addFace(g, 0.26, 0.66);
  return g;
}
function makeDonut(pal) {
  const g = new THREE.Group();
  const dough = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.13, 16, 36), mat(0xf2c48d, { roughness: 0.7 }));
  put(g, dough, [0, 0.13, 0], [-Math.PI / 2, 0, 0]);
  const icing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.135, 16, 36), mat(pal.main, { roughness: 0.4 }));
  put(g, icing, [0, 0.165, 0], [-Math.PI / 2, 0, 0], [1, 1, 0.62]);
  const cols = [0xffffff, 0xfff0a8, 0xa9d8ff, 0xb0ecd3, 0xffb3c7];
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2 + 0.2, r = 0.27 + ((i * 7) % 5 - 2) * 0.03;
    if (Math.abs(a - Math.PI / 2) < 0.45) continue;            // 顔のところはあける
    put(g, box(0.05, 0.016, 0.016, mat(cols[i % 5])), [Math.cos(a) * r, 0.25, Math.sin(a) * r], [0, a * 3, 0]);
  }
  const f = new THREE.Group(); f.position.set(0, 0.245, 0.27); f.rotation.x = -Math.PI / 2; g.add(f);   // 上を向いた顔
  addFace(f, 0.2, 0, 0.01);
  return g;
}
function makeCube(pal) {
  const g = new THREE.Group(); const m = mat(pal.main, { roughness: 0.55 }), d = mat(pal.deep, { roughness: 0.6 });
  put(g, rbox(0.68, 0.68, 0.68, 0.09, m), [0, 0.34, 0]);
  put(g, box(0.7, 0.1, 0.7, d), [0, 0.12, 0]);
  addFace(g, 0.3, 0.38, 0.345);
  return g;
}

  // ---- もとからいたキャラ（色を変えられる形に直したもの。pal を渡さないと元の色）----
function makeChick(pal) {
  const g = new THREE.Group(); const o = { roughness: 0.65, metalness: 0.05 };
  const mb = mat(pal ? pal.main : 0xf6c143, o), mw = mat(pal ? pal.deep : 0xf6d743, o);
  const me = mat(0x1a1a1a, o), mo = mat(0xf5941f, o), mf = mat(0xf58d1f, o), mbr = mat(0x73450c, o);
  const mc = mat(pal ? (pal.key === 'pink' ? 0xffd34d : 0xff8fb8) : 0xff50a0, o);
  put(g, sph(0.55, mb, 20, 16), [0, 0.75, 0]);
  put(g, sph(0.4, mb, 20, 16), [0, 1.35, 0.08]);
  put(g, sph(0.055, me, 12, 10), [-0.15, 1.42, 0.42]);
  put(g, sph(0.055, me, 12, 10), [0.15, 1.42, 0.42]);
  put(g, new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 12), mo), [0, 1.32, 0.46], [1.855, 0, 0]);
  put(g, sph(0.3, mw, 14, 12), [-0.5009, 0.85, -0.02], [0.0015, -1.0488, 2.5957], [0.6, 1, 0.35]);
  put(g, sph(0.3, mw, 14, 12), [0.4943, 0.85, -0.02], [0, 0.9291, -2.548], [0.6, 1, 0.35]);
  put(g, sph(0.13, mw, 12, 10), [-0.0234, 0.4687, -0.3805], [-0.395, 0, 0], [1.4271, 0.4141, 1.7247]);
  put(g, box(0.2, 0.07, 0.3, mf), [-0.2, 0.2466, -0.0101], [0.1538, 0, 0]);
  put(g, box(0.2, 0.07, 0.3, mf), [0.2, 0.2519, 0.1199], [-0.0892, 0.0042, -0.003]);
  put(g, sph(0.13, mc, 12, 10), [-0.0018, 1.6976, -0.0885], [-0.4677, -0.0089, -0.0261], [0.6296, 0.9351, 1.1887]);
  put(g, sph(0.5, mbr, 16, 12), [-0.1751, 1.5292, 0.3926], [-0.2561, -0.3673, 0.0369], [0.1732, 0.0414, 0.0454]);
  put(g, sph(0.5, mbr, 16, 12), [0.1637, 1.5292, 0.4063], [-0.2357, 0.3022, -0.1098], [0.1732, 0.039, 0.0454]);
  return g;
}
function makePanda(pal) {
  const model = new THREE.Group();
  const white = mat(0xfaf7f2, { roughness: 0.85 });
  const black = mat(pal ? pal.deep : 0x33333a, { roughness: 0.65 });
  const pink = mat(0xff9fb6, { roughness: 0.9, transparent: true, opacity: 0.9 });
  const dark = mat(0x1c1c22, { roughness: 0.5 });
  const white2 = mat(0xffffff, { roughness: 0.35 });
  const innerM = mat(pal ? pal.light : 0x5a5a63, { roughness: 0.8 });
  put(model, sph(0.56, white, 24, 18), [0, 0.62, 0], null, [1.06, 1.0, 0.98]);
  put(model, sph(0.1, white, 12, 10), [0, 0.5, -0.55]);
  for (const sx of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(sx * 0.24, 0.3, 0.04);
    put(leg, capsule(0.13, 0.16, black), [0, -0.16, 0]);
    put(leg, sph(0.14, black, 14, 12), [0, -0.3, 0.06], null, [1.1, 0.7, 1.25]);
    model.add(leg);
    const arm = new THREE.Group(); arm.position.set(sx * 0.5, 0.82, 0.06);
    put(arm, capsule(0.11, 0.2, black), [0, -0.17, 0]);
    put(arm, sph(0.13, black, 14, 12), [0, -0.34, 0]);
    model.add(arm);
  }
  const head = new THREE.Group(); head.position.set(0, 1.3, 0.06); model.add(head);
  head.add(sph(0.45, white, 24, 18));
  for (const sx of [-1, 1]) {
    const ear = new THREE.Group(); ear.position.set(sx * 0.3, 0.3, -0.02);
    put(ear, sph(0.17, black, 18, 16), [0, 0.06, 0], null, [1, 1.05, 0.62]);
    put(ear, sph(0.09, innerM, 14, 12), [0, 0.06, 0.06], null, [1, 1, 0.4]);
    head.add(ear);
    put(head, sph(0.15, black, 18, 16), [sx * 0.17, 0.03, 0.36], [-0.15, 0, sx * 0.5], [0.8, 1.2, 0.42]);
    const eye = new THREE.Group(); eye.position.set(sx * 0.17, 0.05, 0.395);
    put(eye, sph(0.08, white2, 16, 14), null, null, [1, 1, 0.5]);
    put(eye, sph(0.047, dark, 14, 12), [0, 0, 0.022], null, [1, 1, 0.55]);
    put(eye, new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })), [sx * 0.016 + 0.012, 0.016, 0.045]);
    head.add(eye);
    put(head, sph(0.085, pink, 14, 12), [sx * 0.3, -0.08, 0.33], null, [1, 0.72, 0.35]);
  }
  put(head, sph(0.06, dark, 14, 12), [0, -0.06, 0.44], null, [1.5, 1.0, 0.9]);
  put(head, sph(0.05, mat(0x7a3a45, { roughness: 0.6 }), 14, 12), [0, -0.17, 0.42], null, [1.3, 0.5, 0.6]);
  return model;
}
// ※ 環境マップが無い画面でも暗くならないよう、金属感（metalness）をおさえてあります
  function makeDog(pal) {
  const rig = new THREE.Group();
  const dogBody = mat(pal ? pal.light : 0xf7f2e6, { metalness: 0.05, roughness: 0.5 });
  const dogAcc = mat(pal ? pal.deep : 0x62b0e8, { metalness: 0.15, roughness: 0.4 });
  const dogDark = mat(0x2e3338, { metalness: 0.1, roughness: 0.55 });
  put(rig, box(0.85, 0.58, 1.45, dogBody), [0, 0.56, 0]);
  const hg = new THREE.Group(); hg.position.set(0, 0.88, 0.8); rig.add(hg);
  hg.add(box(0.66, 0.58, 0.62, dogBody));
  put(hg, box(0.38, 0.27, 0.36, mat(0xffe0b0, { roughness: 0.6 })), [0, -0.14, 0.42]);
  put(hg, box(0.34, 0.1, 0.32, mat(0xf0c898, { roughness: 0.6 })), [0, -0.26, 0.42]);
  put(hg, sph(0.065, dogDark, 8, 8), [0, -0.08, 0.61]);
  for (const x of [-0.19, 0.19]) put(hg, sph(0.07, dogDark, 10, 10), [x, 0.06, 0.3]);
  for (const x of [-0.24, 0.24]) {
    const pv = new THREE.Group(); pv.position.set(x, 0.28, -0.02);
    put(pv, new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.36, 8), dogAcc), [0, 0.18, 0]);
    hg.add(pv);
  }
  for (const [x, z] of [[-0.32, -0.5], [0.32, -0.5], [-0.32, 0.5], [0.32, 0.5]]) put(rig, box(0.2, 0.48, 0.2, dogDark), [x, 0.26, z]);
  const tp = new THREE.Group();
  put(tp, new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.045, 0.55, 8), dogBody), [0, 0.28, 0]);
  put(tp, sph(0.085, dogAcc, 8, 8), [0, 0.56, 0]);
  tp.position.set(0, 0.72, -0.72); tp.rotation.x = -0.55; rig.add(tp);
  return rig;
}
function makeCat(pal) {
  const rig = new THREE.Group();
  const fur = mat(pal ? pal.main : 0x8c8f98, { roughness: 0.85 });
  const belly = mat(0xe6e2da, { roughness: 0.9 });
  const dark = mat(0x35322f, { roughness: 0.7 });
  put(rig, sph(0.46, fur, 16, 14), [0, 0.44, 0], null, [1.0, 0.86, 1.18]);
  put(rig, sph(0.33, belly, 12, 10), [0, 0.30, 0.10], null, [1.0, 0.7, 1.1]);
  const head = new THREE.Group(); head.position.set(0, 0.78, 0.34); rig.add(head);
  put(head, sph(0.30, fur, 16, 14), null, null, [1.05, 0.95, 0.95]);
  put(head, sph(0.15, belly, 12, 10), [0, -0.09, 0.22], null, [1.1, 0.72, 0.8]);
  put(head, new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.05, 6), mat(0xe89aa8)), [0, -0.05, 0.33], [Math.PI / 2, 0, 0]);
  for (const x of [-0.16, 0.16]) {
    const p = new THREE.Group(); p.position.set(x, 0.22, 0.02);
    put(p, new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.20, 4), fur), [0, 0.10, 0]); head.add(p);
  }
  for (const x of [-0.13, 0.13]) {
    put(head, sph(0.055, mat(0x9fd86a, { emissive: 0x2a4a18 }), 10, 10), [x, 0.03, 0.245]);
    put(head, box(0.012, 0.07, 0.01, dark), [x, 0.03, 0.30]);
  }
  for (const [x, z] of [[-0.24, -0.28], [0.24, -0.28], [-0.24, 0.28], [0.24, 0.28]])
    put(rig, new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.26, 8), fur), [x, 0.09, z]);
  const tail = new THREE.Group();
  put(tail, new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.035, 0.62, 8), fur), [0, 0.31, 0]);
  put(tail, sph(0.055, belly, 8, 8), [0, 0.62, 0]);
  tail.position.set(0, 0.50, -0.46); tail.rotation.x = -0.9; rig.add(tail);
  return rig;
}

  // ---- 外に出す ----
  const NEW_CHARS = {
    chick:   { name: 'ひよこ',     create: makeChick, orig: true },
    panda:   { name: 'パンダ',     create: makePanda, orig: true },
    dog:     { name: 'いぬロボ',   create: makeDog,   orig: true },
    cat:     { name: 'ネコ',       create: makeCat,   orig: true },
    ball:    { name: 'まんまる',   create: makeBall },
    egg:     { name: 'たまご',     create: makeEgg },
    gourd:   { name: 'ひょうたん', create: makeGourd },
    worm:    { name: 'いもむし',   create: makeWorm },
    cube:    { name: 'しかく',     create: makeCube },
    rabbit:  { name: 'うさぎ',     create: makeRabbit },
    car:     { name: 'くるま',     create: makeCar },
    pudding: { name: 'プリン',     create: makePudding },
    bear:    { name: 'くま',       create: makeBear },
    penguin: { name: 'ペンギン',   create: makePenguin },
    donut:   { name: 'ドーナツ',   create: makeDonut },
  };
  // 新キャラは pal を省くとピンク。もとからいたキャラ（orig:true）は pal を省くと元の色
  const withPal = (f) => (pal) => f(pal || NEW_PALETTES.pink);
  window.NEW_PALETTES = NEW_PALETTES;
  window.NEW_CHARS = NEW_CHARS;
  for (const k in NEW_CHARS) if (!NEW_CHARS[k].orig) NEW_CHARS[k].create = withPal(NEW_CHARS[k].create);
  window.createBall = NEW_CHARS.ball.create;       window.createEgg = NEW_CHARS.egg.create;
  window.createGourd = NEW_CHARS.gourd.create;     window.createWorm = NEW_CHARS.worm.create;
  window.createCube = NEW_CHARS.cube.create;       window.createRabbit = NEW_CHARS.rabbit.create;
  window.createCar = NEW_CHARS.car.create;         window.createPudding = NEW_CHARS.pudding.create;
  window.createBear = NEW_CHARS.bear.create;       window.createPenguin = NEW_CHARS.penguin.create;
  window.createDonut = NEW_CHARS.donut.create;
})();
