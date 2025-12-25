// // مشغل فيديو مع حجب إعلانات متقدم
// class VideoPlayer {
//     constructor() {
//         this.apiKey = "882e741f7283dc9ba1654d4692ec30f6";
//         this.baseURL = "https://api.themoviedb.org/3";
//         this.baseImg = "https://image.tmdb.org/t/p/original";
//         this.currentMovieId = null;
        
//         // خوادم الفيديو
//         this.servers = [
//             { id: 'vidstream', name: 'VidStream', url: 'https://vidstream.pro/embed/tmdb' },
//             { id: 'vidcloud', name: 'VidCloud', url: 'https://vidcloud.pro/embed/tmdb' },
//             { id: 'streamtape', name: 'StreamTape', url: 'https://streamtape.com/e/' }
//         ];
        
//         this.init();
//     }
    
//     async init() {
//         // استخراج معرف الفيلم من URL
//         const params = new URLSearchParams(window.location.search);
//         this.currentMovieId = params.get('id');
        
//         if (!this.currentMovieId) {
//             this.showError('معرف الفيلم غير موجود');
//             return;
//         }
        
//         await this.loadMovieData();
//         this.setupControls();
//         this.setupAdBlocker();
//     }
    
//     async loadMovieData() {
//         try {
//             this.showLoading(true);
            
//             // جلب بيانات الفيلم
//             const [movie, credits, similar] = await Promise.all([
//                 this.fetchData(`/movie/${this.currentMovieId}?language=ar`),
//                 this.fetchData(`/movie/${this.currentMovieId}/credits?language=ar`),
//                 this.fetchData(`/movie/${this.currentMovieId}/similar?language=ar&page=1`)
//             ]);
            
//             this.updateUI(movie, credits, similar);
            
//         } catch (error) {
//             console.error('خطأ في تحميل البيانات:', error);
//             this.showError('فشل تحميل بيانات الفيلم');
//         } finally {
//             this.showLoading(false);
//         }
//     }
    
//     async fetchData(endpoint) {
//         const response = await fetch(`${this.baseURL}${endpoint}&api_key=${this.apiKey}`);
//         if (!response.ok) throw new Error(`HTTP ${response.status}`);
//         return response.json();
//     }
    
//     updateUI(movie, credits, similar) {
//         // تحديث العنوان
//         document.title = `${movie.title} - Tomito`;
//         document.getElementById('movie-title').textContent = movie.title;
//         document.getElementById('movie-title-full').textContent = movie.title;
        
//         // تحديث الملصق
//         const poster = document.getElementById('movie-poster');
//         poster.src = movie.poster_path 
//             ? `${this.baseImg}/w500${movie.poster_path}`
//             : 'https://via.placeholder.com/300x450/1a1a1a/fff?text=No+Image';
        
//         // تحديث الميتاداتا
//         this.updateMetaData(movie);
        
//         // تحديث القصة
//         document.getElementById('overview-text').textContent = movie.overview || 'لا يوجد وصف.';
        
//         // تحديث الأنواع
//         this.updateGenres(movie.genres || []);
        
//         // تحديث الممثلين
//         this.updateCast(credits.cast || []);
        
//         // تحديث الأفلام المشابهة
//         this.updateSimilar(similar.results || []);
        
//         // تحديث خيارات الخادم
//         this.updateServerSelect();
//     }
    
//     updateMetaData(movie) {
//         const metaGrid = document.getElementById('movie-meta');
//         const metaData = [
//             { icon: 'calendar', label: 'السنة', value: movie.release_date?.split('-')[0] || '--' },
//             { icon: 'clock', label: 'المدة', value: movie.runtime ? `${movie.runtime} دقيقة` : '--' },
//             { icon: 'star', label: 'التقييم', value: movie.vote_average?.toFixed(1) || '--' },
//             { icon: 'users', label: 'الأصوات', value: movie.vote_count?.toLocaleString('ar') || '--' }
//         ];
        
//         metaGrid.innerHTML = metaData.map(item => `
//             <div class="meta-item">
//                 <i class="fas fa-${item.icon}"></i>
//                 <div>
//                     <div style="font-size: 12px; color: #999;">${item.label}</div>
//                     <div>${item.value}</div>
//                 </div>
//             </div>
//         `).join('');
//     }
    
//     updateGenres(genres) {
//         const container = document.getElementById('genres-list');
//         container.innerHTML = genres.map(genre => 
//             `<span class="genre-tag">${genre.name}</span>`
//         ).join('');
//     }
    
//     updateCast(cast) {
//         const container = document.getElementById('cast-list');
//         const actors = cast.slice(0, 6);
        
//         container.innerHTML = actors.map(actor => `
//             <div class="cast-card">
//                 <img src="${actor.profile_path 
//                     ? `${this.baseImg}/w200${actor.profile_path}`
//                     : 'https://via.placeholder.com/150x200/333/fff?text=?'}" 
//                      class="cast-img" 
//                      alt="${actor.name}">
//                 <div class="cast-info">
//                     <div style="font-weight: bold;">${actor.name}</div>
//                     <div style="color: #999; font-size: 14px;">${actor.character || 'غير معروف'}</div>
//                 </div>
//             </div>
//         `).join('');
//     }
    
//     updateSimilar(movies) {
//         const container = document.getElementById('similar-list');
//         const similarMovies = movies.slice(0, 4);
        
