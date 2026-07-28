/* ============================================================
   いぬロボ / おじゃまネコ  Three.jsモデル構築コード
   「ないしょのごはん」ゲーム本体からモデル部分のみを抜き出したもの。
   Three.js (r169系) を想定。マテリアル・ジオメトリはすべて
   プリミティブ（Box/Sphere/Cone/Cylinder）の組み合わせで、
   外部アセット（テクスチャ・glTF等）は使用していません。
   ============================================================ */

import * as THREE from 'three';

/* ============================================================
   いぬロボの構築
   ============================================================ */
export function buildDog(scene){
  const dog = new THREE.Group();
  const rig = new THREE.Group();
  dog.add(rig);

  const dogBody = new THREE.MeshStandardMaterial({ color:0xf7f2e6, metalness:0.35, roughness:0.45 });
  const dogAcc  = new THREE.MeshStandardMaterial({ color:0x62b0e8, metalness:0.5, roughness:0.35 });
  const dogDark = new THREE.MeshStandardMaterial({ color:0x2e3338, metalness:0.5, roughness:0.5 });

  // 胴体
  const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85,0.58,1.45), dogBody);
  bodyMesh.position.y = 0.56; bodyMesh.castShadow = true; rig.add(bodyMesh);

  // 頭部グループ（headGroup.position.z が前方＝顔の向き）
  const headGroup = new THREE.Group();
  headGroup.position.set(0,0.88,0.8); rig.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.66,0.58,0.62), dogBody);
  headMesh.castShadow = true; headGroup.add(headMesh);

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.38,0.27,0.36),
    new THREE.MeshStandardMaterial({ color:0xffe0b0, roughness:0.6 }));
  snout.position.set(0,-0.14,0.42); headGroup.add(snout);

  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.34,0.1,0.32),
    new THREE.MeshStandardMaterial({ color:0xf0c898, roughness:0.6 }));
  jaw.position.set(0,-0.26,0.42); headGroup.add(jaw);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.065,8,8), dogDark);
  nose.position.set(0,-0.08,0.61); headGroup.add(nose);

  // 口についた食べかす演出用（普段は非表示）
  const mouthCrumb = new THREE.Mesh(new THREE.SphereGeometry(0.06,6,6),
    new THREE.MeshStandardMaterial({ color:0xd8a24a }));
  mouthCrumb.position.set(0.12,-0.2,0.55); mouthCrumb.visible = false; headGroup.add(mouthCrumb);

  // 目
  const eyes = [];
  [-0.19,0.19].forEach(x=>{
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.07,10,10), dogDark);
    e.position.set(x,0.06,0.3); headGroup.add(e); eyes.push(e);
  });

  // うるうる用ハイライト（普段は非表示、演出時に表示）
  const shines = [];
  [-0.19,0.19].forEach(x=>{
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.028,8,8),
      new THREE.MeshBasicMaterial({ color:0xffffff }));
    s.position.set(x+0.02,0.10,0.355); s.visible = false;
    headGroup.add(s); shines.push(s);
  });

  // 耳（pivotで前後左右に振れる。気配演出やフリフリに使用）
  const ears = [];
  [-0.24,0.24].forEach((x,i)=>{
    const pivot = new THREE.Group();
    pivot.position.set(x,0.28,-0.02);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14,0.36,8), dogAcc);
    ear.position.y = 0.18; ear.castShadow = true;
    pivot.add(ear);
    headGroup.add(pivot);
    ears.push({ pivot, side:(i===0?-1:1) });
  });

  // 脚（0,1=後ろ足 / 2,3=前足）
  const legs = [];
  [[-0.32,-0.5],[0.32,-0.5],[-0.32,0.5],[0.32,0.5]].forEach(([x,z])=>{
    const lg = new THREE.Group();
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.48,0.2), dogDark);
    leg.position.y = -0.24; leg.castShadow = true;
    lg.add(leg);
    lg.position.set(x,0.5,z);
    rig.add(lg); legs.push(lg);
  });

  // しっぽ（rotation.x で後方へ傾け、rotation.z で左右フリフリさせる）
  const tailPivot = new THREE.Group();
  const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.045,0.55,8), dogBody);
  tailMesh.position.y = 0.28; tailPivot.add(tailMesh);
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.085,8,8), dogAcc);
  tailTip.position.y = 0.56; tailPivot.add(tailTip);
  tailPivot.position.set(0,0.72,-0.72);
  tailPivot.rotation.x = -0.55;   // 後方へ傾ける（頭側に倒れないよう負値）
  rig.add(tailPivot);

  scene.add(dog);

  // rig=姿勢制御（甘えポーズ等でrig.rotation/positionを操作）
  // headGroup, ears, tailPivot, legs は個別アニメーション用の参照
  return { dog, rig, headGroup, ears, legs, tailPivot, eyes, shines, mouthCrumb, jaw };
}

