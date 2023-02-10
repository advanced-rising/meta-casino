import anime from 'animejs'
import React from 'react'
import { useEffect } from 'react'
import { rouletteData, WheelNumber } from './Global'

const Wheel = (props: { rouletteData: rouletteData; number: WheelNumber }): JSX.Element => {
  let totalNumbers = 37
  let singleSpinDuration = 5000
  let singleRotationDegree = 360 / totalNumbers
  let lastNumber = 0

  let rouletteWheelNumbers = props.rouletteData.numbers
  console.log(props.rouletteData)
  console.log(props.number)
  const getRouletteIndexFromNumber = (number: string) => {
    return rouletteWheelNumbers.indexOf(parseInt(number))
  }
  const nextNumber = (number: any) => {
    let value = number
    return value
  }
  const getRotationFromNumber = (number: string) => {
    let index = getRouletteIndexFromNumber(number)
    return singleRotationDegree * index
  }

  // rotateTo randomizes the end outcome of the wheel
  // so it doesn't only end at 0 at the top
  const getRandomEndRotation = (minNumberOfSpins: number, maxNumberOfSpins: number) => {
    let rotateTo = anime.random(minNumberOfSpins * totalNumbers, maxNumberOfSpins * totalNumbers)

    return singleRotationDegree * rotateTo
  }
  // calculating where the zero will be at the end of the spin
  // because we are spinning it counter clockwise we are substracting it of 360
  const getZeroEndRotation = (totalRotaiton: number) => {
    let rotation = 360 - Math.abs(totalRotaiton % 360)

    return rotation
  }
  // Where the ball end position should be
  // we are calculating this based on the zero rotation
  // and how much the wheel spins
  const getBallEndRotation = (zeroEndRotation: number, currentNumber: any) => {
    return Math.abs(zeroEndRotation) + getRotationFromNumber(currentNumber)
  }
  // randomizing the number of spins that the ball should make
  // so every spin is different
  const getBallNumberOfRotations = (minNumberOfSpins: number, maxNumberOfSpins: number) => {
    let numberOfSpins = anime.random(minNumberOfSpins, maxNumberOfSpins)
    return 360 * numberOfSpins
  }

  function spinWheel(number: number) {
    const bezier = [0.165, 0.84, 0.44, 1.005]
    let ballMinNumberOfSpins = 2
    let ballMaxNumberOfSpins = 4
    let wheelMinNumberOfSpins = 2
    let wheelMaxNumberOfSpins = 4

    let currentNumber = nextNumber(number)

    let lastNumberRotation = getRotationFromNumber(lastNumber.toString()) //anime.get(wheel, "rotate", "deg");

    // minus in front to reverse it so it spins counterclockwise
    let endRotation = -getRandomEndRotation(ballMinNumberOfSpins, ballMaxNumberOfSpins)
    let zeroFromEndRotation = getZeroEndRotation(endRotation)
    let ballEndRotation =
      getBallNumberOfRotations(wheelMinNumberOfSpins, wheelMaxNumberOfSpins) +
      getBallEndRotation(zeroFromEndRotation, currentNumber)

    // reset to the last number
    anime.set(['.layer-2', '.layer-4'], {
      rotate: function () {
        return lastNumberRotation
      },
    })
    // reset zero
    anime.set('.ball-container', {
      rotate: function () {
        return 0
      },
    })

    anime({
      targets: ['.layer-2', '.layer-4'],
      rotate: function () {
        return endRotation // random number
      },
      duration: singleSpinDuration, // random duration
      easing: `cubicBezier(${bezier.join(',')})`,
      complete: function (anim: any) {
        lastNumber = currentNumber
      },
    })
    // aniamte ball
    anime({
      targets: '.ball-container',
      translateY: [
        { value: 0, duration: 2000 },
        { value: 20, duration: 1000 },
        { value: 25, duration: 900 },
        { value: 50, duration: 1000 },
      ],
      rotate: [{ value: ballEndRotation, duration: singleSpinDuration }],
      loop: 1,
      easing: `cubicBezier(${bezier.join(',')})`,
    })
  }

  useEffect(() => {
    let nextNubmer = props.number.next
    if (nextNubmer != null && nextNubmer !== '') {
      let nextNumberInt = parseInt(nextNubmer)
      spinWheel(nextNumberInt)
    }
  }, [props.number])

  return (
    <div className={'roulette-wheel'}>
      <div className={'layer-2 wheel'} style={{ transform: 'rotate(0deg)' }}></div>
      <div className={'layer-3'}></div>
      <div className={'layer-4 wheel'} style={{ transform: 'rotate(0deg)' }}></div>
      <div className={'layer-5'}></div>
      <div className={'ball-container'} style={{ transform: 'rotate(0deg)' }}>
        <div className={'ball'} style={{ transform: 'translate(0, -163.221px)' }}></div>
      </div>
      {/* <svg width="380" height="380">
        <circle cx="190" cy="190" r="190" style={{touch-action: 'none'}}></circle>
      </svg> */}
    </div>
  )
}

export default Wheel
