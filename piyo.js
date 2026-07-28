// ===================== ヒヨコ（Three.js）単体抜き出し版 =====================
// 元プロジェクト：ぴよシューティング
// 依存：three.js（グローバル版 r128 系。`THREE.xxx` で参照する形式）
//
// 使い方：
//   const chickModel = createChick();
//   chickModel.position.set(0, -1.0, 0); // 足元基準なので、置きたい位置に応じて調整
//   chickModel.rotation.y = Math.PI;      // くちばしを-Z方向に向けたい場合はこの回転を入れる
//   chickModel.scale.setScalar(0.85);
//   scene.add(chickModel);
//
// モデルはボーン等を持たない静的パーツ構成（体・頭・目・くちばし・羽根・しっぽ・
// 足・リボン風の飾り2つ）。アニメーションさせたい場合は、返ってきたgroup配下の
// children を名前や順番で拾うか、下記関数を編集して各パーツの参照を
// 別オブジェクトに保存する形に直すこと（パンダの抜き出し版と同じやり方）。

function createChick() {
  const group = new THREE.Group();

  const bodyGeo = new THREE.SphereGeometry(0.55, 20, 16);
  const body = new THREE.Mesh(
    bodyGeo,
    new THREE.MeshStandardMaterial({ color: 0xf6c143, roughness: 0.65, metalness: 0.05 })
  );
  body.position.set(0, 0.75, 0);
  group.add(body);

  const headGeo = new THREE.SphereGeometry(0.4, 20, 16);
  const head = new THREE.Mesh(
    headGeo,
    new THREE.MeshStandardMaterial({ color: 0xf6c143, roughness: 0.65, metalness: 0.05 })
  );
  head.position.set(0, 1.35, 0.08);
  group.add(head);

  const eyeLGeo = new THREE.SphereGeometry(0.055, 12, 10);
  const eyeL = new THREE.Mesh(
    eyeLGeo,
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.65, metalness: 0.05 })
  );
  eyeL.position.set(-0.15, 1.42, 0.42);
  group.add(eyeL);

  const eyeRGeo = new THREE.SphereGeometry(0.055, 12, 10);
  const eyeR = new THREE.Mesh(
    eyeRGeo,
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.65, metalness: 0.05 })
  );
  eyeR.position.set(0.15, 1.42, 0.42);
  group.add(eyeR);

  const beakGeo = new THREE.ConeGeometry(0.09, 0.2, 12);
  const beak = new THREE.Mesh(
    beakGeo,
    new THREE.MeshStandardMaterial({ color: 0xf5941f, roughness: 0.65, metalness: 0.05 })
  );
  beak.position.set(0, 1.32, 0.46);
  beak.rotation.set(1.855, 0, 0);
  group.add(beak);

  const wingLGeo = new THREE.SphereGeometry(0.3, 14, 12);
  const wingL = new THREE.Mesh(
    wingLGeo,
    new THREE.MeshStandardMaterial({ color: 0xf6d743, roughness: 0.65, metalness: 0.05 })
  );
  wingL.position.set(-0.5009, 0.85, -0.02);
  wingL.rotation.set(0.0015, -1.0488, 2.5957);
  wingL.scale.set(0.6, 1, 0.35);
  group.add(wingL);

  const wingRGeo = new THREE.SphereGeometry(0.3, 14, 12);
  const wingR = new THREE.Mesh(
    wingRGeo,
    new THREE.MeshStandardMaterial({ color: 0xf6d743, roughness: 0.65, metalness: 0.05 })
  );
  wingR.position.set(0.4943, 0.85, -0.02);
  wingR.rotation.set(0, 0.9291, -2.548);
  wingR.scale.set(0.6, 1, 0.35);
  group.add(wingR);

  const tailTipGeo = new THREE.SphereGeometry(0.13, 12, 10);
  const tailTip = new THREE.Mesh(
    tailTipGeo,
    new THREE.MeshStandardMaterial({ color: 0xf6d743, roughness: 0.65, metalness: 0.05 })
  );
  tailTip.position.set(-0.0234, 0.4687, -0.3805);
  tailTip.rotation.set(-0.395, 0, 0);
  tailTip.scale.set(1.4271, 0.4141, 1.7247);
  group.add(tailTip);

  const footLGeo = new THREE.BoxGeometry(0.2, 0.07, 0.3);
  const footL = new THREE.Mesh(
    footLGeo,
    new THREE.MeshStandardMaterial({ color: 0xf58d1f, roughness: 0.65, metalness: 0.05 })
  );
  footL.position.set(-0.2, 0.2466, -0.0101);
  footL.rotation.set(0.1538, 0, 0);
  group.add(footL);

  const footRGeo = new THREE.BoxGeometry(0.2, 0.07, 0.3);
  const footR = new THREE.Mesh(
    footRGeo,
    new THREE.MeshStandardMaterial({ color: 0xf58d1f, roughness: 0.65, metalness: 0.05 })
  );
  footR.position.set(0.2, 0.2519, 0.1199);
  footR.rotation.set(-0.0892, 0.0042, -0.003);
  group.add(footR);

  // 頭上のちょんまげ風の飾り（黄色）
  const tailTip_2Geo = new THREE.SphereGeometry(0.13, 12, 10);
  const tailTip_2 = new THREE.Mesh(
    tailTip_2Geo,
    new THREE.MeshStandardMaterial({ color: 0xff50a0, roughness: 0.65, metalness: 0.05 })
  );
  tailTip_2.position.set(-0.0018, 1.6976, -0.0885);
  tailTip_2.rotation.set(-0.4677, -0.0089, -0.0261);
  tailTip_2.scale.set(0.6296, 0.9351, 1.1887);
  group.add(tailTip_2);

  // 頬の赤み（左右）
  const sphere2Geo = new THREE.SphereGeometry(0.5, 16, 12);
  const sphere2 = new THREE.Mesh(
    sphere2Geo,
    new THREE.MeshStandardMaterial({ color: 0x73450c, roughness: 0.65, metalness: 0.05 })
  );
  sphere2.position.set(-0.1751, 1.5292, 0.3926);
  sphere2.rotation.set(-0.2561, -0.3673, 0.0369);
  sphere2.scale.set(0.1732, 0.0414, 0.0454);
  group.add(sphere2);

  const sphere2_2Geo = new THREE.SphereGeometry(0.5, 16, 12);
  const sphere2_2 = new THREE.Mesh(
    sphere2_2Geo,
    new THREE.MeshStandardMaterial({ color: 0x73450c, roughness: 0.65, metalness: 0.05 })
  );
  sphere2_2.position.set(0.1637, 1.5292, 0.4063);
  sphere2_2.rotation.set(-0.2357, 0.3022, -0.1098);
  sphere2_2.scale.set(0.1732, 0.039, 0.0454);
  group.add(sphere2_2);

  return group;
}

// ES Module環境（import * as THREE from 'three'）で使う場合は以下を有効化
// export { createChick };
