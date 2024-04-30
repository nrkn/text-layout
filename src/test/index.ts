import { GlobalFonts, createCanvas } from '@napi-rs/canvas'

import {
  Block, DrawRun, FitterOptions, MeasureRunAscent, MeasureRunWidth, TextRun,
  WrappedBlock
} from '../types.js'

import { runsToWords } from '../words.js'
import { lineAscent, runsToLines } from '../lines.js'
import { blockScaler } from '../scale.js'
import { writeFile } from 'fs/promises'
import { drawBlock, drawRunAligned } from '../draw.js'
import { hardWrapper, softWrapper } from '../wrap.js'
import { defaultFitterOptions, fitter } from '../fit.js'
import { solidFitter } from '../solid.js'
import { containFit } from '../contain.js'

const boldName = 'NotoBold'
const italicName = 'NotoBoldItalic'
const emojiName = 'NotoEmoji'

GlobalFonts.registerFromPath('./data/fonts/NotoEmoji-Bold.ttf', emojiName)
GlobalFonts.registerFromPath('./data/fonts/NotoSans-Bold.ttf', boldName)
GlobalFonts.registerFromPath('./data/fonts/NotoSans-BoldItalic.ttf', italicName)

const testText0 = `🐈Sphinx of black⚫ 💎quartz, judge👩‍⚖️ 🙂my vow💍.\n\n`
const testText1 = `Amazingly😲 🤏few discotheques💃 🎁provide jukeboxes🎶.\n\n`
const testText2 = `🎒Pack my🙂 📦box with five🕔 🕛dozen liquor🍸 🏺jugs.`

const wideWordText = `\n\nAmazingly😲🤏FewDiscotheques💃🎁ProvideJukeboxes🎶.`

const testSolidText0 = 'Amazingly\nFew Discotheques\nProvide Jukeboxes'

const testSolidText1 = testSolidText0 + '\n\nSphinx\nof black\nquartz\njudge\nmy vow'

const emojiSplitRegex = /(\p{Emoji}+)|(\P{Emoji}+)/gu
const emojiTestRegex = /\p{Emoji}/u

const textSize = 80

const outWidth = textSize * 24
const outHeight = textSize * 16

let xOff = outWidth / 8
let yOff = outHeight / 8

let textW = xOff * 6
let textH = yOff * 6

const textColor = '#0e1f41'
const emojiColor = '#b7410e'
const mixedColor = '#0e411f'

const splitOnEmoji = (text: string): string[] => {
  return text.match(emojiSplitRegex) || []
}

const textWithEmojiToRuns = (
  text: string, fontFamily = boldName, emojiFontFamily = emojiName
) => {
  const rawRuns = splitOnEmoji(text)

  const runs = rawRuns.map(t => {
    const isEmoji = t.match(emojiTestRegex)

    const run: TextRun = {
      text: t,
      fontFamily: isEmoji ? emojiFontFamily : fontFamily,
      fontSize: textSize,
      lineHeight: 1.2,
      color: isEmoji ? emojiColor : textColor
    }

    return run
  })

  return runs
}

const runToCssFontString = (run: TextRun) =>
  `${run.fontSize}px ${run.fontFamily}`

// pre process sample text into runs
const textRuns0 = textWithEmojiToRuns(testText0)
const textRuns1 = textWithEmojiToRuns(testText1, italicName)
const textRuns2: TextRun[] = [
  {
    text: testText2,
    fontFamily: `${boldName}, ${emojiName}`,
    fontSize: textSize,
    lineHeight: 1.2,
    color: mixedColor
  }
]

const textRuns3 = textWithEmojiToRuns(wideWordText)

// solid blocks work best in uppercase 
const solidRuns0 = [
  {
    text: testSolidText0.toUpperCase(),
    fontFamily: boldName,
    fontSize: textSize,
    lineHeight: 1.2,
    color: textColor
  }
]

