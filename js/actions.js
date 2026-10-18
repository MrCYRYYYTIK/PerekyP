function toast(msg, tip) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show';
  if (tip == 'ok') t.style.background = '#2a5';
  else if (tip == 'err') t.style.background = '#a33';
  else if (tip == 'gold') t.style.background = '#a80';
  else t.style.background = '#444';
  setTimeout(function() { t.className = 'toast'; }, 2200);
}

function otkritModal(id) { document.getElementById(id).classList.add('show'); }
function zakrModal(id) { document.getElementById(id).classList.remove('show'); }

function proveritObnovlenie() {
  if (posledVidenVersiya === TEKUSHCHAYA_VERSIYA) return;
  otkritModal('modalObnovlenie');
}

function zakrObnovlenie() {
  posledVidenVersiya = TEKUSHCHAYA_VERSIYA;
  zakrModal('modalObnovlenie');
  sohranit();
  render();
}

function proveritModalki() {
  if (!pokazyvatModalki) return;
  var now = Date.now();
  var sutki = 24 * 60 * 60 * 1000;
  if ((now - poslBonus) >= sutki) {
    var summy = [300, 500, 800, 1200, 1800, 2500, 5000];
    var sled = seriyaDney + 1;
    if (sled > 7) sled = 7;
    document.getElementById('modalSeriya').textContent = sled;
    document.getElementById('modalPrize').textContent = '+' + formatChislo(summy[sled - 1]) + ' ₽';
    otkritModal('modalBonus');
  }
}

function kupit(itemId) {
  var item = naytiTovar(itemId);
  if (!item) return;
  if (item.lvl > lvl) { toast('🔒 Нужен уровень ' + item.lvl, 'err'); return; }
  var cena = randomCena(item.cena);
  if (dengi < cena) { toast('💸 Мало денег', 'err'); return; }
  if (energ < 1) { toast('⚡ Нет энергии', 'err'); return; }

  dengi = dengi - cena;
  energ = energ - 1;
  inv.push({ uid: Date.now() + Math.random(), itemId: item.id, kupCena: cena, ap: 0 });
  kupilVsego++;
  dobavitOpyt(Math.floor(cena / EDINIC_OPYT_ZA_POKUPKU));
  proveritDostizheniya();
  toast('✅ Куплено за ' + formatChislo(cena) + '₽', 'ok');
  sohranit();
  render();
}

function apnut(uid) {
  var moy = null;
  for (var i = 0; i < inv.length; i++) if (inv[i].uid == uid) moy = inv[i];
  if (!moy) return;
  var item = naytiTovar(moy.itemId);
  if (moy.ap >= MAX_APGREYD) { toast('🔧 Максимум +' + MAX_APGREYD, 'err'); return; }
  var stoimost = stoimostApa(item, moy.ap);
  var en = energiyaZaAp(item, moy.ap);
  if (dengi < stoimost) { toast('💸 Нужно ' + formatChislo(stoimost) + '₽', 'err'); return; }
  if (energ < en) { toast('⚡ Нужно ' + en + ' энергии', 'err'); return; }

  dengi = dengi - stoimost;
  energ = energ - en;
  moy.ap = moy.ap + 1;
  if (moy.ap === MAX_APGREYD) apnutoDo5++;
  dobavitOpyt(Math.floor(stoimost / EDINIC_OPYT_ZA_APGREYD));
  toast('🔧 Улучшено до +' + moy.ap + ' (−' + en + ' ⚡)', 'ok');
  sohranit();
  render();
}

var lotTekushchiyUid = null;

