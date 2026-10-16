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

function renderBezopasno(funkciya, c, v) {
  try {
    funkciya(c, v);
  } catch(e) {
    console.error('Ошибка рендера:', e);
    c.innerHTML = '<div class="empty">⚠️ Ошибка в этой вкладке<br><br>Обнови игру или перезайди</div>';
  }
}

function render() {
  primenitTemu();
  document.getElementById('balance').textContent = formatChislo(dengi) + ' ₽';
  document.getElementById('level').textContent = lvl;
  document.getElementById('energy').textContent = energ + '/' + maxEnerg;
  obnovitLvlBar();

  var c = document.getElementById('content');
  var v = vremyaIgry();

  if (tab == 'market') renderBezopasno(renderMarket, c, v);
  else if (tab == 'inventory') renderBezopasno(renderInventory, c, v);
  else if (tab == 'lots') renderBezopasno(renderLots, c, v);
  else if (tab == 'food') renderBezopasno(renderFood, c, v);
  else if (tab == 'dom') renderBezopasno(renderDom, c, v);
  else if (tab == 'bank') renderBezopasno(renderBank, c, v);
