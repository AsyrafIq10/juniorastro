// Player-facing text for the "Blast Off!" rover tasks (English + Bahasa Melayu).
// Numbers (effects, positions) live in tasks.js.

export const TASK_TEXT = {
  en: {
    musicLabel: "Background Music",
    autoReadLabel: "Dr Farah reads aloud",
    bigTextLabel: "Bigger text",
    help: {
      title: "How to Play",
      drive: "Drive the rover with the arrows or the D-pad",
      enter: "Park in a glowing ring and press E to go in",
      spots: "Tap the glowing ? spots to discover clues",
      play: "Pick a card, then do the job yourself!",
      badges: "Answer the 🏅 quiz to win a badge",
      repair: "Rover broken? Drive to the base to fix it",
      home: "Finish all 5 tasks, then fly home from the rocket",
      stats: {
        health: "Crew Health: don't get too tired or cold",
        power: "Power: the rover's battery",
        supplies: "Supplies: food, air and spare parts",
        science: "Science: discoveries (50 = rover upgrade!)"
      },
      gotIt: "Got it!",
      paused: "Paused",
      resume: "Resume",
      pauseKey: "Tip: press P to pause or resume"
    },
    events: [
      {
        title: "Solar flare alert!",
        text: "The Sun burped out radiation! It will reach Mars in a few minutes.",
        choices: [
          {
            short: "Hide in the rover",
            result: "Safe and sound behind the shield!"
          },
          {
            short: "Measure it",
            result: "Great data, but you got a dose of radiation!"
          }
        ]
      },
      {
        title: "Dust gust!",
        text: "A gust of wind just covered your solar panels in dust.",
        choices: [
          {
            short: "Brush them clean",
            result: "Sparkly panels, more power!"
          },
          {
            short: "Keep driving",
            result: "Dusty panels make less power."
          }
        ]
      },
      {
        title: "Message from Earth!",
        text: "Mission Control asks for a crater photo. They sent it 14 minutes ago!",
        choices: [
          {
            short: "Take the photo",
            result: "Scientists on Earth love it!"
          },
          {
            short: "Skip and rest",
            result: "You feel refreshed!"
          }
        ]
      },
      {
        title: "Strange blue rock!",
        text: "Your camera spots a rock with shiny blue spots.",
        choices: [
          {
            short: "Stop and scan it",
            result: "A rare mineral! Big science!"
          },
          {
            short: "Mark it for later",
            result: "Saved on your map."
          }
        ]
      },
      {
        title: "Satellite flyby!",
        text: "A Mars orbiter is passing overhead and offers a weather report.",
        choices: [
          {
            short: "Download it",
            result: "Now you know the weather!"
          },
          {
            short: "Save battery",
            result: "Battery saved for later."
          }
        ]
      }
    ],
    sky: {
      phobos: "Phobos",
      deimos: "Deimos",
      earth: "Earth: home!",
      lowGravityTip: "🪶 Boing! Mars gravity is only 38% of Earth's, so your rover floats over bumps!",
      blueSunsetTip: "🌅 Look, a BLUE sunset! On Mars, fine dust makes the sky glow blue around the setting Sun. Can you spot Earth?",
    },
    lb: {
      title: "Mission Leaderboard",
      subtitle: "Cadets of the Jezero 6 Space Academy",
      rows: {
        science: "Science found",
        crew: "Crew & base kept safe",
        badges: "Quiz badges",
        stars: "Mini-game stars",
        rover: "Rover upgrades"
      },
      total: "Mission Points",
      pts: "pts",
      seeBoard: "See the Leaderboard",
      yourName: "Your cadet name",
      namePlaceholder: "Type your name…",
      you: "You",
      rankLine: "You placed #{r} of {n} cadets!",
      top3: "Top 3! You're a superstar astronaut!",
      tryAgainHint: "Play again to win more badges and stars!",
      certBtn: "See My Certificate"
    },
    play: {
      gauge: "Gauge",
      clean: "Clean",
      batteryDrain: "Battery used",
      lowBattery: "Battery low! Let it recharge…",
      spikes: "Storms caught",
      tapNow: "TAP!",
      spikeComing: "Spike coming… get ready!",
      tapNowBig: "TAP NOW!",
      swipeHint: "Swipe the dust away!",
      drops: {"washing": "washing", "sweat": "sweat", "breath": "breath", "tank": "tank water"},
      start: "Start!",
      hold: "HOLD",
      progress: "Progress",
      heat: "Tool heat",
      cold: "Cold",
      tired: "Tired",
      overheat: "Too hot! Let it cool…",
      tooCold: "Too cold! Warm your hands…",
      tooTired: "Too tired! Catch your breath…",
      bump: "BUMP!",
      bumps: "Bumps",
      stormIn: "Storm in",
      slip: "Slipping!",
      slips: "Slips",
      hit: "Hit!",
      miss: "Missed!",
      shotsLeft: "Left",
      calm: "Calm",
      breatheIn: "Breathe in…",
      breatheOut: "Breathe out…",
      done: "Done!",
      bonus: "Bonus Science",
      seeResults: "See what happened",
      starLines: [
        "Good try, Cadet!",
        "Nice work, Cadet!",
        "Amazing, Cadet!"
      ],
      controls: {
        drag: "Drag each water drop into the target (or just tap it).",
        swipe: "Rub your finger or mouse over the panel to brush the dust off.",
        tapTiming: "Tap the big button (or SPACE) when the line jumps!",
        hold: "Hold the big button (or SPACE). Let go to rest.",
        steer: "Press ▲ ▼ (or the arrow keys) to switch lanes.",
        aim: "Move your finger or mouse to aim, then tap to fire (or arrow keys + SPACE).",
        balance: "Hold ◀ ▶ (or the arrow keys) to keep the white line in the green zone.",
        breathe: "Hold the button while the circle grows, let go while it shrinks.",
        rhythm: "Press ◀ then ▶ then ◀… (or the arrow keys), one after the other."
      },
      vitals: {
        heart: "Heart",
        temp: "Suit",
        o2: "O₂",
        delay: "Earth: 14 min away"
      }
    },
    blast: {
      capFact: "Dr Farah's Space Fact",
      logAdded: "📔 +1 sticker in your Mission Log!",
      logEmpty: "Finish a task to get your first sticker!",
      logStickers: "stickers collected",
      logTitle: "Mission Log",
      surprise: "Surprise!",
      pressE: "Press E to enter",
      tapSpots: "Tap the glowing spots!",
      found: "Found",
      chooseOne: "What will you do?",
      previewHint: "Tap a card to see it first",
      doIt: "Do it!",
      noPerfectShort: "No perfect answer!",
      whatHappened: "What happened",
      learnMore: "Learn more",
      whatNext: "What happens next?",
      quizBtn: "Quiz for a badge",
      backToRover: "Back to Rover",
      quizTitle: "Checkpoint Quiz",
      tryAgain: "Not quite! Try again.",
      correct: "Correct!",
      badgeEarned: "Badge earned!",
      quizLater: "Come back to the 🏅 checkpoint anytime to win this badge!",
      badges: "Badges",
      quizStation: "Badge Quiz",
      homeCheckpoint: "Rocket Home",
      homeTitle: "Ready to fly home?",
      homeText: "All 5 tasks are done. The rocket is ready!",
      badgesMissing: "You still have {n} badge(s) to win at the 🏅 checkpoints!",
      flyHome: "Fly home!",
      keepExploring: "Keep exploring",
      driveToRocket: "Drive to the Rocket",
      allDoneDrive: "Drive to the 🚀 rocket pad to fly home!",
      continue: "Continue",
      tasks: "Tasks",
      taskLabel: "Task",
      of: "of",
      checkpoint: "Checkpoint",
      nextTask: "Next task",
      driveBtn: "Drive the Rover",
      metersAway: "m away",
      followArrow: "Follow the glowing arrow!",
      arrived: "Checkpoint reached!",
      rover: "Rover",
      level: "Lv",
      speed: "Speed",
      damaged: "Damaged",
      goodShape: "Good shape",
      repairBtn: "Repair Rover",
      repairCost: "−10 🌱",
      repairDone: "Rover fixed! The wrench did the trick 🔧",
      repairHint: "Your rover is damaged. Drive back to the base to repair it!",
      problem: "Problem",
      whatToDo: "What should you do?",
      noPerfect: "Every choice helps something and costs something. There's no perfect answer!",
      consequences: "Immediate Consequences",
      learning: "NASA Learning Moment",
      future: "Future Impact",
      continueBtn: "Back to the Rover",
      revisitBtn: "Collect the Sample",
      checkpointDone: "Checkpoint complete!",
      checkpointNotDone: "Checkpoint not done yet. Come back later!",
      roverDamaged: "Rover damaged! Top speed −30% until you repair it at the base.",
      roverUpgraded: "Rover upgraded!",
      upgradeNames: ["Big Zig-Zag Wheels (+15% speed, bigger rover)", "Turbo Motor (+15% speed, bigger rover)", "Dust-Proof Solar Panels (+15% speed, bigger rover)"],
      upgradeWaiting: "Science unlocked an upgrade, but repair your rover first!",
      upgradeMax: "Your rover is already fully upgraded!",
      scienceHint: "Every 50 🔬 Science unlocks a rover upgrade!",
      allDone: "All 5 tasks complete!",
      allDoneSub: "The rocket is fueled and ready. Time to go home!",
      blastOffHome: "Blast Off to Earth!",
      skip: "Skip",
      env: {
        storm: "🌪️ Dust storm coming!",
        night: "🌙 Night is falling: −80°C!",
        dustDevil: "🌀 Dust devil nearby!",
      },
      readyHint: "Park in the glowing ring, then press E!",
    },
    launchHome: {
      countdown: "T-minus",
      liftoff: "Liftoff from Mars!",
      cruise: "Flying home to Earth",
      cruiseSub: "Carrying your Mars samples • ~7 months",
      descent: "Entering Earth's atmosphere",
      descentSub: "Parachutes out!",
      touchdown: "Splashdown!",
      touchdownSub: "Welcome home, Cadet!",
      skip: "Skip",
    },
    tasks: [
      {
        title: "The Scout Drone Crash Site",
        problemShort: "Hopper the drone crashed! One blade is snapped.",
        spots: ["Snapped blade!", "Mars air is super thin", "Hopper's camera"],
        quiz: { q: "Why must Mars helicopter blades spin super fast?", options: ["Mars air is very thin", "To scare birds away", "To make music"], hint: "Remember: Mars air is about 100 times thinner than Earth's!", badge: "Drone Doctor" },
        short: "Scout Drone Crash",
        capTip: "Our little helicopter drone \"Hopper\" stopped answering! Drive to its last signal, northeast of the base.",
        problem:
          "You find Hopper, our scout helicopter drone, lying in the red dust. One of its spinning blades is snapped! Hopper took amazing photos of the crater, but the air on Mars is so thin that broken blades can't lift it. What do you do with your little flying friend?",
        choices: [
          {
            label: "Fix Hopper right here with the repair kit.",
            short: "Fix it here",
            resultShort: "Hopper flies again! Brrr, cold hands.",
            result: "Hopper's new blade spins! It can scout again, but your fingers get very cold working outside for so long.",
            play: "Hold to tighten Hopper's new blade. Rest your hands when the Cold meter gets red!",
            future: "Hopper can scout ahead for you, but your repair kit is now smaller.",
          },
          {
            label: "Strap Hopper onto the rover roof and carry it home.",
            short: "Carry it home",
            resultShort: "Hopper is safe, but the rover bent!",
            result: "Hopper is safe, but the heavy drone makes the rover wobble. CRACK! The roof rack bends the rover's frame.",
            play: "Drive home and keep Hopper balanced on the roof. Stay in the green zone!",
            future: "The rover is slower until you repair it, and Hopper needs fixing back at base.",
          },
          {
            label: "Take Hopper's working camera and battery and add them to your rover.",
            short: "Take its parts",
            resultShort: "Bye Hopper! Your rover got smarter.",
            result: "Goodbye, Hopper! Its parts make your rover smarter and give it extra battery power.",
            play: "Tap the 4 screws to take out Hopper's camera and battery. Your gloves are wobbly, so aim carefully!",
            future: "Your rover is upgraded, but you've lost your flying scout for good.",
          },
        ],
        learning:
          "NASA's real Mars helicopter, Ingenuity, flew 72 times! In 2024 its rotor blades were damaged and it could never fly again. Mars air is about 100 times thinner than Earth's, so helicopter blades must spin super fast. Engineers still learned a lot from its last photos.",
      },
      {
        title: "The Shiny Space Rock",
        problemShort: "A shiny space rock sits on a steep, slippery hill!",
        spots: ["Iron meteorite from space!", "Steep and slippery", "Battery not full"],
        quiz: { q: "How can a rover study a rock from far away?", options: ["With a flashlight", "With a laser zapper", "With a magnet"], hint: "Rovers have a laser tool called ChemCam!", badge: "Meteorite Hunter" },
        short: "Shiny Space Rock",
        capTip: "Our cameras spotted a shiny rock to the west. It might be a meteorite, a rock that fell from space!",
        problem:
          "A metal rock shines on top of a steep, slippery slope. It's an iron meteorite that fell from space onto Mars! Scientists would love to know what it's made of. But the slope is steep, and your battery is not full.",
        choices: [
          {
            label: "Zap it with the rover's laser from far away.",
            short: "Laser zap!",
            resultShort: "ZAP! Rock studied, battery used.",
            result: "ZAP! The laser makes a tiny spark, and the rover reads what the rock is made of. But the laser uses lots of battery power.",
            play: "Aim the laser at the 3 glowing spots. You only have 6 battery shots!",
            future: "You saved your strength, but your battery is lower for the next tasks.",
          },
          {
            label: "Climb up on foot with a magnifying lens.",
            short: "Climb & look",
            resultShort: "Wow, metal crystals! But you slipped.",
            result: "You see amazing metal crystals up close! But you slip on the way down and scrape your spacesuit.",
            play: "Climb the slippery slope. Keep your balance in the green zone!",
            future: "Your rover and battery are safe, but your crew is a bit hurt and used extra suit patches.",
          },
          {
            label: "Drive the rover straight up the slope and scoop it up.",
            short: "Drive up & scoop",
            resultShort: "Got the rock! The motor overheated.",
            result: "You grab the whole meteorite: big science! But the wheels spin and slip, and the motor overheats.",
            play: "Drive up the steep slope. Keep the wheels from slipping!",
            future: "Lots of science, but the rover is damaged and slower until it's repaired.",
          },
        ],
        learning:
          "NASA's Curiosity rover really found iron meteorites on Mars, like one nicknamed \"Lebanon\". Rovers use a laser tool called ChemCam to zap rocks from up to 7 meters away and learn what they're made of, without even touching them!",
      },
      {
        title: "The Delta Rock Garden",
        problemShort: "CRUNCH! Your wheel cracked, and a dust storm is coming!",
        spots: ["Cracked wheel!", "Storm in 2 hours!", "Sharp rocks ahead"],
        quiz: { q: "Why did NASA give Perseverance zig-zag wheels?", options: ["To look cool", "Sharp rocks broke Curiosity's wheels", "So it could swim"], hint: "Think about what happened to your wheel at the rock garden!", badge: "Storm Survivor" },
        short: "Delta Rock Garden",
        capTip: "Head to the old river delta in the south-west. Scientists think those rocks hold signs of ancient water!",
        problem:
          "You're 300 meters from the sample site. CRUNCH! A sharp rock cracks your front-left wheel. Then Mission Control radios: \"Cadet, a dust storm will reach you in 2 hours!\" The short path is full of sharp rocks. The safe sandy path is long. And Earth is too far away to help. Messages take up to 20 minutes each way!",
        choices: [
          {
            label: "Drive straight through the sharp rocks to grab the sample before the storm.",
            short: "Rush through rocks",
            resultShort: "Sample collected! The wheel got worse.",
            result: "You got the sample! It has tiny layers made by ancient water. But the bumpy ride bruises your arm and makes the cracked wheel worse.",
            play: "Steer through the sharp rocks before the dust storm arrives!",
            future: "The rover drives slowly and wobbles until you repair it. One more hard bump could be trouble!",
          },
          {
            label: "Take the long, smooth sandy path around the rocks.",
            short: "Take the sandy path",
            resultShort: "Stuck in sand, then free!",
            result: "A safe, smooth ride, but the wheels sink into soft sand! You dig the rover free and reach the sample just as the storm arrives.",
            play: "Hold to shovel sand away from the wheels. Take a break before you get too tired!",
            future: "Your rover is safe, but your battery is low. If dust covers the solar panels, power could run short.",
          },
          {
            label: "Turn back to base, repair the wheel, and make it stronger.",
            short: "Go back & repair",
            resultShort: "Tough new wheel! Come back later.",
            result: "You're safe inside before the storm hits. The 3D printer builds a tough new zig-zag wheel. But you still need that sample!",
            play: "Hold to print the new wheel. Don't let the printer overheat!",
            future: "Your rover is faster and tougher, but you must come back to the Delta Rock Garden after the storm.",
          },
        ],
        revisit: {
          title: "The storm has passed!",
          text: "The sky is clear again. You drive back to the Delta Rock Garden on your strong new wheels and drill the sample safely.",
          play: "Hold to drill the rock sample. Let the drill cool down when it gets hot!",
        },
        learning:
          "This really happened! Sharp Mars rocks punched holes in NASA's Curiosity rover's wheels, so Perseverance got stronger zig-zag treads. The Spirit rover got stuck in soft sand in 2009 and never got out. And a giant dust storm in 2018 blocked sunlight from the Opportunity rover's solar panels, so it ran out of power forever.",
      },
      {
        title: "The Frozen Ice Hunt",
        problemShort: "Ice is hiding under the ground, but night is coming!",
        spots: ["Water ice under the dirt!", "The Sun is setting", "Tonight: −80°C!"],
        quiz: { q: "What can astronauts make from Mars ice?", options: ["Only ice cream", "Water, air and rocket fuel", "Gold coins"], hint: "Ice is water, and water is super useful!", badge: "Ice Explorer" },
        short: "Frozen Ice Hunt",
        capTip: "Radar found ice under the ground in the east! But the Sun is setting. Mars nights get super cold.",
        problem:
          "Your radar beeps: there's water ice hiding just under the dirt! Water is treasure on Mars. Astronauts can drink it, grow plants, and even make rocket fuel from it. But the Sun is setting, and tonight it will be −80°C. That's colder than anywhere at home!",
        choices: [
          {
            label: "Dig for the ice right now in the dark with your headlamp.",
            short: "Dig now in the dark",
            resultShort: "Sparkly ice found! So cold.",
            result: "You find sparkly ice crystals! But the freezing cold seeps into your suit and the heaters drain the battery.",
            play: "Hold to dig for ice. Warm up your hands before you get too cold!",
            future: "Great science, but your crew is tired and cold for the last task.",
          },
          {
            label: "Camp in the warm rover overnight and dig at sunrise.",
            short: "Camp till sunrise",
            resultShort: "Cosy night, ice at sunrise!",
            result: "You stay warm and rested, and you dig safely in the morning. But the heater uses lots of power and you eat extra snacks.",
            play: "It's freezing outside. Breathe slowly and stay calm to keep warm all night.",
            future: "Your crew feels great, but your battery and supplies are lower.",
          },
          {
            label: "Use the rover's wheels to scrape the frozen ground quickly.",
            short: "Scrape with wheels",
            resultShort: "Fast ice! Wheels froze and cracked.",
            result: "The wheels scrape off ice fast. Quick science! But frost freezes inside the wheel joints and they crack.",
            play: "Rock the rover back and forth: press ◀ and ▶ one after the other to scrape the ice!",
            future: "Fast and saves power, but the rover is damaged and slower until it's repaired.",
          },
        ],
        learning:
          "NASA's Phoenix lander scraped real water ice on Mars in 2008, and the ice disappeared into the thin air like magic! Mars is very cold. Nights can drop below −80°C, so rovers and astronauts need heaters, and heaters use a lot of power.",
      },
      {
        title: "The Rocket Pad Delivery",
        problemShort: "A giant dust devil is crossing the road to the rocket!",
        spots: ["Dust devil!", "Your rocket home", "Sample tubes to deliver"],
        quiz: { q: "What cleaned the dusty solar panels of rovers Spirit and Opportunity?", options: ["A robot broom", "Dust devils blowing by", "Rain showers"], hint: "Remember what happened when you hid behind the rock!", badge: "Rocket Courier" },
        short: "Rocket Pad Delivery",
        capTip: "Last task! Deliver our sample tubes to the rocket pad in the north. Then we can fly home!",
        problem:
          "You have all your sample tubes, and the rocket home is waiting! But a giant spinning dust devil, a tall tornado of dust, is crossing the road to the rocket pad. It isn't strong enough to blow you over, but it can push sand everywhere.",
        choices: [
          {
            label: "Race past the dust devil before it reaches the road.",
            short: "Race past it",
            resultShort: "Zoom! But sand got in the motor.",
            result: "You zoom past and deliver the samples super fast! But sand blasts into the rover's motor and gears.",
            play: "Race to the rocket pad! Dodge the sand piles so the dust devil can't catch you!",
            future: "The samples arrive quickly, but your rover gets sand damage.",
          },
          {
            label: "Hide behind a big rock and let it pass.",
            short: "Hide behind a rock",
            resultShort: "Whoosh! Solar panels blown clean!",
            result: "WHOOSH! The dust devil spins right over your solar panels and blows them sparkling clean. Free power! But waiting uses supplies.",
            play: "The dust devil is roaring past! Breathe slowly and stay calm behind the rock.",
            future: "Your battery is happily recharged, and you filmed a dust devil up close for science.",
          },
          {
            label: "Take the long ridge road around it.",
            short: "Take the ridge road",
            resultShort: "Safe ride, but battery drained.",
            result: "The bumpy ridge road is safe and the samples stay protected, but the long drive drains lots of battery.",
            play: "Stay on the narrow ridge road and dodge the crumbly edges!",
            future: "Everyone is safe, but you arrive with a lower battery.",
          },
        ],
        learning:
          "Dust devils are real on Mars, and some are taller than skyscrapers! NASA's Spirit and Opportunity rovers got lucky: passing dust devils blew dust off their solar panels and gave them more power. NASA also plans to bring Perseverance's sample tubes back to Earth one day!",
      },
    ],
  },

  ms: {
    musicLabel: "Muzik Latar",
    autoReadLabel: "Dr Farah membaca dengan kuat",
    bigTextLabel: "Teks lebih besar",
    help: {
      title: "Cara Bermain",
      drive: "Pandu rover dengan anak panah atau D-pad",
      enter: "Berhenti dalam gelang bercahaya dan tekan E untuk masuk",
      spots: "Ketik titik ? bercahaya untuk mencari petunjuk",
      play: "Pilih kad, kemudian buat kerja itu sendiri!",
      badges: "Jawab kuiz 🏅 untuk memenangi lencana",
      repair: "Rover rosak? Pandu ke pangkalan untuk membaikinya",
      home: "Selesaikan 5 tugasan, kemudian terbang pulang dari roket",
      stats: {
        health: "Kesihatan Kru: jangan terlalu penat atau sejuk",
        power: "Kuasa: bateri rover",
        supplies: "Bekalan: makanan, udara dan alat ganti",
        science: "Sains: penemuan (50 = naik taraf rover!)"
      },
      gotIt: "Faham!",
      paused: "Berhenti Seketika",
      resume: "Sambung",
      pauseKey: "Tip: tekan P untuk berhenti atau sambung"
    },
    events: [
      {
        title: "Amaran nyalaan suria!",
        text: "Matahari menghembus sinaran! Ia akan sampai ke Marikh dalam beberapa minit.",
        choices: [
          {
            short: "Sembunyi dalam rover",
            result: "Selamat di belakang perisai!"
          },
          {
            short: "Ukur sinaran itu",
            result: "Data hebat, tapi anda terkena sinaran!"
          }
        ]
      },
      {
        title: "Tiupan debu!",
        text: "Angin baru sahaja menutup panel suria anda dengan debu.",
        choices: [
          {
            short: "Bersihkan panel",
            result: "Panel berkilat, lebih kuasa!"
          },
          {
            short: "Terus memandu",
            result: "Panel berdebu menghasilkan kurang kuasa."
          }
        ]
      },
      {
        title: "Mesej dari Bumi!",
        text: "Kawalan Misi minta gambar kawah. Mesej dihantar 14 minit lalu!",
        choices: [
          {
            short: "Ambil gambar",
            result: "Saintis di Bumi sangat suka!"
          },
          {
            short: "Langkau & rehat",
            result: "Anda rasa segar semula!"
          }
        ]
      },
      {
        title: "Batu biru pelik!",
        text: "Kamera anda nampak batu dengan bintik biru berkilat.",
        choices: [
          {
            short: "Berhenti & imbas",
            result: "Mineral jarang! Sains yang hebat!"
          },
          {
            short: "Tanda untuk nanti",
            result: "Disimpan dalam peta anda."
          }
        ]
      },
      {
        title: "Satelit lalu!",
        text: "Pengorbit Marikh sedang lalu dan menawarkan laporan cuaca.",
        choices: [
          {
            short: "Muat turun",
            result: "Sekarang anda tahu cuacanya!"
          },
          {
            short: "Jimat bateri",
            result: "Bateri disimpan untuk nanti."
          }
        ]
      }
    ],
    sky: {
      phobos: "Phobos",
      deimos: "Deimos",
      earth: "Bumi: rumah!",
      lowGravityTip: "🪶 Boing! Graviti Marikh hanya 38% daripada Bumi, jadi rover anda terapung atas bonggol!",
      blueSunsetTip: "🌅 Lihat, matahari terbenam BIRU! Di Marikh, debu halus membuat langit bercahaya biru di sekeliling Matahari. Boleh nampak Bumi?",
    },
    lb: {
      title: "Papan Pendahulu Misi",
      subtitle: "Kadet Akademi Angkasa Jezero 6",
      rows: {
        science: "Sains dijumpai",
        crew: "Kru & pangkalan selamat",
        badges: "Lencana kuiz",
        stars: "Bintang permainan mini",
        rover: "Naik taraf rover"
      },
      total: "Mata Misi",
      pts: "mata",
      seeBoard: "Lihat Papan Pendahulu",
      yourName: "Nama kadet anda",
      namePlaceholder: "Taip nama anda…",
      you: "Anda",
      rankLine: "Anda di tempat #{r} daripada {n} kadet!",
      top3: "3 Teratas! Anda angkasawan hebat!",
      tryAgainHint: "Main lagi untuk menang lebih banyak lencana dan bintang!",
      certBtn: "Lihat Sijil Saya"
    },
    play: {
      gauge: "Meter",
      clean: "Bersih",
      batteryDrain: "Bateri digunakan",
      lowBattery: "Bateri lemah! Biar ia mengecas…",
      spikes: "Ribut ditangkap",
      tapNow: "KETIK!",
      spikeComing: "Lonjakan akan tiba… bersedia!",
      tapNowBig: "KETIK SEKARANG!",
      swipeHint: "Leret debu itu!",
      drops: {"washing": "air basuhan", "sweat": "peluh", "breath": "nafas", "tank": "air tangki"},
      start: "Mula!",
      hold: "TAHAN",
      progress: "Kemajuan",
      heat: "Haba alat",
      cold: "Sejuk",
      tired: "Penat",
      overheat: "Terlalu panas! Biar ia sejuk…",
      tooCold: "Terlalu sejuk! Panaskan tangan…",
      tooTired: "Terlalu penat! Tarik nafas…",
      bump: "HENTAK!",
      bumps: "Hentakan",
      stormIn: "Ribut dalam",
      slip: "Tergelincir!",
      slips: "Gelincir",
      hit: "Kena!",
      miss: "Terlepas!",
      shotsLeft: "Baki",
      calm: "Tenang",
      breatheIn: "Tarik nafas…",
      breatheOut: "Hembus nafas…",
      done: "Siap!",
      bonus: "Bonus Sains",
      seeResults: "Lihat apa berlaku",
      starLines: [
        "Cubaan yang baik, Kadet!",
        "Kerja bagus, Kadet!",
        "Hebat, Kadet!"
      ],
      controls: {
        drag: "Seret setiap titisan air ke sasaran (atau ketik sahaja).",
        swipe: "Gosok jari atau tetikus pada panel untuk menyapu debu.",
        tapTiming: "Ketik butang besar (atau SPACE) apabila garisan melonjak!",
        hold: "Tahan butang besar (atau SPACE). Lepaskan untuk berehat.",
        steer: "Tekan ▲ ▼ (atau kekunci anak panah) untuk tukar lorong.",
        aim: "Gerakkan jari atau tetikus untuk membidik, kemudian ketik untuk menembak (atau anak panah + SPACE).",
        balance: "Tahan ◀ ▶ (atau kekunci anak panah) supaya garisan putih kekal dalam zon hijau.",
        breathe: "Tahan butang semasa bulatan membesar, lepaskan semasa ia mengecil.",
        rhythm: "Tekan ◀ kemudian ▶ kemudian ◀… (atau kekunci anak panah), bergilir-gilir."
      },
      vitals: {
        heart: "Jantung",
        temp: "Sut",
        o2: "O₂",
        delay: "Bumi: 14 minit jauhnya"
      }
    },
    blast: {
      capFact: "Fakta Angkasa Dr Farah",
      logAdded: "📔 +1 pelekat dalam Log Misi anda!",
      logEmpty: "Selesaikan satu tugasan untuk pelekat pertama anda!",
      logStickers: "pelekat dikumpul",
      logTitle: "Log Misi",
      surprise: "Kejutan!",
      pressE: "Tekan E untuk masuk",
      tapSpots: "Ketik titik bercahaya!",
      found: "Dijumpai",
      chooseOne: "Apa yang anda akan buat?",
      previewHint: "Ketik kad untuk melihatnya dahulu",
      doIt: "Buat!",
      noPerfectShort: "Tiada jawapan sempurna!",
      whatHappened: "Apa yang berlaku",
      learnMore: "Ketahui lagi",
      whatNext: "Apa seterusnya?",
      quizBtn: "Kuiz untuk lencana",
      backToRover: "Kembali ke Rover",
      quizTitle: "Kuiz Pusat Pemeriksaan",
      tryAgain: "Belum tepat! Cuba lagi.",
      correct: "Betul!",
      badgeEarned: "Lencana diperoleh!",
      quizLater: "Datang semula ke pusat pemeriksaan 🏅 bila-bila masa untuk memenangi lencana ini!",
      badges: "Lencana",
      quizStation: "Kuiz Lencana",
      homeCheckpoint: "Roket Pulang",
      homeTitle: "Sedia untuk terbang pulang?",
      homeText: "Kesemua 5 tugasan selesai. Roket sudah sedia!",
      badgesMissing: "Anda masih ada {n} lencana untuk dimenangi di pusat pemeriksaan 🏅!",
      flyHome: "Terbang pulang!",
      keepExploring: "Terus meneroka",
      driveToRocket: "Pandu ke Roket",
      allDoneDrive: "Pandu ke pad roket 🚀 untuk terbang pulang!",
      continue: "Teruskan",
      tasks: "Tugasan",
      taskLabel: "Tugasan",
      of: "drp",
      checkpoint: "Pusat Pemeriksaan",
      nextTask: "Tugasan seterusnya",
      driveBtn: "Pandu Rover",
      metersAway: "m lagi",
      followArrow: "Ikut anak panah bercahaya!",
      arrived: "Tiba di pusat pemeriksaan!",
      rover: "Rover",
      level: "Tahap",
      speed: "Laju",
      damaged: "Rosak",
      goodShape: "Keadaan baik",
      repairBtn: "Baiki Rover",
      repairCost: "−10 🌱",
      repairDone: "Rover dibaiki! Sepana berjaya 🔧",
      repairHint: "Rover anda rosak. Pandu balik ke pangkalan untuk membaikinya!",
      problem: "Masalah",
      whatToDo: "Apa yang patut anda buat?",
      noPerfect: "Setiap pilihan membantu sesuatu dan mengorbankan sesuatu. Tiada jawapan sempurna!",
      consequences: "Akibat Serta-Merta",
      learning: "Detik Pembelajaran NASA",
      future: "Kesan Masa Depan",
      continueBtn: "Kembali ke Rover",
      revisitBtn: "Ambil Sampel",
      checkpointDone: "Pusat pemeriksaan selesai!",
      checkpointNotDone: "Pusat pemeriksaan belum selesai. Datang semula nanti!",
      roverDamaged: "Rover rosak! Kelajuan −30% sehingga dibaiki di pangkalan.",
      roverUpgraded: "Rover dinaik taraf!",
      upgradeNames: ["Roda Zig-Zag Besar (+15% laju, rover lebih besar)", "Motor Turbo (+15% laju, rover lebih besar)", "Panel Suria Kalis Debu (+15% laju, rover lebih besar)"],
      upgradeWaiting: "Sains membuka naik taraf, tetapi baiki rover dahulu!",
      upgradeMax: "Rover anda sudah dinaik taraf sepenuhnya!",
      scienceHint: "Setiap 50 🔬 Sains membuka naik taraf rover!",
      allDone: "Kesemua 5 tugasan selesai!",
      allDoneSub: "Roket sudah diisi bahan api. Masa untuk pulang!",
      blastOffHome: "Terbang Pulang ke Bumi!",
      skip: "Langkau",
      env: {
        storm: "🌪️ Ribut debu datang!",
        night: "🌙 Malam tiba: −80°C!",
        dustDevil: "🌀 Puting beliung debu berhampiran!",
      },
      readyHint: "Berhenti dalam gelang bercahaya, kemudian tekan E!",
    },
    launchHome: {
      countdown: "Kiraan detik",
      liftoff: "Berlepas dari Marikh!",
      cruise: "Terbang pulang ke Bumi",
      cruiseSub: "Membawa sampel Marikh • ~7 bulan",
      descent: "Memasuki atmosfera Bumi",
      descentSub: "Payung terjun dibuka!",
      touchdown: "Mendarat di laut!",
      touchdownSub: "Selamat pulang, Kadet!",
      skip: "Langkau",
    },
    tasks: [
      {
        title: "Tapak Nahas Dron Peninjau",
        problemShort: "Dron Hopper terhempas! Satu bilahnya patah.",
        spots: ["Bilah patah!", "Udara Marikh sangat nipis", "Kamera Hopper"],
        quiz: { q: "Kenapa bilah helikopter Marikh mesti berputar sangat laju?", options: ["Udara Marikh sangat nipis", "Untuk menakutkan burung", "Untuk buat muzik"], hint: "Ingat: udara Marikh 100 kali lebih nipis daripada Bumi!", badge: "Doktor Dron" },
        short: "Nahas Dron Peninjau",
        capTip: "Dron helikopter kecil kita \"Hopper\" tidak menjawab! Pandu ke isyarat terakhirnya di timur laut pangkalan.",
        problem:
          "Anda jumpa Hopper, dron helikopter peninjau kita, terbaring dalam debu merah. Salah satu bilahnya patah! Hopper mengambil gambar kawah yang hebat, tetapi udara Marikh sangat nipis sehingga bilah patah tidak boleh mengangkatnya. Apa yang anda buat dengan kawan terbang kecil ini?",
        choices: [
          {
            label: "Baiki Hopper di sini dengan kit pembaikan.",
            short: "Baiki di sini",
            resultShort: "Hopper terbang semula! Tangan sejuk.",
            result: "Bilah baharu Hopper berputar! Ia boleh meninjau semula, tetapi jari anda sangat sejuk kerana bekerja lama di luar.",
            play: "Tahan untuk mengetatkan bilah baharu Hopper. Rehatkan tangan apabila meter Sejuk jadi merah!",
            future: "Hopper boleh meninjau untuk anda, tetapi kit pembaikan anda semakin kurang.",
          },
          {
            label: "Ikat Hopper di atas bumbung rover dan bawa pulang.",
            short: "Bawa pulang",
            resultShort: "Hopper selamat, tapi rover bengkok!",
            result: "Hopper selamat, tetapi dron yang berat membuat rover bergoyang. KRAK! Rak bumbung membengkokkan rangka rover.",
            play: "Pandu pulang dan pastikan Hopper seimbang di atas bumbung. Kekal dalam zon hijau!",
            future: "Rover lebih perlahan sehingga dibaiki, dan Hopper perlu dibaiki di pangkalan.",
          },
          {
            label: "Ambil kamera dan bateri Hopper yang masih berfungsi untuk rover anda.",
            short: "Ambil alat gantinya",
            resultShort: "Selamat tinggal Hopper! Rover lebih pintar.",
            result: "Selamat tinggal, Hopper! Alat gantinya menjadikan rover anda lebih pintar dan memberi kuasa bateri tambahan.",
            play: "Ketik 4 skru untuk mengeluarkan kamera dan bateri Hopper. Sarung tangan anda bergoyang, jadi bidik dengan teliti!",
            future: "Rover anda dinaik taraf, tetapi anda kehilangan peninjau terbang selama-lamanya.",
          },
        ],
        learning:
          "Helikopter Marikh sebenar NASA, Ingenuity, terbang sebanyak 72 kali! Pada 2024 bilah rotornya rosak dan ia tidak dapat terbang lagi. Udara Marikh kira-kira 100 kali lebih nipis daripada Bumi, jadi bilah helikopter mesti berputar sangat laju. Jurutera masih belajar banyak daripada gambar terakhirnya.",
      },
      {
        title: "Batu Angkasa Berkilat",
        problemShort: "Batu angkasa berkilat di atas bukit yang curam dan licin!",
        spots: ["Meteorit besi dari angkasa!", "Curam dan licin", "Bateri tidak penuh"],
        quiz: { q: "Bagaimana rover mengkaji batu dari jauh?", options: ["Dengan lampu suluh", "Dengan penembak laser", "Dengan magnet"], hint: "Rover ada alat laser bernama ChemCam!", badge: "Pemburu Meteorit" },
        short: "Batu Angkasa Berkilat",
        capTip: "Kamera kita nampak batu berkilat di barat. Mungkin meteorit, iaitu batu yang jatuh dari angkasa!",
        problem:
          "Sebiji batu logam berkilat di atas cerun yang curam dan licin. Ia meteorit besi yang jatuh dari angkasa ke Marikh! Saintis mahu tahu apa kandungannya. Tetapi cerun itu curam dan bateri anda tidak penuh.",
        choices: [
          {
            label: "Tembak dengan laser rover dari jauh.",
            short: "Tembak laser!",
            resultShort: "ZAP! Batu dikaji, bateri digunakan.",
            result: "ZAP! Laser membuat percikan kecil dan rover membaca kandungan batu. Tetapi laser menggunakan banyak kuasa bateri.",
            play: "Bidik laser pada 3 titik bercahaya. Anda hanya ada 6 tembakan bateri!",
            future: "Anda jimat tenaga, tetapi bateri lebih rendah untuk tugasan seterusnya.",
          },
          {
            label: "Panjat dengan berjalan kaki dan bawa kanta pembesar.",
            short: "Panjat & lihat",
            resultShort: "Wah, kristal logam! Tapi tergelincir.",
            result: "Anda nampak kristal logam yang menakjubkan! Tetapi anda tergelincir semasa turun dan sut angkasa tercalar.",
            play: "Panjat cerun yang licin. Kekalkan keseimbangan dalam zon hijau!",
            future: "Rover dan bateri selamat, tetapi kru sedikit cedera dan guna tampalan sut tambahan.",
          },
          {
            label: "Pandu rover terus naik cerun dan cedok batu itu.",
            short: "Pandu naik & cedok",
            resultShort: "Dapat batu! Motor terlalu panas.",
            result: "Anda dapat seluruh meteorit: sains yang hebat! Tetapi roda berpusing dan tergelincir, dan motor terlalu panas.",
            play: "Pandu naik cerun yang curam. Jangan biar roda tergelincir!",
            future: "Banyak sains, tetapi rover rosak dan lebih perlahan sehingga dibaiki.",
          },
        ],
        learning:
          "Rover Curiosity NASA benar-benar menjumpai meteorit besi di Marikh, termasuk satu yang digelar \"Lebanon\". Rover menggunakan alat laser bernama ChemCam untuk menembak batu dari jarak sehingga 7 meter dan mengetahui kandungannya tanpa menyentuhnya!",
      },
      {
        title: "Taman Batu Delta",
        problemShort: "KRAK! Roda anda retak, dan ribut debu sedang datang!",
        spots: ["Roda retak!", "Ribut dalam 2 jam!", "Batu tajam di depan"],
        quiz: { q: "Kenapa NASA memberi Perseverance roda zig-zag?", options: ["Supaya nampak hebat", "Batu tajam merosakkan roda Curiosity", "Supaya boleh berenang"], hint: "Fikirkan apa yang berlaku pada roda anda di taman batu!", badge: "Penyelamat Ribut" },
        short: "Taman Batu Delta",
        capTip: "Pergi ke delta sungai purba di barat daya. Saintis percaya batu di situ menyimpan tanda air purba!",
        problem:
          "Anda 300 meter dari tapak sampel. KRAK! Batu tajam meretakkan roda depan kiri. Kemudian Kawalan Misi berkata: \"Kadet, ribut debu akan sampai dalam 2 jam!\" Jalan pendek penuh batu tajam. Jalan pasir yang selamat pula panjang. Bumi terlalu jauh untuk membantu. Mesej mengambil masa sehingga 20 minit sehala!",
        choices: [
          {
            label: "Pandu terus melalui batu tajam untuk ambil sampel sebelum ribut.",
            short: "Rempuh batu",
            resultShort: "Sampel diambil! Roda makin teruk.",
            result: "Anda dapat sampel! Ia ada lapisan kecil yang dibuat oleh air purba. Tetapi perjalanan bergegar melebamkan lengan anda dan roda yang retak menjadi lebih teruk.",
            play: "Kemudi melalui batu tajam sebelum ribut debu tiba!",
            future: "Rover bergerak perlahan dan bergoyang sehingga dibaiki. Satu lagi hentakan kuat boleh jadi masalah!",
          },
          {
            label: "Ambil jalan pasir yang panjang dan licin di sekeliling batu.",
            short: "Ikut jalan pasir",
            resultShort: "Tersangkut pasir, kemudian bebas!",
            result: "Perjalanan selamat, tetapi roda tenggelam dalam pasir lembut! Anda menggali rover keluar dan tiba tepat ketika ribut sampai.",
            play: "Tahan untuk menyodok pasir dari roda. Berehat sebelum anda terlalu penat!",
            future: "Rover selamat, tetapi bateri rendah. Jika debu menutup panel suria, kuasa boleh habis.",
          },
          {
            label: "Patah balik ke pangkalan, baiki roda dan jadikannya lebih kuat.",
            short: "Balik & baiki",
            resultShort: "Roda baharu yang kuat! Datang semula nanti.",
            result: "Anda selamat di dalam sebelum ribut melanda. Pencetak 3D membina roda zig-zag baharu yang kuat. Tetapi anda masih perlukan sampel itu!",
            play: "Tahan untuk mencetak roda baharu. Jangan biar pencetak terlalu panas!",
            future: "Rover lebih laju dan kuat, tetapi anda mesti kembali ke Taman Batu Delta selepas ribut.",
          },
        ],
        revisit: {
          title: "Ribut sudah berlalu!",
          text: "Langit cerah semula. Anda pandu kembali ke Taman Batu Delta dengan roda baharu yang kuat dan menggerudi sampel dengan selamat.",
          play: "Tahan untuk menggerudi sampel batu. Biarkan gerudi sejuk apabila ia panas!",
        },
        learning:
          "Ini benar-benar berlaku! Batu Marikh yang tajam menebuk lubang pada roda rover Curiosity NASA, jadi Perseverance diberi bunga roda zig-zag yang lebih kuat. Rover Spirit tersangkut dalam pasir lembut pada 2009 dan tidak dapat keluar. Ribut debu gergasi pada 2018 pula menghalang cahaya matahari daripada panel suria rover Opportunity, jadi kuasanya habis selama-lamanya.",
      },
      {
        title: "Memburu Ais Beku",
        problemShort: "Ais tersembunyi di bawah tanah, tapi malam hampir tiba!",
        spots: ["Ais air di bawah tanah!", "Matahari terbenam", "Malam ini: −80°C!"],
        quiz: { q: "Apa yang boleh dibuat oleh angkasawan daripada ais Marikh?", options: ["Aiskrim sahaja", "Air, udara dan bahan api roket", "Syiling emas"], hint: "Ais ialah air, dan air sangat berguna!", badge: "Penjelajah Ais" },
        short: "Memburu Ais Beku",
        capTip: "Radar jumpa ais di bawah tanah di timur! Tetapi matahari sedang terbenam. Malam di Marikh sangat sejuk.",
        problem:
          "Radar anda berbunyi: ada ais air tersembunyi di bawah tanah! Air ialah harta di Marikh. Angkasawan boleh meminumnya, menanam tumbuhan, malah membuat bahan api roket daripadanya. Tetapi matahari sedang terbenam, dan malam ini suhu −80°C. Lebih sejuk daripada mana-mana tempat di rumah!",
        choices: [
          {
            label: "Gali ais sekarang dalam gelap dengan lampu kepala.",
            short: "Gali sekarang",
            resultShort: "Ais berkilau dijumpai! Sejuknya.",
            result: "Anda jumpa kristal ais berkilauan! Tetapi kesejukan meresap ke dalam sut dan pemanas menghabiskan bateri.",
            play: "Tahan untuk menggali ais. Panaskan tangan sebelum anda terlalu sejuk!",
            future: "Sains hebat, tetapi kru letih dan sejuk untuk tugasan terakhir.",
          },
          {
            label: "Berkhemah dalam rover yang hangat dan gali waktu subuh.",
            short: "Berkhemah sampai subuh",
            resultShort: "Malam hangat, ais waktu subuh!",
            result: "Anda kekal hangat dan cukup rehat, dan menggali dengan selamat pada waktu pagi. Tetapi pemanas guna banyak kuasa dan anda makan snek tambahan.",
            play: "Di luar sangat sejuk. Bernafas perlahan dan bertenang supaya kekal hangat sepanjang malam.",
            future: "Kru rasa hebat, tetapi bateri dan bekalan lebih rendah.",
          },
          {
            label: "Guna roda rover untuk mengikis tanah beku dengan cepat.",
            short: "Kikis dengan roda",
            resultShort: "Ais cepat! Roda beku dan retak.",
            result: "Roda mengikis ais dengan cepat. Sains yang pantas! Tetapi fros membeku dalam sendi roda lalu retak.",
            play: "Goyangkan rover ke depan dan belakang: tekan ◀ dan ▶ bergilir-gilir untuk mengikis ais!",
            future: "Cepat dan jimat kuasa, tetapi rover rosak dan lebih perlahan sehingga dibaiki.",
          },
        ],
        learning:
          "Pendarat Phoenix NASA mengikis ais air sebenar di Marikh pada 2008, dan ais itu hilang ke udara nipis seperti magik! Marikh sangat sejuk. Suhu malam boleh turun di bawah −80°C, jadi rover dan angkasawan perlukan pemanas, dan pemanas guna banyak kuasa.",
      },
      {
        title: "Penghantaran ke Pad Roket",
        problemShort: "Puting beliung debu gergasi melintas jalan ke roket!",
        spots: ["Puting beliung!", "Roket untuk pulang", "Tiub sampel untuk dihantar"],
        quiz: { q: "Apa yang membersihkan panel suria rover Spirit dan Opportunity yang berdebu?", options: ["Penyapu robot", "Puting beliung debu yang lalu", "Hujan"], hint: "Ingat apa yang berlaku semasa anda bersembunyi di balik batu!", badge: "Penghantar Roket" },
        short: "Penghantaran Pad Roket",
        capTip: "Tugasan terakhir! Hantar tiub sampel ke pad roket di utara. Kemudian kita boleh terbang pulang!",
        problem:
          "Anda ada semua tiub sampel, dan roket untuk pulang sedang menunggu! Tetapi puting beliung debu gergasi, iaitu tornado debu yang tinggi, sedang melintas jalan ke pad roket. Ia tidak cukup kuat untuk menerbangkan anda, tetapi ia boleh menolak pasir ke merata tempat.",
        choices: [
          {
            label: "Lumba melepasi puting beliung sebelum ia sampai ke jalan.",
            short: "Lumba melepasinya",
            resultShort: "Laju! Tapi pasir masuk ke motor.",
            result: "Anda meluncur laju dan menghantar sampel dengan sangat pantas! Tetapi pasir masuk ke dalam motor dan gear rover.",
            play: "Lumba ke pad roket! Elak timbunan pasir supaya puting beliung tidak dapat mengejar anda!",
            future: "Sampel tiba dengan cepat, tetapi rover rosak kerana pasir.",
          },
          {
            label: "Bersembunyi di belakang batu besar dan biarkan ia berlalu.",
            short: "Sembunyi di balik batu",
            resultShort: "Wush! Panel suria jadi bersih!",
            result: "WUSH! Puting beliung berpusing tepat di atas panel suria dan meniupnya hingga bersih berkilat. Kuasa percuma! Tetapi menunggu menggunakan bekalan.",
            play: "Puting beliung sedang menderu lalu! Bernafas perlahan dan bertenang di belakang batu.",
            future: "Bateri anda dicas semula, dan anda merakam puting beliung dari dekat untuk sains.",
          },
          {
            label: "Ambil jalan permatang yang panjang di sekelilingnya.",
            short: "Ikut jalan permatang",
            resultShort: "Perjalanan selamat, bateri habis.",
            result: "Jalan permatang yang bergegar itu selamat dan sampel terlindung, tetapi perjalanan panjang menghabiskan banyak bateri.",
            play: "Kekal di atas jalan permatang yang sempit dan elak tebing yang rapuh!",
            future: "Semua orang selamat, tetapi anda tiba dengan bateri yang lebih rendah.",
          },
        ],
        learning:
          "Puting beliung debu memang wujud di Marikh, malah ada yang lebih tinggi daripada bangunan pencakar langit! Rover Spirit dan Opportunity NASA bernasib baik: puting beliung yang lalu meniup debu dari panel suria mereka dan memberi lebih kuasa. NASA juga merancang untuk membawa pulang tiub sampel Perseverance ke Bumi satu hari nanti!",
      },
    ],
  },
};
