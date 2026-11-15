// Moon mission text (Shackleton Crater, Artemis base). Merged over the base translations when the Moon is active.
// Every fact below comes from the mission design sheet, with its NASA / space-agency source.

export const MOON_TEXT = {
  en: {
    flag: {
      checkpoint: "Flagpole",
      plantLabel: "Plant the Jalur Gemilang",
      awarded: "🎉 You've earned the Jalur Gemilang! Drive to the 🚩 flagpole to plant it on the Moon!",
      holdTitle: "Plant the Jalur Gemilang!",
      holdHint: "Hold the button (or E / SPACE) to push the pole into the hard Moon dust!",
      push: "PUSH!",
      depth: "Pole depth",
      done: "Malaysia's flag is on the Moon!",
      windFact: "There's no wind on the Moon, so NASA's Apollo flags had a bar along the top to hold them open, just like ours! Photos from NASA's Lunar Reconnaissance Orbiter show most Apollo flags are still standing today.",
      malaysiaTitle: "Malaysia in space",
      astronautFact: "In October 2007, Dato' Dr. Sheikh Muszaphar Shukor became Malaysia's first astronaut, flying to the International Space Station. Maybe you'll be next!",
      continue: "To the relief ship!",
      readyHome: "🚀 The relief ship is ready! Drive to it to fly home.",
      allDoneFlag: "Plant Malaysia's flag at the 🚩 flagpole before flying home!",
      driveToFlag: "Drive to the Flagpole",
      sticker: "Jalur Gemilang on the Moon",
      stickerTag: "Special sticker",
      certLine: "Planted the Jalur Gemilang on the Moon!",
    },
    resources: { power: "Power", oxygen: "Air", food: "Food", shielding: "Shielding" },
    // Radio signals take only about 1.3 seconds between the Moon and Earth
    play: { vitals: { delay: "Earth: 1.3 sec away" } },
    modules: { habitat: "Artemis Habitat & Shield", solar: "Solar Array Field", moxie: "Water Recycler", greenhouse: "Greenhouse" },
    intro: {
      title: "Welcome to Shackleton Crater, Cadet!",
      capLine:
        "Hi! I'm Dr Farah! We landed near the Moon's south pole! Drive the rover to 3 checkpoints and keep our Power, Air, Food and Shielding safe until the relief ship arrives.",
      startBtn: "Start Moon Mission",
    },
    victory: {
      bannerTitle: "Welcome Home, Moon Cadet!",
      capLine: "The relief ship brought us home safely from the Moon! Let's count your Mission Points!",
      goToQuiz: "See My Certificate",
    },
    lose: {
      tips: {
        power: "Our Power hit 0! On the Moon, solar panels stop during the long lunar night, so every bit of battery counts.",
        oxygen: "Our Air hit 0! The Moon has no air at all. Ice and recycled water are how a Moon base makes fresh air.",
        food: "Our Food hit 0! Supply ships take days to arrive, so astronauts always pack extra pantry food.",
        shielding: "Our Shielding hit 0! With no air or magnetic field, the Moon gets blasted by solar storms. Thick shields keep the crew safe.",
      },
    },
    help: {
      stats: {
        power: "Power: batteries and solar panels",
        oxygen: "Air: fresh air for the crew to breathe",
        food: "Food: the base pantry and farm",
        shielding: "Shielding: protection from solar storms",
      },
    },
    sky: {
      earth: "Earth: home!",
      lowGravityTip: "🪶 Wheee! Moon gravity is only 1/6 of Earth's, so your rover floats for ages!",
      blueSunsetTip: "🌍 Look up! From the Moon, Earth hangs in the black sky. There's no air, so the sky stays black even in daytime!",
    },
    launch: {
      countdown: "T-minus",
      liftoff: "Liftoff!",
      cruise: "Flying to the Moon",
      cruiseSub: "384,400 km • about 3 days",
      descent: "Landing near the south pole",
      descentSub: "Firing landing engines…",
      touchdown: "Touchdown!",
      touchdownSub: "Welcome to Shackleton Crater",
      skip: "Skip",
    },
    launchHome: {
      countdown: "T-minus",
      liftoff: "Liftoff from the Moon!",
      cruise: "Flying home to Earth",
      cruiseSub: "Carrying your Moon samples • about 3 days",
      descent: "Entering Earth's atmosphere",
      descentSub: "Parachutes out!",
      touchdown: "Splashdown!",
      touchdownSub: "Welcome home, Moon Cadet!",
      skip: "Skip",
    },
    certificate: {
      completedLine: "For completing all 3 rover tasks on the Moon and flying home safely!",
      badges: { power: "Master Power Engineer", oxygen: "Chief Air Specialist", food: "Space Chef", shielding: "Shield Commander" },
    },
    blast: {
      scienceHint: "Every badge you win unlocks a rover upgrade!",
      homeCheckpoint: "Relief Ship",
      homeText: "All 3 tasks are done. The relief ship has landed!",
      allDoneDrive: "Drive to the 🚀 relief ship to fly home!",
      env: {
        moonDark: "🌑 Pitch-black crater!",
        moonStorm: "☀️ Solar storm warning!",
        moonNight: "🌙 Lunar night: −130°C!",
      },
    },
    tasks: [
      {
        title: "The Ice-Mining Dilemma",
        short: "Ice-Mining Dilemma",
        capTip: "NASA's sensors found frozen water ice in a pitch-black crater ridge nearby. Let's drive there!",
        problemShort: "Ice found in a dark crater! Drilling it gives air, but uses lots of battery.",
        spots: ["Frozen water ice!", "Sunlight never reaches here", "The drill needs lots of power"],
        quiz: {
          q: "How did NASA find ice in a Moon crater in 2009?",
          options: ["An astronaut tasted it", "It crashed a rocket into the crater and studied the dust cloud", "It saw a snowman in a photo"],
          hint: "Think BIG crash! The dust cloud told the secret.",
          badge: "Ice Hunter",
        },
        learning:
          "In October 2009 NASA crashed its LCROSS rocket stage into Cabeus crater near the Moon's south pole on purpose. The dust cloud showed water ice, which future bases could turn into drinking water, air and rocket fuel.",
        source: "NASA",
        choices: [
          {
            label: "Run the ice drill at full power.",
            short: "Drill full power",
            play: "Hold to drill the ice. Let the drill cool when it gets hot!",
            resultShort: "WOOHOO! Air tanks topped up, but the batteries took a big hit!",
            future: "Let's hope the Sun stays bright to recharge the batteries.",
          },
          {
            label: "Save power and use the backup air tanks.",
            short: "Use backup air",
            play: "Tap the 3 air-tank valves to connect them. Your gloves are wobbly!",
            resultShort: "Smart battery saving! But we dipped into our reserve air.",
            future: "Keep an eye on that Air meter!",
          },
        ],
      },
      {
        title: "The Water Recycler",
        short: "Water Recycler",
        capTip: "The water recycler is full of used water from washing, sweat and even breath. Drive over to check it!",
        problemShort: "The recycler can clean used water and make fresh air, but it's hungry for power!",
        spots: ["Used water from washing", "Sweat and breath too!", "Cleaner than tap water"],
        quiz: {
          q: "How much of its used water does the space station recycle?",
          options: ["About 10%", "About 50%", "98%, even from sweat and breath!"],
          hint: "Almost ALL of it! Nearly every drop is saved.",
          badge: "Water Wizard",
        },
        learning:
          "In 2023 the ISS life support system reached 98% water recovery, recycling water from urine, sweat and even breath. NASA says the cleaned water is purer than many tap supplies on Earth.",
        source: "NASA (via Space.com)",
        choices: [
          {
            label: "Run the recycler.",
            short: "Run the recycler",
            play: "Drag the water drops into the recycler until the gauge reaches 98%!",
            resultShort: "Splish-splash, fresh water and fresh air! The batteries dipped a little.",
            future: "More air in the tanks for the storm ahead.",
          },
          {
            label: "Use the stored water tanks.",
            short: "Use stored tanks",
            play: "Drag water from the stored tanks into the plant beds before time runs out!",
            resultShort: "Power saved, but less water for making air and growing plants.",
            future: "Our food and air are a little lower now.",
          },
        ],
      },
      {
        title: "The DONKI Early Warning",
        short: "DONKI Early Warning",
        capTip: "NASA's DONKI space-weather alert says a solar storm is coming! Drive to the antenna dish!",
        problemShort: "The Sun threw a giant cloud of particles at the Moon. It hasn't arrived yet!",
        spots: ["Real alert: storm of 10 May 2024", "The DONKI antenna", "Our storm shelter"],
        quiz: {
          q: "The flash of light from a solar flare reaches us in about…",
          options: ["8 seconds", "8 minutes", "8 days"],
          hint: "Sunlight takes a few minutes to cross space, not seconds or days.",
          badge: "Storm Watcher",
        },
        learning:
          "Light from a solar flare reaches us in about 8 minutes, but a coronal mass ejection usually takes about 1 to 3 days, which gives mission controllers time to prepare. NASA's DONKI database records real storms, like the one on 10 May 2024.",
        source: "NASA Goddard, NASA DONKI",
        choices: [
          {
            label: "Prepare now: pile Moon-dirt bags on the shelter.",
            short: "Build the shield",
            play: "Hold to shovel Moon-dirt into bags. Rest before you get too tired!",
            resultShort: "Shelter reinforced! The spacesuits used plenty of air, though.",
            future: "A strong shelter for when the storm hits.",
          },
          {
            label: "Wait and see.",
            short: "Wait and watch",
            play: "Watch the DONKI storm meter and tap the moment the line jumps!",
            resultShort: "We saved energy… let's hope the storm is a small one!",
            future: "Our shields are a little thinner if the storm is big.",
          },
        ],
      },
      {
        title: "Lunar Dust on the Solar Arrays",
        short: "Dusty Solar Panels",
        capTip: "A meteoroid impact sprayed sticky Moon dust onto our solar panels! Drive to the panels!",
        problemShort: "Sticky Moon dust covered the solar panels. They charge at half speed!",
        spots: ["Panels like powdered sugar!", "Meteoroid impact over there", "Charging at half speed"],
        quiz: {
          q: "Why is Moon dust so sharp and sticky?",
          options: ["No wind or water ever smooths the grains", "It's covered in honey", "It's made of frozen ice"],
          hint: "On Earth, wind and rivers round off sand. The Moon has neither!",
          badge: "Dust Buster",
        },
        learning:
          "Apollo 17 commander Gene Cernan called Moon dust \"probably one of our greatest inhibitors\" on the Moon. With no wind or water to round them off, the grains are sharp, and they stuck to suits and scratched visors.",
        source: "ESA",
        choices: [
          {
            label: "Suit up and clean the solar panels.",
            short: "Clean the panels",
            play: "Swipe the dust off the solar panel and watch the Sun icon brighten!",
            resultShort: "Sparkling clean, power surging back! That spacewalk used air and snacks.",
            future: "Full batteries for the cold night ahead.",
          },
          {
            label: "Leave the dust and run on low-power mode.",
            short: "Low-power mode",
            play: "Tap the 4 glowing switches to turn off machines and save power!",
            resultShort: "We saved air and snacks, but the batteries drain fast in low-power mode!",
            future: "We'll need every bit of battery for the lunar night.",
          },
        ],
      },
      {
        title: "The Final Lunar Night Freeze",
        short: "Lunar Night Freeze",
        capTip: "The Sun is dropping below Shackleton's rim. Drive to the landing pad: the relief ship is almost here!",
        problemShort: "Freezing −130°C darkness! Heaters need power, and life support must stay steady.",
        spots: ["Relief ship coming!", "−130°C outside!", "Heaters need power"],
        quiz: {
          q: "Why do machines on the Moon need heaters at night?",
          options: ["To make popcorn", "The night can get colder than −150°C", "The Moon is made of cheese"],
          hint: "Lunar nights are long and super, super cold!",
          badge: "Night Survivor",
        },
        learning:
          "The first seismometer on the Moon (Apollo 11) used a small radioisotope heater to stay above −54°C during the 340-hour lunar night, when the surface fell to about −170°C. NASA's LRO measured nights near the equator at about −130°C.",
        source: "NASA, NASA LRO",
        choices: [
          {
            label: "Balance heaters and life support equally.",
            short: "Balance it all",
            play: "Keep the needle in the green zone between Heat and Air!",
            resultShort: "Steady and smart! Every system held until the relief ship landed!",
            future: "The crew is ready to fly home.",
          },
          {
            label: "Blast full heat and celebrate early.",
            short: "Blast full heat",
            play: "Hold the heater button, but don't let the battery run empty!",
            resultShort: "Toasty warm, and we just barely made it before the batteries emptied! Whew!",
            future: "Celebrating early is risky. That was a nail-biter!",
          },
        ],
      },
    ],
    events: [
      {
        title: "Micrometeoroid ping!",
        text: "PING! A speck of space rock smaller than a grain of sand made a tiny hole in the greenhouse wall.",
        fact: "A 2025 study using NASA's Meteoroid Engineering Model estimated a Moon base the size of the ISS would be hit by 15,000 to 23,000 tiny particles a year. (ScienceAlert)",
        choices: [
          { short: "Spacewalk & patch", result: "Patched and stronger than before! The suits used some air." },
          { short: "Seal off the corner", result: "Quick and easy, but we lost the plants in that corner." },
        ],
      },
      {
        title: "Moonquake!",
        text: "The floor rumbles and cups wobble. A faint hiss comes from the pipes!",
        fact: "Apollo seismometers recorded about 13,000 seismic events between 1969 and 1977, including 28 shallow moonquakes. (Science News, UBC)",
        choices: [
          { short: "Scan every pipe", result: "Found a loose air valve and fixed it!" },
          { short: "Sleep, check tomorrow", result: "Power saved, but that hiss was an air leak all night." },
        ],
      },
      {
        title: "The crumb problem!",
        text: "A bonus box of crunchy crackers! But crumbs float around in low gravity.",
        fact: "NASA sends tortillas to space instead of bread, because crumbs float and can get into machines or astronauts' eyes. (Science Friday, Kennedy Space Center)",
        choices: [
          { short: "Tortilla wraps", result: "No crumbs, no problems! Fewer tortillas left." },
          { short: "Open the crackers", result: "Crunch! But a crumb floated into a fan and caused a glitch!" },
        ],
      },
      {
        title: "Workout time!",
        text: "The crew's muscles feel floppy. Low gravity makes bones and muscles weaker.",
        fact: "ISS crew members average two hours of exercise a day, and can still lose about 1% of their bone density per month in space. (NASA, CSA)",
        choices: [
          { short: "Full workout", result: "Strong astronauts piled extra Moon-dirt on the shield!" },
          { short: "Skip and rest", result: "Comfy night, but tired arms couldn't finish the shield." },
        ],
      },
      {
        title: "The supply ship is late!",
        text: "Mission Control radios: the relief ship is a little late. Make the food last longer!",
        fact: "NASA always packs extra pantry food in case a flight runs long, and ISS food is made to last at least three years. (NASA, Science Friday)",
        choices: [
          { short: "Smaller meals", result: "Pantry saved! A hungry crew turned the heaters up." },
          { short: "Normal meals", result: "Happy, warm tummies, but the pantry is getting low!" },
        ],
      },
    ],
  },

  ms: {
    flag: {
      checkpoint: "Tiang Bendera",
      plantLabel: "Pacak Jalur Gemilang",
      awarded: "🎉 Anda memperoleh Jalur Gemilang! Pandu ke tiang bendera 🚩 untuk memacaknya di Bulan!",
      holdTitle: "Pacak Jalur Gemilang!",
      holdHint: "Tahan butang (atau E / SPACE) untuk menolak tiang ke dalam debu Bulan yang keras!",
      push: "TOLAK!",
      depth: "Kedalaman tiang",
      done: "Bendera Malaysia di Bulan!",
      windFact: "Tiada angin di Bulan, jadi bendera Apollo NASA mempunyai palang di bahagian atas untuk memastikannya terbentang, sama seperti bendera kita! Gambar daripada Lunar Reconnaissance Orbiter NASA menunjukkan kebanyakan bendera Apollo masih berdiri hari ini.",
      malaysiaTitle: "Malaysia di angkasa",
      astronautFact: "Pada Oktober 2007, Dato' Dr. Sheikh Muszaphar Shukor menjadi angkasawan pertama Malaysia, terbang ke Stesen Angkasa Antarabangsa. Mungkin anda yang seterusnya!",
      continue: "Ke kapal bantuan!",
      readyHome: "🚀 Kapal bantuan sudah sedia! Pandu ke sana untuk terbang pulang.",
      allDoneFlag: "Pacak bendera Malaysia di tiang bendera 🚩 sebelum terbang pulang!",
      driveToFlag: "Pandu ke Tiang Bendera",
      sticker: "Jalur Gemilang di Bulan",
      stickerTag: "Pelekat istimewa",
      certLine: "Memacak Jalur Gemilang di Bulan!",
    },
    resources: { power: "Kuasa", oxygen: "Udara", food: "Makanan", shielding: "Perisai" },
    play: { vitals: { delay: "Bumi: 1.3 saat jauhnya" } },
    modules: { habitat: "Habitat Artemis & Perisai", solar: "Ladang Panel Suria", moxie: "Pengitar Semula Air", greenhouse: "Rumah Hijau" },
    intro: {
      title: "Selamat Datang ke Kawah Shackleton, Kadet!",
      capLine:
        "Hai! Saya Dr Farah! Kita mendarat dekat kutub selatan Bulan! Pandu rover ke 3 pusat pemeriksaan dan jaga Kuasa, Udara, Makanan dan Perisai sehingga kapal bantuan tiba.",
      startBtn: "Mula Misi Bulan",
    },
    victory: {
      bannerTitle: "Selamat Pulang, Kadet Bulan!",
      capLine: "Kapal bantuan membawa kita pulang dari Bulan dengan selamat! Jom kira Mata Misi anda!",
      goToQuiz: "Lihat Sijil Saya",
    },
    lose: {
      tips: {
        power: "Kuasa kita mencecah 0! Di Bulan, panel suria berhenti semasa malam bulan yang panjang, jadi setiap tenaga bateri penting.",
        oxygen: "Udara kita mencecah 0! Bulan langsung tiada udara. Ais dan air kitar semula ialah cara pangkalan Bulan membuat udara segar.",
        food: "Makanan kita mencecah 0! Kapal bekalan mengambil masa berhari-hari, jadi angkasawan sentiasa membawa makanan tambahan.",
        shielding: "Perisai kita mencecah 0! Tanpa udara atau medan magnet, Bulan dihentam ribut suria. Perisai tebal melindungi kru.",
      },
    },
    help: {
      stats: {
        power: "Kuasa: bateri dan panel suria",
        oxygen: "Udara: udara segar untuk kru bernafas",
        food: "Makanan: stor dan ladang pangkalan",
        shielding: "Perisai: perlindungan daripada ribut suria",
      },
    },
    sky: {
      earth: "Bumi: rumah!",
      lowGravityTip: "🪶 Wiii! Graviti Bulan hanya 1/6 daripada Bumi, jadi rover anda terapung lama!",
      blueSunsetTip: "🌍 Lihat ke atas! Dari Bulan, Bumi tergantung di langit hitam. Tiada udara, jadi langit kekal hitam walaupun siang!",
    },
    launch: {
      countdown: "Kiraan detik",
      liftoff: "Pelancaran!",
      cruise: "Terbang ke Bulan",
      cruiseSub: "384,400 km • kira-kira 3 hari",
      descent: "Mendarat dekat kutub selatan",
      descentSub: "Menghidupkan enjin pendaratan…",
      touchdown: "Mendarat!",
      touchdownSub: "Selamat datang ke Kawah Shackleton",
      skip: "Langkau",
    },
    launchHome: {
      countdown: "Kiraan detik",
      liftoff: "Berlepas dari Bulan!",
      cruise: "Terbang pulang ke Bumi",
      cruiseSub: "Membawa sampel Bulan • kira-kira 3 hari",
      descent: "Memasuki atmosfera Bumi",
      descentSub: "Payung terjun dibuka!",
      touchdown: "Mendarat di laut!",
      touchdownSub: "Selamat pulang, Kadet Bulan!",
      skip: "Langkau",
    },
    certificate: {
      completedLine: "Kerana menyelesaikan kesemua 3 tugasan rover di Bulan dan terbang pulang dengan selamat!",
      badges: { power: "Jurutera Kuasa Pakar", oxygen: "Ketua Pakar Udara", food: "Cef Angkasa", shielding: "Komander Perisai" },
    },
    blast: {
      scienceHint: "Setiap lencana yang dimenangi membuka naik taraf rover!",
      homeCheckpoint: "Kapal Bantuan",
      homeText: "Kesemua 3 tugasan selesai. Kapal bantuan sudah mendarat!",
      allDoneDrive: "Pandu ke kapal bantuan 🚀 untuk terbang pulang!",
      env: {
        moonDark: "🌑 Kawah gelap gelita!",
        moonStorm: "☀️ Amaran ribut suria!",
        moonNight: "🌙 Malam bulan: −130°C!",
      },
    },
    tasks: [
      {
        title: "Dilema Melombong Ais",
        short: "Dilema Melombong Ais",
        capTip: "Sensor NASA menjumpai ais air beku dalam permatang kawah yang gelap gelita. Jom pandu ke sana!",
        problemShort: "Ais dijumpai dalam kawah gelap! Menggerudi memberi udara, tapi guna banyak bateri.",
        spots: ["Ais air beku!", "Cahaya matahari tak pernah sampai", "Gerudi perlukan banyak kuasa"],
        quiz: {
          q: "Bagaimana NASA menjumpai ais dalam kawah Bulan pada 2009?",
          options: ["Angkasawan merasanya", "Merempuhkan roket ke dalam kawah dan mengkaji awan debu", "Nampak orang salji dalam gambar"],
          hint: "Fikirkan rempuhan BESAR! Awan debu membongkar rahsianya.",
          badge: "Pemburu Ais",
        },
        learning:
          "Pada Oktober 2009 NASA sengaja merempuhkan peringkat roket LCROSS ke dalam kawah Cabeus dekat kutub selatan Bulan. Awan debu menunjukkan ais air, yang boleh dijadikan air minuman, udara dan bahan api roket oleh pangkalan masa depan.",
        source: "NASA",
        choices: [
          {
            label: "Jalankan gerudi ais dengan kuasa penuh.",
            short: "Gerudi kuasa penuh",
            play: "Tahan untuk menggerudi ais. Biarkan gerudi sejuk apabila ia panas!",
            resultShort: "YAHOO! Tangki udara penuh, tapi bateri banyak berkurang!",
            future: "Harap matahari kekal cerah untuk mengecas bateri.",
          },
          {
            label: "Jimat kuasa dan guna tangki udara simpanan.",
            short: "Guna udara simpanan",
            play: "Ketik 3 injap tangki udara untuk menyambungnya. Sarung tangan anda bergoyang!",
            resultShort: "Bijak menjimat bateri! Tapi kita guna udara simpanan.",
            future: "Perhatikan meter Udara!",
          },
        ],
      },
      {
        title: "Pengitar Semula Air",
        short: "Pengitar Semula Air",
        capTip: "Pengitar semula air penuh dengan air terpakai daripada mandi, peluh dan juga nafas. Pandu ke sana!",
        problemShort: "Pengitar boleh membersihkan air terpakai dan membuat udara, tapi ia lapar kuasa!",
        spots: ["Air terpakai daripada mandi", "Peluh dan nafas juga!", "Lebih bersih daripada air paip"],
        quiz: {
          q: "Berapa banyak air terpakai yang dikitar semula oleh stesen angkasa?",
          options: ["Kira-kira 10%", "Kira-kira 50%", "98%, malah daripada peluh dan nafas!"],
          hint: "Hampir SEMUA! Hampir setiap titis disimpan.",
          badge: "Ahli Sihir Air",
        },
        learning:
          "Pada 2023 sistem sokongan hayat ISS mencapai 98% pemulihan air, mengitar semula air daripada air kencing, peluh dan juga nafas. NASA berkata air yang dibersihkan lebih tulen daripada banyak bekalan air paip di Bumi.",
        source: "NASA (melalui Space.com)",
        choices: [
          {
            label: "Jalankan pengitar semula.",
            short: "Jalankan pengitar",
            play: "Seret titisan air ke dalam pengitar sehingga meter mencapai 98%!",
            resultShort: "Air segar dan udara segar! Bateri berkurang sedikit.",
            future: "Lebih udara dalam tangki untuk ribut nanti.",
          },
          {
            label: "Guna tangki air simpanan.",
            short: "Guna tangki simpanan",
            play: "Seret air dari tangki simpanan ke batas tanaman sebelum masa tamat!",
            resultShort: "Kuasa dijimatkan, tapi kurang air untuk udara dan tanaman.",
            future: "Makanan dan udara kita berkurang sedikit.",
          },
        ],
      },
      {
        title: "Amaran Awal DONKI",
        short: "Amaran Awal DONKI",
        capTip: "Amaran cuaca angkasa DONKI NASA berkata ribut suria sedang datang! Pandu ke piring antena!",
        problemShort: "Matahari melontar awan zarah gergasi ke arah Bulan. Ia belum sampai!",
        spots: ["Amaran sebenar: ribut 10 Mei 2024", "Antena DONKI", "Tempat perlindungan ribut kita"],
        quiz: {
          q: "Cahaya daripada nyalaan suria sampai kepada kita dalam masa kira-kira…",
          options: ["8 saat", "8 minit", "8 hari"],
          hint: "Cahaya matahari mengambil beberapa minit untuk merentasi angkasa, bukan saat atau hari.",
          badge: "Pemerhati Ribut",
        },
        learning:
          "Cahaya daripada nyalaan suria sampai dalam kira-kira 8 minit, tetapi lontaran jisim korona biasanya mengambil 1 hingga 3 hari, memberi masa kepada pengawal misi untuk bersedia. Pangkalan data DONKI NASA merekod ribut sebenar, seperti pada 10 Mei 2024.",
        source: "NASA Goddard, NASA DONKI",
        choices: [
          {
            label: "Bersedia sekarang: susun beg tanah Bulan pada tempat perlindungan.",
            short: "Bina perisai",
            play: "Tahan untuk menyodok tanah Bulan ke dalam beg. Berehat sebelum terlalu penat!",
            resultShort: "Tempat perlindungan diperkukuh! Tapi sut angkasa guna banyak udara.",
            future: "Tempat perlindungan yang kuat apabila ribut melanda.",
          },
          {
            label: "Tunggu dan lihat.",
            short: "Tunggu & perhati",
            play: "Perhatikan meter ribut DONKI dan ketik ketika garisan melonjak!",
            resultShort: "Kita jimat tenaga… harap ribut itu kecil!",
            future: "Perisai kita lebih nipis jika ribut besar.",
          },
        ],
      },
      {
        title: "Debu Bulan pada Panel Suria",
        short: "Panel Suria Berdebu",
        capTip: "Hentaman meteoroid menyembur debu Bulan yang melekit ke panel suria kita! Pandu ke panel!",
        problemShort: "Debu Bulan yang melekit menutup panel suria. Ia mengecas separuh laju!",
        spots: ["Panel macam gula tepung!", "Hentaman meteoroid di sana", "Mengecas separuh laju"],
        quiz: {
          q: "Kenapa debu Bulan sangat tajam dan melekit?",
          options: ["Tiada angin atau air yang melicinkan butirannya", "Ia diselaputi madu", "Ia diperbuat daripada ais beku"],
          hint: "Di Bumi, angin dan sungai membulatkan pasir. Bulan tiada kedua-duanya!",
          badge: "Pembasmi Debu",
        },
        learning:
          "Komander Apollo 17 Gene Cernan menggelar debu Bulan \"mungkin salah satu penghalang terbesar kita\" di Bulan. Tanpa angin atau air untuk membulatkannya, butirannya tajam, melekat pada sut dan mencalarkan visor.",
        source: "ESA",
        choices: [
          {
            label: "Pakai sut dan bersihkan panel suria.",
            short: "Bersihkan panel",
            play: "Leret debu dari panel suria dan lihat ikon Matahari bersinar!",
            resultShort: "Bersih berkilat, kuasa kembali! Jalan angkasa itu guna udara dan snek.",
            future: "Bateri penuh untuk malam yang sejuk.",
          },
          {
            label: "Biarkan debu dan guna mod kuasa rendah.",
            short: "Mod kuasa rendah",
            play: "Ketik 4 suis bercahaya untuk mematikan mesin dan menjimat kuasa!",
            resultShort: "Udara dan snek dijimatkan, tapi bateri cepat habis dalam mod kuasa rendah!",
            future: "Kita perlukan setiap tenaga bateri untuk malam bulan.",
          },
        ],
      },
      {
        title: "Malam Bulan Terakhir yang Beku",
        short: "Malam Bulan Beku",
        capTip: "Matahari terbenam di sebalik pinggir Shackleton. Pandu ke pad pendaratan: kapal bantuan hampir tiba!",
        problemShort: "Kegelapan beku −130°C! Pemanas perlukan kuasa, dan sokongan hayat mesti stabil.",
        spots: ["Kapal bantuan datang!", "−130°C di luar!", "Pemanas perlukan kuasa"],
        quiz: {
          q: "Kenapa mesin di Bulan perlukan pemanas pada waktu malam?",
          options: ["Untuk membuat bertih jagung", "Malam boleh menjadi lebih sejuk daripada −150°C", "Bulan diperbuat daripada keju"],
          hint: "Malam bulan panjang dan sangat, sangat sejuk!",
          badge: "Penyelamat Malam",
        },
        learning:
          "Seismometer pertama di Bulan (Apollo 11) menggunakan pemanas radioisotop kecil untuk kekal di atas −54°C sepanjang malam bulan 340 jam, ketika permukaan jatuh ke kira-kira −170°C. LRO NASA mengukur malam dekat khatulistiwa pada kira-kira −130°C.",
        source: "NASA, NASA LRO",
        choices: [
          {
            label: "Imbangkan pemanas dan sokongan hayat sama rata.",
            short: "Imbangkan semua",
            play: "Kekalkan jarum dalam zon hijau antara Haba dan Udara!",
            resultShort: "Stabil dan bijak! Setiap sistem bertahan sehingga kapal bantuan mendarat!",
            future: "Kru sedia untuk terbang pulang.",
          },
          {
            label: "Pasang haba penuh dan meraikan awal.",
            short: "Haba penuh",
            play: "Tahan butang pemanas, tapi jangan biar bateri habis!",
            resultShort: "Hangat, dan kita hampir-hampir berjaya sebelum bateri habis! Fuh!",
            future: "Meraikan terlalu awal itu berisiko. Sungguh mendebarkan!",
          },
        ],
      },
    ],
    events: [
      {
        title: "Ping mikrometeoroid!",
        text: "PING! Serpihan batu angkasa lebih kecil daripada sebutir pasir membuat lubang kecil pada dinding rumah hijau.",
        fact: "Kajian 2025 menggunakan Model Kejuruteraan Meteoroid NASA menganggarkan pangkalan Bulan sebesar ISS akan dihentam 15,000 hingga 23,000 zarah kecil setahun. (ScienceAlert)",
        choices: [
          { short: "Jalan angkasa & tampal", result: "Ditampal dan lebih kuat! Sut guna sedikit udara." },
          { short: "Tutup sudut itu", result: "Cepat dan mudah, tapi tanaman di sudut itu hilang." },
        ],
      },
      {
        title: "Gempa Bulan!",
        text: "Lantai bergegar dan cawan bergoyang. Bunyi desis halus datang dari paip!",
        fact: "Seismometer Apollo merekod kira-kira 13,000 peristiwa seismik antara 1969 dan 1977, termasuk 28 gempa bulan cetek. (Science News, UBC)",
        choices: [
          { short: "Imbas setiap paip", result: "Jumpa injap udara longgar dan membaikinya!" },
          { short: "Tidur, periksa esok", result: "Kuasa dijimatkan, tapi desis itu kebocoran udara sepanjang malam." },
        ],
      },
      {
        title: "Masalah serbuk biskut!",
        text: "Sekotak biskut rangup bonus! Tapi serbuknya terapung dalam graviti rendah.",
        fact: "NASA menghantar tortilla ke angkasa dan bukannya roti, kerana serbuk terapung dan boleh masuk ke mesin atau mata angkasawan. (Science Friday, Kennedy Space Center)",
        choices: [
          { short: "Balut tortilla", result: "Tiada serbuk, tiada masalah! Tortilla berkurang." },
          { short: "Buka biskut", result: "Rangup! Tapi serbuk masuk ke kipas dan menyebabkan gangguan!" },
        ],
      },
      {
        title: "Masa bersenam!",
        text: "Otot kru terasa lembik. Graviti rendah melemahkan tulang dan otot.",
        fact: "Kru ISS bersenam purata dua jam sehari, dan masih boleh kehilangan kira-kira 1% ketumpatan tulang sebulan di angkasa. (NASA, CSA)",
        choices: [
          { short: "Senaman penuh", result: "Angkasawan kuat menyusun lebih banyak tanah Bulan pada perisai!" },
          { short: "Langkau & rehat", result: "Malam selesa, tapi lengan penat tak dapat siapkan perisai." },
        ],
      },
      {
        title: "Kapal bekalan lewat!",
        text: "Kawalan Misi memaklumkan: kapal bantuan lewat sedikit. Jimatkan makanan!",
        fact: "NASA sentiasa membawa makanan tambahan sekiranya penerbangan lewat, dan makanan ISS dibuat supaya tahan sekurang-kurangnya tiga tahun. (NASA, Science Friday)",
        choices: [
          { short: "Hidangan kecil", result: "Stor dijimatkan! Kru yang lapar menaikkan pemanas." },
          { short: "Hidangan biasa", result: "Perut gembira dan hangat, tapi stor makanan makin rendah!" },
        ],
      },
    ],
  },
};

// Moon demo plays 3 of the 5 tasks: keep the matching task text
import { MOON_TASKS_KEPT } from "./tasks";
for (const lang of Object.keys(MOON_TEXT)) {
  MOON_TEXT[lang].tasks = MOON_TEXT[lang].tasks.filter((_, i) => MOON_TASKS_KEPT.includes(i));
}
