document.addEventListener("DOMContentLoaded", () => {
    // ==== GAMEPIX SDK INIT ====
    if (typeof GamePix !== 'undefined') {
        GamePix.loaded();
    }

    // ==== PREVENT UNWANTED PAGE SCROLLING ====
    window.addEventListener("keydown", (event) => {
      if (["ArrowUp", "ArrowDown", " "].includes(event.key)) {
        event.preventDefault();
      }
    });
    window.addEventListener("wheel", (event) => event.preventDefault(), {
      passive: false,
    });

    // ==== KONFIGURASI GAME ====
    const totalVideos = 20;

    // Menentukan daftar file. Pastikan meletakkan video1.mp4 hingga video20.mp4 di folder yang sama.
    const videoFiles = Array.from({length: totalVideos}, (_, i) => `video${i+1}.mp4`);
    
    // Daftarkan audio BGM yang diperlukan di sini. Game akan meloop berurutan.
    const bgmFiles = ['bgm1.mp3', 'bgm2.mp3', 'bgm3.mp3']; 

    // Daftar aksi dengan makna animasi khusus
    const actions = [
        { text: "Cari makan", type: "static", anim: "anim-wobble" },
        { text: "LOMPAT!", type: "jumpy", anim: "anim-bounce" },
        { text: "Aduh, jatuh!!", type: "static", anim: "anim-shake" },
        { text: "Kejar kupu-kupu", type: "fly", anim: "anim-float" },
        { text: "Masuk gua gelap", type: "static", anim: "anim-pulse" },
        { text: "Gemerisik aneh...", type: "static", anim: "anim-shake" },
        { text: "Bagi kenari", type: "jumpy", anim: "anim-bounce" },
        { text: "Lanjut keliling", type: "static", anim: "anim-float" },
        { text: "Wah, banyak bunga", type: "jumpy", anim: "anim-pulse" },
        { text: "Kok ngantuk...", type: "static", anim: "anim-float" },
        { text: "BANGUN!", type: "jumpy", anim: "anim-shake" },
        { text: "Ikuti capungnya", type: "fly", anim: "anim-float" },
        { text: "Hap, panjat", type: "static", anim: "anim-bounce" },
        { text: "Lebih tinggi", type: "jumpy", anim: "anim-bounce" },
        { text: "Intip atas daun", type: "static", anim: "anim-float" },
        { text: "Lihat senja", type: "static", anim: "anim-pulse" },
        { text: "Jemur bulu", type: "static", anim: "anim-wobble" },
        { text: "Kenyang & hangat", type: "static", anim: "anim-float" },
        { text: "Mata berat...", type: "fly", anim: "anim-wobble" },
        { text: "Tidur nyenyak", type: "static", anim: "anim-pulse" }
    ];

    let currentVideoIndex = 0;
    let currentBgmIndex = 0;

    // ==== REFERENSI ELEMEN ====
    const screenIntro = document.getElementById('screen-intro');
    const screenStart = document.getElementById('screen-start');
    const screenGame = document.getElementById('screen-game');
    const screenEnd = document.getElementById('screen-end');

    const btnStart = document.getElementById('btn-start');
    const gameVideo = document.getElementById('game-video');
    const textTriggerContainer = document.getElementById('text-trigger-container');
    const btnNextStory = document.getElementById('btn-next-story');
    const bgmPlayer = document.getElementById('bgm-player');

    // ==== AUDIO BGM ====
    function playNextBgm() {
        if (bgmFiles.length === 0) return;
        bgmPlayer.src = bgmFiles[currentBgmIndex];
        bgmPlayer.play().catch(e => console.log('BGM menunggu interaksi layar', e));
        currentBgmIndex = (currentBgmIndex + 1) % bgmFiles.length; // Berputar (Loop) kembali ke 0
    }

    bgmPlayer.addEventListener('ended', playNextBgm);

    // Audio Handling on visibility change
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            bgmPlayer.pause();
            if (!gameVideo.paused) gameVideo.pause();
        } else {
            // Only attempt to resume audio if start button has been clicked
            if (screenGame.classList.contains('active') || screenEnd.classList.contains('active')) {
                bgmPlayer.play().catch(e => console.log('BGM resume tertunda', e));
                if (screenGame.classList.contains('active') && textTriggerContainer.classList.contains('hidden')) {
                    gameVideo.play().catch(e => console.log('Video resume tertunda', e));
                }
            }
        }
    });

    // ==== ALUR APLIKASI ====

    // 1. Intro -> Start screen (Timeout 4 detik)
    setTimeout(() => {
        screenIntro.classList.remove('active');
        screenStart.classList.add('active');
    }, 4000);

    // 2. Klik "Mulai Menjelajah" -> Mulai Game
    btnStart.addEventListener('click', () => {
        screenStart.classList.remove('active');
        screenGame.classList.add('active');
        
        // Memulai Audio BGM setelah interaksi pengguna (Kebijakan browser)
        playNextBgm();
        
        // Memutar video pertama
        playVideo(currentVideoIndex);
    });

    // 3. Fungsi Memutar Video
    function playVideo(index) {
        if(index >= videoFiles.length) {
            // Jika video sudah habis (Game Tamat)
            screenGame.classList.remove('active');
            screenEnd.classList.add('active');
            return;
        }

        // Sembunyikan Trigger Text & Tampilkan Video
        textTriggerContainer.classList.add('hidden');
        gameVideo.style.display = 'block';

        // Load & Play Video
        gameVideo.src = videoFiles[index];
        gameVideo.load();
        
        let playPromise = gameVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log(`Video ${videoFiles[index]} bermasalah / belum ada. Melewati ke teks...`, e);
                showTextTrigger(index); // Fallback: jika user belum mengupload video ini
            });
        }
    }

    // 4. Video Selesai -> Munculkan Pemicu Teks (Trigger)
    gameVideo.addEventListener('ended', () => {
        showTextTrigger(currentVideoIndex);
    });
    
    // Fitur fallback jika file video belum ditambahkan agar template tetap bisa di-tes
    gameVideo.addEventListener('error', () => {
        showTextTrigger(currentVideoIndex);
    });

    // 5. Fungsi Memunculkan Pemicu Teks
    function showTextTrigger(index) {
        if(index >= actions.length) return;
        
        // Pemicu dimunculkan di atas frame terakhir video (video tidak di-hide)
        let action = actions[index];
        btnNextStory.innerText = action.text;
        
        // Reset state
        btnNextStory.classList.remove('fadeOut');
        btnNextStory.style.transition = 'opacity 0.5s ease, top 0.5s ease, left 0.5s ease';

        // Atur posisi acak antara 15% hingga 80% dari lebar dan tinggi layar
        const randomTop = Math.floor(Math.random() * 65) + 15;
        const randomLeft = Math.floor(Math.random() * 65) + 15;
        btnNextStory.style.top = `${randomTop}%`;
        btnNextStory.style.left = `${randomLeft}%`;
        
        // Ukuran teks acak (lebih kecil supaya terasa teka-teki)
        const randomSize = Math.floor(Math.random() * 14) + 18; // 18px - 32px
        btnNextStory.style.fontSize = `${randomSize}px`;
        
        btnNextStory.className = 'text-trigger-btn ' + action.anim;
        
        textTriggerContainer.classList.remove('hidden');

        // Setup dynamic behavior (bergerak jika jumpy atau fly)
        clearInterval(btnNextStory.moveInterval);
        
        if (action.type === 'jumpy') {
            btnNextStory.moveInterval = setInterval(() => {
                const rt = Math.floor(Math.random() * 70) + 10;
                const rl = Math.floor(Math.random() * 70) + 10;
                btnNextStory.style.top = `${rt}%`;
                btnNextStory.style.left = `${rl}%`;
            }, 800);
        } else if (action.type === 'fly') {
            btnNextStory.style.transition = 'top 2s linear, left 2s linear, opacity 0.5s ease';
            btnNextStory.moveInterval = setInterval(() => {
                const rt = Math.floor(Math.random() * 70) + 10;
                const rl = Math.floor(Math.random() * 70) + 10;
                btnNextStory.style.top = `${rt}%`;
                btnNextStory.style.left = `${rl}%`;
            }, 2000);
        }
    }

    // 6. Klik Pemicu Teks -> Mainkan Video Selanjutnya
    btnNextStory.addEventListener('click', () => {
        clearInterval(btnNextStory.moveInterval);
        
        // Efek memudar saat diklik
        btnNextStory.classList.add('fadeOut');
        
        // Tunggu animasi pudar selesai baru lanjut video
        setTimeout(() => {
            currentVideoIndex++;
            
            // Update level using GamePix SDK
            if (typeof GamePix !== 'undefined') {
                GamePix.updateLevel(currentVideoIndex + 1);
            }
            
            // Trigger Ad Interstitial every 4 levels / videos
            if (currentVideoIndex % 4 === 0 && currentVideoIndex < totalVideos && typeof GamePix !== 'undefined') {
                // Pause background game activity
                bgmPlayer.pause();
                gameVideo.pause();
                
                GamePix.interstitialAd().then((res) => {
                    // Resume game activity when Ad is closed
                    bgmPlayer.play().catch(e => console.log('BGM resume tertunda', e));
                    playVideo(currentVideoIndex);
                });
            } else {
                playVideo(currentVideoIndex);
            }
        }, 600); 
    });
});
