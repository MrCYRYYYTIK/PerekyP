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

function proveritModalki() {
  if (!pokazyvatModalki) return;
  var now = Date.now();
  var sutki = 24 * 60 * 60 * 1000;
  var bon = (now - poslBonus) >= sutki;
  var rul = (now - poslRul) >= sutki && dengi >= 500;
  if (bon) {
    var summy = [300, 500, 800, 1200, 1800, 2500, 5000];
    var sled = seriyaDney + 1;
    if (sled > 7) sled = 7;
    document.getElementById('modalSeriya').textContent = sled;
    document.getElementById('modalPrize').textContent = '+' + formatChislo(summy[sled - 1]) + ' ₽';
    otkritModal('modalBonus');
    return;
  }
  if (rul) otkritModal('modalRul');
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
  inv.push({
    uid: Date.now() + Math.random(),
    itemId: item.id,
    kupCena: cena,
    ap: 0
  });
  kupilVsego++;
  dobavitOpyt(Math.floor(cena / 50));
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
  if (moy.ap >= 5) { toast('🔧 Максимум +5', 'err'); return; }
  var stoimost = stoimostApa(item, moy.ap);
  var en = energiyaZaAp(item, moy.ap);
  if (dengi < stoimost) { toast('💸 Нужно ' + formatChislo(stoimost) + '₽', 'err'); return; }
  if (energ < en) { toast('⚡ Нужно ' + en + ' энергии', 'err'); return; }

  dengi = dengi - stoimost;
  energ = energ - en;
  moy.ap = moy.ap + 1;
  dobavitOpyt(Math.floor(stoimost / 100));
  toast('🔧 Улучшено до +' + moy.ap + ' (−' + en + ' ⚡)', 'ok');
  sohranit();
  render();
}

function vystavitLot(uid) {
  var idx = -1;
  for (var i = 0; i < inv.length; i++) if (inv[i].uid == uid) idx = i;
  if (idx == -1) return;
  var moy = inv[idx];
  var item = naytiTovar(moy.itemId);
  var minC = minCenaTovara(item, moy.ap);
  var maxC = maxCenaTovara(item, moy.ap);

  var vvod = prompt(
    '💰 Выставь свою цену\n\n' +
    'Можно от ' + formatChislo(minC) + ' до ' + formatChislo(maxC) + '₽\n\n' +
    'Апгрейд: +' + moy.ap + ' (повышает шанс)\n' +
    'Комиссия: ' + formatChislo(komissiyaZa(maxC)) + '₽ (макс)',
    minC
  );

  if (vvod === null) return;
  var moyaCena = parseInt(vvod);
  if (isNaN(moyaCena)) { toast('❌ Введи число!', 'err'); return; }
  if (moyaCena < minC) { toast('📉 Минимум ' + formatChislo(minC), 'err'); return; }
  if (moyaCena > maxC) { toast('📈 Максимум ' + formatChislo(maxC), 'err'); return; }

  var kom = komissiyaZa(moyaCena);
  if (dengi < kom) { toast('💸 Нужно ' + formatChislo(kom) + '₽ на комиссию', 'err'); return; }

  dengi = dengi - kom;
  inv.splice(idx, 1);
  var lot = {
    uid: Date.now() + Math.random(),
    itemId: moy.itemId,
    kupCena: moy.kupCena,
    ap: moy.ap,
    moyaCena: moyaCena,
    vremyaStart: Date.now()
  };
  rasschitatShansICena(lot, item);
  loty.push(lot);
  toast('🏷️ Лот за ' + formatChislo(moyaCena) + '₽', 'ok');
  sohranit();
  render();
}

function zabratLot(uid) {
  var idx = -1;
  for (var i = 0; i < loty.length; i++) if (loty[i].uid == uid) idx = i;
  if (idx == -1) return;
  var l = loty[idx];
  inv.push({
    uid: Date.now() + Math.random(),
    itemId: l.itemId,
    kupCena: l.kupCena,
    ap: l.ap
  });
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

  var shans = l.shansProdagy || 50;
  var prodano = Math.random() * 100 < shans;
  energ = energ - 1;

  if (prodano) {
    var komissiya = Math.floor(l.moyaCena * 0.1);
    var itog = l.moyaCena - komissiya;
    dengi = dengi + itog;
    var prof = itog - l.kupCena;
    loty.splice(idx, 1);
    prodalVsego++;
    dobavitOpyt(Math.floor(l.moyaCena / 50));
    proveritDostizheniya();
    toast('💰 Продано! ' + formatChislo(itog) + '₽ (комиссия ' + formatChislo(komissiya) + '₽)', 'ok');
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
  for (var i = 0; i < inv.length
