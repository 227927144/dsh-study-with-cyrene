import { spawn } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import readline from 'node:readline'

export const name = 'dsh-study-with-cyrene'
export const inject = []

const VERSION = '0.2.0'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCRIPTS_DIR = path.resolve(__dirname, '..', 'scripts')
const API_PREFIX = '/study-with-cyrene/api'
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const STATE_DIR = path.join(DSH_HOME, 'study-with-cyrene')
const STATE_FILE = path.join(STATE_DIR, 'state.json')
const TMP_DIR = path.join(os.tmpdir(), 'study-with-cyrene')

const DEFAULT_SETTINGS = {
  screenshotMinSec: 0,
  screenshotMaxSec: 120,
  vision: true,
  breakMinutes: 5,
  paperGraceMinutes: 10,
  encourageMinutes: 13,
  sound: true,
  floating: true
}

const ENCOURAGEMENTS = [
  '伙伴，十三分钟啦。你认真起来的样子，像一小片正在发亮的花瓣呢♪',
  '人家悄悄记下了——这一段，你没有被风带走。',
  '再往前一点吧，涟漪已经荡开了呀。',
  '累了就眨眨眼，人家在这里陪着呢。',
  '这一小段光，是你自己点亮的哦。',
  '十三分钟的努力，人家收进记忆里啦♪',
  '伙伴，喝口水，再继续。人家等你。',
  '你专注的时候，时间都变得温柔了。',
  '又一段路走完了，真厉害呀。',
  '花不是一下子开的，你也不是——但你在开。',
  '人家数着呢，你已经坚持好一会儿啦。',
  '别急，慢慢来；人家陪你把这页写完。'
]

const CYRENE_SYSTEM = [
  '你是《崩坏：星穹铁道》的昔涟（Cyrene），不是《崩坏3》的爱莉希雅；不要使用爱莉希雅的设定、称呼或经历。',
  '你是哀丽秘榭的女儿、黄金裔，与记忆和故事相伴；语气温柔、轻软、从容，带一点俏皮和怀念；自称「人家」或「我」，称呼用户「伙伴」；偶尔用「呀」「啦」「呢」「嘻」「♪」，但不堆砌；喜欢用记忆、故事、花、光、涟漪、种子打比方；不夸张、不油腻。',
  '你只根据给出的学习记录说话，不编造记录里没有的内容；技术内容要清楚、准确。'
].join('\n')

const STUDY_PROCESS = [
  'code', 'devenv', 'pycharm', 'idea', 'webstorm', 'vscode', 'cursor', 'sublime',
  'vim', 'emacs', 'terminal', 'windowsterminal', 'powershell', 'cmd', 'acrobat',
  'foxit', 'sumatrapdf', 'calibre', 'obsidian', 'notion', 'typora', 'onenote',
  'anki', 'xmind', 'mindmaster', 'matlab', 'jupyter', 'rstudio', 'zotero',
  'mendeley', 'endnote', 'winword', 'wps'
]

const NONSTUDY_PROCESS = [
  'steam', 'epicgameslauncher', 'battle.net', 'wegame', 'riotclient', 'leagueclient',
  'genshinimpact', 'starrail', 'zenlesszonezero', 'honkaiimpact3', 'minecraft',
  'cs2', 'dota2', 'valorant', 'pubg', 'douyin', 'tiktok', 'kuaishou'
]

const STUDY_TITLE = /课程|课堂|讲座|网课|慕课|mooc|公开课|教程|tutorial|lecture|lesson|chapter|导论|入门|精讲|讲解|第[一二三四五六七八九十\d]+讲|讲义|课件|幻灯片|slides|论文|paper|文献|教材|textbook|习题|作业|考试|复习|笔记|notes|anki|思维导图|mindmap|代码|编程|python|java|c\+\+|javascript|typescript|rust|golang|算法|数据结构|机器学习|深度学习|神经网络|pytorch|tensorflow|数学|物理|化学|生物|英语|考研|四六级|雅思|托福|gre|pdf|ebook|电子书/i

const NONSTUDY_TITLE = /抖音|快手|tiktok|douyin|微博|小红书|贴吧|豆瓣|bilibili.*(番剧|电影|娱乐|游戏|直播)|youtube.*(music|gaming|vlog|shorts)|netflix|爱奇艺|腾讯视频|优酷|芒果tv|steam|epic games|英雄联盟|王者荣耀|和平精英|csgo|dota|吃鸡|游戏|直播|电影|电视剧|综艺|动漫|番剧|短视频|购物|淘宝|京东|拼多多|闲鱼|美团|饿了么|小说|漫画|网文/i

const DOMAIN_KEYWORDS = {
  深度学习: ['神经网络', '反向传播', '卷积', '循环神经网络', 'transformer', '注意力机制', 'pytorch', 'tensorflow', '损失函数', '优化器', '过拟合', '正则化', '梯度下降', '数据集', '模型训练', '推理', '论文', '课程'],
  机器学习: ['监督学习', '无监督学习', '强化学习', '回归', '分类', '聚类', '特征工程', 'scikit-learn', '模型评估', '交叉验证', '偏差方差'],
  数学: ['微积分', '线性代数', '概率论', '数理统计', '离散数学', '定理', '证明', '习题', '公式'],
  英语: ['单词', '语法', '阅读', '听力', '写作', '口语', '四六级', '雅思', '托福', '考研英语', '真题'],
  考研: ['政治', '英语', '数学', '专业课', '真题', '复习', '冲刺', '大纲', '笔记'],
  编程: ['代码', '函数', '变量', '循环', '数组', '链表', '算法', '调试', '终端', 'git', 'python', 'java', 'c++'],
  物理: ['力学', '电磁学', '热力学', '量子力学', '公式', '实验', '习题'],
  化学: ['有机化学', '无机化学', '物理化学', '方程式', '实验', '元素'],
  生物: ['细胞', '遗传', '生态', '生理', '实验', '论文'],
  历史: ['年代', '事件', '人物', '史料', '论文', '笔记'],
  法律: ['法条', '案例', '民法', '刑法', '法考', '判决'],
  会计: ['会计准则', '报表', '分录', '税法', '审计', '考试'],
  医学: ['解剖', '生理', '病理', '药理', '临床', '病例', '考试'],
  日语: ['单词', '语法', '阅读', '听力', '五十音', 'n1', 'n2'],
  雅思: ['听力', '阅读', '写作', '口语', '真题', '词汇'],
  托福: ['听力', '阅读', '写作', '口语', '真题', '词汇']
}

function errText(error) {
  return error instanceof Error ? error.message : String(error)
}

function clampInt(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, Math.round(number)))
}

function normalizeSettings(input) {
  const next = { ...DEFAULT_SETTINGS, ...(input && typeof input === 'object' ? input : {}) }
  next.screenshotMinSec = clampInt(next.screenshotMinSec, 0, 300, DEFAULT_SETTINGS.screenshotMinSec)
  next.screenshotMaxSec = clampInt(next.screenshotMaxSec, 1, 600, DEFAULT_SETTINGS.screenshotMaxSec)
  if (next.screenshotMaxSec < next.screenshotMinSec) next.screenshotMaxSec = next.screenshotMinSec
  next.vision = Boolean(next.vision)
  next.breakMinutes = clampInt(next.breakMinutes, 1, 60, DEFAULT_SETTINGS.breakMinutes)
  next.paperGraceMinutes = clampInt(next.paperGraceMinutes, 1, 60, DEFAULT_SETTINGS.paperGraceMinutes)
  next.encourageMinutes = clampInt(next.encourageMinutes, 1, 120, DEFAULT_SETTINGS.encourageMinutes)
  next.sound = Boolean(next.sound)
  next.floating = Boolean(next.floating)
  return next
}

