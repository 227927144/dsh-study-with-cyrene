window.__ModuleLoader__.load({
  id: 'dsh-study-with-cyrene',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const { createElement: h, useEffect, useRef, useState } = require('react')

    const TAB_ID = 'dsh-study-with-cyrene:panel'
    const TAB_ID_PKG = 'dsh-study-with-cyrene'
    const TAB_ORDER = 70
    const API_BASE = '/study-with-cyrene/api'
    const POLL_MS = 3000

    const strings = {
      title: 'StudyWithCyrene',
      brand: 'StudyWithCyrene',
      subtitle: '昔涟陪你学习'
    }

    const STYLES = `
      .swc-root { display:flex; flex-direction:column; gap:10px; padding:8px 6px 18px;
        font:var(--dsw-font-s-14); color:var(--dsw-alias-label-primary); height:100%;
        overflow-y:auto; box-sizing:border-box; }
      .swc-stack { display:flex; flex-direction:column; gap:10px; }
      .swc-head { display:flex; align-items:baseline; justify-content:space-between; gap:8px; padding:2px 2px 0; }
      .swc-brand { font:var(--dsw-font-s-strong-14); letter-spacing:.4px; }
      .swc-sub { font:var(--dsw-font-xxxs-11); color:var(--dsw-alias-label-tertiary); }
      .swc-card { border:1px solid var(--dsw-alias-border-l1); border-radius:12px; padding:12px;
        background:color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent); display:flex;
        flex-direction:column; gap:8px; }
      .swc-quote { color:var(--dsw-alias-accent); font-size:14px; line-height:1.75; }
      .swc-muted { color:var(--dsw-alias-label-secondary); font-size:12px; line-height:1.6; }
      .swc-hint { color:var(--dsw-alias-label-tertiary); font-size:11px; line-height:1.65; }
      .swc-eyebrow { color:var(--dsw-alias-label-secondary); font:var(--dsw-font-xxxs-11);
        letter-spacing:.6px; text-transform:uppercase; }
      .swc-error { border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent);
        background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
        color:var(--dsw-alias-state-error-primary); border-radius:10px; padding:7px 9px;
        font-size:12px; line-height:1.6; display:flex; gap:8px; align-items:flex-start; }
      .swc-error-text { flex:1; min-width:0; white-space:pre-wrap; word-break:break-word; }
      .swc-x { border:0; background:transparent; color:inherit; cursor:pointer; font-size:14px; padding:0 2px; }
      .swc-loading { color:var(--dsw-alias-label-tertiary); font-size:12px; padding:12px 4px; }
      .swc-domain { display:flex; gap:6px; align-items:center; }
      .swc-input { flex:1; min-width:0; box-sizing:border-box; padding:7px 9px; border-radius:8px;
        border:1px solid var(--dsw-alias-border-l1); background:transparent; color:inherit;
        font:var(--dsw-font-s-14); outline:none; }
      .swc-input:focus { border-color:var(--dsw-alias-accent); }
      .swc-btn { border:1px solid var(--dsw-alias-border-l1); border-radius:8px; padding:7px 11px;
        background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary);
        font:var(--dsw-font-xxs-12); cursor:pointer; white-space:nowrap; }
      .swc-btn:hover:not(:disabled) { border-color:color-mix(in srgb, var(--dsw-alias-accent) 45%, var(--dsw-alias-border-l1)); }
      .swc-btn:disabled { opacity:.45; cursor:default; }
      .swc-btn-primary { background:#C94F7C; border-color:#C94F7C; color:#fff; font-weight:600;
        box-shadow:0 2px 10px rgba(201,79,124,.28); }
      .swc-btn-primary:hover:not(:disabled) { background:#B3426B; border-color:#B3426B; }
      .swc-start-btn { background:#A9D6F5; border-color:#7FB8E6; color:#123247; font-weight:600;
        min-width:96px; padding:8px 12px; box-shadow:0 2px 10px rgba(83,160,220,.28); }
      .swc-start-btn:hover:not(:disabled) { background:#8CC8F0; border-color:#6FAEDC; }
      .swc-btn-danger { color:var(--dsw-alias-state-error-primary); }
      .swc-actions { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
      .swc-active-head { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
      .swc-domain-label { font:var(--dsw-font-s-strong-14); overflow-wrap:anywhere; }
      .swc-timer { font-size:28px; font-weight:600; letter-spacing:.5px; line-height:1.2;
        font-variant-numeric:tabular-nums; }
      .swc-pill { display:inline-flex; align-items:center; gap:4px; border-radius:999px;
        padding:3px 8px; font-size:11px; white-space:nowrap; border:1px solid transparent; }
      .swc-pill-study { color:var(--dsw-alias-state-success-primary);
        background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent); }
      .swc-pill-alert { color:var(--dsw-alias-state-error-primary);
        background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent); }
      .swc-pill-break { color:var(--dsw-alias-state-warn-primary);
        background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent); }
      .swc-pill-paper { color:var(--dsw-alias-accent);
        background:color-mix(in srgb, var(--dsw-alias-accent) 12%, transparent); }
      .swc-pill-idle { color:var(--dsw-alias-label-secondary);
        background:color-mix(in srgb, var(--dsw-alias-label-secondary) 10%, transparent); }
      .swc-tabs { display:flex; gap:4px; padding:3px; border:1px solid var(--dsw-alias-border-l1);
        border-radius:10px; background:color-mix(in srgb, var(--dsw-alias-label-primary) 2%, transparent); }
      .swc-tab { flex:1; border:0; border-radius:7px; padding:6px 4px; background:transparent;
        color:var(--dsw-alias-label-secondary); font:var(--dsw-font-xxs-12); cursor:pointer; }
      .swc-tab.active { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); }
      .swc-tabs-small { margin-bottom:2px; }
      .swc-stats-grid { display:flex; gap:8px; }
      .swc-stat-avg { margin-top:8px; }
      .swc-stat { flex:1; min-width:0; border:1px solid var(--dsw-alias-border-l1); border-radius:10px;
        padding:9px 10px; display:flex; flex-direction:column; gap:3px; }
      .swc-stat-value { font-size:18px; font-weight:600; font-variant-numeric:tabular-nums; }
      .swc-stat-label { color:var(--dsw-alias-label-tertiary); font-size:11px; }
      .swc-big { font-size:24px; font-weight:600; letter-spacing:.3px; font-variant-numeric:tabular-nums; }
      .swc-bars { display:flex; gap:2px; align-items:flex-end; height:64px; padding:2px 0 0; }
      .swc-bar { flex:1; min-width:2px; background:var(--dsw-alias-accent); border-radius:3px 3px 0 0;
        min-height:2px; opacity:.82; }
      .swc-bar:hover { opacity:1; }
      .swc-bar-axis { display:flex; justify-content:space-between; color:var(--dsw-alias-label-tertiary);
        font-size:10px; }
      .swc-summary { white-space:pre-wrap; line-height:1.75; font-size:13px; overflow-wrap:anywhere; }
      .swc-question { border-top:1px solid var(--dsw-alias-border-l1); padding:7px 0 2px; }
      .swc-question:first-of-type { border-top:0; }
      .swc-question summary { cursor:pointer; font-size:12px; line-height:1.65; }
      .swc-answer { color:var(--dsw-alias-label-secondary); font-size:12px; line-height:1.7;
        padding:6px 0 2px 12px; white-space:pre-wrap; }
      .swc-textarea { width:100%; box-sizing:border-box; min-height:64px; resize:vertical;
        padding:7px 9px; border-radius:8px; border:1px solid var(--dsw-alias-border-l1);
        background:transparent; color:inherit; font:var(--dsw-font-xxs-12); outline:none; }
      .swc-textarea:focus { border-color:var(--dsw-alias-accent); }
      .swc-field { display:flex; flex-direction:column; gap:4px; }
      .swc-field-label { color:var(--dsw-alias-label-secondary); font-size:12px; }
      .swc-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      .swc-num { width:70px; box-sizing:border-box; padding:6px 8px; border-radius:8px;
        border:1px solid var(--dsw-alias-border-l1); background:transparent; color:inherit;
        font:var(--dsw-font-xxs-12); outline:none; }
      .swc-num:focus { border-color:var(--dsw-alias-accent); }
      .swc-check { display:flex; align-items:flex-start; gap:7px; font-size:12px; line-height:1.6; }
      .swc-check input { margin:2px 0 0; accent-color:var(--dsw-alias-accent); }
      .swc-keywords { display:flex; flex-wrap:wrap; gap:4px; max-height:150px; overflow-y:auto; padding-top:6px; }
      .swc-tag { border:1px solid var(--dsw-alias-border-l1); border-radius:6px; padding:2px 6px;
        font-size:11px; color:var(--dsw-alias-label-secondary); }
      .swc-details { border-top:1px solid var(--dsw-alias-border-l1); padding-top:8px; }
      .swc-details summary { cursor:pointer; color:var(--dsw-alias-label-secondary); font-size:12px; }
      .swc-praise { border:1px solid color-mix(in srgb, var(--dsw-alias-accent) 40%, var(--dsw-alias-border-l1));
        border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px;
        background:color-mix(in srgb, var(--dsw-alias-accent) 8%, transparent); }
      .swc-week-sessions { display:flex; flex-direction:column; gap:6px; }
      .swc-week-session { border-top:1px solid var(--dsw-alias-border-l1); padding-top:6px;
        display:flex; flex-direction:column; gap:4px; }
      .swc-week-session:first-child { border-top:0; padding-top:0; }
      .swc-week-session-head { display:flex; justify-content:space-between; gap:8px; align-items:baseline; }
      .swc-week-domain { font-size:12px; font-weight:600; overflow-wrap:anywhere; }
      .swc-summary-small { color:var(--dsw-alias-label-secondary); font-size:11px; line-height:1.65;
        white-space:pre-wrap; overflow-wrap:anywhere; }
      .swc-report { border-color:color-mix(in srgb, var(--dsw-alias-accent) 38%, var(--dsw-alias-border-l1)); }
      .swc-mini { display:flex; gap:10px; flex-wrap:wrap; color:var(--dsw-alias-label-tertiary); font-size:11px; }
      .swc-busy { color:var(--dsw-alias-accent); font-size:11px; }
    `

    function formatDuration(ms) {
      const total = Math.max(0, Math.round(Number(ms || 0) / 1000))
      const hours = Math.floor(total / 3600)
      const minutes = Math.floor((total % 3600) / 60)
      const seconds = total % 60
      if (hours > 0) return `${hours} 小时 ${minutes} 分`
      if (minutes > 0) return `${minutes} 分 ${seconds} 秒`
      return `${seconds} 秒`
    }

    function formatClock(timestamp) {
      try {
        return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } catch {
        return '--:--'
      }
    }

    function formatDate(timestamp) {
      try {
        return new Date(timestamp).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      } catch {
        return '--'
      }
    }

    function formatDateTime(timestamp) {
      try {
        const date = new Date(timestamp)
        const pad = (value) => String(value).padStart(2, '0')
        return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
      } catch {
        return '--'
      }
    }

    function statusLabel(status) {
      if (status === 'alert') return '昔涟在等你'
      if (status === 'break') return '休息中'
      if (status === 'paper') return '纸质书时间'
      if (status === 'study') return '学习中'
      return '暂时没看到证据'
    }

    function statusClass(status) {
      if (status === 'alert' || status === 'break' || status === 'paper' || status === 'study') return `swc-pill-${status}`
      return 'swc-pill-idle'
    }

    async function api(path, options = {}) {
      const response = await fetch(API_BASE + path, {
        credentials: 'same-origin',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Study-With-Cyrene': '1',
          ...(options.headers || {})
        }
      })
      const data = await response.json().catch(() => null)
      if (!data || data.ok !== true) {
        const message = data?.error?.message || `HTTP ${response.status}`
        throw new Error(message)
      }
      return data.value
    }

    function StudyView(props) {
      const visible = props.visible !== false
      const [state, setState] = useState(null)
      const [draft, setDraft] = useState(null)
      const [tab, setTab] = useState('stats')
      const [domain, setDomain] = useState('')
      const [busy, setBusy] = useState('')
      const [error, setError] = useState('')
      const [summary, setSummary] = useState(null)
      const [questions, setQuestions] = useState(null)
      const [needNote, setNeedNote] = useState(false)
      const [note, setNote] = useState('')
      const [report, setReport] = useState(null)
      const [statsRange, setStatsRange] = useState('week')
      const [stats, setStats] = useState(null)
      const [weekly, setWeekly] = useState(null)
      const [now, setNow] = useState(Date.now())
      const [loadedAt, setLoadedAt] = useState(Date.now())
      const domainTouchedRef = useRef(false)

      async function load() {
        try {
          const next = await api('/state')
          setState(next)
          setLoadedAt(Date.now())
          setDraft((previous) => previous ?? next.settings)
          if (!domainTouchedRef.current) {
            setDomain((previous) => previous || next.lastDomain || '')
          }
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      }

      useEffect(() => {
        if (!visible) return undefined
        void load()
        const timer = setInterval(() => {
          void load()
        }, POLL_MS)
        return () => clearInterval(timer)
      }, [visible])

      useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
      }, [])

      useEffect(() => {
        if (!visible || tab !== 'stats') return undefined
        let cancelled = false
        void api(`/stats?range=${statsRange}`)
          .then((value) => {
            if (!cancelled) setStats(value)
          })
          .catch((statsError) => {
            if (!cancelled) setError(statsError instanceof Error ? statsError.message : String(statsError))
          })
        return () => {
          cancelled = true
        }
      }, [visible, tab, statsRange])

      useEffect(() => {
        if (!visible || tab !== 'weekly') return undefined
        let cancelled = false
        void api('/weekly')
          .then((value) => {
            if (!cancelled) setWeekly(value)
          })
          .catch((weeklyError) => {
            if (!cancelled) setError(weeklyError instanceof Error ? weeklyError.message : String(weeklyError))
          })
        return () => {
          cancelled = true
        }
      }, [visible, tab, state?.active?.id])

      async function run(key, action) {
        if (busy) return
        setBusy(key)
        setError('')
        try {
          await action()
        } catch (actionError) {
          setError(actionError instanceof Error ? actionError.message : String(actionError))
        } finally {
          setBusy('')
        }
      }

      function startSession() {
        const value = domain.trim()
        if (!value) {
          setError('先写一个领域呀，比如「深度学习」。')
          return
        }
        void run('start', async () => {
          const next = await api('/start', { method: 'POST', body: JSON.stringify({ domain: value }) })
          setState(next)
          setReport(null)
          setSummary(null)
          setQuestions(null)
          setNeedNote(false)
          setNote('')
          setTab('study')
        })
      }

      function endSession() {
        void run('end', async () => {
          const value = await api('/end', { method: 'POST' })
          setReport(value)
          setSummary(null)
          setQuestions(null)
          setNeedNote(false)
          setState((previous) => (previous ? { ...previous, active: null } : previous))
          setTab('study')
          void load()
        })
      }

      function makeSummary() {
        void run('summary', async () => {
          const value = await api('/summary', { method: 'POST' })
          setSummary(value)
          void load()
        })
      }

      function makeQuestions(noteText) {
        void run('questions', async () => {
          const value = await api('/questions', {
            method: 'POST',
            body: JSON.stringify({ note: noteText || '' })
          })
          if (value.needNote) {
            setNeedNote(true)
          } else {
            setQuestions(value)
            setNeedNote(false)
            setNote('')
          }
          void load()
        })
      }

      function takeBreak() {
        void run('break', async () => {
          const value = await api('/break', { method: 'POST' })
          setState(value)
          setLoadedAt(Date.now())
        })
      }

      function saveSettings() {
        if (!draft) return
        void run('save', async () => {
          const value = await api('/settings', { method: 'POST', body: JSON.stringify(draft) })
          setDraft(value.settings)
          setState((previous) => (previous ? { ...previous, settings: value.settings, visionAvailable: value.visionAvailable } : previous))
          void load()
        })
      }

      function makeWeekly() {
        void run('weekly', async () => {
          const value = await api('/weekly/summary', { method: 'POST' })
          setWeekly(value)
          void load()
        })
      }

      function toggleFloating() {
        void run('floating', async () => {
          const value = await api('/floating', { method: 'POST', body: JSON.stringify({ show: !state?.floating }) })
          setState(value)
        })
      }

      function resetReport() {
        setReport(null)
        setSummary(null)
        setQuestions(null)
        setNeedNote(false)
        setNote('')
        setTab('study')
      }

      function patchDraft(patch) {
        setDraft((previous) => (previous ? { ...previous, ...patch } : previous))
      }

      function chooseRange(range) {
        setStatsRange(range)
        setTab('stats')
      }

      function renderError() {
        if (!error) return null
        return h('div', { className: 'swc-error' },
          h('div', { className: 'swc-error-text' }, error),
          h('button', { className: 'swc-x', type: 'button', onClick: () => setError('') }, '×')
        )
      }

      function renderStart() {
        return h('div', { className: 'swc-card' },
          h('div', { className: 'swc-quote' }, '伙伴，今天想学点什么呀？'),
          h('div', { className: 'swc-domain' },
            h('input', {
              className: 'swc-input',
              value: domain,
              placeholder: '比如：深度学习',
              maxLength: 80,
              onChange: (event) => {
                domainTouchedRef.current = true
                setDomain(event.target.value)
              },
              onKeyDown: (event) => {
                if (event.key === 'Enter') startSession()
              }
            }),
            h('button', {
              className: 'swc-btn swc-btn-primary swc-start-btn',
              type: 'button',
              disabled: Boolean(busy),
              onClick: startSession
            }, busy === 'start' ? '正在准备…' : '开始学习')
          ),
          h('div', { className: 'swc-hint' }, '会默认填上次的领域，改一下也行；关键词人家来想。开始后会弹出一个可拖动的小悬浮窗。'),
          h('div', { className: 'swc-mini' },
            h('span', null, `今天 ${formatDuration(state?.stats?.totalMs || 0)}`),
            h('span', null, `本周 ${formatDuration(state?.week?.totalMs || 0)}`),
            state?.visionAvailable ? h('span', null, '视觉可用') : h('span', null, '本地 OCR 模式')
          )
        )
      }

      function renderActive(active) {
        const studyElapsed = Math.max(0, Number(active.studyMs) || 0)
          + (active.status === 'break' ? 0 : Math.max(0, now - loadedAt))
        const quiet = Math.max(0, now - active.lastStudyAt)
        const quietText = quiet < 120000 ? '最近有学习证据' : `已经 ${Math.floor(quiet / 1000)} 秒没有学习证据`
        const canAsk = studyElapsed >= (Number(state?.settings?.encourageMinutes) || 13) * 60000
        return h('div', { className: 'swc-card' },
          h('div', { className: 'swc-active-head' },
            h('div', null,
              h('div', { className: 'swc-domain-label' }, active.domain),
              h('div', { className: 'swc-muted' }, `从 ${formatClock(active.startedAt)} 开始`)
            ),
            h('span', { className: `swc-pill ${statusClass(active.status)}` }, statusLabel(active.status))
          ),
          h('div', { className: 'swc-timer' }, formatDuration(studyElapsed)),
          h('div', { className: 'swc-muted' }, `${quietText} · 今天已学 ${formatDuration(active.studyMs)}`),
          h('div', { className: 'swc-actions' },
            h('button', { className: 'swc-btn', type: 'button', disabled: Boolean(busy), onClick: makeSummary },
              busy === 'summary' ? '正在写…' : '总结'),
            canAsk ? h('button', { className: 'swc-btn', type: 'button', disabled: Boolean(busy), onClick: () => makeQuestions('') },
              busy === 'questions' ? '正在出题…' : '提问') : null,
            h('button', { className: 'swc-btn', type: 'button', disabled: Boolean(busy), onClick: takeBreak },
              active.status === 'break' ? '休息完啦' : '休息'),
            h('button', { className: 'swc-btn', type: 'button', disabled: Boolean(busy), onClick: toggleFloating },
              state?.floating ? '收起悬浮窗' : '显示悬浮窗'),
            h('button', { className: 'swc-btn swc-btn-danger', type: 'button', disabled: Boolean(busy), onClick: endSession },
              busy === 'end' ? '正在收尾…' : '结束学习')
          ),
          busy ? h('div', { className: 'swc-busy' }, '人家正在忙这一下，等一下下呀……') : null
        )
      }

      function renderSummary(active) {
        const currentSummary = summary || active?.lastSummary
        const text = currentSummary?.text || ''
        if (!text) return null
        const source = currentSummary?.source === 'local' ? '本地收尾' : '昔涟手写'
        const short = Boolean(currentSummary?.short)
        return h('div', { className: 'swc-card' },
          h('div', { className: 'swc-eyebrow' }, short ? '这次的学习时间太短啦，人家无法替伙伴收录这一段呢' : `这一段 · ${source}`),
          h('div', { className: 'swc-summary' }, text),
          h('div', { className: 'swc-actions' },
            h('button', { className: 'swc-btn', type: 'button', disabled: Boolean(busy), onClick: makeSummary },
              busy === 'summary' ? '正在写…' : '再总结一次')
          )
        )
      }

      function renderQuestions(active) {
        const currentQuestions = questions || active?.lastQuestions
        const list = currentQuestions?.questions || []
        if (currentQuestions?.short) return null
        if (!list.length && !needNote) return null
        return h('div', { className: 'swc-card' },
          h('div', { className: 'swc-eyebrow' }, '人家想考考你 · 不用紧张'),
          needNote
            ? h('div', { className: 'swc-field' },
                h('div', { className: 'swc-hint' }, '这段记录还太少，先跟人家说一句：你主要学了什么？'),
                h('textarea', {
                  className: 'swc-textarea',
                  value: note,
                  placeholder: '比如：卷积神经网络的卷积层、池化层和反向传播……',
                  onChange: (event) => setNote(event.target.value)
                }),
                h('div', { className: 'swc-actions' },
                  h('button', {
                    className: 'swc-btn swc-btn-primary',
                    type: 'button',
                    disabled: Boolean(busy),
                    onClick: () => makeQuestions(note)
                  }, busy === 'questions' ? '正在想…' : '带着这段再出题')
                )
              )
            : null,
          list.map((item, index) => h('details', { className: 'swc-question', key: `${index}-${item.q}` },
            h('summary', null, `${index + 1}. ${item.q}`),
            h('div', { className: 'swc-answer' }, item.a || '（答案还在人家的记忆里，回头补上。）')
          )),
          list.length
            ? h('div', { className: 'swc-actions' },
                h('button', { className: 'swc-btn', type: 'button', disabled: Boolean(busy), onClick: () => makeQuestions('') },
                  busy === 'questions' ? '正在出题…' : '再出几道')
              )
            : null
        )
      }

      function renderReport() {
        if (!report) return null
        const session = report.session || {}
        const short = Boolean(report.short)
        return h('div', { className: 'swc-card swc-report' },
          h('div', { className: 'swc-eyebrow' }, short ? '这次的学习时间太短啦，人家无法替伙伴收录这一段呢' : '这一段，人家替你收好啦'),
          h('div', { className: 'swc-big' }, formatDuration(session.studyMs || 0)),
          h('div', { className: 'swc-mini' },
            h('span', null, `领域 ${session.domain || '—'}`),
            h('span', null, `提醒 ${session.popups || 0} 次`),
            h('span', null, `休息 ${session.breaks || 0} 次`)
          ),
          report.summary ? h('div', { className: 'swc-summary' }, report.summary) : null,
          (report.questions || []).map((item, index) => h('details', { className: 'swc-question', key: `${index}-${item.q}` },
            h('summary', null, `${index + 1}. ${item.q}`),
            h('div', { className: 'swc-answer' }, item.a || '')
          )),
          h('div', { className: 'swc-actions' },
            h('button', { className: 'swc-btn swc-btn-primary', type: 'button', onClick: resetReport }, '开始新的一段')
          )
        )
      }

      function renderTabs() {
        return h('div', { className: 'swc-tabs' },
          [['stats', '统计'], ['settings', '设置']].map(([key, label]) =>
            h('button', {
              className: `swc-tab${tab === key ? ' active' : ''}`,
              type: 'button',
              key,
              onClick: () => setTab(key)
            }, label)
          )
        )
      }

      function renderStats() {
        const data = stats || state?.week || null
        if (!data) {
          return h('div', { className: 'swc-card' }, h('div', { className: 'swc-muted' }, '人家正在算……'))
        }
        const maxDay = Math.max(1, ...data.days.map((day) => day.ms))
        const maxHour = Math.max(1, ...data.hours)
        const avgDayMs = Math.round((data.totalMs || 0) / Math.max(1, (data.days || []).length))
        return h('div', { className: 'swc-card' },
          h('div', { className: 'swc-tabs swc-tabs-small' },
            [['today', '今天'], ['week', '本周'], ['month', '本月']].map(([key, label]) =>
              h('button', {
                className: `swc-tab${statsRange === key ? ' active' : ''}`,
                type: 'button',
                key,
                onClick: () => chooseRange(key)
              }, label)
            )
          ),
          h('div', { className: 'swc-stats-grid' },
            h('div', { className: 'swc-stat' },
              h('div', { className: 'swc-stat-label' }, '总学习时长'),
              h('div', { className: 'swc-stat-value' }, formatDuration(data.totalMs))
            )
          ),
          statsRange !== 'today'
            ? h('div', { className: 'swc-stat swc-stat-avg' },
                h('div', { className: 'swc-stat-label' }, '平均每天学习时长'),
                h('div', { className: 'swc-stat-value' }, formatDuration(avgDayMs))
              )
            : null,
          h('div', { className: 'swc-praise' },
            h('div', { className: 'swc-eyebrow' }, '再创世进度'),
            h('div', { className: 'swc-summary' }, '为实现真正的再创世写下新的 ', h('strong', null, String(data.encouragements || 0)), ' 笔，翁法罗斯一定会迎来真正的黎明。')
          ),
          h('div', { className: 'swc-muted' }, '这段时间主要学了'),
          (data.domains && data.domains.length)
            ? h('div', { className: 'swc-keywords' }, data.domains.map((domain) => h('span', { className: 'swc-tag', key: domain.domain }, `${domain.domain} · ${formatDuration(domain.ms)}`)))
            : h('div', { className: 'swc-hint' }, '还没有记录。开始一段学习，这里就会长出来。'),
          (data.recent && data.recent.length)
            ? h('div', { className: 'swc-week-sessions' }, data.recent.slice(0, 4).map((session) => h('div', { className: 'swc-week-session', key: `${session.id || ''}-${session.startedAt}` },
                h('div', { className: 'swc-week-session-head' },
                  h('span', { className: 'swc-week-domain' }, session.domain),
                  h('span', { className: 'swc-muted' }, `${formatDateTime(session.startedAt)} · ${formatDuration(session.studyMs)}`)
                ),
                session.summary ? h('div', { className: 'swc-summary-small' }, session.summary) : null
              )))
            : null,
          h('div', { className: 'swc-muted' }, '每天学习时长'),
          h('div', { className: 'swc-bars' },
            data.days.map((day, index) => h('div', {
              className: 'swc-bar',
              key: `${day.date}-${index}`,
              title: `${day.date} · ${formatDuration(day.ms)}`,
              style: { height: `${Math.max(2, Math.round((day.ms / maxDay) * 64))}px` }
            }))
          ),
          h('div', { className: 'swc-bar-axis' },
            h('span', null, data.days[0]?.label || ''),
            h('span', null, data.days[data.days.length - 1]?.label || '')
          ),
          h('div', { className: 'swc-muted' }, '集中在什么时间段'),
          h('div', { className: 'swc-bars' },
            data.hours.map((ms, hour) => h('div', {
              className: 'swc-bar',
              key: hour,
              title: `${hour}:00 · ${formatDuration(ms)}`,
              style: { height: `${Math.max(2, Math.round((ms / maxHour) * 64))}px` }
            }))
          ),
          h('div', { className: 'swc-bar-axis' }, h('span', null, '0 点'), h('span', null, '23 点'))
        )
      }

      function renderWeekly() {
        const data = weekly
        if (!data) {
          return h('div', { className: 'swc-card' },
            h('div', { className: 'swc-quote' }, '这一周的记忆，人家正在翻……'),
            h('div', { className: 'swc-actions' },
              h('button', { className: 'swc-btn swc-btn-primary', type: 'button', disabled: Boolean(busy), onClick: makeWeekly },
                busy === 'weekly' ? '正在整理…' : '整理这一周')
            )
          )
        }
        const days = data.stats?.days || []
        const maxDay = Math.max(1, ...days.map((day) => day.ms))
        const domains = data.domains || []
        const sessions = data.sessions || []
        const praise = data.praise || ''
        const canPraise = Boolean(data.canPraise)
        return h('div', { className: 'swc-card' },
          h('div', { className: 'swc-eyebrow' }, `这一周 · ${formatDate(data.weekStart)} – ${formatDate(data.weekEnd)}`),
          h('div', { className: 'swc-big' }, formatDuration(data.totalMs || 0)),
          h('div', { className: 'swc-mini' },
            h('span', null, `学习 ${data.dayCount || 0} 天`),
            h('span', null, `${data.sessionCount || 0} 段`),
            h('span', null, `提醒 ${data.stats?.interruptions || 0} 次`)
          ),
          h('div', { className: 'swc-muted' }, '每天学习时长'),
          h('div', { className: 'swc-bars' }, days.map((day, index) => h('div', {
            className: 'swc-bar',
            key: `${day.date}-${index}`,
            title: `${day.date} · ${formatDuration(day.ms)}`,
            style: { height: `${Math.max(2, Math.round((day.ms / maxDay) * 64))}px` }
          }))),
          h('div', { className: 'swc-bar-axis' },
            h('span', null, days[0]?.label || ''),
            h('span', null, days[days.length - 1]?.label || '')
          ),
          h('div', { className: 'swc-muted' }, '这一周主要学了'),
          domains.length
            ? h('div', { className: 'swc-keywords' }, domains.map((domain) => h('span', { className: 'swc-tag', key: domain.domain }, `${domain.domain} · ${formatDuration(domain.ms)}`)))
            : h('div', { className: 'swc-hint' }, '这一周还没有留下学习记录。'),
          canPraise
            ? h('div', { className: 'swc-praise' },
                h('div', { className: 'swc-eyebrow' }, data.praiseSource === 'fallback' ? '人家先按记忆写一段' : '昔涟写给你的'),
                h('div', { className: 'swc-summary' }, praise || '这一周还没有落笔，等你在记忆里种下第一朵花。'),
                data.stale ? h('div', { className: 'swc-hint' }, '有新记录啦，点一下重新夸夸。') : null,
                h('div', { className: 'swc-actions' },
                  h('button', { className: 'swc-btn swc-btn-primary', type: 'button', disabled: Boolean(busy), onClick: makeWeekly },
                    busy === 'weekly' ? '正在写…' : (praise ? '再夸一次' : '夸夸我'))
                )
              )
            : h('div', { className: 'swc-hint swc-week-note' }, '这一周还没有完整坚持到 13 分钟；等第一次夸夸亮起来，人家再把这段话写给你。'),
          h('div', { className: 'swc-muted' }, '这一周学过什么'),
          sessions.length
            ? h('div', { className: 'swc-week-sessions' }, sessions.map((session) => h('div', { className: 'swc-week-session', key: `${session.id || ''}-${session.startedAt}` },
                h('div', { className: 'swc-week-session-head' },
                  h('span', { className: 'swc-week-domain' }, session.domain + (session.active ? ' · 进行中' : '')),
                  h('span', { className: 'swc-muted' }, `${formatDateTime(session.startedAt)} · ${formatDuration(session.studyMs)}`)
                ),
                session.summary ? h('div', { className: 'swc-summary-small' }, session.summary) : null
              )))
            : h('div', { className: 'swc-hint' }, '这一周还没有记录。')
        )
      }

      function renderSettings() {
        if (!draft) {
          return h('div', { className: 'swc-card' }, h('div', { className: 'swc-muted' }, '人家正在读设置……'))
        }
        const keywords = state?.active?.keywords || []
        return h('div', { className: 'swc-card' },
          h('div', { className: 'swc-eyebrow' }, '设置'),
          h('label', { className: 'swc-field' },
            h('span', { className: 'swc-field-label' }, '随机截图间隔（秒）'),
            h('div', { className: 'swc-row' },
              h('input', {
                className: 'swc-num',
                type: 'number',
                min: 0,
                max: 300,
                value: draft.screenshotMinSec,
                onChange: (event) => patchDraft({ screenshotMinSec: Number(event.target.value) })
              }),
              h('span', { className: 'swc-muted' }, '到'),
              h('input', {
                className: 'swc-num',
                type: 'number',
                min: 1,
                max: 600,
                value: draft.screenshotMaxSec,
                onChange: (event) => patchDraft({ screenshotMaxSec: Number(event.target.value) })
              })
            )
          ),
          h('label', { className: 'swc-check' },
            h('input', {
              type: 'checkbox',
              checked: Boolean(draft.vision),
              disabled: !state?.visionAvailable,
              onChange: (event) => patchDraft({ vision: event.target.checked })
            }),
            h('span', null, '模糊时让昔涟看一眼图')
          ),
          h('div', { className: 'swc-hint' },
            state?.visionAvailable
              ? '只在规则和 OCR 都判不出时调用，限频 1 次/2 分钟。'
              : '当前模型不支持图片，视觉不会生效；本地 OCR 仍然工作。'
          ),
          h('label', { className: 'swc-check' },
            h('input', {
              type: 'checkbox',
              checked: Boolean(draft.sound),
              onChange: (event) => patchDraft({ sound: event.target.checked })
            }),
            h('span', null, '全屏提醒时播放提示音')
          ),
          h('label', { className: 'swc-check' },
            h('input', {
              type: 'checkbox',
              checked: Boolean(draft.floating),
              onChange: (event) => patchDraft({ floating: event.target.checked })
            }),
            h('span', null, '开始学习时显示桌面悬浮窗')
          ),
          h('div', { className: 'swc-actions' },
            h('button', {
              className: 'swc-btn swc-btn-primary',
              type: 'button',
              disabled: Boolean(busy),
              onClick: saveSettings
            }, busy === 'save' ? '保存中…' : '保存设置')
          ),
          h('details', { className: 'swc-details' },
            h('summary', null, '当前领域关键词'),
            keywords.length
              ? h('div', { className: 'swc-keywords' }, keywords.map((keyword, index) => h('span', { className: 'swc-tag', key: `${index}-${keyword}` }, keyword)))
              : h('div', { className: 'swc-hint' }, '开始学习后，这里会显示插件为这个领域准备的关键词。')
          )
        )
      }

      function renderBody() {
        if (!state) {
          return h('div', { className: 'swc-loading' }, '人家正在把桌面收拾好……')
        }
        const active = state.active
        if (active) {
          return h('div', { className: 'swc-stack' },
            renderError(),
            renderActive(active),
            renderSummary(active),
            renderQuestions(active),
            renderTabs(),
            tab === 'stats' ? renderStats() : null,
            tab === 'settings' ? renderSettings() : null
          )
        }
        if (report) {
          return h('div', { className: 'swc-stack' },
            renderError(),
            renderReport(),
            renderTabs(),
            tab === 'stats' ? renderStats() : null,
            tab === 'settings' ? renderSettings() : null
          )
        }
        return h('div', { className: 'swc-stack' },
          renderError(),
          renderStart(),
          renderTabs(),
          tab === 'stats' ? renderStats() : null,
          tab === 'settings' ? renderSettings() : null
        )
      }

      return h('div', { className: 'swc-root' },
        h('div', { className: 'swc-head' },
          h('div', { className: 'swc-brand' }, strings.brand),
          h('div', { className: 'swc-sub' }, strings.subtitle)
        ),
        renderBody()
      )
    }

    function StudyTabBody(props) {
      const info = typeof props.useTabInfo === 'function' ? props.useTabInfo() : undefined
      return h(StudyView, { visible: info?.tab?.visible !== false })
    }

    function StudyTabTitle(props) {
      const info = typeof props.useTabInfo === 'function' ? props.useTabInfo() : undefined
      return h('span', null, info?.tab?.title ?? strings.title)
    }

    exports.inject = ['slots', 'sidebarRightTabs']
    exports.apply = function apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement('style')
        style.textContent = STYLES
        document.head.appendChild(style)
        return () => {
          if (style.parentNode) style.parentNode.removeChild(style)
        }
      }, 'dsh-study-with-cyrene: styles')
      const tabs = ctx.get('sidebarRightTabs', false)
      const slots = ctx.get('slots', false)
      if (tabs === undefined || tabs === null || slots === undefined || slots === null) return
      ctx.effect(() => tabs.register({
        id: TAB_ID_PKG,
        kind: TAB_ID,
        title: () => strings.title,
        guide: [{ id: TAB_ID_PKG, order: TAB_ORDER, title: () => strings.title }]
      }), 'dsh-study-with-cyrene: tab type')
      ctx.effect(() => slots.inject('sidebar.right.pane.tab', () => slots.register({
        name: 'sidebar.right.pane.tab',
        key: TAB_ID_PKG
      }, StudyTabBody)), 'dsh-study-with-cyrene: tab body')
      ctx.effect(() => slots.inject('sidebar.right.pane.tab.title', () => slots.register({
        name: 'sidebar.right.pane.tab.title',
        key: TAB_ID_PKG
      }, StudyTabTitle)), 'dsh-study-with-cyrene: tab title')
    }

    return module.exports
  }
})
