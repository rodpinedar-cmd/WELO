// WELO — Onboarding Controller v2
// Architecture: Module-style IIFE with service objects, declarative state machine,
// single state object, event bus, and offline-first registration.
// Structured for future ES module migration.

(function() {
'use strict';

/* ============================================================
   CONSTANTS
   Single source of truth for all magic values.
   ============================================================ */
const EVENTS = {
  STARTED: 'onboardingStarted',
  SCREEN_CHANGED: 'screenChanged',
  QUIZ_COMPLETED: 'quizCompleted',
  ROLE_SELECTED: 'roleSelected',
  SETUP_COMPLETED: 'setupCompleted',
  REGISTRATION_STARTED: 'registrationStarted',
  REGISTRATION_COMPLETED: 'registrationCompleted',
  REGISTRATION_OFFLINE: 'registrationOffline',
  FINISHED: 'onboardingFinished',
  SKIPPED: 'onboardingSkipped'
};

const STORAGE_KEYS = {
  DRAFT: 'onboarding_draft',
  PROFILE: 'welo_profile',
  COUPLE: 'welo_couple'
};

const CONFIG = {
  draftVersion: 1,
  debounceMs: 500,
  retryAttempts: 3,
  retryDelayMs: 1500,
  minPasswordLength: 6,
  codePattern: /^WLO-[A-Z0-9]{4}$/,
  supabaseWaitMs: 3000
};

/* ============================================================
   STATE
   Single immutable-by-convention state object.
   All mutations go through updateState().
   ============================================================ */
let state = {
  currentIndex: 0,
  quiz: { answers: {} },
  role: null,
  cycle: {},
  account: {},
  couple: {},
  analytics: { startedAt: null, screenTimes: {} },
  metadata: { draftVersion: CONFIG.draftVersion, supabasePending: false }
};

// FIX P1-6 + P0-7: Recursive deep merge that preserves nested properties.
// Empty object {} means "reset completely" — replaces target instead of merging.
function deepMerge(target, source) {
  const result = { ...target };
  Object.keys(source).forEach(key => {
    const val = source[key];
    if (
      val && typeof val === 'object' &&
      !Array.isArray(val) &&
      target[key] && typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      // P0 FIX #7: Empty object = intentional reset, replace entirely
      if (Object.keys(val).length === 0) {
        result[key] = {};
      } else {
        result[key] = deepMerge(target[key], val);
      }
    } else {
      result[key] = val;
    }
  });
  return result;
}

function updateState(partial) {
  state = deepMerge(state, partial);
  DraftService.scheduleSave();
  return state;
}

/* ============================================================
   DOM CACHE
   Cached references to avoid repeated queries.
   ============================================================ */
const DOM = {};

function cacheDOM() {
  DOM.onboarding = document.getElementById('onboarding');
  DOM.stage = document.getElementById('onb-stage');
  DOM.slides = document.getElementById('onb-slides');
  DOM.progress = document.getElementById('onb-progress');
  DOM.footer = document.getElementById('onb-footer');
  DOM.footerBack = document.getElementById('onb-footer-back');
  DOM.footerNext = document.getElementById('onb-footer-next');
  DOM.app = document.getElementById('app');
  DOM.allSlides = Array.from(DOM.slides.querySelectorAll('.onb-slide'));
}

/* ============================================================
   EVENT BUS
   Internal pub-sub for decoupled communication.
   ============================================================ */
const EventBus = {
  _listeners: new Map(),

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(fn);
  },

  emit(event, data) {
    const fns = this._listeners.get(event) || [];
    fns.forEach(fn => fn(data));
    TrackingService.track(event, data);
  }
};

/* ============================================================
   TRACKING SERVICE
   Single entry point for all analytics.
   Swap provider here without touching flow logic.
   ============================================================ */
const TrackingService = {
  track(event, payload) {
    // Delegate to unified analytics service (js/analytics.js)
    if (window.welo && window.welo.track) {
      window.welo.track(event, payload || {});
    }
    // Track per-screen time
    if (event === EVENTS.SCREEN_CHANGED && payload) {
      state.analytics.screenTimes[payload.from] = Date.now() - (state.analytics._screenStart || Date.now());
      state.analytics._screenStart = Date.now();
    }
  },

  trackScreen(screenName) {
    const slide = DOM.allSlides.find(s => s.dataset.screen === screenName);
    if (slide && slide.dataset.track === 'true') {
      this.track(slide.dataset.analytics, { screen: screenName, experiment: slide.dataset.experiment });
    }
  }
};

/* ============================================================
   ERROR SERVICE
   Centralized error handling with user feedback and logging.
   ============================================================ */
const ErrorService = {
  show(msg, inputEl) {
    if (typeof showToast === 'function') showToast(msg);
    if (inputEl) {
      inputEl.classList.add('onb-input--error', 'onb-anim-shake');
      setTimeout(() => inputEl.classList.remove('onb-input--error', 'onb-anim-shake'), 600);
    }
    this.log(msg);
  },

  log(msg, context) {
    console.warn('[WELO Onboarding Error]', msg, context || '');
  },

  clear(inputEl) {
    if (inputEl) inputEl.classList.remove('onb-input--error');
  }
};

/* ============================================================
   DRAFT SERVICE
   Temporal persistence with debounced saves and versioning.
   ============================================================ */
const DraftService = {
  _timer: null,

  scheduleSave() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.save(), CONFIG.debounceMs);
  },

  save() {
    try {
      // FIX P1-5: NEVER persist credentials in draft
      const draft = {
        version: CONFIG.draftVersion,
        state: {
          currentIndex: state.currentIndex,
          quiz: state.quiz,
          role: state.role,
          cycle: state.cycle,
          couple: state.couple
          // account intentionally excluded — no passwords in storage
        },
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    } catch (e) {
      ErrorService.log('Draft save failed', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DRAFT);
      if (!raw) return null;
      const draft = JSON.parse(raw);
      return this.migrate(draft);
    } catch (e) {
      ErrorService.log('Draft load failed', e);
      return null;
    }
  },

  clear() {
    clearTimeout(this._timer);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  },

  migrate(draft) {
    if (!draft || !draft.version) return null;
    // Future: handle version migrations here
    if (draft.version < CONFIG.draftVersion) {
      this.clear();
      return null;
    }
    return draft;
  }
};

