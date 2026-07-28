// ===================== パンダ（Three.js）単体抜き出し版 =====================
// 元プロジェクト：パンダランナー
// 依存：three.js（import * as THREE from 'three' 済みであること）
//
// 使い方：
//   const parts = {};                 // パーツ参照を格納するオブジェクト（外から動かす用）
//   const pandaModel = makePanda(parts);
//   scene.add(pandaModel);
//
// parts に入るキー：
//   body, legL, legR, armL, armR, head, earL, earR,
//   eyeL, eyeR, mouth, cheekL, cheekR
//
// これらはピボット（THREE.Group）やメッシュなので、
// parts.legL.rotation.x = ... のように直接動かしてアニメーションできる

function makePanda(parts = {}) {
  const model = new THREE.Group();

  const white = new THREE.MeshStandardMaterial({ color: 0xfaf7f2, roughness: 0.85, metalness: 0 });
  const black = new THREE.MeshStandardMaterial({ color: 0x33333a, roughness: 0.65, metalness: 0 });
  const pink  = new THREE.MeshStandardMaterial({ color: 0xff9fb6, roughness: 0.9, transparent: true, opacity: 0.9 });
  const dark  = new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.5 });
  const white2= new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });

  // 体
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.56, 32, 24), white);
  body.scale.set(1.06, 1.0, 0.98);
  body.position.y = 0.62;
  model.add(body);
  parts.body = body;

  // しっぽ
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), white);
  tail.position.set(0, 0.5, -0.55);
  model.add(tail);

  // 足（ピボットで前後スイング）
  function leg(sx) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.24, 0.3, 0.04);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.16, 6, 12), black);
    m.position.y = -0.16;
    pivot.add(m);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), black);
    foot.scale.set(1.1, 0.7, 1.25);
    foot.position.set(0, -0.3, 0.06);
    pivot.add(foot);
    model.add(pivot);
    return pivot;
  }
  parts.legL = leg(-1);
  parts.legR = leg(1);

  // 腕（ピボット）
  function arm(sx) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.5, 0.82, 0.06);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.2, 6, 12), black);
    m.position.y = -0.17;
    pivot.add(m);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), black);
    paw.position.y = -0.34;
    pivot.add(paw);
    model.add(pivot);
    return pivot;
  }
  parts.armL = arm(-1);
  parts.armR = arm(1);

  // 頭
  const head = new THREE.Group();
  head.position.set(0, 1.3, 0.06);
  model.add(head);
  parts.head = head;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 24), white);
  head.add(skull);

  // 耳（ピボットで傾きツイッチ）
  function ear(sx) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.3, 0.3, -0.02);
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 16), black);
    m.scale.set(1, 1.05, 0.62);
    m.position.y = 0.06;
    pivot.add(m);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), new THREE.MeshStandardMaterial({ color: 0x5a5a63, roughness: 0.8 }));
    inner.scale.set(1, 1, 0.4);
    inner.position.set(0, 0.06, 0.06);
    pivot.add(inner);
    head.add(pivot);
    return pivot;
  }
  parts.earL = ear(-1);
  parts.earR = ear(1);

  // 目のまわりの黒いパッチ（ぶちぶち）
  function patch(sx) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 16), black);
    m.scale.set(0.8, 1.2, 0.42);
    m.position.set(sx * 0.17, 0.03, 0.36);
    m.rotation.z = sx * 0.5;
    m.rotation.x = -0.15;
    head.add(m);
  }
  patch(-1);
  patch(1);

  // 目玉（まばたき用グループ）
  function eye(sx) {
    const grp = new THREE.Group();
    grp.position.set(sx * 0.17, 0.05, 0.395);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 14), white2);
    w.scale.set(1, 1, 0.5);
    grp.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.047, 14, 12), dark);
    p.scale.set(1, 1, 0.55);
    p.position.z = 0.022;
    grp.add(p);
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    s.position.set(sx * 0.016 + 0.012, 0.016, 0.045);
    grp.add(s);
    head.add(grp);
    return grp;
  }
  parts.eyeL = eye(-1);
  parts.eyeR = eye(1);

  // 鼻
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 12), dark);
  nose.scale.set(1.5, 1.0, 0.9);
  nose.position.set(0, -0.06, 0.44);
  head.add(nose);

  // 口（食べるとき開く／表情用）
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), new THREE.MeshStandardMaterial({ color: 0x7a3a45, roughness: 0.6 }));
  mouth.scale.set(1.3, 0.5, 0.6);
  mouth.position.set(0, -0.17, 0.42);
  head.add(mouth);
  parts.mouth = mouth;

  // ほっぺ（ピンク）
  function cheek(sx) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), pink.clone());
    m.scale.set(1, 0.72, 0.35);
    m.position.set(sx * 0.3, -0.08, 0.33);
    head.add(m);
    return m;
  }
  parts.cheekL = cheek(-1);
  parts.cheekR = cheek(1);

  return model;
}

// ES Module環境で使う場合は以下を有効化
// export { makePanda };