function otkritModalLota(uid) {
  var idx = -1;
  for (var i = 0; i < inv.length; i++) if (inv[i].uid == uid) idx = i;
  if (idx == -1) return;
  var moy = inv[idx];
  var item = naytiTovar(moy.itemId);
  var minC = minCenaTovara(item, moy.ap);
  var maxC = maxCenaTovara(item, moy.ap);

  lotTekushchiyUid = uid;

  var modal = document.getElementById('modalLota');
  if (!modal) return;
  document.getElementById('lotaItemName').textContent = item.name + (moy.ap > 0 ? ' +' + moy.ap : '');
  document.getElementById('lotaMin').textContent = formatChislo(minC);
  document.getElementById('lotaMax').textContent = formatChislo(maxC);
  document.getElementById('lotaCena').value = Math.floor((minC + maxC) / 2);
  document.getElementById('lotaCena').min = minC;
  document.getElementById('lotaCena').max = maxC;
  document.getElementById('lotaOshibka').style.display = 'none';
  otkritModal('modalLota');
}

function podtverdLota() {
  if (lotTekushchiyUid === null) return;
  var idx = -1;
  for (var i = 0; i < inv.length; i++) if (inv[i].uid == lotTekushchiyUid) idx = i;
  if (idx == -1) { zakrModal('modalLota'); return; }
  var moy = inv[idx];
  var item = naytiTovar(moy.itemId);
  var minC = minCenaTovara(item, moy.ap);
  var maxC = maxCenaTovara(item, moy.ap);

  var moyaCena = parseInt(document.getElementById('lotaCena').value);
  var osh = document.getElementById('lotaOshibka');
  osh.style.display = 'none';

  if (isNaN(moyaCena)) { osh.textContent = '❌ Введи число!'; osh.style.display = 'block'; return; }
  if (moyaCena < minC) { osh.textContent = '📉 Минимум ' + formatChislo(minC) + '₽'; osh.style.display = 'block'; return; }
  if (moyaCena > maxC) { osh.textContent = '📈 Максимум ' + formatChislo(maxC) + '₽'; osh.style.display = 'block'; return; }

  inv.splice(idx, 1);
  var lot = {
    uid: Date.now() + Math.random(),
    itemId: moy.itemId,
    kupCena: moy.kupCena,
    ap: moy.ap,
    moyaCena: moyaCena,
    vremyaStart: Date.now(),
    vremyaAktivnosti: Date.now() + 5000 + 30000,
    srokDo: Date.now() + SROK_LOTA_MS
  };
  rasschitatShansICena(lot, item);
  loty.push(lot);
  vystavlenoLotov++;
  toast('🏷️ Лот за ' + formatChislo(moyaCena) + '₽', 'ok');
  lotTekushchiyUid = null;
  zakrModal('modalLota');
  sohranit();
  render();
}

function zabratLot(uid) {
  var idx = -1;
  for (var i = 0; i < loty.length; i++) if (loty[i].uid == uid) idx = i;
  if (idx == -1) return;
  var l = loty[idx];
  inv.push({ uid: Date.now() + Math.random(), itemId: l.itemId, kupCena: l.kupCena, ap: l.ap });
  loty.splice(idx, 1);
  toast('↩️ Лот снят', 'ok');
  sohranit();
  render();
}

function prodatLot(uid) {
  var idx = -1;
  for (var i = 0; i < loty.length; i++) if (loty[i].uid == uid) idx = i;
  if (idx == -1) return;
  var l = loty[idx];
  if (energ < 1) { toast('⚡ Нет энергии', 'err'); return; }

  if (l.vremyaAktivnosti && Date.now() > l.vremyaAktivnosti) {
    var item2 = naytiTovar(l.itemId);
    rasschitatShansICena(l, item2);
    toast('😴 Покупатель ушёл. Ждать заново: ' + Math.round(l.vremyaOzhidaniya / 1000) + ' сек', 'err');
    sohranit();
    render();
    return;
  }

  var shans = l.shansProdagy || 50;
  var prodano = Math.random() * 100 < shans;
  energ = energ - 1;

  if (prodano) {
    var itog = l.moyaCena - komissiyaProdaZhi(l.moyaCena);
    dengi = dengi + itog;
    loty.splice(idx, 1);
    prodalVsego++;
    dobavitOpyt(Math.floor(l.moyaCena / EDINIC_OPYT_ZA_POKUPKU));
    proveritDostizheniya();
    toast('💰 Продано! ' + formatChislo(itog) + '₽', 'ok');
  } else {
    var item = naytiTovar(l.itemId);
    rasschitatShansICena(l, item);
    toast('😕 Не купили! Ждать заново: ' + Math.round(l.vremyaOzhidaniya / 1000) + ' сек', 'err');
  }
  sohranit();
  render();
}

