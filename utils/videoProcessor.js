const fs = require("fs");
const { exec } = require("child_process");

async function uploadSingleVideo(videoPath, videoName) {
    const promise = new Promise((resolve, reject) => {
        // const lessonId = "ksdfmksfmskf"
        // const videoPath = req.file.path
        const outputPath = `public/${videoName}`
        const hlsPath = `${outputPath}/index.m3u8`
        console.log("hlsPath", hlsPath)

        if (!fs.existsSync('public/' + videoName)) {
            fs.mkdirSync('public/' + videoName, { recursive: true });
        }

        // ffmpeg
        const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

        // no queue because of POC, not to be used in production
        exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}`)
                reject(error);
            }
            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
            const videoUrl = global.APP_URL + `/public/${videoName}/index.m3u8`;
            resolve(videoUrl)
        })
    })
    return await promise;
}

module.exports = { uploadSingleVideo };