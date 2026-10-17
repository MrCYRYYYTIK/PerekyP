var MNOZHITEL_V_IGRE = 60;

var KOMISSIYA_LOTA_PROCENT = 0.005;
var KOMISSIYA_LOTA_MAX = 10000;
var KOMISSIYA_PRODAZHI_PROCENT = 0.10;
var MAX_APGREYD = 5;
var SROK_LOTA_MS = 99999999999;
var APGREYD_CENA_BAZA = 0.4;
var APGREYD_CENA_ZA_AP = 0.4;
var APGREYD_CENA_MIN = 0.4;
var APGREYD_CENA_MAX = 0.6;
var CENA_DIAPAZON_MIN = 0.7;
var CENA_DIAPAZON_MAX = 1.5;
var SHANS_BAZA = 95;
var SHANS_RAZMER = 85;
var SHANS_BONUS_ZA_AP = 8;
var VREMYA_PRODAZHI_MIN = 5;
var VREMYA_PRODAZHI_MAX = 60;
var EDA_KULDAUN_MIN = 30;
var SON_CHASOV_NORMA = 11;
var SON_DO_CHASA = 9;
var SON_S = 22;
var EDINIC_OPYT_ZA_POKUPKU = 50;
var EDINIC_OPYT_ZA_APGREYD = 100;
var EDINIC_OPYT_ZA_SON = 20;
var EDINIC_OPYT_ZA_BONUS = 50;

var eda = [
  { id: 'shaurma', name: '🥙 Шаурма', cena: 500, energ: 1, desc: 'Быстро и дёшево' },
  { id: 'pizza', name: '🍕 Пицца', cena: 2000, energ: 6, desc: 'Средний вариант' },
  { id: 'burger', name: '🍔 Бургер', cena: 5000, energ: 15, desc: 'Сытный обед' },
  { id: 'rest', name: '🍾 Ресторан', cena: 15000, energ: 50, desc: 'Полный запас' }
];

var doma = [
  { id: 'street', name: 'Улица', icon: '🛣️', cena: 0, son: 3, desc: 'Спишь на лавке' },
  { id: 'garage', name: 'Гараж', icon: '🏚️', cena: 50000, son: 6, desc: 'Хоть крыша есть' },
  { id: 'flat_1', name: 'Однушка', icon: '🏠', cena: 300000, son: 10, desc: 'Своя квартира' },
  { id: 'flat_2', name: 'Двушка', icon: '🏢', cena: 800000, son: 15, desc: 'Просторно' },
  { id: 'house', name: 'Дом', icon: '🏡', cena: 2500000, son: 20, desc: 'Настоящий дом' },
  { id: 'villa', name: 'Вилла', icon: '🏰', cena: 10000000, son: 25, desc: 'Роскошь' },
  { id: 'mansion', name: 'Особняк', icon: '🏛️', cena: 50000000, son: 30, desc: 'Мечта магната' }
];

