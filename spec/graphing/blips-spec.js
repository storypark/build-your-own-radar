const {
  calculateRadarBlipCoordinates,
  getRingRadius,
  groupBlipsBaseCoords,
  transposeQuadrantCoords,
  getGroupBlipTooltipText,
  blipAssistiveText,
  createGroupBlip,
  thereIsCollision,
} = require('../../src/graphing/blips')
const Chance = require('chance')
const { graphConfig } = require('../../src/graphing/config')
const Blip = require('../../src/models/blip')
jest.mock('d3', () => {
  return {
    select: jest.fn(),
  }
})

jest.mock('../../src/graphing/config', () => {
  return {
    graphConfig: {
      effectiveQuadrantHeight: 528,
      effectiveQuadrantWidth: 528,
      quadrantHeight: 512,
      quadrantWidth: 512,
      quadrantsGap: 32,
      minBlipWidth: 12,
      blipWidth: 22,
      groupBlipHeight: 24,
      newGroupBlipWidth: 84,
      existingGroupBlipWidth: 124,
      groupBlipAngles: [30, 35, 60, 80],
      rings: ['Adopt', 'Trial', 'Assess', 'Hold'],
    },
  }
})

const chance = Chance()
const chanceFloatingSpy = jest.spyOn(chance, 'floating')
const chanceIntegerSpy = jest
  .spyOn(chance, 'integer')
  .mockImplementationOnce((options) => {
    return options.max
  })
  .mockImplementation((options) => {
    return options.min
  })

function mockRingBlips(maxBlipCount) {
  let ringBlips = []
  let blip
  for (let blipCounter = 1; blipCounter <= maxBlipCount; blipCounter++) {
    blip = new Blip(`blip${blipCounter}`, 'ring1', true, '', '')
    blip.setId(blipCounter)
    ringBlips.push(blip)
  }
  return ringBlips
}