/* ============================================================
   おじゃまネコの構築
   丸みを帯びたシルエット。球体の重ね合わせで構成。
   ============================================================ */
export function buildCat(scene){
  const cat = new THREE.Group();
  const catRig = new THREE.Group();
  cat.add(catRig);

  const catFur   = new THREE.MeshStandardMaterial({ color:0x8c8f98, roughness:0.85 });
  const catBelly = new THREE.MeshStandardMaterial({ color:0xe6e2da, roughness:0.9 });
  const catDark  = new THREE.MeshStandardMaterial({ color:0x35322f, roughness:0.7 });

  // 丸い体（scaleで卵型に潰す）
  const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.46,16,14), catFur);
  catBody.scale.set(1.0,0.86,1.18);
  catBody.position.y = 0.44; catBody.castShadow = true; catRig.add(catBody);

  const catBellyM = new THREE.Mesh(new THREE.SphereGeometry(0.33,12,10), catBelly);
  catBellyM.scale.set(1.0,0.7,1.1);
  catBellyM.position.set(0,0.30,0.10); catRig.add(catBellyM);

  // 丸い頭
  const catHead = new THREE.Group();
  catHead.position.set(0,0.78,0.34); catRig.add(catHead);

  const catHeadM = new THREE.Mesh(new THREE.SphereGeometry(0.30,16,14), catFur);
  catHeadM.scale.set(1.05,0.95,0.95); catHeadM.castShadow = true; catHead.add(catHeadM);

  const catMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.15,12,10), catBelly);
  catMuzzle.scale.set(1.1,0.72,0.8); catMuzzle.position.set(0,-0.09,0.22); catHead.add(catMuzzle);

  const catNose = new THREE.Mesh(new THREE.ConeGeometry(0.045,0.05,6),
    new THREE.MeshStandardMaterial({ color:0xe89aa8 }));
  catNose.rotation.x = Math.PI/2; catNose.position.set(0,-0.05,0.33); catHead.add(catNose);

  // 耳（pivotで気配演出に使用）
  const catEars = [];
  [-0.16,0.16].forEach((x,i)=>{
    const p = new THREE.Group(); p.position.set(x,0.22,0.02);
    const e = new THREE.Mesh(new THREE.ConeGeometry(0.11,0.20,4), catFur);
    e.position.y = 0.10; e.castShadow = true; p.add(e);
    catHead.add(p); catEars.push({ pivot:p, side:(i===0?-1:1) });
  });

  // 目（発光マテリアルで夜目っぽく）
  const catEyes = [];
  [-0.13,0.13].forEach(x=>{
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.055,10,10),
      new THREE.MeshStandardMaterial({ color:0x9fd86a, emissive:0x2a4a18 }));
    e.position.set(x,0.03,0.245); catHead.add(e); catEyes.push(e);
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.012,0.07,0.01), catDark);
    pupil.position.set(x,0.03,0.30); catHead.add(pupil);
  });

  // 短い脚
  const catLegs = [];
  [[-0.24,-0.28],[0.24,-0.28],[-0.24,0.28],[0.24,0.28]].forEach(([x,z])=>{
    const l = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.10,0.26,8), catFur);
    m.position.y = -0.13; m.castShadow = true; l.add(m);
    l.position.set(x,0.22,z); catRig.add(l); catLegs.push(l);
  });

  // しっぽ（後方へ傾け、rotation.zで揺らす）
  const catTail = new THREE.Group();
  const catTailM = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.035,0.62,8), catFur);
  catTailM.position.y = 0.31; catTail.add(catTailM);
  const catTailTip = new THREE.Mesh(new THREE.SphereGeometry(0.055,8,8), catBelly);
  catTailTip.position.y = 0.62; catTail.add(catTailTip);
  catTail.position.set(0,0.50,-0.46);
  catTail.rotation.x = -0.9;
  catRig.add(catTail);

  scene.add(cat);

  return { cat, catRig, catHead, catEars, catEyes, catLegs, catTail };
}
