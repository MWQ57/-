import { removeBackground, preload } from '@imgly/background-removal'

let preloaded = false

export async function ensureModelLoaded(onProgress?: (msg: string) => void) {
  if (preloaded) return
  onProgress?.('正在加载抠图模型（首次较慢）...')
  await preload()
  preloaded = true
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function removeImageBackground(
  imageUrl: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  await ensureModelLoaded(onProgress)
  onProgress?.('正在移除背景，生成透明底...')

  const blob = await removeBackground(imageUrl, {
    model: 'isnet',
    output: { format: 'image/png', quality: 0.92 },
  })

  return blobToDataUrl(blob)
}