var dostizheniya = [
  { id: 'first_buy', name: 'Первая покупка', desc: 'Купи первый товар', icon: '🛒', reward: 10, done: false },
  { id: 'first_sell', name: 'Первая продажа', desc: 'Продай первый товар', icon: '💰', reward: 20, done: false },
  { id: 'sell_10', name: 'Десять сделок', desc: 'Продай 10 товаров', icon: '📈', reward: 100, done: false },
  { id: 'sell_50', name: 'Перекуп-про', desc: 'Продай 50 товаров', icon: '🔥', reward: 500, done: false },
  { id: 'sell_100', name: 'Первая сотня', desc: 'Продай 100 товаров', icon: '🏪', reward: 2000, done: false },
  { id: 'sell_200', name: 'Магнат', desc: 'Продай 200 товаров', icon: '💎', reward: 5000, done: false },
  { id: 'sell_1000', name: 'Тысячник', desc: 'Продай 1000 товаров', icon: '🏬', reward: 20000, done: false },
  { id: 'sell_5000', name: 'Промышленник', desc: 'Продай 5000 товаров', icon: '🏭', reward: 200000, done: false },
  { id: 'lvl_5', name: 'Пятый уровень', desc: 'Достигни 5 уровня', icon: '⭐', reward: 200, done: false },
  { id: 'lvl_10', name: 'Десятый уровень', desc: 'Достигни 10 уровня', icon: '🌟', reward: 1000, done: false },
  { id: 'lvl_15', name: 'Пятнадцатый', desc: 'Достигни 15 уровня', icon: '🌠', reward: 5000, done: false },
  { id: 'lvl_20', name: 'Двадцатый уровень', desc: 'Достигни 20 уровня', icon: '🏆', reward: 10000, done: false },
  { id: 'lvl_25', name: 'Двадцать пятый', desc: 'Достигни 25 уровня', icon: '💫', reward: 50000, done: false },
  { id: 'lvl_30', name: 'Тридцатый', desc: 'Достигни 30 уровня', icon: '✨', reward: 200000, done: false },
  { id: 'money_10k', name: 'Первые 10000', desc: 'Накопи 10000₽', icon: '💵', reward: 300, done: false },
  { id: 'money_100k', name: 'Сто тысяч', desc: 'Накопи 100000₽', icon: '🏆', reward: 2000, done: false },
  { id: 'money_1m', name: 'Миллионер', desc: 'Накопи 1 000 000₽', icon: '👑', reward: 20000, done: false },
  { id: 'money_10m', name: 'Десять миллионов', desc: 'Накопи 10 000 000₽', icon: '💠', reward: 100000, done: false },
  { id: 'money_100m', name: 'Сто миллионов', desc: 'Накопи 100 000 000₽', icon: '💸', reward: 1000000, done: false },
  { id: 'money_1b', name: 'Миллиардер', desc: 'Накопи 1 000 000 000₽', icon: '💎', reward: 10000000, done: false },
  { id: 'money_10b', name: 'Богатейший', desc: 'Накопи 10 000 000 000₽', icon: '🤑', reward: 100000000, done: false },
  { id: 'dom_flat1', name: 'Своя квартира', desc: 'Купи однюшку', icon: '🏠', reward: 2000, done: false },
  { id: 'dom_flat2', name: 'Просторно', desc: 'Купи двушку', icon: '🏢', reward: 5000, done: false },
  { id: 'dom_house', name: 'Свой дом', desc: 'Купи дом', icon: '🏡', reward: 10000, done: false },
  { id: 'dom_villa', name: 'Вилла', desc: 'Купи виллу', icon: '🏰', reward: 50000, done: false },
  { id: 'dom_mansion', name: 'Особняк', desc: 'Купи особняк', icon: '🏛️', reward: 200000, done: false },
  { id: 'dom_vtoroy', name: 'Второй дом', desc: 'Купи место под 2-й дом', icon: '🏗️', reward: 100000, done: false },
  { id: 'up_5', name: 'Мастер', desc: 'Апни товар до +5', icon: '🔧', reward: 500, done: false },
  { id: 'up_10', name: 'Инженер', desc: 'Апни 10 товаров до +5', icon: '⚙️', reward: 10000, done: false },
  { id: 'up_50', name: 'Техник', desc: 'Апни 50 товаров до +5', icon: '🛠️', reward: 100000, done: false },
  { id: 'lot_first', name: 'Первая выставка', desc: 'Выставь первый лот', icon: '🏷️', reward: 100, done: false },
  { id: 'lot_100', name: 'Оптовик', desc: 'Выставь 100 лотов', icon: '📦', reward: 20000, done: false },
  { id: 'food_shaurma', name: 'Первый перекус', desc: 'Купи шаурму', icon: '🥙', reward: 50, done: false },
  { id: 'food_rest', name: 'Ресторатор', desc: 'Купи ресторан', icon: '🍾', reward: 500, done: false },
  { id: 'sleep_10', name: 'Соня', desc: 'Поспи 10 раз', icon: '😴', reward: 1000, done: false },
  { id: 'skin_king', name: 'Король', desc: 'Купи скин «Король рынка»', icon: '👑', reward: 5000, done: false },
  { id: 'skin_dragon', name: 'Дракон', desc: 'Купи скин «Дракон»', icon: '🐲', reward: 50000, done: false },
  { id: 'bank_first', name: 'Первый кредит', desc: 'Возьми кредит', icon: '🏦', reward: 200, done: false },
  { id: 'bank_clean', name: 'Чистый', desc: 'Погаси долг', icon: '✅', reward: 500, done: false },
  { id: 'roulette_win', name: 'Джекпот', desc: 'Выиграй 10000₽', icon: '🎰', reward: 500, done: false }
];

