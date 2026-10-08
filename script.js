(() => {
  'use strict';

  const STORAGE_KEY = 'homeFitnessPlanner.data.v1';
  const MAX_IMAGE_BYTES = 150 * 1024;
  const MAX_TOTAL_IMAGE_BYTES = 1.5 * 1024 * 1024;
  const MAX_IMAGE_SIDE = 640;
  const MUSCLE_GROUPS = ['Грудь', 'Спина', 'Ноги и ягодицы', 'Плечи', 'Руки', 'Пресс и кор', 'Кардио / всё тело'];
  const EQUIPMENT = ['Без инвентаря', 'Стул / опора', 'Гантели', 'Фитнес-резинка', 'Турник'];

  let illustrationSequence = 0;
  const svgBase = (label, figure) => {
    const gradientId = `art-bg-${++illustrationSequence}`;
    return `<svg viewBox="0 0 180 150" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#51252e"/><stop offset="1" stop-color="#201b21"/></linearGradient></defs><rect width="180" height="150" rx="16" fill="url(#${gradientId})"/><path d="M15 123h150" stroke="#625158" stroke-width="2"/><g fill="none" stroke="#f4edf0" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${figure}</g><g fill="#f0444b"><circle cx="90" cy="77" r="5"/><circle cx="90" cy="77" r="10" fill-opacity=".18"/></g></svg>`;
  };

  const BUILTIN_ART = {
    pushup: svgBase('Схема отжимания от пола: упор лёжа', '<circle cx="42" cy="75" r="11" fill="#f4edf0" stroke="none"/><path d="M54 80 97 91 130 87M70 84 58 111M105 90 123 111M130 87 154 107M58 111h-9M123 111h9"/><path d="M78 85 101 91" stroke="#ff7077" stroke-width="10"/>'),
    squat: svgBase('Схема приседания с собственным весом', '<circle cx="91" cy="27" r="11" fill="#f4edf0" stroke="none"/><path d="M91 40 88 76 65 91 46 119M88 76 112 90 135 115M88 52 60 67 48 88M89 53 116 65 130 84M46 119h-12M135 115h12"/><path d="M88 58 89 77 65 91" stroke="#ff7077" stroke-width="10"/>'),
    lunge: svgBase('Схема выпада на месте', '<circle cx="90" cy="24" r="11" fill="#f4edf0" stroke="none"/><path d="M90 37 88 72 67 88 50 117M88 72 113 85 139 106M88 49 62 63 51 81M89 49 117 61 131 78M50 117h-13M139 106h13"/><path d="M88 57 88 73 67 88" stroke="#ff7077" stroke-width="10"/>'),
    bridge: svgBase('Схема ягодичного мостика лёжа', '<circle cx="39" cy="96" r="10" fill="#f4edf0" stroke="none"/><path d="M50 96 82 95 105 71 131 79 150 111M105 71 103 113M131 79 137 112M103 113h-9M137 112h11"/><path d="M80 95 105 71 124 77" stroke="#ff7077" stroke-width="10"/>'),
    plank: svgBase('Схема планки на предплечьях', '<circle cx="42" cy="72" r="11" fill="#f4edf0" stroke="none"/><path d="M55 77 99 83 133 82M72 80 61 108M101 83 113 108M133 82 153 106M61 108h-9M113 108h9"/><path d="M58 78 99 83 128 82" stroke="#ff7077" stroke-width="10"/>'),
    jumping: svgBase('Схема прыжков джампинг-джек', '<circle cx="90" cy="28" r="11" fill="#f4edf0" stroke="none"/><path d="M90 42 90 82M90 52 55 28 32 15M90 52 125 28 148 15M90 82 54 119 30 136M90 82 126 119 150 136"/><path d="M90 45 90 79" stroke="#ff7077" stroke-width="10"/>'),
    birdDog: svgBase('Схема упражнения «Птица-собака»', '<circle cx="54" cy="60" r="10" fill="#f4edf0" stroke="none"/><path d="M65 65 103 72 130 70M82 69 67 101 48 104M102 72 120 99 142 103M72 67 46 47 28 38M105 70 136 53 157 47M48 104h-8M142 103h9"/><path d="M68 66 103 72" stroke="#ff7077" stroke-width="10"/>'),
    crunch: svgBase('Схема скручивания на пресс', '<circle cx="48" cy="79" r="10" fill="#f4edf0" stroke="none"/><path d="M58 81 91 91 116 78M91 91 85 117M116 78 135 55 151 57M85 117h-12M135 55l12-8M62 76 73 57 91 51M82 61 97 73"/><path d="M59 81 91 91 111 80" stroke="#ff7077" stroke-width="10"/>'),
    calf: svgBase('Схема подъёма на носки', '<circle cx="88" cy="25" r="11" fill="#f4edf0" stroke="none"/><path d="M88 38 88 76 73 102 73 119M88 76 105 102 105 119M88 51 63 67 58 84M89 51 113 65 119 82M73 119h-13M105 119h13"/><path d="M77 96 73 112M101 96 105 112" stroke="#ff7077" stroke-width="10"/>'),
    deadbug: svgBase('Схема упражнения «Жук» лёжа', '<circle cx="43" cy="84" r="10" fill="#f4edf0" stroke="none"/><path d="M54 85 89 87 115 70M89 87 119 100 143 97M86 86 76 57 57 47M89 86 111 59 132 54M115 70 134 83 151 83"/><path d="M54 85 88 87 109 73" stroke="#ff7077" stroke-width="10"/>'),
    chair: svgBase('Схема обратного отжимания от опоры', '<path d="M122 48v66M122 69h29M139 69v45M122 114h33" stroke="#b1aab3" stroke-width="5" fill="none"/><circle cx="61" cy="48" r="10" fill="#f4edf0" stroke="none"/><path d="M70 54 91 74 119 70M91 74 91 102 124 102M75 58 99 69 121 69M91 102 76 117M124 102 141 115"/><path d="M91 73 118 70" stroke="#ff7077" stroke-width="9"/>'),
    row: svgBase('Схема тяги к поясу в наклоне', '<circle cx="92" cy="31" r="10" fill="#f4edf0" stroke="none"/><path d="M88 43 69 73 98 84 124 88M69 73 51 109 44 124M98 84 115 110 133 122M77 59 53 81 41 72M78 60 102 77 119 69M41 72h-8M119 69l8-7"/><path d="M73 69 96 81" stroke="#ff7077" stroke-width="9"/>'),
    press: svgBase('Схема жима рук вверх стоя', '<circle cx="91" cy="26" r="11" fill="#f4edf0" stroke="none"/><path d="M91 39 91 82M91 52 67 31 57 16M91 52 115 31 125 16M91 82 72 117M91 82 110 117M57 16l-5-6M125 16l5-6"/><path d="M91 43 91 77" stroke="#ff7077" stroke-width="10"/>')
  };

  const BUILTIN_EXERCISES = [
    { id: 'ex_pushup', name: 'Отжимания от пола', muscleGroups: ['Грудь', 'Руки', 'Плечи'], equipment: ['Без инвентаря'], description: 'Примите упор лёжа, ладони поставьте чуть шире плеч. Сохраняйте прямую линию корпуса, сгибайте руки и плавно опускайте грудь к полу, затем оттолкнитесь.', imageKey: 'pushup', prescriptionDefaults: { sets: 3, reps: 10 } },
    { id: 'ex_squat', name: 'Приседания с собственным весом', muscleGroups: ['Ноги и ягодицы'], equipment: ['Без инвентаря'], description: 'Поставьте стопы примерно на ширине плеч. Отведите таз назад, согните колени и опуститесь настолько, насколько комфортно, затем вернитесь в исходное положение.', imageKey: 'squat', prescriptionDefaults: { sets: 3, reps: 12 } },
    { id: 'ex_lunge', name: 'Выпады на месте', muscleGroups: ['Ноги и ягодицы'], equipment: ['Без инвентаря'], description: 'Сделайте шаг вперёд и плавно согните обе ноги. Держите корпус устойчиво, переднее колено направляйте по линии стопы. Вернитесь назад и повторите другой ногой.', imageKey: 'lunge', prescriptionDefaults: { sets: 3, reps: 8 } },
    { id: 'ex_bridge', name: 'Ягодичный мостик', muscleGroups: ['Ноги и ягодицы', 'Пресс и кор'], equipment: ['Без инвентаря'], description: 'Лягте на спину, согните ноги и поставьте стопы на пол. Напрягите ягодицы, поднимите таз до комфортного положения и плавно опустите его.', imageKey: 'bridge', prescriptionDefaults: { sets: 3, reps: 12 } },
    { id: 'ex_plank', name: 'Планка на предплечьях', muscleGroups: ['Пресс и кор', 'Плечи'], equipment: ['Без инвентаря'], description: 'Обопритесь на предплечья и носки стоп. Удерживайте корпус ровно, не задерживая дыхание. Остановитесь, если теряете устойчивое положение.', imageKey: 'plank', prescriptionDefaults: { sets: 3, durationSec: 30 } },
    { id: 'ex_jumping', name: 'Прыжки «Джампинг-джек»', muscleGroups: ['Кардио / всё тело'], equipment: ['Без инвентаря'], description: 'Из положения стоя мягко подпрыгните, разводя ноги и поднимая руки, затем вернитесь в исходное положение. Выберите удобный темп.', imageKey: 'jumping', prescriptionDefaults: { sets: 3, durationSec: 30 } },
    { id: 'ex_bird_dog', name: 'Птица-собака', muscleGroups: ['Спина', 'Пресс и кор'], equipment: ['Без инвентаря'], description: 'Встаньте на четвереньки. Вытяните противоположные руку и ногу, сохраняя таз устойчивым, затем вернитесь и поменяйте стороны.', imageKey: 'birdDog', prescriptionDefaults: { sets: 3, reps: 8 } },
    { id: 'ex_crunch', name: 'Скручивания на пресс', muscleGroups: ['Пресс и кор'], equipment: ['Без инвентаря'], description: 'Лягте на спину, согните колени. Мягко приподнимите лопатки, направляя рёбра к тазу; не тяните голову руками и плавно опуститесь.', imageKey: 'crunch', prescriptionDefaults: { sets: 3, reps: 12 } },
    { id: 'ex_calf', name: 'Подъёмы на носки', muscleGroups: ['Ноги и ягодицы'], equipment: ['Без инвентаря'], description: 'Встаньте устойчиво, при необходимости держитесь за опору. Поднимитесь на носки, сделайте короткую паузу и плавно опустите пятки.', imageKey: 'calf', prescriptionDefaults: { sets: 3, reps: 15 } },
    { id: 'ex_deadbug', name: 'Упражнение «Жук»', muscleGroups: ['Пресс и кор'], equipment: ['Без инвентаря'], description: 'Лягте на спину и поднимите согнутые ноги. Поочерёдно опускайте противоположные руку и ногу в удобной амплитуде, сохраняя корпус устойчивым.', imageKey: 'deadbug', prescriptionDefaults: { sets: 3, reps: 8 } },
    { id: 'ex_chair_dip', name: 'Разгибание рук от опоры', muscleGroups: ['Руки', 'Плечи'], equipment: ['Стул / опора'], description: 'Сядьте у устойчивой опоры и разместите ладони рядом с бёдрами. Слегка отведите таз вперёд и сгибайте руки только в комфортной амплитуде.', imageKey: 'chair', prescriptionDefaults: { sets: 2, reps: 8 } },
    { id: 'ex_row', name: 'Тяга к поясу в наклоне', muscleGroups: ['Спина', 'Руки'], equipment: ['Гантели'], description: 'Слегка наклоните корпус с ровной спиной. Потяните гантели к поясу, направляя локти назад, затем плавно опустите руки.', imageKey: 'row', prescriptionDefaults: { sets: 3, reps: 10 } },
    { id: 'ex_press', name: 'Жим рук вверх стоя', muscleGroups: ['Плечи', 'Руки'], equipment: ['Гантели'], description: 'Встаньте устойчиво и поднимите гантели от уровня плеч вверх в комфортной амплитуде. Не прогибайтесь в пояснице, плавно опустите руки.', imageKey: 'press', prescriptionDefaults: { sets: 3, reps: 10 } }
  ].map((item) => ({ ...item, source: 'builtin', isArchived: false, isFavorite: false, illustrationRef: { type: 'builtin', imageKey: item.imageKey }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));

  const cloneItems = (ids) => ids.map((id, index) => {
    const exercise = BUILTIN_EXERCISES.find((item) => item.id === id);
    return snapshotItem(exercise, index);
  });
  const BUILTIN_TEMPLATES = [
    { id: 'tpl_fullbody', name: 'Всё тело без инвентаря', items: cloneItems(['ex_jumping', 'ex_squat', 'ex_pushup', 'ex_bridge', 'ex_plank']) },
    { id: 'tpl_legs_core', name: 'Ноги и корпус', items: cloneItems(['ex_squat', 'ex_lunge', 'ex_bridge', 'ex_deadbug']) },
    { id: 'tpl_mobility', name: 'Короткая домашняя тренировка', items: cloneItems(['ex_calf', 'ex_bird_dog', 'ex_pushup', 'ex_crunch']) }
  ].map((template) => ({ ...template, source: 'builtin', isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));

  const app = document.getElementById('app');
  const exerciseDialog = document.getElementById('exercise-dialog');
  const templateDialog = document.getElementById('template-dialog');
  const applyDialog = document.getElementById('apply-dialog');
  const workoutDialog = document.getElementById('workout-dialog');
  const generatorDialog = document.getElementById('generator-dialog');
  const confirmDialog = document.getElementById('confirm-dialog');
  const toastElement = document.getElementById('toast');
  let toastTimer;
  let screen = 'plan';
  let calendarMode = 'week';
  let calendarDate = localDateString(new Date());
  let selectedDate = localDateString(new Date());
  let progressMode = 'week';
  let progressDate = localDateString(new Date());
  let search = '';
  let groupFilter = '';
  let equipmentFilter = '';
  let favoritesOnly = false;
  let showArchivedExercises = false;
  let showArchivedTemplates = false;
  let pendingImageData = '';
  let pendingImageError = '';
  let storageWarning = '';
  let pendingBackup = null;
  let appData;
  let lastSavedData;

  function id(prefix) {
    return `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`}`;
  }

  function snapshotItem(exercise, index, prescription = exercise?.prescriptionDefaults || {}) {
    return {
      itemId: id('item'), exerciseId: exercise?.id || '', exerciseNameSnapshot: exercise?.name || '',
      muscleGroupsSnapshot: [...(exercise?.muscleGroups || [])], descriptionSnapshot: exercise?.description || '',
      illustrationRef: structuredCloneSafe(exercise?.illustrationRef || { type: 'builtin', imageKey: 'squat' }),
      equipmentSnapshot: [...(exercise?.equipment || [])], prescription: { ...prescription }, completed: false, order: index
    };
  }

  function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value)); }

  function initialData() {
    return {
      schemaVersion: 1,
      settings: { highContrast: false, largeText: false, onboardingDismissed: false },
      goal: { weeklyTarget: 3 },
      exercises: structuredCloneSafe(BUILTIN_EXERCISES),
      mediaAssets: [],
      templates: structuredCloneSafe(BUILTIN_TEMPLATES),
      workouts: [],
      recurrences: [],
      uiState: { screen: 'plan' }
    };
  }

  function validRoot(data) { return validateData(data); }

  function validateData(data) {
    if (!data || typeof data !== 'object' || data.schemaVersion !== 1 || !Array.isArray(data.exercises) || !Array.isArray(data.templates) || !Array.isArray(data.workouts) || !Array.isArray(data.mediaAssets)) return false;
    if (data.recurrences !== undefined && !Array.isArray(data.recurrences)) return false;
    if (data.settings !== undefined && (!data.settings || typeof data.settings !== 'object' || typeof data.settings.largeText !== 'boolean' || typeof data.settings.highContrast !== 'boolean' || (data.settings.onboardingDismissed !== undefined && typeof data.settings.onboardingDismissed !== 'boolean'))) return false;
    if (data.goal !== undefined && (!Number.isInteger(data.goal.weeklyTarget) || data.goal.weeklyTarget < 1 || data.goal.weeklyTarget > 14)) return false;
    const uniqueIds = (items) => items.every((item) => item && typeof item.id === 'string' && item.id.trim()) && new Set(items.map((item) => item.id)).size === items.length;
    if (![data.exercises, data.templates, data.workouts, data.mediaAssets, data.recurrences || []].every(uniqueIds)) return false;
    let mediaBytes = 0;
    for (const asset of data.mediaAssets) {
      if (!/^image\/(jpeg|png|webp)$/.test(asset.mimeType || '') || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(asset.dataUrl || '')) return false;
      if (asset.dataUrl.slice(5, asset.dataUrl.indexOf(';')) !== asset.mimeType) return false;
      const bytes = dataUrlBytes(asset.dataUrl); if (!bytes || bytes > MAX_IMAGE_BYTES) return false; mediaBytes += bytes;
    }
    if (mediaBytes > MAX_TOTAL_IMAGE_BYTES) return false;
    const assetIds = new Set(data.mediaAssets.map((asset) => asset.id));
    const validRef = (ref) => ref && (ref.type === 'builtin' ? !!BUILTIN_ART[ref.imageKey] : ref.type === 'custom' && assetIds.has(ref.assetId));
    // Fractional weights are accepted only for loading pre-change data; normalizeData rounds them before use.
    const validPrescription = (prescription) => prescription && typeof prescription === 'object' && Object.entries(prescription).every(([key, value]) => ['sets','reps','durationSec','distanceMeters','weightKg'].includes(key) && Number.isFinite(value) && value > 0 && (key === 'weightKg' || Number.isInteger(value)));
    const validItems = (items) => Array.isArray(items) && items.every((item) => item && typeof item.itemId === 'string' && item.itemId.trim() && typeof item.exerciseId === 'string' && item.exerciseId.trim() && typeof item.exerciseNameSnapshot === 'string' && item.exerciseNameSnapshot.trim() && Array.isArray(item.muscleGroupsSnapshot) && item.muscleGroupsSnapshot.length && item.muscleGroupsSnapshot.every((group) => typeof group === 'string' && group.trim()) && typeof item.descriptionSnapshot === 'string' && item.descriptionSnapshot.trim() && validRef(item.illustrationRef) && validPrescription(item.prescription) && typeof item.completed === 'boolean' && (item.order === undefined || (Number.isInteger(item.order) && item.order >= 0)) && (item.equipmentSnapshot === undefined || (Array.isArray(item.equipmentSnapshot) && item.equipmentSnapshot.every((entry) => typeof entry === 'string'))));
    const validDate = (value) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false; const date = parseLocalDate(value); return localDateString(date) === value; };
    if (!data.exercises.every((item) => typeof item.name === 'string' && item.name.trim() && Array.isArray(item.muscleGroups) && item.muscleGroups.length && item.muscleGroups.every((group) => typeof group === 'string' && group.trim()) && Array.isArray(item.equipment || []) && typeof item.description === 'string' && item.description.trim() && validRef(item.illustrationRef) && (item.prescriptionDefaults === undefined || validPrescription(item.prescriptionDefaults)))) return false;
    if (!data.templates.every((item) => typeof item.name === 'string' && item.name.trim() && typeof item.isArchived === 'boolean' && ['builtin', 'custom'].includes(item.source) && Array.isArray(item.items) && validItems(item.items) && new Set(item.items.map((entry) => entry.itemId)).size === item.items.length)) return false;
    if (!data.workouts.every((item) => validDate(item.date) && ['manual','template','copy','recurrence'].includes(item.source) && typeof item.skipped === 'boolean' && validItems(item.items) && new Set(item.items.map((exercise) => exercise.itemId)).size === item.items.length)) return false;
    if (!(data.recurrences || []).every((item) => Array.isArray(item.weekdays) && item.weekdays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) && validDate(item.startDate) && validDate(item.endDate) && item.endDate >= item.startDate && Array.isArray(item.workoutIds) && item.workoutIds.every((workoutId) => typeof workoutId === 'string' && workoutId.trim()) && Array.isArray(item.excludedDates || []) && (item.excludedDates || []).every(validDate))) return false;
    return true;
  }

  function normalizeData(data) {
    const normalized = structuredCloneSafe(data);
    normalized.settings ||= { highContrast: false, largeText: false, onboardingDismissed: false };
    normalized.goal ||= { weeklyTarget: 3 }; normalized.recurrences ||= []; normalized.uiState ||= { screen: 'plan' };
    const roundPrescription = (prescription) => {
      if (prescription && typeof prescription === 'object') Object.keys(prescription).forEach((key) => { if (Number.isFinite(prescription[key])) prescription[key] = Math.max(1, Math.round(prescription[key])); });
    };
    normalized.exercises.forEach((exercise) => roundPrescription(exercise.prescriptionDefaults));
    normalized.templates.forEach((template) => template.items.forEach((item) => roundPrescription(item.prescription)));
    normalized.workouts.forEach((workout) => workout.items.forEach((item) => roundPrescription(item.prescription)));
    return normalized;
  }

  function boot() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded = JSON.parse(raw);
        if (!validRoot(loaded)) throw new Error('Структура сохранённых данных не распознана.');
        appData = normalizeData(loaded);
        const normalized = JSON.stringify(appData);
        if (normalized !== raw) {
          try { localStorage.setItem(STORAGE_KEY, normalized); }
          catch (error) { storageWarning = error?.name === 'QuotaExceededError' ? 'Не удалось обновить старые дробные значения: в браузере закончилась квота.' : 'Не удалось сохранить обновлённые целые значения.'; }
        }
        appData.settings ||= { highContrast: false, largeText: false, onboardingDismissed: false };
        appData.goal ||= { weeklyTarget: 3 };
        appData.mediaAssets ||= [];
        appData.workouts ||= [];
        appData.recurrences ||= [];
        appData.uiState ||= { screen: 'plan' };
      } else {
        appData = initialData();
        saveData();
      }
      lastSavedData = JSON.stringify(appData);
      applyPreferences();
      updateStorageBadge();
      render();
    } catch (error) {
      storageWarning = error.message || 'Сохранённые данные повреждены или недоступны.';
      updateStorageBadge();
      app.innerHTML = `<section class="empty-state"><div><div class="empty-symbol">!</div><strong>Не удалось открыть сохранённые данные</strong><p>${escapeHtml(error.message || 'Данные в браузере повреждены или недоступны.')}</p><div class="welcome-actions"><button class="button button-quiet" type="button" data-action="download-raw">Скачать копию данных</button></div><label class="form-field">Для сброса введи фразу «Удалить все данные»<input class="field" id="reset-corrupt-text" autocomplete="off"></label><button class="button button-danger" type="button" data-action="reset-corrupt">Сбросить данные</button></div></section>`;
    }
  }

  function saveData() {
    try {
      const serialized = JSON.stringify(appData);
      localStorage.setItem(STORAGE_KEY, serialized);
      lastSavedData = serialized;
      storageWarning = '';
      updateStorageBadge();
      return true;
    } catch (error) {
      if (lastSavedData) {
        try { appData = JSON.parse(lastSavedData); } catch { /* retain current in-memory value if recovery fails */ }
      }
      storageWarning = error?.name === 'QuotaExceededError' ? 'В браузере закончилась квота для хранения. Удалите часть пользовательских изображений или резервную копию.' : 'Браузер не разрешил сохранить данные. Изменение отменено.';
      updateStorageBadge();
      return false;
    }
  }

  function mutate(successMessage) {
    if (saveData()) {
      applyPreferences();
      render();
      if (successMessage) toast(successMessage);
      return true;
    }
    render();
    toast(storageWarning, true);
    return false;
  }

  function applyPreferences() {
    document.body.classList.toggle('large-text', !!appData.settings.largeText);
    document.body.classList.toggle('high-contrast', !!appData.settings.highContrast);
  }

  function updateStorageBadge() {
    const text = document.getElementById('storage-status-text'), badge = document.getElementById('storage-status'), dot = badge?.querySelector('.status-dot');
    if (!text || !badge) return;
    text.textContent = storageWarning ? 'Ошибка сохранения' : 'Сохранено в браузере';
    badge.title = storageWarning || 'Изменения хранятся только в этом браузере.';
    badge.setAttribute('aria-label', storageWarning || 'Данные сохранены в браузере');
    badge.classList.toggle('has-error', !!storageWarning);
    dot?.classList.toggle('error-dot', !!storageWarning);
  }

  function exportData() {
    const date = localDateString(new Date());
    downloadFile(`home-fitness-planner-${date}.json`, JSON.stringify(appData, null, 2), 'application/json;charset=utf-8');
    toast('Резервная копия создана.');
  }

  async function handleBackupFile(input) {
    const status = document.getElementById('backup-status'), button = document.getElementById('import-apply');
    pendingBackup = null; if (button) button.disabled = true;
    const file = input.files?.[0]; if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.schemaVersion > 1) throw new Error('Файл создан более новой версией приложения. Обновите приложение перед импортом.');
      if (!validateData(parsed)) throw new Error('Структура резервной копии повреждена или не поддерживается.');
      pendingBackup = normalizeData(parsed);
      if (status) status.textContent = `Файл проверен: ${parsed.exercises.length} упражнений, ${parsed.templates.length} шаблонов, ${parsed.workouts.length} тренировок.`;
      if (button) button.disabled = false;
    } catch (error) { if (status) status.textContent = error.message || 'Не удалось прочитать JSON-файл.'; }
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
  }

  function prepareIdMap(incoming, current, prefix) {
    const map = new Map(), skipped = new Set(), used = new Set([...current.map((item) => item.id), ...incoming.map((item) => item.id)]);
    incoming.forEach((record) => {
      const existing = current.find((item) => item.id === record.id);
      if (!existing) { map.set(record.id, record.id); return; }
      if (stableStringify(existing) === stableStringify(record)) { map.set(record.id, record.id); skipped.add(record.id); return; }
      let replacement; do { replacement = id(prefix); } while (used.has(replacement));
      used.add(replacement); map.set(record.id, replacement);
    });
    return { map, skipped };
  }

  function remapRef(ref, assetMap) {
    if (ref?.type === 'custom') ref.assetId = assetMap.get(ref.assetId) || ref.assetId;
  }

  function mergeBackup(incoming) {
    const source = normalizeData(incoming), current = appData;
    const maps = {
      mediaAssets: prepareIdMap(source.mediaAssets, current.mediaAssets, 'asset'),
      exercises: prepareIdMap(source.exercises, current.exercises, 'exercise'),
      templates: prepareIdMap(source.templates, current.templates, 'template'),
      workouts: prepareIdMap(source.workouts, current.workouts, 'workout'),
      recurrences: prepareIdMap(source.recurrences, current.recurrences, 'recurrence')
    };
    let imported = 0, skipped = 0;
    const append = (key, transform = (item) => item) => source[key].forEach((record) => {
      if (maps[key].skipped.has(record.id)) { skipped++; return; }
      const copy = structuredCloneSafe(record); copy.id = maps[key].map.get(record.id); transform(copy); current[key].push(copy); imported++;
    });
    append('mediaAssets');
    append('exercises', (record) => { remapRef(record.illustrationRef, maps.mediaAssets.map); });
    append('templates', (record) => { record.items.forEach((item) => { item.exerciseId = maps.exercises.map.get(item.exerciseId) || item.exerciseId; remapRef(item.illustrationRef, maps.mediaAssets.map); }); });
    append('workouts', (record) => {
      if (record.templateId) record.templateId = maps.templates.map.get(record.templateId) || record.templateId;
      if (record.seriesId) record.seriesId = maps.recurrences.map.get(record.seriesId) || record.seriesId;
      record.items.forEach((item) => { item.exerciseId = maps.exercises.map.get(item.exerciseId) || item.exerciseId; remapRef(item.illustrationRef, maps.mediaAssets.map); });
    });
    append('recurrences', (record) => {
      if (record.templateId) record.templateId = maps.templates.map.get(record.templateId) || record.templateId;
      record.workoutIds = record.workoutIds.map((workoutId) => maps.workouts.map.get(workoutId) || workoutId);
    });
    current.settings = structuredCloneSafe(source.settings); current.goal = structuredCloneSafe(source.goal);
    collectUnusedMedia();
    return { imported, skipped };
  }

  function applyImport() {
    if (!pendingBackup) { toast('Сначала выбери и проверь JSON-файл.', true); return; }
    const mode = document.getElementById('import-mode')?.value || 'replace';
    const apply = () => {
      if (mode === 'replace') appData = normalizeData(pendingBackup);
      else mergeBackup(pendingBackup);
      collectUnusedMedia(); screen = 'plan';
      if (mutate(mode === 'replace' ? 'Резервная копия восстановлена' : 'Данные объединены')) pendingBackup = null;
    };
    if (mode === 'replace') confirmAction('Заменить все данные?', 'Текущие упражнения, настройки, расписание и история будут заменены содержимым резервной копии.', 'Заменить', apply);
    else {
      const result = mergeBackup(pendingBackup); collectUnusedMedia(); screen = 'plan';
      if (mutate(`Импортировано: ${result.imported}, совпадений пропущено: ${result.skipped}`)) pendingBackup = null;
    }
  }

  function resetAllData() {
    try {
      const fresh = initialData(), serialized = JSON.stringify(fresh);
      localStorage.setItem(STORAGE_KEY, serialized);
      appData = fresh; lastSavedData = serialized; pendingBackup = null; storageWarning = ''; screen = 'plan';
      applyPreferences(); updateStorageBadge(); render(); toast('Все локальные данные сброшены.');
    } catch (error) {
      storageWarning = error?.name === 'QuotaExceededError' ? 'Не удалось восстановить стартовые данные: в браузере закончилась квота.' : 'Не удалось сохранить стартовые данные в браузере.';
      updateStorageBadge(); toast(storageWarning, true);
    }
  }

  function requestFullReset(inputId) {
    const phrase = document.getElementById(inputId)?.value || '';
    if (phrase.trim() !== 'Удалить все данные') { toast('Для сброса введи фразу «Удалить все данные».', true); return; }
    confirmAction('Удалить все данные?', 'Тренировки, упражнения, шаблоны, настройки и изображения будут удалены из этого браузера. Стартовый каталог загрузится заново.', 'Удалить все данные', resetAllData);
  }

  function toast(message, isError = false) {
    clearTimeout(toastTimer);
    toastElement.textContent = message;
    toastElement.classList.toggle('error', isError);
    toastElement.classList.add('visible');
    toastTimer = setTimeout(() => toastElement.classList.remove('visible'), 2600);
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function formatPrescription(prescription = {}) {
    const parts = [];
    if (prescription.sets) parts.push(`${prescription.sets} ${prescription.sets === 1 ? 'подход' : 'подхода'}`);
    if (prescription.reps) parts.push(`${prescription.reps} повт.`);
    if (prescription.durationSec) parts.push(`${formatDuration(prescription.durationSec)}`);
    if (prescription.distanceMeters) parts.push(`${prescription.distanceMeters} м`);
    if (prescription.weightKg) parts.push(`${prescription.weightKg} кг`);
    return parts.join(' × ');
  }

  function formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min ? (sec ? `${min} мин ${sec} сек` : `${min} мин`) : `${sec} сек`;
  }

  function illustration(ref, alt = 'Иллюстрация упражнения') {
    let markup = '';
    if (ref?.type === 'custom') {
      const asset = appData.mediaAssets.find((entry) => entry.id === ref.assetId);
      if (asset?.dataUrl) markup = `<img src="${asset.dataUrl}" alt="${escapeHtml(alt)}">`;
    } else if (ref?.type === 'builtin') {
      markup = BUILTIN_ART[ref.imageKey] || BUILTIN_ART.squat;
      markup = markup.replace(/aria-label="[^"]*"/, `aria-label="${escapeHtml(alt)}"`);
    }
    return markup ? `<div class="exercise-art">${markup}</div>` : '<div class="exercise-art" role="img" aria-label="Иллюстрация недоступна"></div>';
  }

  function activeExerciseList() {
    return appData.exercises.filter((exercise) => !!exercise.isArchived === showArchivedExercises);
  }

  function visibleExercises() {
    const query = search.trim().toLocaleLowerCase('ru');
    return activeExerciseList().filter((exercise) => {
      const matchesQuery = !query || [exercise.name, exercise.description, ...exercise.muscleGroups, ...exercise.equipment].join(' ').toLocaleLowerCase('ru').includes(query);
      return matchesQuery && (!groupFilter || exercise.muscleGroups.includes(groupFilter)) && (!equipmentFilter || exercise.equipment.includes(equipmentFilter)) && (!favoritesOnly || exercise.isFavorite);
    });
  }

  function exerciseCard(exercise) {
    const alt = `${exercise.name}; тренируются: ${exercise.muscleGroups.join(', ')}`;
    const prescription = formatPrescription(exercise.prescriptionDefaults);
    return `<article class="exercise-card ${exercise.isArchived ? 'archived-card' : ''}">
      <div class="exercise-card-inner">${illustration(exercise.illustrationRef, alt)}
        <div class="exercise-info"><div class="exercise-title-row"><div><h2 class="exercise-title">${escapeHtml(exercise.name)}</h2><p class="muscle-line">${escapeHtml(exercise.muscleGroups.join(' · '))}</p></div><button class="favorite-button" type="button" aria-label="${exercise.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}: ${escapeHtml(exercise.name)}" aria-pressed="${!!exercise.isFavorite}" data-action="favorite" data-id="${exercise.id}">${exercise.isFavorite ? '★' : '☆'}</button></div>
          <p class="description">${escapeHtml(exercise.description)}</p><div class="tags">${exercise.equipment.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div>${prescription ? `<div class="prescription">План: ${escapeHtml(prescription)}</div>` : ''}
        </div>
      </div><div class="card-actions">${exercise.isArchived ? `<button class="button button-small" type="button" data-action="restore-exercise" data-id="${exercise.id}">Восстановить</button>` : `<button class="button button-small" type="button" data-action="add-to-template" data-id="${exercise.id}">В шаблон</button>`}${exercise.source === 'custom' && !exercise.isArchived ? `<button class="button button-small button-quiet" type="button" data-action="edit-exercise" data-id="${exercise.id}">Изменить</button>` : ''}${!exercise.isArchived ? `<button class="button button-small button-quiet" type="button" data-action="duplicate-exercise" data-id="${exercise.id}">Копировать</button><button class="button button-small button-quiet" type="button" data-action="archive-exercise" data-id="${exercise.id}">В архив</button>` : ''}</div>
    </article>`;
  }

  function renderExercises() {
    const exercises = visibleExercises();
    const hasWelcome = !appData.settings.onboardingDismissed;
    app.innerHTML = `${hasWelcome ? `<section class="welcome"><div><p class="eyebrow">Начнём с основы</p><h2>Тренируйся дома — по своему плану</h2><p>Выбирай упражнения с иллюстрациями и описаниями, собирай из них собственные шаблоны. Все изменения останутся в этом браузере.</p></div><div class="welcome-actions"><button class="button button-primary" type="button" data-action="dismiss-welcome">Перейти к упражнениям</button><button class="button button-quiet" type="button" data-screen="templates">Готовые шаблоны</button></div></section>` : ''}
      <div class="page-heading"><div><p class="eyebrow">Библиотека движений</p><h1>Упражнения</h1><p class="subheading">Иллюстрации и описания помогают разобраться в технике и целевых мышцах.</p></div><button class="button button-primary" type="button" data-action="new-exercise">＋ Своё упражнение</button></div>
      ${storageWarning ? `<p class="notice error">${escapeHtml(storageWarning)}</p>` : ''}
      <div class="toolbar"><label class="search-wrap"><span aria-hidden="true">⌕</span><input class="field" id="search-exercises" type="search" placeholder="Найти упражнение или группу мышц" value="${escapeHtml(search)}" aria-label="Поиск упражнений"></label>
        <select class="select-field" id="filter-group" aria-label="Фильтр по группе мышц"><option value="">Все группы мышц</option>${MUSCLE_GROUPS.map((item) => `<option ${groupFilter === item ? 'selected' : ''} value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}</select>
        <select class="select-field" id="filter-equipment" aria-label="Фильтр по инвентарю"><option value="">Любой инвентарь</option>${EQUIPMENT.map((item) => `<option ${equipmentFilter === item ? 'selected' : ''} value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}</select>
        <button class="button ${favoritesOnly ? 'button-primary' : 'button-quiet'}" type="button" data-action="toggle-favorites" aria-pressed="${favoritesOnly}">☆ Избранное</button>
      </div>
      <div class="section-label"><h2>${showArchivedExercises ? 'Архив упражнений' : 'Каталог'}</h2><span class="count">${exercises.length} ${plural(exercises.length, 'упражнение', 'упражнения', 'упражнений')}</span></div>
      ${exercises.length ? `<div class="exercise-grid">${exercises.map(exerciseCard).join('')}</div>` : `<section class="empty-state"><div><div class="empty-symbol">⌕</div><strong>${showArchivedExercises ? 'В архиве пока пусто' : 'Ничего не найдено'}</strong><p>${showArchivedExercises ? 'Архивированные упражнения можно восстановить.' : 'Измени запрос или фильтры, либо добавь своё упражнение.'}</p>${showArchivedExercises ? '' : '<button class="button button-primary" type="button" data-action="new-exercise">＋ Своё упражнение</button>'}</div></section>`}
      <div class="section-label"><span class="count">${showArchivedExercises ? '←' : ''}</span><button type="button" class="button button-small button-quiet" data-action="toggle-archived">${showArchivedExercises ? 'Показать каталог' : 'Показать архив'}</button></div>`;
  }

  function templateCard(template) {
    const names = template.items.slice(0, 4).map((item) => `<li class="template-item"><span class="mini-art">${miniIllustration(item.illustrationRef, item.exerciseNameSnapshot)}</span><span>${escapeHtml(item.exerciseNameSnapshot)}${formatPrescription(item.prescription) ? ` <small class="count">· ${escapeHtml(formatPrescription(item.prescription))}</small>` : ''}</span></li>`).join('');
    const remaining = template.items.length > 4 ? `<li class="count">+ ещё ${template.items.length - 4}</li>` : '';
    return `<article class="template-card ${template.isArchived ? 'archived-card' : ''}"><div class="template-top"><div><p class="eyebrow">${template.source === 'builtin' ? 'Стартовый шаблон' : 'Мой шаблон'}</p><h2>${escapeHtml(template.name)}</h2></div><span class="tag">${template.items.length} ${plural(template.items.length, 'упражнение', 'упражнения', 'упражнений')}</span></div>
      <ul class="template-list">${names}${remaining}</ul><div class="template-actions">${template.isArchived ? `<button class="button button-small" type="button" data-action="restore-template" data-id="${template.id}">Восстановить</button>` : `<button class="button button-small button-primary" type="button" data-action="apply-template" data-id="${template.id}">Применить</button><button class="button button-small button-quiet" type="button" data-action="duplicate-template" data-id="${template.id}">Копировать</button>${template.source === 'custom' ? `<button class="button button-small button-quiet" type="button" data-action="edit-template" data-id="${template.id}">Изменить</button>` : ''}<button class="button button-small button-quiet" type="button" data-action="archive-template" data-id="${template.id}">В архив</button>`}<button class="button button-small button-quiet" type="button" data-action="delete-template" data-id="${template.id}">Удалить</button></div></article>`;
  }

  function miniIllustration(ref, alt) {
    if (ref?.type === 'custom') {
      const asset = appData.mediaAssets.find((entry) => entry.id === ref.assetId);
      if (asset?.dataUrl) return `<img src="${asset.dataUrl}" alt="" class="mini-art">`;
    }
    const art = BUILTIN_ART[ref?.imageKey] || BUILTIN_ART.squat;
    return art.replace('<svg ', '<svg ').replace(/aria-label="[^"]*"/, `aria-label="${escapeHtml(alt)}"`);
  }

  function renderTemplates() {
    const templates = appData.templates.filter((template) => !!template.isArchived === showArchivedTemplates);
    const activeExercises = appData.exercises.filter((exercise) => !exercise.isArchived);
    app.innerHTML = `<div class="page-heading"><div><p class="eyebrow">Готовый старт или своя программа</p><h1>Шаблоны</h1><p class="subheading">Собери упражнения в шаблон или запланируй тренировку из готового набора.</p></div><button class="button button-primary" type="button" data-action="new-template" ${activeExercises.length ? '' : 'disabled'}>＋ Новый шаблон</button></div>
      ${templates.length ? `<div class="template-grid">${templates.map(templateCard).join('')}</div>` : `<section class="empty-state"><div><div class="empty-symbol">▤</div><strong>${showArchivedTemplates ? 'Архив шаблонов пуст' : 'Шаблонов пока нет'}</strong><p>${showArchivedTemplates ? 'Архивированные шаблоны можно восстановить.' : 'Создай шаблон из упражнений каталога.'}</p></div></section>`}
      <div class="section-label"><span class="count">${activeExercises.length} доступно в каталоге</span><button type="button" class="button button-small button-quiet" data-action="toggle-archived-templates">${showArchivedTemplates ? 'Показать шаблоны' : 'Показать архив'}</button></div>`;
  }

  function miniForItem(item) { return miniIllustration(item.illustrationRef, item.exerciseNameSnapshot); }

  function parseLocalDate(value) { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); }
  function shiftDate(value, days) { const date = parseLocalDate(value); date.setDate(date.getDate() + days); return localDateString(date); }
  function mondayOf(value) { const date = parseLocalDate(value); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); return localDateString(date); }
  function statusOf(workout) {
    if (workout.skipped) return 'Пропущена';
    const total = workout.items.length, done = workout.items.filter((item) => item.completed).length;
    if (total && done === total) return 'Выполнена';
    if (workout.date < localDateString(new Date())) return 'Не завершена';
    if (done) return 'В процессе';
    return 'Запланирована';
  }
  function canEditWorkout(workout) {
    const today = localDateString(new Date());
    return workout.date > today || workout.date === today || (!['Выполнена'].includes(statusOf(workout)) && workout.date < today);
  }
  function formatDate(value, options = { day: 'numeric', month: 'long', weekday: 'long' }) { return new Intl.DateTimeFormat('ru-RU', options).format(parseLocalDate(value)); }
  function workoutSummary(workout) { return `${workout.items.length} ${plural(workout.items.length, 'упражнение', 'упражнения', 'упражнений')}`; }
  function calendarWorkoutMarks(date) { return appData.workouts.filter((workout) => workout.date === date); }
  function statusSymbol(status) { return ({ 'Выполнена': '✓', 'В процессе': '◐', 'Пропущена': '×', 'Не завершена': '!', 'Запланирована': '·' })[status] || '·'; }

  function renderPlan() {
    const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const first = calendarMode === 'week' ? mondayOf(calendarDate) : (() => { const d = parseLocalDate(calendarDate); return localDateString(new Date(d.getFullYear(), d.getMonth(), 1)); })();
    const gridStart = calendarMode === 'week' ? first : mondayOf(first);
    const count = calendarMode === 'week' ? 7 : (() => { const d = parseLocalDate(first); const last = localDateString(new Date(d.getFullYear(), d.getMonth() + 1, 0)); return Math.ceil((parseLocalDate(last).getDate() + ((parseLocalDate(first).getDay() + 6) % 7)) / 7) * 7; })();
    const selectedWorkouts = calendarWorkoutMarks(selectedDate);
    const cells = Array.from({ length: count }, (_, i) => {
      const date = shiftDate(gridStart, i), d = parseLocalDate(date), inMonth = calendarMode === 'week' || d.getMonth() === parseLocalDate(first).getMonth();
      const marks = calendarWorkoutMarks(date);
      return `<button type="button" class="calendar-day ${date === selectedDate ? 'selected' : ''} ${date === localDateString(new Date()) ? 'today' : ''} ${inMonth ? '' : 'outside-month'}" data-action="select-date" data-date="${date}" aria-label="${formatDate(date)}${marks.length ? `, ${marks.map((w) => statusOf(w)).join(', ')}` : ''}"><span>${d.getDate()}</span>${marks.length ? `<span class="calendar-dots">${marks.slice(0, 3).map((w) => `<i title="${statusOf(w)}" class="calendar-mark status-${statusKey(statusOf(w))}" aria-hidden="true">${statusSymbol(statusOf(w))}</i>`).join('')}${marks.length > 3 ? `<b>+${marks.length - 3}</b>` : ''}</span>` : ''}</button>`;
    }).join('');
    const heading = calendarMode === 'week' ? `${formatDate(first, { day: 'numeric', month: 'long' })} — ${formatDate(shiftDate(first, 6), { day: 'numeric', month: 'long', year: 'numeric' })}` : new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(parseLocalDate(first));
    app.innerHTML = `${!appData.settings.onboardingDismissed ? `<section class="welcome"><div><p class="eyebrow">Добро пожаловать</p><h2>Планируй тренировки дома</h2><p>Собирай занятия из упражнений, отмечай выполнение и смотри прогресс. Данные сохраняются только в этом браузере.</p></div><div class="welcome-actions"><button class="button button-primary" type="button" data-screen="exercises">Каталог упражнений</button><button class="button button-quiet" type="button" data-screen="templates">Шаблоны</button><button class="button button-quiet" type="button" data-action="dismiss-welcome">Понятно</button></div></section>` : ''}<div class="page-heading"><div><p class="eyebrow">План тренировок</p><h1>Календарь</h1><p class="subheading">Выбери день, чтобы просмотреть и провести тренировку.</p></div><div class="calendar-create"><button class="button button-primary" type="button" data-action="new-workout">＋ Тренировка</button><button class="button button-quiet" type="button" data-action="open-generator">Повторить по дням</button></div></div>
      <section class="calendar-panel"><div class="calendar-toolbar"><div class="calendar-controls"><button class="button button-icon button-quiet" type="button" data-action="calendar-prev" aria-label="Предыдущий период">‹</button><button class="button button-small button-quiet" type="button" data-action="calendar-today">Сегодня</button><button class="button button-icon button-quiet" type="button" data-action="calendar-next" aria-label="Следующий период">›</button><h2>${escapeHtml(heading)}</h2></div><div class="mode-switch"><button class="button button-small ${calendarMode === 'week' ? 'button-primary' : 'button-quiet'}" type="button" data-action="calendar-week">Неделя</button><button class="button button-small ${calendarMode === 'month' ? 'button-primary' : 'button-quiet'}" type="button" data-action="calendar-month">Месяц</button></div></div><div class="calendar-grid">${names.map((name) => `<span class="calendar-weekday">${name}</span>`).join('')}${cells}</div><div class="calendar-legend"><span>✓ Выполнена</span><span>◐ В процессе</span><span>× Пропущена</span><span>! Не завершена</span><span>· Запланирована</span></div></section>
      <section class="day-panel"><div class="section-label"><div><p class="eyebrow">Выбранный день</p><h2>${escapeHtml(formatDate(selectedDate))}</h2></div><span class="count">${selectedWorkouts.length} ${plural(selectedWorkouts.length, 'тренировка', 'тренировки', 'тренировок')}</span></div>
      ${selectedWorkouts.length ? `<div class="day-workouts">${selectedWorkouts.map(workoutCard).join('')}</div>` : `<div class="empty-state compact-empty">На этот день тренировок нет.</div>`}</section>`;
  }

  function periodRange(mode, anchor) {
    if (mode === 'day') return { start: anchor, end: anchor };
    if (mode === 'week') { const start = mondayOf(anchor); return { start, end: shiftDate(start, 6) }; }
    const date = parseLocalDate(anchor), start = localDateString(new Date(date.getFullYear(), date.getMonth(), 1));
    return { start, end: localDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0)) };
  }

  function progressStats(mode, anchor) {
    const range = periodRange(mode, anchor);
    const workouts = appData.workouts.filter((workout) => workout.date >= range.start && workout.date <= range.end);
    const counts = { 'Выполнена': 0, 'Пропущена': 0, 'В процессе': 0, 'Запланирована': 0, 'Не завершена': 0 };
    let exercisesDone = 0, exercisesTotal = 0;
    workouts.forEach((workout) => { counts[statusOf(workout)]++; exercisesDone += workout.items.filter((item) => item.completed).length; exercisesTotal += workout.items.length; });
    const denominator = counts['Выполнена'] + counts['Пропущена'] + counts['Не завершена'];
    return { ...range, workouts, counts, exercisesDone, exercisesTotal, completionRate: denominator ? Math.round(counts['Выполнена'] / denominator * 100) : null };
  }

  function chartPoints(stats, mode) {
    if (!stats.workouts.length) return [];
    const groups = new Map();
    stats.workouts.forEach((workout) => {
      const key = mode === 'month' ? mondayOf(workout.date) : workout.date;
      if (!groups.has(key)) groups.set(key, { key, date: workout.date, total: 0, completed: 0 });
      const point = groups.get(key); if (workout.date < point.date) point.date = workout.date; point.total++; if (statusOf(workout) === 'Выполнена') point.completed++;
    });
    return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
  }

  function goalStreaks() {
    const goal = appData.goal.weeklyTarget;
    const weeklyCounts = new Map();
    appData.workouts.forEach((workout) => { if (statusOf(workout) === 'Выполнена') { const week = mondayOf(workout.date); weeklyCounts.set(week, (weeklyCounts.get(week) || 0) + 1); } });
    const currentWeek = mondayOf(localDateString(new Date()));
    const thisWeekCount = weeklyCounts.get(currentWeek) || 0;
    let cursor = thisWeekCount >= goal ? currentWeek : shiftDate(currentWeek, -7), current = 0;
    while ((weeklyCounts.get(cursor) || 0) >= goal) { current++; cursor = shiftDate(cursor, -7); }
    const workoutDates = appData.workouts.map((workout) => workout.date).sort();
    if (!workoutDates.length) return { current, best: 0, thisWeekCount };
    let best = 0, run = 0;
    for (let week = mondayOf(workoutDates[0]); week <= currentWeek; week = shiftDate(week, 7)) {
      if ((weeklyCounts.get(week) || 0) >= goal) { run++; best = Math.max(best, run); } else run = 0;
    }
    return { current, best, thisWeekCount };
  }

  function progressChart(points, mode) {
    if (!points.length) return '<div class="empty-state compact-empty">За этот период пока нет тренировок для графика.</div>';
    const max = Math.max(1, ...points.map((point) => point.completed));
    return `<div class="progress-chart" role="group" aria-label="Выполненные тренировки по ${mode === 'month' ? 'неделям' : 'дням'}">${points.map((point) => {
      const dateLabel = mode === 'month' ? `Неделя с ${formatDate(point.key, { day: 'numeric', month: 'short' })}` : formatDate(point.date, { day: 'numeric', month: 'short' });
      const height = point.completed ? Math.max(10, Math.round(point.completed / max * 132)) : 0;
      return `<button class="chart-point" type="button" data-action="progress-date" data-date="${point.date}" aria-label="${dateLabel}: выполнено тренировок ${point.completed} из ${point.total}"><span class="chart-value">${point.completed}</span><span class="chart-bar" style="height:${height}px"></span><span class="chart-label">${escapeHtml(dateLabel)}</span></button>`;
    }).join('')}</div>`;
  }

  function historyCard(workout) {
    const status = statusOf(workout), completed = workout.items.filter((item) => item.completed).length;
    const created = workout.createdAt ? new Date(workout.createdAt) : null;
    const time = created && !Number.isNaN(created.getTime()) ? new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(created) : '';
    return `<article class="history-card"><button type="button" class="history-open" data-action="progress-workout" data-id="${workout.id}"><span class="history-date">${escapeHtml(formatDate(workout.date, { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' }))}${time ? ` · ${time}` : ''}</span><strong>${escapeHtml(workout.title || workout.templateNameSnapshot || 'Тренировка')}</strong><span class="status-label status-${statusKey(status)}">${status}</span><small>${completed}/${workout.items.length} упражнений</small></button></article>`;
  }

  function renderProgress() {
    const stats = progressStats(progressMode, progressDate), points = chartPoints(stats, progressMode), streaks = goalStreaks();
    const periodLabel = progressMode === 'day' ? formatDate(progressDate) : progressMode === 'week' ? `${formatDate(stats.start, { day: 'numeric', month: 'short' })} — ${formatDate(stats.end, { day: 'numeric', month: 'short', year: 'numeric' })}` : new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(parseLocalDate(stats.start));
    const sortedHistory = [...appData.workouts].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
    app.innerHTML = `<div class="page-heading"><div><p class="eyebrow">Регулярность и результаты</p><h1>Прогресс</h1><p class="subheading">Итоги тренировок и выполненных упражнений.</p></div></div>
      <section class="progress-period"><div class="calendar-controls"><button class="button button-icon button-quiet" type="button" data-action="progress-prev" aria-label="Предыдущий период">‹</button><button class="button button-small button-quiet" type="button" data-action="progress-today">Сегодня</button><button class="button button-icon button-quiet" type="button" data-action="progress-next" aria-label="Следующий период">›</button><h2>${escapeHtml(periodLabel)}</h2></div><div class="mode-switch">${[['day','День'],['week','Неделя'],['month','Месяц']].map(([mode,label])=>`<button class="button button-small ${progressMode===mode?'button-primary':'button-quiet'}" type="button" data-action="progress-mode" data-mode="${mode}">${label}</button>`).join('')}</div></section>
      <section class="stats-grid">${[['Выполнено',stats.counts['Выполнена']],['Пропущено',stats.counts['Пропущена']],['В процессе',stats.counts['В процессе']],['Запланировано',stats.counts['Запланирована']],['Не завершено',stats.counts['Не завершена']]].map(([label,value])=>`<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`).join('')}</section>
      <section class="progress-summary"><article class="stat-card stat-wide"><span>Выполненные упражнения</span><strong>${stats.exercisesDone} / ${stats.exercisesTotal}</strong></article><article class="stat-card stat-wide"><span>Доля выполнения тренировок</span><strong>${stats.completionRate === null ? '—' : `${stats.completionRate}%`}</strong><small>Выполненные ÷ (выполненные + пропущенные + не завершённые)</small></article></section>
      <section class="goal-panel"><div><p class="eyebrow">Цель текущей недели</p><h2>${streaks.thisWeekCount} из ${appData.goal.weeklyTarget} выполнено</h2><p>Текущая серия: ${streaks.current} ${plural(streaks.current,'неделя','недели','недель')} · рекорд: ${streaks.best} ${plural(streaks.best,'неделя','недели','недель')}</p></div><button class="button button-small button-quiet" type="button" data-screen="settings">Настроить цель</button><p class="help-text goal-note">Регулярность рассчитана по текущей цели для всех недель.</p></section>
      <section class="chart-panel"><div class="section-label"><div><p class="eyebrow">Динамика</p><h2>Выполненные тренировки</h2></div><span class="count">${progressMode === 'month' ? 'По неделям' : 'По дням'}</span></div>${progressChart(points,progressMode)}</section>
      <section class="history-panel"><div class="section-label"><div><p class="eyebrow">Все занятия</p><h2>История</h2></div><span class="count">${sortedHistory.length}</span></div>${sortedHistory.length ? `<div class="history-list">${sortedHistory.map(historyCard).join('')}</div>` : '<div class="empty-state compact-empty">История появится после добавления тренировок.</div>'}</section>`;
  }

  function statusKey(status) { return ({ 'Выполнена': 'done', 'В процессе': 'progress', 'Пропущена': 'skipped', 'Не завершена': 'incomplete', 'Запланирована': 'planned' })[status] || 'planned'; }
  function workoutCard(workout) {
    const status = statusOf(workout), done = workout.items.filter((item) => item.completed).length;
    return `<article class="workout-card"><div class="workout-card-head"><div><h3>${escapeHtml(workout.title || (workout.source === 'template' ? workout.templateNameSnapshot : 'Тренировка'))}</h3><span class="status-label status-${statusKey(status)}">${status}</span><span class="count">${done}/${workout.items.length} упражнений</span></div><button class="button button-small button-quiet" type="button" data-action="open-workout" data-id="${workout.id}">Открыть</button></div><div class="workout-actions">${status !== 'Пропущена' && status !== 'Выполнена' ? `<button class="button button-small button-quiet" type="button" data-action="skip-workout" data-id="${workout.id}">Пропустить</button>` : ''}${status === 'Пропущена' ? `<button class="button button-small button-quiet" type="button" data-action="unskip-workout" data-id="${workout.id}">Вернуть в работу</button>` : ''}<button class="button button-small button-quiet" type="button" data-action="copy-workout" data-id="${workout.id}">Копировать</button>${canEditWorkout(workout) ? `<button class="button button-small button-quiet" type="button" data-action="edit-workout" data-id="${workout.id}">Изменить</button>` : ''}<button class="button button-small button-quiet" type="button" data-action="delete-workout" data-id="${workout.id}">Удалить</button></div></article>`;
  }

  function workoutForm(workout = null, duplicate = false, readOnly = false) {
    const editing = !!workout && !duplicate;
    const editAllowed = editing && canEditWorkout(workout) && workout.date >= localDateString(new Date());
    const selected = new Set(workout?.items.map((item) => item.exerciseId) || []);
    const exerciseChoices = appData.exercises.filter((exercise) => !exercise.isArchived || selected.has(exercise.id));
    const dateValue = duplicate ? selectedDate : (workout?.date || selectedDate);
    workoutDialog.dataset.workoutId = editing ? workout.id : '';
    workoutDialog.dataset.readOnly = String(readOnly);
    workoutDialog.dataset.allowComposition = String(editAllowed);
    const rows = (workout?.items || []).map((item, index) => sessionExerciseRow(item, index, workout, readOnly, editAllowed)).join('');
    const picker = (!editing || editAllowed) && !readOnly ? `<div class="form-field"><span class="field-label">Упражнения *</span><div class="check-grid">${exerciseChoices.map((e) => `<label class="check-chip"><input type="checkbox" name="workoutExercise" value="${e.id}" ${selected.has(e.id) ? 'checked' : ''}>${escapeHtml(e.name)}${e.isArchived ? ' · архив' : ''}</label>`).join('')}</div></div>` : '';
    const controls = readOnly ? `<div class="form-actions"><button class="button button-quiet" type="button" data-action="close-workout-dialog">Закрыть</button><button class="button button-quiet" type="button" data-action="copy-workout" data-id="${workout.id}">Копировать</button></div>` : editAllowed || !editing ? `<div class="form-actions"><button class="button button-quiet" type="button" data-action="close-workout-dialog">Отмена</button><button class="button button-primary" type="submit">Сохранить</button></div>` : `<div class="form-actions"><button class="button button-quiet" type="button" data-action="close-workout-dialog">Закрыть</button></div>`;
    workoutDialog.innerHTML = `<form id="workout-form" class="dialog-content"><div class="dialog-head"><div><p class="eyebrow">${editing ? 'Тренировка' : duplicate ? 'Копирование' : 'Новое занятие'}</p><h2>${escapeHtml(workout?.title || (workout?.source === 'template' ? workout.templateNameSnapshot : 'Тренировка'))}</h2>${editing ? `<span class="status-label status-${statusKey(statusOf(workout))}">${statusOf(workout)}</span>` : ''}</div><button class="button button-icon button-quiet dialog-close" type="button" data-action="close-workout-dialog" aria-label="Закрыть окно">×</button></div>
      ${!readOnly ? '<p id="workout-unsaved-notice" class="notice workout-unsaved-notice" role="status" aria-live="polite" hidden>Есть несохранённые изменения. Нажмите «Сохранить», чтобы применить их.</p>' : ''}
      <label class="form-field">Дата тренировки<input class="field" type="date" name="date" required value="${dateValue}" ${editing && workout.date <= localDateString(new Date()) ? 'disabled' : ''} ${editing && workout.date > localDateString(new Date()) ? `min="${localDateString(new Date())}"` : ''}></label>
      ${picker}
      ${editing || readOnly ? `<div class="session-exercises">${rows || '<p class="help-text">В этой тренировке пока нет упражнений.</p>'}</div>` : ''}
      ${controls}</form>`;
    workoutDialog.dataset.dirty = 'false';
    workoutDialog.showModal();
  }

  function copyWorkoutForm(workout) {
    workoutDialog.dataset.workoutId = '';
    workoutDialog.dataset.copyFrom = workout.id;
    workoutDialog.dataset.dirty = 'false';
    workoutDialog.innerHTML = `<form id="copy-workout-form" class="dialog-content"><div class="dialog-head"><div><p class="eyebrow">Копирование</p><h2>${escapeHtml(workout.title || workout.templateNameSnapshot || 'Тренировка')}</h2><p>${workout.items.length} упражнений будут скопированы с текущими отметками сброшенными.</p></div><button class="button button-icon button-quiet" type="button" data-action="close-workout-dialog" aria-label="Закрыть окно">×</button></div><label class="form-field">Дата новой тренировки<input class="field" name="date" type="date" required value="${shiftDate(workout.date, 1)}"></label><div class="form-actions"><button class="button button-quiet" type="button" data-action="close-workout-dialog">Отмена</button><button class="button button-primary" type="submit">Создать копию</button></div></form>`;
    if (!workoutDialog.open) workoutDialog.showModal();
  }

  function submitCopyWorkout(event) {
    if (event.target.id !== 'copy-workout-form') return;
    event.preventDefault(); const source = appData.workouts.find((item) => item.id === workoutDialog.dataset.copyFrom), date = event.target.elements.date.value;
    if (!source || !date) { toast('Укажи дату копии.', true); return; }
    const copy = structuredCloneSafe(source); copy.id = id('workout'); copy.date = date; copy.source = 'copy'; copy.seriesId = null; copy.skipped = false; copy.items.forEach((item, index) => { item.itemId = id('item'); item.completed = false; item.order = index; }); copy.createdAt = new Date().toISOString(); copy.updatedAt = copy.createdAt;
    selectedDate = calendarDate = date; screen = 'plan'; if (mutate('Копия тренировки создана')) workoutDialog.close();
  }

  function sessionExerciseRow(item, index, workout, readOnly, editAllowed) {
    const status = readOnly ? `<span class="status-label status-${item.completed ? 'done' : 'planned'}">${item.completed ? 'Выполнено' : 'Не отмечено'}</span>` : `<label class="exercise-check"><input type="checkbox" data-action="toggle-item" data-id="${item.itemId}" ${item.completed ? 'checked' : ''}><span>Выполнено</span></label>${editAllowed ? `<div class="template-reorder"><button class="button button-small button-icon button-quiet" type="button" data-action="move-workout-item" data-id="${item.itemId}" data-direction="up" aria-label="Переместить ${escapeHtml(item.exerciseNameSnapshot)} выше" ${index === 0 ? 'disabled' : ''}>↑</button><button class="button button-small button-icon button-quiet" type="button" data-action="move-workout-item" data-id="${item.itemId}" data-direction="down" aria-label="Переместить ${escapeHtml(item.exerciseNameSnapshot)} ниже" ${index === workout.items.length - 1 ? 'disabled' : ''}>↓</button></div>` : ''}`;
    const prescription = formatPrescription(item.prescription);
    const prescriptionFields = editAllowed ? `<div class="session-prescription">${[['sets','Подходы'],['reps','Повторы'],['durationSec','Сек.'],['distanceMeters','Метры'],['weightKg','Кг']].map(([key,label]) => `<label>${label}<input class="field" type="number" min="1" step="1" data-workout-param="${key}" value="${item.prescription?.[key] || ''}" aria-label="${label}: ${escapeHtml(item.exerciseNameSnapshot)}"></label>`).join('')}</div>` : (prescription ? `<small>${escapeHtml(prescription)}</small>` : '');
    return `<article class="session-exercise" data-workout-row="${item.itemId}"><div class="session-art">${miniForItem(item)}</div><div><h3>${escapeHtml(item.exerciseNameSnapshot)}</h3><p>${escapeHtml(item.muscleGroupsSnapshot.join(' · '))}</p><p>${escapeHtml(item.descriptionSnapshot)}</p>${prescriptionFields}</div>${status}</article>`;
  }

  function saveWorkoutForm(event) {
    if (event.target.id !== 'workout-form') return;
    event.preventDefault();
    const form = event.target, editingId = workoutDialog.dataset.workoutId, workout = appData.workouts.find((w) => w.id === editingId);
    if (workout && !canEditWorkout(workout)) { toast('Эту завершённую тренировку уже нельзя изменить.', true); workoutDialog.close(); return; }
    const date = workout && workout.date <= localDateString(new Date()) ? workout.date : form.elements.date.value;
    if (workout && workoutDialog.dataset.allowComposition === 'true' && workout.date < localDateString(new Date())) { toast('Срок редактирования состава тренировки истёк.', true); workoutDialog.close(); renderPlan(); return; }
    if (workout && workout.date > localDateString(new Date()) && date < localDateString(new Date())) { toast('Нельзя переносить тренировку в прошедшую дату.', true); return; }
    let items;
    if (workout) {
      const selectedIds = new Set([...form.querySelectorAll('[name="workoutExercise"]:checked')].map((input) => input.value));
      const oldItems = workout.items;
      items = oldItems.filter((item) => selectedIds.has(item.exerciseId));
      [...selectedIds].filter((exerciseId) => !oldItems.some((item) => item.exerciseId === exerciseId)).forEach((exerciseId) => items.push(snapshotItem(findExercise(exerciseId), items.length)));
      let invalidPrescription = false;
      items.forEach((item) => {
        const row = form.querySelector(`[data-workout-row="${CSS.escape(item.itemId)}"]`);
        if (!row) return;
        const prescription = {};
        row.querySelectorAll('[data-workout-param]').forEach((input) => { if (!input.value.trim()) return; const value = Number(input.value), key = input.dataset.workoutParam; if (!Number.isFinite(value) || value < 1 || !Number.isInteger(value)) { invalidPrescription = true; return; } prescription[key] = value; });
        item.prescription = prescription;
      });
      if (invalidPrescription) { toast('Все плановые параметры должны быть положительными целыми числами.', true); return; }
      items.forEach((item, index) => { item.order = index; });
    }
    else items = [...form.querySelectorAll('[name="workoutExercise"]:checked')].map((input, index) => snapshotItem(findExercise(input.value), index));
    if (!date || !items.length) { toast('Укажи дату и добавь хотя бы одно упражнение.', true); return; }
    if (workout) { const originalDate = workout.date; workout.items = items; workout.date = date; if (workout.seriesId && originalDate !== date) { const series = appData.recurrences.find((item) => item.id === workout.seriesId); if (series) series.excludedDates = [...new Set([...(series.excludedDates || []), originalDate])]; } workout.updatedAt = new Date().toISOString(); }
    else appData.workouts.push({ id: id('workout'), date, source: 'manual', title: 'Тренировка', templateId: null, templateNameSnapshot: '', seriesId: null, skipped: false, items, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    selectedDate = calendarDate = date;
    if (mutate(workout ? 'Тренировка обновлена' : 'Тренировка создана')) workoutDialog.close();
  }

  function recurrenceDates(form) {
    const start = form.elements.start.value, end = form.elements.end.value;
    if (!start || !end || end < start) return [];
    const days = [...form.querySelectorAll('[name="repeatDay"]:checked')].map((input) => Number(input.value));
    const result = [];
    for (let date = start; date <= end; date = shiftDate(date, 1)) {
      const weekday = (parseLocalDate(date).getDay() + 6) % 7;
      if (days.includes(weekday)) result.push(date);
    }
    return result;
  }

  function updateGeneratorPreview() {
    const form = generatorDialog.querySelector('#generator-form'); if (!form) return;
    const dates = recurrenceDates(form), conflicts = dates.filter((date) => appData.workouts.some((workout) => workout.date === date));
    const preview = form.querySelector('#generator-preview');
    preview.innerHTML = dates.length ? `<strong>${dates.length} занятий:</strong> ${dates.map((date) => escapeHtml(formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' }))).join(', ')}${conflicts.length ? `<p class="notice">На ${conflicts.length} дат уже есть тренировки. Будут созданы отдельные экземпляры, существующие записи не изменятся.</p>` : ''}` : 'Выбери диапазон дат и хотя бы один день недели.';
  }

  function openGenerator() {
    const options = appData.templates.filter((template) => !template.isArchived).map((template) => `<option value="${template.id}">${escapeHtml(template.name)}</option>`).join('');
    const today = localDateString(new Date());
    generatorDialog.innerHTML = `<form id="generator-form" class="dialog-content"><div class="dialog-head"><div><p class="eyebrow">Повтор расписания</p><h2>Создать серию тренировок</h2></div><button class="button button-icon button-quiet" type="button" data-action="close-generator" aria-label="Закрыть окно">×</button></div><label class="form-field">Шаблон<select class="select-field" name="templateId" required>${options}</select></label><div class="form-grid"><label class="form-field">Начало<input class="field" type="date" name="start" required value="${today}"></label><label class="form-field">Окончание<input class="field" type="date" name="end" required value="${shiftDate(today, 28)}"></label></div><div class="form-field"><span class="field-label">Дни недели *</span><div class="check-grid">${['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'].map((day,index)=>`<label class="check-chip"><input type="checkbox" name="repeatDay" value="${index}">${day}</label>`).join('')}</div></div><div id="generator-preview" class="notice" aria-live="polite"></div><div class="form-actions"><button class="button button-quiet" type="button" data-action="close-generator">Отмена</button><button class="button button-primary" type="submit">Создать тренировки</button></div></form>`;
    generatorDialog.dataset.dirty = 'false'; generatorDialog.showModal(); updateGeneratorPreview();
  }

  function submitGenerator(event) {
    if (event.target.id !== 'generator-form') return;
    event.preventDefault(); const form = event.target, dates = recurrenceDates(form), template = findTemplate(form.elements.templateId.value);
    if (!template || !dates.length) { toast('Выбери период, дни недели и шаблон.', true); return; }
    const recurrenceId = id('recurrence'), workoutIds = [];
    dates.forEach((date) => { const workoutId = id('workout'); workoutIds.push(workoutId); appData.workouts.push({ id: workoutId, date, source: 'recurrence', templateId: template.id, templateNameSnapshot: template.name, seriesId: recurrenceId, skipped: false, items: structuredCloneSafe(template.items).map((item) => ({ ...item, itemId: id('item'), completed: false })), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); });
    appData.recurrences.push({ id: recurrenceId, templateId: template.id, weekdays: [...form.querySelectorAll('[name="repeatDay"]:checked')].map((input) => Number(input.value)), startDate: form.elements.start.value, endDate: form.elements.end.value, excludedDates: [], workoutIds });
    selectedDate = dates[0]; calendarDate = dates[0]; screen = 'plan'; if (mutate(`${dates.length} тренировок создано`)) generatorDialog.close();
  }

  function submitGoal(event) {
    if (event.target.id !== 'goal-form') return;
    event.preventDefault(); const value = Number(event.target.elements.weeklyTarget.value);
    if (!Number.isInteger(value) || value < 1 || value > 14) { toast('Цель должна быть целым числом от 1 до 14.', true); return; }
    appData.goal.weeklyTarget = value; mutate('Недельная цель сохранена');
  }

  function renderSettings() {
    app.innerHTML = `<div class="page-heading"><div><p class="eyebrow">Хранение и доступность</p><h1>Настройки</h1><p class="subheading">Все настройки и резервные копии остаются на этом устройстве.</p></div></div>
      <section class="settings-panel"><h2>Цель и отображение</h2><form id="goal-form" class="goal-form"><label for="weekly-goal">Завершённых тренировок в неделю (1–14)<input id="weekly-goal" class="field" name="weeklyTarget" type="number" min="1" max="14" step="1" required value="${appData.goal.weeklyTarget}"></label><button class="button button-primary" type="submit">Сохранить цель</button></form>
      <label class="setting-row"><span><strong>Крупный текст</strong><small>Увеличивает основной текст интерфейса.</small></span><input type="checkbox" id="setting-large-text" ${appData.settings.largeText ? 'checked' : ''}></label><label class="setting-row"><span><strong>Повышенная контрастность</strong><small>Усиливает контраст фона и подписей.</small></span><input type="checkbox" id="setting-high-contrast" ${appData.settings.highContrast ? 'checked' : ''}></label></section>
      <section class="settings-panel"><h2>Знакомство</h2><p>Коротко показывает назначение разделов планировщика.</p><button type="button" class="button button-quiet" data-action="show-welcome">Показать знакомство</button></section>
      <section class="settings-panel"><h2>Резервная копия</h2><p>Экспорт содержит настройки, упражнения, шаблоны, расписания, историю и пользовательские изображения.</p><div class="backup-actions"><button type="button" class="button button-primary" data-action="export-data">Экспортировать JSON</button></div><div class="form-field"><label for="backup-file">Импорт JSON</label><input class="field" id="backup-file" type="file" accept="application/json,.json"><p class="help-text">Файл проверяется до применения; некорректная копия не изменит текущие данные.</p></div><div class="form-field"><label for="import-mode">Режим импорта</label><select class="select-field" id="import-mode"><option value="replace">Заменить все данные</option><option value="merge">Объединить с текущими</option></select></div><p id="backup-status" class="notice" aria-live="polite">Выберите файл JSON.</p><button id="import-apply" type="button" class="button button-primary" data-action="apply-import" disabled>Применить импорт</button></section>
      <section class="settings-panel danger-panel"><h2>Полный сброс</h2><p>Удалит все локальные записи и восстановит стартовый каталог. Действие нельзя отменить.</p><label class="form-field" for="reset-confirm-text">Для подтверждения введите фразу <strong>Удалить все данные</strong><input class="field" id="reset-confirm-text" autocomplete="off" placeholder="Удалить все данные"></label><button type="button" class="button button-danger" data-action="full-reset">Сбросить все данные</button></section>`;
  }

  function render() {
    document.querySelectorAll('.nav-button').forEach((button) => {
      const active = button.dataset.screen === screen;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    if (screen === 'templates') renderTemplates(); else if (screen === 'plan') renderPlan(); else if (screen === 'progress') renderProgress(); else if (screen === 'settings') renderSettings(); else renderExercises();
  }

  function plural(count, one, few, many) {
    const last = count % 10, lastTwo = count % 100;
    if (last === 1 && lastTwo !== 11) return one;
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
    return many;
  }

  function findExercise(exerciseId) { return appData?.exercises?.find((item) => item.id === exerciseId); }
  function findTemplate(templateId) { return appData?.templates?.find((item) => item.id === templateId); }

  function exerciseForm(exercise = null, duplicate = false) {
    pendingImageData = '';
    pendingImageError = '';
    const editing = !!exercise && !duplicate;
    const title = editing ? 'Изменить упражнение' : duplicate ? 'Копия упражнения' : 'Своё упражнение';
    const selectedGroups = exercise?.muscleGroups || [];
    const selectedEquipment = exercise?.equipment || ['Без инвентаря'];
    const preset = exercise?.prescriptionDefaults || {};
    const currentImage = exercise?.illustrationRef;
    const imageMarkup = currentImage ? (currentImage.type === 'builtin' ? BUILTIN_ART[currentImage.imageKey] : miniImageByRef(currentImage)) : '';
    exerciseDialog.innerHTML = `<form id="exercise-form" class="dialog-content"><div class="dialog-head"><div><p class="eyebrow">Каталог упражнений</p><h2>${title}</h2><p>Иллюстрация и описание обязательны. Данные останутся на устройстве.</p></div><button class="button button-icon button-quiet dialog-close" type="button" data-action="close-exercise-dialog" aria-label="Закрыть окно">×</button></div>
      <input type="hidden" name="exerciseId" value="${duplicate ? '' : escapeHtml(exercise?.id || '')}">
      <div class="form-grid"><div class="form-field full"><label for="ex-name">Название *</label><input class="field" id="ex-name" name="name" maxlength="80" required value="${duplicate ? `Копия: ${escapeHtml(exercise.name)}` : escapeHtml(exercise?.name || '')}" placeholder="Например, приседания"></div>
        <div class="form-field full"><span class="field-label">Группы мышц * (выбери хотя бы одну)</span><div class="check-grid">${MUSCLE_GROUPS.map((group) => `<label class="check-chip"><input type="checkbox" name="muscleGroups" value="${escapeHtml(group)}" ${selectedGroups.includes(group) ? 'checked' : ''}>${escapeHtml(group)}</label>`).join('')}</div></div>
        <div class="form-field full"><span class="field-label">Инвентарь</span><div class="check-grid">${EQUIPMENT.map((item) => `<label class="check-chip"><input type="checkbox" name="equipment" value="${escapeHtml(item)}" ${selectedEquipment.includes(item) ? 'checked' : ''}>${escapeHtml(item)}</label>`).join('')}</div></div>
        <div class="form-field full"><label for="ex-description">Описание техники *</label><textarea class="textarea-field" id="ex-description" name="description" maxlength="1200" required placeholder="Как выполнять упражнение и какие мышцы оно тренирует">${escapeHtml(exercise?.description || '')}</textarea></div>
        <div class="form-field full"><span class="field-label">Иллюстрация упражнения *</span><div class="image-control"><div class="image-preview" id="exercise-image-preview">${imageMarkup || '<span class="help-text">Загрузи иллюстрацию</span>'}</div><div><input id="ex-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" ${currentImage ? '' : 'required'}><p class="help-text">JPG, PNG или WebP. Будет локально уменьшена до 640 px и 150 KiB.</p></div></div></div>
        <div class="form-field"><label for="ex-sets">Подходы</label><input class="field" id="ex-sets" name="sets" type="number" min="1" step="1" value="${preset.sets || ''}"></div><div class="form-field"><label for="ex-reps">Повторения</label><input class="field" id="ex-reps" name="reps" type="number" min="1" step="1" value="${preset.reps || ''}"></div>
        <div class="form-field"><label for="ex-duration">Длительность (сек.)</label><input class="field" id="ex-duration" name="durationSec" type="number" min="1" step="1" value="${preset.durationSec || ''}"></div><div class="form-field"><label for="ex-distance">Расстояние (м)</label><input class="field" id="ex-distance" name="distanceMeters" type="number" min="1" step="1" value="${preset.distanceMeters || ''}"></div>
        <div class="form-field"><label for="ex-weight">Нагрузка (кг)</label><input class="field" id="ex-weight" name="weightKg" type="number" min="1" step="1" value="${preset.weightKg || ''}"></div>
      </div><p class="form-error" id="exercise-error" aria-live="polite">${escapeHtml(pendingImageError)}</p><div class="form-actions"><button class="button button-quiet" type="button" data-action="close-exercise-dialog">Отмена</button><button class="button button-primary" type="submit">Сохранить упражнение</button></div></form>`;
    exerciseDialog.dataset.editingId = editing ? exercise.id : '';
    exerciseDialog.dataset.originalImageRef = currentImage ? JSON.stringify(currentImage) : '';
    exerciseDialog.dataset.dirty = 'false';
    exerciseDialog.showModal();
    const nameInput = exerciseDialog.querySelector('#ex-name');
    setTimeout(() => nameInput?.focus(), 20);
  }

  function miniImageByRef(ref) {
    if (ref?.type === 'custom') {
      const asset = appData.mediaAssets.find((entry) => entry.id === ref.assetId);
      return asset ? `<img src="${asset.dataUrl}" alt="" style="width:100%;height:100%;object-fit:cover">` : '';
    }
    return BUILTIN_ART[ref?.imageKey] || '';
  }

  function readPrescription(form) {
    const result = {};
    ['sets', 'reps', 'durationSec', 'distanceMeters', 'weightKg'].forEach((key) => {
      const raw = form.elements.namedItem(key)?.value?.trim();
      if (raw !== '') {
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 1 || !Number.isInteger(value)) throw new Error('Все плановые параметры должны быть положительными целыми числами.');
        result[key] = value;
      }
    });
    return result;
  }

  async function processImage(file) {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Выбери изображение JPG, PNG или WebP.');
    const sourceUrl = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error('Не удалось прочитать изображение.'));
        element.src = sourceUrl;
      });
      const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      let dataUrl = '';
      for (let quality = 0.84; quality >= 0.42; quality -= 0.07) {
        dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrlBytes(dataUrl) <= MAX_IMAGE_BYTES) break;
      }
      if (dataUrlBytes(dataUrl) > MAX_IMAGE_BYTES) throw new Error('Изображение остаётся больше 150 KiB после сжатия. Выбери файл поменьше.');
      return dataUrl;
    } finally { URL.revokeObjectURL(sourceUrl); }
  }

  function dataUrlBytes(dataUrl = '') { const base64 = dataUrl.split(',')[1] || ''; return Math.floor(base64.length * 3 / 4); }
  function totalCustomImageBytes(exceptAssetId = '') { return appData.mediaAssets.filter((asset) => asset.id !== exceptAssetId).reduce((sum, asset) => sum + dataUrlBytes(asset.dataUrl), 0); }

  function assetReferencedOutsideExercise(assetId, exerciseId) {
    const hasRef = (item) => item.illustrationRef?.type === 'custom' && item.illustrationRef.assetId === assetId;
    return appData.exercises.some((entry) => entry.id !== exerciseId && hasRef(entry)) ||
      appData.templates.some((template) => template.items.some(hasRef)) ||
      appData.workouts.some((workout) => workout.items.some(hasRef));
  }

  function collectUnusedMedia() {
    const hasRef = (item, assetId) => item.illustrationRef?.type === 'custom' && item.illustrationRef.assetId === assetId;
    appData.mediaAssets = appData.mediaAssets.filter((asset) =>
      appData.exercises.some((entry) => hasRef(entry, asset.id)) ||
      appData.templates.some((template) => template.items.some((item) => hasRef(item, asset.id))) ||
      appData.workouts.some((workout) => workout.items.some((item) => hasRef(item, asset.id))));
  }

  function templateForm(template = null, duplicate = false) {
    const editing = !!template && !duplicate;
    const items = template?.items || [];
    templateDialog.dataset.editingId = editing ? template.id : '';
    templateDialog.dataset.duplicateId = duplicate ? template.id : '';
    templateDialog.dataset.draftItems = JSON.stringify(items.map((item, index) => ({ ...structuredCloneSafe(item), itemId: editing ? (item.itemId || id('item')) : id('item'), order: index, completed: false })));
    templateDialog.dataset.formName = duplicate ? `Копия: ${template.name}` : (template?.name || '');
    templateDialog.dataset.dirty = 'false';
    renderTemplateForm();
    templateDialog.showModal();
    setTimeout(() => templateDialog.querySelector('#template-name')?.focus(), 20);
  }

  function renderTemplateForm() {
    const editing = !!templateDialog.dataset.editingId;
    const duplicate = !!templateDialog.dataset.duplicateId;
    const draft = JSON.parse(templateDialog.dataset.draftItems || '[]');
    const selectedIds = new Set(draft.map((item) => item.exerciseId));
    const available = appData.exercises.filter((exercise) => !exercise.isArchived);
    const rows = draft.map((item, index) => `<div class="template-edit-row" data-template-row="${item.itemId}"><span class="mini-art">${miniForItem(item)}</span><div class="template-edit-main"><strong>${escapeHtml(item.exerciseNameSnapshot)}</strong><div class="template-edit-fields">${[['sets','Подходы'],['reps','Повторы'],['durationSec','Сек.'],['distanceMeters','Метры'],['weightKg','Кг']].map(([key,label]) => `<label>${label}<input class="field" type="number" min="1" step="1" data-item-param="${key}" value="${item.prescription?.[key] || ''}" aria-label="${label}: ${escapeHtml(item.exerciseNameSnapshot)}"></label>`).join('')}</div></div><div class="template-reorder"><button class="button button-small button-icon button-quiet" type="button" data-action="move-template-item" data-id="${item.itemId}" data-direction="up" aria-label="Переместить ${escapeHtml(item.exerciseNameSnapshot)} выше" ${index === 0 ? 'disabled' : ''}>↑</button><button class="button button-small button-icon button-quiet" type="button" data-action="move-template-item" data-id="${item.itemId}" data-direction="down" aria-label="Переместить ${escapeHtml(item.exerciseNameSnapshot)} ниже" ${index === draft.length - 1 ? 'disabled' : ''}>↓</button></div></div>`).join('');
    templateDialog.innerHTML = `<form id="template-form" class="dialog-content"><div class="dialog-head"><div><p class="eyebrow">Список упражнений</p><h2>${editing ? 'Изменить шаблон' : duplicate ? 'Копия шаблона' : 'Новый шаблон'}</h2><p>Шаблон можно будет применить к дате.</p></div><button class="button button-icon button-quiet dialog-close" type="button" data-action="close-template-dialog" aria-label="Закрыть окно">×</button></div>
      <div class="form-field"><label for="template-name">Название шаблона *</label><input id="template-name" class="field" maxlength="80" required value="${escapeHtml(templateDialog.dataset.formName || '')}"></div>
      <div class="section-label"><h2>Добавить упражнения *</h2><span class="count">Отметь состав</span></div><div class="check-grid template-select-list">${available.map((exercise) => `<label class="check-chip"><input type="checkbox" name="templateExercises" value="${exercise.id}" ${selectedIds.has(exercise.id) ? 'checked' : ''}>${escapeHtml(exercise.name)}</label>`).join('')}</div>
      <div class="section-label"><h2>Порядок и план</h2><span class="count">${draft.length} выбрано</span></div><div class="template-items-editor">${rows || '<p class="help-text">Отметь упражнения выше, чтобы добавить их в шаблон.</p>'}</div>
      <p class="form-error" id="template-error" aria-live="polite"></p><div class="form-actions"><button class="button button-quiet" type="button" data-action="close-template-dialog">Отмена</button><button class="button button-primary" type="submit">Сохранить шаблон</button></div></form>`;
  }

  function syncTemplateDraft() {
    const form = templateDialog.querySelector('#template-form');
    if (!form) return [];
    templateDialog.dataset.formName = form.querySelector('#template-name').value;
    const draft = JSON.parse(templateDialog.dataset.draftItems || '[]');
    draft.forEach((item) => {
      const row = form.querySelector(`[data-template-row="${CSS.escape(item.itemId)}"]`);
      if (!row) return;
      item.prescription = {};
      row.querySelectorAll('[data-item-param]').forEach((input) => {
        if (input.value.trim() === '') return;
        const value = Number(input.value);
        item.prescription[input.dataset.itemParam] = value;
      });
    });
    templateDialog.dataset.draftItems = JSON.stringify(draft);
    return draft;
  }

  function updateTemplateSelection(input) {
    const draft = syncTemplateDraft();
    const exerciseId = input.value;
    if (input.checked && !draft.some((item) => item.exerciseId === exerciseId)) draft.push(snapshotItem(findExercise(exerciseId), draft.length));
    if (!input.checked) draft.splice(0, draft.length, ...draft.filter((item) => item.exerciseId !== exerciseId));
    draft.forEach((item, index) => { item.order = index; });
    templateDialog.dataset.draftItems = JSON.stringify(draft);
    renderTemplateForm();
  }

  function moveTemplateItem(itemId, direction) {
    const draft = syncTemplateDraft();
    const index = draft.findIndex((item) => item.itemId === itemId);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= draft.length) return;
    [draft[index], draft[target]] = [draft[target], draft[index]];
    draft.forEach((item, order) => { item.order = order; });
    templateDialog.dataset.draftItems = JSON.stringify(draft);
    renderTemplateForm();
    templateDialog.dataset.dirty = 'true';
  }

  function applyTemplateDialog(template) {
    applyDialog.innerHTML = `<form id="apply-form" class="dialog-content"><div class="dialog-head"><div><p class="eyebrow">Применить шаблон</p><h2>${escapeHtml(template.name)}</h2><p>${template.items.length} упражнений будет скопировано в отдельную тренировку.</p></div><button class="button button-icon button-quiet dialog-close" type="button" data-action="close-apply-dialog" aria-label="Закрыть окно">×</button></div><div class="form-field"><label for="apply-date">Дата тренировки *</label><input class="field" type="date" id="apply-date" required value="${localDateString(new Date())}"></div><p class="form-error" id="apply-error" aria-live="polite"></p><div class="form-actions"><button class="button button-quiet" type="button" data-action="close-apply-dialog">Отмена</button><button class="button button-primary" type="submit">Создать тренировку</button></div></form>`;
    applyDialog.dataset.templateId = template.id;
    applyDialog.dataset.dirty = 'false';
    applyDialog.showModal();
    setTimeout(() => applyDialog.querySelector('#apply-date')?.focus(), 20);
  }

  function localDateString(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }

  function confirmAction(title, message, confirmText, callback) {
    confirmDialog.innerHTML = `<div class="dialog-content"><div class="dialog-head"><div><p class="eyebrow">Подтверждение</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p></div><button class="button button-icon button-quiet dialog-close" type="button" data-action="close-confirm-dialog" aria-label="Закрыть окно">×</button></div><div class="form-actions"><button class="button button-quiet" type="button" data-action="close-confirm-dialog">Отмена</button><button class="button button-danger" id="confirm-action-button" type="button">${escapeHtml(confirmText)}</button></div></div>`;
    confirmDialog.showModal();
    confirmDialog.querySelector('#confirm-action-button').addEventListener('click', () => { confirmDialog.close(); callback(); }, { once: true });
  }

  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleClick(event) {
    const nav = event.target.closest('[data-screen]');
    if (nav) {
      screen = nav.dataset.screen;
      if (screen === 'plan') { calendarDate = selectedDate || localDateString(new Date()); }
      appData.settings.onboardingDismissed = true;
      mutate();
      return;
    }
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const exercise = findExercise(button.dataset.id);
    const template = findTemplate(button.dataset.id);
    const workout = appData?.workouts?.find((item) => item.id === button.dataset.id);
    if (action === 'dismiss-welcome') { appData.settings.onboardingDismissed = true; mutate(); }
    else if (action === 'new-exercise') exerciseForm();
    else if (action === 'edit-exercise' && exercise) exerciseForm(exercise);
    else if (action === 'duplicate-exercise' && exercise) exerciseForm(exercise, true);
    else if (action === 'favorite' && exercise) { exercise.isFavorite = !exercise.isFavorite; exercise.updatedAt = new Date().toISOString(); mutate(exercise.isFavorite ? 'Добавлено в избранное' : 'Убрано из избранного'); }
    else if (action === 'toggle-favorites') { favoritesOnly = !favoritesOnly; render(); }
    else if (action === 'toggle-archived') { showArchivedExercises = !showArchivedExercises; favoritesOnly = false; render(); }
    else if (action === 'archive-exercise' && exercise) confirmAction('В архив?', `Упражнение «${exercise.name}» исчезнет из обычного каталога, но останется в старых шаблонах и тренировках.`, 'В архив', () => { exercise.isArchived = true; exercise.updatedAt = new Date().toISOString(); mutate('Упражнение архивировано'); });
    else if (action === 'restore-exercise' && exercise) { exercise.isArchived = false; exercise.updatedAt = new Date().toISOString(); mutate('Упражнение восстановлено'); }
    else if (action === 'add-to-template' && exercise) openTemplateWithExercise(exercise);
    else if (action === 'new-template') templateForm();
    else if (action === 'duplicate-template' && template) templateForm(template, true);
    else if (action === 'edit-template' && template) templateForm(template);
    else if (action === 'apply-template' && template) applyTemplateDialog(template);
    else if (action === 'archive-template' && template) confirmAction('Убрать шаблон?', `Шаблон «${template.name}» переместится в архив. Уже созданные тренировки останутся без изменений.`, 'В архив', () => { template.isArchived = true; template.updatedAt = new Date().toISOString(); mutate('Шаблон архивирован'); });
    else if (action === 'delete-template' && template) confirmAction('Удалить шаблон?', `Шаблон «${template.name}» будет удалён. Уже созданные тренировки останутся без изменений.`, 'Удалить', () => { appData.templates = appData.templates.filter((entry) => entry.id !== template.id); collectUnusedMedia(); mutate('Шаблон удалён'); });
    else if (action === 'restore-template' && template) { template.isArchived = false; template.updatedAt = new Date().toISOString(); mutate('Шаблон восстановлен'); }
    else if (action === 'toggle-archived-templates') { showArchivedTemplates = !showArchivedTemplates; render(); }
    else if (action === 'move-template-item') moveTemplateItem(button.dataset.id, button.dataset.direction);
    else if (action === 'new-workout') workoutForm();
    else if (action === 'open-generator') openGenerator();
    else if (action === 'calendar-week' || action === 'calendar-month') { calendarMode = action === 'calendar-week' ? 'week' : 'month'; render(); }
    else if (action === 'calendar-today') { calendarDate = selectedDate = localDateString(new Date()); render(); }
    else if (action === 'calendar-prev' || action === 'calendar-next') { const amount = action === 'calendar-prev' ? -1 : 1; const date = parseLocalDate(calendarDate); if (calendarMode === 'week') { date.setDate(date.getDate() + amount * 7); selectedDate = shiftDate(selectedDate, amount * 7); } else { date.setDate(1); date.setMonth(date.getMonth() + amount); selectedDate = localDateString(date); } calendarDate = localDateString(date); render(); }
    else if (action === 'select-date') { selectedDate = button.dataset.date; calendarDate = selectedDate; render(); }
    else if (action === 'progress-mode') { progressMode = button.dataset.mode; render(); }
    else if (action === 'progress-today') { progressDate = localDateString(new Date()); render(); }
    else if (action === 'progress-prev' || action === 'progress-next') { const amount = action === 'progress-prev' ? -1 : 1, date = parseLocalDate(progressDate); if (progressMode === 'day') date.setDate(date.getDate() + amount); else if (progressMode === 'week') date.setDate(date.getDate() + amount * 7); else { date.setDate(1); date.setMonth(date.getMonth() + amount); } progressDate = localDateString(date); render(); }
    else if (action === 'progress-date') { selectedDate = calendarDate = button.dataset.date; screen = 'plan'; render(); }
    else if (action === 'progress-workout' && workout) workoutForm(workout, false, !canEditWorkout(workout) && statusOf(workout) === 'Выполнена');
    else if (action === 'show-welcome') { appData.settings.onboardingDismissed = false; screen = 'plan'; mutate(); }
    else if (action === 'export-data') exportData();
    else if (action === 'apply-import') applyImport();
    else if (action === 'full-reset') requestFullReset('reset-confirm-text');
    else if (action === 'reset-corrupt') requestFullReset('reset-corrupt-text');
    else if (action === 'open-workout' && workout) workoutForm(workout, false, !canEditWorkout(workout) && statusOf(workout) === 'Выполнена');
    else if (action === 'edit-workout' && workout && canEditWorkout(workout)) workoutForm(workout);
    else if (action === 'skip-workout' && workout) { workout.skipped = true; workout.updatedAt = new Date().toISOString(); mutate('Тренировка отмечена как пропущенная'); }
    else if (action === 'unskip-workout' && workout) { workout.skipped = false; workout.updatedAt = new Date().toISOString(); mutate('Тренировка возвращена в работу'); }
    else if (action === 'move-workout-item' && workout && canEditWorkout(workout)) { const index = workout.items.findIndex((item) => item.itemId === button.dataset.id), target = index + (button.dataset.direction === 'up' ? -1 : 1); if (index >= 0 && target >= 0 && target < workout.items.length) { [workout.items[index], workout.items[target]] = [workout.items[target], workout.items[index]]; workout.items.forEach((item, order) => { item.order = order; }); workout.updatedAt = new Date().toISOString(); if (mutate('Порядок упражнений изменён')) workoutForm(workout); } }
    else if (action === 'copy-workout' && workout) copyWorkoutForm(workout);
    else if (action === 'delete-workout' && workout) confirmAction('Удалить тренировку?', `Тренировка за ${formatDate(workout.date)} будет удалена.`, 'Удалить', () => { appData.workouts = appData.workouts.filter((entry) => entry.id !== workout.id); if (workout.seriesId) { const series = appData.recurrences.find((item) => item.id === workout.seriesId); if (series) { series.workoutIds = series.workoutIds.filter((workoutId) => workoutId !== workout.id); series.excludedDates = [...new Set([...(series.excludedDates || []), workout.date])]; } } collectUnusedMedia(); mutate('Тренировка удалена'); });
    else if (action === 'close-workout-dialog') requestDialogClose(workoutDialog);
    else if (action === 'close-generator') requestDialogClose(generatorDialog);
    else if (action === 'close-exercise-dialog') requestDialogClose(exerciseDialog);
    else if (action === 'close-template-dialog') requestDialogClose(templateDialog);
    else if (action === 'close-apply-dialog') requestDialogClose(applyDialog);
    else if (action === 'close-confirm-dialog') confirmDialog.close();
    else if (action === 'download-raw') {
      let raw = '';
      try { raw = localStorage.getItem(STORAGE_KEY) || ''; } catch { raw = ''; }
      if (raw) downloadFile('fitness-planner-corrupted.txt', raw, 'text/plain;charset=utf-8');
      else toast('Сохранённые данные недоступны для копирования.', true);
    }
  }

  function openTemplateWithExercise(exercise) {
    templateForm({ name: '', items: [snapshotItem(exercise, 0)] });
  }

  async function handleExerciseSubmit(event) {
    if (event.target.id !== 'exercise-form') return;
    event.preventDefault();
    const form = event.target;
    const errorBox = form.querySelector('#exercise-error');
    try {
      const name = form.elements.name.value.trim();
      const groups = [...form.querySelectorAll('[name="muscleGroups"]:checked')].map((input) => input.value);
      const equipment = [...form.querySelectorAll('[name="equipment"]:checked')].map((input) => input.value);
      const description = form.elements.description.value.trim();
      if (!name) throw new Error('Укажи название упражнения.');
      if (!groups.length) throw new Error('Выбери хотя бы одну группу мышц.');
      if (!description) throw new Error('Добавь описание техники.');
      const prescriptionDefaults = readPrescription(form);
      const editingId = exerciseDialog.dataset.editingId;
      const existing = editingId ? findExercise(editingId) : null;
      const originalRef = exerciseDialog.dataset.originalImageRef ? JSON.parse(exerciseDialog.dataset.originalImageRef) : null;
      const imageFile = form.elements.image.files[0];
      let illustrationRef = originalRef;
      if (imageFile) {
        const dataUrl = await processImage(imageFile);
        const replacingAssetId = editingId && originalRef?.type === 'custom' ? originalRef.assetId : '';
        const reclaimBytes = replacingAssetId && !assetReferencedOutsideExercise(replacingAssetId, editingId) ? dataUrlBytes(appData.mediaAssets.find((asset) => asset.id === replacingAssetId)?.dataUrl) : 0;
        if (totalCustomImageBytes() - reclaimBytes + dataUrlBytes(dataUrl) > MAX_TOTAL_IMAGE_BYTES) throw new Error('Достигнут общий лимит места для пользовательских изображений в браузере. Удали ненужные изображения или выбери файл меньшего размера.');
        const assetId = id('asset');
        appData.mediaAssets.push({ id: assetId, mimeType: dataUrl.slice(5, dataUrl.indexOf(';')), dataUrl });
        illustrationRef = { type: 'custom', assetId };
      }
      if (!illustrationRef) throw new Error('Добавь иллюстрацию упражнения.');
      if (existing) {
        Object.assign(existing, { name, muscleGroups: groups, equipment, description, prescriptionDefaults, illustrationRef, updatedAt: new Date().toISOString() });
        collectUnusedMedia();
        if (!mutate('Упражнение обновлено')) return;
      } else {
        const record = { id: id('exercise'), source: 'custom', isArchived: false, isFavorite: false, name, muscleGroups: groups, equipment, description, prescriptionDefaults, illustrationRef, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        appData.exercises.push(record);
        collectUnusedMedia();
        if (!mutate('Упражнение сохранено')) return;
      }
      exerciseDialog.close();
    } catch (error) { errorBox.textContent = error.message || 'Не удалось сохранить упражнение.'; }
  }

  function handleTemplateSubmit(event) {
    if (event.target.id !== 'template-form') return;
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('#template-name').value.trim();
    const items = syncTemplateDraft();
    const errorBox = form.querySelector('#template-error');
    if (!name) { errorBox.textContent = 'Укажи название шаблона.'; return; }
    if (!items.length) { errorBox.textContent = 'Добавь хотя бы одно упражнение.'; return; }
    try {
      items.forEach((item) => {
        Object.entries(item.prescription || {}).forEach(([key, value]) => {
        if (!Number.isFinite(value) || value < 1 || !Number.isInteger(value)) throw new Error('Все плановые параметры должны быть положительными целыми числами.');
        });
      });
    } catch (error) { errorBox.textContent = error.message; return; }
    items.forEach((item, index) => { item.order = index; });
    const editingId = templateDialog.dataset.editingId;
    if (editingId) {
      const existing = findTemplate(editingId);
      existing.name = name; existing.items = items; existing.updatedAt = new Date().toISOString();
      if (!mutate('Шаблон обновлён')) return;
    } else {
      appData.templates.push({ id: id('template'), name, source: 'custom', isArchived: false, items, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      if (!mutate('Шаблон сохранён')) return;
    }
    templateDialog.close();
  }

  function handleApplySubmit(event) {
    if (event.target.id !== 'apply-form') return;
    event.preventDefault();
    const template = findTemplate(applyDialog.dataset.templateId);
    const date = event.target.querySelector('#apply-date').value;
    const errorBox = event.target.querySelector('#apply-error');
    if (!template || !date) { errorBox.textContent = 'Выбери дату тренировки.'; return; }
    appData.workouts.push({ id: id('workout'), date, source: 'template', templateId: template.id, templateNameSnapshot: template.name, seriesId: null, skipped: false, items: structuredCloneSafe(template.items).map((item) => ({ ...item, itemId: id('item'), completed: false })), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    selectedDate = calendarDate = date; screen = 'plan';
    if (mutate('Тренировка из шаблона создана')) { applyDialog.close(); }
  }

  function handleInput(event) {
    if (event.target.id === 'search-exercises') { search = event.target.value; const position = event.target.selectionStart; renderExercises(); const next = document.getElementById('search-exercises'); next?.focus(); next?.setSelectionRange(position, position); }
  }

  async function handleImageInput(input) {
    const file = input.files?.[0];
    if (!file) return;
    const errorBox = exerciseDialog.querySelector('#exercise-error');
    const preview = exerciseDialog.querySelector('#exercise-image-preview');
    errorBox.textContent = 'Обрабатываю изображение…';
    try {
      pendingImageData = await processImage(file);
      preview.innerHTML = `<img src="${pendingImageData}" alt="Предварительный просмотр иллюстрации">`;
      errorBox.textContent = `Готово: ${(dataUrlBytes(pendingImageData) / 1024).toFixed(0)} KiB.`;
    } catch (error) { pendingImageData = ''; errorBox.textContent = error.message; }
  }

  function handleChange(event) {
    if (event.target.id === 'backup-file') { handleBackupFile(event.target); return; }
    if (event.target.id === 'setting-large-text' || event.target.id === 'setting-high-contrast') {
      const key = event.target.id === 'setting-large-text' ? 'largeText' : 'highContrast'; appData.settings[key] = event.target.checked; mutate(key === 'largeText' ? 'Крупный текст обновлён' : 'Контрастность обновлена'); return;
    }
    if (event.target.name === 'templateExercises') { updateTemplateSelection(event.target); return; }
    if (event.target.name === 'workoutExercise') { workoutDialog.dataset.dirty = 'true'; return; }
    if (event.target.matches('[data-action="toggle-item"]')) {
      const workout = appData.workouts.find((item) => item.id === workoutDialog.dataset.workoutId);
      if (!workout || !canEditWorkout(workout)) { event.target.checked = !event.target.checked; return; }
      const item = workout.items.find((entry) => entry.itemId === event.target.dataset.id);
      if (item) { item.completed = event.target.checked; workout.updatedAt = new Date().toISOString(); mutate('Отметка сохранена'); workoutForm(workout); }
      return;
    }
    if (event.target.closest('#generator-form')) { updateGeneratorPreview(); return; }
    if (event.target.id === 'filter-group') { groupFilter = event.target.value; renderExercises(); }
    if (event.target.id === 'filter-equipment') { equipmentFilter = event.target.value; renderExercises(); }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      const openDialog = [exerciseDialog, templateDialog, applyDialog, workoutDialog, generatorDialog, confirmDialog].find((dialog) => dialog.open);
      if (openDialog && openDialog !== confirmDialog) { event.preventDefault(); requestDialogClose(openDialog); }
    }
  }

  function requestDialogClose(dialog) {
    if (dialog.dataset.dirty === 'true') confirmAction('Закрыть без сохранения?', 'Введённые изменения будут потеряны.', 'Закрыть', () => dialog.close());
    else dialog.close();
  }

  function markDialogDirty(event) {
    const form = event.target.closest('dialog form');
    if (!form) return;
    form.closest('dialog').dataset.dirty = 'true';
    if (form.id === 'workout-form') {
      const notice = form.querySelector('#workout-unsaved-notice');
      if (notice) notice.hidden = false;
    }
  }

  document.addEventListener('input', markDialogDirty);
  document.addEventListener('change', markDialogDirty);
  app.addEventListener('input', handleInput);
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', (event) => { handleExerciseSubmit(event); handleTemplateSubmit(event); handleApplySubmit(event); saveWorkoutForm(event); submitCopyWorkout(event); submitGenerator(event); submitGoal(event); });
  document.addEventListener('change', (event) => { if (event.target.id === 'ex-image') handleImageInput(event.target); handleChange(event); });
  document.addEventListener('keydown', handleKeydown);

  // Keyboard Escape on a dirty edit asks before discarding; dialogs remain native and keyboard accessible.
  [exerciseDialog, templateDialog, applyDialog, workoutDialog, generatorDialog].forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) requestDialogClose(dialog); }));

  boot();
})();