function prodatMgnovenno(uid) {
  var idx = -1;
  for (var i = 0; i < inv.length; i++) if (inv[i].uid == uid) idx = i;
  if (idx == -1) return;
  var moy = inv[idx];
  if (energ < 1) { toast('⚡ Нет энергии', 'err'); return; }

  var item = naytiTovar(moy.itemId);
  var maxC = maxCenaTovara(item, moy.ap);
  var cenaProd = Math.floor(maxC * 0.75);
  var itog = cenaProd - komissiyaProdaZhi(cenaProd);
  var prof = itog - moy.kupCena;

  dengi = dengi + itog;
  energ = energ - 1;
  inv.splice(idx, 1);
  prodalVsego++;
  dobavitOpyt(Math.floor(cenaProd / EDINIC_OPYT_ZA_APGREYD));
  proveritDostizheniya();
  toast('⚡ Срочно: ' + formatChislo(itog) + '₽', prof >= 0 ? 'ok' : 'err');
  sohranit();
  render();
}

function sest() {
  var v = vremyaIgry();
  if (poslSonDen === v.den) { toast('😴 Ты уже спал сегодня', 'err'); return; }
  if (v.chas >= SON_DO_CHASA && v.chas < SON_S) { toast('😴 Спать можно только ночью (22:00–09:00)', 'err'); return; }

  var chasSpal;
  if (v.chas >= SON_S) chasSpal = (24 - v.chas) + SON_DO_CHASA;
  else chasSpal = SON_DO_CHASA - v.chas;
  if (chasSpal > SON_CHASOV_NORMA) chasSpal = SON_CHASOV_NORMA;

  var dom = naytiDom(moeDom);
  var sonMax = sonDomaSUp(dom, domUp);
  var dobavka = Math.floor(sonMax * (chasSpal / SON_CHASOV_NORMA));
  if (dobavka < 1) dobavka = 1;

  energ = energ + dobavka;
  if (energ > maxEnerg) energ = maxEnerg;

  var minSpal = chasSpal * 60;
  igrovoySdvig += minSpal * 60 * 1000;
  vremyaZahoda = Date.now();

  var novoeVremya = vremyaIgry();
  poslSonDen = novoeVremya.den;
  pospalRaz++;

  dobavitOpyt(EDINIC_OPYT_ZA_SON);
  toast('😴 Спал ' + chasSpal + ' ч. +' + dobavka + ' ⚡', 'ok');
  sohranit();
  render();
  obnovitChasy();
}

function kupitEdu(id) {
  var e = null;
  for (var i = 0; i < eda.length; i++) if (eda[i].id == id) e = eda[i];
  if (!e) return;

  var v = vremyaIgry();
  var tekMin = v.den * 1440 + v.chas * 60 + v.min;
  if (tekMin - poslEdaMin < EDA_KULDAUN_MIN) {
    var ostalos = EDA_KULDAUN_MIN - (tekMin - poslEdaMin);
    toast('🍽️ Сытый! Через ' + ostalos + ' игровых мин.', 'err');
    return;
  }

  if (dengi < e.cena) { toast('💸 Мало денег', 'err'); return; }
  if (energ >= maxEnerg) { toast('⚡ Энергия полная', 'err'); return; }

  dengi = dengi - e.cena;
  energ = energ + e.energ;
  if (energ > maxEnerg) energ = maxEnerg;
  poslEdaMin = tekMin;
  sEdeno++;
  if (e.id === 'rest') sEdenoRestoran++;
  toast('🍽️ ' + e.name + ': +' + e.energ + ' ⚡', 'ok');
  sohranit();
  render();
}

