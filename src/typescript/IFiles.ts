import { Express } from 'express'

export default interface IFiles {
  idDocFront: Express.Multer.File[]
  idDocVerse: Express.Multer.File[]
  addressProof: Express.Multer.File[]
  photo: Express.Multer.File[]
  medicalReport?: Express.Multer.File[]
  medicalAuthorization?: Express.Multer.File[]
  medicalPrescription?: Express.Multer.File[]
}
