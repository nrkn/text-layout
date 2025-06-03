import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { DrawRun, MeasureMetrics, MeasureRunAscent, MeasureRunBounds, MeasureRunWidth, Size, TextRun, WrappedBlock } from '../types.js'
import { lineAscent } from '../lines.js'
import { drawBlock, drawRunAligned } from '../draw.js'
import { text } from 'stream/consumers'
import { writeFile } from 'fs/promises'
import { hardWrapper, softWrapper } from '../wrap.js'
import { fitter } from '../fit.js'

const boldName = 'NotoBold'

GlobalFonts.registerFromPath('./data/fonts/NotoSans-Bold.ttf', boldName)

let generateOutput = true

const start = async () => {
  const viewSize: Size = {
    width: 512,
    height: 512
  }

  const canvas = createCanvas(viewSize.width, viewSize.height)
  const ctx = canvas.getContext('2d')

  const textSize: Size = {
    width: 468,
    height: 72
  }

  const textX = (viewSize.width - textSize.width) / 2
  const textY = (viewSize.height - textSize.height) / 2

  // setup measuring functions

  const runToCssFontString = (run: TextRun) =>
    `${run.fontSize}px ${run.fontFamily}`

  const getMetrics = (run: TextRun) => {
    ctx.font = runToCssFontString(run)

    return ctx.measureText(run.text)
  }

  const measure: MeasureRunWidth = run => getMetrics(run).width

  const measureMetrics: MeasureMetrics = getMetrics

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
  const drawLeftNormal = drawBlock(drawRun)

  // canvas helpers

  const drawBg = () => {
    if (!generateOutput) return

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, viewSize.width, viewSize.height)

    ctx.strokeStyle = 'cyan'
    ctx.lineWidth = 1
    ctx.strokeRect(textX, textY, textSize.width, textSize.height)
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

    let x = textX
    let y = textY

    // allow for the difference in ascent between the first line and the rest
    // so that the text is drawn *inside* the rectangle rather than with the 
    // top as the baseline
    if (block.lines.length) {
      y += getAscent(block.lines[0])
    }

    draw(block, x, y)

    // save to file
    await savePng(`./data/test-optical/${name}.png`)
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

    ctx.lineWidth = 5

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

  //

  const runs: TextRun[] = [
    {
      text: 'Hand Saw',
      fontFamily: boldName,
      fontSize: textSize.height,
      lineHeight: 1,
    }
  ]

  const runsWithWrap: TextRun[] = [
        {
      text: 'Hand Saw\nSand Haw',
      fontFamily: boldName,
      fontSize: textSize.height,
      lineHeight: 1,
    }
  ]

  //

  const hardWrapNoOpt = hardWrapper(measure)
  const hardBlockNoOpt = hardWrapNoOpt(runs)

  const fit = fitter(textSize)
  const fitted = fit(hardBlockNoOpt)

  log('fitted')
  logJsonBlock(fitted)

  await drawHelper(fitted.wrapped, 'no-optical')

  //

  const hardWrapOpt = hardWrapper(measureMetrics)
  const hardBlockOpt = hardWrapOpt(runs)

  const fitOpt = fitter(textSize, { cropToMetrics: true })
  const fittedOpt = fitOpt(hardBlockOpt)

  log('fitted optical')
  logJsonBlock(fittedOpt)

  await drawHelper(fittedOpt.wrapped, 'optical')

  //

  const hardBlockWrappedOpt = hardWrapOpt(runsWithWrap)
  const fittedWrappedOpt = fitOpt(hardBlockWrappedOpt)

  //log('fitted optical wrapped')
  //logJsonBlock(fittedWrappedOpt)

  await drawHelper(fittedWrappedOpt.wrapped, 'optical-wrapped')
}

start().catch(console.error)