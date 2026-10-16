function obnovitChasy() {
  var v = vremyaIgry();
  var el = document.getElementById('clock');
  if (el) el.textContent = '🕐 День ' + v.den + ', ' + formatTime(v.chas, v.min);
}

function obnovitLvlBar() {
  var bar = document.getElementById('lvlBar');
  var info = document.getElementById('lvlInfo');
  if (!bar || !info) return;
  var tek = opyt - trebOpyt(lvl);
  var nuzhno = trebOpyt(lvl + 1) - trebOpyt(lvl);
  var p = 0;
  if (nuzhno > 0) p = tek / nuzhno * 100;
  if (p < 0) p = 0;
  if (p > 100) p = 100;
  bar.style.width = p + '%';
  info.textContent = 'Ур. ' + lvl + ' · ' + formatChislo(opyt) + ' / ' + formatChislo(trebOpyt(lvl + 1)) + ' опыта';
}

function render() {
  primenitTemu();
  document.getElementById('balance').textContent = formatChislo(dengi) + ' ₽';
  document.getElementById('level').textContent = lvl;
  document.getElementById('energy').textContent = energ + '/' + maxEnerg;
  obnovitLvlBar();

  var c = document.getElementById('content');
  var v = vremyaIgry();

  if (tab == 'market') renderMarket(c, v);
  else if (tab == 'inventory') renderInventory(c);
  else if (tab == 'lots') renderLots(c);
  else if (tab == 'food') renderFood(c, v);
  else if (tab == 'dom') renderDom(c, v);
  else if (tab == 'bank') renderBank(c);
  else if (tab == 'ach') renderAch(c);
  else if (tab == 'skins') renderSkins(c);
  else if (tab == 'settings') renderSettings(c, v);
}

function renderMarket(c, v) {
  var html = '';
  var mojSon = (poslSonDen !== v.den) && (v.chas >= 22 || v.chas < 9);
  var dom = naytiDom(moeDom);
  html += '<div class="card purple">';
  html += '<div class="card-row">';
  html += '<div class="card-info">';
  html += '<div class="card-name">' + dom.icon + ' ' + dom.name + '</div>';
  html += '<div class="card-meta">Сон: +' + dom.son + ' ⚡</div>';
  html += '</div>';
  if (mojSon && energ < maxEnerg) {
    html += '<button class="btn purple" onclick="sest()">😴 Спать</button>';
  } else if (energ >= maxEnerg) {
    html += '<button class="btn" disabled>⚡ Полная</button>';
  } else if (poslSonDen === v.den) {
    html += '<button class="btn" disabled>✅ Спал</button>';
  } else {
    html += '<button class="btn" disabled>⏳ Ночь</button>';
  }
  html += '</div></div>';

  if (dolg > 0) {
    html += '<div class="banner" style="background:linear-gradient(135deg,#4a0000,#6a0000);border-color:#ff6666">🏦 Долг: ' + formatChislo(dolg) + '₽</div>';
  }

  for (var i = 0; i < tovari.length; i++) {
    var it = tovari[i];
    var zakr = it.lvl > lvl;
    var cena = randomCena(it.cena);
    var knopka = '';
    if (zakr || dengi < cena) {
      knopka = '<button class="btn" disabled>Купить</button>';
    } else {
      knopka = '<button class="btn" onclick="kupit(\'' + it.id + '\')">Купить</button>';
    }
    html += '<div class="card"><div class="card-row">';
    html += '<div class="card-info">';
    html += '<div class="card-name">' + it.name + (zakr ? ' 🔒' : '') + '</div>';
    html += '<div class="card-meta">Ур. ' + it.lvl + ' · База: ' + formatChislo(it.cena) + '₽</div>';
    html += '</div>';
    html += '<div class="card-price">~' + formatChislo(cena) + ' ₽</div>';
    html += knopka;
    html += '</div></div>';
  }
  c.innerHTML = html;
}

