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

  if (files.cpf) {
    if (files.cpf[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.cpf[0], 1920)
    } else {
      rename(
        files.cpf[0].path,
        resolve(uploadsPath, files.cpf[0].filename),
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

  if (files.workContract) {
    if (files.workContract[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.workContract[0], 1920)
    } else {
      rename(
        files.workContract[0].path,
        resolve(uploadsPath, files.workContract[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.prenatalCard) {
    if (files.prenatalCard[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.prenatalCard[0], 1920)
    } else {
      rename(
        files.prenatalCard[0].path,
        resolve(uploadsPath, files.prenatalCard[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.puerperalCard) {
    if (files.puerperalCard[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.puerperalCard[0], 1920)
    } else {
      rename(
        files.puerperalCard[0].path,
        resolve(uploadsPath, files.puerperalCard[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.bornAliveDec) {
    if (files.bornAliveDec[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.bornAliveDec[0], 1920)
    } else {
      rename(
        files.bornAliveDec[0].path,
        resolve(uploadsPath, files.bornAliveDec[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  if (files.auxDoc) {
    if (files.auxDoc[0].mimetype !== 'application/pdf') {
      resizeImgFile(files.auxDoc[0], 1920)
    } else {
      rename(
        files.auxDoc[0].path,
        resolve(uploadsPath, files.auxDoc[0].filename),
        err => {
          if (err) throw err
        }
      )
    }
  }

  next()
}

export default resizeImg
