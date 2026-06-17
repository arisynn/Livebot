// --- SERVER BOHONGAN AGAR RENDER.COM TIDAK MEMATIKAN BOT ---
const http = require('http');
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot TikTok Doodle MMO Aktif dan Berjalan!\n');
}).listen(process.env.PORT || 3000, () => {
    console.log('Server dummy web berjalan...');
});
// -----------------------------------------------------------

const { WebcastPushConnection } = require('tiktok-live-connector');
const Ably = require('ably');

// 1. Konfigurasi Ably (Jembatan ke Game Kamu)
const ably = new Ably.Realtime('4opURQ.FVPiqg:z5W8zQxWoBNlXmlAXvOv4Bz1bmn_ISnFucJGpjFijS8');
const channel = ably.channels.get('doodle-mmo-ultimate-v20');

// 2. Username TikTok kamu (tanpa @)
const tiktokUsername = "karisyonoo"; 

let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

console.log(`Mencoba menghubungkan ke live @${tiktokUsername}...`);

// --- LISTENER: TANGKAP CHAT ---
tiktokLiveConnection.on('chat', data => {
    console.log(`[CHAT] ${data.uniqueId}: ${data.comment}`);
    channel.publish('tiktok-event', {
        type: 'chat',
        username: data.uniqueId,
        text: data.comment
    });
});

// --- LISTENER: TANGKAP GIFT ---
tiktokLiveConnection.on('gift', data => {
    // Abaikan jika gift combo (beruntun) belum selesai agar tidak spam
    if (data.giftType === 1 && !data.repeatEnd) return; 
    
    console.log(`[GIFT] ${data.uniqueId} mengirim ${data.giftName}`);
    channel.publish('tiktok-event', {
        type: 'gift',
        username: data.uniqueId,
        giftName: data.giftName
    });
});

// --- LISTENER: TANGKAP LIKE (TAP LAYAR) ---
tiktokLiveConnection.on('like', data => {
    console.log(`[LIKE] ${data.uniqueId} tap-tap layar!`);
    channel.publish('tiktok-event', {
        type: 'like',
        username: data.uniqueId
    });
});

// --- MULAI KONEKSI KE TIKTOK ---
tiktokLiveConnection.connect().then(state => {
    console.info(`✅ Berhasil terhubung ke Live TikTok ${tiktokUsername}! (Room ID: ${state.roomId})`);
}).catch(err => {
    console.error('❌ Gagal terhubung. Pastikan kamu sedang memulai Live di aplikasi TikTok saat ini!', err.message);
});