function renderInventory(c) {
  if (inv.length == 0) { c.innerHTML = '<div class="empty">📦 Пусто</div>'; return; }
  var h = '';
  for (var m2 = 0; m2 < inv.length; m2++) {
    var m = inv[m2];
    var tovar = naytiTovar(m.itemId);
    if (!tovar) continue;
    var apStoim = stoimostApa(tovar, m.ap);
    var apEn = energiyaZaAp(tovar, m.ap);
    var minC = minCenaTovara(tovar, m.ap);
    var maxC = maxCenaTovara(tovar, m.ap);
    var maxAp = m.ap >= 5;
    h += '<div class="card">';
    h += '<div class="card-row">';
    h += '<div class="card-info">';
    h += '<div class="card-name">' + tovar.name + (m.ap > 0 ? ' +' + m.ap : '') + '</div>';
    h += '<div class="card-meta">Куплено: ' + formatChislo(m.kupCena) + '₽</div>';
    h += '<div class="card-meta">Цена: ' + formatChislo(minC) + '–' + formatChislo(maxC) + '₽</div>';
    h += '</div></div>';
    h += '<div class="card-row" style="margin-top:8px">';
    if (maxAp) {
      h += '<button class="btn small" disabled>✅ Макс ап</button>';
    } else if (dengi >= apStoim && energ >= apEn) {
      h += '<button class="btn small" onclick="apnut(' + m.uid + ')">🔧 ' + formatChislo(apStoim) + '₽ / ' + apEn + '⚡</button>';
    } else {
      h += '<button class="btn small" disabled>🔧 ' + formatChislo(apStoim) + '₽ / ' + apEn + '⚡</button>';
    }
    h += '<button class="btn small green" onclick="vystavitLot(' + m.uid + ')">🏷️ Выставить</button>';
    h += '<button class="btn small" onclick="prodatMgnovenno(' + m.uid + ')">⚡ Срочно</button>';
    h += '</div></div>';
  }
  c.innerHTML = h;
}

function renderLots(c) {
  if (loty.length == 0) { c.innerHTML = '<div class="empty">🏷️ Нет лотов</div>'; return; }
  var hl = '<div class="lot-hint">💡 Дешёвая цена — быстро. Дорогая — долго и риск.</div>';
  for (var w = 0; w < loty.length; w++) {
    var l = loty[w];
    var t2 = naytiTovar(l.itemId);
    var sek = sekDoProdazhi(l);
    var gotov = sek <= 0;
    var shans = l.shansProdagy || 50;
    var progress = 0;
    if (l.vremyaOzhidaniya > 0) {
      progress = 100 - (sek * 1000 / l.vremyaOzhidaniya) * 100;
      if (progress < 0) progress = 0;
      if (progress > 100) progress = 100;
    }
    hl += '<div class="card">';
    hl += '<div class="card-row">';
    hl += '<div class="card-info">';
    hl += '<div class="card-name">' + t2.name + (l.ap > 0 ? ' +' + l.ap : '') + '</div>';
    hl += '<div class="card-meta">Куплено: ' + formatChislo(l.kupCena) + '₽</div>';
    if (gotov) hl += '<div class="lot-chance">✅ Шанс ' + shans + '%</div>';
    else hl += '<div class="lot-timer">⏳ ' + sek + ' сек · шанс ' + shans + '%</div>';
    hl += '</div>';
    hl += '<div class="card-price">' + formatChislo(l.moyaCena) + ' ₽</div>';
    hl += '</div>';
    hl += '<div class="lot-bar"><div class="lot-bar-in" style="width:' + progress + '%"></div></div>';
    hl += '<div class="card-row" style="margin-top:8px">';
    if (gotov) hl += '<button class="btn small green" onclick="prodatLot(' + l.uid + ')">💰 Продать</button>';
    else hl += '<button class="btn small" disabled>⏳ ' + sek + 'с</button>';
    hl += '<button class="btn small red" onclick="zabratLot(' + l.uid + ')">↩️ Снять</button>';
    hl += '</div></div>';
  }
  c.innerHTML = hl;
}

function renderFood(c, v) {
  var tekMin = v.den * 1440 + v.chas * 60 + v.min;
  var mojno = (tekMin - poslEdaMin) >= 30;
  var hf = '';
  if (!mojno) {
    hf += '<div class="banner">🍽️ Следующий приём через ' + (30 - (tekMin - poslEdaMin)) + ' игровых мин.</div>';
  }
  for (var e = 0; e < eda.length; e++) {
    var ee = eda[e];
    hf += '<div class="food-row">';
    hf += '<div class="food-info">';
    hf += '<div class="food-name">' + ee.name + '</div>';
    hf += '<div class="food-desc">' + ee.desc + '</div>';
    hf += '</div>';
    hf += '<div style="text-align:right">';
    hf += '<div class="food-bonus">+' + ee.energ + ' ⚡</div>';
    hf += '<div class="card-meta">' + formatChislo(ee.cena) + '₽</div>';
    hf += '</div>';
    if (!mojno || dengi < ee.cena || energ >= maxEnerg) {
      hf += '<button class="btn small" disabled>Купить</button>';
    } else {
      hf += '<button class="btn small green" onclick="kupitEdu(\'' + ee.id + '\')">Купить</button>';
    }
    hf += '</div>';
  }
  c.innerHTML = hf;
}