describe('Blips', function () {
  it('should return coordinates which fall under the first quadrant and rings provided', function () {
    const startAngle = 0
    let minRadius = 160
    const maxRadius = 300
    const coordinates = calculateRadarBlipCoordinates(minRadius, maxRadius, startAngle, 'first', chance, { width: 22 })

    const minRadiusAfterThreshold = minRadius + graphConfig.blipWidth / 2
    const maxRadiusAfterThreshold = maxRadius - graphConfig.blipWidth
    const xCoordMaxValue =
      graphConfig.effectiveQuadrantWidth + maxRadiusAfterThreshold * -1 * 0.9978403633398593 + graphConfig.blipWidth
    const yCoordMaxValue = graphConfig.effectiveQuadrantHeight + maxRadiusAfterThreshold * -1 * 0.06568568557743505
    const xCoordMinValue = graphConfig.effectiveQuadrantWidth + minRadiusAfterThreshold * -1 * 0.9942914830326867
    const yCoordMinValue =
      graphConfig.effectiveQuadrantHeight + minRadiusAfterThreshold * -1 * 0.9942914830326867 - graphConfig.blipWidth

    expect(chanceFloatingSpy).toHaveBeenCalledWith({
      min: minRadiusAfterThreshold,
      max: maxRadiusAfterThreshold,
      fixed: 4,
    })
    expect(chanceIntegerSpy).toHaveBeenCalled()
    expect(parseFloat(coordinates[0].toFixed(3))).toBeLessThanOrEqual(parseFloat(xCoordMinValue.toFixed(3)))
    expect(parseFloat(coordinates[1].toFixed(1))).toBeGreaterThanOrEqual(parseFloat(yCoordMinValue.toFixed(1)))
    expect(parseFloat(coordinates[0].toFixed(3))).toBeLessThanOrEqual(parseFloat(xCoordMaxValue.toFixed(3)))
    expect(parseFloat(coordinates[1].toFixed(3))).toBeLessThanOrEqual(parseFloat(yCoordMaxValue.toFixed(3)))
  })

  it('should return coordinates for the second quadrant and consider the border offset provided', function () {
    const startAngle = -90
    let minRadius = 160
    const maxRadius = 300
    const blipWidth = 22
    const coordinates = calculateRadarBlipCoordinates(minRadius, maxRadius, startAngle, 'second', chance, {
      width: blipWidth,
    })

    const minRadiusAfterThreshold = minRadius + blipWidth / 2
    const maxRadiusAfterThreshold = maxRadius - blipWidth
    const xCoordMaxValue =
      graphConfig.quadrantWidth + maxRadiusAfterThreshold * -1 * 0.0707372016677029 + graphConfig.quadrantsGap + 10
    const yCoordMaxValue =
      graphConfig.quadrantHeight + maxRadiusAfterThreshold * 0.9999 * 0.27563735581699916 + graphConfig.quadrantsGap
    const xCoordMinValue =
      graphConfig.quadrantWidth + minRadiusAfterThreshold * -1 * 0.9942914830326867 + graphConfig.quadrantsGap + 10
    const yCoordMinValue =
      graphConfig.quadrantHeight + minRadiusAfterThreshold * 0.9999 * 0.10670657355889696 + graphConfig.quadrantsGap

    expect(chanceFloatingSpy).toHaveBeenCalledWith({
      min: minRadiusAfterThreshold,
      max: maxRadiusAfterThreshold,
      fixed: 4,
    })
    expect(chanceIntegerSpy).toHaveBeenCalled()
    expect(parseFloat(coordinates[0].toFixed(3))).toBeLessThanOrEqual(parseFloat(xCoordMinValue.toFixed(3)))
    expect(coordinates[1]).toBeGreaterThan(yCoordMinValue)
    expect(coordinates[0]).toBeLessThan(xCoordMaxValue)
    expect(coordinates[1]).toBeLessThan(yCoordMaxValue)
  })

  it('should return first quadrant group blip coordinates for ring1', function () {
    const baseCoords = groupBlipsBaseCoords(0)

    expect(baseCoords.new).toEqual([434.57437415779594, 451])
    expect(baseCoords['existing']).toEqual([394.57437415779594, 480])
  })

  it('should transpose base coords for a new blip in ring1 to other three quadrants', function () {
    const newBlipBaseCoords = groupBlipsBaseCoords(0).new

    const coordsMap = transposeQuadrantCoords(newBlipBaseCoords, graphConfig.newGroupBlipWidth)
    expect(coordsMap.first).toEqual(newBlipBaseCoords)
    expect(coordsMap.second).toEqual([newBlipBaseCoords[0], 581])
    expect(coordsMap.third).toEqual([537.425625842204, newBlipBaseCoords[1]])
    expect(coordsMap.fourth).toEqual([537.425625842204, 581])
  })

  it('should return first quadrant group blip coordinates for ring2 with index 1', function () {
    const baseCoords = groupBlipsBaseCoords(1)
    expect(baseCoords.new).toEqual([332.7228074965136, 372.87332422059916])
    expect(baseCoords['existing']).toEqual([292.7228074965136, 401.87332422059916])
  })

  it('should return first quadrant group blip coordinates for ring3 with index 2', function () {
    const baseCoords = groupBlipsBaseCoords(2)
    expect(baseCoords.new).toEqual([330, 205.87187078897966])
    expect(baseCoords['existing']).toEqual([290, 234.87187078897966])
  })

  it('should return first quadrant group blip coordinates for ring4 with index 3', function () {
    const baseCoords = groupBlipsBaseCoords(3)
    expect(baseCoords.new).toEqual([412.2056164052152, 41.806126650530814])
    expect(baseCoords['existing']).toEqual([372.2056164052152, 70.80612665053081])
  })

  it('should return group blip tool tip text as "Click to view all" count is more than 15', function () {
    let ringBlips = mockRingBlips(20)
    const actualToolTip = getGroupBlipTooltipText(ringBlips)
    const expectedToolTip = 'Click to view all'
    expect(actualToolTip).toEqual(expectedToolTip)
  })

  it('should return group blip tool tip text as all blip names if count is <= 15', function () {
    let ringBlips = mockRingBlips(15)
    const actualToolTip = getGroupBlipTooltipText(ringBlips)
    const expectedToolTip =
      '1.blip1</br>2.blip2</br>3.blip3</br>4.blip4</br>5.blip5</br>6.blip6</br>7.blip7</br>8.blip8</br>9.blip9</br>10.blip10</br>11.blip11</br>12.blip12</br>13.blip13</br>14.blip14</br>15.blip15</br>'
    expect(actualToolTip).toEqual(expectedToolTip)
  })

  it('should return ring radius based on the ring index', function () {
    expect(getRingRadius(0)).toBe(0)
    expect(getRingRadius(1)).toBe(128)
    expect(getRingRadius(2)).toBe(256)
    expect(getRingRadius(3)).toBe(384)
    expect(getRingRadius(4)).toBe(512)
    expect(getRingRadius(5)).toBe(0)
  })

  it('should return group blip assistive text for group blip', function () {
    const blip = {
      isGroup: () => true,
      ring: () => {
        return {
          name: () => 'ring1',
        }
      },
      blipText: () => '12 New Blips',
      name: 'blip1',
      isNew: () => true,
    }

    const actual = blipAssistiveText(blip)
    expect(actual).toEqual('`ring1 ring, group of 12 New Blips')
  })

  it('should return group blip with appropriate values', function () {
    const ringBlips = mockRingBlips(20)
    const groupBlip = createGroupBlip(ringBlips, 'New', { name: () => 'ring1' }, 'first')
    expect(groupBlip).toBeTruthy()
    expect(groupBlip.blipText()).toEqual('20 New blips')
    expect(groupBlip.id()).toEqual('first-ring1-group-new-blips')
    expect(groupBlip.isGroup()).toEqual(true)
  })

  it('should return true when the given coords are colliding with existing coords', function () {
    const existingCoords = [{ coordinates: [10, 10], width: 22 }]

    expect(thereIsCollision([10, 10], existingCoords, 22)).toBe(true)
    expect(thereIsCollision([41, 41], existingCoords, 22)).toBe(true)
    expect(thereIsCollision([42, 42], existingCoords, 22)).toBe(false)
  })
})
