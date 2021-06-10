import { Express } from 'express'

export default interface IFiles {
  idDocFront?: Express.Multer.File[]
  idDocVerse?: Express.Multer.File[]
  cpf?: Express.Multer.File[]
  addressProof?: Express.Multer.File[]
  medicalReport?: Express.Multer.File[]
  medicalAuthorization?: Express.Multer.File[]
  workContract?: Express.Multer.File[]
  prenatalCard?: Express.Multer.File[]
  puerperalCard?: Express.Multer.File[]
  bornAliveDec?: Express.Multer.File[]
  auxDoc?: Express.Multer.File[]
}
