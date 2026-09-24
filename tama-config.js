/* ============================================================
   CONFIG PARTAGÉE (kit v2, sprites PAR STADE) — utilisée par
   le jeu (index.html) ET l'admin (admin.html).
   Chaque "état logique" (idle, happy, eating, dance…) est
   résolu dans le dossier du stade courant, avec repli si absent.
   ============================================================ */
(function () {
  "use strict";

  const KIT = "sprites/ET_kawaii_tamagotchi_kit_v2/";
  const KEY = "tamagotchi_config_v2";

  // --- Listes pour l'admin ---
  const STATE_KEYS = [
    ["idle", "Neutre"], ["happy", "Content"], ["laugh", "Rire"], ["sad", "Triste"],
    ["crying", "Pleure"], ["angry", "Colère"], ["surprised", "Surpris"], ["scared", "Effrayé"],
    ["sleepy", "Somnolent"], ["sleeping", "Dort"], ["hungry", "Faim"], ["eating", "Mange"],
    ["sick", "Malade"], ["dizzy", "Étourdi"], ["sitting", "Assis"], ["playful", "Joueur"],
    ["walk", "Marche"], ["wave", "Salue"], ["jump", "Saute"], ["dance", "Danse"],
    ["love", "Cœur"], ["victory", "Victoire"], ["exhausted", "Épuisé"], ["teddy", "Câlin"], ["bath", "Bain"],
  ];
  const ICONS = [
    ["icons/01_heart.png", "Cœur"], ["icons/02_food_bowl.png", "Gamelle"], ["icons/03_candy.png", "Bonbon"],
    ["icons/04_sleep_zzz.png", "Zzz"], ["icons/05_soap.png", "Savon"], ["icons/06_game_controller.png", "Manette"],
    ["icons/07_medicine.png", "Médoc"], ["icons/08_sparkles.png", "Étincelles"], ["icons/09_ghost.png", "Fantôme"],
    ["icons/10_magic_orb.png", "Orbe"], ["icons/11_small_sparkle.png", "Petite étincelle"], ["icons/12_big_sparkle.png", "Grande étincelle"],
    ["icons/13_heart_glow.png", "Cœur lumineux"], ["icons/14_burst.png", "Flash"], ["icons/15_light_trail.png", "Traînée"],
  ];
  const FX_OPTIONS = [["", "— aucun —"]].concat(ICONS);

  // --- Fichiers disponibles par stade (pour les menus de l'admin) ---
  const STD = ["01_idle", "02_happy", "03_laugh", "04_sad", "05_crying", "06_angry", "07_surprised",
    "08_sleepy", "09_sleeping", "10_hungry", "11_eating", "12_sick", "13_walk", "14_victory", "15_bath"];
  const filesStd = (folder) => STD.map(n => [folder + "/" + n + ".png", n.slice(3)]);
  const babyFiles = []
    .concat(["01_idle", "02_happy", "03_laugh", "04_sad", "05_crying", "06_angry", "07_surprised", "08_scared",
      "09_sleepy", "10_sleeping", "11_hungry", "12_eating", "13_sick", "14_dizzy", "15_sitting"].map(n => ["baby_states/" + n + ".png", n.slice(3)]))
    .concat(["01_playful_wink", "02_walk_01", "03_walk_02", "04_walk_03", "05_walk_04", "06_walk_05", "07_walk_06",
      "08_wave", "09_jump", "10_dance", "11_love_power", "12_victory", "13_exhausted", "14_teddy_hug", "15_bath"].map(n => ["baby_actions/" + n + ".png", n.slice(3)]));
  const STAGE_FILES = {
    baby: babyFiles, teen: filesStd("teen"), adult: filesStd("adult"), elder: filesStd("elder"),
    evolved_stage_1: filesStd("evolved_stage_1"), evolved_stage_2: filesStd("evolved_stage_2"),
  };

  // --- Jeux de sprites par stade ---
  function stdStage(f) {
    return {
      idle: f + "/01_idle.png", happy: f + "/02_happy.png", laugh: f + "/03_laugh.png", sad: f + "/04_sad.png",
      crying: f + "/05_crying.png", angry: f + "/06_angry.png", surprised: f + "/07_surprised.png",
      sleepy: f + "/08_sleepy.png", sleeping: f + "/09_sleeping.png", hungry: f + "/10_hungry.png",
      eating: f + "/11_eating.png", sick: f + "/12_sick.png", walk: [f + "/13_walk.png"],
      victory: f + "/14_victory.png", bath: f + "/15_bath.png",
    };
  }
  const babySprites = {
    idle: "baby_states/01_idle.png", happy: "baby_states/02_happy.png", laugh: "baby_states/03_laugh.png",
    sad: "baby_states/04_sad.png", crying: "baby_states/05_crying.png", angry: "baby_states/06_angry.png",
    surprised: "baby_states/07_surprised.png", scared: "baby_states/08_scared.png", sleepy: "baby_states/09_sleepy.png",
    sleeping: "baby_states/10_sleeping.png", hungry: "baby_states/11_hungry.png", eating: "baby_states/12_eating.png",
    sick: "baby_states/13_sick.png", dizzy: "baby_states/14_dizzy.png", sitting: "baby_states/15_sitting.png",
    playful: "baby_actions/01_playful_wink.png",
    walk: ["baby_actions/02_walk_01.png", "baby_actions/03_walk_02.png", "baby_actions/04_walk_03.png",
      "baby_actions/05_walk_04.png", "baby_actions/06_walk_05.png", "baby_actions/07_walk_06.png"],
    wave: "baby_actions/08_wave.png", jump: "baby_actions/09_jump.png", dance: "baby_actions/10_dance.png",
    love: "baby_actions/11_love_power.png", victory: "baby_actions/12_victory.png", exhausted: "baby_actions/13_exhausted.png",
    teddy: "baby_actions/14_teddy_hug.png", bath: "baby_actions/15_bath.png",
  };

  // Repli quand un état n'existe pas dans un stade
  const FALLBACK = {
    dance: "happy", teddy: "happy", exhausted: "sleepy", love: "happy", wave: "happy", jump: "happy",
    playful: "happy", dizzy: "sick", scared: "surprised", sitting: "idle", laugh: "happy",
    crying: "sad", hungry: "sad", angry: "sad", surprised: "idle", sleepy: "sleeping",
  };

  // --- Configuration par défaut ---
  const DEFAULTS = {
    kitBase: KIT,
    needs: [
      // Décroissance lente, cohérente avec le cycle de vie réaliste (~10 j) :
      // on prend soin du pet quelques fois par jour (une jauge se vide en ~5-12 h).
      { key: "hunger",  label: "Faim",     icon: "icons/02_food_bowl.png", decayPerMin: 0.2,  start: 80 },
      { key: "fun",     label: "Bonheur",  icon: "icons/01_heart.png",     decayPerMin: 0.15, start: 80 },
      { key: "energy",  label: "Énergie",  icon: "icons/04_sleep_zzz.png", decayPerMin: 0.12, start: 90 },
      { key: "hygiene", label: "Propreté", icon: "icons/05_soap.png",      decayPerMin: 0.13, start: 90 },
      { key: "health",  label: "Santé",    icon: "icons/07_medicine.png",  decayPerMin: 0,    start: 100 },
    ],
    thresholds: { hungerLow: 20, funLow: 20, healthLow: 20, energyLow: 15, happyFun: 70, happyHunger: 60 },
    moods: {
      sleeping: "sleeping", sick: "sick", hungry: "hungry", crying: "crying",
      sad: "sad", exhausted: "exhausted", happy: "happy", idle: "idle",
    },
    actions: [
      { id: "feed",   label: "Nourrir", icon: "icons/02_food_bowl.png",     pose: "eating",   duration: 3000, cooldown: 0, fx: "icons/11_small_sparkle.png", fxCount: 7,  effects: { hunger: 28 },                        require: {},             flags: {} },
      { id: "play",   label: "Jouer",   icon: "icons/06_game_controller.png", pose: "dance",  duration: 4000, cooldown: 0, fx: "icons/12_big_sparkle.png",   fxCount: 9,  effects: { fun: 26, energy: -12, hunger: -6 },   require: { energy: 12 }, flags: {} },
      { id: "clean",  label: "Laver",   icon: "icons/05_soap.png",          pose: "bath",     duration: 3000, cooldown: 0, fx: "icons/11_small_sparkle.png", fxCount: 10, effects: {},                                    require: {},             flags: { fillHygiene: true, clearPoops: true } },
      { id: "sleep",  label: "Dormir",  icon: "icons/04_sleep_zzz.png",     pose: "sleeping", duration: 0,    cooldown: 0, fx: "",                           fxCount: 0,  effects: {},                                    require: {},             flags: { toggleSleep: true } },
      { id: "heal",   label: "Soigner", icon: "icons/07_medicine.png",      pose: "victory",  duration: 2500, cooldown: 0, fx: "icons/13_heart_glow.png",    fxCount: 6,  effects: { health: 22 },                        require: {},             flags: { curesSick: true, onlyWhenSick: true } },
      { id: "cuddle", label: "Câliner", icon: "icons/03_candy.png",         pose: "teddy",    duration: 2500, cooldown: 0, fx: "icons/13_heart_glow.png",    fxCount: 9,  effects: { fun: 12, health: 3 },                require: {},             flags: {} },
    ],
    fallback: FALLBACK,
    evolveFx: "icons/14_burst.png",
    eggSheet: {
      file: "egg/eggs.png", cols: 5, rows: 3,
      frames: { idle: 0, happy: 1, laugh: 2, sleeping: 3, scared: 4, angry: 5, surprised: 6, hungry: 7, sick: 8, dirty: 9, crack1: 10, crack2: 11, hatch1: 12, hatch2: 13, hatched: 14 },
    },
    stages: [
      // Timings réalistes (fidèles à un vrai Tamagotchi) : cycle de vie ~10 jours.
      // œuf éclôt à 5 min · bébé ~1 h · ado ~1 j · puis évolutions tous les ~2 j.
      { key: "egg",             label: "Œuf",       fromMin: 0,     scale: 0.62, sprites: {} },
      { key: "baby",            label: "Bébé",      fromMin: 5,     scale: 0.42, sprites: babySprites },
      { key: "teen",            label: "Ado",       fromMin: 65,    scale: 0.48, sprites: stdStage("teen") },
      { key: "adult",           label: "Adulte",    fromMin: 1505,  scale: 0.54, sprites: stdStage("adult") },
      // requireCare : forme réservée aux bons soins (sinon on reste sur la forme précédente)
      { key: "evolved_stage_1", label: "Évolué I",  fromMin: 4385,  scale: 0.58, requireCare: 0.60, sprites: stdStage("evolved_stage_1") },
      { key: "evolved_stage_2", label: "Évolué II", fromMin: 7265,  scale: 0.60, requireCare: 0.72, sprites: stdStage("evolved_stage_2") },
      { key: "elder",           label: "Ancien",    fromMin: 10145, scale: 0.56, sprites: stdStage("elder") },
    ],
    sim: { poopEveryMin: 90, sleepEnergyPerMin: 12, offlineCapMin: 720 },
    // Difficulté : multiplicateur de vitesse de décroissance des besoins (1 = normal, 1.6 = difficile, 0.7 = facile)
    difficulty: 1,
    // Économie : gains de pièces + prix de la boutique (réglables dans l'admin)
    economy: {
      coinsPerCare: 1,               // pièces gagnées par soin (nourrir/laver/soigner/câliner)
      minigameCoinsPerPoint: 1,      // pièces par bonbon attrapé au mini-jeu
      poopCoins: 1,                  // pièces par crotte ramassée
      prices: { flowerhat: 15, wig: 18, necklace: 20, stole: 25, dress: 30, ghost: 35, comic: 10, flower: 14, phone: 16, umbrella: 16, walkie: 18, solar: 22, record: 26, speakspell: 28, phonehome: 45, bike: 50 },
    },
    // Mini-jeu « Jouer »
    minigame: { durationSec: 18, bombRate: 0.17, funMax: 40 },
    // Sprites de crottes (variantes tirées au hasard) ; repli sur un dessin si absent
    poopSprites: ["crottes/crotte01.png", "crottes/crotte02.png", "crottes/crotte03.png"],
    // Aliments proposés au clic sur « Nourrir » (chaque pet a un préféré tiré à la naissance → bonus de bonheur)
    foods: [
      { id: "apple",     label: "Pomme",           emoji: "🍎", sprite: "food/09_pomme.png",              hunger: 14, fun: 4 },
      { id: "banana",    label: "Banane",          emoji: "🍌", sprite: "food/10_banane.png",             hunger: 16, fun: 4 },
      { id: "sandwich",  label: "Sandwich",        emoji: "🥪", sprite: "food/08_sandwich.png",           hunger: 30, fun: 3 },
      { id: "pizza",     label: "Pizza",           emoji: "🍕", sprite: "food/04_part_de_pizza.png",      hunger: 28, fun: 8 },
      { id: "cereal",    label: "Céréales",        emoji: "🥣", sprite: "food/07_bol_de_cereales.png",    hunger: 24, fun: 3 },
      { id: "cookies",   label: "Cookies",         emoji: "🍪", sprite: "food/06_cookies.png",            hunger: 12, fun: 12 },
      { id: "popcorn",   label: "Popcorn",         emoji: "🍿", sprite: "food/05_popcorn.png",            hunger: 10, fun: 10 },
      { id: "candy",     label: "Bonbons",         emoji: "🍬", sprite: "food/01_bonbons_et_favoris.png", hunger: 6,  fun: 14 },
      { id: "candybowl", label: "Bol de bonbons",  emoji: "🍭", sprite: "food/02_bol_de_bonbons.png",     hunger: 8,  fun: 13 },
      { id: "candybox",  label: "Boîte surprise",  emoji: "🎁", sprite: "food/03_boite_de_bonbons.png",   hunger: 10, fun: 15 },
    ],
    // Positions fixes de certains états : { stateKey: {x, y} } en fraction 0..1 (x = horizontal, y = ligne du sol/pieds)
    positions: {},
    // Cycle jour/nuit calé sur l'horloge réelle du joueur (heures de bascule) — sert de repli et de scène par défaut
    room: {
      morning: "chambre/matin.png", day: "chambre/midi.png", evening: "chambre/fin_journee.png", night: "chambre/nuit.png",
      hours: { morning: 6, day: 10, evening: 17, night: 20 },
    },
    // Scènes déblocables (achat en pièces) : chaque scène a son cycle jour/nuit.
    // price 0 = débloquée d'office. Convention images : scenes/<id>/{matin,midi,fin_journee,nuit}.png
    scenes: [
      { id: "chambre", label: "Chambre d'Elliott", price: 0, morning: "chambre/matin.png", day: "chambre/midi.png", evening: "chambre/fin_journee.png", night: "chambre/nuit.png" },
    ],
  };

  // --- Utilitaires ---
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function deepMerge(base, over) {
    if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
    const out = clone(base);
    for (const k in over) out[k] = (isObj(base[k]) && isObj(over[k])) ? deepMerge(base[k], over[k]) : over[k];
    return out;
  }
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { saved = null; }
    return saved ? deepMerge(DEFAULTS, saved) : clone(DEFAULTS);
  }
  function save(cfg) { try { localStorage.setItem(KEY, JSON.stringify(cfg)); return true; } catch { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch {} }

  window.TAMA = { KIT, KEY, STATE_KEYS, ICONS, FX_OPTIONS, STAGE_FILES, DEFAULTS, clone, load, save, reset };
})();
