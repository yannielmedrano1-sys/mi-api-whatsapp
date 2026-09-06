import express from 'express';
import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: true, message: '¡API propia funcionando al 100%, mi amor! 🚀' });
});

app.get('/api/ytinfo', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.json({ status: false, message: 'Falta el parámetro query' });
    }

    try {
        const search = await yts(query);
        const vid = search.videos[0];

        if (!vid) {
            return res.json({ status: false, message: 'No se encontró la canción.' });
        }

        res.json({
            status: true,
            title: vid.title,
            duration: vid.timestamp,
            views: vid.views ? vid.views.toLocaleString() : 'Desconocido',
            published: vid.ago || 'Reciente',
            url: vid.url,
            thumbnail: vid.thumbnail
        });
    } catch (error) {
        console.error(error);
        res.json({ status: false, message: 'Error interno al buscar la información.' });
    }
});

app.get('/api/ytmp3', async (req, res) => {
    const videoUrl = req.query.query;
    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).json({ status: false, message: 'URL de YouTube inválida o faltante.' });
    }

    try {
        // Opciones para sortear un poco el bloqueo de YouTube en data centers
        const info = await ytdl.getInfo(videoUrl, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        });

        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

        if (!format || !format.url) {
            return res.status(404).json({ status: false, message: 'No se encontró un formato de audio válido.' });
        }

        res.json({
            status: true,
            downloadUrl: format.url
        });

    } catch (error) {
        console.error('Error detallado en ytmp3:', error.message);
        // Devolvemos un JSON limpio con status 200 o 400 para que el bot no tire error 500 crudo
        res.json({ status: false, message: 'YouTube bloqueó la petición en este servidor: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🔥 API corriendo en el puerto ${PORT}`);
});