/* ============================================================
   VALIDATION SERVICE
   Declarative validation linked to data-requires attributes.
   ============================================================ */
const ValidationService = {
  validate(screenName) {
    const handler = screens[screenName];
    if (!handler || !handler.validate) return true;
    return handler.validate();
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPassword(pass) {
    return pass && pass.length >= CONFIG.minPasswordLength;
  },

  isValidCoupleCode(code) {
    return CONFIG.codePattern.test((code || '').toUpperCase());
  }
};

/* ============================================================
   REGISTRATION SERVICE
   Orchestrates account creation. Each step is independent.
   ============================================================ */
const RegistrationService = {
  async register() {
    EventBus.emit(EVENTS.REGISTRATION_STARTED);

    const account = await this.createAccount();
    this.saveProfile();
    await this.createOrJoinCouple();
    this.applyWelcomeBonus();
    this.finishOnboarding();

    if (account.offline) {
      EventBus.emit(EVENTS.REGISTRATION_OFFLINE);
    } else {
      // Identify user in analytics post-registration
      if (window.welo && window.welo.identify && state.account.email) {
        window.welo.identify(state.account.email, { role: state.role });
      }
      EventBus.emit(EVENTS.REGISTRATION_COMPLETED);
    }
  },

  async createAccount() {
    const { email, password } = state.account;
    // P1: Defensive typeof guard for supabase global
    if (typeof supabase === 'undefined' || !supabase || typeof signUp !== 'function') {
      updateState({ metadata: { supabasePending: true } });
      return { offline: true };
    }

    let attempts = 0;
    while (attempts < CONFIG.retryAttempts) {
      try {
        const res = await signUp(email, password, state.role || 'pending');
        if (res.error) {
          attempts++;
          if (attempts >= CONFIG.retryAttempts) {
            ErrorService.log('SignUp failed after retries', res.error);
            updateState({ metadata: { supabasePending: true } });
            return { offline: true };
          }
          await this._wait(CONFIG.retryDelayMs * attempts);
        } else {
          return { offline: false, user: res.user };
        }
      } catch (e) {
        attempts++;
        if (attempts >= CONFIG.retryAttempts) {
          ErrorService.log('SignUp exception after retries', e);
          updateState({ metadata: { supabasePending: true } });
          return { offline: true };
        }
        await this._wait(CONFIG.retryDelayMs * attempts);
      }
    }
    return { offline: true };
  },

  saveProfile() {
    const profile = { role: state.role };
    // BUG FIX #1: Only include cycle data if user actually provided it
    if (state.cycle.lastPeriodStart) {
      profile.lastPeriodStart = state.cycle.lastPeriodStart;
      profile.cycleLength = state.cycle.cycleLength || 28;
      profile.periodDuration = state.cycle.periodDuration || 5;
    }
    if (state.couple.code) {
      profile.coupleCode = state.couple.code;
    }
    profile.sharePhase = true;
    profile.shareMood = true;
    setProfile(profile);
  },

  async createOrJoinCouple() {
    const code = state.couple.code;
    if (!code) return;
    if (typeof supabase === 'undefined' || !supabase) return;

    try {
      if (state.role === 'ella') {
        await createCouple(code);
      } else if (state.role === 'el') {
        // P0 FIX #2: joinCouple executes HERE, post-auth, not in setup.exit()
        if (typeof joinCouple === 'function') {
          const res = await joinCouple(code);
          if (res.error) {
            ErrorService.log('joinCouple failed post-auth', res.error);
            // Non-blocking: user is already registered, couple join can retry later
          }
        }
      }
    } catch (e) {
      ErrorService.log('Couple creation/join failed', e);
    }
  },

  applyWelcomeBonus() {
    // BUG FIX #2: Use 'welcomed' flag, not falsy check on glow
    const co = getCouple();
    if (co.welcomed === true) return;
    co.glow = 20;
    co.streak = 1;
    co.lastActive = today();
    co.welcomed = true;
    setCouple(co);
  },

  finishOnboarding() {
    DraftService.clear();
  },

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

/* ============================================================
   QUIZ COMPONENT
   Independent. Accepts questions array, renders dynamically.
   ============================================================ */
const QUIZ_QUESTIONS = [
  {
    id: 'food',
    text: '¿Cuál es la comida favorita de tu pareja?',
    options: ['Sushi', 'Pizza', 'Pasta', 'No sé seguro']
  },
  {
    id: 'mood',
    text: '¿Cómo se siente hoy?',
    options: ['Bien', 'Cansad@', 'Estresad@', 'No sé']
  },
  {
    id: 'date',
    text: '¿Cuándo fue su última cita real juntos?',
    options: ['Esta semana', 'Hace 2+ semanas', 'Ni recuerdo', 'Hoy']
  }
];

const QuizComponent = {
  currentQuestion: 0,

  render() {
    this.currentQuestion = 0;
    this.renderQuestion(0);
  },

  renderQuestion(index) {
    const container = document.getElementById('onb-quiz-container');
    if (!container) return;
    const q = QUIZ_QUESTIONS[index];
    if (!q) return;

    const progress = QUIZ_QUESTIONS.map((_, i) => {
      const cls = i < index ? 'completed' : i === index ? 'active' : '';
      return `<span class="onb-dot ${cls}"></span>`;
    }).join('');

    container.innerHTML = `
      <div class="onb-quiz-progress" style="display:flex;justify-content:center;gap:6px;margin-bottom:8px;">
        ${progress}
      </div>
      <div class="onb-quiz-question">
        <p data-i18n="onboarding.quiz.q${index + 1}">${q.text}</p>
        <div class="onb-quiz-options">
          ${q.options.map(opt => `
            <button class="onb-quiz-option" data-quiz-q="${index}" data-quiz-value="${opt}">${opt}</button>
          `).join('')}
        </div>
      </div>`;

    // Focus first option for keyboard users
    const firstOpt = container.querySelector('.onb-quiz-option');
    if (firstOpt) firstOpt.focus();
  },

  handleAnswer(questionIndex, value) {
    const answers = { ...state.quiz.answers, [QUIZ_QUESTIONS[questionIndex].id]: value };
    updateState({ quiz: { answers } });

    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      this.currentQuestion = questionIndex + 1;
      this.renderQuestion(this.currentQuestion);
    } else {
      EventBus.emit(EVENTS.QUIZ_COMPLETED, answers);
      // Auto-advance after short delay for feedback
      setTimeout(() => Navigation.next(), 300);
    }
  },

  isComplete() {
    return Object.keys(state.quiz.answers).length >= QUIZ_QUESTIONS.length;
  }
};

/* ============================================================
   PROGRESS COMPONENT
   Auto-generates dots from DOM. Updates on screen change.
   ============================================================ */
const ProgressComponent = {
  build() {
    const count = DOM.allSlides.length;
    let html = '';
    for (let i = 0; i < count; i++) {
      const active = i === 0 ? ' active' : '';
      const label = DOM.allSlides[i].dataset.screen || `Paso ${i + 1}`;
      html += `<span class="onb-dot${active}" role="tab" aria-selected="${i === 0}" aria-label="${label}"></span>`;
    }
    DOM.progress.innerHTML = html;
  },

  update(index) {
    const dots = DOM.progress.querySelectorAll('.onb-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.classList.toggle('completed', i < index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }
};

/* ============================================================
   FOOTER COMPONENT
   Updates CTA text and back button visibility per screen.
   ============================================================ */
const FOOTER_CONFIG = {
  hook:     { next: 'Descubrir →', backVisible: false },
  quiz:     { next: null, backVisible: true },        // null = hide next (quiz auto-advances)
  reveal:   { next: '¿Cómo funciona? →', backVisible: false },
  preview:  { next: 'Quiero esto →', backVisible: true },
  role:     { next: 'Continuar →', backVisible: true },
  setup:    { next: 'Continuar →', backVisible: true },
  register: { next: 'Crear cuenta', backVisible: true },
  welcome:  { next: 'Empezar →', backVisible: false }
};

const FooterComponent = {
  update(screenName) {
    const config = FOOTER_CONFIG[screenName] || { next: 'Continuar →', backVisible: true };
    DOM.footerBack.hidden = !config.backVisible;
    if (config.next === null) {
      DOM.footerNext.hidden = true;
    } else {
      DOM.footerNext.hidden = false;
      DOM.footerNext.textContent = config.next;
    }
  }
};

/* ============================================================
   SCREEN HANDLERS — Declarative state machine
   Each screen defines enter(), validate(), exit().
   ============================================================ */
const screens = {
  hook: {
    enter() { /* Static screen, no dynamic content */ },
    validate() { return true; },
    exit() { /* noop */ }
  },

  quiz: {
    enter() { QuizComponent.render(); },
    validate() { return QuizComponent.isComplete(); },
    exit() { /* answers already in state via QuizComponent */ }
  },

  reveal: {
    enter() {
      const container = document.getElementById('onb-reveal-content');
      if (!container) return;
      const answers = state.quiz.answers;
      const unknowns = Object.values(answers).filter(v =>
        v === 'No sé seguro' || v === 'No sé'
      ).length;

      let html;
      if (unknowns > 0) {
        html = `
          <p class="onb-title" style="font-size:var(--onb-font-size-xl);" data-i18n="onboarding.reveal.unknown_stat">
            El <strong style="color:var(--onb-primary);">68%</strong> de parejas no sabe esto de su pareja después de 1 año juntos.
          </p>
          <p class="onb-subtitle" data-i18n="onboarding.reveal.unknown_cta">
            WELO te ayuda a descubrir (y redescubrir) a la persona que amas.
          </p>`;
      } else {
        html = `
          <p class="onb-title" style="font-size:var(--onb-font-size-xl);" data-i18n="onboarding.reveal.known_stat">
            ¡Buena base! Pero hay capas más profundas.
          </p>
          <p class="onb-subtitle" data-i18n="onboarding.reveal.known_cta">
            WELO lleva tu conexión al siguiente nivel con retos, juegos y planes que no encontrarías solo.
          </p>`;
      }
      container.innerHTML = html;
    },
    validate() { return true; },
    exit() { /* noop */ }
  },

  preview: {
    enter() { /* Static HTML, carousel scrolls natively */ },
    validate() { return true; },
    exit() { /* noop */ }
  },

  role: {
    enter() { /* Static. Buttons handled via event delegation. */ },
    validate() {
      return state.role !== null;
    },
    exit() {
      EventBus.emit(EVENTS.ROLE_SELECTED, { role: state.role });
      // Prepare setup screen: show correct group
      const ellaGroup = document.getElementById('onb-setup-ella');
      const elGroup = document.getElementById('onb-setup-el');
      if (state.role === 'ella') {
        ellaGroup.hidden = false;
        elGroup.hidden = true;
        document.body.classList.remove('male');
      } else {
        ellaGroup.hidden = true;
        elGroup.hidden = false;
        document.body.classList.add('male');
      }
    }
  },

  setup: {
    enter() {
      // If ella, set sensible default date (5 days ago)
      if (state.role === 'ella') {
        const inp = document.getElementById('onb-inp-lastperiod');
        if (inp && !inp.value && !state.cycle.lastPeriodStart) {
          const d = new Date();
          d.setDate(d.getDate() - 5);
          inp.value = d.toISOString().split('T')[0];
        } else if (inp && state.cycle.lastPeriodStart) {
          inp.value = state.cycle.lastPeriodStart;
        }
      }
      // If el, restore code if exists
      if (state.role === 'el' && state.couple.code) {
        const inp = document.getElementById('onb-inp-code');
        if (inp) inp.value = state.couple.code;
      }
    },
    validate() {
      if (state.role === 'ella') {
        // Cycle is optional — always valid (skip or fill)
        return true;
      }
      if (state.role === 'el') {
        // Code is optional — can skip
        const inp = document.getElementById('onb-inp-code');
        const code = (inp ? inp.value : '').trim().toUpperCase();
        if (!code) return true; // Skip is valid
        // BUG FIX #3: Validate format
        if (!ValidationService.isValidCoupleCode(code)) {
          ErrorService.show('Formato: WLO-XXXX (4 letras/números)', inp);
          return false;
        }
        return true;
      }
      return true;
    },

    exit() {
      // P0 FIX #2: No async calls here. joinCouple moved to RegistrationService.
      if (state.role === 'ella') {
        const lastPeriod = document.getElementById('onb-inp-lastperiod');
        const cycleLen = document.getElementById('onb-inp-cyclelength');
        const periodDur = document.getElementById('onb-inp-periodduration');
        const lp = lastPeriod ? lastPeriod.value : '';
        // BUG FIX #1: Only store if user actually entered data
        if (lp) {
          updateState({
            cycle: {
              lastPeriodStart: lp,
              cycleLength: parseInt(cycleLen ? cycleLen.value : 28) || 28,
              periodDuration: parseInt(periodDur ? periodDur.value : 5) || 5
            }
          });
        } else {
          updateState({ cycle: {} });
        }
        // Generate couple code for ella
        const code = genCode();
        updateState({ couple: { code } });
      }

      if (state.role === 'el') {
        const inp = document.getElementById('onb-inp-code');
        const code = (inp ? inp.value : '').trim().toUpperCase();
        if (code && ValidationService.isValidCoupleCode(code)) {
          // Store code — actual joinCouple happens post-auth in RegistrationService
          updateState({ couple: { code, pendingValidation: true } });
        } else if (code && !ValidationService.isValidCoupleCode(code)) {
          // Invalid format but user typed something — clear it
          updateState({ couple: {} });
        } else {
          updateState({ couple: {} });
        }
      }
      EventBus.emit(EVENTS.SETUP_COMPLETED, { role: state.role, cycle: state.cycle, couple: state.couple });
    }
  },

  register: {
    enter() {
      const emailInp = document.getElementById('onb-inp-email');
      if (emailInp) {
        emailInp.focus();
        // Restore if draft had email (account is not persisted in draft, but handle edge case)
        if (state.account.email) emailInp.value = state.account.email;
      }
    },
    validate() {
      const email = document.getElementById('onb-inp-email');
      const pass = document.getElementById('onb-inp-pass');
      const emailVal = email ? email.value.trim() : '';
      const passVal = pass ? pass.value : '';

      ErrorService.clear(email);
      ErrorService.clear(pass);

      if (!ValidationService.isValidEmail(emailVal)) {
        ErrorService.show('Introduce un email válido', email);
        return false;
      }
      if (!ValidationService.isValidPassword(passVal)) {
        ErrorService.show(`Mínimo ${CONFIG.minPasswordLength} caracteres`, pass);
        return false;
      }
      updateState({ account: { email: emailVal, password: passVal } });
      return true;
    },
    async exit() {
      // Loading state: disable button, show feedback
      DOM.footerNext.disabled = true;
      DOM.footerNext.textContent = 'Creando...';
      DOM.footerNext.classList.add('onb-btn--loading');
      try {
        await RegistrationService.register();
      } finally {
        DOM.footerNext.disabled = false;
        DOM.footerNext.classList.remove('onb-btn--loading');
      }
    }
  },

  welcome: {
    enter() {
      // Render Lumi with birth animation
      const lumiContainer = document.getElementById('onb-welcome-lumi');
      if (lumiContainer && typeof lumiSVG === 'function') {
        const lumiData = typeof updateLumiDaily === 'function' ? updateLumiDaily() : {};
        lumiContainer.innerHTML = lumiSVG(lumiData);
        lumiContainer.classList.add('onb-anim-scale-in');
        setTimeout(() => lumiContainer.classList.remove('onb-anim-scale-in'), 600);
      }
    },
    validate() { return true; },
    exit() {
      // Transition to app
      DOM.onboarding.style.display = 'none';
      DOM.app.style.display = 'block';
      if (typeof initApp === 'function') initApp();
      EventBus.emit(EVENTS.FINISHED, { totalTime: Date.now() - state.analytics.startedAt });
    }
  }
};

/* ============================================================
   NAVIGATION
   All screen transitions go through these functions.
   P1 FIX #4: Mutex prevents double-tap / concurrent navigation.
   ============================================================ */
const Navigation = {
  _navigating: false,

  async next() {
    if (this._navigating) return;
    this._navigating = true;

    try {
      const currentSlide = DOM.allSlides[state.currentIndex];
      const screenName = currentSlide.dataset.screen;
      const handler = screens[screenName];

      // Validate current screen before advancing
      if (handler && handler.validate) {
        const valid = handler.validate();
        if (!valid) { this._navigating = false; return; }
      }

      // Exit current screen (may be async for register)
      if (handler && handler.exit) {
        await handler.exit();
      }

      // Advance
      const nextIndex = state.currentIndex + 1;
      if (nextIndex < DOM.allSlides.length) {
        this.goTo(nextIndex);
      }
    } finally {
      this._navigating = false;
    }
  },

  back() {
    if (this._navigating) return;
    if (state.currentIndex <= 0) return;
    this.goTo(state.currentIndex - 1);
  },

  // P0 FIX #1: Skip advances without executing exit() — no data saved from inputs
  skip() {
    if (this._navigating) return;
    this._navigating = true;
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < DOM.allSlides.length) {
      this.goTo(nextIndex);
    }
    this._navigating = false;
  },

  goTo(index) {
    if (index < 0 || index >= DOM.allSlides.length) return;
    const prevIndex = state.currentIndex;
    const prevScreen = DOM.allSlides[prevIndex].dataset.screen;
    const nextScreen = DOM.allSlides[index].dataset.screen;

    // Update DOM: deactivate prev, activate next
    DOM.allSlides[prevIndex].classList.remove('active');
    DOM.allSlides[index].classList.add('active');

    // Apply entrance animation based on direction
    const direction = index > prevIndex ? 'onb-anim-slide-left' : 'onb-anim-slide-right';
    DOM.allSlides[index].classList.add(direction);
    setTimeout(() => DOM.allSlides[index].classList.remove(direction), 350);

    // Update state
    updateState({ currentIndex: index });

    // Update UI components
    ProgressComponent.update(index);
    FooterComponent.update(nextScreen);

    // Focus management for accessibility
    const newSlide = DOM.allSlides[index];
    newSlide.setAttribute('tabindex', '-1');
    newSlide.focus({ preventScroll: true });

    // Enter new screen
    const handler = screens[nextScreen];
    if (handler && handler.enter) handler.enter();

    // Track
    TrackingService.trackScreen(nextScreen);
    EventBus.emit(EVENTS.SCREEN_CHANGED, { from: prevScreen, to: nextScreen, index });
  },

  canAdvance() {
    const currentSlide = DOM.allSlides[state.currentIndex];
    const screenName = currentSlide.dataset.screen;
    return ValidationService.validate(screenName);
  }
};

/* ============================================================
   EVENT BINDING
   Single delegation point. No duplicate listeners.
   ============================================================ */
function bindEvents() {
  // Footer buttons
  DOM.footerNext.addEventListener('click', () => Navigation.next());
  DOM.footerBack.addEventListener('click', () => Navigation.back());

  // Keyboard navigation
  DOM.onboarding.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target === DOM.footerNext) {
      Navigation.next();
    }
  });

  // Event delegation for interactive elements inside slides
  DOM.slides.addEventListener('click', (e) => {
    // Quiz options
    const quizOpt = e.target.closest('.onb-quiz-option');
    if (quizOpt) {
      const qIdx = parseInt(quizOpt.dataset.quizQ);
      const value = quizOpt.dataset.quizValue;
      // Visual feedback
      const siblings = quizOpt.parentElement.querySelectorAll('.onb-quiz-option');
      siblings.forEach(s => s.classList.remove('selected'));
      quizOpt.classList.add('selected');
      // Process after brief feedback delay
      setTimeout(() => QuizComponent.handleAnswer(qIdx, value), 200);
      return;
    }

    // Role cards
    const roleCard = e.target.closest('.onb-role-card');
    if (roleCard) {
      const role = roleCard.dataset.role;
      updateState({ role });
      // Update aria
      DOM.slides.querySelectorAll('.onb-role-card').forEach(c => {
        c.setAttribute('aria-checked', c.dataset.role === role ? 'true' : 'false');
      });
      // Auto-advance after selection
      setTimeout(() => Navigation.next(), 250);
      return;
    }

    // Skip buttons — P0 FIX #1: skip() does NOT execute exit(), no data saved
    const skipBtn = e.target.closest('.onb-skip');
    if (skipBtn) {
      // Clear data for the skipped section without reading inputs
      if (state.role === 'ella') {
        updateState({ cycle: {} }); // Empty — no fake dates
      }
      if (state.role === 'el') {
        updateState({ couple: {} }); // No code
      }
      Navigation.skip();
      return;
    }

    // Social login buttons
    if (e.target.closest('#onb-btn-google') || e.target.closest('#onb-btn-apple')) {
      // Future: OAuth flow
      ErrorService.show('Próximamente disponible');
      return;
    }
  });
}

