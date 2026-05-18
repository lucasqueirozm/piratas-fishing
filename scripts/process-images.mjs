import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const inputDir = 'C:/Users/Luquinhas/OneDrive/Imagens Piratas'
const outputDir = './public/produtos'

fs.mkdirSync(outputDir, { recursive: true })

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\s*-\s*/g, '-')   // normaliza espaços em torno de hífen
    .replace(/\s+/g, '-')       // espaços → hífen
    .replace(/[àáâãä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9-]/g, '') // remove resto
    .replace(/-+/g, '-')        // múltiplos hífens
    .replace(/^-|-$/g, '')      // trim hífens
}

const files = fs.readdirSync(inputDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f))

console.log(`Processando ${files.length} imagens...\n`)

let ok = 0
let err = 0

for (const file of files) {
  const nameWithoutExt = path.basename(file, path.extname(file))
  const slug = slugify(nameWithoutExt)
  const outPath = path.join(outputDir, `${slug}.jpg`)

  try {
    await sharp(path.join(inputDir, file))
      .resize(900, 900, {
        fit: 'contain',
        background: { r: 20, g: 20, b: 20 },  // fundo escuro (quase #1a1a1a)
      })
      .modulate({
        brightness: 1.08,      // 8% mais claro
        saturation: 1.25,      // 25% mais saturado → cores mais vibrantes
      })
      .sharpen({ sigma: 0.8 }) // sharpening suave
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toFile(outPath)

    console.log(`  ✓  ${file}  →  ${slug}.jpg`)
    ok++
  } catch (e) {
    console.error(`  ✗  ${file}: ${e.message}`)
    err++
  }
}

console.log(`\nConcluído: ${ok} ok, ${err} erros.`)
