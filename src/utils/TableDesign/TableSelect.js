import { TableType } from './enums/TableType.js'
import {
  TableButtonsTypes,
  HorizontalButtonTypes,
  VerticalButtonTypes,
} from './enums/TableButtons.js'
import { TableResultType } from './enums/TableResultType.js'
import { TableBGColors } from './enums/TableBgColors.js'

function getRandomInt(start, end) {
  return Math.floor(Math.random() * (end - start + 1)) + start
}

const getRandomEntityObj = (obj, start, end) => {
  const randomIndex = getRandomInt(start, end)
  const keys = Object.keys(obj)
  return keys[randomIndex].toString()
}

const getRandomEntityArr = (arr, start, end) => {
  const randomIndex = getRandomInt(start, end)
  return arr[randomIndex]
}

const getRandomButtonsType = (tableType) => {
  var isCompatible = false
  var randomIndex = 0
  const keys = Object.keys(TableButtonsTypes[0])
  const values = Object.values(TableButtonsTypes[0])

  while (!isCompatible) {
    randomIndex = getRandomInt(0, 3)
    isCompatible = values[randomIndex].forTable.includes(tableType)
  }
  return keys[randomIndex]
}

export const generateRandomTable = () => {
  var table = {}
  const randomTableType = getRandomEntityObj(TableType, 0, 1)
  if (randomTableType !== 'COINMOVE') {
    const randomBgColor = getRandomEntityArr(TableBGColors, 0, 18)
    const randomButtonsType =
      randomTableType === 'HORIZONTAL'
        ? getRandomEntityArr(HorizontalButtonTypes, 0, 1)
        : getRandomEntityArr(VerticalButtonTypes, 0, 3)

    const randomTableResultType = getRandomEntityObj(TableResultType, 0, 1)
    table = {
      tableType: randomTableType,
      bgColor: randomBgColor,
      buttonsType: randomButtonsType,
      resultType: randomTableResultType,
    }
    return table
  } else {
    table = {
      tableType: 'COINMOVE',
    }
    return table
  }
}