function renderDom(c, v) {
  var hd = '';
  var tekushchiy = naytiDom(moeDom);
  hd += '<div class="dom-card">';
  hd += '<div class="dom-emoji">' + tekushchiy.icon + '</div>';
  hd += '<div class="dom-name">' + tekushchiy.name + '</div>';
  hd += '<div class="dom-desc">Сон: +' + tekushchiy.son + ' ⚡</div>';
  hd += '</div>';

  var mojSon2 = (poslSonDen !== v.den) && (v.chas >= 22 || v.chas < 9);
  hd += '<div class="card purple">';
  if (mojSon2 && energ < maxEnerg) {
    hd += '<button class="btn purple full" onclick="sest()">😴 Поспать</button>';
  } else if (energ >= maxEnerg) {
    hd += '<button class="btn full" disabled>⚡ Энергия полная</button>';
  } else if (poslSonDen === v.den) {
    hd += '<button class="btn full" disabled>✅ Уже спал</button>';
  } else {
    hd += '<button class="btn full" disabled>⏳ Спать с 22:00</button>';
  }
  hd += '</div>';

  for (var dd = 0; dd < doma.length; dd++) {
    var d2 = doma[dd];
    if (d2.id == 'street') continue;
    var aktivnyy = (moeDom == d2.id);
    hd += '<div class="card' + (aktivnyy ? ' green' : '') + '">';
    hd += '<div class="card-row">';
    hd += '<div class="card-info">';
    hd += '<div class="card-name">' + d2.icon + ' ' + d2.name + '</div>';
    hd += '<div class="card-meta">Сон: +' + d2.son + ' ⚡</div>';
    hd += '<div class="card-meta">' + (aktivnyy ? '✅ Живёшь тут' : formatChislo(d2.cena) + '₽') + '</div>';
    hd += '</div>';
    if (aktivnyy) hd += '<div class="ach-reward">✅</div>';
    else if (dengi >= d2.cena) hd += '<button class="btn small" onclick="kupitDom(\'' + d2.id + '\')">Купить</button>';
    else hd += '<button class="btn small" disabled>Нет</button>';
    hd += '</div></div>';
  }

  if (!vtoroyDom && tekushchiy.cena > 0) {
    hd += '<div class="card purple">';
    hd += '<div class="card-name" style="margin-bottom:6px">🏗️ Место под 2-й дом</div>';
    hd += '<div class="card-meta">Цена: ' + formatChislo(tekushchiy.cena) + '₽</div>';
    if (dengi >= tekushchiy.cena) {
      hd += '<button class="btn purple full" onclick="kupitMesto()">🏗️ Купить</button>';
    } else {
      hd += '<button class="btn full" disabled>Нужно ' + formatChislo(tekushchiy.cena) + '₽</button>';
    }
    hd += '</div>';
  }
  c.innerHTML = hd;
}

function renderBank(c) {
  var maxK = 5000 + lvl * 3000;
  var hb = '<div class="card">';
  hb += '<div class="card-name" style="margin-bottom:8px">🏦 Банк</div>';
  hb += '<div class="card-meta">Возврат: +30%</div>';
  if (dolg > 0) {
    hb += '<div class="card-meta" style="color:#ff6666">💸 Долг: ' + formatChislo(dolg) + '₽</div>';
    hb += '<button class="btn green full" onclick="oplatitDolg()">✅ Погасить</button>';
  } else {
    hb += '<div class="card-meta">Макс: ' + formatChislo(maxK) + '₽</div>';
  }
  hb += '</div>';
  if (dolg == 0) {
    var summy = [1000, 5000, 20000, 50000, maxK];
    for (var s2 = 0; s2 < summy.length; s2++) {
      var sm = summy[s2];
      if (sm > maxK) continue;
      hb += '<div class="card"><div class="card-row">';
      hb += '<div class="card-info">';
      hb += '<div class="card-name">Взять ' + formatChislo(sm) + '₽</div>';
      hb += '<div class="card-meta">Вернуть: ' + formatChislo(Math.floor(sm * 1.3)) + '₽</div>';
      hb += '</div>';
      hb += '<button class="btn" onclick="vzyatKredit(' + sm + ')">Взять</button>';
      hb += '</div></div>';
    }
  }
  c.innerHTML = hb;
}

