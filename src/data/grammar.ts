import { LESSONS } from "./lessons";

export type Question = {
  prompt: string;
  answer: string;
  /** Other accepted answers. */
  alts?: string[];
  /** Free-form production task: no automatic check, only a model answer. */
  open?: boolean;
  /** "fill" (default) types an answer; "choice" picks from options; "fix" corrects a wrong sentence. */
  kind?: "fill" | "choice" | "fix";
  options?: string[];
  /** Short Turkish grammar explanation shown after checking. */
  why?: string;
  /** Stable id for questions generated at runtime. */
  id?: string;
};

export const fill = (prompt: string, answer: string, why?: string, alts?: string[]): Question => ({
  prompt,
  answer,
  why,
  alts,
});
export const pick = (prompt: string, options: string[], answer: string, why: string): Question => ({
  kind: "choice",
  prompt,
  options,
  answer,
  why,
});
export const fix = (wrong: string, answer: string, why: string, alts?: string[]): Question => ({
  kind: "fix",
  prompt: `Hatayı bul ve doğru cümleyi yaz: “${wrong}”`,
  answer,
  why,
  alts,
});

export type Example = { en: string; tr: string; note?: string };

export type Snippet = {
  title: string;
  lines: { who: string; text: string; tr?: string }[];
  explanation: string;
};

export type GrammarTopic = {
  id: string;
  title: string;
  level: string;
  summary: string;
  /** English description used when asking the AI for a fresh snippet. */
  focus: string;
  sections: { title: string; points: string[] }[];
  phrases: { en: string; tr: string }[];
  examples: Example[];
  snippet: Snippet;
  /** Common mistakes: why it is wrong and the right form. */
  mistakes?: { wrong: string; right: string; why: string }[];
  /** Ordered easy → hard. The first INITIAL_QUESTIONS are shown at the start. */
  questions: Question[];
};

export const INITIAL_QUESTIONS = 3;
export const BATCH_SIZE = 3;

function lesson(id: string) {
  const l = LESSONS.find((x) => x.id === id);
  if (!l) throw new Error(`Unknown lesson ${id}`);
  return l;
}

