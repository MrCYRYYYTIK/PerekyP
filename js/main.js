function vkDostupen() {
  return typeof vkBridge !== 'undefined' && vkBridge && typeof vkBridge.send === 'function';
}

if (vkDostupen()) {
  vkBridge.send('VKWebAppInit').catch(function() {});
  vkBridge.send('VKWebAppGetUserInfo')
    .then(function(u) { user = u; posleZagruzki(); })
    .catch(function() { user = { id: 0, first_name: 'Гость', last_name: '' }; posleZagruzki(); });
} else {
  user = { id: 0, first_name: 'Гость', last_name: '' };
  posleZagruzki();
}

function posleZagruzki() {
  obnovitChasy();
  render();
  setInterval(obnovitChasy, 1000);
  setInterval(function() { sohranit(); }, 5000);
  setInterval(function() {
    if (tab == 'lots' || tab == 'market' || tab == 'dom' || tab == 'food') render();
  }, 1500);
  setInterval(function() { proveritDostizheniya(); }, 5000);
  setTimeout(proveritModalki, 600);

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      igrovoySdvig = tekuscheeIgrovoeMs();
      vremyaZahoda = Date.now();
      sohranit();
    } else {
      vremyaZahoda = Date.now();
    }
  });
}

var vseTaby = document.querySelectorAll('.tab');
for (var i = 0; i < vseTaby.length; i++) {
  vseTaby[i].onclick = function() {
    for (var j = 0; j < vseTaby.length; j++) vseTaby[j].classList.remove('active');
    this.classList.add('active');
    tab = this.getAttribute('data-tab');
    render();
  };
}

zagruzit();
maxEnerg = 20 + lvl * 2;
primenitTemu();
render();
