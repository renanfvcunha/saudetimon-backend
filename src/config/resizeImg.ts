import { Express } from 'express'
import sharp from 'sharp'
import { resolve } from 'path'
import { unlink, rename } from 'fs'

const resizeImg = async (file: Express.Multer.File, size: number) => {
  const info = await sharp(file.path).metadata()
  const uploadsPath = resolve(__dirname, '..', '..', 'uploads')

  if (
    info.width &&
    info.height &&
    info.width > info.height &&
    info.width > size
  ) {
    if (info.orientation === 1) {
      return sharp(file.path)
        .resize(size, null)
        .toFile(resolve(uploadsPath, file.filename))
        .then(() =>
          unlink(file.path, err => {
            if (err) throw err
          })
        )
        .catch(err => {
          if (err) throw err
        })
    } else {
      return sharp(file.path)
        .resize(null, size)
        .toFile(resolve(uploadsPath, file.filename))
        .then(() =>
          unlink(file.path, err => {
            if (err) throw err
          })
        )
        .catch(err => {
          if (err) throw err
        })
    }
  } else if (
    info.width &&
    info.height &&
    info.width < info.height &&
    info.height > size
  ) {
    return sharp(file.path)
      .resize(null, size)
      .toFile(resolve(uploadsPath, file.filename))
      .then(() =>
        unlink(file.path, err => {
          if (err) throw err
        })
      )
      .catch(err => {
        if (err) throw err
      })
  } else {
    rename(file.path, resolve(uploadsPath, file.filename), err => {
      if (err) throw err
    })
  }
}

export default resizeImg
