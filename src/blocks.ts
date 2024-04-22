import { runsToLines } from './lines.js'

import { RunWrapper, Block, Line } from './types.js'

export const runsToBlock: RunWrapper = measureText =>
  maxWidth =>
    runs => {
      const block: Block = {
        lines: [],
        width: 0,
        height: 0
      }

      // handle hard breaks and split into words
      const hardLines = runsToLines(measureText)(runs)

      const wrapLine = (line: Line) => {
        const softWrappedLines: Line[] = []

        let currentWidth = 0

        let currentLine: Line = {
          words: [],
          width: 0,
          height: 0
        }

        const push = () => {
          if (currentLine.words.length > 0) {
            softWrappedLines.push(currentLine)

            block.width = Math.max(block.width, currentLine.width)
            block.height += currentLine.height
          }
        }

        for (const group of line.words) {
          const wordWidth = group.width
          const wordWidthWithSpace = group.advanceX

          if (currentWidth + wordWidth <= maxWidth) {
            currentWidth += wordWidthWithSpace
            
            currentLine.words.push(group)
            currentLine.width += wordWidthWithSpace
            currentLine.height = Math.max(currentLine.height, group.height)
          } else {
            push()

            currentLine = {
              words: [group],
              width: 0,
              height: 0
            }

            currentLine.width = wordWidthWithSpace
            currentLine.height = group.height

            currentWidth = wordWidthWithSpace
          }
        }

        push()

        return softWrappedLines
      }

      for (const line of hardLines) {
        block.lines.push(...wrapLine(line))
      }

      return block
    }
    