var skiny = [
  { id: '👤', name: 'Обычный', price: 0 },
  { id: '💼', name: 'Бизнесмен', price: 1000 },
  { id: '🕶️', name: 'Крутой', price: 3000 },
  { id: '🎩', name: 'Магнат', price: 10000 },
  { id: '👑', name: 'Король рынка', price: 50000 },
  { id: '🤴', name: 'Император', price: 200000 },
  { id: '🐲', name: 'Дракон', price: 1000000 }
];

var tovari = [
  { id: 'phone', name: '📱 Старый телефон', cena: 500, lvl: 1, ap: 200, category: 'tech' },
  { id: 'sneak', name: '👟 Кроссовки', cena: 2000, lvl: 1, ap: 500, category: 'clothes' },
  { id: 'bike', name: '🚲 Велосипед', cena: 8000, lvl: 2, ap: 2000, category: 'tech' },
  { id: 'laptop', name: '💻 Ноутбук', cena: 25000, lvl: 3, ap: 6000, category: 'tech' },
  { id: 'guitar', name: '🎸 Гитара', cena: 50000, lvl: 4, ap: 12000, category: 'music' },
  { id: 'tv', name: '📺 Телевизор', cena: 80000, lvl: 5, ap: 20000, category: 'tech' },
  { id: 'moto', name: '🏍️ Мотоцикл', cena: 200000, lvl: 7, ap: 50000, category: 'auto' },
  { id: 'car_old', name: '🚗 Старая машина', cena: 500000, lvl: 9, ap: 120000, category: 'auto' },
  { id: 'car_new', name: '🚙 Хорошая машина', cena: 1500000, lvl: 11, ap: 350000, category: 'auto' },
  { id: 'car_premium', name: '🚘 Премиум-тачка', cena: 4000000, lvl: 13, ap: 1000000, category: 'auto' },
  { id: 'car_sport', name: '🏎️ Спорткар', cena: 12000000, lvl: 15, ap: 3000000, category: 'auto' },
  { id: 'penthouse', name: '🏘️ Пентхаус', cena: 25000000, lvl: 18, ap: 6000000, category: 'realty' },
  { id: 'island', name: '🏝️ Остров', cena: 50000000, lvl: 21, ap: 12000000, category: 'realty' },
  { id: 'car_super', name: '⚡ СУПЕР-КАР', cena: 100000000, lvl: 25, ap: 25000000, category: 'auto' }
];

function naytiTovar(itemId) {
  for (var i = 0; i < tovari.length; i++) if (tovari[i].id == itemId) return tovari[i];
  return null;
}

function naytiDom(id) {
  for (var i = 0; i < doma.length; i++) if (doma[i].id == id) return doma[i];
  return null;
}

function randomCena(baza) {
  var x = 0.85 + Math.random() * 0.3;
  return Math.floor(baza * x);
}

function minCenaTovara(item, ap) {
  return Math.floor(item.cena * (1 + ap * APGREYD_CENA_BAZA) * CENA_DIAPAZON_MIN);
}

function maxCenaTovara(item, ap) {
  return Math.floor(item.cena * (1 + ap * APGREYD_CENA_MAX) * CENA_DIAPAZON_MAX);
}

function komissiyaZa(price) {
  if (price <= 10000) return 0;
  var k;
  if (price <= 100000) k = Math.floor(price * 0.003);
  else k = Math.floor(price * 0.005);
  if (k > KOMISSIYA_LOTA_MAX) k = KOMISSIYA_LOTA_MAX;
  return k;
}

function komissiyaProdaZhi(price) {
  if (price <= 5000) return Math.floor(price * 0.03);
  if (price <= 50000) return Math.floor(price * 0.05);
  if (price <= 500000) return Math.floor(price * 0.07);
  return Math.floor(price * 0.10);
}

function energiyaZaAp(item, ap) {
  return 1 + Math.floor(item.lvl / 3) + ap;
}

function stoimostApa(item, ap) {
  return Math.floor(item.ap * (1 + ap * APGREYD_CENA_ZA_AP));
}

function trebOpyt(dlyaUrovnya) {
  if (dlyaUrovnya <= 1) return 0;
  if (dlyaUrovnya <= 20) return Math.floor(1000 * Math.pow(1.5, dlyaUrovnya - 1));
  var base = Math.floor(1000 * Math.pow(1.5, 19));
  var sverh = dlyaUrovnya - 20;
  return base + Math.floor(1000 * Math.pow(3.5, sverh));
}

function formatChislo(n) {
  n = Math.round(n);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