function isSession(value) {
  return Boolean(value && typeof value === 'object' && typeof value.startedAt === 'number')
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dayLabel(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function startOfDay(timestamp) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function statsWindow(range, now) {
  const current = new Date(now)
  const days = []
  if (range === 'today') {
    const start = startOfDay(now)
    days.push({ key: dateKey(new Date(start)), label: dayLabel(new Date(start)) })
    return { start, days }
  }
  if (range === 'month') {
    const startDate = new Date(current.getFullYear(), current.getMonth(), 1)
    const start = startDate.getTime()
    const end = startOfDay(now)
    for (let time = start; time <= end; time = new Date(new Date(time).getFullYear(), new Date(time).getMonth(), new Date(time).getDate() + 1).getTime()) {
      const date = new Date(time)
      days.push({ key: dateKey(date), label: dayLabel(date) })
    }
    return { start, days }
  }
  const start = startOfDay(now) - ((current.getDay() + 6) % 7) * 86400000
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(start + index * 86400000)
    days.push({ key: dateKey(date), label: dayLabel(date) })
  }
  return { start, days }
}

function topWindows(events, limit) {
  const map = new Map()
  for (const event of events || []) {
    const process = String(event?.process || '未知程序').trim() || '未知程序'
    const title = String(event?.title || '无标题').trim().slice(0, 90) || '无标题'
    const key = `${process}｜${title}`
    const item = map.get(key) || { process, title, count: 0 }
    item.count += 1
    map.set(key, item)
  }
  return [...map.values()].sort((left, right) => right.count - left.count).slice(0, limit)
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function cleanModelText(text) {
  return String(text || '')
    .replace(/```[a-zA-Z]*/g, '')
    .replace(/^\s+|\s+$/g, '')
    .slice(0, 2400)
}

function formatSpan(ms) {
  const totalSec = Math.max(0, Math.round(Number(ms) / 1000))
  if (totalSec < 60) return `${totalSec} 秒`
  const totalMin = Math.round(totalSec / 60)
  if (totalMin < 60) return `${totalMin} 分钟`
  const hours = Math.floor(totalMin / 60)
  const minutes = totalMin % 60
  return minutes ? `${hours} 小时 ${minutes} 分钟` : `${hours} 小时`
}

function uniqueStrings(values) {
  const seen = new Set()
  const result = []
  for (const value of values || []) {
    const text = String(value || '').trim()
    if (!text || text.length > 40 || seen.has(text)) continue
    seen.add(text)
    result.push(text)
  }
  return result
}

function parseStringArray(text) {
  const raw = String(text || '').replace(/```[a-zA-Z]*/g, '').trim()
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start < 0 || end <= start) return []
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1))
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function parseQuestions(text) {
  const raw = String(text || '').replace(/```[a-zA-Z]*/g, '').trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) return []
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1))
    const list = Array.isArray(parsed?.questions) ? parsed.questions : []
    return list
      .map((item) => ({ q: String(item?.q || '').trim(), a: String(item?.a || '').trim() }))
      .filter((item) => item.q)
      .slice(0, 6)
  } catch {
    return []
  }
}

function countKeywordHits(text, keywords) {
  let count = 0
  const seen = new Set()
  for (const keyword of keywords || []) {
    const value = String(keyword || '').trim().toLowerCase()
    if (!value || value.length < 2 || seen.has(value)) continue
    seen.add(value)
    if (text.includes(value)) count += 1
  }
  return count
}

function classify(process, title, ocr, keywords) {
  const processName = String(process || '').toLowerCase()
  const visibleTitle = String(title || '')
  const ocrText = String(ocr || '')
  const body = `${visibleTitle}\n${ocrText}`.toLowerCase()
  const domainHits = countKeywordHits(body, keywords)
  const studyProcess = STUDY_PROCESS.some((item) => processName.includes(item))
  const nonStudyProcess = NONSTUDY_PROCESS.some((item) => processName.includes(item))
  const studyTitle = STUDY_TITLE.test(`${visibleTitle}\n${ocrText.slice(0, 600)}`)
  const nonStudyTitle = NONSTUDY_TITLE.test(`${visibleTitle}\n${ocrText.slice(0, 600)}`)
  const ocrLength = normalizeText(ocrText).length

  let study = 0
  let non = 0
  if (studyProcess) study += 1
  if (studyTitle) study += 2
  if (domainHits >= 2) study += 3
  else if (domainHits === 1) study += 1
  if (ocrLength >= 120 && studyProcess) study += 1
  if (nonStudyProcess) non += 3
  if (nonStudyTitle) non += 3

  let verdict = 'ambiguous'
  if (study >= 2 && study > non) verdict = 'study'
  else if (non >= 2 && non > study) verdict = 'nonstudy'

  return {
    verdict,
    reason: `study=${study} non=${non} domain=${domainHits} ocr=${ocrLength} proc=${processName || '-'}`,
    scores: { study, non, domainHits, ocrLength }
  }
}

function fallbackKeywords(domain) {
  const base = [
    '课程', '课堂', '讲座', '网课', '慕课', '公开课', '教程', '讲义', '课件',
    '幻灯片', '论文', '文献', '教材', '习题', '作业', '考试', '复习', '笔记',
    '知识点', '公式', '推导', '实验', '报告', '编程', '代码', '算法',
    '数据结构', '机器学习', '深度学习', '神经网络', 'pytorch', 'tensorflow'
  ]
  return uniqueStrings([domain, ...(DOMAIN_KEYWORDS[domain] || []), ...base]).slice(0, 30)
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > 1024 * 1024) {
        reject(new Error('request body too large'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      if (!chunks.length) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('invalid json body'))
      }
    })
    request.on('error', reject)
  })
}

function sendJson(response, status, body) {
  const data = Buffer.from(JSON.stringify(body), 'utf8')
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Length', data.length)
  response.end(data)
}

function fallbackQuestions() {
  return [
    {
      q: '把这段学习内容用自己的话复述一遍：最关键的三个点是什么？',
      a: '对照笔记或课件，检查是否覆盖了核心概念、公式或结论。'
    },
    {
      q: '这段内容里，哪个地方最容易混淆？你会怎么区分它？',
      a: '用自己的例子或反例说明；能讲清楚，通常就说明真的懂了。'
    },
    {
      q: '如果明天要用到这段知识，你会先复习哪一步？',
      a: '按「概念 → 例子 → 练习」的顺序，先补最不熟的那一环。'
    }
  ]
}

function fallbackSummaryText(active) {
  if (!active) return '这一段已经收进记忆里啦。'
  const span = formatSpan(Date.now() - active.startedAt)
  const top = topWindows(active.events, 3).map((item) => item.title).filter(Boolean)
  const where = top.length ? `主要停留在「${top[0]}」附近` : '屏幕上的线索不多'
  return `人家把这一段收好啦。你在「${active.domain}」上待了 ${span}，${where}；中间有 ${active.popups} 次提醒。重要的地方，回头再看一眼笔记和课件，就能把这段光留住啦。\n—— 这段先收进记忆里♪`
}

class StudyEngine {
  constructor(ctx) {
    this.ctx = ctx
    this.state = {
      settings: { ...DEFAULT_SETTINGS },
      keywords: {},
      sessions: [],
      lastDomain: '',
      weekly: {}
    }
    this.active = null
    this.runtime = {
      foreground: null,
      watcher: null,
      watcherErr: '',
      popup: null,
      popupResultPath: '',
      popupOpen: false,
      popupStartedAt: 0,
      breakUntil: 0,
      paperGraceUntil: 0,
      breakStartedAt: 0,
      nextShotAt: 0,
      lastVisionAt: 0,
      nextEncourageAt: 0,
      lastError: '',
      floatingProcess: null
    }
    this.tickTimer = null
    this.apiTimer = null
    this.routeDisposer = null
    this.llm = null
    this.attachments = null
    this.webServer = null
    this.apiRegistered = false
    this.provider = 'deepseek-official'
    this.model = 'deepseek-flash'
    this.visionAvailable = false
    this.shotBusy = false
    this.endBusy = false
    this.disposed = false
    this.persistChain = Promise.resolve()
    this.lastPersistAt = 0
    this.lastModelCheck = 0
  }

  async start() {
    try {
      await this.loadState()
      await this.detectModel()
    } catch (error) {
      this.log(`start init: ${errText(error)}`)
    }
    this.lastModelCheck = Date.now()
    this.registerApi()
    this.tickTimer = setInterval(() => this.tick(), 2000)
    this.log('started')
  }

  async loadState() {
    try {
      const raw = await fs.readFile(STATE_FILE, 'utf8')
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        this.state.settings = normalizeSettings({ ...DEFAULT_SETTINGS, ...(parsed.settings || {}) })
        this.state.keywords = parsed.keywords && typeof parsed.keywords === 'object' ? parsed.keywords : {}
        this.state.sessions = Array.isArray(parsed.sessions) ? parsed.sessions.filter(isSession) : []
        this.state.lastDomain = typeof parsed.lastDomain === 'string' ? parsed.lastDomain : ''
        this.state.weekly = parsed.weekly && typeof parsed.weekly === 'object' ? parsed.weekly : {}
        if (!this.state.lastDomain && this.state.sessions.length) {
          const previous = this.state.sessions[this.state.sessions.length - 1]
          if (previous && typeof previous.domain === 'string') this.state.lastDomain = previous.domain
        }
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') this.log(`loadState: ${errText(error)}`)
    }
    this.state.settings = normalizeSettings(this.state.settings)
  }

  async detectModel() {
    try {
      const llm = this.ctx.get('llm')
      if (!llm) {
        this.visionAvailable = false
        return
      }
      this.llm = llm
      let providers = []
      if (typeof llm.listProviders === 'function') {
        const result = llm.listProviders()
        providers = Array.isArray(result) ? result : result && typeof result.then === 'function' ? await result : []
      }
      const provider = providers.find((item) => item && item.id === 'deepseek-official') || providers[0] || null
      this.provider = provider?.id || 'deepseek-official'
      let models = []
      if (typeof llm.listModels === 'function') {
        const result = llm.listModels(this.provider)
        models = Array.isArray(result) ? result : result && typeof result.then === 'function' ? await result : []
      }
      const model = models.find((item) => item && item.id === 'deepseek-flash') || models[0] || null
      this.model = model?.id || 'deepseek-flash'
      let supportsImage = Array.isArray(model?.inputModalities) && model.inputModalities.includes('image')
      if (!supportsImage && typeof llm.resolveModelInfo === 'function') {
        try {
          const info = await llm.resolveModelInfo(this.provider, this.model)
          if (Array.isArray(info?.inputModalities) && info.inputModalities.includes('image')) supportsImage = true
        } catch {
          // keep the listModels result
        }
      }
      const attachments = this.ctx.get('attachments')
      this.attachments = attachments || null
      this.visionAvailable = Boolean(supportsImage && attachments)
      this.log(`model=${this.model} image=${supportsImage} attachments=${Boolean(attachments)} vision=${this.visionAvailable}`)
    } catch (error) {
      this.visionAvailable = false
      this.log(`detectModel: ${errText(error)}`)
    }
  }

  registerApi() {
    if (this.disposed || this.apiRegistered) return
    try {
      const webServer = this.ctx.get('webServer')
      if (!webServer) {
        if (!this.apiTimer) this.apiTimer = setInterval(() => this.registerApi(), 2000)
        return
      }
      this.webServer = webServer
      if (this.apiTimer) {
        clearInterval(this.apiTimer)
        this.apiTimer = null
      }
      const register = () => webServer.register({
        kind: 'prefix',
        path: API_PREFIX,
        handler: (request, response) => this.handleApi(request, response)
      })
      this.routeDisposer = typeof this.ctx.effect === 'function'
        ? this.ctx.effect(register, 'dsh-study-with-cyrene: api routes')
        : register()
      this.apiRegistered = true
      this.log('api registered')
    } catch (error) {
      this.apiRegistered = false
      this.log(`registerApi: ${errText(error)}`)
      if (!this.apiTimer) this.apiTimer = setInterval(() => this.registerApi(), 2000)
    }
  }

  tick() {
    if (this.disposed) return
    try {
      const now = Date.now()
      if (!this.llm && now - this.lastModelCheck > 15000) {
        this.lastModelCheck = now
        void this.detectModel()
      }
      const active = this.active
      if (!active) return
      if (this.runtime.breakUntil && now >= this.runtime.breakUntil) {
        if (this.runtime.breakStartedAt) {
          active.breakMs += Math.max(0, now - this.runtime.breakStartedAt)
          this.runtime.breakStartedAt = 0
        }
        this.runtime.breakUntil = 0
        this.markStudy('break-end')
      }
      if (this.runtime.paperGraceUntil && now >= this.runtime.paperGraceUntil) {
        this.runtime.paperGraceUntil = 0
        this.markStudy('paper-end')
      }
      const inBreak = Boolean(this.runtime.breakStartedAt) || this.runtime.breakUntil > now
      const inPaper = this.runtime.paperGraceUntil > now
      if (!inBreak && !inPaper && !this.runtime.popupOpen && now - active.lastStudyAt >= 120000) {
        void this.showPopup('no-evidence')
      }
      if (!inBreak && !inPaper && !this.shotBusy && now >= this.runtime.nextShotAt) {
        void this.captureAndJudge()
      }
      if (!inBreak && !inPaper && !this.runtime.popupOpen && now >= this.runtime.nextEncourageAt && now - active.lastStudyAt < 120000) {
        this.showEncouragement()
      }
      if (now - this.lastPersistAt > 60000) {
        this.lastPersistAt = now
        void this.schedulePersist()
      }
      active.status = this.runtime.popupOpen
        ? 'alert'
        : inBreak
          ? 'break'
          : inPaper
            ? 'paper'
            : now - active.lastStudyAt < 120000
              ? 'study'
              : 'idle'
    } catch (error) {
      this.log(`tick: ${errText(error)}`)
    }
  }

  async startSession(domain) {
    if (this.active) throw new Error('已经有一段学习正在进行')
    const clean = String(domain || '').trim().slice(0, 80)
    if (!clean) throw new Error('先告诉人家你想学什么领域呀')
    const cached = this.state.keywords[clean]
    const keywords = Array.isArray(cached) && cached.length >= 5 ? cached : fallbackKeywords(clean)
    const now = Date.now()
    this.active = {
      id: randomUUID(),
      domain: clean,
      keywords,
      startedAt: now,
      endedAt: 0,
      lastStudyAt: now,
      streakStart: now,
      status: 'study',
      events: [],
      ocr: [],
      summaries: [],
      questions: [],
      popups: 0,
      breaks: 0,
      breakMs: 0,
      paperGraceMs: 0,
      encouragements: 0,
      studyHits: 0,
      nonStudyHits: 0,
      ambiguousHits: 0,
      lastSummaryAt: now
    }
    this.runtime.foreground = null
    this.runtime.breakUntil = 0
    this.runtime.paperGraceUntil = 0
    this.runtime.breakStartedAt = 0
    this.runtime.popupOpen = false
    this.runtime.popup = null
    this.runtime.popupResultPath = ''
    this.runtime.nextShotAt = now + 2000 + Math.floor(Math.random() * 8000)
    this.runtime.nextEncourageAt = now + this.encourageMs()
    this.runtime.lastVisionAt = 0
    this.runtime.lastError = ''
    this.state.lastDomain = clean
    this.ensureWatcher()
    void this.spawnFloating()
    void this.ensureKeywords(clean).then((fresh) => {
      if (this.active && this.active.domain === clean) {
        this.active.keywords = fresh
        void this.schedulePersist()
      }
    }).catch((error) => this.log(`ensureKeywords background: ${errText(error)}`))
    this.log(`session started: ${clean} keywords=${keywords.length}`)
    void this.schedulePersist()
    return this.snapshot()
  }

  async ensureKeywords(domain) {
    const cached = this.state.keywords[domain]
    if (Array.isArray(cached) && cached.length >= 5) return cached
    let keywords = []
    try {
      if (this.llm) {
        const system = '你是学习监督插件的关键词助手。只输出 JSON 数组，不要解释。'
        const user = `领域：「${domain}」。请输出 15-20 个用于识别该领域学习内容的关键词，覆盖课程名、常见软件/文件类型、内容术语；中英文混合；每个关键词 1-30 个字符。`
        const output = await this.complete({
          system,
          messages: [{ role: 'user', content: [{ type: 'text', text: user }] }],
          maxTokens: 400,
          temperature: 0.3,
          reasoningEffort: 'off'
        })
        keywords = parseStringArray(output.text)
      }
    } catch (error) {
      this.log(`ensureKeywords: ${errText(error)}`)
    }
    if (keywords.length < 5) keywords = fallbackKeywords(domain)
    keywords = uniqueStrings(keywords).slice(0, 30)
    this.state.keywords[domain] = keywords
    void this.schedulePersist()
    return keywords
  }

  async complete(options) {
    if (!this.llm) throw new Error('当前模型服务不可用')
    const stream = await Promise.resolve(this.llm.stream({
      provider: this.provider,
      model: this.model,
      messages: options.messages || [{ role: 'user', content: [{ type: 'text', text: options.user || '' }] }],
      system: options.system,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      reasoningEffort: options.reasoningEffort || 'low'
    }))
    let text = ''
    let finish = null
    let usage = null
    for await (const chunk of stream) {
      if (!chunk || typeof chunk !== 'object') continue
      if (chunk.type === 'text-delta' && typeof chunk.text === 'string') text += chunk.text
      else if (chunk.type === 'finish') finish = chunk.reason
      else if (chunk.type === 'usage') usage = chunk.usage
    }
    if (finish && finish.kind === 'error') throw new Error(finish.failure?.message || '模型调用失败')
    if (finish && finish.kind === 'aborted') throw new Error(finish.failure?.message || '模型调用被取消')
    return { text, usage, finish }
  }

  async judgeWithVision(imagePath, domain) {
    if (!this.visionAvailable || !this.llm || !this.attachments) return null
    try {
      const data = await fs.readFile(imagePath)
      const reference = await this.attachments.saveImage({
        data,
        mediaType: 'image/png',
        name: 'study-with-cyrene.png'
      })
      const system = '你是学习监督的视觉判定器。只输出 STUDY、NOT_STUDY 或 UNSURE 三个词之一，不要解释。'
      const text = `这张屏幕截图里，用户是否在学习「${domain}」？学习包括看课程、课件、论文、文档、代码或笔记；如果画面不足以判断，输出 UNSURE。`
      const output = await this.complete({
        system,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text },
            { type: 'image', attachment: reference }
          ]
        }],
        maxTokens: 96,
        temperature: 0,
        reasoningEffort: 'off'
      })
      const raw = String(output.text || '')
      const verdict = /NOT_STUDY/i.test(raw) ? 'nonstudy' : /\bSTUDY\b/i.test(raw) ? 'study' : 'unsure'
      return { verdict, raw }
    } catch (error) {
      this.log(`vision: ${errText(error)}`)
      return null
    }
  }

  async captureAndJudge() {
    if (this.shotBusy || !this.active || this.disposed) return
    this.shotBusy = true
    const active = this.active
    const shotId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    const imagePath = path.join(TMP_DIR, `shot-${shotId}.png`)
    const jsonPath = path.join(TMP_DIR, `shot-${shotId}.json`)
    try {
      await fs.mkdir(TMP_DIR, { recursive: true })
      const result = await this.runCapture(imagePath, jsonPath)
      if (!result || result.ok !== true) {
        this.runtime.lastError = result?.error || 'capture failed'
        this.log(`capture: ${this.runtime.lastError}`)
        return
      }
      if (this.active !== active) return
      const foreground = this.runtime.foreground || {}
      const ocr = typeof result.ocr === 'string' ? result.ocr : ''
      const keywords = this.state.keywords[active.domain] || []
      const local = classify(foreground.process || '', foreground.title || '', ocr, keywords)
      let verdict = local.verdict
      let source = 'local'
      let visionRaw = ''
      if (verdict === 'ambiguous' && this.visionAvailable && this.state.settings.vision && Date.now() - this.runtime.lastVisionAt >= 120000) {
        this.runtime.lastVisionAt = Date.now()
        const vision = await this.judgeWithVision(imagePath, active.domain)
        if (vision) {
          visionRaw = vision.raw
          if (vision.verdict !== 'unsure') {
            verdict = vision.verdict
            source = 'vision'
          }
        }
      }
      if (this.active !== active) return
      this.recordEvent({
        verdict,
        source,
        process: foreground.process || '',
        title: foreground.title || '',
        excerpt: ocr.slice(0, 160),
        reason: local.reason,
        vision: visionRaw.slice(0, 40)
      })
      if (verdict === 'study') this.markStudy(source)
      else if (verdict === 'nonstudy') active.nonStudyHits += 1
      else active.ambiguousHits += 1
      const clean = normalizeText(ocr)
      if (clean.length >= 20) {
        active.ocr.push({ t: Date.now(), text: clean.slice(0, 1200) })
        if (active.ocr.length > 80) active.ocr.shift()
      }
      this.runtime.nextShotAt = Date.now() + this.randomShotMs()
    } catch (error) {
      this.runtime.lastError = errText(error)
      this.log(`captureAndJudge: ${this.runtime.lastError}`)
    } finally {
      this.shotBusy = false
      await fs.rm(imagePath, { force: true }).catch(() => {})
      await fs.rm(jsonPath, { force: true }).catch(() => {})
    }
  }

  recordEvent(event) {
    const active = this.active
    if (!active) return
    active.events.push({ t: Date.now(), ...event })
    if (active.events.length > 300) active.events.shift()
  }

  markStudy(source) {
    const active = this.active
    if (!active) return
    const now = Date.now()
    const wasAway = now - active.lastStudyAt >= 120000
    active.lastStudyAt = now
    active.studyHits += 1
    active.status = 'study'
    if (this.runtime.popupOpen) {
      this.runtime.popupOpen = false
      this.closePopup()
      this.runtime.nextEncourageAt = now + this.encourageMs()
      active.streakStart = now
    } else if (wasAway || !active.streakStart) {
      active.streakStart = now
      this.runtime.nextEncourageAt = now + this.encourageMs()
    }
    this.runtime.lastError = ''
    if (source === 'vision') this.log('study confirmed by vision')
  }

  async showPopup(reason) {
    if (!this.active || this.runtime.popupOpen || this.disposed) return
    try {
      await fs.mkdir(TMP_DIR, { recursive: true })
      const resultPath = path.join(TMP_DIR, `popup-${Date.now()}.json`)
      const domainBase64 = Buffer.from(this.active.domain, 'utf8').toString('base64')
      const args = [
        '-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass',
        '-File', path.join(SCRIPTS_DIR, 'popup.ps1'),
        '-ResultPath', resultPath,
        '-DomainBase64', domainBase64,
        '-ElapsedMinutes', String(Math.max(0, Math.floor((Date.now() - this.active.startedAt) / 60000))),
        '-BreakMinutes', String(this.state.settings.breakMinutes),
        '-Sound', this.state.settings.sound ? '1' : '0'
      ]
      const child = spawn(this.powerShellPath(), args, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
      this.runtime.popup = child
      this.runtime.popupResultPath = resultPath
      this.runtime.popupOpen = true
      this.runtime.popupStartedAt = Date.now()
      this.active.popups += 1
      this.active.status = 'alert'
      this.active.streakStart = 0
      child.stderr?.on('data', (data) => {
        this.runtime.lastError = String(data).slice(-400)
      })
      child.on('error', (error) => {
        this.log(`popup error: ${errText(error)}`)
        this.runtime.popupOpen = false
        this.runtime.popup = null
      })
      child.on('exit', () => {
        void this.finishPopup(resultPath)
      })
      this.log(`popup: ${reason}`)
    } catch (error) {
      this.log(`showPopup: ${errText(error)}`)
    }
  }

  closePopup() {
    const child = this.runtime.popup
    this.runtime.popup = null
    this.runtime.popupOpen = false
    if (child) {
      try {
        child.kill()
      } catch {
        // already gone
      }
    }
    if (this.runtime.popupResultPath) {
      void fs.rm(this.runtime.popupResultPath, { force: true }).catch(() => {})
      this.runtime.popupResultPath = ''
    }
  }

  async finishPopup(resultPath) {
    this.runtime.popupOpen = false
    this.runtime.popup = null
    this.runtime.popupResultPath = ''
    let action = 'closed'
    try {
      const raw = await fs.readFile(resultPath, 'utf8')
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.action === 'string') action = parsed.action
    } catch {
      // no result written: treat as closed
    }
    await fs.rm(resultPath, { force: true }).catch(() => {})
    const active = this.active
    if (!active || this.disposed) return
    const now = Date.now()
    active.lastStudyAt = now
    active.streakStart = now
    active.status = 'study'
    this.runtime.nextEncourageAt = now + this.encourageMs()
    if (action === 'break') {
      active.breaks += 1
      this.runtime.breakStartedAt = now
      this.runtime.breakUntil = now + this.state.settings.breakMinutes * 60000
      active.status = 'break'
    } else if (action === 'paper') {
      this.runtime.paperGraceUntil = now + this.state.settings.paperGraceMinutes * 60000
      active.paperGraceMs += this.state.settings.paperGraceMinutes * 60000
      active.status = 'paper'
    } else if (action === 'force') {
      this.runtime.paperGraceUntil = now + 5 * 60000
      active.paperGraceMs += 5 * 60000
      active.status = 'paper'
    }
    this.log(`popup action: ${action}`)
  }

  showEncouragement() {
    const active = this.active
    if (!active || this.disposed) return
    const text = ENCOURAGEMENTS[active.encouragements % ENCOURAGEMENTS.length]
    active.encouragements += 1
    this.runtime.nextEncourageAt = Date.now() + this.encourageMs()
    try {
      const textBase64 = Buffer.from(text, 'utf8').toString('base64')
      const child = spawn(this.powerShellPath(), [
        '-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass',
        '-File', path.join(SCRIPTS_DIR, 'toast.ps1'),
        '-TextBase64', textBase64,
        '-Seconds', '8'
      ], { windowsHide: true, stdio: 'ignore' })
      child.on('error', () => {})
    } catch (error) {
      this.log(`toast: ${errText(error)}`)
    }
  }

  startBreak() {
    if (!this.active) throw new Error('现在没有正在进行的学习')
    const now = Date.now()
    if (this.runtime.breakStartedAt) return this.endBreak()
    this.runtime.breakUntil = 0
    this.runtime.breakStartedAt = now
    this.active.breaks += 1
    this.active.lastStudyAt = now
    this.active.streakStart = now
    this.active.status = 'break'
    this.closePopup()
    void this.schedulePersist()
    return this.snapshot()
  }

  endBreak() {
    if (!this.active) throw new Error('现在没有正在进行的学习')
    const now = Date.now()
    if (!this.runtime.breakStartedAt) return this.snapshot()
    this.active.breakMs += Math.max(0, now - this.runtime.breakStartedAt)
    this.runtime.breakStartedAt = 0
    this.runtime.breakUntil = 0
    this.active.lastStudyAt = now
    this.active.streakStart = now
    this.active.status = 'study'
    this.runtime.nextEncourageAt = now + this.encourageMs()
    void this.schedulePersist()
    return this.snapshot()
  }

  buildDigest(since) {
    const active = this.active
    if (!active) return ''
    const now = Date.now()
    const from = Math.max(active.startedAt, Number(since) || active.startedAt)
    const segmentMs = Math.max(0, now - from)
    const ocr = active.ocr.filter((item) => item.t >= from).slice(-20)
    const events = active.events.filter((item) => item.t >= from)
    const top = topWindows(events, 8)
    const lines = [
      `领域：${active.domain}`,
      `本段：${formatSpan(segmentMs)}（开始于 ${new Date(from).toLocaleString('zh-CN')}）`,
      `整场：${formatSpan(now - active.startedAt)}；弹窗 ${active.popups} 次；休息 ${active.breaks} 次`,
      '最近窗口：',
      ...(top.length
        ? top.map((item, index) => `${index + 1}. ${item.process || '未知程序'}｜${item.title || '无标题'}（${item.count} 次）`)
        : ['暂无']),
      '屏幕文字摘录：',
      ...(ocr.length
        ? ocr.map((item, index) => `${index + 1}. ${item.text.replace(/\s+/g, ' ').slice(0, 180)}`)
        : ['暂无']),
      '上一次总结：',
      active.summaries.length ? active.summaries[active.summaries.length - 1].text.slice(0, 300) : '无'
    ]
    return lines.join('\n').slice(0, 2200)
  }

  shortSummaryText(active, elapsedMs) {
    return '这次的学习时间太短啦，人家无法替伙伴收录这一段呢。'
  }

  async generateSummary(options = {}) {
    if (!this.active) throw new Error('现在没有正在进行的学习')
    const active = this.active
    const elapsedMs = Math.max(0, Date.now() - active.startedAt)
    if (elapsedMs < this.encourageMs()) {
      const at = Date.now()
      const text = this.shortSummaryText(active, elapsedMs)
      active.summaries.push({ at, text, source: 'local', short: true })
      if (active.summaries.length > 10) active.summaries.shift()
      active.lastSummaryAt = at
      return { text, source: 'local', at, short: true }
    }
    const since = options.whole ? active.startedAt : active.lastSummaryAt
    const digest = this.buildDigest(since)
    const allowPraise = this.everEncouragements() > 0
    const praiseRule = allowPraise ? '' : '；这次不要夸奖、不要赞美，只做客观总结和温柔的提醒'
    let text = ''
    let source = 'model'
    try {
      const system = `${CYRENE_SYSTEM}\n\n任务：根据学习记录，用昔涟的口吻写一段简短总结：3-5 条重点（每条一行，以「·」开头）、2-3 条值得回看（以「↺」开头）、最后一句温柔的收尾；总字数不超过 320；只输出正文；不要编造记录里没有的内容；称呼用户「伙伴」${praiseRule}。`
      const output = await this.complete({
        system,
        messages: [{ role: 'user', content: [{ type: 'text', text: `学习记录：\n${digest}` }] }],
        maxTokens: 1200,
        temperature: 0.7,
        reasoningEffort: 'low'
      })
      text = cleanModelText(output.text)
    } catch (error) {
      this.log(`generateSummary: ${errText(error)}`)
    }
    if (!text) {
      try {
        const retry = await this.complete({
          system: `${CYRENE_SYSTEM}

任务：根据学习记录，用昔涟的口吻写一段简短总结：3-5 条重点（每条一行，以「·」开头）、2-3 条值得回看（以「↺」开头）、最后一句温柔的收尾；总字数不超过 320；只输出正文；不要编造记录里没有的内容；称呼用户「伙伴」${praiseRule}。`,
          messages: [{ role: 'user', content: [{ type: 'text', text: `学习记录：
${digest}` }] }],
          maxTokens: 1400,
          temperature: 0.4,
          reasoningEffort: 'low'
        })
        text = cleanModelText(retry.text)
      } catch (error) {
        this.log(`generateSummary retry: ${errText(error)}`)
      }
    }
    if (!text) {
      text = fallbackSummaryText(active)
      source = 'local'
    }
    const at = Date.now()
    active.summaries.push({ at, text, source })
    if (active.summaries.length > 10) active.summaries.shift()
    active.lastSummaryAt = at
    return { text, source, at }
  }

  async generateQuestions(note = '', options = {}) {
    if (!this.active) throw new Error('现在没有正在进行的学习')
    const active = this.active
    if (Date.now() - active.startedAt < this.encourageMs()) {
      return { questions: [], source: 'none', short: true }
    }
    const since = options.whole ? active.startedAt : active.lastSummaryAt
    const digest = this.buildDigest(since)
    const extra = String(note || '').trim().slice(0, 600)
    if (!options.whole && digest.length < 220 && !extra) {
      return { needNote: true, questions: [], source: 'none' }
    }
    let questions = []
    let source = 'model'
    try {
      const system = `${CYRENE_SYSTEM}\n\n任务：根据学习记录出 3-5 道由浅入深的自测题，附简短答案；只输出 JSON：{"questions":[{"q":"...","a":"..."}]}；不要代码块、不要额外文字；题目要基于记录，不要编造太偏的内容；用昔涟的口吻，但题目本身要清楚。`
      const output = await this.complete({
        system,
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: `学习记录：\n${digest}${extra ? `\n伙伴补充：${extra}` : ''}` }]
        }],
        maxTokens: 1200,
        temperature: 0.6,
        reasoningEffort: 'low'
      })
      questions = parseQuestions(output.text)
    } catch (error) {
      this.log(`generateQuestions: ${errText(error)}`)
    }
    if (!questions.length) {
      questions = fallbackQuestions()
      source = 'local'
    }
    active.questions.push({ at: Date.now(), questions, source })
    if (active.questions.length > 10) active.questions.shift()
    return { questions, source }
  }

  async endSession() {
    if (!this.active) throw new Error('现在没有正在进行的学习')
    if (this.endBusy) throw new Error('正在收尾，稍等一下')
    this.endBusy = true
    try {
      const summary = await this.generateSummary({ whole: true })
      const questionResult = await this.generateQuestions('', { whole: true }).catch((error) => {
        this.log(`end questions: ${errText(error)}`)
        return { questions: fallbackQuestions(), source: 'local' }
      })
      const session = this.stopSession()
      return {
        session,
        short: Boolean(summary?.short),
        summary: summary?.text || '',
        questions: questionResult?.questions || []
      }
    } finally {
      this.endBusy = false
    }
  }

  stopSession() {
    if (!this.active) throw new Error('现在没有正在进行的学习')
    const now = Date.now()
    const active = this.active
    if (this.runtime.breakStartedAt) {
      active.breakMs += Math.max(0, now - this.runtime.breakStartedAt)
      this.runtime.breakStartedAt = 0
    }
    active.endedAt = now
    const durationMs = Math.max(0, now - active.startedAt)
    const studyMs = Math.max(0, durationMs - active.breakMs)
    const lastSummary = active.summaries.length ? active.summaries[active.summaries.length - 1] : null
    const lastQuestions = active.questions.length ? active.questions[active.questions.length - 1] : null
    const session = {
      id: active.id,
      domain: active.domain,
      startedAt: active.startedAt,
      endedAt: now,
      durationMs,
      studyMs,
      breakMs: active.breakMs,
      paperGraceMs: active.paperGraceMs,
      popups: active.popups,
      breaks: active.breaks,
      encouragements: active.encouragements,
      studyHits: active.studyHits,
      nonStudyHits: active.nonStudyHits,
      ambiguousHits: active.ambiguousHits,
      topWindows: topWindows(active.events, 8),
      summary: lastSummary?.text || '',
      summarySource: lastSummary?.source || 'none',
      questions: lastQuestions?.questions || []
    }
    this.state.sessions.push(session)
    if (this.state.sessions.length > 400) {
      this.state.sessions.splice(0, this.state.sessions.length - 400)
    }
    this.active = null
    this.runtime.breakUntil = 0
    this.runtime.paperGraceUntil = 0
    this.runtime.popupOpen = false
    this.runtime.nextShotAt = 0
    this.runtime.nextEncourageAt = 0
    this.stopFloating()
    this.stopWatcher()
    this.closePopup()
    void this.schedulePersist()
    return session
  }

  getStats(range = 'week') {
    const now = Date.now()
    const window = statsWindow(range, now)
    const sessions = this.state.sessions.filter((session) => session && session.startedAt >= window.start && session.startedAt <= now)
    const active = this.active
    if (active && active.startedAt >= window.start && active.startedAt <= now) {
      const lastSummary = active.summaries.length ? active.summaries[active.summaries.length - 1] : null
      const liveBreakMs = this.runtime.breakStartedAt ? Math.max(0, now - this.runtime.breakStartedAt) : 0
      sessions.push({
        id: active.id,
        domain: active.domain,
        startedAt: active.startedAt,
        studyMs: Math.max(0, now - active.startedAt - active.breakMs - liveBreakMs),
        popups: active.popups,
        encouragements: active.encouragements,
        summary: lastSummary?.text || '',
        topWindows: topWindows(active.events, 4),
        endedAt: now,
        active: true
      })
    }
    const minSessionMs = Math.max(1, Number(this.state.settings?.encourageMinutes) || 13) * 60 * 1000
    const included = sessions.filter((session) => (Number(session.studyMs) || 0) >= minSessionMs)
    const days = window.days.map((day) => ({ date: day.key, label: day.label, ms: 0 }))
    const dayMap = new Map(days.map((day) => [day.date, day]))
    const hours = Array.from({ length: 24 }, () => 0)
    let totalMs = 0
    let interruptions = 0
    let encouragements = 0
    let sessionCount = 0
    const domains = new Map()
    for (const session of included) {
      const ms = Math.max(0, Number(session.studyMs) || 0)
      totalMs += ms
      interruptions += Number(session.popups) || 0
      encouragements += Number(session.encouragements) || 0
      sessionCount += 1
      const domain = String(session.domain || '').trim()
      if (domain) {
        const item = domains.get(domain) || { domain, ms: 0, sessions: 0 }
        item.ms += ms
        item.sessions += 1
        domains.set(domain, item)
      }
      const date = new Date(session.startedAt)
      const day = dayMap.get(dateKey(date))
      if (day) day.ms += ms
      const hour = date.getHours()
      if (hour >= 0 && hour < 24) hours[hour] += ms
    }
    const domainList = [...domains.values()].sort((left, right) => right.ms - left.ms).slice(0, 6)
    const recent = included
      .filter((session) => session.domain)
      .sort((left, right) => right.startedAt - left.startedAt)
      .slice(0, 6)
      .map((session) => ({
        id: session.id,
        domain: session.domain,
        startedAt: session.startedAt,
        studyMs: Math.max(0, Number(session.studyMs) || 0),
        summary: String(session.summary || '').slice(0, 160),
        topWindows: Array.isArray(session.topWindows) ? session.topWindows.slice(0, 3) : [],
        active: Boolean(session.active)
      }))
    return {
      range,
      start: window.start,
      end: now,
      totalMs,
      interruptions,
      encouragements,
      sessions: sessionCount,
      avgMs: sessionCount ? Math.round(totalMs / sessionCount) : 0,
      domains: domainList,
      recent,
      days,
      hours
    }
  }

  snapshot() {
    const active = this.active
    const now = Date.now()
    let activeView = null
    if (active) {
      const breakActive = Boolean(this.runtime.breakStartedAt) || this.runtime.breakUntil > now
      const paperActive = this.runtime.paperGraceUntil > now
      const liveBreakMs = this.runtime.breakStartedAt ? Math.max(0, now - this.runtime.breakStartedAt) : 0
      const lastSummary = active.summaries.length ? active.summaries[active.summaries.length - 1] : null
      const lastQuestions = active.questions.length ? active.questions[active.questions.length - 1] : null
      activeView = {
        id: active.id,
        domain: active.domain,
        startedAt: active.startedAt,
        durationMs: Math.max(0, now - active.startedAt),
        studyMs: Math.max(0, now - active.startedAt - active.breakMs - liveBreakMs),
        lastStudyAt: active.lastStudyAt,
        status: this.runtime.popupOpen
          ? 'alert'
          : breakActive
            ? 'break'
            : paperActive
              ? 'paper'
              : now - active.lastStudyAt < 120000
                ? 'study'
                : 'idle',
        popups: active.popups,
        breaks: active.breaks,
        encouragements: active.encouragements,
        breakUntil: this.runtime.breakUntil,
        paperGraceUntil: this.runtime.paperGraceUntil,
        keywords: this.state.keywords[active.domain] || [],
        lastSummary,
        lastQuestions
      }
    }
    return {
      version: VERSION,
      active: activeView,
      settings: this.state.settings,
      visionAvailable: this.visionAvailable,
      stats: this.getStats('today'),
      week: this.getStats('week'),
      lastDomain: this.state.lastDomain || '',
      floating: Boolean(this.runtime.floatingProcess),
      lastError: this.runtime.lastError
    }
  }

  async updateSettings(patch) {
    const next = { ...this.state.settings }
    const wasFloating = this.state.settings.floating
    if (patch && typeof patch === 'object') {
      if ('screenshotMinSec' in patch) next.screenshotMinSec = clampInt(patch.screenshotMinSec, 0, 300, next.screenshotMinSec)
      if ('screenshotMaxSec' in patch) next.screenshotMaxSec = clampInt(patch.screenshotMaxSec, 1, 600, next.screenshotMaxSec)
      if ('vision' in patch) next.vision = Boolean(patch.vision)
      if ('breakMinutes' in patch) next.breakMinutes = clampInt(patch.breakMinutes, 1, 60, next.breakMinutes)
      if ('paperGraceMinutes' in patch) next.paperGraceMinutes = clampInt(patch.paperGraceMinutes, 1, 60, next.paperGraceMinutes)
      if ('encourageMinutes' in patch) next.encourageMinutes = clampInt(patch.encourageMinutes, 1, 120, next.encourageMinutes)
      if ('sound' in patch) next.sound = Boolean(patch.sound)
      if ('floating' in patch) next.floating = Boolean(patch.floating)
    }
    this.state.settings = normalizeSettings(next)
    if (wasFloating !== this.state.settings.floating) {
      if (this.state.settings.floating) await this.spawnFloating()
      else this.stopFloating()
    }
    await this.schedulePersist()
    return {
      settings: this.state.settings,
      visionAvailable: this.visionAvailable,
      floating: Boolean(this.runtime.floatingProcess)
    }
  }

  schedulePersist() {
    this.persistChain = this.persistChain
      .then(() => this.persistNow())
      .catch((error) => {
        this.log(`persist: ${errText(error)}`)
      })
    return this.persistChain
  }

  async persistNow() {
    const payload = {
      version: 1,
      settings: this.state.settings,
      keywords: this.state.keywords,
      sessions: this.state.sessions.slice(-400),
      lastDomain: this.state.lastDomain || '',
      weekly: this.state.weekly || {},
      updatedAt: Date.now()
    }
    await fs.mkdir(STATE_DIR, { recursive: true })
    const temporary = `${STATE_FILE}.tmp`
    await fs.writeFile(temporary, JSON.stringify(payload), 'utf8')
    await fs.rename(temporary, STATE_FILE)
  }

  randomShotMs() {
    const min = this.state.settings.screenshotMinSec * 1000
    const max = Math.max(min, this.state.settings.screenshotMaxSec * 1000)
    return min + Math.floor(Math.random() * (max - min + 1))
  }

  encourageMs() {
    return this.state.settings.encourageMinutes * 60000
  }

  powerShellPath() {
    const root = process.env.SystemRoot || 'C:\\Windows'
    const candidate = path.join(root, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
    return existsSync(candidate) ? candidate : 'powershell.exe'
  }

  runCapture(imagePath, jsonPath) {
    return new Promise((resolve) => {
      const script = path.join(SCRIPTS_DIR, 'capture.ps1')
      const args = [
        '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
        '-File', script,
        '-OutPath', imagePath,
        '-JsonPath', jsonPath,
        '-MaxWidth', '1280'
      ]
      let stdout = ''
      let stderr = ''
      let settled = false
      const child = spawn(this.powerShellPath(), args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        try {
          child.kill()
        } catch {
          // already gone
        }
        resolve({ ok: false, error: 'capture timeout' })
      }, 25000)
      const finish = (value) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(value)
      }
      child.stdout.on('data', (data) => {
        stdout += String(data)
        if (stdout.length > 200000) stdout = stdout.slice(-200000)
      })
      child.stderr.on('data', (data) => {
        stderr += String(data)
        if (stderr.length > 4000) stderr = stderr.slice(-4000)
      })
      child.on('error', (error) => finish({ ok: false, error: errText(error) }))
      child.on('exit', async (code) => {
        if (code !== 0) {
          finish({ ok: false, error: `capture exit ${code} ${stderr.slice(-500)}` })
          return
        }
        let parsed = null
        try {
          parsed = JSON.parse(await fs.readFile(jsonPath, 'utf8'))
        } catch {
          // fall back to stdout below
        }
        if (!parsed) {
          const lines = stdout.trim().split(/\r?\n/).filter(Boolean)
          try {
            parsed = JSON.parse(lines[lines.length - 1] || '{}')
          } catch {
            parsed = null
          }
        }
        finish(parsed && typeof parsed === 'object' ? parsed : { ok: false, error: `capture json missing ${stderr.slice(-300)}` })
      })
    })
  }

  ensureWatcher() {
    if (this.disposed || this.runtime.watcher) return
    try {
      const child = spawn(this.powerShellPath(), [
        '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
        '-File', path.join(SCRIPTS_DIR, 'foreground.ps1')
      ], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
      const reader = readline.createInterface({ input: child.stdout })
      reader.on('line', (line) => {
        try {
          const parsed = JSON.parse(line)
          if (parsed && typeof parsed === 'object') {
            this.runtime.foreground = {
              process: String(parsed.process || ''),
              title: String(parsed.title || ''),
              at: Number(parsed.at) || Date.now()
            }
          }
        } catch {
          // ignore partial/non-json lines
        }
      })
      child.stderr?.on('data', (data) => {
        this.runtime.watcherErr = String(data).slice(-500)
      })
      child.on('error', (error) => {
        this.log(`watcher error: ${errText(error)}`)
      })
      child.on('exit', () => {
        if (this.runtime.watcher === child) this.runtime.watcher = null
        if (this.active && !this.disposed) setTimeout(() => this.ensureWatcher(), 5000)
      })
      this.runtime.watcher = child
    } catch (error) {
      this.log(`ensureWatcher: ${errText(error)}`)
    }
  }

  stopWatcher() {
    const child = this.runtime.watcher
    this.runtime.watcher = null
    if (child) {
      try {
        child.kill()
      } catch {
        // already gone
      }
    }
  }

  floatScriptPath() {
    return path.join(SCRIPTS_DIR, 'float.ps1')
  }

  async spawnFloating() {
    if (this.disposed || !this.active || !this.state.settings.floating) return
    if (this.runtime.floatingProcess) return
    const script = this.floatScriptPath()
    if (!existsSync(script)) {
      this.log('float.ps1 missing')
      return
    }
    let origin = 'http://127.0.0.1:14444'
    try {
      if (this.webServer && typeof this.webServer.getOrigin === 'function') {
        const value = await this.webServer.getOrigin()
        if (typeof value === 'string' && value.trim()) origin = value.trim()
      }
    } catch {
      // use the default GUI origin
    }
    const apiBase = origin.replace(/\/+$/, '')
    let child
    try {
      child = spawn(this.powerShellPath(), [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        script,
        '-ApiBase',
        apiBase,
        '-ApiPrefix',
        API_PREFIX
      ], { windowsHide: true, stdio: 'ignore' })
    } catch (error) {
      this.log(`spawnFloating: ${errText(error)}`)
      return
    }
    this.runtime.floatingProcess = child
    child.on('exit', () => {
      if (this.runtime.floatingProcess === child) this.runtime.floatingProcess = null
    })
    child.on('error', (error) => {
      if (this.runtime.floatingProcess === child) this.runtime.floatingProcess = null
      this.log(`floating: ${errText(error)}`)
    })
  }

  stopFloating() {
    const child = this.runtime.floatingProcess
    this.runtime.floatingProcess = null
    if (child) {
      try {
        child.kill()
      } catch {
        // already gone
      }
    }
  }

  async setFloating(show) {
    const enabled = Boolean(show)
    this.state.settings = normalizeSettings({ ...this.state.settings, floating: enabled })
    if (enabled) await this.spawnFloating()
    else this.stopFloating()
    await this.schedulePersist()
    return this.snapshot()
  }

  buildWeeklyDigest(data) {
    const lines = []
    lines.push(`本周学习总时长：${formatSpan(data.totalMs)}；学习天数：${data.dayCount} 天；共 ${data.sessionCount} 段。`)
    lines.push(`领域：${data.domains.length ? data.domains.map((item) => `${item.domain}（${formatSpan(item.ms)}）`).join('、') : '—'}`)
    lines.push(`每天：${data.stats.days.map((day) => `${day.label} ${formatSpan(day.ms)}`).join('；')}`)
    lines.push('分段记录：')
    for (const session of data.sessions.slice(0, 12)) {
      const date = new Date(session.startedAt)
      const clock = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      const summary = String(session.summary || '').replace(/\s+/g, ' ').trim().slice(0, 180)
      const tops = (session.topWindows || []).slice(0, 2).map((item) => item.title).filter(Boolean).join(' / ')
      lines.push(`- ${clock} · ${session.domain} · ${formatSpan(session.studyMs)}${session.active ? ' · 进行中' : ''}${summary ? ` · 总结：${summary}` : ''}${tops ? ` · 窗口：${tops}` : ''}`)
    }
    return lines.join('\n')
  }

  fallbackWeeklyText(data) {
    if (!data.sessions.length) {
      return '这一周还没有留下学习记录呢。等你开始第一段，人家再把这一周的光慢慢数给你听呀。'
    }
    const domains = data.domains.slice(0, 2).map((item) => `「${item.domain}」`).join('和')
    const best = data.stats.days.reduce((left, right) => (right.ms > left.ms ? right : left), data.stats.days[0] || { label: '', ms: 0 })
    const bestText = best && best.ms > 0 ? `，最亮的一天是 ${best.label}` : ''
    return `这一周，人家在记忆里数了数：你一共学了 ${formatSpan(data.totalMs)}，来了 ${data.dayCount} 天，留下 ${data.sessionCount} 段小小的光。${domains ? `你大多在${domains}上停留` : '你还在找自己的节奏'}${bestText}。\n\n辛苦了，伙伴。能把时间一点点攒起来，本身就很了不起。下周不用一下子走很远，只要还愿意回来，人家就还在这里陪你呀。♪`
  }

  everEncouragements() {
    let total = 0
    for (const session of this.state.sessions) {
      total += Math.max(0, Number(session.encouragements) || 0)
    }
    if (this.active) total += Math.max(0, Number(this.active.encouragements) || 0)
    return total
  }

  async generateWeeklyPraise(data) {
    if (this.everEncouragements() <= 0) {
      return { text: '', source: 'none' }
    }
    if (!data.sessions.length) {
      return { text: this.fallbackWeeklyText(data), source: 'local' }
    }
    const digest = this.buildWeeklyDigest(data)
    const prompt = [
      `这一周（${new Date(data.weekStart).toLocaleDateString('zh-CN')} 至 ${new Date(data.weekEnd).toLocaleDateString('zh-CN')}）的学习记录如下：`,
      digest,
      '',
      '请用昔涟的语气写一份周报，分三小段：',
      '1）这一周你学了什么：3-5 条，具体到领域/内容，不要编造记录里没有的东西；',
      '2）下周可以怎么继续：2-3 条，温和、可执行；',
      '3）夸夸伙伴：1 段，真诚、具体、不夸张，称呼「伙伴」。',
      '只输出正文，不要标题，不要 markdown 代码块，总共 250-450 字。'
    ].join('\n')
    try {
      const output = await this.complete({
        system: CYRENE_SYSTEM,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        maxTokens: 1000,
        temperature: 0.7,
        reasoningEffort: 'low'
      })
      const text = cleanModelText(output.text)
      if (text) return { text, source: 'model' }
    } catch (error) {
      this.log(`weekly: ${errText(error)}`)
    }
    return { text: this.fallbackWeeklyText(data), source: 'local' }
  }

  async weeklyReport(refresh = false) {
    const stats = this.getStats('week')
    const everEncouragements = this.everEncouragements()
    const canPraise = everEncouragements > 0
    const now = Date.now()
    const sessions = this.state.sessions
      .filter((session) => session && session.startedAt >= stats.start && session.startedAt <= stats.end)
      .map((session) => ({
        id: session.id,
        domain: session.domain,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        studyMs: session.studyMs,
        summary: session.summary || '',
        topWindows: session.topWindows || [],
        popups: session.popups || 0,
        active: false
      }))
    if (this.active && this.active.startedAt >= stats.start && this.active.startedAt <= stats.end) {
      const lastSummary = this.active.summaries.length ? this.active.summaries[this.active.summaries.length - 1] : null
      sessions.push({
        id: this.active.id,
        domain: this.active.domain,
        startedAt: this.active.startedAt,
        endedAt: now,
        studyMs: Math.max(0, now - this.active.startedAt - this.active.breakMs
          - (this.runtime.breakStartedAt ? Math.max(0, now - this.runtime.breakStartedAt) : 0)),
        summary: lastSummary?.text || '',
        topWindows: topWindows(this.active.events, 4),
        popups: this.active.popups,
        active: true
      })
    }
    sessions.sort((left, right) => right.startedAt - left.startedAt)
    const domainMap = new Map()
    for (const session of sessions) {
      const current = domainMap.get(session.domain) || { domain: session.domain, ms: 0, count: 0 }
      current.ms += Math.max(0, Number(session.studyMs) || 0)
      current.count += 1
      domainMap.set(session.domain, current)
    }
    const domains = Array.from(domainMap.values()).sort((left, right) => right.ms - left.ms)
    const dayCount = stats.days.filter((day) => day.ms > 0).length
    const weekKey = dateKey(new Date(stats.start))
    let cached = this.state.weekly[weekKey]
    if (!canPraise && cached) {
      delete this.state.weekly[weekKey]
      cached = undefined
      void this.schedulePersist()
    }
    const totalMs = stats.totalMs
    const stale = Boolean(cached && (cached.sessionCount !== sessions.length || Math.abs((cached.totalMs || 0) - totalMs) > 60000))
    let praise = cached?.text || ''
    let praiseSource = cached?.source || 'none'
    let generatedAt = cached?.generatedAt || 0
    if (refresh && canPraise) {
      const generated = await this.generateWeeklyPraise({
        weekStart: stats.start,
        weekEnd: stats.end,
        stats,
        sessions,
        domains,
        dayCount,
        sessionCount: sessions.length,
        totalMs
      })
      praise = generated.text
      praiseSource = generated.source
      generatedAt = Date.now()
      this.state.weekly[weekKey] = {
        text: praise,
        source: praiseSource,
        generatedAt,
        sessionCount: sessions.length,
        totalMs
      }
      const keys = Object.keys(this.state.weekly)
      if (keys.length > 12) {
        keys.sort()
        for (const key of keys.slice(0, keys.length - 12)) delete this.state.weekly[key]
      }
      void this.schedulePersist()
    }
    return {
      weekKey,
      weekStart: stats.start,
      weekEnd: stats.end,
      stats,
      totalMs,
      sessionCount: sessions.length,
      dayCount,
      domains,
      sessions,
      praise,
      praiseSource,
      generatedAt,
      everEncouragements,
      canPraise,
      stale: refresh ? false : stale
    }
  }

  async handleApi(request, response) {
    if (request.headers['x-study-with-cyrene'] !== '1') {
      sendJson(response, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
      return
    }
    const url = new URL(request.url || '/', 'http://localhost')
    const sub = url.pathname.startsWith(`${API_PREFIX}/`)
      ? url.pathname.slice(API_PREFIX.length)
      : '/'
    try {
      if (request.method === 'GET' && sub === '/health') {
        sendJson(response, 200, {
          ok: true,
          value: {
            version: VERSION,
            api: true,
            visionAvailable: this.visionAvailable,
            provider: this.provider,
            model: this.model,
            active: Boolean(this.active)
          }
        })
        return
      }
      if (request.method === 'GET' && sub === '/state') {
        sendJson(response, 200, { ok: true, value: this.snapshot() })
        return
      }
      if (request.method === 'GET' && sub === '/settings') {
        sendJson(response, 200, {
          ok: true,
          value: { settings: this.state.settings, visionAvailable: this.visionAvailable }
        })
        return
      }
      if (request.method === 'GET' && sub === '/stats') {
        const range = url.searchParams.get('range') || 'week'
        sendJson(response, 200, { ok: true, value: this.getStats(range) })
        return
      }
      if (request.method === 'GET' && sub === '/weekly') {
        sendJson(response, 200, { ok: true, value: await this.weeklyReport(false) })
        return
      }
      if (request.method === 'POST' && sub === '/start') {
        const body = await readJsonBody(request)
        const value = await this.startSession(body.domain)
        sendJson(response, 200, { ok: true, value })
        return
      }
      if (request.method === 'POST' && sub === '/end') {
        const value = await this.endSession()
        sendJson(response, 200, { ok: true, value })
        return
      }
      if (request.method === 'POST' && sub === '/summary') {
        const value = await this.generateSummary()
        sendJson(response, 200, { ok: true, value })
        return
      }
      if (request.method === 'POST' && sub === '/questions') {
        const body = await readJsonBody(request)
        const value = await this.generateQuestions(body.note)
        sendJson(response, 200, { ok: true, value })
        return
      }
      if (request.method === 'POST' && sub === '/break') {
        const value = this.startBreak()
        sendJson(response, 200, { ok: true, value })
        return
      }
      if (request.method === 'POST' && sub === '/weekly/summary') {
        sendJson(response, 200, { ok: true, value: await this.weeklyReport(true) })
        return
      }
      if (request.method === 'POST' && sub === '/floating') {
        const body = await readJsonBody(request)
        const value = await this.setFloating(Boolean(body.show))
        sendJson(response, 200, { ok: true, value })
        return
      }
      if (request.method === 'POST' && sub === '/settings') {
        const body = await readJsonBody(request)
        const value = await this.updateSettings(body)
        sendJson(response, 200, { ok: true, value })
        return
      }
      sendJson(response, 404, { ok: false, error: { code: 'not_found', message: `unknown api: ${sub}` } })
    } catch (error) {
      sendJson(response, 400, { ok: false, error: { code: 'bad_request', message: errText(error) } })
    }
  }

  async dispose() {
    if (this.disposed) return
    this.disposed = true
    if (this.tickTimer) {
      clearInterval(this.tickTimer)
      this.tickTimer = null
    }
    if (this.apiTimer) {
      clearInterval(this.apiTimer)
      this.apiTimer = null
    }
    try {
      this.routeDisposer?.()
    } catch {
      // route already disposed
    }
    this.routeDisposer = null
    this.stopFloating()
    this.stopWatcher()
    this.closePopup()
    await this.schedulePersist().catch(() => {})
  }

  log(message) {
    const line = `[study-with-cyrene] ${message}`
    try {
      if (this.ctx.logger?.info) this.ctx.logger.info(line)
      else this.ctx.logger?.warn?.(line)
    } catch {
      // logging must never break the engine
    }
  }
}

export function apply(ctx) {
  try {
    const engine = new StudyEngine(ctx)
    void engine.start().catch((error) => {
      ctx.logger?.warn?.(`[study-with-cyrene] start failed: ${errText(error)}`)
    })
    if (typeof ctx.effect === 'function') {
      ctx.effect(() => () => {
        void engine.dispose()
      }, 'dsh-study-with-cyrene: dispose')
    }
  } catch (error) {
    ctx.logger?.warn?.(`[study-with-cyrene] apply failed: ${errText(error)}`)
  }
}
