import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default async function AppleIcon() {
  const iconPath = join(process.cwd(), 'src/app/components/icons/IconNomadpocket.png')
  const buffer = await readFile(iconPath)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