function kupitDom(id) {
  var d = naytiDom(id);
  if (!d) return;
  if (moeDom == id) { toast('🏠 Уже живёшь тут', 'err'); return; }
  if (dengi < d.cena) { toast('💸 Мало денег', 'err'); return; }

  if (moeDom != 'street') {
    var staryyDom = naytiDom(moeDom);
    var vozvrat = Math.floor(staryyDom.cena * 0.5);
    dengi += vozvrat;
    toast('💸 Старый дом продан за ' + formatChislo(vozvrat) + '₽', 'ok');
  }

  dengi -= d.cena;
  moeDom = id;
  domUp = 0;
  dobavitOpyt(Math.floor(d.cena / 1000));
  proveritDostizheniya();
  toast('🏠 Новый дом: ' + d.name, 'gold');
  sohranit();
  render();
}

function upDom() {
  var d = naytiDom(moeDom);
  if (domUp >= MAX_DOM_UP) { toast('🏗️ Максимум +' + MAX_DOM_UP, 'err'); return; }
  var stoimost = stoimostUpDoma(d, domUp);
  if (dengi < stoimost) { toast('💸 Нужно ' + formatChislo(stoimost) + '₽', 'err'); return; }
  dengi -= stoimost;
  domUp++;
  toast('🏗️ Дом улучшен до +' + domUp, 'gold');
  sohranit();
  render();
}

function kupitMesto() {
  if (vtoroyDom) { toast('❌ Место уже куплено', 'err'); return; }
  var d = naytiDom(moeDom);
  if (d.cena == 0) { toast('❌ Сначала купи дом', 'err'); return; }
  if (dengi < d.cena) { toast('💸 Нужно ' + formatChislo(d.cena) + '₽', 'err'); return; }
  dengi -= d.cena;
  vtoroyDom = 'mesto';
  toast('🏗️ Место куплено!', 'gold');
  proveritDostizheniya();
  sohranit();
  render();
}

function kupitVtoroyDom(id) {
  if (vtoroyDom !== 'mesto') { toast('❌ Сначала купи место', 'err'); return; }
  if (vtoroyDomId) { toast('❌ Второй дом уже куплен', 'err'); return; }
  var d = naytiDom(id);
  if (!d) return;
  if (dengi < d.cena) { toast('💸 Мало денег', 'err'); return; }
  dengi -= d.cena;
  vtoroyDomId = id;
  vtoroyDomUp = 0;
  toast('🏠 Второй дом: ' + d.name, 'gold');
  sohranit();
  render();
}

function upVtoroyDom() {
  if (!vtoroyDomId) { toast('❌ Сначала купи второй дом', 'err'); return; }
  var d = naytiDom(vtoroyDomId);
  if (vtoroyDomUp >= MAX_DOM_UP) { toast('🏗️ Максимум', 'err'); return; }
  var stoimost = stoimostUpDoma(d, vtoroyDomUp);
  if (dengi < stoimost) { toast('💸 Нужно ' + formatChislo(stoimost) + '₽', 'err'); return; }
  dengi -= stoimost;
  vtoroyDomUp++;
  toast('🏗️ Второй дом улучшен до +' + vtoroyDomUp, 'gold');
  sohranit();
  render();
}

function proveritDohod() {
  var v = vremyaIgry();
  if (v.chas < 12) return;
  if (poslDohodDen === v.den) return;

  var totalDohod = 0;
  var d1 = naytiDom(moeDom);
  totalDohod += dohodDomaSUp(d1, domUp);

  if (vtoroyDomId) {
    var d2 = naytiDom(vtoroyDomId);
    totalDohod += Math.floor(d2.cena * ARENDA_PROCENT) + dohodDomaSUp(d2, vtoroyDomUp);
  }

  if (totalDohod > 0) {
    dengi += totalDohod;
    poslDohodDen = v.den;
    toast('🏠 Доход домов: +' + formatChislo(totalDohod) + '₽', 'gold');
  } else {
    poslDohodDen = v.den;
  }
  sohranit();
  render();
}

