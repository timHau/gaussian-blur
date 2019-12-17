function imagedataFromImg(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const context = canvas.getContext('2d')
  context.drawImage(img, 0, 0, img.width, img.height)
  return context.getImageData(0, 0, img.width, img.height)
}

function drawImage(imagedata) {
  const canvas = document.createElement('canvas')
  canvas.width = imagedata.width
  canvas.height = imagedata.height
  const context = canvas.getContext('2d')
  context.putImageData(imagedata, 0, 0)
  document.body.appendChild(canvas)
}

function binomial(n, k) {
    let coeff = 1;
    for (let x = n-k+1; x <= n; x++) coeff *= x;
    for (x = 1; x <= k; x++) coeff /= x;
    return coeff;
}

function makeKernel(r) {
  const w = []
  const res = []

  for (let i = 0; i <= 2*r; ++i) {
    w.push(binomial(2*r, i))
  }

  let factor = 0
  for (let x of w) {
    for (let y of w) {
      const val = x * y
      factor += val
      res.push(val)
    }
  }

  return res.map(v => v * 1/factor)
}

function nthPixelIndex(imagedata, i, j) {
  return (j * imagedata.width + i) * 4
}

function getIndices(imagedata, i, j, r) {
  const { width, height } = imagedata

  const w = []
  const h = []
  const res = []

  for (let x = -r; x <= r; ++x) {
    const x_i = (i + x) < 0 ? width + (i + x) : (i + x) % width
    const y_i = (j + x) < 0 ? height + (j + x) : (j + x) % height
    w.push(x_i)
    h.push(y_i)
  }

  for (let x of w) {
    for (let y of h) {
      res.push([x, y])
    }
  }

  return res
}

function convolute(imagedata, kernel, r, i, j) {
  let [sumR, sumG, sumB] = [0, 0, 0]

  const indices = getIndices(imagedata, i, j, r)
  indices.forEach(([ k, l ], w) => {
    const v = nthPixelIndex(imagedata, k, l)
    const { data } = imagedata
    const weight = kernel[w]
    const [wR, wG, wB] = [
      weight * data[v],
      weight * data[v+1],
      weight * data[v+2]
    ]
    sumR += wR
    sumG += wG
    sumB += wB
  })

  const center = nthPixelIndex(imagedata, i, j)
  imagedata.data[center] = Math.floor(sumR)
  imagedata.data[center + 1] = Math.floor(sumG)
  imagedata.data[center + 2] = Math.floor(sumB)

  return imagedata
}

function blur(imagedata, r) {
  let res = imagedata

  const kernel = makeKernel(r)

  for (let i = 0; i < imagedata.width; ++i) {
    for (let j = 0; j < imagedata.height; ++j) {
      res = convolute(imagedata, kernel, r, i, j)
    }
  }

  return res
}

window.onload = () => {
  const img = document.querySelector('img')
  let imagedata = imagedataFromImg(img)
  imagedata = blur(imagedata, 6)
  drawImage(imagedata)
}