function renderAch(c) {
  var ha = '';
  var vyp = 0;
  for (var a = 0; a < dostizheniya.length; a++) {
    var d3 = dostizheniya[a];
    if (d3.done) vyp++;
    ha += '<div class="ach' + (d3.done ? ' done' : '') + '">';
    ha += '<div class="ach-icon">' + d3.icon + '</div>';
    ha += '<div class="ach-info">';
    ha += '<div class="ach-name">' + d3.name + '</div>';
    ha += '<div class="ach-desc">' + d3.desc + '</div>';
    ha += '</div>';
    ha += '<div class="ach-reward">' + (d3.done ? '✅ +' : '+') + formatChislo(d3.reward) + '₽</div>';
    ha += '</div>';
  }
  ha = '<div style="text-align:center;margin-bottom:10px;font-size:12px;color:#888">🏅 ' + vyp + '/' + dostizheniya.length + '</div>' + ha;
  c.innerHTML = ha;
}

function renderSkins(c) {
  var hs = '';
  for (var sk = 0; sk < skiny.length; sk++) {
    var s3 = skiny[sk];
    hs += '<div class="skin' + (activeSkin == s3.id ? ' active' : '') + '">';
    hs += '<div class="skin-icon">' + s3.id + '</div>';
    hs += '<div class="skin-info">';
    hs += '<div class="skin-name">' + s3.name + '</div>';
    hs += '<div class="card-meta">' + (s3.price == 0 ? 'Бесплатно' : formatChislo(s3.price) + '₽') + '</div>';
    hs += '</div>';
    if (activeSkin == s3.id) hs += '<div class="ach-reward">✅</div>';
    else if (dengi >= s3.price) hs += '<button class="btn small" onclick="kupitSkin(\'' + s3.id + '\')">' + (s3.price == 0 ? 'Выбрать' : 'Купить') + '</button>';
    else hs += '<button class="btn small" disabled>Нет</button>';
    hs += '</div>';
  }
  c.innerHTML = hs;
}

function renderSettings(c, v) {
  var hst = '';
  hst += '<div class="setting-row">';
  hst += '<div class="setting-info">';
  hst += '<div class="setting-name">🌗 Тёмная тема</div>';
  hst += '</div>';
  hst += '<div class="switch' + (tema == 'dark' ? ' on' : '') + '" onclick="pereklTemu()"></div>';
  hst += '</div>';

  hst += '<div class="setting-row">';
  hst += '<div class="setting-info">';
  hst += '<div class="setting-name">🎰 Окна при заходе</div>';
  hst += '</div>';
  hst += '<div class="switch' + (pokazyvatModalki ? ' on' : '') + '" onclick="pereklModalki()"></div>';
  hst += '</div>';

  hst += '<div class="card purple">';
  hst += '<div class="card-name">📅 Игровое время</div>';
  hst += '<div class="card-meta">День ' + v.den + ' · ' + formatTime(v.chas, v.min) + '</div>';
  hst += '<div class="card-meta">В игре: 2 сек = 1 мин · Вне игры: 1 сек = 1 сек</div>';
  hst += '</div>';

  hst += '<div class="card">';
  hst += '<div class="card-name">📊 Статистика</div>';
  hst += '<div class="card-meta">Куплено: ' + kupilVsego + ' · Продано: ' + prodalVsego + '</div>';
  hst += '<div class="card-meta">Уровень: ' + lvl + ' · Энергия: ' + energ + '/' + maxEnerg + '</div>';
  hst += '</div>';

  hst += '<div class="card red">';
  hst += '<div class="card-name" style="margin-bottom:8px">🗑️ Сброс</div>';
  hst += '<button class="btn red full" onclick="sbrosProgressa()">Сбросить прогресс</button>';
  hst += '</div>';
  c.innerHTML = hst;
}
