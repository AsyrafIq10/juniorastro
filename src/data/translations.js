import { TASK_TEXT } from "./taskText.js";

const BASE = {
  en: {
    gameTitle: "Blast Off!",
    heroTagline: "Interstellar V • Mars Rover Adventure",
    choosePlanet: "Choose Your Landing Site",
    marsTitle: "Mars: Jezero Crater",
    marsSubtitle: "5 Rover Tasks • Fly Home to Earth",
    marsCTA: "Launch Mission",
    menu: {
      subtitle: "Mission Control • Earth Orbit",
      baseLabel: "Earth Mission Control",
      suitChecks: ["Helmet on", "Air tanks full", "Gloves sealed", "Ready for launch!"],
      startGame: "Start Game",
      credits: "Credits",
      back: "Back",
      selectMission: "Select Your Mission",
      missionMars: "Mission Mars",
      missionLunar: "Mission Lunar",
      locked: "Locked",
      lockedHint: "Complete Mission Mars to unlock",
      version: "v1.0 • Made for young space explorers",
    },
    creditsModal: {
      title: "Credits",
      sections: [
        { heading: "Team Interstellar V", items: ["Abdul Rahim", "Asyraf Iqbal", "Batrisya Qistina", "Maisarah", "Qhairunnisa Shahirah"] },
        { heading: "Game Design & Development", items: ["Interstellar V"] },
        { heading: "Science & Data", items: ["NASA Perseverance Rover (MOXIE & MEDA)", "NASA DONKI Space Weather Database", "NASA Open Science Data Repository (OSDR)"] },
        { heading: "NASA Data", items: ["3.2.2 Solar Panels & Arrays (NASA Small Spacecraft Technology: Power)", "OSD-883: Analysis of Vegetable Seedlings Grown in Contact with Apollo 14 Lunar Surface Fines", "LCROSS (Lunar Crater Observation and Sensing Satellite)", "NASA Achieves Water Recovery Milestone on International Space Station", "Thermal Control on the Lunar Surface (NASA Technical Reports Server)", "10 Things: Mars Helicopter", "Mars Phoenix", "Mars Rock Samples"] },
        { heading: "Space Agency Partner & Other Data", items: ["The Case for Clear Dust-Repellant Coating (Voyager Technologies)"] },
        { heading: "Built With", items: ["React", "Three.js & React Three Fiber", "Tailwind CSS", "Lucide Icons", "Web Audio API (all sounds synthesized)"] },
      ],
      thanks: "Thank you for playing, Cadet! 🚀",
    },
    launch: {
      countdown: "T-minus",
      liftoff: "Liftoff!",
      cruise: "Cruising to Mars",
      cruiseSub: "225 million km • ~7 months of travel",
      descent: "Entering Mars atmosphere",
      descentSub: "Firing retro-rockets…",
      touchdown: "Touchdown!",
      touchdownSub: "Welcome to Jezero Crater",
      skip: "Skip",
    },
    moonTitle: "Moon: Shackleton Crater",
    moonSubtitle: "5 Lunar Tasks • Artemis Base",
    settings: "Settings",
    language: "Language",
    soundLabel: "Space Audio & Effects",
    soundOn: "On",
    soundOff: "Off",
    close: "Close",
    nasaDataBtn: "NASA Science & Data",
    resources: {
      health: "Crew Health",
      power: "Power",
      supplies: "Supplies",
      science: "Science",
    },
    roverMode: "Rover Mode",
    roverHint: "WASD / Arrows or D-Pad to drive • Drag to look",
    rover: {
      camOn: "Rover Cam On!",
      explore: "Drive around and discover the base!",
      backToBase: "Back to Base",
      found: "You found:",
      map: "Map",
      you: "You",
    },
    resetCam: "Reset View",
    clickModuleHint: "Tip: Click any base module to inspect it!",
    modules: {
      habitat: "Habitat Dome & Shield",
      solar: "Solar Array Field",
      moxie: "MOXIE Air-Maker",
      greenhouse: "Greenhouse",
    },
    intro: {
      title: "Welcome to Jezero Crater, Cadet!",
      capLine:
        "Hi! I'm Dr Farah! Your mission: drive our rover to 5 checkpoints around Jezero Crater. Every task has a tough choice, and there's no perfect answer! Finish all 5 to earn your ride home to Earth.",
      startBtn: "Start Mission",
    },
    lose: {
      title: "Mission Paused!",
      retryBtn: "Try the Mission Again",
      tips: {
        health:
          "Our Crew Health hit 0! Working outside in the cold and dust is hard on astronauts. Sometimes the safe choice is the smart choice!",
        power:
          "Our Power hit 0! Lasers, heaters and long drives all drain the battery. Remember, NASA's Opportunity rover stopped forever when its power ran out.",
        supplies:
          "Our Supplies hit 0! Spare parts, food and air are hard to replace on Mars. Earth is months away, so astronauts must save what they have.",
      },
    },
    victory: {
      bannerTitle: "Welcome Home, Cadet! Mission Complete!",
      capLine:
        "Woohoo! You finished all 5 rover tasks and flew home safely with your Mars samples! Let's count your Mission Points!",
      goToQuiz: "See My Certificate",
    },
    certificate: {
      heading: "Official Mars Cadet Certificate",
      presentedTo: "Proudly Awarded To",
      namePlaceholder: "Enter Cadet Name...",
      defaultName: "Space Cadet",
      completedLine: "For completing all 5 rover tasks on Mars and flying home safely!",
      finalStats: "Final Mission Status",
      badgeLabel: "Specialty Rank",
      roverLevel: "Rover Level",
      badgesTitle: "Badges Collected",
      badges: {
        health: "Crew Care Captain",
        power: "Master Power Engineer",
        supplies: "Supply Chief",
        science: "Star Scientist",
      },
      printBtn: "Print / Save PDF",
      downloadBtn: "Download PNG",
      playAgainBtn: "Play Again",
    },
    nasaModal: {
      title: "NASA Science & Data",
      intro:
        "Blast Off! by Interstellar V is inspired by real NASA Mars missions and open science datasets curated for young explorers:",
      items: [
        {
          name: "NASA Perseverance Rover (MOXIE & MEDA)",
          desc: "MOXIE showed it can turn Mars's thin air into air we can breathe, while MEDA measures Mars weather, dust, and freezing temperatures.",
        },
        {
          name: "NASA DONKI Space Weather Database",
          desc: "Tracks solar flares and space storms so astronauts know when to boost radiation shielding.",
        },
        {
          name: "NASA Open Science Data Repository (OSDR)",
          desc: "Shares real space-biology experiments—like growing algae and plants in space—with scientists and students worldwide.",
        },
      ],
    },
  },

  ms: {
    gameTitle: "Blast Off!",
    heroTagline: "Interstellar V • Pengembaraan Rover Marikh",
    choosePlanet: "Pilih Tapak Pendaratan Anda",
    marsTitle: "Marikh: Kawah Jezero",
    marsSubtitle: "5 Tugasan Rover • Terbang Pulang ke Bumi",
    marsCTA: "Mulakan Misi",
    menu: {
      subtitle: "Kawalan Misi • Orbit Bumi",
      baseLabel: "Kawalan Misi Bumi",
      suitChecks: ["Topi keledar dipakai", "Tangki udara penuh", "Sarung tangan dikunci", "Sedia untuk dilancarkan!"],
      startGame: "Mula Permainan",
      credits: "Kredit",
      back: "Kembali",
      selectMission: "Pilih Misi Anda",
      missionMars: "Misi Marikh",
      missionLunar: "Misi Bulan",
      locked: "Dikunci",
      lockedHint: "Tamatkan Misi Marikh untuk membuka",
      version: "v1.0 • Dibina untuk penjelajah angkasa muda",
    },
    creditsModal: {
      title: "Kredit",
      sections: [
        { heading: "Pasukan Interstellar V", items: ["Abdul Rahim", "Asyraf Iqbal", "Batrisya Qistina", "Maisarah", "Qhairunnisa Shahirah"] },
        { heading: "Reka Bentuk & Pembangunan Permainan", items: ["Interstellar V"] },
        { heading: "Sains & Data", items: ["Rover Perseverance NASA (MOXIE & MEDA)", "Pangkalan Data Cuaca Angkasa DONKI NASA", "Repositori Data Sains Terbuka NASA (OSDR)"] },
        { heading: "Data NASA", items: ["3.2.2 Solar Panels & Arrays (NASA Small Spacecraft Technology: Power)", "OSD-883: Analysis of Vegetable Seedlings Grown in Contact with Apollo 14 Lunar Surface Fines", "LCROSS (Lunar Crater Observation and Sensing Satellite)", "NASA Achieves Water Recovery Milestone on International Space Station", "Thermal Control on the Lunar Surface (NASA Technical Reports Server)", "10 Things: Mars Helicopter", "Mars Phoenix", "Mars Rock Samples"] },
        { heading: "Data Rakan Agensi Angkasa & Lain-lain", items: ["The Case for Clear Dust-Repellant Coating (Voyager Technologies)"] },
        { heading: "Dibina Dengan", items: ["React", "Three.js & React Three Fiber", "Tailwind CSS", "Ikon Lucide", "Web Audio API (semua bunyi disintesis)"] },
      ],
      thanks: "Terima kasih kerana bermain, Kadet! 🚀",
    },
    launch: {
      countdown: "Kiraan detik",
      liftoff: "Pelancaran!",
      cruise: "Menuju ke Marikh",
      cruiseSub: "225 juta km • ~7 bulan perjalanan",
      descent: "Memasuki atmosfera Marikh",
      descentSub: "Menghidupkan roket brek…",
      touchdown: "Mendarat!",
      touchdownSub: "Selamat datang ke Kawah Jezero",
      skip: "Langkau",
    },
    moonTitle: "Bulan: Kawah Shackleton",
    moonSubtitle: "5 Tugasan Bulan • Pangkalan Artemis",
    settings: "Tetapan",
    language: "Bahasa",
    soundLabel: "Audio Angkasa & Kesan Bunyi",
    soundOn: "Hidup",
    soundOff: "Mati",
    close: "Tutup",
    nasaDataBtn: "Sains & Data NASA",
    resources: {
      health: "Kesihatan Kru",
      power: "Kuasa",
      supplies: "Bekalan",
      science: "Sains",
    },
    roverMode: "Mod Rover",
    roverHint: "WASD / Anak panah atau D-Pad untuk pandu • Seret untuk lihat",
    rover: {
      camOn: "Kamera Rover Dihidupkan!",
      explore: "Pandu dan terokai pangkalan!",
      backToBase: "Kembali ke Pangkalan",
      found: "Anda jumpa:",
      map: "Peta",
      you: "Anda",
    },
    resetCam: "Set Semula Kamera",
    clickModuleHint: "Tip: Klik mana-mana modul pangkalan untuk periksa!",
    modules: {
      habitat: "Kubah Habitat & Perisai",
      solar: "Medan Panel Suria",
      moxie: "Penjana Udara MOXIE",
      greenhouse: "Rumah Hijau",
    },
    intro: {
      title: "Selamat Datang ke Kawah Jezero, Kadet!",
      capLine:
        "Hai! Saya Dr Farah! Misi anda: pandu rover kita ke 5 pusat pemeriksaan di sekitar Kawah Jezero. Setiap tugasan ada pilihan yang sukar, dan tiada jawapan sempurna! Selesaikan kesemua 5 untuk pulang ke Bumi.",
      startBtn: "Mula Misi",
    },
    lose: {
      title: "Misi Dihentikan!",
      retryBtn: "Cuba Misi Semula",
      tips: {
        health:
          "Kesihatan Kru kita mencecah 0! Bekerja di luar dalam sejuk dan debu sangat memenatkan angkasawan. Kadang-kadang pilihan selamat ialah pilihan bijak!",
        power:
          "Kuasa kita mencecah 0! Laser, pemanas dan perjalanan jauh menghabiskan bateri. Ingat, rover Opportunity NASA berhenti selama-lamanya apabila kuasanya habis.",
        supplies:
          "Bekalan kita mencecah 0! Alat ganti, makanan dan udara sukar diganti di Marikh. Bumi berbulan-bulan jauhnya, jadi angkasawan mesti berjimat.",
      },
    },
    victory: {
      bannerTitle: "Selamat Pulang, Kadet! Misi Selesai!",
      capLine:
        "Yahoo! Anda selesaikan kesemua 5 tugasan rover dan terbang pulang dengan selamat bersama sampel Marikh! Jom kira Mata Misi anda!",
      goToQuiz: "Lihat Sijil Saya",
    },
    certificate: {
      heading: "Sijil Rasmi Kadet Marikh",
      presentedTo: "Dengan Bangganya Dianugerahkan Kepada",
      namePlaceholder: "Masukkan Nama Kadet...",
      defaultName: "Kadet Angkasa",
      completedLine: "Kerana menyelesaikan kesemua 5 tugasan rover di Marikh dan terbang pulang dengan selamat!",
      finalStats: "Status Akhir Misi",
      badgeLabel: "Pangkat Kepakaran",
      roverLevel: "Tahap Rover",
      badgesTitle: "Lencana Dikumpul",
      badges: {
        health: "Kapten Penjagaan Kru",
        power: "Jurutera Kuasa Pakar",
        supplies: "Ketua Bekalan",
        science: "Saintis Bintang",
      },
      printBtn: "Cetak / Simpan PDF",
      downloadBtn: "Muat Turun PNG",
      playAgainBtn: "Main Semula",
    },
    nasaModal: {
      title: "Sains & Data NASA",
      intro:
        "Blast Off! oleh Interstellar V diinspirasikan oleh misi Marikh NASA sebenar dan set data sains terbuka untuk penjelajah muda:",
      items: [
        {
          name: "Rover Perseverance NASA (MOXIE & MEDA)",
          desc: "MOXIE membuktikan udara Marikh yang nipis boleh ditukar menjadi udara untuk bernafas, manakala MEDA mengukur cuaca, debu, dan suhu beku Marikh.",
        },
        {
          name: "Pangkalan Data Cuaca Angkasa DONKI NASA",
          desc: "Menjejak suar suria dan ribut angkasa supaya angkasawan tahu bila perlu menguatkan perisai radiasi.",
        },
        {
          name: "Repositori Data Sains Terbuka NASA (OSDR)",
          desc: "Berkongsi eksperimen bio-angkasa sebenar—seperti menanam alga dan tumbuhan di angkasa—bersama saintis dan pelajar seluruh dunia.",
        },
      ],
    },
  },
};

export const TRANSLATIONS = {
  en: { ...BASE.en, ...TASK_TEXT.en },
  ms: { ...BASE.ms, ...TASK_TEXT.ms },
};
