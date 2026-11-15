// "Fact" cards for the Press-E menu at each task checkpoint (Do task / Fact / Quit).
// image: "solar" | "hydroponic" use real photos; anything else shows the task's illustrated scene.
export const FACT_IMAGES = {
  mars: [null, null, null, null, null],
  moon: [null, "hydroponic", null, "solar", null],
};

export const FACT_TEXT = {
  en: {
    ui: { doTask: "Do task", fact: "Fact", quit: "Quit", back: "Back", factTitle: "Space Fact", quitToast: "No problem! Explore and come back any time.", keys: "Press 1, 2 or 3" },
    mars: [
      {
        title: "Ingenuity, the Mars Helicopter",
        text: "Ingenuity was a small helicopter that flew on Mars 72 times between 2021 and 2024! Mars air is about 100 times thinner than Earth's, so its blades had to spin super fast, around 2,400 times a minute, to lift off.",
      },
      {
        title: "Meteorites on Mars",
        text: "Rovers have found space rocks lying on Mars, like 'Heat Shield Rock', found by the Opportunity rover. Many are made of iron and nickel metal, which is why they look dark and shiny.",
      },
      {
        title: "Jezero's Ancient River Delta",
        text: "About 3.5 billion years ago, Jezero Crater held a lake! A river flowed in and dropped mud and sand, building a fan-shaped delta. Its layered rocks are one of the best places to search for signs of ancient life.",
      },
      {
        title: "Hidden Ice on Mars",
        text: "Mars has lots of water ice hiding under the ground and at its poles. Future astronauts could melt it for drinking water, and split it into oxygen to breathe and hydrogen for rocket fuel.",
      },
      {
        title: "Giant Martian Dust Devils",
        text: "Dust devils are spinning whirlwinds of dust. On Mars some grow kilometres tall, much taller than any on Earth! Sometimes they even blew dust off rover solar panels and gave them more power.",
      },
    ],
    moon: [
      {
        title: "Shackleton Crater's Frozen Ice",
        text: "Shackleton Crater sits at the Moon's south pole. Parts of it never see sunlight, so they stay colder than -170°C and have kept water ice frozen for billions of years.",
      },
      {
        title: "Hydroponic Farm",
        text: "Hydroponic farms grow plants without soil! The roots sit in water full of nutrients, and bright LED lights act like sunshine. The plants also make fresh oxygen and help recycle water for the crew.",
      },
      {
        title: "NASA DONKI Space Weather",
        text: "DONKI is NASA's space weather database. It tracks solar flares and CMEs, giant clouds of charged particles thrown out by the Sun. Early warnings tell astronauts to hide in a shelter before the radiation arrives.",
      },
      {
        title: "Solar Array Field",
        text: "Solar panels turn sunlight into electricity. The Moon has no air, so sunlight there is very strong, but sticky moon dust can cover the panels and lower their power, so they must be kept clean.",
      },
      {
        title: "The Long Lunar Night",
        text: "On most of the Moon, one night lasts about 14 Earth days! It can get colder than -170°C, so a base needs batteries, heaters and good insulation to stay warm until sunrise.",
      },
    ],
  },
  ms: {
    ui: { doTask: "Buat tugasan", fact: "Fakta", quit: "Keluar", back: "Kembali", factTitle: "Fakta Angkasa", quitToast: "Tiada masalah! Teroka dan kembali bila-bila masa.", keys: "Tekan 1, 2 atau 3" },
    mars: [
      {
        title: "Ingenuity, Helikopter Marikh",
        text: "Ingenuity ialah helikopter kecil yang terbang di Marikh sebanyak 72 kali antara 2021 dan 2024! Udara Marikh kira-kira 100 kali lebih nipis daripada Bumi, jadi bilahnya perlu berputar sangat laju, kira-kira 2,400 kali seminit, untuk terbang.",
      },
      {
        title: "Meteorit di Marikh",
        text: "Rover telah menemui batu angkasa di Marikh, seperti 'Heat Shield Rock' yang dijumpai oleh rover Opportunity. Banyak meteorit diperbuat daripada logam besi dan nikel, sebab itu ia kelihatan gelap dan berkilat.",
      },
      {
        title: "Delta Sungai Purba Jezero",
        text: "Kira-kira 3.5 bilion tahun dahulu, Kawah Jezero ialah sebuah tasik! Sungai mengalir masuk dan meninggalkan lumpur dan pasir, membentuk delta berbentuk kipas. Batuan berlapisnya ialah tempat terbaik untuk mencari tanda kehidupan purba.",
      },
      {
        title: "Ais Tersembunyi di Marikh",
        text: "Marikh mempunyai banyak ais air di bawah tanah dan di kutubnya. Angkasawan masa depan boleh mencairkannya untuk air minuman, dan memisahkannya kepada oksigen untuk bernafas dan hidrogen untuk bahan api roket.",
      },
      {
        title: "Puting Beliung Debu Marikh",
        text: "Puting beliung debu ialah pusaran angin berdebu. Di Marikh, ada yang setinggi beberapa kilometer, jauh lebih tinggi daripada di Bumi! Kadangkala ia meniup debu dari panel suria rover dan memberi lebih kuasa.",
      },
    ],
    moon: [
      {
        title: "Ais Beku Kawah Shackleton",
        text: "Kawah Shackleton terletak di kutub selatan Bulan. Sesetengah bahagiannya tidak pernah disinari matahari, jadi suhunya lebih sejuk daripada -170°C dan ais air kekal beku selama berbilion tahun.",
      },
      {
        title: "Ladang Hidroponik",
        text: "Ladang hidroponik menanam tumbuhan tanpa tanah! Akarnya berada dalam air yang kaya dengan nutrien, dan lampu LED terang bertindak seperti cahaya matahari. Tumbuhan juga menghasilkan oksigen segar dan membantu mengitar semula air untuk kru.",
      },
      {
        title: "Cuaca Angkasa DONKI NASA",
        text: "DONKI ialah pangkalan data cuaca angkasa NASA. Ia menjejak suar suria dan CME, iaitu awan gergasi zarah bercas yang dilontar oleh Matahari. Amaran awal membolehkan angkasawan berlindung sebelum sinaran tiba.",
      },
      {
        title: "Ladang Panel Suria",
        text: "Panel suria menukar cahaya matahari kepada elektrik. Bulan tiada udara, jadi cahaya matahari sangat kuat, tetapi debu bulan yang melekit boleh menutup panel dan mengurangkan kuasanya, jadi ia mesti sentiasa bersih.",
      },
      {
        title: "Malam Bulan yang Panjang",
        text: "Di kebanyakan tempat di Bulan, satu malam berlangsung kira-kira 14 hari Bumi! Suhu boleh jatuh lebih rendah daripada -170°C, jadi pangkalan memerlukan bateri, pemanas dan penebat yang baik sehingga matahari terbit.",
      },
    ],
  },
};
