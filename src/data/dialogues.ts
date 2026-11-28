import type { Snippet } from "./grammar";

// Rows: speaker|English|Turkish
function talk(title: string, explanation: string, rows: string[]): Snippet {
  return {
    title,
    explanation,
    lines: rows.map((r) => {
      const [who, text, tr] = r.split("|");
      return { who, text, tr };
    }),
  };
}

/** Everyday conversations, two per grammar topic. */
export const DIALOGUES: Record<string, Snippet[]> = {
  "sentence-structure": [
    talk("Kafede sohbet", "Özne + fiil + nesne sırasına, yer ve zamanın sonda gelmesine dikkat et.", [
      "A|Do you come to this café often?|Bu kafeye sık gelir misin?",
      "B|Yes, I drink coffee here every morning.|Evet, her sabah burada kahve içerim.",
      "A|I usually have tea at home.|Ben genelde evde çay içerim.",
      "B|You should try the coffee here today.|Bugün buradaki kahveyi denemelisin.",
      "A|Okay, I will order it now.|Tamam, şimdi sipariş vereceğim.",
    ]),
    talk("İş çıkışı planı", "Fiil özneden hemen sonra gelir; zaman ifadesi cümlenin sonundadır.", [
      "A|What do you do after work?|İşten sonra ne yaparsın?",
      "B|I meet my friends in the park.|Arkadaşlarımla parkta buluşurum.",
      "A|Do you play football there?|Orada futbol oynar mısınız?",
      "B|We play football there on Fridays.|Cuma günleri orada futbol oynarız.",
    ]),
  ],
  "be-have-do": [
    talk("Yeni komşu", "be durum, have sahiplik, there is/are varlık bildirir.", [
      "A|Hi, are you new here?|Merhaba, burada yeni misin?",
      "B|Yes, I am. I have a flat upstairs.|Evet. Üst katta bir dairem var.",
      "A|Is there a lift in this building?|Bu binada asansör var mı?",
      "B|No, there isn't, but there are wide stairs.|Hayır yok ama geniş merdivenler var.",
      "A|Do you have any children?|Çocuğun var mı?",
      "B|I have one daughter. She is five.|Bir kızım var. Beş yaşında.",
    ]),
    talk("Ofiste yorgunluk", "am/is/are ile his ve durumları, have ile sahip olunanları anlat.", [
      "A|You look tired. Are you okay?|Yorgun görünüyorsun. İyi misin?",
      "B|I am fine, but I have a headache.|İyiyim ama başım ağrıyor.",
      "A|There is some water on my desk.|Masamda biraz su var.",
      "B|Thanks, you are very kind.|Teşekkürler, çok naziksin.",
    ]),
  ],
  "present-simple": [
    talk("Sabah rutini", "Alışkanlıklarda yalın fiil; he/she/it ile -s; soruda do/does.", [
      "A|What time do you wake up?|Saat kaçta uyanırsın?",
      "B|I usually wake up at seven.|Genelde yedide uyanırım.",
      "A|Does your brother wake up early too?|Erkek kardeşin de erken kalkar mı?",
      "B|No, he sleeps until nine.|Hayır, dokuza kadar uyur.",
      "A|Do you have breakfast together?|Birlikte kahvaltı yapar mısınız?",
      "B|We only eat together on Sundays.|Sadece pazar günleri birlikte yeriz.",
    ]),
    talk("İş hakkında", "Sürekli geçerli bilgiler için Present Simple kullanılır.", [
      "A|Where do you work?|Nerede çalışıyorsun?",
      "B|I work at a hospital.|Bir hastanede çalışıyorum.",
      "A|Do you like your job?|İşini seviyor musun?",
      "B|Yes, but it takes a lot of energy.|Evet ama çok enerji istiyor.",
    ]),
  ],
  "present-continuous": [
    talk("Telefonda", "Şu anda süren eylem: am/is/are + fiil-ing.", [
      "A|Hi! What are you doing?|Selam! Ne yapıyorsun?",
      "B|I am making dinner.|Akşam yemeği hazırlıyorum.",
      "A|Is your sister helping you?|Kız kardeşin sana yardım ediyor mu?",
      "B|No, she is watching a film.|Hayır, o film izliyor.",
      "A|I am coming over in ten minutes.|On dakikaya size geliyorum.",
    ]),
    talk("Kafede buluşma", "Bu sıralar süren geçici durumlar da -ing ile anlatılır.", [
      "A|Where are you sitting?|Nerede oturuyorsun?",
      "B|I am waiting near the window.|Pencerenin yanında bekliyorum.",
      "A|Are you still learning Spanish?|Hâlâ İspanyolca öğreniyor musun?",
      "B|Yes, I am taking a course this month.|Evet, bu ay bir kursa gidiyorum.",
    ]),
  ],
  "past-simple": [
    talk("Hafta sonu", "Bitmiş olaylar: fiilin geçmiş hali; soruda did.", [
      "A|How was your weekend?|Hafta sonun nasıldı?",
      "B|It was great. I visited my parents.|Harikaydı. Ailemi ziyaret ettim.",
      "A|Did you cook anything special?|Özel bir şey pişirdin mi?",
      "B|My mother made a delicious soup.|Annem lezzetli bir çorba yaptı.",
      "A|I stayed at home and slept.|Ben evde kalıp uyudum.",
    ]),
    talk("Geç kalma", "didn't sonrasında fiil yalın halde kalır.", [
      "A|Why did you come late?|Neden geç geldin?",
      "B|I missed the bus this morning.|Bu sabah otobüsü kaçırdım.",
      "A|Did you call the office?|Ofisi aradın mı?",
      "B|No, I didn't have my phone.|Hayır, telefonum yanımda değildi.",
    ]),
  ],
  "past-continuous": [
    talk("Dün akşamki kesinti", "Süren eylem was/were + -ing, araya giren olay Past Simple.", [
      "A|What were you doing when the lights went out?|Elektrik kesildiğinde ne yapıyordun?",
      "B|I was taking a shower.|Duş alıyordum.",
      "A|I was cooking when it happened.|Olduğunda ben yemek pişiriyordum.",
      "B|Were your children sleeping?|Çocukların uyuyor muydu?",
      "A|No, they were playing cards.|Hayır, kâğıt oynuyorlardı.",
    ]),
    talk("Yolda karşılaşma", "when ile kısa olay, while ile süren eylem anlatılır.", [
      "A|I saw you yesterday. Where were you going?|Dün seni gördüm. Nereye gidiyordun?",
      "B|I was walking to the station.|İstasyona yürüyordum.",
      "A|You were talking on the phone.|Telefonda konuşuyordun.",
      "B|Yes, my boss called while I was walking.|Evet, ben yürürken patronum aradı.",
    ]),
  ],
  "future-going-to-will": [
    talk("Tatil planı", "going to plan, will anlık karar, -ing ayarlanmış program.", [
      "A|What are you going to do this summer?|Bu yaz ne yapacaksın?",
      "B|I am going to visit Antalya.|Antalya'ya gideceğim.",
      "A|Are you staying at a hotel?|Otelde mi kalacaksın?",
      "B|Yes, we are staying near the beach.|Evet, sahile yakın kalacağız.",
      "A|I will send you some tips.|Sana birkaç ipucu gönderirim.",
    ]),
    talk("Toplantı hazırlığı", "Konuşurken verilen kararlar için will kullanılır.", [
      "A|We are meeting the client tomorrow.|Yarın müşteriyle buluşuyoruz.",
      "B|I will prepare the slides tonight.|Slaytları bu gece hazırlarım.",
      "A|Is Ali going to join us?|Ali bize katılacak mı?",
      "B|I don't think he will come.|Geleceğini sanmıyorum.",
    ]),
  ],
  "present-perfect": [
    talk("Seyahat deneyimi", "Deneyim için have/has + V3; bitmiş zaman söylenirse Past Simple.", [
      "A|Have you ever been to London?|Hiç Londra'da bulundun mu?",
      "B|Yes, I have been there twice.|Evet, iki kez gittim.",
      "A|When did you go last?|En son ne zaman gittin?",
      "B|I went there last spring.|Geçen bahar gittim.",
      "A|I have never seen it.|Ben orayı hiç görmedim.",
    ]),
    talk("İş durumu", "just, already, yet bugünle bağlantı kurar.", [
      "A|Have you finished the report yet?|Raporu bitirdin mi?",
      "B|I have just sent it to you.|Az önce sana gönderdim.",
      "A|Great. Has Ayşe seen it?|Harika. Ayşe gördü mü?",
      "B|No, she hasn't checked her email today.|Hayır, bugün e-postasına bakmadı.",
    ]),
  ],
  "perfect-continuous-modals-if": [
    talk("Uzun bekleyiş", "have been + -ing süreyi anlatır; if bölümünde will kullanılmaz.", [
      "A|How long have you been waiting?|Ne zamandır bekliyorsun?",
      "B|I have been waiting for half an hour.|Yarım saattir bekliyorum.",
      "A|You should take a taxi.|Taksiye binmelisin.",
      "B|If the bus doesn't come soon, I will.|Otobüs yakında gelmezse binerim.",
    ]),
    talk("Sınav tavsiyesi", "can, should, must sonrası yalın fiil gelir.", [
      "A|I have been studying all week.|Bütün hafta ders çalışıyorum.",
      "B|You should rest tonight.|Bu gece dinlenmelisin.",
      "A|Can you help me with grammar?|Gramerde bana yardım edebilir misin?",
      "B|Sure. If you have time, we can practise now.|Tabii. Vaktin varsa şimdi çalışabiliriz.",
      "A|That would be great.|Harika olur.",
    ]),
  ],
};
