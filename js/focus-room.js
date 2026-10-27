
(() => {
  "use strict";

  const STORAGE_KEY = "studenthub-focus-room-v1";

  const DEFAULTS = {
    durations: { focus: 25, short: 5, long: 15 },
    dailyGoal: 120,
    mode: "focus",
    remaining: 25 * 60,
    running: false,
    endAt: null,
    task: "",
    sessions: [],
    streakDates: []
  };

  let state = loadState();
  let intervalId = null;
  let completedThisLoad = false;

  const $ = (id) => document.getElementById(id);

  const elements = {
    timer: $("timer-time"),
    ring: $("timer-ring"),
    modeTitle: $("mode-title"),
    caption: $("timer-caption"),
    subtitle: $("timer-subtitle"),
    hint: $("timer-hint"),
    badge: $("session-badge"),
    startPause: $("start-pause"),
    startLabel: $("start-label"),
    startIcon: $("start-icon"),
    reset: $("reset-timer"),
    task: $("task-name"),
    taskPreview: $("task-preview"),
    focusDuration: $("focus-duration"),
    shortDuration: $("short-duration"),
    longDuration: $("long-duration"),
    saveDurations: $("save-durations"),
    dailyGoal: $("daily-goal"),
    goalCompleted: $("goal-completed"),
    goalTarget: $("goal-target"),
    goalPercent: $("goal-percent"),
    goalFill: $("goal-fill"),
    statMinutes: $("stat-minutes"),
    statSessions: $("stat-sessions"),
    statStreak: $("stat-streak"),
    history: $("session-history"),
    clearHistory: $("clear-history"),
    date: $("focus-date"),
    todayLabel: $("today-label")
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (!saved || typeof saved !== "object") {
        return structuredClone(DEFAULTS);
      }

      const result = {
        ...DEFAULTS,
        ...saved,
        durations: { ...DEFAULTS.durations, ...saved.durations },
        sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
        streakDates: Array.isArray(saved.streakDates)
          ? saved.streakDates
          : []
      };

      // Validate stored duration values.
      for (const mode of ["focus", "short", "long"]) {
        const maximum = mode === "focus" ? 180 : mode === "short" ? 60 : 90;
        const value = Number(result.durations[mode]);

        result.durations[mode] =
          Number.isFinite(value) && value >= 1 && value <= maximum
            ? Math.floor(value)
            : DEFAULTS.durations[mode];
      }

      result.dailyGoal = [30, 60, 90, 120, 180, 240, 300]
        .includes(Number(result.dailyGoal))
          ? Number(result.dailyGoal)
          : DEFAULTS.dailyGoal;

      if (!["focus", "short", "long"].includes(result.mode)) {
        result.mode = "focus";
      }

      result.remaining = Number.isFinite(Number(result.remaining))
        ? Math.max(0, Number(result.remaining))
        : result.durations[result.mode] * 60;

      result.running = Boolean(result.running);
      result.endAt = Number.isFinite(Number(result.endAt))
        ? Number(result.endAt)
        : null;

      if (!result.running || !result.endAt) {
        result.running = false;
        result.endAt = null;
      }

      result.task = typeof result.task === "string" ? result.task : "";

      return result;
    } catch (error) {
      console.warn("Could not load Focus Room data.", error);
      return structuredClone(DEFAULTS);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Could not save Focus Room data.", error);
    }
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getTodaySessions() {
    const today = todayKey();
    return state.sessions.filter((session) => session.date === today);
  }

  function getTodayMinutes() {
  return getTodaySessions()
    .filter(session => session.mode === "focus")
    .reduce((total, session) => total + session.minutes, 0);
}

  function getFocusSessionsToday() {
    return getTodaySessions()
      .filter((session) => session.mode === "focus");
  }

  function getStreak() {
    const dates = new Set(state.streakDates);
    let streak = 0;
    const date = new Date();

    // If today has no focus session yet, allow the streak
    // from yesterday to remain visible.
    if (!dates.has(todayKey())) {
      date.setDate(date.getDate() - 1);
    }

    while (dates.has(todayKey(date))) {
      streak++;
      date.setDate(date.getDate() - 1);
    }

    return streak;
  }

  function modeDuration(mode = state.mode) {
    return state.durations[mode] * 60;
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  function getModeInfo(mode = state.mode) {
    const modes = {
      focus: {
        title: "Time to focus",
        caption: "STAY PRESENT",
        subtitle: "Every minute counts",
        hint: "Put distractions aside. You've got this.",
        color: "#8b7cff",
        icon: "◉"
      },
      short: {
        title: "Take a short break",
        caption: "BREATHE IN",
        subtitle: "Give your mind a moment",
        hint: "Stretch, drink water, and relax your eyes.",
        color: "#60a5fa",
        icon: "☕"
      },
      long: {
        title: "Recharge properly",
        caption: "SLOW DOWN",
        subtitle: "Rest is productive too",
        hint: "Step away from the screen for a little while.",
        color: "#34d399",
        icon: "☕"
      }
    };

    return modes[mode];
  }

  function renderTimer() {
    const info = getModeInfo();

    elements.timer.textContent = formatTime(state.remaining);
    elements.modeTitle.textContent = info.title;
    elements.caption.textContent = info.caption;
    elements.subtitle.textContent = info.subtitle;
    elements.hint.textContent = state.running
      ? "One minute at a time. Keep going."
      : info.hint;

    elements.ring.style.setProperty("--progress", `${getProgress()}%`);
    elements.ring.style.setProperty("--focus-accent", info.color);

    document.querySelectorAll("[data-mode]").forEach((button) => {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    elements.startLabel.textContent = state.running
      ? "Pause session"
      : state.remaining === 0
        ? "Start again"
        : state.remaining === modeDuration()
          ? state.mode === "focus" ? "Start focus" : "Start break"
          : "Resume session";

    elements.startIcon.textContent = state.running ? "Ⅱ" : "▶";

    const focusCount = getFocusSessionsToday().length + 1;
    elements.badge.textContent = `SESSION ${String(focusCount).padStart(2, "0")}`;

    document.title = state.running
      ? `${formatTime(state.remaining)} — Focus Room | StudentHub`
      : "Focus Room | StudentHub";
  }

  function getProgress() {
    const total = modeDuration();
    if (!total) return 0;

    return Math.min(100, Math.max(0, ((total - state.remaining) / total) * 100));
  }

  function renderTask() {
    elements.task.value = state.task;
    elements.taskPreview.textContent = state.task.trim()
      || "Choose a task to begin";
  }

  function renderGoal() {
    const completed = getTodayMinutes();
    const target = state.dailyGoal;
    const percent = Math.min(100, Math.round((completed / target) * 100));

    elements.goalCompleted.textContent = completed;
    elements.goalTarget.textContent = target;
    elements.goalPercent.textContent = `${percent}%`;
    elements.goalFill.style.width = `${percent}%`;
    elements.dailyGoal.value = String(target);

    if (completed >= target) {
      elements.goalPercent.textContent = "Goal reached!";
    }
  }

  function renderStats() {
    const todaySessions = getFocusSessionsToday();
    const todayMinutes = todaySessions.reduce(
      (total, session) => total + session.minutes,
      0
    );

    elements.statMinutes.textContent = `${todayMinutes} min`;
    elements.statSessions.textContent = todaySessions.length;

    const streak = getStreak();
    elements.statStreak.textContent =
      `${streak} ${streak === 1 ? "day" : "days"}`;

    elements.date.textContent = new Date().toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });

    elements.todayLabel.textContent = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });
  }

  function renderHistory() {
    const recent = [...state.sessions].slice(-8).reverse();

    if (!recent.length) {
      elements.history.innerHTML = `
        <div class="history-empty">
          <span>◷</span>
          <strong>Your progress starts here</strong>
          <p>Complete your first focus session to see it here.</p>
        </div>
      `;
      return;
    }

    elements.history.innerHTML = recent.map((session) => {
      const date = new Date(session.completedAt);
      const dateText = date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit"
      });

      const modeName = session.mode === "focus"
        ? "Focus session"
        : session.mode === "short"
          ? "Short break"
          : "Long break";

      const taskName = escapeHTML(session.task || modeName);
      const icon = session.mode === "focus" ? "◉" : "☕";

      return `
        <div class="history-row">
          <span class="history-dot">${icon}</span>
          <div class="history-details">
            <strong>${taskName}</strong>
            <small>${modeName} · ${dateText}</small>
          </div>
          <span class="history-duration">${session.minutes} min</span>
        </div>
      `;
    }).join("");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function renderAll() {
    renderTimer();
    renderTask();
    renderGoal();
    renderStats();
    renderHistory();
  }

  function stopTicker() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startTicker() {
    stopTicker();

    intervalId = setInterval(() => {
      if (!state.running || !state.endAt) return;

      state.remaining = Math.max(
        0,
        Math.ceil((state.endAt - Date.now()) / 1000)
      );

      if (state.remaining <= 0) {
        completeCurrentSession();
        return;
      }

      renderTimer();

      // Persist periodically so a refresh can restore the timer.
      saveState();
    }, 250);
  }

  function startTimer() {
    if (state.remaining <= 0) {
      state.remaining = modeDuration();
    }

    state.running = true;
    state.endAt = Date.now() + state.remaining * 1000;

    saveState();
    renderTimer();
    startTicker();
  }

  function pauseTimer() {
    if (state.endAt) {
      state.remaining = Math.max(
        0,
        Math.ceil((state.endAt - Date.now()) / 1000)
      );
    }

    state.running = false;
    state.endAt = null;

    stopTicker();
    saveState();
    renderTimer();
  }

  function resetTimer() {
    pauseTimer();
    state.remaining = modeDuration();

    saveState();
    renderTimer();
  }

  function switchMode(mode) {
    if (!["focus", "short", "long"].includes(mode)) return;

    pauseTimer();

    state.mode = mode;
    state.remaining = modeDuration(mode);

    saveState();
    renderAll();
  }

  function completeCurrentSession() {
    if (completedThisLoad) return;
    completedThisLoad = true;

    stopTicker();

    const completedMode = state.mode;
    const completedMinutes = state.durations[completedMode];

    state.running = false;
    state.endAt = null;
    state.remaining = 0;

    const now = new Date();

    state.sessions.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode: completedMode,
      minutes: completedMinutes,
      task: completedMode === "focus" ? state.task.trim() : "",
      date: todayKey(now),
      completedAt: now.toISOString()
    });

    if (completedMode === "focus") {
      const key = todayKey(now);
      if (!state.streakDates.includes(key)) {
        state.streakDates.push(key);
      }
    }

    // Keep the stored history from growing indefinitely.
    state.sessions = state.sessions.slice(-250);
    state.streakDates = [...new Set(state.streakDates)].slice(-400);

    saveState();

    if (completedMode === "focus") {
      const focusCount = getFocusSessionsToday().length;
      const nextMode = focusCount % 4 === 0 ? "long" : "short";

      notify(
        "Focus session complete!",
        `Great work! Your ${completedMinutes}-minute focus session is complete.`
      );

      state.mode = nextMode;
      state.remaining = modeDuration(nextMode);
    } else {
      notify(
        "Break complete!",
        "You're refreshed. Ready to focus again?"
      );

      state.mode = "focus";
      state.remaining = modeDuration("focus");
    }

    saveState();
    renderAll();
    completedThisLoad = false;
  }

  function notify(title, message) {
    if (typeof window.showToast === "function") {
      window.showToast(`${title} ${message}`);
    } else {
      elements.hint.textContent = `${title} ${message}`;
    }

    // Optional notification, only if the user has already granted permission.
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body: message });
      } catch (_) {
        // The in-page message is sufficient if notifications are unavailable.
      }
    }
  }

  function saveDurations() {
    const values = {
      focus: Number(elements.focusDuration.value),
      short: Number(elements.shortDuration.value),
      long: Number(elements.longDuration.value)
    };

    const limits = {
      focus: 180,
      short: 60,
      long: 90
    };

    for (const mode of ["focus", "short", "long"]) {
      if (
        !Number.isFinite(values[mode]) ||
        values[mode] < 1 ||
        values[mode] > limits[mode]
      ) {
        notify(
          "Check your durations.",
          `Choose a ${mode} duration from 1 to ${limits[mode]} minutes.`
        );
        return;
      }
    }

    // Don't alter a running countdown unexpectedly.
    if (state.running) {
      notify("Timer is running.", "Pause it before changing durations.");
      return;
    }

    state.durations = {
      focus: Math.floor(values.focus),
      short: Math.floor(values.short),
      long: Math.floor(values.long)
    };

    state.remaining = modeDuration();

    saveState();
    renderTimer();
    notify("Durations saved.", "Your new timer settings are ready.");
  }

  function bindEvents() {
    elements.startPause.addEventListener("click", () => {
      if (state.running) {
        pauseTimer();
      } else {
        startTimer();
      }
    });

    elements.reset.addEventListener("click", resetTimer);

    document.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        switchMode(button.dataset.mode);
      });
    });

    elements.task.addEventListener("input", () => {
      state.task = elements.task.value;
      elements.taskPreview.textContent = state.task.trim()
        || "Choose a task to begin";
      saveState();
    });

    elements.saveDurations.addEventListener("click", saveDurations);

    elements.dailyGoal.addEventListener("change", () => {
      state.dailyGoal = Number(elements.dailyGoal.value);
      saveState();
      renderGoal();
    });

    elements.clearHistory.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Clear all saved Focus Room session history and streak data? This cannot be undone."
      );

      if (!confirmed) return;

      state.sessions = [];
      state.streakDates = [];

      saveState();
      renderAll();
      notify("History cleared.", "You can start building new progress.");
    });

    // If the browser tab becomes visible again, sync with the real deadline.
    document.addEventListener("visibilitychange", () => {
      if (state.running && state.endAt) {
        state.remaining = Math.max(
          0,
          Math.ceil((state.endAt - Date.now()) / 1000)
        );

        if (state.remaining <= 0) {
          completeCurrentSession();
        } else {
          renderTimer();
          saveState();
        }
      }
    });

    // Persist the active timer when the page is being left.
    window.addEventListener("pagehide", saveState);
  }

  function init() {
    elements.focusDuration.value = state.durations.focus;
    elements.shortDuration.value = state.durations.short;
    elements.longDuration.value = state.durations.long;
    elements.dailyGoal.value = String(state.dailyGoal);

    // Restore a running timer from its deadline.
    if (state.running && state.endAt) {
      state.remaining = Math.max(
        0,
        Math.ceil((state.endAt - Date.now()) / 1000)
      );

      if (state.remaining <= 0) {
        state.running = false;
        state.endAt = null;
        state.remaining = 0;

        // Finish the expired session only once.
        completeCurrentSession();
      }
    }

    bindEvents();
    renderAll();

    if (state.running && state.endAt) {
      startTicker();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
