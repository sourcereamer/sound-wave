const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/audio', async (req, res) => {
    try {
        const { url } = req.query;

        const videoInfo = await ytdl.getInfo(url);
        const audioFormat = ytdl.chooseFormat(videoInfo.formats, { filter: 'audioonly', quality: 'highestaudio' });
        const audioUrl = audioFormat.url;

        const fileName = `${Date.now()}.mp3`;
        const filePath = path.join(__dirname, 'public', 'audio', fileName);

        deletePreviousTrack();

        const writeStream = fs.createWriteStream(filePath);
        ytdl(url, { format: audioFormat })
            .pipe(writeStream)
            .on('finish', () => {
                res.json({ success: true, audioUrl: `/audio/${fileName}` });
            })
            .on('error', (error) => {
                res.json({ success: false, error: error.message });
            });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.delete('/audio', (req, res) => {
    deletePreviousTrack();
    res.json({ success: true });
});

function deletePreviousTrack() {
    const audioDirectory = path.join(__dirname, 'public', 'audio');

    fs.readdir(audioDirectory, (err, files) => {
        if (err) throw err;

        files.forEach((file) => {
            fs.unlink(path.join(audioDirectory, file), (err) => {
                if (err) throw err;
                console.log(`Удален файл: ${file}`);
            });
        });
    });
}

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
