const { WebcastPushConnection } = require('tiktok-live-connector');
const Ably = require('ably');

// API Key Ably dan Channel kamu
const ably = new Ably.Realtime('4opURQ.FVPiqg:z5W8zQxWoBNlXmlAXvOv4Bz1bmn_ISnFucJGpjFijS8');
const channel = ably.channels.get('doodle-mmo-ultimate-v20');

// Username TikTok kamu
const tiktokUsername = "karisyonoo"; 

let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

console.log(`Menghubungkan ke live @${tiktokUsername}...`);

// 1. Tangkap Chat
tiktokLiveConnection.on('chat', data => {
    console.log(`[CHAT] ${data.uniqueId}: ${data.comment}`);
    channel.publish('tiktok-event', {
        type: 'chat',
        username: data.uniqueId,
        text: data.comment
    });
});

// 2. Tangkap Gift
tiktokLiveConnection.on('gift', data => {
    // Tunggu sampai animasi combo selesai biar nggak spam
    if (data.giftType === 1 && !data.repeatEnd) return; 
    
    console.log(`[GIFT] ${data.uniqueId} mengirim ${data.giftName}`);
    channel.publish('tiktok-event', {
        type: 'gift',
        username: data.uniqueId,
        giftName: data.giftName
    });
});

// 3. Tangkap Like (Tap-tap layar)
tiktokLiveConnection.on('like', data => {
    channel.publish('tiktok-event', {
        type: 'like',
        username: data.uniqueId
    });
});

// Mulai koneksi
tiktokLiveConnection.connect().then(state => {
    console.info(`✅ Berhasil terhubung ke Live TikTok ${tiktokUsername}! (Room ID: ${state.roomId})`);
}).catch(err => {
    console.error('❌ Gagal terhubung. Pastikan kamu sedang Live!', err);
});
