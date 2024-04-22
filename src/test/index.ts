import { GlobalFonts, createCanvas } from '@napi-rs/canvas'

import {
  Block, DrawRun, Line, MeasureRunAscent, MeasureRunWidth, MeasuredRun, TextRun,
  Word
} from '../types.js'

import { runsToWords } from '../words.js'
import { lineAscent, runsToLines } from '../lines.js'
import { runsToBlock } from '../blocks.js'
import { writeFile } from 'fs/promises'
import { drawBlock } from '../draw.js'

const boldName = 'NotoBold'
const italicName = 'NotoBoldItalic'
const emojiName = 'NotoEmoji'

GlobalFonts.registerFromPath('./data/fonts/NotoEmoji-Bold.ttf', emojiName)
GlobalFonts.registerFromPath('./data/fonts/NotoSans-Bold.ttf', boldName)
GlobalFonts.registerFromPath('./data/fonts/NotoSans-BoldItalic.ttf', italicName)

const testText0 = `🐈Sphinx of black⚫ 💎quartz, judge👩‍⚖️ 🙂my vow💍.\n\n`
const testText1 = `Amazingly😲 🤏few discotheques💃 🎁provide jukeboxes🎶.\n\n`
const testText2 = `🎒Pack my🙂 📦box with five🕔 🕛dozen liquor🍸 🏺jugs.`

const emojiSplitRegex = /(\p{Emoji}+)|(\P{Emoji}+)/gu
const emojiTestRegex = /\p{Emoji}/u

const textSize = 80

const outWidth = textSize * 24
const outHeight = textSize * 16

const eighthW = outWidth / 8
const eighthH = outHeight / 8

const inW = eighthW * 6
const inH = eighthH * 6

const textColor = '#0e1f41'
const emojiColor = '#b7410e'
// dark green
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

const sampleTextRuns = [...textRuns0, ...textRuns1, ...textRuns2]

const start = async () => {
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

  const drawRun: DrawRun = (run, x, y) => {
    ctx.font = runToCssFontString(run)
    ctx.fillStyle = run.color || 'black'
    ctx.fillText(run.text, x, y)
  }

  const drawRunFlushLeft: DrawRun = (run, x, y, word, line, block) => {
    const isLeftmost = run === line.words[0].runs[0]

    const left = isLeftmost ? getLeft(run) : 0

    drawRun(run, x + left, y, word, line, block)
  }

  const drawRunCentered = (baseDraw: DrawRun): DrawRun =>
    (run, x, y, word, line, block) => {
      const dx = (block.maxWidth - line.width) / 2

      baseDraw(run, x + dx, y, word, line, block)
    }

  const draw = drawBlock(drawRunFlushLeft)
  const drawCentered = drawBlock(drawRunCentered(drawRunFlushLeft))

  // canvas helpers

  const drawBg = () => {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, outWidth, outHeight)
  
    ctx.strokeStyle = 'cyan'
    ctx.lineWidth = 1
    ctx.strokeRect(eighthW, eighthH, inW, inH)  
  }

  // words

  const rtw = runsToWords(measure)

  const words = rtw(sampleTextRuns)

  const logJsonBlock = (obj: any) =>
    console.log('```json\n' + JSON.stringify(obj, null, 2) + '\n```')

  console.log('words')
  logJsonBlock(words)

  // lines

  const rtl = runsToLines(measure)

  const lines = rtl(sampleTextRuns)

  console.log('lines')
  logJsonBlock(lines)

  // block

  const wrapper = runsToBlock(measure)(inW)

  const block = wrapper(sampleTextRuns)

  console.log('wrapped')
  logJsonBlock(block)

  // draw background and bounds rect

  drawBg()

  // draw text

  let x = eighthW
  let y = eighthH

  // allow for the difference in ascent between the first line and the rest
  // so that the text is drawn *inside* the rectangle rather than with the 
  // top as the baseline
  if (block.lines.length) {
    y += getAscent(block.lines[0])
  }

  draw(block, x, y)

  // save to file

  const png = canvas.toBuffer('image/png')
  const outPath = `./data/test/output.png`

  await writeFile(outPath, png)

  // again, centered

  drawBg()

  drawCentered(block, x, y )

  // save to file

  const pngCentered = canvas.toBuffer('image/png')
  const outPathCentered = `./data/test/output-centered.png`

  await writeFile(outPathCentered, pngCentered)
}

start().catch(console.error)
