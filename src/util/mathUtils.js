function toRadian(angleInDegrees) {
  return (Math.PI * angleInDegrees) / 180
}

function decreasingCurve(x) {
  return x
  // below was generated from wolfram alpha running `quadratic fit {{0, 0}, {0.25, 0.4}, {0.5, 0.62}, {0.75, 0.82}, {1, 1}}`
  // return -0.525714 * x ** 2 + 1.49371 * x + 0.0182857
}

// This creates an even ratio of numbers between 0 and 1
// n of 4 will return an array with 5 numbers: [0, 0.25, 0.5, 0.75, 1]
function generateRatio(n) {
  const interval = 1 / n
  return Array.from({ length: n + 1 }, (_, i) => decreasingCurve(i * interval))
}

module.exports = {
  generateRatio,
  toRadian,
}