function propustitVremya(uid) {
  var rnd = Math.random();
  var minPropusk, opisanie;
  if (rnd < 0.60) { minPropusk = 0.5; opisanie = '30 сек'; }
  else if (rnd < 0.85) { minPropusk = 2; opisanie = '2 мин'; }
  else if (rnd < 0.95) { minPropusk = 10; opisanie = '10 мин'; }
  else if (rnd < 0.99) { minPropusk = 60; opisanie = '1 час'; }
  else { minPropusk = 360; opisanie = '6 часов'; }

  var l = null;
  for (var i = 0; i < loty.length; i++) if (loty[i].uid == uid) l = loty[i];

  if (!l) {
    igrovoySdvig += minPropusk * 60 * 1000;
    vremyaZahoda = Date.now();
    toast('⏩ Пропущено: ' + opisanie, 'gold');
    sohranit();
    render();
    obnovitChasy();
    return;
  }

  var gotov = sekDoProdazhi(l) <= 0;
  var sekAktiv = 999;
  if (l.vremyaAktivnosti) {
    sekAktiv = Math.ceil((l.vremyaAktivnosti - Date.now()) / 1000);
  }
  var aktivno = gotov && sekAktiv > 0;

  if (aktivno && minPropusk * 60 * 1000 > sekAktiv * 1000) {
    var item2 = naytiTovar(l.itemId);
    rasschitatShansICena(l, item2);
    toast('😴 Пропустил покупателя! Ждать заново: ' + Math.round(l.vremyaOzhidaniya / 1000) + ' сек', 'err');
    igrovoySdvig += minPropusk * 60 * 1000;
    vremyaZahoda = Date.now();
    sohranit();
    render();
    obnovitChasy();
    return;
  }

  igrovoySdvig += minPropusk * 60 * 1000;
  vremyaZahoda = Date.now();
  toast('⏩ Пропущено: ' + opisanie, 'gold');
  sohranit();
  render();
  obnovitChasy();
}

function vzyatBonus() {
  var now = Date.now();
  var sutki = 24 * 60 * 60 * 1000;
  if (now - poslBonus < sutki) { zakrModal('modalBonus'); return; }
  if (poslBonus > 0 && now - poslBonus > sutki * 2) seriyaDney = 0;
  seriyaDney++;
  if (seriyaDney > 7) seriyaDney = 7;
  var summy = [300, 500, 800, 1200, 1800, 2500, 5000];
  var bonus = summy[seriyaDney - 1];
  dengi += bonus;
  poslBonus = now;
  dobavitOpyt(EDINIC_OPYT_ZA_BONUS);
  toast('🎁 День ' + seriyaDney + ': +' + formatChislo(bonus) + '₽!', 'gold');
  zakrModal('modalBonus');
  sohranit();
  render();
}

function vzyatKredit(summy) {
  if (dolg > 0) { toast('❌ Уже есть долг', 'err'); return; }
  var maxK = 5000 + lvl * 3000;
  if (summy > maxK) { toast('❌ Максимум ' + formatChislo(maxK), 'err'); return; }
  dengi += summy;
  dolg = Math.floor(summy * 1.3);
  bralKredit = true;
  toast('🏦 Взял ' + formatChislo(summy) + '₽. Вернуть: ' + formatChislo(dolg) + '₽', 'ok');
  sohranit();
  render();
}

function oplatitDolg() {
  if (dolg <= 0) return;
  if (dengi < dolg) { toast('💸 Не хватает ' + formatChislo(dolg - dengi), 'err'); return; }
  dengi -= dolg;
  toast('✅ Долг погашен: ' + formatChislo(dolg), 'ok');
  dolg = 0;
  platilDolg = true;
  proveritDostizheniya();
  sohranit();
  render();
}

function kupitSkin(id) {
  var sk = null;
  for (var i = 0; i < skiny.length; i++) if (skiny[i].id == id) sk = skiny[i];
  if (!sk) return;
  if (dengi < sk.price) { toast('💸 Мало денег', 'err'); return; }
  if (sk.price > 0) {
    dengi -= sk.price;
    if (sk.id === '👑') skinKingKupil = true;
    if (sk.id === '🐲') skinDragonKupil = true;
    toast('💼 Куплен: ' + sk.name, 'gold');
  }
  activeSkin = sk.id;
  proveritDostizheniya();
  sohranit();
  render();
}

