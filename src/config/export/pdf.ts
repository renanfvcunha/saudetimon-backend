import PDFPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { resolve } from 'path'

const pdf = (docDefinitions: TDocumentDefinitions) => {
  const printer = new PDFPrinter({
    Roboto: {
      normal: resolve(__dirname, '..', 'fonts', 'Roboto-Regular.ttf'),
      bold: resolve(__dirname, '..', 'fonts', 'Roboto-Medium.ttf'),
      italics: resolve(__dirname, '..', 'fonts', 'Roboto-Italic.ttf'),
      bolditalics: resolve(__dirname, '..', 'fonts', 'Roboto-MediumItalic.ttf')
    }
  })

  const pdfDoc = printer.createPdfKitDocument(docDefinitions)

  return pdfDoc
}

export default pdf
