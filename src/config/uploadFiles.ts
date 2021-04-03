import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { resolve } from 'path'

function pStart (num: number) {
  return num.toString().padStart(2, '0')
}

const uploadFilesCfg = multer({
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'uploads'),
    filename (req, file, cb) {
      const ext = file.originalname.split('.').pop()

      let prefix: string

      const imgTypes = ['png', 'jpg', 'jpeg'].find(
        img => img === ext?.toLowerCase()
      )

      if (imgTypes) {
        prefix = 'IMG'
      } else {
        prefix = 'DOC'
      }

      const date = new Date()

      const fileName = `${prefix}_${date.getFullYear().toString()}${pStart(
        date.getMonth() + 1
      )}${pStart(date.getDate())}_${pStart(date.getHours())}${pStart(
        date.getMinutes()
      )}${pStart(date.getSeconds())}${date.getMilliseconds().toString()}.${ext}`

      cb(null, fileName)
    }
  }),
  fileFilter: (req, file, cb) => {
    const isAccepted = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'application/pdf'
    ].find(acceptedFormat => acceptedFormat === file.mimetype)

    if (!isAccepted) {
      return cb(new Error('fileTypeMismatch'))
    }

    return cb(null, true)
  }
})

const uploadFiles = (req: Request, res: Response, next: NextFunction) => {
  const upload = uploadFilesCfg.fields([
    {
      name: 'idDocFront',
      maxCount: 1
    },
    {
      name: 'idDocVerse',
      maxCount: 1
    },
    {
      name: 'addressProof',
      maxCount: 1
    },
    {
      name: 'photo',
      maxCount: 1
    },
    {
      name: 'medicalReport',
      maxCount: 1
    },
    {
      name: 'medicalAuthorization',
      maxCount: 1
    },
    {
      name: 'medicalPrescription',
      maxCount: 1
    }
  ])

  upload(req, res, function (err: any) {
    if (err) {
      if (err.message === 'fileTypeMismatch') {
        return res.status(400).json({
          msg: 'Há um ou mais arquivos com formato não aceito.'
        })
      } else {
        console.error(err)
        return res.status(500).json({ msg: 'Erro ao carregar documentos.' })
      }
    }

    next()
  })
}

export default uploadFiles
