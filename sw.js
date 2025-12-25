// // Service Worker لحجب الإعلانات في مستوى الشبكة
// const AD_BLOCK_LIST = new Set([
//     // نطاقات الإعلانات العالمية
//     'doubleclick.net',
//     'googleads',
//     'googlesyndication',
//     'adsystem',
//     'adservice',
//     'adnxs',
//     'rubiconproject',
//     'pubmatic',
//     'openx.net',
//     'criteo.net',
//     'taboola',
//     'outbrain',
//     'revcontent',
//     'zemanta',
//     'mgid.com',
    
//     // نطاقات فيديو الإعلانات
//     'vast.',
//     'vmap.',
//     'vpaid.',
//     'adserver',
//     'ads.',
//     'adv.',
//     'advert',
    
//     // نطاقات التتبع
//     'analytics',
//     'tracking',
//     'pixel',
//     'beacon',
//     'tagmanager',
    
//     // إعلانات وسائل التواصل
//     'facebook.com/ads',
//     'twitter.com/ads',
//     'tiktok.com/ads',
//     'snapchat.com/ads',
//     'instagram.com/ads',
    
//     // إعلانات الفيديو
//     'jwplayer.com/ads',
//     'video.unrulymedia.com',
//     'ads.vungle.com',
//     'adcolony.com',
//     'unityads.unity3d.com'
// ]);

// // التحقق إذا كان الرابط إعلان
// function isAdURL(url) {
//     const urlStr = url.toLowerCase();
//     for (const domain of AD_BLOCK_LIST) {
//         if (urlStr.includes(domain)) {
//             return true;
//         }
//     }
    
//     // التحقق من الأنماط
//     const adPatterns = [
//         /\/ads?\//i,
//         /\/advertising\//i,
//         /\/banner\//i,
//         /\/sponsor/i,
//         /_ad\./i,
//         /\.ad\./i,
//         /\/track\//i,
//         /\/pixel\//i
//     ];
    
//     return adPatterns.some(pattern => pattern.test(url));
// }

// // اعتراض طلبات الشبكة
// self.addEventListener('fetch', event => {
//     const url = event.request.url;
    
//     // تجاهل طلبات التطبيقات المحلية
//     if (url.startsWith(self.location.origin)) {
//         return;
//     }
    
//     // حظر طلبات الإعلانات
//     if (isAdURL(url)) {
//         console.log(`🚫 حظر إعلان: ${url}`);
        
//         // إرجاع رد وهمي
//         event.respondWith(
//             new Response('', {
//                 status: 204,
//                 statusText: 'No Content',
//                 headers: new Headers({
//                     'Content-Type': 'text/plain'
//                 })
//             })
//         );
//         return;
//     }
    
//     // استبدال روابط الإعلانات في HTML
//     if (event.request.headers.get('Accept')?.includes('text/html')) {
//         event.respondWith(
//             fetch(event.request)
//                 .then(response => {
//                     if (!response.ok) return response;
                    
//                     const contentType = response.headers.get('Content-Type');
//                     if (!contentType?.includes('text/html')) return response;
                    
//                     return response.text().then(html => {
//                         // إزالة سكريبتات الإعلانات
//                         let cleanedHTML = html
//                             .replace(/<script[^>]*ads?[^>]*>[\s\S]*?<\/script>/gi, '')
//                             .replace(/<iframe[^>]*ads?[^>]*>[\s\S]*?<\/iframe>/gi, '')
//                             .replace(/<div[^>]*class=["'][^"']*ad[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
//                             .replace(/<ins[^>]*>[\s\S]*?<\/ins>/gi, '');
                        
//                         return new Response(cleanedHTML, {
//                             status: response.status,
//                             statusText: response.statusText,
//                             headers: response.headers
//                         });
//                     });
//                 })
//         );
//     }
// });

// // عند التثبيت
// self.addEventListener('install', event => {
//     console.log('✅ Service Worker مثبت - جاهز لحجب الإعلانات');
//     self.skipWaiting();
// });

// // عند التنشيط
// self.addEventListener('activate', event => {
//     console.log('✅ Service Worker مفعل - يحجب الإعلانات الآن');
//     event.waitUntil(clients.claim());
// });