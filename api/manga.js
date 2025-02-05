const cache = new Map();
const imageCache = new Map();
const MAX_CACHE_SIZE = 100;

const apiEndpoint = 'https://dokusha-extenstions.onrender.com';
const backupapiEndpoint = 'https://dokusha-extenstions.vercel.app';

// API Base URL
const API_BASE_URL = apiEndpoint + '/extensions';

// Common headers for ComicK API
const comickHeaders = {
  'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
  'Referer': 'https://comick.io/',
  'sec-ch-ua-mobile': '?0',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'sec-ch-ua-platform': '"Windows"'
};

// Common headers for external API
const externalHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
};

export async function fetchData(extension, page) {
  if (extension === 'comick') {
    return fetchComickData(page);
  }

  const cacheKey = `${extension}_${page}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const apiUrl = `${API_BASE_URL}/${extension}/homepage`;

  try {
    const response = await fetch(apiUrl, { headers: externalHeaders });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const formattedData = data.map(item => ({
      id: item.hid,
      hid: item.hid,
      title: item.title,
      image: item.image,
      slug: item.slug,
    }));

    cache.set(cacheKey, formattedData);
    if (cache.size > MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function fetchComickData(page) {
  const apiUrl = `https://api.comick.io/chapter?lang=en&accept_erotic_content=true&page=${page}&device-memory=4&order=hot`;
  
  try {
    const response = await fetch(apiUrl, { headers: comickHeaders });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return data.map(item => ({
      id: item.md_comics.id,
      hid: item.md_comics.hid,
      title: item.md_comics.title,
      image: `https://meo2.comick.pictures/${item.md_comics.md_covers[0].b2key}`,
      slug: item.md_comics.slug,
    }));
  } catch (error) {
    console.error('Error fetching ComicK data:', error);
    throw error;
  }
}

export async function searchManga(query, extension = 'comick') {
  if (extension === 'comick') {
    return searchComickManga(query);
  }

  const apiUrl = `${API_BASE_URL}/${extension}/search?title=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(apiUrl, { headers: externalHeaders });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return data.map(item => ({
      id: item.hid,
      hid: item.hid,
      title: item.title,
      image: item.image,
      slug: item.slug,
      altTitles: item.altTitles || []
    }));
  } catch (error) {
    console.error('Error searching manga:', error);
    return [];
  }
}

// Separate ComicK search function
async function searchComickManga(query) {
  const apiUrl = `https://api.comick.io/v1.0/search?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(apiUrl, { headers: comickHeaders });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return data
      .filter(item => item && item.md_covers && item.md_covers[0] && item.md_covers[0].b2key)
      .map(item => ({
        id: item.id || '',
        hid: item.hid || '',
        title: item.title || 'Unknown Title',
        image: item.md_covers[0].b2key ? 
          `https://meo2.comick.pictures/${item.md_covers[0].b2key}` : 
          'https://placeholder.com/150x200',
        slug: item.slug || '',
        altTitles: (item.md_titles || [])
          .filter(t => t && t.title)
          .map(t => t.title)
      }));
  } catch (error) {
    console.error('Error searching ComicK manga:', error);
    return [];
  }
}

export async function fetchInfo(extension, hid) {
  if (extension === 'comick') {
    return fetchComickInfo(hid);
  }

  const apiUrl = `${API_BASE_URL}/${extension}/info?hid=${encodeURIComponent(hid)}`;

  try {
    const response = await fetch(apiUrl, { headers: externalHeaders });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const formattedChapters = data.map(chapter => ({
      id: chapter.id || chapter.hid,
      hid: chapter.hid,
      title: chapter.title || '',
      chap: chapter.chap,
    }));

    formattedChapters.sort((a, b) => {
      const aNum = parseFloat(a.chap.replace(/[^0-9.]/g, ''));
      const bNum = parseFloat(b.chap.replace(/[^0-9.]/g, ''));
      return bNum - aNum;
    });

    return formattedChapters;
  } catch (error) {
    console.error('Error fetching manga info:', error);
    throw error;
  }
}

async function fetchComickInfo(hid) {
  let page = 1;
  let result = [];
  let apiUrl = `https://api.comick.io/comic/${hid}/chapters?lang=en&page=${page}`;

  const fetchData = async () => {
    while (true) {
      console.log(apiUrl);

      try {
        const response = await fetch(apiUrl, { headers: comickHeaders });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (!Array.isArray(data.chapters)) {
          throw new Error("Data is not an array");
        }

        if (data.chapters.length === 0) {
          return result; // Return accumulated result if no more data available
        }

        const formattedData = data.chapters.map(item => ({
          id: item.id,
          hid: item.hid,
          title: item.title,
          chap: item.chap,
        }));

        result.push(...formattedData);

        page++;
        apiUrl = `https://api.comick.io/comic/${hid}/chapters?lang=en&page=${page}`;
      } catch (error) {
        console.error('Error fetching data:', error);
        return result; // Returning accumulated result in case of an error
      }
    }
  };

  return fetchData();
}

export async function fetchImages(extension, hid) {
  if (extension === 'comick') {
    return fetchComickImages(hid);
  }

  const apiUrl = `${API_BASE_URL}/${extension}/images?hid=${encodeURIComponent(hid)}`;

  try {
    const response = await fetch(apiUrl, { headers: externalHeaders });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return {
      images: data.images || [],
      prev: data.prev || [],
      next: data.next || []
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

async function fetchComickImages(hid) {
  const apiUrl = `https://api.comick.io/chapter/${hid}/?tachiyomi=true`;
  
  try {
    const response = await fetch(apiUrl, { headers: comickHeaders });
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    return {
      images: data.chapter.images.map(img => img.url),
      prev: data.prev || [],
      next: data.next || []
    };
  } catch (error) {
    console.error('Error fetching ComicK images:', error);
    throw error;
  }
}

export const preloadImage = async (url) => {
  if (!imageCache.has(url)) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      imageCache.set(url, blob);
      
      if (imageCache.size > MAX_CACHE_SIZE) {
        const firstKey = imageCache.keys().next().value;
        imageCache.delete(firstKey);
      }
    } catch (error) {
      console.error('Error preloading image:', error);
    }
  }
}; 