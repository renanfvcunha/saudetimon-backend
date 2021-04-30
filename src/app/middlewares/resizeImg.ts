import { Request, Response, NextFunction } from 'express'
import { resolve } from 'path'
import { rename } from 'fs'

import IFiles from '../../typescript/IFiles'
import resizeImgFile from '../../config/resizeImg'

const resizeImg = (req: Request, res: Response, next: NextFunction) => {
  const files: IFiles = JSON.parse(JSON.stringify(req.files))
  const uploadsPath = resolve(__dirname, '..', '..', '..', 'uploads')

  if (files.idDocFront) {
    if (files.idDocFront[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.idDocFront[0], 1920)
    } else {
      rename(
        files.idDocFront[0].path,
        resolve(uploadsPath, files.idDocFront[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.idDocVerse) {
    if (files.idDocVerse[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.idDocVerse[0], 1920)
    } else {
      rename(
        files.idDocVerse[0].path,
        resolve(uploadsPath, files.idDocVerse[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.addressProof) {
    if (files.addressProof[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.addressProof[0], 1920)
    } else {
      rename(
        files.addressProof[0].path,
        resolve(uploadsPath, files.addressProof[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.photo) {
    if (files.photo[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.photo[0], 1920)
    } else {
      rename(
        files.photo[0].path,
        resolve(uploadsPath, files.photo[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.medicalReport) {
    if (files.medicalReport[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.medicalReport[0], 1920)
    } else {
      rename(
        files.medicalReport[0].path,
        resolve(uploadsPath, files.medicalReport[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.medicalAuthorization) {
    if (files.medicalAuthorization[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.medicalAuthorization[0], 1920)
    } else {
      rename(
        files.medicalAuthorization[0].path,
        resolve(uploadsPath, files.medicalAuthorization[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.medicalPrescription) {
    if (files.medicalPrescription[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.medicalPrescription[0], 1920)
    } else {
      rename(
        files.medicalPrescription[0].path,
        resolve(uploadsPath, files.medicalPrescription[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  next()
}

export default resizeImg