const solidRuns1 = [
  {
    text: testSolidText1.toUpperCase(),
    fontFamily: boldName,
    fontSize: textSize,
    lineHeight: 1.2,
    color: textColor
  }
]

const sampleTextRuns = [...textRuns0, ...textRuns1, ...textRuns2]

const sampleTextRunsWithLong = [
  ...textRuns0, ...textRuns1, ...textRuns2, ...textRuns3
]

const start = async (generateOutput = false) => {
  // setup canvas

  const canvas = createCanvas(outWidth, outHeight)
  const ctx = canvas.getContext('2d')

  // setup measuring functions

  const getMetrics = (run: TextRun) => {
    ctx.font = runToCssFontString(run)

    return ctx.measureText(run.text)
  }

  const measure: MeasureRunWidth = run => getMetrics(run).width

  const measureAscent: MeasureRunAscent = run =>
    getMetrics(run).actualBoundingBoxAscent

  const getAscent = lineAscent(measureAscent)


  const getLeft = (run: TextRun) => getMetrics(run).actualBoundingBoxLeft

  // setup drawing

  let isMetrics = true

  const drawRun: DrawRun = (run, x, y) => {
    if (!generateOutput) return

    if (isMetrics) drawMetrics(run, x, y)

    ctx.font = runToCssFontString(run)
    ctx.fillStyle = run.color || 'black'
    ctx.fillText(run.text, x, y)
  }

  const drawRunFlushLeft: DrawRun = (run, x, y, word, line, block) => {
    if (!generateOutput) return

    const isLeftmost = run === line.words[0].runs[0]

    const left = isLeftmost ? getLeft(run) : 0

    drawRun(run, x + left, y, word, line, block)
  }

  const drawRunCentered = drawRunAligned(drawRun, 'center')
  const drawRunRight = drawRunAligned(drawRun, 'right')

  const drawFlushLeft = drawBlock(drawRunFlushLeft)
  const drawCentered = drawBlock(drawRunCentered)
  const drawRight = drawBlock(drawRunRight)

  // canvas helpers

  const drawBg = () => {
    if (!generateOutput) return

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, outWidth, outHeight)

    ctx.strokeStyle = 'cyan'
    ctx.lineWidth = 1
    ctx.strokeRect(xOff, yOff, textW, textH)
  }

  //


  const logJsonBlock = (obj: any) => {
    if (!generateOutput) return

    console.log('```json\n' + JSON.stringify(obj, null, 2) + '\n```')
  }

  const log = (...args: any[]) => {
    if (!generateOutput) return

    console.log(...args)
  }

  const savePng = async (path: string) => {
    if (!generateOutput) return

    const png = canvas.toBuffer('image/png')

    await writeFile(path, png)
  }

  const drawHelper = async (
    block: WrappedBlock, name: string, draw = drawFlushLeft
  ) => {
    if (!generateOutput) return

    // draw background and bounds rect
    drawBg()

    // draw text

    let x = xOff
    let y = yOff

    // allow for the difference in ascent between the first line and the rest
    // so that the text is drawn *inside* the rectangle rather than with the 
    // top as the baseline
    if (block.lines.length) {
      y += getAscent(block.lines[0])
    }

    draw(block, x, y)

    // save to file
    await savePng(`./data/test/${name}.png`)
  }

  const drawLine = (
    x1: number, y1: number, x2: number, y2: number
  ) => {
    ctx.lineWidth = 0.25
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  const drawMetrics = (run: TextRun, x: number, y: number) => {
    const {
      actualBoundingBoxAscent, actualBoundingBoxDescent,
      fontBoundingBoxAscent, fontBoundingBoxDescent,
      width,
      actualBoundingBoxLeft, actualBoundingBoxRight
    } = getMetrics(run)

    // first, ascent
    ctx.strokeStyle = 'green'
    const ascentY = y - actualBoundingBoxAscent
    drawLine(x, ascentY, x + width, ascentY)

    // then descent
    ctx.strokeStyle = 'blue'
    const descentY = y + actualBoundingBoxDescent
    drawLine(x, descentY, x + width, descentY)

    // font bounding ascent
    ctx.strokeStyle = 'red'
    const fbaY = y - fontBoundingBoxAscent
    drawLine(x, fbaY, x + width, fbaY)

    // font bounding descent
    ctx.strokeStyle = 'orange'
    const fbdY = y + fontBoundingBoxDescent
    drawLine(x, fbdY, x + width, fbdY)

    // actual left
    ctx.strokeStyle = 'purple'
    const leftX = x - actualBoundingBoxLeft
    drawLine(leftX, ascentY, leftX, descentY)

    // actual right
    ctx.strokeStyle = 'brown'
    const rightX = x + actualBoundingBoxRight
    drawLine(rightX, ascentY, rightX, descentY)

    // left
    ctx.strokeStyle = 'teal'
    drawLine(x, fbaY, x, fbdY)

    // right
    ctx.strokeStyle = 'pink'
    drawLine(x + width, fbaY, x + width, fbdY)
  }

  // runs

  log('runs')
  logJsonBlock(textRuns0)

  // words

  const rtw = runsToWords(measure)

  const words = rtw(sampleTextRuns)

  log('words')
  logJsonBlock(words)

  // lines

  const rtl = runsToLines(measure)

  const lines = rtl(sampleTextRuns)

  log('lines')
  logJsonBlock(lines)

  // block

  const hardWrap = hardWrapper(measure)
  const hardBlock = hardWrap(sampleTextRuns)
  const softBlock = softWrapper(textW)(hardBlock)

  log('wrapped')
  logJsonBlock(softBlock)

  await drawHelper(softBlock, 'output')

  // again, centered

  await drawHelper(softBlock, 'output-centered', drawCentered)

  // again, right

  await drawHelper(softBlock, 'output-right', drawRight)

  // what happens with wrapping when a really long word is present?

  const wideHardBlock = hardWrap(sampleTextRunsWithLong)
  const wideBlock = softWrapper(textW)(wideHardBlock)

  await drawHelper(wideBlock, 'output-wide')

  // solid text

  const solidHardBlock = hardWrap(solidRuns0)
  const solidFit = solidFitter(textW)
  const solidBlock = solidFit(solidHardBlock)

  await drawHelper(solidBlock, 'output-solid')

  // longer solid text

  const solidHardBlock1 = hardWrap(solidRuns1)
  const solidBlock1 = solidFit(solidHardBlock1)

  await drawHelper(solidBlock1, 'output-solid1')

  // now contain it so doesn't exceed height  

  const containedBlock1 = containFit({ width: textW, height: textH })(solidBlock1)

  await drawHelper(containedBlock1, 'output-solid1-contained', drawCentered)

  // save to file

  await savePng('./data/test/output-solid1-contained.png')

  // fitting

  log('fitting')

  const shBlock = hardWrapper(measure)(sampleTextRuns)

  let totalMs = 0
  let runs = 0

  const doFit = async (
    block: Block, suffix: string,
    options: Partial<FitterOptions> = {},
    draw = drawFlushLeft
  ) => {
    const fit = fitter({ width: textW, height: textH }, options)

    const shStartTime = process.hrtime.bigint()
    const shResult = fit(block)
    const shEndTime = process.hrtime.bigint()

    const { strategy, scale, iterations, foundDuring, wrapped } = shResult

    const ms = Number(shEndTime - shStartTime) / 1e6

    totalMs += ms
    runs++

    log(
      `fit ${suffix} took (ms):`, ms,
      { strategy, scale, iterations, foundDuring }
    )

    await drawHelper(wrapped, `output-${suffix}`, draw)
  }

  const doubleScaler = blockScaler(2)
  const halfScaler = blockScaler(0.5)
  const tenXScaler = blockScaler(10)
  const tenthScaler = blockScaler(0.1)

  const doubledBlock = doubleScaler(shBlock)
  const halvedBlock = halfScaler(shBlock)
  const tenXBlock = tenXScaler(shBlock)
  const tenthBlock = tenthScaler(shBlock)

  // default options 
  log('default options', defaultFitterOptions())
  await doFit(shBlock, 'sh1x')
  await doFit(doubledBlock, 'sh2x')
  await doFit(tenXBlock, 'sh10x')
  await doFit(tenthBlock, 'sh0_1x')
  await doFit(halvedBlock, 'sh0_5x')

  // centered, and just 1x
  log('centered fit')
  const oldIsMets = isMetrics
  isMetrics = false
  await doFit(shBlock, 'sh1x_centered', defaultFitterOptions(), drawCentered)
  isMetrics = oldIsMets

  // try a smaller tolerance (0.1 vs def of 1)
  log('small tolerance', Object.assign(defaultFitterOptions(), { tolerance: 0.1 }))
  await doFit(shBlock, 'sh1x_tol_0_1', { tolerance: 0.1 })
  await doFit(doubledBlock, 'sh2x_tol_0_1', { tolerance: 0.1 })
  await doFit(tenXBlock, 'sh10x_tol_0_1', { tolerance: 0.1 })
  await doFit(tenthBlock, 'sh0_1x_tol_0_1', { tolerance: 0.1 })
  await doFit(halvedBlock, 'sh0_5x_tol_0_1', { tolerance: 0.1 })

  // try a larger tolerance (10 vs def of 1)
  log('large tolerance', Object.assign(defaultFitterOptions(), { tolerance: 10 }))
  await doFit(shBlock, 'sh1x_tol_10', { tolerance: 10 })
  await doFit(doubledBlock, 'sh2x_tol_10', { tolerance: 10 })
  await doFit(tenXBlock, 'sh10x_tol_10', { tolerance: 10 })
  await doFit(tenthBlock, 'sh0_1x_tol_10', { tolerance: 10 })
  await doFit(halvedBlock, 'sh0_5x_tol_10', { tolerance: 10 })

  // try a smaller scale step (1.1 vs def of 2)
  log('small scale', Object.assign(defaultFitterOptions(), { scaleStep: 1.1 }))
  await doFit(shBlock, 'sh1x_ss_1_1', { scaleStep: 1.1 })
  await doFit(doubledBlock, 'sh2x_ss_1_1', { scaleStep: 1.1 })
  await doFit(tenXBlock, 'sh10x_ss_1_1', { scaleStep: 1.1 })
  await doFit(tenthBlock, 'sh0_1x_ss_1_1', { scaleStep: 1.1 })
  await doFit(halvedBlock, 'sh0_5x_ss_1_1', { scaleStep: 1.1 })

  // try a larger scale step (4 vs def of 2)
  log('large scale', Object.assign(defaultFitterOptions(), { scaleStep: 4 }))
  await doFit(shBlock, 'sh1x_ss_4', { scaleStep: 4 })
  await doFit(doubledBlock, 'sh2x_ss_4', { scaleStep: 4 })
  await doFit(tenXBlock, 'sh10x_ss_4', { scaleStep: 4 })
  await doFit(tenthBlock, 'sh0_1x_ss_4', { scaleStep: 4 })
  await doFit(halvedBlock, 'sh0_5x_ss_4', { scaleStep: 4 })

  // try tiny tolerance eg close to exact fit - increase iterations to compensate
  const maxIterations = 1e5
  const tolerance = 1e-6
  log('very low tolerance', Object.assign(defaultFitterOptions(), { tolerance, maxIterations }))
  await doFit(shBlock, 'sh1x_tol_1e_5', { tolerance, maxIterations })
  await doFit(doubledBlock, 'sh2x_tol_1e_5', { tolerance, maxIterations })
  await doFit(tenXBlock, 'sh10x_tol_1e_5', { tolerance, maxIterations })
  await doFit(tenthBlock, 'sh0_1x_tol_1e_5', { tolerance, maxIterations })
  await doFit(halvedBlock, 'sh0_5x_tol_1e_5', { tolerance, maxIterations })

  // fit using shrink only
  log('shrink only', Object.assign(defaultFitterOptions(), { fitType: 'shrink' }))
  await doFit(shBlock, 'sh1x_shrink', { fitType: 'shrink' })
  await doFit(doubledBlock, 'sh2x_shrink', { fitType: 'shrink' })
  await doFit(tenXBlock, 'sh10x_shrink', { fitType: 'shrink' })
  await doFit(tenthBlock, 'sh0_1x_shrink', { fitType: 'shrink' })
  await doFit(halvedBlock, 'sh0_5x_shrink', { fitType: 'shrink' })

  // fitting when a word is too wide
  const fitWideWordBlock = hardWrapper(measure)(sampleTextRunsWithLong)

  const doubledFitWideBlock = doubleScaler(fitWideWordBlock)
  const halvedFitWideBlock = halfScaler(fitWideWordBlock)
  const tenXFitWideBlock = tenXScaler(fitWideWordBlock)
  const tenthFitWideBlock = tenthScaler(fitWideWordBlock)

  // just use default options for this one
  log('fit wide word')
  await doFit(fitWideWordBlock, 'wide-word_sh1x')
  await doFit(doubledFitWideBlock, 'wide-word_sh2x')
  await doFit(tenXFitWideBlock, 'wide-word_sh10x')
  await doFit(tenthFitWideBlock, 'wide-word_sh0_1x')
  await doFit(halvedFitWideBlock, 'wide-word_sh0_5x')

  // fit that is known to fail, eg a close fit not possible

  const noCloseRuns: TextRun[] = [
    {
      text: "Sphinx of black quartz, judge my vow.\n\nThe quick brown fox jumps over the lazy dog.",
      fontFamily: "NotoBold",
      fontSize: 80,
      lineHeight: 1.2,
      color: "#b7410e"
    }
  ]

  const hardNoCloseBlock = hardWrapper(measure)(noCloseRuns)

  const noCloseFitSize = { width: 800, height: 600 }

  const doNoCloseFit = async (
    block: Block, suffix: string,
    options: Partial<FitterOptions> = {},
    draw = drawFlushLeft
  ) => {
    const fit = fitter(noCloseFitSize, options)

    const shStartTime = process.hrtime.bigint()
    const shResult = fit(block)
    const shEndTime = process.hrtime.bigint()

    const { strategy, scale, iterations, foundDuring, wrapped } = shResult

    const ms = Number(shEndTime - shStartTime) / 1e6

    totalMs += ms
    runs++

    log(
      `fit ${suffix} took (ms):`, ms,
      { strategy, scale, iterations, foundDuring }
    )

    const oXOff = xOff
    const oYOff = yOff

    const oTextW = textW
    const oTextH = textH

    xOff = 0
    yOff = 0
    textW = noCloseFitSize.width
    textH = noCloseFitSize.height

    await drawHelper(wrapped, `output-${suffix}`, draw)

    xOff = oXOff
    yOff = oYOff
    textW = oTextW
    textH = oTextH
  }

  await doNoCloseFit(hardNoCloseBlock, 'no-fit')

  //

  log('fit runs:', runs)
  log('total time ms:', totalMs)
  log('average time ms:', totalMs / runs)

  return { runs, totalMs }
}

const runTests = async (isBenchmark = false) => {
  await start(true)

  if (!isBenchmark) return

  let runs = 0
  let totalMs = 0

  const runSuiteCount = 100

  console.log('-'.repeat(20))
  console.log('running x:', runSuiteCount)

  for (let i = 0; i < runSuiteCount; i++) {
    const res = await start()

    runs += res.runs
    totalMs += res.totalMs
  }

  console.log('-'.repeat(20))

  console.log('total runs:', runs)
  console.log('total time ms:', totalMs)
  console.log('average time ms:', totalMs / runs)
}

const doBenchmarks = false

runTests(doBenchmarks).catch(console.error)
