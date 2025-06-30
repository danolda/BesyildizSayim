// Adım 1: Firebase Yapılandırma Bilgilerinizi Buraya Yapıştırın
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "proje-adi.firebaseapp.com",
  projectId: "proje-adi",
  storageBucket: "proje-adi.appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};

// Adım 2: Firebase'i Başlat
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
    
    const urunAdi = document.getElementById('urun-adi').value;
    const urunBirimi = document.getElementById('urun-birimi').value;
    const urunMiktari = document.getElementById('urun-miktari').value;

    db.collection('sayim-urunleri').add({
        ad: urunAdi,
        birim: urunBirimi,
        miktar: Number(urunMiktari),
        sayan: sayimYapanKisi,
        zaman: firebase.firestore.FieldValue.serverTimestamp() // Ekleme zamanını otomatik ekle
    });
    
    urunEkleForm.reset(); // Formu temizle
});

// Adım 5: Firebase'deki verileri ANLIK OLARAK dinle ve tabloya yaz
db.collection('sayim-urunleri').orderBy('zaman', 'desc') // En son eklenen en üstte görünsün
  .onSnapshot(snapshot => {
      urunTablosuBody.innerHTML = ''; // Her güncellemede tabloyu temizle
      snapshot.forEach(doc => {
          const veri = doc.data();
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td>${veri.ad}</td>
              <td>${veri.miktar}</td>
              <td>${veri.birim}</td>
              <td>${veri.sayan}</td>
              <td>${veri.zaman ? veri.zaman.toDate().toLocaleTimeString('tr-TR') : ''}</td>
          `;
          urunTablosuBody.appendChild(tr);
      });
  });
