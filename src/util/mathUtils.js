function toRadian(angleInDegrees) {
  return (Math.PI * angleInDegrees) / 180
}

// This creates an even ratio of numbers between 0 and 1
// n of 4 will return an array with 5 numbers: [0, 0.25, 0.5, 0.75, 1]
function generateRatio(n) {
  const interval = 1 / n
  return Array.from({ length: n + 1 }, (_, i) => i * interval)
}

module.exports = {
  generateRatio,
  toRadian,
}
