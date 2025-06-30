// Adım 1: Firebase'den aldığınız KENDİ yapılandırma kodunuzu buraya yapıştırın.
// Sizin sağladığınız koddan aldım:
const firebaseConfig = {
    apiKey: "AIzaSyCy2-UOqSLgt6HJYIHCY49cP9zLGcWFePs",
    authDomain: "besyildizsayim.firebaseapp.com",
    projectId: "besyildizsayim",
    storageBucket: "besyildizsayim.appspot.com",
    messagingSenderId: "917664754525",
    appId: "1:917664754525:web:9fc8bb5ec68457d3cdd6b4"
};

// Adım 2: Firebase'i Başlat (compat sürümü)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Firestore veritabanını kullanıyoruz

// HTML elementlerini seçelim
const girisKutusu = document.getElementById('kullanici-giris-kutusu');
const sayimAlani = document.getElementById('sayim-alani');
const sayimaBaslaBtn = document.getElementById('sayima-basla-btn');
const sayimYapanInput = document.getElementById('sayim-yapan-input');
const aktifKullaniciAdi = document.getElementById('aktif-kullanici-adi');
const urunEkleForm = document.getElementById('urun-ekle-form');
const urunTablosuBody = document.querySelector("#urun-tablosu tbody");

let sayimYapanKisi = '';

// Adım 3: Kullanıcı adını alıp sayım ekranını göster
sayimaBaslaBtn.addEventListener('click', () => {
    sayimYapanKisi = sayimYapanInput.value.trim();
    if (sayimYapanKisi === '') {
        alert('Lütfen adınızı giriniz!');
        return;
    }
    
    // Giriş kutusunu gizle, sayım alanını göster
    girisKutusu.classList.add('gizli');
    sayimAlani.classList.remove('gizli');
    aktifKullaniciAdi.textContent = sayimYapanKisi;
});

// Adım 4: Form gönderildiğinde veriyi Firebase'e yaz
urunEkleForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    
    const urunAdiInput = document.getElementById('urun-adi');
    const urunBirimiInput = document.getElementById('urun-birimi');
    const urunMiktariInput = document.getElementById('urun-miktari');

    db.collection('sayim-urunleri').add({
        ad: urunAdiInput.value,
        birim: urunBirimiInput.value,
        miktar: Number(urunMiktariInput.value),
        sayan: sayimYapanKisi,
        zaman: firebase.firestore.FieldValue.serverTimestamp() // Ekleme zamanını otomatik ekle
    }).then(() => {
        console.log("Veri başarıyla eklendi!");
        urunEkleForm.reset(); // Formu sadece başarılı olursa temizle
        urunAdiInput.focus(); // Yeni ürün girişi için imleci geri getir
    }).catch((error) => {
        console.error("Veri eklenirken hata oluştu: ", error);
        alert("Bir hata oluştu, veri eklenemedi. İnternet bağlantınızı kontrol edin.");
    });
});

// Adım 5: Firebase'deki verileri ANLIK OLARAK dinle ve tabloya yaz
db.collection('sayim-urunleri').orderBy('zaman', 'desc') // En son eklenen en üstte görünsün
  .onSnapshot(snapshot => {
      urunTablosuBody.innerHTML = ''; // Her güncellemede tabloyu temizle
      snapshot.forEach(doc => {
          const veri = doc.data();
          const tr = document.createElement('tr');
          const zamanStr = veri.zaman ? veri.zaman.toDate().toLocaleString('tr-TR') : 'Bekleniyor...';
          tr.innerHTML = `
              <td>${veri.ad}</td>
              <td>${veri.miktar}</td>
              <td>${veri.birim}</td>
              <td>${veri.sayan}</td>
              <td>${zamanStr}</td>
          `;
          urunTablosuBody.appendChild(tr);
      });
  }, error => {
      console.error("Veri dinlenirken hata oluştu: ", error);
      alert("Veritabanı bağlantısında bir sorun var. Sayfayı yenileyin.");
  });
