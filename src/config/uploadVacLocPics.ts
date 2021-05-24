import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { resolve } from 'path'

function pStart (num: number) {
  return num.toString().padStart(2, '0')
}

const uploadVacLocPicsCfg = multer({
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'uploads', 'vacLocPics'),
    filename (req, file, cb) {
      const ext = file.originalname.split('.').pop()

      const date = new Date()

      const fileName = `IMG_${date.getFullYear().toString()}${pStart(
        date.getMonth() + 1
      )}${pStart(date.getDate())}_${pStart(date.getHours())}${pStart(
        date.getMinutes()
      )}${pStart(date.getSeconds())}_${Math.ceil(
        Math.random() * 10000
      ).toString()}.${ext}`

      cb(null, fileName)
    }
  }),
  fileFilter: (req, file, cb) => {
    const isAccepted = ['image/png', 'image/jpg', 'image/jpeg'].find(
      acceptedFormat => acceptedFormat === file.mimetype
    )

    if (!isAccepted) {
      return cb(new Error('fileTypeMismatch'))
    }

    return cb(null, true)
  }
})

const uploadVacLocPics = (req: Request, res: Response, next: NextFunction) => {
  const upload = uploadVacLocPicsCfg.single('picture')

  upload(req, res, function (err: any) {
    if (err) {
      if (err.message === 'fileTypeMismatch') {
        return res.status(400).json({
          msg: 'Somente imagens do tipo jpg ou png'
        })
      } else {
        console.error(err)
        return res.status(500).json({ msg: 'Erro ao carregar imagem.' })
      }
    }

    next()
  })
}

export default uploadVacLocPics