function pereklTemu() { tema = (tema == 'dark') ? 'light' : 'dark'; primenitTemu(); sohranit(); render(); }
function pereklModalki() { pokazyvatModalki = !pokazyvatModalki; sohranit(); render(); }

var keysAnimating = false;
var keysTekushchiy = null;
var keysCenaOplachena = 0;
var keysMozhnoZabrat = false;

function otkritKeys(keysId) {
  if (keysAnimating) { toast('⏳ Подожди...', 'err'); return; }
  var k = null;
  for (var i = 0; i < keysy.length; i++) if (keysy[i].id == keysId) k = keysy[i];
  if (!k) return;
  if (dengi < k.cena) { toast('💸 Мало денег', 'err'); return; }

  dengi -= k.cena;
  keysTekushchiy = k;
  keysCenaOplachena = k.cena;
  keysMozhnoZabrat = false;
  sohranit();
  keysAnimating = true;

  document.getElementById('keysTitle').textContent = k.name;
  document.getElementById('keysOpisanie').textContent = k.desc;
  document.getElementById('keysResult').style.display = 'none';
  document.getElementById('keysBtns').style.display = 'flex';

  var total = 0;
  for (var i = 0; i < k.prizes.length; i++) total += k.prizes[i].weight;
  var rnd = Math.random() * total;
  var sum = 0;
  var vyigral = k.prizes[0];
  for (var j = 0; j < k.prizes.length; j++) {
    sum += k.prizes[j].weight;
    if (rnd <= sum) { vyigral = k.prizes[j]; break; }
  }

  var lenta = [];
  var indexWin = 25;
  for (var n = 0; n < 31; n++) {
    if (n === indexWin) lenta.push(vyigral);
    else lenta.push(k.prizes[Math.floor(Math.random() * k.prizes.length)]);
  }

  var zone = document.getElementById('keysZone');
  var lentaEl = document.getElementById('keysLenta');
  lentaEl.innerHTML = '';
  for (var m = 0; m < lenta.length; m++) {
    var card = document.createElement('div');
    card.className = 'keys-card';
    card.innerHTML = '<div class="keys-card-icon">' + lenta[m].icon + '</div><div class="keys-card-name">' + lenta[m].name + '</div>';
    if (m === indexWin) card.classList.add('win');
    lentaEl.appendChild(card);
  }

  lentaEl.style.transition = 'none';
  lentaEl.style.transform = 'translateX(0px)';

  setTimeout(function() {
    var cardWidth = 88;
    var centerOffset = zone.offsetWidth / 2 - 40;
    var targetX = -(indexWin * cardWidth) + centerOffset;
    lentaEl.style.transition = 'transform 3s cubic-bezier(0.1, 0.9, 0.3, 1)';
    lentaEl.style.transform = 'translateX(' + targetX + 'px)';

    setTimeout(function() {
      if (vyigral.type === 'money') dengi += vyigral.amount;
      else if (vyigral.type === 'item') {
        inv.push({ uid: Date.now() + Math.random(), itemId: vyigral.itemId, kupCena: 0, ap: 0 });
      }
      keysMozhnoZabrat = true;
      keysCenaOplachena = 0;
      document.getElementById('keysResultText').textContent = '🎉 ' + vyigral.icon + ' ' + vyigral.name + '!';
      document.getElementById('keysResult').style.display = 'block';
      document.getElementById('keysBtns').style.display = 'none';
      sohranit();
      render();
    }, 3200);
  }, 50);

  otkritModal('modalKeys');
}

function zakrytKeys() {
  keysAnimating = false;
  keysTekushchiy = null;
  keysCenaOplachena = 0;
  keysMozhnoZabrat = false;
  zakrModal('modalKeys');
}

