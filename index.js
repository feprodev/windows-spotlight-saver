const fs = require("fs");
const path = require("path");
const probe = require('probe-image-size');

if (process.platform !== 'win32') {
    console.error('This tool works only with Windows OS')
    return
}
main()

async function main() {
    let assetsDir
    try {
        assetsDir = getAssetsDir()
    } catch (err) {
        console.error(err.message)
        return
    }

    const { destinationLandscapeDir, destinationPortraitDir } = initializeDestinationDirs()

    const assetsFilesNames = fs.readdirSync(assetsDir)
    for (fileName of assetsFilesNames) {
        const assetsFilePath = path.resolve(assetsDir, fileName)
        const stats = fs.statSync(assetsFilePath)
        if (stats.size > 700000) {
            const pictureSize = await probe(fs.createReadStream(assetsFilePath))
            let landscape = true
            if (pictureSize.width < pictureSize.height) {
                landscape = false
            }
            fs.copyFileSync(assetsFilePath, path.resolve(landscape ? destinationLandscapeDir : destinationPortraitDir, `${fileName}.jpg`))
        }
    }

    console.log('Done')
}

function initializeDestinationDirs() {
    const destinationLandscapeDir = path.resolve(process.env.USERPROFILE, 'Pictures/Spotlight/Landscape')
    if (!fs.existsSync(destinationLandscapeDir)) {
        fs.mkdirSync(destinationLandscapeDir, { recursive: true })
    }

    const destinationPortraitDir = path.resolve(process.env.USERPROFILE, 'Pictures/Spotlight/Portrait')
    if (!fs.existsSync(destinationPortraitDir)) {
        fs.mkdirSync(destinationPortraitDir, { recursive: true })
    }

    return {
        destinationLandscapeDir,
        destinationPortraitDir
    }
}

function getAssetsDir() {
    const dirForSearch = path.resolve(process.env.APPDATA, '../Local', 'Packages')
    const dirs = fs.readdirSync(dirForSearch)

    const contentDeliveryManagerDir = dirs.find(dir => dir.startsWith('Microsoft.Windows.ContentDeliveryManager'))
    if (contentDeliveryManagerDir) {
        return path.resolve(dirForSearch, contentDeliveryManagerDir, 'LocalState/Assets')
    }

    throw new Error('ContentDeliveryManager directory is not found')
}

