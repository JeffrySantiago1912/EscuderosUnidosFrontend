import Tesseract from 'tesseract.js'

export async function extractTextFromImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const result = await Tesseract.recognize(file, 'spa', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })
  return result.data.text.trim()
}
