// NİHAİ SCRIPT.JS KODU (ALFABETİK SIRALAMALI)

const firebaseConfig = {
    apiKey: "AIzaSyCy2-UOqSLgt6HJYIHCY49cP9zLGcWFePs",
    authDomain: "besyildizsayim.firebaseapp.com",
    projectId: "besyildizsayim",
    storageBucket: "besyildizsayim.appspot.com",
    messagingSenderId: "917664754525",
    appId: "1:917664754525:web:9fc8bb5ec68457d3cdd6b4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('Service Worker registered!'))
            .catch(err => console.log('Service Worker registration failed: ', err));
    });
}

const girisKutusu = document.getElementById('kullanici-giris-kutusu');
const sayimAlani = document.getElementById('sayim-alani');
const sayimaBaslaBtn = document.getElementById('sayima-basla-btn');
const sayimYapanInput = document.getElementById('sayim-yapan-input');
const aktifKullaniciAdi = document.getElementById('aktif-kullanici-adi');
const urunEkleForm = document.getElementById('urun-ekle-form');
const urunTablosuBody = document.querySelector("#urun-tablosu tbody");
const resetButton = document.getElementById('reset-data-btn');

let sayimYapanKisi = '';

sayimaBaslaBtn.addEventListener('click', () => {
    sayimYapanKisi = sayimYapanInput.value.trim();
    if (sayimYapanKisi === '') {
        alert('Lütfen adınızı giriniz!');
        return;
    }
    girisKutusu.classList.add('gizli');
    sayimAlani.classList.remove('gizli');
    aktifKullaniciAdi.textContent = sayimYapanKisi;
});

urunEkleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const urunAdiInput = document.getElementById('urun-adi');
    const urunBirimiInput = document.getElementById('urun-birimi');
    const urunMiktariInput = document.getElementById('urun-miktari');

    db.collection('sayim-urunleri').add({
        ad: urunAdiInput.value,
        birim: urunBirimiInput.value,
        miktar: Number(urunMiktariInput.value),
        sayan: sayimYapanKisi,
        zaman: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        urunEkleForm.reset();
        urunAdiInput.focus();
    }).catch((error) => {
        console.error("Hata: ", error);
        alert("Veri eklenemedi.");
    });
});

// Veritabanını dinle ve Türkçe Alfabetik Kurallara göre sıralayarak tabloyu oluştur
db.collection('sayim-urunleri')
  .onSnapshot(snapshot => {
      const urunler = [];
      snapshot.forEach(doc => {
          urunler.push(doc.data());
      });

      urunler.sort((a, b) => {
          return a.ad.toLocaleLowerCase('tr').localeCompare(b.ad.toLocaleLowerCase('tr'), 'tr');
      });

      urunTablosuBody.innerHTML = '';
      
      urunler.forEach(veri => {
          const tr = document.createElement('tr');
          const zamanStr = veri.zaman ? veri.zaman.toDate().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '...';
          
          tr.innerHTML = `
              <td data-label="Ürün">${veri.ad}</td>
              <td data-label="Miktar">${veri.miktar} ${veri.birim}</td>
              <td data-label="Sayan">${veri.sayan}</td>
              <td data-label="Zaman">${zamanStr}</td>
          `;
          urunTablosuBody.appendChild(tr);
      });

  }, error => {
      console.error("Veri dinleme hatası: ", error);
  });

resetButton.addEventListener('click', () => {
    const dogruSifre = 'Besyildiz5'; 
    const girilenSifre = prompt("TÜM verileri silmek için lütfen yönetici şifresini girin:");

    if (girilenSifre === null) {
        alert('İşlem iptal edildi.');
        return;
    }

    if (girilenSifre === dogruSifre) {
        const sonOnay = confirm("Şifre doğru. TÜM veriler kalıcı olarak silinecektir. Emin misiniz?");
        if (sonOnay) {
            alert('Veriler siliniyor...');
            const collectionRef = db.collection('sayim-urunleri');
            
            collectionRef.get().then(snapshot => {
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                return batch.commit();
            }).then(() => {
                alert('Tüm veriler başarıyla silindi.');
            }).catch(error => {
                console.error('Silme işlemi sırasında hata: ', error);
                alert('Bir hata oluştu. Lütfen Firestore güvenlik kurallarınızı kontrol edin.');
            });
        } else {
             alert('Son onay verilmediği için işlem iptal edildi.');
        }
    } else {
        alert('Yanlış şifre! İşlem iptal edildi.');
    }
});
