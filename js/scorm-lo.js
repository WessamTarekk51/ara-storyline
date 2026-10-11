window.ScormService = (function () {
  const scorm = pipwerks.SCORM;
  scorm.version = "1.2";

  let connected = false;
  let startTime = new Date();
  let bestScore = 0;
  let persistedStatus = {
    lessonStatus: "unknown",
    completionStatus: "unknown",
    successStatus: "unknown",
    hasFinalStatus: false,
  };

  function isScormCloudEnvironment() {
    return window.location.hostname.includes("cloud.scorm");
  }

  function debugLog(...args) {
    if (!isScormCloudEnvironment()) {
      console.debug(...args);
    }
  }

  function findAPIInWindow(win) {
    let attempts = 0;

    while (win && attempts < 500) {
      try {
        if (win.API) {
          debugLog("SCORM API found in window", win);
          return win.API;
        }
        if (win.API_1484_11) {
          debugLog("SCORM 2004 API found in window", win);
          return win.API_1484_11;
        }
      } catch (_) {
        // cross-domain or inaccessible parent/window
      }

      const next = win.parent && win.parent !== win ? win.parent : null;
      if (!next) break;

      win = next;
      attempts += 1;
    }

    return null;
  }

  function findAPI(win) {
    const api = findAPIInWindow(win);
    if (api) return api;

    try {
      if (window.top && window.top !== win) {
        const topApi = findAPIInWindow(window.top);
        if (topApi) {
          debugLog("SCORM API found in top window");
          return topApi;
        }
      }
    } catch (_) {}

    try {
      if (window.opener) {
        const openerApi = findAPIInWindow(window.opener);
        if (openerApi) {
          debugLog("SCORM API found in opener window");
          return openerApi;
        }
      }
    } catch (_) {}

    return null;
  }

  function normalizeScore(score) {
    const normalizedScore = Number(score);

    if (!Number.isFinite(normalizedScore)) {
      return null;
    }

    const clampedScore = Math.max(0, Math.min(100, normalizedScore));
    return Number(clampedScore.toFixed(1));
  }

  function recoverAlreadyActiveSession(api) {
    // A failed LMSInitialize on a reload does not necessarily mean the
    // connection is broken: SCORM 1.2 requires an intervening LMSFinish
    // before a second LMSInitialize can succeed, so a still-live parent-frame
    // LMS session (e.g. after an iframe location.reload()) correctly rejects
    // the re-init while remaining fully readable. pipwerks.data.get() refuses
    // reads until connection.isActive is set, so probe the raw API directly
    // and trust LMSGetLastError() (vendor-agnostic "0 = no error") instead of
    // any single vendor's specific "already initialized" error code, so a
    // genuine connection failure is still correctly left disconnected.
    try {
      api.LMSGetValue("cmi.core.score.raw");
      const errorCode = scorm.debug.getCode();

      if (errorCode !== 0) {
        console.warn(
          "ScormService: LMSInitialize failed and no active session was found (error " +
            errorCode +
            ").",
        );
        return false;
      }

      scorm.connection.isActive = true;
      return true;
    } catch (e) {
      console.warn("ScormService: active-session probe failed.", e);
      return false;
    }
  }

  function updateBestScore(score) {
    const currentScore = normalizeScore(score);

    if (currentScore === null) return false;

    if (currentScore > bestScore) {
      bestScore = currentScore;
      return true;
    }

    return false;
  }

  function mapLessonStatusToRuntime(status) {
    switch (status) {
      case "passed":
        return {
          completionStatus: "completed",
          successStatus: "passed",
          hasFinalStatus: true,
        };
      case "failed":
        return {
          completionStatus: "incomplete",
          successStatus: "failed",
          hasFinalStatus: true,
        };
      case "completed":
        return {
          completionStatus: "completed",
          successStatus: "unknown",
          hasFinalStatus: true,
        };
      case "incomplete":
        return {
          completionStatus: "incomplete",
          successStatus: "unknown",
          hasFinalStatus: true,
        };
      default:
        // Covers "not attempted", "unknown", "", "browsed", and any
        // other/missing value: no meaningful previously finalized status.
        return {
          completionStatus: "unknown",
          successStatus: "unknown",
          hasFinalStatus: false,
        };
    }
  }

  return {
    init() {
      try {
        const api = findAPI(window);
        if (!api) {
          // console.warn("ScormService could not locate the SCORM API.");
          return false;
        }

        scorm.API.handle = api;
        scorm.API.isFound = true;

        connected = scorm.init();

        if (!connected) {
          connected = recoverAlreadyActiveSession(api);
        }

        if (connected) {
          const savedScore = normalizeScore(scorm.get("cmi.core.score.raw"));

          if (savedScore !== null) {
            bestScore = savedScore;
          }

          const status = scorm.get("cmi.core.lesson_status");
          const entry = scorm.get("cmi.core.entry");
          const isFirstEntry = entry === "ab-initio";
          // "ab-initio" is the SCORM-standard signal that this registration
          // has never been initialized before. Some LMSs (e.g. SCORM Cloud)
          // default a brand-new attempt's lesson_status straight to
          // "incomplete" rather than "not attempted", which is otherwise
          // indistinguishable from a resumed attempt that this runtime's own
          // bootstrap write previously set to "incomplete". Only cmi.core.entry
          // can disambiguate the two, so a first entry always forces the
          // fully-unknown state regardless of the raw lesson_status value.
          const mappedStatus = isFirstEntry
            ? { completionStatus: "unknown", successStatus: "unknown", hasFinalStatus: false }
            : mapLessonStatusToRuntime(status);
          persistedStatus = {
            lessonStatus: status || "unknown",
            completionStatus: mappedStatus.completionStatus,
            successStatus: mappedStatus.successStatus,
            hasFinalStatus: mappedStatus.hasFinalStatus,
          };

          if (
            status === "not attempted" ||
            status === "" ||
            status === "unknown"
          ) {
            scorm.set("cmi.core.lesson_status", "incomplete");
            scorm.save();
          }
        }

        return connected;
      } catch (e) {
        console.error(e);
        return false;
      }
    },

    updateScore(score) {
      if (!connected) return false;

      updateBestScore(score);

      scorm.set("cmi.core.score.raw", String(bestScore));
      scorm.set("cmi.core.score.min", "0");
      scorm.set("cmi.core.score.max", "100");

      return scorm.save();
    },

    reportResult(score) {
      if (!connected) return;

      updateBestScore(score);

      const diffMs = new Date() - startTime;
      const totalSeconds = Math.floor(diffMs / 1000);
      const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
        2,
        "0",
      );
      const ss = String(totalSeconds % 60).padStart(2, "0");

      scorm.set("cmi.core.score.raw", String(bestScore));
      scorm.set("cmi.core.score.min", "0");
      scorm.set("cmi.core.score.max", "100");
      scorm.set("cmi.core.lesson_status", bestScore >= 50 ? "passed" : "failed");
      scorm.set("cmi.core.session_time", `${hh}:${mm}:${ss}`);

      scorm.save();
    },
completeSession() {
  if (!connected) {
    console.warn("Complete session skipped: SCORM is not connected.");
    return false;
  }

  try {
    const committed = scorm.save();

    if (!committed) {
      console.warn("SCORM save returned false before session end.");
    }

    const message = {
      type: "SCORM_MVP_SESSION_END",
      reason: "final-feedback",
    };

    window.top.postMessage(message, window.location.origin);

    return true;
  } catch (error) {
    console.error("Failed to end SCORM MVP session:", error);
    return false;
  }
},
    finish() {
      if (!connected) return;

      try {
        scorm.save();
        scorm.quit();
      } catch (e) {
        console.error(e);
      }
    },

    isConnected() {
      return connected;
    },

    getBestScore() {
      return bestScore;
    },

    getPersistedStatus() {
      return { ...persistedStatus };
    },
  };
})();
