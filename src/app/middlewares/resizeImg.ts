import { Request, Response, NextFunction } from 'express'

import IFiles from '../../typescript/IFiles'
import resizeImgFile from '../../config/resizeImg'

const resizeImg = (req: Request, res: Response, next: NextFunction) => {
  const files: IFiles = JSON.parse(JSON.stringify(req.files))

  if (files.idDocFront && files.idDocFront[0].mimetype !== 'application/pdf') {
    resizeImgFile(files.idDocFront[0], 1920)
  }

  if (files.idDocVerse && files.idDocVerse[0].mimetype !== 'application/pdf') {
    resizeImgFile(files.idDocVerse[0], 1920)
  }

  if (
    files.addressProof &&
    files.addressProof[0].mimetype !== 'application/pdf'
  ) {
    resizeImgFile(files.addressProof[0], 1920)
  }

  if (files.photo && files.photo[0].mimetype !== 'application/pdf') {
    resizeImgFile(files.photo[0], 1920)
  }

  if (
    files.medicalReport &&
    files.medicalReport[0].mimetype !== 'application/pdf'
  ) {
    resizeImgFile(files.medicalReport[0], 1920)
  }

  if (
    files.medicalAuthorization &&
    files.medicalAuthorization[0].mimetype !== 'application/pdf'
  ) {
    resizeImgFile(files.medicalAuthorization[0], 1920)
  }

  if (
    files.medicalPrescription &&
    files.medicalPrescription[0].mimetype !== 'application/pdf'
  ) {
    resizeImgFile(files.medicalPrescription[0], 1920)
  }

  next()
}

export default resizeImg
