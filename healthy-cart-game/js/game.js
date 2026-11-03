/**
 * healthy-cart-game / js / game.js
 * 실감형 마트 입장 & 진열대 앞 선택 게임, 24종 진열대 뷰, 3D 카드 회전, 돋보기 분석, 간식 월드컵 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // Audio & Sound Engine (Web Audio API + Audio Elements + TTS Voice)
  // ==========================================================================
  class SoundManager {
    constructor() {
      this.enabled = true;
      this.ttsEnabled = true;
      this.audioCtx = null;
      this.soundCache = {};
      this.initAudioElements();
    }

    initAudioContext() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    initAudioElements() {
      const sounds = ['flip', 'drop', 'beep', 'alert', 'fanfare'];
      sounds.forEach(name => {
        try {
          const audio = new Audio(`assets/sounds/${name}.wav`);
          audio.preload = 'auto';
          this.soundCache[name] = audio;
        } catch (e) {
          console.warn('Audio preloading error:', e);
        }
      });
    }

    play(name) {
      if (!this.enabled) return;
      this.initAudioContext();

      const audio = this.soundCache[name];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          this.synthTone(name);
        });
      } else {
        this.synthTone(name);
      }
    }

    synthTone(type) {
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'flip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'drop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
          chordGain.gain.setValueAtTime(0.2, now + idx * 0.08);
          chordGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.4);
          chordOsc.start(now + idx * 0.08);
          chordOsc.stop(now + idx * 0.08 + 0.4);
        });
      }
    }

    speak(text) {
      if (!this.ttsEnabled || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;

      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find(v => v.lang.startsWith('ko'));
      if (koVoice) utterance.voice = koVoice;

      window.speechSynthesis.speak(utterance);
    }
  }

  // ==========================================================================
  // Mart Aisle Corner Definitions & Scenarios
  // ==========================================================================
  const AISLE_CORNERS = [
    {
      index: 0,
      numLabel: '1번 코너',
      shortName: '🍪 과자·스낵',
      title: '🍪 바삭바삭 과자·스낵 진열대',
      subtitle: '짭조름하고 바삭한 과자들이 진열되어 있어요. 뒷면 나트륨과 포화지방을 확인해볼까요?',
      studentWelcome: '"우와~ 바삭한 감자칩이랑 팝콘이다! 근데 기름에 튀긴 과자는 신호등이 무슨 색일까?"',
      categories: ['과자류']
    },
    {
      index: 1,
      numLabel: '2번 코너',
      shortName: '🧁 베이커리·젤리',
      title: '🧁 달콤 폭신 베이커리·디저트 진열대',
      subtitle: '초코파이, 쿠키, 도넛, 젤리가 가득해요! 설탕(당류)이 얼마나 들어있을까요?',
      studentWelcome: '"달콤한 빵이랑 젤리 냄새가 솔솔 나네! 집어서 각설탕이 몇 개 들어있는지 뒤집어 봐야지!"',
      categories: ['베이커리']
    },
    {
      index: 2,
      numLabel: '3번 코너',
      shortName: '🧃 음료수 쇼케이스',
      title: '🧃 시원 톡톡 음료수 냉장 쇼케이스',
      subtitle: '목마를 때 마시는 음료수 코너예요! 설탕 폭탄 음료와 건강한 차를 구별해 보세요.',
      studentWelcome: '"시원한 탄산음료랑 주스, 보리차가 있네! 어떤 음료가 내 몸에 진짜 수분을 채워줄까?"',
      categories: ['음료수']
    },
    {
      index: 3,
      numLabel: '4번 코너',
      shortName: '🥛 유제품 냉장고',
      title: '🥛 신선 튼튼 유제품 쇼케이스',
      subtitle: '우유, 요거트, 치즈, 아이스크림 코너! 가공우유와 순수 유제품의 차이를 찾아보세요.',
      studentWelcome: '"뼈가 튼튼해지는 유제품 코너다! 흰우유랑 바나나우유는 영양성분이 어떻게 다를까?"',
      categories: ['유제품']
    },
    {
      index: 4,
      numLabel: '5번 코너',
      shortName: '🍅 신선 과일·채소',
      title: '🍅 아삭 싱싱 과일·채소 청과 매대',
      subtitle: '비타민과 식이섬유가 살아있는 자연 그대로의 신선 간식 코너예요!',
      studentWelcome: '"알록달록 방울토마토랑 사과, 고구마가 있네! 자연 식품의 신호등 색깔을 확인해볼까?"',
      categories: ['신선식품']
    },
    {
      index: 5,
      numLabel: '6번 코너',
      shortName: '🥜 견과·건강바',
      title: '🥜 고소 든든 견과·에너지바 웰빙 매대',
      subtitle: '두뇌 발달에 좋은 견과류와 통곡물 오트밀바가 진열되어 있어요!',
      studentWelcome: '"고소한 견과류와 통밀 오트밀바 코너야! 출출할 때 먹으면 얼마나 든든할지 살펴보자!"',
      categories: ['견과류', '간식류']
    }
  ];

  const MART_SCENARIOS = {
    afterschool: {
      id: 'afterschool',
      badge: '🎒 방과 후 간식 미션',
      title: '방과 후 출출한 간식 사기 (당류 주의!)',
      goalText: '수업이 끝나고 배가 고파요! 뒷면 성분표를 확인해 [당류 빨간불] 간식을 피하고 3개 이상 골라보세요.',
      evaluate: (cart) => {
        const redSugar = cart.filter(i => i.trafficLight.sugar === 'red');
        const safeItems = cart.filter(i => i.trafficLight.sugar !== 'red');
        return {
          passed: cart.length >= 3 && redSugar.length === 0,
          feedback: redSugar.length === 0
            ? '방과 후 간식으로 당류 빨간불(설탕 폭탄) 간식을 완벽하게 피하고 건강한 간식을 골랐어요!'
            : `앗! 장바구니에 당류 빨간불 간식(${redSugar.map(i => i.name).join(', ')})이 섞여 있어요.`
        };
      }
    },
    picnic: {
      id: 'picnic',
      badge: '🎡 신나는 소풍 미션',
      title: '신나는 소풍 간식 고르기 (나트륨 주의!)',
      goalText: '친구들과 소풍 가서 먹을 간식이에요! 짜지 않은 [나트륨 초록불] 간식을 3개 이상 골라보세요.',
      evaluate: (cart) => {
        const greenSodium = cart.filter(i => i.trafficLight.sodium === 'green');
        const redSodium = cart.filter(i => i.trafficLight.sodium === 'red');
        return {
          passed: greenSodium.length >= 3 && redSodium.length === 0,
          feedback: greenSodium.length >= 3 && redSodium.length === 0
            ? '소풍 간식으로 갈증을 부르는 짠 과자를 피하고 나트륨 초록불 간식을 훌륭하게 골랐어요!'
            : '소풍 간식에 나트륨이 높은 짠 간식이 들어있거나 나트륨 초록불 간식이 3개 미만이에요.'
        };
      }
    },
    sports: {
      id: 'sports',
      badge: '🏃 운동 후 충전 미션',
      title: '체육 시간 후 에너지 충전 (빨간불 ZERO 도전!)',
      goalText: '운동 후 갈증과 에너지를 건강하게 채워요! 빨간불이 하나도 없는 간식을 3개 이상 골라보세요.',
      evaluate: (cart) => {
        const anyRed = cart.filter(i => {
          const tl = i.trafficLight;
          return tl.sugar === 'red' || tl.sodium === 'red' || tl.saturatedFat === 'red';
        });
        return {
          passed: cart.length >= 3 && anyRed.length === 0,
          feedback: anyRed.length === 0
            ? '운동 후 우리 몸에 꼭 필요한 수분·단백질·비타민 간식을 빨간불 하나 없이 완벽하게 골랐어요!'
            : `장바구니에 주의가 필요한 빨간불 성분 간식(${anyRed.map(i => i.name).join(', ')})이 포함되어 있어요.`
        };
      }
    }
  };

  // ==========================================================================
  // Main Game Application Logic
  // ==========================================================================
  class HealthyCartApp {
    constructor() {
      this.sound = new SoundManager();
      this.state = {
        mode: 'adventure', // 'adventure' | 'mart' | 'worldcup'
        currentLevel: 1,
        cart: [],
        inspectedItems: new Set(),
        activeCategory: 'all',
        activeInspectingSnack: null,

        // Immersive Mart Adventure State
        adventure: {
          character: 'boy', // 'boy' (민수) | 'girl' (지아)
          scenarioKey: 'afterschool',
          inStore: false,
          currentAisleIndex: 0,
          score: 0,
          resistedItems: new Set(),     // Red-light snacks inspected and put back on shelf!
          blindBoughtItems: new Set(),  // Snacks put in cart WITHOUT flipping to check nutrition label!
          smartBoughtItems: new Set(),  // Healthy snacks put in cart AFTER checking nutrition label!
          choiceLog: [],                // Chronological log of student decisions in front of shelves
          holdingSnack: null,
          flippedInHand: false
        },

        // World Cup Tournament State
        worldCup: {
          roundName: '16강',
          matches: [],
          currentMatchIndex: 0,
          winners: [],
          champion: null
        }
      };

      this.cacheDOMElements();
      this.bindEvents();
      this.renderCategoryChips();
      this.renderShelves();
      this.renderMission();
      this.updateCartUI();
      this.initWorldCup();
      this.renderAisleMinimap();

      document.body.addEventListener('click', () => {
        this.sound.initAudioContext();
      }, { once: true });
    }

    cacheDOMElements() {
      this.dom = {
        // Mode views & tabs
        adventureGameView: document.getElementById('adventure-game-view'),
        martGameView: document.getElementById('mart-game-view'),
        worldcupSection: document.getElementById('worldcup-section'),
        tabAdventureMode: document.getElementById('tab-adventure-mode'),
        tabMartMode: document.getElementById('tab-mart-mode'),
        tabWorldcupMode: document.getElementById('tab-worldcup-mode'),

        // Adventure Entrance & Aisle elements
        martEntranceScreen: document.getElementById('mart-entrance-screen'),
        entranceDoors: document.getElementById('entrance-doors'),
        btnEnterMart: document.getElementById('btn-enter-mart'),
        martAisleScreen: document.getElementById('mart-aisle-screen'),
        btnBackEntrance: document.getElementById('btn-back-entrance'),
        hudScenarioBadge: document.getElementById('hud-scenario-badge'),
        hudScenarioGoal: document.getElementById('hud-scenario-goal'),
        hudInspectedCount: document.getElementById('hud-inspected-count'),
        hudResistedCount: document.getElementById('hud-resisted-count'),
        hudAdventureScore: document.getElementById('hud-adventure-score'),
        aisleMinimap: document.getElementById('aisle-minimap'),
        aisleSignNumber: document.getElementById('aisle-sign-number'),
        aisleSignTitle: document.getElementById('aisle-sign-title'),
        aisleSignSub: document.getElementById('aisle-sign-sub'),
        btnPrevAisle: document.getElementById('btn-prev-aisle'),
        btnNextAisle: document.getElementById('btn-next-aisle'),
        aisleShelfTop: document.getElementById('aisle-shelf-top'),
        aisleShelfBottom: document.getElementById('aisle-shelf-bottom'),
        studentAvatarActor: document.getElementById('student-avatar-actor'),
        studentSpeechBubble: document.getElementById('student-speech-bubble'),
        studentAvatarImg: document.getElementById('student-avatar-img'),
        pushedCartItemsPreview: document.getElementById('pushed-cart-items-preview'),
        btnGoCheckoutCounter: document.getElementById('btn-go-checkout-counter'),
        btnSideCheckout: document.getElementById('btn-side-checkout'),
        advCartCount: document.getElementById('adv-cart-count'),
        advCartList: document.getElementById('adv-cart-list'),
        advSugarText: document.getElementById('adv-sugar-text'),
        advSugarBar: document.getElementById('adv-sugar-bar'),
        advSodiumText: document.getElementById('adv-sodium-text'),
        advSodiumBar: document.getElementById('adv-sodium-bar'),
        advChoiceLog: document.getElementById('adv-choice-log'),

        // Hand-held Pickup Decision Modal
        handPickupModal: document.getElementById('hand-pickup-modal'),
        pickupCornerBadge: document.getElementById('pickup-corner-badge'),
        btnClosePickup: document.getElementById('btn-close-pickup'),
        pickupStudentFace: document.getElementById('pickup-student-face'),
        pickupStudentThought: document.getElementById('pickup-student-thought'),
        pickupCard3d: document.getElementById('pickup-card-3d'),
        btnPickupFlip: document.getElementById('btn-pickup-flip'),
        pickupTitle: document.getElementById('pickup-title'),
        pickupSnackDesc: document.getElementById('pickup-snack-desc'),
        pickupNutritionSecret: document.getElementById('pickup-nutrition-secret'),
        secretLockedMsg: document.getElementById('secret-locked-msg'),
        secretUnlockedContent: document.getElementById('secret-unlocked-content'),
        btnDecisionPutInCart: document.getElementById('btn-decision-put-in-cart'),
        btnDecisionPutBack: document.getElementById('btn-decision-put-back'),
        decBuySub: document.getElementById('dec-buy-sub'),
        decReturnSub: document.getElementById('dec-return-sub'),

        // Checkout Barcode Scanner Modal
        checkoutScannerModal: document.getElementById('checkout-scanner-modal'),
        btnCloseScanner: document.getElementById('btn-close-scanner'),
        scannerModalBody: document.getElementById('scanner-modal-body'),

        // Mart Grid elements
        shelvesGrid: document.getElementById('shelves-grid'),
        categoryFilters: document.getElementById('category-filters'),
        cartItemsList: document.getElementById('cart-items-list'),
        cartEmptyState: document.getElementById('cart-empty-state'),
        cartCountBadge: document.getElementById('cart-count-badge'),
        cartDock: document.getElementById('cart-dock'),
        cartCalTotal: document.getElementById('cart-cal-total'),
        cartSugarMeter: document.getElementById('cart-sugar-meter'),
        cartSodiumMeter: document.getElementById('cart-sodium-meter'),
        cartLightsSummary: document.getElementById('cart-lights-summary'),
        btnCheckout: document.getElementById('btn-checkout'),

        // Mission UI
        missionLevelBadge: document.getElementById('mission-level-badge'),
        missionTitle: document.getElementById('mission-title'),
        missionDesc: document.getElementById('mission-desc'),
        missionProgressLabel: document.getElementById('mission-progress-label'),
        missionProgressFill: document.getElementById('mission-progress-fill'),
        missionMascot: document.getElementById('mission-mascot'),

        // Modals
        inspectionModal: document.getElementById('inspection-modal'),
        inspectionModalBody: document.getElementById('inspection-modal-body'),
        btnCloseInspection: document.getElementById('btn-close-inspection'),

        reportModal: document.getElementById('report-modal'),
        reportModalBody: document.getElementById('report-modal-body'),
        btnCloseReport: document.getElementById('btn-close-report'),
        btnRestartGame: document.getElementById('btn-restart-game'),

        encyclopediaModal: document.getElementById('encyclopedia-modal'),
        btnOpenHelp: document.getElementById('btn-open-help'),
        btnCloseHelp: document.getElementById('btn-close-help'),

        // World Cup elements
        worldcupRoundLabel: document.getElementById('worldcup-round-label'),
        worldcupMascotTip: document.getElementById('worldcup-mascot-tip'),
        worldcupArena: document.getElementById('worldcup-arena'),
        worldcupCardLeft: document.getElementById('worldcup-card-left'),
        worldcupCardRight: document.getElementById('worldcup-card-right'),
        worldcupChampionScreen: document.getElementById('worldcup-champion-screen'),
        btnRestartWorldcup: document.getElementById('btn-restart-worldcup'),

        // Controls
        btnToggleSound: document.getElementById('btn-toggle-sound'),
        btnToggleTTS: document.getElementById('btn-toggle-tts'),
        toastContainer: document.getElementById('toast-container')
      };
    }

    bindEvents() {
      // Top Navigation Mode Tabs
      this.dom.tabAdventureMode.addEventListener('click', () => {
        this.switchMode('adventure');
      });

      this.dom.tabMartMode.addEventListener('click', () => {
        this.switchMode('mart');
      });

      this.dom.tabWorldcupMode.addEventListener('click', () => {
        this.switchMode('worldcup');
      });

      // Adventure Mode: Character Picker
      document.querySelectorAll('.char-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.sound.play('beep');
          document.querySelectorAll('.char-select-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.state.adventure.character = btn.dataset.char;
          const avatarSrc = this.state.adventure.character === 'girl'
            ? 'assets/images/ui/student-girl.svg'
            : 'assets/images/ui/student-boy.svg';
          this.dom.studentAvatarImg.src = avatarSrc;
          this.dom.pickupStudentFace.src = avatarSrc;
        });
      });

      // Adventure Mode: Scenario Picker
      document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.sound.play('beep');
          document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.state.adventure.scenarioKey = btn.dataset.scenario;
        });
      });

      // Enter Mart Automatic Doors Button
      this.dom.btnEnterMart.addEventListener('click', () => {
        this.enterMartBuilding();
      });

      // Back to Mart Entrance
      this.dom.btnBackEntrance.addEventListener('click', () => {
        this.sound.play('beep');
        this.state.adventure.inStore = false;
        this.dom.entranceDoors.classList.remove('doors-opening');
        this.dom.martAisleScreen.style.display = 'none';
        this.dom.martEntranceScreen.style.display = 'block';
      });

      // Aisle Left/Right Navigation
      this.dom.btnPrevAisle.addEventListener('click', () => {
        this.moveToAisle((this.state.adventure.currentAisleIndex - 1 + AISLE_CORNERS.length) % AISLE_CORNERS.length);
      });

      this.dom.btnNextAisle.addEventListener('click', () => {
        this.moveToAisle((this.state.adventure.currentAisleIndex + 1) % AISLE_CORNERS.length);
      });

      // Keyboard Left/Right Arrow support for walking through the mart
      window.addEventListener('keydown', (e) => {
        if (this.state.mode !== 'adventure' || !this.state.adventure.inStore) return;
        const anyModalOpen = this.dom.handPickupModal.classList.contains('open') ||
                             this.dom.checkoutScannerModal.classList.contains('open') ||
                             this.dom.encyclopediaModal.classList.contains('open');
        if (anyModalOpen) return;

        if (e.key === 'ArrowLeft') {
          this.moveToAisle((this.state.adventure.currentAisleIndex - 1 + AISLE_CORNERS.length) % AISLE_CORNERS.length);
        } else if (e.key === 'ArrowRight') {
          this.moveToAisle((this.state.adventure.currentAisleIndex + 1) % AISLE_CORNERS.length);
        }
      });

      // Hand Pickup Modal Events
      this.dom.btnClosePickup.addEventListener('click', () => {
        this.dom.handPickupModal.classList.remove('open');
      });

      this.dom.btnPickupFlip.addEventListener('click', () => {
        this.flipHeldSnackInHand();
      });

      this.dom.btnDecisionPutInCart.addEventListener('click', () => {
        this.decidePutInCartFromHand();
      });

      this.dom.btnDecisionPutBack.addEventListener('click', () => {
        this.decidePutBackOnShelf();
      });

      // Checkout Counter Buttons
      this.dom.btnGoCheckoutCounter.addEventListener('click', () => {
        this.openCheckoutScanner();
      });
      this.dom.btnSideCheckout.addEventListener('click', () => {
        this.openCheckoutScanner();
      });
      this.dom.btnCloseScanner.addEventListener('click', () => {
        this.dom.checkoutScannerModal.classList.remove('open');
      });

      // Sound Toggle
      this.dom.btnToggleSound.addEventListener('click', () => {
        this.sound.enabled = !this.sound.enabled;
        this.dom.btnToggleSound.classList.toggle('active', this.sound.enabled);
        this.dom.btnToggleSound.setAttribute('aria-label', this.sound.enabled ? '소리 켜짐' : '소리 꺼짐');
        this.showToast(this.sound.enabled ? '🔊 효과음이 켜졌습니다.' : '🔇 효과음이 꺼졌습니다.');
      });

      // TTS Toggle
      this.dom.btnToggleTTS.addEventListener('click', () => {
        this.sound.ttsEnabled = !this.sound.ttsEnabled;
        this.dom.btnToggleTTS.classList.toggle('active', this.sound.ttsEnabled);
        this.dom.btnToggleTTS.setAttribute('aria-label', this.sound.ttsEnabled ? '음성 안내 켜짐' : '음성 안내 꺼짐');
        this.showToast(this.sound.ttsEnabled ? '🗣️ 다람이 음성 안내 켜짐' : '🤐 음성 안내 꺼짐');
      });

      // Help Modal
      this.dom.btnOpenHelp.addEventListener('click', () => {
        this.sound.play('beep');
        this.dom.encyclopediaModal.classList.add('open');
      });
      this.dom.btnCloseHelp.addEventListener('click', () => {
        this.dom.encyclopediaModal.classList.remove('open');
      });

      // Inspection Modal Close
      this.dom.btnCloseInspection.addEventListener('click', () => {
        this.dom.inspectionModal.classList.remove('open');
      });

      // Report Modal Close & Restart
      this.dom.btnCloseReport.addEventListener('click', () => {
        this.dom.reportModal.classList.remove('open');
      });
      this.dom.btnRestartGame.addEventListener('click', () => {
        this.restartGame();
      });

      // Cart Action Button (영양 성적표 보기)
      this.dom.btnCheckout.addEventListener('click', () => {
        this.openReportCard();
      });

      // Restart World Cup
      this.dom.btnRestartWorldcup.addEventListener('click', () => {
        this.initWorldCup();
      });

      // Drag & Drop onto Cart Dock
      this.dom.cartDock.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.dom.cartDock.style.borderColor = '#22c55e';
      });

      this.dom.cartDock.addEventListener('dragleave', () => {
        this.dom.cartDock.style.borderColor = '';
      });

      this.dom.cartDock.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dom.cartDock.style.borderColor = '';
        const snackId = e.dataTransfer.getData('text/plain');
        if (snackId) {
          const snack = SNACK_DATA.find(s => s.id === snackId);
          if (snack) {
            this.addToCart(snack);
          }
        }
      });
    }

    switchMode(mode) {
      this.state.mode = mode;
      this.sound.play('beep');

      this.dom.tabAdventureMode.classList.toggle('active', mode === 'adventure');
      this.dom.tabMartMode.classList.toggle('active', mode === 'mart');
      this.dom.tabWorldcupMode.classList.toggle('active', mode === 'worldcup');

      this.dom.adventureGameView.style.display = mode === 'adventure' ? 'block' : 'none';
      this.dom.martGameView.style.display = mode === 'mart' ? 'block' : 'none';
      this.dom.worldcupSection.classList.toggle('active', mode === 'worldcup');

      if (mode === 'adventure') {
        this.showToast('🏪 실감 마트 입장 게임 모드입니다.');
      } else if (mode === 'mart') {
        this.showToast('📋 24종 전체 진열대 한눈에 보기 모드입니다.');
      } else {
        this.showToast('🏆 건강 간식 이상형 월드컵을 시작합니다!');
        this.sound.speak('건강 간식 이상형 월드컵에 오신 것을 환영해요! 두 간식 중 더 건강하고 좋은 간식을 골라보세요!');
      }
    }

    // ========================================================================
    // IMMERSIVE MART ADVENTURE ENGINE (실감 마트 입장 & 진열대 앞 선택)
    // ========================================================================
    enterMartBuilding() {
      this.sound.play('fanfare');
      this.dom.entranceDoors.classList.add('doors-opening');
      const charName = this.state.adventure.character === 'girl' ? '지아' : '민수';
      const scenario = MART_SCENARIOS[this.state.adventure.scenarioKey];

      this.showToast(`🚪 위이잉~ 자동문이 열립니다! ${charName}가 싱싱 건강마트에 입장했어요!`);
      this.sound.speak(`어서 오세요 싱싱 건강마트입니다! ${charName} 학생, 오늘의 미션은 ${scenario.title}입니다. 진열대 앞에서 간식을 집어 들고 영양성분표를 확인해 보세요!`);

      setTimeout(() => {
        this.state.adventure.inStore = true;
        this.dom.martEntranceScreen.style.display = 'none';
        this.dom.martAisleScreen.style.display = 'block';

        // Update HUD Scenario
        this.dom.hudScenarioBadge.textContent = scenario.badge;
        this.dom.hudScenarioGoal.textContent = scenario.goalText;

        this.moveToAisle(0);
        this.updateAdventureHUD();
      }, 750);
    }

    renderAisleMinimap() {
      this.dom.aisleMinimap.innerHTML = '';
      AISLE_CORNERS.forEach(corner => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `minimap-node ${this.state.adventure.currentAisleIndex === corner.index ? 'active' : ''}`;
        btn.id = `minimap-corner-${corner.index}`;
        btn.innerHTML = `<span>${corner.numLabel}: ${corner.shortName}</span>`;
        btn.addEventListener('click', () => {
          this.moveToAisle(corner.index);
        });
        this.dom.aisleMinimap.appendChild(btn);
      });

      const checkoutNode = document.createElement('button');
      checkoutNode.type = 'button';
      checkoutNode.className = 'minimap-node checkout-node';
      checkoutNode.innerHTML = `<span>💳 바코드 계산대</span>`;
      checkoutNode.addEventListener('click', () => {
        this.openCheckoutScanner();
      });
      this.dom.aisleMinimap.appendChild(checkoutNode);
    }

    moveToAisle(aisleIndex) {
      this.sound.play('flip');
      this.state.adventure.currentAisleIndex = aisleIndex;
      const corner = AISLE_CORNERS[aisleIndex];

      // Highlight minimap
      document.querySelectorAll('.minimap-node').forEach((node, idx) => {
        node.classList.toggle('active', idx === aisleIndex);
      });

      // Update Ceiling Signboard
      this.dom.aisleSignNumber.textContent = corner.numLabel;
      this.dom.aisleSignTitle.textContent = corner.title;
      this.dom.aisleSignSub.textContent = corner.subtitle;

      // Animate walking student character
      this.dom.studentAvatarActor.classList.remove('walking');
      void this.dom.studentAvatarActor.offsetWidth;
      this.dom.studentAvatarActor.classList.add('walking');
      this.dom.studentSpeechBubble.textContent = corner.studentWelcome;

      // Render 2-tier physical shelves for this corner
      this.renderAisleShelfProducts(corner);
    }

    renderAisleShelfProducts(corner) {
      const snacks = SNACK_DATA.filter(s => corner.categories.includes(s.category));
      // Split between top shelf and bottom shelf
      const half = Math.ceil(snacks.length / 2);
      const topSnacks = snacks.slice(0, half);
      const bottomSnacks = snacks.slice(half);

      this.dom.aisleShelfTop.innerHTML = '';
      this.dom.aisleShelfBottom.innerHTML = '';

      topSnacks.forEach(snack => {
        this.dom.aisleShelfTop.appendChild(this.createShelfProductSlot(snack));
      });

      if (bottomSnacks.length > 0) {
        bottomSnacks.forEach(snack => {
          this.dom.aisleShelfBottom.appendChild(this.createShelfProductSlot(snack));
        });
      } else {
        // If only 2 items in category (like 견과/간식류), show healthy recommendations on bottom shelf
        const bonusHealthy = SNACK_DATA.filter(s => ['rice_cracker', 'plain_yogurt', 'tomato', 'barley_tea'].includes(s.id));
        bonusHealthy.forEach(snack => {
          this.dom.aisleShelfBottom.appendChild(this.createShelfProductSlot(snack));
        });
      }
    }

    createShelfProductSlot(snack) {
      const inCart = this.state.cart.some(i => i.id === snack.id);
      const resisted = this.state.adventure.resistedItems.has(snack.id);
      const inspected = this.state.inspectedItems.has(snack.id);

      const slot = document.createElement('div');
      slot.className = `shelf-product-slot ${inCart ? 'in-cart' : ''} ${resisted ? 'resisted' : ''}`;

      let ribbonHTML = '';
      if (inCart) {
        ribbonHTML = `<span class="slot-status-ribbon ribbon-cart">🛒 카트에 담음</span>`;
      } else if (resisted) {
        ribbonHTML = `<span class="slot-status-ribbon ribbon-resisted">🛡️ 유혹 참음!</span>`;
      } else if (inspected) {
        ribbonHTML = `<span class="slot-status-ribbon ribbon-checked">👀 성분 확인함</span>`;
      }

      slot.innerHTML = `
        ${ribbonHTML}
        <img class="shelf-product-img" src="${snack.image}" alt="${snack.name}">
        <div class="shelf-product-name">${snack.name}</div>
        <div class="shelf-price-tag">
          <span>${snack.servingSize} · ${snack.calories}kcal</span>
          <span class="grab-hand-hint">✋ 집기</span>
        </div>
      `;

      slot.addEventListener('click', () => {
        this.openHandPickupModal(snack);
      });

      return slot;
    }

    openHandPickupModal(snack) {
      this.sound.play('beep');
      this.state.adventure.holdingSnack = snack;
      this.state.adventure.flippedInHand = false;

      const corner = AISLE_CORNERS[this.state.adventure.currentAisleIndex];
      this.dom.pickupCornerBadge.textContent = `✋ ${corner.numLabel}에서 [${snack.name}]을(를) 손에 들었어요!`;
      this.dom.pickupTitle.textContent = snack.name;
      this.dom.pickupSnackDesc.textContent = `${snack.tagline} (${snack.servingSize} / ${snack.calories} kcal)`;

      this.dom.pickupStudentThought.textContent =
        `"우와, [${snack.name}]이다! 겉포장지는 맛있어 보이는데... 바로 카트에 넣을까? 아니면 뒷면 영양성분표를 먼저 뒤집어 볼까?"`;

      // Render 3D card inside the modal
      this.dom.pickupCard3d.classList.remove('flipped');
      this.dom.pickupCard3d.innerHTML = `
        <div class="card-inner">
          <div class="card-front" style="justify-content: center; align-items: center; gap: 12px;">
            <div class="card-front-top" style="width: 100%;">
              <span class="snack-category-pill">${snack.category}</span>
              <span class="snack-kcal-badge">${snack.calories} kcal</span>
            </div>
            <img src="${snack.image}" alt="${snack.name}" style="height: 210px; object-fit: contain; filter: drop-shadow(0 10px 16px rgba(0,0,0,0.2));">
            <div style="text-align: center;">
              <strong style="font-size: 1.2rem;">${snack.name}</strong>
              <p style="font-size: 0.82rem; color: #64748b;">포장지 앞면만 보고 고르면 숨은 당류·나트륨을 알 수 없어요!</p>
            </div>
          </div>

          <div class="card-back">
            <div class="nutrition-label-container">
              <div class="label-header-main">
                <span class="label-title">영양정보</span>
                <span style="font-size: 0.75rem; font-weight: 800; color: #15803d;">식약처 신호등 표시</span>
              </div>
              <div class="label-serving-info">총 내용량 ${snack.servingSize}</div>
              <div class="label-calories-row">
                <span class="cal-label">열량</span>
                <span class="cal-value">${snack.calories} kcal</span>
              </div>
              <table class="nutrient-table">
                <tbody>
                  <tr class="heavy-border">
                    <td class="nutrient-name">
                      나트륨 ${snack.nutrients.sodium}mg
                      <span class="traffic-badge ${snack.trafficLight.sodium}">
                        <span class="traffic-dot"></span>${this.getLightKoreanName(snack.trafficLight.sodium)}
                      </span>
                    </td>
                    <td class="nutrient-pct">${snack.dailyRatio.sodium}%</td>
                  </tr>
                  <tr>
                    <td class="nutrient-name">탄수화물 ${snack.nutrients.carb}g</td>
                    <td class="nutrient-pct">${snack.dailyRatio.carb}%</td>
                  </tr>
                  <tr>
                    <td class="nutrient-name indent">
                      당류 ${snack.nutrients.sugar}g
                      <span class="traffic-badge ${snack.trafficLight.sugar}">
                        <span class="traffic-dot"></span>${this.getLightKoreanName(snack.trafficLight.sugar)}
                      </span>
                    </td>
                    <td class="nutrient-pct">${snack.dailyRatio.sugar}%</td>
                  </tr>
                  <tr class="heavy-border">
                    <td class="nutrient-name">
                      지방 ${snack.nutrients.fat}g
                      <span class="traffic-badge ${snack.trafficLight.fat}">
                        <span class="traffic-dot"></span>${this.getLightKoreanName(snack.trafficLight.fat)}
                      </span>
                    </td>
                    <td class="nutrient-pct">${snack.dailyRatio.fat}%</td>
                  </tr>
                  <tr>
                    <td class="nutrient-name indent">
                      포화지방 ${snack.nutrients.saturatedFat}g
                      <span class="traffic-badge ${snack.trafficLight.saturatedFat}">
                        <span class="traffic-dot"></span>${this.getLightKoreanName(snack.trafficLight.saturatedFat)}
                      </span>
                    </td>
                    <td class="nutrient-pct">${snack.dailyRatio.saturatedFat}%</td>
                  </tr>
                  <tr class="heavy-border">
                    <td class="nutrient-name">단백질 ${snack.nutrients.protein}g</td>
                    <td class="nutrient-pct">${snack.dailyRatio.protein}%</td>
                  </tr>
                </tbody>
              </table>
              <div class="sugar-cube-visualizer">
                <span style="font-size: 0.75rem; font-weight: 800;">각설탕: <strong>${snack.sugarCubes}개</strong></span>
                <div class="cube-icons">
                  ${this.generateSugarCubesHTML(snack.sugarCubes, snack.trafficLight.sugar === 'red')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Reset Secret Box to Locked until student flips the card
      this.dom.pickupNutritionSecret.className = 'pickup-secret-box locked';
      this.dom.secretLockedMsg.style.display = 'flex';
      this.dom.secretUnlockedContent.style.display = 'none';
      this.dom.btnPickupFlip.innerHTML = '🔄 간식 뒤집어서 뒷면 [영양성분표] 확인하기!';

      this.dom.decBuySub.textContent = '아직 뒷면 영양성분표를 확인하지 않고 담아요';
      this.dom.decReturnSub.textContent = '안 사고 진열대에 다시 올려놓을래요';

      this.dom.handPickupModal.classList.add('open');
    }

    flipHeldSnackInHand() {
      const snack = this.state.adventure.holdingSnack;
      if (!snack) return;

      this.sound.play('flip');
      const isNowFlipped = this.dom.pickupCard3d.classList.toggle('flipped');

      if (!this.state.adventure.flippedInHand) {
        this.state.adventure.flippedInHand = true;

        // First time inspecting this snack in the game awards +10 exploration points!
        if (!this.state.inspectedItems.has(snack.id)) {
          this.state.adventure.score += 10;
          this.showToast(`👀 [${snack.name}] 영양성분표 확인! (+10점)`);
        }
        this.markSnackInspected(snack);

        const tl = snack.trafficLight;
        const hasRed = tl.sugar === 'red' || tl.sodium === 'red' || tl.saturatedFat === 'red';

        // Update student thought bubble based on what they discovered on the label
        if (hasRed) {
          this.dom.pickupStudentThought.textContent =
            `"헉! 뒷면 영양성분표를 보길 정말 잘했다! 빨간불(주의) 성분이 숨어 있었네! 카트에 담을까, 아니면 참아내고 내려놓을까?"`;
          this.sound.play('alert');
          this.sound.speak(`영양성분표를 확인해보니 주의가 필요한 빨간불 성분이 들어있어요!`);
        } else {
          this.dom.pickupStudentThought.textContent =
            `"우와! 뒷면 영양성분표를 읽어보니 빨간불이 하나도 없는 착한 건강 간식이야! 안심하고 카트에 담아야지!"`;
          this.sound.play('beep');
          this.sound.speak(`와! 빨간불이 하나도 없는 건강한 안심 간식이네요!`);
        }

        // Unlock Secret Analysis Box
        this.dom.pickupNutritionSecret.className = 'pickup-secret-box unlocked';
        this.dom.secretLockedMsg.style.display = 'none';
        this.dom.secretUnlockedContent.style.display = 'block';
        this.dom.secretUnlockedContent.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <strong style="font-size: 0.98rem; color: #065f46;">🔍 내가 읽은 영양 신호등 결과</strong>
            <span style="font-size: 0.78rem; font-weight: 800; color: #10b981;">+10점 획득!</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
            <span class="traffic-badge ${tl.sugar}"><span class="traffic-dot"></span>당류 ${snack.nutrients.sugar}g (각설탕 ${snack.sugarCubes}개)</span>
            <span class="traffic-badge ${tl.sodium}"><span class="traffic-dot"></span>나트륨 ${snack.nutrients.sodium}mg</span>
            <span class="traffic-badge ${tl.saturatedFat}"><span class="traffic-dot"></span>포화지방 ${snack.nutrients.saturatedFat}g</span>
          </div>
          <p style="font-size: 0.86rem; color: #1e293b; font-weight: 700; line-height: 1.45; margin-bottom: 8px;">
            💡 ${snack.educationTip}
          </p>
          <div style="background: #f0fdf4; border-radius: 8px; padding: 8px 10px; font-size: 0.82rem; font-weight: 700; color: #064e3b;">
            🐿️ <strong>다람이 박사님:</strong> "${snack.doctorQuote}"
          </div>
        `;

        this.dom.decBuySub.textContent = hasRed
          ? '⚠️ 빨간불 성분이 있지만 그래도 카트에 담을래요'
          : '✅ 영양성분을 확인하고 안심 간식으로 카트에 담아요! (+20점)';
        this.dom.decReturnSub.textContent = hasRed
          ? '🛡️ 빨간불 간식의 유혹을 이겨내고 진열대에 내려놓아요! (+20점 보너스!)'
          : '안 사고 진열대에 다시 내려놓을래요';

        this.updateAdventureHUD();
      }

      this.dom.btnPickupFlip.innerHTML = isNowFlipped
        ? '🔄 간식 앞면 포장지 다시 보기'
        : '🔄 간식 뒷면 [영양성분표] 다시 보기';
    }

    decidePutInCartFromHand() {
      const snack = this.state.adventure.holdingSnack;
      if (!snack) return;

      if (this.state.cart.length >= 8) {
        this.sound.play('alert');
        this.showToast('⚠️ 장바구니가 가득 찼어요! (최대 8개)');
        return;
      }

      const checkedLabel = this.state.adventure.flippedInHand;
      const tl = snack.trafficLight;
      const hasRed = tl.sugar === 'red' || tl.sodium === 'red' || tl.saturatedFat === 'red';

      if (!checkedLabel) {
        // Student bought the snack blindly without checking the nutrition label!
        this.state.adventure.blindBoughtItems.add(snack.id);
        this.state.adventure.choiceLog.unshift(
          `🙈 [${snack.name}] 뒷면 영양표시를 확인하지 않고 앞면만 보고 카트에 담음`
        );
        this.dom.studentSpeechBubble.textContent =
          `"앗, [${snack.name}] 포장지 앞면만 보고 그냥 담았네! 다음엔 뒷면 영양성분표를 꼭 뒤집어 봐야지!"`;
      } else if (!hasRed) {
        // Checked label and picked a healthy snack!
        if (!this.state.adventure.smartBoughtItems.has(snack.id)) {
          this.state.adventure.smartBoughtItems.add(snack.id);
          this.state.adventure.score += 20;
        }
        this.state.adventure.choiceLog.unshift(
          `🌟 [${snack.name}] 영양성분표(초록·노랑불)를 꼼꼼히 확인하고 카트에 담음! (+20점)`
        );
        this.dom.studentSpeechBubble.textContent =
          `"좋았어! [${snack.name}]의 영양성분표를 확인하고 건강하게 골랐어!"`;
      } else {
        // Checked label, saw red light, but still put in cart
        this.state.adventure.score = Math.max(0, this.state.adventure.score - 10);
        this.state.adventure.choiceLog.unshift(
          `🚨 [${snack.name}] 빨간불 주의 성분을 확인했지만 카트에 담음 (-10점)`
        );
        this.dom.studentSpeechBubble.textContent =
          `"으음~ [${snack.name}]에 빨간불 성분이 있었는데... 너무 많이 먹지는 말아야겠다!"`;
      }

      this.addToCart(snack);
      this.dom.handPickupModal.classList.remove('open');
      this.renderAisleShelfProducts(AISLE_CORNERS[this.state.adventure.currentAisleIndex]);
      this.updateAdventureHUD();
    }

    decidePutBackOnShelf() {
      const snack = this.state.adventure.holdingSnack;
      if (!snack) return;

      const checkedLabel = this.state.adventure.flippedInHand;
      const tl = snack.trafficLight;
      const hasRed = tl.sugar === 'red' || tl.sodium === 'red' || tl.saturatedFat === 'red';

      if (checkedLabel && hasRed) {
        // Student checked the nutrition label, saw a red light, and resisted temptation!
        if (!this.state.adventure.resistedItems.has(snack.id)) {
          this.state.adventure.resistedItems.add(snack.id);
          this.state.adventure.score += 20;
          this.sound.play('fanfare');
          this.showToast(`🛡️ 유혹 참기 대성공! [${snack.name}] 빨간불을 확인하고 내려놓았어요! (+20점)`);
          this.sound.speak(`대단해요! ${snack.name}의 빨간불 성분을 확인하고 스스로 유혹을 이겨냈군요! 보너스 20점!`);
        } else {
          this.sound.play('beep');
        }
        this.state.adventure.choiceLog.unshift(
          `🛡️ [${snack.name}] 영양표시 빨간불 확인 후 스스로 진열대에 내려놓음! (유혹 참기 +20점)`
        );
        this.dom.studentSpeechBubble.textContent =
          `"휴~ [${snack.name}] 맛있어 보였지만 빨간불 성분이 많아서 내 건강을 위해 내려놓았어! 뿌듯하다!"`;
      } else {
        this.sound.play('beep');
        this.state.adventure.choiceLog.unshift(
          `✋ [${snack.name}] 고민 끝에 다시 진열대에 내려놓음`
        );
        this.dom.studentSpeechBubble.textContent =
          `"[${snack.name}]은 다시 선반에 내려놓았어. 다른 간식도 구경해 볼까?"`;
      }

      this.dom.handPickupModal.classList.remove('open');
      this.renderAisleShelfProducts(AISLE_CORNERS[this.state.adventure.currentAisleIndex]);
      this.updateAdventureHUD();
    }

    updateAdventureHUD() {
      const adv = this.state.adventure;
      const cart = this.state.cart;

      this.dom.hudInspectedCount.textContent = `${this.state.inspectedItems.size}회`;
      this.dom.hudResistedCount.textContent = `${adv.resistedItems.size}회`;
      this.dom.hudAdventureScore.textContent = `${adv.score}점`;
      this.dom.advCartCount.textContent = cart.length;

      // Mini cart preview icons on the pushed cart
      this.dom.pushedCartItemsPreview.innerHTML = cart
        .map(item => `<img src="${item.image}" alt="${item.name}">`)
        .join('');

      // Adventure Side Cart List
      if (cart.length === 0) {
        this.dom.advCartList.innerHTML = `
          <div style="text-align: center; padding: 18px 8px; color: #64748b; font-size: 0.82rem; border: 1px dashed #cbd5e1; border-radius: 8px;">
            진열대에서 간식을 클릭해 손으로 집고 카트에 담아보세요!
          </div>
        `;
      } else {
        this.dom.advCartList.innerHTML = '';
        cart.forEach((item, idx) => {
          const row = document.createElement('div');
          row.className = 'cart-item-card';
          row.innerHTML = `
            <img class="cart-item-thumb" src="${item.image}" alt="${item.name}" style="width: 38px; height: 38px;">
            <div class="cart-item-details">
              <div class="cart-item-name" style="font-size: 0.85rem;">${item.name}</div>
              <div class="cart-item-lights">
                <span class="traffic-badge ${item.trafficLight.sugar}"><span class="traffic-dot"></span>당</span>
                <span class="traffic-badge ${item.trafficLight.sodium}"><span class="traffic-dot"></span>나</span>
                <span class="traffic-badge ${item.trafficLight.saturatedFat}"><span class="traffic-dot"></span>지</span>
              </div>
            </div>
            <button type="button" class="btn-remove-item" title="카트에서 빼기">✖</button>
          `;
          row.querySelector('.btn-remove-item').addEventListener('click', () => {
            this.removeFromCart(idx);
            this.renderAisleShelfProducts(AISLE_CORNERS[this.state.adventure.currentAisleIndex]);
            this.updateAdventureHUD();
          });
          this.dom.advCartList.appendChild(row);
        });
      }

      // Update Gauges
      let totalSugar = 0;
      let totalSodium = 0;
      cart.forEach(i => {
        totalSugar += i.nutrients.sugar;
        totalSodium += i.nutrients.sodium;
      });

      this.dom.advSugarText.textContent = `${totalSugar.toFixed(1)}g (각설탕 ${(totalSugar / 3).toFixed(1)}개)`;
      const sugarPct = Math.min(100, (totalSugar / 35) * 100);
      this.dom.advSugarBar.style.width = `${sugarPct}%`;
      this.dom.advSugarBar.className = `gauge-bar-fill ${totalSugar >= 25 ? 'red' : totalSugar >= 12 ? 'yellow' : 'green'}`;

      this.dom.advSodiumText.textContent = `${totalSodium}mg`;
      const sodiumPct = Math.min(100, (totalSodium / 600) * 100);
      this.dom.advSodiumBar.style.width = `${sodiumPct}%`;
      this.dom.advSodiumBar.className = `gauge-bar-fill ${totalSodium >= 400 ? 'red' : totalSodium >= 200 ? 'yellow' : 'green'}`;

      // Update Choice Log
      if (adv.choiceLog.length === 0) {
        this.dom.advChoiceLog.innerHTML = `<li class="log-empty">아직 진열대에서 집어 든 간식이 없어요.</li>`;
      } else {
        this.dom.advChoiceLog.innerHTML = adv.choiceLog
          .map(entry => `<li>${entry}</li>`)
          .join('');
      }
    }

    openCheckoutScanner() {
      const cart = this.state.cart;
      if (cart.length === 0) {
        this.sound.play('alert');
        this.showToast('🛒 아직 장바구니가 비어 있어요! 진열대에서 간식을 골라 담아주세요.');
        return;
      }

      this.sound.play('beep');
      const adv = this.state.adventure;
      const scenario = MART_SCENARIOS[adv.scenarioKey];
      const evalResult = scenario.evaluate(cart);

      let totalCal = 0;
      let totalSugar = 0;
      let totalSodium = 0;
      let redCount = 0;
      cart.forEach(item => {
        totalCal += item.calories;
        totalSugar += item.nutrients.sugar;
        totalSodium += item.nutrients.sodium;
        ['sugar', 'sodium', 'fat', 'saturatedFat'].forEach(k => {
          if (item.trafficLight[k] === 'red') redCount++;
        });
      });

      const resistedNames = [...adv.resistedItems].map(id => {
        const s = SNACK_DATA.find(x => x.id === id);
        return s ? s.name : '';
      }).filter(Boolean);

      const blindNames = [...adv.blindBoughtItems].filter(id => cart.some(c => c.id === id)).map(id => {
        const s = SNACK_DATA.find(x => x.id === id);
        return s ? s.name : '';
      }).filter(Boolean);

      this.dom.scannerModalBody.innerHTML = `
        <div class="conveyor-stage">
          <div class="scanner-laser-line"></div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap; position: relative; z-index: 2;">
            ${cart.map(item => `
              <div style="background: rgba(255,255,255,0.95); padding: 8px 12px; border-radius: 12px; text-align: center; min-width: 100px;">
                <img src="${item.image}" alt="${item.name}" style="height: 56px; margin: 0 auto 4px;">
                <div style="font-size: 0.78rem; font-weight: 900; color: #0f172a;">${item.name}</div>
                <div style="font-size: 0.7rem; color: #16a34a; font-weight: 800;">삐빅! 스캔 완료</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: ${evalResult.passed ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${evalResult.passed ? '#22c55e' : '#ef4444'}; border-radius: 16px; padding: 18px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="font-size: 1.15rem; color: ${evalResult.passed ? '#15803d' : '#b91c1c'};">
              ${evalResult.passed ? '🎉 오늘의 장보기 시나리오 미션 대성공!' : '⚠️ 시나리오 미션 아까워요! 다시 점검해볼까요?'}
            </strong>
            <span class="hud-badge" style="background: ${evalResult.passed ? '#16a34a' : '#dc2626'};">
              총 탐구 점수: ${adv.score}점
            </span>
          </div>
          <p style="font-size: 0.92rem; font-weight: 700; color: #1e293b;">${evalResult.feedback}</p>
        </div>

        <!-- Student's Shelf Decision Analysis -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px;">
            <h4 style="font-size: 0.92rem; color: #1e40af; margin-bottom: 6px;">🛡️ 진열대 앞에서 유혹을 참아낸 간식</h4>
            <p style="font-size: 0.84rem; font-weight: 700; color: #1e293b;">
              ${resistedNames.length > 0
                ? `성분표의 빨간불을 보고 <b>[${resistedNames.join(', ')}]</b>을(를) 스스로 내려놓았어요! (최고의 절제력 칭찬해요!)`
                : '진열대에서 빨간불 간식을 확인하고 내려놓으면 유혹 참기 보너스를 받을 수 있어요!'}
            </p>
          </div>

          <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 12px; padding: 14px;">
            <h4 style="font-size: 0.92rem; color: #854d0e; margin-bottom: 6px;">👀 영양성분표 확인 습관 점검</h4>
            <p style="font-size: 0.84rem; font-weight: 700; color: #1e293b;">
              ${blindNames.length === 0
                ? '모든 간식의 뒷면 영양성분표를 꼼꼼히 뒤집어 확인한 뒤 골랐어요! 완벽한 영양 박사 습관이에요!'
                : `앗! <b>[${blindNames.join(', ')}]</b>은(는) 뒷면 성분표를 보지 않고 앞면만 보고 골랐어요. 꼭 뒷면을 확인해 봐요!`}
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button type="button" id="btn-scanner-open-full-report" class="cart-action-btn" style="flex: 1;">
            🧾 최종 영양 성적표 & 도장 받기
          </button>
          <button type="button" id="btn-scanner-continue-shopping" class="btn-card" style="padding: 14px 20px; background: #f1f5f9; font-size: 0.95rem;">
            🛒 진열대로 돌아가서 수정하기
          </button>
        </div>
      `;

      document.getElementById('btn-scanner-open-full-report').addEventListener('click', () => {
        this.dom.checkoutScannerModal.classList.remove('open');
        this.openReportCard();
      });

      document.getElementById('btn-scanner-continue-shopping').addEventListener('click', () => {
        this.dom.checkoutScannerModal.classList.remove('open');
      });

      this.dom.checkoutScannerModal.classList.add('open');
      if (evalResult.passed) {
        this.sound.play('fanfare');
        this.spawnConfetti();
      }
      this.sound.speak(`바코드 스캔이 완료되었습니다! ${evalResult.feedback}`);
    }

    // ========================================================================
    // Category Filtering
    // ========================================================================
    renderCategoryChips() {
      const categories = [
        { id: 'all', label: '전체 상품 🛒 (24종)' },
        { id: '과자류', label: '바삭 과자류 🍪' },
        { id: '베이커리', label: '베이커리/디저트 🧁' },
        { id: '음료수', label: '음료수 🧃' },
        { id: '유제품', label: '신선 유제품 🥛' },
        { id: '신선식품', label: '생생 과일/채소 🍅' },
        { id: '견과류', label: '영양 견과 🥜' },
        { id: '간식류', label: '든든 간식 🌾' }
      ];

      this.dom.categoryFilters.innerHTML = '';
      categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-chip ${this.state.activeCategory === cat.id ? 'active' : ''}`;
        btn.textContent = cat.label;
        btn.addEventListener('click', () => {
          this.sound.play('beep');
          this.state.activeCategory = cat.id;
          document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderShelves();
        });
        this.dom.categoryFilters.appendChild(btn);
      });
    }

    // ========================================================================
    // Shelves & 3D Cards Rendering
    // ========================================================================
    renderShelves() {
      const filtered = this.state.activeCategory === 'all'
        ? SNACK_DATA
        : SNACK_DATA.filter(s => s.category === this.state.activeCategory);

      this.dom.shelvesGrid.innerHTML = '';

      filtered.forEach(snack => {
        const cardWrap = document.createElement('div');
        cardWrap.className = 'card-3d-wrap';
        cardWrap.id = `snack-card-${snack.id}`;

        cardWrap.innerHTML = `
          <div class="card-inner">
            <!-- Front Face: Snack Package -->
            <div class="card-front">
              <div class="card-front-top">
                <span class="snack-category-pill">${snack.category}</span>
                <span class="snack-kcal-badge">${snack.calories} kcal</span>
              </div>
              <div class="snack-image-container" draggable="true" title="카트로 드래그하거나 아래 버튼을 누르세요">
                <img src="${snack.image}" alt="${snack.name}" draggable="false">
              </div>
              <div class="snack-info">
                <h4 class="snack-name">${snack.name}</h4>
                <div class="snack-serving">${snack.servingSize}</div>
              </div>
              <div class="card-btn-toolbar">
                <button class="btn-card btn-flip" title="영양성분표 뒤집어 보기" aria-label="${snack.name} 영양표시 확인">
                  🔄 성분표 보기
                </button>
                <button class="btn-card btn-inspect" title="돋보기로 성분 정밀 분석" aria-label="${snack.name} 돋보기 검사">
                  🔍 돋보기
                </button>
                <button class="btn-card btn-add-cart" title="장바구니에 담기" aria-label="${snack.name} 카트에 담기">
                  🛒 카트에 담기
                </button>
              </div>
            </div>

            <!-- Back Face: Nutrition Facts Label (Ensures zero text reversal) -->
            <div class="card-back">
              <div class="nutrition-label-container">
                <div class="label-header-main">
                  <span class="label-title">영양정보</span>
                  <button class="btn-card btn-flip" style="padding: 2px 6px; font-size: 0.72rem;">
                    🔄 앞면
                  </button>
                </div>
                <div class="label-serving-info">총 내용량 ${snack.servingSize}</div>
                <div class="label-calories-row">
                  <span class="cal-label">열량</span>
                  <span class="cal-value">${snack.calories} kcal</span>
                </div>
                <div class="label-daily-ref-note">1일 영양성분 기준치에 대한 비율(%)</div>

                <table class="nutrient-table">
                  <tbody>
                    <tr class="heavy-border">
                      <td class="nutrient-name">
                        나트륨 ${snack.nutrients.sodium}mg
                        <span class="traffic-badge ${snack.trafficLight.sodium}">
                          <span class="traffic-dot"></span>
                          ${this.getLightKoreanName(snack.trafficLight.sodium)}
                        </span>
                      </td>
                      <td class="nutrient-pct">${snack.dailyRatio.sodium}%</td>
                    </tr>
                    <tr>
                      <td class="nutrient-name">탄수화물 ${snack.nutrients.carb}g</td>
                      <td class="nutrient-pct">${snack.dailyRatio.carb}%</td>
                    </tr>
                    <tr>
                      <td class="nutrient-name indent">
                        당류 ${snack.nutrients.sugar}g
                        <span class="traffic-badge ${snack.trafficLight.sugar}">
                          <span class="traffic-dot"></span>
                          ${this.getLightKoreanName(snack.trafficLight.sugar)}
                        </span>
                      </td>
                      <td class="nutrient-pct">${snack.dailyRatio.sugar}%</td>
                    </tr>
                    <tr class="heavy-border">
                      <td class="nutrient-name">
                        지방 ${snack.nutrients.fat}g
                        <span class="traffic-badge ${snack.trafficLight.fat}">
                          <span class="traffic-dot"></span>
                          ${this.getLightKoreanName(snack.trafficLight.fat)}
                        </span>
                      </td>
                      <td class="nutrient-pct">${snack.dailyRatio.fat}%</td>
                    </tr>
                    <tr>
                      <td class="nutrient-name indent">트랜스지방 ${snack.nutrients.transFat}g</td>
                      <td class="nutrient-pct">-</td>
                    </tr>
                    <tr>
                      <td class="nutrient-name indent">
                        포화지방 ${snack.nutrients.saturatedFat}g
                        <span class="traffic-badge ${snack.trafficLight.saturatedFat}">
                          <span class="traffic-dot"></span>
                          ${this.getLightKoreanName(snack.trafficLight.saturatedFat)}
                        </span>
                      </td>
                      <td class="nutrient-pct">${snack.dailyRatio.saturatedFat}%</td>
                    </tr>
                    <tr class="heavy-border">
                      <td class="nutrient-name">콜레스테롤 ${snack.nutrients.cholesterol}mg</td>
                      <td class="nutrient-pct">${snack.dailyRatio.cholesterol}%</td>
                    </tr>
                    <tr>
                      <td class="nutrient-name">단백질 ${snack.nutrients.protein}g</td>
                      <td class="nutrient-pct">${snack.dailyRatio.protein}%</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Sugar Cube Count Visualizer -->
                <div class="sugar-cube-visualizer">
                  <span style="font-size: 0.72rem; font-weight: 800; color: #475569;">
                    각설탕: <strong>${snack.sugarCubes}개</strong>
                  </span>
                  <div class="cube-icons">
                    ${this.generateSugarCubesHTML(snack.sugarCubes, snack.trafficLight.sugar === 'red')}
                  </div>
                </div>

                <div class="card-btn-toolbar" style="margin-top: auto;">
                  <button class="btn-card btn-inspect" style="grid-column: span 1;">
                    🔍 돋보기
                  </button>
                  <button class="btn-card btn-add-cart" style="grid-column: span 1;">
                    🛒 담기
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Card Drag & Drop setup
        const imgContainer = cardWrap.querySelector('.snack-image-container');
        imgContainer.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', snack.id);
          e.dataTransfer.effectAllowed = 'copy';
          this.sound.play('beep');
        });

        // Flip button setup
        const flipBtns = cardWrap.querySelectorAll('.btn-flip');
        flipBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound.play('flip');
            cardWrap.classList.toggle('flipped');
            this.markSnackInspected(snack);
          });
        });

        // Inspect Button
        const inspectBtns = cardWrap.querySelectorAll('.btn-inspect');
        inspectBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound.play('beep');
            this.openInspectionStation(snack);
          });
        });

        // Add to Cart Button
        const addCartBtns = cardWrap.querySelectorAll('.btn-add-cart');
        addCartBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerFlyAnimation(imgContainer, snack);
            this.addToCart(snack);
          });
        });

        this.dom.shelvesGrid.appendChild(cardWrap);
      });
    }

    generateSugarCubesHTML(count, isRed) {
      const wholeCubes = Math.min(10, Math.ceil(count));
      let html = '';
      for (let i = 0; i < wholeCubes; i++) {
        html += `<span class="sugar-cube ${isRed ? 'red-warn' : ''}" title="각설탕 1개(약 3g)"></span>`;
      }
      return html;
    }

    getLightKoreanName(color) {
      if (color === 'green') return '안심';
      if (color === 'yellow') return '적당히';
      return '주의';
    }

    markSnackInspected(snack) {
      this.state.inspectedItems.add(snack.id);
      this.checkMissionProgress();
    }

    // ========================================================================
    // Magnifier Inspection Station
    // ========================================================================
    openInspectionStation(snack) {
      this.markSnackInspected(snack);
      this.state.activeInspectingSnack = snack;
      const criteria = TRAFFIC_LIGHT_CRITERIA[snack.subCategory];

      this.dom.inspectionModalBody.innerHTML = `
        <div class="inspection-interactive-lens">
          <div style="text-align: center; margin-bottom: 16px;">
            <img src="${snack.image}" alt="${snack.name}" style="height: 180px; margin: 0 auto; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));">
            <h3 style="font-size: 1.4rem; margin-top: 10px;">${snack.name}</h3>
            <p style="color: #64748b; font-weight: 700; font-size: 0.9rem;">${snack.tagline}</p>
          </div>

          <div style="background: #ffffff; border-radius: var(--radius-md); padding: 14px; border: 2px solid #0f172a;">
            <div style="display: flex; justify-content: space-between; font-weight: 900; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 8px;">
              <span>1회 제공량 (${snack.servingSize})</span>
              <span style="color: #10b981;">열량 ${snack.calories} kcal</span>
            </div>
            <div style="font-size: 0.85rem; line-height: 1.6; color: #1e293b;">
              <div>• <strong>탄수화물:</strong> ${snack.nutrients.carb}g (기준치 ${snack.dailyRatio.carb}%)</div>
              <div>• <strong>단백질:</strong> ${snack.nutrients.protein}g (기준치 ${snack.dailyRatio.protein}%)</div>
              <div>• <strong>콜레스테롤:</strong> ${snack.nutrients.cholesterol}mg</div>
            </div>
          </div>
        </div>

        <div class="inspection-insights">
          <h4 style="font-size: 1.15rem; color: #065f46; display: flex; align-items: center; gap: 8px;">
            <img src="assets/images/ui/magnifier.svg" style="width: 28px; height: 28px;" alt="돋보기">
            식약처 영양 신호등 정밀 판별
          </h4>

          <div class="insight-card ${snack.trafficLight.sugar}">
            <div class="insight-title">
              <span>당류 (설탕) ${snack.nutrients.sugar}g</span>
              <span class="traffic-badge ${snack.trafficLight.sugar}">
                <span class="traffic-dot"></span>
                ${criteria.sugar[snack.trafficLight.sugar].label}
              </span>
            </div>
            <div class="insight-desc">
              ${criteria.sugar[snack.trafficLight.sugar].desc}
              <div style="margin-top: 4px; font-weight: 700; color: #0f172a;">
                💡 각설탕 약 ${snack.sugarCubes}개 분량이 녹아있어요!
              </div>
            </div>
          </div>

          <div class="insight-card ${snack.trafficLight.sodium}">
            <div class="insight-title">
              <span>나트륨 (소금) ${snack.nutrients.sodium}mg</span>
              <span class="traffic-badge ${snack.trafficLight.sodium}">
                <span class="traffic-dot"></span>
                ${criteria.sodium[snack.trafficLight.sodium].label}
              </span>
            </div>
            <div class="insight-desc">
              ${criteria.sodium[snack.trafficLight.sodium].desc}
            </div>
          </div>

          <div class="insight-card ${snack.trafficLight.saturatedFat}">
            <div class="insight-title">
              <span>포화지방 ${snack.nutrients.saturatedFat}g</span>
              <span class="traffic-badge ${snack.trafficLight.saturatedFat}">
                <span class="traffic-dot"></span>
                ${criteria.saturatedFat[snack.trafficLight.saturatedFat].label}
              </span>
            </div>
            <div class="insight-desc">
              ${criteria.saturatedFat[snack.trafficLight.saturatedFat].desc}
            </div>
          </div>

          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: var(--radius-md); padding: 12px; display: flex; gap: 12px; align-items: center;">
            <img src="assets/images/ui/mascot.svg" style="width: 50px; height: 50px; flex-shrink: 0;" alt="다람이">
            <div style="font-size: 0.85rem; font-weight: 600; color: #064e3b;">
              <strong>영양 닥터 다람이:</strong> "${snack.doctorQuote}"
            </div>
          </div>

          <button id="modal-btn-add-cart" class="cart-action-btn" style="margin-top: 10px;">
            🛒 이 간식을 장바구니에 담기
          </button>
        </div>
      `;

      document.getElementById('modal-btn-add-cart').addEventListener('click', () => {
        this.addToCart(snack);
        this.dom.inspectionModal.classList.remove('open');
      });

      this.dom.inspectionModal.classList.add('open');

      if (snack.trafficLight.sugar === 'red' || snack.trafficLight.sodium === 'red') {
        this.sound.play('alert');
        this.sound.speak(`${snack.name}의 영양표시를 보니 주의가 필요한 빨간불 성분이 들어있어요!`);
      } else {
        this.sound.play('beep');
        this.sound.speak(`${snack.name}은 건강하게 안심하고 먹을 수 있는 착한 간식이군요!`);
      }
    }

    // ========================================================================
    // Fly-to-Cart Animation
    // ========================================================================
    triggerFlyAnimation(startElement, snack) {
      const rect = startElement.getBoundingClientRect();
      const cartRect = this.dom.cartDock.getBoundingClientRect();

      const clone = document.createElement('img');
      clone.src = snack.image;
      clone.className = 'flying-clone';
      clone.style.width = '70px';
      clone.style.height = '70px';
      clone.style.left = `${rect.left + rect.width / 2 - 35}px`;
      clone.style.top = `${rect.top + rect.height / 2 - 35}px`;

      document.body.appendChild(clone);

      requestAnimationFrame(() => {
        clone.style.left = `${cartRect.left + cartRect.width / 2 - 25}px`;
        clone.style.top = `${cartRect.top + 80}px`;
        clone.style.transform = 'scale(0.3) rotate(360deg)';
        clone.style.opacity = '0.2';
      });

      setTimeout(() => {
        clone.remove();
        this.dom.cartDock.classList.remove('cart-bump');
        void this.dom.cartDock.offsetWidth;
        this.dom.cartDock.classList.add('cart-bump');
      }, 550);
    }

    // ========================================================================
    // Cart Management
    // ========================================================================
    addToCart(snack) {
      if (this.state.cart.length >= 8) {
        this.sound.play('alert');
        this.showToast('⚠️ 장바구니가 가득 찼습니다! (최대 8개)');
        return;
      }

      this.sound.play('drop');
      this.state.cart.push(snack);
      this.updateCartUI();
      this.updateAdventureHUD();
      this.checkMissionProgress();
      this.showToast(`🛒 [${snack.name}]을(를) 카트에 담았습니다!`);

      if (snack.trafficLight.sugar === 'red') {
        this.sound.speak('조심하세요! 당류가 빨간불인 간식이에요.');
      } else if (snack.trafficLight.sodium === 'red') {
        this.sound.speak('나트륨이 빨간불이에요. 많이 먹지 않도록 주의해요!');
      } else if (snack.isHealthy) {
        this.sound.speak('좋은 선택이에요! 영양이 가득한 건강 간식입니다.');
      }
    }

    removeFromCart(index) {
      this.sound.play('beep');
      const removed = this.state.cart.splice(index, 1)[0];
      this.updateCartUI();
      this.updateAdventureHUD();
      this.checkMissionProgress();
      this.showToast(`❌ [${removed.name}]을(를) 카트에서 뺐습니다.`);
    }

    updateCartUI() {
      const cart = this.state.cart;
      this.dom.cartCountBadge.textContent = `${cart.length}개`;

      if (cart.length === 0) {
        this.dom.cartItemsList.innerHTML = '';
        this.dom.cartEmptyState.style.display = 'flex';
      } else {
        this.dom.cartEmptyState.style.display = 'none';
        this.dom.cartItemsList.innerHTML = '';

        cart.forEach((item, index) => {
          const itemCard = document.createElement('div');
          itemCard.className = 'cart-item-card';
          itemCard.innerHTML = `
            <img class="cart-item-thumb" src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-cal">${item.calories} kcal · ${item.servingSize}</div>
              <div class="cart-item-lights">
                <span class="traffic-badge ${item.trafficLight.sugar}" title="당류">
                  <span class="traffic-dot"></span>당
                </span>
                <span class="traffic-badge ${item.trafficLight.sodium}" title="나트륨">
                  <span class="traffic-dot"></span>나
                </span>
                <span class="traffic-badge ${item.trafficLight.saturatedFat}" title="포화지방">
                  <span class="traffic-dot"></span>지
                </span>
              </div>
            </div>
            <button class="btn-remove-item" title="카트에서 빼기" aria-label="${item.name} 빼기">
              ✖
            </button>
          `;

          itemCard.querySelector('.btn-remove-item').addEventListener('click', () => {
            this.removeFromCart(index);
          });

          this.dom.cartItemsList.appendChild(itemCard);
        });
      }

      let totalCal = 0;
      let totalSugar = 0;
      let totalSodium = 0;
      let greenCount = 0;
      let redCount = 0;

      cart.forEach(item => {
        totalCal += item.calories;
        totalSugar += item.nutrients.sugar;
        totalSodium += item.nutrients.sodium;

        ['sugar', 'sodium', 'fat', 'saturatedFat'].forEach(key => {
          if (item.trafficLight[key] === 'green') greenCount++;
          if (item.trafficLight[key] === 'red') redCount++;
        });
      });

      this.dom.cartCalTotal.textContent = `${totalCal} kcal`;
      this.dom.cartSugarMeter.textContent = `${totalSugar.toFixed(1)}g (각설탕 ${(totalSugar / 3).toFixed(1)}개)`;
      this.dom.cartSodiumMeter.textContent = `${totalSodium}mg`;

      this.dom.cartLightsSummary.innerHTML = `
        <span class="traffic-badge green" title="안심 초록불"><span class="traffic-dot"></span> ${greenCount}</span>
        <span class="traffic-badge red" title="주의 빨간불"><span class="traffic-dot"></span> ${redCount}</span>
      `;
    }

    // ========================================================================
    // Mission Tracking
    // ========================================================================
    renderMission() {
      const mission = GAME_MISSIONS[this.state.currentLevel - 1];
      if (!mission) return;

      this.dom.missionLevelBadge.textContent = mission.badgeName;
      this.dom.missionTitle.textContent = mission.title;
      this.dom.missionDesc.textContent = mission.instruction;

      this.checkMissionProgress();
    }

    checkMissionProgress() {
      const mission = GAME_MISSIONS[this.state.currentLevel - 1];
      if (!mission) return;

      const progress = mission.checkProgress(this.state);
      const target = mission.targetCount;
      const pct = Math.min(100, Math.round((progress / target) * 100));

      this.dom.missionProgressLabel.textContent = `${progress} / ${target} 완료`;
      this.dom.missionProgressFill.style.width = `${pct}%`;

      if (mission.isCompleted(this.state)) {
        this.handleMissionSuccess(mission);
      }
    }

    handleMissionSuccess(mission) {
      if (this.state.missionCompleted) return;
      this.state.missionCompleted = true;

      this.sound.play('fanfare');
      this.spawnConfetti();
      this.sound.speak(mission.rewardMessage);
      this.showToast(`🎉 미션 달성! ${mission.badgeName}을 획득했습니다!`);

      setTimeout(() => {
        if (this.state.currentLevel < GAME_MISSIONS.length) {
          this.state.currentLevel++;
          this.state.missionCompleted = false;
          this.renderMission();
        } else {
          this.openReportCard();
        }
      }, 2400);
    }

    // ========================================================================
    // Nutrition Report Card
    // ========================================================================
    openReportCard() {
      this.sound.play('beep');
      const cart = this.state.cart;

      if (cart.length === 0) {
        this.showToast('🛒 장바구니에 간식을 먼저 담아주세요!');
        return;
      }

      let score = 70;
      let totalCal = 0;
      let totalSugar = 0;
      let totalSodium = 0;
      let redCount = 0;
      let greenCount = 0;

      cart.forEach(item => {
        totalCal += item.calories;
        totalSugar += item.nutrients.sugar;
        totalSodium += item.nutrients.sodium;

        ['sugar', 'sodium', 'fat', 'saturatedFat'].forEach(k => {
          if (item.trafficLight[k] === 'green') {
            score += 4;
            greenCount++;
          }
          if (item.trafficLight[k] === 'red') {
            score -= 9;
            redCount++;
          }
        });
      });

      score = Math.max(20, Math.min(100, score));

      let grade = 'B';
      let gradeLabel = '준수한 장바구니';
      let isGood = true;

      if (score >= 90) {
        grade = 'A+';
        gradeLabel = '완벽한 골든 카트!';
        isGood = true;
      } else if (score >= 80) {
        grade = 'A';
        gradeLabel = '건강 우수 장바구니';
        isGood = true;
      } else if (score >= 65) {
        grade = 'B';
        gradeLabel = '적정 수준 장바구니';
        isGood = true;
      } else {
        grade = 'C';
        gradeLabel = '영양 불균형 주의!';
        isGood = false;
      }

      let advice = "";
      if (grade === 'A+' || grade === 'A') {
        advice = "훌륭해요! 당류와 나트륨이 적고 자연 영양소가 풍부한 간식들로 장바구니를 채웠군요. 우리 몸의 혈관과 뼈가 튼튼해지는 최고의 식습관입니다!";
      } else if (redCount > 0) {
        advice = `주의가 필요한 '빨간불' 성분이 총 ${redCount}개 발견되었어요! 특히 단 음료나 튀긴 과자는 소아비만과 충치의 주원인입니다. 물이나 생과일, 저지방 우유로 바꿔보세요.`;
      } else {
        advice = "영양 성분 신호등을 잘 확인하며 골랐네요! 다음에는 단백질과 비타민이 더 풍부한 요거트나 방울토마토도 함께 담아보세요.";
      }

      this.dom.reportModalBody.innerHTML = `
        <div class="report-header">
          <div class="report-stamp-area stamp-slam">
            <img src="${isGood ? 'assets/images/ui/stamp-good.svg' : 'assets/images/ui/stamp-warning.svg'}" alt="스탬프">
          </div>
          <h2 class="report-title">건강 장바구니 영양 성적표</h2>
          <p style="color: #64748b; font-weight: 700;">식품의약품안전처 영양표시 기준 종합 평가</p>
        </div>

        <div class="report-grade-circle ${isGood ? 'pulse-green' : 'pulse-red'}">
          <div class="grade-letter">${grade}</div>
          <div class="grade-label">${gradeLabel}</div>
        </div>

        <div class="report-stats-grid">
          <div class="report-stat-item">
            <div class="report-stat-val">${totalCal}</div>
            <div class="report-stat-lbl">총 열량 (kcal)</div>
          </div>
          <div class="report-stat-item">
            <div class="report-stat-val">${totalSugar.toFixed(1)}g</div>
            <div class="report-stat-lbl">총 당류 (각설탕 ${(totalSugar/3).toFixed(1)}개)</div>
          </div>
          <div class="report-stat-item">
            <div class="report-stat-val">${totalSodium}mg</div>
            <div class="report-stat-lbl">총 나트륨</div>
          </div>
        </div>

        <div class="nutritionist-feedback">
          <img class="nutritionist-avatar" src="assets/images/ui/mascot.svg" alt="영양 다람이">
          <div class="feedback-text">
            <strong>영양 닥터 다람이의 총평:</strong><br>
            "${advice}"
          </div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px;">
          <h4 style="font-size: 0.95rem; margin-bottom: 8px;">🛒 담은 간식 신호등 검토</h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${cart.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; border-bottom: 1px dashed #f1f5f9; padding-bottom: 4px;">
                <span style="font-weight: 700;">${item.name}</span>
                <span>
                  당:<span class="traffic-badge ${item.trafficLight.sugar}"><span class="traffic-dot"></span></span>
                  나:<span class="traffic-badge ${item.trafficLight.sodium}"><span class="traffic-dot"></span></span>
                  지:<span class="traffic-badge ${item.trafficLight.saturatedFat}"><span class="traffic-dot"></span></span>
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      this.dom.reportModal.classList.add('open');

      if (isGood) {
        this.sound.play('fanfare');
        this.spawnConfetti();
      } else {
        this.sound.play('alert');
      }

      this.sound.speak(`장바구니 영양 성적표는 ${grade} 등급입니다! ${advice}`);
    }

    restartGame() {
      this.state.cart = [];
      this.state.inspectedItems.clear();
      this.state.currentLevel = 1;
      this.state.missionCompleted = false;
      this.state.adventure.score = 0;
      this.state.adventure.resistedItems.clear();
      this.state.adventure.blindBoughtItems.clear();
      this.state.adventure.smartBoughtItems.clear();
      this.state.adventure.choiceLog = [];

      this.dom.reportModal.classList.remove('open');
      this.renderShelves();
      this.updateCartUI();
      this.updateAdventureHUD();
      if (this.state.adventure.inStore) {
        this.renderAisleShelfProducts(AISLE_CORNERS[this.state.adventure.currentAisleIndex]);
      }
      this.renderMission();
      this.showToast('🔄 새로운 장보기 게임을 시작합니다!');
      this.sound.play('flip');
    }

    // ========================================================================
    // SNACK WORLD CUP TOURNAMENT ENGINE (간식 이상형 월드컵)
    // ========================================================================
    initWorldCup() {
      const shuffled = [...SNACK_DATA].sort(() => Math.random() - 0.5).slice(0, 16);
      
      const matches = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        matches.push([shuffled[i], shuffled[i + 1]]);
      }

      this.state.worldCup = {
        roundName: '16강',
        matches: matches,
        currentMatchIndex: 0,
        winners: [],
        champion: null
      };

      this.dom.worldcupArena.style.display = 'grid';
      this.dom.worldcupChampionScreen.style.display = 'none';
      this.renderWorldCupMatch();
    }

    renderWorldCupMatch() {
      const wc = this.state.worldCup;
      const currentMatch = wc.matches[wc.currentMatchIndex];

      if (!currentMatch) {
        this.advanceWorldCupRound();
        return;
      }

      const totalMatches = wc.matches.length;
      this.dom.worldcupRoundLabel.textContent = `${wc.roundName} (${wc.currentMatchIndex + 1} / ${totalMatches} 경기)`;

      const [snackA, snackB] = currentMatch;

      this.renderWorldCupCompetitorCard(this.dom.worldcupCardLeft, snackA, () => {
        this.handleWorldCupSelection(snackA, snackB);
      });

      this.renderWorldCupCompetitorCard(this.dom.worldcupCardRight, snackB, () => {
        this.handleWorldCupSelection(snackB, snackA);
      });

      let tip = "";
      if (snackA.nutrients.sugar > snackB.nutrients.sugar) {
        tip = `💡 [${snackA.name}]은 당류가 ${snackA.nutrients.sugar}g(각설탕 ${snackA.sugarCubes}개)인 반면, [${snackB.name}]은 ${snackB.nutrients.sugar}g으로 더 적어요!`;
      } else if (snackB.nutrients.sugar > snackA.nutrients.sugar) {
        tip = `💡 [${snackB.name}]은 당류가 ${snackB.nutrients.sugar}g(각설탕 ${snackB.sugarCubes}개)인 반면, [${snackA.name}]은 ${snackA.nutrients.sugar}g으로 더 적어요!`;
      } else {
        tip = `💡 두 간식의 나트륨과 포화지방 신호등 색깔을 비교해 보세요! 초록불이 많은 쪽이 안심 간식이에요.`;
      }
      this.dom.worldcupMascotTip.textContent = tip;
    }

    renderWorldCupCompetitorCard(container, snack, onSelect) {
      container.innerHTML = `
        <span class="worldcup-card-badge">${snack.category}</span>
        <img class="worldcup-card-img" src="${snack.image}" alt="${snack.name}">
        <h3 class="worldcup-card-name">${snack.name}</h3>
        <div class="worldcup-card-sub">${snack.servingSize} · ${snack.calories} kcal</div>

        <div class="worldcup-nutrition-table">
          <div class="worldcup-nut-row">
            <span>당류 (설탕):</span>
            <span>
              <strong>${snack.nutrients.sugar}g</strong> (각설탕 ${snack.sugarCubes}개)
              <span class="traffic-badge ${snack.trafficLight.sugar}"><span class="traffic-dot"></span></span>
            </span>
          </div>
          <div class="worldcup-nut-row">
            <span>나트륨 (소금):</span>
            <span>
              <strong>${snack.nutrients.sodium}mg</strong>
              <span class="traffic-badge ${snack.trafficLight.sodium}"><span class="traffic-dot"></span></span>
            </span>
          </div>
          <div class="worldcup-nut-row">
            <span>포화지방:</span>
            <span>
              <strong>${snack.nutrients.saturatedFat}g</strong>
              <span class="traffic-badge ${snack.trafficLight.saturatedFat}"><span class="traffic-dot"></span></span>
            </span>
          </div>
        </div>

        <button class="worldcup-pick-btn">
          👆 이 간식 선택하기 (PICK!)
        </button>
      `;

      container.onclick = () => {
        onSelect();
      };
    }

    handleWorldCupSelection(winner, loser) {
      this.sound.play('flip');
      this.state.worldCup.winners.push(winner);
      this.showToast(`✨ [${winner.name}]을(를) 선택했습니다!`);

      if (winner.isHealthy && !loser.isHealthy) {
        this.sound.speak(`탁월한 선택이에요! ${winner.name}은 ${loser.name}보다 영양 성분이 훨씬 건강해요.`);
      }

      this.state.worldCup.currentMatchIndex++;

      setTimeout(() => {
        this.renderWorldCupMatch();
      }, 350);
    }

    advanceWorldCupRound() {
      const wc = this.state.worldCup;
      const winners = wc.winners;

      if (winners.length === 1) {
        this.crownWorldCupChampion(winners[0]);
        return;
      }

      let nextRoundName = '8강';
      if (winners.length === 4) nextRoundName = '4강 (준결승)';
      if (winners.length === 2) nextRoundName = '결승전 (FINAL)';

      const nextMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
        nextMatches.push([winners[i], winners[i + 1]]);
      }

      wc.roundName = nextRoundName;
      wc.matches = nextMatches;
      wc.currentMatchIndex = 0;
      wc.winners = [];

      this.sound.play('beep');
      this.showToast(`🔥 ${nextRoundName} 대결이 시작됩니다!`);
      this.renderWorldCupMatch();
    }

    crownWorldCupChampion(champion) {
      this.state.worldCup.champion = champion;
      this.sound.play('fanfare');
      this.spawnConfetti();

      this.dom.worldcupArena.style.display = 'none';
      this.dom.worldcupChampionScreen.style.display = 'block';

      this.dom.worldcupChampionScreen.innerHTML = `
        <img class="champion-crown bounce-soft" src="assets/images/ui/trophy.svg" alt="골든 트로피">
        <h2 style="font-size: 2.2rem; font-weight: 900; color: #b45309; margin-bottom: 4px;">
          👑 제1회 건강 간식 월드컵 우승!
        </h2>
        <p style="font-size: 1.1rem; color: #78350f; font-weight: 800;">
          당신이 선택한 최고의 영양 챔피언 간식
        </p>

        <div class="champion-card-highlight">
          <img src="${champion.image}" alt="${champion.name}" style="height: 180px; margin: 0 auto 12px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));">
          <h3 style="font-size: 1.8rem; font-weight: 900; color: #0f172a; margin-bottom: 6px;">${champion.name}</h3>
          <p style="color: #64748b; font-weight: 700;">${champion.servingSize} · ${champion.calories} kcal</p>

          <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 12px; margin-top: 14px; text-align: left; font-size: 0.9rem; line-height: 1.6;">
            <div>• <strong>당류:</strong> ${champion.nutrients.sugar}g (각설탕 ${champion.sugarCubes}개)</div>
            <div>• <strong>나트륨:</strong> ${champion.nutrients.sodium}mg</div>
            <div>• <strong>포화지방:</strong> ${champion.nutrients.saturatedFat}g</div>
          </div>
        </div>

        <div class="nutritionist-feedback" style="max-width: 580px; margin: 0 auto 24px; text-align: left;">
          <img class="nutritionist-avatar" src="assets/images/ui/mascot.svg" alt="다람이">
          <div class="feedback-text">
            <strong>영양 닥터 다람이의 챔피언 총평:</strong><br>
            "${champion.name}이(가) 영양 성분 비교와 치열한 토너먼트를 뚫고 당당히 1등을 차지했습니다! ${champion.doctorQuote}"
          </div>
        </div>

        <div style="display: flex; gap: 14px; justify-content: center;">
          <button id="btn-replay-worldcup" class="cart-action-btn" style="max-width: 240px; background: linear-gradient(135deg, #f59e0b, #d97706);">
            🏆 월드컵 다시하기
          </button>
          <button id="btn-back-to-mart" class="cart-action-btn" style="max-width: 240px; background: linear-gradient(135deg, #10b981, #059669);">
            🏪 실감 마트 게임으로 가기
          </button>
        </div>
      `;

      document.getElementById('btn-replay-worldcup').addEventListener('click', () => {
        this.initWorldCup();
      });

      document.getElementById('btn-back-to-mart').addEventListener('click', () => {
        this.switchMode('adventure');
      });

      this.sound.speak(`축하합니다! 건강 간식 월드컵 최종 우승은 ${champion.name}입니다!`);
    }

    // ========================================================================
    // Utilities: Toast & Confetti
    // ========================================================================
    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = message;
      this.dom.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2600);
    }

    spawnConfetti() {
      const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
      for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = `${1.8 + Math.random() * 1.5}s`;
        particle.style.animationDelay = `${Math.random() * 0.4}s`;
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3500);
      }
    }
  }

  // Initialize App
  window.healthyCartApp = new HealthyCartApp();
});
