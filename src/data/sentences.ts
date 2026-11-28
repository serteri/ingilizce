/** SVOMPT sentences for the "build it yourself" stage. */
export const ROLES = ["s", "v", "o", "m", "p", "t"] as const;
export type Role = (typeof ROLES)[number];

export type Sentence = Record<Role, string> & {
  /** Natural Turkish meaning. */
  tr: string;
};

export const ROLE_INFO: Record<Role, { tag: string; label: string; cls: string }> = {
  s: { tag: "S", label: "Özne", cls: "border-blue-300 bg-blue-100 text-blue-900" },
  v: { tag: "V", label: "Fiil", cls: "border-rose-300 bg-rose-100 text-rose-900" },
  o: { tag: "O", label: "Nesne / Tümleç", cls: "border-emerald-300 bg-emerald-100 text-emerald-900" },
  m: { tag: "M", label: "Tarz", cls: "border-amber-300 bg-amber-100 text-amber-900" },
  p: { tag: "P", label: "Yer", cls: "border-violet-300 bg-violet-100 text-violet-900" },
  t: { tag: "T", label: "Zaman", cls: "border-cyan-300 bg-cyan-100 text-cyan-900" },
};

/** Short rule shown under the correct order, per topic. */
export const RULES: Record<string, { en: string; tr: string }> = {
  "sentence-structure": {
    en: "Subject + Verb + Object + Manner + Place + Time. The verb follows the subject; place comes before time.",
    tr: "Özne + Fiil + Nesne + Tarz + Yer + Zaman. Fiil özneden hemen sonra gelir; yer zamandan öncedir.",
  },
  "be-have-do": {
    en: "Use am/is/are for states, have/has for possession, there is/are to say something exists.",
    tr: "Durum için am/is/are, sahiplik için have/has, bir şeyin varlığı için there is/are kullanılır.",
  },
  "present-simple": {
    en: "Habits use the base verb; add -s with he/she/it. Negatives use don't / doesn't.",
    tr: "Alışkanlıklarda yalın fiil kullanılır; he/she/it ile -s eklenir. Olumsuzda don't / doesn't gelir.",
  },
  "present-continuous": {
    en: "am/is/are + verb-ing describes what is happening now or around now.",
    tr: "am/is/are + fiil-ing şu an ya da bu sıralar süren eylemi anlatır.",
  },
  "past-simple": {
    en: "Finished actions use the past form; negatives use didn't + base verb.",
    tr: "Bitmiş eylemlerde fiilin geçmiş hali kullanılır; olumsuzda didn't + yalın fiil gelir.",
  },
  "past-continuous": {
    en: "was/were + verb-ing is the longer action; the time or 'when' clause goes at the end.",
    tr: "was/were + fiil-ing süren eylemdir; zaman ya da 'when' bölümü sonda yer alır.",
  },
  "future-going-to-will": {
    en: "going to = plan, will = decision or prediction, am/is/are + -ing = arrangement.",
    tr: "going to plan, will anlık karar ya da tahmin, am/is/are + -ing ayarlanmış program bildirir.",
  },
  "present-perfect": {
    en: "have/has + past participle links the past to now; with a finished time use Past Simple.",
    tr: "have/has + üçüncü hal geçmişi bugüne bağlar; bitmiş zaman verilirse Past Simple kullanılır.",
  },
  "perfect-continuous-modals-if": {
    en: "have/has been + -ing shows duration (for/since); modals take the base verb.",
    tr: "have/has been + -ing süreyi gösterir (for/since); modal fiillerden sonra yalın fiil gelir.",
  },
};

