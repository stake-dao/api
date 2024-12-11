import { Zero } from './constants'

////////////////////////////////////////////////////////////////
////   --- PANCAKESWAP MATH ---                             ////
////////////////////////////////////////////////////////////////

const Q32 = BigInt(2 ** 32)
const MaxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

function mulShift(val: bigint, mulBy: string): bigint {
  return (val * BigInt(mulBy)) >> BigInt(128)
}

function getSqrtRatioAtTick(tick: number): bigint {
  const absTick: number = tick < 0 ? tick * -1 : tick

  let ratio: bigint =
    (absTick & 0x1) != 0 ? BigInt('0xfffcb933bd6fad37aa2d162d1a594001') : BigInt('0x100000000000000000000000000000000')
  if ((absTick & 0x2) != 0) ratio = mulShift(ratio, '0xfff97272373d413259a46990580e213a')
  if ((absTick & 0x4) != 0) ratio = mulShift(ratio, '0xfff2e50f5f656932ef12357cf3c7fdcc')
  if ((absTick & 0x8) != 0) ratio = mulShift(ratio, '0xffe5caca7e10e4e61c3624eaa0941cd0')
  if ((absTick & 0x10) != 0) ratio = mulShift(ratio, '0xffcb9843d60f6159c9db58835c926644')
  if ((absTick & 0x20) != 0) ratio = mulShift(ratio, '0xff973b41fa98c081472e6896dfb254c0')
  if ((absTick & 0x40) != 0) ratio = mulShift(ratio, '0xff2ea16466c96a3843ec78b326b52861')
  if ((absTick & 0x80) != 0) ratio = mulShift(ratio, '0xfe5dee046a99a2a811c461f1969c3053')
  if ((absTick & 0x100) != 0) ratio = mulShift(ratio, '0xfcbe86c7900a88aedcffc83b479aa3a4')
  if ((absTick & 0x200) != 0) ratio = mulShift(ratio, '0xf987a7253ac413176f2b074cf7815e54')
  if ((absTick & 0x400) != 0) ratio = mulShift(ratio, '0xf3392b0822b70005940c7a398e4b70f3')
  if ((absTick & 0x800) != 0) ratio = mulShift(ratio, '0xe7159475a2c29b7443b29c7fa6e889d9')
  if ((absTick & 0x1000) != 0) ratio = mulShift(ratio, '0xd097f3bdfd2022b8845ad8f792aa5825')
  if ((absTick & 0x2000) != 0) ratio = mulShift(ratio, '0xa9f746462d870fdf8a65dc1f90e061e5')
  if ((absTick & 0x4000) != 0) ratio = mulShift(ratio, '0x70d869a156d2a1b890bb3df62baf32f7')
  if ((absTick & 0x8000) != 0) ratio = mulShift(ratio, '0x31be135f97d08fd981231505542fcfa6')
  if ((absTick & 0x10000) != 0) ratio = mulShift(ratio, '0x9aa508b5b7a84e1c677de54f3e99bc9')
  if ((absTick & 0x20000) != 0) ratio = mulShift(ratio, '0x5d6af8dedb81196699c329225ee604')
  if ((absTick & 0x40000) != 0) ratio = mulShift(ratio, '0x2216e584f5fa1ea926041bedfe98')
  if ((absTick & 0x80000) != 0) ratio = mulShift(ratio, '0x48a170391f7dc42444e8fa2')

  if (tick > 0) ratio = MaxUint256 / ratio

  // back to Q96
  return ratio % Q32 > Zero ? ratio / Q32 + BigInt(1) : ratio / Q32
}

function getAmount0Delta(sqrtRatioAX96: bigint, sqrtRatioBX96: bigint, liquidity: bigint): bigint {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    sqrtRatioAX96 = sqrtRatioBX96
    sqrtRatioBX96 = sqrtRatioAX96
  }

  const numerator1 = liquidity << BigInt(96)
  const numerator2 = sqrtRatioBX96 - sqrtRatioAX96

  return (numerator1 * numerator2) / sqrtRatioBX96 / sqrtRatioAX96
}

export function getToken0Amount(
  tickCurrent: number,
  tickLower: number,
  tickUpper: number,
  sqrtRatioX96: bigint,
  liquidity: bigint,
): bigint {
  if (isNaN(tickCurrent) || isNaN(tickLower) || isNaN(tickUpper) || !sqrtRatioX96 || !liquidity) {
    return Zero
  }
  if (tickCurrent < tickLower) {
    return getAmount0Delta(getSqrtRatioAtTick(tickLower), getSqrtRatioAtTick(tickUpper), liquidity)
  }
  if (tickCurrent < tickUpper) {
    return getAmount0Delta(sqrtRatioX96, getSqrtRatioAtTick(tickUpper), liquidity)
  }
  return Zero
}
