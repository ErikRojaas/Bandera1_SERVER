'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "26436d2c3b090ff0d32b9cd296f2d391",
"assets/AssetManifest.bin.json": "edb28c03a45a6e1c35778023cfccf6af",
"assets/AssetManifest.json": "30fb7fc8c4dcf8bf25a228cca12e42ca",
"assets/assets/images/background.png": "c87194989fbed237e0c495736fd16123",
"assets/assets/images/Characters/Character1/Char_Attack.png": "a5a73890badc42f6d84a84a132559310",
"assets/assets/images/Characters/Character1/Char_Carry_Idle.png": "65518a722155a3c1af6ecb1adb8a429c",
"assets/assets/images/Characters/Character1/Char_Carry_Key_Idle.png": "c6c4a7ac569cf7c6729759988cfcd19e",
"assets/assets/images/Characters/Character1/Char_Carry_Key_Walk.png": "8372dca0c92924d446c46137a137f343",
"assets/assets/images/Characters/Character1/Char_Carry_Walk.png": "4160499e10566bfc2d91b921d1bb9864",
"assets/assets/images/Characters/Character1/Char_Death.png": "38b3e52a3154f62ba820c4062e39c220",
"assets/assets/images/Characters/Character1/Char_Idle.png": "8b022c8d12903d16d0c838753e7f2697",
"assets/assets/images/Characters/Character1/Char_Walk.png": "6d46a018ff5f1268c404df9518f17490",
"assets/assets/images/Characters/Character2/Char_Attack.png": "8d9169c307576f07d4b7d6d270fbd97f",
"assets/assets/images/Characters/Character2/Char_Carry_Idle.png": "564cea07f91edf08de23c74c77a6b5d6",
"assets/assets/images/Characters/Character2/Char_Carry_Key_Idle.png": "47c1130989e172d025e060108da76813",
"assets/assets/images/Characters/Character2/Char_Carry_Key_Walk.png": "5251337ba19551a4e4d6a2e3370a9166",
"assets/assets/images/Characters/Character2/Char_Carry_Walk.png": "3ff7137a9c625edd51cb2d135350dd2d",
"assets/assets/images/Characters/Character2/Char_Death.png": "e490baab9f13dae67458d76dfddf8ae0",
"assets/assets/images/Characters/Character2/Char_Idle.png": "572c3db7d99666db462df418e9258101",
"assets/assets/images/Characters/Character2/Char_Walk.png": "eb53a8f333ebea67eac27b6c9012dc61",
"assets/assets/images/Characters/Character3/Char_Attack.png": "63f4c342e93a2a29125ee5a29c9d1b09",
"assets/assets/images/Characters/Character3/Char_Carry_Idle.png": "d29c526b6e33a8c44e295f6a2a2b4af9",
"assets/assets/images/Characters/Character3/Char_Carry_Key_Idle.png": "339bd9a6ba44d89cc42e898d9d3c1ca4",
"assets/assets/images/Characters/Character3/Char_Carry_Key_Walk.png": "2ef649366fdacf9e189ecf7f67fcb866",
"assets/assets/images/Characters/Character3/Char_Carry_Walk.png": "765caf4bdcb0041dc3cbc151fdb55ec4",
"assets/assets/images/Characters/Character3/Char_Death.png": "b9e60c260fbf368ed6fab37940be92d7",
"assets/assets/images/Characters/Character3/Char_Idle.png": "129723d7ffd72a841d23e37f603e53e3",
"assets/assets/images/Characters/Character3/Char_Walk.png": "b7b9b375437497cc80c331edc8c3bb91",
"assets/assets/images/Characters/Character4/Char_Attack.png": "0e3e60f44f33352e2fdbc16fd5177692",
"assets/assets/images/Characters/Character4/Char_Carry_Idle.png": "3b2d4491d67b26c02f87fe3cf0920ab7",
"assets/assets/images/Characters/Character4/Char_Carry_Key_Idle.png": "439c7bf92274516e411b1ed40e6cb418",
"assets/assets/images/Characters/Character4/Char_Carry_Key_Walk.png": "47e85e399ffb9340a51607de97b6df39",
"assets/assets/images/Characters/Character4/Char_Carry_Walk.png": "a8509095e253f73070b6949863b89fa6",
"assets/assets/images/Characters/Character4/Char_Death.png": "b9e60c260fbf368ed6fab37940be92d7",
"assets/assets/images/Characters/Character4/Char_Idle.png": "b08184e02369fa4f99bb35bffdce5582",
"assets/assets/images/Characters/Character4/Char_Walk.png": "6662190f6d43174ac643105bbf9f4356",
"assets/assets/images/flag.png": "2a287a3d8761b85ece8846672c6868ca",
"assets/assets/images/key.png": "1e5fbdf69bf18b6c39024334a0b8bfc6",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "c0ad29d56cfe3890223c02da3c6e0448",
"assets/NOTICES": "688d0b0685fa1ad554fb9ea2d9d14e6b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "6cfe36b4647fbfa15683e09e7dd366bc",
"canvaskit/canvaskit.js.symbols": "68eb703b9a609baef8ee0e413b442f33",
"canvaskit/canvaskit.wasm": "efeeba7dcc952dae57870d4df3111fad",
"canvaskit/chromium/canvaskit.js": "ba4a8ae1a65ff3ad81c6818fd47e348b",
"canvaskit/chromium/canvaskit.js.symbols": "5a23598a2a8efd18ec3b60de5d28af8f",
"canvaskit/chromium/canvaskit.wasm": "64a386c87532ae52ae041d18a32a3635",
"canvaskit/skwasm.js": "f2ad9363618c5f62e813740099a80e63",
"canvaskit/skwasm.js.symbols": "80806576fa1056b43dd6d0b445b4b6f7",
"canvaskit/skwasm.wasm": "f0dfd99007f989368db17c9abeed5a49",
"canvaskit/skwasm_st.js": "d1326ceef381ad382ab492ba5d96f04d",
"canvaskit/skwasm_st.js.symbols": "c7e7aac7cd8b612defd62b43e3050bdd",
"canvaskit/skwasm_st.wasm": "56c3973560dfcbf28ce47cebe40f3206",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "76f08d47ff9f5715220992f993002504",
"flutter_bootstrap.js": "7f55114f18e1df2c92f11035384a4a46",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "7a8b258427765ef45f54c2d95e6912f5",
"/": "7a8b258427765ef45f54c2d95e6912f5",
"main.dart.js": "b13d325a5afc55b4b3e465b1c6cebb2f",
"manifest.json": "7c53e0d4ffe25ea15b9955d76761de3c",
"version.json": "e2fa1c84910b453286f28f4755b71b54"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
