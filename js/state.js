var igrovoySdvig = 0;
var vremyaZahoda = Date.now();
var posledneeSohr = Date.now();

var user = null;
var dengi = 1000;
var lvl = 1;
var opyt = 0;
var energ = 20;
var maxEnerg = 20;
var inv = [];
var loty = [];
var dolg = 0;
var activeSkin = '👤';
var tab = 'market';
var tema = 'dark';
var moeDom = 'street';
var vtoroyDom = null;

var poslBonus = 0;
var seriyaDney = 0;
var poslRul = 0;
var poslSonDen = 0;
var poslEdaMin = -9999;
var pokazyvatModalki = true;

var kupilVsego = 0;
var prodalVsego = 0;
var jackpotVyl = false;

function tekuscheeIgrovoeMs() {
  var vIgre = (Date.now() - vremyaZahoda) * MNOZHITEL_V_IGRE;
  return igrovoySdvig + vIgre;
}

function vremyaIgry() {
  var ms = tekuscheeIgrovoeMs();
  var vsegoMinut = Math.floor(ms / 60000);
  var den = Math.floor(vsegoMinut / 1440) + 1;
  var chas = Math.floor((vsegoMinut % 1440) / 60);
  var min = vsegoMinut % 60;
  return { den: den, chas: chas, min: min };
}

function formatTime(chas, min) {
  var hh = chas < 10 ? '0' + chas : chas;
  var mm = min < 10 ? '0' + min : min;
  return hh + ':' + mm;
}

function primenitTemu() {
  if (tema == 'light') document.body.classList.add('light');
  else document.body.classList.remove('light');
}

function sohranit() {
  igrovoySdvig = tekuscheeIgrovoeMs();
  vremyaZahoda = Date.now();
  posledneeSohr = Date.now();
  localStorage.setItem('perekup', JSON.stringify({
    dengi: dengi, lvl: lvl, opyt: opyt,
    energ: energ, maxEnerg: maxEnerg,
    inv: inv, loty: loty, dolg: dolg,
    poslBonus: poslBonus, seriyaDney: seriyaDney, poslRul: poslRul,
    poslSonDen: poslSonDen, poslEdaMin: poslEdaMin,
    activeSkin: activeSkin, dostizheniya: dostizheniya,
    kupilVsego: kupilVsego, prodalVsego: prodalVsego,
    jackpotVyl: jackpotVyl, tema: tema, moeDom: moeDom,
    vtoroyDom: vtoroyDom, pokazyvatModalki: pokazyvatModalki,
    igrovoySdvig: igrovoySdvig,
    posledneeSohr: posledneeSohr
  }));
}

function zagruzit() {
  var s = localStorage.getItem('perekup');
  if (s) {
    try {
      var d = JSON.parse(s);
      if (d.dengi != null) dengi = d.dengi;
      if (d.lvl) lvl = d.lvl;
      if (d.opyt != null) opyt = d.opyt;
      if (d.energ != null) energ = d.energ;
      if (d.maxEnerg) maxEnerg = d.maxEnerg;
      if (d.inv) inv = d.inv;
      if (d.loty) {
        loty = d.loty;
        for (var li = 0; li < loty.length; li++) {
          if (!loty[li].srokDo) loty[li].srokDo = Date.now() + 99999999999;
        }
      }
      if (d.dolg) dolg = d.dolg;
      if (d.poslBonus) poslBonus = d.poslBonus;
      if (d.seriyaDney) seriyaDney = d.seriyaDney;
      if (d.poslRul) poslRul = d.poslRul;
      if (d.poslSonDen != null) poslSonDen = d.poslSonDen;
      if (d.poslEdaMin != null) poslEdaMin = d.poslEdaMin;
      if (d.activeSkin) activeSkin = d.activeSkin;
      if (d.dostizheniya) {
        for (var i = 0; i < d.dostizheniya.length; i++) {
          for (var j = 0; j < dostizheniya.length; j++) {
            if (dostizheniya[j].id == d.dostizheniya[i].id) {
              dostizheniya[j].done = d.dostizheniya[i].done;
            }
          }
        }
      }
      if (d.kupilVsego) kupilVsego = d.kupilVsego;
      if (d.prodalVsego) prodalVsego = d.prodalVsego;
      if (d.jackpotVyl) jackpotVyl = d.jackpotVyl;
      if (d.tema) tema = d.tema;
      if (d.moeDom) moeDom = d.moeDom;
      if (d.vtoroyDom != null) vtoroyDom = d.vtoroyDom;
      if (d.pokazyvatModalki != null) pokazyvatModalki = d.pokazyvatModalki;

      var oldSdvig = d.igrovoySdvig || 0;
      var oldSohr = d.posledneeSohr || Date.now();
      var proshloOffline = Date.now() - oldSohr;
      if (proshloOffline < 0) proshloOffline = 0;
      if (proshloOffline > 24 * 60 * 60 * 1000) proshloOffline = 24 * 60 * 60 * 1000;

      igrovoySdvig = oldSdvig + proshloOffline;
    } catch(e) {}
  }
  vremyaZahoda = Date.now();
  posledneeSohr = Date.now();
}

