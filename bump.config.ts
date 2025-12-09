import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'bumpp'

export default defineConfig({
  all: true,
  execute: (args) => {
    execSync('npx conventional-changelog -p angular -i CHANGELOG.md -s', { stdio: 'inherit' })

    const manifestPath = path.resolve(process.cwd(), 'src/manifest.json')
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)

    manifest.versionName = args.state.newVersion

    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`

    const oldVersionCode = String(manifest.versionCode)
    let newVersionCode = `${datePrefix}01`

    if (oldVersionCode.startsWith(datePrefix)) {
      const suffix = Number.parseInt(oldVersionCode.slice(-2))
      newVersionCode = `${datePrefix}${String(suffix + 1).padStart(2, '0')}`
    }

    manifest.versionCode = Number(newVersionCode)

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4), 'utf-8')
    console.log(`Updated src/manifest.json: versionName=${manifest.versionName}, versionCode=${manifest.versionCode}`)
  },
})