// Format: S|V|O|M|P|T|Turkish meaning without the subject
const CORE: Record<string, string[]> = {
  "sentence-structure": [
    "I|drink|coffee||at home|every morning|her sabah evde kahve içerim.",
    "She|reads|a book|carefully|in the library|on Sundays|pazar günleri kütüphanede dikkatle bir kitap okur.",
    "We|play|football|happily|in the park|every weekend|her hafta sonu parkta neşeyle futbol oynarız.",
    "He|speaks|English|very well|at work||işte çok iyi İngilizce konuşur.",
    "They|watched|a film|quietly|at home|last night|dün gece evde sessizce bir film izlediler.",
    "My mother|cooks|dinner||in the kitchen|every evening|her akşam mutfakta akşam yemeği pişirir.",
    "I|eat|breakfast|quickly|at home|every day|her gün evde hızlıca kahvaltı ederim.",
    "Ali|bought|a new phone||at the mall|yesterday|dün alışveriş merkezinden yeni bir telefon aldı.",
    "You|do|your homework|carefully|in your room|every night|her gece odanda ödevini dikkatle yaparsın.",
    "The children|sing|songs|loudly|at school|on Fridays|cuma günleri okulda yüksek sesle şarkı söyler.",
    "She|drives|her car|slowly|in the city|at night|geceleri şehirde arabasını yavaş sürer.",
    "We|will visit|our grandparents||in Izmir|next month|gelecek ay İzmir'de büyükanne ve büyükbabamızı ziyaret edeceğiz.",
    "He|fixed|the bike|easily|in the garage|this morning|bu sabah garajda bisikleti kolayca tamir etti.",
    "I|met|an old friend||at the station|last week|geçen hafta istasyonda eski bir arkadaşımla karşılaştım.",
    "My friend|plays|the guitar|beautifully|at parties||partilerde çok güzel gitar çalar.",
    "They|have|lunch||in the garden|on Saturdays|cumartesi günleri bahçede öğle yemeği yer.",
    "Ayşe|writes|emails|quickly|in the office|every afternoon|her öğleden sonra ofiste hızlıca e-posta yazar.",
    "We|studied|English|together|at the café|last night|dün gece kafede birlikte İngilizce çalıştık.",
  ],
  "be-have-do": [
    "She|is|a teacher||at this school||bu okulda öğretmendir.",
    "I|am|very tired|||today|bugün çok yorgunum.",
    "They|are|happy||in their new house||yeni evlerinde mutlular.",
    "He|has|two sisters||||iki kız kardeşe sahip.",
    "We|have|a small garden||behind the house||evin arkasında küçük bir bahçeye sahibiz.",
    "There|is|a cat||under the table||masanın altında bir kedi var.",
    "There|are|three chairs||in the room||odada üç sandalye var.",
    "Ali|is|at home|||now|şu anda evde.",
    "My brother|has|a meeting|||this afternoon|bu öğleden sonra bir toplantıya sahip.",
    "You|are|a good student||in this class||bu sınıfta iyi bir öğrencisin.",
    "I|do|my homework|carefully|in my room|every evening|her akşam odamda ödevimi dikkatle yaparım.",
    "She|was|very busy|||yesterday|dün çok meşguldü.",
    "They|were|at the cinema|||last night|dün gece sinemadaydı.",
    "There|was|a big tree||near the school||okulun yanında büyük bir ağaç vardı.",
    "We|had|a great time||at the beach|last summer|geçen yaz sahilde harika vakit geçirdik.",
    "He|isn't|hungry|||right now|şu an aç değil.",
    "I|don't have|any money|||today|bugün hiç param yok.",
    "My friend|does|yoga||in the park|on Sundays|pazar günleri parkta yoga yapar.",
  ],
  "present-simple": [
    "I|drink|tea||at home|every morning|her sabah evde çay içerim.",
    "She|works|||at a bank|every day|her gün bir bankada çalışır.",
    "He|plays|tennis|very well|at the club|on Mondays|pazartesileri kulüpte çok iyi tenis oynar.",
    "We|take|the bus|||every day|her gün otobüse bineriz.",
    "They|live|||in a small village||küçük bir köyde yaşar.",
    "My mother|makes|breakfast||in the kitchen|at seven|saat yedide mutfakta kahvaltı hazırlar.",
    "Ali|studies|English|hard|at the library|after school|okuldan sonra kütüphanede sıkı İngilizce çalışır.",
    "I|don't eat|meat||||et yemem.",
    "She|doesn't watch|TV|||in the morning|sabahları televizyon izlemez.",
    "You|speak|Turkish|fluently|||akıcı Türkçe konuşursun.",
    "The children|walk||quickly|to school|every morning|her sabah okula hızlıca yürür.",
    "My brother|reads|the news||on the train|every morning|her sabah trende haberleri okur.",
    "We|visit|our grandparents|||on Sundays|pazar günleri büyükanne ve büyükbabamızı ziyaret ederiz.",
    "He|usually goes|||to bed|at eleven|genellikle saat on birde yatar.",
    "I|always do|my homework||at my desk|in the evening|akşamları ödevimi hep masamda yaparım.",
    "They|often cook|fish||in the garden|in summer|yazın sık sık bahçede balık pişirir.",
    "Ayşe|teaches|maths|patiently|at a high school||bir lisede sabırla matematik öğretir.",
    "My friend|never drinks|coffee|||at night|geceleri asla kahve içmez.",
  ],
  "present-continuous": [
    "I|am reading|a book||in my room|right now|şu an odamda bir kitap okuyorum.",
    "She|is cooking|dinner||in the kitchen|now|şu an mutfakta akşam yemeği pişiriyor.",
    "They|are playing|football||in the park|at the moment|şu anda parkta futbol oynuyor.",
    "He|is driving|his car|carefully|in the city|now|şu an şehirde arabasını dikkatle sürüyor.",
    "We|are watching|a match||at the café|tonight|bu gece kafede maç izliyoruz.",
    "My brother|is studying|English||at the library|this week|bu hafta kütüphanede İngilizce çalışıyor.",
    "Ali|is talking||quietly|on the phone|right now|şu an telefonda sessizce konuşuyor.",
    "You|are doing|a great job|||today|bugün harika iş çıkarıyorsun.",
    "The children|are sleeping||peacefully|upstairs|now|şu an üst katta huzurla uyuyor.",
    "I|am not wearing|a coat|||today|bugün palto giymiyorum.",
    "She|is learning|to swim|||this summer|bu yaz yüzmeyi öğreniyor.",
    "We|are staying|||at a hotel|this weekend|bu hafta sonu bir otelde kalıyoruz.",
    "My mother|is watering|the flowers||in the garden|at the moment|şu anda bahçede çiçekleri suluyor.",
    "We|are building|a small shed||behind our house|this month|bu ay evimizin arkasına küçük bir kulübe yapıyoruz.",
    "Ayşe|is writing|an email|quickly|in the office|now|şu an ofiste hızlıca bir e-posta yazıyor.",
    "He|isn't working|||at home|today|bugün evde çalışmıyor.",
    "I|am waiting|||at the bus stop|right now|şu an otobüs durağında bekliyorum.",
    "My friend|is taking|photos||at the museum|today|bugün müzede fotoğraf çekiyor.",
  ],
  "past-simple": [
    "I|visited|my aunt||in Ankara|last week|geçen hafta Ankara'da teyzemi ziyaret ettim.",
    "She|watched|a film||at home|yesterday|dün evde bir film izledi.",
    "They|played|basketball|happily|at school|last Friday|geçen cuma okulda neşeyle basketbol oynadı.",
    "He|bought|a jacket||at the market|two days ago|iki gün önce pazardan bir ceket aldı.",
    "We|had|dinner||at a restaurant|last night|dün gece bir restoranda akşam yemeği yedik.",
    "My brother|broke|the window|accidentally||this morning|bu sabah yanlışlıkla camı kırdı.",
    "Ali|finished|the report|quickly|in the office|yesterday|dün ofiste raporu hızlıca bitirdi.",
    "I|didn't see|the message|||this morning|bu sabah mesajı görmedim.",
    "You|did|your homework|well|at the library|on Monday|pazartesi kütüphanede ödevini iyi yaptın.",
    "The children|swam|||in the sea|last summer|geçen yaz denizde yüzdü.",
    "My mother|baked|a cake||in the kitchen|on Sunday|pazar günü mutfakta bir kek pişirdi.",
    "She|didn't call|me|||last night|dün gece beni aramadı.",
    "We|walked||slowly|along the beach|yesterday evening|dün akşam sahil boyunca yavaşça yürüdük.",
    "He|lost|his keys||on the bus|last week|geçen hafta otobüste anahtarlarını kaybetti.",
    "Ayşe|sang|a song|beautifully|at the party|on Saturday|cumartesi partide çok güzel bir şarkı söyledi.",
    "They|moved|||to Istanbul|in 2020|2020'de İstanbul'a taşındı.",
    "I|slept||badly||last night|dün gece kötü uyudum.",
    "My friend|wrote|a letter||in the café|an hour ago|bir saat önce kafede bir mektup yazdı.",
  ],
  "past-continuous": [
    "I|was cooking|dinner||in the kitchen|when you called|sen aradığında mutfakta akşam yemeği pişiriyordum.",
    "She|was reading|a book|quietly|in her room|at nine o'clock|saat dokuzda odasında sessizce kitap okuyordu.",
    "They|were playing|cards||in the garden|when it started to rain|yağmur başladığında bahçede kâğıt oynuyordu.",
    "He|was driving||fast|on the highway|when the police stopped him|polis onu durdurduğunda otoyolda hızlı sürüyordu.",
    "We|were watching|TV||at home|all evening|bütün akşam evde televizyon izliyorduk.",
    "My brother|was sleeping||deeply|on the sofa|when I arrived|ben vardığımda koltukta derin uyuyordu.",
    "Ali|was waiting|||at the bus stop|at that moment|o anda otobüs durağında bekliyordu.",
    "You|were talking||loudly|in the library|when the teacher came|öğretmen geldiğinde kütüphanede yüksek sesle konuşuyordun.",
    "The children|were running||happily|in the park|this time yesterday|dün bu saatlerde parkta neşeyle koşuyordu.",
    "I|wasn't listening|to the radio|||when the news started|haberler başladığında radyo dinlemiyordum.",
    "My mother|was working|||in the office|when I texted her|ona mesaj attığımda ofiste çalışıyordu.",
    "She|was taking|photos||at the museum|when we met|tanıştığımızda müzede fotoğraf çekiyordu.",
    "They|were having|breakfast||on the balcony|at eight|saat sekizde balkonda kahvaltı yapıyordu.",
    "He|was washing|the car|carefully|outside|when the storm began|fırtına başladığında dışarıda arabayı dikkatle yıkıyordu.",
    "We|were walking||slowly|along the river|when we saw the fire|yangını gördüğümüzde nehir boyunca yavaşça yürüyorduk.",
    "Ayşe|was studying|maths||at the library|all afternoon|bütün öğleden sonra kütüphanede matematik çalışıyordu.",
    "I|was having|a shower|||when the doorbell rang|kapı zili çaldığında duş alıyordum.",
    "My friend|was singing|a song||in the car|during the trip|yolculuk boyunca arabada şarkı söylüyordu.",
  ],
  "future-going-to-will": [
    "I|am going to visit|my family||in Bursa|next weekend|gelecek hafta sonu Bursa'da ailemi ziyaret edeceğim.",
    "She|is going to study|medicine||at university|next year|gelecek yıl üniversitede tıp okuyacak.",
    "We|will build|a new bridge||over the river|next year|gelecek yıl nehrin üzerine yeni bir köprü yapacağız.",
    "He|is meeting|his boss||at the office|tomorrow morning|yarın sabah ofiste patronuyla buluşacak.",
    "We|are going to have|a picnic||in the park|on Sunday|pazar günü parkta piknik yapacağız.",
    "I|will call|you|||tonight|bu gece seni arayacağım.",
    "My brother|will help|us|gladly|at home|after lunch|öğle yemeğinden sonra evde bize seve seve yardım edecek.",
    "Ali|is flying|||to London|next Monday|gelecek pazartesi Londra'ya uçacak.",
    "You|will love|the food||at this restaurant||bu restorandaki yemeği çok seveceksin.",
    "The children|are going to watch|a film||at the cinema|tonight|bu gece sinemada bir film izleyecek.",
    "I|won't forget|your birthday|||this time|bu sefer doğum gününü unutmayacağım.",
    "She|is going to buy|a new car|||next month|gelecek ay yeni bir araba alacak.",
    "My friend|is playing|the piano||at the concert|on Friday|cuma günü konserde piyano çalacak.",
    "We|will finish|the project|quickly||by Thursday|perşembeye kadar projeyi hızlıca bitireceğiz.",
    "He|is going to paint|the kitchen|||this weekend|bu hafta sonu mutfağı boyayacak.",
    "They|are having|dinner||at our house|tomorrow|yarın bizim evde akşam yemeği yiyecek.",
    "It|will rain||heavily|in the north|tomorrow|Yarın kuzeyde sağanak yağmur yağacak.",
    "Ayşe|will send|the photos|||this evening|bu akşam fotoğrafları gönderecek.",
  ],
  "present-perfect": [
    "I|have visited|Paris||||Paris'i ziyaret ettim (hayatımda).",
    "She|has just finished|her homework||||ödevini az önce bitirdi.",
    "They|have lived|||in Ankara|for five years|beş yıldır Ankara'da yaşıyor.",
    "He|has lost|his wallet||on the train||cüzdanını trende kaybetti.",
    "We|have already seen|that film||||o filmi zaten gördük.",
    "My brother|has worked|||at this company|since 2021|2021'den beri bu şirkette çalışıyor.",
    "Ali|has never eaten|sushi||||hiç suşi yemedi.",
    "I|haven't called|my mother|||today|bugün henüz annemi aramadım.",
    "You|have improved|your English|a lot||this year|bu yıl İngilizceni çok geliştirdin.",
    "The children|have cleaned|their room|carefully|||odalarını dikkatle temizledi.",
    "My friend|has bought|a new house||near the sea||deniz kenarında yeni bir ev aldı.",
    "She|has read|three books|||this month|bu ay üç kitap okudu.",
    "We|have known|each other|||since childhood|çocukluktan beri birbirimizi tanıyoruz.",
    "He|hasn't finished|the report|||yet|raporu henüz bitirmedi.",
    "They|have travelled||a lot|in Europe||Avrupa'da çok seyahat etti.",
    "I|have met|your teacher||at the school|before|daha önce okulda öğretmeninle tanıştım.",
    "Ayşe|has broken|her phone|||twice|telefonunu iki kez kırdı.",
    "My mother|has made|a delicious soup||||lezzetli bir çorba yaptı.",
  ],
  "perfect-continuous-modals-if": [
    "I|have been waiting|||at the station|for an hour|bir saattir istasyonda bekliyorum.",
    "She|has been studying|English|hard||since January|ocaktan beri sıkı İngilizce çalışıyor.",
    "They|have been playing|tennis||at the club|all morning|bütün sabahtır kulüpte tenis oynuyor.",
    "He|has been working|||at home|since Monday|pazartesiden beri evde çalışıyor.",
    "We|have been living|||in this flat|for two years|iki yıldır bu dairede yaşıyoruz.",
    "I|can speak|two languages|well|||iki dili iyi konuşabilirim.",
    "You|should see|a doctor|||today|bugün bir doktora görünmelisin.",
    "My brother|must finish|this job|||before Friday|cumadan önce bu işi bitirmek zorunda.",
    "Ali|can swim||very fast|in the pool||havuzda çok hızlı yüzebilir.",
    "She|might visit|her cousin||in Izmir|next week|gelecek hafta İzmir'de kuzenini ziyaret edebilir.",
    "We|mustn't use|our phones||in the exam||sınavda telefonlarımızı kullanmamalıyız.",
    "The children|have been watching|cartoons|||since breakfast|kahvaltıdan beri çizgi film izliyor.",
    "I|could read|a map|easily||at ten|on yaşında haritayı kolayca okuyabiliyordum.",
    "My friend|has been learning|the guitar|||for six months|altı aydır gitar öğreniyor.",
    "You|can park|your car||behind the hotel||arabanı otelin arkasına park edebilirsin.",
    "I|will stay|||at home|if it rains|yağmur yağarsa evde kalacağım.",
    "She|will pass|the exam|easily||if she studies|çalışırsa sınavı kolayca geçecek.",
    "Ayşe|has been cooking||happily|in the kitchen|since noon|öğleden beri mutfakta neşeyle yemek yapıyor.",
  ],
};