/** Mixed start (fill, choice, fix), then the rest; open tasks go last. */
function pool(id: string, extra: Question[]): Question[] {
  const ex = lesson(id).exercises.map<Question>((e) => {
    const open = e.answer.startsWith("Örn");
    return open
      ? { prompt: e.prompt, answer: e.answer, open: true }
      : { prompt: e.prompt, answer: e.answer.replace(/^'/, "") };
  });
  const fills = ex.filter((q) => !q.open);
  const open = ex.filter((q) => q.open);
  return [
    fills[0],
    extra[0],
    extra[1],
    ...fills.slice(1),
    ...extra.slice(2),
    ...open,
  ].filter(Boolean);
}

function fromLesson(
  id: string,
  level: string,
  extra: {
    title: string;
    examples: Example[];
    sections: GrammarTopic["sections"];
    mistakes: NonNullable<GrammarTopic["mistakes"]>;
    phrases: GrammarTopic["phrases"];
    snippet: Snippet;
    questions: Question[];
    summary?: string;
    focus?: string;
  },
): GrammarTopic {
  const l = lesson(id);
  return {
    id,
    title: extra.title,
    level,
    summary: extra.summary ?? l.summary,
    focus: extra.focus ?? l.grammarFocus,
    sections: extra.sections,
    mistakes: extra.mistakes,
    phrases: extra.phrases,
    examples: extra.examples,
    snippet: extra.snippet,
    questions: pool(id, extra.questions),
  };
}

const sentenceStructure: GrammarTopic = {
  id: "sentence-structure",
  title: "0. İngilizce Cümle Yapısı ve Türkçe ile Farkı",
  level: "Başlangıç",
  summary: "Özne + Fiil + Nesne + Yer + Zaman dizilimi",
  focus:
    "Basic English word order Subject + Verb + Object + Place + Time compared with Turkish Subject + Time + Place + Object + Verb",
  sections: [
    {
      title: "Sentence Order (SVOMPT) / Cümle Dizilimi",
      points: [
        "Basic English order: Subject + Verb + Object + Manner + Place + Time (SVOMPT). → Temel sıra: Özne + Fiil + Nesne + Tarz + Yer + Zaman.",
        "I (S) eat (V) breakfast (O) quickly (M) at home (P) every day (T). → Her gün evde hızlıca kahvaltı ederim.",
        "The verb comes right after the subject. → Fiil, özneden HEMEN sonra gelir.",
      ],
    },
    {
      title: "Turkish Order / Türkçe Dizilim",
      points: [
        "Turkish usually puts the verb LAST: Subject + Time + Place + Object + Verb. → Türkçede fiil genelde cümlenin SONUNDA gelir.",
        "Ben (S) her gün (T) evde (P) kahvaltı (O) ederim (V).",
        "Turkish uses suffixes (-de, -i, -im); English uses word order and prepositions (at, in, on). → Türkçede anlamı ekler taşır; İngilizcede kelime sırası ve edatlar taşır.",
      ],
    },
    {
      title: "Key Differences / En Önemli Farklar",
      points: [
        "Verb position: English after the subject, Turkish at the end. → Fiilin yeri: İngilizce özneden sonra, Türkçe sonda.",
        "Place before time in English (at home every day); Turkish often time before place (her gün evde). → İngilizcede önce yer, sonra zaman.",
        "Prepositions come BEFORE the noun (in the house); Turkish suffixes come after (evde). → Edatlar kelimeden ÖNCE gelir.",
        "The subject cannot be dropped: It is raining. (Turkish: Yağıyor.) → İngilizcede özne atlanamaz (It/There zorunlu).",
        "Negatives and questions need a helper verb: don't / does / did. → Olumsuz ve soruda yardımcı fiil gerekir (Türkçede -me, -mi ekleri).",
      ],
    },
    {
      title: "Common Mistakes / Yaygın Tuzaklar",
      points: [
        "Word-for-word translation: 'I every day coffee drink' ✗ → I drink coffee every day ✓. → Kelimesi kelimesine çeviri yapma.",
        "Verb at the end: 'She a book reads' ✗ → She reads a book ✓. → Fiili sona atma.",
        "Time before place sounds unnatural: He works at a bank every day ✓. → Yer, zamandan önce gelir.",
        "Missing subject: 'Is very cold' ✗ → It is very cold ✓. → Özneyi unutma.",
      ],
    },
  ],
  phrases: [
    { en: "Subject + Verb + Object", tr: "Özne + Fiil + Nesne" },
    { en: "Place comes before time", tr: "Yer, zamandan önce gelir" },
    { en: "The verb comes right after the subject", tr: "Fiil, özneden hemen sonra gelir" },
    { en: "You can't drop the subject", tr: "Özneyi atlayamazsın" },
  ],
  examples: [
    { en: "I drink coffee.", tr: "Ben kahve içerim.", note: "İng: S+V+O. Tr: S+O+V (fiil sonda)." },
    { en: "She reads a book.", tr: "O bir kitap okuyor.", note: "Fiil (reads) özneden hemen sonra; Türkçede 'okuyor' en sonda." },
    { en: "We play football in the park.", tr: "Biz parkta futbol oynuyoruz.", note: "İng: nesne, sonra yer. Tr: yer, nesne, fiil." },
    { en: "He works at a bank every day.", tr: "O her gün bankada çalışıyor.", note: "İng: Yer → Zaman. Tr: Zaman → Yer." },
    { en: "I eat breakfast at home every morning.", tr: "Her sabah evde kahvaltı ederim.", note: "S+V+O+Yer+Zaman; Türkçede zaman başa, fiil sona gider." },
    { en: "They watched a movie at the cinema last night.", tr: "Dün gece sinemada bir film izlediler.", note: "Zaman ifadesi İngilizcede sonda, Türkçede başta." },
    { en: "My mother cooks dinner in the kitchen.", tr: "Annem mutfakta akşam yemeği pişiriyor.", note: "'in the kitchen' edatı kelimeden önce; 'mutfakta' eki sonra." },
    { en: "I don't like tea.", tr: "Çay sevmem.", note: "Olumsuzluk İngilizcede yardımcı fiille (don't); Türkçede fiile ek (-me)." },
    { en: "Do you speak English?", tr: "İngilizce konuşuyor musun?", note: "Soru: yardımcı fiil başa (Do). Türkçede soru eki sona (-musun)." },
    { en: "It is raining.", tr: "Yağmur yağıyor.", note: "Türkçede özne düşer, İngilizcede 'It' zorunlu." },
    { en: "She is a very kind teacher.", tr: "O çok nazik bir öğretmen.", note: "Sıfat, isimden önce gelir (iki dilde de)." },
    { en: "I will meet my friend at the station tomorrow.", tr: "Yarın arkadaşımla istasyonda buluşacağım.", note: "İng: fiil ortada, yer sonra zaman. Tr: zaman, yer, fiil sonda." },
  ],
  snippet: {
    title: "Sabah rutini sohbeti",
    lines: [
      { who: "A", text: "What do you do every morning?" },
      { who: "B", text: "I drink coffee at home, then I walk to work." },
      { who: "A", text: "Do you eat breakfast?" },
      { who: "B", text: "No, I don't. I just have coffee." },
    ],
    explanation:
      "Dikkat et: B kişisi 'I drink coffee at home' diyor. Önce kim (I), hemen ardından ne yapıyor (drink), sonra ne (coffee), en son nerede (at home). Türkçede 'Evde kahve içiyorum' dersin ve fiil sona kaçar. İngilizce konuşurken önce 'kim + ne yapıyor' kısmını söyle, ayrıntıları (nerede, ne zaman) arkadan ekle.",
  },
  mistakes: [
    { wrong: "I every day coffee drink.", right: "I drink coffee every day.", why: "Fiil özneden hemen sonra gelir; Türkçe gibi sona atılmaz." },
    { wrong: "Is very cold today.", right: "It is very cold today.", why: "İngilizcede özne atlanamaz; hava durumunda It kullanılır." },
    { wrong: "She watches every night TV.", right: "She watches TV every night.", why: "Nesne, zaman ifadesinden önce gelir." },
  ],
  questions: [
    pick("Hangi cümlenin kelime sırası doğru?", ["I drink every day coffee.", "I drink coffee every day.", "Every day I coffee drink."], "I drink coffee every day.", "Sıra: Özne + Fiil + Nesne + Zaman. Nesne (coffee) zamandan (every day) önce gelir."),
    fix("She a book reads.", "She reads a book", "Fiil özneden hemen sonra gelir (S + V + O)."),
    { prompt: "Sırala: coffee / drink / I", answer: "I drink coffee" },
    { prompt: "Sırala: reads / a book / She", answer: "She reads a book" },
    { prompt: "Sırala: football / we / play", answer: "We play football" },
    { prompt: "Sırala: at home / I / eat / breakfast", answer: "I eat breakfast at home" },
    { prompt: "Sırala: tea / like / I / don't", answer: "I don't like tea" },
    { prompt: "Sırala: you / English / do / speak (soru)", answer: "Do you speak English" },
    { prompt: "Sırala: every day / works / he / at a bank", answer: "He works at a bank every day" },
    { prompt: "Sırala: movie / watched / they / a / last night", answer: "They watched a movie last night" },
    { prompt: "Sırala: in the kitchen / cooks / my mother / dinner", answer: "My mother cooks dinner in the kitchen" },
    { prompt: "Düzelt: “I every day coffee drink” cümlesini doğru İngilizceye çevir.", answer: "I drink coffee every day" },
    { prompt: "Türkçe: “Dün akşam evde yemek yaptım.” → İngilizce yaz.", answer: "Örn: I cooked dinner at home last night.", open: true },
    { prompt: "Türkçe: “Yarın parkta arkadaşımla buluşacağım.” → İngilizce yaz.", answer: "Örn: I will meet my friend in the park tomorrow.", open: true },
  ],
};

const f = (prompt: string, answer: string, why?: string, alts?: string[]) =>
  fill(prompt, answer, why, alts);

const beHaveDo: GrammarTopic = {
  id: "be-have-do",
  title: "1. Be, Have, Do & There Is",
  level: "Başlangıç",
  summary: "Temel yardımcı/durum fiilleri ve varlık bildirme: There is/are vs It is",
  focus:
    "The basic verbs be, have and do (as main and auxiliary verbs) and the difference between 'there is/are' (existence) and 'it is' (time, weather, identification)",
  sections: [
    {
      title: "Be (am / is / are / was / were) / Be Fiili",
      points: [
        "Be links the subject to a description: job, age, place, feeling. → Be, özneyi meslek, yaş, yer ve duygu ile bağlar: I am a teacher. She is 25. We are at home.",
        "Forms: I am, he/she/it is, you/we/they are; past: was/were. → Biçimler: I am, he/she/it is, you/we/they are; geçmiş: was/were.",
        "Be makes its own negative and question; it does NOT need do/does. → Be'nin olumsuzu/sorusu do/does gerektirmez: She isn't here. Are you ready?",
        "Be is also the helper in -ing forms: I am working. → -ing yapılarında yardımcı fiil olarak kullanılır.",
      ],
    },
    {
      title: "Have (have / has / had) / Have Fiili",
      points: [
        "Have = possess or relationship. → Sahiplik ve ilişki: I have a car. She has two brothers.",
        "Informal: have got (same meaning, present only): She's got a new phone. → Konuşmada 'have got' da kullanılır (yalnız şimdiki zaman).",
        "Have as an ACTION (eat, drink, take) uses do/does: Do you have lunch at one? I don't have coffee. → Eylem anlamında (yemek, içmek) do/does ister.",
        "he/she/it → has (not 'haves'). → he/she/it ile has kullanılır.",
      ],
    },
    {
      title: "Do (do / does / did) / Do Fiili",
      points: [
        "Do as helper makes questions and negatives in Present/Past Simple: Do you like tea? I don't know. → Yardımcı fiil olarak soru ve olumsuz yapar.",
        "Do as a main verb: do homework, do the dishes, do sports. (make: make a mistake, make the bed). → Ana fiil: do homework, do the dishes; make ayrı kalıplarda kullanılır.",
        "After does/did the main verb stays base form: Does she work? (works ✗). → does/did'den sonra ana fiil yalın kalır.",
      ],
    },
    {
      title: "There is / There are vs It is / Varlık ve Tanımlama",
      points: [
        "There is (singular) / There are (plural) say that something exists: There is a cat in the garden. There are two chairs. → Bir şeyin var olduğunu bildirir (tekil/çoğul).",
        "Negative and question: There isn't any milk. Is there a bank near here? → Olumsuz: There isn't / aren't; soru: Is/Are there...?",
        "It is: time, weather, distance, identifying a known thing: It is Monday. It is cold. It's my bag. → It is: zaman, hava, mesafe ve bilinen bir şeyi tanıtma.",
        "There + a/some/any (new information); It + the/my (already known). → There ile yeni bilgi (a/some/any), It ile bilinen şey (the/my).",
        "Turkish 'var/yok' = there is/isn't, but the subject 'there' can't be dropped. → Türkçedeki 'var/yok'un İngilizce karşılığında There zorunludur.",
      ],
    },
  ],
  mistakes: [
    { wrong: "Is a cat in the garden.", right: "There is a cat in the garden.", why: "Varlık bildirirken There özne olarak atlanamaz." },
    { wrong: "There are a book on the table.", right: "There is a book on the table.", why: "Tekil isimle there is; çoğul isimle there are." },
    { wrong: "I am agree with you.", right: "I agree with you.", why: "agree bir fiildir; Türkçedeki 'katılıyorum' gibi am/is/are almaz." },
    { wrong: "She have two sisters.", right: "She has two sisters.", why: "he/she/it ile have → has." },
    { wrong: "Do you have got a car?", right: "Have you got a car? / Do you have a car?", why: "have got ve do you have aynı anda kullanılmaz; birini seç." },
  ],
  phrases: [
    { en: "There's a... / There are some...", tr: "...var" },
    { en: "Is there a ... near here?", tr: "Yakında ... var mı?" },
    { en: "I've got...", tr: "...var / ...ım var (sahiplik)" },
    { en: "It's cold / It's Monday.", tr: "Hava soğuk / Bugün Pazartesi." },
  ],
  examples: [
    { en: "I am a student.", tr: "Ben öğrenciyim.", note: "Be + meslek. Türkçede ek (-yim), İngilizcede am gerekir." },
    { en: "She isn't at home.", tr: "O evde değil.", note: "Be'nin olumsuzu: isn't, do/does yok." },
    { en: "Are you hungry?", tr: "Aç mısın?", note: "Be'nin sorusu: fiil başa gelir." },
    { en: "He has a small dog.", tr: "Onun küçük bir köpeği var.", note: "he/she/it → has. 'Var' = have/has." },
    { en: "Do you have breakfast at home?", tr: "Kahvaltıyı evde mi yaparsın?", note: "Eylem anlamında have: do/does ile soru." },
    { en: "I do my homework after dinner.", tr: "Ödevimi akşam yemeğinden sonra yaparım.", note: "do = ana fiil (do homework)." },
    { en: "There is a bank near the station.", tr: "İstasyonun yakınında bir banka var.", note: "Yeni bilgi: There is + a. Türkçede 'var' sonda." },
    { en: "There are three chairs in the room.", tr: "Odada üç sandalye var.", note: "Çoğul isim → There are." },
    { en: "It is five o'clock and it is raining.", tr: "Saat beş ve yağmur yağıyor.", note: "Zaman ve hava durumunda özne It olur." },
  ],
  snippet: {
    title: "Yeni eve taşınma",
    lines: [
      { who: "A", text: "Is your new flat big?" },
      { who: "B", text: "Not really. There are two rooms and a small kitchen." },
      { who: "A", text: "Do you have a balcony?" },
      { who: "B", text: "Yes, I've got a tiny one. It's perfect for coffee!" },
    ],
    explanation:
      "'Is your new flat big?' be fiilinin sorusu: do/does yok. 'There are two rooms' evde neler olduğunu (varlık) anlatır, yeni bilgi verir. 'Do you have a balcony?' ve 'I've got a tiny one' sahipliği iki farklı biçimde söyler. 'It's perfect' ise az önce bahsedilen, bilinen balkonu tanımlar.",
  },
  questions: [
    pick("___ a restaurant near here?", ["Is there", "There is", "Is it"], "Is there", "Varlık sorarken Is there ...? kullanılır."),
    fix("She have two brothers.", "She has two brothers", "he/she/it ile have → has."),
    f("They ___ (be) at school now.", "are", "they → are."),
    f("There ___ (be) three books on the desk.", "are", "Çoğul isim → there are.", ["are"]),
    pick("___ you have breakfast every day?", ["Are", "Do", "Have"], "Do", "Eylem anlamında have, do ile soru yapar."),
    fix("Is cold today.", "It is cold today", "Hava durumunda özne It atlanamaz."),
    f("He ___ (not / be) a doctor.", "isn't", "Be'nin olumsuzu: isn't/is not.", ["is not"]),
    pick("I ___ my homework in the evening.", ["make", "do", "am"], "do", "do homework kalıbı."),
    f("___ she ___ (have) a car? (Do/Does)", "Does she have", "he/she/it ile soru: Does + have."),
    fix("I am agree with you.", "I agree with you", "agree fiildir; am/is/are almaz."),
    pick("___ is 7 o'clock.", ["There", "It", "He"], "It", "Saat ve zamanda It kullanılır."),
    f("There ___ (not / be) any milk in the fridge.", "isn't", "Sayılamayan isim (milk) → there isn't any.", ["is not"]),
    pick("Hangisi doğru?", ["There is a cat in the garden.", "Is a cat in the garden.", "It is a cat in the garden."], "There is a cat in the garden.", "Yeni bir şeyin varlığı: There is + a."),
    f("My parents ___ (have) a house by the sea.", "have", "they/çoğul özne → have."),
    { prompt: "'There is/are' ile odanı tarif eden bir cümle kur.", answer: "Örn: There is a bed and there are two shelves in my room.", open: true },
  ],
};

const pastContinuous: GrammarTopic = {
  id: "past-continuous",
  title: "5. Past Continuous & Past Simple",
  level: "Orta",
  summary: "Geçmişte süren arka plan eylemi ile araya giren olay",
  focus:
    "Past continuous for a background action in progress and past simple for the shorter event that interrupted it (was/were + -ing vs. -ed)",
  sections: [
    {
      title: "When to Use / Ne Zaman Kullanılır",
      points: [
        "Past Continuous: an action in progress at a moment in the past. → Geçmişte belli bir anda SÜREN eylem: At 8 pm I was cooking.",
        "Past Simple: a finished, shorter event. → Biten, kısa olay: The phone rang.",
        "Together: the long action is the background, the short one interrupts it. → Uzun eylem arka plandır, kısa olay araya girer: I was cooking when the phone rang.",
        "while + Past Continuous (süren), when + Past Simple (araya giren): While I was walking, I saw Ali. / I was walking when I saw Ali.",
      ],
    },
    {
      title: "Form & Structure / Yapı",
      points: [
        "Positive: was/were + verb-ing. → Olumlu: She was reading. (O okuyordu.)",
        "Negative: wasn't/weren't + verb-ing. → Olumsuz: They weren't sleeping. (Uyumuyorlardı.)",
        "Question: Was/Were + subject + verb-ing? → Soru: Were you working? (Çalışıyor muydun?)",
        "I/he/she/it → was; you/we/they → were. → Özneye göre was/were seçilir.",
      ],
    },
    {
      title: "Durum fiilleri / Stative verbs",
      points: [
        "Stative verbs (know, like, want, believe) normally have no -ing form: I knew the answer ✓, I was knowing ✗. → Durum fiilleri genelde -ing almaz.",
      ],
    },
  ],
  mistakes: [
    { wrong: "I watched TV when she called.", right: "I was watching TV when she called.", why: "TV izleme eylemi süren arka plandır; Past Continuous gerekir. (Kısa olay: called.)" },
    { wrong: "While I was cooking, the phone was ringing once.", right: "While I was cooking, the phone rang.", why: "Araya giren kısa, tek seferlik olay Past Simple olur." },
    { wrong: "When I was arriving, he left.", right: "When I arrived, he left.", why: "Arrive kısa bir olaydır; art arda biten olaylar Past Simple ile anlatılır." },
    { wrong: "I was knowing him.", right: "I knew him.", why: "know bir durum fiilidir; -ing almaz." },
  ],
  phrases: [
    { en: "I was in the middle of...", tr: "...'in tam ortasındaydım" },
    { en: "What were you doing when...?", tr: "...olduğunda ne yapıyordun?" },
    { en: "I was just about to...", tr: "Tam ...yapmak üzereydim" },
    { en: "While I was...", tr: "Ben ...yaparken" },
  ],
  examples: [
    { en: "I was walking home when it started to rain.", tr: "Eve yürüyordum ki yağmur başladı.", note: "Süren: was walking. Araya giren: started." },
    { en: "She was cooking when the phone rang.", tr: "O yemek yaparken telefon çaldı.", note: "when + kısa olay (Past Simple)." },
    { en: "They were playing football at 5 o'clock.", tr: "Saat beşte futbol oynuyorlardı.", note: "Geçmişte belli bir anda süren eylem." },
    { en: "While we were eating, the lights went out.", tr: "Biz yemek yerken ışıklar gitti.", note: "while + süren eylem (Past Continuous)." },
    { en: "What were you doing at 9 last night?", tr: "Dün gece dokuzda ne yapıyordun?", note: "Soru: Wh + was/were + özne + -ing?" },
    { en: "I wasn't listening, so I missed the news.", tr: "Dinlemiyordum, bu yüzden haberi kaçırdım.", note: "Olumsuz: wasn't + -ing." },
    { en: "He fell asleep while he was reading.", tr: "O kitap okurken uyuyakaldı.", note: "Kısa olay + while + süren eylem." },
    { en: "It was raining, so we stayed inside.", tr: "Yağmur yağıyordu, biz de içeride kaldık.", note: "Arka plan durumu: was raining." },
  ],
  snippet: {
    title: "Dün akşam neredeydin?",
    lines: [
      { who: "A", text: "I called you at eight. Why didn't you answer?" },
      { who: "B", text: "Sorry! I was taking a shower when you called." },
      { who: "A", text: "Ha! I was waiting outside the cinema, and it started to rain." },
      { who: "B", text: "Oh no. What did you do?" },
    ],
    explanation:
      "'I was taking a shower' uzun süren arka plan; 'you called' ise araya giren kısa olay. İkinci kişide de 'I was waiting' süren eylem, 'it started to rain' araya giren olay. Soruda 'What did you do?' bitmiş bir eylemi sorduğu için Past Simple.",
  },
  questions: [
    pick("I ___ TV when the lights went out.", ["watched", "was watching", "watch"], "was watching", "TV izlemek süren arka plan eylemidir; ışıkların sönmesi araya giren olaydır."),
    fix("I was walking when I was seeing a dog.", "I was walking when I saw a dog", "Araya giren kısa olay Past Simple olur: saw."),
    f("She ___ (cook) when I arrived.", "was cooking", "Arka plan süren eylem: was + -ing."),
    f("They ___ (not / sleep) at midnight.", "weren't sleeping", "Olumsuz Past Continuous: weren't + -ing."),
    pick("While he ___, the phone rang.", ["slept", "was sleeping", "sleeps"], "was sleeping", "while genelde süren eylemle kullanılır."),
    f("___ you ___ (work) at 10 yesterday?", "Were you working", "Soru: Were + özne + -ing?"),
    fix("When I was arriving, everybody was leaving.", "When I arrived, everybody was leaving", "Arrive kısa bir olaydır: Past Simple. Herkesin gitmekte olması süren eylemdir."),
    f("I ___ (walk) in the park when I ___ (meet) Ali.", "was walking and met", "Süren: was walking. Araya giren: met.", ["was walking, met", "was walking when i met"]),
    pick("Hangi cümle doğru?", ["I was knowing the answer.", "I knew the answer.", "I was know the answer."], "I knew the answer.", "know durum fiilidir; -ing almaz."),
    f("What ___ you ___ (do) when the earthquake started?", "were you doing", "Süren eylemi sorarken Past Continuous."),
    fix("She didn't listening to the teacher.", "She wasn't listening to the teacher", "Süren eylemin olumsuzu wasn't + -ing; didn't'ten sonra -ing gelmez."),
    { prompt: "Kendi cümlen: 'was/were + -ing' ile 'when' ve kısa bir olay kullan.", answer: "Örn: I was studying when my brother came home.", open: true },
  ],
};

const modalsIf: GrammarTopic = {
  id: "perfect-continuous-modals-if",
  title: "8. Present Perfect Continuous, Modals & If Basics",
  level: "İleri",
  summary: "Süreklilik vurgusu, temel kip kalıpları ve koşul cümleleri",
  focus:
    "Present perfect continuous (have been + -ing) for duration up to now, basic modals (can, must, should, might) and first/second conditionals",
  sections: [
    {
      title: "Present Perfect Continuous",
      points: [
        "Form: have/has been + verb-ing. I have been waiting for an hour. → Bir saattir bekliyorum.",
        "Use: an action that started in the past and is still going on, or has just stopped with a visible result. → Geçmişte başlayıp hâlâ süren (ya da yeni bitmiş ve izi olan) eylem: You're wet! — Yes, I've been running.",
        "Vurgu SÜREDE ve devamlılıktadır; for (süre) ve since (başlangıç) ile çok kullanılır: for two hours, since 9 o'clock.",
        "Sonuç/sayı vurgulanırsa Present Perfect: I've read 3 chapters. Süre vurgulanırsa: I've been reading all day.",
      ],
    },
    {
      title: "Modals / Kip fiilleri",
      points: [
        "can: ability/permission. → Yetenek, izin: I can swim. Can I sit here?",
        "must: strong obligation or logical certainty. → Güçlü zorunluluk/kesin çıkarım: You must wear a seatbelt. He must be tired.",
        "should: advice. → Tavsiye: You should see a doctor.",
        "could: past ability, polite request, possibility. → Geçmiş yetenek, kibar rica, olasılık: I could swim at five. Could you help me?",
        "have to: obligation from outside (rules, situation); must is the speaker's own feeling. → Dış zorunluluk: I have to wear a uniform. (must: kişinin kendi kararı: I must call her.)",
        "don't have to = not necessary (≠ mustn't = forbidden). → Gerek yok ≠ yasak.",
        "might / may: possibility. → Olasılık: It might rain.",
        "Modallardan sonra YALIN fiil gelir, -s/-to almaz: She can swim (✓), She cans swims (✗).",
        "Olumsuz: cannot/can't, mustn't (yasak!), shouldn't, might not.",
      ],
    },
    {
      title: "Birinci koşul (First Conditional) — gerçekçi gelecek",
      points: [
        "Form: If + Present Simple, will + base verb. If it rains, I will stay home. → Yağmur yağarsa evde kalırım.",
        "Use: real, possible situations: plans, warnings, promises. → Gerçekleşmesi mümkün durumlar.",
        "if'li kısım başta ise virgül konur: If you study, you will pass. / You will pass if you study.",
      ],
    },
    {
      title: "İkinci koşul (Second Conditional) — hayali",
      points: [
        "Form: If + Past Simple, would + base verb. If I had more time, I would learn French. → Daha çok zamanım olsaydı Fransızca öğrenirdim.",
        "Use: unreal or unlikely present/future situations, advice. → Şu an gerçek olmayan veya pek olası olmayan durumlar.",
        "be fiili tüm öznelerde were olabilir: If I were you, I would take the job.",
      ],
    },
  ],
  mistakes: [
    { wrong: "I am waiting here since two hours.", right: "I have been waiting here for two hours.", why: "Süren eylem + süre → have been + -ing ve for/since. 'for' süre, 'since' başlangıç noktası içindir." },
    { wrong: "She can to swim.", right: "She can swim.", why: "Modallardan sonra 'to' gelmez, yalın fiil gelir." },
    { wrong: "You mustn't pay; it's free.", right: "You don't have to pay; it's free.", why: "mustn't 'yasak' demektir; 'gerek yok' için don't have to kullanılır." },
    { wrong: "If it will rain, I will stay home.", right: "If it rains, I will stay home.", why: "if'ten sonra gelecek anlamı olsa da will kullanılmaz; Present Simple gelir." },
    { wrong: "If I would have time, I would help.", right: "If I had time, I would help.", why: "İkinci koşulda if'ten sonra would değil, Past Simple gelir." },
  ],
  phrases: [
    { en: "I've been meaning to...", tr: "Uzun zamandır ...yapmayı düşünüyordum" },
    { en: "You should...", tr: "...yapmalısın (tavsiye)" },
    { en: "It might be...", tr: "...olabilir" },
    { en: "If I were you, I'd...", tr: "Senin yerinde olsam ...yapardım" },
  ],
  examples: [
    { en: "I have been learning English for two years.", tr: "İki yıldır İngilizce öğreniyorum.", note: "have been + -ing + for: süreklilik." },
    { en: "She has been working here since 2020.", tr: "O 2020'den beri burada çalışıyor.", note: "since + başlangıç noktası." },
    { en: "Why are your hands dirty? — I've been fixing my bike.", tr: "Ellerin neden kirli? — Bisikletimi tamir ediyordum.", note: "Yeni biten eylemin görünen izi." },
    { en: "You should drink more water.", tr: "Daha çok su içmelisin.", note: "should: tavsiye + yalın fiil." },
    { en: "Could you open the window, please?", tr: "Pencereyi açabilir misin lütfen?", note: "could: kibar rica." },
    { en: "I have to wear a uniform at work.", tr: "İşte üniforma giymek zorundayım.", note: "have to: dış zorunluluk." },
    { en: "You mustn't park here.", tr: "Buraya park etmemelisin (yasak).", note: "mustn't: yasak; don't have to: gerek yok." },
    { en: "If it rains tomorrow, we will stay at home.", tr: "Yarın yağmur yağarsa evde kalacağız.", note: "1. koşul: if + Present Simple, will." },
    { en: "If I were you, I would take the job.", tr: "Senin yerinde olsam o işi alırdım.", note: "2. koşul: if + Past Simple (were), would." },
  ],
  snippet: {
    title: "Sınav haftası",
    lines: [
      { who: "A", text: "You look exhausted. What have you been doing?" },
      { who: "B", text: "I've been studying since six this morning." },
      { who: "A", text: "You should take a break. You might get sick." },
      { who: "B", text: "If I pass this exam, I'll sleep for a week. If I had more time, I'd be calmer, honestly." },
    ],
    explanation:
      "'What have you been doing?' ve 'I've been studying since six' süreye vurgu yapar: sabahtan beri devam ediyor. 'You should' tavsiye, 'might' olasılık. Sonda iki koşul var: 'If I pass' gerçekçi (will), 'If I had more time' ise şu an gerçek olmayan bir durum (would).",
  },
  questions: [
    pick("I ___ for an hour. I'm tired.", ["have run", "have been running", "am running"], "have been running", "Süre (an hour) ve süreklilik vurgusu: have been + -ing."),
    fix("She can to drive a truck.", "She can drive a truck", "Modallardan sonra 'to' gelmez."),
    f("We ___ (wait) since nine o'clock.", "have been waiting", "since + başlangıç noktası → Present Perfect Continuous."),
    pick("You ___ see a doctor. You look ill. (advice)", ["must", "should", "can"], "should", "Tavsiye için should kullanılır."),
    f("If it rains, I ___ (stay) home.", "will stay", "Birinci koşul: if + Present Simple, will + yalın fiil."),
    fix("If it will rain tomorrow, we will cancel the picnic.", "If it rains tomorrow, we will cancel the picnic", "if'ten sonra will gelmez."),
    f("If I had more time, I ___ (learn) French.", "would learn", "İkinci koşul: if + Past Simple, would + yalın fiil."),
    pick("You ___ park here. It's forbidden.", ["mustn't", "don't have to", "might not"], "mustn't", "mustn't yasağı anlatır; don't have to 'gerek yok' demektir."),
    f("If I ___ (be) you, I would take the job.", "were", "Hayali durumlarda be → were (was da kabul edilir).", ["was"]),
    fix("If I would have a car, I would drive.", "If I had a car, I would drive", "İkinci koşulda if'ten sonra would kullanılmaz."),
    f("How long ___ you ___ (learn) English?", "have you been learning", "How long + süreklilik: have you been + -ing?"),
    f("She ___ (not / can) come to the party.", "can't", "can'in olumsuzu can't/cannot.", ["cannot", "can not"]),
    f("What would you do if you ___ (win) the lottery?", "won", "Hayali durum: if + Past Simple."),
    f("If you ___ (hurry), you will catch the bus.", "hurry", "if'ten sonra Present Simple."),
    pick("I ___ get up early on weekdays; it's my job.", ["have to", "mustn't", "might"], "have to", "Dış zorunluluk (iş): have to."),
    pick("It's very cloudy. It ___ rain later.", ["might", "must to", "cans"], "might", "Olasılık için might + yalın fiil."),
    { prompt: "'If I were...' ile hayali bir cümle kur.", answer: "Örn: If I were a bird, I would fly to Istanbul.", open: true },
    { prompt: "'I've been ...-ing for ...' ile kendi durumunu anlat.", answer: "Örn: I've been learning English for six months.", open: true },
  ],
};

export const TOPICS: GrammarTopic[] = [
  sentenceStructure,
  beHaveDo,
  fromLesson("present-simple", "Kolay", {
    title: "2. Present Simple",
    examples: [
      { en: "I drink tea every morning.", tr: "Her sabah çay içerim.", note: "Alışkanlık: every morning → Present Simple." },
      { en: "She works in a hospital.", tr: "O bir hastanede çalışıyor.", note: "he/she/it → fiile -s: works." },
      { en: "He doesn't like coffee.", tr: "O kahveyi sevmez.", note: "doesn't + yalın fiil (likes ✗)." },
      { en: "Do they speak English?", tr: "Onlar İngilizce konuşuyor mu?", note: "Soru: Do + özne + yalın fiil." },
      { en: "Water boils at 100 degrees.", tr: "Su 100 derecede kaynar.", note: "Genel doğru: Present Simple." },
      { en: "The train leaves at 8:15.", tr: "Tren 8:15'te kalkar.", note: "Tarife ve program: Present Simple." },
      { en: "My brother studies law.", tr: "Kardeşim hukuk okuyor.", note: "Sessiz + y → -ies: studies." },
    ],
    sections: [
      {
        title: "When to Use / Ne Zaman Kullanılır",
        points: [
          "Habits and routines. → Alışkanlık ve rutinler: I drink tea every morning.",
          "General truths and facts. → Genel doğrular: Water boils at 100°C.",
          "Timetables and schedules. → Tarifeler, programlar: The train leaves at 8.",
          "State verbs (like, know, want, love) are normally used in Present Simple, not -ing. → Durum fiilleri çoğunlukla Present Simple ile kullanılır.",
        ],
      },
      {
        title: "Form & Structure / Yapı",
        points: [
          "Positive: I/you/we/they + verb; he/she/it + verb-s/-es. → Olumlu: he/she/it ile fiile -s/-es gelir. She works. / He watches TV.",
          "Negative: don't / doesn't + base verb. → Olumsuz: doesn't'ten sonra fiil yalın kalır. She doesn't work. (works ✗)",
          "Question: Do / Does + subject + base verb? → Soru: Does she work here?",
          "Spelling: add -es after -s, -sh, -ch, -x, -o (watch → watches); consonant + y → -ies (study → studies). → Yazım: bu harflerle biten fiillere -es; sessiz + y → -ies.",
          "Common adverbs: always, usually, often, sometimes, never, every day. → Sık kullanılan zarflar.",
        ],
      },
    ],
    mistakes: [
      { wrong: "She work in a bank.", right: "She works in a bank.", why: "he/she/it ile olumlu cümlede fiile -s gelir." },
      { wrong: "He doesn't likes coffee.", right: "He doesn't like coffee.", why: "doesn't zaten -s'yi taşır; ana fiil yalın kalır." },
      { wrong: "Do she play tennis?", right: "Does she play tennis?", why: "he/she/it ile soruda Does kullanılır." },
      { wrong: "I am go to school every day.", right: "I go to school every day.", why: "Alışkanlıkta am/is/are + yalın fiil birleştirilmez." },
    ],
    phrases: [
      { en: "I usually...", tr: "Genellikle ...ırım" },
      { en: "She doesn't like...", tr: "O ...'i sevmez" },
      { en: "Do you ... every day?", tr: "Her gün ... yapar mısın?" },
      { en: "It depends on...", tr: "...'e bağlı" },
    ],
    snippet: {
      title: "İş çıkışı sohbeti",
      lines: [
        { who: "A", text: "What do you usually do after work?" },
        { who: "B", text: "I usually go to the gym. My sister doesn't like it, so she stays home." },
        { who: "A", text: "Do you cook dinner?" },
        { who: "B", text: "Sometimes. Mostly my brother cooks." },
      ],
      explanation:
        "Gerçek hayatta Present Simple'ı alışkanlıklardan bahsederken kullanırız: usually, sometimes, mostly. 'My sister doesn't like it' cümlesinde dikkat et: doesn't'tan sonra fiil yalın (like), 'stays' ise olumlu olduğu için -s alıyor.",
    },
    questions: [
      pick("My brother ___ in a hospital.", ["work", "works", "is work"], "works", "he/she/it + fiil-s: works."),
      fix("She don't like fish.", "She doesn't like fish", "he/she/it ile olumsuzda doesn't kullanılır."),
      f("They ___ (not / eat) meat.", "don't eat", "they ile olumsuz: don't + yalın fiil."),
      f("___ he ___ (play) tennis?", "Does he play", "he ile soru: Does + yalın fiil."),
      pick("Water ___ at 100 degrees.", ["boil", "boils", "is boiling"], "boils", "Genel doğru: Present Simple, -s alır."),
      f("The bus ___ (leave) at 8:15 every day.", "leaves", "Tarife: Present Simple."),
      fix("He watch TV every night.", "He watches TV every night", "-ch ile biten fiil -es alır: watches."),
      f("What time ___ (the shop / open)?", "does the shop open", "Soru: Wh + does + özne + yalın fiil."),
      f("She never ___ (watch) TV in the morning.", "watches", "never olsa da özne she: -es alır."),
      f("He ___ (fix) cars for a living.", "fixes", "-x ile biten fiil -es alır."),
      pick("Hangisi doğru?", ["Does he plays football?", "Does he play football?", "Do he play football?"], "Does he play football?", "Does'tan sonra fiil yalın gelir."),
      f("My mother ___ (study) English every evening.", "studies", "Sessiz + y → -ies."),
    ],
  }),
  fromLesson("present-continuous", "Kolay", {
    title: "3. Present Continuous",
    examples: [
      { en: "I'm reading a book right now.", tr: "Şu an kitap okuyorum.", note: "right now → Present Continuous." },
      { en: "She isn't listening to me.", tr: "O beni dinlemiyor.", note: "Olumsuz: isn't + -ing." },
      { en: "Are you waiting for someone?", tr: "Biri için mi bekliyorsun?", note: "Soru: Are + özne + -ing?" },
      { en: "I'm staying with a friend this week.", tr: "Bu hafta bir arkadaşımda kalıyorum.", note: "Geçici durum: bu sıralar." },
      { en: "It's getting colder every day.", tr: "Hava her gün soğuyor.", note: "Değişim: get + sıfat + -ing." },
      { en: "We're meeting Ali tomorrow at five.", tr: "Yarın saat beşte Ali ile buluşuyoruz.", note: "Kesinleşmiş plan: Present Continuous." },
      { en: "I know the answer.", tr: "Cevabı biliyorum.", note: "know durum fiili: -ing almaz (I'm knowing ✗)." },
    ],
    sections: [
      {
        title: "When to Use / Ne Zaman Kullanılır",
        points: [
          "Actions happening now. → Tam şu an olan eylemler: I'm reading now.",
          "Temporary situations around now. → Bu sıralar süren geçici durumlar: I'm staying with a friend this week.",
          "Changing situations. → Değişim: It's getting colder. Prices are rising.",
          "Planned future (arrangement). → Kesinleşmiş yakın gelecek planı: I'm meeting Ali tomorrow at 5.",
        ],
      },
      {
        title: "Form & Structure / Yapı",
        points: [
          "Positive: am/is/are + verb-ing. → Olumlu: She is reading.",
          "Negative: am not / isn't / aren't + verb-ing. → Olumsuz: They aren't working.",
          "Question: Am/Is/Are + subject + verb-ing? → Soru: Are you listening?",
          "Spelling: run → running, write → writing, lie → lying. → Yazım: ünsüz ikilenir, sessiz e düşer.",
          "Non-progressive (stative) verbs (know, like, want, need, love, understand, believe) normally have no -ing form. → Durum fiilleri -ing almaz: I know him ✓, I'm knowing him ✗.",
        ],
      },
    ],
    mistakes: [
      { wrong: "I am knowing the answer.", right: "I know the answer.", why: "know durum fiilidir; -ing almaz." },
      { wrong: "She is work now.", right: "She is working now.", why: "am/is/are ile fiile -ing eklenmelidir." },
      { wrong: "I'm going to school every day.", right: "I go to school every day.", why: "Düzenli alışkanlık Present Simple ister." },
      { wrong: "Are you liking this song?", right: "Do you like this song?", why: "like durum fiilidir; Present Simple kullan." },
    ],
    phrases: [
      { en: "I'm working on...", tr: "...üzerinde çalışıyorum" },
      { en: "What are you doing?", tr: "Ne yapıyorsun?" },
      { en: "I'm on my way.", tr: "Yoldayım." },
      { en: "It's getting late.", tr: "Geç oluyor." },
    ],
    snippet: {
      title: "Telefonda kısa konuşma",
      lines: [
        { who: "A", text: "Hey, are you busy?" },
        { who: "B", text: "Kind of. I'm cooking dinner and my phone is ringing." },
        { who: "A", text: "I'm waiting outside, by the way." },
        { who: "B", text: "Oh! I'm coming!" },
      ],
      explanation:
        "Present Continuous 'tam şu an' olanları anlatır. 'I'm cooking' (şu an yemek yapıyorum), 'I'm waiting' (şu an bekliyorum). Son cümle 'I'm coming!' ise çok yakın bir eylemi haber verir: hemen geliyorum.",
    },
    questions: [
      pick("Look! The baby ___.", ["sleeps", "is sleeping", "sleep"], "is sleeping", "'Look!' şu an olan bir eylemi gösterir."),
      fix("I am wanting a coffee.", "I want a coffee", "want durum fiilidir; -ing almaz."),
      f("I ___ (read) a great book these days.", "am reading", "Bu sıralar süren geçici durum."),
      f("She ___ (not / listen) to me.", "isn't listening", "Olumsuz: isn't + -ing.", ["is not listening"]),
      f("___ it ___ (rain) outside?", "Is it raining", "Soru: Is + özne + -ing?"),
      pick("I ___ my teacher tomorrow at ten. (planned)", ["meet", "am meeting", "meets"], "am meeting", "Kesinleşmiş plan için Present Continuous kullanılır."),
      f("We ___ (have) dinner at the moment.", "are having", "have 'yemek yemek' anlamında -ing alabilir."),
      fix("They are play football now.", "They are playing football now", "are + fiil-ing."),
      f("He ___ (run) in the park right now.", "is running", "run → running (son harf ikilenir)."),
      f("Why ___ you ___ (laugh)?", "are you laughing", "Wh- + are + özne + -ing?"),
      f("They ___ (build) a new bridge in our city.", "are building", "Bu sıralar süren proje."),
      pick("It ___ colder every day.", ["gets", "is getting", "get"], "is getting", "Değişim ve gelişim: Present Continuous."),
    ],
  }),
  fromLesson("past-simple", "Orta", {
    title: "4. Past Simple",
    examples: [
      { en: "I visited Izmir last year.", tr: "Geçen yıl İzmir'i ziyaret ettim.", note: "last year bitmiş zaman: -ed." },
      { en: "She bought a new car in May.", tr: "O mayısta yeni bir araba aldı.", note: "buy → bought (düzensiz)." },
      { en: "We didn't go to school yesterday.", tr: "Dün okula gitmedik.", note: "didn't + yalın fiil (didn't went ✗)." },
      { en: "Did you see the match?", tr: "Maçı gördün mü?", note: "Soru: Did + özne + yalın fiil." },
      { en: "He was tired, so he went to bed early.", tr: "Yorgundu, bu yüzden erken yattı.", note: "to be: was/were; art arda olaylar." },
      { en: "They played football for two hours.", tr: "İki saat futbol oynadılar.", note: "played: /d/ sesiyle okunur." },
      { en: "I wanted some water.", tr: "Biraz su istedim.", note: "wanted: /ɪd/ sesiyle okunur." },
    ],
    sections: [
      {
        title: "When to Use / Ne Zaman Kullanılır",
        points: [
          "Finished actions at a definite time in the past. → Geçmişte bitmiş olaylar: I visited Izmir last year.",
          "A series of past events. → Art arda olaylar: I woke up, ate breakfast and left.",
          "Bitmiş zaman ifadeleri: yesterday, last week, in 2019, two days ago, when I was a child.",
        ],
      },
      {
        title: "Form & Structure / Yapı",
        points: [
          "Regular verbs: verb + -ed. → Düzenli fiiller: work → worked, study → studied, stop → stopped.",
          "-ed sounds: /t/ (worked), /d/ (played), /ɪd/ (wanted, needed). → -ed üç farklı sesle okunur.",
          "Irregular verbs have their own past forms: go → went, buy → bought, see → saw. → Düzensiz fiiller ezberlenir.",
          "Negative: didn't + base verb. → Olumsuz: didn't'ten sonra yalın fiil. I didn't go. (went ✗)",
          "Question: Did + subject + base verb? → Soru: Did you go? (to be: was/were)",
        ],
      },
    ],
    mistakes: [
      { wrong: "I didn't went to school.", right: "I didn't go to school.", why: "didn't'ten sonra fiil yalın kalır; geçmiş zaman işareti didn't üzerinde." },
      { wrong: "Did you saw him?", right: "Did you see him?", why: "Did'den sonra yalın fiil gelir." },
      { wrong: "I go to Ankara yesterday.", right: "I went to Ankara yesterday.", why: "yesterday bitmiş zaman ifadesidir; fiil geçmiş olmalı." },
      { wrong: "She buyed a car.", right: "She bought a car.", why: "buy düzensiz fiildir: buy → bought." },
    ],
    phrases: [
      { en: "I went to...", tr: "...'e gittim" },
      { en: "What did you do?", tr: "Ne yaptın?" },
      { en: "I didn't have time.", tr: "Vaktim olmadı." },
      { en: "It was great!", tr: "Harikaydı!" },
    ],
    snippet: {
      title: "Hafta sonu nasıldı?",
      lines: [
        { who: "A", text: "How was your weekend?" },
        { who: "B", text: "Great! We went to the beach and I forgot my sunscreen." },
        { who: "A", text: "Ouch. Did you get burned?" },
        { who: "B", text: "A little. I didn't care though." },
      ],
      explanation:
        "Bitmiş bir zaman diliminden (hafta sonu) bahsederken Past Simple kullanırız. 'went' ve 'forgot' düzensiz fiillerdir. Soru ve olumsuzda yardımcı fiil did/didn't gelir ve ana fiil yalın kalır: 'Did you get...', 'I didn't care'.",
    },
    questions: [
      pick("We ___ a movie last night.", ["watch", "watched", "watching"], "watched", "last night bitmiş zaman: fiil + -ed."),
      fix("I didn't went to work yesterday.", "I didn't go to work yesterday", "didn't'ten sonra yalın fiil gelir."),
      f("He ___ (buy) a new car in May.", "bought", "buy düzensiz: bought."),
      f("I ___ (not / sleep) well yesterday.", "didn't sleep", "Olumsuz: didn't + yalın fiil.", ["did not sleep"]),
      f("___ you ___ (call) your mother?", "Did you call", "Soru: Did + özne + yalın fiil."),
      pick("She ___ very happy at the party.", ["was", "were", "did"], "was", "to be geçmişi: she → was."),
      fix("Did she wanted tea?", "Did she want tea", "Did'den sonra yalın fiil."),
      f("They ___ (not / be) at home last night.", "weren't", "they → were; olumsuz weren't."),
      f("What ___ you ___ (do) last weekend?", "did you do", "Wh- + did + özne + yalın fiil."),
      f("I ___ (see) him two days ago.", "saw", "see düzensiz: saw."),
      pick("-ed sesi 'wanted' kelimesinde nasıl okunur?", ["/t/", "/d/", "/ɪd/"], "/ɪd/", "t ve d ile biten fiillerde -ed ayrı bir hece olur: /ɪd/."),
      f("She ___ (study) hard for the exam last week.", "studied", "Sessiz + y → -ied."),
    ],
  }),
  pastContinuous,
  fromLesson("future-going-to-will", "Orta", {
    title: "6. Future: Going to, Will & Present Continuous",
    examples: [
      { en: "I'm going to study tonight.", tr: "Bu akşam ders çalışacağım.", note: "Önceden verilmiş karar: going to." },
      { en: "Look at the clouds! It's going to rain.", tr: "Bulutlara bak! Yağmur yağacak.", note: "Kanıta dayalı tahmin: going to." },
      { en: "The phone's ringing. I'll get it.", tr: "Telefon çalıyor. Ben açarım.", note: "Anlık karar/teklif: will." },
      { en: "I think she will pass the exam.", tr: "Bence sınavı geçecek.", note: "Kanıtsız görüş: I think + will." },
      { en: "I promise I won't be late.", tr: "Söz veriyorum geç kalmayacağım.", note: "Söz: will / won't." },
      { en: "I'm seeing the dentist on Monday at 3.", tr: "Pazartesi saat 3'te dişçiye gidiyorum.", note: "Randevu/ayarlanmış plan: Present Continuous." },
      { en: "Will you open the window, please?", tr: "Pencereyi açar mısın lütfen?", note: "Rica: Will you...?" },
    ],
    sections: [
      {
        title: "Üç yapı, üç anlam / Three forms, three meanings",
        points: [
          "going to: plans and intentions made BEFORE speaking; predictions with evidence. → Önceden verilmiş karar ve kanıta dayalı tahmin: I'm going to study tonight. Look at the clouds! It's going to rain.",
          "will: instant decisions, offers, promises, opinions/predictions without evidence. → Anlık karar, teklif, söz, kanıtsız tahmin: The phone's ringing — I'll get it. I think it will be fine.",
          "Present Continuous: fixed arrangements with a time/person. → Zamanı ve kişisi belli, ayarlanmış plan: I'm seeing the dentist on Monday at 3.",
        ],
      },
      {
        title: "Form & Structure / Yapı",
        points: [
          "going to: am/is/are + going to + base verb. → Soru: Are you going to...?",
          "will: will + base verb; negative: won't. → Olumsuz won't; Will you...? rica/teklif içindir.",
          "Compare: I'm going to call him (already decided) / I'll call him (deciding now) / I'm calling him at 6 (arranged). → Karar verdim / şimdi karar veriyorum / saati ayarladım.",
        ],
      },
    ],
    mistakes: [
      { wrong: "Wait, I am going to help you.", right: "Wait, I'll help you.", why: "Anlık teklif/karar will ile ifade edilir." },
      { wrong: "Look at the sky! It will rain.", right: "Look at the sky! It's going to rain.", why: "Elimizde kanıt (bulutlar) var: going to." },
      { wrong: "I will to call you.", right: "I will call you.", why: "will'den sonra to gelmez." },
      { wrong: "I go to the cinema tomorrow.", right: "I'm going to the cinema tomorrow.", why: "Planlı gelecek için Present Continuous / going to kullanılır." },
    ],
    phrases: [
      { en: "I'm going to...", tr: "...yapacağım (plan)" },
      { en: "I'll help you.", tr: "Sana yardım edeyim." },
      { en: "I think it will...", tr: "Bence ...olacak" },
      { en: "I won't be late.", tr: "Geç kalmayacağım." },
    ],
    snippet: {
      title: "Hafta sonu planları",
      lines: [
        { who: "A", text: "What are you doing this weekend?" },
        { who: "B", text: "I'm going to visit my parents." },
        { who: "A", text: "Nice. I'll drive you to the station if you want." },
        { who: "B", text: "Thanks! It'll probably rain, so that helps." },
      ],
      explanation:
        "'I'm going to visit' önceden verilmiş bir karar. 'I'll drive you' ise o anda yapılan bir teklif. 'It'll probably rain' ise kanıta dayanmayan bir tahmin: will. Konuşmada kısaltmalar çok yaygındır: I'll, It'll.",
    },
    questions: [
      pick("Oh, the door is open! I ___ close it.", ["am going to", "will", "am closing"], "will", "Anlık karar: will."),
      fix("Look! It will rain in a minute.", "Look! It is going to rain in a minute", "Kanıt var (Look!): going to."),
      f("I ___ (visit) my uncle next month. (plan)", "am going to visit", "Önceden verilmiş plan: going to."),
      f("I think Turkey ___ (win) the match.", "will win", "Kanıtsız görüş: will."),
      pick("I ___ the dentist on Friday at 4. (appointment)", ["see", "am seeing", "will to see"], "am seeing", "Ayarlanmış randevu: Present Continuous."),
      f("They ___ (not / move) to Ankara. (plan)", "aren't going to move", "Olumsuz: aren't going to + yalın fiil.", ["are not going to move"]),
      f("___ you ___ (help) me with this box?", "Will you help", "Rica: Will you...?"),
      fix("I will to call you tonight.", "I will call you tonight", "will'den sonra to gelmez."),
      f("It's 8:55 and I'm still at home! I ___ (be) late.", "am going to be", "Şu anki duruma bakan kesin tahmin: going to."),
      f("I promise I ___ (not / tell) anyone.", "won't tell", "Söz: will / won't."),
      pick("Hangisi daha doğal? (anlık teklif)", ["I'm going to carry that for you.", "I'll carry that for you.", "I carry that for you."], "I'll carry that for you.", "Teklifte will kullanılır."),
      f("Look at those clouds! It ___ (snow).", "is going to snow", "Kanıt var: going to."),
    ],
  }),
  fromLesson("present-perfect", "Zor", {
    title: "7. Present Perfect vs. Past Simple",
    examples: [
      { en: "I've lost my keys.", tr: "Anahtarlarımı kaybettim (şu an yok).", note: "Şu anki sonuç var: Present Perfect." },
      { en: "I lost my keys yesterday.", tr: "Anahtarlarımı dün kaybettim.", note: "yesterday: Past Simple." },
      { en: "Have you ever been to Rome?", tr: "Hiç Roma'da bulundun mu?", note: "Hayat deneyimi: ever + Present Perfect." },
      { en: "She has already eaten lunch.", tr: "O öğle yemeğini zaten yedi.", note: "already: olumlu cümlede." },
      { en: "I haven't seen that film yet.", tr: "O filmi henüz izlemedim.", note: "yet: olumsuz ve soruda." },
      { en: "We have lived here for ten years.", tr: "On yıldır burada yaşıyoruz.", note: "for + süre." },
      { en: "He has worked here since 2021.", tr: "O 2021'den beri burada çalışıyor.", note: "since + başlangıç zamanı." },
    ],
    sections: [
      {
        title: "When to Use Which / Ne Zaman Hangisi",
        points: [
          "Present Perfect (have/has + past participle): past action connected to now — experience, result, unfinished time. → Bugünle bağlantılı geçmiş: I've lost my keys (şu an yok). Have you ever been to Rome?",
          "Past Simple: finished action at a definite past time. → Bitmiş, zamanı belli: I lost my keys yesterday.",
          "Zaman ipuçları: ever, never, already, yet, just, so far, this week → Present Perfect. yesterday, last year, in 2020, ago → Past Simple.",
          "for + süre (for 3 years), since + başlangıç (since 2021): Present Perfect ile.",
        ],
      },
      {
        title: "Form & Structure / Yapı",
        points: [
          "Positive: have/has + past participle. → Olumlu: She has finished.",
          "Negative: haven't/hasn't + past participle. → Olumsuz: I haven't seen it yet.",
          "Question: Have/Has + subject + past participle? → Soru: Have you ever tried sushi?",
          "With a finished time (yesterday, last week) do NOT use Present Perfect: I saw him yesterday ✓. → Bitmiş zaman belirtilirse Past Simple kullanılır: I have seen him yesterday ✗.",
        ],
      },
    ],
    mistakes: [
      { wrong: "I have seen him yesterday.", right: "I saw him yesterday.", why: "yesterday bitmiş zaman: Past Simple." },
      { wrong: "I live here since 2020.", right: "I have lived here since 2020.", why: "since ile süren durum Present Perfect ister." },
      { wrong: "Did you ever visit Rome?", right: "Have you ever visited Rome?", why: "Hayat deneyimi sorarken (ever) Present Perfect kullanılır." },
      { wrong: "She has went home.", right: "She has gone home.", why: "go → went → gone. have/has ile V3 (gone) gelir." },
    ],
    phrases: [
      { en: "Have you ever...?", tr: "Hiç ...yaptın mı?" },
      { en: "I've never been to...", tr: "Hiç ...'e gitmedim" },
      { en: "I've just...", tr: "Az önce ...yaptım" },
      { en: "How long have you...?", tr: "Ne zamandır ...?" },
    ],
    snippet: {
      title: "Seyahat sohbeti",
      lines: [
        { who: "A", text: "Have you ever been to Italy?" },
        { who: "B", text: "No, never. But I've always wanted to go." },
        { who: "A", text: "I've just booked a trip for June!" },
        { who: "B", text: "No way! Have you told Sam yet?" },
      ],
      explanation:
        "Present Perfect, geçmişte olan ama bugünle bağlantılı şeyleri anlatır. 'Have you ever...?' hayat deneyimi sorar. 'I've just booked' çok yeni bir olaydır. 'Have you told Sam yet?' ise 'henüz söyledin mi?' demektir. 'I booked it on Monday' dersen zaman belli olduğu için Past Simple kullanırsın.",
    },
    questions: [
      pick("I ___ my keys. I can't get in.", ["lost", "have lost", "was losing"], "have lost", "Şu anki sonuç (içeri giremiyorum) var: Present Perfect."),
      fix("I have visited Paris in 2019.", "I visited Paris in 2019", "in 2019 belli, bitmiş zaman: Past Simple."),
      f("She ___ (already / eat) lunch.", "has already eaten", "already + Present Perfect."),
      f("We ___ (live) here for ten years.", "have lived", "for + süre: Present Perfect."),
      pick("___ you ever ___ sushi?", ["Did / try", "Have / tried", "Do / tried"], "Have / tried", "Deneyim sorusu: Have you ever + V3?"),
      f("I ___ (not / see) that film yet.", "haven't seen", "yet olumsuzda: haven't + V3.", ["have not seen"]),
      fix("She has went home.", "She has gone home", "go → went → gone: V3 gerekir."),
      f("They ___ (just / leave).", "have just left", "just araya girer: have just left."),
      pick("I ___ him last week.", ["saw", "have seen", "have saw"], "saw", "last week bitmiş zaman: Past Simple."),
      f("How long ___ you ___ (know) Ali?", "have you known", "How long + Present Perfect."),
      f("She ___ (write) three emails this morning. (the morning isn't over)", "has written", "Süreci bitmemiş zaman diliminde Present Perfect."),
      fix("I am here since Monday.", "I have been here since Monday", "since ile süren durum: have been."),
    ],
  }),
  modalsIf,
];