//         container.innerHTML = similarMovies.map(movie => `
//             <div class="similar-card" data-id="${movie.id}">
//                 <img src="${movie.poster_path 
//                     ? `${this.baseImg}/w300${movie.poster_path}`
//                     : 'https://via.placeholder.com/200x300/1a1a1a/fff?text=No+Image'}" 
//                      class="similar-img" 
//                      alt="${movie.title}">
//                 <div class="similar-info">
//                     <div style="font-weight: bold; margin-bottom: 5px;">${movie.title}</div>
//                     <div style="color: #999; font-size: 14px;">
//                         ${movie.release_date?.split('-')[0] || '--'} • ⭐ ${movie.vote_average?.toFixed(1) || '--'}
//                     </div>
//                 </div>
//             </div>
//         `).join('');
        
//         // إضافة مستمعي الأحداث
//         container.querySelectorAll('.similar-card').forEach(card => {
//             card.addEventListener('click', () => {
//                 const movieId = card.getAttribute('data-id');
//                 window.location.href = `watch.html?id=${movieId}`;
//             });
//         });
//     }
    
//     updateServerSelect() {
//         const select = document.getElementById('server-select');
//         select.innerHTML = '<option value="">اختر الخادم</option>' +
//             this.servers.map(server => 
//                 `<option value="${server.id}">${server.name}</option>`
//             ).join('');
//     }
    
//     setupControls() {
//         const playBtn = document.getElementById('play-btn');
//         const serverSelect = document.getElementById('server-select');
        
//         playBtn.addEventListener('click', () => {
//             const serverId = serverSelect.value;
//             if (!serverId) {
//                 this.showNotification('الرجاء اختيار خادم', 'error');
//                 return;
//             }
            
//             this.playVideo(serverId);
//         });
//     }
    
//     playVideo(serverId) {
//         const server = this.servers.find(s => s.id === serverId);
//         if (!server) return;
        
//         const videoPlayer = document.getElementById('video-player');
//         const videoURL = `${server.url}${this.currentMovieId}/`;
        
//         // إضافة معلمات لمنع الإعلانات
//         const cleanURL = videoURL + '?autoplay=1&mute=0&controls=1';
        
//         videoPlayer.src = cleanURL;
//         this.showNotification('جاري تحميل الفيديو...', 'info');
        
//         videoPlayer.onload = () => {
//             this.showNotification('الفيديو جاهز', 'success');
//         };
        
//         videoPlayer.onerror = () => {
//             this.showNotification('فشل تحميل الفيديو، جرب خادماً آخر', 'error');
//         };
//     }
    
//     setupAdBlocker() {
//         // حجب الإعلانات الديناميكية
//         this.blockDynamicAds();
        
//         // حجب الإعلانات في iframe
//         this.blockIframeAds();
        
//         // منع النوافذ المنبثقة
//         this.blockPopups();
//     }
    
//     blockDynamicAds() {
//         const observer = new MutationObserver(mutations => {
//             mutations.forEach(mutation => {
//                 mutation.addedNodes.forEach(node => {
//                     if (node.nodeType === 1) {
//                         this.checkAndBlockAd(node);
//                     }
//                 });
//             });
//         });
        
//         observer.observe(document.body, {
//             childList: true,
//             subtree: true
//         });
//     }
    
//     checkAndBlockAd(element) {
//         const adKeywords = ['ad', 'ads', 'advert', 'banner', 'sponsor', 'popup'];
//         const text = (element.className + ' ' + element.id).toLowerCase();
        
//         if (adKeywords.some(keyword => text.includes(keyword))) {
//             element.style.display = 'none';
//             element.remove();
//             console.log('🚫 حظر إعلان ديناميكي');
//         }
        
//         // التحقق من العناصر الفرعية
//         if (element.querySelectorAll) {
//             element.querySelectorAll('div, iframe, img').forEach(child => {
//                 const childText = (child.className + ' ' + child.id).toLowerCase();
//                 if (adKeywords.some(keyword => childText.includes(keyword))) {
//                     child.style.display = 'none';
//                     child.remove();
//                 }
//             });
//         }
//     }
    
//     blockIframeAds() {
//         document.querySelectorAll('iframe').forEach(iframe => {
//             try {
//                 const src = iframe.src.toLowerCase();
//                 if (src.includes('ad') || src.includes('banner') || src.includes('ads')) {
//                     iframe.remove();
//                     console.log('🚫 حظر iframe إعلان');
//                 }
//             } catch (e) {
//                 // تجاهل أخطاء CORS
//             }
//         });
//     }
    
//     blockPopups() {
//         const originalOpen = window.open;
//         window.open = function(url, target, features) {
//             if (url && (url.includes('ad') || url.includes('ads') || url.includes('popup'))) {
//                 console.log('🚫 حظر نافذة منبثقة:', url);
//                 return null;
//             }
//             return originalOpen.call(this, url, target, features);
//         };
//     }
    
//     showLoading(show) {
//         const progressBar = document.getElementById('progress-bar');
//         if (show) {
//             progressBar.style.transform = 'scaleX(0)';
//             progressBar.style.display = 'block';
//         } else {
//             progressBar.style.transform = 'scaleX(1)';
//             setTimeout(() => {
//                 progressBar.style.display = 'none';
//             }, 300);
//         }
//     }
    
//     showError(message) {
//         this.showNotification(message, 'error');
//     }
    
//     showNotification(message, type = 'info') {
//         const colors = {
//             success: '#2ecc71',
//             error: '#e74c3c',
//             info: '#3498db'
//         };
        
//         const notification = document.createElement('div');
//         notification.textContent = message;
//         notification.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             background: ${colors[type] || colors.info};
//             color: white;
//             padding: 12px 20px;
//             border-radius: 5px;
//             z-index: 10000;
//             box-shadow: 0 2px 10px rgba(0,0,0,0.3);
//         `;
        
//         document.body.appendChild(notification);
//         setTimeout(() => notification.remove(), 3000);
//     }
// }

// // بدء التشغيل عند تحميل الصفحة
// document.addEventListener('DOMContentLoaded', () => {
//     window.player = new VideoPlayer();
// });