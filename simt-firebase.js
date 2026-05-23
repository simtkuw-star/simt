const config = window.SIMT_FIREBASE_CONFIG || {};
const requiredConfig = ["apiKey", "authDomain", "databaseURL", "projectId", "appId"];
const isConfigured = requiredConfig.every(function (key) {
  return config[key] && !String(config[key]).includes("PUT_");
});

const displayNameInput = document.getElementById("studentDisplayName");
const emailInput = document.getElementById("loginName");
const passwordInput = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const forgotButton = document.getElementById("forgotButton");
const authMessage = document.getElementById("authMessage");
const logoutButton = document.getElementById("logoutButton");
const accountStatus = document.getElementById("accountStatus");

function showAuthMessage(message) {
  if (authMessage) {
    authMessage.textContent = message;
  }
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function markFirebaseMode() {
  if (loginButton) {
    loginButton.textContent = "دخول  /  تسجيل";
  }
  if (forgotButton) {
    forgotButton.textContent = "نسيت كلمة المرور؟";
  }
}

function setLoggedInUi(user) {
  if (logoutButton) logoutButton.hidden = false;
  if (loginButton) loginButton.textContent = "تحديث الدخول";
  if (accountStatus) accountStatus.textContent = `الحساب النشط: ${user.email}`;
}

function setLoggedOutUi() {
  if (logoutButton) logoutButton.hidden = true;
  if (loginButton) loginButton.textContent = "دخول  /  تسجيل";
  if (accountStatus) accountStatus.textContent = "لم يتم تسجيل الدخول بعد.";
}

if (isConfigured && loginButton && emailInput && passwordInput) {
  markFirebaseMode();

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js");
  const {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
  } = await import("https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js");
  const {
    get,
    getDatabase,
    increment,
    ref,
    serverTimestamp,
    set,
    update
  } = await import("https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js");

  const app = initializeApp(config);
  const auth = getAuth(app);
  auth.languageCode = "ar";
  const database = getDatabase(app);
  const writingBox = document.getElementById("writingBox");
  const rubricSelects = Array.from(document.querySelectorAll("#teacherRubric select"));
  const words = document.getElementById("words");
  const chars = document.getElementById("chars");
  const level = document.getElementById("level");
  let activeUser = null;
  let activeUid = "";
  let isLoadingStudentWork = false;
  let hasLoadedStudentWork = false;
  let saveTimer = null;

  async function saveStudentProfile(user, displayName) {
    const emailName = user.email ? user.email.split("@")[0] : "";
    const name = displayName || user.displayName || emailName || "طالبة سِمْط";
    if (displayName && user.displayName !== displayName) {
      await updateProfile(user, { displayName });
    }
    await update(ref(database, `students/${user.uid}/profile`), {
      name,
      email: user.email,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async function recordSiteLogin(user) {
    await update(ref(database, "siteStats"), {
      totalLogins: increment(1),
      lastLoginAt: serverTimestamp(),
      [`lastStudents/${user.uid}`]: {
        email: user.email,
        name: user.displayName || "طالبة سِمْط",
        at: serverTimestamp()
      }
    });
  }

  function countWords(text) {
    const trimmed = text.trim();
    return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  }

  function getRubricLevel(total) {
    if (total >= 22) return "صانعة أثر";
    if (total >= 17) return "لؤلؤة سِمْط";
    if (total >= 11) return "ناسجة أفكار";
    return "كاتبة مبتدئة";
  }

  function collectRubricScores() {
    return rubricSelects.reduce(function (scores, field) {
      scores[field.dataset.rubric] = Number(field.value || 0);
      return scores;
    }, {});
  }

  function rubricTotal(scores) {
    return Object.values(scores).reduce(function (sum, value) {
      return sum + Number(value || 0);
    }, 0);
  }

  function isTeacherUnlocked() {
    return window.SIMT_TEACHER_UNLOCKED === true;
  }

  function refreshBasicEditorStats() {
    if (!writingBox || !words || !chars || !level) return;
    const text = writingBox.value || "";
    const totalWords = countWords(text);
    const scores = collectRubricScores();
    const total = rubricTotal(scores);
    words.textContent = totalWords;
    chars.textContent = text.trim().length;
    if (window.SIMT_HAS_TEACHER_EVALUATION || isTeacherUnlocked()) {
      level.textContent = getRubricLevel(total);
    } else {
      level.textContent = "بانتظار تقييم المعلمة";
    }
  }

  function resetStudentWorkspace() {
    if (writingBox) {
      writingBox.value = "";
    }
    localStorage.removeItem("simtDraft");
    rubricSelects.forEach(function (field) {
      field.value = "3";
    });
    rubricSelects[0]?.dispatchEvent(new Event("change", { bubbles: true }));
    writingBox?.dispatchEvent(new Event("input", { bubbles: true }));
    refreshBasicEditorStats();
  }

  function saveStudentWorkSoon() {
    if (!activeUser || isLoadingStudentWork || !hasLoadedStudentWork) return;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveStudentWork, 700);
  }

  async function saveStudentWork() {
    if (!activeUser || isLoadingStudentWork || !hasLoadedStudentWork) return;
    const payload = {
      draft: writingBox ? writingBox.value : "",
      updatedAt: serverTimestamp()
    };

    if (isTeacherUnlocked()) {
      const scores = collectRubricScores();
      payload.rubric = scores;
      payload.rubricTotal = rubricTotal(scores);
      payload.rubricLevel = getRubricLevel(rubricTotal(scores));
      payload.evaluatedAt = serverTimestamp();
    }

    await update(ref(database, `students/${activeUser.uid}/work`), payload);
    if (isTeacherUnlocked()) {
      window.dispatchEvent(new CustomEvent("simtRubricSaveStatus", {
        detail: { message: `تم حفظ تقييم: ${activeUser.email}` }
      }));
    }
  }

  async function loadStudentWork(user) {
    isLoadingStudentWork = true;
    hasLoadedStudentWork = false;
    try {
      resetStudentWorkspace();
      const snapshot = await get(ref(database, `students/${user.uid}/work`));
      const work = snapshot.val();
      if (writingBox) {
        if (work && typeof work.draft === "string") {
          writingBox.value = work.draft;
          localStorage.setItem("simtDraft", work.draft);
        } else {
          writingBox.value = "";
          localStorage.removeItem("simtDraft");
        }
      }
      if (rubricSelects.length) {
        const hasSavedRubric = Boolean(work && work.rubric);
        rubricSelects.forEach(function (field) {
          const savedValue = work && work.rubric ? work.rubric[field.dataset.rubric] : "";
          if (savedValue) {
            field.value = String(savedValue);
          } else {
            field.value = "3";
          }
        });
        window.dispatchEvent(new CustomEvent(hasSavedRubric ? "simtRubricLoaded" : "simtRubricPending"));
      }
      writingBox?.dispatchEvent(new Event("input", { bubbles: true }));
      refreshBasicEditorStats();
    } finally {
      hasLoadedStudentWork = true;
      isLoadingStudentWork = false;
    }
  }

  function formatDateValue(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  async function loadTeacherDashboard() {
    if (!activeUser) {
      window.dispatchEvent(new CustomEvent("simtDashboardStatus", {
        detail: { message: "سجلي دخول حساب المعلمة أولًا." }
      }));
      return;
    }

    try {
      const snapshot = await get(ref(database, "students"));
      const data = snapshot.val() || {};
      const students = Object.entries(data).map(function ([uid, item]) {
        const profile = item.profile || {};
        const work = item.work || {};
        const fallbackEmail = profile.email || item.email || "-";
        const fallbackName = fallbackEmail && fallbackEmail !== "-" ? fallbackEmail.split("@")[0] : "طالبة بدون اسم";
        const score = typeof work.rubricTotal === "number" ? `${work.rubricTotal} / 25` : "لم يتم التقييم";
        return {
          uid,
          name: profile.name || item.name || fallbackName,
          email: fallbackEmail,
          level: work.rubricLevel || "بانتظار تقييم المعلمة",
          score,
          updated: formatDateValue(work.evaluatedAt || work.updatedAt || profile.updatedAt)
        };
      }).sort(function (a, b) {
        return a.email.localeCompare(b.email, "ar");
      });

      window.dispatchEvent(new CustomEvent("simtDashboardData", {
        detail: { students }
      }));
      window.dispatchEvent(new CustomEvent("simtDashboardStatus", {
        detail: { message: "تم تحديث لوحة المعلمة." }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent("simtDashboardStatus", {
        detail: { message: "لا يمكن قراءة كل الطالبات بعد. أضيفي حساب المعلمة في Firebase Rules." }
      }));
    }
  }

  async function handleFirebaseLogin(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const name = displayNameInput ? displayNameInput.value.trim() : "";
    const email = normalizeEmail(emailInput.value);
    const password = passwordInput.value;

    if (!email || !password) {
      showAuthMessage("اكتبي البريد الإلكتروني وكلمة المرور.");
      return;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await saveStudentProfile(credential.user, name);
      await recordSiteLogin(credential.user);
      showAuthMessage(`مرحبًا ${credential.user.displayName || name || "طالبة سِمْط"}، تم تسجيل الدخول.`);
    } catch (error) {
      if (error.code !== "auth/user-not-found" && error.code !== "auth/invalid-credential") {
        showAuthMessage(firebaseArabicError(error.code));
        return;
      }

      if (!name) {
        showAuthMessage("لإنشاء حساب جديد اكتبي اسم الطالبة أيضًا.");
        return;
      }

      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        await saveStudentProfile(credential.user, name);
        await recordSiteLogin(credential.user);
        showAuthMessage("تم إنشاء الحساب وحفظ اسم الطالبة في Firebase.");
      } catch (createError) {
        showAuthMessage(firebaseArabicError(createError.code));
      }
    }
  }

  async function handleFirebaseReset(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const email = normalizeEmail(emailInput.value);
    if (!email) {
      showAuthMessage("اكتبي البريد الإلكتروني أولًا ثم اضغطي نسيت كلمة المرور.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: "https://simtkuw.com/"
      });
      showAuthMessage("تم إرسال رابط تغيير كلمة المرور إلى البريد الإلكتروني.");
    } catch (error) {
      showAuthMessage(firebaseArabicError(error.code));
    }
  }

  function firebaseArabicError(code) {
    const messages = {
      "auth/email-already-in-use": "هذا البريد مسجل من قبل. جربي الدخول أو استعادة كلمة المرور.",
      "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
      "auth/invalid-credential": "البريد أو كلمة المرور غير صحيحة.",
      "auth/missing-password": "اكتبي كلمة المرور.",
      "auth/too-many-requests": "محاولات كثيرة. انتظري قليلًا ثم جربي مرة ثانية.",
      "auth/weak-password": "كلمة المرور لازم تكون 6 أحرف أو أكثر.",
      "auth/user-not-found": "لا يوجد حساب بهذا البريد."
    };
    return messages[code] || "تعذر تنفيذ العملية الآن. تأكدي من إعداد Firebase.";
  }

  loginButton.addEventListener("click", handleFirebaseLogin, true);
  forgotButton?.addEventListener("click", handleFirebaseReset, true);
  passwordInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleFirebaseLogin(event);
    }
  }, true);

  logoutButton?.addEventListener("click", function () {
    signOut(auth);
    showAuthMessage("تم تسجيل الخروج.");
  }, true);

  onAuthStateChanged(auth, function (user) {
    if (user) {
      if (activeUid && activeUid !== user.uid) {
        resetStudentWorkspace();
      }
      window.dispatchEvent(new CustomEvent("simtTeacherForceLock"));
      activeUser = user;
      activeUid = user.uid;
      window.dispatchEvent(new CustomEvent("simtStudentContext", {
        detail: { uid: user.uid, email: user.email, name: user.displayName || "" }
      }));
      setLoggedInUi(user);
      localStorage.setItem("simtLoggedIn", "true");
      localStorage.setItem("simtLoggedInName", user.displayName || user.email || "طالبة سِمْط");
      loadStudentWork(user);
    } else {
      activeUser = null;
      activeUid = "";
      hasLoadedStudentWork = false;
      setLoggedOutUi();
      window.dispatchEvent(new CustomEvent("simtStudentContext", { detail: {} }));
      window.dispatchEvent(new CustomEvent("simtTeacherForceLock"));
      resetStudentWorkspace();
    }
  });

  writingBox?.addEventListener("input", saveStudentWorkSoon);
  rubricSelects.forEach(function (field) {
    field.addEventListener("change", saveStudentWorkSoon);
  });
  window.addEventListener("simtTeacherRubricUpdated", saveStudentWorkSoon);
  window.addEventListener("simtSaveTeacherRubric", async function () {
    if (!activeUser) {
      window.dispatchEvent(new CustomEvent("simtRubricSaveStatus", {
        detail: { message: "سجلي دخول الطالبة أولًا." }
      }));
      return;
    }
    if (!isTeacherUnlocked()) {
      window.dispatchEvent(new CustomEvent("simtRubricSaveStatus", {
        detail: { message: "افتحي التقييم برمز المعلمة أولًا." }
      }));
      return;
    }
    await saveStudentWork();
  });
  window.addEventListener("simtLoadTeacherDashboard", loadTeacherDashboard);
} else {
  showAuthMessage("Firebase غير مربوط بعد. الموقع يعمل حاليًا بوضع تجريبي محلي.");
}