function otmenitKeys() {
  if (keysMozhnoZabrat) { zakrytKeys(); return; }
  if (keysCenaOplachena > 0) {
    dengi += keysCenaOplachena;
    sohranit();
    toast('💸 Возврат ' + formatChislo(keysCenaOplachena) + '₽', 'ok');
  }
  keysAnimating = false;
  keysTekushchiy = null;
  keysCenaOplachena = 0;
  keysMozhnoZabrat = false;
  zakrModal('modalKeys');
  render();
}

var ADMIN_PAROL = 'Dimasik228';
var klikovPoTitulu = 0;
var vremyaKlikov = 0;

function obrabotatKlikTitul() {
  var now = Date.now();
  if (now - vremyaKlikov > 3000) klikovPoTitulu = 0;
  klikovPoTitulu++;
  vremyaKlikov = now;
  var t = document.getElementById('toast');
  if (t && klikovPoTitulu > 1 && klikovPoTitulu < 5) {
    t.textContent = 'Ещё ' + (5 - klikovPoTitulu) + ' тапов...';
    t.className = 'toast show';
    t.style.background = '#444';
    setTimeout(function() { t.className = 'toast'; }, 800);
  }
  if (klikovPoTitulu >= 5) {
    klikovPoTitulu = 0;
    otkritModal('modalParol');
    document.getElementById('parolInput').value = '';
    document.getElementById('parolErr').style.display = 'none';
  }
}

function otkritParol() {
  otkritModal('modalParol');
  document.getElementById('parolInput').value = '';
  document.getElementById('parolErr').style.display = 'none';
}

function proveritParol() {
  var vvedeno = document.getElementById('parolInput').value;
  if (vvedeno === ADMIN_PAROL) {
    zakrModal('modalParol');
    otkritModal('modalAdmin');
    zapolnitSelects();
  } else {
    document.getElementById('parolErr').style.display = 'block';
  }
}

function zapolnitSelects() {
  var selTov = document.getElementById('admTovar');
  if (selTov && selTov.options.length === 0) {
    for (var i = 0; i < tovari.length; i++) {
      var opt = document.createElement('option');
      opt.value = tovari[i].id;
      opt.textContent = tovari[i].name + ' (' + formatChislo(tovari[i].cena) + '₽)';
      selTov.appendChild(opt);
    }
  }
  var selDom = document.getElementById('admDom');
  if (selDom && selDom.options.length === 0) {
    for (var j = 0; j < doma.length; j++) {
      var opt2 = document.createElement('option');
      opt2.value = doma[j].id;
      opt2.textContent = doma[j].icon + ' ' + doma[j].name;
      selDom.appendChild(opt2);
    }
  }
}

function admDobDengi() { var v = parseInt(document.getElementById('admDengi').value); if (isNaN(v) || v <= 0) return toast('❌ Введи число', 'err'); dengi += v; toast('💰 +' + formatChislo(v) + '₽', 'gold'); sohranit(); render(); }
function admUbrDengi() { var v = parseInt(document.getElementById('admDengi').value); if (isNaN(v) || v <= 0) return toast('❌ Введи число', 'err'); dengi -= v; if (dengi < 0) dengi = 0; toast('💸 −' + formatChislo(v) + '₽', 'err'); sohranit(); render(); }
function admSetDengi() { var v = parseInt(document.getElementById('admDengi').value); if (isNaN(v) || v < 0) return toast('❌ Введи число', 'err'); dengi = v; toast('💰 Установлено: ' + formatChislo(v) + '₽', 'gold'); sohranit(); render(); }
function admSetLvl() { var v = parseInt(document.getElementById('admLvl').value); if (isNaN(v) || v < 1 || v > 100) return toast('❌ 1-100', 'err'); lvl = v; maxEnerg = 20 + lvl * 2; opyt = trebOpyt(lvl); toast('⭐ Уровень: ' + v, 'gold'); sohranit(); render(); }
function admAddOpyt() { var v = parseInt(document.getElementById('admLvl').value); if (isNaN(v) || v <= 0) return toast('❌ Введи число', 'err'); dobavitOpyt(v); toast('📈 +'
