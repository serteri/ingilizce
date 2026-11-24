export type Stage = "examples" | "vocab_practice" | "end_conversation";

export type Difficulty = "easy" | "medium" | "hard";

export type Word = {
  word: string;
  tr: string;
  example: string;
  difficulty: Difficulty;
  /** Pronunciation in IPA; ˈ marks the stressed syllable. */
  ipa: string;
};

export type Lesson = {
  id: string;
  title: string;
  tenseTopic: string;
  grammarFocus: string;
  summary: string;
  grammar: { title: string; points: string[] }[];
  examples: { en: string; tr: string }[];
  words: Word[];
  exercises: { prompt: string; answer: string }[];
};

export const STAGE_VALUES: Stage[] = [
  "examples",
  "vocab_practice",
  "end_conversation",
];

export const LESSONS: Lesson[] = [
  {
    id: "present-simple",
    title: "Present Simple",
    tenseTopic: "Present Simple",
    grammarFocus:
      "Habits and routines with the base verb; add -s/-es for he/she/it; use do/does for negatives and questions",
    summary: "Alışkanlıklar, rutinler ve genel doğrular",
    grammar: [
      {
        title: "Ne zaman kullanılır?",
        points: [
          "Alışkanlık ve rutinler: I drink coffee every morning. (Her sabah kahve içerim.)",
          "Genel doğrular ve bilimsel gerçekler: Water boils at 100 degrees.",
          "Tarifeler ve programlar: The train leaves at 8 o'clock.",
          "Kalıcı durumlar: She lives in Ankara.",
        ],
      },
      {
        title: "Zaman ifadeleri (ipuçları)",
        points: [
          "always, usually, often, sometimes, rarely, never (sıklık zarfları fiilden önce, be fiilinden sonra gelir)",
          "every day / week / year, on Mondays, in the morning, once a week",
        ],
      },
      {
        title: "Yapı",
        points: [
          "Olumlu: özne + fiil (he/she/it için fiil + s/es). I work. / She works.",
          "Olumsuz: özne + do not (don't) / does not (doesn't) + yalın fiil. He doesn't work.",
          "Soru: Do/Does + özne + yalın fiil? Does she work here?",
          "Kısa cevap: Yes, I do. / No, she doesn't.",
        ],
      },
      {
        title: "Yaygın tuzaklar",
        points: [
          "does/doesn't kullandıktan sonra fiile -s EKLEMEZSİN: She doesn't works ✗ → She doesn't work ✓",
          "-s/-x/-ch/-sh/-o ile biten fiillere -es gelir: watch → watches, go → goes.",
          "Sessiz harf + y biten fiillerde y → ies: study → studies (ama play → plays).",
          "be fiili (am/is/are) do/does ile kullanılmaz: She doesn't is tired ✗",
        ],
      },
    ],
    examples: [
      { en: "I wake up at seven every morning.", tr: "Her sabah yedide uyanırım." },
      { en: "She works in a small hospital.", tr: "O, küçük bir hastanede çalışıyor." },
      { en: "My brother doesn't like spicy food.", tr: "Erkek kardeşim acılı yemeği sevmez." },
      { en: "Do you take the bus to work?", tr: "İşe otobüsle mi gidersin?" },
      { en: "The shop opens at nine and closes at six.", tr: "Dükkân dokuzda açılır, altıda kapanır." },
      { en: "We usually have dinner together on Sundays.", tr: "Pazar günleri genelde birlikte akşam yemeği yeriz." },
    ],
    words: [
      { word: "routine", difficulty: "medium", ipa: "/ruːˈtiːn/", tr: "rutin, düzen", example: "My morning routine is very simple." },
      { word: "commute", difficulty: "medium", ipa: "/kəˈmjuːt/", tr: "işe gidip gelmek", example: "I commute by train every day." },
      { word: "usually", difficulty: "easy", ipa: "/ˈjuːʒuəli/", tr: "genellikle", example: "I usually get home around six." },
      { word: "schedule", difficulty: "medium", ipa: "/ˈskedʒuːl/", tr: "program, zaman çizelgesi", example: "My schedule is busy on Mondays." },
      { word: "take a shower", difficulty: "easy", ipa: "/teɪk ə ˈʃaʊər/", tr: "duş almak", example: "I take a shower before breakfast." },
      { word: "go for a walk", difficulty: "easy", ipa: "/ɡoʊ fər ə ˈwɔːk/", tr: "yürüyüşe çıkmak", example: "She goes for a walk after dinner." },
      { word: "colleague", difficulty: "hard", ipa: "/ˈkɑːliːɡ/", tr: "iş arkadaşı", example: "My colleague drinks tea all day." },
    ],
    exercises: [
      { prompt: "She ___ (work) in a bank.", answer: "works" },
      { prompt: "He ___ (not / like) coffee.", answer: "doesn't like" },
      { prompt: "___ you ___ (go) to the gym on Fridays?", answer: "Do you go" },
      { prompt: "Kendi günlük rutinini 'usually' kelimesiyle bir cümlede anlat.", answer: "Örn: I usually wake up at seven and drink coffee." },
    ],
  },
  {
    id: "present-continuous",
    title: "Present Continuous",
    tenseTopic: "Present Continuous",
    grammarFocus:
      "Actions happening right now or around now, and fixed near-future plans; am/is/are + verb-ing",
    summary: "Şu anda olanlar ve yakın plânlar",
    grammar: [
      {
        title: "Ne zaman kullanılır?",
        points: [
          "Tam şu anda olan eylemler: I am talking to you now.",
          "Bu günlerde süren geçici durumlar: She is studying for exams this week.",
          "Değişen / gelişen durumlar: Prices are getting higher.",
          "Kesinleşmiş yakın plânlar: We are meeting Ali tomorrow at five.",
        ],
      },
      {
        title: "Zaman ifadeleri (ipuçları)",
        points: [
          "now, right now, at the moment, currently, today, this week",
          "Look! Listen! gibi dikkat çeken ifadeler",
        ],
      },
      {
        title: "Yapı",
        points: [
          "Olumlu: özne + am/is/are + fiil-ing. He is reading.",
          "Olumsuz: özne + am/is/are + not + fiil-ing. They aren't working.",
          "Soru: Am/Is/Are + özne + fiil-ing? Are you listening?",
          "Yazım: make → making (e düşer), run → running (ünsüz ikilenir), lie → lying.",
        ],
      },
      {
        title: "Yaygın tuzaklar",
        points: [
          "Durum fiilleri (know, like, love, want, need, believe, understand) genelde -ing almaz: I am knowing ✗ → I know ✓",
          "am/is/are'ı unutma: She working now ✗ → She is working now ✓",
          "Düzenli tekrar eden şeyler için Present Simple, şu an için Present Continuous kullan.",
        ],
      },
    ],
    examples: [
      { en: "I am drinking tea right now.", tr: "Şu anda çay içiyorum." },
      { en: "She is talking on the phone at the moment.", tr: "O, şu sırada telefonla konuşuyor." },
      { en: "They aren't watching TV; they are cooking.", tr: "Televizyon izlemiyorlar; yemek yapıyorlar." },
      { en: "Are you waiting for someone?", tr: "Birini mi bekliyorsun?" },
      { en: "I am learning English these days.", tr: "Bu günlerde İngilizce öğreniyorum." },
      { en: "We are flying to Izmir on Saturday.", tr: "Cumartesi İzmir'e uçuyoruz." },
    ],
    words: [
      { word: "right now", difficulty: "easy", ipa: "/raɪt ˈnaʊ/", tr: "tam şu anda", example: "I am cooking dinner right now." },
      { word: "at the moment", difficulty: "easy", ipa: "/ət ðə ˈmoʊmənt/", tr: "şu sırada", example: "He is busy at the moment." },
      { word: "wait for", difficulty: "easy", ipa: "/ˈweɪt fər/", tr: "-i beklemek", example: "I am waiting for my friend." },
      { word: "get ready", difficulty: "easy", ipa: "/ɡet ˈredi/", tr: "hazırlanmak", example: "We are getting ready for the trip." },
      { word: "meet up", difficulty: "medium", ipa: "/ˈmiːt ʌp/", tr: "buluşmak", example: "They are meeting up after work." },
      { word: "work on", difficulty: "medium", ipa: "/ˈwɜːrk ɑːn/", tr: "üzerinde çalışmak", example: "She is working on a new project." },
      { word: "stay", difficulty: "easy", ipa: "/steɪ/", tr: "kalmak", example: "I am staying at a hotel this week." },
    ],
    exercises: [
      { prompt: "Look! The baby ___ (sleep).", answer: "is sleeping" },
      { prompt: "They ___ (not / play) football now.", answer: "aren't playing" },
      { prompt: "What ___ you ___ (do) at the moment?", answer: "are you doing" },
      { prompt: "Şu an etrafında ne olduğunu iki cümleyle anlat.", answer: "Örn: I am sitting at my desk. My cat is sleeping." },
    ],
  },
  {
    id: "past-simple",
    title: "Past Simple",
    tenseTopic: "Past Simple",
    grammarFocus:
      "Finished actions in the past; verb + ed or irregular forms; did/didn't + base verb for negatives and questions",
    summary: "Geçmişte bitmiş eylemler",
    grammar: [
      {
        title: "Ne zaman kullanılır?",
        points: [
          "Geçmişte başlayıp bitmiş eylemler: I visited Rome last year.",
          "Geçmişte art arda olan olaylar: He woke up, ate breakfast and left.",
          "Geçmiş alışkanlıklar: We played outside every day as kids.",
        ],
      },
      {
        title: "Zaman ifadeleri (ipuçları)",
        points: [
          "yesterday, last night / week / year, two days ago, in 2019, when I was a child",
        ],
      },
      {
        title: "Yapı",
        points: [
          "Düzenli fiiller: fiil + ed (work → worked, stop → stopped, study → studied).",
          "Düzensiz fiiller: go → went, see → saw, eat → ate, buy → bought, have → had.",
          "Olumsuz: özne + did not (didn't) + yalın fiil. She didn't go.",
          "Soru: Did + özne + yalın fiil? Did you see him?",
          "be fiili: was/were. I was tired. They weren't home. Were you there?",
        ],
      },
      {
        title: "Yaygın tuzaklar",
        points: [
          "did/didn't sonrası fiil yalın kalır: She didn't went ✗ → She didn't go ✓",
          "Düzensiz fiilleri ezberlemek gerekir; sık kullanılanlarla başla.",
          "Geçmişteki belirli bir zaman söylendiğinde Present Perfect değil Past Simple kullanılır: I have seen him yesterday ✗",
        ],
      },
    ],
    examples: [
      { en: "I visited my grandparents last weekend.", tr: "Geçen hafta sonu büyükanne ve büyükbabamı ziyaret ettim." },
      { en: "She bought a new phone yesterday.", tr: "Dün yeni bir telefon aldı." },
      { en: "We didn't go to the cinema because it rained.", tr: "Yağmur yağdığı için sinemaya gitmedik." },
      { en: "Did you finish your homework?", tr: "Ödevini bitirdin mi?" },
      { en: "He was very tired after the trip.", tr: "Geziden sonra çok yorgundu." },
      { en: "They met in Istanbul in 2018.", tr: "2018'de İstanbul'da tanıştılar." },
    ],
    words: [
      { word: "last weekend", difficulty: "easy", ipa: "/læst ˈwiːkend/", tr: "geçen hafta sonu", example: "I stayed home last weekend." },
      { word: "ago", difficulty: "easy", ipa: "/əˈɡoʊ/", tr: "önce", example: "We moved here three years ago." },
      { word: "arrive", difficulty: "medium", ipa: "/əˈraɪv/", tr: "varmak", example: "The train arrived late." },
      { word: "decide", difficulty: "medium", ipa: "/dɪˈsaɪd/", tr: "karar vermek", example: "I decided to learn English." },
      { word: "forget", difficulty: "medium", ipa: "/fərˈɡet/", tr: "unutmak", example: "I forgot my keys at home." },
      { word: "enjoy", difficulty: "easy", ipa: "/ɪnˈdʒɔɪ/", tr: "keyif almak", example: "We enjoyed the concert a lot." },
      { word: "trip", difficulty: "easy", ipa: "/trɪp/", tr: "gezi, yolculuk", example: "Our trip to the coast was great." },
    ],
    exercises: [
      { prompt: "I ___ (go) to the market yesterday.", answer: "went" },
      { prompt: "She ___ (not / see) the message.", answer: "didn't see" },
      { prompt: "___ they ___ (enjoy) the party?", answer: "Did they enjoy" },
      { prompt: "Dün ne yaptığını iki cümleyle anlat.", answer: "Örn: I worked from home. In the evening I watched a movie." },
    ],
  },
  {
    id: "future-going-to-will",
    title: "Future: Going to / Will",
    tenseTopic: "Future with Going to and Will",
    grammarFocus:
      "going to for plans and evidence-based predictions; will for spontaneous decisions, promises, offers and opinions about the future",
    summary: "Plânlar, kararlar, sözler ve tahminler",
    grammar: [
      {
        title: "Going to — ne zaman?",
        points: [
          "Önceden verilmiş karar / plân: I'm going to start a new course next month.",
          "Şu anki kanıta dayalı tahmin: Look at those clouds! It's going to rain.",
        ],
      },
      {
        title: "Will — ne zaman?",
        points: [
          "Konuşma anında verilen karar: The phone is ringing. I'll answer it.",
          "Söz ve teklif: I'll help you with your bags.",
          "Kanıtsız görüş ve tahmin (I think / probably): I think she will pass the exam.",
        ],
      },
      {
        title: "Yapı",
        points: [
          "going to: am/is/are + going to + yalın fiil. She isn't going to come. Are you going to stay?",
          "will: will + yalın fiil (tüm öznelerde aynı). He will call you. I won't be late. Will you help me?",
          "Kısaltma: I'll, you'll, she'll, we'll, they'll, won't (= will not).",
        ],
      },
      {
        title: "Yaygın tuzaklar",
        points: [
          "will'den sonra to ve -s yok: She will to go ✗, She wills go ✗ → She will go ✓",
          "Önceden plânlanmış bir şey için will yerine going to tercih edilir.",
          "Zaman cümleciklerinde (when, if, as soon as) will kullanılmaz: When I will arrive ✗ → When I arrive ✓",
        ],
      },
    ],
    examples: [
      { en: "I'm going to visit my cousin next week.", tr: "Önümüzdeki hafta kuzenimi ziyaret edeceğim." },
      { en: "Look out! You're going to fall.", tr: "Dikkat et! Düşeceksin." },
      { en: "I'll carry that bag for you.", tr: "O çantayı senin için ben taşıyayım." },
      { en: "I think it will be sunny tomorrow.", tr: "Sanırım yarın hava güneşli olacak." },
      { en: "We aren't going to buy a car this year.", tr: "Bu yıl araba almayacağız." },
      { en: "Will you call me when you arrive?", tr: "Vardığında beni arar mısın?" },
    ],
    words: [
      { word: "plan", difficulty: "easy", ipa: "/plæn/", tr: "plân yapmak; plân", example: "We plan to travel in summer." },
      { word: "promise", difficulty: "medium", ipa: "/ˈprɑːmɪs/", tr: "söz vermek", example: "I promise I'll be on time." },
      { word: "probably", difficulty: "medium", ipa: "/ˈprɑːbəbli/", tr: "muhtemelen", example: "It will probably rain tonight." },
      { word: "next month", difficulty: "easy", ipa: "/nekst ˈmʌnθ/", tr: "gelecek ay", example: "I'm moving next month." },
      { word: "in the future", difficulty: "medium", ipa: "/ɪn ðə ˈfjuːtʃər/", tr: "gelecekte", example: "I want to travel more in the future." },
      { word: "hope", difficulty: "easy", ipa: "/hoʊp/", tr: "ummak", example: "I hope you'll like it." },
      { word: "expect", difficulty: "hard", ipa: "/ɪkˈspekt/", tr: "beklemek, öngörmek", example: "I expect it to be busy tomorrow." },
    ],
    exercises: [
      { prompt: "Look at the sky! It ___ (rain).", answer: "is going to rain" },
      { prompt: "A: I'm thirsty. B: I ___ (get) you some water.", answer: "'ll get" },
      { prompt: "She ___ (not / come) to the meeting. (plan)", answer: "isn't going to come" },
      { prompt: "Haftasonu için bir plânını 'going to' ile söyle.", answer: "Örn: I'm going to visit my parents on Saturday." },
    ],
  },
  {
    id: "present-perfect",
    title: "Present Perfect",
    tenseTopic: "Present Perfect",
    grammarFocus:
      "Life experiences, recent results and unfinished time up to now; have/has + past participle with ever, never, already, yet, just, for, since",
    summary: "Deneyimler ve bugünle bağlantılı geçmiş",
    grammar: [
      {
        title: "Ne zaman kullanılır?",
        points: [
          "Hayat deneyimleri (ne zaman olduğu önemli değil): I have visited Paris.",
          "Şu anı etkileyen yakın geçmiş: I have lost my keys. (Hâlâ yoklar.)",
          "Geçmişte başlayıp hâlâ süren durumlar: I have lived here for five years.",
        ],
      },
      {
        title: "Zaman ifadeleri (ipuçları)",
        points: [
          "ever, never, already, yet, just, recently, so far",
          "for + süre (for two years), since + başlangıç noktası (since 2020)",
        ],
      },
      {
        title: "Yapı",
        points: [
          "Olumlu: have/has + V3 (past participle). She has finished.",
          "Olumsuz: haven't / hasn't + V3. We haven't eaten yet.",
          "Soru: Have/Has + özne + V3? Have you ever tried sushi?",
          "V3: work → worked; go → gone, see → seen, eat → eaten, write → written.",
        ],
      },
      {
        title: "Yaygın tuzaklar",
        points: [
          "Belirli geçmiş zamanla kullanılmaz: I have seen him yesterday ✗ → I saw him yesterday ✓",
          "been ve gone farkı: She has been to Rome (gitti, döndü) / She has gone to Rome (gitti, orada).",
          "yet sorularda ve olumsuzda, already olumlu cümlelerde kullanılır.",
        ],
      },
    ],
    examples: [
      { en: "I have never eaten sushi.", tr: "Hiç suşi yemedim." },
      { en: "She has already finished her homework.", tr: "Ödevini çoktan bitirdi." },
      { en: "Have you ever been to London?", tr: "Hiç Londra'ya gittin mi?" },
      { en: "We have lived in this city since 2019.", tr: "2019'dan beri bu şehirde yaşıyoruz." },
      { en: "He hasn't called me yet.", tr: "Beni henüz aramadı." },
      { en: "They have just arrived at the airport.", tr: "Havalimanına yeni geldiler." },
    ],
    words: [
      { word: "experience", difficulty: "hard", ipa: "/ɪkˈspɪriəns/", tr: "deneyim", example: "I have a lot of experience with kids." },
      { word: "ever", difficulty: "easy", ipa: "/ˈevər/", tr: "hiç (soru)", example: "Have you ever tried yoga?" },
      { word: "never", difficulty: "easy", ipa: "/ˈnevər/", tr: "hiç (olumsuz)", example: "I have never been late." },
      { word: "already", difficulty: "medium", ipa: "/ɔːlˈredi/", tr: "çoktan", example: "I have already eaten." },
      { word: "yet", difficulty: "medium", ipa: "/jet/", tr: "henüz", example: "I haven't finished yet." },
      { word: "recently", difficulty: "hard", ipa: "/ˈriːsntli/", tr: "son zamanlarda", example: "I have recently started a new job." },
      { word: "since / for", difficulty: "medium", ipa: "/sɪns/ · /fɔːr/", tr: "-den beri / süre boyunca", example: "I have studied English for two years." },
    ],
    exercises: [
      { prompt: "I ___ (never / visit) Japan.", answer: "have never visited" },
      { prompt: "She ___ (live) here since 2020.", answer: "has lived" },
      { prompt: "___ you ___ (finish) the report yet?", answer: "Have you finished" },
      { prompt: "'Have you ever...?' ile bir deneyim sorusu sor ve kendin cevapla.", answer: "Örn: Have you ever tried skiing? Yes, I have. / No, I haven't." },
    ],
  },
];

export function getLesson(id: string | null | undefined) {
  return LESSONS.find((l) => l.id === id);
}

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

/** Words sorted from easy to hard (stable within the same level). */
export function sortWords(words: Word[]): Word[] {
  return [...words].sort(
    (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty],
  );
}