/* ============================================================
   BOOT
   Entry point. Decides: skip onboarding or start/resume.
   ============================================================ */

// P0 FIX #3: Rebuilds DOM state when resuming from draft
function prepareRestoredState() {
  // Restore role-dependent UI
  if (state.role) {
    const ellaGroup = document.getElementById('onb-setup-ella');
    const elGroup = document.getElementById('onb-setup-el');
    if (state.role === 'ella') {
      if (ellaGroup) ellaGroup.hidden = false;
      if (elGroup) elGroup.hidden = true;
      document.body.classList.remove('male');
    } else {
      if (ellaGroup) ellaGroup.hidden = true;
      if (elGroup) elGroup.hidden = false;
      document.body.classList.add('male');
    }
  }

  // Restore role card aria state
  if (state.role) {
    DOM.slides.querySelectorAll('.onb-role-card').forEach(c => {
      c.setAttribute('aria-checked', c.dataset.role === state.role ? 'true' : 'false');
    });
  }

  // Restore cycle input values if they exist
  if (state.cycle.lastPeriodStart) {
    const inp = document.getElementById('onb-inp-lastperiod');
    if (inp) inp.value = state.cycle.lastPeriodStart;
  }
  if (state.cycle.cycleLength) {
    const inp = document.getElementById('onb-inp-cyclelength');
    if (inp) inp.value = state.cycle.cycleLength;
  }
  if (state.cycle.periodDuration) {
    const inp = document.getElementById('onb-inp-periodduration');
    if (inp) inp.value = state.cycle.periodDuration;
  }

  // Restore couple code input
  if (state.couple.code) {
    const inp = document.getElementById('onb-inp-code');
    if (inp) inp.value = state.couple.code;
  }
}