/** Turkish form of each subject; "" when Turkish drops it. */
const SUBJECT_TR: Record<string, string> = {
  I: "Ben",
  You: "Sen",
  We: "Biz",
  He: "O",
  She: "O",
  It: "",
  There: "",
  They: "Onlar",
  Ali: "Ali",
  Ayşe: "Ayşe",
  "My brother": "Erkek kardeşim",
  "My mother": "Annem",
  "My friend": "Arkadaşım",
  "The children": "Çocuklar",
};

// Subjects that share verb forms in both languages and can replace each other.
const SWAPS = [
  ["He", "She", "Ali", "Ayşe", "My brother", "My mother", "My friend"],
  ["They", "The children"],
];

const clean = (x: string) => x.replace(/\s+/g, " ").trim();

export function englishOf(x: Sentence) {
  const text = ROLES.map((r) => x[r]).filter(Boolean).join(" ");
  return `${text}.`;
}

export function sentenceKey(x: Sentence) {
  return englishOf(x).toLowerCase();
}

function build(row: string, subject?: string): Sentence {
  const [s, v, o, m, p, t, rest] = row.split("|");
  const who = subject ?? s;
  const trWho = SUBJECT_TR[who] ?? "";
  return { s: who, v, o, m, p, t, tr: clean(`${trWho} ${rest}`) };
}

export function coreSentences(topicId: string): Sentence[] {
  return (CORE[topicId] ?? CORE["sentence-structure"]).map((r) => build(r));
}

/**
 * Offline generator: the core sentences retold with other subjects. Rows whose
 * words refer back to the subject (his, her, him, she...) are left alone.
 */
export function localVariants(topicId: string): Sentence[] {
  const rows = CORE[topicId] ?? CORE["sentence-structure"];
  const out: Sentence[] = [];
  // Outer loop over the shift so neighbouring items use different rows.
  for (let shift = 1; shift < SWAPS[0].length; shift++) {
    for (const row of rows) {
      const parts = row.split("|");
      if (/\b(his|her|him|their|she|he)\b/i.test(parts.slice(1, 6).join(" "))) continue;
      const group = SWAPS.find((g) => g.includes(parts[0]));
      if (!group || shift >= group.length) continue;
      out.push(build(row, group[(group.indexOf(parts[0]) + shift) % group.length]));
    }
  }
  return out;
}