function sbrosProgressa() {
  if (!confirm('⚠️ ТОЧНО сбросить прогресс?')) return;
  if (!confirm('⚠️ Последнее предупреждение!')) return;
  localStorage.removeItem('perekup');
  igrovoySdvig = 0;
  vremyaZahoda = Date.now();
  posledneeSohr = Date.now();
  dengi = 1000;
  lvl = 1;
  opyt = 0;
  maxEnerg = 20 + lvl * 2;
  energ = maxEnerg;
  inv = [];
  loty = [];
  dolg = 0;
  activeSkin = '👤';
  poslBonus = 0;
  seriyaDney = 0;
  poslRul = 0;
  poslSonDen = 0;
  poslEdaMin = -9999;
  kupilVsego = 0;
  prodalVsego = 0;
  jackpotVyl = false;
  moeDom = 'street';
  vtoroyDom = null;
  for (var i = 0; i < dostizheniya.length; i++) dostizheniya[i].done = false;
  toast('🗑️ Прогресс сброшен', 'ok');
  sohranit();
  render();
}

function dobavitOpyt(skolko) {
  opyt += skolko;
  var povysheniya = 0;
  while (opyt >= trebOpyt(lvl + 1)) {
    lvl++;
    povysheniya++;
    maxEnerg = 20 + lvl * 2;
    if (povysheniya > 50) break;
  }
  if (povysheniya > 0) {
    energ = maxEnerg;
    proveritDostizheniya();
    toast('🎉 Уровень ' + lvl + '! +' + (povysheniya * 2) + ' энергии', 'gold');
  }
}

function proveritDostizheniya() {
  for (var i = 0; i < dostizheniya.length; i++) {
    var d = dostizheniya[i];
    if (d.done) continue;
    var vypolnil = false;
    if (d.id == 'first_buy' && kupilVsego >= 1) vypolnil = true;
    if (d.id == 'first_sell' && prodalVsego >= 1) vypolnil = true;
    if (d.id == 'sell_10' && prodalVsego >= 10) vypolnil = true;
    if (d.id == 'sell_50' && prodalVsego >= 50) vypolnil = true;
    if (d.id == 'sell_200' && prodalVsego >= 200) vypolnil = true;
    if (d.id == 'lvl_5' && lvl >= 5) vypolnil = true;
    if (d.id == 'lvl_10' && lvl >= 10) vypolnil = true;
    if (d.id == 'lvl_20' && lvl >= 20) vypolnil = true;
    if (d.id == 'money_10k' && dengi >= 10000) vypolnil = true;
    if (d.id == 'money_100k' && dengi >= 100000) vypolnil = true;
    if (d.id == 'money_1m' && dengi >= 1000000) vypolnil = true;
    if (d.id == 'money_10m' && dengi >= 10000000) vypolnil = true;
    if (d.id == 'dom_house' && moeDom == 'house') vypolnil = true;
    if (d.id == 'dom_villa' && moeDom == 'villa') vypolnil = true;
    if (d.id == 'dom_mansion' && moeDom == 'mansion') vypolnil = true;
    if (d.id == 'roulette_win' && jackpotVyl) vypolnil = true;

    if (vypolnil) {
      d.done = true;
      dengi += d.reward;
      (function(name, r) {
        setTimeout(function() { toast('🏅 ' + name + ' +' + formatChislo(r) + '₽', 'gold'); }, 500);
      })(d.name, d.reward);
    }
  }
}

function rasschitatShansICena(l, item) {
  var minC = minCenaTovara(item, l.ap);
  var maxC = maxCenaTovara(item, l.ap);
  var diap = maxC - minC;
  if (diap < 1) diap = 1;
  var otklonenie = (l.moyaCena - minC) / diap;
  if (otklonenie < 0) otklonenie = 0;
  if (otklonenie > 1) otklonenie = 1;
  var bonusAp = l.ap * 8;
  var shans = 95 - otklonenie * (85 - bonusAp);
  if (shans < 5) shans = 5;
  if (shans > 95) shans = 95;
  var vremya = 5 + otklonenie * 55;
  l.shansProdagy = Math.round(shans);
  l.vremyaOzhidaniya = Math.round(vremya * 1000);
  l.vremyaStart = Date.now();
}

function sekDoProdazhi(l) {
  var proshlo = Date.now() - l.vremyaStart;
  var ostalos = l.vremyaOzhidaniya - proshlo;
  if (ostalos < 0) ostalos = 0;
  return Math.ceil(ostalos / 1000);
}