function boot() {
  // Initialize Supabase connection
  if (typeof initSupabase === 'function') initSupabase();

  // If already has profile → skip onboarding entirely
  if (getProfile()) {
    DOM.onboarding.style.display = 'none';
    DOM.app.style.display = 'block';
    if (getProfile().role === 'el') document.body.classList.add('male');
    EventBus.emit(EVENTS.SKIPPED);
    return;
  }

  // Build progress dots from DOM
  ProgressComponent.build();

  // Check for saved draft (resume flow)
  const draft = DraftService.load();
  if (draft && draft.state) {
    // Restore state (account is never in draft — P1 fix #5)
    state = {
      ...state,
      ...draft.state,
      analytics: { startedAt: Date.now(), screenTimes: {}, _screenStart: Date.now() },
      metadata: { ...state.metadata, draftVersion: CONFIG.draftVersion }
    };
    // P0 FIX #3: Rebuild DOM for restored state before showing slide
    prepareRestoredState();
    // Navigate to saved screen
    Navigation.goTo(draft.state.currentIndex || 0);
  } else {
    // Fresh start
    updateState({ analytics: { startedAt: Date.now(), screenTimes: {}, _screenStart: Date.now() } });
    FooterComponent.update('hook');
    TrackingService.trackScreen('hook');
    EventBus.emit(EVENTS.STARTED);
  }

  // Bind all event listeners
  bindEvents();
}

/* ============================================================
   INITIALIZATION
   Cache DOM and boot when ready.
   ============================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { cacheDOM(); boot(); });
} else {
  cacheDOM();
  boot();
}

})();
