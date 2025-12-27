// ===========================================
//   متغيرات التطبيق
// ===========================================
const API_KEY = '882e741f7283dc9ba1654d4692ec30f6';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

// ===========================================
//   متغيرات الحالة
// ===========================================
let movieId = null;
let movieData = null;
let savedMovies = JSON.parse(localStorage.getItem('savedMovies')) || [];

// ===========================================
//   تهيئة التطبيق
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على ID الفيلم من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    movieId = urlParams.get('id');
    
    if (!movieId) {
        showError('لم يتم العثور على الفيلم');
        return;
    }
    
    // تهيئة الصفحة
    init();
    
    // تحميل بيانات الفيلم
    loadMovieData();
    
    // إعداد المستمعين للأحداث
    setupEventListeners();
});

// ===========================================
//   تهيئة الصفحة
// ===========================================
function init() {
    // إظهار شاشة التحميل
    showLoading();
    
    // إعداد شريط التقدم
    setupProgressBar();
    
    // إعداد زر الحفظ
    updateSaveButton();
}

// ===========================================
//   تحميل بيانات الفيلم من API
// ===========================================
async function loadMovieData() {
    try {
        // تحميل بيانات الفيلم الأساسية
        const movieUrl = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=ar`;
        const movieResponse = await fetch(movieUrl);
        movieData = await movieResponse.json();
        
        // تحميل بيانات الممثلين
        const creditsUrl = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=ar`;
        const creditsResponse = await fetch(creditsUrl);
        const creditsData = await creditsResponse.json();
        
        // تحميل الأفلام المشابهة
        const similarUrl = `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=ar&page=1`;
        const similarResponse = await fetch(similarUrl);
        const similarData = await similarResponse.json();
        
        // تحديث واجهة المستخدم
        updateUI(movieData, creditsData, similarData);
        
        // إخفاء شاشة التحميل
        hideLoading();
        
        // تشغيل الفيديو تلقائيًا
        setTimeout(playMovie, 1000);
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showError('حدث خطأ في تحميل بيانات الفيلم');
        hideLoading();
    }
}

// ===========================================
//   تحديث واجهة المستخدم
// ===========================================
function updateUI(movie, credits, similar) {
    // تحديث العنوان
    document.title = `Tomito - ${movie.title}`;
    document.getElementById('movie-title').textContent = movie.title;
    document.getElementById('movie-title-full').textContent = movie.title;
    document.getElementById('banner-title').textContent = movie.title;
    
    // تحديث البانر
    document.getElementById('banner-description').textContent = movie.overview || 'لا يوجد وصف';
    
    // تحديث الصورة
    const posterImg = document.getElementById('movie-poster');
    if (movie.poster_path) {
        posterImg.src = IMAGE_BASE_URL + movie.poster_path;
        posterImg.onerror = () => {
            posterImg.src = 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=لا+توجد+صورة';
        };
    }
    
    // تحديث معلومات الفيلم
    updateMovieMeta(movie);
    
    // تحديث القصة
    document.getElementById('overview-text').textContent = movie.overview || 'لا يوجد وصف للفيلم';
    
    // تحديث الأنواع
    updateGenres(movie.genres);
    
    // تحديث الممثلين
    updateCast(credits.cast);
    
    // تحديث الأفلام المشابهة
    updateSimilarMovies(similar.results);
}

// ===========================================
//   تحديث معلومات الفيلم
// ===========================================
function updateMovieMeta(movie) {
    const metaGrid = document.getElementById('movie-meta');
    metaGrid.innerHTML = '';
    
    const metaItems = [
        {
            icon: 'fas fa-calendar',
            label: 'سنة الإصدار',
            value: movie.release_date ? movie.release_date.split('-')[0] : 'غير معروف'
        },
        {
            icon: 'fas fa-star',
            label: 'التقييم',
            value: movie.vote_average ? movie.vote_average.toFixed(1) : 'غير معروف'
        },
        {
            icon: 'fas fa-clock',
            label: 'المدة',
            value: movie.runtime ? `${movie.runtime} دقيقة` : 'غير معروف'
        },
        {
            icon: 'fas fa-language',
            label: 'اللغة',
            value: movie.original_language === 'en' ? 'الإنجليزية' : 
                   movie.original_language === 'ar' ? 'العربية' : 'غير معروف'
        }
    ];
    
    metaItems.forEach(item => {
        const metaItem = document.createElement('div');
        metaItem.className = 'meta-item';
        metaItem.innerHTML = `
            <i class="${item.icon}"></i>
            <div class="meta-content">
                <span class="meta-label">${item.label}</span>
                <span class="meta-value">${item.value}</span>
            </div>
        `;
        metaGrid.appendChild(metaItem);
    });
}

