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

const kernel = [
  1, 4,  7,  4,  1,
  4, 16, 26, 16, 4,
  7, 26, 41, 26, 7,
  4, 16, 26, 16, 4,
  1, 4,  7,  4,  1,
].map(v => v * 1/273)

function makeKernel(r) {
  const w = []
  const res = []

  for (let i = 0; i <= 2*r; ++i) {
    console.log(i);
  }

  for (let x of w) {
    for (let y of w) {
      res.push([x, y])
    }
  }

  return res
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

function convolute(imagedata, i, j) {
  let [sumR, sumG, sumB] = [0, 0, 0]

  const indices = getIndices(imagedata, i, j, 2)
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

function blur(imagedata) {
  let res = imagedata

  for (let i = 0; i < imagedata.width; ++i) {
    for (let j = 0; j < imagedata.height; ++j) {
      res = convolute(imagedata, i, j)
    }
  }

  return res
}

window.onload = () => {
  const img = document.querySelector('img')
  let imagedata = imagedataFromImg(img)
  imagedata = blur(imagedata)
  drawImage(imagedata)
}