// ===========================================
//   تحديث الأنواع
// ===========================================
function updateGenres(genres) {
    const genresList = document.getElementById('genres-list');
    genresList.innerHTML = '';
    
    genres.forEach(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = 'genre-tag';
        genreTag.textContent = genre.name;
        genresList.appendChild(genreTag);
    });
}

// ===========================================
//   تحديث الممثلين
// ===========================================
function updateCast(cast) {
    const castList = document.getElementById('cast-list');
    castList.innerHTML = '';
    
    // أخذ أول 8 ممثلين فقط
    const topCast = cast.slice(0, 8);
    
    topCast.forEach(actor => {
        const castCard = document.createElement('div');
        castCard.className = 'cast-card';
        castCard.innerHTML = `
            <img src="${actor.profile_path ? IMAGE_BASE_URL + actor.profile_path : 'https://via.placeholder.com/180x240/1a1a1a/ffffff?text=لا+توجد+صورة'}" 
                 alt="${actor.name}" 
                 class="cast-img"
                 loading="lazy">
            <div class="cast-info">
                <div class="cast-name">${actor.name}</div>
                <div class="cast-character">${actor.character || 'ممثل'}</div>
            </div>
        `;
        castList.appendChild(castCard);
    });
}

// ===========================================
//   تحديث الأفلام المشابهة
// ===========================================
function updateSimilarMovies(similarMovies) {
    const similarList = document.getElementById('similar-list');
    similarList.innerHTML = '';
    
    // أخذ أول 4 أفلام مشابهة فقط
    const topSimilar = similarMovies.slice(0, 4);
    
    topSimilar.forEach(movie => {
        const similarCard = document.createElement('div');
        similarCard.className = 'similar-card';
        similarCard.addEventListener('click', () => {
            window.location.href = `watch.html?id=${movie.id}`;
        });
        
        similarCard.innerHTML = `
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/220x320/1a1a1a/ffffff?text=لا+توجد+صورة'}" 
                 alt="${movie.title}" 
                 class="similar-img"
                 loading="lazy">
            <div class="similar-info">
                <div class="similar-title">${movie.title}</div>
                <div class="similar-meta">
                    <span>${movie.release_date ? movie.release_date.split('-')[0] : 'غير معروف'}</span>
                    <span class="similar-rating">
                        <i class="fas fa-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                    </span>
                </div>
            </div>
        `;
        similarList.appendChild(similarCard);
    });
}

// ===========================================
//   تشغيل الفيلم
// ===========================================
function playMovie() {
    // هنا يمكنك وضع رابط الفيديو الحقيقي
    // سأستخدم رابط تجريبي للتمثيل فقط
    const videoPlayer = document.getElementById('video-player');
    const videoUrl = `https://www.example.com/video/${movieId}`;
    
    videoPlayer.src = videoUrl;
    
    // تحديث زر التشغيل
    const playBtn = document.getElementById('play-now-btn');
    playBtn.innerHTML = '<i class="fas fa-play"></i> جاري التشغيل...';
    playBtn.disabled = true;
    
    setTimeout(() => {
        playBtn.innerHTML = '<i class="fas fa-check"></i> قيد التشغيل';
        playBtn.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
    }, 2000);
}

// ===========================================
//   إدارة المفضلة
// ===========================================
function updateSaveButton() {
    const saveBtn = document.getElementById('save-movie-btn');
    const isSaved = savedMovies.some(movie => movie.id === parseInt(movieId));
    
    if (isSaved) {
        saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        saveBtn.classList.add('saved');
    } else {
        saveBtn.innerHTML = '<i class="far fa-heart"></i> حفظ';
        saveBtn.classList.remove('saved');
    }
}

function toggleSaveMovie() {
    const saveBtn = document.getElementById('save-movie-btn');
    const isSaved = savedMovies.some(movie => movie.id === parseInt(movieId));
    
    if (!movieData) return;
    
    if (isSaved) {
        // إزالة من المفضلة
        savedMovies = savedMovies.filter(movie => movie.id !== parseInt(movieId));
        saveBtn.innerHTML = '<i class="far fa-heart"></i> حفظ';
        saveBtn.classList.remove('saved');
        showNotification('تم إزالة الفيلم من المفضلة');
    } else {
        // إضافة إلى المفضلة
        savedMovies.push({
            id: parseInt(movieId),
            title: movieData.title,
            poster_path: movieData.poster_path,
            vote_average: movieData.vote_average,
            savedAt: new Date().toISOString()
        });
        saveBtn.innerHTML = '<i class="fas fa-heart"></i> محفوظ';
        saveBtn.classList.add('saved');
        showNotification('تم إضافة الفيلم إلى المفضلة');
    }
    
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
}

// ===========================================
//   إعداد شريط التقدم
// ===========================================
function setupProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        
        progressBar.style.display = 'block';
        progressBar.style.transform = `scaleX(${scrolled / 100})`;
    });
}

// ===========================================
//   إدارة شاشة التحميل
// ===========================================
function showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
}

// ===========================================
//   إعداد مستمعي الأحداث
// ===========================================
function setupEventListeners() {
    // زر التشغيل
    const playBtn = document.getElementById('play-now-btn');
    if (playBtn) {
        playBtn.addEventListener('click', playMovie);
    }
    
    // زر الحفظ
    const saveBtn = document.getElementById('save-movie-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', toggleSaveMovie);
    }
    
    // زر السيرفر
    const serverBtn = document.getElementById('server4-btn');
    if (serverBtn) {
        serverBtn.addEventListener('click', () => {
            // إذا كان السيرفر غير نشط، قم بتشغيل الفيديو
            if (!serverBtn.classList.contains('active')) {
                serverBtn.classList.add('active');
                playMovie();
            }
        });
    }
    
    // إضافة اختصارات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        // مسافة للعب/الإيقاف
        if (e.code === 'Space') {
            e.preventDefault();
            playMovie();
        }
        
        // F للحفظ
        if (e.code === 'KeyF') {
            toggleSaveMovie();
        }
        
        // B للعودة
        if (e.code === 'KeyB') {
            window.history.back();
        }
    });
}

// ===========================================
//   عرض الإشعارات
// ===========================================
function showNotification(message, type = 'info') {
    // إزالة أي إشعارات سابقة
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // إنشاء الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    // إضافة الأنماط الديناميكية
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            font-weight: 500;
            font-size: 14px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .notification.info {
            background: rgba(229, 9, 20, 0.9);
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease';
    }, 10);
    
    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ===========================================
//   عرض الأخطاء
// ===========================================
function showError(message) {
    const bannerContent = document.querySelector('.banner-content');
    bannerContent.innerHTML = `
        <h2 style="color: #e50914;">⚠️ خطأ</h2>
        <p>${message}</p>
        <div class="banner-actions">
            <button class="play-btn-sm" onclick="location.reload()">
                <i class="fas fa-redo"></i> إعادة المحاولة
            </button>
            <a href="index.html" class="save-btn-sm" style="text-decoration: none; text-align: center;">
                <i class="fas fa-home"></i> العودة للرئيسية
            </a>
        </div>
    `;
    
    showNotification(message, 'error');
}

// ===========================================
//   تصدير الدوال للاستخدام العالمي
// ===========================================
window.playMovie = playMovie;
window.toggleSaveMovie = toggleSaveMovie;